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
Ext.define('Ext.overrides.dataview.ItemHeader', {override:'Ext.dataview.ItemHeader', updateGroup:function(group) {
  var me = this, data, grouper, html, list, tpl, parent;
  if (group) {
    list = me.parent;
    parent = group;
    while (parent && parent.isGroup) {
      grouper = parent.getGrouper();
      tpl = grouper && grouper.owner === list && grouper.headerTpl || me.getTpl();
      if (tpl) {
        data = me.getGroupHeaderTplData(false, parent);
        html = tpl.apply(data) + (html ? ' \x3e ' + html : '');
      }
      parent = parent.getParent();
    }
  }
  me.setHtml(html || ' ');
}, privates:{getGroupHeaderTplData:function(skipHtml, group) {
  var data;
  group = group || this.getGroup();
  data = group && {name:group.getGroupKey(), group:group, groupField:group.getGrouper().getProperty(), children:group.items, count:group.length};
  if (data) {
    data.value = group.getLabel();
    if (!skipHtml) {
      data.html = Ext.htmlEncode(data.name);
    }
    data.groupValue = data.value;
  }
  return data;
}}});
Ext.define('Ext.overrides.dataview.List', {override:'Ext.dataview.List', updateStore:function(store, oldStore) {
  var me = this, groupers;
  me.callSuper([store, oldStore]);
  if (store) {
    if (me.isConfiguring && this.getGrouped() != null) {
      return;
    }
    groupers = store.getGroupers();
    this.setGrouped(!!(groupers && groupers.length));
  }
}, privates:{isGrouping:function() {
  var store = this.getGrouped() && this.store, groupers = store && store.getGroupers();
  return !!(groupers && groupers.length);
}, refreshGroupIndices:function() {
  var me = this, store = me.store, groups = me.isGrouping() ? store.getGroups() : null, groupingInfo = me.groupingInfo, footers = groupingInfo.footers, headers = groupingInfo.headers, groupCount = groups && groups.length;
  me.groups = groups;
  if (groupCount) {
    headers.map = {};
    headers.indices = [];
    footers.map = {};
    footers.indices = [];
    this.refreshBottomGroupIndices(groups);
  } else {
    headers.map = headers.indices = footers.map = footers.indices = null;
  }
}, refreshBottomGroupIndices:function(groups) {
  var length = groups.length, store = this.store, groupingInfo = this.groupingInfo, footers = groupingInfo.footers, headers = groupingInfo.headers, headerMap = headers.map, headerIndices = headers.indices, footerMap = footers.map, footerIndices = footers.indices, bottom = false, i, group, children, firstRecordIndex, previous;
  for (i = 0; i < length; i++) {
    group = groups.getAt(i);
    children = group.getGroups();
    if (children && children.length) {
      previous = this.refreshBottomGroupIndices(children);
    } else {
      bottom = true;
      firstRecordIndex = store.indexOf(group.first());
      headerIndices.push(firstRecordIndex);
      headerMap[firstRecordIndex] = group;
      if (previous) {
        footerIndices.push(firstRecordIndex - 1);
        footerMap[firstRecordIndex - 1] = previous;
      }
      previous = group;
    }
  }
  if (bottom) {
    i = store.indexOf(group.last());
    footerIndices.push(i);
    footerMap[i] = group;
  }
  return previous;
}}});
Ext.define('Ext.overrides.grid.RowHeader', {override:'Ext.grid.RowHeader', privates:{getGroupHeaderTplData:function(skipHtml, group) {
  var data = this.callSuper([true, group]), grid = this.parent, column = data && grid.getColumnForField(data.groupField);
  if (column) {
    data.columnName = column.getText();
    if (column.printValue) {
      data.html = column.printValue(data.value);
    }
  } else {
    if (data) {
      data.html = Ext.htmlEncode(data.name);
    }
  }
  return data;
}}});
Ext.define('Ext.overrides.grid.column.Column', {override:'Ext.grid.column.Column', pickSorter:function() {
  var me = this, store = me.getGrid().getStore(), result, groupers;
  if (store.isGrouped()) {
    groupers = store.getGroupers();
    if (groupers && (result = groupers.get(me.getDataIndex()))) {
      me.sortState = result.getDirection();
    } else {
      result = me.getSorter();
    }
  } else {
    result = me.getSorter();
  }
  return result;
}, setSortDirection:function(direction) {
  var me = this, grid = me.getGrid(), store = grid.getStore(), sorter = me.pickSorter(), sorters = store.getSorters(true), isSorted = sorter && (sorters.contains(sorter) || sorter.isGrouper);
  if (direction) {
    if (isSorted) {
      if (sorter.getDirection() !== direction) {
        sorter.setDirection(direction);
        if (sorter.isGrouper) {
        } else {
          sorters.beginUpdate();
          sorters.endUpdate();
        }
      }
    } else {
      return me.sort(direction);
    }
  } else {
    if (sorter) {
      sorters.remove(sorter);
    }
  }
  if (!store.getRemoteSort()) {
    me.getRootHeaderCt().setSortState();
  }
}, onColumnTap:function(e) {
  var me = this, grid = me.getGrid(), selModel = grid.getSelectable(), store = grid.getStore(), sorters = store && store.getSorters(true), sorter = store && me.pickSorter(), sorterIndex = sorter ? sorters.indexOf(sorter) : -1, isSorted = sorter && (sorterIndex !== -1 || sorter === store.getGrouper());
  if (Ext.Component.from(e) !== me || e.getTarget('.' + Ext.baseCSSPrefix + 'item-no-tap', me)) {
    return;
  }
  if (store && me.isSortable() && (!selModel || !selModel.getColumns())) {
    if (sorter && sorter.isGrouper) {
      sorter.toggle();
    } else {
      if (sorterIndex === 0) {
        me.toggleSortState();
      } else {
        if (isSorted) {
          store.sort(sorter, 'prepend');
        } else {
          me.sort('ASC');
        }
      }
    }
  }
  return me.fireEvent('tap', me, e);
}, privates:{sort:function(direction, mode) {
  var me = this, sorter = me.pickSorter(), grid = me.getGrid(), store = grid.getStore(), sorters = store.getSorters();
  if (!me.isSortable()) {
    return;
  }
  if (sorter.isGrouper) {
    if (sorter.getDirection() !== direction) {
      sorter.toggle();
    }
  } else {
    if (direction) {
      if (sorter) {
        if (sorters.indexOf(sorter) !== 0) {
          sorter.setDirection(direction);
        }
      } else {
        me.setSorter({property:me.getSortParam(), direction:'ASC'});
        sorter = me.getSorter();
      }
      store.sort(sorter, mode || grid.getMultiColumnSort() ? 'multi' : 'replace');
    } else {
      if (sorter) {
        sorters.remove(sorter);
        if (!store.getRemoteSort()) {
          me.getRootHeaderCt().setSortState();
        }
      }
    }
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
Ext.define('Ext.grid.SummaryRows', {extend:'Ext.Container', xtype:'gridsummaryrows', requires:['Ext.grid.plugin.SummaryRow'], isSummaryRow:true, config:{group:null}, updateGroup:function() {
  this.syncSummary();
}, getColumns:function() {
  return this.getParent().getColumns();
}, getHeaderContainer:function() {
  return this.getParent().getHeaderContainer();
}, getGrid:function() {
  return this.getParent();
}, privates:{syncSummary:function() {
  var me = this, group = me.getGroup(), items = me.items, owner, i, parent, item, groups;
  if (items.length) {
    while (items.length > 1) {
      item = me.getAt(1);
      delete item.getGrid;
      delete item.getParent;
      me.remove(item);
    }
  } else {
    parent = me.getParent();
    item = me.add({$initParent:parent, ownerCmp:parent, grid:parent, xtype:'gridsummaryrow'});
    item.getGrid = item.getParent = Ext.bind(me.getGrid, me);
  }
  if (!group) {
    return;
  }
  items.getAt(0).setGroup(group);
  owner = group.getParent();
  groups = owner.getGroups();
  if (owner && owner.isGroup && groups && groups.last() === group) {
    while (owner && owner.isGroup) {
      parent = me.getParent();
      item = me.add({$initParent:parent, ownerCmp:parent, list:parent, xtype:'gridsummaryrow'});
      item.getGrid = item.getParent = Ext.bind(me.getGrid, me);
      item.setGroup(owner);
      owner = owner.getParent();
    }
  }
  me.$height = null;
  me.getParent().variableHeights = true;
}}});
