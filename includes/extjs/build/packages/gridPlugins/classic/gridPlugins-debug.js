/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.ASSUME_ES5 = false;
$jscomp.ASSUME_NO_NATIVE_MAP = false;
$jscomp.ASSUME_NO_NATIVE_SET = false;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties == 'function' ? Object.defineProperty : function(target, property, descriptor) {
  descriptor = descriptor;
  if (target == Array.prototype || target == Object.prototype) {
    return;
  }
  target[property] = descriptor.value;
};
$jscomp.getGlobal = function(maybeGlobal) {
  return typeof window != 'undefined' && window === maybeGlobal ? maybeGlobal : typeof global != 'undefined' && global != null ? global : maybeGlobal;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function(target, polyfill, fromLang, toLang) {
  if (!polyfill) {
    return;
  }
  var obj = $jscomp.global;
  var split = target.split('.');
  for (var i = 0; i < split.length - 1; i++) {
    var key = split[i];
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  var property = split[split.length - 1];
  var orig = obj[property];
  var impl = polyfill(orig);
  if (impl == orig || impl == null) {
    return;
  }
  $jscomp.defineProperty(obj, property, {configurable:true, writable:true, value:impl});
};
$jscomp.polyfill('Array.prototype.copyWithin', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, start, opt_end) {
    var len = this.length;
    target = Number(target);
    start = Number(start);
    opt_end = Number(opt_end != null ? opt_end : len);
    if (target < start) {
      opt_end = Math.min(opt_end, len);
      while (start < opt_end) {
        if (start in this) {
          this[target++] = this[start++];
        } else {
          delete this[target++];
          start++;
        }
      }
    } else {
      opt_end = Math.min(opt_end, len + start - target);
      target += opt_end - start;
      while (opt_end > start) {
        if (--opt_end in this) {
          this[--target] = this[opt_end];
        } else {
          delete this[target];
        }
      }
    }
    return this;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.SYMBOL_PREFIX = 'jscomp_symbol_';
$jscomp.initSymbol = function() {
  $jscomp.initSymbol = function() {
  };
  if (!$jscomp.global['Symbol']) {
    $jscomp.global['Symbol'] = $jscomp.Symbol;
  }
};
$jscomp.Symbol = function() {
  var counter = 0;
  function Symbol(opt_description) {
    return $jscomp.SYMBOL_PREFIX + (opt_description || '') + counter++;
  }
  return Symbol;
}();
$jscomp.initSymbolIterator = function() {
  $jscomp.initSymbol();
  var symbolIterator = $jscomp.global['Symbol'].iterator;
  if (!symbolIterator) {
    symbolIterator = $jscomp.global['Symbol'].iterator = $jscomp.global['Symbol']('iterator');
  }
  if (typeof Array.prototype[symbolIterator] != 'function') {
    $jscomp.defineProperty(Array.prototype, symbolIterator, {configurable:true, writable:true, value:function() {
      return $jscomp.arrayIterator(this);
    }});
  }
  $jscomp.initSymbolIterator = function() {
  };
};
$jscomp.arrayIterator = function(array) {
  var index = 0;
  return $jscomp.iteratorPrototype(function() {
    if (index < array.length) {
      return {done:false, value:array[index++]};
    } else {
      return {done:true};
    }
  });
};
$jscomp.iteratorPrototype = function(next) {
  $jscomp.initSymbolIterator();
  var iterator = {next:next};
  iterator[$jscomp.global['Symbol'].iterator] = function() {
    return this;
  };
  return iterator;
};
$jscomp.iteratorFromArray = function(array, transform) {
  $jscomp.initSymbolIterator();
  if (array instanceof String) {
    array = array + '';
  }
  var i = 0;
  var iter = {next:function() {
    if (i < array.length) {
      var index = i++;
      return {value:transform(index, array[index]), done:false};
    }
    iter.next = function() {
      return {done:true, value:void 0};
    };
    return iter.next();
  }};
  iter[Symbol.iterator] = function() {
    return iter;
  };
  return iter;
};
$jscomp.polyfill('Array.prototype.entries', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(i, v) {
      return [i, v];
    });
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.fill', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(value, opt_start, opt_end) {
    var length = this.length || 0;
    if (opt_start < 0) {
      opt_start = Math.max(0, length + opt_start);
    }
    if (opt_end == null || opt_end > length) {
      opt_end = length;
    }
    opt_end = Number(opt_end);
    if (opt_end < 0) {
      opt_end = Math.max(0, length + opt_end);
    }
    for (var i = Number(opt_start || 0); i < opt_end; i++) {
      this[i] = value;
    }
    return this;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.findInternal = function(array, callback, thisArg) {
  if (array instanceof String) {
    array = String(array);
  }
  var len = array.length;
  for (var i = 0; i < len; i++) {
    var value = array[i];
    if (callback.call(thisArg, value, i, array)) {
      return {i:i, v:value};
    }
  }
  return {i:-1, v:void 0};
};
$jscomp.polyfill('Array.prototype.find', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(callback, opt_thisArg) {
    return $jscomp.findInternal(this, callback, opt_thisArg).v;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.findIndex', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(callback, opt_thisArg) {
    return $jscomp.findInternal(this, callback, opt_thisArg).i;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.from', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(arrayLike, opt_mapFn, opt_thisArg) {
    $jscomp.initSymbolIterator();
    opt_mapFn = opt_mapFn != null ? opt_mapFn : function(x) {
      return x;
    };
    var result = [];
    var iteratorFunction = arrayLike[Symbol.iterator];
    if (typeof iteratorFunction == 'function') {
      arrayLike = iteratorFunction.call(arrayLike);
      var next;
      while (!(next = arrayLike.next()).done) {
        result.push(opt_mapFn.call(opt_thisArg, next.value));
      }
    } else {
      var len = arrayLike.length;
      for (var i = 0; i < len; i++) {
        result.push(opt_mapFn.call(opt_thisArg, arrayLike[i]));
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Object.is', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(left, right) {
    if (left === right) {
      return left !== 0 || 1 / left === 1 / right;
    } else {
      return left !== left && right !== right;
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.includes', function(orig) {
  if (orig) {
    return orig;
  }
  var includes = function(searchElement, opt_fromIndex) {
    var array = this;
    if (array instanceof String) {
      array = String(array);
    }
    var len = array.length;
    for (var i = opt_fromIndex || 0; i < len; i++) {
      if (array[i] == searchElement || Object.is(array[i], searchElement)) {
        return true;
      }
    }
    return false;
  };
  return includes;
}, 'es7', 'es3');
$jscomp.polyfill('Array.prototype.keys', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(i) {
      return i;
    });
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.of', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(var_args) {
    return Array.from(arguments);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.values', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(k, v) {
      return v;
    });
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.makeIterator = function(iterable) {
  $jscomp.initSymbolIterator();
  var iteratorFunction = iterable[Symbol.iterator];
  return iteratorFunction ? iteratorFunction.call(iterable) : $jscomp.arrayIterator(iterable);
};
$jscomp.FORCE_POLYFILL_PROMISE = false;
$jscomp.polyfill('Promise', function(NativePromise) {
  if (NativePromise && !$jscomp.FORCE_POLYFILL_PROMISE) {
    return NativePromise;
  }
  function AsyncExecutor() {
    this.batch_ = null;
  }
  AsyncExecutor.prototype.asyncExecute = function(f) {
    if (this.batch_ == null) {
      this.batch_ = [];
      this.asyncExecuteBatch_();
    }
    this.batch_.push(f);
    return this;
  };
  AsyncExecutor.prototype.asyncExecuteBatch_ = function() {
    var self = this;
    this.asyncExecuteFunction(function() {
      self.executeBatch_();
    });
  };
  var nativeSetTimeout = $jscomp.global['setTimeout'];
  AsyncExecutor.prototype.asyncExecuteFunction = function(f) {
    nativeSetTimeout(f, 0);
  };
  AsyncExecutor.prototype.executeBatch_ = function() {
    while (this.batch_ && this.batch_.length) {
      var executingBatch = this.batch_;
      this.batch_ = [];
      for (var i = 0; i < executingBatch.length; ++i) {
        var f = executingBatch[i];
        delete executingBatch[i];
        try {
          f();
        } catch (error) {
          this.asyncThrow_(error);
        }
      }
    }
    this.batch_ = null;
  };
  AsyncExecutor.prototype.asyncThrow_ = function(exception) {
    this.asyncExecuteFunction(function() {
      throw exception;
    });
  };
  var PromiseState = {PENDING:0, FULFILLED:1, REJECTED:2};
  var PolyfillPromise = function(executor) {
    this.state_ = PromiseState.PENDING;
    this.result_ = undefined;
    this.onSettledCallbacks_ = [];
    var resolveAndReject = this.createResolveAndReject_();
    try {
      executor(resolveAndReject.resolve, resolveAndReject.reject);
    } catch (e) {
      resolveAndReject.reject(e);
    }
  };
  PolyfillPromise.prototype.createResolveAndReject_ = function() {
    var thisPromise = this;
    var alreadyCalled = false;
    function firstCallWins(method) {
      return function(x) {
        if (!alreadyCalled) {
          alreadyCalled = true;
          method.call(thisPromise, x);
        }
      };
    }
    return {resolve:firstCallWins(this.resolveTo_), reject:firstCallWins(this.reject_)};
  };
  PolyfillPromise.prototype.resolveTo_ = function(value) {
    if (value === this) {
      this.reject_(new TypeError('A Promise cannot resolve to itself'));
    } else {
      if (value instanceof PolyfillPromise) {
        this.settleSameAsPromise_(value);
      } else {
        if (isObject(value)) {
          this.resolveToNonPromiseObj_(value);
        } else {
          this.fulfill_(value);
        }
      }
    }
  };
  PolyfillPromise.prototype.resolveToNonPromiseObj_ = function(obj) {
    var thenMethod = undefined;
    try {
      thenMethod = obj.then;
    } catch (error) {
      this.reject_(error);
      return;
    }
    if (typeof thenMethod == 'function') {
      this.settleSameAsThenable_(thenMethod, obj);
    } else {
      this.fulfill_(obj);
    }
  };
  function isObject(value) {
    switch(typeof value) {
      case 'object':
        return value != null;
      case 'function':
        return true;
      default:
        return false;
    }
  }
  PolyfillPromise.prototype.reject_ = function(reason) {
    this.settle_(PromiseState.REJECTED, reason);
  };
  PolyfillPromise.prototype.fulfill_ = function(value) {
    this.settle_(PromiseState.FULFILLED, value);
  };
  PolyfillPromise.prototype.settle_ = function(settledState, valueOrReason) {
    if (this.state_ != PromiseState.PENDING) {
      throw new Error('Cannot settle(' + settledState + ', ' + valueOrReason | '): Promise already settled in state' + this.state_);
    }
    this.state_ = settledState;
    this.result_ = valueOrReason;
    this.executeOnSettledCallbacks_();
  };
  PolyfillPromise.prototype.executeOnSettledCallbacks_ = function() {
    if (this.onSettledCallbacks_ != null) {
      var callbacks = this.onSettledCallbacks_;
      for (var i = 0; i < callbacks.length; ++i) {
        callbacks[i].call();
        callbacks[i] = null;
      }
      this.onSettledCallbacks_ = null;
    }
  };
  var asyncExecutor = new AsyncExecutor;
  PolyfillPromise.prototype.settleSameAsPromise_ = function(promise) {
    var methods = this.createResolveAndReject_();
    promise.callWhenSettled_(methods.resolve, methods.reject);
  };
  PolyfillPromise.prototype.settleSameAsThenable_ = function(thenMethod, thenable) {
    var methods = this.createResolveAndReject_();
    try {
      thenMethod.call(thenable, methods.resolve, methods.reject);
    } catch (error) {
      methods.reject(error);
    }
  };
  PolyfillPromise.prototype.then = function(onFulfilled, onRejected) {
    var resolveChild;
    var rejectChild;
    var childPromise = new PolyfillPromise(function(resolve, reject) {
      resolveChild = resolve;
      rejectChild = reject;
    });
    function createCallback(paramF, defaultF) {
      if (typeof paramF == 'function') {
        return function(x) {
          try {
            resolveChild(paramF(x));
          } catch (error) {
            rejectChild(error);
          }
        };
      } else {
        return defaultF;
      }
    }
    this.callWhenSettled_(createCallback(onFulfilled, resolveChild), createCallback(onRejected, rejectChild));
    return childPromise;
  };
  PolyfillPromise.prototype['catch'] = function(onRejected) {
    return this.then(undefined, onRejected);
  };
  PolyfillPromise.prototype.callWhenSettled_ = function(onFulfilled, onRejected) {
    var thisPromise = this;
    function callback() {
      switch(thisPromise.state_) {
        case PromiseState.FULFILLED:
          onFulfilled(thisPromise.result_);
          break;
        case PromiseState.REJECTED:
          onRejected(thisPromise.result_);
          break;
        default:
          throw new Error('Unexpected state: ' + thisPromise.state_);
      }
    }
    if (this.onSettledCallbacks_ == null) {
      asyncExecutor.asyncExecute(callback);
    } else {
      this.onSettledCallbacks_.push(function() {
        asyncExecutor.asyncExecute(callback);
      });
    }
  };
  function resolvingPromise(opt_value) {
    if (opt_value instanceof PolyfillPromise) {
      return opt_value;
    } else {
      return new PolyfillPromise(function(resolve, reject) {
        resolve(opt_value);
      });
    }
  }
  PolyfillPromise['resolve'] = resolvingPromise;
  PolyfillPromise['reject'] = function(opt_reason) {
    return new PolyfillPromise(function(resolve, reject) {
      reject(opt_reason);
    });
  };
  PolyfillPromise['race'] = function(thenablesOrValues) {
    return new PolyfillPromise(function(resolve, reject) {
      var iterator = $jscomp.makeIterator(thenablesOrValues);
      for (var iterRec = iterator.next(); !iterRec.done; iterRec = iterator.next()) {
        resolvingPromise(iterRec.value).callWhenSettled_(resolve, reject);
      }
    });
  };
  PolyfillPromise['all'] = function(thenablesOrValues) {
    var iterator = $jscomp.makeIterator(thenablesOrValues);
    var iterRec = iterator.next();
    if (iterRec.done) {
      return resolvingPromise([]);
    } else {
      return new PolyfillPromise(function(resolveAll, rejectAll) {
        var resultsArray = [];
        var unresolvedCount = 0;
        function onFulfilled(i) {
          return function(ithResult) {
            resultsArray[i] = ithResult;
            unresolvedCount--;
            if (unresolvedCount == 0) {
              resolveAll(resultsArray);
            }
          };
        }
        do {
          resultsArray.push(undefined);
          unresolvedCount++;
          resolvingPromise(iterRec.value).callWhenSettled_(onFulfilled(resultsArray.length - 1), rejectAll);
          iterRec = iterator.next();
        } while (!iterRec.done);
      });
    }
  };
  return PolyfillPromise;
}, 'es6', 'es3');
$jscomp.executeAsyncGenerator = function(generator) {
  function passValueToGenerator(value) {
    return generator.next(value);
  }
  function passErrorToGenerator(error) {
    return generator['throw'](error);
  }
  return new Promise(function(resolve, reject) {
    function handleGeneratorRecord(genRec) {
      if (genRec.done) {
        resolve(genRec.value);
      } else {
        Promise.resolve(genRec.value).then(passValueToGenerator, passErrorToGenerator).then(handleGeneratorRecord, reject);
      }
    }
    handleGeneratorRecord(generator.next());
  });
};
$jscomp.owns = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
$jscomp.polyfill('WeakMap', function(NativeWeakMap) {
  function isConformant() {
    if (!NativeWeakMap || !Object.seal) {
      return false;
    }
    try {
      var x = Object.seal({});
      var y = Object.seal({});
      var map = new NativeWeakMap([[x, 2], [y, 3]]);
      if (map.get(x) != 2 || map.get(y) != 3) {
        return false;
      }
      map['delete'](x);
      map.set(y, 4);
      return !map.has(x) && map.get(y) == 4;
    } catch (err) {
      return false;
    }
  }
  if (isConformant()) {
    return NativeWeakMap;
  }
  var prop = '$jscomp_hidden_' + Math.random().toString().substring(2);
  function insert(target) {
    if (!$jscomp.owns(target, prop)) {
      var obj = {};
      $jscomp.defineProperty(target, prop, {value:obj});
    }
  }
  function patch(name) {
    var prev = Object[name];
    if (prev) {
      Object[name] = function(target) {
        insert(target);
        return prev(target);
      };
    }
  }
  patch('freeze');
  patch('preventExtensions');
  patch('seal');
  var index = 0;
  var PolyfillWeakMap = function(opt_iterable) {
    this.id_ = (index += Math.random() + 1).toString();
    if (opt_iterable) {
      $jscomp.initSymbol();
      $jscomp.initSymbolIterator();
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillWeakMap.prototype.set = function(key, value) {
    insert(key);
    if (!$jscomp.owns(key, prop)) {
      throw new Error('WeakMap key fail: ' + key);
    }
    key[prop][this.id_] = value;
    return this;
  };
  PolyfillWeakMap.prototype.get = function(key) {
    return $jscomp.owns(key, prop) ? key[prop][this.id_] : undefined;
  };
  PolyfillWeakMap.prototype.has = function(key) {
    return $jscomp.owns(key, prop) && $jscomp.owns(key[prop], this.id_);
  };
  PolyfillWeakMap.prototype['delete'] = function(key) {
    if (!$jscomp.owns(key, prop) || !$jscomp.owns(key[prop], this.id_)) {
      return false;
    }
    return delete key[prop][this.id_];
  };
  return PolyfillWeakMap;
}, 'es6', 'es3');
$jscomp.MapEntry = function() {
  this.previous;
  this.next;
  this.head;
  this.key;
  this.value;
};
$jscomp.polyfill('Map', function(NativeMap) {
  var isConformant = !$jscomp.ASSUME_NO_NATIVE_MAP && function() {
    if (!NativeMap || !NativeMap.prototype.entries || typeof Object.seal != 'function') {
      return false;
    }
    try {
      NativeMap = NativeMap;
      var key = Object.seal({x:4});
      var map = new NativeMap($jscomp.makeIterator([[key, 's']]));
      if (map.get(key) != 's' || map.size != 1 || map.get({x:4}) || map.set({x:4}, 't') != map || map.size != 2) {
        return false;
      }
      var iter = map.entries();
      var item = iter.next();
      if (item.done || item.value[0] != key || item.value[1] != 's') {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0].x != 4 || item.value[1] != 't' || !iter.next().done) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }();
  if (isConformant) {
    return NativeMap;
  }
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  var idMap = new WeakMap;
  var PolyfillMap = function(opt_iterable) {
    this.data_ = {};
    this.head_ = createHead();
    this.size = 0;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillMap.prototype.set = function(key, value) {
    var r = maybeGetEntry(this, key);
    if (!r.list) {
      r.list = this.data_[r.id] = [];
    }
    if (!r.entry) {
      r.entry = {next:this.head_, previous:this.head_.previous, head:this.head_, key:key, value:value};
      r.list.push(r.entry);
      this.head_.previous.next = r.entry;
      this.head_.previous = r.entry;
      this.size++;
    } else {
      r.entry.value = value;
    }
    return this;
  };
  PolyfillMap.prototype['delete'] = function(key) {
    var r = maybeGetEntry(this, key);
    if (r.entry && r.list) {
      r.list.splice(r.index, 1);
      if (!r.list.length) {
        delete this.data_[r.id];
      }
      r.entry.previous.next = r.entry.next;
      r.entry.next.previous = r.entry.previous;
      r.entry.head = null;
      this.size--;
      return true;
    }
    return false;
  };
  PolyfillMap.prototype.clear = function() {
    this.data_ = {};
    this.head_ = this.head_.previous = createHead();
    this.size = 0;
  };
  PolyfillMap.prototype.has = function(key) {
    return !!maybeGetEntry(this, key).entry;
  };
  PolyfillMap.prototype.get = function(key) {
    var entry = maybeGetEntry(this, key).entry;
    return entry && entry.value;
  };
  PolyfillMap.prototype.entries = function() {
    return makeIterator(this, function(entry) {
      return [entry.key, entry.value];
    });
  };
  PolyfillMap.prototype.keys = function() {
    return makeIterator(this, function(entry) {
      return entry.key;
    });
  };
  PolyfillMap.prototype.values = function() {
    return makeIterator(this, function(entry) {
      return entry.value;
    });
  };
  PolyfillMap.prototype.forEach = function(callback, opt_thisArg) {
    var iter = this.entries();
    var item;
    while (!(item = iter.next()).done) {
      var entry = item.value;
      callback.call(opt_thisArg, entry[1], entry[0], this);
    }
  };
  PolyfillMap.prototype[Symbol.iterator] = PolyfillMap.prototype.entries;
  var maybeGetEntry = function(map, key) {
    var id = getId(key);
    var list = map.data_[id];
    if (list && $jscomp.owns(map.data_, id)) {
      for (var index = 0; index < list.length; index++) {
        var entry = list[index];
        if (key !== key && entry.key !== entry.key || key === entry.key) {
          return {id:id, list:list, index:index, entry:entry};
        }
      }
    }
    return {id:id, list:list, index:-1, entry:undefined};
  };
  var makeIterator = function(map, func) {
    var entry = map.head_;
    return $jscomp.iteratorPrototype(function() {
      if (entry) {
        while (entry.head != map.head_) {
          entry = entry.previous;
        }
        while (entry.next != entry.head) {
          entry = entry.next;
          return {done:false, value:func(entry)};
        }
        entry = null;
      }
      return {done:true, value:void 0};
    });
  };
  var createHead = function() {
    var head = {};
    head.previous = head.next = head.head = head;
    return head;
  };
  var mapIndex = 0;
  var getId = function(obj) {
    var type = obj && typeof obj;
    if (type == 'object' || type == 'function') {
      obj = obj;
      if (!idMap.has(obj)) {
        var id = '' + ++mapIndex;
        idMap.set(obj, id);
        return id;
      }
      return idMap.get(obj);
    }
    return 'p_' + obj;
  };
  return PolyfillMap;
}, 'es6', 'es3');
$jscomp.polyfill('Math.acosh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    return Math.log(x + Math.sqrt(x * x - 1));
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.asinh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    var y = Math.log(Math.abs(x) + Math.sqrt(x * x + 1));
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log1p', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x < 0.25 && x > -0.25) {
      var y = x;
      var d = 1;
      var z = x;
      var zPrev = 0;
      var s = 1;
      while (zPrev != z) {
        y *= x;
        s *= -1;
        z = (zPrev = z) + s * y / ++d;
      }
      return z;
    }
    return Math.log(1 + x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.atanh', function(orig) {
  if (orig) {
    return orig;
  }
  var log1p = Math.log1p;
  var polyfill = function(x) {
    x = Number(x);
    return (log1p(x) - log1p(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.cbrt', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (x === 0) {
      return x;
    }
    x = Number(x);
    var y = Math.pow(Math.abs(x), 1 / 3);
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.clz32', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x) >>> 0;
    if (x === 0) {
      return 32;
    }
    var result = 0;
    if ((x & 4294901760) === 0) {
      x <<= 16;
      result += 16;
    }
    if ((x & 4278190080) === 0) {
      x <<= 8;
      result += 8;
    }
    if ((x & 4026531840) === 0) {
      x <<= 4;
      result += 4;
    }
    if ((x & 3221225472) === 0) {
      x <<= 2;
      result += 2;
    }
    if ((x & 2147483648) === 0) {
      result++;
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.cosh', function(orig) {
  if (orig) {
    return orig;
  }
  var exp = Math.exp;
  var polyfill = function(x) {
    x = Number(x);
    return (exp(x) + exp(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.expm1', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x < .25 && x > -.25) {
      var y = x;
      var d = 1;
      var z = x;
      var zPrev = 0;
      while (zPrev != z) {
        y *= x / ++d;
        z = (zPrev = z) + y;
      }
      return z;
    }
    return Math.exp(x) - 1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.hypot', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x, y, var_args) {
    x = Number(x);
    y = Number(y);
    var i, z, sum;
    var max = Math.max(Math.abs(x), Math.abs(y));
    for (i = 2; i < arguments.length; i++) {
      max = Math.max(max, Math.abs(arguments[i]));
    }
    if (max > 1e100 || max < 1e-100) {
      x = x / max;
      y = y / max;
      sum = x * x + y * y;
      for (i = 2; i < arguments.length; i++) {
        z = Number(arguments[i]) / max;
        sum += z * z;
      }
      return Math.sqrt(sum) * max;
    } else {
      sum = x * x + y * y;
      for (i = 2; i < arguments.length; i++) {
        z = Number(arguments[i]);
        sum += z * z;
      }
      return Math.sqrt(sum);
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.imul', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(a, b) {
    a = Number(a);
    b = Number(b);
    var ah = a >>> 16 & 65535;
    var al = a & 65535;
    var bh = b >>> 16 & 65535;
    var bl = b & 65535;
    var lh = ah * bl + al * bh << 16 >>> 0;
    return al * bl + lh | 0;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log10', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Math.log(x) / Math.LN10;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log2', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Math.log(x) / Math.LN2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.sign', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    return x === 0 || isNaN(x) ? x : x > 0 ? 1 : -1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.sinh', function(orig) {
  if (orig) {
    return orig;
  }
  var exp = Math.exp;
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    return (exp(x) - exp(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.tanh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    var y = Math.exp(-2 * Math.abs(x));
    var z = (1 - y) / (1 + y);
    return x < 0 ? -z : z;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.trunc', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (isNaN(x) || x === Infinity || x === -Infinity || x === 0) {
      return x;
    }
    var y = Math.floor(Math.abs(x));
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.EPSILON', function(orig) {
  return Math.pow(2, -52);
}, 'es6', 'es3');
$jscomp.polyfill('Number.MAX_SAFE_INTEGER', function() {
  return 9007199254740991;
}, 'es6', 'es3');
$jscomp.polyfill('Number.MIN_SAFE_INTEGER', function() {
  return -9007199254740991;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isFinite', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (typeof x !== 'number') {
      return false;
    }
    return !isNaN(x) && x !== Infinity && x !== -Infinity;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isInteger', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (!Number.isFinite(x)) {
      return false;
    }
    return x === Math.floor(x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isNaN', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return typeof x === 'number' && isNaN(x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isSafeInteger', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Number.isInteger(x) && Math.abs(x) <= Number.MAX_SAFE_INTEGER;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Object.assign', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, var_args) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (!source) {
        continue;
      }
      for (var key in source) {
        if ($jscomp.owns(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Object.entries', function(orig) {
  if (orig) {
    return orig;
  }
  var entries = function(obj) {
    var result = [];
    for (var key in obj) {
      if ($jscomp.owns(obj, key)) {
        result.push([key, obj[key]]);
      }
    }
    return result;
  };
  return entries;
}, 'es8', 'es3');
$jscomp.polyfill('Object.getOwnPropertySymbols', function(orig) {
  if (orig) {
    return orig;
  }
  return function() {
    return [];
  };
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.ownKeys', function(orig) {
  if (orig) {
    return orig;
  }
  var symbolPrefix = 'jscomp_symbol_';
  function isSymbol(key) {
    return key.substring(0, symbolPrefix.length) == symbolPrefix;
  }
  var polyfill = function(target) {
    var keys = [];
    var names = Object.getOwnPropertyNames(target);
    var symbols = Object.getOwnPropertySymbols(target);
    for (var i = 0; i < names.length; i++) {
      (isSymbol(names[i]) ? symbols : keys).push(names[i]);
    }
    return keys.concat(symbols);
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Object.getOwnPropertyDescriptors', function(orig) {
  if (orig) {
    return orig;
  }
  var getOwnPropertyDescriptors = function(obj) {
    var result = {};
    var keys = Reflect.ownKeys(obj);
    for (var i = 0; i < keys.length; i++) {
      result[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return result;
  };
  return getOwnPropertyDescriptors;
}, 'es8', 'es5');
$jscomp.underscoreProtoCanBeSet = function() {
  var x = {a:true};
  var y = {};
  try {
    y.__proto__ = x;
    return y.a;
  } catch (e) {
  }
  return false;
};
$jscomp.setPrototypeOf = typeof Object.setPrototypeOf == 'function' ? Object.setPrototypeOf : $jscomp.underscoreProtoCanBeSet() ? function(target, proto) {
  target.__proto__ = proto;
  if (target.__proto__ !== proto) {
    throw new TypeError(target + ' is not extensible');
  }
  return target;
} : null;
$jscomp.polyfill('Object.setPrototypeOf', function(orig) {
  return orig || $jscomp.setPrototypeOf;
}, 'es6', 'es5');
$jscomp.polyfill('Object.values', function(orig) {
  if (orig) {
    return orig;
  }
  var values = function(obj) {
    var result = [];
    for (var key in obj) {
      if ($jscomp.owns(obj, key)) {
        result.push(obj[key]);
      }
    }
    return result;
  };
  return values;
}, 'es8', 'es3');
$jscomp.polyfill('Reflect.apply', function(orig) {
  if (orig) {
    return orig;
  }
  var apply = Function.prototype.apply;
  var polyfill = function(target, thisArg, argList) {
    return apply.call(target, thisArg, argList);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.objectCreate = $jscomp.ASSUME_ES5 || typeof Object.create == 'function' ? Object.create : function(prototype) {
  var ctor = function() {
  };
  ctor.prototype = prototype;
  return new ctor;
};
$jscomp.construct = function() {
  function reflectConstructWorks() {
    function Base() {
    }
    function Derived() {
    }
    new Base;
    Reflect.construct(Base, [], Derived);
    return new Base instanceof Base;
  }
  if (typeof Reflect != 'undefined' && Reflect.construct) {
    if (reflectConstructWorks()) {
      return Reflect.construct;
    }
    var brokenConstruct = Reflect.construct;
    var patchedConstruct = function(target, argList, opt_newTarget) {
      var out = brokenConstruct(target, argList);
      if (opt_newTarget) {
        Reflect.setPrototypeOf(out, opt_newTarget.prototype);
      }
      return out;
    };
    return patchedConstruct;
  }
  function construct(target, argList, opt_newTarget) {
    if (opt_newTarget === undefined) {
      opt_newTarget = target;
    }
    var proto = opt_newTarget.prototype || Object.prototype;
    var obj = $jscomp.objectCreate(proto);
    var apply = Function.prototype.apply;
    var out = apply.call(target, obj, argList);
    return out || obj;
  }
  return construct;
}();
$jscomp.polyfill('Reflect.construct', function(orig) {
  return $jscomp.construct;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.defineProperty', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, attributes) {
    try {
      Object.defineProperty(target, propertyKey, attributes);
      var desc = Object.getOwnPropertyDescriptor(target, propertyKey);
      if (!desc) {
        return false;
      }
      return desc.configurable === (attributes.configurable || false) && desc.enumerable === (attributes.enumerable || false) && ('value' in desc ? desc.value === attributes.value && desc.writable === (attributes.writable || false) : desc.get === attributes.get && desc.set === attributes.set);
    } catch (err) {
      return false;
    }
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.deleteProperty', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey) {
    if (!$jscomp.owns(target, propertyKey)) {
      return true;
    }
    try {
      return delete target[propertyKey];
    } catch (err) {
      return false;
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.getOwnPropertyDescriptor', function(orig) {
  return orig || Object.getOwnPropertyDescriptor;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.getPrototypeOf', function(orig) {
  return orig || Object.getPrototypeOf;
}, 'es6', 'es5');
$jscomp.findDescriptor = function(target, propertyKey) {
  var obj = target;
  while (obj) {
    var property = Reflect.getOwnPropertyDescriptor(obj, propertyKey);
    if (property) {
      return property;
    }
    obj = Reflect.getPrototypeOf(obj);
  }
  return undefined;
};
$jscomp.polyfill('Reflect.get', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, opt_receiver) {
    if (arguments.length <= 2) {
      return target[propertyKey];
    }
    var property = $jscomp.findDescriptor(target, propertyKey);
    if (property) {
      return property.get ? property.get.call(opt_receiver) : property.value;
    }
    return undefined;
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.has', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey) {
    return propertyKey in target;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.isExtensible', function(orig) {
  if (orig) {
    return orig;
  }
  if ($jscomp.ASSUME_ES5 || typeof Object.isExtensible == 'function') {
    return Object.isExtensible;
  }
  return function() {
    return true;
  };
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.preventExtensions', function(orig) {
  if (orig) {
    return orig;
  }
  if (!($jscomp.ASSUME_ES5 || typeof Object.preventExtensions == 'function')) {
    return function() {
      return false;
    };
  }
  var polyfill = function(target) {
    Object.preventExtensions(target);
    return !Object.isExtensible(target);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.set', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, value, opt_receiver) {
    var property = $jscomp.findDescriptor(target, propertyKey);
    if (!property) {
      if (Reflect.isExtensible(target)) {
        target[propertyKey] = value;
        return true;
      }
      return false;
    }
    if (property.set) {
      property.set.call(arguments.length > 3 ? opt_receiver : target, value);
      return true;
    } else {
      if (property.writable && !Object.isFrozen(target)) {
        target[propertyKey] = value;
        return true;
      }
    }
    return false;
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.setPrototypeOf', function(orig) {
  if (orig) {
    return orig;
  } else {
    if ($jscomp.setPrototypeOf) {
      var setPrototypeOf = $jscomp.setPrototypeOf;
      var polyfill = function(target, proto) {
        try {
          setPrototypeOf(target, proto);
          return true;
        } catch (e) {
          return false;
        }
      };
      return polyfill;
    } else {
      return null;
    }
  }
}, 'es6', 'es5');
$jscomp.polyfill('Set', function(NativeSet) {
  var isConformant = !$jscomp.ASSUME_NO_NATIVE_SET && function() {
    if (!NativeSet || !NativeSet.prototype.entries || typeof Object.seal != 'function') {
      return false;
    }
    try {
      NativeSet = NativeSet;
      var value = Object.seal({x:4});
      var set = new NativeSet($jscomp.makeIterator([value]));
      if (!set.has(value) || set.size != 1 || set.add(value) != set || set.size != 1 || set.add({x:4}) != set || set.size != 2) {
        return false;
      }
      var iter = set.entries();
      var item = iter.next();
      if (item.done || item.value[0] != value || item.value[1] != value) {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0] == value || item.value[0].x != 4 || item.value[1] != item.value[0]) {
        return false;
      }
      return iter.next().done;
    } catch (err) {
      return false;
    }
  }();
  if (isConformant) {
    return NativeSet;
  }
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  var PolyfillSet = function(opt_iterable) {
    this.map_ = new Map;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.add(item);
      }
    }
    this.size = this.map_.size;
  };
  PolyfillSet.prototype.add = function(value) {
    this.map_.set(value, value);
    this.size = this.map_.size;
    return this;
  };
  PolyfillSet.prototype['delete'] = function(value) {
    var result = this.map_['delete'](value);
    this.size = this.map_.size;
    return result;
  };
  PolyfillSet.prototype.clear = function() {
    this.map_.clear();
    this.size = 0;
  };
  PolyfillSet.prototype.has = function(value) {
    return this.map_.has(value);
  };
  PolyfillSet.prototype.entries = function() {
    return this.map_.entries();
  };
  PolyfillSet.prototype.values = function() {
    return this.map_.values();
  };
  PolyfillSet.prototype.keys = PolyfillSet.prototype.values;
  PolyfillSet.prototype[Symbol.iterator] = PolyfillSet.prototype.values;
  PolyfillSet.prototype.forEach = function(callback, opt_thisArg) {
    var set = this;
    this.map_.forEach(function(value) {
      return callback.call(opt_thisArg, value, value, set);
    });
  };
  return PolyfillSet;
}, 'es6', 'es3');
$jscomp.checkStringArgs = function(thisArg, arg, func) {
  if (thisArg == null) {
    throw new TypeError("The 'this' value for String.prototype." + func + ' must not be null or undefined');
  }
  if (arg instanceof RegExp) {
    throw new TypeError('First argument to String.prototype.' + func + ' must not be a regular expression');
  }
  return thisArg + '';
};
$jscomp.polyfill('String.prototype.codePointAt', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(position) {
    var string = $jscomp.checkStringArgs(this, null, 'codePointAt');
    var size = string.length;
    position = Number(position) || 0;
    if (!(position >= 0 && position < size)) {
      return void 0;
    }
    position = position | 0;
    var first = string.charCodeAt(position);
    if (first < 55296 || first > 56319 || position + 1 === size) {
      return first;
    }
    var second = string.charCodeAt(position + 1);
    if (second < 56320 || second > 57343) {
      return first;
    }
    return (first - 55296) * 1024 + second + 9216;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.endsWith', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'endsWith');
    searchString = searchString + '';
    if (opt_position === void 0) {
      opt_position = string.length;
    }
    var i = Math.max(0, Math.min(opt_position | 0, string.length));
    var j = searchString.length;
    while (j > 0 && i > 0) {
      if (string[--i] != searchString[--j]) {
        return false;
      }
    }
    return j <= 0;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.fromCodePoint', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(var_args) {
    var result = '';
    for (var i = 0; i < arguments.length; i++) {
      var code = Number(arguments[i]);
      if (code < 0 || code > 1114111 || code !== Math.floor(code)) {
        throw new RangeError('invalid_code_point ' + code);
      }
      if (code <= 65535) {
        result += String.fromCharCode(code);
      } else {
        code -= 65536;
        result += String.fromCharCode(code >>> 10 & 1023 | 55296);
        result += String.fromCharCode(code & 1023 | 56320);
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.includes', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'includes');
    return string.indexOf(searchString, opt_position || 0) !== -1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.repeat', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(copies) {
    var string = $jscomp.checkStringArgs(this, null, 'repeat');
    if (copies < 0 || copies > 1342177279) {
      throw new RangeError('Invalid count value');
    }
    copies = copies | 0;
    var result = '';
    while (copies) {
      if (copies & 1) {
        result += string;
      }
      if (copies >>>= 1) {
        string += string;
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.stringPadding = function(padString, padLength) {
  var padding = padString !== undefined ? String(padString) : ' ';
  if (!(padLength > 0) || !padding) {
    return '';
  }
  var repeats = Math.ceil(padLength / padding.length);
  return padding.repeat(repeats).substring(0, padLength);
};
$jscomp.polyfill('String.prototype.padEnd', function(orig) {
  if (orig) {
    return orig;
  }
  var padEnd = function(targetLength, opt_padString) {
    var string = $jscomp.checkStringArgs(this, null, 'padStart');
    var padLength = targetLength - string.length;
    return string + $jscomp.stringPadding(opt_padString, padLength);
  };
  return padEnd;
}, 'es8', 'es3');
$jscomp.polyfill('String.prototype.padStart', function(orig) {
  if (orig) {
    return orig;
  }
  var padStart = function(targetLength, opt_padString) {
    var string = $jscomp.checkStringArgs(this, null, 'padStart');
    var padLength = targetLength - string.length;
    return $jscomp.stringPadding(opt_padString, padLength) + string;
  };
  return padStart;
}, 'es8', 'es3');
$jscomp.polyfill('String.prototype.startsWith', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'startsWith');
    searchString = searchString + '';
    var strLen = string.length;
    var searchLen = searchString.length;
    var i = Math.max(0, Math.min(opt_position | 0, string.length));
    var j = 0;
    while (j < searchLen && i < strLen) {
      if (string[i++] != searchString[j++]) {
        return false;
      }
    }
    return j >= searchLen;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.arrayFromIterator = function(iterator) {
  var i;
  var arr = [];
  while (!(i = iterator.next()).done) {
    arr.push(i.value);
  }
  return arr;
};
$jscomp.arrayFromIterable = function(iterable) {
  if (iterable instanceof Array) {
    return iterable;
  } else {
    return $jscomp.arrayFromIterator($jscomp.makeIterator(iterable));
  }
};
$jscomp.inherits = function(childCtor, parentCtor) {
  childCtor.prototype = $jscomp.objectCreate(parentCtor.prototype);
  childCtor.prototype.constructor = childCtor;
  if ($jscomp.setPrototypeOf) {
    var setPrototypeOf = $jscomp.setPrototypeOf;
    setPrototypeOf(childCtor, parentCtor);
  } else {
    for (var p in parentCtor) {
      if (p == 'prototype') {
        continue;
      }
      if (Object.defineProperties) {
        var descriptor = Object.getOwnPropertyDescriptor(parentCtor, p);
        if (descriptor) {
          Object.defineProperty(childCtor, p, descriptor);
        }
      } else {
        childCtor[p] = parentCtor[p];
      }
    }
  }
  childCtor.superClass_ = parentCtor.prototype;
};
$jscomp.polyfill('WeakSet', function(NativeWeakSet) {
  function isConformant() {
    if (!NativeWeakSet || !Object.seal) {
      return false;
    }
    try {
      var x = Object.seal({});
      var y = Object.seal({});
      var set = new NativeWeakSet([x]);
      if (!set.has(x) || set.has(y)) {
        return false;
      }
      set['delete'](x);
      set.add(y);
      return !set.has(x) && set.has(y);
    } catch (err) {
      return false;
    }
  }
  if (isConformant()) {
    return NativeWeakSet;
  }
  var PolyfillWeakSet = function(opt_iterable) {
    this.map_ = new WeakMap;
    if (opt_iterable) {
      $jscomp.initSymbol();
      $jscomp.initSymbolIterator();
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.add(item);
      }
    }
  };
  PolyfillWeakSet.prototype.add = function(elem) {
    this.map_.set(elem, true);
    return this;
  };
  PolyfillWeakSet.prototype.has = function(elem) {
    return this.map_.has(elem);
  };
  PolyfillWeakSet.prototype['delete'] = function(elem) {
    return this.map_['delete'](elem);
  };
  return PolyfillWeakSet;
}, 'es6', 'es3');
try {
  if (Array.prototype.values.toString().indexOf('[native code]') == -1) {
    delete Array.prototype.values;
  }
} catch (e) {
}
Ext.define('Ext.overrides.util.Grouper', {override:'Ext.util.Grouper', config:{formatter:false, blankValue:'(blank)'}, _eventToMethodMap:{propertychange:'onGrouperPropertyChange', directionchange:'onGrouperDirectionChange'}, destroy:function() {
  this.observers = null;
  this.callParent();
}, getGroupString:function(item) {
  var group = this._groupFn(item);
  return group != null && group !== '' ? group : this.getBlankValue();
}, standardGroupFn:function(item) {
  var me = this, root = me._root, formatter = me._formatter, value = (root ? item[root] : item)[me._property];
  if (formatter) {
    value = formatter(value);
  }
  return value;
}, addObserver:function(observer) {
  var me = this, observers = me.observers;
  if (!observers) {
    me.observers = observers = [];
  }
  if (!Ext.Array.contains(observers, observer)) {
    if (me.notifying) {
      me.observers = observers = observers.slice(0);
    }
    observers.push(observer);
  }
  if (observers.length > 1) {
    Ext.Array.sort(observers, me.prioritySortFn);
  }
}, prioritySortFn:function(o1, o2) {
  var a = o1.observerPriority || 0, b = o2.observerPriority || 0;
  return a - b;
}, removeObserver:function(observer) {
  var observers = this.observers;
  if (observers) {
    Ext.Array.remove(observers, observer);
  }
}, clearObservers:function() {
  this.observers = null;
}, notify:function(eventName, args) {
  var me = this, observers = me.observers, methodName = me._eventToMethodMap[eventName], added = 0, index, length, method, observer;
  args = args || [];
  if (observers && methodName) {
    me.notifying = true;
    for (index = 0, length = observers.length; index < length; ++index) {
      method = (observer = observers[index])[methodName];
      if (method) {
        if (!added++) {
          args.unshift(me);
        }
        method.apply(observer, args);
      }
    }
    me.notifying = false;
  }
}, updateProperty:function(data, oldData) {
  this.callParent([data, oldData]);
  this.notify('propertychange', [data, oldData]);
}, updateDirection:function(data, oldData) {
  this.callParent([data, oldData]);
  this.notify('directionchange', [data, oldData]);
}, applyFormatter:function(value) {
  var parser, format;
  if (!value) {
    return null;
  }
  parser = Ext.app.bind.Parser.fly(value);
  format = parser.compileFormat();
  parser.release();
  return function(v) {
    return format(v);
  };
}});
Ext.define('Ext.overrides.util.Collection', {override:'Ext.util.Collection', uses:['Ext.util.GrouperCollection'], config:{groupConfig:null, groupers:null}, destroy:function() {
  var me = this, groupers = me._groupers, monitored = me.lastMonitoredGroupers;
  if (monitored) {
    monitored.removeGroupersObserver(me);
  }
  if (groupers) {
    groupers.destroy();
    me._groupers = null;
  }
  me.setGroups(null);
  me.callParent();
}, _eventToMethodMap:{add:'onCollectionAdd', beforeitemchange:'onCollectionBeforeItemChange', beginupdate:'onCollectionBeginUpdate', endupdate:'onCollectionEndUpdate', itemchange:'onCollectionItemChange', filtereditemchange:'onCollectionFilteredItemChange', refresh:'onCollectionRefresh', remove:'onCollectionRemove', beforesort:'beforeCollectionSort', sort:'onCollectionSort', beforegroup:'onCollectionBeforeGroup', group:'onCollectionGroup', filter:'onCollectionFilter', filteradd:'onCollectionFilterAdd', 
updatekey:'onCollectionUpdateKey'}, createSortFn:function() {
  var me = this, groupers = me.getGroupers(false), sorters = me.getSorters(false), sorterFn = sorters ? sorters.getSortFn() : null, groupSorterFn = groupers ? groupers.getSortFn() : null;
  if (!groupers) {
    return sorterFn;
  }
  return function(lhs, rhs) {
    var ret = groupSorterFn(lhs, rhs);
    if (!ret && sorterFn) {
      ret = sorterFn(lhs, rhs);
    }
    return ret;
  };
}, applyGrouper:function(grouper) {
  if (grouper && !grouper.isGrouper) {
    grouper = this.getGroupers(true).decodeGrouper(grouper);
  }
  return grouper;
}, updateGrouper:function(grouper) {
  var groupers = this.getGroupers(false);
  if (grouper) {
    if (!groupers) {
      groupers = this.getGroupers(true);
    }
    groupers.clear();
    groupers.add(grouper);
  } else {
    this.setGroupers(null);
  }
}, getGrouper:function() {
  var groupers = this.getGroupers(false);
  return groupers && groupers.length ? groupers.getAt(0) : null;
}, getGroupers:function(autoCreate) {
  var ret = this._groupers;
  if (!ret && autoCreate !== false) {
    ret = new Ext.util.GrouperCollection({rootProperty:this.getRootProperty()});
    this.setGroupers(ret);
  }
  return ret;
}, applyGroupers:function(groupers, collection) {
  if (groupers == null || groupers && groupers.isGrouperCollection) {
    return groupers;
  }
  if (groupers) {
    if (!collection) {
      collection = this.getGroupers();
    }
    collection.splice(0, collection.length, groupers);
  }
  return collection;
}, updateGroupers:function(newGroupers, oldGroupers) {
  var me = this, groups = me.getGroups(), sorters = me.getSorters(), populate;
  if (oldGroupers) {
    oldGroupers.un('endupdate', 'onEndUpdateGroupers', me);
  }
  if (newGroupers) {
    if (me.getTrackGroups()) {
      if (!groups) {
        groups = new Ext.util.GroupCollection({itemRoot:me.getRootProperty(), autoGroup:me.getAutoGroup(), autoSort:me.getAutoSort(), groupConfig:me.getGroupConfig()});
        me.setGroups(groups);
      }
      populate = true;
    }
    newGroupers.on('endupdate', 'onEndUpdateGroupers', me, {prepend:true});
  } else {
    me.setGroups(null);
  }
  me.onEndUpdateGroupers(newGroupers);
  if (!sorters.updating) {
    me.onEndUpdateSorters(sorters);
  }
  if (populate) {
    groups.onCollectionRefresh(me);
  }
}, onEndUpdateGroupers:function(groupers) {
  var me = this, was = me.grouped, sorters = me.getSorters(), is = me.getAutoGroup() && groupers && groupers.length > 0;
  if (me.lastMonitoredGroupers) {
    me.lastMonitoredGroupers.removeGroupersObserver(me);
    me.lastMonitoredGroupers = null;
  }
  if (was || is) {
    me.grouped = !!is;
    me.onSorterChange();
    if (sorters && !sorters.updating) {
      me.onEndUpdateSorters(groupers);
    }
    me.onGroupChange(groupers);
    if (groupers) {
      me.lastMonitoredGroupers = groupers;
      groupers.addGroupersObserver(me);
    }
  }
}, onCollectionFilteredItemChange:function() {
  delete this.onCollectionUpdateKey;
}, onGrouperDirectionChange:function() {
  var me = this;
  me.onEndUpdateSorters(me.getSorters());
  me.notify('group', [me.getGroupers(false)]);
}, onGroupChange:function(groupers) {
  var me = this, groups = me.getGroups();
  if (groups) {
    groups.onCollectionGroupersChanged(me);
    me.groupItems();
  }
}, groupItems:function() {
  var me = this, groupers = me.getGroupers(false), groups = me.getGroups();
  me.notify('beforegroup', [groupers]);
  if (me.length && groups) {
    groups.onCollectionRefresh(me);
  }
  me.notify('group', [groupers]);
}, updateGroups:function(newGroups, oldGroups) {
  if (oldGroups) {
    this.removeObserver(oldGroups);
    oldGroups.destroy();
  }
  if (newGroups) {
    this.addObserver(newGroups);
  }
}, onCollectionRefresh:function(source) {
  this.callParent([source]);
  ++this.generation;
}});
Ext.define('Ext.overrides.data.AbstractStore', {override:'Ext.data.AbstractStore', config:{groupers:undefined, remoteSummary:{lazy:true, $value:false}}, observerPriority:1000, delayedGroup:function(groupers, direction) {
  var me = this;
  me.fireEvent('beforegroupchange', me);
  Ext.asap(me.group, me, [groupers, direction]);
}, group:function(groupers, direction) {
  var me = this, data = me.getData(), colGroupers, grouper, newGroupers;
  if (me.destroyed) {
    return;
  }
  colGroupers = data.getGroupers();
  if (groupers) {
    if (Ext.isArray(groupers)) {
      newGroupers = groupers;
    } else {
      if (Ext.isObject(groupers)) {
        newGroupers = [groupers];
      } else {
        if (Ext.isString(groupers)) {
          grouper = colGroupers.get(groupers);
          if (!grouper) {
            grouper = {property:groupers, direction:direction || me.getGroupDir()};
            newGroupers = [grouper];
          } else {
            if (direction === undefined) {
              grouper.toggle();
            } else {
              grouper.setDirection(direction);
            }
          }
        }
      }
    }
    if (newGroupers && newGroupers.length) {
      data.setGroupers(newGroupers);
    }
  } else {
    colGroupers.clear();
  }
}, onGrouperEndUpdate:function() {
  var me = this, data = me.getData();
  data.getGroupers().addGroupersObserver(me);
  if (me.getRemoteSort()) {
    if (!me.isInitializing) {
      me.load({scope:me, callback:me.fireGroupChange});
    }
  } else {
    me.fireEvent('datachanged', me);
    me.fireEvent('refresh', me);
    me.fireGroupChange();
  }
}, onGrouperDirectionChange:function() {
  var me = this;
  me.fireEvent('beforegroupchange', me);
  if (me.getRemoteSort()) {
    if (!me.isInitializing) {
      me.load({scope:me, callback:me.fireGroupChange});
    }
  } else {
    Ext.asap(me.delayedDirectionChange, me);
  }
}, delayedDirectionChange:function() {
  var me = this;
  if (me.destroyed) {
    return;
  }
  me.fireEvent('datachanged', me);
  me.fireEvent('refresh', me);
  me.fireGroupChange();
}, fireGroupChange:function() {
  if (!this.destroyed) {
    this.fireEvent('groupchange', this, this.getGroupers());
  }
}, getGroupField:function() {
  var groupers = this.getGroupers(), group = '';
  if (groupers && groupers.length) {
    group = groupers.getAt(0).getProperty();
  }
  return group;
}, getGrouper:function() {
  return this.getData().getGrouper();
}, setGrouper:function(grouper) {
  this.setGroupers(grouper ? [grouper] : []);
}, getGroupers:function() {
  return this.getData().getGroupers();
}, setGroupers:function(groupers) {
  var group = !this.isConfiguring || this.isConfiguring && groupers;
  if (group) {
    this.group(groupers);
  }
}, isGrouped:function() {
  return this.getGroupers().length > 0;
}, getState:function() {
  var me = this, groupers = [], result = me.callParent(arguments), hasState = !Ext.isEmpty(result);
  me.getGroupers().each(function(g) {
    groupers[groupers.length] = g.getState();
    hasState = hasState && true;
  });
  if (hasState) {
    result = result || {};
    if (groupers.length) {
      result.groupers = groupers;
    }
  }
  return result;
}, applyState:function(state) {
  var me = this, groupers = me.getGroupers(), stateGroupers = state.groupers;
  if (stateGroupers) {
    groupers.replaceAll(stateGroupers);
  }
}});
Ext.define('Ext.overrides.data.operation.Read', {override:'Ext.data.operation.Read', config:{groupers:undefined, summaries:undefined}});
Ext.define('Ext.overrides.data.field.Field', {override:'Ext.data.field.Field', summary:null, getSummary:function() {
  var me = this, doneSummary = me.doneSummary, summary = me.summary;
  if (!doneSummary) {
    me.doneSummary = true;
    if (summary) {
      me.summary = summary = Ext.Factory.dataSummary(summary);
    }
  }
  return summary || null;
}});
Ext.define('Ext.overrides.data.Model', {override:'Ext.data.Model', inheritableStatics:{getSummaryModel:function() {
  var me = this, proto = me.prototype, summaryModel = me.summaryModel, fields = proto.getFields(), length = fields.length, newFields = [], field, i;
  if (!summaryModel) {
    for (i = 0; i < length; i++) {
      field = fields[i];
      if (field.getSummary()) {
        newFields.push({name:field.getName(), type:'auto', summary:field.getSummary()});
      }
    }
    summaryModel = Ext.define(null, {extend:'Ext.data.SummaryModel', fields:newFields});
    me.summaryModel = proto.summaryModel = summaryModel;
  }
  return summaryModel || null;
}}});
Ext.define('Ext.overrides.data.ResultSet', {override:'Ext.data.ResultSet', config:{groupData:null, summaryData:null}});
Ext.define('Ext.overrides.data.reader.Reader', {override:'Ext.data.reader.Reader', config:{groupRootProperty:'', summaryRootProperty:''}, readRecords:function(data, readOptions, internalReadOptions) {
  var me = this, result = me.callParent([data, readOptions, internalReadOptions]), groupData = null, summaryData = null, root, summaryOptions;
  if (result.isResultSet && result.success) {
    if (me.getGroupRootProperty()) {
      root = me.getGroupRoot(data);
      if (root) {
        summaryOptions = {includes:false, model:me.getModel().getSummaryModel()};
        groupData = me.extractData(root, summaryOptions) || null;
      }
    }
    if (me.getSummaryRootProperty()) {
      root = me.getSummaryRoot(data);
      if (root) {
        summaryOptions = summaryOptions || {includes:false, model:me.getModel().getSummaryModel()};
        summaryData = me.extractData(root, summaryOptions) || null;
        if (summaryData) {
          summaryData = summaryData[0];
        }
      }
    }
    result.setGroupData(groupData);
    result.setSummaryData(summaryData);
  }
  return result;
}, buildExtractors:function(force) {
  var me = this, groupProp, summaryProp;
  if (force || !me.hasExtractors) {
    groupProp = me.getGroupRootProperty();
    summaryProp = me.getSummaryRootProperty();
    if (groupProp) {
      me.getGroupRoot = me.getAccessor(groupProp);
    }
    if (summaryProp) {
      me.getSummaryRoot = me.getAccessor(summaryProp);
    }
  }
  return me.callParent([force]);
}, privates:{getGroupRoot:Ext.privateFn, getSummaryRoot:Ext.privateFn}});
Ext.define('Ext.overrides.data.proxy.Memory', {override:'Ext.data.proxy.Memory', config:{clearOnRead:null}, read:function(operation) {
  var me = this, reader = me.getReader(), resultSet = reader.read(me.getData(), {recordCreator:reader.defaultRecordCreatorFromServer}), records = resultSet.getRecords(), sorters = operation.getSorters(), groupers = operation.getGroupers(), filters = operation.getFilters(), start = operation.getStart(), limit = operation.getLimit(), meta;
  if (operation.process(resultSet, null, null, false) !== false) {
    if (operation.success && me.getClearOnRead()) {
      this.setData(null);
    }
    if (filters && filters.length) {
      resultSet.setRecords(records = Ext.Array.filter(records, Ext.util.Filter.createFilterFn(filters)));
      resultSet.setTotal(records.length);
    }
    if (groupers && groupers.length) {
      sorters = sorters ? groupers.concat(sorters) : groupers;
    }
    if (sorters && sorters.length) {
      resultSet.setRecords(records = Ext.Array.sort(records, Ext.util.Sortable.createComparator(sorters)));
    }
    if (me.getEnablePaging() && start !== undefined && limit !== undefined) {
      if (start >= resultSet.getTotal()) {
        resultSet.setConfig({success:false, records:[], total:0});
      } else {
        resultSet.setRecords(Ext.Array.slice(records, start, start + limit));
      }
    }
    operation.setCompleted();
    if (meta = resultSet.getMetadata()) {
      me.onMetaChange(meta);
    }
  }
}});
Ext.define('Ext.overrides.data.proxy.Server', {override:'Ext.data.proxy.Server', config:{summaryParam:'summary'}, getParams:function(operation) {
  if (!operation.isReadOperation) {
    return {};
  }
  var me = this, params = {}, groupers = operation.getGroupers(), sorters = operation.getSorters(), filters = operation.getFilters(), page = operation.getPage(), start = operation.getStart(), limit = operation.getLimit(), simpleSortMode = me.getSimpleSortMode(), simpleGroupMode = me.getSimpleGroupMode(), pageParam = me.getPageParam(), startParam = me.getStartParam(), limitParam = me.getLimitParam(), groupParam = me.getGroupParam(), groupDirectionParam = me.getGroupDirectionParam(), sortParam = me.getSortParam(), 
  filterParam = me.getFilterParam(), directionParam = me.getDirectionParam(), summaries = operation.getSummaries(), summaryParam = me.getSummaryParam(), index;
  if (pageParam && page) {
    params[pageParam] = page;
  }
  if (startParam && (start || start === 0)) {
    params[startParam] = start;
  }
  if (limitParam && limit) {
    params[limitParam] = limit;
  }
  if (summaryParam && summaries && summaries.length > 0) {
    params[summaryParam] = me.encodeFields(summaries);
  }
  if (groupParam && groupers && groupers.length > 0) {
    if (simpleGroupMode) {
      for (index = 0; index < groupers.length; index++) {
        if (groupDirectionParam === groupParam) {
          params[groupParam] = Ext.Array.push(params[groupParam] || [], groupers[index].getProperty() + ' ' + groupers[index].getDirection());
        } else {
          params[groupParam] = Ext.Array.push(params[groupParam] || [], groupers[index].getProperty());
          params[groupDirectionParam] = Ext.Array.push(params[groupDirectionParam] || [], groupers[index].getDirection());
        }
      }
    } else {
      params[groupParam] = me.encodeSorters(groupers);
    }
  }
  if (sortParam && sorters && sorters.length > 0) {
    if (simpleSortMode) {
      for (index = 0; index < sorters.length; index++) {
        if (directionParam === sortParam) {
          params[sortParam] = Ext.Array.push(params[sortParam] || [], sorters[index].getProperty() + ' ' + sorters[index].getDirection());
        } else {
          params[sortParam] = Ext.Array.push(params[sortParam] || [], sorters[index].getProperty());
          params[directionParam] = Ext.Array.push(params[directionParam] || [], sorters[index].getDirection());
        }
      }
    } else {
      params[sortParam] = me.encodeSorters(sorters);
    }
  }
  if (filterParam && filters && filters.length > 0) {
    params[filterParam] = me.encodeFilters(filters);
  }
  return params;
}, encodeFields:function(fields) {
  var out = [], length = fields.length, i, field, encodedField, summary;
  for (i = 0; i < length; i++) {
    field = fields[i];
    encodedField = {name:field.getName()};
    summary = field.getSummary();
    if (summary && summary.isAggregator) {
      encodedField.summary = summary.type;
      out.push(encodedField);
    }
  }
  return this.applyEncoding(out);
}});
Ext.define('Ext.overrides.util.Group', {override:'Ext.util.Group', pathSeparator:'\x3c||\x3e', config:{level:1, path:null, data:null, grouper:null, label:null, groupKey:null, parent:null}, $endUpdatePriority:2001, manageSorters:false, isGroup:true, constructor:function(config) {
  this.callParent([config]);
  this.on('remove', 'onGroupItemsRemove', this);
}, destroy:function() {
  var parent = this.getParent(), groups;
  if (parent && parent.isGroup) {
    groups = parent.getGroups();
    if (groups) {
      groups.remove(this);
    }
  }
  this.callParent();
}, clear:function() {
  var groups = this.getGroups(), length, i, ret;
  ret = this.callParent();
  if (groups) {
    length = groups.length;
    for (i = 0; i < length; i++) {
      groups.items[i].clear();
    }
    groups.clear();
  }
  return ret;
}, getData:function() {
  var data = this._data;
  if (!data) {
    data = {};
    this.setData(data);
  }
  return data;
}, setCustomData:function(property, value) {
  this.getData()[property] = value;
}, getCustomData:function(property) {
  return this.getData()[property];
}, updateLabel:function(label) {
  this.setCustomData(this.getGrouper().getProperty(), label);
}, getGrouper:function() {
  return this._grouper;
}, updateGrouper:Ext.emptyFn, updateSorters:function(sorters, oldSorters) {
  var children = this.getGroups(), length, i;
  this.callParent([sorters, oldSorters]);
  if (!children || this.ejectTime) {
    return;
  }
  length = children.length;
  for (i = 0; i < length; i++) {
    children.items[i].setSorters(sorters);
  }
}, updateGroupKey:function() {
  this.refreshPath();
}, updateParent:function() {
  this.refreshPath();
}, refreshPath:function() {
  var me = this, level = 1, parent, path;
  if (!me.refreshingPath) {
    me.refreshingPath = true;
    parent = me.getParent();
    path = me.getGroupKey();
    if (parent && parent.isGroup) {
      level += parent.getLevel();
      path = parent.getPath() + me.pathSeparator + path;
    }
    me.setLevel(level);
    me.setPath(path);
    me.refreshingPath = false;
  }
}, isFirst:function() {
  var parent = this.getParent(), collection = parent ? parent.isGroup ? parent.getGroups() : parent : null, first = false;
  if (collection) {
    first = collection.indexOf(this) === 0;
  }
  return first;
}, isLast:function() {
  var parent = this.getParent(), collection = parent ? parent.isGroup ? parent.getGroups() : parent : null, last = false;
  if (collection) {
    last = collection.indexOf(this) === collection.length - 1;
  }
  return last;
}, groupItems:function() {
  if (!this.ejectTime) {
    return this.callParent();
  }
}, sortItems:function() {
  if (!this.ejectTime) {
    return this.callParent();
  }
}, privates:{canOwnItem:function(item) {
  return this.getGroupKey() === this.getGrouper().getGroupString(item);
}, removeItems:function(items) {
  var groups = this.getGroups(), len = groups ? groups.length : 0, removeGroups = [], i, group;
  for (i = 0; i < len; ++i) {
    group = groups.items[i];
    group.remove(items);
    if (!group.length) {
      removeGroups.push(group);
    }
  }
  if (removeGroups.length) {
    groups.remove(removeGroups);
  }
}, onGroupItemsRemove:function(collection, info) {
  this.removeItems(info.items);
}}});
Ext.define('Ext.util.GrouperCollection', {extend:'Ext.util.SorterCollection', requires:['Ext.util.Grouper'], isGrouperCollection:true, constructor:function(config) {
  this.callParent([config]);
  this.setDecoder(this.decodeGrouper);
}, decodeGrouper:function(grouper) {
  var cfg = grouper;
  if (typeof grouper === 'function') {
    cfg = {groupFn:grouper};
  }
  return this.decodeSorter(cfg, 'Ext.util.Grouper');
}, addGroupersObserver:function(observer) {
  var items = this.items, length = items.length, i;
  for (i = 0; i < length; i++) {
    items[i].addObserver(observer);
  }
}, removeGroupersObserver:function(observer) {
  var items = this.items, length = items.length, i;
  for (i = 0; i < length; i++) {
    items[i].removeObserver(observer);
  }
}});
Ext.define('Ext.overrides.util.GroupCollection', {override:'Ext.util.GroupCollection', requires:['Ext.util.GrouperCollection'], config:{grouper:null, groupConfig:null, itemRoot:null}, rootProperty:'_data', observerPriority:-100, emptyGroupRetainTime:300000, constructor:function(config) {
  this.emptyGroups = {};
  this.callParent([config]);
  this.on('remove', 'onGroupRemove', this);
}, destroy:function() {
  var me = this, grouper = me.lastMonitoredGrouper;
  if (grouper) {
    grouper.removeObserver(this);
  }
  me.destroyGroups(me.items);
  clearTimeout(me.checkRemoveQueueTimer);
  me.callParent();
}, getItemGroup:function(item) {
  var grouper = this.lastMonitoredGrouper, key, group;
  if (!grouper && this.items.length) {
    grouper = this.items[0].getGrouper();
  }
  if (grouper) {
    key = grouper.getGroupString(item);
    group = this.get(key);
  }
  return group;
}, onCollectionItemChange:function(source, details) {
  if (!details.indexChanged) {
    this.syncItemGrouping(source, details);
  }
  this.changeDetails = null;
}, onCollectionRefresh:function(source) {
  if (source.generation) {
    var me = this, itemGroupKeys = me.itemGroupKeys = {}, groupData, entries, groupKey, i, len, entry, j;
    me.groupersChanged = true;
    groupData = me.createEntries(source, source.items);
    entries = groupData.entries;
    for (i = 0, len = entries.length; i < len; ++i) {
      entry = entries[i];
      entry.group.splice(0, 1.0E99, entry.items);
      for (j = 0; j < entry.items.length; j++) {
        itemGroupKeys[source.getKey(entry.items[j])] = entry.group;
      }
    }
    entries = null;
    for (groupKey in me.map) {
      if (!(groupKey in groupData.groups)) {
        (entries || (entries = [])).push(me.map[groupKey]);
      }
    }
    if (entries) {
      me.remove(entries);
    }
    me.sortItems();
    me.groupersChanged = false;
  }
}, onCollectionUpdateKey:function(source, details) {
  if (!details.indexChanged) {
    details.oldIndex = source.indexOf(details.item);
    this.syncItemGrouping(source, details);
  }
}, onCollectionGroupersChanged:function(source) {
  var me = this, groupers = source.getGroupers(), grouper;
  if (groupers.length > 0) {
    grouper = groupers.items[0];
    me.changeSorterFn(grouper);
    if (me.lastMonitoredGrouper) {
      me.lastMonitoredGrouper.removeObserver(me);
    }
    me.lastMonitoredGrouper = grouper;
    grouper.addObserver(me);
  } else {
    me.removeAll();
  }
}, changeSorterFn:function(grouper) {
  var me = this, sorters = me.getSorters(), sorter = {root:me.getRootProperty()};
  sorter.direction = grouper.getDirection();
  if (grouper) {
    if (grouper.initialConfig.sorterFn) {
      sorter.sorterFn = grouper.initialConfig.sorterFn;
    } else {
      sorter.property = grouper.getSortProperty() || grouper.getProperty();
    }
  }
  if (sorter.property || sorter.sorterFn) {
    if (sorters.length === 0) {
      sorters.add(sorter);
    } else {
      sorters.items[0].setConfig(sorter);
    }
  } else {
    sorters.clear();
  }
}, onGrouperDirectionChange:function(grouper) {
  this.changeSorterFn(grouper);
  this.onEndUpdateSorters(this.getSorters());
}, createEntries:function(source, items) {
  var me = this, groups = {}, entries = [], groupers = source.getGroupers().getRange(), grouper, entry, group, groupKey, i, item, len;
  if (groupers.length) {
    grouper = groupers.shift();
    groupers = groupers.length ? Ext.clone(groupers) : null;
    for (i = 0, len = items.length; i < len; ++i) {
      groupKey = grouper.getGroupString(item = items[i]);
      if (!(entry = groups[groupKey])) {
        group = me.getGroup(source, item, grouper, groupers);
        entries.push(groups[groupKey] = entry = {group:group, items:[]});
      }
      entry.items.push(item);
    }
  }
  return {groups:groups, entries:entries};
}, onCollectionRemove:function(source, details) {
  var me = this, changeDetails = me.changeDetails, itemGroupKeys = me.itemGroupKeys || (me.itemGroupKeys = {}), entries, entry, group, i, n, j, removeGroups, item;
  if (source.getCount()) {
    if (changeDetails) {
      item = changeDetails.item || changeDetails.items[0];
      entries = me.createEntries(source, [item]).entries;
      entries[0].group = itemGroupKeys['oldKey' in details ? details.oldKey : source.getKey(item)];
    } else {
      entries = me.createEntries(source, details.items).entries;
    }
    for (i = 0, n = entries.length; i < n; ++i) {
      group = (entry = entries[i]).group;
      if (group) {
        group.remove(entry.items);
      }
      for (j = 0; j < entry.items.length; j++) {
        delete itemGroupKeys[source.getKey(entry.items[j])];
      }
      if (group && !group.length) {
        (removeGroups || (removeGroups = [])).push(group);
      }
    }
  } else {
    me.itemGroupKeys = {};
    removeGroups = me.items;
    for (i = 0, n = removeGroups.length; i < n; ++i) {
      removeGroups[i].clear();
    }
  }
  if (removeGroups) {
    me.remove(removeGroups);
  }
}, addItemsToGroups:function(source, items, at, oldIndex) {
  var me = this, itemGroupKeys = me.itemGroupKeys || (me.itemGroupKeys = {}), entries = me.createEntries(source, items).entries, index = -1, sourceStartIndex, entry, i, len, j, group, firstIndex, item;
  for (i = 0, len = entries.length; i < len; ++i) {
    entry = entries[i];
    group = entry.group;
    if (oldIndex || oldIndex === 0) {
      item = items[0];
      if (group.getCount() > 0 && source.getSorters().getCount() === 0) {
        firstIndex = source.indexOf(group.items[0]);
        if (oldIndex < firstIndex) {
          index = 0;
        } else {
          index = oldIndex - firstIndex;
        }
      }
      if (index === -1) {
        group.add(item);
      } else {
        group.insert(index, item);
      }
    } else {
      if (me.length > 1 && at) {
        sourceStartIndex = source.indexOf(entries[0].group.getAt(0));
        at = Math.max(at - sourceStartIndex, 0);
      }
      entry.group.insert(at != null ? at : group.items.length, entry.items);
      for (j = 0; j < entry.items.length; j++) {
        itemGroupKeys[source.getKey(entry.items[j])] = entry.group;
      }
    }
  }
  me.sortItems();
}, syncItemGrouping:function(source, details) {
  var me = this, itemGroupKeys = me.itemGroupKeys || (me.itemGroupKeys = {}), item = details.item, groupers = source.getGroupers().getRange(), grouper, oldKey, itemKey, oldGroup, group;
  if (!groupers.length) {
    return;
  }
  grouper = groupers.shift();
  groupers = groupers.length ? Ext.clone(groupers) : null;
  itemKey = source.getKey(item);
  oldKey = 'oldKey' in details ? details.oldKey : itemKey;
  oldGroup = itemGroupKeys[oldKey];
  group = me.getGroup(source, item, grouper, groupers);
  if (group === oldGroup) {
    oldGroup.itemChanged(item, details.modified, details.oldKey, details);
  } else {
    if (oldGroup) {
      oldGroup.updateKey(item, oldKey, itemKey);
      oldGroup.remove(item);
      if (!oldGroup.length) {
        me.remove(oldGroup);
      }
    }
    me.addItemsToGroups(source, [item], null, details.oldIndex);
  }
  delete itemGroupKeys[oldKey];
  itemGroupKeys[itemKey] = group;
}, getGroup:function(source, item, grouper, groupers) {
  var me = this, key = grouper.getGroupString(item), prop = grouper.getSortProperty(), root = grouper.getRoot(), group = me.get(key), autoSort = me.getAutoSort();
  if (group) {
    group.setSorters(source.getSorters());
    if (me.groupersChanged) {
      group.setGroupers(groupers);
      group.setGrouper(grouper);
      group.setParent(source.isGroup ? source : me);
    }
  } else {
    group = me.emptyGroups[key];
    if (group && group.destroyed) {
      delete me.emptyGroups[key];
      group = null;
    }
    group = group || Ext.create(Ext.apply({xclass:'Ext.util.Group', groupConfig:me.getGroupConfig()}, me.getGroupConfig()));
    me.setAutoSort(false);
    group.setConfig({groupKey:key, grouper:grouper, groupers:groupers, label:key, rootProperty:me.getItemRoot(), sorters:source.getSorters(), autoSort:me.getAutoSort(), autoGroup:me.getAutoGroup(), parent:source.isGroup ? source : me});
    group.ejectTime = null;
    me.add(group);
    me.setAutoSort(autoSort);
    if (prop) {
      group.setCustomData(prop, (root ? item[root] : item)[prop]);
    }
  }
  return group;
}, getByPath:function(path) {
  var paths = path ? String(path).split(Ext.util.Group.prototype.pathSeparator) : [], len = paths.length, items = this, group = false, i;
  for (i = 0; i < len; i++) {
    if (!items || items.length === 0) {
      break;
    }
    group = items.get(paths[i]);
    if (group) {
      items = group.getGroups();
    }
  }
  return group || false;
}, getGroupsByItem:function(item) {
  var me = this, groups = [], length = me.items.length, i, group, children;
  if (item) {
    for (i = 0; i < length; i++) {
      group = me.items[i];
      if (group.indexOf(item) >= 0) {
        groups.push(group);
        children = group.getGroups();
        if (children) {
          return Ext.Array.insert(groups, groups.length, children.getGroupsByItem(item));
        }
      }
    }
  }
  return groups;
}, updateGrouper:Ext.emptyFn, updateAutoGroup:function(autoGroup) {
  var len = this.length, i;
  this.setAutoSort(autoGroup);
  for (i = 0; i < len; i++) {
    this.items[i].setAutoGroup(autoGroup);
  }
  this.onEndUpdateSorters(this._sorters);
}, privates:{destroyGroups:function(groups) {
  var len = groups.length, i;
  for (i = 0; i < len; ++i) {
    groups[i].destroy();
  }
}, onGroupRemove:function(collection, info) {
  var me = this, groups = info.items, emptyGroups = me.emptyGroups, len, group, i;
  groups = Ext.Array.from(groups);
  for (i = 0, len = groups.length; i < len; i++) {
    group = groups[i];
    group.ejectTime = Ext.now();
    group.setSorters(null);
    group.setParent(null);
    emptyGroups[group.getGroupKey()] = group;
  }
  me.checkRemoveQueue();
}, checkRemoveQueue:function() {
  var me = this, emptyGroups = me.emptyGroups, groupKey, group, reschedule;
  for (groupKey in emptyGroups) {
    group = emptyGroups[groupKey];
    if (!group.getCount() && Ext.now() - group.ejectTime > me.emptyGroupRetainTime) {
      Ext.destroy(group);
      delete emptyGroups[groupKey];
    } else {
      reschedule = true;
    }
  }
  if (reschedule) {
    clearTimeout(me.checkRemoveQueueTimer);
    me.checkRemoveQueueTimer = Ext.defer(me.checkRemoveQueue, me.emptyGroupRetainTime, me);
  }
}}});
Ext.define('Ext.data.SummaryModel', {extend:'Ext.data.Model', isSummaryModel:true, fields:[{name:'id', type:'auto'}], inheritableStatics:{setSummary:function(name, summary) {
  var field = this.getField(name);
  if (!field) {
    this.addFields([{name:name, type:'auto', summary:summary, doneSummary:summary && summary.isAggregator}]);
  } else {
    if (field.doneSummary && summary && summary.isAggregator) {
      field.summary = summary;
    } else {
      field.summary = summary;
      field.doneSummary = false;
    }
  }
}}, calculateSummary:function(records) {
  var fields = this.getFields(), len = fields.length, recLen = records.length, i, result, summary, prop, name, field;
  for (i = 0; i < len; ++i) {
    field = fields[i];
    summary = field.getSummary();
    result = result || {};
    name = field.name;
    prop = field.summaryField || name;
    if (name !== 'id') {
      result[name] = summary ? summary.calculate(records, prop, 'data', 0, recLen) : null;
    }
  }
  if (result) {
    this.set(result, this._commitOptions);
  }
}, fixRemoteSummary:function() {
  var fields = this.getFields(), len = fields.length, i, result, summary, prop, name, field;
  for (i = 0; i < len; ++i) {
    field = fields[i];
    summary = field.getSummary();
    result = result || {};
    name = field.name;
    prop = field.summaryField || name;
    if (name !== 'id' && !summary) {
      result[name] = null;
    }
  }
  if (result) {
    this.set(result, this._commitOptions);
  }
}});
Ext.define('Ext.data.Group', {extend:'Ext.util.Group', requires:['Ext.data.SummaryModel'], isCollapsed:false, updateParent:function(parent, oldParent) {
  if (!this.isCollapsed && parent && parent.isGroup) {
    this.isCollapsed = parent.isCollapsed;
  }
  this.callParent([parent, oldParent]);
}, expand:function(includeChildren) {
  this.doExpandCollapse(true, includeChildren);
}, collapse:function(includeChildren) {
  this.doExpandCollapse(false, includeChildren);
}, doExpandCollapse:function(expanded, includeChildren) {
  var groups = this.getGroups(), len, i;
  this.isCollapsed = !expanded;
  if (includeChildren && groups) {
    len = groups.length;
    for (i = 0; i < len; i++) {
      groups.items[i].doExpandCollapse(expanded, includeChildren);
    }
  }
}, toggleCollapsed:function() {
  this.doExpandCollapse(this.isCollapsed);
}, getGroupRecord:function() {
  var record = this.getNewSummaryRecord('groupRecord', true);
  record.isGroup = true;
  return record;
}, getSummaryRecord:function() {
  var record = this.getNewSummaryRecord('summaryRecord', true);
  record.isSummary = true;
  return record;
}, getNewSummaryRecord:function(property, calculate) {
  var me = this, summaryRecord = me[property], store = me.store, generation = store.getData().generation, M, T;
  if (!summaryRecord) {
    M = store.getModel();
    T = M.getSummaryModel();
    me[property] = summaryRecord = new T;
    summaryRecord.set('id', M.identifier.generate());
    summaryRecord.group = me;
    summaryRecord.commit();
  }
  if (!store.getRemoteSummary() && !summaryRecord.isRemote && summaryRecord.summaryGeneration !== generation && calculate === true) {
    summaryRecord.calculateSummary(me.items);
    summaryRecord.summaryGeneration = generation;
  } else {
    if (store.getRemoteSummary() && summaryRecord.isRemote) {
      summaryRecord.fixRemoteSummary();
    }
  }
  summaryRecord.isNonData = true;
  return summaryRecord;
}, recalculateSummaries:function() {
  var items = this.items;
  this.getGroupRecord().calculateSummary(items);
  this.getSummaryRecord().calculateSummary(items);
}});
Ext.define('Ext.overrides.data.LocalStore', {override:'Ext.data.Store', requires:['Ext.data.Group'], getSummaryRecord:function() {
  var me = this, summaryRecord = me.summaryRecord, data = me.getData(), generation = data.generation, M, T;
  if (!summaryRecord) {
    M = me.getModel();
    T = M.getSummaryModel();
    me.summaryRecord = summaryRecord = new T;
    summaryRecord.set('id', M.identifier.generate());
    summaryRecord.commit();
    summaryRecord.isNonData = true;
  }
  if (!summaryRecord.isRemote && summaryRecord.summaryGeneration !== generation) {
    summaryRecord.calculateSummary(data.items);
    summaryRecord.summaryGeneration = generation;
  }
  return summaryRecord;
}, onCollectionGroup:function() {
  this.onGrouperEndUpdate();
}, constructDataCollection:function() {
  var result = new Ext.util.Collection({rootProperty:'data', groupConfig:{xclass:'Ext.data.Group', store:this}});
  result.addObserver(this);
  return result;
}});
Ext.define('Ext.overrides.data.Store', {override:'Ext.data.Store', requires:['Ext.overrides.data.LocalStore'], onProxyLoad:function(operation) {
  var me = this, resultSet = operation.getResultSet(), records = operation.getRecords(), successful = operation.wasSuccessful();
  if (me.destroyed) {
    return;
  }
  if (resultSet) {
    me.totalCount = resultSet.getTotal();
  }
  if (successful) {
    records = me.processAssociation(records);
    me.loadRecords(records, operation.getAddRecords() ? {addRecords:true} : undefined);
    me.attachSummaryRecord(resultSet);
  } else {
    me.loading = false;
  }
  if (me.hasListeners.load) {
    me.fireEvent('load', me, records, successful, operation);
  }
  me.callObservers('AfterLoad', [records, successful, operation]);
}, onProxyWrite:function(operation) {
  if (operation.wasSuccessful()) {
    this.attachSummaryRecord(operation.getResultSet());
  }
  this.callParent([operation]);
}, privates:{onRemoteSortSet:function(sorters, remoteSort) {
  var data = this.getData();
  if (sorters) {
    data.setSorters(remoteSort ? null : sorters);
  }
  this.callSuper([sorters, remoteSort]);
}, commitOptions:{commit:true}, attachSummaryRecord:function(resultSet) {
  if (!resultSet) {
    return;
  }
  var me = this, summary = resultSet.getSummaryData(), groupers = me.getGroupers(), current = me.summaryRecord, commitOptions = me.commitOptions, changed = false, groups, len, i, rec, group, children, child;
  if (summary) {
    changed = true;
    if (current) {
      current.data = {};
      current.set(summary.data, commitOptions);
    } else {
      me.summaryRecord = summary;
      summary.isRemote = true;
    }
  }
  if (groupers && groupers.length) {
    changed = true;
    summary = resultSet.getGroupData();
    if (summary) {
      groups = me.getGroups();
      for (i = 0, len = summary.length; i < len; ++i) {
        rec = summary[i];
        group = groups.getItemGroup(rec);
        if (group) {
          children = group.getGroups();
          while (children) {
            child = children.getItemGroup(rec);
            if (child) {
              group = child;
              children = group.getGroups();
            } else {
              children = null;
            }
          }
          delete rec.data.id;
          current = group.getGroupRecord();
          current.set(rec.data, commitOptions);
          current.isRemote = true;
          current = group.getSummaryRecord();
          current.set(rec.data, commitOptions);
          current.isRemote = true;
        }
      }
    }
  }
  if (changed) {
    if (me.hasListeners.remotesummarieschanged) {
      me.fireEvent('remotesummarieschanged', me);
    }
  }
}, setLoadOptions:function(options) {
  var me = this, pageSize = me.getPageSize(), summaries = [], groupers = me.getGroupers(false), session, model, fields, field, len, i;
  if ((me.getRemoteSort() || me.getRemoteSummary()) && !options.groupers) {
    if (groupers && groupers.getCount()) {
      options.groupers = groupers.getRange();
    }
  }
  if (me.getRemoteSummary()) {
    model = me.getModel().getSummaryModel();
    fields = model.getFields();
    len = fields.length;
    for (i = 0; i < len; i++) {
      field = fields[i];
      if (groupers && !groupers.get(field.name)) {
        summaries.push(field);
      }
    }
    options.summaries = summaries;
  }
  if (pageSize || 'start' in options || 'limit' in options || 'page' in options) {
    options.page = options.page != null ? options.page : me.currentPage;
    options.start = options.start !== undefined ? options.start : (options.page - 1) * pageSize;
    options.limit = options.limit != null ? options.limit : pageSize;
    me.currentPage = options.page;
  }
  options.addRecords = options.addRecords || false;
  if (!options.recordCreator) {
    session = me.getSession();
    if (session) {
      options.recordCreator = session.recordCreator;
    }
  }
  me.callSuper([options]);
}}});
Ext.define('Ext.overrides.dd.DragSource', {override:'Ext.dd.DragSource', onDragOut:function(e, id) {
  var target = Ext.dd.DragDropManager.getDDById(id);
  if (this.beforeDragOut(target, e, id) !== false) {
    if (target.isNotifyTarget) {
      target.notifyOut(this, e, this.dragData);
    }
    this.proxy.reset();
    if (this.afterDragOut) {
      this.afterDragOut(target, e, id);
    }
  }
  this.cachedTarget = null;
}});
Ext.define('Ext.overrides.view.AbstractView', {override:'Ext.view.AbstractView', onViewScrollEnd:function(scroller, x, y) {
  if (this.destroyed) {
    return;
  }
  this.callParent([scroller, x, y]);
}});
Ext.define('Ext.overrides.grid.CellContext', {override:'Ext.grid.CellContext', setRow:function(row) {
  var me = this, dataSource = me.view.dataSource, oldRecord = me.record, count;
  if (row !== undefined) {
    if (typeof row === 'number') {
      count = dataSource.getCount();
      row = row < 0 ? Math.max(count + row, 0) : Math.max(Math.min(row, count - 1), 0);
      me.rowIdx = row;
      me.record = dataSource.getAt(row);
    } else {
      if (row.isModel) {
        me.record = row;
        me.rowIdx = dataSource.indexOf(row);
        if (me.rowIdx === -1 && dataSource.isMultigroupStore && dataSource.isInCollapsedGroup(row)) {
          dataSource.expandToRecord(row);
          me.rowIdx = dataSource.indexOf(row);
        }
      } else {
        if (row.tagName || row.isElement) {
          me.record = me.view.getRecord(row);
          me.rowIdx = me.record ? me.record.isCollapsedPlaceholder ? dataSource.indexOfPlaceholder(me.record) : dataSource.indexOf(me.record) : -1;
        }
      }
    }
  }
  if (me.record !== oldRecord) {
    me.generation++;
  }
  return me;
}});
Ext.define('Ext.overrides.panel.Table', {override:'Ext.panel.Table', privates:{doEnsureVisible:function(record, options) {
  if (this.lockable) {
    return this.ensureLockedVisible(record, options);
  }
  if (typeof record !== 'number' && !record.isEntity) {
    record = this.store.getById(record);
  }
  var me = this, view = me.getView(), domNode = view.getNode(record), callback, scope, animate, highlight, select, doFocus, scrollable, column, cell;
  if (options) {
    callback = options.callback;
    scope = options.scope;
    animate = options.animate;
    highlight = options.highlight;
    select = options.select;
    doFocus = options.focus;
    column = options.column;
  }
  if (me.deferredEnsureVisible) {
    me.deferredEnsureVisible.destroy();
  }
  if (!view.componentLayoutCounter) {
    me.deferredEnsureVisible = view.on({resize:me.doEnsureVisible, args:Ext.Array.slice(arguments), scope:me, single:true, destroyable:true});
    return;
  }
  if (typeof column === 'number') {
    column = me.ownerGrid.getVisibleColumnManager().getColumns()[column];
  }
  if (domNode) {
    scrollable = view.getScrollable();
    if (column) {
      cell = Ext.fly(domNode).selectNode(column.getCellSelector());
    }
    if (scrollable) {
      scrollable.scrollIntoView(cell || domNode, !!column, animate, highlight);
    }
    if (!record.isEntity) {
      record = view.getRecord(domNode);
    }
    if (select) {
      view.getSelectionModel().select(record);
    }
    if (doFocus) {
      view.getNavigationModel().setPosition(record, column);
    }
    Ext.callback(callback, scope || me, [true, record, domNode]);
  } else {
    if (view.bufferedRenderer) {
      view.bufferedRenderer.scrollTo(record, {animate:animate, highlight:highlight, select:select, focus:doFocus, column:column, callback:function(recordIdx, record, domNode) {
        Ext.callback(callback, scope || me, [true, record, domNode]);
      }});
    } else {
      Ext.callback(callback, scope || me, [false, null]);
    }
  }
}}});
Ext.define('Ext.overrides.grid.NavigationModel', {override:'Ext.grid.NavigationModel', getRowsVisible:function() {
  var rowsVisible = false, view = this.view, firstRow = view.all.first(), rowHeight, gridViewHeight;
  if (firstRow) {
    rowHeight = firstRow.getHeight();
    if (view.bufferedRenderer) {
      gridViewHeight = view.bufferedRenderer.viewClientHeight;
    } else {
      gridViewHeight = view.el.getHeight();
    }
    rowsVisible = Math.floor(gridViewHeight / rowHeight);
  }
  return rowsVisible;
}, onKeyPageDown:function(keyEvent) {
  var me = this, view = keyEvent.view, rowsVisible = me.getRowsVisible(), newIdx, newRecord;
  if (rowsVisible) {
    if (view.bufferedRenderer) {
      newIdx = Math.min(keyEvent.recordIndex + rowsVisible, view.dataSource.getCount() - 1);
      me.lastKeyEvent = keyEvent;
      view.bufferedRenderer.scrollTo(view.dataSource.getAt(newIdx), false, me.afterBufferedScrollTo, me);
    } else {
      newRecord = view.walkRecs(keyEvent.record, rowsVisible);
      me.setPosition(newRecord, null, keyEvent);
    }
  }
}, onKeyPageUp:function(keyEvent) {
  var me = this, view = keyEvent.view, rowsVisible = me.getRowsVisible(), newIdx, newRecord;
  if (rowsVisible) {
    if (view.bufferedRenderer) {
      newIdx = Math.max(keyEvent.recordIndex - rowsVisible, 0);
      me.lastKeyEvent = keyEvent;
      view.bufferedRenderer.scrollTo(view.dataSource.getAt(newIdx), false, me.afterBufferedScrollTo, me);
    } else {
      newRecord = view.walkRecs(keyEvent.record, -rowsVisible);
      me.setPosition(newRecord, null, keyEvent);
    }
  }
}, onKeyEnd:function(keyEvent) {
  var me = this, view = keyEvent.view;
  if (keyEvent.altKey) {
    if (view.bufferedRenderer) {
      me.lastKeyEvent = keyEvent;
      view.bufferedRenderer.scrollTo(view.dataSource.last(), false, me.afterBufferedScrollTo, me);
    } else {
      me.setPosition(view.walkRecs(keyEvent.record, view.dataSource.getCount() - 1 - view.dataSource.indexOf(keyEvent.record)), null, keyEvent);
    }
  } else {
    me.setPosition(keyEvent.record, keyEvent.view.getVisibleColumnManager().getColumns().length - 1, keyEvent);
  }
}});
Ext.define('Ext.overrides.grid.header.DropZone', {override:'Ext.grid.header.DropZone', positionIndicator:function(data, node, e) {
  var dropLocation = this.getLocation(e, node), targetHeader = dropLocation.header, pos = dropLocation.pos, nextHd;
  nextHd = targetHeader.nextSibling('gridcolumn:not([hidden])');
  if (targetHeader.isGroupsColumn && pos === 'before' || nextHd && nextHd.isGroupsColumn && pos === 'after') {
    return false;
  }
  return this.callParent([data, node, e]);
}});
Ext.define('Ext.overrides.grid.column.Column', {override:'Ext.grid.column.Column', config:{groupFormatter:false, summaries:{$value:{count:true}, lazy:true, merge:function(newValue, oldValue) {
  return this.mergeSets(newValue, oldValue);
}}}, groupable:false, onSummaryChange:null, getListOfSummaries:function() {
  var ret = [], v = this.getSummaries() || {}, keys = Ext.Object.getAllKeys(v), len = keys.length, i, key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    if (v[key]) {
      ret.push(key);
    }
  }
  return ret;
}, applySummaries:function(newValue, oldValue) {
  var config = this.self.getConfigurator().configs.summaries;
  return config.mergeSets(newValue);
}});
Ext.define('Ext.overrides.grid.column.Date', {override:'Ext.grid.column.Date', config:{summaries:{min:true, max:true}}});
Ext.define('Ext.overrides.grid.column.Number', {override:'Ext.grid.column.Number', config:{summaries:{sum:true, min:true, max:true, average:true, variance:true, variancep:true, stddev:true, stddevp:true}}});
Ext.define('Ext.overrides.grid.column.RowNumberer', {override:'Ext.grid.column.RowNumberer', defaultRenderer:function(value, metaData, record, rowIdx, colIdx, dataSource, view) {
  var me = this, rowspan = me.rowspan, page = dataSource.currentPage, result = record ? dataSource.indexOf(record) : value - 1;
  if (metaData && rowspan) {
    metaData.tdAttr = 'rowspan\x3d"' + rowspan + '"';
  }
  if (page > 1) {
    result += (page - 1) * dataSource.pageSize;
  }
  return result + 1;
}});
Ext.define('Ext.overrides.grid.plugin.BufferedRenderer', {override:'Ext.grid.plugin.BufferedRenderer', scrollTo:function(recordIdx, options) {
  var args = arguments, me = this, view = me.view, lockingPartner = view.lockingPartner && view.lockingPartner.grid.isVisible() && view.lockingPartner.bufferedRenderer, store = me.store, total = store.getCount(), startIdx, endIdx, targetRow, tableTop, groupingFeature, metaGroup, record, direction;
  if (options !== undefined && !(options instanceof Object)) {
    options = {select:args[1], callback:args[2], scope:args[3]};
  }
  if (view.dataSource.isMultigroupStore) {
    if (recordIdx.isEntity) {
      record = recordIdx;
    } else {
      record = view.store.getAt(Math.min(Math.max(recordIdx, 0), view.store.getCount() - 1));
    }
    if (!view.dataSource.isExpandingOrCollapsing && view.dataSource.isInCollapsedGroup(record)) {
      view.dataSource.expandToRecord(record);
    }
    recordIdx = view.dataSource.indexOf(record);
  } else {
    if (recordIdx.isEntity) {
      record = recordIdx;
      recordIdx = store.indexOf(record);
      if (recordIdx === -1) {
        Ext.raise('Unknown record passed to BufferedRenderer#scrollTo');
        return;
      }
    } else {
      recordIdx = Math.min(Math.max(recordIdx, 0), total - 1);
      record = store.getAt(recordIdx);
    }
  }
  if (record && (targetRow = view.getNode(record))) {
    view.grid.ensureVisible(record, options);
    me.onViewScroll();
    me.onViewScrollEnd();
    return;
  }
  if (recordIdx < view.all.startIndex) {
    direction = -1;
    startIdx = Math.max(Math.min(recordIdx - Math.floor((me.leadingBufferZone + me.trailingBufferZone) / 2), total - me.viewSize + 1), 0);
    endIdx = Math.min(startIdx + me.viewSize - 1, total - 1);
  } else {
    direction = 1;
    endIdx = Math.min(recordIdx + Math.floor((me.leadingBufferZone + me.trailingBufferZone) / 2), total - 1);
    startIdx = Math.max(endIdx - (me.viewSize - 1), 0);
  }
  tableTop = Math.max(startIdx * me.rowHeight, 0);
  store.getRange(startIdx, endIdx, {callback:function(range, start, end) {
    me.renderRange(start, end, true, true);
    record = store.data.getRange(recordIdx, recordIdx + 1)[0];
    targetRow = view.getNode(record);
    view.body.translate(null, me.bodyTop = tableTop);
    if (direction === 1) {
      me.refreshSize();
    }
    if (lockingPartner) {
      lockingPartner.renderRange(start, end, true, true);
      me.syncRowHeights();
      lockingPartner.view.body.translate(null, lockingPartner.bodyTop = tableTop);
      if (direction === 1) {
        lockingPartner.refreshSize();
      }
    }
    if (!targetRow) {
      return;
    }
    view.grid.ensureVisible(record, options);
    me.scrollTop = me.position = me.scroller.getPosition().y;
    if (lockingPartner) {
      lockingPartner.position = lockingPartner.scrollTop = me.scrollTop;
    }
  }});
}});
Ext.define('Ext.overrides.grid.plugin.Editing', {override:'Ext.grid.plugin.Editing', getEditingContext:function(record, columnHeader, horizontalScroll) {
  var context = this.callParent([record, columnHeader, horizontalScroll]);
  if (context && context.record && context.record.isNonData) {
    return;
  }
  return context;
}});
Ext.define('Ext.overrides.grid.plugin.CellEditing', {override:'Ext.grid.plugin.CellEditing', onEditComplete:function(ed, value, startValue) {
  var me = this, context = ed.context, view, record;
  view = context.view;
  record = context.record;
  context.value = value;
  if (!record.isEqual(value, startValue)) {
    record.set(context.column.dataIndex, value);
    context.rowIdx = view.indexOf(record);
    if (context.rowIdx < 0 && view.dataSource.isMultigroupStore && view.dataSource.isInCollapsedGroup(record)) {
      view.dataSource.expandToRecord(record);
      context.rowIdx = view.indexOf(record);
    }
  }
  if (me.context === context) {
    me.setActiveEditor(null);
    me.setActiveColumn(null);
    me.setActiveRecord(null);
    me.editing = false;
  }
  me.fireEvent('edit', me, context);
}});
Ext.define('Ext.overrides.grid.plugin.RowExpander', {override:'Ext.grid.plugin.RowExpander', toggleRow:function(rowIdx, record) {
  if (record.isNonData) {
    return;
  }
  this.callParent([rowIdx, record]);
}, getHeaderConfig:function() {
  var me = this, lockable = me.grid.lockable && me.grid;
  return {width:me.headerWidth, ignoreExport:true, lockable:false, autoLock:true, sortable:false, resizable:false, draggable:false, hideable:false, menuDisabled:true, tdCls:Ext.baseCSSPrefix + 'grid-cell-special', innerCls:Ext.baseCSSPrefix + 'grid-cell-inner-row-expander', renderer:function(value, metaData, record) {
    var cls = Ext.baseCSSPrefix + (record.isNonData ? 'grid-row-non-expander' : 'grid-row-expander');
    return '\x3cdiv class\x3d"' + cls + '" role\x3d"presentation" tabIndex\x3d"0"\x3e\x3c/div\x3e';
  }, processEvent:function(type, view, cell, rowIndex, cellIndex, e, record) {
    var isTouch = e.pointerType === 'touch', isExpanderClick = !!e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-expander');
    if (record && record.isNonData) {
      return;
    }
    if (type === 'click' && isExpanderClick || type === 'keydown' && e.getKey() === e.SPACE) {
      if (isTouch) {
        cell.focus();
      }
      me.toggleRow(rowIndex, record, e);
      e.stopSelection = !me.selectRowOnExpand;
    } else {
      if (e.type === 'mousedown' && !isTouch && isExpanderClick) {
        e.preventDefault();
      }
    }
  }, isLocked:function() {
    return lockable && (lockable.lockedGrid.isVisible() || this.locked);
  }, editRenderer:function() {
    return '\x26#160;';
  }};
}});
Ext.define('Ext.overrides.grid.selection.SpreadsheetModel', {override:'Ext.grid.selection.SpreadsheetModel', privates:{onMouseMove:function(e, target, opts) {
  var me = this, view = opts.view, record, rowIdx, cell = e.getTarget(view.cellSelector), header = opts.view.getHeaderByCell(cell), selData = me.selected, pos, recChange, colChange;
  if (me.checkCellClicked) {
    if (cell === me.checkCellClicked) {
      if (!me.lastOverRecord) {
        me.lastOverRecord = view.getRecord(cell.parentNode);
      }
      return;
    } else {
      me.checkCellClicked = null;
      if (me.lastOverRecord) {
        me.select(me.lastOverRecord);
        selData.setRangeStart(view.dataSource.indexOf(me.lastOverRecord));
      }
    }
  }
  if (me.extensible) {
    me.extensible.disable();
  }
  if (header) {
    record = view.getRecord(cell.parentNode);
    rowIdx = view.dataSource.indexOf(record);
    recChange = record !== me.lastOverRecord;
    colChange = header !== me.lastOverColumn;
    if (recChange || colChange) {
      pos = me.getCellContext(record, header);
    }
    if (selData.isRows) {
      if (recChange) {
        if (me.lastOverRecord) {
          selData.setRangeEnd(rowIdx);
        } else {
          selData.setRangeStart(rowIdx);
        }
      }
    } else {
      if (selData.isCells) {
        if (recChange || colChange) {
          if (me.lastOverRecord) {
            selData.setRangeEnd(pos);
          } else {
            selData.setRangeStart(pos);
          }
        }
      } else {
        if (selData.isColumns) {
          if (colChange) {
            if (me.lastOverColumn) {
              selData.setRangeEnd(pos.column);
            } else {
              selData.setRangeStart(pos.column);
            }
          }
        }
      }
    }
    if (recChange || colChange) {
      view.getNavigationModel().setPosition((new Ext.grid.CellContext(header.getView())).setPosition(record, header));
    }
    me.lastOverColumn = header;
    me.lastOverRecord = record;
  }
}}});
Ext.define('Ext.data.summary.Base', {mixins:['Ext.mixin.Factoryable'], alias:'data.summary.base', isAggregator:true, factoryConfig:{defaultType:'base', cacheable:true}, constructor:function(config) {
  var calculate = config && config.calculate;
  if (calculate) {
    config = Ext.apply({}, config);
    delete config.calculate;
    this.calculate = calculate;
  }
  this.initConfig(config);
}, extractValue:function(record, property, root) {
  var ret;
  if (record) {
    if (root) {
      record = record[root];
    }
    ret = record[property];
  }
  return ret;
}});
Ext.define('Ext.overrides.data.summary.Base', {override:'Ext.data.summary.Base', text:'Custom'});
Ext.define('Ext.data.summary.Sum', {extend:'Ext.data.summary.Base', alias:'data.summary.sum', calculate:function(records, property, root, begin, end) {
  var n = end - begin, i, sum, v;
  for (i = 0; i < n; ++i) {
    v = this.extractValue(records[begin + i], property, root);
    sum = i ? sum + v : v;
  }
  return sum;
}});
Ext.define('Ext.overrides.data.summary.Sum', {override:'Ext.data.summary.Sum', text:'Sum'});
Ext.define('Ext.data.summary.Average', {extend:'Ext.data.summary.Sum', alias:'data.summary.average', calculate:function(records, property, root, begin, end) {
  var len = end - begin, value;
  if (len > 0) {
    value = this.callParent([records, property, root, begin, end]) / len;
  }
  return value;
}});
Ext.define('Ext.overrides.data.summary.Average', {override:'Ext.data.summary.Average', text:'Average'});
Ext.define('Ext.data.summary.Count', {extend:'Ext.data.summary.Base', alias:'data.summary.count', calculate:function(records, property, root, begin, end) {
  return end - begin;
}});
Ext.define('Ext.overrides.data.summary.Count', {override:'Ext.data.summary.Count', text:'Count'});
Ext.define('Ext.data.summary.Max', {extend:'Ext.data.summary.Base', alias:'data.summary.max', calculate:function(records, property, root, begin, end) {
  var max = this.extractValue(records[begin], property, root), i, v;
  for (i = begin; i < end; ++i) {
    v = this.extractValue(records[i], property, root);
    if (v > max) {
      max = v;
    }
  }
  return max;
}});
Ext.define('Ext.overrides.data.summary.Max', {override:'Ext.data.summary.Max', text:'Max'});
Ext.define('Ext.data.summary.Min', {extend:'Ext.data.summary.Base', alias:'data.summary.min', calculate:function(records, property, root, begin, end) {
  var min = this.extractValue(records[begin], property, root), i, v;
  for (i = begin; i < end; ++i) {
    v = this.extractValue(records[i], property, root);
    if (v < min) {
      min = v;
    }
  }
  return min;
}});
Ext.define('Ext.overrides.data.summary.Min', {override:'Ext.data.summary.Min', text:'Min'});
Ext.define('Ext.data.summary.Variance', {extend:'Ext.data.summary.Base', requires:['Ext.data.summary.Average'], alias:'data.summary.variance', text:'Var', constructor:function(config) {
  this.callParent([config]);
  this.avg = Ext.Factory.dataSummary('average');
}, calculate:function(records, property, root, begin, end) {
  var n = end - begin, avg = this.avg.calculate(records, property, root, begin, end), total = 0, i, v;
  if (avg > 0) {
    for (i = 0; i < n; ++i) {
      v = this.extractValue(records[begin + i], property, root);
      total += Math.pow(Ext.Number.from(v, 0) - avg, 2);
    }
  }
  return total > 0 && n > 1 ? total / (n - 1) : null;
}});
Ext.define('Ext.data.summary.StdDev', {extend:'Ext.data.summary.Variance', alias:'data.summary.stddev', text:'StdDev', calculate:function(records, property, root, begin, end) {
  var v = this.callParent([records, property, root, begin, end]);
  return v > 0 ? Math.sqrt(v) : null;
}});
Ext.define('Ext.data.summary.VarianceP', {extend:'Ext.data.summary.Variance', alias:'data.summary.variancep', text:'VarP', calculate:function(records, property, root, begin, end) {
  var n = end - begin, avg = this.avg.calculate(records, property, root, begin, end), total = 0, i, v;
  if (avg > 0) {
    for (i = 0; i < n; ++i) {
      v = this.extractValue(records[begin + i], property, root);
      total += Math.pow(Ext.Number.from(v, 0) - avg, 2);
    }
  }
  return total > 0 && n > 0 ? total / n : null;
}});
Ext.define('Ext.data.summary.StdDevP', {extend:'Ext.data.summary.VarianceP', alias:'data.summary.stddevp', text:'StdDevP', calculate:function(records, property, root, begin, end) {
  var v = this.callParent([records, property, root, begin, end]);
  return v > 0 ? Math.sqrt(v) : null;
}});
Ext.define('Ext.grid.column.Groups', {extend:'Ext.grid.column.Column', alias:'widget.groupscolumn', isGroupsColumn:true, text:'Groups', width:200, draggable:false, autoLock:true, lockable:false, producesHTML:false, ignoreExport:true, hideable:false, dataIndex:'', groupable:false, groupHeaderTpl:'{columnName}: {name}', groupSummaryTpl:'Summary ({name})', summaryTpl:'Summary', collapsibleCls:Ext.baseCSSPrefix + 'grid-group-hd-collapsible', hdNotCollapsibleCls:Ext.baseCSSPrefix + 'grid-group-hd-not-collapsible', 
collapsedCls:Ext.baseCSSPrefix + 'grid-group-hd-collapsed', groupCls:Ext.baseCSSPrefix + 'grid-group-hd', recordCls:Ext.baseCSSPrefix + 'grid-group-record', groupTitleCls:Ext.baseCSSPrefix + 'grid-group-title', depthToIndent:25, constructor:function(config) {
  var me = this;
  me.width = me.width;
  me.callParent([config]);
  me.sortable = false;
  me.groupable = false;
  me.scope = me;
}, defaultRenderer:function(value, metaData, record, rowIdx, colIdx, dataSource, view) {
  var me = this, ret = '\x26#160;', level = 0, attribute = '', data, tpl;
  metaData = metaData || {};
  if (dataSource.isMultigroupStore) {
    data = dataSource.renderData[record.getId()];
    if (data) {
      if (data.group) {
        level = data.group.getLevel();
      }
      if (data.isGroup) {
        level--;
        tpl = this.lookupTpl('groupHeaderTpl');
        attribute = ' data-groupName \x3d "' + Ext.htmlEncode(data.group.getLabel()) + '" ';
        metaData.tdCls = me.collapsibleCls;
        if (data.group.isCollapsed) {
          metaData.tdCls += ' ' + me.collapsedCls;
        }
      } else {
        if (data.isGroupSummary) {
          tpl = this.lookupTpl('groupSummaryTpl');
        } else {
          if (data.isSummary) {
            tpl = this.lookupTpl('summaryTpl');
          }
        }
      }
      if (tpl) {
        value = tpl.apply(data);
      }
      value = value || '\x26#160;';
      ret = '\x3cdiv ' + attribute + 'class\x3d"' + me.groupTitleCls + '"\x3e' + value + '\x3c/div\x3e';
      if (!data.isSummary) {
        metaData.innerCls = data.isGroup ? me.groupCls : me.recordCls;
        metaData.style = (dataSource.isRTL ? 'margin-right: ' : 'margin-left: ') + me.depthToIndent * level + 'px';
      }
    }
  }
  return ret;
}, updater:function(cell, value, record, view, dataSource) {
  var cellInner = cell && cell.querySelector(this.getView().innerSelector);
  if (cellInner) {
    cellInner.innerHTML = this.defaultRenderer(value, null, record, null, null, dataSource, view);
  }
}});
Ext.define('Ext.grid.feature.MultiGroupStore', {extend:'Ext.util.Observable', isStore:true, isMultigroupStore:true, defaultViewSize:100, isFeatureStore:true, constructor:function(config) {
  var me = this, store = config.store;
  delete config.store;
  me.callParent([config]);
  me.bindStore(store);
  if (!me.multigroupingFeature.grid.isLocked) {
    me.bindViewStoreListeners();
  }
}, destroy:function() {
  var me = this;
  Ext.destroy(me.storeListeners);
  me.store = me.storeListeners = me.multigroupingFeature = me.renderData = null;
  me.clearListeners();
  me.callParent(arguments);
}, bindStore:function(store) {
  var me = this;
  if (!store || me.store !== store) {
    me.store = Ext.destroy(me.storeListeners);
  }
  if (store) {
    me.storeListeners = store.on({datachanged:me.onDataChanged, groupchange:me.onGroupChange, idchanged:me.onIdChanged, update:me.onUpdate, remotesummarieschanged:me.onRemoteSummaries, summarieschanged:me.onSummariesChanged, scope:me, destroyable:true});
    me.store = store;
    me.processStore();
  }
}, bindViewStoreListeners:function() {
  var view = this.multigroupingFeature.view, listeners = view.getStoreListeners(this);
  listeners.scope = view;
  this.on(listeners);
}, processStore:function(forceStartCollapsed) {
  var me = this, data = me.data, position = me.multigroupingFeature.summaryPosition, items, placeholder, groups, length, i;
  if (data) {
    data.clear();
  } else {
    data = me.data = new Ext.util.Collection({rootProperty:'data', extraKeys:{byInternalId:{property:'internalId', rootProperty:''}}});
  }
  me.renderData = {};
  groups = me.store.getGroups();
  length = groups.length;
  if (length > 0) {
    if (forceStartCollapsed) {
      for (i = 0; i < length; i++) {
        groups.items[i].doExpandCollapse(!me.multigroupingFeature.startCollapsed, true);
      }
    } else {
      if (me.multigroupingFeature.startCollapsed) {
        for (i = 0; i < length; i++) {
          groups.items[i].collapse(true);
        }
      }
    }
    me.multigroupingFeature.startCollapsed = false;
    items = me.processGroups(groups.items);
  } else {
    items = me.store.getRange();
  }
  data.add(items);
  if (position === 'top' || position === 'bottom') {
    placeholder = me.store.getSummaryRecord();
    me.renderData[placeholder.getId()] = {isSummary:true};
    if (position === 'top') {
      data.insert(0, placeholder);
    } else {
      data.add(placeholder);
    }
  }
}, processGroups:function(groups) {
  var me = this, data = [], groupCount = groups ? groups.length : 0, addSummary = false, position = me.multigroupingFeature.groupSummaryPosition, i, j, group, key, groupPlaceholder, depth, children;
  if (groupCount <= 0) {
    return data;
  }
  for (i = 0; i < groupCount; i++) {
    group = groups[i];
    addSummary = false;
    key = group.getGroupKey();
    groupPlaceholder = group.getGroupRecord();
    data.push(groupPlaceholder);
    me.renderData[groupPlaceholder.getId()] = {group:group, depth:group.getLevel(), isGroup:true};
    if (!group.isCollapsed) {
      children = group.getGroups();
      if (children && children.length > 0) {
        Ext.Array.insert(data, data.length, me.processGroups(children.items));
      } else {
        Ext.Array.insert(data, data.length, group.items);
        for (j = 0; j < group.items.length; j++) {
          me.renderData[group.items[j].getId()] = {group:group, depth:group.getLevel()};
        }
      }
    }
    if (position === 'bottom') {
      addSummary = !group.isCollapsed;
      depth = group.getLevel();
    }
    if (addSummary) {
      groupPlaceholder = group.getSummaryRecord();
      data.push(groupPlaceholder);
      me.renderData[groupPlaceholder.getId()] = {group:group, depth:depth, isGroupSummary:true};
    }
  }
  return data;
}, onSummariesChanged:function() {
  var me = this, store = me.store;
  store.getSummaryRecord().calculateSummary(store.getData().items);
  me.updateSummaries(store.getGroups());
  me.fireEvent('refresh', me);
}, updateSummaries:function(groups) {
  var groupCount = groups ? groups.length : 0, i, group;
  for (i = 0; i < groupCount; i++) {
    group = groups.items[i];
    group.recalculateSummaries();
    this.updateSummaries(group.getGroups());
  }
}, isLoading:function() {
  return false;
}, getData:function() {
  return this.data;
}, getCount:function() {
  return this.data.getCount();
}, getTotalCount:function() {
  return this.data.getCount();
}, first:function() {
  return this.getData().first() || null;
}, last:function() {
  return this.getData().last() || null;
}, rangeCached:function(start, end) {
  return end < this.getCount();
}, getRange:function(start, end, options) {
  var result = this.data.getRange(start, Ext.isNumber(end) ? end + 1 : end);
  if (options && options.callback) {
    options.callback.call(options.scope || this, result, start, end, options);
  }
  return result;
}, getAt:function(index) {
  return this.data.getAt(index);
}, getById:function(id) {
  return this.store.getById(id);
}, getByInternalId:function(internalId) {
  return this.data.byInternalId.get(internalId) || null;
}, getRenderData:function(record) {
  return record && record.isModel ? this.renderData[record.getId()] : null;
}, toggleCollapsedByRecord:function(record) {
  var data = this.renderData[record.getId()];
  if (!data) {
    return;
  }
  return this.doExpandCollapse(data.group, data.group.isCollapsed);
}, doExpandCollapseByPath:function(path, expanded) {
  var group = this.store.getGroups().getByPath(path);
  if (!group) {
    return;
  }
  return this.doExpandCollapse(group, expanded);
}, doExpandCollapse:function(group, expanded) {
  var me = this, startIdx, items, oldItems, len;
  oldItems = me.processGroups([group]);
  group.doExpandCollapse(expanded);
  items = me.processGroups([group]);
  if (items.length && (startIdx = me.data.indexOf(group.getGroupRecord())) !== -1) {
    if (group.isCollapsed) {
      me.isExpandingOrCollapsing = 2;
      len = oldItems.length;
      oldItems = me.data.getRange(startIdx, startIdx + len);
      me.data.removeAt(startIdx, len);
      me.data.insert(startIdx, items);
      me.fireEvent('replace', me, startIdx, oldItems, items);
      me.fireEvent('groupcollapse', me, group);
    } else {
      me.isExpandingOrCollapsing = 1;
      me.data.removeAt(startIdx);
      me.data.insert(startIdx, items);
      me.fireEvent('replace', me, startIdx, oldItems, items);
      me.fireEvent('groupexpand', me, group);
    }
    me.isExpandingOrCollapsing = 0;
  }
  return items[0];
}, isInCollapsedGroup:function(record) {
  var expanded = true, groups = this.store.getGroups(), i, j, length, group;
  if (groups) {
    groups = groups.getGroupsByItem(record);
  }
  if (groups) {
    length = groups.length;
    for (i = 0; i < length; i++) {
      group = groups[i];
      expanded = expanded && !group.isCollapsed;
    }
  }
  return !expanded;
}, expandToRecord:function(record) {
  var groups = this.store.getGroups(), i, j, length, group;
  if (groups) {
    groups = groups.getGroupsByItem(record);
  }
  if (groups) {
    length = groups.length;
    for (i = 0; i < length; i++) {
      group = groups[i];
      if (group.isCollapsed) {
        for (j = i + 1; j < length; j++) {
          groups[j].isCollapsed = false;
        }
        this.doExpandCollapse(group, true);
        break;
      }
    }
  }
}, contains:function(record) {
  return this.indexOf(record) > -1;
}, indexOf:function(record) {
  return this.data.indexOf(record);
}, indexOfId:function(id) {
  return this.data.indexOfKey(id);
}, indexOfTotal:function(record) {
  return this.store.indexOf(record);
}, onUpdate:function(store, record, operation, modifiedFieldNames) {
  var groupers = this.store.getGroupers(), len = modifiedFieldNames.length, refresh = false, i, field;
  if (groupers) {
    for (i = 0; i < len; i++) {
      field = modifiedFieldNames[i];
      refresh = refresh || !!groupers.get(field);
    }
    if (refresh) {
      this.refreshData();
    }
  }
  if (!refresh) {
    this.fireEvent('update', this, record, operation, modifiedFieldNames);
  }
}, onDataChanged:function() {
  this.refreshData();
}, onIdChanged:function(store, rec, oldId, newId) {
  this.data.updateKey(rec, oldId);
}, onGroupChange:function(store, groupers) {
  if (!groupers || !groupers.length) {
    this.processStore();
  }
  this.fireEvent('groupchange', store, groupers);
}, refreshData:function(forceStartCollapsed) {
  this.processStore(forceStartCollapsed);
  this.fireEvent('refresh', this);
}, onRemoteSummaries:function() {
  this.fireEvent('refresh', this);
}});
Ext.define('Ext.grid.feature.MultiGrouping', {extend:'Ext.grid.feature.Feature', alias:'feature.multigrouping', requires:['Ext.grid.feature.MultiGroupStore', 'Ext.grid.column.Groups', 'Ext.overrides.grid.column.Column', 'Ext.overrides.grid.header.DropZone'], eventPrefix:'group', eventCls:Ext.baseCSSPrefix + 'grid-group-row', eventSelector:'.' + Ext.baseCSSPrefix + 'grid-group-row', groupSelector:'.' + Ext.baseCSSPrefix + 'grid-group-hd', groupSummaryCls:Ext.baseCSSPrefix + 'grid-group-summary', groupSummarySelector:'.' + 
Ext.baseCSSPrefix + 'grid-group-summary', expandAllText:'Expand all', collapseAllText:'Collapse all', groupsText:'Groups', groupByText:'Group by this field', addToGroupingText:'Add to grouping', removeFromGroupingText:'Remove from grouping', startGroupedHeadersHidden:true, startCollapsed:false, enableGroupingMenu:true, groupSummaryPosition:'hidden', summaryPosition:'hidden', groupsColumnWidth:200, groupHeaderTpl:'{name}', groupSummaryTpl:'Summary ({name})', summaryTpl:'Summary ({store.data.length})', 
outerTpl:['{%', 'var me \x3d this.groupingFeature;', 'if (!(me.disabled)) {', 'me.setup(values);', '}', 'this.nextTpl.applyOut(values, out, parent);', '%}', {priority:200}], rowTpl:['{%', 'var me \x3d this.groupingFeature;', 'if (!(me.disabled)) {', 'me.setupRowData(values);', '}', 'this.nextTpl.applyOut(values, out, parent);', 'if (!(me.disabled)) {', 'me.resetRenderers();', '}', '%}', {priority:10000}], init:function(grid) {
  var me = this, view = me.view, store = view.getStore(), ownerGrid = view.ownerGrid, lockPartner;
  me.callParent([grid]);
  if (store && store.isBufferedStore) {
    Ext.log('Buffered stores are not supported yet by multi level grouping feature');
    return;
  }
  view.addTpl(Ext.XTemplate.getTpl(me, 'outerTpl')).groupingFeature = me;
  view.addRowTpl(Ext.XTemplate.getTpl(me, 'rowTpl')).groupingFeature = me;
  view.preserveScrollOnRefresh = true;
  view.doGrouping = store.isGrouped();
  if (view.bufferedRenderer) {
    view.bufferedRenderer.variableRowHeight = view.hasVariableRowHeight() || view.doGrouping;
  }
  lockPartner = me.lockingPartner;
  if (lockPartner && lockPartner.dataSource) {
    me.dataSource = view.dataSource = lockPartner.dataSource;
  } else {
    me.dataSource = view.dataSource = new Ext.grid.feature.MultiGroupStore({multigroupingFeature:me, store:store});
    ownerGrid.expandAll = Ext.bind(me.expandAll, me);
    ownerGrid.collapseAll = Ext.bind(me.collapseAll, me);
    ownerGrid.setGroupSummaryPosition = Ext.bind(me.setGroupSummaryPosition, me);
    ownerGrid.setSummaryPosition = Ext.bind(me.setSummaryPosition, me);
  }
  me.initEventsListeners();
  if (me.enableGroupingMenu) {
    me.injectGroupingMenu();
  }
}, destroy:function() {
  var me = this, ownerGrid = me.view.ownerGrid;
  ownerGrid.setGroupSummaryPosition = ownerGrid.setSummaryPosition = null;
  ownerGrid.expandAll = ownerGrid.collapseAll = null;
  me.destroyEventsListeners();
  Ext.destroy(me.dataSource);
  me.callParent();
}, enable:function() {
  var me = this, view = me.view, store = view.getStore();
  view.doGrouping = false;
  if (view.lockingPartner) {
    view.lockingPartner.doGrouping = false;
  }
  me.callParent();
  if (me.lastGroupers) {
    store.group(me.lastGroupers);
    me.lastGroupers = null;
  }
}, disable:function() {
  var view = this.view, store = view.getStore(), lastGroupers = store.getGroupers();
  view.doGrouping = false;
  if (view.lockingPartner) {
    view.lockingPartner.doGrouping = false;
  }
  this.callParent();
  if (lastGroupers) {
    this.lastGroupers = lastGroupers.getRange();
    store.clearGrouping();
  }
}, setGroupSummaryPosition:function(value) {
  var lockingPartner = this.lockingPartner;
  this.groupSummaryPosition = value;
  if (lockingPartner) {
    lockingPartner.groupSummaryPosition = value;
  }
  this.dataSource.refreshData();
}, setSummaryPosition:function(value) {
  var lockingPartner = this.lockingPartner;
  this.summaryPosition = value;
  if (lockingPartner) {
    lockingPartner.summaryPosition = value;
  }
  this.dataSource.refreshData();
}, collapse:function(path, options) {
  this.doCollapseExpand(false, path, options);
}, expand:function(path, options) {
  this.doCollapseExpand(true, path, options);
}, expandAll:function() {
  var me = this, lockingPartner = me.lockingPartner;
  Ext.suspendLayouts();
  me.startCollapsed = false;
  if (lockingPartner) {
    lockingPartner.startCollapsed = false;
  }
  me.dataSource.refreshData(true);
  Ext.resumeLayouts(true);
}, collapseAll:function() {
  var me = this, lockingPartner = me.lockingPartner;
  Ext.suspendLayouts();
  me.startCollapsed = true;
  if (lockingPartner) {
    lockingPartner.startCollapsed = true;
  }
  me.dataSource.refreshData(true);
  Ext.resumeLayouts(true);
}, doCollapseExpand:function(expanded, path, options, fireArg) {
  var me = this, lockingPartner = me.lockingPartner, ownerGrid = me.view.ownerGrid, record;
  me.isExpandingCollapsing = true;
  record = me.dataSource.doExpandCollapseByPath(path, expanded);
  if (options === true) {
    options = {focus:true};
  }
  me.afterCollapseExpand(expanded, record, options);
  if (lockingPartner) {
    if (options && options.focus) {
      options = Ext.Object.chain(options);
      options.focus = false;
    }
    lockingPartner.afterCollapseExpand(expanded, record, options);
  }
  if (!fireArg) {
    fireArg = Ext.apply({record:record, column:me.getGroupingColumn(), row:me.view.getRowByRecord(record)}, me.dataSource.getRenderData(record));
  }
  ownerGrid.fireEvent(expanded ? 'groupexpand' : 'groupcollapse', ownerGrid, fireArg);
  me.isExpandingCollapsing = false;
}, afterCollapseExpand:function(expanded, record, options) {
  if (record && options) {
    this.grid.ensureVisible(record, options);
  }
}, vetoEvent:function(record, row, rowIndex, e) {
  var shouldVeto = false, key = e.getKey();
  if (!e.getTarget(this.groupSummarySelector) && e.getTarget(this.eventSelector)) {
    shouldVeto = key ? key === e.ENTER : e.type !== 'mouseover' && e.type !== 'mouseout' && e.type !== 'mouseenter' && e.type !== 'mouseleave';
  }
  if (shouldVeto) {
    return false;
  }
}, setup:function(values) {
  var me = this, view = values.view, store = view.store, model = store.model.getSummaryModel(), columns = view.headerCt.getGridColumns(), length = columns.length, column, i;
  me.doGrouping = !me.disabled && view.store.isGrouped();
  if (me.doGrouping) {
    me.dataSource.isRTL = me.isRTL();
  }
  for (i = 0; i < length; i++) {
    column = columns[i];
    if (column.summaryType && column.dataIndex && model) {
      model.setSummary(column.dataIndex, column.summaryType);
    }
  }
}, setupRowData:function(rowValues) {
  var me = this, record = rowValues.record, renderData, field, group, header;
  rowValues.recordIndex = me.dataSource.indexOf(record);
  renderData = me.dataSource.renderData[record.getId()];
  if (renderData) {
    if (renderData.isSummary) {
      renderData.store = me.view.getStore();
    } else {
      group = renderData.group;
      field = group.getGrouper().getProperty();
      header = me.getGroupedHeader(field);
      Ext.apply(renderData, {groupField:field, columnName:header ? header.text : field, name:group.getLabel()});
      renderData.column = me.getGroupedHeader();
      record.ownerGroup = renderData.name;
    }
    me.setupRowValues(rowValues, renderData);
    me.setRenderers(renderData);
  }
}, setupRowValues:function(rowValues, renderData) {
  rowValues.rowClasses.push(this.eventCls);
  if (renderData.isGroupSummary) {
    rowValues.rowClasses.push(this.groupSummaryCls);
  }
}, isRTL:function() {
  var grid = this.grid;
  if (Ext.isFunction(grid.isLocalRtl)) {
    return grid.isLocalRtl();
  }
  return false;
}, setRenderers:function(renderData) {
  var me = this, startIdx = me.getGroupingColumnPosition(), columns = me.view.headerCt.getGridColumns(), length = columns.length, position = me.groupSummaryPosition, column, group, i;
  if (me.renderersAreSet > 0) {
    return;
  }
  if (renderData.isSummary) {
    for (i = 0; i < startIdx - 1; i++) {
      column = columns[i];
      column.backupRenderer = column.renderer;
      column.renderer = column.summaryType || column.summaryRenderer ? column.summaryRenderer : Ext.renderEmpty;
    }
  }
  for (i = startIdx; i < length; i++) {
    column = columns[i];
    column.backupRenderer = column.renderer;
    if (renderData.isGroupSummary || renderData.isSummary) {
      column.renderer = column.summaryRenderer;
    } else {
      if (renderData.isGroup) {
        group = renderData.group;
        column.renderer = position === 'bottom' && !group.isCollapsed || position === 'hidden' ? this.renderEmpty : column.summaryRenderer;
      }
    }
  }
  me.renderersAreSet = (me.renderersAreSet || 0) + 1;
}, resetRenderers:function() {
  var me = this, columns = me.view.headerCt.getGridColumns(), length = columns.length, column, i;
  if (me.renderersAreSet > 0) {
    me.renderersAreSet--;
  }
  if (!me.renderersAreSet) {
    for (i = 0; i < length; i++) {
      column = columns[i];
      if (column.backupRenderer != null) {
        column.renderer = column.backupRenderer;
        column.backupRenderer = null;
      }
    }
  }
}, getHeaderNode:function(groupName) {
  var el = this.view.getEl(), nodes, i, len, node;
  if (el) {
    nodes = el.query('.' + Ext.baseCSSPrefix + 'grid-group-title');
    for (i = 0, len = nodes.length; i < len; ++i) {
      node = nodes[i];
      if (node.getAttribute('data-groupName') === groupName) {
        return node;
      }
    }
  }
}, isExpanded:function(groupName) {
  var groups = this.view.getStore().getGroups(), group = groups.getByPath(groupName);
  return group && !group.isCollapsed;
}, getGroupedHeader:function(groupField) {
  var me = this, headers = me.headers, headerCt = me.view.headerCt, partner = me.lockingPartner, selector, header;
  if (!headers) {
    me.headers = headers = {};
  }
  if (groupField) {
    header = headers[groupField];
    if (!header) {
      selector = '[dataIndex\x3d' + groupField + ']';
      header = headerCt.down(selector);
      if (!header && partner) {
        headers[groupField] = header = partner.view.headerCt.down(selector);
      }
    }
  }
  return header || null;
}, getGroupingColumnConfig:function(store) {
  var me = this, isGrouped = store ? store.isGrouped() : me.view.getStore().isGrouped();
  me.lastColumnWidth = me.groupsColumnWidth;
  return {xtype:'groupscolumn', groupHeaderTpl:me.groupHeaderTpl, groupSummaryTpl:me.groupSummaryTpl, summaryTpl:me.summaryTpl, editRenderer:me.renderEmpty, width:isGrouped ? me.lastColumnWidth : 1};
}, renderEmpty:function() {
  return ' ';
}, getGroupingColumn:function() {
  var me = this, result = me.groupingColumn, view = me.view, ownerGrid = view.ownerGrid;
  if (!result || result.destroyed) {
    if (!ownerGrid.lockable || view.isLockedView) {
      result = me.groupingColumn = view.headerCt.down('groupscolumn') || view.headerCt.add(me.getGroupingColumnPosition(), me.getGroupingColumnConfig());
    }
  }
  return result;
}, getGroupingColumnPosition:function() {
  var columns = this.view.headerCt.items.items, length = columns.length, pos = 0, i, column;
  for (i = 0; i < length; i++) {
    column = columns[i];
    if (!column.hideable && !column.draggable) {
      pos++;
    }
  }
  return pos;
}, onBeforeReconfigure:function(grid, store, columns, oldStore, oldColumns) {
  var me = this, view = me.view, dataSource = me.dataSource, ownerGrid = view.ownerGrid, column, bufferedStore;
  if (columns && (!ownerGrid.lockable || view.isLockedView)) {
    column = me.getGroupingColumnConfig(store && store !== oldStore ? store : null);
    column.locked = ownerGrid.lockable;
    Ext.Array.insert(columns, 0, [column]);
  }
  if (store && store !== oldStore) {
    Ext.destroy(me.storeListeners);
    me.setupStoreListeners(store);
    me.doGrouping = store.isGrouped();
    dataSource.bindStore(store);
  }
}, onAfterViewRendered:function(view) {
  var me = this, store = view.getStore(), groupers = store.getGroupers(), length = groupers.length, i, header, grouper;
  me.getGroupingColumn();
  if (me.startGroupedHeadersHidden) {
    for (i = 0; i < length; i++) {
      grouper = groupers.getAt(i).getProperty();
      header = me.getGroupedHeader(grouper);
      if (header) {
        if (header.rendered) {
          header.hide();
        } else {
          header.hidden = true;
        }
      }
    }
  }
}, injectGroupingMenu:function() {
  var me = this, headerCt = me.view.headerCt;
  headerCt.showMenuBy = Ext.Function.createInterceptor(headerCt.showMenuBy, me.showMenuBy);
  headerCt.getMenuItems = me.getMenuItems();
}, showMenuBy:function(clickEvent, t, header) {
  var me = this, menu = me.getMenu(), grid = me.view.ownerGrid, store = me.view.getStore(), groupers = store.getGroupers(), headerNotGroupable = header.groupable === false || !header.dataIndex, groupMenuMeth = headerNotGroupable ? 'disable' : 'enable', isGrouped = store.isGrouped(), grouper = groupers.get(header.dataIndex);
  menu.down('#groupByMenuItem')[groupMenuMeth]();
  menu.down('#groupsMenuItem').setVisible(isGrouped);
  menu.down('#addGroupMenuItem')[headerNotGroupable || grouper ? 'disable' : 'enable']();
  menu.down('#removeGroupMenuItem')[headerNotGroupable || !grouper ? 'disable' : 'enable']();
  grid.fireEvent('showheadermenuitems', grid, {grid:grid, column:header, menu:menu});
}, getMenuItems:function() {
  var me = this, grid = me.view.ownerGrid, getMenuItems = me.view.headerCt.getMenuItems;
  return function() {
    var o = getMenuItems.call(this);
    o.push('-', {iconCls:Ext.baseCSSPrefix + 'groups-icon', itemId:'groupsMenuItem', text:me.groupsText, menu:[{text:me.expandAllText, handler:me.expandAll, scope:me}, {text:me.collapseAllText, handler:me.collapseAll, scope:me}]}, {iconCls:Ext.baseCSSPrefix + 'group-by-icon', itemId:'groupByMenuItem', text:me.groupByText, handler:me.onGroupByMenuItemClick, scope:me}, {iconCls:Ext.baseCSSPrefix + 'add-group-icon', itemId:'addGroupMenuItem', text:me.addToGroupingText, handler:me.onAddGroupMenuItemClick, 
    scope:me}, {iconCls:Ext.baseCSSPrefix + 'remove-group-icon', itemId:'removeGroupMenuItem', text:me.removeFromGroupingText, handler:me.onRemoveGroupMenuItemClick, scope:me});
    grid.fireEvent('collectheadermenuitems', grid, {grid:grid, headerContainer:this, items:o});
    return o;
  };
}, onGroupByMenuItemClick:function(menuItem, e) {
  var me = this, hdr = menuItem.parentMenu.activeHeader, store = me.view.getStore(), groupers = store.getGroupers(), length = groupers.length, i, grouper, header;
  if (me.disabled) {
    me.enable();
  }
  Ext.suspendLayouts();
  for (i = 0; i < length; i++) {
    header = me.getGroupedHeader(groupers.items[i].getProperty());
    if (header) {
      header.show();
    }
  }
  hdr.hide();
  groupers.replaceAll(me.createGrouperFromHeader(hdr));
  Ext.resumeLayouts(true);
}, onAddGroupMenuItemClick:function(menuItem, e) {
  var me = this, hdr = menuItem.parentMenu.activeHeader, groupers = me.view.getStore().getGroupers();
  if (me.disabled) {
    me.enable();
  }
  Ext.suspendLayouts();
  hdr.hide();
  groupers.add(me.createGrouperFromHeader(hdr));
  Ext.resumeLayouts(true);
}, createGrouperFromHeader:function(header) {
  return {property:header.dataIndex, direction:header.sortState || 'ASC', formatter:header.groupFormatter};
}, onRemoveGroupMenuItemClick:function(menuItem, e) {
  var me = this, hdr = menuItem.parentMenu.activeHeader, groupers = me.view.getStore().getGroupers(), i, grouper;
  if (me.disabled) {
    me.enable();
  }
  grouper = groupers.get(hdr.dataIndex);
  if (grouper) {
    groupers.remove(grouper);
  }
}, onCellEvent:function(view, row, e) {
  var me = this, record = view.getRecord(row), groupHd = e.getTarget(me.groupSelector), groupSum = e.getTarget(me.groupSummarySelector), cell = e.getTarget(view.getCellSelector()), ownerGrid = view.ownerGrid, prefix = 'group', data = me.dataSource.getRenderData(record), fireArg = Ext.applyIf({grid:ownerGrid, view:view, record:record, column:view.getHeaderByCell(cell), cell:cell, row:row, feature:me, e:e}, data);
  if (!(record && data)) {
    return;
  }
  if (groupHd) {
    if (e.type === 'click') {
      me.doCollapseExpand(data.group.isCollapsed, data.group.getPath(), {focus:true, column:me.getGroupingColumn()}, fireArg);
    }
  }
  if (groupSum) {
    prefix = data.isGroupSummary ? 'groupsummary' : 'summary';
  }
  ownerGrid.fireEvent(prefix + e.type, ownerGrid, fireArg);
  return false;
}, onKeyEvent:function(view, rowElement, e) {
  var me = this, position = e.position, groupHd = e.getTarget(me.groupSelector), column = me.getGroupingColumn(), record, data, fireArg, cell;
  if (position) {
    cell = position.getCell();
    groupHd = cell.down(me.groupSelector);
  }
  if (e.getKey() === e.ENTER && rowElement && groupHd) {
    record = view.getRecord(rowElement);
    data = me.dataSource.getRenderData(record);
    if (record && record.isGroup && data) {
      fireArg = Ext.applyIf({record:record, column:column, cell:cell, row:rowElement}, data);
      me.doCollapseExpand(data.group.isCollapsed, data.group.getPath(), {focus:true, column:column}, fireArg);
    }
  }
}, onBeforeGroupChange:function(store, groupers) {
  var view = this.view, grid = view.ownerGrid;
  if (!grid.lockable || view.isLockedView) {
    grid.fireEvent('beforegroupchange', grid, groupers);
  }
}, onGroupChange:function(store, groupers) {
  var me = this, groupingColumn = me.getGroupingColumn(), view = me.view, grid = view.ownerGrid, isGrouped = groupers && groupers.length, width;
  if (groupingColumn) {
    if (groupingColumn.rendered) {
      if (isGrouped) {
        groupingColumn.setWidth(me.lastColumnWidth);
      } else {
        width = groupingColumn.getWidth();
        if (width > 1) {
          me.lastColumnWidth = width;
          groupingColumn.setWidth(1);
        }
      }
    } else {
      if (isGrouped) {
        groupingColumn.width = me.lastColumnWidth;
      }
    }
  }
  if (!grid.lockable || view.isLockedView) {
    grid.getView().refreshView();
    grid.fireEvent('aftergroupchange', grid, groupers);
  }
}, privates:{getViewListeners:function() {
  var me = this, viewListeners = {afterrender:me.onAfterViewRendered, scope:me, destroyable:true};
  viewListeners[me.eventPrefix + 'click'] = me.onCellEvent;
  viewListeners[me.eventPrefix + 'dblclick'] = me.onCellEvent;
  viewListeners[me.eventPrefix + 'contextmenu'] = me.onCellEvent;
  viewListeners[me.eventPrefix + 'keyup'] = me.onKeyEvent;
  return viewListeners;
}, getOwnerGridListeners:function() {
  return {beforereconfigure:this.onBeforeReconfigure, destroyable:true, scope:this};
}, getStoreListeners:function() {
  return {beforegroupchange:this.onBeforeGroupChange, groupchange:this.onGroupChange, scope:this, destroyable:true};
}, initEventsListeners:function() {
  var me = this, view = me.view, grid = view.ownerGrid, lockPartner = me.lockingPartner;
  me.viewListeners = view.on(me.getViewListeners());
  if (!lockPartner || lockPartner && !lockPartner.gridListeners) {
    me.ownerGridListeners = grid.on(me.getOwnerGridListeners());
  }
  me.setupStoreListeners(view.getStore());
}, destroyEventsListeners:function() {
  Ext.destroyMembers(this, 'viewListeners', 'storeListeners', 'ownerGridListeners');
}, setupStoreListeners:function(store) {
  Ext.destroy(this.storeListeners);
  this.storeListeners = store.on(this.getStoreListeners());
}}});
Ext.define('Ext.grid.feature.MultiGroupingSummary', {extend:'Ext.grid.feature.MultiGrouping', alias:'feature.multigroupingsummary', groupSummaryPosition:'bottom', summaryPosition:'docked', dock:'bottom', dockedSummaryCls:Ext.baseCSSPrefix + 'docked-grid-summary', summaryCls:Ext.baseCSSPrefix + 'grid-summary', summarySelector:'.' + Ext.baseCSSPrefix + 'grid-summary', summaryTableCls:Ext.baseCSSPrefix + 'grid-item', init:function(grid) {
  var me = this, view = me.view, showSummary;
  me.callParent([grid]);
  grid.headerCt.on({columnschanged:me.onStoreUpdate, afterlayout:me.afterHeaderCtLayout, scope:me});
  grid.on({beforerender:me.onBeforeGridRendered, afterrender:me.onAfterGridRendered, afterlayout:me.onGridLayout, scope:me, single:true});
}, destroy:function() {
  this.grid.summaryBar = null;
  this.callParent();
}, setSummaryPosition:function(value) {
  var me = this, lockingPartner = me.lockingPartner, bar = me.getSummaryBar(), dock = me.dock;
  me.showSummary = value === 'docked' && (dock === 'top' || dock === 'bottom');
  bar.setHidden(!me.showSummary);
  if (lockingPartner) {
    lockingPartner.getSummaryBar().setHidden(!me.showSummary);
  }
  me.callParent([value]);
}, onBeforeGridRendered:function() {
  var me = this, view = me.view, grid = me.grid, dock = me.dock, pos = me.summaryPosition, tableCls = [me.summaryTableCls], showSummary;
  me.showSummary = showSummary = pos === 'docked' && (dock === 'top' || dock === 'bottom');
  if (view.columnLines) {
    tableCls[tableCls.length] = view.ownerCt.colLinesCls;
  }
  me.summaryBar = grid.addDocked({focusable:true, childEls:['innerCt', 'item'], renderTpl:['\x3cdiv id\x3d"{id}-innerCt" data-ref\x3d"innerCt" role\x3d"presentation"\x3e', '\x3ctable id\x3d"{id}-item" data-ref\x3d"item" cellPadding\x3d"0" cellSpacing\x3d"0" class\x3d"' + tableCls.join(' ') + '"\x3e', '\x3ctr class\x3d"' + me.summaryCls + '"\x3e\x3c/tr\x3e', '\x3c/table\x3e', '\x3c/div\x3e'], scrollable:{x:false, y:false}, itemId:'summaryBar', hidden:!showSummary, cls:[me.dockedSummaryCls, me.dockedSummaryCls + 
  '-' + dock], xtype:'component', dock:dock, weight:10000000})[0];
  grid.summaryBar = me.summaryBar;
}, onAfterGridRendered:function() {
  var me = this, bar = me.summaryBar;
  me.onStoreUpdate();
  bar.innerCt.on({click:'onBarEvent', dblclick:'onBarEvent', contextmenu:'onBarEvent', delegate:'.' + Ext.baseCSSPrefix + 'grid-cell', scope:me});
}, onGridLayout:function(grid) {
  var view = grid.getView(), scroller;
  if (view.isLockedView != null || view.isNormalView != null) {
    if (view.isLockedView) {
      scroller = view.ownerGrid.lockedScrollbarScroller;
    } else {
      scroller = view.ownerGrid.normalScrollbarScroller;
    }
  } else {
    scroller = view.getScrollable();
  }
  scroller.addPartner(this.summaryBar.getScrollable(), 'x');
}, getSummaryBar:function() {
  var me = this;
  if (!me.summaryBar) {
    me.onBeforeGridRendered();
    me.onAfterGridRendered();
  }
  return me.summaryBar;
}, setupRowValues:function(rowValues, renderData) {
  this.callParent([rowValues, renderData]);
  if (renderData.isSummary && this.showSummary) {
    Ext.Array.remove(rowValues.rowClasses, this.eventCls);
    rowValues.rowClasses.push('x-grid-row', this.summaryCls);
  }
}, onStoreUpdate:function() {
  var me = this, view = me.view, selector = me.summarySelector, record, newRowDom, oldRowDom, p, data;
  if (!view.rendered || !me.showSummary) {
    return;
  }
  record = view.getStore().getSummaryRecord();
  data = me.dataSource.renderData[record.getId()] = {isSummary:true};
  me.setRenderers(data);
  newRowDom = Ext.fly(view.createRowElement(record, -1)).down(selector, true);
  me.resetRenderers();
  if (!newRowDom) {
    return;
  }
  p = me.summaryBar.item.dom.firstChild;
  oldRowDom = p.firstChild;
  p.insertBefore(newRowDom, oldRowDom);
  p.removeChild(oldRowDom);
}, afterHeaderCtLayout:function(headerCt) {
  var me = this, view = me.view, columns = view.getVisibleColumnManager().getColumns(), column, len = columns.length, i, summaryEl, el, width, innerCt;
  if (me.showSummary && view.refreshCounter) {
    headerCt.purgeCache();
    summaryEl = me.summaryBar.el;
    width = headerCt.getTableWidth();
    innerCt = me.summaryBar.innerCt;
    me.summaryBar.item.setWidth(width);
    if (headerCt.tooNarrow) {
      width += Ext.getScrollbarSize().width;
    }
    innerCt.setWidth(width);
    if (summaryEl) {
      for (i = 0; i < len; i++) {
        column = columns[i];
        el = summaryEl.down(view.getCellSelector(column), true);
        if (el) {
          Ext.fly(el).setWidth(column.width || (column.lastBox ? column.lastBox.width : 100));
        }
      }
    }
  }
}, onBarEvent:function(e, cell) {
  var me = this, view = me.view, grid = view.ownerGrid, record = view.getStore().getSummaryRecord(), fireArg = Ext.apply({record:record, column:view.getHeaderByCell(cell), cell:cell, row:me.summaryBar.getEl(), grid:grid, feature:me, e:e}, me.dataSource.getRenderData(record));
  return grid.fireEvent('summary' + e.type, grid, fireArg);
}, privates:{getOwnerGridListeners:function() {
  var listeners = this.callParent();
  return Ext.apply(listeners, {columnmove:this.onStoreUpdate});
}, getStoreListeners:function() {
  var me = this, listeners = me.callParent();
  return Ext.apply(listeners, {update:me.onStoreUpdate, datachanged:me.onStoreUpdate, remotesummarieschanged:me.onStoreUpdate, summarieschanged:me.onStoreUpdate});
}}});
Ext.define('Ext.grid.plugin.Operator', {extend:'Ext.AbstractPlugin', alias:'plugin.operator', config:{operator:'\x3d', operators:null}, operatorCls:Ext.baseCSSPrefix + 'operator-button', triggerCls:Ext.baseCSSPrefix + 'form-trigger', operatorsIconsMap:{eq:Ext.baseCSSPrefix + 'operator-eq', ne:Ext.baseCSSPrefix + 'operator-neq', gt:Ext.baseCSSPrefix + 'operator-gt', ge:Ext.baseCSSPrefix + 'operator-gte', lt:Ext.baseCSSPrefix + 'operator-lt', le:Ext.baseCSSPrefix + 'operator-lte', like:Ext.baseCSSPrefix + 
'operator-like', nlike:Ext.baseCSSPrefix + 'operator-nlike', 'in':Ext.baseCSSPrefix + 'operator-in', notin:Ext.baseCSSPrefix + 'operator-nin', empty:Ext.baseCSSPrefix + 'operator-empty', nempty:Ext.baseCSSPrefix + 'operator-exists', identical:Ext.baseCSSPrefix + 'operator-identical', nidentical:Ext.baseCSSPrefix + 'operator-nidentical', regex:Ext.baseCSSPrefix + 'operator-fn'}, operatorsTextMap:{eq:'Is equal', ne:'Not equal', gt:'Greater than', ge:'Greater than or equal to', lt:'Less than', le:'Less than or equal to', 
like:'Like', nlike:'Not like', empty:'Empty', nempty:'Not empty', identical:'Identical', nidentical:'Not identical', regex:'Regular expression', 'in':'Is in', notin:'Is not in'}, inheritableStatics:{addOperator:function(name, iconCls, text) {
  var proto = this.prototype;
  proto.operatorsIconsMap[name] = iconCls;
  proto.operatorsTextMap[name] = text;
}}, init:function(field) {
  var me = this;
  me.callParent([field]);
  if (!field.isFormField) {
    Ext.raise('This plugin should be used with form fields');
  }
  if (field.rendered) {
    me.onFieldRender(field);
  } else {
    me.fieldListeners = field.on({afterrender:'onFieldRender', scope:me, destroyable:true});
  }
  me.field = field;
}, destroy:function() {
  var me = this;
  me.field = Ext.destroy(me.fieldListeners, me.menu);
  me.callParent();
}, onFieldRender:function(textField) {
  var me = this, op = me.getOperator(), btn;
  btn = me.operatorButtonEl = textField.triggerWrap.insertFirst({tag:'div', cls:[me.operatorCls, me.triggerCls, me.operatorsIconsMap[op]], 'data-qtip':me.operatorsTextMap[op]});
  btn.on({click:'onOperatorClick', scope:me});
}, onOperatorClick:function(e, el) {
  var me = this, menu = me.menu;
  if (!menu) {
    me.menu = menu = Ext.widget({xtype:'menu', items:me.getMenuForOperators()});
  }
  menu.showBy(el, 'bl');
  menu.focus();
}, getMenuForOperators:function() {
  var me = this, operators = me.getOperators(), items = [], len, i, op;
  if (operators) {
    len = operators.length;
    for (i = 0; i < len; i++) {
      op = operators[i];
      items.push({iconCls:me.operatorsIconsMap[op], text:me.operatorsTextMap[op], handler:'onChangeOperator', scope:me, operator:op});
    }
  }
  return items;
}, onChangeOperator:function(menu) {
  this.setOperator(menu.operator);
}, updateOperator:function(op, oldOp) {
  var me = this, field = me.field, btn = me.operatorButtonEl;
  if (!me.isConfiguring && btn) {
    field.fireEvent('operatorchange', field, op);
    btn.removeCls(me.operatorsIconsMap[oldOp]);
    btn.addCls(me.operatorsIconsMap[op]);
    btn.set({'data-qtip':me.operatorsTextMap[op]});
  }
}}, function() {
  var prototype = this.prototype, icons = prototype.operatorsIconsMap, texts = prototype.operatorsTextMap;
  icons['\x3d'] = icons['eq'];
  icons['\x3d\x3d'] = icons['eq'];
  icons['!\x3d'] = icons['ne'];
  icons['\x3d\x3d\x3d'] = icons['identical'];
  icons['!\x3d\x3d'] = icons['nidentical'];
  icons['\x3e'] = icons['gt'];
  icons['\x3e\x3d'] = icons['ge'];
  icons['\x3c'] = icons['lt'];
  icons['\x3c\x3d'] = icons['le'];
  icons['/\x3d'] = icons['regex'];
  texts['\x3d'] = texts['eq'];
  texts['\x3d\x3d'] = texts['eq'];
  texts['!\x3d'] = texts['ne'];
  texts['\x3d\x3d\x3d'] = texts['identical'];
  texts['!\x3d\x3d'] = texts['nidentical'];
  texts['\x3e'] = texts['gt'];
  texts['\x3e\x3d'] = texts['ge'];
  texts['\x3c'] = texts['lt'];
  texts['\x3c\x3d'] = texts['le'];
  texts['/\x3d'] = texts['regex'];
});
Ext.define('Ext.grid.plugin.filters.Base', {mixins:['Ext.mixin.Factoryable'], requires:['Ext.form.field.Text', 'Ext.grid.plugin.Operator'], factoryConfig:{type:'grid.filters'}, $configPrefixed:false, $configStrict:false, config:{fieldDefaults:{xtype:'textfield', hideLabel:true, selectOnFocus:true}, grid:null, column:null, field:null, dataIndex:null, operator:'\x3d\x3d', operators:null, updateBuffer:500, serializer:null, fieldListeners:{change:'onValueChange', operatorchange:'onOperatorChange', render:'onFieldRender'}}, 
active:false, filterIdPrefix:Ext.baseCSSPrefix + 'gridfilter', isGridFilter:true, defaultRoot:'data', fieldCls:Ext.baseCSSPrefix + 'grid-filter-base', constructor:function(config) {
  var me = this, filter, value;
  me.callParent([config]);
  me.initConfig(config);
  me.initFilter(config);
  me.createField();
  me.task = new Ext.util.DelayedTask(me.setValue, me);
}, destroy:function() {
  var me = this;
  if (me.task) {
    me.task.cancel();
    me.task = null;
  }
  me.setColumn(null);
  me.setField(null);
  me.setGrid(null);
  me.callParent();
}, initFilter:Ext.emptyFn, createField:function() {
  this.setField(Ext.widget(this.getFieldConfig()));
}, getFieldConfig:function() {
  var me = this, column = me.getColumn(), filter = me.filter, config = {};
  if (column) {
    if (column.rendered) {
      config.width = column.getWidth();
    } else {
      if (column.width != null) {
        config.width = column.width;
      } else {
        if (column.flex != null) {
          config.flex = column.flex;
        }
      }
    }
    config.hidden = column.hidden;
  }
  if (filter) {
    config.value = filter.getValue();
  }
  return Ext.apply(config, me.getFieldDefaults());
}, addStoreFilter:function(filter) {
  var filters = this.getGridStore().getFilters(), idx = filters.indexOf(filter), existing = idx !== -1 ? filters.getAt(idx) : null;
  if (!existing || !Ext.util.Filter.isEqual(existing, filter)) {
    filters.add(filter);
  }
}, createFilter:function(config, key) {
  var filter = new Ext.util.Filter(this.getFilterConfig(config, key));
  filter.isGridFilter = true;
  return filter;
}, getFilterConfig:function(config, key) {
  config.id = this.getBaseIdPrefix();
  if (!config.property) {
    config.property = this.dataIndex;
  }
  if (!config.root) {
    config.root = this.defaultRoot;
  }
  if (key) {
    config.id += '-' + key;
  }
  config.serializer = this.getSerializer();
  return config;
}, getActiveState:function(config, value) {
  var active = config.active;
  return active !== undefined ? active : value !== undefined;
}, getBaseIdPrefix:function() {
  return this.filterIdPrefix + '-' + this.dataIndex;
}, getGridStore:function() {
  return this.grid.getStore();
}, getStoreFilter:function(key) {
  var me = this, filters = me.getGridStore().getFilters(), id = me.getBaseIdPrefix(), filter, f, len, i, oldKey;
  if (key) {
    id += '-' + key;
  }
  filter = filters.get(id);
  if (!filter) {
    len = filters.length;
    for (i = 0; i < len; i++) {
      f = filters.items[i];
      if (f.getProperty() === me.dataIndex) {
        filter = f;
        oldKey = filters.getKey(f);
        filter.setId(id);
        filters.itemChanged(f, ['id'], oldKey);
        break;
      }
    }
  }
  return filter;
}, setActive:function(active) {
  var me = this, filterCollection;
  if (me.active !== active) {
    me.active = active;
    filterCollection = me.getGridStore().getFilters();
    filterCollection.beginUpdate();
    if (active) {
      me.activate();
    } else {
      me.deactivate();
    }
    filterCollection.endUpdate();
    me.setColumnActive(active);
    me.grid.fireEventArgs(active ? 'filteractivate' : 'filterdeactivate', [me, me.column]);
  }
}, activate:Ext.emptyFn, deactivate:Ext.emptyFn, setColumnActive:function(active) {
  this.column[active ? 'addCls' : 'removeCls'](this.owner.filterCls);
}, onValueChange:function(field, value) {
  var me = this, updateBuffer = me.updateBuffer;
  if (field.isValid()) {
    if (value === me.value) {
      return;
    }
    if (updateBuffer) {
      me.task.delay(updateBuffer, null, null, [value]);
    } else {
      me.setValue(value);
    }
  }
}, onOperatorChange:function(field, operator) {
  var value = field.getValue();
  this.setOperator(operator);
  if (!Ext.isEmpty(value)) {
    this.setValue(value);
  }
}, removeStoreFilter:function(filter) {
  this.getGridStore().getFilters().remove(filter);
}, updateColumn:function(column) {
  var me = this;
  me.columnListeners = Ext.destroy(me.columnListeners);
  if (column) {
    if (!me.getDataIndex()) {
      me.setDataIndex(column.dataIndex);
    }
    me.columnListeners = column.on({destroy:me.destroy, scope:me, destroyable:true});
  }
}, updateField:function(field, oldField) {
  var me = this;
  if (!this.grid.isDestroying) {
    Ext.destroy(oldField);
  }
  if (field) {
    field.addCls(me.fieldCls);
    if (field.isFormField) {
      field.addPlugin({ptype:'operator', operator:me.getOperator(), operators:me.getOperators()});
      field.on(Ext.apply({scope:me}, me.getFieldListeners()));
    }
  }
}, updateOperator:function(operator) {
  var me = this;
  if (!me.isConfiguring && me.filter) {
    me.filter.setOperator(operator);
  }
}, updateStoreFilter:function() {
  this.getGridStore().getFilters().notify('endupdate');
}, onFieldRender:function() {
  this.resizeField();
}, resizeField:function(width) {
  var field = this.getField(), column = this.getColumn();
  if (field && field.rendered && column && column.rendered) {
    field.flex = null;
    if (width != null) {
      field.setWidth(width);
    } else {
      field.setWidth(column.getWidth());
    }
  }
}, resetFilter:Ext.emptyFn});
Ext.define('Ext.grid.plugin.filters.SingleFilter', {extend:'Ext.grid.plugin.filters.Base', initFilter:function(config) {
  var me = this, filter, value;
  value = me.value;
  filter = me.getStoreFilter();
  if (filter) {
    me.active = true;
    me.setOperator(filter.getOperator());
  } else {
    if (me.grid.stateful && me.getGridStore().saveStatefulFilters) {
      value = undefined;
    }
    me.active = me.getActiveState(config, value);
    filter = me.createFilter({operator:me.operator, value:value});
    if (me.active) {
      me.addStoreFilter(filter);
    }
  }
  if (me.active) {
    me.setColumnActive(true);
  }
  me.filter = filter;
}, setValue:function(value) {
  var me = this;
  me.filter.setValue(value);
  if (Ext.isEmpty(value)) {
    me.setActive(false);
  } else {
    if (me.active) {
      me.value = value;
      me.updateStoreFilter();
    } else {
      me.setActive(true);
    }
  }
}, activate:function() {
  this.addStoreFilter(this.filter);
}, deactivate:function() {
  this.removeStoreFilter(this.filter);
}, resetFilter:function() {
  var me = this, filter = me.getStoreFilter(), field = me.getField(), value;
  if (filter) {
    me.active = true;
    value = filter.getValue();
    me.setOperator(filter.getOperator());
  }
  field.suspendEvents();
  field.setValue(value);
  field.resumeEvents(true);
}});
Ext.define('Ext.grid.plugin.filters.String', {extend:'Ext.grid.plugin.filters.SingleFilter', alias:'grid.filters.string', type:'string', operator:'like', operators:['like', '\x3d\x3d', '!\x3d'], fieldDefaults:{xtype:'textfield'}});
Ext.define('Ext.grid.plugin.filters.Date', {extend:'Ext.grid.plugin.filters.SingleFilter', alias:'grid.filters.date', requires:['Ext.form.field.Date'], type:'date', operators:['\x3d\x3d', '!\x3d', '\x3e', '\x3e\x3d', '\x3c', '\x3c\x3d'], fieldDefaults:{xtype:'datefield'}});
Ext.define('Ext.grid.plugin.filters.Number', {extend:'Ext.grid.plugin.filters.SingleFilter', alias:'grid.filters.number', requires:['Ext.form.field.Number'], operator:'\x3d\x3d', operators:['\x3d\x3d', '!\x3d', '\x3e', '\x3e\x3d', '\x3c', '\x3c\x3d'], fieldDefaults:{xtype:'numberfield', hideTrigger:true}});
Ext.define('Ext.grid.plugin.filters.Boolean', {extend:'Ext.grid.plugin.filters.SingleFilter', alias:'grid.filters.boolean', requires:['Ext.form.field.ComboBox'], type:'boolean', operator:'\x3d\x3d', operators:['\x3d\x3d', '!\x3d'], fieldDefaults:{xtype:'combobox', queryMode:'local', editable:true, forceSelection:true}, trueText:'Yes', falseText:'No', trueValue:1, falseValue:0, getFieldConfig:function() {
  var me = this, config = me.callParent();
  config.store = [[me.trueValue, me.trueText], [me.falseValue, me.falseText]];
  return config;
}});
Ext.define('Ext.grid.plugin.filters.None', {extend:'Ext.grid.plugin.filters.Base', alias:'grid.filters.none', fieldDefaults:{xtype:'component', cls:Ext.baseCSSPrefix + 'grid-filter-none'}});
Ext.define('Ext.grid.plugin.filters.List', {extend:'Ext.grid.plugin.filters.SingleFilter', alias:'grid.filters.list', requires:['Ext.form.field.ComboBox'], config:{options:null}, type:'list', operator:'\x3d\x3d', operators:['\x3d\x3d', '!\x3d'], fieldDefaults:{xtype:'combobox', queryMode:'local', forceSelection:true, editable:true, matchFieldWidth:false}, constructor:function(config) {
  var me = this, options;
  me.callParent([config]);
  options = me.getOptions();
  if (!options) {
    me.monitorStore(me.getGridStore());
  }
}, destroy:function() {
  Ext.destroy(this.storeListeners);
  this.callParent();
}, monitorStore:function(store) {
  var me = this;
  Ext.destroy(me.storeListeners);
  me.storeListeners = store.on({add:'resetFieldStore', remove:'resetFieldStore', load:'resetFieldStore', scope:me, destroyable:true});
}, getFieldConfig:function() {
  var config = this.callParent();
  config.store = this.createOptionsStore();
  return config;
}, createOptionsStore:function() {
  var me = this, options = me.getOptions(), store = me.getGridStore();
  if (!options) {
    options = Ext.Array.sort(store.collect(me.getDataIndex(), false, true));
  }
  return options;
}, resetFieldStore:function() {
  var me = this, field = me.getField();
  if (field) {
    field.setStore(me.createOptionsStore());
    if (me.active) {
      field.suspendEvents();
      field.setValue(me.filter.getValue());
      field.resumeEvents(true);
    }
  }
}});
Ext.define('Ext.grid.plugin.filters.InList', {extend:'Ext.grid.plugin.filters.SingleFilter', alias:'grid.filters.inlist', requires:['Ext.form.field.Tag'], config:{options:null}, type:'inlist', operator:'in', operators:['in', 'notin'], fieldDefaults:{xtype:'tagfield', queryMode:'local', forceSelection:true, selectOnFocus:false, editable:false, filterPickList:true}, getFieldConfig:function() {
  var config = this.callParent();
  config.store = this.getOptions() || [];
  return config;
}, onFieldRender:function(field) {
  this.callParent([field]);
  if (field.isXType('tagfield') && !field.getEditable() && field.inputElCt) {
    field.inputElCt.setDisplayed(false);
  }
}});
Ext.define('Ext.grid.plugin.FilterBar', {extend:'Ext.AbstractPlugin', alias:'plugin.gridfilterbar', requires:['Ext.grid.plugin.filters.String', 'Ext.grid.plugin.filters.Date', 'Ext.grid.plugin.filters.Number', 'Ext.grid.plugin.filters.Boolean', 'Ext.grid.plugin.filters.None', 'Ext.grid.plugin.filters.List', 'Ext.grid.plugin.filters.InList'], config:{hidden:false, headerListeners:{columnshow:'onColumnShow', columnhide:'onColumnHide', add:'onColumnAdd', remove:'onColumnRemove', afterlayout:'onHeaderLayout'}, 
gridListeners:{reconfigure:'onGridReconfigure', afterlayout:{fn:'onGridLayout', single:true}}}, lockableScope:'both', filterBarCls:Ext.baseCSSPrefix + 'grid-filterbar', filterCls:Ext.baseCSSPrefix + 'grid-filterbar-filtered-column', init:function(grid) {
  var me = this, headerCt = grid.headerCt;
  me.grid = grid;
  me.listenersHeader = headerCt.on(Ext.apply({scope:me, destroyable:me}, me.getHeaderListeners()));
  me.listenersGrid = grid.on(Ext.apply({scope:me, destroyable:me}, me.getGridListeners()));
  me.createFilterBar();
  me.initializeFilters(grid.columnManager.getColumns());
  me.setupGridFunctions();
}, destroy:function() {
  var me = this, grid = this.grid, mainGrid;
  if (grid) {
    mainGrid = grid.ownerGrid;
    if (mainGrid) {
      mainGrid.showFilterBar = mainGrid.hideFilterBar = null;
    }
    grid.showFilterBar = grid.hideFilterBar = null;
  }
  Ext.destroy(me.listenersGrid, me.listenersHeader, me.bar);
  me.callParent();
}, setupGridFunctions:function() {
  var me = this, grid = me.grid, mainGrid;
  if (grid) {
    if (grid.isLocked) {
      mainGrid = grid.ownerGrid;
      mainGrid.showFilterBar = Ext.bind(me.showFilterBarPartners, me);
      mainGrid.hideFilterBar = Ext.bind(me.hideFilterBarPartners, me);
    }
    grid.showFilterBar = Ext.bind(me.showFilterBar, me);
    grid.hideFilterBar = Ext.bind(me.hideFilterBar, me);
  }
}, showFilterBar:function() {
  var barScroller = this.bar.getScrollable();
  if (this.isDestroyed) {
    return;
  }
  this.bar.show();
  barScroller.syncWithPartners();
}, hideFilterBar:function() {
  if (this.isDestroyed) {
    return;
  }
  this.bar.hide();
}, showFilterBarPartners:function() {
  this.showFilterBar();
  this.lockingPartner.showFilterBar();
}, hideFilterBarPartners:function() {
  this.hideFilterBar();
  this.lockingPartner.hideFilterBar();
}, createFilterBar:function() {
  var me = this;
  me.bar = me.grid.addDocked({weight:100, xtype:'container', hidden:me.getHidden(), layout:{type:'hbox', align:'stretch'}, childEls:['innerCt'], scrollable:{x:false, y:false}})[0];
  me.bar.addCls([me.filterBarCls, Ext.baseCSSPrefix + 'grid-header-ct']);
}, initializeFilters:function(columns) {
  var len = columns.length, i, filter;
  for (i = 0; i < len; i++) {
    filter = this.createColumnFilter(columns[i]);
    this.bar.add(filter.getField());
  }
}, onGridLayout:function(grid) {
  var view = grid.getView(), barScroller = this.bar.getScrollable(), scroller;
  if (view.isLockedView != null || view.isNormalView != null) {
    if (view.isLockedView) {
      scroller = view.ownerGrid.lockedScrollbarScroller;
    } else {
      scroller = view.ownerGrid.normalScrollbarScroller;
    }
  } else {
    scroller = view.getScrollable();
  }
  scroller.addPartner(barScroller, 'x');
  barScroller.addPartner(grid.headerCt.getScrollable(), 'x');
  barScroller.addPartner(view.getScrollable(), 'x');
  if (grid.summaryBar) {
    barScroller.addPartner(grid.summaryBar.getScrollable(), 'x');
  }
}, onHeaderLayout:function() {
  this.resizeFilters();
  this.adjustFilterBarSize();
}, onGridReconfigure:function(grid, store, columns) {
  if (store) {
    this.resetFilters();
  }
}, onColumnAdd:function(header, column, index) {
  var filter = column.filter;
  if (!filter || !filter.isGridFilter) {
    filter = this.createColumnFilter(column);
  }
  this.bar.insert(index, filter.getField());
  this.adjustFilterBarSize();
}, onColumnRemove:function() {
  this.adjustFilterBarSize();
}, onColumnShow:function(header, column) {
  this.setFilterVisibility(column, true);
}, onColumnHide:function(header, column) {
  this.setFilterVisibility(column, false);
}, setFilterVisibility:function(column, visible) {
  var filter = column.filter, field = filter && filter.isGridFilter ? filter.getField() : null;
  if (field) {
    field[visible ? 'show' : 'hide']();
  }
}, resizeFilters:function() {
  var columns = this.grid.columnManager.getColumns(), len = columns.length, i, filter;
  for (i = 0; i < len; i++) {
    filter = columns[i].filter;
    if (filter && filter.isGridFilter) {
      filter.resizeField();
    }
  }
}, adjustFilterBarSize:function() {
  var bar = this.bar, headerCt = this.grid.headerCt, width;
  if (bar.rendered) {
    width = bar.innerCt.getWidth();
    if (headerCt.tooNarrow) {
      width += Ext.getScrollbarSize().width;
    }
    bar.innerCt.setWidth(width);
  }
}, createColumnFilter:function(column) {
  var filter = column.filter, config = {grid:this.grid, column:column, owner:this};
  if (!filter) {
    config.type = 'none';
    filter = Ext.Factory.gridFilters(config);
  } else {
    if (!filter.isGridFilter) {
      if (Ext.isString(filter)) {
        config.type = filter;
      } else {
        Ext.apply(config, filter);
      }
      filter = Ext.Factory.gridFilters(config);
    }
  }
  column.filter = filter;
  return filter;
}, resetFilters:function() {
  var columns = this.grid.columnManager.getColumns(), len = columns.length, i, filter;
  for (i = 0; i < len; i++) {
    filter = columns[i].filter;
    if (filter && filter.isGridFilter) {
      filter.resetFilter();
    }
  }
}});
Ext.define('Ext.grid.plugin.grouping.Column', {extend:'Ext.Component', alias:'widget.groupingpanelcolumn', requires:['Ext.menu.Menu', 'Ext.menu.CheckItem', 'Ext.menu.Item', 'Ext.menu.Separator'], childEls:['textCol', 'filterCol', 'sortCol'], tabIndex:0, focusable:true, isGroupingPanelColumn:true, renderTpl:'\x3cdiv id\x3d"{id}-configCol" role\x3d"button" class\x3d"' + Ext.baseCSSPrefix + 'grid-group-column-inner" \x3e' + '\x3cspan id\x3d"{id}-customCol" role\x3d"presentation" class\x3d"' + Ext.baseCSSPrefix + 
'grid-group-column-btn-customize ' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'grid-group-column-btn ' + Ext.baseCSSPrefix + 'grid-group-column-btn-image"\x3e\x3c/span\x3e' + '\x3cspan id\x3d"{id}-sortCol" role\x3d"presentation" data-ref\x3d"sortCol" class\x3d"' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'grid-group-column-btn"\x3e\x3c/span\x3e' + '\x3cspan id\x3d"{id}-textCol" role\x3d"presentation" data-ref\x3d"textCol" data-qtip\x3d"{header}" class\x3d"' + Ext.baseCSSPrefix + 
'grid-group-column-text ' + Ext.baseCSSPrefix + 'column-header-text ' + Ext.baseCSSPrefix + 'border-box"\x3e' + '{header}' + '\x3c/span\x3e' + '\x3c/div\x3e', maxWidth:200, baseCls:Ext.baseCSSPrefix + 'grid-group-column', overCls:Ext.baseCSSPrefix + 'grid-group-column-over', cls:Ext.baseCSSPrefix + 'unselectable', btnIconCls:Ext.baseCSSPrefix + 'grid-group-column-btn-image', btnAscSortIconCls:Ext.baseCSSPrefix + 'grid-group-column-btn-sort-asc', btnDescSortIconCls:Ext.baseCSSPrefix + 'grid-group-column-btn-sort-desc', 
config:{header:'\x26#160;', grouper:null, idColumn:'', column:null}, doDestroy:function() {
  this.setGrouper(null);
  this.callParent();
}, initRenderData:function() {
  return Ext.apply(this.callParent(arguments), {header:this.header});
}, afterRender:function() {
  this.changeSortCls();
  this.callParent();
}, updateGrouper:function(grouper) {
  this.changeSortCls();
}, changeSortCls:function() {
  var me = this, grouper = me.getGrouper(), sortCol = me.sortCol, direction;
  if (grouper && sortCol) {
    direction = grouper.getDirection();
    if (direction === 'ASC' || !direction) {
      sortCol.addCls(me.btnAscSortIconCls);
      sortCol.removeCls(me.btnDescSortIconCls);
    } else {
      sortCol.addCls(me.btnDescSortIconCls);
      sortCol.removeCls(me.btnAscSortIconCls);
    }
    sortCol.addCls(me.btnIconCls);
  }
}});
Ext.define('Ext.grid.plugin.grouping.DragZone', {extend:'Ext.dd.DragZone', groupColumnSelector:'.' + Ext.baseCSSPrefix + 'grid-group-column', groupColumnInnerSelector:'.' + Ext.baseCSSPrefix + 'grid-group-column-inner', maxProxyWidth:120, dragging:false, constructor:function(panel) {
  var me = this;
  me.panel = panel;
  me.ddGroup = me.getDDGroup();
  me.callParent([panel.el]);
}, getDDGroup:function() {
  return 'header-dd-zone-' + this.panel.up('[scrollerOwner]').id;
}, getDragData:function(e) {
  if (e.getTarget(this.groupColumnInnerSelector)) {
    var header = e.getTarget(this.groupColumnSelector), headerCmp, headerCol, ddel;
    if (header) {
      headerCmp = Ext.getCmp(header.id);
      headerCol = Ext.getCmp(headerCmp.idColumn);
      if (!this.panel.dragging) {
        ddel = document.createElement('div');
        ddel.innerHTML = headerCmp.getHeader();
        return {ddel:ddel, header:headerCol, groupcol:headerCmp};
      }
    }
  }
  return false;
}, onBeforeDrag:function() {
  return !(this.panel.dragging || this.disabled);
}, onInitDrag:function() {
  this.panel.dragging = true;
  this.callParent(arguments);
}, onDragDrop:function() {
  var me = this;
  if (!me.dragData.dropLocation) {
    me.panel.dragging = false;
    me.callParent(arguments);
    return;
  }
  var dropCol = me.dragData.dropLocation.header, groupCol = me.dragData.groupcol;
  if (dropCol.isColumn) {
    me.panel.removeColumn(groupCol);
  }
  me.panel.dragging = false;
  me.callParent(arguments);
}, afterRepair:function() {
  this.callParent();
  this.panel.dragging = false;
}, getRepairXY:function() {
  return this.dragData.header.el.getXY();
}, disable:function() {
  this.disabled = true;
}, enable:function() {
  this.disabled = false;
}});
Ext.define('Ext.grid.plugin.grouping.DropZone', {extend:'Ext.dd.DropZone', proxyOffsets:[-4, -9], groupingPanelSelector:'.' + Ext.baseCSSPrefix + 'grid-group-panel-body', groupColumnSelector:'.' + Ext.baseCSSPrefix + 'grid-group-column', constructor:function(panel) {
  var me = this;
  me.panel = panel;
  me.ddGroup = me.getDDGroup();
  me.autoGroup = true;
  me.callParent([panel.el]);
}, destroy:function() {
  Ext.destroy(this.topIndicator, this.bottomIndicator);
  this.callParent();
}, disable:function() {
  this.disabled = true;
}, enable:function() {
  this.disabled = false;
}, getDDGroup:function() {
  return 'header-dd-zone-' + this.panel.up('[scrollerOwner]').id;
}, getTargetFromEvent:function(e) {
  return e.getTarget(this.groupColumnSelector) || e.getTarget(this.groupingPanelSelector);
}, getTopIndicator:function() {
  if (!this.topIndicator) {
    this.topIndicator = Ext.getBody().createChild({role:'presentation', cls:Ext.baseCSSPrefix + 'col-move-top', 'data-sticky':true, html:'\x26#160;'});
    this.indicatorXOffset = Math.floor((this.topIndicator.dom.offsetWidth + 1) / 2);
  }
  return this.topIndicator;
}, getBottomIndicator:function() {
  if (!this.bottomIndicator) {
    this.bottomIndicator = Ext.getBody().createChild({role:'presentation', cls:Ext.baseCSSPrefix + 'col-move-bottom', 'data-sticky':true, html:'\x26#160;'});
  }
  return this.bottomIndicator;
}, getLocation:function(e, t) {
  var x = e.getXY()[0], target = Ext.getCmp(t.id), region, pos;
  if (target.isGroupingPanel && target.items.length) {
    region = Ext.fly(target.items.last().el).getRegion();
  } else {
    region = Ext.fly(t).getRegion();
  }
  if (region.right - x <= (region.right - region.left) / 2) {
    pos = 'after';
  } else {
    pos = 'before';
  }
  return {pos:pos, header:target, node:t};
}, positionIndicator:function(data, node, e) {
  var me = this, dragHeader = data.header, dropLocation = me.getLocation(e, node), targetHeader = dropLocation.header, pos = dropLocation.pos, nextHd, prevHd, topIndicator, bottomIndicator, topAnchor, bottomAnchor, topXY, bottomXY, headerCtEl, minX, maxX, allDropZones, ln, i, dropZone;
  if (targetHeader === me.lastTargetHeader && pos === me.lastDropPos) {
    return;
  }
  nextHd = dragHeader.nextSibling('groupingpanelcolumn:not([hidden])');
  prevHd = dragHeader.previousSibling('groupingpanelcolumn:not([hidden])');
  me.lastTargetHeader = targetHeader;
  me.lastDropPos = pos;
  data.dropLocation = dropLocation;
  if (dragHeader !== targetHeader && (pos === 'before' && nextHd !== targetHeader || pos === 'after' && prevHd !== targetHeader) && !targetHeader.isDescendantOf(dragHeader)) {
    allDropZones = Ext.dd.DragDropManager.getRelated(me);
    ln = allDropZones.length;
    i = 0;
    for (; i < ln; i++) {
      dropZone = allDropZones[i];
      if (dropZone !== me && dropZone.invalidateDrop) {
        dropZone.invalidateDrop();
      }
    }
    me.valid = true;
    topIndicator = me.getTopIndicator();
    bottomIndicator = me.getBottomIndicator();
    if (pos === 'before') {
      topAnchor = 'bc-tl';
      bottomAnchor = 'tc-bl';
    } else {
      topAnchor = 'bc-tr';
      bottomAnchor = 'tc-br';
    }
    if (targetHeader.isGroupingPanel && targetHeader.items.length > 0) {
      topXY = topIndicator.getAlignToXY(targetHeader.items.last().el, topAnchor);
      bottomXY = bottomIndicator.getAlignToXY(targetHeader.items.last().el, bottomAnchor);
    } else {
      topXY = topIndicator.getAlignToXY(targetHeader.el, topAnchor);
      bottomXY = bottomIndicator.getAlignToXY(targetHeader.el, bottomAnchor);
    }
    headerCtEl = me.panel.innerCt;
    minX = headerCtEl.getX() - me.indicatorXOffset;
    maxX = headerCtEl.getX() + headerCtEl.getWidth();
    topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
    bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);
    topIndicator.setXY(topXY);
    bottomIndicator.setXY(bottomXY);
    topIndicator.show();
    bottomIndicator.show();
  } else {
    me.invalidateDrop();
  }
}, invalidateDrop:function() {
  this.valid = false;
  this.hideIndicators();
}, onNodeOver:function(node, dragZone, e, data) {
  var me = this, from = data.groupcol || data.header, doPosition = true;
  if (data.header.el.dom === node) {
    doPosition = false;
  } else {
    if (from.isColumn) {
      doPosition = from.groupable && me.panel.isNewColumn(from);
    }
  }
  if (doPosition) {
    me.positionIndicator(data, node, e);
  } else {
    me.valid = false;
  }
  return me.valid ? me.dropAllowed : me.dropNotAllowed;
}, hideIndicators:function() {
  var me = this;
  me.getTopIndicator().hide();
  me.getBottomIndicator().hide();
  me.lastTargetHeader = me.lastDropPos = null;
}, onNodeOut:function() {
  this.hideIndicators();
}, onNodeDrop:function(node, dragZone, e, data) {
  var me = this, dragColumn = data.groupcol || data.header, dropLocation = data.dropLocation, pos, grouper;
  if (me.valid && dropLocation) {
    me.invalidateDrop();
    if (dragColumn.isColumn) {
      pos = me.panel.getColumnPosition(dropLocation.header, dropLocation.pos);
      grouper = new Ext.util.Grouper({property:dragColumn.displayField || dragColumn.dataIndex, direction:dragColumn.sortState || 'ASC', formatter:dragColumn.groupFormatter});
      me.panel.addColumn({header:dragColumn.text, idColumn:dragColumn.id, grouper:grouper, column:dragColumn}, pos, true);
      if (dragColumn.up('gridpanel').headerCt.getVisibleGridColumns().length > 1) {
        dragColumn.setVisible(false);
      }
    } else {
      if (dragColumn.isGroupingPanelColumn) {
        me.panel.moveColumn(dragColumn, dropLocation.header.isGroupingPanel ? dropLocation.header.items.last() : dropLocation.header, dropLocation.pos);
      }
    }
  }
}});
Ext.define('Ext.grid.plugin.grouping.Panel', {extend:'Ext.panel.Panel', alias:'widget.groupingpanel', requires:['Ext.grid.plugin.grouping.Column', 'Ext.grid.plugin.grouping.DragZone', 'Ext.grid.plugin.grouping.DropZone', 'Ext.layout.container.Column'], mixins:['Ext.util.FocusableContainer'], isGroupingPanel:true, position:'top', border:false, enableFocusableContainer:true, weight:50, height:'auto', layout:'column', childEls:['innerCt', 'targetEl'], cls:Ext.baseCSSPrefix + 'grid-group-panel-body', 
hintTextCls:Ext.baseCSSPrefix + 'grid-group-panel-hint', config:{grid:null, store:null, columnConfig:{xtype:'groupingpanelcolumn'}}, keyEventRe:/^key/, groupingPanelText:'Drag a column header here to group by that column', showGroupingPanelText:'Show Group By Panel', hideGroupingPanelText:'Hide Group By Panel', clearGroupText:'Clear Group', sortAscText:'Sort Ascending', sortDescText:'Sort Descending', moveLeftText:'Move left', moveRightText:'Move right', moveBeginText:'Move to beginning', moveEndText:'Move to end', 
removeText:'Remove', ascSortIconCls:Ext.baseCSSPrefix + 'grid-group-column-sort-icon-asc', descSortIconCls:Ext.baseCSSPrefix + 'grid-group-column-sort-icon-desc', groupingPanelIconCls:Ext.baseCSSPrefix + 'grid-group-panel-icon', clearGroupIconCls:Ext.baseCSSPrefix + 'grid-group-panel-clear-icon', initComponent:function() {
  var me = this;
  Ext.apply(me, {header:{dock:'left', title:{hidden:true}, padding:0, tools:[{type:'gear', handler:me.showPanelMenu, scope:me}]}});
  me.callParent(arguments);
}, doDestroy:function() {
  var me = this;
  Ext.destroyMembers(me, 'infoEl', 'dragZone', 'dropZone', 'contextMenu', 'panelListeners', 'columnListeners', 'storeListeners', 'columnMenu', 'panelMenu');
  me.setGrid(null);
  me.callParent();
}, afterRender:function() {
  var me = this, el = me.getEl();
  me.callParent();
  me.dragZone = new Ext.grid.plugin.grouping.DragZone(me);
  me.dropZone = new Ext.grid.plugin.grouping.DropZone(me);
  me.panelListeners = me.mon(el, {contextmenu:me.showPanelMenu, scope:me, destroyable:true});
  me.columnListeners = me.mon(el, {delegate:'.' + Ext.baseCSSPrefix + 'grid-group-column', click:me.handleColumnEvent, keypress:me.handleColumnEvent, scope:me, destroyable:true});
  me.infoEl = me.innerCt.createChild({cls:me.hintTextCls + ' ' + Ext.baseCSSPrefix + 'unselectable', html:me.groupingPanelText});
  me.setInfoElVisibility();
  me.initGroupingColumns();
}, show:function() {
  var me = this, dragZone = me.dragZone, dropZone = me.dropZone, grid = me.getGrid();
  if (dragZone) {
    dragZone.enable();
  }
  if (dropZone) {
    dropZone.enable();
  }
  me.callParent();
  grid.fireEvent('showgroupingpanel', me);
}, hide:function() {
  var me = this, dragZone = me.dragZone, dropZone = me.dropZone, grid = me.getGrid();
  if (dragZone) {
    dragZone.disable();
  }
  if (dropZone) {
    dropZone.disable();
  }
  me.callParent();
  grid.fireEvent('hidegroupingpanel', me);
}, updateGrid:function(grid) {
  var me = this, store = null;
  Ext.destroy(me.gridListeners);
  if (grid) {
    me.gridListeners = grid.on({reconfigure:me.onGridReconfigure, scope:me, destroyable:true});
    store = grid.getStore();
  }
  me.setStore(store);
}, updateStore:function(store) {
  var me = this;
  Ext.destroy(me.storeListeners);
  if (store) {
    me.storeListeners = store.on({groupchange:me.initGroupingColumns, scope:me, destroyable:true});
    me.initGroupingColumns();
  }
}, onAdd:function(column) {
  this.setInfoElVisibility();
}, onRemove:function() {
  this.setInfoElVisibility();
}, setInfoElVisibility:function() {
  var el = this.infoEl;
  if (!el) {
    return;
  }
  if (!this.items.length) {
    el.show();
  } else {
    el.hide();
  }
}, handleColumnEvent:function(e) {
  var isKeyEvent = this.keyEventRe.test(e.type), fly, cmp;
  if (isKeyEvent && e.getKey() === e.SPACE || e.button === 0) {
    fly = Ext.fly(e.target);
    if (fly && (cmp = fly.component) && cmp.isGroupingPanelColumn) {
      this.showColumnMenu(e, cmp);
    }
  }
}, showColumnMenu:function(e, target) {
  var me = this, grid = me.getGrid(), menu, options;
  Ext.destroy(me.columnMenu);
  menu = me.columnMenu = Ext.menu.Manager.get(me.getColumnMenu(target));
  options = {menu:menu, column:target};
  if (grid.fireEvent('beforeshowgroupingcolumnmenu', me, options) !== false) {
    menu.showBy(target);
    menu.focus();
    grid.fireEvent('showgroupingcolumnmenu', me, options);
  } else {
    Ext.destroy(menu);
  }
  e.stopEvent();
}, getColumnMenu:function(target) {
  var me = this, items = [], owner = target.ownerCt, sibling;
  items.push({text:me.sortAscText, direction:'ASC', iconCls:me.ascSortIconCls, column:target, handler:me.sortColumn}, {text:me.sortDescText, direction:'DESC', iconCls:me.descSortIconCls, column:target, handler:me.sortColumn}, {xtype:'menuseparator'}, {text:me.removeText, handler:Ext.bind(me.removeColumn, me, [target])}, {text:me.moveLeftText, disabled:!(sibling = target.previousSibling()), handler:Ext.bind(me.moveColumn, me, [target, sibling, 'before'])}, {text:me.moveRightText, disabled:!(sibling = 
  target.nextSibling()), handler:Ext.bind(me.moveColumn, me, [target, sibling, 'after'])}, {text:me.moveBeginText, disabled:!(sibling = target.previousSibling()), handler:Ext.bind(me.moveColumn, me, [target, owner.items.first(), 'before'])}, {text:me.moveEndText, disabled:!(sibling = target.nextSibling()), handler:Ext.bind(me.moveColumn, me, [target, owner.items.last(), 'after'])});
  return {defaults:{scope:me}, items:items};
}, showPanelMenu:function(e, target) {
  var me = this, grid = me.getGrid(), isKeyEvent = me.keyEventRe.test(e.type), menu, options;
  Ext.destroy(me.panelMenu);
  target.focus();
  menu = me.panelMenu = Ext.menu.Manager.get(me.getPanelMenu());
  options = {menu:menu};
  if (grid.fireEvent('beforeshowgroupingpanelmenu', me, options) !== false) {
    if (isKeyEvent) {
      menu.showBy(target);
    } else {
      menu.show();
      menu.setPosition(e.getX(), e.getY());
    }
    menu.focus();
    grid.fireEvent('showgroupingpanelmenu', me, options);
  } else {
    Ext.destroy(menu);
  }
  e.stopEvent();
}, getPanelMenu:function() {
  var me = this, items = [], groupers = me.getStore().getGroupers();
  items.push({iconCls:me.groupingPanelIconCls, text:me.hideGroupingPanelText, handler:me.hide}, {iconCls:me.clearGroupIconCls, text:me.clearGroupText, disabled:!groupers || !groupers.length, handler:me.clearGrouping});
  return {defaults:{scope:me}, items:items};
}, clearGrouping:function() {
  var me = this, items = me.items.items, length = items.length, i, item, column;
  for (i = 0; i < length; i++) {
    item = items[i];
    column = item.getColumn();
    if (column) {
      column.show();
    }
  }
  me.getStore().delayedGroup(null);
  me.getHeader().focus();
}, sortColumn:function(target) {
  var grouper = target.column.getGrouper();
  if (grouper) {
    grouper.setDirection(target.direction);
  }
}, isNewColumn:function(col) {
  return this.items.findIndex('idColumn', col.id) < 0;
}, addColumn:function(config, pos, notify) {
  var me = this, colConfig = Ext.apply({}, me.getColumnConfig()), newCol;
  newCol = Ext.create(Ext.apply(colConfig, config));
  if (pos !== -1) {
    me.insert(pos, newCol);
  } else {
    me.add(newCol);
  }
  if (notify === true) {
    newCol.focus();
    me.notifyGroupChange();
  }
}, getColumnPosition:function(column, position) {
  var me = this, pos;
  if (column.isGroupingPanelColumn) {
    pos = me.items.indexOf(column);
    pos = position === 'before' ? pos : pos + 1;
  } else {
    pos = -1;
  }
  return pos;
}, moveColumn:function(from, to, position) {
  var me = this;
  if (from !== to) {
    if (position === 'before') {
      me.moveBefore(from, to);
    } else {
      me.moveAfter(from, to);
    }
    me.notifyGroupChange();
  }
}, removeColumn:function(column) {
  var me = this, col = column.getColumn(), sibling = column.nextSibling() || column.previousSibling() || me.getHeader();
  if (col) {
    col.show();
  }
  if (sibling) {
    sibling.focus();
  }
  me.remove(column, true);
  me.notifyGroupChange();
}, showGridColumn:function(col) {
  col.show();
}, hideGridColumn:function(col) {
  col.hide();
}, notifyGroupChange:function() {
  var me = this, store = me.getStore(), items = me.items.items, length = items.length, groupers = [], i, column, grouper;
  for (i = 0; i < length; i++) {
    column = items[i];
    grouper = column.getGrouper();
    if (grouper) {
      groupers.push(grouper);
    }
  }
  if (!groupers.length) {
    store.clearGrouping();
  } else {
    store.delayedGroup(groupers);
  }
}, onGridReconfigure:function(grid, store) {
  if (store) {
    this.setStore(store);
  }
}, initGroupingColumns:function() {
  var me = this, grid = me.getGrid(), store = me.getStore(), groupers = store.getGroupers(), length = groupers.length, columns = Ext.Array.toValueMap(grid.headerCt.getGridColumns(), 'dataIndex'), i, column, grouper, header;
  me.removeAll(true);
  Ext.suspendLayouts();
  for (i = 0; i < length; i++) {
    grouper = groupers.items[i];
    column = columns[grouper.getProperty()];
    if (column) {
      me.addColumn({header:column.text, idColumn:column.id, grouper:grouper, column:column}, -1);
    }
  }
  Ext.resumeLayouts(true);
}});
Ext.define('Ext.grid.plugin.GroupingPanel', {extend:'Ext.AbstractPlugin', alias:'plugin.groupingpanel', requires:['Ext.grid.plugin.grouping.Panel'], config:{panel:{xtype:'groupingpanel', columnConfig:{xtype:'groupingpanelcolumn'}}, grid:null, view:null}, lockableScope:'top', init:function(grid) {
  this.setGrid(grid);
}, destroy:function() {
  this.setConfig({grid:null, view:null, panel:null});
  this.callParent();
}, enable:function() {
  this.disabled = false;
  this.showGroupingPanel();
}, disable:function() {
  this.disabled = true;
  this.hideGroupingPanel();
}, showGroupingPanel:function() {
  var view;
  this.setup();
  view = this.getView();
  view.show();
}, hideGroupingPanel:function() {
  var view;
  this.setup();
  view = this.getView();
  view.hide();
}, toggleGroupingPanel:function() {
  var view;
  this.setup();
  view = this.getView();
  view.setHidden(!view.isHidden());
}, updateGrid:function(grid, oldGrid) {
  var me = this;
  Ext.destroy(me.gridListeners);
  if (oldGrid) {
    oldGrid.showGroupingPanel = oldGrid.hideGroupingPanel = null;
  }
  if (grid) {
    if (!grid.isXType('gridpanel')) {
      Ext.raise('This plugin is only compatible with grid components');
    }
    grid.showGroupingPanel = Ext.bind(me.showGroupingPanel, me);
    grid.hideGroupingPanel = Ext.bind(me.hideGroupingPanel, me);
    if (grid.rendered) {
      me.onAfterGridRendered();
    } else {
      me.gridListeners = grid.on({afterrender:me.onAfterGridRendered, single:true, scope:me, destroyable:true});
    }
    me.injectGroupingMenu();
  }
}, updateView:function(view, oldView) {
  var panel;
  Ext.destroy(oldView);
  if (view) {
    panel = view.isXType('groupingpanel') ? view : view.down('groupingpanel');
    if (panel) {
      panel.setConfig({grid:this.getGrid()});
    } else {
      Ext.raise('Wrong panel configuration! No "groupingpanel" component available');
    }
  }
}, onAfterGridRendered:function() {
  var me = this;
  if (me.disabled === true) {
    me.disable();
  } else {
    me.enable();
  }
}, injectGroupingMenu:function() {
  var me = this, headerCt = me.getGrid().headerCt;
  headerCt.showMenuBy = Ext.Function.createInterceptor(headerCt.showMenuBy, me.showMenuBy);
  headerCt.getMenuItems = me.getMenuItems();
}, showMenuBy:function(clickEvent, t, header) {
  var me = this, menuItem = me.getMenu().down('#groupingPanel'), panel = me.grid.down('groupingpanel');
  if (panel && menuItem) {
    menuItem.setText(panel.isHidden() ? panel.showGroupingPanelText : panel.hideGroupingPanelText);
  }
}, getMenuItems:function() {
  var me = this, view = me.getView(), getMenuItems = me.getGrid().headerCt.getMenuItems;
  return function() {
    var o = getMenuItems.call(this);
    o.push('-', {iconCls:view ? view.groupingPanelIconCls : Ext.baseCSSPrefix + 'grid-group-panel-icon', itemId:'groupingPanel', text:me.groupsText, handler:me.toggleGroupingPanel, scope:me});
    return o;
  };
}, privates:{setup:function() {
  var me = this, ret;
  if (me.doneSetup) {
    return;
  }
  me.doneSetup = true;
  ret = me.getGrid().addDocked(me.getPanel());
  ret = ret && ret.length ? ret[0] : ret;
  me.setView(ret);
}}});
Ext.define('Ext.grid.plugin.Summaries', {extend:'Ext.AbstractPlugin', alias:'plugin.summaries', requires:['Ext.data.summary.*', 'Ext.menu.Menu', 'Ext.menu.CheckItem'], lockableScope:'top', enableContextMenu:true, enableSummaryMenu:true, textNone:'None', summaryText:'Summary', init:function(grid) {
  var me = this;
  me.callParent([grid]);
  me.grid = grid;
  me.gridListeners = me.grid.on({groupcontextmenu:me.onGroupContextMenu, groupsummarycontextmenu:me.onGroupSummaryContextMenu, summarycontextmenu:me.onSummaryContextMenu, collectheadermenuitems:me.onCollectMenuItems, showheadermenuitems:me.onShowHeaderMenu, scope:me, destroyable:true});
}, destroy:function() {
  var me = this;
  Ext.destroyMembers(me, 'gridListeners', 'contextMenu');
  me.grid = null;
  me.callParent();
}, onGroupContextMenu:function(grid, params) {
  var pos = params.feature.groupSummaryPosition;
  if (pos === 'hide') {
    return;
  }
  if (pos === 'top' || params.group.isCollapsed && pos === 'bottom') {
    this.showMenu(params);
  }
}, onGroupSummaryContextMenu:function(grid, params) {
  this.showMenu(params);
}, onSummaryContextMenu:function(grid, params) {
  this.showMenu(params);
}, showMenu:function(params) {
  var me = this, grid = params.grid, target = params.cell, column = params.column, groupIndex = params.feature.groupingColumn && params.feature.groupingColumn.getIndex(), e = params.e, menu, options;
  if (!me.enableContextMenu || !column.dataIndex || groupIndex >= 0 && groupIndex >= column.getIndex()) {
    return;
  }
  menu = me.getSummaryMenu(params);
  if (!menu) {
    return;
  }
  Ext.destroy(me.contextMenu);
  menu = me.contextMenu = Ext.menu.Manager.get(menu);
  options = {menu:menu, params:params};
  if (grid.fireEvent('beforeshowsummarycontextmenu', me, options) !== false) {
    menu.showBy(target);
    menu.focus();
    grid.fireEvent('showsummarycontextmenu', me, options);
  } else {
    Ext.destroy(menu);
  }
  e.stopEvent();
}, getSummaryMenu:function(params) {
  var me = this, summaries = params.column.getListOfSummaries(), summaryType = me.getSummaryFieldType(params.column.dataIndex), items = [{text:me.textNone, summary:null, checked:!summaryType}], i, len, fns, value;
  fns = me.fns = me.fns || {};
  if (!summaries || !summaries.length) {
    return false;
  }
  len = summaries.length;
  for (i = 0; i < len; i++) {
    value = summaries[i];
    if (!fns[value]) {
      fns[value] = Ext.Factory.dataSummary(value);
    }
    items.push({text:fns[value].text, summary:fns[value], checked:summaryType === fns[value].type});
  }
  return {defaults:{xtype:'menucheckitem', column:params.column, dataIndex:params.column.dataIndex, handler:me.onChanceSummary, group:'summaries', scope:me}, items:items};
}, onChanceSummary:function(menu) {
  var store = this.grid.getStore(), column = menu.column, model = store.model.getSummaryModel();
  column.summaryType = null;
  if (column.onSummaryChange) {
    column.onSummaryChange(menu.summary);
  }
  model.setSummary(menu.dataIndex, menu.summary);
  if (store.getRemoteSummary()) {
    store.reload();
  } else {
    if (model) {
      store.fireEvent('summarieschanged', store);
    }
  }
}, getSummaryFieldType:function(name) {
  var store = this.grid.getStore(), model = store.model.getSummaryModel(), field = model.getField(name), summary = field ? field.getSummary() : false;
  return summary ? summary.type : false;
}, onCollectMenuItems:function(grid, params) {
  params.items.push({text:this.summaryText, itemId:'summaryMenuItem'});
}, onShowHeaderMenu:function(grid, params) {
  var menuItem = params.menu.down('#summaryMenuItem');
  if (!menuItem) {
    return;
  }
  menuItem.setVisible(!params.column.isGroupsColumn);
  menuItem.setMenu(this.getSummaryMenu(params));
}});
