/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var stream = require('stream');
var phantomPath = require('phantomjs-prebuilt').path;
var driver = require('../lib/node-phantom-simple/node-phantom-simple');
const babelStandalone = require('@babel/standalone');
var csvparse = require('csv-parse/lib/sync');
let logger = require('winston');
let crypto;
try {
  crypto = require('crypto');
} catch (err) {
  throw new Error('jsreports server module requires Node.js crypto support, but crypto support is disabled in this version of Node.js');
}

/** Need to include base and reportbuilder utilities here to run in Node context */
var ditto = require('./ditto-base');
require('./reportbuilder')(ditto);

const productName = PRODUCT_NAME || 'ditto';

var clientJS = require(`raw!uglify!../build/${productName}-all-bundle.js`);
var babelPolyfillJS = require('raw!../node_modules/babel-polyfill/dist/polyfill.min.js');
var fonts = {
  'Roboto-Bold.ttf': require('base64!./fonts/Roboto-Bold.ttf'),
  'Roboto-BoldItalic.ttf': require('base64!./fonts/Roboto-BoldItalic.ttf'),
  'Roboto-Italic.ttf': require('base64!./fonts/Roboto-Italic.ttf'),
  'Roboto-Regular.ttf': require('base64!./fonts/Roboto-Regular.ttf')
};

var maxWorkers = 3;
var availableWorkers = [];
var busyWorkers = [];
var phantomStartPort = 11000;
var maxTasksPerWorker = 50;
var lastPruneTime = 0;
var pruneIntervalMs = 10000;
var taskTimeoutMs = 60000;
var pendingTasks = [];
var startingWorkers = 0;

var phantomJsParams = {
  'web-security': 'false',
  'local-to-remote-url-access': 'true',
  'ignore-ssl-errors': 'true'
};

function unpackFile(str, filePrefix, fileExtension) {
  var file = tmp.fileSync({ prefix: filePrefix, postfix: fileExtension });
  fs.appendFileSync(file.name, str);
  return file.name;
}

var clientJSPath = unpackFile(clientJS, `${productName}-client-js-`, '.js');
var babelPolyfillJSPath = unpackFile(babelPolyfillJS, `${productName}-babel-polyfill-js-`, '.js');

var libraryPath = tmp.dirSync().name;
fs.mkdirSync(path.resolve(libraryPath, 'fonts'));
Object.keys(fonts).forEach(function(fontFilename) {
  var wstream = fs.createWriteStream(path.resolve(libraryPath, 'fonts', fontFilename));
  wstream.write(new Buffer(fonts[fontFilename], 'base64'));
  wstream.end();
});

var singleton = null;
let BASE_FILE_PATH = __dirname;

var ServerAPI = function(cfg) {
  if (singleton) throw new Error('Multiple Server instances not supported.');
  singleton = this;
  if (!cfg) cfg = {};
  this.cfg = cfg;
  if (cfg.maxWorkers) maxWorkers = cfg.maxWorkers;
  if (cfg.maxTasksPerWorker) maxTasksPerWorker = cfg.maxTasksPerWorker;
  if (cfg.libraryPath) libraryPath = cfg.libraryPath;
  if (cfg.logger) {
    logger = cfg.logger;
  } else if (cfg.logLevel) {
    logger.level = cfg.logLevel.toLowerCase();
  }
  if (cfg.phantomPath) {
    phantomPath = cfg.phantomPath;
  }
  logger.debug(`Using PhantomJS at ${phantomPath}`);
  if (cfg.baseFilePath) {
    BASE_FILE_PATH = cfg.baseFilePath;
  }
  this.status = 'running';
};

function getPhantomInstance(renderCallback) {
  if (new Date() - lastPruneTime > pruneIntervalMs) {
    pruneWorkers();
  }
  if (availableWorkers.length > 0) {
    logger.debug(`Using available worker`);
    return engageWorker(availableWorkers.pop(), renderCallback);
  }
  if (busyWorkers.length + startingWorkers < maxWorkers) {
    logger.debug(`No workers available; creating new worker`);
    return newWorker.call(this, function(err, worker) {
      // Server might have been stopped while PhantomJS was starting
      if (singleton.status !== 'running') {
        return disposeWorker(worker);
      }
      if (err) return renderCallback(err);
      return engageWorker(worker, renderCallback);
    });
  }
  // No available workers; queue the task
  logger.debug(`All workers busy; queuing task`);
  pendingTasks.unshift(renderCallback);
}

function engageWorker(worker, renderCallback) {
  logger.debug(`Engaging worker ${worker.name}...`);
  busyWorkers.push(worker);
  worker.phantom.createPage(function(err, page, phantom) {
    if (err) {
      logger.err(`Error creating page: ${err}`);
      disposeWorker(worker);
      return getPhantomInstance(renderCallback);
    }
    logger.debug(`Engaged worker ${worker.name}`);
    worker.page = page;
    renderCallback(null, worker);
  });
}

function releaseWorker(worker) {
  logger.debug(`Releasing worker ${worker.name}`);
  if (worker.page) {
    worker.page.close();
  }
  busyWorkers.splice(busyWorkers.indexOf(worker), 1);
  if (++worker.taskCount >= maxTasksPerWorker) {
    disposeWorker(worker);
  } else {
    availableWorkers.unshift(worker);
  }
  if (pendingTasks.length > 0) {
    getPhantomInstance(pendingTasks.pop());
  }
  logger.debug(`Released worker ${worker.name}`);
}

function removeItemIfExists(arr, item) {
  var ix = arr.indexOf(item);
  if (ix >= 0) {
    arr.splice(ix, 1);
  }
}

function disposeWorker(worker) {
  logger.debug(`Dispose worker ${worker.name}`);
  try {
    worker.phantom.exit();
  } catch(e) {}
  removeItemIfExists(busyWorkers, worker);
  removeItemIfExists(availableWorkers, worker);
  logger.debug(`Disposed worker ${worker.name}`);
}

function newWorker(callback) {
  logger.debug('Creating new worker...');
  startingWorkers++;   
  var worker = {
    name: crypto.randomBytes(3).toString('hex'),
    startTime: new Date(),
    taskCount: 0
  };
  driver.create({ 
    path: phantomPath,
    parameters: phantomJsParams,
    logger: logger
  }, function (err, phantom) {
    startingWorkers--;
    if (err) return callback(err);
    phantom.onError = function(msg, trace) {
      var msgStack = ['PHANTOMJS ERROR: ' + msg];
      if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
          msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
        });
      }
      logger.error(msgStack.join('\n'));
      phantom.exit(1);
    };    
    phantom.process.stderr.on('data', function(data) {
      logger.error(data);
    });
    worker.phantom = phantom;
    logger.debug(`Created worker ${worker.name}`);
    callback(null, worker);
  });
}

function pruneWorkers() {
  var now = new Date();
  for (var i = busyWorkers.length - 1; i >= 0; i--) {
    if (now - busyWorkers[i].startTime > taskTimeoutMs) {
      disposeWorker(busyWorkers[i]);
      busyWorkers.splice(i, 1);
    }
  }
}

function requireLeadingSlash(str) {
  if (str === null) return str;
  if (str.indexOf('/') === 0) return str;
  return '/' + str;
}

const makeFilePathAbsolute = (relativePath) => 
  `file://${requireLeadingSlash(path.resolve(BASE_FILE_PATH, relativePath).replace('\\', '/'))}`;

const SERIALIZED_DATASET_FUNCTIONS = ['data', 'postProcess', 'schema'];

/**
 * Renders a ditto report on the server.  Accepts the same arguments as ditto.export on the client.
 * Returns a Node stream to which the PDF or Excel output will be written.
 *
 * Required configuration parameters:
 * dittoJSPath - path to ditto JavaScript file on the server
 * dittoCSSPath - path to ditto CSS file on the server
 *
 * Optional configuration parameters:
 * otherCSSPaths - array of additional CSS file paths to load when rendering the report
 */
ServerAPI.prototype.export = function(cfg, callback) {
  if (this.status !== 'running') throw new Error('Server is stopped.');
  var me = this;
  if (cfg.datasets) {
    logger.debug(`Process datasets...`);
    cfg.datasets = cfg.datasets.map(ds => {
      const newDs = { ...ds };
      if ((newDs.format || '').toLowerCase() === "csv") {
        var records = csvparse(fs.readFileSync(path.resolve(BASE_FILE_PATH, newDs.url)), 
          {columns: true});
        if (newDs.postProcess) {
          records = newDs.postProcess(records);
          delete newDs.postProcess;
        }
        newDs.data = records;
        delete newDs.url;
        delete newDs.format;
      } else if (newDs.url) {
        /** If it's not clearly a remote URL, assume it's a local file and fix the path */
        if (!(/^(http:|https:|file:|\/\/)/ig).test(newDs.url)) {
          newDs.url = makeFilePathAbsolute(newDs.url);
        }
      }
      SERIALIZED_DATASET_FUNCTIONS.map(possibleFnKey => {
        const possibleFn = newDs[possibleFnKey];
        if (possibleFn && (typeof possibleFn === 'function')) {
          const inputCode = `(${possibleFn.toString()})`;
          const outputCode = babelStandalone.transform(inputCode, { presets: [ 'es2015' ] }).code;
          newDs[`__ditto_serialized_${possibleFnKey}`] = outputCode;
          delete newDs[possibleFnKey];
        }
      });
      return newDs;
    });
    logger.debug(`Datasets processed`);
  }

  if (typeof cfg.imageUrlPrefix === 'undefined') {
    cfg.imageUrlPrefix = 'file://' + path.resolve(BASE_FILE_PATH) + '/';
  }

  getPhantomInstance(function(err, worker) {
    if (err) return callback(err);
    var page = worker.page;
    var content = [
      '<!DOCTYPE html><html><head>',
      '<script type="text/javascript" src="file://' + requireLeadingSlash(babelPolyfillJSPath) + '"></script>',
      '<script type="text/javascript" src="file://' + requireLeadingSlash(clientJSPath) + '"></script>',
      (me.cfg.otherCSSPaths || []).map(function(cssPath) {
        return '<link rel="stylesheet" href="file://' + requireLeadingSlash(cssPath) + '" />';
      }).join(''),
      '</head><body></body></html>'
    ].join('');
    page.onError = function(err, trace) {
      logger.error(err);
      releaseWorker(worker);
      if (err && typeof err === 'object') {
        return callback(err);
      }
      if (err.stack) {
        return callback(new Error(err.stack));
      }
      if (typeof err === 'string') {
        let stack = [ err ];
        if (trace && trace.length) {
          stack = stack.concat(trace.map(t => 
            ` at  ${t.file || t.sourceURL}: ${t.line}${t.function ? (' (in function ' + t.function + ')') : ''}`
          ));
        }
        return callback(new Error(stack.join('\n')));
      }
      return callback(new Error(`Unknown error occurred.`));
    };
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
      logger.debug('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    };
    page.onResourceRequested = function(request) {
      logger.debug('Request', (request[0].url || '').substr(0, 100));
    };
    page.onResourceReceived = function(response) {
      logger.debug('Received', (response.url || '').substr(0, 100), response.stage, response.status, response.statusText);
    };
    page.onResourceError = function(err) {
      logger.debug('Resource error', err.url, err.errorCode);
    };
    page.onLoadFinished = function () {
      page.onCallback = function(b64) {
        var buf = new Buffer(b64, 'base64');
        var outStream = new stream.PassThrough();
        releaseWorker(worker);
        callback(null, outStream);
        outStream.end(buf);
      };
    page.evaluate(function(exportCfg, libPath, registeredFonts, productName, SERIALIZED_DATASET_FUNCTIONS) {
      exportCfg.outputHandler = function(blob) {
        var blobToBase64 = function(blob, cb) {
          var reader = new FileReader();
          reader.onload = function() {
            var dataUrl = reader.result;
            var base64 = dataUrl.split(',')[1];
            cb(base64);
          };
          reader.readAsDataURL(blob);
        };
        blobToBase64(blob, function(base64Str) {
          window.callPhantom(base64Str);
        });
      };
      var ditto = window[productName];
      ditto.imageUrlPrefix = exportCfg.imageUrlPrefix;
      if (libPath) {
        ditto.libraryPath = 'file://' + libPath;
      }
      registeredFonts.forEach(function(fontArgs) {
        ditto.registerFont.apply(this, fontArgs);
      });
      if (exportCfg.datasets) {
        exportCfg.datasets.map(ds => {
          SERIALIZED_DATASET_FUNCTIONS.map(possibleFnKey => {
            const serializedKey = `__ditto_serialized_${possibleFnKey}`;
            const serializedFn = ds[serializedKey];
            if (serializedFn) {
              ds[possibleFnKey] = eval(serializedFn);
              delete ds[serializedKey];
            }
          });
        });
      }
      ditto.export(exportCfg);
    },
    cfg, requireLeadingSlash(libraryPath), registeredFonts,
    productName, SERIALIZED_DATASET_FUNCTIONS,
    // Callback for page.evaluate
    function(err, result) {
      if (err) {
        releaseWorker(worker);
        return callback(err);
      }
    });
    };
    page.set('content', content);
  });
};

ServerAPI.prototype.isIdle = function() {
  return (busyWorkers.length === 0 
    && pendingTasks.length === 0);
};

ServerAPI.prototype.stop = function() {
  if (this.status !== 'running') return;
  logger.debug(`Stopping server...`);
  this.status = 'stopped';
  busyWorkers.concat(availableWorkers).forEach(function(worker) {
    disposeWorker(worker);
  });
  busyWorkers = [];
  availableWorkers = [];
  logger.debug(`Server stopped`);
};

ServerAPI.prototype.start = function() {
  this.status = 'running';
};

const registeredFonts = [];
/** 
 * Register a font face (a family, and optionally weight and style) for PDF font embedding.
 *
 * @param {string} family - The font family, e.g. Helvetica
 * @param {string} weight - The font weight, one of "normal" or "bold"
 * @param {string} style - The font style, one of "normal" or "italic"
 * @param {string} url - The file:// url of the font's .ttf file
 */
ServerAPI.prototype.registerFont = function(...args) {
  registeredFonts.push(args);
};

ServerAPI.get = function() {
  return singleton;
};

ditto.Server = ServerAPI;

module.exports = ditto;
