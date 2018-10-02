(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*! Backbone.Mutators - v0.4.4
------------------------------
Build @ 2015-02-03
Documentation and Full License Available at:
http://asciidisco.github.com/Backbone.Mutators/index.html
git://github.com/asciidisco/Backbone.Mutators.git
Copyright (c) 2015 Sebastian Golasch <public@asciidisco.com>

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the

Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.*/
(function (root, factory, undef) {
    'use strict';

    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('underscore'), require('backbone'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'backbone'], function (_, Backbone) {
            // Check if we use the AMD branch of Back
            _ = _ === undef ? root._ : _;
            Backbone = Backbone === undef ? root.Backbone : Backbone;
            return (root.returnExportsGlobal = factory(_, Backbone, root));
        });
    } else {
        // Browser globals
        root.returnExportsGlobal = factory(root._, root.Backbone);
    }

// Usage:
//
// Note: This plugin is UMD compatible, you can use it in node, amd and vanilla js envs
//
// Vanilla JS:
// <script src="underscore.js"></script>
// <script src="backbone.js"></script>
// <script src="backbone.mutators.js"></script>
//
// Node:
// var _ = require('underscore');
// var Backbone = require('backbone');
// var Mutators = require('backbone.mutators');
//
//
// AMD:
// define(['underscore', 'backbone', 'backbone.mutators'], function (_, Backbone, Mutators) {
//    // insert sample from below
//    return User;
// });
//
// var User = Backbone.Model.extend({
//    mutators: {
//        fullname: function () {
//            return this.firstname + ' ' + this.lastname;
//        }
//    },
//
//    defaults: {
//        firstname: 'Sebastian',
//        lastname: 'Golasch'
//    }
// });
//
// var user = new User();
// user.get('fullname') // returns 'Sebastian Golasch'
// user.toJSON() // return '{firstname: 'Sebastian', lastname: 'Golasch', fullname: 'Sebastian Golasch'}'

}(this, function (_, Backbone, root, undef) {
    'use strict';

    // check if we use the amd branch of backbone and underscore
    Backbone = Backbone === undef ? root.Backbone : Backbone;
    _ = _ === undef ? root._ : _;

    // extend backbones model prototype with the mutator functionality
    var Mutator     = function () {},
        oldGet      = Backbone.Model.prototype.get,
        oldSet      = Backbone.Model.prototype.set,
        oldToJson   = Backbone.Model.prototype.toJSON;

    // This is necessary to ensure that Models declared without the mutators object do not throw and error
    Mutator.prototype.mutators = {};

    // override get functionality to fetch the mutator props
    Mutator.prototype.get = function (attr) {
        var isMutator = this.mutators !== undef;

        // check if we have a getter mutation
        if (isMutator === true && _.isFunction(this.mutators[attr]) === true) {
            return this.mutators[attr].call(this);
        }

        // check if we have a deeper nested getter mutation
        if (isMutator === true && _.isObject(this.mutators[attr]) === true && _.isFunction(this.mutators[attr].get) === true) {
            return this.mutators[attr].get.call(this);
        }

        return oldGet.call(this, attr);
    };

    // override set functionality to set the mutator props
    Mutator.prototype.set = function (key, value, options) {
        var isMutator = this.mutators !== undef,
            ret = null,
            attrs = null;

		ret = oldSet.call(this, key, value, options);

        // seamleassly stolen from backbone core
        // check if the setter action is triggered
        // using key <-> value or object
        if (_.isObject(key) || key === null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }

        // check if we have a deeper nested setter mutation
        if (isMutator === true && _.isObject(this.mutators[key]) === true) {

            // check if we need to set a single value
            if (_.isFunction(this.mutators[key].set) === true) {
                ret = this.mutators[key].set.call(this, key, attrs[key], options, _.bind(oldSet, this));
            } else if(_.isFunction(this.mutators[key])){
                ret = this.mutators[key].call(this, key, attrs[key], options, _.bind(oldSet, this));
            }
        }

        if (isMutator === true && _.isObject(attrs)) {
            _.each(attrs, _.bind(function (attr, attrKey) {
                if (_.isObject(this.mutators[attrKey]) === true) {
                    // check if we need to set a single value

                    var meth = this.mutators[attrKey];
                    if(_.isFunction(meth.set)){
                        meth = meth.set;
                    }

                    if(_.isFunction(meth)){
                        if (options === undef || (_.isObject(options) === true && options.silent !== true && (options.mutators !== undef && options.mutators.silent !== true))) {
                            this.trigger('mutators:set:' + attrKey);
                        }
                        meth.call(this, attrKey, attr, options, _.bind(oldSet, this));
                    }

                }
            }, this));
        }

        return ret;
    };

    // override toJSON functionality to serialize mutator properties
    Mutator.prototype.toJSON = function (options) {
        // fetch ye olde values
        var attr = oldToJson.call(this),
            isSaving,
            isTransient;
        // iterate over all mutators (if there are some)
        _.each(this.mutators, _.bind(function (mutator, name) {
            // check if we have some getter mutations
            if (_.isObject(this.mutators[name]) === true && _.isFunction(this.mutators[name].get)) {
                isSaving = (this.isSaving) ? this.isSaving(options, mutator, name) : _.has(options || {}, 'emulateHTTP');
                isTransient = this.mutators[name].transient;
                if (!isSaving || !isTransient) {
                  attr[name] = _.bind(this.mutators[name].get, this)();
                }
            } else if (_.isFunction(this.mutators[name])) {
                attr[name] = _.bind(this.mutators[name], this)();
            }
        }, this));

        return attr;
    };

    // override get functionality to get HTML-escaped the mutator props
    Mutator.prototype.escape = function (attr){
        var val = this.get(attr);
        return _.escape(val == null ? '' : '' + val);
    };

    // extend the models prototype
    _.extend(Backbone.Model.prototype, Mutator.prototype);

    // make mutators globally available under the Backbone namespace
    Backbone.Mutators = Mutator;
    return Mutator;
}));

},{"backbone":5,"underscore":2}],2:[function(require,module,exports){
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}],3:[function(require,module,exports){
// Backbone.BabySitter
// -------------------
// v0.1.11
//
// Copyright (c)2016 Derick Bailey, Muted Solutions, LLC.
// Distributed under MIT license
//
// http://github.com/marionettejs/backbone.babysitter

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore'], function(Backbone, _) {
      return factory(Backbone, _);
    });
  } else if (typeof exports !== 'undefined') {
    var Backbone = require('backbone');
    var _ = require('underscore');
    module.exports = factory(Backbone, _);
  } else {
    factory(root.Backbone, root._);
  }

}(this, function(Backbone, _) {
  'use strict';

  var previousChildViewContainer = Backbone.ChildViewContainer;

  // BabySitter.ChildViewContainer
  // -----------------------------
  //
  // Provide a container to store, retrieve and
  // shut down child views.
  
  Backbone.ChildViewContainer = (function (Backbone, _) {
  
    // Container Constructor
    // ---------------------
  
    var Container = function(views){
      this._views = {};
      this._indexByModel = {};
      this._indexByCustom = {};
      this._updateLength();
  
      _.each(views, this.add, this);
    };
  
    // Container Methods
    // -----------------
  
    _.extend(Container.prototype, {
  
      // Add a view to this container. Stores the view
      // by `cid` and makes it searchable by the model
      // cid (and model itself). Optionally specify
      // a custom key to store an retrieve the view.
      add: function(view, customIndex){
        var viewCid = view.cid;
  
        // store the view
        this._views[viewCid] = view;
  
        // index it by model
        if (view.model){
          this._indexByModel[view.model.cid] = viewCid;
        }
  
        // index by custom
        if (customIndex){
          this._indexByCustom[customIndex] = viewCid;
        }
  
        this._updateLength();
        return this;
      },
  
      // Find a view by the model that was attached to
      // it. Uses the model's `cid` to find it.
      findByModel: function(model){
        return this.findByModelCid(model.cid);
      },
  
      // Find a view by the `cid` of the model that was attached to
      // it. Uses the model's `cid` to find the view `cid` and
      // retrieve the view using it.
      findByModelCid: function(modelCid){
        var viewCid = this._indexByModel[modelCid];
        return this.findByCid(viewCid);
      },
  
      // Find a view by a custom indexer.
      findByCustom: function(index){
        var viewCid = this._indexByCustom[index];
        return this.findByCid(viewCid);
      },
  
      // Find by index. This is not guaranteed to be a
      // stable index.
      findByIndex: function(index){
        return _.values(this._views)[index];
      },
  
      // retrieve a view by its `cid` directly
      findByCid: function(cid){
        return this._views[cid];
      },
  
      // Remove a view
      remove: function(view){
        var viewCid = view.cid;
  
        // delete model index
        if (view.model){
          delete this._indexByModel[view.model.cid];
        }
  
        // delete custom index
        _.any(this._indexByCustom, function(cid, key) {
          if (cid === viewCid) {
            delete this._indexByCustom[key];
            return true;
          }
        }, this);
  
        // remove the view from the container
        delete this._views[viewCid];
  
        // update the length
        this._updateLength();
        return this;
      },
  
      // Call a method on every view in the container,
      // passing parameters to the call method one at a
      // time, like `function.call`.
      call: function(method){
        this.apply(method, _.tail(arguments));
      },
  
      // Apply a method on every view in the container,
      // passing parameters to the call method one at a
      // time, like `function.apply`.
      apply: function(method, args){
        _.each(this._views, function(view){
          if (_.isFunction(view[method])){
            view[method].apply(view, args || []);
          }
        });
      },
  
      // Update the `.length` attribute on this container
      _updateLength: function(){
        this.length = _.size(this._views);
      }
    });
  
    // Borrowing this code from Backbone.Collection:
    // http://backbonejs.org/docs/backbone.html#section-106
    //
    // Mix in methods from Underscore, for iteration, and other
    // collection related features.
    var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter',
      'select', 'reject', 'every', 'all', 'some', 'any', 'include',
      'contains', 'invoke', 'toArray', 'first', 'initial', 'rest',
      'last', 'without', 'isEmpty', 'pluck', 'reduce'];
  
    _.each(methods, function(method) {
      Container.prototype[method] = function() {
        var views = _.values(this._views);
        var args = [views].concat(_.toArray(arguments));
        return _[method].apply(_, args);
      };
    });
  
    // return the public API
    return Container;
  })(Backbone, _);
  

  Backbone.ChildViewContainer.VERSION = '0.1.11';

  Backbone.ChildViewContainer.noConflict = function () {
    Backbone.ChildViewContainer = previousChildViewContainer;
    return this;
  };

  return Backbone.ChildViewContainer;

}));

},{"backbone":5,"underscore":51}],4:[function(require,module,exports){
/**
 * Backbone.Native
 *
 * For all details and documentation:
 * http://github.com/inkling/backbone.native
 *
 * Copyright 2013 Inkling Systems, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The purpose of this library is to allow Backbone to work without needing to load jQuery or Zepto.
 * This file provides a basic jQuery-like implementation for Backbone, implementing the
 * minimum functionality for Backbone to function. We assume that Backbone applications using
 * this will not expect the standard jQuery API to work, and will instead use native JS functions.
 *
 * Keep in mind that due to the APIs in this, it will likely only work on recent browsers.
 *
 * Note:
 *  - Core Backbone only needs collections with single members, so that is all that has been
 *      supported in this library. It is expected that you will just use querySelectorAll instead.
 *      This will be most obvious if you make heavy use of 'view.$'.
 *  - Events delegated with selectors starting with '>' are not supported.
 *  - Due to 'currentTarget' being read-only on standard DOM events, we cannot make standard
 *      events behave identically to jQuery's events when delegation is used. The element matching
 *      the delegate selector is instead passed as the second argument to event handlers.
 *  - The '$.ajax' implementation is very simple and likely needs to be expanded to better support
 *      standard use-cases.
 *
 * Tested with Backbone v0.9.2 and 1.0.0.
 */
(function(){
    "use strict";

    // Regular expression to match an event name and/or a namespace.
    var namespaceRE = /^([^.]+)?(?:\.([^.]+))?$/;

    var matchesSelector = Element.prototype.matchesSelector || null;
    if (!matchesSelector){
        ['webkit', 'moz', 'o', 'ms'].forEach(function(prefix){
            var func = Element.prototype[prefix + 'MatchesSelector'];
            if (func) matchesSelector = func;
        });
    }

    // The element property to save the cache key on.
    var cacheKeyProp = 'backboneNativeKey' + Math.random();
    var id = 1;
    var handlers = {};
    var unusedKeys = [];

    /**
     * Get the event handlers for a given element, creating an empty set if one doesn't exist.
     *
     * To avoid constantly filling the handlers object with null values, we reuse old IDs that
     * have been created and then cleared.
     *
     * @param {Element} el The element to get handlers for.
     *
     * @return {Array} An array of handlers.
     */
    function handlersFor(el){
        if (!el[cacheKeyProp]){
            // Pick a new key, from the unused pool, or make a new one.
            el[cacheKeyProp] = unusedKeys.length === 0 ? ++id : unusedKeys.pop();
        }

        var cacheKey = el[cacheKeyProp];
        return handlers[cacheKey] || (handlers[cacheKey] = []);
    }

    /**
     * Clear the event handlers for a given element.
     *
     * @param {Element} el The element to clear.
     */
    function clearHandlers(el){
        var cacheKey = el[cacheKeyProp];
        if (handlers[cacheKey]){
            handlers[cacheKey] = null;
            el[cacheKeyProp] = null;
            unusedKeys.push(cacheKey);
        }
    }

    /**
     * Add event handlers to an element.
     *
     * @param {Element} parentElement The element to bind event handlers to.
     * @param {string} eventName The event to bind, e.g. 'click'.
     * @param {string} selector (Optional) The selector to match when an event propagates up.
     * @param {function(Event, Element)} callback The function to call when the event is fired.
     */
    function on(parentElement, eventName, selector, callback){
        // Adjust arguments if selector was not provided.
        if (typeof selector === 'function'){
            callback = selector;
            selector = null;
        }

        var parts = namespaceRE.exec(eventName);
        eventName = parts[1] || null;
        var namespace = parts[2] || null;

        if (!eventName) return;

        var handler = callback;
        var originalCallback = callback;
        if (selector){
            // Event delegation handler to match a selector for child element events.
            handler = function(event){
                for (var el = event.target; el && el !== parentElement; el = el.parentElement){
                    if (matchesSelector.call(el, selector)){
                        // jQuery does not include the second argument, but we have included it
                        // for simplicity because 'this' will likely be bound to the view inside
                        // the callback, and as noted above, we cannot override 'currentTarget'.
                        var result = originalCallback.call(el, event, el);
                        if (result === false){
                            event.stopPropagation();
                            event.preventDefault();
                        }
                        return result;
                    }
                }
            };
        } else {
            // Standard event handler bound directly to the element.
            handler = function(event){
                var result = originalCallback.call(parentElement, event, parentElement);
                if (result === false){
                    event.stopPropagation();
                    event.preventDefault();
                }
                return result;
            };
        }

        parentElement.addEventListener(eventName, handler, false);

        // Save event handler metadata so that the handler can be unbound later.
        handlersFor(parentElement).push({
            eventName: eventName,
            callback: callback,
            handler: handler,
            namespace: namespace,
            selector: selector
        });
    }

    /**
     * Remove an event handler from an element.
     *
     * @param {Element} parentElement The element to unbind event handlers from.
     * @param {string} eventName (Optional) The event to unbind, e.g. 'click'.
     * @param {string} selector (Optional) The selector to unbind.
     * @param {function(Event, Element)} callback (Optional) The function to unbind.
     */
    function off(parentElement, eventName, selector, callback){
        if (typeof selector === 'function'){
            callback = selector;
            selector = null;
        }

        var parts = namespaceRE.exec(eventName || '');
        eventName = parts[1];
        var namespace = parts[2];
        var handlers = handlersFor(parentElement) || [];

        if (!eventName && !namespace && !selector && !callback){
            // Fastpath to remove all handlers.
            handlers.forEach(function(item){
                parentElement.removeEventListener(item.eventName, item.handler, false);
            });
            clearHandlers(parentElement);
        } else {
            var matchedHandlers = handlers.filter(function(item){
                return ((!namespace || item.namespace === namespace) &&
                    (!eventName || item.eventName === eventName) &&
                    (!callback || item.callback === callback) &&
                    (!selector || item.selector === selector));
            });

            matchedHandlers.forEach(function(item){
                parentElement.removeEventListener(item.eventName, item.handler, false);

                handlers.splice(handlers.indexOf(item), 1);
            });

            if (handlers.length === 0) clearHandlers(parentElement);
        }
    }

    /**
     * Construct a new jQuery-style element representation.
     *
     * @param {string|Element|Window} element There are several different possible values for this
     *      argument:
     *      - {string} A snippet of HTML, if it starts with a '<', or a selector to find.
     *      - {Element} An existing element to wrap.
     *      - {Window} The window object to wrap.
     * @param {Element} context The context to search within, if a selector was given.
     *      Defaults to document.
     */
    function $(element, context){
        context = context || document;

        // Call as a constructor if it was used as a function.
        if (!(this instanceof $)) return new $(element, context);

        if (!element){
            this.length = 0;
        } else if (typeof element === 'string'){
            if (/^\s*</.test(element)){
                // Parse arbitrary HTML into an element.
                var div = document.createElement('div');
                div.innerHTML = element;
                this[0] = div.firstChild;
                div.removeChild(div.firstChild);
                this.length = 1;
            } else {
                this[0] = context.querySelector(element);
                this.length = 1;
            }
        } else {
            // This handles both the 'Element' and 'Window' case, as both support
            // event binding via 'addEventListener'.
            this[0] = element;
            this.length = 1;
        }
    }

    $.prototype = {
        /**
         * The following methods are used by Backbone, but only in code-paths for IE 6/7 support.
         * Since none of this will work for old IE anyway, they are not implemented, and
         * instead left for documentation purposes.
         *
         * Used in Backbone.History.prototype.start.
         */
        hide: null,
        appendTo: null,

        /**
         * Find is not supported to encourage the use of querySelector(All) as an alternative.
         *
         * e.g.
         * Instead of 'this.$(sel)', use 'this.el.querySelectorAll(sel)'.
         *
         * Used in Backbone.View.prototype.$, but not actually called internally.
         */
        find: null,

        /**
         * Add attributes to the element.
         *
         * Used in Backbone.View.prototype.make.
         *
         * @param {Object} attributes A set of attributes to apply to the element.
         *
         * @return {$} This instance.
         */
        attr: function(attrs){
            Object.keys(attrs).forEach(function(attr){
                switch (attr){
                    case 'html':
                        this[0].innerHTML = attrs[attr];
                        break;
                    case 'text':
                        this[0].textContent = attrs[attr];
                        break;
                    case 'class':
                        this[0].className = attrs[attr];
                        break;
                    default:
                        this[0].setAttribute(attr, attrs[attr]);
                        break;
                }
            }, this);
            return this;
        },

        /**
         * Set the HTML content of the element. Backbone does not use the no-argument version
         * to read innerHTML, so that has not been implemented.
         *
         * Used in Backbone.View.prototype.make.
         *
         * @param {string} html The HTML to set as the element content.
         *
         * @return {$} This instance.
         */
        html: function(html){
            this[0].innerHTML = html;
            return this;
        },

        /**
         * Remove an element from the DOM and remove all event handlers bound to it and
         * its child elements.
         *
         * Used in Backbone.View.prototype.remove.
         *
         * @return {$} This instance.
         */
        remove: function(){
            var el = this[0];
            if (el.parentElement) el.parentElement.removeChild(el);

            // Unbind all event handlers on the element and children.
            (function removeChildEvents(element){
                off(element);

                for (var i = 0, len = element.childNodes.length; i < len; i++){
                    if (element.childNodes[i].nodeType !== Node.TEXT_NODE){
                        removeChildEvents(element.childNodes[i]);
                    }
                }
            })(el);

            return this;
        },

        /**
         * Bind an event handler to this element.
         *
         * @param {string} eventName The event to bind, e.g. 'click'.
         * @param {string} selector (Optional) The selector to match when an event propagates up.
         * @param {function(Event, Element)} callback The function to call when the event is fired.
         */
        on: function(eventName, selector, callback){
            on(this[0], eventName, selector, callback);
            return this;
        },

        /**
         * Unbind an event handler to this element.
         *
         * @param {string} eventName (Optional) The event to unbind, e.g. 'click'.
         * @param {string} selector (Optional) The selector to unbind.
         * @param {function(Event, Element)} callback (Optional) The function to unbind.
         */
        off: function(eventName, selector, callback){
            off(this[0], eventName, selector, callback);
            return this;
        },

        // Backbone v0.9.2 support.
        bind: function(eventName, callback){
            return this.on(eventName, callback);
        },
        unbind: function(eventName, callback){
            return this.off(eventName, callback);
        },
        delegate: function(selector, eventName, callback){
            return this.on(eventName, selector, callback);
        },
        undelegate: function(selector, eventName, callback){
            return this.off(eventName, selector, callback);
        }
    };

    /**
     * Send an AJAX request.
     *
     * @param {Object} options The options to use for the connection:
     *      - {string} url The URL to connect to.
     *      - {string} type The type of request, e.g. 'GET', or 'POST'.
     *      - {string} dataType The type of data expected, 'json'.
     *      - {string} contentType The content-type of the data.
     *      - {string|object} data The content to send.
     *      - {function(XMLHttpRequest)} beforeSend A callback to call before sending.
     *      - {boolean} processData True if 'data' should be converted
     *          to a query string from an object.
     *      - {function({string|object}, {string}, {XMLHttpRequest})} success The success callback.
     *      - {function({XMLHttpRequest})} error The error callback.
     */
    $.ajax = function(options){
        options = options || {};
        var type = options.type || 'GET';
        var url = options.url;
        var processData = options.processData === undefined ? true : !!options.processData;

        // Process the data for sending.
        var data = options.data;
        if (processData && typeof data === 'object'){
            var params = Object.keys(data).map(function(prop){
                return encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]);
            });
            data = params.join('&');
        }

        // Data for GET and HEAD goes in the URL.
        if (data && (type === 'GET' || type === 'HEAD')){
            url += (url.indexOf('?') === -1 ? '?' : '&') + data;
            data = undefined;
        }

        var xhr = new XMLHttpRequest();
        xhr.open(type, url, true);

        if (options.contentType) xhr.setRequestHeader('Content-Type', options.contentType);
        if (options.beforeSend) options.beforeSend(xhr);

        xhr.onload = function(){
            var error = false;
            var content = xhr.responseText;

            // Parse the JSON before calling success.
            if (options.dataType === 'json'){
                try {
                    content = JSON.parse(content);
                } catch (e){
                    error = true
                }
            }

            if (!error && (xhr.status >= 200 && xhr.status < 300)){
                // The last two arguments only apply to v0.9.2.
                if (options.success) options.success(content, xhr.statusText, xhr);
            } else {
                // This signature is inconsistent with v0.9.2, but is correct for 1.0.0.
                if (options.error) options.error(xhr);
            }
        }.bind(this);

        xhr.onerror = xhr.onabort = function(){
            if (options.error) options.error(xhr);
        };

        xhr.send(data);

        return xhr;
    };

    // Expose on/off for external use with having to instantiate a wrapper.
    $.on = on;
    $.off = off;

    if(typeof exports !== 'undefined') {
      return module.exports = $;
    }

    var root = this;
    var originalBackboneNative = root.Backbone ? root.Backbone.Native : null;
    var original$ = root.$;
    if (root.Backbone) root.Backbone.Native = $;
    root.$ = $;

    $.noConflict = function(deep){
        root.$ = original$;
        if (deep) root.Backbone.Native = originalBackboneNative;
        return $;
    };

    if (root.Backbone){
        if (root.Backbone.setDomLibrary){ // v0.9.2
            root.Backbone.setDomLibrary($);
        } else { // v1.0.0
            root.Backbone.$ = $;
        }
    }
}).call(this);

},{}],5:[function(require,module,exports){
//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

},{"underscore":51}],6:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20170427
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in window.self) {

// Full polyfill for browsers with no classList support
// Including IE < Edge missing SVGElement.classList
if (!("classList" in document.createElement("_")) 
	|| document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (index !== -1) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		// adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
		// modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
		if (ex.number === undefined || ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(window.self));

}

// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	testElement = null;
}());

}

},{}],7:[function(require,module,exports){
/* MIT license */
var cssKeywords = require('color-name');

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in cssKeywords) {
	if (cssKeywords.hasOwnProperty(key)) {
		reverseKeywords[cssKeywords[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var v;

	if (max === 0) {
		s = 0;
	} else {
		s = (delta / max * 1000) / 10;
	}

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	v = ((max / 255) * 1000) / 10;

	return [h, s, v];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in cssKeywords) {
		if (cssKeywords.hasOwnProperty(keyword)) {
			var value = cssKeywords[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

},{"color-name":10}],8:[function(require,module,exports){
var conversions = require('./conversions');
var route = require('./route');

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;

},{"./conversions":7,"./route":9}],9:[function(require,module,exports){
var conversions = require('./conversions');

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};


},{"./conversions":7}],10:[function(require,module,exports){
'use strict'

module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

},{}],11:[function(require,module,exports){
/* MIT license */
var colorNames = require('color-name');
var swizzle = require('simple-swizzle');

var reverseNames = {};

// create a list of reverse color names
for (var name in colorNames) {
	if (colorNames.hasOwnProperty(name)) {
		reverseNames[colorNames[name]] = name;
	}
}

var cs = module.exports = {
	to: {},
	get: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
	if (!string) {
		return null;
	}

	var abbr = /^#([a-f0-9]{3,4})$/i;
	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
	var rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var keyword = /(\D+)/;

	var rgb = [0, 0, 0, 1];
	var match;
	var i;
	var hexAlpha;

	if (match = string.match(hex)) {
		hexAlpha = match[2];
		match = match[1];

		for (i = 0; i < 3; i++) {
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
			var i2 = i * 2;
			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
		}

		if (hexAlpha) {
			rgb[3] = Math.round((parseInt(hexAlpha, 16) / 255) * 100) / 100;
		}
	} else if (match = string.match(abbr)) {
		match = match[1];
		hexAlpha = match[3];

		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i] + match[i], 16);
		}

		if (hexAlpha) {
			rgb[3] = Math.round((parseInt(hexAlpha + hexAlpha, 16) / 255) * 100) / 100;
		}
	} else if (match = string.match(rgba)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i + 1], 0);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(per)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(keyword)) {
		if (match[1] === 'transparent') {
			return [0, 0, 0, 0];
		}

		rgb = colorNames[match[1]];

		if (!rgb) {
			return null;
		}

		rgb[3] = 1;

		return rgb;
	} else {
		return null;
	}

	for (i = 0; i < 3; i++) {
		rgb[i] = clamp(rgb[i], 0, 255);
	}
	rgb[3] = clamp(rgb[3], 0, 1);

	return rgb;
};

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\(\s*([+-]?(?:\d*\.)?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = (parseFloat(match[1]) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = swizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = swizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = swizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = swizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = swizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = num.toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}

},{"color-name":10,"simple-swizzle":39}],12:[function(require,module,exports){
'use strict';

var colorString = require('color-string');
var convert = require('color-convert');

var _slice = [].slice;

var skippedModels = [
	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
	'keyword',

	// gray conflicts with some method names, and has its own method defined.
	'gray',

	// shouldn't really be in color-convert either...
	'hex'
];

var hashedModelKeys = {};
Object.keys(convert).forEach(function (model) {
	hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
});

var limiters = {};

function Color(obj, model) {
	if (!(this instanceof Color)) {
		return new Color(obj, model);
	}

	if (model && model in skippedModels) {
		model = null;
	}

	if (model && !(model in convert)) {
		throw new Error('Unknown model: ' + model);
	}

	var i;
	var channels;

	if (!obj) {
		this.model = 'rgb';
		this.color = [0, 0, 0];
		this.valpha = 1;
	} else if (obj instanceof Color) {
		this.model = obj.model;
		this.color = obj.color.slice();
		this.valpha = obj.valpha;
	} else if (typeof obj === 'string') {
		var result = colorString.get(obj);
		if (result === null) {
			throw new Error('Unable to parse color from string: ' + obj);
		}

		this.model = result.model;
		channels = convert[this.model].channels;
		this.color = result.value.slice(0, channels);
		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
	} else if (obj.length) {
		this.model = model || 'rgb';
		channels = convert[this.model].channels;
		var newArr = _slice.call(obj, 0, channels);
		this.color = zeroArray(newArr, channels);
		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
	} else if (typeof obj === 'number') {
		// this is always RGB - can be converted later on.
		obj &= 0xFFFFFF;
		this.model = 'rgb';
		this.color = [
			(obj >> 16) & 0xFF,
			(obj >> 8) & 0xFF,
			obj & 0xFF
		];
		this.valpha = 1;
	} else {
		this.valpha = 1;

		var keys = Object.keys(obj);
		if ('alpha' in obj) {
			keys.splice(keys.indexOf('alpha'), 1);
			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
		}

		var hashedKeys = keys.sort().join('');
		if (!(hashedKeys in hashedModelKeys)) {
			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
		}

		this.model = hashedModelKeys[hashedKeys];

		var labels = convert[this.model].labels;
		var color = [];
		for (i = 0; i < labels.length; i++) {
			color.push(obj[labels[i]]);
		}

		this.color = zeroArray(color);
	}

	// perform limitations (clamping, etc.)
	if (limiters[this.model]) {
		channels = convert[this.model].channels;
		for (i = 0; i < channels; i++) {
			var limit = limiters[this.model][i];
			if (limit) {
				this.color[i] = limit(this.color[i]);
			}
		}
	}

	this.valpha = Math.max(0, Math.min(1, this.valpha));

	if (Object.freeze) {
		Object.freeze(this);
	}
}

Color.prototype = {
	toString: function () {
		return this.string();
	},

	toJSON: function () {
		return this[this.model]();
	},

	string: function (places) {
		var self = this.model in colorString.to ? this : this.rgb();
		self = self.round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to[self.model](args);
	},

	percentString: function (places) {
		var self = this.rgb().round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to.rgb.percent(args);
	},

	array: function () {
		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
	},

	object: function () {
		var result = {};
		var channels = convert[this.model].channels;
		var labels = convert[this.model].labels;

		for (var i = 0; i < channels; i++) {
			result[labels[i]] = this.color[i];
		}

		if (this.valpha !== 1) {
			result.alpha = this.valpha;
		}

		return result;
	},

	unitArray: function () {
		var rgb = this.rgb().color;
		rgb[0] /= 255;
		rgb[1] /= 255;
		rgb[2] /= 255;

		if (this.valpha !== 1) {
			rgb.push(this.valpha);
		}

		return rgb;
	},

	unitObject: function () {
		var rgb = this.rgb().object();
		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		if (this.valpha !== 1) {
			rgb.alpha = this.valpha;
		}

		return rgb;
	},

	round: function (places) {
		places = Math.max(places || 0, 0);
		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
	},

	alpha: function (val) {
		if (arguments.length) {
			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
		}

		return this.valpha;
	},

	// rgb
	red: getset('rgb', 0, maxfn(255)),
	green: getset('rgb', 1, maxfn(255)),
	blue: getset('rgb', 2, maxfn(255)),

	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

	saturationl: getset('hsl', 1, maxfn(100)),
	lightness: getset('hsl', 2, maxfn(100)),

	saturationv: getset('hsv', 1, maxfn(100)),
	value: getset('hsv', 2, maxfn(100)),

	chroma: getset('hcg', 1, maxfn(100)),
	gray: getset('hcg', 2, maxfn(100)),

	white: getset('hwb', 1, maxfn(100)),
	wblack: getset('hwb', 2, maxfn(100)),

	cyan: getset('cmyk', 0, maxfn(100)),
	magenta: getset('cmyk', 1, maxfn(100)),
	yellow: getset('cmyk', 2, maxfn(100)),
	black: getset('cmyk', 3, maxfn(100)),

	x: getset('xyz', 0, maxfn(100)),
	y: getset('xyz', 1, maxfn(100)),
	z: getset('xyz', 2, maxfn(100)),

	l: getset('lab', 0, maxfn(100)),
	a: getset('lab', 1),
	b: getset('lab', 2),

	keyword: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return convert[this.model].keyword(this.color);
	},

	hex: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return colorString.to.hex(this.rgb().round().color);
	},

	rgbNumber: function () {
		var rgb = this.rgb().color;
		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.rgb().color;

		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}

		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();

		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}

		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	isDark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.rgb().color;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	isLight: function () {
		return !this.isDark();
	},

	negate: function () {
		var rgb = this.rgb();
		for (var i = 0; i < 3; i++) {
			rgb.color[i] = 255 - rgb.color[i];
		}
		return rgb;
	},

	lighten: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] += hsl.color[2] * ratio;
		return hsl;
	},

	darken: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] -= hsl.color[2] * ratio;
		return hsl;
	},

	saturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] += hsl.color[1] * ratio;
		return hsl;
	},

	desaturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] -= hsl.color[1] * ratio;
		return hsl;
	},

	whiten: function (ratio) {
		var hwb = this.hwb();
		hwb.color[1] += hwb.color[1] * ratio;
		return hwb;
	},

	blacken: function (ratio) {
		var hwb = this.hwb();
		hwb.color[2] += hwb.color[2] * ratio;
		return hwb;
	},

	grayscale: function () {
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var rgb = this.rgb().color;
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		return Color.rgb(val, val, val);
	},

	fade: function (ratio) {
		return this.alpha(this.valpha - (this.valpha * ratio));
	},

	opaquer: function (ratio) {
		return this.alpha(this.valpha + (this.valpha * ratio));
	},

	rotate: function (degrees) {
		var hsl = this.hsl();
		var hue = hsl.color[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		hsl.color[0] = hue;
		return hsl;
	},

	mix: function (mixinColor, weight) {
		// ported from sass implementation in C
		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
		var color1 = mixinColor.rgb();
		var color2 = this.rgb();
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return Color.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue(),
				color1.alpha() * p + color2.alpha() * (1 - p));
	}
};

// model conversion methods and static constructors
Object.keys(convert).forEach(function (model) {
	if (skippedModels.indexOf(model) !== -1) {
		return;
	}

	var channels = convert[model].channels;

	// conversion methods
	Color.prototype[model] = function () {
		if (this.model === model) {
			return new Color(this);
		}

		if (arguments.length) {
			return new Color(arguments, model);
		}

		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
		return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
	};

	// 'static' construction methods
	Color[model] = function (color) {
		if (typeof color === 'number') {
			color = zeroArray(_slice.call(arguments), channels);
		}
		return new Color(color, model);
	};
});

function roundTo(num, places) {
	return Number(num.toFixed(places));
}

function roundToPlace(places) {
	return function (num) {
		return roundTo(num, places);
	};
}

function getset(model, channel, modifier) {
	model = Array.isArray(model) ? model : [model];

	model.forEach(function (m) {
		(limiters[m] || (limiters[m] = []))[channel] = modifier;
	});

	model = model[0];

	return function (val) {
		var result;

		if (arguments.length) {
			if (modifier) {
				val = modifier(val);
			}

			result = this[model]();
			result.color[channel] = val;
			return result;
		}

		result = this[model]().color[channel];
		if (modifier) {
			result = modifier(result);
		}

		return result;
	};
}

function maxfn(max) {
	return function (v) {
		return Math.max(0, Math.min(max, v));
	};
}

function assertArray(val) {
	return Array.isArray(val) ? val : [val];
}

function zeroArray(arr, length) {
	for (var i = 0; i < length; i++) {
		if (typeof arr[i] !== 'number') {
			arr[i] = 0;
		}
	}

	return arr;
}

module.exports = Color;

},{"color-convert":8,"color-string":11}],13:[function(require,module,exports){
// This file can be required in Browserify and Node.js for automatic polyfill
// To use it:  require('es6-promise/auto');
'use strict';
module.exports = require('./').polyfill();

},{"./":14}],14:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.5+7f2b526d
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var TRY_CATCH_ERROR = { error: null };

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    TRY_CATCH_ERROR.error = error;
    return TRY_CATCH_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === TRY_CATCH_ERROR) {
      reject(promise, TRY_CATCH_ERROR.error);
      TRY_CATCH_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = void 0,
      failed = void 0;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = getThen(entry);

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        handleMaybeThenable(promise, entry, _then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":37}],15:[function(require,module,exports){
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

},{}],16:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebarsBase = require('./handlebars/base');

var base = _interopRequireWildcard(_handlebarsBase);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _handlebarsSafeString = require('./handlebars/safe-string');

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = require('./handlebars/exception');

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = require('./handlebars/no-conflict');

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];


},{"./handlebars/base":17,"./handlebars/exception":20,"./handlebars/no-conflict":30,"./handlebars/runtime":31,"./handlebars/safe-string":32,"./handlebars/utils":33}],17:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _helpers = require('./helpers');

var _decorators = require('./decorators');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var VERSION = '4.0.12';
exports.VERSION = VERSION;
var COMPILER_REVISION = 7;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = _utils.createFrame;
exports.logger = _logger2['default'];


},{"./decorators":18,"./exception":20,"./helpers":21,"./logger":29,"./utils":33}],18:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = require('./decorators/inline');

var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}


},{"./decorators/inline":19}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];


},{"../utils":33}],20:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  try {
    if (loc) {
      this.lineNumber = line;

      // Work around issue under safari where we can't directly set the column value
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(this, 'column', {
          value: column,
          enumerable: true
        });
      } else {
        this.column = column;
      }
    }
  } catch (nop) {
    /* Ignore if the browser is very particular */
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];


},{}],21:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = require('./helpers/block-helper-missing');

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = require('./helpers/each');

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = require('./helpers/helper-missing');

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = require('./helpers/if');

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = require('./helpers/log');

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = require('./helpers/lookup');

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = require('./helpers/with');

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}


},{"./helpers/block-helper-missing":22,"./helpers/each":23,"./helpers/helper-missing":24,"./helpers/if":25,"./helpers/log":26,"./helpers/lookup":27,"./helpers/with":28}],22:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];


},{"../utils":33}],23:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('../utils');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];


},{"../exception":20,"../utils":33}],24:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];


},{"../exception":20}],25:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (_utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });
};

module.exports = exports['default'];


},{"../utils":33}],26:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];


},{}],27:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
};

module.exports = exports['default'];


},{}],28:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!_utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: _utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];


},{"../utils":33}],29:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      if (!console[method]) {
        // eslint-disable-line no-console
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports['default'] = logger;
module.exports = exports['default'];


},{"./utils":33}],30:[function(require,module,exports){
(function (global){
/* global window */
'use strict';

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],31:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _base = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },
    // An empty object to use as replacement for null-contexts
    nullContext: Object.seal({}),

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }
    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = container.merge(options.decorators, env.decorators);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  // Use the current closure context to save the partial-block if this partial
  var currentPartialBlock = options.data && options.data['partial-block'];
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    (function () {
      options.data = _base.createFrame(options.data);
      // Wrapper function to get access to currentPartialBlock from the closure
      var fn = options.fn;
      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // Restore the partial-block from the closure for the execution of the block
        // i.e. the part inside the block of the partial call.
        options.data = _base.createFrame(options.data);
        options.data['partial-block'] = currentPartialBlock;
        return fn(context, options);
      };
      if (fn.partials) {
        options.partials = Utils.extend({}, options.partials, fn.partials);
      }
    })();
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}


},{"./base":17,"./exception":20,"./utils":33}],32:[function(require,module,exports){
// Build out our basic SafeString type
'use strict';

exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];


},{}],33:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}


},{}],34:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":16}],35:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":34}],36:[function(require,module,exports){
var MutationObserver = window.MutationObserver
  || window.WebKitMutationObserver
  || window.MozMutationObserver;

/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

var WeakMap = window.WeakMap;

if (typeof WeakMap === 'undefined') {
  var defineProperty = Object.defineProperty;
  var counter = Date.now() % 1e9;

  WeakMap = function() {
    this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
  };

  WeakMap.prototype = {
    set: function(key, value) {
      var entry = key[this.name];
      if (entry && entry[0] === key)
        entry[1] = value;
      else
        defineProperty(key, this.name, {value: [key, value], writable: true});
      return this;
    },
    get: function(key) {
      var entry;
      return (entry = key[this.name]) && entry[0] === key ?
          entry[1] : undefined;
    },
    'delete': function(key) {
      var entry = key[this.name];
      if (!entry) return false;
      var hasValue = entry[0] === key;
      entry[0] = entry[1] = undefined;
      return hasValue;
    },
    has: function(key) {
      var entry = key[this.name];
      if (!entry) return false;
      return entry[0] === key;
    }
  };
}

var registrationsTable = new WeakMap();

// We use setImmediate or postMessage for our future callback.
var setImmediate = window.msSetImmediate;

// Use post message to emulate setImmediate.
if (!setImmediate) {
  var setImmediateQueue = [];
  var sentinel = String(Math.random());
  window.addEventListener('message', function(e) {
    if (e.data === sentinel) {
      var queue = setImmediateQueue;
      setImmediateQueue = [];
      queue.forEach(function(func) {
        func();
      });
    }
  });
  setImmediate = function(func) {
    setImmediateQueue.push(func);
    window.postMessage(sentinel, '*');
  };
}

// This is used to ensure that we never schedule 2 callas to setImmediate
var isScheduled = false;

// Keep track of observers that needs to be notified next time.
var scheduledObservers = [];

/**
 * Schedules |dispatchCallback| to be called in the future.
 * @param {MutationObserver} observer
 */
function scheduleCallback(observer) {
  scheduledObservers.push(observer);
  if (!isScheduled) {
    isScheduled = true;
    setImmediate(dispatchCallbacks);
  }
}

function wrapIfNeeded(node) {
  return window.ShadowDOMPolyfill &&
      window.ShadowDOMPolyfill.wrapIfNeeded(node) ||
      node;
}

function dispatchCallbacks() {
  // http://dom.spec.whatwg.org/#mutation-observers

  isScheduled = false; // Used to allow a new setImmediate call above.

  var observers = scheduledObservers;
  scheduledObservers = [];
  // Sort observers based on their creation UID (incremental).
  observers.sort(function(o1, o2) {
    return o1.uid_ - o2.uid_;
  });

  var anyNonEmpty = false;
  observers.forEach(function(observer) {

    // 2.1, 2.2
    var queue = observer.takeRecords();
    // 2.3. Remove all transient registered observers whose observer is mo.
    removeTransientObserversFor(observer);

    // 2.4
    if (queue.length) {
      observer.callback_(queue, observer);
      anyNonEmpty = true;
    }
  });

  // 3.
  if (anyNonEmpty)
    dispatchCallbacks();
}

function removeTransientObserversFor(observer) {
  observer.nodes_.forEach(function(node) {
    var registrations = registrationsTable.get(node);
    if (!registrations)
      return;
    registrations.forEach(function(registration) {
      if (registration.observer === observer)
        registration.removeTransientObservers();
    });
  });
}

/**
 * This function is used for the "For each registered observer observer (with
 * observer's options as options) in target's list of registered observers,
 * run these substeps:" and the "For each ancestor ancestor of target, and for
 * each registered observer observer (with options options) in ancestor's list
 * of registered observers, run these substeps:" part of the algorithms. The
 * |options.subtree| is checked to ensure that the callback is called
 * correctly.
 *
 * @param {Node} target
 * @param {function(MutationObserverInit):MutationRecord} callback
 */
function forEachAncestorAndObserverEnqueueRecord(target, callback) {
  for (var node = target; node; node = node.parentNode) {
    var registrations = registrationsTable.get(node);

    if (registrations) {
      for (var j = 0; j < registrations.length; j++) {
        var registration = registrations[j];
        var options = registration.options;

        // Only target ignores subtree.
        if (node !== target && !options.subtree)
          continue;

        var record = callback(options);
        if (record)
          registration.enqueue(record);
      }
    }
  }
}

var uidCounter = 0;

/**
 * The class that maps to the DOM MutationObserver interface.
 * @param {Function} callback.
 * @constructor
 */
function JsMutationObserver(callback) {
  this.callback_ = callback;
  this.nodes_ = [];
  this.records_ = [];
  this.uid_ = ++uidCounter;
}

JsMutationObserver.prototype = {
  observe: function(target, options) {
    target = wrapIfNeeded(target);

    // 1.1
    if (!options.childList && !options.attributes && !options.characterData ||

        // 1.2
        options.attributeOldValue && !options.attributes ||

        // 1.3
        options.attributeFilter && options.attributeFilter.length &&
            !options.attributes ||

        // 1.4
        options.characterDataOldValue && !options.characterData) {

      throw new SyntaxError();
    }

    var registrations = registrationsTable.get(target);
    if (!registrations)
      registrationsTable.set(target, registrations = []);

    // 2
    // If target's list of registered observers already includes a registered
    // observer associated with the context object, replace that registered
    // observer's options with options.
    var registration;
    for (var i = 0; i < registrations.length; i++) {
      if (registrations[i].observer === this) {
        registration = registrations[i];
        registration.removeListeners();
        registration.options = options;
        break;
      }
    }

    // 3.
    // Otherwise, add a new registered observer to target's list of registered
    // observers with the context object as the observer and options as the
    // options, and add target to context object's list of nodes on which it
    // is registered.
    if (!registration) {
      registration = new Registration(this, target, options);
      registrations.push(registration);
      this.nodes_.push(target);
    }

    registration.addListeners();
  },

  disconnect: function() {
    this.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      for (var i = 0; i < registrations.length; i++) {
        var registration = registrations[i];
        if (registration.observer === this) {
          registration.removeListeners();
          registrations.splice(i, 1);
          // Each node can only have one registered observer associated with
          // this observer.
          break;
        }
      }
    }, this);
    this.records_ = [];
  },

  takeRecords: function() {
    var copyOfRecords = this.records_;
    this.records_ = [];
    return copyOfRecords;
  }
};

/**
 * @param {string} type
 * @param {Node} target
 * @constructor
 */
function MutationRecord(type, target) {
  this.type = type;
  this.target = target;
  this.addedNodes = [];
  this.removedNodes = [];
  this.previousSibling = null;
  this.nextSibling = null;
  this.attributeName = null;
  this.attributeNamespace = null;
  this.oldValue = null;
}

function copyMutationRecord(original) {
  var record = new MutationRecord(original.type, original.target);
  record.addedNodes = original.addedNodes.slice();
  record.removedNodes = original.removedNodes.slice();
  record.previousSibling = original.previousSibling;
  record.nextSibling = original.nextSibling;
  record.attributeName = original.attributeName;
  record.attributeNamespace = original.attributeNamespace;
  record.oldValue = original.oldValue;
  return record;
};

// We keep track of the two (possibly one) records used in a single mutation.
var currentRecord, recordWithOldValue;

/**
 * Creates a record without |oldValue| and caches it as |currentRecord| for
 * later use.
 * @param {string} oldValue
 * @return {MutationRecord}
 */
function getRecord(type, target) {
  return currentRecord = new MutationRecord(type, target);
}

/**
 * Gets or creates a record with |oldValue| based in the |currentRecord|
 * @param {string} oldValue
 * @return {MutationRecord}
 */
function getRecordWithOldValue(oldValue) {
  if (recordWithOldValue)
    return recordWithOldValue;
  recordWithOldValue = copyMutationRecord(currentRecord);
  recordWithOldValue.oldValue = oldValue;
  return recordWithOldValue;
}

function clearRecords() {
  currentRecord = recordWithOldValue = undefined;
}

/**
 * @param {MutationRecord} record
 * @return {boolean} Whether the record represents a record from the current
 * mutation event.
 */
function recordRepresentsCurrentMutation(record) {
  return record === recordWithOldValue || record === currentRecord;
}

/**
 * Selects which record, if any, to replace the last record in the queue.
 * This returns |null| if no record should be replaced.
 *
 * @param {MutationRecord} lastRecord
 * @param {MutationRecord} newRecord
 * @param {MutationRecord}
 */
function selectRecord(lastRecord, newRecord) {
  if (lastRecord === newRecord)
    return lastRecord;

  // Check if the the record we are adding represents the same record. If
  // so, we keep the one with the oldValue in it.
  if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
    return recordWithOldValue;

  return null;
}

/**
 * Class used to represent a registered observer.
 * @param {MutationObserver} observer
 * @param {Node} target
 * @param {MutationObserverInit} options
 * @constructor
 */
function Registration(observer, target, options) {
  this.observer = observer;
  this.target = target;
  this.options = options;
  this.transientObservedNodes = [];
}

Registration.prototype = {
  enqueue: function(record) {
    var records = this.observer.records_;
    var length = records.length;

    // There are cases where we replace the last record with the new record.
    // For example if the record represents the same mutation we need to use
    // the one with the oldValue. If we get same record (this can happen as we
    // walk up the tree) we ignore the new record.
    if (records.length > 0) {
      var lastRecord = records[length - 1];
      var recordToReplaceLast = selectRecord(lastRecord, record);
      if (recordToReplaceLast) {
        records[length - 1] = recordToReplaceLast;
        return;
      }
    } else {
      scheduleCallback(this.observer);
    }

    records[length] = record;
  },

  addListeners: function() {
    this.addListeners_(this.target);
  },

  addListeners_: function(node) {
    var options = this.options;
    if (options.attributes)
      node.addEventListener('DOMAttrModified', this, true);

    if (options.characterData)
      node.addEventListener('DOMCharacterDataModified', this, true);

    if (options.childList)
      node.addEventListener('DOMNodeInserted', this, true);

    if (options.childList || options.subtree)
      node.addEventListener('DOMNodeRemoved', this, true);
  },

  removeListeners: function() {
    this.removeListeners_(this.target);
  },

  removeListeners_: function(node) {
    var options = this.options;
    if (options.attributes)
      node.removeEventListener('DOMAttrModified', this, true);

    if (options.characterData)
      node.removeEventListener('DOMCharacterDataModified', this, true);

    if (options.childList)
      node.removeEventListener('DOMNodeInserted', this, true);

    if (options.childList || options.subtree)
      node.removeEventListener('DOMNodeRemoved', this, true);
  },

  /**
   * Adds a transient observer on node. The transient observer gets removed
   * next time we deliver the change records.
   * @param {Node} node
   */
  addTransientObserver: function(node) {
    // Don't add transient observers on the target itself. We already have all
    // the required listeners set up on the target.
    if (node === this.target)
      return;

    this.addListeners_(node);
    this.transientObservedNodes.push(node);
    var registrations = registrationsTable.get(node);
    if (!registrations)
      registrationsTable.set(node, registrations = []);

    // We know that registrations does not contain this because we already
    // checked if node === this.target.
    registrations.push(this);
  },

  removeTransientObservers: function() {
    var transientObservedNodes = this.transientObservedNodes;
    this.transientObservedNodes = [];

    transientObservedNodes.forEach(function(node) {
      // Transient observers are never added to the target.
      this.removeListeners_(node);

      var registrations = registrationsTable.get(node);
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i] === this) {
          registrations.splice(i, 1);
          // Each node can only have one registered observer associated with
          // this observer.
          break;
        }
      }
    }, this);
  },

  handleEvent: function(e) {
    // Stop propagation since we are managing the propagation manually.
    // This means that other mutation events on the page will not work
    // correctly but that is by design.
    e.stopImmediatePropagation();

    switch (e.type) {
      case 'DOMAttrModified':
        // http://dom.spec.whatwg.org/#concept-mo-queue-attributes

        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;

        // 1.
        var record = new getRecord('attributes', target);
        record.attributeName = name;
        record.attributeNamespace = namespace;

        // 2.
        var oldValue = null;
        if (!(typeof MutationEvent !== 'undefined' && e.attrChange === MutationEvent.ADDITION))
          oldValue = e.prevValue;

        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 3.1, 4.2
          if (!options.attributes)
            return;

          // 3.2, 4.3
          if (options.attributeFilter && options.attributeFilter.length &&
              options.attributeFilter.indexOf(name) === -1 &&
              options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          // 3.3, 4.4
          if (options.attributeOldValue)
            return getRecordWithOldValue(oldValue);

          // 3.4, 4.5
          return record;
        });

        break;

      case 'DOMCharacterDataModified':
        // http://dom.spec.whatwg.org/#concept-mo-queue-characterdata
        var target = e.target;

        // 1.
        var record = getRecord('characterData', target);

        // 2.
        var oldValue = e.prevValue;


        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 3.1, 4.2
          if (!options.characterData)
            return;

          // 3.2, 4.3
          if (options.characterDataOldValue)
            return getRecordWithOldValue(oldValue);

          // 3.3, 4.4
          return record;
        });

        break;

      case 'DOMNodeRemoved':
        this.addTransientObserver(e.target);
        // Fall through.
      case 'DOMNodeInserted':
        // http://dom.spec.whatwg.org/#concept-mo-queue-childlist
        var target = e.relatedNode;
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === 'DOMNodeInserted') {
          addedNodes = [changedNode];
          removedNodes = [];
        } else {

          addedNodes = [];
          removedNodes = [changedNode];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;

        // 1.
        var record = getRecord('childList', target);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;

        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 2.1, 3.2
          if (!options.childList)
            return;

          // 2.2, 3.3
          return record;
        });

    }

    clearRecords();
  }
};

if (!MutationObserver) {
  MutationObserver = JsMutationObserver;
}

module.exports = MutationObserver;

},{}],37:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],38:[function(require,module,exports){
(function (process,global){
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":37}],39:[function(require,module,exports){
'use strict';

var isArrayish = require('is-arrayish');

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

var swizzle = module.exports = function swizzle(args) {
	var results = [];

	for (var i = 0, len = args.length; i < len; i++) {
		var arg = args[i];

		if (isArrayish(arg)) {
			// http://jsperf.com/javascript-array-concat-vs-push/98
			results = concat.call(results, slice.call(arg));
		} else {
			results.push(arg);
		}
	}

	return results;
};

swizzle.wrap = function (fn) {
	return function () {
		return fn(swizzle(arguments));
	};
};

},{"is-arrayish":40}],40:[function(require,module,exports){
module.exports = function isArrayish(obj) {
	if (!obj || typeof obj === 'string') {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && (obj.splice instanceof Function ||
			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
};

},{}],41:[function(require,module,exports){
var makeString = require('./helper/makeString');

module.exports = function capitalize(str, lowercaseRest) {
  str = makeString(str);
  var remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();

  return str.charAt(0).toUpperCase() + remainingChars;
};

},{"./helper/makeString":45}],42:[function(require,module,exports){
var trim = require('./trim');

module.exports = function dasherize(str) {
  return trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
};

},{"./trim":50}],43:[function(require,module,exports){
var escapeRegExp = require('./escapeRegExp');

module.exports = function defaultToWhiteSpace(characters) {
  if (characters == null)
    return '\\s';
  else if (characters.source)
    return characters.source;
  else
    return '[' + escapeRegExp(characters) + ']';
};

},{"./escapeRegExp":44}],44:[function(require,module,exports){
var makeString = require('./makeString');

module.exports = function escapeRegExp(str) {
  return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

},{"./makeString":45}],45:[function(require,module,exports){
/**
 * Ensure some object is a coerced to a string
 **/
module.exports = function makeString(object) {
  if (object == null) return '';
  return '' + object;
};

},{}],46:[function(require,module,exports){
module.exports = function strRepeat(str, qty){
  if (qty < 1) return '';
  var result = '';
  while (qty > 0) {
    if (qty & 1) result += str;
    qty >>= 1, str += str;
  }
  return result;
};

},{}],47:[function(require,module,exports){
var pad = require('./pad');

module.exports = function lpad(str, length, padStr) {
  return pad(str, length, padStr);
};

},{"./pad":48}],48:[function(require,module,exports){
var makeString = require('./helper/makeString');
var strRepeat = require('./helper/strRepeat');

module.exports = function pad(str, length, padStr, type) {
  str = makeString(str);
  length = ~~length;

  var padlen = 0;

  if (!padStr)
    padStr = ' ';
  else if (padStr.length > 1)
    padStr = padStr.charAt(0);

  switch (type) {
  case 'right':
    padlen = length - str.length;
    return str + strRepeat(padStr, padlen);
  case 'both':
    padlen = length - str.length;
    return strRepeat(padStr, Math.ceil(padlen / 2)) + str + strRepeat(padStr, Math.floor(padlen / 2));
  default: // 'left'
    padlen = length - str.length;
    return strRepeat(padStr, padlen) + str;
  }
};

},{"./helper/makeString":45,"./helper/strRepeat":46}],49:[function(require,module,exports){
var pad = require('./pad');

module.exports = function rpad(str, length, padStr) {
  return pad(str, length, padStr, 'right');
};

},{"./pad":48}],50:[function(require,module,exports){
var makeString = require('./helper/makeString');
var defaultToWhiteSpace = require('./helper/defaultToWhiteSpace');
var nativeTrim = String.prototype.trim;

module.exports = function trim(str, characters) {
  str = makeString(str);
  if (!characters && nativeTrim) return nativeTrim.call(str);
  characters = defaultToWhiteSpace(characters);
  return str.replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
};

},{"./helper/defaultToWhiteSpace":43,"./helper/makeString":45}],51:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],52:[function(require,module,exports){
/* Web Font Loader v1.6.28 - (c) Adobe Systems, Google. License: Apache 2.0 */(function(){function aa(a,b,c){return a.call.apply(a.bind,arguments)}function ba(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function p(a,b,c){p=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?aa:ba;return p.apply(null,arguments)}var q=Date.now||function(){return+new Date};function ca(a,b){this.a=a;this.o=b||a;this.c=this.o.document}var da=!!window.FontFace;function t(a,b,c,d){b=a.c.createElement(b);if(c)for(var e in c)c.hasOwnProperty(e)&&("style"==e?b.style.cssText=c[e]:b.setAttribute(e,c[e]));d&&b.appendChild(a.c.createTextNode(d));return b}function u(a,b,c){a=a.c.getElementsByTagName(b)[0];a||(a=document.documentElement);a.insertBefore(c,a.lastChild)}function v(a){a.parentNode&&a.parentNode.removeChild(a)}
function w(a,b,c){b=b||[];c=c||[];for(var d=a.className.split(/\s+/),e=0;e<b.length;e+=1){for(var f=!1,g=0;g<d.length;g+=1)if(b[e]===d[g]){f=!0;break}f||d.push(b[e])}b=[];for(e=0;e<d.length;e+=1){f=!1;for(g=0;g<c.length;g+=1)if(d[e]===c[g]){f=!0;break}f||b.push(d[e])}a.className=b.join(" ").replace(/\s+/g," ").replace(/^\s+|\s+$/,"")}function y(a,b){for(var c=a.className.split(/\s+/),d=0,e=c.length;d<e;d++)if(c[d]==b)return!0;return!1}
function ea(a){return a.o.location.hostname||a.a.location.hostname}function z(a,b,c){function d(){m&&e&&f&&(m(g),m=null)}b=t(a,"link",{rel:"stylesheet",href:b,media:"all"});var e=!1,f=!0,g=null,m=c||null;da?(b.onload=function(){e=!0;d()},b.onerror=function(){e=!0;g=Error("Stylesheet failed to load");d()}):setTimeout(function(){e=!0;d()},0);u(a,"head",b)}
function A(a,b,c,d){var e=a.c.getElementsByTagName("head")[0];if(e){var f=t(a,"script",{src:b}),g=!1;f.onload=f.onreadystatechange=function(){g||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(g=!0,c&&c(null),f.onload=f.onreadystatechange=null,"HEAD"==f.parentNode.tagName&&e.removeChild(f))};e.appendChild(f);setTimeout(function(){g||(g=!0,c&&c(Error("Script load timeout")))},d||5E3);return f}return null};function B(){this.a=0;this.c=null}function C(a){a.a++;return function(){a.a--;D(a)}}function E(a,b){a.c=b;D(a)}function D(a){0==a.a&&a.c&&(a.c(),a.c=null)};function F(a){this.a=a||"-"}F.prototype.c=function(a){for(var b=[],c=0;c<arguments.length;c++)b.push(arguments[c].replace(/[\W_]+/g,"").toLowerCase());return b.join(this.a)};function G(a,b){this.c=a;this.f=4;this.a="n";var c=(b||"n4").match(/^([nio])([1-9])$/i);c&&(this.a=c[1],this.f=parseInt(c[2],10))}function fa(a){return H(a)+" "+(a.f+"00")+" 300px "+I(a.c)}function I(a){var b=[];a=a.split(/,\s*/);for(var c=0;c<a.length;c++){var d=a[c].replace(/['"]/g,"");-1!=d.indexOf(" ")||/^\d/.test(d)?b.push("'"+d+"'"):b.push(d)}return b.join(",")}function J(a){return a.a+a.f}function H(a){var b="normal";"o"===a.a?b="oblique":"i"===a.a&&(b="italic");return b}
function ga(a){var b=4,c="n",d=null;a&&((d=a.match(/(normal|oblique|italic)/i))&&d[1]&&(c=d[1].substr(0,1).toLowerCase()),(d=a.match(/([1-9]00|normal|bold)/i))&&d[1]&&(/bold/i.test(d[1])?b=7:/[1-9]00/.test(d[1])&&(b=parseInt(d[1].substr(0,1),10))));return c+b};function ha(a,b){this.c=a;this.f=a.o.document.documentElement;this.h=b;this.a=new F("-");this.j=!1!==b.events;this.g=!1!==b.classes}function ia(a){a.g&&w(a.f,[a.a.c("wf","loading")]);K(a,"loading")}function L(a){if(a.g){var b=y(a.f,a.a.c("wf","active")),c=[],d=[a.a.c("wf","loading")];b||c.push(a.a.c("wf","inactive"));w(a.f,c,d)}K(a,"inactive")}function K(a,b,c){if(a.j&&a.h[b])if(c)a.h[b](c.c,J(c));else a.h[b]()};function ja(){this.c={}}function ka(a,b,c){var d=[],e;for(e in b)if(b.hasOwnProperty(e)){var f=a.c[e];f&&d.push(f(b[e],c))}return d};function M(a,b){this.c=a;this.f=b;this.a=t(this.c,"span",{"aria-hidden":"true"},this.f)}function N(a){u(a.c,"body",a.a)}function O(a){return"display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:"+I(a.c)+";"+("font-style:"+H(a)+";font-weight:"+(a.f+"00")+";")};function P(a,b,c,d,e,f){this.g=a;this.j=b;this.a=d;this.c=c;this.f=e||3E3;this.h=f||void 0}P.prototype.start=function(){var a=this.c.o.document,b=this,c=q(),d=new Promise(function(d,e){function f(){q()-c>=b.f?e():a.fonts.load(fa(b.a),b.h).then(function(a){1<=a.length?d():setTimeout(f,25)},function(){e()})}f()}),e=null,f=new Promise(function(a,d){e=setTimeout(d,b.f)});Promise.race([f,d]).then(function(){e&&(clearTimeout(e),e=null);b.g(b.a)},function(){b.j(b.a)})};function Q(a,b,c,d,e,f,g){this.v=a;this.B=b;this.c=c;this.a=d;this.s=g||"BESbswy";this.f={};this.w=e||3E3;this.u=f||null;this.m=this.j=this.h=this.g=null;this.g=new M(this.c,this.s);this.h=new M(this.c,this.s);this.j=new M(this.c,this.s);this.m=new M(this.c,this.s);a=new G(this.a.c+",serif",J(this.a));a=O(a);this.g.a.style.cssText=a;a=new G(this.a.c+",sans-serif",J(this.a));a=O(a);this.h.a.style.cssText=a;a=new G("serif",J(this.a));a=O(a);this.j.a.style.cssText=a;a=new G("sans-serif",J(this.a));a=
O(a);this.m.a.style.cssText=a;N(this.g);N(this.h);N(this.j);N(this.m)}var R={D:"serif",C:"sans-serif"},S=null;function T(){if(null===S){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);S=!!a&&(536>parseInt(a[1],10)||536===parseInt(a[1],10)&&11>=parseInt(a[2],10))}return S}Q.prototype.start=function(){this.f.serif=this.j.a.offsetWidth;this.f["sans-serif"]=this.m.a.offsetWidth;this.A=q();U(this)};
function la(a,b,c){for(var d in R)if(R.hasOwnProperty(d)&&b===a.f[R[d]]&&c===a.f[R[d]])return!0;return!1}function U(a){var b=a.g.a.offsetWidth,c=a.h.a.offsetWidth,d;(d=b===a.f.serif&&c===a.f["sans-serif"])||(d=T()&&la(a,b,c));d?q()-a.A>=a.w?T()&&la(a,b,c)&&(null===a.u||a.u.hasOwnProperty(a.a.c))?V(a,a.v):V(a,a.B):ma(a):V(a,a.v)}function ma(a){setTimeout(p(function(){U(this)},a),50)}function V(a,b){setTimeout(p(function(){v(this.g.a);v(this.h.a);v(this.j.a);v(this.m.a);b(this.a)},a),0)};function W(a,b,c){this.c=a;this.a=b;this.f=0;this.m=this.j=!1;this.s=c}var X=null;W.prototype.g=function(a){var b=this.a;b.g&&w(b.f,[b.a.c("wf",a.c,J(a).toString(),"active")],[b.a.c("wf",a.c,J(a).toString(),"loading"),b.a.c("wf",a.c,J(a).toString(),"inactive")]);K(b,"fontactive",a);this.m=!0;na(this)};
W.prototype.h=function(a){var b=this.a;if(b.g){var c=y(b.f,b.a.c("wf",a.c,J(a).toString(),"active")),d=[],e=[b.a.c("wf",a.c,J(a).toString(),"loading")];c||d.push(b.a.c("wf",a.c,J(a).toString(),"inactive"));w(b.f,d,e)}K(b,"fontinactive",a);na(this)};function na(a){0==--a.f&&a.j&&(a.m?(a=a.a,a.g&&w(a.f,[a.a.c("wf","active")],[a.a.c("wf","loading"),a.a.c("wf","inactive")]),K(a,"active")):L(a.a))};function oa(a){this.j=a;this.a=new ja;this.h=0;this.f=this.g=!0}oa.prototype.load=function(a){this.c=new ca(this.j,a.context||this.j);this.g=!1!==a.events;this.f=!1!==a.classes;pa(this,new ha(this.c,a),a)};
function qa(a,b,c,d,e){var f=0==--a.h;(a.f||a.g)&&setTimeout(function(){var a=e||null,m=d||null||{};if(0===c.length&&f)L(b.a);else{b.f+=c.length;f&&(b.j=f);var h,l=[];for(h=0;h<c.length;h++){var k=c[h],n=m[k.c],r=b.a,x=k;r.g&&w(r.f,[r.a.c("wf",x.c,J(x).toString(),"loading")]);K(r,"fontloading",x);r=null;if(null===X)if(window.FontFace){var x=/Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent),xa=/OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent)&&/Apple/.exec(window.navigator.vendor);
X=x?42<parseInt(x[1],10):xa?!1:!0}else X=!1;X?r=new P(p(b.g,b),p(b.h,b),b.c,k,b.s,n):r=new Q(p(b.g,b),p(b.h,b),b.c,k,b.s,a,n);l.push(r)}for(h=0;h<l.length;h++)l[h].start()}},0)}function pa(a,b,c){var d=[],e=c.timeout;ia(b);var d=ka(a.a,c,a.c),f=new W(a.c,b,e);a.h=d.length;b=0;for(c=d.length;b<c;b++)d[b].load(function(b,d,c){qa(a,f,b,d,c)})};function ra(a,b){this.c=a;this.a=b}
ra.prototype.load=function(a){function b(){if(f["__mti_fntLst"+d]){var c=f["__mti_fntLst"+d](),e=[],h;if(c)for(var l=0;l<c.length;l++){var k=c[l].fontfamily;void 0!=c[l].fontStyle&&void 0!=c[l].fontWeight?(h=c[l].fontStyle+c[l].fontWeight,e.push(new G(k,h))):e.push(new G(k))}a(e)}else setTimeout(function(){b()},50)}var c=this,d=c.a.projectId,e=c.a.version;if(d){var f=c.c.o;A(this.c,(c.a.api||"https://fast.fonts.net/jsapi")+"/"+d+".js"+(e?"?v="+e:""),function(e){e?a([]):(f["__MonotypeConfiguration__"+
d]=function(){return c.a},b())}).id="__MonotypeAPIScript__"+d}else a([])};function sa(a,b){this.c=a;this.a=b}sa.prototype.load=function(a){var b,c,d=this.a.urls||[],e=this.a.families||[],f=this.a.testStrings||{},g=new B;b=0;for(c=d.length;b<c;b++)z(this.c,d[b],C(g));var m=[];b=0;for(c=e.length;b<c;b++)if(d=e[b].split(":"),d[1])for(var h=d[1].split(","),l=0;l<h.length;l+=1)m.push(new G(d[0],h[l]));else m.push(new G(d[0]));E(g,function(){a(m,f)})};function ta(a,b){a?this.c=a:this.c=ua;this.a=[];this.f=[];this.g=b||""}var ua="https://fonts.googleapis.com/css";function va(a,b){for(var c=b.length,d=0;d<c;d++){var e=b[d].split(":");3==e.length&&a.f.push(e.pop());var f="";2==e.length&&""!=e[1]&&(f=":");a.a.push(e.join(f))}}
function wa(a){if(0==a.a.length)throw Error("No fonts to load!");if(-1!=a.c.indexOf("kit="))return a.c;for(var b=a.a.length,c=[],d=0;d<b;d++)c.push(a.a[d].replace(/ /g,"+"));b=a.c+"?family="+c.join("%7C");0<a.f.length&&(b+="&subset="+a.f.join(","));0<a.g.length&&(b+="&text="+encodeURIComponent(a.g));return b};function ya(a){this.f=a;this.a=[];this.c={}}
var za={latin:"BESbswy","latin-ext":"\u00e7\u00f6\u00fc\u011f\u015f",cyrillic:"\u0439\u044f\u0416",greek:"\u03b1\u03b2\u03a3",khmer:"\u1780\u1781\u1782",Hanuman:"\u1780\u1781\u1782"},Aa={thin:"1",extralight:"2","extra-light":"2",ultralight:"2","ultra-light":"2",light:"3",regular:"4",book:"4",medium:"5","semi-bold":"6",semibold:"6","demi-bold":"6",demibold:"6",bold:"7","extra-bold":"8",extrabold:"8","ultra-bold":"8",ultrabold:"8",black:"9",heavy:"9",l:"3",r:"4",b:"7"},Ba={i:"i",italic:"i",n:"n",normal:"n"},
Ca=/^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
function Da(a){for(var b=a.f.length,c=0;c<b;c++){var d=a.f[c].split(":"),e=d[0].replace(/\+/g," "),f=["n4"];if(2<=d.length){var g;var m=d[1];g=[];if(m)for(var m=m.split(","),h=m.length,l=0;l<h;l++){var k;k=m[l];if(k.match(/^[\w-]+$/)){var n=Ca.exec(k.toLowerCase());if(null==n)k="";else{k=n[2];k=null==k||""==k?"n":Ba[k];n=n[1];if(null==n||""==n)n="4";else var r=Aa[n],n=r?r:isNaN(n)?"4":n.substr(0,1);k=[k,n].join("")}}else k="";k&&g.push(k)}0<g.length&&(f=g);3==d.length&&(d=d[2],g=[],d=d?d.split(","):
g,0<d.length&&(d=za[d[0]])&&(a.c[e]=d))}a.c[e]||(d=za[e])&&(a.c[e]=d);for(d=0;d<f.length;d+=1)a.a.push(new G(e,f[d]))}};function Ea(a,b){this.c=a;this.a=b}var Fa={Arimo:!0,Cousine:!0,Tinos:!0};Ea.prototype.load=function(a){var b=new B,c=this.c,d=new ta(this.a.api,this.a.text),e=this.a.families;va(d,e);var f=new ya(e);Da(f);z(c,wa(d),C(b));E(b,function(){a(f.a,f.c,Fa)})};function Ga(a,b){this.c=a;this.a=b}Ga.prototype.load=function(a){var b=this.a.id,c=this.c.o;b?A(this.c,(this.a.api||"https://use.typekit.net")+"/"+b+".js",function(b){if(b)a([]);else if(c.Typekit&&c.Typekit.config&&c.Typekit.config.fn){b=c.Typekit.config.fn;for(var e=[],f=0;f<b.length;f+=2)for(var g=b[f],m=b[f+1],h=0;h<m.length;h++)e.push(new G(g,m[h]));try{c.Typekit.load({events:!1,classes:!1,async:!0})}catch(l){}a(e)}},2E3):a([])};function Ha(a,b){this.c=a;this.f=b;this.a=[]}Ha.prototype.load=function(a){var b=this.f.id,c=this.c.o,d=this;b?(c.__webfontfontdeckmodule__||(c.__webfontfontdeckmodule__={}),c.__webfontfontdeckmodule__[b]=function(b,c){for(var g=0,m=c.fonts.length;g<m;++g){var h=c.fonts[g];d.a.push(new G(h.name,ga("font-weight:"+h.weight+";font-style:"+h.style)))}a(d.a)},A(this.c,(this.f.api||"https://f.fontdeck.com/s/css/js/")+ea(this.c)+"/"+b+".js",function(b){b&&a([])})):a([])};var Y=new oa(window);Y.a.c.custom=function(a,b){return new sa(b,a)};Y.a.c.fontdeck=function(a,b){return new Ha(b,a)};Y.a.c.monotype=function(a,b){return new ra(b,a)};Y.a.c.typekit=function(a,b){return new Ga(b,a)};Y.a.c.google=function(a,b){return new Ea(b,a)};var Z={load:p(Y.load,Y)};"function"===typeof define&&define.amd?define(function(){return Z}):"undefined"!==typeof module&&module.exports?module.exports=Z:(window.WebFont=Z,window.WebFontConfig&&Y.load(window.WebFontConfig));}());

},{}],53:[function(require,module,exports){
(function (DEBUG,_){
/**
/* @module app/App
/*/
"use strict";

console.info("Portfolio App started"); // if (!DEBUG) {
// 	window.addEventListener("error", function(ev) {
// 		console.error("Uncaught Error", ev);
// 	});
// }

if (DEBUG) {
  require("Modernizr");
}

require("setimmediate");

require("es6-promise/auto");

require("classlist-polyfill");

require("raf-polyfill");

require("matches-polyfill");

require("fullscreen-polyfill");

require("math-sign-polyfill"); // require("path2d-polyfill");


require("mutation-observer");

require("backbone").$ = require("backbone.native");

require("backbone.babysitter");

require("Backbone.Mutators");

require("hammerjs"); // document.addEventListener('DOMContentLoaded', function(ev) {
// 	console.log("%s:[event %s]", ev.target, ev.type);
// });


window.addEventListener("load", function (ev) {
  console.log("%s:[event %s]", ev.target, ev.type); // process bootstrap data, let errors go up the stack

  try {
    require("app/model/helper/bootstrap")(window.bootstrap);
  } catch (err) {
    var el = document.querySelector(".app");
    el.classList.remove("app-initial");
    el.classList.add("app-error");
    throw new Error("bootstrap data error (" + err.message + ")", err.fileName, err.lineNumber);
  } finally {
    // detele global var
    delete window.bootstrap;
  }

  require("app/view/template/_helpers");
  /** @type {module:app/view/helper/createColorStyleSheet} */


  require("app/view/helper/createColorStyleSheet").call();
  /** @type {module:app/view/AppView} */


  var AppView = require("app/view/AppView"); // var startApp = AppView.getInstance.bind(AppView);

  /** @type {module:webfontloader} */


  var WebFont = require("webfontloader");

  var loadOpts = {
    async: false,
    groupName: "",
    classes: false,
    loading: function loading() {
      console.log("WebFont:%s:loading", this.groupName);
    },
    active: function active() {
      console.info("WebFont:%s:active", this.groupName);
    },
    inactive: function inactive() {
      console.warn("WebFont:%s:inactive", this.groupName);
    },
    fontactive: function fontactive(familyName, variantFvd) {
      console.info("WebFont:%s:fontactive '%s' (%s)", this.groupName, familyName, variantFvd);
    },
    fontinactive: function fontinactive(familyName, variantFvd) {
      console.warn("WebFont:%s:fontinactive '%s' (%s)", this.groupName, familyName, variantFvd);
    } // fontloading: function(familyName, variantDesc) {
    // 	console.log("WebFont::fontloading", familyName, JSON.stringify(variantDesc, null, " "));
    // },

  };
  WebFont.load(_.defaults({
    async: false,
    groupName: "required",
    custom: {
      families: ["FranklinGothicFS:n4,n6", // "FranklinGothicFS:i4,i6"
      "FolioFigures:n4"],
      testStrings: {
        "FolioFigures": "hms"
      }
    },
    active: function active() {
      return AppView.getInstance();
    },
    inactive: function inactive() {
      return AppView.getInstance();
    }
  }, loadOpts));
  WebFont.load(_.defaults({}, loadOpts)); // requestAnimationFrame(function(tstamp) {
  // 	AppView.getInstance();
  // });
});

if (DEBUG) {// /** @type {module:underscore} */
  // var _ = require("underscore");
  // var isFF = /Firefox/.test(window.navigator.userAgent);
  // var isIOS = /iPad|iPhone/.test(window.navigator.userAgent);

  /*
  if (/Firefox/.test(window.navigator.userAgent)) {
  	console.prefix = "# ";
  	var shift = [].shift;
  	var logWrapFn = function() {
  		if (typeof arguments[1] == "string") arguments[1] = console.prefix + arguments[1];
  		return shift.apply(arguments).apply(console, arguments);
  	};
  	console.group = _.wrap(console.group, logWrapFn);
  	console.log = _.wrap(console.log, logWrapFn);
  	console.info = _.wrap(console.info, logWrapFn);
  	console.warn = _.wrap(console.warn, logWrapFn);
  	console.error = _.wrap(console.error, logWrapFn);
  }
  */

  /*
  var saveLogs = function() {
  	var logWrapFn = function(name, fn, msg) {
  		document.documentElement.appendChild(
  			document.createComment("[" + name + "] " + msg));
  	};
  	console.group = _.wrap(console.group, _.partial(logWrapFn, "group"));
  	console.log = _.wrap(console.log, _.partial(logWrapFn, "log"));
  	console.info = _.wrap(console.info, _.partial(logWrapFn, "info"));
  	console.warn = _.wrap(console.warn, _.partial(logWrapFn, "warn"));
  	console.error = _.wrap(console.error, _.partial(logWrapFn, "error"));
  };
  */
  // handle error events on some platforms and production

  /*
  if (isIOS) {
  	// saveLogs();
  	window.addEventListener("error", function() {
  		var args = Array.prototype.slice.apply(arguments),
  			el = document.createElement("div"),
  			html = "";
  		_.extend(el.style, {
  			fontfamily: "monospace",
  			display: "block",
  			position: "absolute",
  			zIndex: "999",
  			backgroundColor: "white",
  			color: "black",
  			width: "calc(100% - 3em)",
  			bottom: "0",
  			margin: "1em 1.5em",
  			padding: "1em 1.5em",
  			outline: "0.5em solid red",
  			outlineOffset: "0.5em",
  			boxSizing: "border-box",
  			overflow: "hidden",
  		});
  		html += "<pre><b>location:<b> " + window.location + "</pre>";
  		html += "<pre><b>event:<b> " + JSON.stringify(args.shift(), null, " ") + "</pre>";
  		if (args.length) html += "<pre><b>rest:<b> " + JSON.stringify(args, null, " ") + "</pre>";
  		el.innerHTML = html;
  		document.body.appendChild(el);
  	});
  }*/
}

}).call(this,true,require("underscore"))

},{"Backbone.Mutators":1,"Modernizr":"Modernizr","app/model/helper/bootstrap":67,"app/view/AppView":74,"app/view/helper/createColorStyleSheet":96,"app/view/template/_helpers":123,"backbone":5,"backbone.babysitter":3,"backbone.native":4,"classlist-polyfill":6,"es6-promise/auto":13,"fullscreen-polyfill":"fullscreen-polyfill","hammerjs":15,"matches-polyfill":"matches-polyfill","math-sign-polyfill":"math-sign-polyfill","mutation-observer":36,"raf-polyfill":"raf-polyfill","setimmediate":38,"underscore":51,"webfontloader":52}],54:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/control/Controller
 */

/** @type {module:backbone} */
var Backbone = require("backbone"); // /** @type {module:app/model/collection/TypeCollection} */
// var types = require("app/model/collection/TypeCollection");
// /** @type {module:app/model/collection/KeywordCollection} */
// var keywords = require("app/model/collection/KeywordCollection");

/** @type {module:app/model/collection/ArticleCollection} */


var articles = require("app/model/collection/ArticleCollection");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection");
/* --------------------------- *
/* Static private
/* --------------------------- */

/**
/* @constructor
/* @type {module:app/control/Controller}
/*/


var Controller = Backbone.Router.extend({
  // /** @override */
  // routes: {},

  /** @override */
  initialize: function initialize(options) {
    if (DEBUG) {
      this._routeNames = [];

      this.route = function (route, name, callback) {
        this._routeNames.push(_.isString(name) ? name : '');

        return Backbone.Router.prototype.route.apply(this, arguments);
      };

      this.on("route", function (routeName, args) {
        console.log("controller:[route] %s [%s]", routeName, args.join());
      });
    }
    /*
     * Prefixed article regexp: /^article(?:\/([^\/]+))\/?$/
     * Single bundle regexp: /^bundles(?:\/([^\/]+)(?:\/(\d+))?)?\/?$/
     */


    this.route(/(.*)/, "notfound", this.toNotFound);
    this.route(/^([a-z][a-z0-9\-]*)\/?$/, "article-item", this.toArticleItem);
    this.route(/^(?:bundles)?\/?$/, "root", this.toRoot); // this.route(/^bundles\/?$/,
    // 	"bundle-list", this.toBundleList);

    this.route(/^bundles\/([^\/]+)\/?$/, "bundle-item", this.toBundleItem);
    this.route(/^bundles\/([^\/]+)\/(\d+)\/?$/, "media-item", this.toMediaItem);

    if (DEBUG) {
      console.log("%s::initialize routes: %o", "controller", this._routeNames);
    }
  },

  /* ---------------------------
  /* JS to URL: public command methods
  /* --------------------------- */
  selectMedia: function selectMedia(media) {
    this._goToLocation(media.get("bundle"), media);
  },
  selectBundle: function selectBundle(bundle) {
    this._goToLocation(bundle);
  },
  deselectMedia: function deselectMedia() {
    this._goToLocation(bundles.selected);
  },
  deselectBundle: function deselectBundle() {
    this._goToLocation();
  },
  selectArticle: function selectArticle(article) {
    this.navigate(article.get("handle"), {
      trigger: true
    });
  },
  deselectArticle: function deselectArticle() {
    this.navigate("", {
      trigger: true
    });
  },

  /* ---------------------------
  /* JS to URL: private helpers
  /* --------------------------- */

  /** Update location when navigation happens internally */

  /*_updateLocation: function() {
  	var bundle, media;
  	bundle = bundles.selected;
  	if (bundle) {
  		media = bundle.get("media").selected;
  	}
  	this.navigate(this._getLocation(bundle, media), {
  		trigger: false
  	});
  },*/
  _getLocation: function _getLocation(bundle, media) {
    var mediaIndex,
        location = [];

    if (bundle) {
      location.push("bundles");
      location.push(bundle.get("handle"));

      if (media) {
        mediaIndex = bundle.get("media").indexOf(media);

        if (mediaIndex >= 0) {
          location.push(mediaIndex);
        }
      }
    } // location.push("");


    return location.join("/");
  },
  _goToLocation: function _goToLocation(bundle, media) {
    this.navigate(this._getLocation(bundle, media), {
      trigger: true
    });
  },

  /* --------------------------- *
  /* URL to JS: router handlers
  /* --------------------------- */
  toRoot: function toRoot() {
    this.trigger("change:before");

    if (bundles.selected) {
      // bundles.selected.get("media").deselect();
      bundles.deselect();
    } // keywords.deselect();


    articles.deselect();
    this.trigger("change:after");
  },
  toNotFound: function toNotFound(slug) {
    console.info("route:[*:%s]", slug);
  },
  // toBundleList: function() {
  // 	this.navigate("", {
  // 		trigger: true,
  // 		replace: true
  // 	});
  // },
  toBundleItem: function toBundleItem(bundleHandle) {
    var bundle = bundles.findWhere({
      handle: bundleHandle
    });

    if (!bundle) {
      throw new Error("Cannot find bundle with handle \"" + bundleHandle + "\"");
    }

    this._changeSelection(bundle);
  },
  toMediaItem: function toMediaItem(bundleHandle, mediaIndex) {
    var bundle, media; // if (bundleHandle) {

    bundle = bundles.findWhere({
      handle: bundleHandle
    });

    if (!bundle) {
      throw new Error("No bundle with handle \"" + bundleHandle + "\" found");
    } // if (mediaIndex) {


    media = bundle.get("media").at(mediaIndex);

    if (!media) {
      throw new Error("No media at index " + mediaIndex + " in bundle with handle \"" + bundleHandle + "\" found");
    } // }
    // }


    this._changeSelection(bundle, media);
  },
  toArticleItem: function toArticleItem(articleHandle) {
    var article = articles.findWhere({
      handle: articleHandle
    });

    if (!article) {
      throw new Error("Cannot find article with handle \"" + articleHandle + "\"");
    }

    this.trigger("change:before", article);
    bundles.deselect();
    articles.select(article);
    this.trigger("change:after", article);
  },

  /* -------------------------------
  /* URL to JS: private helpers
  /* ------------------------------- */

  /*
  /* NOTE: Selection order
  /* - Apply media selection to *incoming bundle*, as not to trigger
  /*	unneccesary events on an outgoing bundle. Outgoing bundle media selection
  /*	remains untouched.
  /* - Apply media selection *before* selecting the incoming bundle. Views
  /*	normally listen to the selected bundle only, so if the bundle is changing,
  /*	they will not be listening to media selection changes yet.
  /*/
  _changeSelection: function _changeSelection(bundle, media) {
    var lastBundle, lastMedia;
    if (bundle === void 0) bundle = null;
    if (media === void 0) media = null;
    lastBundle = bundles.selected;
    lastMedia = lastBundle ? lastBundle.get("media").selected : null;
    console.log("controller::_changeSelection bundle:[%s -> %s] media:[%s -> %s]", lastBundle ? lastBundle.cid : lastBundle, bundle ? bundle.cid : bundle, lastMedia ? lastMedia.cid : lastMedia, media ? media.cid : media);

    if (!articles.selected && lastBundle === bundle && lastMedia === media) {
      return;
    }

    this.trigger("change:before", bundle, media);
    bundle && bundle.get("media").select(media);
    bundles.select(bundle);
    articles.deselect();
    this.trigger("change:after", bundle, media);
  }
});
module.exports = new Controller();

}).call(this,true,require("underscore"))

},{"app/model/collection/ArticleCollection":63,"app/model/collection/BundleCollection":64,"backbone":5,"underscore":51}],55:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/control/Globals
 */
module.exports = function () {
  // reusable vars
  var o, s, so; // global hash

  var g = {}; // SASS <--> JS shared hash

  var sass = require("../../../sass/variables.json"); // JUNK FIRST: Some app-wide defaults
  // - - - - - - - - - - - - - - - - -


  g.VPAN_DRAG = 0.95; // as factor of pointer delta

  g.HPAN_OUT_DRAG = 0.4; // factor

  g.VPAN_OUT_DRAG = 0.1; // factor

  g.PAN_THRESHOLD = 15; // px

  g.COLLAPSE_THRESHOLD = 75; // px

  g.COLLAPSE_OFFSET = parseInt(sass.temp["collapse_offset"]); // g.CLICK_EVENT = "click"; //window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup";

  g.VIDEO_CROP_PX = parseInt(sass["video_crop_px"]); // breakpoints
  // - - - - - - - - - - - - - - - - -

  g.BREAKPOINTS = {};

  for (s in sass.breakpoints) {
    o = sass.breakpoints[s];
    /*if (Array.isArray(o)) {
    	g.BREAKPOINTS[s] = Object.defineProperties({}, {
    		"matches": {
    			get: _.partial(_.some, o.map(window.matchMedia), _.property("matches"))
    		},
    		"media": {
    			value: o.join(", ")
    		},
    		"queries": {
    			value: o.map(window.matchMedia)
    		},
    	});
    } else {
    	g.BREAKPOINTS[s] = window.matchMedia(o);
    }*/

    o = Array.isArray(o) ? o.join(", ") : o;
    o = o.replace(/[\'\"]/g, "");
    o = window.matchMedia(o);
    o.className = s;
    g.BREAKPOINTS[s] = o;
  }

  if (DEBUG) {
    console.groupCollapsed("Breakpoints");

    for (s in g.BREAKPOINTS) {
      console.log("%s: %o", s, g.BREAKPOINTS[s].media);
    }

    console.groupEnd();
  } // base colors, dimensions
  // - - - - - - - - - - - - - - - - -


  g.DEFAULT_COLORS = _.clone(sass.default_colors); // g.HORIZONTAL_STEP = parseFloat(sass.units["hu_px"]);
  // g.VERTICAL_STEP = parseFloat(sass.units["vu_px"]);
  // paths, networking
  // - - - - - - - - - - - - - - - - -
  // var toAbsoluteURL = (function() {
  // 	var a = null;
  // 	return function(url) {
  // 		a = a || document.createElement('a');
  // 		a.href = url;
  // 		return a.href;
  // 	};
  // })();
  // g.APP_ROOT = toAbsoluteURL(window.approot);
  // g.MEDIA_DIR = toAbsoluteURL(window.mediadir);

  g.APP_ROOT = window.approot;
  g.MEDIA_DIR = window.mediadir;
  delete window.approot;
  delete window.mediadir; // hardcoded font data
  // - - - - - - - - - - - - - - - - -

  g.FONT_METRICS = {
    "FranklinGothicFS": {
      "unitsPerEm": 1000,
      "ascent": 827,
      "descent": -173
    },
    "ITCFranklinGothicStd": {
      "unitsPerEm": 1000,
      "ascent": 686,
      "descent": -314
    },
    "FolioFigures": {
      "unitsPerEm": 1024,
      "ascent": 939,
      "descent": -256
    }
  };
  g.PAUSE_CHAR = String.fromCharCode(0x23F8);
  g.PLAY_CHAR = String.fromCharCode(0x23F5);
  g.STOP_CHAR = String.fromCharCode(0x23F9); // translate common template

  if (sass.transform_type == "3d") {
    g.TRANSLATE_TEMPLATE = function (x, y) {
      return "translate3d(" + x + "px, " + y + "px, 0px)";
    };
  } else {
    g.TRANSLATE_TEMPLATE = function (x, y) {
      return "translate(" + x + "px, " + y + "px)";
    };
  }

  g.TRANSLATE_TEMPLATE = function (x, y) {
    return "translate(" + x + "px, " + y + "px)"; // return "translate3d(" + x + "px, " + y + "px ,0px)";
  }; // timing, easing
  // - - - - - - - - - - - - - - - - -


  var ease = g.TRANSITION_EASE = sass.transitions["ease"];
  var duration = g.TRANSITION_DURATION = parseFloat(sass.transitions["duration_ms"]);
  var delayInterval = g.TRANSITION_DELAY_INTERVAL = parseFloat(sass.transitions["delay_interval_ms"]);
  var minDelay = g.TRANSITION_MIN_DELAY = parseFloat(sass.transitions["min_delay_ms"]);
  var delay = g.TRANSITION_DELAY = g.TRANSITION_DURATION + g.TRANSITION_DELAY_INTERVAL; // css transitions
  // - - - - - - - - - - - - - - - - -

  o = {}; // match tx() in _transitions.scss
  // - - - - - - - - - - - - - - - - -

  o.tx = function tx(durationCount, delayCount, easeVal) {
    _.isNumber(durationCount) || (durationCount = 1);
    _.isNumber(delayCount) || (delayCount = -1);
    _.isString(easeVal) || (easeVal = ease);
    var o = {};

    if (delayCount < 0) {
      o.duration = duration * durationCount + delayInterval * (durationCount - 1);
      o.delay = 0;
    } else {
      o.duration = duration * durationCount + delayInterval * (durationCount - 1) - minDelay;
      o.delay = delay * delayCount - minDelay;
    }

    o.easeing = easeVal;
    return 0;
  }; // transition presets
  // TODO: get rid of this
  // - - - - - - - - - - - - - - - - -


  o.NONE = {
    delay: 0,
    duration: 0,
    easing: "step-start"
  };
  o.NOW = {
    delay: 0,
    duration: duration,
    easing: ease
  };
  o.UNSET = _.defaults({
    cssText: ""
  }, o.NONE);

  var txAligned = _.defaults({
    duration: duration - minDelay
  }, o.NOW);

  o.FIRST = _.defaults({
    delay: delay * 0.0 + minDelay
  }, txAligned);
  o.BETWEEN = _.defaults({
    delay: delay * 1.0 + minDelay
  }, txAligned);
  o.LAST = _.defaults({
    delay: delay * 2.0 + minDelay
  }, txAligned);
  o.AFTER = _.defaults({
    delay: delay * 2.0 + minDelay
  }, txAligned);
  o.BETWEEN_EARLY = _.defaults({
    delay: delay * 1.0 + minDelay - 60
  }, txAligned);
  o.BETWEEN_LATE = _.defaults({
    delay: delay * 1.0 + minDelay + 60
  }, txAligned);
  o.FIRST_LATE = _.defaults({
    delay: delay * 0.5 + minDelay
  }, txAligned);
  o.LAST_EARLY = _.defaults({
    delay: delay * 1.5 + minDelay
  }, txAligned); // o.FIRST_LATE = 		_.defaults({delay: txDelay*0.0 + txMinDelay*2}, txAligned);
  // o.LAST_EARLY = 		_.defaults({delay: txDelay*2.0 + txMinDelay*0}, txAligned);
  // o.AFTER = 			_.defaults({delay: txDelay*2.0 + txMinDelay}, txAligned);

  console.groupCollapsed("Transitions");

  for (s in o) {
    if (!_.isFunction(o[s])) {
      so = o[s];
      so.name = s;
      so.className = "tx-" + s.replace("_", "-").toLowerCase();

      if (!so.hasOwnProperty("cssText")) {
        so.cssText = so.duration / 1000 + "s " + so.easing + " " + so.delay / 1000 + "s";
      }

      console.log("%s: %s", so.name, so.cssText);
    }
  }

  console.groupEnd();
  g.transitions = o;
  return g;
}();

}).call(this,true,require("underscore"))

},{"../../../sass/variables.json":154,"underscore":51}],56:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/DebugToolbar
 */

/** @type {module:cookies-js} */
var Cookies = require("cookies-js");
/** @type {module:modernizr} */


var Modernizr = require("Modernizr");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals"); // /** @type {module:app/control/Controller} */
// var controller = require("app/control/Controller");

/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {Function} */


var viewTemplate = require("./template/DebugToolbar.hbs");
/** @type {Function} */


var gridTemplate = require("./template/DebugToolbar.SVGGrid.hbs");
/** @type {Function} */


var sizeTemplate = _.template("<%= w %> \xD7 <%= h %>"); // var appStateSymbols = { withBundle: "b", withMedia: "m", collapsed: "c"};
// var appStateKeys = Object.keys(appStateSymbols);


module.exports = View.extend({
  /** @override */
  cidPrefix: "debugToolbar",

  /** @override */
  tagName: "div",

  /** @override */
  className: "toolbar",

  /** @override */
  template: viewTemplate,

  /** @override */
  properties: {
    grid: {
      get: function get() {
        return this._grid || (this._grid = this.createGridElement());
      }
    }
  },
  initialize: function initialize(options) {
    Cookies.defaults = {
      expires: new Date(0x7fffffff * 1e3),
      domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
    };
    this.el.innerHTML = this.template({
      tests: Modernizr,
      navigator: window.navigator
    });
    /* toggle's target: container
    /* - - - - - - - - - - - - - - - - */

    var container = document.getElementById("container"); //.querySelector("#container");

    /* create/attach svg grid element
    /* - - - - - - - - - - - - - - - - */

    container.insertBefore(this.createGridElement(), container.firstElementChild);
    /* info elements
    /* - - - - - - - - - - - - - - - - */

    this.backendEl = this.el.querySelector("#edit-backend a");
    this.mediaInfoEl = this.el.querySelector("#media-info span");
    this.appStateEl = this.el.querySelector("#app-state");
    /* toggle visibility
    /* - - - - - - - - - - - - - - - - */

    this.initializeClassToggle("show-links", this.el.querySelector("#links-toggle"), this.el, function (key, value) {
      this.el.classList.toggle("not-" + key, !value);
    });
    this.initializeClassToggle("show-tests", this.el.querySelector("#toggle-tests a"), this.el);
    this.initializeClassToggle("hide-passed", this.el.querySelector("#toggle-passed"), this.el);
    /* toggle container classes
    /* - - - - - - - - - - - - - - - - */

    this.initializeClassToggle("debug-state", this.el.querySelector("#toggle-state a"), container);
    this.initializeClassToggle("debug-blocks-nav", this.el.querySelector("#toggle-blocks-nav a"), container);
    this.initializeClassToggle("debug-blocks-content", this.el.querySelector("#toggle-blocks-content a"), container);
    this.initializeClassToggle("debug-mdown", this.el.querySelector("#toggle-mdown a"), container);
    this.initializeClassToggle("debug-tx", this.el.querySelector("#toggle-tx a"), container, function (key, value) {
      this.el.classList.toggle("show-tx", value);
      this.el.classList.toggle("not-show-tx", !value);
    });
    this.initializeClassToggle("debug-graph", this.el.querySelector("#toggle-graph a"), container);
    this.initializeClassToggle("debug-logs", this.el.querySelector("#toggle-logs a"), container);
    this.initializeClassToggle("debug-grid-bg", this.el.querySelector("#toggle-grid-bg a"), document.body);
    this.initializeViewportInfo(); // this.initializeLayoutSelect();

    this.listenTo(this.model, "change", this._onModelChange);

    this._onModelChange();
  },
  initializeViewportInfo: function initializeViewportInfo() {
    var viewportInfoEl = this.el.querySelector("#viewport-info span");

    var callback = function callback() {
      viewportInfoEl.textContent = sizeTemplate({
        w: window.innerWidth,
        h: window.innerHeight
      });
    };

    callback.call();
    window.addEventListener("resize", _.debounce(callback, 100, false, false));
  },
  initializeToggle: function initializeToggle(key, toggleEl, callback) {
    if (!toggleEl) return;
    var ctx = this;
    var toggleValue = Cookies.get(key) === "true";
    callback.call(ctx, key, toggleValue);
    toggleEl.addEventListener("click", function (ev) {
      if (ev.defaultPrevented) return;else ev.preventDefault();
      toggleValue = !toggleValue;
      Cookies.set(key, toggleValue ? "true" : "");
      callback.call(ctx, key, toggleValue);
    }, false);
  },
  initializeClassToggle: function initializeClassToggle(key, toggleEl, targetEl, callback) {
    var hasCallback = _.isFunction(callback);

    this.initializeToggle(key, toggleEl, function (key, toggleValue) {
      targetEl.classList.toggle(key, toggleValue);
      toggleEl.classList.toggle("toggle-enabled", toggleValue);
      toggleEl.classList.toggle("color-reverse", toggleValue);
      hasCallback && callback.apply(this, arguments);
    });
  },
  _onModelChange: function _onModelChange() {
    // console.log("%s::_onModelChange changedAttributes: %o", this.cid, this.model.changedAttributes());
    var i,
        ii,
        prop,
        el,
        els = this.appStateEl.children;

    for (i = 0, ii = els.length; i < ii; i++) {
      el = els[i];
      prop = el.getAttribute("data-prop");
      el.classList.toggle("has-value", this.model.get(prop));
      el.classList.toggle("has-changed", this.model.hasChanged(prop));
      el.classList.toggle("color-reverse", this.model.hasChanged(prop));
    } // NOTE: Always but rewrite CMS href.
    // Only collapsed may have changed, but not worth all the logic


    var attrVal = Globals.APP_ROOT + "symphony/";

    switch (this.model.get("routeName")) {
      case "article-item":
        attrVal += "publish/articles/edit/" + this.model.get("article").id;
        break;

      case "bundle-item":
        attrVal += "publish/bundles/edit/" + this.model.get("bundle").id;
        break;

      case "media-item":
        attrVal += "publish/media/edit/" + this.model.get("media").id;
        break;

      case "root":
        attrVal += "publish/bundles";
        break;
    }

    this.backendEl.setAttribute("href", attrVal);

    if (this.model.hasChanged("routeName")) {
      document.body.setAttribute("last-route", this.model.previous("routeName"));
      document.body.setAttribute("current-route", this.model.get("routeName"));
    }

    if (this.model.hasChanged("media")) {
      if (this.model.has("media")) {
        this.mediaInfoEl.textContent = sizeTemplate(this.model.get("media").get("source").toJSON());
        this.mediaInfoEl.style.display = "";
      } else {
        this.mediaInfoEl.textContent = "";
        this.mediaInfoEl.style.display = "none";
      }
    }
  },
  createGridElement: function createGridElement() {
    var el = document.createElement("div");
    el.id = "grid-wrapper";
    el.innerHTML = gridTemplate();
    return el;
  }
});
module.exports.prototype._logFlags = "";

}).call(this,require("underscore"))

},{"./template/DebugToolbar.SVGGrid.hbs":57,"./template/DebugToolbar.hbs":58,"Modernizr":"Modernizr","app/control/Globals":55,"app/view/base/View":82,"cookies-js":"cookies-js","underscore":51}],57:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<svg id=\"debug-grid\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" preserveAspectRatio=\"xMaxYMid slice\" viewport-fill=\"hsl(0,0%,100%)\" viewport-fill-opacity=\"1\" style=\"fill:none;stroke:none;stroke-width:1px;fill:none;fill-rule:evenodd;\">\n<defs>\n	<pattern id=\"pat-baseline-12px\" class=\"baseline base12\" x=\"0\" y=\"0\" width=\"20\" height=\"12\" patternUnits=\"userSpaceOnUse\">\n		<line x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\" stroke-opacity=\"1.0\"/>\n		<line x1=\"0\" x2=\"100%\" y1=\"3\" y2=\"3\" stroke-opacity=\"0.125\"/>\n		<line x1=\"0\" x2=\"100%\" y1=\"6\" y2=\"6\" stroke-opacity=\"0.375\"/>\n		<line x1=\"0\" x2=\"100%\" y1=\"9\" y2=\"9\" stroke-opacity=\"0.125\"/>\n	</pattern>\n\n	<pattern id=\"pat-baseline-24px\" class=\"baseline base12\" x=\"0\" y=\"0\" width=\"20\" height=\"24\" patternUnits=\"userSpaceOnUse\">\n		<line x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\" stroke-opacity=\"1.0\"/>\n	</pattern>\n\n	<pattern id=\"pat-baseline-10px\" class=\"baseline base10\" x=\"0\" y=\"0\" width=\"20\" height=\"10\" patternUnits=\"userSpaceOnUse\">\n		<line x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\" stroke-opacity=\"1.00\"/>\n		<line x1=\"0\" x2=\"100%\" y1=\"5\" y2=\"5\" stroke-opacity=\"0.75\"/>\n	</pattern>\n	<pattern id=\"pat-baseline-20px\" class=\"baseline base10\" x=\"0\" y=\"0\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\">\n		<line x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\" stroke-opacity=\"1.0\"/>\n	</pattern>\n	<pattern id=\"pat-cols-220px\" x=\"0\" y=\"0\" width=\"220\" height=\"36\" patternUnits=\"userSpaceOnUse\">\n		<rect transform=\"translate(0,0)\" x=\"0\" y=\"0\" width=\"20\" height=\"100%\" fill=\"hsl(336,50%,40%)\" fill-opacity=\"0.1\"/>\n		<rect transform=\"translate(200,0)\" x=\"0\" y=\"0\" width=\"20\" height=\"100%\" fill=\"hsl(336,50%,40%)\" fill-opacity=\"0.1\"/>\n		<line transform=\"translate(20 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(336,50%,60%)\" stroke-opacity=\"0.2\"/>\n		<line transform=\"translate(200 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(336,50%,40%)\" stroke-opacity=\"0.2\"/>\n\n		<line transform=\"translate(140 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(336,50%,40%)\" stroke-opacity=\"0.3\"/>\n		<line transform=\"translate(80 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(336,50%,40%)\" stroke-opacity=\"0.3\"/>\n\n		<line transform=\"translate(0 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(236,50%,40%)\" stroke-opacity=\"0.4\" stroke-width=\"1\"/>\n		<line transform=\"translate(220 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(236,50%,40%)\" stroke-opacity=\"0.4\" stroke-width=\"1\"/>\n	</pattern>\n</defs>\n<g id=\"debug-grid-body\" transform=\"translate(0 0.5)\">\n	<rect id=\"baseline\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"/>\n	<g id=\"debug-grid-container\">\n		<g id=\"debug-grid-content\">\n			<rect id=\"baseline-content\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"/>\n			<line id=\"gct0\" class=\"hguide\" x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\"/>\n			<line id=\"gct1\" class=\"hguide\" x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\"/>\n		</g>\n		<line id=\"gnv0\" class=\"hguide\" x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\"/>\n		<line id=\"gnv1\" class=\"hguide\" x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\"/>\n	</g>\n\n	<g id=\"abs-cols\">\n		<rect id=\"columns\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"/>\n	</g>\n\n	<g id=\"rel-cols\">\n		<line id=\"le\" class=\"vguide edge\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n		<line id=\"re\" class=\"vguide edge\" x1=\"100%\" x2=\"100%\" y1=\"0\" y2=\"100%\"/>\n\n		<line id=\"gl0\" class=\"vguide margin\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n		<line id=\"gl1\" class=\"vguide gutter\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n\n		<line id=\"gr0\" class=\"vguide margin\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n		<line id=\"gr1\" class=\"vguide gutter\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n\n		<line id=\"gm\" class=\"vguide\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n	</g>\n</g>\n</svg>\n";
},"useData":true});

},{"hbsfy/runtime":35}],58:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
var partial$0 = require('../../view/template/svg/CogSymbol.hbs');
HandlebarsCompiler.registerPartial('../../view/template/svg/CogSymbol.hbs', partial$0);
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	<dd id=\"select-layout\">\n		<select size=1>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.layouts : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</select>\n	</dd>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "			<option value=\""
    + alias2(alias1(depth0, depth0))
    + "\">"
    + alias2(alias1(depth0, depth0))
    + "</option>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "		<li class=\""
    + ((stack1 = helpers["if"].call(alias1,depth0,{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\">"
    + container.escapeExpression(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"key","hash":{},"data":data}) : helper)))
    + "</li>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "passed";
},"7":function(container,depth0,helpers,partials,data) {
    return "failed";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression;

  return "<dl class=\"debug-links color-bg\">\n	<dt id=\"links-toggle\">\n"
    + ((stack1 = container.invokePartial(partials["../../view/template/svg/CogSymbol.hbs"],depth0,{"name":"../../view/template/svg/CogSymbol.hbs","data":data,"indent":"\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "	</dt>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.layouts : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	<dd id=\"edit-backend\">\n		<a href=\""
    + alias2((helpers.global || (depth0 && depth0.global) || helpers.helperMissing).call(alias1,"APP_ROOT",{"name":"global","hash":{},"data":data}))
    + "symphony/\" class=\"color-fg color-bg\" target=\"_blank\">CMS</a>\n	</dd>\n	<dd id=\"toggle-tests\">\n		<a href=\"#toggle-tests\" class=\"color-fg color-bg\">Tests</a>\n	</dd>\n	<dd id=\"toggle-state\">\n		<a href=\"#toggle-state\" class=\"color-fg color-bg\">Route</a>\n	</dd>\n	<dd id=\"toggle-blocks-nav\">\n		<a href=\"#toggle-blocks-nav\" class=\"color-fg color-bg\">Nav</a>\n	</dd>\n	<dd id=\"toggle-blocks-content\">\n		<a href=\"#toggle-blocks-content\" class=\"color-fg color-bg\">Content</a>\n	</dd>\n	<dd id=\"toggle-mdown\">\n		<a href=\"#toggle-mdown\" class=\"color-fg color-bg\">Markdown</a>\n	</dd>\n	<dd id=\"toggle-tx\">\n		<a href=\"#toggle-tx\" class=\"color-fg color-bg\">TX/FX</a>\n	</dd>\n	<dd id=\"toggle-grid-bg\">\n		<a href=\"#toggle-grid-bg\" class=\"color-fg color-bg\">Grid</a>\n	</dd>\n	<dd id=\"toggle-graph\">\n		<a href=\"#toggle-graph\" class=\"color-fg color-bg\">Graph</a>\n	</dd>\n	<dd id=\"toggle-logs\">\n		<a href=\"#toggle-logs\" class=\"color-fg color-bg\">Logs</a>\n	</dd>\n	<dd id=\"media-info\">\n		<span></span>\n	</dd>\n	<dd id=\"viewport-info\">\n		<span></span>\n	</dd>\n	<dd id=\"app-state\">\n		<span class=\"color-fg color-bg\" data-prop=\"collapsed\">c</span><span class=\"color-fg color-bg\" data-prop=\"withBundle\">b</span><span class=\"color-fg color-bg\" data-prop=\"withMedia\">m</span><span class=\"color-fg color-bg\" data-prop=\"withArticle\">a</span>\n	</dd>\n</dl>\n<div id=\"test-results\">\n	<h6>Tests <a id=\"toggle-passed\" href=\"#toggle-passed\">Passed</a></h6>\n	<p>"
    + alias2(container.lambda(((stack1 = (depth0 != null ? depth0.navigator : depth0)) != null ? stack1.userAgent : stack1), depth0))
    + "</p>\n	<ul>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tests : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	</ul>\n</div>\n";
},"usePartial":true,"useData":true});

},{"../../view/template/svg/CogSymbol.hbs":124,"hbsfy/runtime":35}],59:[function(require,module,exports){
"use strict";

/**
 * @module app/model/BaseItem
 * @requires module:backbone
 */

/** @type {module:backbone} */
var BaseModel = require("backbone").Model; // /** @type {module:app/model/BaseModel} */
// var BaseModel = require("app/model/BaseModel");


module.exports = BaseModel.extend({
  defaults: {
    collapsed: false,
    routeName: "initial",
    article: null,
    bundle: null,
    media: null,
    fromRouteName: "",
    withArticle: false,
    withBundle: false,
    withMedia: false
  },
  getters: ["collapsed", "routeName", "article", "bundle", "media", "fromRouteName", "withArticle", "withBundle", "withMedia"],
  // mutators: {
  // 	routeName: {
  // 		set: function(key, value, opts, set) {
  // 			// Set fromRoute to avoid losing current "changing" state
  // 			this._previousAttributes["fromRouteName"] = this.attributes["fromRouteName"];
  // 			this.changed["fromRouteName"] = this.attributes["fromRouteName"] = this.previous("routeName");
  // 			// set("fromRouteName", this.previous("routeName"), {
  // 			// 	silent: true
  // 			// });
  // 		}
  // 	}
  // },
  initialize: function initialize() {
    // this.listenTo(this, {
    // 	"change:routeName": function() {
    // 		this.set("fromRouteName", this.previous("routeName"));
    // 	},
    // 	"change:article": function(val) {
    // 		console.log("%s:[change] %o", this.cid, arguments);
    // 		this.set("withArticle", (typeof val === 'object'));
    // 	},
    // 	"change:bundle": function(val) {
    // 		console.log("%s:[change] %o", this.cid, arguments);
    // 		this.set("withBundle", (typeof val === 'object'));
    // 	},
    // 	"change:media": function(val) {
    // 		console.log("%s:[change] %o", this.cid, arguments);
    // 		this.set("withMedia", (typeof val === 'object'));
    // 	},
    // });
    // this.set({
    // 	fromRouteName: "",
    // 		withArticle: false,
    // 		withBundle: false,
    // 		withMedia: false
    // });
    var opts = {
      silent: false
    };
    this.listenTo(this, "change", function (attrs) {
      // var opts = { silent: false };
      if (this.hasChanged("routeName")) {
        this.set("fromRouteName", this.previous("routeName"), opts);
      }

      if (this.hasChanged("article")) {
        this.set("withArticle", this.has("article"), opts);
      }

      if (this.hasChanged("bundle")) {
        this.set("withBundle", this.has("bundle"), opts);
      }

      if (this.hasChanged("media")) {
        this.set("withMedia", this.has("media"), opts);
      }
    });
    this.listenTo(this, "change:routeName", function (val) {
      console.log("%s:[change:routeName] %o", this.cid, val); // this.set("fromRouteName", this.previous("routeName"));
    });
    this.listenTo(this, "change:article", function (val) {
      console.log("%s:[change:article] %o", this.cid, val); // this.set("withArticle", _.isObject(val));
    });
    this.listenTo(this, "change:bundle", function (val) {
      console.log("%s:[change:bundle] %o", this.cid, val); // this.set("withBundle", _.isObject(val));
    });
    this.listenTo(this, "change:media", function (val) {
      console.log("%s:[change:media] %o", this.cid, val); // this.set("withMedia", _.isObject(val));
    });
  },
  hasAnyPrevious: function hasAnyPrevious(attr) {
    return this.previous(attr) != null;
  },
  hasAnyChanged: function hasAnyChanged(attr) {
    return this.hasChanged(attr) && this.has(attr) != this.hasAnyPrevious(attr);
  } // constructor: function() {
  // 	Object.keys(this.defaults).forEach(function(getterName) {
  // 		Object.defineProperty(this, getterName, {
  // 			enumerable: true,
  // 			get: function() {
  // 				return this.get(getterName);
  // 			}
  // 		});
  // 	});
  // 	BaseModel.apply(this, arguments);
  // }

});

},{"backbone":5}],60:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/BaseItem
 * @requires module:backbone
 */

/** @type {module:app/model/BaseModel} */
var BaseModel = require("app/model/BaseModel"); // /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");
// /** @type {module:app/utils/strings/stripTags} */
// var stripTags = require("utils/strings/stripTags");
// /** @type {module:app/model/parseSymAttrs} */
//var parseSymAttrs = require("app/model/parseSymAttrs");


var parseSymAttrs = function parseSymAttrs(s) {
  return s.replace(/(\,|\;)/g, function (m) {
    return m == "," ? ";" : ",";
  });
};

var toAttrsHash = function toAttrsHash(obj, attr) {
  if (_.isString(attr)) {
    var idx = attr.indexOf(":");

    if (idx > 0) {
      obj[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
    } else {
      obj[attr] = attr; // to match HTML5<>XHTML valueless attributes
    }
  } // else ignore non-string values


  return obj;
};
/**
 * @constructor
 * @type {module:app/model/BaseItem}
 */


module.exports = BaseModel.extend({
  _domPrefix: "_",

  /** @type {Object} */
  defaults: {
    // attrs: function() { return {}; },
    get attrs() {
      return {};
    }

  },
  getters: ["domid"],
  mutators: {
    domid: function domid() {
      if (!this.hasOwnProperty("_domId")) this._domId = this._domPrefix + this.id;
      return this._domId;
    },
    attrs: {
      set: function set(key, value, options, _set) {
        if (Array.isArray(value)) {
          value = value.reduce(toAttrsHash, {});
        }

        if (!_.isObject(value)) {
          console.error("%s::attrs value not an object or string array", this.cid, value);
          value = {};
        }

        _set(key, value, options);
      }
    }
  },
  attr: function attr(_attr) {
    return this.attrs()[_attr];
  },
  attrs: function attrs() {
    return this.get("attrs");
  },
  toString: function toString() {
    return this.get("domid");
  },
  getDistanceToSelected: function getDistanceToSelected() {
    if (this.collection && this.collection.selectedIndex > 0) {
      return this.collection.indexOf(this) - this.collection.selectedIndex;
    }

    return -1;
  },
  getIndex: function getIndex() {
    if (this.collection) {
      return this.collection.indexOf(this);
    }

    return -1;
  }
});

}).call(this,require("underscore"))

},{"app/model/BaseModel":61,"underscore":51}],61:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/BaseModel
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");

var BaseModelProto = {// constructor: function() {
  // 	if (this.properties) {
  // 		Object.defineProperties(this, this.properties);
  // 	}
  // 	Backbone.Model.apply(this, arguments);
  // }
};
var BaseModel = {
  extend: function extend(proto, obj) {
    var constr, propName; //, propDef;

    for (propName in proto) {
      if (proto.hasOwnProperty(propName) && _.isObject(proto[propName])) {
        //(Object.getPrototypeOf(proto[propName]) === Object.prototype)) {
        proto[propName] = _.defaults(proto[propName], this.prototype[propName]); // console.log("BaseModel::extend '%s:%s' is Object\n%s", proto._domPrefix, propName, JSON.stringify(proto[propName]));
      }
    } // if (_.isObject(proto.properties)) {
    // 	if (Array.isArray(proto.getters)) {
    // 		proto.properties = _.omit(proto.properties, proto.getters);
    // 	}
    // }
    // if (proto.properties && this.prototype.properties) {
    // 	_.defaults(proto.properties, this.prototype.properties);
    // }


    constr = Backbone.Model.extend.apply(this, arguments);

    if (Array.isArray(constr.prototype.getters)) {
      constr.prototype.getters.forEach(function (getterName) {
        Object.defineProperty(constr.prototype, getterName, {
          enumerable: true,
          get: function get() {
            return this.get(getterName);
          }
        });
      });
    } // if (Array.isArray(constr.prototype.properties)) {
    // }
    // if (_.isObject(proto.properties)) {
    // 	for (propName in proto.properties) {
    // 		if (proto.properties.hasOwnProperty(propName)) {
    // 			propDef = proto.properties[propName];
    // 			if (_.isFunction(propDef)) {
    // 				proto.properties[propName] = {
    // 					enumerable: true, get: propDef
    // 				};
    // 			} else if (_.isObject(propDef)){
    // 				propDef.enumerable = true;
    // 			} else {
    // 				delete proto.properties[propName];
    // 			}
    // 		}
    // 	}
    // 	Object.defineProperties(proto, proto.properties);
    // 	delete proto.properties;
    // }


    return constr;
  }
};
/**
 * @constructor
 * @type {module:app/model/BaseModel}
 */

module.exports = Backbone.Model.extend.call(Backbone.Model, BaseModelProto, BaseModel); // module.exports = Model.extend(BaseModelProto, BaseModel);

}).call(this,require("underscore"))

},{"backbone":5,"underscore":51}],62:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/SelectableCollection
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/**
 * @constructor
 * @type {module:app/model/SelectableCollection}
 */


var SelectableCollection = Backbone.Collection.extend({
  initialize: function initialize(models, options) {
    options = _.defaults({}, options, {
      initialSelection: "none",
      silentInitial: true
    });
    this.initialSelection = options.initialSelection;
    this.initialOptions = {
      silent: options.silentInitial
    };
  },
  reset: function reset(models, options) {
    this.deselect(this.initialOptions);
    Backbone.Collection.prototype.reset.apply(this, arguments);

    if (this.initialSelection === "first" && this.length) {
      this.select(this.at(0), this.initialOptions);
    }
  },
  select: function select(newModel, options) {
    if (newModel === void 0) {
      newModel = null;
    }

    if (this.selected === newModel) {
      return;
    }

    var triggerEvents = !(options && options.silent);
    var oldModel = this.selected;
    this.lastSelected = this.selected;
    this.lastSelectedIndex = this.selectedIndex;
    this.selected = newModel;
    this.selectedIndex = this.indexOf(newModel);

    if (oldModel) {
      if (_.isFunction(oldModel.deselect)) {
        oldModel.deselect(options);
      } else if (triggerEvents) {
        oldModel.selected = void 0;
        oldModel.trigger("deselected", newModel, oldModel);
      }

      if (triggerEvents) this.trigger("deselect:one", oldModel);
    } else {
      if (triggerEvents) this.trigger("deselect:none", null);
    }

    if (newModel) {
      if (_.isFunction(newModel.select)) {
        newModel.select(options);
      } else if (triggerEvents) {
        newModel.selected = true;
        newModel.trigger("selected", newModel, oldModel);
      }

      if (triggerEvents) this.trigger("select:one", newModel);
    } else {
      if (triggerEvents) this.trigger("select:none", null);
    }
  },
  deselect: function deselect(options) {
    this.select(null, options);
  },
  selectAt: function selectAt(index, options) {
    if (0 > index || index >= this.length) {
      new RangeError("index is out of bounds");
    }

    this.select(this.at(index), options);
  },
  distance: function distance(a, b) {
    var aIdx, bIdx;
    if (!a) return NaN;
    aIdx = this.indexOf(a);
    if (aIdx == -1) return NaN;

    if (arguments.length == 1) {
      bIdx = this.selectedIndex;
    } else {
      if (!b) return NaN;
      bIdx = this.indexOf(b);
      if (bIdx == -1) return NaN;
    }

    return Math.abs(bIdx - aIdx);
  },

  /* TODO: MOVE INTO MIXIN */

  /** @return boolean	/*/
  hasFollowing: function hasFollowing(model) {
    model || (model = this.selected);
    return this.indexOf(model) < this.length - 1;
  },

  /** @return next model	*/
  following: function following(model) {
    model || (model = this.selected);
    return this.hasFollowing(model) ? this.at(this.indexOf(model) + 1) : null;
  },

  /** @return next model or the beginning if at the end */
  followingOrFirst: function followingOrFirst(model) {
    model || (model = this.selected);
    return this.at((this.indexOf(model) + 1) % this.length);
  },

  /** @return boolean	/*/
  hasPreceding: function hasPreceding(model) {
    model || (model = this.selected);
    return this.indexOf(model) > 0;
  },

  /** @return the previous model */
  preceding: function preceding(model) {
    model || (model = this.selected);
    return this.hasPreceding(model) ? this.at(this.indexOf(model) - 1) : null;
  },

  /** @return the previous model or the end if at the beginning */
  precedingOrLast: function precedingOrLast(model) {
    model || (model = this.selected);
    var index = this.indexOf(model) - 1;
    return this.at(index > -1 ? index : this.length - 1);
  }
});
module.exports = SelectableCollection;

}).call(this,require("underscore"))

},{"backbone":5,"underscore":51}],63:[function(require,module,exports){
"use strict";

/**
 * @module app/model/collection/ArticleCollection
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/model/item/ArticleItem} */


var ArticleItem = require("app/model/item/ArticleItem");
/**
 * @constructor
 * @type {module:app/model/collection/ArticleCollection}
 */


var ArticleCollection = SelectableCollection.extend({
  /** @type {Backbone.Model} */
  model: ArticleItem
});
module.exports = new ArticleCollection();

},{"app/model/SelectableCollection":62,"app/model/item/ArticleItem":68}],64:[function(require,module,exports){
"use strict";

/**
 * @module app/model/collection/BundleCollection
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/model/item/BundleItem} */


var BundleItem = require("app/model/item/BundleItem");
/**
 * @constructor
 * @type {module:app/model/collection/BundleCollection}
 */


var BundleCollection = SelectableCollection.extend({
  /** @type {Backbone.Model} */
  model: BundleItem,

  /** @type {Function} */
  comparator: function comparator(oa, ob) {
    var a = oa.get("completed");
    var b = ob.get("completed");

    if (a > b) {
      return -1;
    } else if (a < b) {
      return 1;
    } else {
      return 0;
    }
  },

  /** @type {String} */
  url: "/json/bundles/"
});
module.exports = new BundleCollection();

},{"app/model/SelectableCollection":62,"app/model/item/BundleItem":69}],65:[function(require,module,exports){
"use strict";

/**
 * @module app/model/collection/KeywordCollection
 * @requires module:backbone
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/model/item/KeywordItem} */


var KeywordItem = require("app/model/item/KeywordItem");
/**
 * @constructor
 * @type {module:app/model/collection/KeywordCollection}
 */


var KeywordCollection = SelectableCollection.extend({
  /** @type {Backbone.Model} */
  model: KeywordItem
});
module.exports = new KeywordCollection();

},{"app/model/SelectableCollection":62,"app/model/item/KeywordItem":70}],66:[function(require,module,exports){
"use strict";

/**
 * @module app/model/collection/TypeCollection
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/model/item/TypeItem} */


var TypeItem = require("app/model/item/TypeItem");
/**
 * @constructor
 * @type {module:app/model/collection/TypeCollection}
 */


var TypeCollection = Backbone.Collection.extend({
  /** @type {Backbone.Model} */
  model: TypeItem
});
module.exports = new TypeCollection();

},{"app/model/item/TypeItem":73,"backbone":5}],67:[function(require,module,exports){
(function (_){
"use strict";

module.exports = function (bootstrap) {
  /** @type {module:app/control/Globals} */
  var Globals = require("app/control/Globals"); // Globals.GA_TAGS = bootstrap["ga-tags"];
  // Globals.PARAMS = bootstrap["params"];
  // Globals.APP_ROOT = bootstrap["params"]["root"];
  // Globals.MEDIA_DIR = bootstrap["params"]["uploads"];


  Globals.APP_NAME = bootstrap["params"]["website-name"];
  /** @type {module:app/model/collection/TypeCollection} */

  var typeList = require("app/model/collection/TypeCollection");
  /** @type {module:app/model/collection/KeywordCollection} */


  var keywordList = require("app/model/collection/KeywordCollection");
  /** @type {module:app/model/collection/BundleCollection} */


  var bundleList = require("app/model/collection/BundleCollection");
  /** @type {module:app/model/collection/ArticleCollection} */


  var articleList = require("app/model/collection/ArticleCollection"); // Fix-ups to bootstrap data.


  var articles = bootstrap["articles-all"];
  var types = bootstrap["types-all"];
  var keywords = bootstrap["keywords-all"];
  var bundles = bootstrap["bundles-all"];
  var media = bootstrap["media-all"]; // Attach media to their bundles

  var mediaByBundle = _.groupBy(media, "bId"); // Fill-in back-references:
  // Create Keyword.bundleIds from existing Bundle.keywordIds,
  // then Bundle.typeIds from unique Keyword.typeId
  // _.each(bundles, function (bo, bi, ba) {


  bundles.forEach(function (bo, bi, ba) {
    bo.tIds = [];
    bo.media = mediaByBundle[bo.id]; // _.each(keywords, function (ko, ki, ka) {

    keywords.forEach(function (ko, ki, ka) {
      if (bi === 0) {
        ko.bIds = [];
      } // if (_.contains(bo.kIds, ko.id)) {


      if (bo.kIds.indexOf(ko.id) != -1) {
        ko.bIds.push(bo.id); // if (!_.contains(bo.tIds, ko.tId)) {

        if (bo.tIds.indexOf(ko.tId) == -1) {
          bo.tIds.push(ko.tId);
        }
      }
    });
  }); // Fill collection singletons

  articleList.reset(articles);
  typeList.reset(types);
  keywordList.reset(keywords);
  bundleList.reset(bundles); // bootstrap["params"] = bootstrap["articles-all"] = bootstrap["types-all"] = bootstrap["keywords-all"] = bootstrap["bundles-all"] = bootstrap["media-all"] = null;
};

}).call(this,require("underscore"))

},{"app/control/Globals":55,"app/model/collection/ArticleCollection":63,"app/model/collection/BundleCollection":64,"app/model/collection/KeywordCollection":65,"app/model/collection/TypeCollection":66,"underscore":51}],68:[function(require,module,exports){
"use strict";

/**
 * @module app/model/item/ArticleItem
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/**
 * @constructor
 * @type {module:app/model/item/ArticleItem}
 */


module.exports = BaseItem.extend({
  _domPrefix: "a",

  /** @type {Object} */
  defaults: {
    name: "",
    handle: "",
    text: ""
  }
});

},{"app/model/BaseItem":60}],69:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/item/BundleItem
 * @requires module:backbone
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");/** @type {Function} */
var Color = require("color");
/** @type {module:app/model/item/SourceItem} */


var BaseItem = require("app/model/BaseItem");
/** @type {module:app/model/item/MediaItem} */


var MediaItem = require("app/model/item/MediaItem");
/** @type {module:app/model/SelectableCollection} */


var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/utils/strings/stripTags} */


var stripTags = require("utils/strings/stripTags"); // /** @type {module:app/utils/strings/parseTaglist} */
// var parseSymAttrs = require("app/model/parseSymAttrs");
// /** @type {module:app/model/collection/KeywordCollection} */
// var keywords = require("app/model/collection/KeywordCollection");
// Globals.DEFAULT_COLORS["color"];
// Globals.DEFAULT_COLORS["background-color"];


var attrsDefault = _.defaults({
  "has-colors": "defaults"
}, Globals.DEFAULT_COLORS);
/** @private */


var MediaCollection = SelectableCollection.extend({
  model: MediaItem,
  comparator: "o"
});
/**
 * @constructor
 * @type {module:app/model/item/BundleItem}
 */

module.exports = BaseItem.extend({
  _domPrefix: "b",

  /** @type {Object|Function} */
  // defaults: function() {
  // 	return {
  // 		name: "",
  // 		handle: "",
  // 		desc: "",
  // 		completed: 0,
  // 		kIds: [],
  // 	};
  // },
  defaults: {
    name: "",
    handle: "",
    desc: "",
    completed: 0,

    get kIds() {
      return [];
    }

  },
  getters: ["name", "media"],
  mutators: {
    text: function text() {
      return stripTags(this.get("desc"));
    },
    // kIds: {
    // 	set: function (key, value, options, set) {
    // 		if (Array.isArray(value)) {
    // 			set("keywords", value.map(function(id) {
    // 				var obj = keywords.get(id);
    // 				return obj;
    // 			}, this), options;
    // 		}
    // 		set(key, value, options);
    // 	},
    // },
    media: {
      transient: true,
      set: function set(key, value, options, _set) {
        if (Array.isArray(value)) {
          value.forEach(function (o) {
            o.bundle = this;
          }, this);
          value = new MediaCollection(value);
        }

        _set(key, value, options);
      }
    }
  },
  initialize: function initialize(attrs, options) {
    this.colors = {
      fgColor: new Color(this.attr("color")),
      bgColor: new Color(this.attr("background-color")),
      lnColor: new Color(this.attr("link-color"))
    };
    this.colors.hasDarkBg = this.colors.fgColor.luminosity() > this.colors.bgColor.luminosity();
  },
  attrs: function attrs() {
    return this._attrs || (this._attrs = _.defaults({}, this.get("attrs"), attrsDefault));
  }
});

}).call(this,require("underscore"))

},{"app/control/Globals":55,"app/model/BaseItem":60,"app/model/SelectableCollection":62,"app/model/item/MediaItem":71,"color":12,"underscore":51,"utils/strings/stripTags":152}],70:[function(require,module,exports){
"use strict";

/**
 * @module app/model/item/KeywordItem
 * @requires module:app/model/BaseItem
 */

/** @type {module:app/model/BaseItem} */
var BaseItem = require("app/model/BaseItem"); // /** @type {module:app/model/collection/TypeCollection} */
// var types = require("app/model/collection/TypeCollection");

/**
 * @constructor
 * @type {module:app/model/item/KeywordItem}
 */


module.exports = BaseItem.extend({
  _domPrefix: "k",

  /** @type {Object} */
  defaults: {
    name: "",
    handle: "",
    tId: -1
  } // mutators: {
  // 	tId: {
  // 		set: function (key, value, options, set) {
  // 			var type = types.get(value);
  // 			if (type) {
  // 				type.get("keywords").push(this);
  // 				set("type", type, options);
  // 			}
  // 			set(key, value, options);
  // 		}
  // 	},
  // }

});

},{"app/model/BaseItem":60}],71:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/item/MediaItem
 * @requires module:backbone
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");/** @type {Function} */
var Color = require("color");
/** @type {module:app/model/item/SourceItem} */


var BaseItem = require("app/model/BaseItem");
/** @type {module:app/model/item/SourceItem} */


var SourceItem = require("app/model/item/SourceItem");
/** @type {module:app/model/SelectableCollection} */


var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/utils/strings/stripTags} */


var stripTags = require("utils/strings/stripTags"); // /** @type {module:app/model/parseSymAttrs} */
// var parseSymAttrs = require("app/model/parseSymAttrs");
// console.log(Globals.PARAMS);


var urlTemplates = {
  "original": _.template(Globals.MEDIA_DIR + "/<%= src %>"),
  "constrain-width": _.template(Globals.APP_ROOT + "image/1/<%= width %>/0/uploads/<%= src %>"),
  "constrain-height": _.template(Globals.APP_ROOT + "image/1/0/<%= height %>/uploads/<%= src %>"),
  "debug-bandwidth": _.template(Globals.MEDIA_DIR.replace(/(https?\:\/\/[^\/]+)/, "$1/slow/<%= kbps %>") + "/<%= src %>")
};
/**
 * @constructor
 * @type {module:app/model/item/MediaItem.SourceCollection}
 */

var SourceCollection = SelectableCollection.extend({
  model: SourceItem
});
/**
 * @constructor
 * @type {module:app/model/item/MediaItem}
 */

module.exports = BaseItem.extend({
  _domPrefix: "m",

  /** @type {Object} */
  defaults: {
    name: "<p><em>Untitled</em></p>",
    sub: "",
    o: 0,
    bId: -1,
    srcIdx: 0,

    get srcset() {
      return [];
    },

    get sources() {
      return new SourceCollection();
    }

  },
  getters: ["name", "bundle", "source", "sources"],
  mutators: {
    // desc: function() {
    // 	return this.get("name");
    // },
    handle: function handle() {
      return this.get("src");
    },
    text: function text() {
      if (!this.hasOwnProperty("_text")) this._text = _.unescape(stripTags(this.get("name")));
      return this._text;
    },
    attrs: {
      set: function set(key, value, opts, _set) {
        this._attrs = null;
        BaseItem.prototype.mutators.attrs.set.apply(this, arguments);

        this._updateSources();
      }
    },
    srcset: {
      set: function set(key, value, opts, _set2) {
        _set2(key, value, opts);

        this.get("sources").reset(value, opts);

        this._updateSources();
      }
    },
    source: {
      transient: true,
      get: function get() {
        return this.get("sources").at(this.get("srcIdx"));
      }
    }
  },
  initialize: function initialize() {
    this._updateColors();

    this.listenTo(this, "change:attrs change:bundle", function () {
      this._attrs = null;
    });
  },
  attrs: function attrs() {
    return this._attrs || (this._attrs = _.defaults({}, this.get("bundle").attrs(), this.get("attrs")));
  },
  _updateColors: function _updateColors() {
    this.colors = {
      fgColor: new Color(this.attr("color")),
      bgColor: new Color(this.attr("background-color"))
    };
    this.colors.hasDarkBg = this.colors.fgColor.luminosity() > this.colors.bgColor.luminosity();
  },
  _updateSources: function _updateSources() {
    var srcObj = {
      kbps: this.attr("@debug-bandwidth")
    };
    var srcTpl = urlTemplates[srcObj.kbps ? "debug-bandwidth" : "original"];
    this.get("sources").forEach(function (item) {
      srcObj.src = item.get("src");
      item.set("original", srcTpl(srcObj));
    });
  } // _updateSourcesArr: function() {
  // 	var srcset = this.get("srcset");
  // 	if (Array.isArray(srcset)) {
  // 		var srcObj = { kbps: this.attr("@debug-bandwidth") };
  // 		var srcTpl = Globals.MEDIA_SRC_TPL[srcObj.kbps? "debug-bandwidth" : "original"];
  // 		srcset.forEach(function(o) {
  // 			srcObj.src = o.src;
  // 			o.original = srcTpl(srcObj);
  // 		}, this);
  // 	}
  // 	this.get("sources").reset(srcset);
  // },

});

}).call(this,require("underscore"))

},{"app/control/Globals":55,"app/model/BaseItem":60,"app/model/SelectableCollection":62,"app/model/item/SourceItem":72,"color":12,"underscore":51,"utils/strings/stripTags":152}],72:[function(require,module,exports){
(function (DEBUG){
"use strict";

/**
 * @module app/model/item/SourceItem
 * @requires module:backbone
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");
// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/** @type {String} */


var noCacheSuffix = "?" + Date.now();
/**
 * @constructor
 * @type {module:app/model/item/SourceItem}
 */
// module.exports = Backbone.Model.extend({

module.exports = BaseItem.extend({
  /** @type {Object} */
  defaults: {
    src: null,
    mime: null,
    w: null,
    h: null
  },
  getters: ["src", "original"],
  mutators: {
    src: {
      set: function set(key, value, options, _set) {
        if (DEBUG) {
          value += noCacheSuffix;
        }

        _set(key, value, options);
      }
    } // original: { 
    // 	transient: true,
    // 	get: function (key, value, options, set) {
    // 		return this.attributes.original || (this.attributes.original = this._composeOriginalSrc());
    // 	},
    // },
    // media: {
    // 	transient: true,
    // 	get: function () {
    // 		var retval;
    // 		if (this._noRecusion) {
    // 			console.log("%s::media returning null", this.cid);
    // 			retval = null;//this.id;
    // 		} else {
    // 			console.log("%s::media returning Object", this.cid);
    // 			this._noRecusion = true;
    // 			retval = this.attributes.media;
    // 			this._noRecusion = false;
    // 		}
    // 		return retval;
    // 	},
    // 	set: function (key, value, options, set) {
    // 		if (value instanceof BaseItem) {
    // 			set(key, value, options);
    // 		}
    // 	},
    // },

  } // initialize: function() {
  // 	if (DEBUG) {
  // 		var cb = function() {
  // 			// console.log("@debug-bandwidth:", JSON.stringify(this.get("media").attr("@debug-bandwidth")));
  // 			console.log("media:", JSON.stringify(this.toJSON()));
  // 			// if ((this.get("media") instanceof BaseItem) && this.get("media").attr("@debug-bandwidth")) {
  // 			// 	console.log("original", this.get("original"));
  // 			// 	console.log("media:", JSON.stringify(this.get("media").toJSON()));
  // 			// }
  // 		}.bind(this);
  // 		window.requestAnimationFrame(cb);
  // 	}
  // },
  // 
  // _composeOriginalSrc: function() {
  // 	var values = { src: this.get("src") };
  // 	if (this.has("media") && (values.kbps = this.get("media").attr("@debug-bandwidth"))) {
  // 	// if (this.has("media") && this.get("media").attrs().hasOwnProperty("@debug-bandwidth")) {
  // 	// 	values.kbps = this.get("media").attrs()["@debug-bandwidth"];
  // 		return Globals.MEDIA_SRC_TPL["debug-bandwidth"](values);
  // 	}
  // 	return Globals.MEDIA_SRC_TPL["original"](values);
  // },

});

}).call(this,true)

},{"app/model/BaseItem":60}],73:[function(require,module,exports){
"use strict";

/**
 * @module app/model/item/TypeItem
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/**
 * @constructor
 * @type {module:app/model/item/TypeItem}
 */


module.exports = BaseItem.extend({
  _domPrefix: "t",

  /** @type {Object} */
  defaults: {
    name: "",
    handle: "" // get kIds() { return []; },
    // get keywords() { return []; },

  }
});

},{"app/model/BaseItem":60}],74:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/AppView
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/utils/debug/traceArgs} */


var stripTags = require("utils/strings/stripTags");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/control/Controller} */


var controller = require("app/control/Controller");
/** @type {module:app/model/AppState} */


var AppState = require("app/model/AppState");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */


var articles = require("app/model/collection/ArticleCollection");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/NavigationView} */


var NavigationView = require("app/view/NavigationView");
/** @type {module:app/view/ContentView} */


var ContentView = require("app/view/ContentView");
/** @type {module:app/view/base/TouchManager} */


var TouchManager = require("app/view/base/TouchManager"); // /** @type {module:hammerjs} */
// const Hammer = require("hammerjs");
// /** @type {module:utils/touch/SmoothPanRecognizer} */
// const Pan = require("utils/touch/SmoothPanRecognizer");
// /** @type {module:hammerjs.Tap} */
// const Tap = Hammer.Tap;
// /** @type {module:utils/debug/traceElement} */
// const traceElement = require("utils/debug/traceElement");
//
// const vpanLogFn = _.debounce(console.log.bind(console), 100, false);
// const hpanLogFn = _.debounce(console.log.bind(console), 100, false);

/**
 * @constructor
 * @type {module:app/view/AppView}
 */


module.exports = View.extend({
  /** @override */
  cidPrefix: "app",

  /** @override */
  el: "html",
  // /** @override */
  className: "app",
  // without-bundle without-media without-article",

  /** @override */
  model: AppState,

  /** @override */
  events: {
    "visibilitychange": function visibilitychange(ev) {
      console.log("%s:[%s]", this.cid, ev.type);
    },
    "fullscreenchange": function fullscreenchange(ev) {
      console.log("%s:[%s] fullscreen: %o", this.cid, ev.type, document.fullscreenElement !== null, document.fullscreen);
    },
    "dragstart": function dragstart(ev) {
      if (ev.target.nodeName == "IMG" || ev.target.nodeName == "A") {
        ev.defaultPrevented || ev.preventDefault();
      }
    } // "touchmove body": function(ev) {
    // 	ev.defaultPrevented || ev.preventDefault();
    // },

  },
  properties: {
    container: {
      get: function get() {
        return this._container || (this._container = document.getElementById("container")); // (this._container = document.body);
      }
    },
    navigation: {
      get: function get() {
        return this._navigation || (this._navigation = document.getElementById("navigation"));
      }
    },
    content: {
      get: function get() {
        return this._content || (this._content = document.getElementById("content"));
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    var _this = this;

    /* elements */
    // this.routeEl = this.el;
    // this.stateEl = this.el
    this.breakpointEl = this.el;
    /* init HammerJS handlers */

    var vtouch, htouch, touchEl; // var vpan, hpan, tap;
    // this._vpanEnableFn = function(mc, ev) {
    // 	var retval = !this._hasOverflowY(this.container);
    // 	vpanLogFn("%s::_vpanEnableFn -> %o\n%o", this.cid, retval, arguments);
    // 	return retval;
    // }.bind(this);
    //
    // this._hpanEnableFn = function(mc, ev) {
    // 	var retval = this.model.get("withBundle") && this.model.get("collapsed");
    // 	hpanLogFn("%s::_hpanEnableFn -> %o\n%o", this.cid, retval, arguments);
    // 	return !!retval;
    // }.bind(this);

    touchEl = this.content; // touchEl = document.body;

    vtouch = htouch = TouchManager.init(touchEl); // vtouch.get("vpan").set({ enable: this._vpanEnableFn });
    // htouch.get("hpan").set({ enable: this._hpanEnableFn });
    // 		vtouch.set({
    // 			enable: function() {
    // 				console.log("app1::hammerjs enable", arguments);
    // 				return true;
    // 			}
    // 		});
    // hpan = vpan;
    // this.el.style.touchAction = "none"; //"pan-x pan-y";
    // tap = new Hammer.Tap();
    // hpan = new Pan({
    // 	event: "hpan",
    // 	direction: Hammer.DIRECTION_HORIZONTAL
    // });
    // hpan.set({
    // 	enable: this._hpanEnableFn
    // });
    // vpan = new Pan({
    // 	event: "vpan",
    // 	direction: Hammer.DIRECTION_VERTICAL
    // });
    // vpan.set({
    // 	enable: this._vpanEnableFn
    // });
    // hpan.requireFailure(vpan);
    // vpan.requireFailure(hpan);
    // vtouch.add([]);
    // htouch = vtouch = new Hammer.Manager(this.content);
    // htouch.add([tap, hpan, vpan]);
    // htouch.add([hpan, vpan]);
    // htouch.set({ touchAction: "pan-x pan-y" });
    // vpan = new Hammer(this.navigation, {
    // 	recognizers: [
    // 		[Pan, {
    // 			event: 'vpan',
    // 			touchAction: "pan-y",
    // 			direction: Hammer.DIRECTION_VERTICAL,
    // 			enable: vpanEnableFn
    // 		}],
    // 	]
    // });
    // hpan = new Hammer(this.content, {
    // 	recognizers: [
    // 		[Pan, {
    // 			event: 'hpan',
    // 			touchAction: "pan-x",
    // 			direction: Hammer.DIRECTION_HORIZONTAL,
    // 			enable: hpanEnableFn
    // 		}],
    // 		[Tap]
    // 	]
    // });
    // hpan.get("hpan").requireFailure(vpan.get("vpan"));
    // this._afterRender = this._afterRender.bind(this);

    this._onResize = this._onResize.bind(this);
    /* render on resize, onorientationchange, visibilitychange */
    // window.addEventListener("orientationchange", this._onResize, false);
    // window.addEventListener("resize", _.debounce(this._onResize.bind(this), 30, false), false);

    window.addEventListener("resize", this._onResize, false); // var h = function(ev) { console.log(ev.type, ev) };
    // window.addEventListener("scroll", h, false);
    // window.addEventListener("wheel", h, false);

    /* TODO: replace resize w/ mediaquery listeners. Caveat: some components
    (vg. Carousel) require update on resize */
    // this._onBreakpointChange = this._onBreakpointChange.bind(this);
    // Object.keys(Globals.BREAKPOINTS).forEach(function(s) {
    // 	Globals.BREAKPOINTS[s].addListeners(this._onBreakpointChange);
    // }, this);

    /* initialize controller/model listeners BEFORE views register their own */

    this.listenTo(controller, "route", this._onRoute); // this.listenTo(controller, "change:after", this._afterControllerChanged);

    this.listenTo(this.model, "change", this._onModelChange);
    /* FIXME */

    /* initialize views */

    this.navigationView = new NavigationView({
      el: this.navigation,
      model: this.model,
      vpan: vtouch,
      hpan: htouch
    });
    this.contentView = new ContentView({
      el: this.content,
      model: this.model,
      vpan: vtouch,
      hpan: htouch
    });
    /* TouchEvents fixups
     * ------------------------------- */
    // var traceTouchEvent = (msg, traceObj) => {
    // 	if (msg.hasOwnProperty("type")) {
    // 		msg = msg.type + " : " +
    // 			(msg.defaultPrevented ? "prevented" : "not prevented");
    // 	}
    // 	var sy, sh, ch;
    // 	sy = this.el.scrollTop;
    // 	sh = this.el.scrollHeight - 1;
    // 	ch = this.el.clientHeight;
    // 	console.log("%s:[%s] " +
    // 		"sy:[1>%o>=%s = %o] " +
    // 		"sh:[%o<=%o = %o] " +
    // 		"nav:[css:%o val:%o]",
    // 		this.cid, msg,
    // 		sy, sh - ch, (1 <= sy <= (sh - ch)),
    // 		sh, ch, (sh <= ch),
    // 		this.navigationView.el.style.height,
    // 		this.navigationView.el.scrollHeight,
    // 		traceObj || ""
    // 	);
    // };
    // var scrolltouch = new Hammer.Manager(this.el);
    // scrolltouch.add(new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL, threshold: 0 }));
    // scrolltouch.on("panmove", function(ev) {
    //
    // 	// var sy, sh, ch;
    // 	// sy = this.el.scrollTop;
    // 	// sh = this.el.scrollHeight - 1;
    // 	// ch = this.el.clientHeight;
    // 	//
    // 	// if ((1 > sy) && (ev.direction | Hammer.DIRECTION_DOWN)) {
    // 	// 	ev.preventDefault();
    // 	// 	console.log("%s:[panmove] %s", this.cid, "prevent at top");
    // 	// } else
    // 	// if ((sy > (sh - ch)) && (ev.direction | Hammer.DIRECTION_UP)) {
    // 	// 	ev.preventDefault();
    // 	// 	console.log("%s:[panmove] %s", this.cid, "prevent at bottom");
    // 	// }
    // 	if ((this.el.scrollHeight - 1) <= this.el.clientHeight) {
    // 		ev.srcEvent.preventDefault();
    // 	}
    // 	// traceTouchEvent(ev);
    // }.bind(this));

    var touchOpts = {
      capture: false,
      passive: false
    };

    var onTouchStart = function onTouchStart(ev) {
      _this.el.addEventListener("touchmove", onTouchMove, touchOpts);

      _this.el.addEventListener("touchend", onTouchEnd, touchOpts);

      _this.el.addEventListener("touchcancel", onTouchEnd, touchOpts);
    };

    var onTouchMove = function onTouchMove(ev) {
      if (!ev.defaultPrevented && _this.el.scrollHeight - 1 <= _this.el.clientHeight) {
        ev.preventDefault();
      } //traceTouchEvent(ev);

    };

    var onTouchEnd = function onTouchEnd(ev) {
      _this.el.removeEventListener("touchmove", onTouchMove, touchOpts);

      _this.el.removeEventListener("touchend", onTouchEnd, touchOpts);

      _this.el.removeEventListener("touchcancel", onTouchEnd, touchOpts);
    };

    this.el.addEventListener("touchstart", onTouchStart);

    var onMeasured = function onMeasured(view) {
      _this.setImmediate(function () {
        _this.requestAnimationFrame(function () {
          if (_this.el.scrollHeight - 1 <= _this.el.clientHeight) {
            _this.el.style.overflowY = "hidden";
          } else {
            _this.el.style.overflowY = "";
          }

          _this.el.scrollTop = 1; //traceTouchEvent("view:collapsed:measured");
        });
      });
    };

    this.listenTo(this.navigationView, "view:collapsed:measured", onMeasured);
    /* Google Analytics
     * ------------------------------- */

    if (window.ga && window.GA_ID) {
      controller.once("route", function () {
        window.ga("create", window.GA_ID, "auto"); // if localhost or dummy ID, disable analytics

        if (/(?:(localhost|\.local))$/.test(location.hostname) || window.GA_ID == "UA-0000000-0") {
          window.ga("set", "sendHitTask", null);
        }
      }).on("route", function (name) {
        var page = Backbone.history.getFragment(); // Add a slash if neccesary

        page.replace(/^(?!\/)/, "/");
        window.ga("set", "page", page);
        window.ga("send", "pageview");
      });
    }
    /* Startup listener, added last */


    this.listenToOnce(controller, "route", this._appStart);
    /* start router, which will request appropiate state */

    Backbone.history.start({
      pushState: false,
      hashChange: true
    });
  },

  /* -------------------------------
  /* _appStart
  /* ------------------------------- */
  _appStart: function _appStart(name, args) {
    console.info("%s::_appStart(%s, %s)", this.cid, name, args.join());
    this.skipTransitions = true;
    this.el.classList.add("skip-transitions");
    this.requestRender(View.MODEL_INVALID | View.SIZE_INVALID).requestChildrenRender(View.MODEL_INVALID | View.SIZE_INVALID).listenToOnce(this, "view:render:after", function (view, flags) {
      // this.setImmediate(function() {
      this.requestAnimationFrame(function () {
        console.log("%s::_appStart[view:render:after][raf]", this.cid);
        this.skipTransitions = false;
        this.el.classList.remove("skip-transitions");
        this.el.classList.remove("app-initial");
      });
    });
  },

  /* --------------------------- *
  /* route changed
  /* --------------------------- */
  _onRoute: function _onRoute(name, args) {
    console.info("%s::_onRoute %o -> %o", this.cid, this.model.get("routeName"), name); // var o = _.defaults({ routeName: name }, AppState.prototype.defaults);

    var o = {
      routeName: name,
      bundle: null,
      media: null,
      article: null
    };

    switch (name) {
      case "media-item":
        o.bundle = bundles.selected; // o.withBundle = true;

        o.media = o.bundle.media.selected; // o.withMedia = true;

        o.collapsed = true;
        break;

      case "bundle-item":
        o.bundle = bundles.selected; // o.withBundle = true;

        o.collapsed = true;
        break;

      case "article-item":
        o.article = articles.selected; // o.withArticle = true;

        o.collapsed = true;
        break;

      case "bundle-list":
      case "notfound":
      case "root":
      default:
        o.collapsed = false;
        break;
    } // console.log("%s::_onRoute args: %o", this.cid, name, args);


    this.model.set(o);
  },

  /* --------------------------- *
  /* model changed
  /* --------------------------- */
  _onModelChange: function _onModelChange() {
    if (DEBUG) {
      console.groupCollapsed(this.cid + "::_onModelChange");
      console.groupCollapsed("changes");
      Object.keys(this.model.changedAttributes()).forEach(function (key) {
        console.info("%s::_onModelChange %s: %s -> %s", this.cid, key, this.model.previous(key), this.model.get(key));
      }, this);
      ["Article", "Bundle", "Media"].forEach(function (name) {
        var key = name.toLowerCase();
        console[this.hasChanged("with" + name) == this.hasAnyChanged(key) ? "log" : "warn"].call(console, "%s::_onModelChange with%s: %o with%sChanged: %o", this.cid, name, this.has(key), name, this.hasAnyChanged(key));
      }, this.model);
      console.groupEnd();
      this.once("view:render:after", function (view, flags) {
        console.info("%s::_onModelChange [view:render:after]", view.cid);
        console.groupEnd();
      });
    }

    this.requestRender(View.MODEL_INVALID); // this.requestChildrenRender(View.MODEL_INVALID);
  },

  /* -------------------------------
  /* resize
  /* ------------------------------- */
  _onResize: function _onResize(ev) {
    console.group(this.cid + "::_onResize [event]");
    this.skipTransitions = true;
    this.el.classList.add("skip-transitions");
    this.requestRender(View.SIZE_INVALID) // .whenRendered().then(function(view) {
    .once("view:render:after", function (view, flags) {
      // this.requestChildrenRender(View.SIZE_INVALID, true);
      // this.setImmediate(function() {
      this.requestAnimationFrame(function () {
        console.info("%s::_onResize [view:render:after][raf]", view.cid);
        view.skipTransitions = false;
        view.el.classList.remove("skip-transitions");
        this.el.scrollTop = 1;
        console.groupEnd();
      });
    });
    if (document.fullscreenElement === null) this.renderNow();
  },

  /* -------------------------------
  /* render
  /* ------------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    console.log("%s::renderFrame [%s]", this.cid, View.flagsToString(flags));
    /* model: set route & model id classes */

    if (flags & View.MODEL_INVALID) {
      this.renderModelChange(flags);
    }
    /* size: check breakpoints and set classes*/


    if (flags & View.SIZE_INVALID) {
      _.each(Globals.BREAKPOINTS, function (o, s) {
        this.toggle(s, o.matches);
      }, this.breakpointEl.classList);
    }
    /* request children render:  always render now */


    this.requestChildrenRender(flags, true);
    /* request children render:  set 'now' flag if size is invalid */
    // this.requestChildrenRender(flags, flags & View.SIZE_INVALID);
    // if ((this.el.scrollHeight - 1) <= this.el.clientHeight) {
    // 	this.el.scrollTop = 1;
    // 	this.el.style.overflowY = "hidden";
    // } else {
    // 	this.el.style.overflowY = "";
    // }
    // this.navigationView.whenRendered().then(function(view) {
    // 	this.requestAnimationFrame(function() {
    // 		console.log("%s::renderFrame [raf] css:%o val:%o",
    // 			this.cid,
    // 			this.navigationView.el.style.height,
    // 			this.navigationView.el.scrollHeight,
    // 			this.el.scrollTop,
    // 			this.el.scrollHeight - 1,
    // 			this.el.clientHeight,
    // 			(this.el.scrollHeight - 1) <= this.el.clientHeight,
    // 			this.el.style.overflowY
    // 		);
    // 	});
    // }.bind(this));
  },

  /* -------------------------------
  /* body classes etc
  /* ------------------------------- */
  renderModelChange: function renderModelChange() {
    var cls = this.el.classList;
    var prevAttr = null;
    var docTitle = [];
    var hasDarkBg = false;
    docTitle.push(Globals.APP_NAME);

    if (this.model.get("bundle")) {
      docTitle.push(stripTags(this.model.get("bundle").get("name")));

      if (this.model.get("media")) {
        docTitle.push(stripTags(this.model.get("media").get("name")));
      }
    } else if (this.model.get("article")) {
      docTitle.push(stripTags(this.model.get("article").get("name")));
    }

    document.title = _.unescape(docTitle.join(" / "));
    /* Set route class */

    if (this.model.hasChanged("routeName")) {
      prevAttr = this.model.previous("fromRouteName");

      if (prevAttr) {
        cls.remove("from-route-" + prevAttr);
      }

      cls.add("from-route-" + this.model.get("fromRouteName"));
      prevAttr = this.model.previous("routeName");

      if (prevAttr) {
        cls.remove("route-" + prevAttr); // this.el.setAttribute("from-route", prevAttr);
      } // this.el.setAttribute("to-route", this.model.get("routeName"));


      cls.add("route-" + this.model.get("routeName"));
    }
    /* Set model id classes for color styles */


    ["article", "bundle", "media"].forEach(function (prop) {
      var item = this.model.get(prop);

      if (this.model.hasChanged(prop)) {
        prevAttr = this.model.previous(prop);

        if (prevAttr) {
          cls.remove(prevAttr.get("domid"));
        }

        if (item) {
          cls.add(item.get("domid"));
        }
      }

      cls.toggle("with-" + prop, !!item);
      cls.toggle("without-" + prop, !item);
      hasDarkBg |= item && item.colors && item.colors.hasDarkBg;
    }.bind(this));
    /* flag dark background */

    cls.toggle("color-dark", hasDarkBg);
  }
}, {
  getInstance: function getInstance() {
    if (!(window.app instanceof this)) {
      window.app = new this({
        model: new AppState()
      });
    }

    return window.app;
  }
});

if (DEBUG) {
  module.exports = function (AppView) {
    /** @type {module:app/debug/DebugToolbar} */
    var DebugToolbar = require("app/debug/DebugToolbar");

    return AppView.extend({
      initialize: function initialize() {
        var retval;
        var view = new DebugToolbar({
          id: "debug-toolbar",
          model: this.model
        });
        document.body.appendChild(view.render().el);
        retval = AppView.prototype.initialize.apply(this, arguments);
        this._logFlags["view.trace"] = true;
        this.navigationView._logFlags["view.trace"] = true;
        return retval;
      }
    });
  }(module.exports);
}

}).call(this,true,require("underscore"))

},{"app/control/Controller":54,"app/control/Globals":55,"app/debug/DebugToolbar":56,"app/model/AppState":59,"app/model/collection/ArticleCollection":63,"app/model/collection/BundleCollection":64,"app/view/ContentView":75,"app/view/NavigationView":76,"app/view/base/TouchManager":81,"app/view/base/View":82,"backbone":5,"underscore":51,"utils/strings/stripTags":152}],75:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/ContentView
 */

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/TransformHelper} */


var TransformHelper = require("utils/TransformHelper"); // /** @type {module:app/view/base/TouchManager} */
// var TouchManager = require("app/view/base/TouchManager");

/** @type {module:app/control/Controller} */


var controller = require("app/control/Controller");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */


var articles = require("app/model/collection/ArticleCollection"); // /** @type {module:app/model/collection/BundleItem} */
// var BundleItem = require("app/model/item/BundleItem");

/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/component/ArticleView} */


var ArticleView = require("app/view/component/ArticleView");
/** @type {module:app/view/component/CollectionStack} */


var CollectionStack = require("app/view/component/CollectionStack");
/** @type {module:app/view/component/CollectionStack} */


var SelectableListView = require("app/view/component/SelectableListView");
/** @type {module:app/view/render/DotNavigationRenderer} */


var DotNavigationRenderer = require("app/view/render/DotNavigationRenderer");
/** @type {module:app/view/component/Carousel} */


var Carousel = require("app/view/component/Carousel");
/** @type {module:app/view/render/CarouselRenderer} */


var CarouselRenderer = require("app/view/render/CarouselRenderer");
/** @type {module:app/view/render/ImageRenderer} */


var ImageRenderer = require("app/view/render/ImageRenderer");
/** @type {module:app/view/render/VideoRenderer} */


var VideoRenderer = require("app/view/render/VideoRenderer");
/** @type {module:app/view/render/SequenceRenderer} */


var SequenceRenderer = require("app/view/render/SequenceRenderer"); // /** @type {module:app/view/component/CanvasProgressMeter} */
// var ProgressMeter = require("app/view/component/CanvasProgressMeter");

/** @type {Function} */


var carouselEmptyTemplate = require("./template/Carousel.EmptyRenderer.Bundle.hbs");
/** @type {Function} */


var mediaStackTemplate = require("./template/CollectionStack.Media.hbs"); // var transitionEnd = View.prefixedEvent("transitionend");


var transformProp = View.prefixedProperty("transform");
var transitionProp = View.prefixedProperty("transition");
var tx = Globals.transitions; // var clickEvent = window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */

module.exports = View.extend({
  /** @override */
  cidPrefix: "contentView",

  /** @override */
  className: "container-expanded",

  /** @override */
  events: {
    "transitionend .adding-child": "_onAddedTransitionEnd",
    "transitionend .removing-child": "_onRemovedTransitionEnd" // "transitionend": "_onTransitionEnd",

  },

  /** @override */
  initialize: function initialize(options) {
    _.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal", "_onCollapsedEvent");

    this.transforms = new TransformHelper(); // this.touch = options.touch || new Error("no touch"); //TouchManager.getInstance();

    this.vpan = options.vpan || new Error("no vpan");
    this.hpan = options.hpan || new Error("no hpan");
    this.listenTo(this.model, "change", this._onModelChange); // disconnect children before last change
    // this.listenTo(bundles, "deselect:one", this._onDeselectOneBundle);

    this.skipTransitions = true;
    this.itemViews = []; // this.progressWrapper = this.createProgressWrapper(),
    // this.el.appendChild(this.progressWrapper.el);
  },

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    // values
    var collapsed = this.model.get("collapsed");
    var collapsedChanged = flags & View.MODEL_INVALID && this.model.hasChanged("collapsed");
    var childrenChanged = flags & View.MODEL_INVALID && (this.model.hasChanged("bundle") || this.model.hasChanged("article")); // flags

    var sizeChanged = !!(flags & View.SIZE_INVALID);
    var transformsChanged = !!(flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID));
    transformsChanged = transformsChanged || this._transformsChanged || this.skipTransitions; // debug
    // - - - - - - - - - - - - - - - - -
    // if (flags & View.MODEL_INVALID) {
    // 	console.group(this.cid + "::renderFrame model changed:");
    // 	Object.keys(this.model.changed).forEach(function(key) {
    // 		console.log("\t%s: %s -> %s", key, this.model._previousAttributes[key], this.model.changed[key]);
    // 	}, this);
    // 	console.groupEnd();
    // }
    // model:children
    // - - - - - - - - - - - - - - - - -

    if (childrenChanged) {
      this.removeChildren();

      if (bundles.selected) {
        this.createChildren(bundles.selected);
      } else if (articles.selected) {
        this.createChildren(articles.selected);
      }
    } // model:collapsed
    // - - - - - - - - - - - - - - - - -


    if (collapsedChanged) {
      this.el.classList.toggle("container-collapsed", collapsed);
      this.el.classList.toggle("container-expanded", !collapsed);
    } // size
    // - - - - - - - - - - - - - - - - -


    if (sizeChanged) {
      this.transforms.clearAllCaptures();
    } // transforms
    // - - - - - - - - - - - - - - - - -


    if (transformsChanged) {
      this.el.classList.remove("container-changing");

      if (this.skipTransitions) {
        this.transforms.stopAllTransitions();
        this.el.classList.remove("container-changed");

        if (!childrenChanged) {
          // this.transforms.clearAllOffsets();
          if (collapsedChanged) {
            this._setChildrenEnabled(collapsed);
          }
        }
      } else {
        if (!childrenChanged) {
          if (collapsedChanged) {
            var afterTransitionsFn;
            this.el.classList.add("container-changed"); // this.transforms.clearAllOffsets();

            if (collapsed) {
              // container-collapsed, enable last
              afterTransitionsFn = function afterTransitionsFn() {
                this._setChildrenEnabled(true);

                this.el.classList.remove("container-changed");
              };

              this.transforms.runAllTransitions(tx.LAST);
            } else {
              // container-expanded, disable first
              afterTransitionsFn = function afterTransitionsFn() {
                this.el.classList.remove("container-changed");
              };

              this._setChildrenEnabled(false);

              this.transforms.runAllTransitions(tx.FIRST);
            }

            afterTransitionsFn = afterTransitionsFn.bind(this);
            this.transforms.whenAllTransitionsEnd().then(afterTransitionsFn, afterTransitionsFn);
          } else {
            this.transforms.items.forEach(function (o) {
              if (o.hasOffset) {
                o.runTransition(tx.NOW); // o.clearOffset();
              }
            });
          }
        }
      }

      if (!childrenChanged) {
        this.transforms.clearAllOffsets();
      }

      this.transforms.validate();
    }

    if (sizeChanged) {
      this.itemViews.forEach(function (view) {
        view.skipTransitions = this.skipTransitions;
        view.requestRender(View.SIZE_INVALID).renderNow();
      }, this);
      /*Promise.all(this.itemViews.map(function(view) {
      		view.skipTransitions = this.skipTransitions;
      		return view.requestRender(View.SIZE_INVALID).whenRendered();
      	}, this))
      	.then(
      		function(views) {
      			var nh = this.el.offsetParent.offsetHeight - this.el.offsetTop;
      			// var oh = views.reduce(function(h, view) {
      			// 	return Math.max(h, view.el.offsetHeight);
      			// }, nh);
      			// oh++;
      			// console.log("%s:[whenRendered] [result: %s %s] %o", this.cid,
      			// 	nh, oh, this.el.parent, views);
      			this.el.style.minHeight = nh + "px";
      			return views;
      		}.bind(this),
      		function(reason) {
      			console.warn("%s:[whenRendered] [rejected] %o", this.cid, reason);
      			return reason;
      		}.bind(this)
      	);*/
    }

    this.skipTransitions = this._transformsChanged = false;
  },
  _setChildrenEnabled: function _setChildrenEnabled(enabled) {
    // if (enabled) {
    // 	this.el.removeEventListener("click", this._onCollapsedClick, false);
    // } else {
    // 	this.el.addEventListener("click", this._onCollapsedClick, false);
    // }
    this.itemViews.forEach(function (view) {
      view.setEnabled(enabled);
    });
  },

  /* -------------------------------
  /* Collapse UI gestures/events
  /* ------------------------------- */
  _onCollapsedEvent: function _onCollapsedEvent(ev) {
    console.log("%s:[%s -> _onCollapsedEvent] target: %s", this.cid, ev.type, ev.target);

    if (!ev.defaultPrevented && this.model.has("bundle") && !this.model.get("collapsed") && !this.enabled) {
      // this.setImmediate(function() {
      // if (ev.type == "click") ev.stopPropagation();
      ev.preventDefault();
      this.setImmediate(function () {
        // if (ev.type == "click") ev.stopPropagation();
        this.model.set("collapsed", true);
      }); // });
    }
  },

  /* --------------------------- *
  /* model changed
  /* --------------------------- */
  _onModelChange: function _onModelChange() {
    if (this.model.hasAnyChanged("bundle")) {
      if (this.model.has("bundle")) {
        this.vpan.on("vpanstart", this._onVPanStart);
      } else {
        this.vpan.off("vpanstart", this._onVPanStart);
      }
    }
    /*
    if (this.model.hasChanged("withBundle") ||
    	this.model.hasChanged("collapsed")) {
    	if (this.model.get("withBundle") &&
    		!this.model.get("collapsed")) {
    		this.hpan.on("hpanleft hpanright", this._onCollapsedEvent);
    		this.el.addEventListener(View.CLICK_EVENT, this._onCollapsedEvent, false);
    	} else {
    		this.hpan.off("hpanleft hpanright", this._onCollapsedEvent);
    		this.el.removeEventListener(View.CLICK_EVENT, this._onCollapsedEvent, false);
    	}
    }
    */


    this.requestRender(View.MODEL_INVALID);
  },

  /* -------------------------------
  /* Vertical touch/move (_onVPan*)
  /* ------------------------------- */
  _collapsedOffsetY: Globals.COLLAPSE_OFFSET,
  _onVPanStart: function _onVPanStart(ev) {
    this.vpan.on("vpanmove", this._onVPanMove);
    this.vpan.on("vpanend vpancancel", this._onVPanFinal);
    this.transforms.stopAllTransitions(); // this.transforms.clearAllOffsets();
    // this.transforms.validate();

    this.transforms.clearAllCaptures();
    this.el.classList.add("container-changing");

    this._onVPanMove(ev);
  },
  _onVPanMove: function _onVPanMove(ev) {
    var collapsed = this.model.get("collapsed");
    var delta = ev.deltaY; //ev.thresholdDeltaY;

    var maxDelta = this._collapsedOffsetY; // + Math.abs(ev.thresholdOffsetY);
    // check if direction is aligned with collapsed/expand

    var isValidDir = collapsed ? delta > 0 : delta < 0;
    var moveFactor = collapsed ? Globals.VPAN_DRAG : 1 - Globals.VPAN_DRAG;
    delta = Math.abs(delta); // remove sign

    delta *= moveFactor;
    maxDelta *= moveFactor;

    if (isValidDir) {
      if (delta > maxDelta) {
        // overshooting
        delta = (delta - maxDelta) * Globals.VPAN_OUT_DRAG + maxDelta;
      } else {// no overshooting
        // delta = delta;
      }
    } else {
      delta = -delta * Globals.VPAN_OUT_DRAG; // delta is opposite
    }

    delta *= collapsed ? 1 : -1; // reapply sign

    this.transforms.offsetAll(0, delta);
    this.transforms.validate();
  },
  _onVPanFinal: function _onVPanFinal(ev) {
    this.vpan.off("vpanmove", this._onVPanMove);
    this.vpan.off("vpanend vpancancel", this._onVPanFinal); // FIXME: model.collapsed may have already changed, _onVPanMove would run with wrong values:
    // model.collapsed is changed in a setImmediate callback from NavigationView.

    this._onVPanMove(ev);

    this.setImmediate(function () {
      this._transformsChanged = true;
      this.requestRender();
    });
  },
  // willCollapsedChange: function(ev) {
  // 	var collapsed = this.model.get("collapsed");
  // 	return ev.type == "vpanend"? collapsed?
  // 		ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
  // 		ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
  // 		false;
  // },

  /* -------------------------------
  /* create/remove children on bundle selection
  /* ------------------------------- */

  /** Create children on bundle select */
  createChildren: function createChildren(model) {
    var view;

    if (model.__proto__.constructor === bundles.model) {
      // will be attached to dom in this order
      view = this.createMediaCaptionStack(model);
      this.itemViews.push(view);
      this.transforms.add(view.el);
      view = this.createMediaCarousel(model);
      this.itemViews.push(view);
      this.transforms.add(view.el);
      view = this.createMediaDotNavigation(model);
      this.itemViews.push(view);
    } else if (model.__proto__.constructor === articles.model) {
      view = this.createArticleView(model);
      this.itemViews.push(view);
    }

    this.itemViews.forEach(function (view) {
      if (!this.skipTransitions) {
        view.el.classList.add("adding-child");
        view.el.style.opacity = 0;
      }

      this.el.appendChild(view.el);
      view.render();
    }, this);

    if (!this.skipTransitions) {
      this.requestAnimationFrame(function () {
        console.log("%s::createChildren::[callback:requestAnimationFrame]", this.cid);
        this.itemViews.forEach(function (view) {
          if (!this.skipTransitions) {
            view.el.style[transitionProp] = "opacity " + tx.LAST.cssText;
          }

          view.el.style.removeProperty("opacity");
        }, this);
      });
    }
  },
  removeChildren: function removeChildren() {
    this.itemViews.forEach(function (view, i, arr) {
      this.transforms.remove(view.el);

      if (this.skipTransitions) {
        view.remove();
      } else {
        var s = window.getComputedStyle(view.el);

        if (s.opacity == "0" || s.visibility == "hidden") {
          console.log("%s::removeChildren [view:%s] removed immediately (invisible)", this.cid, view.cid);
          view.remove();
        } else {
          view.el.classList.add("removing-child");
          if (s[transformProp]) view.el.style[transformProp] = s[transformProp];
          view.el.style[transitionProp] = "opacity " + tx.FIRST.cssText;
          view.el.style.opacity = 0;
        }
      }

      arr[i] = null;
    }, this);
    this.itemViews.length = 0;
  },
  _onAddedTransitionEnd: function _onAddedTransitionEnd(ev) {
    if (ev.target.cid && this.childViews.hasOwnProperty(ev.target.cid)) {
      console.log("%s::_onAddedTransitionEnd [view:%s] [prop:%s] [ev:%s]", this.cid, ev.target.cid, ev.propertyName, ev.type);
      var view = this.childViews[ev.target.cid];
      view.el.classList.remove("adding-child");
      view.el.style.removeProperty(transitionProp);
    }
  },
  _onRemovedTransitionEnd: function _onRemovedTransitionEnd(ev) {
    if (ev.target.cid && this.childViews.hasOwnProperty(ev.target.cid)) {
      console.log("%s::_onRemovedTransitionEnd [view:%s] [prop:%s] [ev:%s]", this.cid, ev.target.cid, ev.propertyName, ev.type);
      var view = this.childViews[ev.target.cid];
      view.el.classList.remove("removing-child");
      view.remove();
    }
  },
  // purgeChildren: function() {
  // 	var i, el, els = this.el.querySelectorAll(".removing-child");
  // 	for (i = 0; i < els.length; i++) {
  // 		el = els.item(i);
  // 		if (el.parentElement === this.el) {
  // 			try {
  // 				console.error("%s::purgeChildren", this.cid, el.getAttribute("data-cid"));
  // 				View.findByElement(el).remove();
  // 			} catch (err) {
  // 				console.error("s::purgeChildren", this.cid, "orphaned element", err);
  // 				this.el.removeChild(el);
  // 			}
  // 		}
  // 	}
  // },

  /* -------------------------------
  /* Components
  /* ------------------------------- */

  /**
   * media-carousel
   */
  createMediaCarousel: function createMediaCarousel(bundle) {
    // Create carousel
    var EmptyRenderer = CarouselRenderer.extend({
      className: "carousel-item empty-item",
      model: bundle,
      template: carouselEmptyTemplate
    });

    var rendererFunction = function rendererFunction(item, index, arr) {
      if (index === -1) {
        return EmptyRenderer;
      }

      switch (item.attr("@renderer")) {
        case "video":
          return VideoRenderer;

        case "sequence":
          return SequenceRenderer;

        case "image":
          return ImageRenderer;

        default:
          return ImageRenderer;
      }
    };

    var view = new Carousel({
      className: "media-carousel " + bundle.get("domid"),
      collection: bundle.get("media"),
      rendererFunction: rendererFunction,
      requireSelection: false,
      // direction: Carousel.DIRECTION_HORIZONTAL,
      touch: this.hpan
    });
    controller.listenTo(view, {
      "view:select:one": function viewSelectOne(model) {
        console.log("%s:[view:select:one] %s", view.cid, model.cid);
        controller.selectMedia(model);
      },
      "view:select:none": controller.deselectMedia // "view:removed": controller.stopListening

    });
    view.listenTo(bundle, "deselected", function () {
      this.stopListening(this.collection);
      controller.stopListening(this);
    });
    return view;
  },

  /**
   * media-caption-stack
   */
  createMediaCaptionStack: function createMediaCaptionStack(bundle) {
    var view = new CollectionStack({
      className: "media-caption-stack",
      collection: bundle.get("media"),
      template: mediaStackTemplate
    });
    view.listenTo(bundle, "deselected", function () {
      this.stopListening(this.collection);
    });
    return view;
  },

  /**
   * media-dotnav
   */
  createMediaDotNavigation: function createMediaDotNavigation(bundle) {
    var view = new SelectableListView({
      className: "media-dotnav dots-fontface color-fg05",
      collection: bundle.get("media"),
      renderer: DotNavigationRenderer
    });
    controller.listenTo(view, {
      "view:select:one": controller.selectMedia,
      "view:select:none": controller.deselectMedia // "view:removed": controller.stopListening

    });
    view.listenTo(bundle, "deselected", function () {
      this.stopListening(this.collection);
      controller.stopListening(this);
    });
    return view;
  },

  /**
   * @param el {module:app/model/item/ArticleView}
   * @return {module:app/view/base/View}
   */
  createArticleView: function createArticleView(article) {
    var view = new ArticleView({
      model: article
    });
    return view;
  } // createProgressWrapper: function() {
  // 	// var view = new ProgressMeter({
  // 	// 	id: "media-progress-wrapper",
  // 	// 	// className: "color-bg color-fg05",
  // 	// 	useOpaque: false,
  // 	// 	labelFn: function() { return "0%"; }
  // 	// });
  // 	// this.el.appendChild(this.progressWrapper.el);
  // 	// return view;
  // 	return null;
  // },

});

}).call(this,require("underscore"))

},{"./template/Carousel.EmptyRenderer.Bundle.hbs":120,"./template/CollectionStack.Media.hbs":121,"app/control/Controller":54,"app/control/Globals":55,"app/model/collection/ArticleCollection":63,"app/model/collection/BundleCollection":64,"app/view/base/View":82,"app/view/component/ArticleView":86,"app/view/component/Carousel":88,"app/view/component/CollectionStack":90,"app/view/component/SelectableListView":95,"app/view/render/CarouselRenderer":105,"app/view/render/DotNavigationRenderer":110,"app/view/render/ImageRenderer":112,"app/view/render/SequenceRenderer":117,"app/view/render/VideoRenderer":119,"underscore":51,"utils/TransformHelper":127}],76:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/NavigationView
 */

/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:utils/TransformHelper} */


var TransformHelper = require("utils/TransformHelper"); // /** @type {module:app/view/base/TouchManager} */
// var TouchManager = require("app/view/base/TouchManager");

/** @type {module:app/control/Controller} */


var controller = require("app/control/Controller");
/** @type {module:app/model/collection/TypeCollection} */


var types = require("app/model/collection/TypeCollection");
/** @type {module:app/model/collection/KeywordCollection} */


var keywords = require("app/model/collection/KeywordCollection");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */


var articles = require("app/model/collection/ArticleCollection");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/component/FilterableListView} */


var FilterableListView = require("app/view/component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */


var GroupingListView = require("app/view/component/GroupingListView"); // /** @type {module:app/view/component/CollectionPager} */
// var CollectionPager = require("app/view/component/CollectionPager");

/** @type {module:app/view/component/GraphView} */


var GraphView = require("app/view/component/GraphView");
/** @type {module:app/view/component/ArticleButton} */


var ArticleButton = require("app/view/component/ArticleButton"); // /** @type {module:utils/prefixedProperty} */
// var prefixedProperty = require("utils/prefixedProperty");
// var traceElement = require("utils/debug/traceElement");


var tx = Globals.transitions;

var txNow = _.clone(tx.NOW);

txNow.easing = "ease"; // var hTx = _.clone(collapsed ? tx.LAST : tx.FIRST);
// hTx.easing = "ease";

/**
 * @constructor
 * @type {module:app/view/NavigationView}
 */

module.exports = View.extend({
  // /** @override */
  // tagName: "div",

  /** @override */
  cidPrefix: "navigationView",

  /** @override */
  className: "navigation container-expanded",

  /** @override */
  initialize: function initialize(options) {
    _.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");

    _.bindAll(this, "_onHPanStart", "_onHPanMove", "_onHPanFinal");

    _.bindAll(this, "_onNavigationClick"); // _.bindAll(this, "_whenTransitionsEnd", "_whenTransitionsAbort");
    // _.bindAll(this, "_whenListsRendered");
    // this._metrics = {
    // 	minHeight: 0
    // };


    this.itemViews = [];
    this.transforms = new TransformHelper(); // this.touch = options.touch || new Error("no touch"); //TouchManager.getInstance();

    this.vpan = options.vpan || new Error("no vpan");
    this.hpan = options.hpan || new Error("no hpan");
    this.listenTo(this.model, "change", this._onModelChange);
    this.listenTo(keywords, "select:one select:none", this._onKeywordSelect); // this.listenTo(this.model, "withBundle:change", this._onwithBundleChange);

    this.vpanGroup = this.el.querySelector("#vpan-group"); // this.el.style.touchAction = "none";
    // this.el.style.webkitUserSelect = "none";
    // this.el.style.webkitUserDrag = "none";

    this.keywordList = this.createKeywordList();
    this.bundleList = this.createBundleList();
    this.itemViews.push(this.keywordList);
    this.itemViews.push(this.bundleList);
    this.graph = this.createGraphView(this.bundleList, this.keywordList, this.vpanGroup);
    this.sitename = this.createSitenameButton();
    this.about = this.createAboutButton();
    /* NOTE: .list-group .label moves horizontally (cf. sass/layouts/*.scss) */

    this.hGroupings = this.keywordList.el.querySelectorAll(".list-group .label");
    this.transforms.add(this.vpanGroup, this.bundleList.wrapper, this.keywordList.wrapper, this.bundleList.el, this.keywordList.el, this.hGroupings, this.sitename.wrapper, this.about.wrapper, this.sitename.el, this.about.el, this.graph.el); // this.itemViews.push(this.graph);
    // this.listenTo(this.graph, {
    // 	"canvas:update": this._onGraphUpdate,
    // 	"canvas:redraw": this._onGraphRedraw,
    // });

    /*this.listenTo(this.graph, "view:render:before", function(view, flags) {
    	var vmax;
    	if (!view.el.style.height) {
    		// if (flags & (View.SIZE_INVALID | View.MODEL_INVALID)) {
    		// if ((this.bundleList.renderFlags | View.SIZE_INVALID) ||
    		// 	(this.keywordList.renderFlags | View.SIZE_INVALID)) {
    		// }
    		vmax = Math.max(
    			this.bundleList._metrics.height,
    			this.keywordList._metrics.height
    		);
    		if (_.isNumber(vmax)) {
    			view.el.style.height = vmax + "px";
    			console.log("%s:[view:render:before][once]:%s [%s] heights:[%i, %i] (max %i)",
    				this.cid, view.cid, View.flagsToString(flags),
    				this.bundleList._metrics.height,
    				this.keywordList._metrics.height,
    				vmax);
    		}
    	}
    });*/
    // this.listenTo(this.bundleList, "view:render:after", function(view, flags) {
    // 	console.info("%s:[view:render:after %s]", this.cid, view.cid, View.flagsToString(flags & View.SIZE_INVALID));
    // 		if (flags & View.SIZE_INVALID) {
    // 			// console.info("%s:[%s view:render:after] bundleList height", this.cid, view.cid, this.bundleList.el.style.height);
    // 			// this.graph.el.style.height = this.bundleList.el.style.height;
    // 			this.graph.el.style.opacity = this.bundleList.collapsed? 0 : 1;
    // 			this.graph.requestRender(View.SIZE_INVALID).renderNow();
    // 	// 	}
    // });
    // this.listenTo(this.bundleList, "view:render:after", this._onListResize);
    // this.listenTo(this.keywordList, "view:render:after", this._onListResize);
  },

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    if (flags & View.MODEL_INVALID) {
      if (this.model.hasChanged("collapsed")) {
        this.el.classList.toggle("container-collapsed", this.model.get("collapsed"));
        this.el.classList.toggle("container-expanded", !this.model.get("collapsed"));
      }

      if (this.model.hasChanged("collapsed") || this.model.hasChanged("withBundle")) {
        this.el.classList.add("container-changing");
      }

      if (this.model.hasChanged("routeName")) {
        this.bundleList.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
        this.keywordList.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
      }
    } // transforms
    // - - - - - - - - - - - - - - - - -


    if (this.skipTransitions || flags & View.ALL_INVALID) {
      // (flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID))) {
      // if (transformsChanged) {
      if (this.skipTransitions) {
        this.transforms.stopAllTransitions();
        this.transforms.validate();
        this.transforms.clearAllOffsets();
      } else {
        this.renderTransitions(flags);
      }

      this.transforms.validate(); // console.log("%s::renderFrame %o", this.cid,
      // 	this.transforms.items.map(function(o) {
      // 		return traceElement(o.el) + ":" +
      // 			(o.hasTransition ? o.transition.name : "-");
      // 	}));
    } // if (this.model.hasChanged("collapsed") && this.model.get("collapsed")) {
    // 	this.el.style.height = "";
    // 	// this.el.style.minHeight = hval + "px";
    // 	this.graph.el.style.height = "";
    // }
    // promise handlers
    // - - - - - - - - - - - - - - - - -


    var measureRenderedLists = function (result) {
      // var hval = result.reduce(function(a, o) {
      // 	return Math.max(a, o.metrics.height);
      // }, 0);
      var hval = Math.max(this.bundleList.metrics.height, this.keywordList.metrics.height);

      if (this.model.get("collapsed")) {
        this.el.style.height = ""; // this.el.style.minHeight = hval + "px";

        this.graph.el.style.height = "";
      } else {
        this.el.style.height = hval + "px"; // this.el.style.minHeight = "";

        this.graph.el.style.height = hval + "px";
      } // this.el.style.height = this.model.get("collapsed") ? "" : "100%";
      // this.vpanGroup.style.height = hval;


      this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
      console.log("%s:[whenListsRenderedDone] height set to %s", this.cid, this.model.get("collapsed") ? hval + "px" : "[not set]", result);
      this.trigger("view:collapsed:measured", this);
      return result;
    }.bind(this);

    var toggleGraph = function (result) {
      this.graph.enabled = !this.model.get("collapsed");
      this.graph.valueTo("a2b", 0, 0);

      if (!this.model.get("collapsed")) {
        this.graph.valueTo("a2b", 1, Globals.TRANSITION_DURATION);
      }

      return result;
    }.bind(this);

    var whenCollapsedChangeDone = function (result) {
      console.log("%s:[whenCollapsedChangeDone][flags: %s]", this.cid, View.flagsToString(flags), result);
      this.el.classList.remove("container-changing");
      this.trigger("view:collapsed:end", this);
      return result;
    }.bind(this); // promises
    // - - - - - - - - - - - - - - - - -


    var p; // p = Promise.all([
    // 		this.bundleList.whenRendered(),
    // 		this.keywordList.whenRendered(),
    // 		this.bundleList.whenCollapseChangeEnds(),
    // 		this.keywordList.whenCollapseChangeEnds(),
    // 		this.transforms.whenAllTransitionsEnd(),
    // 	]);

    p = Promise.all([this.bundleList.whenCollapseChangeEnds(), this.keywordList.whenCollapseChangeEnds()]).then(measureRenderedLists);

    if (flags & View.MODEL_INVALID && this.model.hasChanged("collapsed")) {
      p = p.then(toggleGraph);
    }

    p.then(this.transforms.whenAllTransitionsEnd()).then(whenCollapsedChangeDone).catch(function (reason) {
      console.warn("%s::renderFrame promise rejected", this.cid);
    }.bind(this));
    /*
    var whenListsRendered = Promise.all([
    	this.bundleList.whenRendered(),
    	this.keywordList.whenRendered()
    ]);
    	var whenTransformsEnd = this.transforms.promise();
    	whenListsRendered.then(
    	whenListsRenderedDone,
    	function(reason) {
    		console.warn("%s:[whenListsRendered] failed: %o", this.cid, reason);
    		return reason;
    	}.bind(this)
    );
    	Promise.all([
    	whenListsRendered,
    	whenTransformsEnd
    ])
    	.then(
    		function(result) {
    			console.log("%s:[whenListsRendered+whenTransformsEnd] [%s]", this.cid, View.flagsToString(flags), result);
    			this.el.classList.remove("container-changing");
    			this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    		}.bind(this),
    		function(reason) {
    			console.warn("%s:[whenListsRendered+whenTransformsEnd] [%s]", this.cid, View.flagsToString(flags), reason);
    			this.el.classList.remove("container-changing");
    			this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    		}.bind(this)
    	);*/
    // trace result handlers
    // - - - - - - - - - - - - - - - - -

    /*if (this.model.hasChanged("collapsed")) {
    	var msgBase = this.model.get("collapsed") ? "collaps" : "expand";
    	Promise.all([
    		Promise.all([
    				this.bundleList.whenRendered(),
    				this.keywordList.whenRendered()
    			])
    			.then(
    				function() {
    					console.log("nav-tx:%sing", msgBase, arguments);
    				}),
    		this.transforms.promise()
    	])
    		.catch(
    			function() {
    				console.warn("nav-tx:%sed [rejected]", msgBase, arguments);
    			})
    		.finally(
    			function() {
    				console.log("nav-tx:%sed", msgBase, arguments);
    			}
    		);
    }*/
    // graph
    // - - - - - - - - - - - - - - - - -
    // if ((flags & (View.SIZE_INVALID | ~View.MODEL_INVALID))
    // 	/* collapsed has not changed, no bundle selected */
    // 	&& !this.model.hasChanged("collapsed")
    // 	&& !this.model.get("withBundle")) {
    // 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    // 	if (!this.skipTransitions) {
    // 		this.graph.renderNow();
    // 	}
    // }
    // else
    // if ((flags & View.SIZE_INVALID) && !this.model.get("collapsed")) {
    // 	/* NavigationView has resized while uncollapsed,
    // 	but model is unchanged */
    // 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    // }
    // children loop
    // - - - - - - - - - - - - - - - - -

    this.itemViews.forEach(function (view) {
      // view.skipTransitions = view.skipTransitions || this.skipTransitions;
      if (this.skipTransitions) {
        view.skipTransitions = true;
      }

      if (flags & View.SIZE_INVALID) {
        view.requestRender(View.SIZE_INVALID);
      } // if (!view.skipTransitions) {


      view.renderNow(); // }
    }, this);
    this.requestAnimationFrame(function () {
      this.skipTransitions = false;
    });
  },

  /*_whenListsRendered: function(result) {
  	var hval;
  	if (this.model.get("collapsed")) {
  		this.el.style.height = "";
  		// this.graph.el.style.height = "100%";
  	} else {
  		// hval = result.reduce(function(a, o) {
  		// 	return Math.max(a, o.metrics.height);
  		// }, 0);
  		hval = Math.max(
  			this.bundleList.metrics.height,
  			this.keywordList.metrics.height);
  		this.el.style.height = hval + "px";
  		// this.graph.el.style.height = hval + "px";
  	}
  	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
  	console.log("%s:[_whenListsRendered] height set to %opx", this.cid, hval ? hval : "[empty]", arguments);
  	return result
  },
  	_whenTransitionsEnd: function(result) {
  	console.info("%s::_whenTransitionsEnd", this.cid);
  	this.el.classList.remove("container-changing");
  	// if (!Globals.BREAKPOINTS["medium-wide"].matches)
  	// 	return;
  	// if (!this.model.get("collapsed")) {
  	// 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID); //.renderNow();
  	// }
  	return result;
  },
  	_whenTransitionsAbort: function(reason) {
  	console.warn("%s::_whenTransitionsAbort %o", this.cid, reason);
  	this.el.classList.remove("container-changing");
  	// if (!Globals.BREAKPOINTS["medium-wide"].matches)
  	// 	return;
  	// if (!this.model.get("collapsed")) {
  	// 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID); //.renderNow();
  	// }
  	return result;
  },*/

  /* -------------------------------
  /* renderTransitions
  /* ------------------------------- */
  renderTransitions: function renderTransitions(flags) {
    var modelChanged = flags & View.MODEL_INVALID;
    var fromRoute = this.model.get("fromRouteName");
    var toRoute = this.model.get("routeName");
    var routeChanged = modelChanged && this.model.hasChanged("routeName");
    /* bundle */

    var withBundle = this.model.has("bundle");
    var withBundleChanged = modelChanged && this.model.hasAnyChanged("bundle");
    var bundleChanged = modelChanged && this.model.hasChanged("bundle");
    /* media */

    var withMedia = this.model.has("media");
    var withMediaChanged = modelChanged && this.model.hasAnyChanged("media"); //var mediaChanged = modelChanged && this.model.hasChanged("media");

    /* article */
    // var withArticle = this.model.has("article");

    var withArticleChanged = modelChanged && this.model.hasAnyChanged("article"); //var articleChanged = modelChanged && this.model.hasChanged("article");

    /* collapsed */

    var collapsed = this.model.get("collapsed");
    var collapsedChanged = modelChanged && this.model.hasChanged("collapsed");
    var tf;
    /* this.vpanGroup */

    tf = this.transforms.get(this.vpanGroup);

    if (tf && tf.hasOffset) {
      tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
      tf.clearOffset();
    }
    /* this.bundleList.el */
    // tf = this.transforms.get(this.bundleList.el);
    // if (tf.hasOffset) {
    // 	tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
    // 	tf.clearOffset();
    // }

    /* this.keywordList.el */
    // tf = this.transforms.get(this.keywordList.el);
    // if (tf.hasOffset) {
    // 	tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
    // 	tf.clearOffset();
    // }

    /* this.graph.el */
    // tf = this.transforms.get(this.graph.el);
    // if (tf && tf.hasOffset) {
    // 	tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
    // 	tf.clearOffset();
    // }

    /*
     * NOTE:
     * Vertical:
     *		site-name-wrapper,
     *		article-list-wrapper
     * Horizontal:
     *		site-name,
     *		article-buttons,
     *		keywordList.wrapper,
     *		bundleList.wrapper,
     *		hGroupings
     */


    if (Globals.BREAKPOINTS["medium-wide"].matches) {
      /* HORIZONTAL: keywordList.wrapper */
      tf = this.transforms.get(this.keywordList.wrapper);

      if (collapsedChanged && !withArticleChanged) {
        // if (collapsedChanged) {
        if (withBundleChanged) {
          if (withMediaChanged) tf.runTransition(withBundle ? tx.LAST : tx.FIRST);
        } else {
          if (withMedia) tf.runTransition(collapsed ? tx.LAST : tx.FIRST);
        }
      } else {
        if (!withBundleChanged && withMediaChanged) tf.runTransition(bundleChanged ? tx.BETWEEN : txNow); //tx.NOW);
      }

      if (tf.hasOffset) tf.clearOffset();
      /* HORIZONTAL: the rest */

      if (collapsedChanged ^ withArticleChanged) {
        this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.sitename.el, this.about.el, this.bundleList.wrapper); // if (fromRoute != 'article-item' && toRoute != 'media-item') {

        this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.hGroupings); // }
      }
      /* VERTICAL */


      if (routeChanged && (fromRoute == 'root' || toRoute == 'root')) {
        this.transforms.runTransition(tx.BETWEEN, this.sitename.wrapper, this.about.wrapper);
      }
      /* this.hGroupings */
      // if (collapsedChanged ^ withArticleChanged) {
      // 	// if (collapsedChanged && !withArticleChanged) {
      // 	this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.hGroupings);
      // }
      // if (collapsedChanged) {
      // 	if (!withArticleChanged) {
      // 		// if (fromRoute == 'root' || toRoute == 'root') {
      // 		this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.bundleList.wrapper);
      // 	}
      // } else {
      // 	if (withArticleChanged && withBundleChanged) {
      // 		this.transforms.runTransition(withArticle ? tx.BETWEEN : tx.LAST, this.bundleList.wrapper);
      // 	}
      // }

    } else if (Globals.BREAKPOINTS["small-stretch"].matches) {
      // if (collapsedChanged ) {
      if (collapsedChanged ^ withArticleChanged) {
        this.transforms.runTransition(collapsed ? tx.FIRST : tx.LAST, this.sitename.el, this.about.el);
      }
    } else {
      if (withBundleChanged) {
        this.transforms.runTransition(tx.BETWEEN, this.sitename.el, this.about.el);
      }
    } // this.transforms.clearOffset(
    // 	// this.bundleList.el,
    // 	// this.keywordList.el,
    // 	this.bundleList.wrapper);

  },

  /* --------------------------- *
  /* own model changed
  /* --------------------------- */
  _onModelChange: function _onModelChange() {
    // 	this.setImmediate(this.commitModel);
    // },
    //
    // commitModel: function() {
    // this.requestRender(View.MODEL_INVALID | View.LAYOUT_INVALID);
    this.requestRender(View.MODEL_INVALID); // keywords.deselect();

    if (this.model.hasChanged("collapsed")) {
      if (this.model.get("collapsed")) {
        // clear keyword selection
        keywords.deselect();
      } // else {}


      this.keywordList.collapsed = this.model.get("collapsed");
      this.bundleList.collapsed = this.model.get("collapsed");
    }

    if (this.model.hasChanged("bundle")) {
      this.bundleList.selectedItem = this.model.get("bundle");
      this.keywordList.refreshFilter(); // if (!this.model.get("collapsed") && this.graph) {
      // 	this.listenToOnce(this.keywordList, "view:render:after", function(view, flags) {
      // 		console.log("%s::_onBundleSelect -> %s:[view:render:after] flags:%s", this.cid, view.cid, View.flagsToString(flags));
      // 		this.graph.valueTo( "a2b", 0,  0);
      // 		// this.graph.renderNow();
      // 		this.graph.valueTo( "a2b", 1,  Globals.TRANSITION_DURATION);
      // 	});
      // }
      // keywords.deselect();
      // this.graph && this.graph.requestRender(View.SIZE_INVALID);
    } // var clickEv = "click";//View.CLICK_EVENT


    if (this.model.hasChanged("withBundle")) {
      // this.keywordList.refreshFilter()
      if (this.model.get("withBundle")) {
        this.el.addEventListener(View.CLICK_EVENT, this._onNavigationClick);
        this.vpan.on("vpanstart", this._onVPanStart);
        this.hpan.on("hpanstart", this._onHPanStart); // this.hpan.on("tap", this._onTap);
      } else {
        this.el.removeEventListener(View.CLICK_EVENT, this._onNavigationClick);
        this.vpan.off("vpanstart", this._onVPanStart);
        this.hpan.off("hpanstart", this._onHPanStart);
        keywords.deselect(); // this.hpan.off("tap", this._onTap);
      } // this.graph.valueTo()

    }
  },
  // _onwithBundleChange: function(withBundle) {
  // 	if (withBundle) {
  // 		this.listenTo(this.model, "collapsed:change", function(collapsed){
  //
  // 		});
  // 	} else {
  // 		this.stopListening(this.model, "collapsed:change", function(collapsed){
  //
  // 		});
  // 	}
  // },

  /* --------------------------- *
  /* keyword collection changed
  /* --------------------------- */
  _onKeywordSelect: function _onKeywordSelect(keyword) {
    // use collection listener to avoid redundant refreshFilter calls
    if (!this.model.get("collapsed") && this.graph) {
      this.listenToOnce(this.bundleList, "view:render:after", function (view, flags) {
        // console.log("%s::_onKeywordSelect -> %s:[view:render:after] flags:%s", this.cid, view.cid, View.flagsToString(flags));
        this.graph.valueTo("b2a", 0, 0);
        this.graph.valueTo("b2a", 1, Globals.TRANSITION_DURATION);
      });
    }

    this.bundleList.refreshFilter();
  },

  /* --------------------------- *
  /* UI Events: bundleList keywordList buttons
  /* --------------------------- */
  _onNavigationClick: function _onNavigationClick(ev) {
    console.log("%s::_onNavigationClick [%s] defaultPrevented:%s", this.cid, ev.type, ev.defaultPrevented);
    if (ev.defaultPrevented) return; // if (ev.target !== this.graph.el && ev.target !== this.el) return;

    ev.preventDefault();

    if (this.model.has("bundle")) {
      // this.transforms.offset(0, 1, this.graph.el);
      // this.transforms.validate();
      // this._setCollapsed(!this.model.get("collapsed"));
      // this.setImmediate(function() {
      this.model.set("collapsed", !this.model.get("collapsed")); // });
    }
  },
  _setCollapsed: function _setCollapsed(value) {
    if (value !== this.model.get("collapsed")) {
      // this.transforms.offset(0, 1, this.graph.el);
      // this.transforms.validate();
      this.setImmediate(function () {
        // console.log("%s::_setCollapsed -> %s (setImmediate)", this.cid, value);
        this.model.set("collapsed", value);
      });
    }
  },

  /* -------------------------------
  /* Horizontal touch/move (HammerJS)
  /* ------------------------------- */
  _onHPanStart: function _onHPanStart(ev) {
    this.transforms.get(this.keywordList.wrapper).stopTransition().clearOffset().validate(); // if (this.model.get("layoutName") != "left-layout"
    // 	&& this.model.get("layoutName") != "default-layout") {
    // 	return;
    // }

    if (Globals.BREAKPOINTS["medium-wide"].matches && this.model.get("bundle").get("media").selectedIndex <= 0 && this.model.get("collapsed")) {
      this.transforms.get(this.keywordList.wrapper).clearCapture();

      this._onHPanMove(ev);

      this.hpan.on("hpanmove", this._onHPanMove);
      this.hpan.on("hpanend hpancancel", this._onHPanFinal);
    }
  },
  _onHPanMove: function _onHPanMove(ev) {
    // var HPAN_DRAG = 1;
    // var HPAN_DRAG = 0.75;
    var HPAN_DRAG = 720 / 920;
    var delta = ev.deltaX; //ev.thresholdDeltaX;
    // var mediaItems = this.model.get("bundle").get("media");

    if (this.model.has("media")) {
      delta *= ev.offsetDirection & Hammer.DIRECTION_LEFT ? 0.0 : HPAN_DRAG;
    } else {
      delta *= ev.offsetDirection & Hammer.DIRECTION_LEFT ? HPAN_DRAG : Globals.HPAN_OUT_DRAG;
    }

    this.transforms.offset(delta, null, this.keywordList.wrapper);
    this.transforms.validate();
  },
  _onHPanFinal: function _onHPanFinal(ev) {
    this.hpan.off("hpanmove", this._onHPanMove);
    this.hpan.off("hpanend hpancancel", this._onHPanFinal);
    /* NOTE: if there is no model change, set tx here. Otherwise just wait for render */

    var kTf = this.transforms.get(this.keywordList.wrapper);

    if (!(this._renderFlags & View.MODEL_INVALID) && kTf.hasOffset) {
      if (kTf.offsetX != 0) {
        kTf.runTransition(tx.NOW);
      }

      kTf.clearOffset().validate();
    }
  },

  /* -------------------------------
  /* Vertical touch/move (_onVPan*)
  /* ------------------------------- */
  _collapsedOffsetY: Globals.COLLAPSE_OFFSET,
  _onVPanStart: function _onVPanStart(ev) {
    this.vpan.on("vpanmove", this._onVPanMove);
    this.vpan.on("vpanend vpancancel", this._onVPanFinal);
    this.transforms.stopTransition(this.vpanGroup);
    this.transforms.clearCapture(this.vpanGroup); // this.transforms.stopTransition(this.bundleList.el, this.keywordList.el); //, this.graph.el);
    // // this.transforms.clearOffset(this.bundleList.el, this.keywordList.el);
    // // this.transforms.validate();
    // this.transforms.clearCapture(this.bundleList.el, this.keywordList.el); //, this.graph.el);
    //
    // if (!this.model.get("collapsed")) {
    // 	this.transforms.stopTransition(this.graph.el);
    // 	this.transforms.clearCapture(this.graph.el);
    // }
    // // this.el.classList.add("container-changing");
    // this._onVPanMove(ev);
  },
  _onVPanMove: function _onVPanMove(ev) {
    var delta = this._computeVPanDelta(ev.deltaY); //ev.thresholdDeltaY);


    this.transforms.offset(0, delta, this.vpanGroup); // this.transforms.offset(0, delta,
    // 	this.bundleList.el, this.keywordList.el);
    // if (!this.model.get("collapsed")) {
    // 	this.transforms.offset(0, delta, this.graph.el);
    // }

    this.transforms.validate();
  },
  _onVPanFinal: function _onVPanFinal(ev) {
    this.vpan.off("vpanmove", this._onVPanMove);
    this.vpan.off("vpanend vpancancel", this._onVPanFinal); // this._onVPanMove(ev);
    // this.transforms.validate();

    this.setImmediate(function () {
      // this.transforms.clearOffset(this.bundleList.el, this.keywordList.el, this.graph.el);
      if (this.willCollapsedChange(ev)) {
        // this._setCollapsed(!this.model.get("collapsed"));
        this.model.set("collapsed", !this.model.get("collapsed"));
      }

      this.requestRender(View.LAYOUT_INVALID); //.renderNow();
    });
  },
  willCollapsedChange: function willCollapsedChange(ev) {
    return ev.type == "vpanend" ? this.model.get("collapsed") ? ev.deltaY > Globals.COLLAPSE_THRESHOLD : ev.deltaY < -Globals.COLLAPSE_THRESHOLD : false;
  },
  _computeVPanDelta: function _computeVPanDelta(delta) {
    var collapsed = this.model.get("collapsed");
    var maxDelta = this._collapsedOffsetY; // + Math.abs(ev.thresholdOffsetY);
    // check if direction is aligned with collapsed/expand

    var isValidDir = collapsed ? delta > 0 : delta < 0;
    var moveFactor = collapsed ? 1 - Globals.VPAN_DRAG : Globals.VPAN_DRAG;
    delta = Math.abs(delta); // remove sign

    delta *= moveFactor;
    maxDelta *= moveFactor;

    if (isValidDir) {
      if (delta > maxDelta) {
        // overshooting
        delta = (delta - maxDelta) * Globals.VPAN_OUT_DRAG + maxDelta;
      } else {// no overshooting
        // delta = delta;
      }
    } else {
      delta = -delta * Globals.VPAN_OUT_DRAG; // delta is opposite
    }

    delta *= collapsed ? 0.5 : -1; // reapply sign

    return delta;
  },

  /* -------------------------------
  /* Create children components
  /* ------------------------------- */
  // -------------------------------
  // #site-name
  // -------------------------------
  createSitenameButton: function createSitenameButton() {
    var view = new View({
      el: "#site-name",
      events: {
        "click a": function clickA(domev) {
          domev.defaultPrevented || domev.preventDefault();
          this.trigger("view:click");
        }
      }
    });
    view.wrapper = view.el.parentElement;
    this.listenTo(view, "view:click", this._onSitenameClick);
    return view;
  },
  _onSitenameClick: function _onSitenameClick() {
    switch (this.model.get("routeName")) {
      case "media-item":
      case "bundle-item":
        // if (this.model.get("collapsed")) {
        // 	this._setCollapsed(false);
        // } else {
        controller.deselectBundle(); // }

        break;

      case "article-item":
        controller.deselectArticle();
        break;
    }
  },
  // -------------------------------
  // .article-button
  // -------------------------------
  createArticleButton: function createArticleButton(articleItem) {
    var view = new ArticleButton({
      el: ".article-button[data-handle='about']",
      model: articleItem
    }).render();
    view.wrapper = view.el.parentElement;
    this.listenTo(view, "view:click", this._onArticleClick);
    return view;
  },
  _onArticleClick: function _onArticleClick(item) {
    switch (this.model.get("routeName")) {
      case "article-item":
        controller.deselectArticle();
        break;

      case "root":
      default:
        controller.selectArticle(item);
        break;
    }
  },
  createAboutButton: function createAboutButton() {
    return this.createArticleButton(articles.findWhere({
      handle: "about"
    }));
  },
  // -------------------------------
  // #bundle-list
  // -------------------------------

  /**
   * @param el {HTMLElement}
   * @return {module:app/base/view/component/FilterableListView}
   */
  createBundleList: function createBundleList(el) {
    var view = new FilterableListView({
      el: "#bundle-list",
      collection: bundles,
      collapsed: false,
      filterFn: function filterFn(bundle, index, arr) {
        return keywords.selected ? bundle.get("kIds").indexOf(keywords.selected.id) !== -1 : false;
      }
    });
    view.wrapper = view.el.parentElement;
    this.listenTo(view, "view:select:one view:select:none", function (bundle) {
      this.setImmediate(function () {
        controller.selectBundle(bundle);
      });
    });
    this.listenTo(view, "view:select:same", this._onBundleListSame);
    return view;
  },
  _onBundleListSame: function _onBundleListSame(bundle) {
    // this.transforms.offset(0, 1, this.graph.el);
    // this.transforms.validate();
    // this.setImmediate(function() {
    this.model.set("collapsed", !this.model.get("collapsed")); // });
  },
  // -------------------------------
  // #keyword-list
  // -------------------------------

  /**
   * @param el {HTMLElement}
   * @return {module:app/base/view/component/GroupingListView}
   */
  createKeywordList: function createKeywordList(el) {
    var view = new GroupingListView({
      el: "#keyword-list",
      collection: keywords,
      collapsed: false,
      filterFn: function filterFn(item, idx, arr) {
        return bundles.selected ? bundles.selected.get("kIds").indexOf(item.id) !== -1 : false;
      },
      groupingFn: function groupingFn(item, idx, arr) {
        return types.get(item.get("tId"));
      }
    });
    view.wrapper = view.el.parentElement;
    view.listenTo(keywords, "select:one select:none", function (item) {
      view.selectedItem = item;
    });
    this.listenTo(view, "view:select:one view:select:none", this._onKeywordListChange);
    return view;
  },
  _onKeywordListChange: function _onKeywordListChange(keyword) {
    if (!this.model.get("collapsed")) {
      keywords.select(keyword);
    }
  },
  // -------------------------------
  // #nav-graph
  // -------------------------------

  /**
   * @param listA {module:app/base/view/component/FilterableListView}
   * @param listB {module:app/base/view/component/FilterableListView}
   * @param parentEl {HTMLElement}
   * @return {module:app/base/view/component/GraphView}
   */
  createGraphView: function createGraphView(listA, listB, parentEl) {
    var view = new GraphView({
      id: "nav-graph",
      listA: listA,
      listB: listB,
      model: this.model,
      useOpaque: false
    });
    parentEl || (parentEl = this.el);
    parentEl.insertBefore(view.el, parentEl.firstElementChild);
    return view;
  }
  /* -------------------------------
  /* Horizontal touch/move (MutationObserver)
  /* ------------------------------- */

  /*
  _beginTransformObserve: function() {
  	if (!(Globals.BREAKPOINTS["medium-wide"].matches && this.model.get("bundle").get("media").selectedIndex <= 0 && this.model.get("collapsed"))) {
  		return;
  	}
  	var target = document.querySelector(".carousel > .empty-item");
  	if (target === null) {
  		return;
  	}
  	if (!this._transformObserver) {
  		this._transformObserver = new MutationObserver(this._onTransformMutation);
  	}
  	this._transformObserver.observe(target, { attributes: true, attributeFilter: ["style"] });
  	this.hpan.on("hpanend hpancancel", this._endTransformObserve);
  	this.transforms.get(this.keywordList.wrapper)
  		.stopTransition()
  		.clearOffset()
  		.clearCapture()
  		.validate();
  },
  	_endTransformObserve: function() {
  	this._transformObserver.disconnect();
  	this.hpan.off("hpanend hpancancel", this._endTransformObserve);
  	this.transforms.get(this.keywordList.wrapper)
  		.clearOffset()
  		.runTransition(tx.NOW)
  		.validate();
  },
  	_onTransformMutation: function(mutations) {
  	var tView, tMetrics, tCss, dTxObj, pos;
  		// this.keywordList.wrapper.style[prefixedProperty("transform")];
  	// transform = mutations[0].target.style.getPropertyValue(prefixedProperty("transform"));
  		tView = View.findByElement(mutations[0].target);
  	if (tView) {
  		tMetrics = tView.metrics;
  		dTxObj = this.transforms.get(this.keywordList.wrapper);
  		console.log("%s::_onTransformMutation [withMedia: %s] target: (%f\+%f) %f wrapper: (%f) %f", this.cid,
  			this.model.has("media"),
  			tMetrics.translateX, tMetrics.width, tMetrics.translateX + tMetrics.width,
  			dTxObj.capturedX, tMetrics.translateX - dTxObj.capturedX,
  			tMetrics
  		);
  			this.transforms.offset(tMetrics.translateX - dTxObj.capturedX, void 0, this.keywordList.wrapper);
  		this.transforms.validate();
  	}
  },
  */

});

}).call(this,require("underscore"))

},{"app/control/Controller":54,"app/control/Globals":55,"app/model/collection/ArticleCollection":63,"app/model/collection/BundleCollection":64,"app/model/collection/KeywordCollection":65,"app/model/collection/TypeCollection":66,"app/view/base/View":82,"app/view/component/ArticleButton":85,"app/view/component/FilterableListView":91,"app/view/component/GraphView":92,"app/view/component/GroupingListView":93,"hammerjs":15,"underscore":51,"utils/TransformHelper":127}],77:[function(require,module,exports){
"use strict";

var PriorityQueue = function PriorityQueue(offset) {
  this._offset = offset | 0;
  this._items = [];
  this._priorities = [];
  this._numItems = 0;
};

PriorityQueue.prototype = Object.create({
  enqueue: function enqueue(item, priority) {
    var i = this._items.length;
    this._items[i] = item;
    this._priorities[i] = {
      priority: priority | 0,
      index: i
    };
    this._numItems++; // console.log("FrameQueue::RequestQueue::enqueue() [numItems:%i] ID:%i", this._numItems, this._offset + i);

    return this._offset + i;
  },
  contains: function contains(index) {
    index -= this.offset;
    return 0 <= index && index < this._items.length;
  },
  skip: function skip(index) {
    var i, item;
    i = index - this._offset;

    if (0 > i || i >= this._items.length) {
      // 	console.warn("FrameQueue::RequestQueue::skip(id:%i) out of range (%i-%i)", index, this._offset, this._offset + (this._numItems - 1));
      return void 0;
    }

    item = this._items[i];

    if (item !== null) {
      // if (item = this._items[i]) {
      this._items[i] = null;
      this._numItems--;
    }

    return item;
  },
  indexes: function indexes() {
    var items = this._priorities.concat();

    items.sort(function (a, b) {
      if (a.priority > b.priority) return 1;
      if (a.priority < b.priority) return -1;
      return 0;
    });
    items.forEach(function (o, i, a) {
      a[i] = o.index;
    }, this);
    return items;
  },
  items: function items() {
    var items = this._priorities.concat();

    items.sort(function (a, b) {
      if (a.priority > b.priority) return 1;
      if (a.priority < b.priority) return -1;
      return 0;
    });
    items.forEach(function (o, i, a) {
      a[i] = this._items[o.index];
    }, this);
    return items;
  },
  _empty: function _empty(offset) {
    this._offset = offset;
    this._items.length = 0;
    this._priorities.length = 0;
    this._numItems = 0;
  }
}, {
  offset: {
    get: function get() {
      return this._offset;
    }
  },
  length: {
    get: function get() {
      return this._items.length;
    }
  },
  numItems: {
    get: function get() {
      return this._numItems;
    }
  }
});

var CallbackQueue = function CallbackQueue(requestFn, cancelFn) {
  this._nextQueue = new PriorityQueue(0);
  this._currQueue = null; // this._pending = false;

  this._running = false;
  this._runId = -1;
  this._requestFn = requestFn;
  this._cancelFn = cancelFn;
  this._runQueue = this._runQueue.bind(this);
};

CallbackQueue.prototype = Object.create({
  /**
   * @param tstamp {int}
   */
  _runQueue: function _runQueue() {
    if (this._running) throw new Error("wtf!!!");
    this._currQueue = this._nextQueue;
    this._nextQueue = new PriorityQueue(this._currQueue.offset + this._currQueue.length);
    this._runId = -1;
    this._running = true;
    var i, item;

    var indexes = this._currQueue.indexes();

    var items = this._currQueue._items;

    for (i = 0; i < indexes.length; i++) {
      item = items[indexes[i]];

      if (item !== null) {
        item.apply(null, arguments);
      }
    } // var self = this;
    // this._currQueue.indexes().forEach(function(index) {
    // 	var fn = self._currQueue._items[index];
    // 	if (fn !== null) {
    // 		fn.apply(null, arguments);
    // 	}
    // });


    this._running = false;
    this._currQueue = null;

    if (this._nextQueue.numItems > 0) {
      this._runId = this._requestFn.call(null, this._runQueue); // this._runId = this._requestFn(this._runQueue);
    }
  },

  /**
   * @param fn {Function}
   * @param priority {int}
   * @return {int}
   */
  request: function request(fn, priority) {
    // if (!this._running && !this._pending) {
    // 	this._pending = true;
    // 	console.warn("FrameQueue::request setImmediate: pending");
    // 	setImmediate(function() {
    // 		this._pending = false;
    // 		if (this._nextQueue.numItems > 0) {
    // 			this._runId = window.requestAnimationFrame(_runQueue);
    // 			console.warn("FrameQueue::request setImmediate: raf:%i for %i items", this._runId, this._nextQueue.numItems);
    // 		} else {
    // 			console.warn("FrameQueue::request setImmediate: no items");
    // 		}
    // 	});
    // }
    if (!this._running && this._runId === -1) {
      this._runId = this._requestFn.call(null, this._runQueue); // this._runId = this._requestFn(this._runQueue);
    }

    return this._nextQueue.enqueue(fn, priority);
  },

  /**
   * @param id {int}
   * @return {Function?}
   */
  cancel: function cancel(id) {
    var fn;

    if (this._running) {
      fn = this._currQueue.skip(id) || this._nextQueue.skip(id);
    } else {
      fn = this._nextQueue.skip(id);

      if (this._runId !== -1 && this._nextQueue.numItems === 0) {
        this._cancelFn.call(null, this._runId); // this._cancelFn(this._runId);


        this._runId = -1;
      }
    }

    return fn;
  }
}, {
  running: {
    get: function get() {
      return this._running;
    }
  }
});
module.exports = CallbackQueue;

},{}],78:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* global Path2D */

/**
 * @module app/view/component/progress/CanvasView
 */
// /** @type {module:color} */
// var Color = require("color");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/view/base/Interpolator} */


var Interpolator = require("app/view/base/Interpolator");
/** @type {module:utils/css/getBoxEdgeStyles} */


var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

var MIN_CANVAS_RATIO = 1; // /Firefox/.test(window.navigator.userAgent)? 2 : 1;

/**
 * @constructor
 * @type {module:app/view/component/progress/CanvasView}
 */

var CanvasView = View.extend({
  /** @type {string} */
  cidPrefix: "canvasView",

  /** @type {string} */
  tagName: "canvas",

  /** @type {string} */
  className: "canvas-view",
  properties: {
    paused: {
      get: function get() {
        return this._paused;
      },
      set: function set(paused) {
        paused = !!paused;

        if (this._interpolator.paused !== paused) {
          this._interpolator.paused = paused;

          if (!paused) {
            this.requestRender();
          }
        }
      }
    },
    context: {
      get: function get() {
        return this._ctx;
      }
    },
    interpolator: {
      get: function get() {
        return this._interpolator;
      }
    },
    canvasRatio: {
      get: function get() {
        return this._canvasRatio;
      }
    }
  },

  /** @type {Object} */
  defaults: {
    values: {
      value: 0
    },
    maxValues: {
      value: 1
    },
    paused: false,
    useOpaque: false
  },

  /* --------------------------- *
   * children/layout
   * --------------------------- */

  /** @override */
  initialize: function initialize(options) {
    // TODO: cleanup this options mess
    options = _.defaults(options || {}, this.defaults);
    options.values = _.defaults(options.values || {}, this.defaults.values);
    options.maxValues = _.defaults(options.maxValues || {}, this.defaults.maxValues);
    this._interpolator = new Interpolator(options.values, options.maxValues);
    this._interpolator.paused = options.paused;
    this._useOpaque = options.useOpaque;
    this._options = _.pick(options, "color", "backgroundColor"); // opaque background
    // --------------------------------

    var ctxOpts = {}; // if (this._useOpaque) {
    // 	this._opaqueProp = Modernizr.prefixed("opaque", this.el, false);
    // 	if (this._opaqueProp) {
    // 		this.el[this._opaqueProp] = true;
    // 	} else {
    // 		ctxOpts.alpha = true;
    // 	}
    // 	this.el.classList.add("color-bg");
    // }
    // canvas' context init
    // --------------------------------

    this._ctx = this.el.getContext("2d", ctxOpts); // adjust canvas size to pixel ratio
    // upscale the canvas if the two ratios don't match
    // --------------------------------

    var ratio = MIN_CANVAS_RATIO;
    var ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;

    if (window.devicePixelRatio !== ctxRatio) {
      // ratio = Math.max(window.devicePixelRatio / ctxRatio, MIN_CANVAS_RATIO);
      ratio = window.devicePixelRatio / ctxRatio;
      ratio = Math.max(ratio, MIN_CANVAS_RATIO);
    }

    this._canvasRatio = ratio; // console.log("%s::init canvasRatio: %f", this.cid, this._canvasRatio);

    this.listenTo(this, "view:attached", function () {
      // this.invalidateSize();
      // this.renderNow();
      this.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
    });
  },
  // _computeCanvasRatio: function() {
  // 	var ratio = MIN_CANVAS_RATIO;
  // 	var ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;
  // 	if (window.devicePixelRatio !== ctxRatio) {
  // 		// ratio = Math.max(window.devicePixelRatio / ctxRatio, MIN_CANVAS_RATIO);
  // 		ratio = window.devicePixelRatio / ctxRatio;
  // 		ratio = Math.max(ratio, MIN_CANVAS_RATIO);
  // 	}
  // 	this._canvasRatio = ratio;
  // },
  _updateCanvas: function _updateCanvas() {
    // adjust canvas size to pixel ratio
    // upscale the canvas if the two ratios don't match
    // --------------------------------
    var s = getComputedStyle(this.el); // this._canvasWidth = this.el.offsetWidth;
    // this._canvasHeight = this.el.offsetHeight;

    this._canvasWidth = this.el.scrollWidth;
    this._canvasHeight = this.el.scrollHeight;

    if (s.boxSizing === "border-box") {
      var m = getBoxEdgeStyles(s);
      this._canvasWidth -= m.paddingLeft + m.paddingRight + m.borderLeftWidth + m.borderRightWidth;
      this._canvasHeight -= m.paddingTop + m.paddingBottom + m.borderTopWidth + m.borderBottomWidth;
    }

    this._canvasWidth *= this._canvasRatio;
    this._canvasHeight *= this._canvasRatio;
    this.measureCanvas(this._canvasWidth, this._canvasHeight, s);
    this.el.width = this._canvasWidth;
    this.el.height = this._canvasHeight; // this.el.style.height = h + "px";
    // this.el.style.width = w + "px";
    // colors
    // --------------------------------

    this._color = this._options.color || s.color || Globals.DEFAULT_COLORS["color"];
    this._backgroundColor = this._options.backgroundColor || s.backgroundColor || Globals.DEFAULT_COLORS["background-color"]; // mozOpaque
    // --------------------------------

    if (this._useOpaque && this._opaqueProp) {
      // this.el.style.backgroundColor = this._backgroundColor;
      this.el[this._opaqueProp] = true;
    } // fontSize
    // --------------------------------


    this._fontSize = parseFloat(s.fontSize) * this._canvasRatio;
    this._fontFamily = s.fontFamily; // prepare canvas context
    // --------------------------------

    this._ctx.restore();

    this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px/1", s.fontFamily].join(" ");
    this._ctx.textAlign = "left";
    this._ctx.lineCap = "butt";
    this._ctx.lineJoin = "miter";
    this._ctx.strokeStyle = this._color;
    this._ctx.fillStyle = this._color;
    this.updateCanvas(this._ctx, s);

    this._ctx.save(); // console.group(this.cid+"::_updateCanvas");
    // console.log("ratio:    %f (min: %f, device: %f, context: %s)", this._canvasRatio, MIN_CANVAS_RATIO, window.devicePixelRatio, this._ctx.webkitBackingStorePixelRatio || "(webkit-only)");
    // console.log("colors:   fg: %s bg: %s", this._color, this._backgroundColor);
    // console.log("style:    %s, %s, padding: %s (%s)", s.width, s.height, s.padding, s.boxSizing);
    // console.log("box:      %f x %f px", m.width, m.height);
    // console.log("measured: %f x %f px", w, h);
    // console.log("canvas:   %f x %f px", this._canvasWidth, this._canvasHeight);
    // console.groupEnd();

  },
  measureCanvas: function measureCanvas(w, h, s) {
    /* abstract */
  },
  updateCanvas: function updateCanvas(ctx, s) {
    /* abstract */
  },
  _getFontMetrics: function _getFontMetrics(str) {
    var key,
        idx,
        mObj,
        mIdx = str.length;

    for (key in Globals.FONT_METRICS) {
      idx = str.indexOf(key);

      if (idx !== -1 && idx < mIdx) {
        mIdx = idx;
        mObj = Globals.FONT_METRICS[key];
      }
    }

    return mObj || {
      "unitsPerEm": 1024,
      "ascent": 939,
      "descent": -256
    };
  },
  _clearCanvas: function _clearCanvas() {
    if (arguments.length == 4) {
      this._clearCanvasRect.apply(this, arguments);
    } else {
      this._ctx.save();

      this._ctx.setTransform(1, 0, 0, 1, 0, 0);

      this._clearCanvasRect(0, 0, this.el.width, this.el.height);

      this._ctx.restore();
    }
  },
  _clearCanvasRect: function _clearCanvasRect(x, y, w, h) {
    this._ctx.clearRect(x, y, w, h);

    if (this._useOpaque) {
      this._ctx.save();

      this._ctx.fillStyle = this._backgroundColor;

      this._ctx.fillRect(x, y, w, h);

      this._ctx.restore();
    }
  },
  _setStyle: function _setStyle(s) {
    CanvasView.setStyle(this._ctx, s);
  },

  /* --------------------------- *
   * render
   * --------------------------- */

  /** @override */
  render: function render() {
    if (this.attached) {
      return this.renderNow();
    }

    return this;
  },

  /** @override */
  renderFrame: function renderFrame(tstamp, flags) {
    if (!this.attached) {
      return flags;
    }

    if (flags & View.SIZE_INVALID) {
      this._updateCanvas();
    }

    if (this._interpolator.valuesChanged) {
      flags |= View.LAYOUT_INVALID;

      this._interpolator.interpolate(tstamp);
    }

    if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
      this.redraw(this._ctx, this._interpolator, flags);

      if (this._interpolator.valuesChanged) {
        this.requestRender();
      }
    }
  },
  // setEnabled: function(enabled) {
  // 	View.prototype.setEnabled.apply(this, arguments);
  // 	if (this.attached) {
  // 		console.info("[%s] %s::setEnabled", this.parentView.cid, this.cid, this.enabled);
  // 		// if (this._enabled && this._interpolator.valuesChanged) {
  // 		// this.requestRender();
  // 		// this.requestRender(CanvasView.LAYOUT_INVALID);
  // 		// }
  // 	}
  // },

  /* --------------------------- *
  /* public
  /* --------------------------- */
  getTargetValue: function getTargetValue(key) {
    return this._interpolator.getTargetValue(key);
  },
  getRenderedValue: function getRenderedValue(key) {
    return this._interpolator.getRenderedValue(key);
  },
  valueTo: function valueTo(key, value, duration) {
    this._interpolator.valueTo(key, value, duration);

    this.requestRender(View.MODEL_INVALID | View.LAYOUT_INVALID);
  },
  // updateValue: function(key) {
  // 	return this._interpolator.updateValue(key || this.defaultKey);
  // },

  /* --------------------------- *
  /* redraw
  /* --------------------------- */
  redraw: function redraw(ctx, interp, flags) {}
}, {
  setStyle: function setStyle(ctx, s) {
    if (_typeof(s) != "object") return;

    for (var p in s) {
      switch (_typeof(ctx[p])) {
        case "undefined":
          break;

        case "function":
          if (Array.isArray(s[p])) ctx[p].apply(ctx, s[p]);else ctx[p].call(ctx, s[p]);
          break;

        default:
          ctx[p] = s[p];
      }
    }
  }
});

if (DEBUG) {
  CanvasView.prototype._logFlags = "";
}

module.exports = CanvasView;

}).call(this,true,require("underscore"))

},{"app/control/Globals":55,"app/view/base/Interpolator":79,"app/view/base/View":82,"underscore":51,"utils/css/getBoxEdgeStyles":139}],79:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/base/Interpolator
 */

/** @type {module:utils/ease/fn/linear} */
var linear = require("utils/ease/fn/linear");
/**
 * @constructor
 * @type {module:app/view/base/Interpolator}
 */


var Interpolator = function Interpolator(values, maxValues, easeValues) {
  this._tstamp = 0; // gets thrown away by first interpolate() but avoid null access errors

  this._renderableKeys = [];
  this._renderedKeys = [];
  this._paused = false;
  this._pausedChanging = false; //this._pausedKeys = [];

  this._maxValues = _.isObject(maxValues) ? _.extend({}, maxValues) : {};
  this._easeFn = _.isObject(easeValues) ? _.extend({}, easeValues) : {};
  this._valueData = {}; // var key, val, maxVal, easeFn;

  for (var key in values) {
    _.isNumber(this._maxValues[key]) || (this._maxValues[key] = null);
    _.isFunction(this._easeFn[key]) || (this._easeFn[key] = linear); // create value object and store it

    this._valueData[key] = this._initValue(values[key], 0, this._maxValues[key]); // add to next render list

    this._renderableKeys.push(key);
  }
};

Interpolator.prototype = Object.create({
  /* --------------------------- *
  /* public interface
  /* --------------------------- */
  isAtTarget: function isAtTarget(key) {
    return this._renderableKeys.indexOf(key) === -1;
  },
  getCurrentValue: function getCurrentValue(key) {
    return this._valueData[key]._renderedValue || this._valueData[key]._value;
  },
  getTargetValue: function getTargetValue(key) {
    return this._valueData[key]._value;
  },
  getStartValue: function getStartValue(key) {
    return this._valueData[key]._startValue;
  },
  getRenderedValue: function getRenderedValue(key) {
    return this._valueData[key]._renderedValue;
  },
  getOption: function getOption(key, opt) {
    if (opt === "max") return this._maxValues[key];
    if (opt === "ease") return this._easeFn[key];
  },
  valueTo: function valueTo(key, value, duration, ease) {
    var changed,
        dataObj = this._valueData[key];

    if (_.isFunction(ease)) {
      this._easeFn[key] = ease;
    } // console.log("%s::valueTo [%s]", "[interpolator]", key, value);


    if (Array.isArray(dataObj)) {
      changed = value.reduce(function (prevChanged, itemValue, i) {
        if (dataObj[i]) {
          dataObj[i] = this._initNumber(itemValue, duration, this._maxValues[key]);
          return true;
        }

        return this._setValue(dataObj[i], itemValue, duration) || prevChanged;
      }.bind(this), changed);
    } else {
      changed = this._setValue(dataObj, value, duration);
    }

    if (changed) {
      this._renderableKeys.indexOf(key) !== -1 || this._renderableKeys.push(key);
    }

    return this;
  },
  updateValue: function updateValue(key) {
    // Call _interpolateKey only if needed. _interpolateKey() returns false
    // once interpolation is done, in which case remove key from _renderableKeys.
    var kIndex = this._renderableKeys.indexOf(key);

    if (kIndex !== -1 && !this._interpolateKey(key)) {
      this._renderableKeys.splice(kIndex, 1);
    }

    return this;
  },

  /* --------------------------- *
  /* private: valueData
  /* --------------------------- */
  _initValue: function _initValue(value, duration, maxVal) {
    if (Array.isArray(value)) {
      return value.map(function (val) {
        return this._initNumber(val, duration, maxVal);
      }, this);
    }

    return this._initNumber(value, duration, maxVal);
  },
  _initNumber: function _initNumber(value, duration, maxVal) {
    var o = {};
    o._value = value;
    o._startValue = value;
    o._valueDelta = 0;
    o._duration = duration || 0;
    o._startTime = NaN;
    o._elapsedTime = NaN;
    o._lastRenderedValue = null;
    o._renderedValue = o._startValue;
    o._maxVal = maxVal; // if (maxVal !== void 0) o._maxVal = maxVal;
    // o._maxVal = this._maxValues[key];
    // o._maxVal = this._maxVal;// FIXME

    return o;
  },
  _setValue: function _setValue(o, value, duration) {
    if (o._value !== value) {
      o._startValue = o._value;
      o._valueDelta = value - o._value;
      o._value = value;
      o._duration = duration || 0;
      o._startTime = NaN;
      o._elapsedTime = NaN; // o._lastRenderedValue = o._renderedValue;
      // o._renderedValue = o._startValue;

      return true;
    }

    return false;
  },

  /* --------------------------- *
  /* private: interpolate
  /* --------------------------- */
  _tstamp: 0,

  /** @override */
  interpolate: function interpolate(tstamp) {
    this._tstamp = tstamp;

    if (this.valuesChanged) {
      if (this._pausedChanging) {
        this._renderableKeys.forEach(function (key) {
          var o = this._valueData[key];

          if (!isNaN(o._elapsedTime)) {
            o._startTime = tstamp - o._elapsedTime;
          }
        }, this);

        this._pausedChanging = false;
      }

      var changedKeys = this._renderableKeys;
      this._renderableKeys = changedKeys.filter(function (key) {
        return this._interpolateValue(tstamp, this._valueData[key], this._easeFn[key]);
      }, this);
      this._renderedKeys = changedKeys;
    }

    return this;
  },
  _interpolateKey: function _interpolateKey(key) {
    return this._interpolateValue(this._tstamp, this._valueData[key], this._easeFn[key]);
  },
  _interpolateValue: function _interpolateValue(tstamp, o, fn) {
    if (Array.isArray(o)) {
      return o.reduce(function (changed, item, index, arr) {
        return this._interpolateNumber(tstamp, item, fn) || changed;
      }.bind(this), false);
    }

    return this._interpolateNumber(tstamp, o, fn);
  },
  _interpolateNumber: function _interpolateNumber(tstamp, o, fn) {
    if (isNaN(o._startTime)) {
      o._startTime = tstamp;
    }

    o._lastRenderedValue = o._renderedValue;
    var elapsed = Math.max(0, tstamp - o._startTime);

    if (elapsed < o._duration) {
      if (o._maxVal && o._valueDelta < 0) {
        // upper-bound values
        o._renderedValue = fn(elapsed, o._startValue, o._valueDelta + o._maxVal, o._duration) - o._maxVal;
      } else {
        // unbound values
        o._renderedValue = fn(elapsed, o._startValue, o._valueDelta, o._duration);
      }

      o._elapsedTime = elapsed;
      return true;
    }

    o._renderedValue = o._value;
    o._elapsedTime = NaN;
    o._startTime = NaN;
    return false;
  }
}, {
  /**
   * @type {boolean}
   */
  paused: {
    get: function get() {
      return this._paused;
    },
    set: function set(value) {
      value = !!value; // Convert to boolean

      if (this._paused !== value) {
        this._paused = value;
        this._pausedChanging = true;
      }
    }
  },

  /**
   * @type {boolean} Has any value been changed by valueTo() since last interpolate()
   */
  valuesChanged: {
    get: function get() {
      return !this._paused && this._renderableKeys.length > 0;
    }
  },

  /**
   * @type {array} Keys that are not yet at target value
   */
  renderableKeys: {
    get: function get() {
      return this._renderableKeys;
    }
  },

  /**
   * @type {array} Keys that have been rendered in the last interpolate()
   */
  renderedKeys: {
    get: function get() {
      return this._renderedKeys;
    }
  },

  /**
   * @type {array} All keys
   */
  keys: {
    get: function get() {
      return Object.keys(this._valueData);
    }
  }
});
module.exports = Interpolator;

}).call(this,require("underscore"))

},{"underscore":51,"utils/ease/fn/linear":142}],80:[function(require,module,exports){
(function (DEBUG){
"use strict";

/** @type {module:utils/prefixedEvent} */
var prefixedEvent = require("utils/prefixedEvent");

var eventMap = {
  "transitionend": prefixedEvent("transitionend"),
  "fullscreenchange": prefixedEvent("fullscreenchange", document),
  "fullscreenerror": prefixedEvent("fullscreenerror", document),
  "visibilitychange": prefixedEvent("visibilitychange", document, "hidden")
};
var eventNum = 0;

for (var eventName in eventMap) {
  if (eventName === eventMap[eventName]) {
    delete eventMap[eventName];
  } else {
    Object.defineProperty(eventMap, eventName, {
      value: eventMap[eventName],
      enumerable: true
    });
    Object.defineProperty(eventMap, eventNum, {
      value: eventName,
      enumerable: false
    });
    eventNum++;
  }
}

Object.defineProperty(eventMap, "length", {
  value: eventNum
});

if (DEBUG) {
  console.log("prefixes enabled for %i events", eventMap.length, Object.keys(eventMap));
}

module.exports = eventMap; // module.exports = eventNum > 0? eventMap : null;

}).call(this,true)

},{"utils/prefixedEvent":145}],81:[function(require,module,exports){
(function (DEBUG){
"use strict";

/**
 * @module app/view/base/TouchManager
 */

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:hammerjs} */


var Hammer = require("hammerjs"); // /** @type {module:hammerjs.Tap} */
// const Tap = Hammer.Tap;

/** @type {module:utils/touch/SmoothPanRecognizer} */


var Pan = require("utils/touch/SmoothPanRecognizer");
/** @type {module:hammerjs.Pan} */
// const Pan = Hammer.Pan;

/* -------------------------------
/* Static private
/* ------------------------------- */

/**
 * @param el HTMLElement
 * @return {Hammer.Manager}
 */


function createInstance(el) {
  var manager = new Hammer.Manager(el); // manager.set({ domevents: true });
  // let tap = new Hammer.Tap({
  // 	threshold: Globals.PAN_THRESHOLD - 1
  // });
  // manager.add(tap);

  var hpan = new Pan({
    event: "hpan",
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: Globals.PAN_THRESHOLD // touchAction: "pan-y",

  });
  manager.add(hpan); // let vpan = new Pan({
  // 	event: "vpan",
  // 	direction: Hammer.DIRECTION_VERTICAL,
  // 	// threshold: Globals.PAN_THRESHOLD,
  // 	// touchAction: "pan-x",
  // });
  // manager.add(vpan);
  // vpan.requireFailure(hpan);

  return manager;
}
/* -------------------------------
 * hammerjs fixup handlers
 * ------------------------------- */

/* eslint-disable no-unused-vars */


var PANEND_THRES_MS = 300; // millisecs

var PANEND_THRES_PX = 25; // pixels

var UP_EVENT = window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup";
var touchHandlers = {};
var captureHandlers = {};
var bubblingHandlers = {};
/*https://gist.githubusercontent.com/jtangelder/361052976f044200ea17/raw/f54c2cef78d59da3f38286fad683471e1c976072/PreventGhostClick.js*/

var lastTimeStamp = NaN;
var panSessionOpened = false;

var saveTimeStamp = function saveTimeStamp(hev) {
  panSessionOpened = !hev.isFinal;

  if (hev.isFinal) {
    lastTimeStamp = hev.srcEvent.timeStamp;
  }

  if (DEBUG) {
    logPanEvent(hev);
  }
}; // let preventSrcEvent = function(hev) {
// 	//console.log(hev.type, "preventDefault");
// 	hev.srcEvent.preventDefault();
// };
// let preventWhilePanning = function(domev) {
// 	panSessionOpened && domev.preventDefault();
// };
// let preventWhileNotPanning = function(domev) {
// 	!panSessionOpened && domev.preventDefault();
// };


var stopEventAfterPan = function stopEventAfterPan(domev) {
  if (domev.timeStamp - lastTimeStamp < PANEND_THRES_MS) {
    // domev.defaultPrevented ||
    domev.preventDefault();
    domev.stopPropagation();
  }

  if (DEBUG) {
    logEvent(domev, (domev.timeStamp - lastTimeStamp).toFixed(3));
  }

  lastTimeStamp = NaN;
};

touchHandlers["hpanstart hpanend hpancancel"] = saveTimeStamp; // touchHandlers["vpanstart vpanend vpancancel"] = saveTimeStamp;
// touchHandlers["hpanmove hpanend hpancancel"] = preventSrcEvent;
// touchHandlers["vpanmove vpanend vpancancel"] = preventSrcEvent;

captureHandlers["click"] = stopEventAfterPan; // bubblingHandlers["click"] = stopEventAfterPan;
// touchHandlers[[
// 	"vpanstart", "vpanend", "vpancancel", "vpanmove",
// 	"hpanstart", "hpanend", "hpancancel", "hpanmove"
// ].join(" ")] = logHammerEvent;

/* -------------------------------
/* DOM event handlers
/* ------------------------------- */
// captureHandlers[UP_EVENT] = preventWhilePanning;
// captureHandlers["touchmove"] = captureHandlers["mousemove"] = logDOMEvent;

if (DEBUG) {
  var logPanEvent = function logPanEvent(hev) {
    logEvent(hev.srcEvent, "[".concat(hev.type, "]"));
  };

  var logEvent = function logEvent(domev, msg) {
    var msgs = [];
    if (domev.defaultPrevented) msgs.push("prevented");
    if (msg) msgs.push(msg);
    msgs.push("".concat(panSessionOpened ? "panning" : "pan ended", " ").concat((domev.timeStamp - lastTimeStamp).toFixed(3)));
    console.log("TouchManager %s [%s]", domev.timeStamp.toFixed(3), domev.type, msgs.join(", "));
  };
}
/* eslint-enable no-unsused-vars */
// -------------------------------
//
// -------------------------------


function addHandlers() {
  var eventName;
  var el = instance.element;

  for (eventName in touchHandlers) {
    if (touchHandlers.hasOwnProperty(eventName)) instance.on(eventName, touchHandlers[eventName]);
  }

  for (eventName in captureHandlers) {
    if (captureHandlers.hasOwnProperty(eventName)) el.addEventListener(eventName, captureHandlers[eventName], true);
  }

  for (eventName in bubblingHandlers) {
    if (bubblingHandlers.hasOwnProperty(eventName)) el.addEventListener(eventName, bubblingHandlers[eventName], false);
  } // document.addEventListener("touchmove", preventWhileNotPanning, false);

}

function removeHandlers() {
  var eventName;
  var el = instance.element;

  for (eventName in captureHandlers) {
    if (captureHandlers.hasOwnProperty(eventName)) el.removeEventListener(eventName, captureHandlers[eventName], true);
  }

  for (eventName in bubblingHandlers) {
    if (captureHandlers.hasOwnProperty(eventName)) el.removeEventListener(eventName, bubblingHandlers[eventName], true);
  } // document.removeEventListener("touchmove", preventWhileNotPanning, false);

}
/** @type {Hammer.Manager} */


var instance = null;
/* -------------------------------
/* Static public
/* ------------------------------- */

var TouchManager = {
  init: function init(target) {
    if (instance === null) {
      instance = createInstance(target);
      addHandlers();
    } else if (instance.element !== target) {
      console.warn("TouchManager already initialized with another element");
    }

    return instance;
  },
  destroy: function destroy() {
    if (instance !== null) {
      removeHandlers();
      instance.destroy();
      instance = null;
    } else {
      console.warn("no instance to destroy");
    }
  },
  getInstance: function getInstance() {
    if (instance === null) {
      console.error("TouchManager has not been initialized");
    }

    return instance;
  }
};
module.exports = TouchManager;
/*
// alt syntax
function createInstance(el) {
	return new Hammer(el, {
		recognizers: [
			[Tap],
			[Pan, {
				event: 'hpan',
				direction: Hammer.DIRECTION_HORIZONTAL,
				threshold: Globals.THRESHOLD
			}],
			[Pan, {
				event: 'vpan',
				direction: Hammer.DIRECTION_VERTICAL,
				threshold: Globals.THRESHOLD
			}, ['hpan']]
		]
	});
}
*/

}).call(this,true)

},{"app/control/Globals":55,"hammerjs":15,"utils/touch/SmoothPanRecognizer":153}],82:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/* global HTMLElement, MutationObserver */

/**
 * @module app/view/base/View
 */

/** @type {module:setimmediate} */
require("setimmediate");
/** @type {module:backbone} */


var Backbone = require("backbone");
/* -------------------------------
/* MutationObserver
/* ------------------------------- */


var _cidSeed = 1;
var _viewsByCid = {};

function addChildViews(el) {
  var view,
      els = el.querySelectorAll("*[data-cid]");

  for (var i = 0, ii = els.length; i < ii; i++) {
    view = View.findByElement(els.item(i));

    if (view) {
      if (!view.attached) {
        // console.log("View::[attached (parent)] %s", view.cid);
        view._elementAttached(); // } else {
        // 	console.warn("View::[attached (parent)] %s (ignored)", view.cid);

      }
    }
  }
}

function removeChildViews(el) {
  var view,
      els = el.querySelectorAll("*[data-cid]");

  for (var i = 0, ii = els.length; i < ii; i++) {
    view = View.findByElement(els.item(i));

    if (view) {
      if (view.attached) {
        console.log("View::[detached (parent)] %s", view.cid);

        view._elementDetached();
      } else {
        console.warn("View::[detached (parent)] %s (ignored)", view.cid);
      }
    }
  }
}

var observer = new MutationObserver(function (mm) {
  // console.log("View::mutations %s", JSON.stringify(mm, null, " "));
  var i, ii, m;
  var j, jj, e;
  var view;

  for (i = 0, ii = mm.length; i < ii; i++) {
    m = mm[i];

    if (m.type == "childList") {
      for (j = 0, jj = m.addedNodes.length; j < jj; j++) {
        e = m.addedNodes.item(j);
        view = View.findByElement(e);

        if (view) {
          if (!view.attached) {
            // console.log("View::[attached (childList)] %s", view.cid);
            view._elementAttached(); // } else {
            // 	console.warn("View::[attached (childList)] %s (ignored)", view.cid);

          }
        }

        if (e instanceof HTMLElement) addChildViews(e);
      }

      for (j = 0, jj = m.removedNodes.length; j < jj; j++) {
        e = m.removedNodes.item(j); // console.log("View::[detached (childList)] %s", e.cid);

        view = View.findByElement(e);

        if (view) {
          if (view.attached) {
            console.log("View::[detached (childList)] %s", view.cid, view.attached);

            view._elementDetached();
          } else {
            console.warn("View::[detached (childList)] %s (ignored)", view.cid, view.attached);
          }
        }

        if (e instanceof HTMLElement) removeChildViews(e);
      }
    } else if (m.type == "attributes") {
      view = View.findByElement(m.target);

      if (view) {
        if (!view.attached) {
          // console.log("View::[attached (attribute)] %s", view.cid);
          view._elementAttached(); // } else {
          // 	console.warn("View::[attached (attribute)] %s (ignored)", view.cid);

        }
      } // else {
      // 	console.warn("View::[attributes] target has no cid (%s='%s')", m.attributeName, m.target.getAttribute(m.attributeName), m);
      // }

    }
  }
});
observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ["data-cid"]
});
/* -------------------------------
/* static private
/* ------------------------------- */

var _now = window.performance ? window.performance.now.bind(window.performance) : Date.now.bind(Date); // var _now = window.performance?
// 	function() { return window.performance.now(); }:
// 	function() { return Date.now(); };
// /** @type {module:app/view/base/renderQueue} */
// var renderQueue = require("app/view/base/renderQueue");
//

/** @type {module:app/view/base/CallbackQueue} */


var renderQueue = function (CallbackQueue) {
  return new CallbackQueue(function (callback) {
    return window.requestAnimationFrame(callback);
  }, function (id) {
    return window.cancelAnimationFrame(id);
  });
}(require("app/view/base/CallbackQueue"));
/** @type {module:app/view/base/CallbackQueue} */


var modelQueue = function (CallbackQueue) {
  return new CallbackQueue(function (callback) {
    return window.setImmediate(function () {
      callback.call(null, _now());
    });
  }, function (id) {
    return window.clearImmediate(id);
  });
}(require("app/view/base/CallbackQueue"));
/** @type {module:app/view/base/PrefixedEvents} */


var PrefixedEvents = require("app/view/base/PrefixedEvents");

var applyEventPrefixes = function applyEventPrefixes(events) {
  var selector, unprefixed;

  for (selector in events) {
    unprefixed = selector.match(/^\w+/i)[0];

    if (PrefixedEvents.hasOwnProperty(unprefixed)) {
      events[selector.replace(unprefixed, PrefixedEvents[unprefixed])] = events[selector]; // console.log("applyEventPrefixes", unprefixed, prefixedEvents[unprefixed]);

      delete events[selector];
    }
  }

  return events;
};

var getViewDepth = function getViewDepth(view) {
  if (!view) {
    return null;
  }

  if (!view.attached) {
    return NaN;
  }

  if (view.parentView === null) {
    return 0;
  }

  return view.parentView.viewDepth + 1;
};

function logAttachInfo(view, name, level) {
  if (["log", "info", "warn", "error"].indexOf(level) != -1) {
    level = "log";
  }

  console[level].call(console, "%s::%s [parent:%s %s %s depth:%s]", view.cid, name, view.parentView && view.parentView.cid, view.attached ? "attached" : "detached", view._viewPhase, view.viewDepth);
}
/* -------------------------------
/* static public
/* ------------------------------- */


var View = {
  /** @const */
  NONE_INVALID: 0,

  /** @const */
  ALL_INVALID: ~0 >>> 1,

  /** @const */
  CHILDREN_INVALID: 1,

  /** @const */
  MODEL_INVALID: 2,

  /** @const */
  STYLES_INVALID: 4,

  /** @const */
  SIZE_INVALID: 8,

  /** @const */
  LAYOUT_INVALID: 16,

  /** @const */
  CLICK_EVENT: "click",
  //window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",

  /** @type {module:app/view/base/ViewError} */
  ViewError: require("app/view/base/ViewError"),

  /** @type {module:utils/prefixedProperty} */
  prefixedProperty: require("utils/prefixedProperty"),

  /** @type {module:utils/prefixedStyleName} */
  prefixedStyleName: require("utils/prefixedStyleName"),

  /** @type {module:utils/prefixedEvent} */
  prefixedEvent: require("utils/prefixedEvent"),

  /** @type {module:app/view/promise/whenViewIsAttached} */
  whenViewIsAttached: require("app/view/promise/whenViewIsAttached"),

  /** @type {module:app/view/promise/whenViewIsRendered} */
  whenViewIsRendered: require("app/view/promise/whenViewIsRendered"),

  /**
  /* @param el {HTMLElement}
  /* @return {module:app/view/base/View}
  /*/
  findByElement: function findByElement(el) {
    if (_viewsByCid[el.cid]) {
      return _viewsByCid[el.cid];
    }

    return null;
  },

  /**
  /* @param el {HTMLElement}
  /* @return {module:app/view/base/View}
  /*/
  findByDescendant: function findByDescendant(el) {
    do {
      if (_viewsByCid[el.cid]) {
        return _viewsByCid[el.cid];
      }
    } while (el = el.parentElement || el.parentNode);

    return null;
  },

  /** @override */
  extend: function extend(proto, obj) {
    if (PrefixedEvents.length && proto.events) {
      if (_.isFunction(proto.events)) {
        proto.events = _.wrap(proto.events, function (fn) {
          return applyEventPrefixes(fn.apply(this));
        });
      } else if (_.isObject(proto.events)) {
        proto.events = applyEventPrefixes(proto.events);
      }
    }

    if (proto.properties && this.prototype.properties) {
      _.defaults(proto.properties, this.prototype.properties);
    }

    return Backbone.View.extend.apply(this, arguments);
  },
  _flagsToStrings: ["-"],
  flagsToString: function flagsToString(flags) {
    var s = View._flagsToStrings[flags | 0];

    if (!s) {
      s = [];
      if (flags & View.CHILDREN_INVALID) s.push("children");
      if (flags & View.MODEL_INVALID) s.push("model");
      if (flags & View.STYLES_INVALID) s.push("styles");
      if (flags & View.SIZE_INVALID) s.push("size");
      if (flags & View.LAYOUT_INVALID) s.push("layout");
      View._flagsToStrings[flags] = s = s.join(" ");
    }

    return s; // return (flags | 0).toString(2);
  }
};
Object.defineProperty(View, "instances", {
  value: _viewsByCid,
  enumerable: true
});
/* -------------------------------
/* prototype
/* ------------------------------- */
// module.exports = Backbone.View.extend({

var ViewProto = {
  /** @type {string} */
  cidPrefix: "view",

  /** @type {Boolean} */
  _attached: false,

  /** @type {HTMLElement|null} */
  _parentView: null,

  /** @type {int|null} */
  _viewDepth: null,

  /** @type {string} initializing > initialized > disposing > disposed */
  _viewPhase: "initializing",

  /** @type {int} */
  _renderQueueId: -1,

  /** @type {int} */
  _renderFlags: 0,

  /** @type {Boolean} */
  _enabled: null,

  /** @type {object} */
  properties: {
    cid: {
      get: function get() {
        return this._cid || (this._cid = this.cidPrefix + _cidSeed++);
      }
    },
    attached: {
      get: function get() {
        return this._attached;
      }
    },
    parentView: {
      get: function get() {
        return this._parentView;
      }
    },
    viewDepth: {
      get: function get() {
        return this._getViewDepth();
      }
    },
    invalidated: {
      get: function get() {
        return this._renderQueueId !== -1;
      }
    },
    enabled: {
      get: function get() {
        return this._enabled;
      },
      set: function set(enabled) {
        this.setEnabled(enabled);
      }
    },
    renderFlags: {
      get: function get() {
        return this._renderFlags;
      }
    }
  },
  $: Backbone.$,

  /**
   * @constructor
   * @type {module:app/view/base/View}
   */
  constructor: function constructor(options) {
    this.transform = {};
    this.childViews = {};
    this._applyRender = this._applyRender.bind(this);

    if (this.properties) {
      // Object.defineProperties(this, getPrototypeChainValue(this, "properties", Backbone.View));
      Object.defineProperties(this, this.properties);
    }

    if (options && options.className && this.className) {
      options.className += " " + _.result(this, "className");
    }

    if (options && options.parentView) {
      this._setParentView(options.parentView, true);
    }

    Backbone.View.apply(this, arguments); // console.log("%s::initialize viewPhase:[%s => initialized]", this.cid, this._viewPhase);

    this._viewPhase = "initialized";

    if (this.parentView !== null) {
      this.trigger("view:parentChange", this.parentView, null);
    }

    if (this.attached) {
      this.trigger("view:attached", this);
    }
  },

  /* -------------------------------
  /* remove
  /* ------------------------------- */

  /** @override */
  remove: function remove() {
    if (this._viewPhase == "disposing") {
      logAttachInfo(this, "remove", "warn");
    } else {} // logAttachInfo(this, "remove", "log");
    // before removal


    this._viewPhase = "disposing";

    this._cancelRender(); // call Backbone impl
    // Backbone.View.prototype.remove.apply(this, arguments);
    // NOTE: from Backbone impl


    this.$el.remove(); // from Backbone impl

    this._attached = false;
    this.trigger("view:removed", this); // remove parent/child references

    this._setParentView(null); // NOTE: from Backbone impl. No more events after this


    this.stopListening(); // check for invalidations that may have been triggered by "view:removed"

    if (this.invalidated) {
      console.warn("%s::remove invalidated after remove()", this.cid);

      this._cancelRender();
    } // // check for children still here
    // var ccids = Object.keys(this.childViews);
    // if (ccids.length) {
    // 	console.warn("%s::remove %i children not removed [%s]", this.cid, ccids.length, ccids.join(", "), this.childViews);
    // }
    // // remove childViews
    // for (var cid in this.childViews) {
    // 	this.childViews[cid].remove();
    // }
    // clear reference in view map


    delete _viewsByCid[this.cid]; // delete this.el.cid;
    // update phase

    this._viewPhase = "disposed";
    return this;
  },

  /* -------------------------------
  /* _elementAttached _elementDetached
  /* ------------------------------- */
  _elementAttached: function _elementAttached() {
    // this._addToParentView();
    this._attached = true;
    this._viewDepth = null;
    this.setEnabled(true);

    this._setParentView(View.findByDescendant(this.el.parentElement)); // if (this.parentView) {
    // 	console.log("[attach] [%i] %s > %s::_elementAttached", this.viewDepth, this.parentView.cid, this.cid);
    // } else {
    // 	console.log("[attach] [%i] %s::_elementAttached", this.viewDepth, this.cid);
    // }
    // if (this._viewPhase == "initializing") {
    // 	// this.trigger("view:attached", this);
    // } else


    if (this._viewPhase == "initialized") {
      this.trigger("view:attached", this);
    } else if (this._viewPhase == "replacing") {
      this._viewPhase = "initialized";
      this.trigger("view:replaced", this);
    }
  },
  _elementDetached: function _elementDetached() {
    if (!this.attached || this._viewPhase == "disposing" || this._viewPhase == "disposed") {
      logAttachInfo(this, "_elementDetached", "error"); // } else {
      // 	logAttachInfo(this, "_elementDetached", "log");
    }

    this._attached = false;
    this._viewDepth = null;
    this.setEnabled(false);

    if (this._viewPhase != "disposing" || this._viewPhase == "disposed") {
      this.remove();
    }
  },

  /* -------------------------------
  /* parentView
  /* ------------------------------- */
  _setParentView: function _setParentView(newParent, silent) {
    if (newParent === void 0) {
      console.warn("$s::_setParentView invalid value '%s'", this.cid, newParent);
      newParent = null;
    }

    var oldParent = this._parentView;
    this._parentView = newParent; // force update of _viewDepth

    this._viewDepth = null; //getViewDepth(this);
    // skip the rest if arg is the same

    if (newParent === oldParent) {
      return;
    }

    if (oldParent !== null) {
      if (this.cid in oldParent.childViews) {
        delete oldParent.childViews[this.cid];
      }
    }

    if (newParent !== null) {
      newParent.childViews[this.cid] = this;
    }

    if (!silent) this.trigger("view:parentChange", this, newParent, oldParent);
  },
  whenAttached: function whenAttached() {
    return View.whenViewIsAttached(this);
  },
  _getViewDepth: function _getViewDepth() {
    if (this._viewDepth === null) {
      this._viewDepth = getViewDepth(this);
    }

    return this._viewDepth;
  },

  /* -------------------------------
  /* Backbone.View overrides
  /* ------------------------------- */

  /** @override */
  setElement: function setElement(element, delegate) {
    // setElement always initializes this.el, so check it to be non-null before calling super
    if (this.el) {
      if (this.el !== element && this.el.parentElement) {
        // Element is being replaced
        if (this.attached) {
          // Since old element is attached to document tree, _elementAttached will be
          // triggered by replaceChild: set _viewPhase = "replacing" to flag this
          // change and trigger 'view:replaced' instead of 'view:added'.
          this._viewPhase = "replacing";
        }

        this.el.parentElement.replaceChild(element, this.el);
      }

      Backbone.View.prototype.setElement.apply(this, arguments); // Merge classes specified by this view with the ones already in the element,
      // as backbone will not:

      if (this.className) {
        _.result(this, "className").split(" ").forEach(function (item) {
          this.el.classList.add(item);
        }, this);
      }
    } else {
      Backbone.View.prototype.setElement.apply(this, arguments);
    }

    if (this.el === void 0) {
      throw new Error("Backbone view has no element");
    }

    _viewsByCid[this.cid] = this;
    this.el.cid = this.cid;
    this.el.setAttribute("data-cid", this.cid);

    if (this.model) {
      this.el.setAttribute("data-mcid", this.model.cid);
    }

    return this;
  },

  /* ---------------------------
  /* event helpers
  /* --------------------------- */
  addListeners: function addListeners(target, events, handler, useCapture) {
    if (!_.isObject(useCapture)) useCapture = !!useCapture;

    if (typeof events === "string") {
      events = events.split(" ");
    }

    for (var i = 0; i < events.length; i++) {
      target.addEventListener(events[i], handler, useCapture);
    }

    return this;
  },
  removeListeners: function removeListeners(target, events, handler, useCapture) {
    if (!_.isObject(useCapture)) useCapture = !!useCapture;

    if (typeof events === "string") {
      events = events.split(" ");
    }

    for (var i = 0; i < events.length; i++) {
      target.removeEventListener(events[i], handler, useCapture);
    }

    return this;
  },
  listenToElement: function listenToElement(target, events, handler) {
    target = Backbone.$(target);

    if (typeof events === "string") {
      events = events.split(" ");
    }

    for (var i = 0; i < events.length; i++) {
      this.listenTo(target, events[i], handler);
    }
  },
  stopListeningToElement: function stopListeningToElement(target, events, handler) {
    target = Backbone.$(target);

    if (typeof events === "string") {
      events = events.split(" ");
    }

    for (var i = 0; i < events.length; i++) {
      this.stopListening(target, events[i], handler);
    }
  },
  // listenToElementOnce: function(target, event, handler, useCapture) {
  // 	this.listenToOnce(this.$(target), event, handler);
  // },
  // stopListenToElement: function(target, event, handler, useCapture) {
  // 	this.stopListening(Backbone.$(target), event, handler);
  // },
  listenToElementOnce: function listenToElementOnce(target, event, handler, useCapture) {
    if (!_.isObject(useCapture)) useCapture = !!useCapture;

    var _cleanup, wrapper, ctx;

    ctx = this;

    _cleanup = function cleanup() {
      ctx.off("view:remove", _cleanup);
      target.removeEventListener(event, wrapper, useCapture);
    };

    wrapper = function wrapper(ev) {
      _cleanup();

      handler.call(ctx, ev);
    };

    ctx.on("view:remove", _cleanup);
    target.addEventListener(event, wrapper, useCapture);
    return this;
  },

  /* -------------------------------
  /* requestAnimationFrame
  /* ------------------------------- */
  requestAnimationFrame: function requestAnimationFrame(callback, priority, ctx) {
    return renderQueue.request(callback.bind(ctx || this), priority);
  },
  cancelAnimationFrame: function cancelAnimationFrame(id) {
    return renderQueue.cancel(id);
  },
  setImmediate: function setImmediate(callback, priority, ctx) {
    return modelQueue.request(callback.bind(ctx || this), priority);
  },
  clearImmediate: function clearImmediate(id) {
    return modelQueue.cancel(id); // return window.clearImmediate(id);
  },

  /* -------------------------------
  /* deferred render: private methods
  /* ------------------------------- */
  _traceRenderStatus: function _traceRenderStatus() {
    return [this._renderQueueId != -1 ? "async id:" + this._renderQueueId : "sync", View.flagsToString(this._renderFlags), this.attached ? "attached" : "detached", (this.skipTransitions ? "skip" : "run") + "-tx"].join(", ");
  },

  /** @private */
  _applyRender: function _applyRender(tstamp) {
    if (DEBUG) {
      if (this._logFlags["view.render"]) {
        console.log("%s::_applyRender [%s]", this.cid, this._traceRenderStatus(), this._logFlags["view.trace"] ? this._logRenderCallers.join("\n") : "");
      }

      this._logRenderCallers.length = 0;
    }

    var flags = this._renderFlags;
    this.trigger("view:render:before", this, flags);
    this._renderFlags = 0;
    this._renderQueueId = -1;
    this._renderFlags |= this.renderFrame(tstamp, flags);
    this.trigger("view:render:after", this, flags);

    if (this._renderFlags != 0) {
      console.warn("%s::_applyRender [returned] phase: %s flags: %s (%s)", this.cid, this._viewPhase, View.flagsToString(this._renderFlags), this._renderFlags);
    }
  },
  _cancelRender: function _cancelRender() {
    if (this._renderQueueId != -1) {
      var cancelId, cancelFn;
      cancelId = this._renderQueueId;
      this._renderQueueId = -1;
      cancelFn = renderQueue.cancel(cancelId);

      if (cancelFn === void 0) {
        console.warn("%s::_cancelRender [id:%i] not found", this.cid, cancelId);
      } else if (cancelFn === null) {
        console.warn("%s::_cancelRender [id:%i] already cancelled", this.cid, cancelId); // } else {
        // 	if (this._logFlags["view.render"] && !renderQueue.running)
        // 		console.log("%s::_cancelRender ID:%i cancelled", this.cid, cancelId);
      }
    }
  },
  _requestRender: function _requestRender() {
    if (renderQueue.running) {
      this._cancelRender(); // if (DEBUG) {
      // 	if (this._logFlags["view.render"]) {
      // 		console.info("%s::_requestRender rescheduled [%s (%s)]", this.cid, View.flagsToString(this._renderFlags), this._renderFlags);
      // 	}
      // }

    }

    if (this._renderQueueId == -1) {
      this._renderQueueId = renderQueue.request(this._applyRender, isNaN(this.viewDepth) ? Number.MAX_VALUE : this.viewDepth);
    }

    if (DEBUG) {
      if (this._logFlags["view.trace"]) {
        // if (this._logFlags["view.trace"]) {
        // 	console.groupCollapsed(this.cid + "::_requestRender [" + this._traceRenderStatus() + "] trace");
        // 	console.trace();
        // 	console.groupEnd();
        // } else {
        console.log("%s::_requestRender %s [%s]", this.cid, renderQueue.running ? "rescheduled " : "", this._traceRenderStatus()); // }
      }
    }
  },

  /* -------------------------------
  /* render: public / abstract methods
  /* ------------------------------- */
  invalidate: function invalidate(flags) {
    if (flags !== void 0) {
      /*if (DEBUG) {
      	if (this._logFlags["view.render"]) {
      		if (this._renderFlags > 0) {
      			console.log("%s::invalidate [%s (%s)] + [%s (%s)]", this.cid, View.flagsToString(this._renderFlags), this._renderFlags, View.flagsToString(flags), flags);
      		} else {
      			console.log("%s::invalidate [%s (%s)]", this.cid, View.flagsToString(flags), flags);
      		}
      	}
      }*/
      this._renderFlags |= flags;
    }

    return this;
  },
  requestRender: function requestRender(flags) {
    // if (DEBUG) {
    // 	if (this._logFlags["view.trace"]) {
    // 		var fnPath = [];
    // 		var fn = arguments.callee.caller;
    // 		while (fn) {
    // 			if (fnPath.length > 5) break;
    // 			fnPath.push(fn.name);
    // 			fn = fn.caller;
    // 		}
    // 		// this._logRenderCallers.push(fnPath.join("\n\t->"));
    // 		this._logRenderCallers.push(fnPath.join(" -> "));
    // 	}
    // }
    // if (flags !== void 0) {
    // 	this._renderFlags |= flags;
    // }
    this.invalidate(flags);

    this._requestRender();

    return this;
  },

  /** @abstract */
  renderFrame: function renderFrame(tstamp, flags) {
    // subclasses should override this method
    return View.NONE_INVALID;
  },
  renderNow: function renderNow(alwaysRun) {
    if (this._renderQueueId != -1) {
      this._cancelRender();

      alwaysRun = true;
    } // if (alwaysRun === true) {


    if (alwaysRun) {
      this._applyRender(_now());
    }

    return this;
  },
  whenRendered: function whenRendered() {
    return View.whenViewIsRendered(this);
  },

  /* -------------------------------
  /* render bitwise flags
  /* - check: this._renderFlags & flags
  /* - add: this._renderFlags |= flags
  /* - remove: this._renderFlags &= ~flags
  /* ------------------------------- */

  /* helpers ------------------ */
  requestChildrenRender: function requestChildrenRender(flags, now, force) {
    var ccid, view;

    for (ccid in this.childViews) {
      view = this.childViews[ccid];
      view.skipTransitions = view.skipTransitions || this.skipTransitions;
      view.requestRender(flags);

      if (now) {
        view.renderNow(force);
      }
    }

    return this;
  },
  render: function render() {
    return this.renderNow(true);
  },

  /* -------------------------------
  /* common abstract
  /* ------------------------------- */

  /**
  /* @param {Boolean}
  /*/
  setEnabled: function setEnabled(enable) {
    if (this._enabled == enable) return;
    this._enabled = !!enable;

    if (this._enabled) {
      this.delegateEvents();
    } else {
      this.undelegateEvents();
    }
  }
}; //, View);

if (DEBUG) {
  ViewProto._logFlags = ["view.render"].join(" ");

  ViewProto.constructor = function (fn) {
    return function () {
      var retval;
      this._logRenderCallers = [];
      this._logFlags = this._logFlags.split(" ").reduce(function (r, o) {
        r[o] = true;
        return r;
      }, {});
      retval = fn.apply(this, arguments); // console.log("------ %s %o", this.cid, this._logFlags);

      return retval;
    };
  }(ViewProto.constructor);
}

module.exports = Backbone.View.extend(ViewProto, View);

}).call(this,true,require("underscore"))

},{"app/view/base/CallbackQueue":77,"app/view/base/PrefixedEvents":80,"app/view/base/ViewError":83,"app/view/promise/whenViewIsAttached":103,"app/view/promise/whenViewIsRendered":104,"backbone":5,"setimmediate":38,"underscore":51,"utils/prefixedEvent":145,"utils/prefixedProperty":146,"utils/prefixedStyleName":147}],83:[function(require,module,exports){
"use strict";

function ViewError(view, err) {
  this.view = view;
  this.err = err;
  this.message = err.message;
}

ViewError.prototype = Object.create(Error.prototype);
ViewError.prototype.constructor = ViewError;
ViewError.prototype.name = "ViewError";
module.exports = ViewError;

},{}],84:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression, alias4="function";

  return "<a href=\""
    + alias3((helpers.global || (depth0 && depth0.global) || alias2).call(alias1,"APP_ROOT",{"name":"global","hash":{},"data":data}))
    + "#"
    + alias3(((helper = (helper = helpers.handle || (depth0 != null ? depth0.handle : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"handle","hash":{},"data":data}) : helper)))
    + "\">"
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</a>\n";
},"useData":true});

},{"hbsfy/runtime":35}],85:[function(require,module,exports){
"use strict";

/**
/* @module app/view/component/ArticleView
/*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {Function} */


var viewTemplate = require("./ArticleButton.hbs");
/**
/* @constructor
/* @type {module:app/view/component/ArticleButton}
/*/


var ArticleButton = View.extend({
  /** @type {string} */
  cidPrefix: "articleButton",

  /** @override */
  tagName: "h2",

  /** @override */
  className: "article-button",

  /** @type {Function} */
  template: viewTemplate,
  events: {
    "click a": function clickA(domev) {
      domev.defaultPrevented || domev.preventDefault();
      this.trigger("view:click", this.model);
    }
  },
  // /** @override */
  // initialize: function(options) {},

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    this.el.innerHTML = this.template(this.model.toJSON());
  }
});
module.exports = ArticleButton;

},{"./ArticleButton.hbs":84,"app/view/base/View":82}],86:[function(require,module,exports){
"use strict";

/**
/* @module app/view/component/ArticleView
/*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View"); // /** @type {module:utils/net/toAbsoluteURL} */
// var toAbsoluteURL = require("utils/net/toAbsoluteURL");
//
// /** @type {string} */
// var ABS_APP_ROOT = toAbsoluteURL(require("app/control/Globals").APP_ROOT);

/**
/* @constructor
/* @type {module:app/view/component/ArticleView}
/*/


var ArticleView = View.extend({
  /** @type {string} */
  cidPrefix: "articleView",

  /** @override */
  tagName: "article",

  /** @override */
  className: "article-view mdown",

  /** @override */
  initialize: function initialize(options) {},

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    this.el.innerHTML = this.model.get("text"); // FIXME: now done in xslt
    // this.el.querySelectorAll("a[href]").forEach(function(el) {
    // 	var url = toAbsoluteURL(el.getAttribute("href"));
    // 	if (url.indexOf(ABS_APP_ROOT) !== 0) {
    // 		el.setAttribute("target", "_blank");
    // 	}
    // });
  }
});
module.exports = ArticleView;

},{"app/view/base/View":82}],87:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/component/progress/CanvasProgressMeter
 */

/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");

var PI2 = Math.PI * 2;
/* NOTE: avoid negative rotations */

var BASE_ROTATION = 1 - 0.25; // of PI2 (-90 degrees)

var GAP_ARC = PI2 / 48;
/** @type {module:utils/ease/fn/easeInQuad} */

var easeIn = require("utils/ease/fn/easeInQuad");
/** @type {module:utils/ease/fn/easeOutQuad} */


var easeOut = require("utils/ease/fn/easeOutQuad");

var LOOP_OFFSET = 1.833333;
var STEP_MS = 400; // tween time base

var ARC_DEFAULTS = {
  "amount": {
    lineWidth: 0.75,
    radiusOffset: 0
  },
  "available": {
    lineWidth: 0.75,
    // lineDash: [1.3, 0.7],
    inverse: "not-available"
  },
  "not-available": {
    lineWidth: 0.8,
    lineDash: [0.3, 0.7],
    lineDashOffset: 0
  },
  "indeterminate": {
    lineWidth: 2.0,
    //0.8,
    lineDash: [0.3, 1.7],
    // lineDash: [0.6, 1.4],
    lineDashOffset: 0
  }
};
/**
 * @constructor
 * @type {module:app/view/component/progress/CanvasProgressMeter}
 */

module.exports = CanvasView.extend({
  /** @type {string} */
  cidPrefix: "canvasProgressMeter",

  /** @type {string} */
  className: "progress-meter canvas-progress-meter",
  defaultKey: "amount",
  defaults: {
    values: {
      amount: 0,
      available: 0,
      _loop: 0,
      _stalled_arc: 0,
      _stalled_loop: 0
    },
    maxValues: {
      amount: 1,
      available: 1,
      _stalled_loop: 1
    },
    useOpaque: true,
    labelFn: function labelFn(value, max) {
      return value / max * 100 | 0;
    }
  },
  properties: {
    stalled: {
      get: function get() {
        return false; //this._stalled;
      },
      set: function set(value) {// this._setStalled(value)
      }
    }
  },
  _setStalled: function _setStalled(value) {
    if (this._stalled !== value) {
      this._stalled = value;
      this.requestRender(CanvasView.MODEL_INVALID | CanvasView.LAYOUT_INVALID);
    }
  },

  /* --------------------------- *
  /* children/layout
  /* --------------------------- */

  /** @override */
  initialize: function initialize(options) {
    // TODO: cleanup options mess in CanvasView
    CanvasView.prototype.initialize.apply(this, arguments); // options = _.defaults(options, this.defaults);

    this._labelFn = options.labelFn;
    this._stalled = !!options.stalled;
    this._valueStyles = {};
    this._canvasSize = null;
    this._canvasOrigin = null;
  },
  _needsLoop: false,

  /** @override */
  valueTo: function valueTo(key, value, duration) {
    if (key === "amount" && value < this.interpolator.getCurrentValue("amount")) {
      this._needsLoop = true;
    }

    CanvasView.prototype.valueTo.apply(this, arguments);
  },

  /* --------------------------- *
  /* private
  /* --------------------------- */

  /** @override */
  measureCanvas: function measureCanvas(w, h, s) {
    // make canvas square
    this._canvasHeight = this._canvasWidth = Math.min(w, h);
  },

  /** @override */
  updateCanvas: function updateCanvas() {
    // CanvasView.prototype._updateCanvas.apply(this, arguments);
    // size, lines, gaps, dashes (this._valueStyles, GAP_ARC, this._arcRadius)
    // --------------------------------
    // var arcName, s, arcDefault;
    // var mapLineDash = function(n) {
    // 	return n * this.radius * GAP_ARC;
    // };
    // var sumFn = function(s, n) {
    // 	return s + n;
    // };
    // this._canvasSize = Math.min(this._canvasWidth, this._canvasHeight);
    var s; // this._maxDashArc = 0

    for (var styleName in ARC_DEFAULTS) {
      s = _.defaults({}, ARC_DEFAULTS[styleName]);
      s.lineWidth *= this._canvasRatio;
      s.radius = (this._canvasWidth - s.lineWidth) / 2;

      if (s.radiusOffset) {
        s.radius += s.radiusOffset * this._canvasRatio;
      }

      if (_.isArray(s.lineDash)) {
        s.lineDash = s.lineDash.map(function (val, i, arr) {
          return val * this.radius * GAP_ARC;
        }, s);
        s.lineDashLength = s.lineDash.reduce(function (res, val, i, arr) {
          return res + val;
        }, 0);
        s.lineDashArc = s.lineDash[0] * GAP_ARC; // this._maxDashArc = Math.max(this._maxDashArc, s.lineDashArc);
      } else {
        s.lineDashArc = 0;
      }

      this._valueStyles[styleName] = s;
    } // baselineShift
    // --------------------------------
    // NOTE: Center baseline: use ascent data to center to x-height, or sort-of.
    // with ascent/descent values (0.7, -0.3), x-height is 0.4


    var mObj = this._getFontMetrics(this._fontFamily);

    this._baselineShift = mObj ? (mObj.ascent + mObj.descent) / mObj.unitsPerEm : 0.7; // default value

    this._baselineShift *= this._fontSize * 0.5; // apply to font-size, halve it

    this._baselineShift = Math.round(this._baselineShift); // save canvas context
    // --------------------------------
    // reset matrix and translate 0,0 to center

    this._ctx.restore();

    this._ctx.setTransform(1, 0, 0, 1, this._canvasWidth / 2, this._canvasHeight / 2);

    this._ctx.save();
  },

  /** @override */
  redraw: function redraw(ctx, intrp, flags) {
    this._clearCanvas(-this._canvasWidth / 2, -this._canvasHeight / 2, this._canvasWidth, this._canvasHeight);

    var s, // reused style objects
    valData, // reused for interpolated data
    arcVal; // reused arc values
    // amount label
    // --------------------------------

    valData = intrp._valueData["amount"];
    this.drawLabel(this._labelFn(valData._renderedValue, valData._maxVal)); // indeterminate
    // --------------------------------

    /*
    var indVal;
    if (this.stalled) {
    	// _ind loop indefinitely while indeterminate: restart if at end
    	if (intrp.isAtTarget("_ind")) {
    		// if (intrp.renderedKeys && (intrp.renderedKeys.indexOf("_ind") === -1)) {
    		intrp.valueTo("_ind", 0, 0);
    		intrp.valueTo("_ind", 1, 1000);
    		intrp.updateValue("_ind");
    	}
    	indVal = intrp.getCurrentValue("_ind");
    	//indVal = intrp._valueData["_ind"]._renderedValue || 0;
    		// draw spinning arc
    	// --------------------------------
    	// s = this._valueStyles["amount"];
    	// ctx.save();
    	// ctx.rotate(PI2 * (BASE_ROTATION + (indVal))); // + GAP_ARC);
    	// lastEndArc = this.drawArc(1,
    	// 	GAP_ARC,
    	// 	PI2 - GAP_ARC,
    	// 	0, s);
    	// ctx.restore();
    	// return;
    		// lineDashOffset animation
    	// --------------------------------
    	s = this._valueStyles["indeterminate"];
    	s.lineDashOffset = s.lineDashLength * ((1 - indVal) % 3) * 3;
    	this._valueStyles["available"].inverse = "indeterminate";
    		// console.log("%s::redraw indVal:%o s.lineDashOffset:%o s.lineDash:%o", this.cid, indVal, s.lineDashOffset, s.lineDash[0]);
    		// draw spinning wheel
    	// --------------------------------
    	// ctx.save();
    	// ctx.rotate((PI2 / WHEEL_NUM) * indVal); // + GAP_ARC);
    	// this.drawWheel(this._valueStyles["amount"], 2 / 5, 3 / 5);
    	// ctx.restore();
    	} else {
    	if (!intrp.isAtTarget("_ind")) {
    		// if (intrp.renderedKeys && (intrp.renderedKeys.indexOf("_ind") !== -1)) {
    		intrp.valueTo("_ind", 0, 0);
    		intrp.updateValue("_ind");
    	}
    	// lineDashOffset animation
    	// --------------------------------
    	this._valueStyles["available"].inverse = "not-available";
    }*/
    // save ctx before drawing arcs

    ctx.save(); // loop (amount)
    // --------------------------------

    var loopVal;
    /*
    NOTE: If value "amount" has changed (with valueTo()) but no yet
    interpolated, and its last rendered value is less, then its been reset
    (a reload, a loop, etc): we trigger a 'loop' of the whole arc.
    */
    // if ((intrp.renderedKeys.indexOf("amount") !== -1) && (valData._lastRenderedValue > valData._renderedValue)) {

    if (this._needsLoop) {
      this._needsLoop = false; // trigger loop

      intrp.valueTo("_loop", 1, 0);
      intrp.valueTo("_loop", 0, 750);
      intrp.updateValue("_loop");
    } // loopVal = intrp._valueData["_loop"]._renderedValue || 0;


    loopVal = intrp.getCurrentValue("_loop");
    ctx.rotate(PI2 * (BASE_ROTATION + (1 - loopVal))); // + GAP_ARC);
    // amount arc
    // --------------------------------
    // var amountGapArc = GAP_ARC;

    var lastEndArc = 0;
    s = this._valueStyles["amount"];
    arcVal = loopVal + valData._renderedValue / valData._maxVal;

    if (arcVal > 0) {
      lastEndArc = this.drawArc(arcVal, GAP_ARC, PI2 - GAP_ARC, lastEndArc, s);
      this.drawEndCap(lastEndArc, s);
      lastEndArc = lastEndArc + GAP_ARC * 2;
    } // available arc
    // --------------------------------


    s = this._valueStyles["available"];
    valData = intrp._valueData["available"];
    var stepsNum = valData.length || 1;
    var stepBaseArc = PI2 / stepsNum;
    var stepAdjustArc = stepBaseArc % GAP_ARC;
    var stepGapArc = GAP_ARC + (stepAdjustArc - s.lineDashArc) / 2;

    if (Array.isArray(valData)) {
      for (var i = 0; i < stepsNum; i++) {
        arcVal = valData[i]._renderedValue / (valData[i]._maxVal / stepsNum);
        this.drawArc(arcVal, i * stepBaseArc + stepGapArc, (i + 1) * stepBaseArc - stepGapArc, lastEndArc, s);
      }
    } else {
      arcVal = valData._renderedValue / valData._maxVal;
      this.drawArc(arcVal, stepGapArc, PI2 - stepGapArc, lastEndArc, s);
    } // restore ctx after drawing arcs
    // keep rotation transform
    //ctx.restore();


    if (this._stalled) {
      if (intrp.getTargetValue('_stalled_arc') === 0) {
        intrp.valueTo('_stalled_arc', 1, 1 * STEP_MS, easeIn).updateValue('_stalled_arc');
      }
    } else {
      if (intrp.getTargetValue('_stalled_arc') === 1) {
        intrp.valueTo('_stalled_arc', 0, 1 * STEP_MS, easeOut).updateValue('_stalled_arc');
      }
    }

    var a = intrp.getRenderedValue("_stalled_arc"); // while arc is > 0, loop indefinitely while spinning and restart
    // if at end. Otherwise let interp exhaust arc duration

    if (a > 0) {
      if (!intrp.paused && intrp.isAtTarget('_stalled_loop')) {
        intrp.valueTo('_stalled_loop', 0, 0).valueTo('_stalled_loop', 1, 2 * STEP_MS).updateValue('_stalled_loop');
      }
    }

    var l = intrp.getRenderedValue("_stalled_loop"); // always render while arc is > 0

    if (a > 0) {
      // arc span bounce
      var b = (l < 0.5 ? l % 0.5 : 0.5 - l % 0.5) * 2; // bounce + main arc span

      var aa = a * b * 0.25 + a * 0.125 + .0001; // rotation loop

      var ll = l + LOOP_OFFSET;
      ctx.save();
      ctx.lineWidth = 10 * this._canvasRatio;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeColor = 'red';
      ctx.beginPath();
      ctx.arc(0, 0, this._canvasWidth / 2, (1 - aa + ll) * PI2, (aa + ll) * PI2, false);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  },
  drawArc: function drawArc(value, startArc, endArc, prevArc, style) {
    var valArc, valStartArc, valEndArc, invStyle, invStartArc, invEndArc;
    prevArc || (prevArc = 0);
    valArc = endArc - startArc;
    valEndArc = startArc + valArc * value;
    valStartArc = Math.max(startArc, prevArc);

    if (valEndArc > valStartArc) {
      this._ctx.save();

      this.applyValueStyle(style);

      this._ctx.beginPath();

      this._ctx.arc(0, 0, style.radius, valEndArc, valStartArc, true);

      this._ctx.stroke();

      this._ctx.restore();
    } // if there's valueStyle, draw rest of span, minus prevArc overlap too


    if (style.inverse !== void 0) {
      invStyle = this._valueStyles[style.inverse];
      invEndArc = valEndArc + valArc * (1 - value);
      invStartArc = Math.max(valEndArc, prevArc);

      if (invEndArc > invStartArc) {
        this._ctx.save();

        this.applyValueStyle(invStyle);

        this._ctx.beginPath();

        this._ctx.arc(0, 0, invStyle.radius, invEndArc, invStartArc, true);

        this._ctx.stroke();

        this._ctx.restore();
      }
    }

    return valEndArc;
  },
  applyValueStyle: function applyValueStyle(s) {
    this._ctx.lineWidth = s.lineWidth;

    if (_.isArray(s.lineDash)) {
      this._ctx.setLineDash(s.lineDash);
    }

    if (_.isNumber(s.lineDashOffset)) {
      this._ctx.lineDashOffset = s.lineDashOffset;
    }
  },
  drawNotch: function drawNotch(arcPos, length, s) {
    var ex, ey, ec1, ec2;
    ex = Math.cos(arcPos);
    ey = Math.sin(arcPos);
    ec1 = s.radius;
    ec2 = s.radius - length;

    this._ctx.save();

    this.applyValueStyle(s);
    this._ctx.lineCap = "square";

    this._ctx.beginPath();

    this._ctx.moveTo(ec1 * ex, ec1 * ey);

    this._ctx.lineTo(ec2 * ex, ec2 * ey);

    this._ctx.stroke();

    this._ctx.restore();
  },
  drawEndCap: function drawEndCap(arcPos, s) {
    var radius = s.radius;

    this._ctx.save();

    this._ctx.lineWidth = s.lineWidth;

    this._ctx.rotate(arcPos - GAP_ARC * 2); // 1.5);


    this._ctx.beginPath();

    this._ctx.arc(0, 0, radius, GAP_ARC * 0.5, GAP_ARC * 2, false);

    this._ctx.lineTo(radius - GAP_ARC * radius, 0);

    this._ctx.closePath();

    this._ctx.fill();

    this._ctx.stroke();

    this._ctx.restore();
  },
  drawLabel: function drawLabel(s) {
    if (this._labelText !== s) {
      this._labelText = s;
      this._labelWidth = this._ctx.measureText(s).width;
    }

    this._ctx.fillText(s, this._labelWidth * -0.5, this._baselineShift, this._labelWidth);
  }
});

if (DEBUG) {
  module.exports.prototype._logFlags = "";
}

}).call(this,true,require("underscore"))

},{"app/view/base/CanvasView":78,"underscore":51,"utils/ease/fn/easeInQuad":140,"utils/ease/fn/easeOutQuad":141}],88:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/component/Carousel
 */

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:hammerjs} */


var Hammer = require("hammerjs");
/** @type {module:utils/touch/SmoothPanRecognizer} */


var Pan = require("utils/touch/SmoothPanRecognizer");
/** @type {module:hammerjs.Tap} */


var Tap = Hammer.Tap;
/** @type {module:app/control/Globals} */

var Globals = require("app/control/Globals");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View"); // /** @type {module:app/view/base/DeferredView} */
// var View = require("app/view/base/DeferredView");

/** @type {module:app/view/render/CarouselRenderer} */


var CarouselRenderer = require("app/view/render/CarouselRenderer");
/** @type {module:utils/prefixedProperty} */


var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/prefixedStyleName} */


var prefixedStyleName = require("utils/prefixedStyleName");

var transformStyleName = prefixedStyleName("transform");
var transformProperty = prefixedProperty("transform");
var translateTemplate = Globals.TRANSLATE_TEMPLATE; // var cssToPx = function(cssVal, el) {
// 	return parseInt(cssVal);
// };
// var defaultRendererFunction = (function() {
// 	var defaultRenderer = CarouselRenderer.extend({ className: "carousel-item default-renderer"}),
// 		emptyRenderer = CarouselRenderer.extend({ className: "carousel-item empty-renderer"});
// 	return function(item, index, arr) {
// 		return (index === -1)? emptyRenderer: defaultRenderer;
// 	};
// })();

/** @const */

var MAX_SELECT_THRESHOLD = 20; // /** @const */
// var CHILDREN_INVALID = View.CHILDREN_INVALID,
// 	STYLES_INVALID = View.STYLES_INVALID,
// 	MODEL_INVALID = View.MODEL_INVALID,
// 	SIZE_INVALID = View.SIZE_INVALID,
// 	LAYOUT_INVALID = View.LAYOUT_INVALID;

var VERTICAL = Hammer.DIRECTION_VERTICAL,
    HORIZONTAL = Hammer.DIRECTION_HORIZONTAL; // x: ["x", "y"],
// y: ["y", "x"],
// offsetLeft: ["offsetLeft", "offsetTop"],
// offsetTop: ["offsetTop", "offsetLeft"],
// offsetWidth: ["offsetWidth", "offsetHeight"],
// offsetHeight: ["offsetHeight", "offsetWidth"],
// width: ["width","height"],
// height: ["height","width"],
// marginLeft: ["marginLeft","marginTop"],
// marginRight: ["marginRight","marginBottom"],

/*
var HORIZONTAL_PROPS = {
	pos: "x",
	size: "width",
	offsetPos: "offsetLeft",
	offsetSize: "offsetWidth",
	marginBefore: "marginLeft",
	marginAfter: "marginRight",
};
var VERTICAL_PROPS = {
	pos: "y",
	size: "height",
	offsetPos: "offsetTop",
	offsetSize: "offsetHeight",
	marginBefore: "marginTop",
	marginAfter: "marginBottom",
};
*/
// var DIRECTION_NONE = 1;
// var DIRECTION_LEFT = 2;
// var DIRECTION_RIGHT = 4;
// var DIRECTION_UP = 8;
// var DIRECTION_DOWN = 16;

var dirToStr = function dirToStr(dir) {
  if (dir === Hammer.DIRECTION_NONE) return 'NONE';
  if (dir === Hammer.DIRECTION_LEFT) return 'LEFT';
  if (dir === Hammer.DIRECTION_RIGHT) return 'RIGHT';
  if (dir === Hammer.DIRECTION_UP) return 'UP';
  if (dir === Hammer.DIRECTION_DOWN) return 'DOWN';
  if (dir === Hammer.DIRECTION_HORIZONTAL) return 'HOR'; //IZONTAL';

  if (dir === Hammer.DIRECTION_VERTICAL) return 'VER'; //TICAL';

  if (dir === Hammer.DIRECTION_ALL) return 'ALL';
  return 'UNREC'; //OGNIZED';
};

var isValidTouchManager = function isValidTouchManager(touch, direction) {
  // var retval;
  try {
    return touch.get("hpan").options.direction == direction;
  } catch (err) {
    return false;
  } // return retval;

}; // /** @type {int} In pixels */
// var panThreshold: 15;


var createTouchManager = function createTouchManager(el, dir, thres) {
  var touch = new Hammer.Manager(el);
  var pan = new Pan({
    event: "hpan",
    threshold: Globals.THRESHOLD,
    direction: Hammer.DIRECTION_HORIZONTAL
  });
  var tap = new Tap({
    threshold: Globals.THRESHOLD - 1,
    interval: 50,
    time: 200
  });
  tap.recognizeWith(pan);
  touch.add([pan, tap]);
  return touch;
};

var Carousel = {
  /** const */
  ANIMATED: false,

  /** const */
  IMMEDIATE: true,

  /** copy of Hammer.DIRECTION_VERTICAL */
  DIRECTION_VERTICAL: VERTICAL,

  /** copy of Hammer.DIRECTION_HORIZONTAL */
  DIRECTION_HORIZONTAL: HORIZONTAL,

  /** @type {Object} */
  defaults: {
    /** @type {boolean} */
    selectOnScrollEnd: false,

    /** @type {boolean} */
    requireSelection: false,

    /** @type {int} */
    direction: HORIZONTAL,

    /** @type {int} In pixels */
    selectThreshold: 20,

    /** @type {Function} */
    rendererFunction: function () {
      var defaultRenderer = CarouselRenderer.extend({
        className: "carousel-item default-renderer"
      }),
          emptyRenderer = CarouselRenderer.extend({
        className: "carousel-item empty-renderer"
      });
      return function (item, index, arr) {
        return index === -1 ? emptyRenderer : defaultRenderer;
      };
    }()
  }
};
Carousel.validOptions = _.keys(Carousel.defaults);
/**
/* @constructor
/* @type {module:app/view/component/Carousel}
/*/

var CarouselProto = {
  /** @override */
  cidPrefix: "carousel",

  /** @override */
  tagName: "div",

  /** @override */
  className: "carousel skip-transitions",

  /* --------------------------- *
  /* properties
  /* --------------------------- */
  properties: {
    scrolling: {
      get: function get() {
        return this._scrolling;
      }
    },
    selectedItem: {
      get: function get() {
        return this._selectedView.model;
      },
      set: function set(value) {
        if (value) this._onSelectOne(value);else this._onSelectNone();
      }
    }
  },
  events: {
    // "mousedown": "_onMouseDown", "mouseup": "_onMouseUp",
    "transitionend .carousel-item.selected": "_onScrollTransitionEnd",
    "click .carousel-item:not(.selected)": "_onClick"
  },

  /** @override */
  initialize: function initialize(options) {
    _.bindAll(this, "_onPointerEvent", "_onClick");

    this.itemViews = new Container();
    this.metrics = {};

    _.extend(this, _.defaults(_.pick(options, Carousel.validOptions), Carousel.defaults)); // this.childGap = 0; //this.dirProp(20, 18);


    this._precedingDir = (Hammer.DIRECTION_LEFT | Hammer.DIRECTION_UP) & this.direction;
    this._followingDir = (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_DOWN) & this.direction; // use supplied touch mgr or create private

    if (isValidTouchManager(options.touch, this.direction)) {
      this.touch = options.touch;
    } else {
      console.warn("%s::initialize creating Hammer instance", this.cid);
      this.touch = createTouchManager(this.el, this.direction); // this.on("view:removed", this.touch.destroy, this.touch);

      this.listenTo(this, "view:removed", function () {
        this.touch.destroy();
      });
    }
    /* create children and props */


    this.setEnabled(true);
    this.skipTransitions = true;
    this._renderFlags = View.CHILDREN_INVALID; // this.invalidateChildren();

    this.listenTo(this, "view:attached", function () {
      this.skipTransitions = true; // this.invalidateSize();
      // this.renderNow();
      // this.requestRender();

      this.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    });
    /* collection listeners */

    this.listenTo(this.collection, {
      "reset": this._onReset,
      "select:one": this._onSelectOne,
      "select:none": this._onSelectNone,
      "deselect:one": this._onDeselectAny,
      "deselect:none": this._onDeselectAny
    });
  },

  /* --------------------------- *
  /* Hammer init
  /* --------------------------- */
  // validateTouchManager: function(touch, direction) {
  // 	try {
  // 		return touch.get("pan").options.direction === direction);
  // 	} catch (err) {
  // 		return false;
  // 	}
  // },
  // initializeHammer: function(options) {
  // 	// direction from opts/defaults
  // 	if (options.direction === VERTICAL) {
  // 		this.direction = VERTICAL;
  // 	} // do nothing: the default is horizontal
  //
  // 	// validate hammer instance or create local
  // 	if ((touch = options.touch) && (pan = touch.get("pan"))) {
  // 		// Override direction only if specific
  // 		if (pan.options.direction !== Hammer.DIRECTION_ALL) {
  // 			this.direction = pan.options.direction;
  // 		}
  // 		this.panThreshold = pan.options.threshold;
  // 	} else {
  // 		console.warn("%s::initializeHammer using private Hammer instance", this.cid);
  // 		touch = createHammerInstance(this.el, this.panThreshold, this.direction);
  // 		this.on("view:removed", touch.destroy, touch);
  // 	}
  // 	this.touch = touch;
  // },
  remove: function remove() {
    // this._scrollPendingAction && this._scrollPendingAction(true);
    // if (this._enabled) {
    // 	this.touch.off("tap", this._onTap);
    // 	this.touch.off("hpanstart hpanmove hpanend hpancancel", this._onPan);
    // }
    this._togglePointerEvents(false);

    this.removeChildren();
    View.prototype.remove.apply(this, arguments);
    return this;
  },

  /* --------------------------- *
  /* helper functions
  /* --------------------------- */
  dirProp: function dirProp(hProp, vProp) {
    return this.direction & HORIZONTAL ? hProp : vProp;
  },

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  // render: function() {
  // 	if (this.attached) {
  // 		this.skipTransitions = true;
  // 		// this.invalidateSize();
  // 		this.renderNow(true);
  // 	}
  // },
  // /** @override */
  // render: function () {
  // 	if (!this.attached) {
  // 		if (!this._renderPending) {
  // 			this._renderPending = true;
  // 			this.listenTo(this, "view:attached", this.render);
  // 		}
  // 	} else {
  // 		if (this._renderPending) {
  // 			this._renderPending = false;
  // 			this.stopListening(this, "view:attached", this.render);
  // 		}
  // 		this._delta = 0;
  // 		this.skipTransitions = true;
  // 		this.invalidateSize();
  // 		// this.invalidateLayout();
  // 		this.renderNow();
  // 	}
  // 	return this;
  // },
  // render: function () {
  // 	this.measureLater();
  // 	this.scrollBy(0, Carousel.IMMEDIATE);
  //
  // 	if (this.el.parentElement) {
  // 		this.renderNow();
  // 	}
  // 	return this;
  // },

  /** @override */
  renderFrame: function renderFrame(tstamp, flags) {
    if (flags & View.CHILDREN_INVALID) {
      this._createChildren(); // clear this flag now: render may be deferred until attached


      flags &= ~View.CHILDREN_INVALID;
    }

    if (this.attached) {
      if (flags & View.SIZE_INVALID) {
        this._measure();
      }

      if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
        this._scrollBy(this._delta, this.skipTransitions);
      }
    } else if (flags) {
      this.listenToOnce(this, "view:attached", function () {
        this.requestRender(flags);
      });
    }
  },

  /* --------------------------- *
  /* enabled
  /* --------------------------- */
  // /** @override */
  // _enabled: undefined,

  /** @override */
  setEnabled: function setEnabled(enabled) {
    if (this._enabled !== enabled) {
      this._enabled = enabled; // toggle events immediately

      this._togglePointerEvents(enabled); // dom manipulation on render (_renderEnabled)
      // this._renderFlags |= View.STYLES_INVALID;
      // this.requestRender();


      this.setImmediate(this._renderEnabled); // this._renderEnabled();
    }
  },
  _renderEnabled: function _renderEnabled() {
    this.el.classList.toggle("disabled", !this.enabled);
    this.itemViews.each(function (view) {
      view.setEnabled(this.enabled);
    }, this);
  },

  /* --------------------------- *
  /* Create children
  /* --------------------------- */
  _createChildren: function _createChildren() {
    // var sIndex;
    var buffer, renderer, view, viewOpts;
    this.removeChildren();

    if (this.collection.length) {
      viewOpts = {
        // viewDepth: this.viewDepth + 1,
        // parentView: this,
        enabled: this.enabled
      };
      buffer = document.createDocumentFragment(); // buffer = this.el;

      if (!this.requireSelection) {
        renderer = this.rendererFunction(null, -1, this.collection);
        view = new renderer(viewOpts);
        this.itemViews.add(view);
        buffer.appendChild(view.el);
        this.emptyView = view;
      }

      this.collection.each(function (item, index, arr) {
        viewOpts.model = item;
        renderer = this.rendererFunction(item, index, arr);
        view = new renderer(viewOpts);
        this.itemViews.add(view);
        buffer.appendChild(view.el);
      }, this); // if (!this.requireSelection) {
      // 	buffer = this.appendItemView(buffer, this.model, -1, this.collection);
      // 	this.emptyView = this.itemViews.first();
      // }
      // buffer = this.collection.reduce(this.appendItemView, buffer, this);

      this.adjustToSelection();

      this._selectedView.el.classList.add("selected");

      this.el.appendChild(buffer);
    }
  },
  // appendItemView: function (parentEl, model, index, arr) {
  // 	var renderer = this.rendererFunction(model, index, arr);
  // 	var view = new renderer({
  // 		model: model,
  // 		parentView: this,
  // 		enabled: this.enabled
  // 	});
  // 	this.itemViews.add(view);
  // 	parentEl.appendChild(view.el);
  // 	return parentEl;
  // },
  // createItemView: function (renderer, opts) {
  // 	var view = new renderer(opts);
  // 	this.itemViews.add(view);
  // 	return view;
  // },
  removeChildren: function removeChildren() {
    this.itemViews.each(this.removeItemView, this);
    this.emptyView = void 0;
  },
  removeItemView: function removeItemView(view) {
    this.itemViews.remove(view);
    view.remove();
    return view;
  },

  /* --------------------------- *
  /* measure
  /* --------------------------- */
  _measure: function _measure() {
    var m, mm;
    var pos = 0,
        posInner = 0;
    var maxAcross = 0,
        maxOuter = 0;
    var maxOuterView, maxAcrossView;
    maxOuterView = maxAcrossView = this.emptyView || this.itemViews.first(); // chidren metrics

    this.itemViews.each(function (view) {
      view.render();
    });
    this.itemViews.each(function (view) {
      m = this.measureItemView(view);
      m.pos = pos;
      pos += m.outer; // + this.childGap;

      m.posInner = posInner;
      posInner += m.inner; //+ this.childGap;

      if (view !== this.emptyView) {
        if (m.across > maxAcross) {
          maxAcross = m.across;
          maxAcrossView = view;
        }

        if (m.outer > maxOuter) {
          maxOuter = m.outer;
          maxOuterView = view;
        }
      }
    }, this); // measure self + max child metrics

    mm = this.metrics[this.cid] || (this.metrics[this.cid] = {});
    mm.outer = this.el[this.dirProp("offsetWidth", "offsetHeight")];
    mm.before = maxOuterView.el[this.dirProp("offsetLeft", "offsetTop")];
    mm.inner = maxOuterView.el[this.dirProp("offsetWidth", "offsetHeight")];
    mm.after = mm.outer - (mm.inner + mm.before);
    mm.across = maxAcross; // m = this.metrics[maxOuterView.cid];
    // mm.inner = m.inner;
    // tap area

    this._tapAcrossBefore = maxAcrossView.el[this.dirProp("offsetTop", "offsetLeft")];
    this._tapAcrossAfter = this._tapAcrossBefore + maxAcross;
    this._tapBefore = mm.before + this._tapGrow;
    this._tapAfter = mm.before + mm.inner - this._tapGrow;
    this.selectThreshold = Math.min(MAX_SELECT_THRESHOLD, mm.outer * 0.1);
  },
  measureItemView: function measureItemView(view) {
    var m, viewEl; // var s, sizeEl;

    viewEl = view.el;
    m = this.metrics[view.cid] || (this.metrics[view.cid] = {});
    m.outer = viewEl[this.dirProp("offsetWidth", "offsetHeight")];
    m.across = viewEl[this.dirProp("offsetHeight", "offsetWidth")];

    if (view.metrics) {
      m.before = view.metrics[this.dirProp("marginLeft", "marginTop")];
      m.outer += m.before;
      m.outer += view.metrics[this.dirProp("marginRight", "marginBottom")];
      m.inner = view.metrics.content[this.dirProp("width", "height")];
      m.before += view.metrics.content[this.dirProp("x", "y")];
      m.after = m.outer - (m.inner + m.before); // var marginBefore = view.metrics[this.dirProp("marginLeft","marginTop")];
      // var marginAfter = view.metrics[this.dirProp("marginRight","marginBottom")];
      // var pos = view.metrics.content[this.dirProp("x","y")];
      //
      // m.inner = view.metrics.content[this.dirProp("width","height")];
      // m.before = marginBefore + pos;
      // m.outer += marginBefore + marginAfter;
      // m.after = m.outer - (m.inner + m.before);
    } else {
      // throw new Error("renderer has no metrics");
      console.warn("%s::measureItemView view '%s' has no metrics", this.cid, view.cid);
      m.inner = m.outer;
      m.after = m.before = 0;
    }

    return m;
  },

  /* --------------------------- *
  /* scrolling property
  /* --------------------------- */
  _delta: 0,
  _scrolling: false,
  _setScrolling: function _setScrolling(scrolling) {
    // console.warn("_setScrolling current/requested", this._scrolling, scrolling);
    if (this._scrolling != scrolling) {
      this._scrolling = scrolling;
      this.el.classList.toggle("scrolling", scrolling);
      this.trigger(scrolling ? "view:scrollstart" : "view:scrollend");
    }
  },

  /* --------------------------- *
  /* Scroll/layout
  /* --------------------------- */
  scrollBy: function scrollBy(delta, skipTransitions) {
    this._delta = delta || 0;
    this.skipTransitions = !!skipTransitions; // this.invalidateLayout();

    this.requestRender(View.LAYOUT_INVALID);
  },
  _scrollBy: function _scrollBy(delta, skipTransitions) {
    var sMetrics, metrics, pos;
    sMetrics = this.metrics[(this._scrollCandidateView || this._selectedView).cid];
    this.itemViews.each(function (view) {
      metrics = this.metrics[view.cid];
      pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics));
      view.metrics.translateX = this.direction & HORIZONTAL ? pos : 0;
      view.metrics.translateY = this.direction & HORIZONTAL ? 0 : pos;
      view.metrics._transform = translateTemplate(view.metrics.translateX, view.metrics.translateY);
      view.el.style[transformProperty] = view.metrics._transform; // view.el.style[transformProperty] = (this.direction & HORIZONTAL)?
      // 	"translate3d(" + pos + "px,0,0)":
      // 	"translate3d(0," + pos + "px,0)";
    }, this);
    this.el.classList.toggle("skip-transitions", skipTransitions);
    this.selectFromView();
  },
  _getScrollOffset: function _getScrollOffset(delta, mCurr, mSel) {
    var pos,
        offset = 0;
    pos = mCurr.pos - mSel.pos + delta;

    if (pos < 0) {
      if (Math.abs(pos) < mSel.outer) {
        offset += -mCurr.after / mSel.outer * pos;
      } else {
        offset += mCurr.after;
      }
    } else if (0 <= pos) {
      if (Math.abs(pos) < mSel.outer) {
        offset -= mCurr.before / mSel.outer * pos;
      } else {
        offset -= mCurr.before;
      }
    }

    return pos + offset;
  },
  _onScrollTransitionEnd: function _onScrollTransitionEnd(ev) {
    if (ev.propertyName === transformStyleName && this.scrolling) {
      console.log("%s::_onScrollTransitionEnd selected: %s", this.cid, ev.target.cid);

      this._setScrolling(false);
    }
  },

  /* --------------------------- *
  /* toggle touch events
  /* --------------------------- */
  _togglePointerEvents: function _togglePointerEvents(enable) {
    // console.log("%s::_togglePointerEvents", this.cid, enable);
    if (this._pointerEventsEnabled == enable) return;
    this._pointerEventsEnabled = enable;

    if (enable) {
      this.touch.on("hpanstart hpanmove hpanend hpancancel", this._onPointerEvent);
      this.el.addEventListener(View.CLICK_EVENT, this._onClick, true);
    } else {
      this.touch.off("hpanstart hpanmove hpanend hpancancel", this._onPointerEvent);
      this.el.removeEventListener(View.CLICK_EVENT, this._onClick, true);
    }
  },
  _onPointerEvent: function _onPointerEvent(ev) {
    // NOTE: https://github.com/hammerjs/hammer.js/pull/1118
    if (ev.srcEvent.type === 'pointercancel') return;
    console.log("%s:[%s (%s)]:_onPointerEvent offs:%s [%s|%s==%s] [%s]", this.cid, ev.type, ev.srcEvent.type, dirToStr(ev.offsetDirection), dirToStr(ev.direction), dirToStr(this.direction), dirToStr(ev.direction | this.direction), ev.srcEvent.defaultPrevented ? "prevented" : "-"); // if (ev.direction & this.direction) {

    switch (ev.type) {
      // case View.CLICK_EVENT:
      // 	return this._onClick(ev);
      // case "tap":
      // 	return this._onTap(ev);
      case "hpanstart":
        return this._onPanStart(ev);

      case "hpanmove":
        return this._onPanMove(ev);

      case "hpanend":
        return this._onPanFinal(ev);

      case "hpancancel":
        return this._onPanFinal(ev);
    } // }

  },

  /* --------------------------- *
  /* touch event: pan
  /* --------------------------- */
  getViewAtPanDir: function getViewAtPanDir(dir) {
    // return (dir & this._precedingDir) ? this._precedingView : this._followingView;
    return dir & this._followingDir ? this._precedingView : this._followingView;
  },
  // _panCapturedOffset: 0,

  /** @param {Object} ev */
  _onPanStart: function _onPanStart(ev) {
    this.selectFromView();
    this.el.classList.add("panning");

    this._setScrolling(true);
  },

  /** @param {Object} ev */
  _onPanMove: function _onPanMove(ev) {
    // var delta = (this.direction & HORIZONTAL) ? ev.thresholdDeltaX : ev.thresholdDeltaY;
    var delta = this.direction & HORIZONTAL ? ev.deltaX : ev.deltaY;
    var view = this.getViewAtPanDir(ev.offsetDirection);
    var cView = this._panCandidateView;

    if (cView !== view) {
      cView && cView.el.classList.remove("candidate");
      view && view.el.classList.add("candidate");
      this._panCandidateView = view;
    }

    if (cView === void 0) {
      delta *= Globals.HPAN_OUT_DRAG;
    }

    if (this._renderRafId !== -1) {
      this.scrollBy(delta, Carousel.IMMEDIATE);
      this.renderNow();
    } else {
      this._scrollBy(delta, Carousel.IMMEDIATE);
    }
  },

  /** @param {Object} ev */
  _onPanFinal: function _onPanFinal(ev) {
    var scrollCandidate; // NOTE: this delta is used for determining selection, NOT for layout
    // var delta = (this.direction & HORIZONTAL) ? ev.thresholdDeltaX : ev.thresholdDeltaY;

    var delta = this.direction & HORIZONTAL ? ev.deltaX : ev.deltaY;

    if (ev.type == "hpanend" &&
    /* pan direction (current event) and offsetDirection (whole gesture) must match */
    ev.direction ^ ev.offsetDirection ^ this.direction // && (ev.direction & ev.offsetDirection & this.direction)

    /* gesture must overshoot selectThreshold */
    && Math.abs(delta) > this.selectThreshold) {
      /* choose next scroll target */
      scrollCandidate = this.getViewAtPanDir(ev.offsetDirection);
    }

    this._scrollCandidateView = scrollCandidate || void 0;

    if (this._panCandidateView && this._panCandidateView !== scrollCandidate) {
      this._panCandidateView.el.classList.remove("candidate");
    }

    this._panCandidateView = void 0;
    this.el.classList.remove("panning");
    console.log("%s:[%s]:_onPanFinal thres:(%s>%s) dir:(e:%s o:%s c:%s)=%s\n", this.cid, ev.type, Math.abs(delta), this.selectThreshold, dirToStr(ev.direction), dirToStr(ev.offsetDirection), dirToStr(this.direction), dirToStr(ev.direction ^ ev.offsetDirection ^ this.direction), scrollCandidate ? scrollCandidate.cid + ":" + scrollCandidate.model.cid : "none"); // console.log("%s::_onPanFinal", this.cid, ev);

    this.scrollBy(0, Carousel.ANIMATED);
    this.selectFromView(); // if (this._renderRafId !== -1) {
    // 	this.scrollBy(0, Carousel.ANIMATED);
    // 	this.renderNow();
    // } else {
    // 	this._scrollBy(0, Carousel.ANIMATED);
    // }
  },

  /* --------------------------- *
  /* touch event: tap
  /* --------------------------- */

  /** @type {int} In pixels */
  _tapGrow: 10,
  getViewAtTapPos: function getViewAtTapPos(posAlong, posAcross) {
    if (this._tapAcrossBefore < posAcross && posAcross < this._tapAcrossAfter) {
      if (posAlong < this._tapBefore) {
        return this._precedingView;
      } else if (posAlong > this._tapAfter) {
        return this._followingView;
      }
    }

    return void 0;
  },
  _onClick: function _onClick(ev) {
    console.log("%s::_onClick [%s]", this.cid, ev.type, ev.defaultPrevented ? "prevented" : "not-prevented");

    this._onTap(ev);
  },
  _onTap: function _onTap(ev) {
    if (ev.defaultPrevented) return;
    var tapCandidate;
    var targetView = View.findByDescendant(ev.target); // console.log("%s::_onTap %o", this.cid, targetView.cid, ev.target);
    // if (!this.itemViews.contains(targetView)) {
    // 	return;
    // }

    do {
      if (this._selectedView === targetView) {
        tapCandidate = null;
        break;
      } else if (this === targetView.parentView) {
        tapCandidate = targetView;
        break;
      } else if (this === targetView) {
        var bounds, tapX, tapY;
        bounds = this.el.getBoundingClientRect();
        tapX = (ev.type === "tap" ? ev.center.x : ev.clientX) - bounds.left;
        tapY = (ev.type === "tap" ? ev.center.y : ev.clientY) - bounds.top;
        tapCandidate = this.getViewAtTapPos(this.dirProp(tapX, tapY), this.dirProp(tapY, tapX));
        break;
      }
    } while (targetView = targetView.parentView);

    if (tapCandidate) {
      ev.preventDefault(); // ev.stopPropagation();
      // this._scrollCandidateView = tapCandidate;
      // this._setScrolling(true);
      // this.scrollBy(0, Carousel.ANIMATED);
      // this._scrollCandidateView.el.classList.add("candidate");
      // this.selectFromView();
      //// NOT using internalSelection
      // this.triggerSelectionEvents(tapCandidate, false);
      // using internalSelection

      this._scrollCandidateView = tapCandidate;

      this._setScrolling(true);

      this.scrollBy(0, Carousel.ANIMATED);
      this.triggerSelectionEvents(tapCandidate, true); // this.renderNow();
    }
  },

  /* --------------------------- *
  /* Private
  /* --------------------------- */
  triggerSelectionEvents: function triggerSelectionEvents(view, internal) {
    if (view === void 0 || this._internalSelection) {
      return;
    }

    this._internalSelection = !!internal;

    if (view === this.emptyView) {
      this.trigger("view:select:none");
    } else {
      this.trigger("view:select:one", view.model);
    }

    this._internalSelection = false;
  },
  selectFromView: function selectFromView() {
    if (this._scrollCandidateView) {
      this.triggerSelectionEvents(this._scrollCandidateView, true);
    } // if (this._scrollCandidateView === (void 0)) {
    // 	return;
    // }
    // var view = this._scrollCandidateView;
    // this.triggerSelectionEvents(view, true);

  },
  adjustToSelection: function adjustToSelection() {
    var m,
        i = this.collection.selectedIndex; // assume -1 < index < this.collection.length

    if (this.requireSelection) {
      i == -1 && i++; // if selection is null (index -1), set _selectedView to first item (index 0)

      this._selectedView = (m = this.collection.at(i)) && this.itemViews.findByModel(m);
      this._precedingView = (m = this.collection.at(i - 1)) && this.itemViews.findByModel(m);
      this._followingView = (m = this.collection.at(i + 1)) && this.itemViews.findByModel(m);
    } else {
      this._selectedView = (m = this.collection.at(i)) ? this.itemViews.findByModel(m) : this.emptyView;
      this._precedingView = m && ((m = this.collection.at(i - 1)) ? this.itemViews.findByModel(m) : this.emptyView);
      this._followingView = (m = this.collection.at(i + 1)) && this.itemViews.findByModel(m);
    }
  },

  /* --------------------------- *
  /* Model listeners
  /* --------------------------- */

  /** @private */
  _onSelectOne: function _onSelectOne(model) {
    if (model === this._selectedView.model) {
      // console.info("INTERNAL");
      return;
    }

    this._onSelectAny(model);
  },

  /** @private */
  _onSelectNone: function _onSelectNone() {
    if ((this.requireSelection ? this.itemViews.first() : this.emptyView) === this._selectedView) {
      // console.info("INTERNAL");
      return;
    }

    this._onSelectAny();
  },

  /** @private */
  _onSelectAny: function _onSelectAny(model) {
    this._selectedView.el.classList.remove("selected");

    this.adjustToSelection();

    this._selectedView.el.classList.add("selected");

    if (this._scrollCandidateView) {
      this._scrollCandidateView.el.classList.remove("candidate");

      this._scrollCandidateView = void 0;
    }

    if (!this._internalSelection) {
      this._setScrolling(true);

      this.scrollBy(0, Carousel.ANIMATED);
    }
  },
  // _onDeselectAny: function (model) {},

  /** @private */
  _onReset: function _onReset() {
    // this._createChildren();
    // this.invalidateChildren();
    this.requestRender(View.CHILDREN_INVALID | View.MODEL_INVALID);
  }
  /* --------------------------- *
  /* TEMP
  /* --------------------------- */
  // _scrollBy2: function (delta, skipTransitions) {
  // 	var metrics, pos;
  // 	var sMetrics = this.metrics[(this._scrollCandidateView || this._selectedView).cid];
  // 	var cMetrics = this.metrics[(this._panCandidateView || this._selectedView).cid];
  //
  // 	this.itemViews.each(function (view) {
  // 		metrics = this.metrics[view.cid];
  // 		pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics, cMetrics));
  // 		view.el.style[transformProperty] = (this.direction & HORIZONTAL)?
  // 				"translate3d(" + pos + "px,0,0)" : "translate3d(0," + pos + "px,0)";
  // 				// "translate(" + pos + "px,0)" : "translate(0," + pos + "px)";
  // 				// "translateX(" + pos + "px)" : "translateY(" + pos + "px)";
  // 	}, this);
  // 	this.el.classList.toggle("skip-transitions", skipTransitions);
  // 	this.selectFromView();
  // },
  // _getScrollOffset2: function (delta, mCurr, mSel, mCan) {
  // 	var offset = 0;
  // 	var posInner = mCurr.posInner - mSel.posInner + delta;
  //
  // 	if (posInner < -mSel.inner) {
  // 		offset = -(mCurr.before);
  // 	} else if (posInner > mSel.inner) {
  // 		offset = (mSel.after);
  // 	} else {
  // 		if (posInner < 0) {
  // 			offset = (mCurr.before) / (mCurr.inner) * posInner;
  // 		} else {
  // 			offset = (mSel.after) / (mCan.inner) * posInner;
  // 		}
  // 	}
  // 	return posInner + offset;
  // },
  // captureSelectedOffset: function() {
  // 	var val, view, cssval, m, mm;
  //
  // 	val = 0;
  // 	view = this._scrollCandidateView || this._selectedView;
  // 	cssval = getComputedStyle(view.el)[transformProperty];
  //
  // 	mm = cssval.match(/(matrix|matrix3d)\(([^\)]+)\)/);
  // 	if (mm) {
  // 		m = mm[2].split(",");
  // 		if (this.direction & HORIZONTAL) {
  // 			val = m[mm[1]=="matrix"? 4 : 12];
  // 		} else {
  // 			val = m[mm[1]=="matrix"? 5 : 13];
  // 		}
  // 		val = parseFloat(val);
  // 	}
  //
  // 	console.log("%s::captureSelectedOffset", this.cid, cssval, val, cssval.match(/matrix\((?:\d\,){3}(\d)\,(\d)|matrix3d\((?:\d\,){11}(\d)\,(\d)/));
  //
  // 	return val;
  // },
  // _onScrollEnd: function(exec) {
  // 	this._scrollEndCancellable = (void 0);
  // 	// this.el.classList.remove("disabled-changing");
  // 	if (exec) {
  // 		this._setScrolling(false);
  // 		// this.el.classList.remove("scrolling");
  // 		// this.trigger("view:scrollend");
  // 		console.log("%s::_onScrollEnd", this.cid);
  // 	}
  // },
  // _onMouseDown: function(ev) {
  // 	if (this._scrolling) {
  // 		this._panCapturedOffset = this.captureSelectedOffset();
  // 		console.log("%s::events[mousedown] scrolling interrupted (pos %f)", this.cid, this._panCapturedOffset);
  // 	}
  // },
  // _onMouseUp:function(ev) {
  // 	this._panCapturedOffset = 0;
  // },

};

if (DEBUG) {
  CarouselProto._logFlags = "";
}

module.exports = Carousel = View.extend(CarouselProto, Carousel);

}).call(this,true,require("underscore"))

},{"app/control/Globals":55,"app/view/base/View":82,"app/view/render/CarouselRenderer":105,"backbone.babysitter":3,"hammerjs":15,"underscore":51,"utils/prefixedProperty":146,"utils/prefixedStyleName":147,"utils/touch/SmoothPanRecognizer":153}],89:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"id","hash":{},"data":data}) : helper)));
},"useData":true});

},{"hbsfy/runtime":35}],90:[function(require,module,exports){
"use strict";

/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {string} */


var viewTemplate = require("./CollectionStack.hbs");
/**
 * @constructor
 * @type {module:app/component/CollectionStack}
 */


module.exports = View.extend({
  /** @override */
  cidPrefix: "stack",

  /** @override */
  tagName: "div",

  /** @override */
  className: "stack",

  /** @override */
  template: viewTemplate,
  events: {
    "transitionend": function transitionend(ev) {
      // console.log("%s::transitionend [invalid: %s] [transition: %s]", this.cid, this._contentInvalid, (this._skipTransitions? "skip": "run"), ev.target.id, ev.target.className);
      this._renderContent();
    }
  },
  initialize: function initialize(options) {
    this._enabled = true;
    this._skipTransitions = true;
    this._contentInvalid = true;
    options.template && (this.template = options.template);
    this.content = document.createElement("div");
    this.content.className = "stack-item";
    this.el.appendChild(this.content);
    this.listenTo(this.collection, "select:one select:none", this._onSelectChange);
  },
  setEnabled: function setEnabled(enabled) {
    if (this._enabled !== enabled) {
      this._enabled = enabled;
      this.el.classList.toggle("disabled", !this._enabled);
    }
  },
  _onSelectChange: function _onSelectChange(item) {
    if (this._renderedItem === this.collection.selected) {
      throw new Error("change event received but item is identical");
    }

    this._renderedItem = this.collection.selected;
    this._contentInvalid = true;
    this.render();
  },

  /* --------------------------- *
  /* render
  /* --------------------------- */
  render: function render() {
    if (this._skipTransitions) {
      // execute even if content has not changed to apply styles immediately
      this._skipTransitions = false;
      this.el.classList.add("skip-transitions");
      this.setImmediate(function () {
        this.el.classList.remove("skip-transitions");
      }); // render changed content immediately

      if (this._contentInvalid) {
        this._renderContent();
      }
    } else {
      // else remove 'current' class and render on transitionend
      if (this._contentInvalid) {
        this.content.classList.remove("current"); // this.content.className = "stack-item";
      }
    }

    return this;
  },
  _renderContent: function _renderContent() {
    if (this._contentInvalid) {
      this._contentInvalid = false;
      var item = this.collection.selected;
      this.content.innerHTML = item ? this.template(item.toJSON()) : "";
      this.content.classList.add("current"); // this.content.className = "stack-item current";
    }
  }
});

},{"./CollectionStack.hbs":89,"app/view/base/View":82}],91:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
/* @module app/view/component/FilterableListView
/*/

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/component/ClickableRenderer} */


var ClickableRenderer = require("app/view/render/ClickableRenderer");
/** @type {module:utils/prefixedProperty} */


var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/css/getBoxEdgeStyles} */


var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");
/** @type {module:utils/array/difference} */


var diff = require("utils/array/difference");
/** @type {module:utils/promise/resolveAll} */


var resolveAll = require("utils/promise/resolveAll");
/** @type {module:utils/promise/rejectAll} */


var rejectAll = require("utils/promise/rejectAll"); // var resolveAll = function(pp, result) {
// 	if (pp.length != 0) {
// 		pp.forEach(function(p, i, a) {
// 			p.resolve(result);
// 			a[i] = null;
// 		});
// 		pp.length = 0;
// 	}
// 	return pp;
// };
// var rejectAll = function(pp, reason) {
// 	if (pp.length != 0) {
// 		pp.forEach(function(p, i, a) {
// 			p.reject(reason);
// 			a[i] = null;
// 		});
// 		pp.length = 0;
// 	}
// 	return pp;
// };

/** @type {module:app/control/Globals.TRANSLATE_TEMPLATE} */


var translateCssValue = require("app/control/Globals").TRANSLATE_TEMPLATE;
/** @const */


var transformProp = prefixedProperty("transform");
/**
/* @constructor
/* @type {module:app/view/component/FilterableListView}
/*/

var FilterableListView = View.extend({
  /** @type {string} */
  cidPrefix: "filterableList",

  /** @override */
  tagName: "ul",

  /** @override */
  className: "list selectable filterable",

  /** @override */
  defaults: {
    collapsed: true,
    filterFn: function filterFn() {
      return true;
    },
    renderer: ClickableRenderer.extend({
      /** @override */
      cidPrefix: "listItem",

      /** @override */
      className: "list-item list-node"
    })
  },

  /** @override */
  properties: {
    collapsed: {
      get: function get() {
        return this._collapsed;
      },
      set: function set(value) {
        this._setCollapsed(value);
      }
    },
    selectedItem: {
      get: function get() {
        return this._selectedItem;
      },
      set: function set(value) {
        this._setSelection(value);
      }
    },
    filteredItems: {
      get: function get() {
        return this._filteredItems;
      }
    },
    metrics: {
      get: function get() {
        return this._metrics;
      }
    }
  },

  /** @override */
  events: {
    "transitionend .list-node": function transitionendListNode(ev) {
      // if (!ev.target.classList.contains("list-node")) {}
      if (ev.propertyName == transformProp && ev.target.parentElement === this.el) {
        this._changedPosNum--; // console.log("%s:[%s (%s)] [%s]", this.cid, ev.type, ev.target.className, ev.propertyName, this._changedPosNum, ev);
      }

      if (!this._collapsedChanging) {
        return;
      }

      if (this._changedPosNum == 0) {
        // if ((ev.propertyName == transformProp) ||
        // 	(ev.propertyName == "visibility")) {
        console.log("%s:[%s .list-item] [%s] collapsed-changing end (resolving %s promises)", this.cid, ev.type, ev.propertyName, this._collapsePromises.length);
        this._collapsedChanging = false;
        this.el.classList.remove("collapsed-changing");
        resolveAll(this._collapsePromises, this);
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    this._filteredItems = [];
    this._filteredIncoming = [];
    this._filteredOutgoing = [];
    this._metrics = {};
    this._itemMetrics = [];
    this._collapsePromises = [];
    this.itemViews = new Container();

    _.defaults(options, this.defaults);

    this.renderer = options.renderer;
    this._filterFn = options.filterFn; // this.computeFilter();
    // this.collection.each(this.createItemView, this);

    this.collection.each(this.createItemView, this);

    this._setSelection(this.collection.selected);

    this._setCollapsed(options.collapsed);

    this.refreshFilter(); // this.skipTransitions = true;
    // this.renderNow();
    // this.listenTo(this.collection, "select:one select:none", this._setSelection);

    this.listenTo(this.collection, "reset", function () {
      this._allItems = null;
      throw new Error("not implemented");
    }); // will trigger on return if this.el is already attached
    // this.skipTransitions = true;
    // this.el.classList.add("skip-transitions");
    // this.requestRender(View.ALL_INVALID);

    console.log("%s::initialize attached: %o", this.cid, this.attached);
    this.once("view:attached", function (view) {
      console.log("%s::initialize -> [view:attached] attached: %o", view.cid, view.attached); // view.requestRender(View.ALL_INVALID).renderNow();

      view.skipTransitions = true;
      view.el.classList.add("skip-transitions");
      view.setImmediate(function () {
        // this.skipTransitions = true;
        view.renderNow();
      });
    });
  },

  /**
   * Get an array with a collection contens
   * @private
   */
  _getAllItems: function _getAllItems() {
    return this._allItems || (this._allItems = this.collection.slice());
  },

  /* --------------------------- *
  /* Transition promises
  /* --------------------------- */
  _whenCollapseChangeEnds: function _whenCollapseChangeEnds() {
    if (this._collapsedChanged) {
      var view = this;
      return new Promise(function (resolve, reject) {
        view.on("view:render:after", resolve);
      });
    } else {
      return Promise.resolve(this);
    }
  },
  whenCollapseChangeEnds: function whenCollapseChangeEnds() {
    var d, p, pp;

    if (this._collapsedChanging || this._collapsedChanged) {
      d = {};
      p = new Promise(function (resolve, reject) {
        d.resolve = resolve;
        d.reject = reject;
      });
      pp = this._collapsePromises;
      pp.push(d);
    } else {
      p = Promise.resolve(this);
    }

    return p;
  },

  /* --------------------------- *
  /* Render
  /* --------------------------- */

  /** @override */
  renderFrame: function renderFrame(tstamp, flags) {
    // if (DEBUG) {
    // 	var changed = [];
    // 	this._collapsedChanged && changed.push("collapsed");
    // 	this._selectionChanged && changed.push("selection");
    // 	this._filterChanged && changed.push("filter");
    // 	console.log("%s::renderFrame [%s]", this.cid, changed.join(" "));
    // }
    // collapsed transition flag
    if (this._collapsedChanging) {
      console.warn("%s::renderFrame collapsed tx interrupted", this.cid);
      this._collapsedChanging = false;
      this.el.classList.remove("collapsed-changing");
      rejectAll(this._collapsePromises, this);
    }

    if (this.skipTransitions) {
      this.el.classList.add("skip-transitions"); // this.requestAnimationFrame(function() {

      this.setImmediate(function () {
        this.skipTransitions = false;
        this.el.classList.remove("skip-transitions");
      });
    }

    if (this._collapsedChanged) {
      this._collapsedChanged = false;
      flags |= View.SIZE_INVALID;
      this.el.classList.toggle("collapsed", this._collapsed);

      if (this.skipTransitions) {
        this._collapsedChanging = false; // resolveAll(this._collapsePromises, this.el);

        this.once("view:render:after", function (view) {
          this._changedPosNum = 0;
          resolveAll(view._collapsePromises, view);
        });
      } else {
        this._collapsedChanging = true;
        this.el.classList.add("collapsed-changing"); // this will be resolved on transitionend
      }

      console.log("%s:[collapse changed] %s promises", this.cid, this._collapsePromises.length, this._collapsedChanging ? "resolving now" : "resolving on transitionend");
    }

    if (this._selectionChanged) {
      this._selectionChanged = false;
      flags |= View.LAYOUT_INVALID;
      this.renderSelection(this.collection.selected, this.collection.lastSelected);
    }

    if (this._filterChanged) {
      this._filterChanged = false;
      flags |= View.LAYOUT_INVALID;
      var lastFilteredItems = this.filteredItems; // this._printStats(lastFilteredItems);

      this.computeFilter();
      this.applyFilter();

      if (DEBUG) {
        this._printStats(lastFilteredItems);
      }
    }

    if (flags & View.SIZE_INVALID) {
      this.measure(); // NOTE: measures children
    }

    if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
      this.renderLayout();
    }
  },
  measure: function measure() {
    // var i, ii, el, els, m, mm;
    // els = this.el.children;
    // ii = els.length;
    // mm = this._itemMetrics;
    // for (i = 0; i < ii; i++) {
    // 	mm[i] = _.pick(els[i], "offsetTop", "offsetHeight");
    // }
    this._metrics = getBoxEdgeStyles(this.el, this._metrics); // var itemEl, itemView, baseline = 0;
    // if (itemEl = this.el.querySelector(".list-item:not(.excluded) .label")) {
    // 	// itemView = this.itemViews.findByCid(itemEl.cid);
    // 	var elA = itemEl, elB = itemEl.parentElement;
    // 	var yA = elA.offsetTop,
    // 		hA = elA.offsetHeight,
    // 		yB = elB.offsetTop,
    // 		hB = elB.offsetHeight;
    // 	baseline = ((yA + hA) - (yB + hB));
    // 	console.log("%s::measure fontSize: %spx (%s+%s)-(%s+%s)=%s", this.cid, this._metrics.fontSize,
    // 		yA, hA, yB, hB, baseline
    // 	);
    // }

    this.itemViews.forEach(function (view) {
      if (!view._metrics) view._metrics = {}; // view._metrics.baseline = this._metrics.fontSize - baseline;

      view._metrics.offsetTop = view.el.offsetTop;
      view._metrics.offsetHeight = view.el.offsetHeight;
      view._metrics.offsetLeft = view.el.offsetLeft;
      view._metrics.offsetWidth = view.el.offsetWidth;

      if (!this._collapsed && view.label) {
        view._metrics.textLeft = view.label.offsetLeft;
        view._metrics.textWidth = view.label.offsetWidth;
      } else {
        view._metrics.textLeft = view._metrics.offsetLeft;
        view._metrics.textWidth = view._metrics.offsetWidth;
      }
    }, this); // this._metrics.baseline = this._metrics.fontSize - baseline;
  },
  renderLayout: function renderLayout() {
    var posX, posY, lastX, lastY;
    posX = this._metrics.paddingLeft;
    posY = this._metrics.paddingTop;
    this._changedPosNum = 0; // use HTMLElement.children to keep layout order

    for (var i = 0, ii = this.el.children.length; i < ii; i++) {
      var view = this.itemViews.findByCid(this.el.children[i].cid);
      lastX = view.transform.tx;
      lastY = view.transform.ty;

      if ((this.collection.selected && !view.model.selected || view.el.classList.contains("excluded")) && this._collapsed) {
        view.transform.tx = posX;
        view.transform.ty = posY;
      } else {
        if (view._metrics.offsetHeight == 0) {
          posY -= view._metrics.offsetTop;
        }

        view.transform.tx = posX;
        view.transform.ty = posY;
        posY += view._metrics.offsetHeight + view._metrics.offsetTop;
      }

      view.el.style[transformProp] = translateCssValue(view.transform.tx, view.transform.ty);

      if (view.transform.tx != lastX || view.transform.ty != lastY) {
        this._changedPosNum++;
      }
    } // posY += this._metrics.paddingBottom;


    this._metrics.height = Math.max(0, posY + this._metrics.paddingBottom);
    this.el.style.height = this._metrics.height + "px"; // this.el.style.height = (posY > 0) ? posY + "px" : "";
  },

  /* --------------------------- *
  /* Child views
  /* --------------------------- */

  /** @private */
  createItemView: function createItemView(item, index) {
    var view = new this.renderer({
      model: item,
      el: this.el.querySelector(".list-item[data-id=\"" + item.id + "\"]")
    }); // item.set("excluded", false, { silent: true });
    // view.listenTo(item, "change:excluded", function(item, newVal) {
    // 	// console.log(arguments);
    // 	if (this.el.classList.contains("excluded") !== newVal) {
    // 		console.warn("%s:[change:excluded] m:%o css: %o", this.cid, newVal, this.el.classList.contains("excluded"));
    // 	}
    // 	// this.el.classList.toggle("excluded", excluded);
    // });

    this.listenTo(view, "renderer:click", this._onRendererClick);
    this.itemViews.add(view);
    return view;
  },

  /** @private */
  _onRendererClick: function _onRendererClick(item, ev) {
    if (this._collapsedChanging || this._collapsed && item.get("excluded")) {
      return;
    }

    if (this.collection.selected !== item) {
      this.trigger("view:select:one", item);
    } else {
      if (ev.altKey) {
        this.trigger("view:select:none");
      } else {
        this.trigger("view:select:same", item);
      } // this.trigger("view:select:none");

    }
  },

  /* --------------------------- *
  /* Collapsed
  /* --------------------------- */

  /** @private */
  _collapsed: undefined,

  /**
   * @param {Boolean}
   */
  _setCollapsed: function _setCollapsed(collapsed) {
    if (collapsed !== this._collapsed) {
      this._collapsed = collapsed;
      this._collapsedChanged = true;
      this.requestRender();
    }
  },

  /* --------------------------- *
  /* Selection
  /* --------------------------- */

  /** @private */
  _selectedItem: undefined,

  /** @param {Backbone.Model|null} */
  _setSelection: function _setSelection(item) {
    if (item !== this._selectedItem) {
      this._selectedItem = item;
      this._selectionChanged = true;
      this.requestRender(View.MODEL_INVALID);
    }
  },

  /** @private */
  renderSelection: function renderSelection(newItem, oldItem) {
    var view;

    if (oldItem) {
      view = this.itemViews.findByModel(oldItem);
      view.el.classList.remove("selected"); // view.label.classList.remove("color-fg");
      // view.label.classList.remove("color-reverse");
    }

    if (newItem) {
      view = this.itemViews.findByModel(newItem);
      view.el.classList.add("selected"); // view.label.classList.add("color-fg");
      // view.label.classList.add("color-reverse");
    }

    this.el.classList.toggle("has-selected", this.selectedItem !== null);
  },

  /* --------------------------- *
  /* Filter
  /* --------------------------- */
  refreshFilter: function refreshFilter() {
    if (this._filterFn) {
      this._filterChanged = true;
      this.requestRender(View.MODEL_INVALID);
    }
  },

  /* --------------------------- *
  /* Filter impl 2
  /* --------------------------- */
  computeFilter: function computeFilter() {
    var newItems, oldItems;
    var hasNew, hasOld;
    this._filteredIncoming.length = 0;
    this._filteredOutgoing.length = 0;
    newItems = this._filterFn ? this.collection.filter(this._filterFn, this) : this._getAllItems();
    oldItems = this._filteredItems;
    hasNew = !!(newItems && newItems.length);
    hasOld = !!(oldItems && oldItems.length); // NOTE: diff third arg is destination array

    if (hasNew) {
      // incoming exclusions
      diff(hasOld ? oldItems : this._getAllItems(), newItems, this._filteredIncoming); // this._filteredIncoming.forEach(function(item) {
      // 	item.set("excluded", true);
      // });
    }

    if (hasOld) {
      // outgoing exclusions
      diff(hasNew ? newItems : this._getAllItems(), oldItems, this._filteredOutgoing); // this._filteredOutgoing.forEach(function(item) {
      // 	item.set("excluded", false);
      // });
    } // console.log("%s::renderFilterFn", this.cid, newItems);


    this._filteredItems = newItems;
  },
  applyFilter: function applyFilter() {
    // this.itemViews.forEach(function(view) {
    // 	view.el.classList.toggle("excluded", view.model.get("excluded"));
    // });
    this._filteredIncoming.forEach(function (item) {
      this.itemViews.findByModel(item).el.classList.add("excluded");
      item.set("excluded", true);
    }, this);

    this._filteredOutgoing.forEach(function (item) {
      this.itemViews.findByModel(item).el.classList.remove("excluded");
      item.set("excluded", false);
    }, this);

    this.el.classList.toggle("has-excluded", this.filteredItems.length > 0);
  }
  /* --------------------------- *
  /* Filter impl 1
  /* --------------------------- */

  /*
  computeFilter_1: function() {
  	var items = this._filterFn ? this.collection.filter(this._filterFn, this) : this._getAllItems();
  	this.renderFilters(items, this._filteredItems);
  	this._filteredItems = items;
  },
  	renderFilters: function(newItems, oldItems) {
  	var hasNew = !!(newItems && newItems.length);
  	var hasOld = !!(oldItems && oldItems.length);
  	var inExcl = [];
  	var outExcl = [];
  		// console.log("%s::renderFilterFn", this.cid, newItems);
  	// NOTE: diff third arg is destination array
  	if (hasNew) {
  		diff((hasOld ? oldItems : this._getAllItems()), newItems, inExcl)
  		// .forEach(function(item) {
  		// 	this.itemViews.findByModel(item).el.classList.add("excluded");
  		// 	item.set("excluded", true);
  		// }, this);
  	}
  	if (hasOld) {
  		diff((hasNew ? newItems : this._getAllItems()), oldItems, outExcl)
  		// .forEach(function(item) {
  		// 	this.itemViews.findByModel(item).el.classList.remove("excluded");
  		// 	item.set("excluded", false);
  		// }, this);
  	}
  	this._filteredIncoming = inExcl;
  	this._filteredOutgoing = outExcl;
  	// this.el.classList.toggle("has-excluded", hasNew);
  	// this.applyFilter();
  },
  */
  // computeFiltered: function() {
  // 	this._filterResult = this.collection.map(this._filterFn, this);
  // },
  //
  // renderFiltered: function() {
  // 	this.collection.forEach(function(item, index) {
  // 		this.itemViews.findByModel(item).el.classList.toggle("excluded", !this._filterResult[index]);
  // 	}, this);
  // },

});

if (DEBUG) {
  FilterableListView.prototype._logFlags = ["view.render"].join(" ");

  FilterableListView.prototype._printStats = function (lastFilteredItems) {
    if (this._logFlags["view.trace"]) console.log("%s::renderFrame %s filtered:%o(=%o)/%o (changed:%o, in:%o, out:%o)", this.cid, this.filteredItems.length > 0 ? "has" : "has not", this.filteredItems.length, lastFilteredItems ? this.filteredItems.length + this._filteredIncoming.length - this._filteredOutgoing.length : this.filteredItems.length, this.collection.length, this._filteredIncoming.length + this._filteredOutgoing.length, this._filteredIncoming.length, this._filteredOutgoing.length);
  };
}

module.exports = FilterableListView;

}).call(this,true,require("underscore"))

},{"app/control/Globals":55,"app/view/base/View":82,"app/view/render/ClickableRenderer":106,"backbone.babysitter":3,"underscore":51,"utils/array/difference":129,"utils/css/getBoxEdgeStyles":139,"utils/prefixedProperty":146,"utils/promise/rejectAll":149,"utils/promise/resolveAll":150}],92:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/component/GraphView
 */

/** @type {Function} */
var Color = require("color");
/** @type {module:app/view/base/CanvasView} */


var CanvasView = require("app/view/base/CanvasView");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:utils/canvas/calcArcHConnector} */


var calcArcHConnector = require("utils/canvas/calcArcHConnector");
/** @type {module:utils/canvas/CanvasHelper} */


var CanvasHelper = require("utils/canvas/CanvasHelper");
/** @type {module:utils/geom/inflateRect} */


var inflateRect = require("utils/geom/inflateRect"); // /** @type {module:utils/dom/getAbsoluteClientRect} */
// var getAbsoluteClientRect = require("utils/dom/getAbsoluteClientRect");
// var BEZIER_CIRCLE = 0.551915024494;
// var MIN_CANVAS_RATIO = 2;
// var PI2 = Math.PI * 2;


var styleBase = {
  lineCap: "butt",
  // round, butt, square
  lineWidth: 0.75,
  lineDashOffset: 0,
  setLineDash: [[]] // radiusBase: 2,
  // /* factored to rem unit */ //6,
  // radiusIncrement: 0.21, //3, //0.25,
  // /* uses lineWidth multiplier */
  // outlineWidth: 3,
  // /* uses lineWidth multiplier */
  // arrowSize: 0.3,

};
var paramsBase = {
  radiusBase: 1.25,

  /* factored to rem unit */
  //6,
  radiusIncrement: 0.21,
  //3, //0.25,

  /* uses lineWidth multiplier */
  outlineWidth: 3,

  /* factored to rem unit */
  arrowSize: 0.4 //0.3,

}; // var overlayStyleBase = {
// 	globalAlpha: 0.75,
// 	globalCompositeOperation: "destination-out",
// 	lineWidth: 4,
// 	lineJoin: "round",
// 	textBaseline: "top",
// 	textAlign: "left",
// };

if (DEBUG) {
  /* eslint-disable no-unused-vars */
  var _dStyles = {
    defaults: {
      globalAlpha: 0.66,
      lineWidth: 0,
      fillStyle: "transparent",
      strokeStyle: "transparent",
      lineDashOffset: 0,
      setLineDash: [[]]
    }
  };
  /* Stroke */

  ["red", "salmon", "sienna", "green", "yellowgreen", "olive", "blue", "lightskyblue", "midnightblue", "grey", "silver"].forEach(function (colorName) {
    var rgbaValue = Color(colorName).alpha(0.75).string();
    _dStyles[colorName] = _.defaults({
      lineWidth: 0.75,
      strokeStyle: rgbaValue
    }, _dStyles["defaults"]);
    _dStyles[colorName + "_dashed"] = _.defaults({
      setLineDash: [[4, 2]],
      strokeStyle: rgbaValue
    }, _dStyles["defaults"]);
    _dStyles[colorName + "_thick"] = _.defaults({
      lineWidth: 5,
      strokeStyle: rgbaValue
    }, _dStyles["defaults"]);
    _dStyles[colorName + "_fill"] = _.defaults({
      fillStyle: rgbaValue
    }, _dStyles["defaults"]);
  });
  /* eslint-enable no-unused-vars */
}

var getRectDirX = function getRectDirX(r1, r2) {
  if (r1.right < r2.left) {
    return 1;
  }

  if (r2.right < r1.left) {
    return -1;
  }

  return 0;
};
/**
 * @constructor
 * @type {module:app/view/component/GraphView}
 */


var GraphView = CanvasView.extend({
  /** @type {string} */
  cidPrefix: "graph",

  /** @override */
  tagName: "canvas",

  /** @override */
  className: "graph",
  defaultKey: "a2b",
  defaults: {
    values: {
      a2b: 0,
      b2a: 0
    },
    maxValues: {
      a2b: 1,
      b2a: 1
    } // useOpaque: true,
    // labelFn: function(value, max) {
    // 	return ((value / max) * 100) | 0;
    // },

  },

  /** @override */
  initialize: function initialize(options) {
    CanvasView.prototype.initialize.apply(this, arguments);
    this._listA = options.listA;
    this._listB = options.listB;
    this._a2b = {
      srcView: options.listA,
      destView: options.listB,
      s: _.defaults({
        lineWidth: 0.7 //1.25
        // radiusIncrement: 0.25,

      }, styleBase, paramsBase),
      p: _.defaults({}, paramsBase),
      strokeStyleFn: function strokeStyleFn(fg, bg, ln) {
        return Color(ln).mix(bg, 0.1).hex();
      }
    };
    this._b2a = {
      srcView: options.listB,
      destView: options.listA,
      s: _.defaults({
        lineWidth: 0.7 // arrowSize: 0.25,
        // radiusIncrement: 0,
        // outlineWidth: 0,

      }, styleBase, paramsBase),
      p: _.defaults({}, paramsBase),
      strokeStyleFn: function strokeStyleFn(fg, bg, ln) {
        return Color(fg).mix(bg, 0.4).hex();
      }
    }; // this.listenTo(this._a2b.srcView.collection, "view:select:one view:select:none", function(item) {
    // 	this._a2b.connectorsOut = this._a2b.connectors;
    // 	this._a2b.connectors = null;
    // });
    //
    // this.listenTo(this._b2a.srcView.collection, "view:select:one view:select:none", function(item) {
    // 	this._b2a.connectorsOut = this._b2a.connectors;
    // 	this._b2a.connectors = null;
    // });
    // this.listenTo(this, "view:render:before", this._beforeViewRender);
    // this._traceScroll = _.debounce(this.__raceScroll, 100, false);
    // var viewportChanged = function(ev) {
    // 	console.log("%s:[%s]", this.cid, ev.type);
    //
    // 	// this._traceScroll(ev.type);
    // 	// this._labelOverlays = null;
    // 	this.invalidate(CanvasView.LAYOUT_INVALID | CanvasView.SIZE_INVALID);
    // 	// this.requestRender(CanvasView.LAYOUT_INVALID | CanvasView.SIZE_INVALID);
    // 	// this.requestRender().renderNow();
    // }.bind(this);
    // viewportChanged = _.debounce(viewportChanged, 60, false);
    // window.addEventListener("scroll",
    // 		_.debounce(viewportChanged, 100, false), false);
    // window.addEventListener("wheel",
    // 	_.debounce(viewportChanged, 100, false), false);
    // window.addEventListener("scroll", viewportChanged, false);
    // window.addEventListener("wheel", viewportChanged, false);
    // window.addEventListener("resize", viewportChanged, false);
    // window.addEventListener("orientationchange", viewportChanged, false);
    // this._addListListeners(this._a2b);
    // this._addListListeners(this._b2a);
  },

  /** @override */
  measureCanvas: function measureCanvas(w, h, s) {
    console.log("%s::measureCanvas style:%o scroll:%o offset:%o client:%o arg:%o", this.cid, s.height, this.el.offsetHeight, this.el.scrollHeight, this.el.clientHeight, h);
  },

  /** @override */
  updateCanvas: function updateCanvas() {
    this._updateMetrics();

    this._updateStyles();
  },

  /* --------------------------- *
  /* styles
  /* --------------------------- */
  _updateStyles: function _updateStyles() {
    var b, bgColor, lnColor;

    if (this.model.has("bundle")) {
      b = this.model.get("bundle");
      lnColor = Color(b.colors.lnColor); //.clone();

      bgColor = Color(b.colors.bgColor); //.clone();
    } else {
      bgColor = Color(Globals.DEFAULT_COLORS["background-color"]);
      lnColor = Color(Globals.DEFAULT_COLORS["link-color"]);
    }

    this._a2b.s.strokeStyle = this._a2b.s.fillStyle = this._a2b.strokeStyleFn(this._color, bgColor, lnColor);
    this._b2a.s.strokeStyle = this._b2a.s.fillStyle = this._b2a.strokeStyleFn(this._color, bgColor, lnColor);

    if (DEBUG) {
      this._debugBlocks = this.el.matches(".debug-blocks ." + this.className);
      this._debugGraph = this.el.matches(".debug-graph ." + this.className);
    }
  },
  _setStyle: function _setStyle(s) {
    if (typeof s == "string") {
      s = this._styleData[s];
    }

    CanvasView.setStyle(this._ctx, s);
  },

  /* --------------------------- *
  /* metrics
  /* --------------------------- */
  _updateMetrics: function _updateMetrics() {
    var bounds;
    this._rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    bounds = this.el.getBoundingClientRect(); // bounds = getAbsoluteClientRect(this.el);

    this._ctx.setTransform(this._canvasRatio, 0, 0, this._canvasRatio, -(bounds.left + window.pageXOffset) * this._canvasRatio - 0.5, -(bounds.top + window.pageYOffset) * this._canvasRatio - 0.5);

    var i, ii, els;
    var srcRect, destRect;
    var srcMin, destMin;
    srcRect = this._a2b.srcView.el.getBoundingClientRect();
    destRect = this._a2b.destView.el.getBoundingClientRect();
    this._a2b.qx = getRectDirX(srcRect, destRect);
    els = this._listA.el.querySelectorAll(".label");
    srcMin = srcRect.left + window.pageXOffset;

    for (i = 0, ii = els.length; i < ii; i++) {
      srcMin = Math.max(srcMin, els[i].getBoundingClientRect().right + window.pageXOffset);
    }

    this._a2b.xMin = srcMin;
    els = this._listB.el.querySelectorAll(".label");
    destMin = destRect.left + window.pageXOffset;

    for (i = 0, ii = els.length; i < ii; i++) {
      destMin = Math.min(destMin, els[i].getBoundingClientRect().left + window.pageXOffset);
    }

    this._a2b.destMinX = destMin;
    this._b2a.qx = -this._a2b.qx;
    this._b2a.xMin = this._a2b.destMinX;
    this._b2a.destMinX = this._a2b.xMin; // var s = getComputedStyle(document.documentElement);
    // this._rootFontSize = parseFloat(s.fontSize); // * this._canvasRatio;
    // console.log("%s::_updateMetrics _rootFontSize: %s %o", this.cid, this._rootFontSize, s);
    // var c = Math.abs(sData.xMin - dData.xMin) / 6;
    // sMin = sData.xMin + c * qx;
    // dMin = dData.xMin - c * qx;
    // this._a2b.targets = this._measureListItems(listView);
    // this._b2a.targets = this._measureListItems(listView);
    // // connector minimum branch x2
    // listView = this._listB;
    // for (i = 0, ii = listView.groups.length; i < ii; i++) {
    // 	itemView = listView.itemViews.findByModel(listView.groups[i]);
    // 	itemRect = (itemView.label || itemView.el).getBoundingClientRect();
    // 	this._b2a.xMin = Math.min(this._b2a.xMin, itemRect.left);
    // 	// if (itemView._metrics) this._b2a.rect.left + itemView.transform.tx + itemView._metrics.textLeft;
    // }
  },

  /* --------------------------- *
  /* redraw
  /* --------------------------- */
  redraw: function redraw(ctx, interp, flags) {
    this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeight);

    ctx.save();

    this._redraw_fromElements(ctx, interp, flags); // this._redraw_fromViews(ctx, interp);


    ctx.restore();
  },
  _redraw_fromElements: function _redraw_fromElements(ctx, interp, flags) {
    // b2a: keyword to bundles, right to left
    // a2b: bundle to keywords, left to right
    if (flags & (CanvasView.SIZE_INVALID | CanvasView.MODEL_INVALID)) {
      console.log("%s::redraw [valuesChanged: %s] [flags: %s]", this.cid, interp.valuesChanged, CanvasView.flagsToString(flags));
      this._a2b.connectorsOut = this._a2b.connectors;
      this._b2a.connectorsOut = this._b2a.connectors;
      this._b2a.connectors = this._computeConnectors(this._b2a);
      this._a2b.connectors = this._computeConnectors(this._a2b);
      this._labelOverlays = this._computeLabelOverlays(this._listB);
    }
    /* line dash value interpolation */


    var b2aVal, a2bVal;
    b2aVal = interp.getRenderedValue("b2a") / interp.getOption("b2a", "max"); //_valueData["b2a"]._maxVal;
    // b2aVal = interp._valueData["b2a"]._renderedValue / interp._valueData["b2a"]._maxVal;

    a2bVal = interp.getRenderedValue("a2b") / interp.getOption("a2b", "max"); //interp._valueData["a2b"]._maxVal;
    // a2bVal = interp._valueData["a2b"]._renderedValue / interp._valueData["a2b"]._maxVal;

    /* draw */

    this._drawConnectors(this._b2a.connectors, this._b2a.s, b2aVal, 1);

    this._drawConnectors(this._b2a.connectorsOut, this._b2a.s, 1 - b2aVal, 1);

    this._drawConnectors(this._a2b.connectors, this._a2b.s, a2bVal, 2); // this._drawConnectors(this._a2b.connectorsOut, this._a2b.s, 1 - a2bVal, 2);


    this._drawLabelOverlays(this._labelOverlays);
  },

  /* --------------------------- *
   * label overlays
   * --------------------------- */
  _computeLabelOverlays: function _computeLabelOverlays(list) {
    var data = {
      rects: []
    };
    var els = list.el.querySelectorAll(".list-group .label span");
    var i, ii, r;

    for (i = 0, ii = els.length; i < ii; i++) {
      // r = inflateRect(els[i].getBoundingClientRect(), 0, 0);
      r = _.clone(els[i].getBoundingClientRect());
      r.top += window.pageYOffset; // - 0.5;

      r.left += window.pageXOffset; // - 0.5;
      // r.innerText = els[i].innerText;

      data.rects[i] = r;
    } // data.cssStyle = getComputedStyle(els[0]);
    // data.boxStyle = getBoxEdgeStyles(overlayData.cssStyle);
    // data.ctxStyle = {
    // 	font: [s.fontWeight, s.fontStyle, s.fontSize + "/" + s.lineHeight, s.fontFamily].join(" ")
    // };


    return data;
  },
  _drawLabelOverlays: function _drawLabelOverlays(data) {
    this._ctx.save(); // CanvasView.setStyle(this._ctx, s);


    this._ctx.globalAlpha = 0.85;
    this._ctx.globalCompositeOperation = "destination-out"; // this._ctx.canvas.style.letterSpacing = overlayData.cssStyle.letterSpacing;

    data.rects.forEach(function (r) {
      // this._ctx.clearRect(r.left, r.top, r.width, r.height);
      this._ctx.fillRect(r.left, r.top, r.width, r.height); // this._ctx.strokeText(r.innerText, r.left, r.top);

    }, this);

    this._ctx.restore();

    if (DEBUG) {
      if (this._debugGraph || this._debugBlocks) {
        data.rects.forEach(function (r) {
          r = inflateRect(r, 0, 0);
          CanvasHelper.drawRect(this._ctx, _dStyles["silver_dashed"], r.left, r.top, r.width, r.height);
        }, this);
      }
    }
  },

  /* --------------------------- *
   * connectors
   * --------------------------- */
  _computeConnectors: function _computeConnectors(d) {
    var sMin = d.xMin;
    var dMin = d.destMinX;
    var qx = d.qx;
    var rBase, rInc;
    rBase = this._roundTo(d.s.radiusBase * this._rootFontSize, 0.5);
    rInc = this._roundTo(d.s.radiusIncrement * this._rootFontSize, 0.5); // var root = {};

    var i,
        p,
        ddNum,
        connectors = [];
    var x1, y1, tx;
    var sView, ddView, ddItems;

    if (d.srcView.collection.selected && d.destView.filteredItems) {
      sView = d.srcView.itemViews.findByModel(d.srcView.collection.selected);
      var rect = sView.label.getBoundingClientRect();
      x1 = rect.left;
      y1 = rect.top + rect.height / 2;
      if (qx > 0) x1 += rect.width;
      x1 += window.pageXOffset;
      y1 += window.pageYOffset; // if (!sView._metrics) return;
      // x1 = d.rect.left + sView.transform.tx
      // 	+ sView._metrics.textLeft;
      // y1 = d.rect.top + sView.transform.ty
      // 	+ sView._metrics.offsetHeight / 2;
      // if (qx > 0) x1 += sView._metrics.textWidth;

      ddItems = d.destView.filteredItems;
      ddNum = d.destView.filteredItems.length;

      for (i = 0; i < ddNum; i++) {
        p = {};
        ddView = d.destView.itemViews.findByModel(ddItems[i]);
        rect = ddView.label.getBoundingClientRect();
        p.x2 = rect.left;
        p.y2 = rect.top + rect.height / 2;
        if (qx < 0) p.x2 += rect.width;
        p.x2 += window.pageXOffset;
        p.y2 += window.pageYOffset; // p.x2 = d.destRect.left + ddView.transform.tx
        // 	+ ddView._metrics.textLeft;
        // p.y2 = d.destRect.top + ddView.transform.ty
        // 	+ ddView._metrics.offsetHeight / 2;
        // if (qx < 0) p.x2 += ddView._metrics.textWidth;

        p.x1 = x1;
        p.y1 = y1;
        p.qx = qx;
        connectors[i] = p;
      }

      connectors.sort(function (a, b) {
        return a.y2 - b.y2;
      }); // ssEl's number of items above in the Y axis

      var si = 0; // Node first arc (r0) max radius (cx0)
      // They are centered to the label, so halve it

      var rMax0 = ddNum * rInc * 0.5; // cy1 offset from y1

      var a; // First pass, calc first radius (r0, at the source of the connector),
      // and the amount of dest connectors vertically closer to the source (di)

      for (i = 0; i < ddNum; i++) {
        p = connectors[i];
        a = (i - (ddNum - 1) / 2) * rInc;
        p.cy1 = p.y1 + a;
        p.cy2 = p.y2;
        p.r0 = Math.abs(a);
        p.cx0 = p.x1 + (rMax0 - p.r0) * qx; // If src (cy1) is above dest (y2), decrease index diff (di)

        p.di = p.cy1 - p.y2 > 0 ? i : ddNum - (i + 1);
        si = Math.max(si, p.di); // p.dx = x1 - p.x2;
        // p.dy = y1 - p.y2;
      } // Calc max radius that fits sMin to dMin:
      // from space btw sMin to dMin, remove first arc and max arc increase,
      // then halve (there's two arcs left)


      var rBaseMax = (Math.abs(dMin - sMin) - (rMax0 + si * rInc)) / 2; // Ensure 0 > rBase > rBaseMax

      rBase = Math.max(0, Math.min(rBase, rBaseMax)); // console.log("%s::_computeConnectors 1rem = %spx rBase:%s rBaseMax:%s", this.cid, this._rootFontSize, rBase, rBaseMax);

      for (i = 0; i < ddNum; i++) {
        p = connectors[i];
        p.r1 = p.di * rInc + rBase;
        p.r2 = rBase; // p.r1 = p.di * rInc + rBase;
        // p.r2 = (si - p.di) * rInc + rBase;

        p.cx1 = sMin + rMax0 * qx;
        p.cx2 = dMin - (si - p.di) * rInc * qx; //
        // p.cx1 = sMin + (rMax0 * qx);
        // p.cx2 = dMin;

        tx = calcArcHConnector(p.cx1, p.cy1, p.r1, p.cx2, p.cy2, p.r2, 0.9);

        if (tx) {
          p.tx1 = tx[0];
          p.tx2 = tx[1];
        } else {
          p.tx1 = p.cx1;
          p.tx2 = p.cx2;
        }

        p.length = Math.abs(p.x1 - p.x2) + Math.abs(p.cy1 - p.cy2); // Find out longest node connection for setLineDash
        // root.maxLength = Math.max(root.maxLength, p.length);
      }

      connectors.sort(function (a, b) {
        return a.di - b.di;
      } // Sort by index distance to from source point
      // a.r0 - b.r0 // Sort by first arc (centered)
      // (a.r1 + a.r2) - (b.r1 + b.r2)
      // a.tx2 - b.tx2
      );
      connectors.si = si;
      connectors.qx = qx;
      connectors.sMin = sMin;
      connectors.dMin = dMin; // root.x = x1;
      // root.y = y1;
      // root.qx = qx;
      // root.r0 = si * rInc;
    } // d.connectors = connectors;
    // d.root = root;
    // return d;


    return connectors;
  },
  _drawConnectors: function _drawConnectors(pp, s, lVal, dir) {
    var i, ii, p;
    var ow, ra1, ra2, ta;
    if (!(pp && pp.length && lVal)) return;
    ii = pp.length;
    /* outline width */

    ow = s.lineWidth + s.outlineWidth; // ow = Math.min(
    // 	this._roundTo(s.radiusIncrement * this._rootFontSize, 0.5),
    // 	this._roundTo(s.lineWidth * (1 + s.outlineWidth), 0.5)
    // );

    /* arrow radiuses, direction */
    // ra1 = (s.radiusIncrement * this._rootFontSize) + s.lineWidth;

    ra1 = s.arrowSize * this._rootFontSize;
    ra2 = ra1 + (ow - s.lineWidth);
    ta = Math.PI * dir; // dir -= 2;

    this._setStyle(s); // if (lVal < 1) {
    // 	this._ctx.lineDashOffset = lMax * (1 + lVal);
    // 	this._ctx.setLineDash([lMax, lMax])
    // 	// this._ctx.lineDashOffset = lMax * (1 + lVal);;
    // 	// this._ctx.setLineDash([lMax * (1 - lVal), lMax]);
    // }
    // for (i = 0; i < ii; i++) {
    // p = pp[i];


    if (s.outlineWidth) {
      this._ctx.save();

      this._ctx.globalCompositeOperation = "destination-out";
      this._ctx.lineWidth = ow;

      for (i = 0; i < ii; i++) {
        p = pp[i];

        if (lVal < 1) {
          this._ctx.lineDashOffset = p.length * (1 + lVal);

          this._ctx.setLineDash([p.length, p.length]);
        }

        this._drawConnector(p, i, pp);

        if (lVal == 1) {
          this._drawArrowhead(p.x2, p.y2, ra2, dir * ta);
        }
      }

      this._ctx.restore();
    }

    for (i = 0; i < ii; i++) {
      p = pp[i];

      if (lVal < 1) {
        this._ctx.lineDashOffset = p.length * (1 + lVal);

        this._ctx.setLineDash([p.length, p.length]);
      }

      this._drawConnector(p, i, pp);

      if (lVal == 1) {
        this._drawArrowhead(p.x2, p.y2, ra1, dir * ta);
      }
    }
  },
  _drawArrowhead: function _drawArrowhead(x, y, r, t) {
    // this._ctx.save();
    // this._ctx.lineDashOffset = 0;
    // this._ctx.setLineDash([]);
    CanvasHelper.arrowhead2(this._ctx, x, y, r, t);

    this._ctx.stroke(); // this._ctx.restore();

  },
  _drawArrowhead2: function _drawArrowhead2(x, y, r, t) {
    CanvasHelper.arrowhead(this._ctx, x, y, r, t);

    this._ctx.fill();
  },
  // _drawArrowheadH: function(x, y, r, a) {
  // 	this._ctx.save();
  // 	this._ctx.lineDashOffset = 0;
  // 	this._ctx.setLineDash([]);
  // 	this._ctx.beginPath();
  // 	this._ctx.moveTo(x + r * 1 / dir, y - r);
  // 	this._ctx.lineTo(x, y);
  // 	this._ctx.lineTo(x + r * 1 / dir, y + r);
  // 	this._ctx.stroke();
  // 	this._ctx.restore();
  // },
  _drawConnector: function _drawConnector(p, i, pp) {
    this._ctx.beginPath();

    this._ctx.moveTo(p.x2, p.cy2);

    this._ctx.arcTo(p.tx2, p.cy2, p.tx1, p.cy1, p.r2);

    this._ctx.arcTo(p.tx1, p.cy1, p.cx1, p.cy1, p.r1);

    this._ctx.arcTo(p.cx0, p.cy1, p.cx0, p.y1, p.r0); // p.cx00 = p.x1 + ((p.r0 + p.di) * p.qx);
    // p.cy00 = (p.cy1 + p.y1) / 2;
    // this._ctx.arcTo(p.cx00, p.cy1, p.cx00, p.cy00, p.r0 / 2);
    // this._ctx.arcTo(p.cx00, p.y1, p.x1, p.y1, p.r0 / 2);
    // this._ctx.lineTo(p.x1, p.y1);
    // p.cx00 = p.x1 + (p.r0 * p.qx * 2);
    // this._ctx.lineTo(p.cx00, p.cy1);
    // this._ctx.quadraticCurveTo(p.cx0, p.cy1, p.cx0, p.y1);
    // this._ctx.lineTo(p.cx0, p.y1);


    this._ctx.stroke();
  },
  _roundTo: function _roundTo(n, p) {
    if (p > 1) p = 1 / p;
    return Math.round(n / p) * p;
  }
  /*
  _computeConnectors: function(d) {
  	var rBase = d.s.radiusBase;
  	var rInc = d.s.radiusIncrement;
  	var sMin = d.xMin;
  	var dMin = d.destMinX;
  		var lMax = 0;
  	var p, connectors = [];
  	var qx, x1, y1, tx;
  	var si; // ssEl's number of items above in the Y axis
  		if (d.rect.right < d.destRect.left) {
  		qx = 1;
  	} else if (d.destRect.right < d.rect.left) {
  		qx = -1;
  	} else {
  		qx = 0;
  	}
  		var ssEl, ddEls, ddNum, ssRect, ddRect, i;
  	ssEl = d.srcView.el.querySelector(".list-item.selected .label");
  	if (ssEl) {
  		ssRect = ssEl.getBoundingClientRect();
  		x1 = ssRect.left;
  		if (qx > 0) x1 += ssRect.width;
  		y1 = ssRect.top + ssRect.height / 2;
  		// r2 = rBase;
  		// cx1 = d.xMin;
  			si = 0;
  		ddEls = d.destView.el.querySelectorAll(".list-item:not(.excluded) .label");
  		ddNum = ddEls.length;
  		// dx = Math.abs(d.xMin - dData.xMin);
  			for (i = 0; i < ddNum; i++) {
  			p = {};
  			ddRect = ddEls[i].getBoundingClientRect();
  			p.x2 = ddRect.left;
  			if (qx < 0) p.x2 += ddRect.width;
  			p.y2 = ddRect.top + ddRect.height / 2;
  			p.x1 = x1;
  			p.y1 = y1;
  			p.dx = p.x1 - p.x2;
  			p.dy = p.y1 - p.y2;
  			p.qx = qx;
  			p.qy = Math.sign(p.dy);
  			// p.dLength = Math.abs(p.x) + Math.abs(p.y);
  			p.di = p.dy > 0 ? i : ddNum - (i + 1);
  			si = Math.max(si, p.di);
  			connectors[i] = p;
  		}
  			var a, rMax0 = ddNum * 0.5 * rInc;
  		for (i = 0; i < ddNum; i++) {
  			p = connectors[i];
  			p.r1 = p.di * rInc + rBase;
  			p.r2 = rBase;
  			// p.r2 = (si - p.di) * rInc + rBase;
  				p.cx1 = sMin;
  			p.cx2 = dMin - ((si - p.di) * rInc) * qx;
  			// p.cx2 = dMin;
  				a = (i - (ddNum - 1) / 2) * rInc;
  			p.cy1 = p.y1 + a;
  			p.cy2 = p.y2;
  				a = Math.abs(a);
  			p.r0 = a;
  			p.cx0 = p.x1 + (rMax0 - a) * qx;
  				tx = calcArcHConnector(p.cx1, p.cy1, p.r1, p.cx2, p.cy2, p.r2, 0.8);
  			p.tx1 = tx[0];
  			p.tx2 = tx[1];
  				// Find out longest node connection for setLineDash
  			lMax = Math.max(lMax, Math.abs(p.x1 - p.x2) + Math.abs(p.cy1 - p.cy2));
  		}
  		// Sort by distance y1 (original) > cy1 (rInc offset) distance
  		connectors.sort(function(a, b) {
  			// return Math.abs(b.y1 - b.cy1) - Math.abs(a.y1 - a.cy1);
  			// return a.r0 - b.r0;
  			return b.di - a.di;
  		});
  	}
  	d.connectors = connectors;
  	d.maxLength = lMax;
  	d.maxLength = qx;
  }, */

});

if (DEBUG) {
  // GraphView.prototype._logFlags = "";
  var applyFn = function applyFn(context, args) {
    return Array.prototype.shift.apply(args).apply(context, args);
  };

  GraphView.prototype._drawConnector = _.wrap(GraphView.prototype._drawConnector, function (fn, p, i, pp) {
    if (!this._debugGraph) {
      // visual debug aids are off
      return fn.call(this, p, i, pp);
    } // var isRtl = p.qx < 0;


    var isFirst = i == 0;
    var isLast = i == pp.length - 1; // guide color

    var gs = _dStyles[isFirst ? "salmon_dashed" : "lightskyblue_dashed"];

    if (isFirst) {
      CanvasHelper.drawVGuide(this._ctx, _dStyles["grey"], pp.sMin);
      CanvasHelper.drawVGuide(this._ctx, _dStyles["grey"], pp.dMin);
    }

    if (isFirst) {
      CanvasHelper.drawHGuide(this._ctx, _dStyles["silver_dashed"], p.y1);
      CanvasHelper.drawVGuide(this._ctx, _dStyles["silver_dashed"], p.x1);
      CanvasHelper.drawCircle(this._ctx, _dStyles["midnightblue"], p.x1, p.y1, 10);
    }

    if (isFirst || isLast) {
      // CanvasHelper.drawVGuide(this._ctx, gs, p.cx1 + (p.r1 * p.qx));
      CanvasHelper.drawVGuide(this._ctx, gs, p.tx2);
      CanvasHelper.drawVGuide(this._ctx, gs, p.cx2 - p.r2 * p.qx); // CanvasHelper.drawVGuide(this._ctx, gs, p.cx2);
      // CanvasHelper.drawHGuide(this._ctx, gs, p.cy2);
    }

    if (isFirst || isLast) {
      this._ctx.save();

      this._ctx.strokeStyle = _dStyles[isFirst ? "red" : "blue"].strokeStyle;
      this._ctx.lineWidth *= 1.5;
    } // }


    fn.call(this, p, i, pp); // if (isRtl) {

    if (isFirst || isLast) {
      this._ctx.restore();
    } // point color


    var pCol = isLast ? "midnightblue" : isFirst ? "sienna" : "grey";
    var ps = _dStyles[pCol];
    var pf = _dStyles[pCol + "_fill"]; // CanvasHelper.drawCrosshair(this._ctx, ps, p.x1 + ((p.r0 + p.di) * p.qx), p.cy1, 3);

    if (isFirst || isLast) {
      // moveTo(p.x2, p.cy2)
      CanvasHelper.drawCrosshair(this._ctx, ps, p.x2, p.cy2, 10);
      CanvasHelper.drawCircle(this._ctx, ps, p.x2, p.cy2, 3); // arcTo #1: (p.tx2, p.cy2, p.tx1, p.cy1, p.r2)

      CanvasHelper.drawSquare(this._ctx, ps, p.tx2, p.cy2, 4); // p1

      CanvasHelper.drawCircle(this._ctx, pf, p.tx1, p.cy1, 2); // p2
      // arcTo #2: (p.tx1, p.cy1, p.cx1, p.cy1, p.r1)

      CanvasHelper.drawSquare(this._ctx, ps, p.tx1, p.cy1, 4); // p1

      CanvasHelper.drawCircle(this._ctx, pf, p.cx1, p.cy1, 2); // p2
      // arcTo #2: (p.cx0, p.cy1, p.cx0, p.y1, p.r0)

      CanvasHelper.drawSquare(this._ctx, ps, p.cx0, p.cy1, 4); // p1

      CanvasHelper.drawCircle(this._ctx, pf, p.cx0, p.y1, 2); // p2

      CanvasHelper.drawCircle(this._ctx, _dStyles["green"], p.tx1, p.cy1, 4);
      CanvasHelper.drawCircle(this._ctx, _dStyles["green"], p.cx1, p.cy1, 4);
      CanvasHelper.drawCircle(this._ctx, _dStyles["green"], p.cx2, p.cy2, 4);
    } // }

  });

  GraphView.prototype._traceScroll = function (type) {
    var tpl = "%s:[%s] DPR:%i " + "[window: %i %i] " + "[html: %i %i %i] " + "[body: %i %i %i] " + "[container: %i %i %i] " + "[graph: %i %i %i]";
    console.log(tpl, this.cid, type, this._canvasRatio, window.pageYOffset, window.pageYOffset, document.documentElement.clientHeight, document.documentElement.scrollTop, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollTop, document.body.scrollHeight, document.body.firstElementChild.clientHeight, document.body.firstElementChild.scrollTop, document.body.firstElementChild.scrollHeight, this.el.clientHeight, this.el.scrollTop, this.el.scrollHeight);
  };

  if (GraphView.prototype._logFlags.split(" ")["view.render"]) {
    // GraphView.prototype._requestRender = _.wrap(CanvasView.prototype._requestRender, function(fn) {
    // 	debouncedLog("%s::_requestRender", this.cid);
    // 	return applyMethod(this, arguments);
    // });
    var debouncedLog = _.debounce(_.bind(console.log, console), 500, true);

    GraphView.prototype._applyRender = _.wrap(CanvasView.prototype._applyRender, function (fn) {
      var retval;
      this._logFlags["view.render"] = false;
      debouncedLog("%s::_applyRender [debounced]", this.cid);
      retval = applyFn(this, arguments);
      this._logFlags["view.render"] = true;
      return retval;
    });
  }
}

module.exports = GraphView;

}).call(this,true,require("underscore"))

},{"app/control/Globals":55,"app/view/base/CanvasView":78,"color":12,"underscore":51,"utils/canvas/CanvasHelper":130,"utils/canvas/calcArcHConnector":138,"utils/geom/inflateRect":144}],93:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/component/GroupingListView
 */

/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("app/view/component/FilterableListView");
/** @type {module:app/view/component/ClickableRenderer} */


var ClickableRenderer = require("app/view/render/ClickableRenderer");
/** @type {module:app/view/render/LabelRenderer} */


var LabelRenderer = require("app/view/render/LabelRenderer"); // /** @type {module:utils/array/difference} */
// var diff = require("utils/array/difference");

/**
 * @constructor
 * @type {module:app/view/component/GroupingListView}
 */


var GroupingListView = FilterableListView.extend({
  /** @type {string} */
  cidPrefix: "groupingList",

  /** @override */
  tagName: "dl",

  /** @override */
  className: "grouped",

  /** @type {Function|null} empty array */
  _groupingFn: null,
  //function() { return null; },

  /** @override */
  defaults: _.defaults({
    // defaults: {
    renderer: ClickableRenderer.extend({
      /** @override */
      cidPrefix: "groupingListItem",

      /** @override */
      tagName: "dl",

      /** @override */
      className: "list-item list-node"
    }),
    groupingRenderer: LabelRenderer.extend({
      /** @override */
      cidPrefix: "groupingListGroup",

      /** @override */
      tagName: "dt",

      /** @override */
      className: "list-group list-node"
    }),
    groupingFn: null // },

  }, FilterableListView.prototype.defaults),
  properties: {
    groups: {
      get: function get() {
        return this._groups;
      }
    },
    filteredGroups: {
      get: function get() {
        return this._filteredGroups;
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    FilterableListView.prototype.initialize.apply(this, arguments);
    this._groups = [];
    this._filteredGroups = [];
    this._changedFilteredGroups = [];
    this._groupsByItemCid = {};
    this._groupingFn = options.groupingFn;
    this.groupingRenderer = options.groupingRenderer;

    this._computeGroups();

    if (this._groupingFn) {
      this._groups.forEach(this.createGroupingView, this);
    }
  },

  /**
   * Called once on collection change
   * @private
   */
  _computeGroups: function _computeGroups() {
    // this._groups = _.uniq(this.collection.map(this._groupingFn, this));
    this._groups.length = 0; // this._groupItems.length = 0;

    if (this._groupingFn) {
      this.collection.forEach(function (item) {
        var gIdx, gObj;
        gObj = this._groupingFn.apply(null, arguments);

        if (gObj) {
          gIdx = this._groups.indexOf(gObj);

          if (gIdx == -1) {
            gIdx = this._groups.length;
            this._groups[gIdx] = gObj; // this._groupItems[gIdx] = [];
          } // this._groupItems[gIdx].push(item);

        }

        this._groupsByItemCid[item.cid] = gObj;
      }, this);
    } else {
      this.collection.forEach(function (item) {
        this._groupsByItemCid[item.cid] = null;
      }, this);
    }
  },

  /** @private Create children views */
  createGroupingView: function createGroupingView(item) {
    var view = new this.groupingRenderer({
      model: item,
      el: this.el.querySelector(".list-group[data-id=\"" + item.id + "\"]")
    });
    this.itemViews.add(view);
    return view;
  },

  /* --------------------------- *
  /* Filter impl 1
  /* --------------------------- */

  /** @override */

  /*
  computeFilter_1: function() {
  	FilterableListView.prototype.computeFilter_1.apply(this, arguments);
  		if (this._groupingFn) {
  		if (this._filteredItems.length == 0) {
  			this._filteredGroups = [];
  		} else {
  			this._filteredGroups = _.uniq(this._filteredItems.map(function(item) {
  				return this._groupsByItemCid[item.cid];
  			}, this));
  		}
  	}
  	// if (this._groupingFn) {
  	// 	if (this._filteredItems.length == 0) {
  	// 		this._filteredGroups = [];
  	// 		this._groups.forEach(function(group) {
  	// 			this.itemViews.findByModel(group).el.classList.remove("excluded");
  	// 		}, this);
  	// 	} else {
  	// 		this._filteredGroups = _.uniq(this._filteredItems.map(function(item) {
  	// 			return this._groupsByItemCid[item.cid];
  	// 		}, this));
  	// 		this._groups.forEach(function(group) {
  	// 			this.itemViews.findByModel(group).el.classList.toggle("excluded", this._filteredGroups.indexOf(group) == -1);
  	// 		}, this);
  	// 	}
  	// }
  },
  */

  /* --------------------------- *
  /* Filter impl 2
  /* --------------------------- */
  // /** @override */
  // renderFilterFn_2: function() {
  // 	FilterableListView.prototype.renderFilterFn_2.apply(this, arguments);
  // },

  /** @override */
  computeFilter: function computeFilter() {
    FilterableListView.prototype.computeFilter.apply(this, arguments);

    if (this._groupingFn) {
      if (this._filteredItems.length == 0) {
        this._filteredGroups = this._groups.concat(); //[];
      } else {
        this._filteredGroups = _.uniq(this._filteredItems.map(function (item) {
          return this._groupsByItemCid[item.cid];
        }, this));
      }
    }
  },

  /** @override */
  applyFilter: function applyFilter() {
    FilterableListView.prototype.applyFilter.apply(this, arguments);

    this._groups.forEach(function (group) {
      this.itemViews.findByModel(group).el.classList.toggle("excluded", this._filteredGroups.indexOf(group) == -1);
    }, this);
  } // computeFiltered: function() {
  // 	FilterableListView.prototype.computeFiltered.apply(this, arguments);
  // },
  //
  // renderFiltered: function() {
  // 	FilterableListView.prototype.renderFiltered.apply(this, arguments);
  // },

});
module.exports = GroupingListView;

}).call(this,require("underscore"))

},{"app/view/component/FilterableListView":91,"app/view/render/ClickableRenderer":106,"app/view/render/LabelRenderer":113,"underscore":51}],94:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/component/PlayToggleSymbol
 */
// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");

/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");
/** @type {Function} */


var Color = require("color");
/** @type {module:utils/canvas/bitmap/stackBlurRGB} */


var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
/** @type {module:utils/canvas/bitmap/getAverageRGB} */


var getAverageRGB = require("utils/canvas/bitmap/getAverageRGB");
/** @type {module:utils/canvas/bitmap/multiply} */


var multiply = require("utils/canvas/bitmap/multiply");
/** @type {module:utils/canvas/bitmap/desaturate} */


var desaturate = require("utils/canvas/bitmap/desaturate");
/** @type {module:utils/canvas/CanvasHelper} */


var roundRect = require("utils/canvas/CanvasHelper").roundRect;
/** @type {module:utils/ease/fn/easeInQuad} */


var easeIn = require("utils/ease/fn/easeInQuad");
/** @type {module:utils/ease/fn/easeOutQuad} */


var easeOut = require("utils/ease/fn/easeOutQuad");

var PI2 = Math.PI * 2;
var LOOP_OFFSET = 1.833333;

var INTEP_MS = require("app/control/Globals").TRANSITION_DURATION;

var FILTER_REFRESH_THRESHOLD = 0.5; //seconds elapsed

var FILTER_SCALE = 1.5;
var FILTER_RADIUS = 30; //pixels

var FILTER_MULTIPLY = 0.1;
var PlayToggleSymbol = {
  PLAY: "playing",
  PAUSE: "paused",
  WAITING: "waiting",
  ENDED: "ended"
};
module.exports = CanvasView.extend({
  /** @type {string} */
  cidPrefix: "playToggleSymbol",

  /** @type {string} */
  className: "play-toggle",
  defaults: {
    values: {
      _loop: 0,
      _arc: 0
    },
    maxValues: {
      _loop: 1
    },
    color: "rgba(255,255,255,1.0)",
    backgroundColor: "rgba(0,0,0,0.25)",
    paused: true,
    symbolName: "" // borderRadius: 3,
    // borderWidth: 3,

  },
  properties: {
    symbolName: {
      get: function get() {
        return this._symbolName;
      },
      set: function set(value) {
        this._setSymbolName(value);
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    // TODO: cleanup options mess in CanvasView
    CanvasView.prototype.initialize.apply(this, arguments);
    this._options = _.extend(this._options, _.pick(options, "symbolName", "borderRadius", "borderWidth"));
    this.symbolName = this._options.symbolName;
  },

  /** @override */
  measureCanvas: function measureCanvas(w, h, s) {
    // make canvas square
    this._canvasHeight = this._canvasWidth = Math.min(w, h);
  },

  /** @override */
  updateCanvas: function updateCanvas(ctx, s) {
    var mObj = this._getFontMetrics(this._fontFamily);

    this._baselineShift = mObj ? (mObj.ascent + mObj.descent) / mObj.unitsPerEm : 0.7; // default value

    this._baselineShift *= this._fontSize * 0.5; // apply to font-size, halve it

    this._baselineShift = Math.round(this._baselineShift);
    this._canvasOffsetX = this._canvasOffsetY = this._canvasWidth / 2; // double SQRT1_2: square within circle within square

    this._radius = this._canvasWidth / 2 * Math.SQRT1_2 * Math.SQRT1_2 * Math.SQRT1_2;
    this._side = this._radius; // * Math.SQRT1_2; // * Math.SQRT1_2;
    // this._borderWidth = this._options.borderWidth * this._canvasRatio;
    // this._borderRadius = this._canvasWidth * this._canvasRatio / 2; //this._options.borderRadius * this._canvasRatio;
    // reset matrix and translate 0,0 to center

    this._ctx.setTransform(1, 0, 0, 1, this._canvasOffsetX, this._canvasOffsetY); // this._ctx.restore();
    // this._ctx.textBaseline = "middle";


    this._ctx.lineWidth = this._radius * (1 - Math.SQRT1_2); // this._ctx.fillStyle = "#FFF";

    this._ctx.shadowColor = "rgba(0,0,0,0.75)";
    this._ctx.shadowBlur = 1;
    this._ctx.shadowOffsetX = 2;
    this._ctx.shadowOffsetY = 2; // this._ctx.save();

    this._isImageDataInvalid = true; //console.log("%s::updateCanvas %s", this.cid, this._backgroundColor);
  },

  /* --------------------------- *
   * symbolName
   * --------------------------- */
  _symbolName: "",
  _setSymbolName: function _setSymbolName(value) {
    if (this._symbolName !== value) {
      this._lastSymbolName = this._symbolName;
      this._symbolName = value;
      this.refreshImageSource();
      this.requestRender(CanvasView.LAYOUT_INVALID);
      console.log("%s::[set] symbol %o (from %o)", this.attached ? this.parentView.cid : this.cid, this._symbolName, this._lastSymbolName, this.paused ? "paused" : "");
    }
  },

  /* --------------------------- *
   * setImageSource/refreshImageSource
   * --------------------------- */
  _imageSource: null,
  setImageSource: function setImageSource(imageSource) {
    if (this._imageSource !== imageSource) {
      this._imageSource = imageSource;
      this._isImageDataInvalid = true;
      this.requestRender(CanvasView.SIZE_INVALID);
    }
  },
  _imageDataTC: null,
  refreshImageSource: function refreshImageSource(threshold) {
    if (this._isImageDataInvalid || !(this._imageSource instanceof HTMLVideoElement)) {
      return; // data is marked for refresh already, or not a video
    }

    if (!_.isNumber(threshold)) {
      threshold = FILTER_REFRESH_THRESHOLD;
    }

    if (threshold < Math.abs(this._imageDataTC - this._imageSource.currentTime)) {
      this._isImageDataInvalid = true;
      this.requestRender(CanvasView.SIZE_INVALID);
    }
  },
  _imageData: null,
  _updateImageData: function _updateImageData() {
    if (this._imageSource === null) {
      this._imageData = null;
      this._imageDataTC = null;
      return;
    } // source scale, source rect, dest scale, dest rect, current timecode


    var s, sr, d, dr, tc; // Get source/dest offsets, intrinsic scale and timecode
    // ---------------------------------

    sr = this._imageSource.getBoundingClientRect();
    dr = this.el.getBoundingClientRect();

    if (this._imageSource instanceof HTMLVideoElement) {
      s = this._imageSource.videoWidth / sr.width;
      tc = this._imageSource.currentTime;
    } else {
      s = this._imageSource.naturalWidth / sr.width;
      tc = 0;
    }

    d = s * FILTER_SCALE; // draw source canvas maintaining position
    // ---------------------------------

    this._ctx.save();

    this._ctx.setTransform(1, 0, 0, 1, 0, 0);

    this._ctx.drawImage(this._imageSource, (dr.left - sr.left) * s + dr.width / 2 * s - dr.width / 2 * d, (dr.top - sr.top) * s + dr.height / 2 * s - dr.height / 2 * d, dr.width * d, dr.height * d, 0, 0, this.el.width, this.el.height); // if (d == s)
    // this._ctx.drawImage(this._imageSource,
    // 	(dr.left - sr.left) * s, (dr.top - sr.top) * s,
    // 	dr.width * s, dr.height * s,
    // 	0, 0, this.el.width, this.el.height
    // );
    // get ImageData
    // find luminosity threshold form average color
    // ---------------------------------


    var imgdata, isDark;
    imgdata = this._ctx.getImageData(0, 0, this.el.width, this.el.height); // isDark = !Color().rgb(getAverageRGB(imgdata)).dark();
    // this._ctx.globalCompositeOperation = "luminosity";
    // this._ctx.globalAlpha = 0.25;
    // this._ctx.fillStyle = (isDark ? "black" : "white");
    // this._ctx.fillRect(0, 0, this.el.width, this.el.height);

    this._ctx.clearRect(0, 0, this.el.width, this.el.height);

    this._ctx.restore(); // Store appropiate color values
    // ---------------------------------


    this._color = isDark ? "white" : "black"; // this._color = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)";
    // this._backgroundColor = isDark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.74)";
    // this.el.style.color =
    // 	this._ctx.fillStyle =
    // 	this._ctx.strokeStyle =
    // 	this._color;
    // this.el.style.backgroundColor =
    // 	this._ctx.shadowColor =
    // 	this._backgroundColor;
    // this.el.classList.toggle("lod", isDark);
    // this.el.classList.toggle("dol", !isDark);
    // Apply filters and save results
    // ---------------------------------
    // imgdata = this._ctx.getImageData(0, 0, this.el.width, this.el.height);
    // imgdata = multiply(imgdata, (isDark ? 1 - FILTER_MULTIPLY : 1 + FILTER_MULTIPLY));
    // imgdata = desaturate(imgdata, 0.5);

    imgdata = multiply(imgdata, 1 + FILTER_MULTIPLY);
    imgdata = stackBlurRGB(imgdata, FILTER_RADIUS); // imgdata = null;

    this._imageData = imgdata;
    this._imageDataTC = tc;
  },

  /** @override */
  redraw: function redraw(ctx, intrp, flags) {
    this._clearCanvas();

    if (this._symbolName === 'waiting') {
      if (intrp.getTargetValue('_arc') === 0) {
        intrp.valueTo('_arc', 1, 0 * INTEP_MS, easeIn).updateValue('_arc');
      }
    } else {
      if (intrp.getTargetValue('_arc') === 1) {
        intrp.valueTo('_arc', 0, 0 * INTEP_MS, easeOut).updateValue('_arc');
      }
    }

    var a = intrp.getRenderedValue("_arc"); // while arc is > 0, loop indefinitely while spinning and restart
    // if at end. Otherwise let interp exhaust arc duration

    if (a > 0) {
      if (!intrp.paused && intrp.isAtTarget('_loop')) {
        // console.log("%s::redraw [loop]", this.cid, this.parentView.cid);
        intrp.valueTo('_loop', 0, 0).valueTo('_loop', 1, 2 * INTEP_MS).updateValue('_loop');
      }
    }

    var l = intrp.getRenderedValue("_loop"); // if (this._isImageDataInvalid) {
    // 	this._isImageDataInvalid = false;
    // 	this._updateImageData();
    // }
    // if (this._imageData !== null) {
    // 	ctx.putImageData(this._imageData, 0, 0);
    // }
    // always render while arc is > 0

    if (a > 0) {
      // arc span bounce
      var b = (l < 0.5 ? l % 0.5 : 0.5 - l % 0.5) * 2; // bounce + main arc span

      var aa = a * b * 0.25 + a * 0.125 + .0001; // rotation loop

      var ll = l + LOOP_OFFSET;
      ctx.beginPath();
      ctx.arc(0, 0, this._radius, (1 - aa + ll) * PI2, (aa + ll) * PI2, false);
      ctx.stroke();
    }

    switch (this._symbolName) {
      case "replay":
      case "ended":
      case "play":
        // this.drawPlay(ctx, (1 - a) * s);
        this.drawPlay(ctx, this._side);
        ctx.fill();
        break;

      case "pause":
        // this.drawPause(ctx, (1 - a) * s);
        this.drawPause(ctx, this._side);
        ctx.fill();
        break;

      case "waiting":
        switch (this._lastSymbolName) {
          case "replay":
          case "ended":
          case "play":
            this.drawPlay(ctx, (1 - a) * this._side);
            ctx.fill();
            break;

          case "pause":
            this.drawPause(ctx, (1 - a) * this._side);
            ctx.fill();
            break;

          default:
            break;
        }

        break;

      default:
        break;
    }
  },
  drawPlay: function drawPlay(ctx, r) {
    var tx = (1 - Math.SQRT1_2) * r;
    ctx.beginPath();
    ctx.moveTo(tx + r, 0);
    ctx.lineTo(tx - r, -r);
    ctx.lineTo(tx - r, r);
    ctx.closePath();
  },
  drawPause: function drawPause(ctx, r) {
    var w = r * 0.75;
    var h = r * 2;
    ctx.beginPath();
    ctx.rect(-r, -r, w, h);
    ctx.rect(r - w, -r, w, h);
    ctx.closePath();
  },
  drawLabel: function drawLabel(labelString) {
    var labelWidth = this._ctx.measureText(labelString).width;

    this._ctx.fillText(labelString, labelWidth * -0.5, // 0, labelWidth);
    this._baselineShift, labelWidth);
  }
}, PlayToggleSymbol);

}).call(this,require("underscore"))

},{"app/control/Globals":55,"app/view/base/CanvasView":78,"color":12,"underscore":51,"utils/canvas/CanvasHelper":130,"utils/canvas/bitmap/desaturate":132,"utils/canvas/bitmap/getAverageRGB":133,"utils/canvas/bitmap/multiply":135,"utils/canvas/bitmap/stackBlurRGB":137,"utils/ease/fn/easeInQuad":140,"utils/ease/fn/easeOutQuad":141}],95:[function(require,module,exports){
"use strict";

/**
 * @module app/view/component/SelectableListView
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:backbone.babysitter} */


var Container = require("backbone.babysitter");
/** @type {module:app/view/component/DefaultSelectableRenderer} */


var DefaultSelectableRenderer = require("app/view/render/DefaultSelectableRenderer");
/** @type {module:app/view/component/ClickableRenderer} */


var ClickableRenderer = require("app/view/render/ClickableRenderer");

var SelectableListView = View.extend({
  /** @type {string} */
  cidPrefix: "selectableList",

  /** @override */
  tagName: "ul",

  /** @override */
  className: "list selectable",

  /** @type {module:app/view/component/DefaultSelectableRenderer} */
  renderer: DefaultSelectableRenderer,

  /** @override */
  initialize: function initialize(options) {
    this._enabled = true;
    this._childrenInvalid = true;
    options.renderer && (this.renderer = options.renderer);
    this.showEmpty = !!options.showEmpty;
    this.itemViews = new Container();
    this.listenTo(this.collection, "add remove reset", this._onCollectionChange);
  },

  /** @override */
  remove: function remove() {
    this.removeChildren();
    View.prototype.remove.apply(this, arguments);
    return this;
  },
  _onCollectionChange: function _onCollectionChange(ev) {
    this._childrenInvalid = true;
    this.render();
  },

  /** @override */
  render: function render() {
    if (this._childrenInvalid) {
      this._childrenInvalid = false;
      this.createChildren();
    }

    return this;
  },

  /** @override */
  setEnabled: function setEnabled(enabled) {
    if (this._enabled !== enabled) {
      this._enabled = enabled;
      this.el.classList.toggle("disabled", !this._enabled);
    }
  },

  /* --------------------------- *
  /* Child views
  /* --------------------------- */
  createChildren: function createChildren() {
    var eltBuffer, view;
    this.removeChildren();
    this.el.innerHTML = "";

    if (this.collection.length) {
      eltBuffer = document.createDocumentFragment();

      if (this.showEmpty) {
        view = this.createEmptyView();
        eltBuffer.appendChild(view.render().el);
      }

      this.collection.each(function (model, index, arr) {
        view = this.createItemView(model, index);
        eltBuffer.appendChild(view.render().el);
      }, this);
      this.el.appendChild(eltBuffer);
    }
  },
  createItemView: function createItemView(model, index) {
    var view = new this.renderer({
      model: model
    });
    this.itemViews.add(view);
    this.listenTo(view, "renderer:click", this.onItemViewClick);
    return view;
  },
  removeChildren: function removeChildren() {
    this.itemViews.each(this.removeItemView, this);
  },
  removeItemView: function removeItemView(view) {
    this.stopListening(view);
    this.itemViews.remove(view);
    view.remove();
    return view;
  },

  /* --------------------------- *
  /* Child event handlers
  /* --------------------------- */

  /** @private */
  onItemViewClick: function onItemViewClick(item) {
    if (this.collection.selected !== item && this._enabled) {
      this.trigger("view:select:one", item);
    }
  },

  /* --------------------------- *
  /* Empty view
  /* --------------------------- */
  createEmptyView: function createEmptyView() {
    var view = new SelectableListView.EmptyRenderer({
      model: this.collection
    });
    this.itemViews.add(view);
    this.listenTo(view, "renderer:click", function () {
      this._enabled && this.trigger("view:select:none");
    });
    return view;
  }
}, {
  EmptyRenderer: ClickableRenderer.extend({
    /** @override */
    tagName: "li",

    /** @override */
    className: "list-item empty-item",

    /** @override */
    initialize: function initialize(options) {
      this.listenTo(this.model, "selected deselected", this.renderClassList);
      this.renderClassList();
    },

    /** @override */
    render: function render() {
      this.el.innerHTML = "<a href=\"#clear\"><b> </b></a>";
      this.renderClassList();
      return this;
    },
    renderClassList: function renderClassList() {
      this.el.classList.toggle("selected", this.model.selectedIndex === -1);
    }
  })
});
module.exports = SelectableListView;

},{"app/view/base/View":82,"app/view/render/ClickableRenderer":106,"app/view/render/DefaultSelectableRenderer":108,"backbone.babysitter":3}],96:[function(require,module,exports){
(function (_){
"use strict";

/** @type {Function} */
var Color = require("color");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection"); // - - - - - - - - - - - - - - - -
//  utils
// - - - - - - - - - - - - - - - -


function insertCSSRule(sheet, selector, style) {
  var cssText = "";

  for (var prop in style) {
    cssText += prop + ":" + style[prop] + ";";
  }

  sheet.insertRule(selector + "{" + cssText + "}", sheet.cssRules.length);
}

function selfAndDescendant(selfCls, cls) {
  return selfCls + " " + cls + ", " + selfCls + cls;
} // - - - - - - - - - - - - - - - -
//  root rules
// - - - - - - - - - - - - - - - -


var rootStyles = ["color", "background", "background-color"];

function initRootStyles(sheet, rootSelector, attrs, fgColor, bgColor, lnColor, hasDarkBg) {
  var s, revSelector, fgColorVal, bgColorVal; // var revFgColorVal, revBgColorVal;

  s = _.pick(attrs, rootStyles); // s["-webkit-font-smoothing"] = (hasDarkBg ? "antialiased" : "auto");

  /* NOTE: In Firefox '-moz-osx-font-smoothing: grayscale;'
  /* works both in light over dark and dark over light, hardcoded in _base.scss */
  //s["-moz-osx-font-smoothing"] = (hasDarkBg? "grayscale" : "auto");

  insertCSSRule(sheet, rootSelector, s); // A element
  // - - - - - - - - - - - - - - - -

  s = {};
  s["color"] = lnColor.rgb().string();
  insertCSSRule(sheet, rootSelector + " a", s);
  insertCSSRule(sheet, rootSelector + " .color-ln", s); // .color-fg05
  // - - - - - - - - - - - - - - - -

  s = {};
  s["color"] = Color(fgColor).mix(bgColor, 0.5).rgb().string();
  s["border-color"] = Color(fgColor).mix(bgColor, 0.3).rgb().string();
  insertCSSRule(sheet, rootSelector + " .color-fg05", s);
  fgColorVal = fgColor.rgb().string();
  bgColorVal = bgColor.rgb().string(); // revFgColorVal = Color(bgColor).mix(fgColor, 0.9).rgb().string();
  // revBgColorVal = Color(fgColor).mix(bgColor, 0.6).rgb().string();

  revSelector = rootSelector + " .color-reverse"; // .color-fg .color-bg
  // - - - - - - - - - - - - - - - -

  s = {
    "color": fgColorVal
  };
  insertCSSRule(sheet, rootSelector + " .color-fg", s);
  s = {
    "background-color": bgColorVal
  };
  insertCSSRule(sheet, rootSelector + " .color-bg", s); // html inverted text/background

  s = {
    "color": bgColorVal
  }; // s = { "color" : revFgColorVal };
  // s["-webkit-font-smoothing"] = (hasDarkBg ? "auto" : "antialiased");
  // insertCSSRule(sheet, revSelector + " .color-fg", s);
  // insertCSSRule(sheet, revSelector + ".color-fg", s);

  insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-fg"), s);
  s = {
    "background-color": fgColorVal
  }; // s = { "background-color" : revBgColorVal };
  // insertCSSRule(sheet, revSelector + " .color-bg", s);
  // insertCSSRule(sheet, revSelector + ".color-bg", s);

  insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-bg"), s); // .color-stroke .color-fill (SVG)
  // - - - - - - - - - - - - - - - -

  s = {
    "stroke": fgColorVal
  };
  insertCSSRule(sheet, rootSelector + " .color-stroke", s);
  s = {
    "fill": bgColorVal
  };
  insertCSSRule(sheet, rootSelector + " .color-fill", s); // svg inverted fill/stroke

  s = {
    "stroke": bgColorVal
  }; // insertCSSRule(sheet, revSelector + " .color-stroke", s);
  // insertCSSRule(sheet, revSelector + ".color-stroke", s);

  insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-stroke"), s);
  s = {
    "fill": fgColorVal
  }; // insertCSSRule(sheet, revSelector + " .color-fill", s);
  // insertCSSRule(sheet, revSelector + ".color-fill", s);

  insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-fill"), s); // .text-outline
  // - - - - - - - - - - - - - - - -
  // s = {
  // 	"text-shadow": "-1px -1px 0 " + bgColorVal +
  // 		", 1px -1px 0 " + bgColorVal +
  // 		", -1px 1px 0 " + bgColorVal +
  // 		", 1px 1px 0 " + bgColorVal
  // };
  // insertCSSRule(sheet, rootSelector + " :not(..collapsed-changing) .text-outline-bg", s);
} // - - - - - - - - - - - - - - - -
// carousel styles
// - - - - - - - - - - - - - - - -


var carouselStyles = ["box-shadow", "border", "border-radius"];

function initCarouselStyles(sheet, carouselSelector, attrs, fgColor, bgColor, lnColor, hasDarkBg) {
  var s = _.pick(attrs, carouselStyles); //, "background-color"]);


  insertCSSRule(sheet, carouselSelector + " .media-item .content", s); // .media-item .color-bg09
  // - - - - - - - - - - - - - - - -

  s = {};
  s["background-color"] = Color(bgColor).mix(fgColor, 0.05).rgb().string(); // s["background-color"] = Color(bgColor)[hasDarkBg ? "darken" : "lighten"](0.045).rgb().string();
  // s["background-color"] = Color(bgColor)[hasDarkBg ? "lighten" : "darken"](0.03).rgb().string();

  insertCSSRule(sheet, carouselSelector + " .media-item .color-bg09", s); // .media-item .placeholder
  // - - - - - - - - - - - - - - - -

  s = {}; // s["-webkit-font-smoothing"] = (hasDarkBg ? "auto" : "antialiased");
  // text color luminosity is inverse from body, apply oposite rendering mode

  s["color"] = bgColor.rgb().string(); // s["color"] = Color(bgColor)[hasDarkBg ? "darken" : "lighten"](0.045).rgb().string();

  s["background-color"] = Color(bgColor).mix(fgColor, 0.05).rgb().string(); // s["background-color"] = Color(bgColor).mix(fgColor, 0.8).alpha(0.3).rgba().string();
  // s["background-color"] = Color(bgColor)[hasDarkBg ? "lighten" : "darken"](0.03).rgb().string();

  "border-radius" in attrs && (s["border-radius"] = attrs["border-radius"]);
  insertCSSRule(sheet, carouselSelector + " .media-item .placeholder", s); // .empty-item A
  // - - - - - - - - - - - - - - - -

  s = {};
  s["text-decoration-color"] = Color(fgColor).mix(bgColor, 0.7).rgb().string();
  insertCSSRule(sheet, carouselSelector + " .empty-item A", s); // // .color-gradient
  // // - - - - - - - - - - - - - - - -
  // s = {};
  // s["background-color"] = "transparent";
  // s["background"] = "linear-gradient(to bottom, " +
  // 		Color(bgColor).alpha(0.00).rgba().string() + " 0%, " +
  // 		Color(bgColor).alpha(0.11).rgba().string() + " 100%)";
  // insertCSSRule(sheet, rootSelector + " .color-gradient", s);
  // s = {};
  // s["background-color"] = "transparent";
  // s["background"] = "linear-gradient(to bottom, " +
  // 		Color(fgColor).alpha(0.00).rgba().string() + " 0%, " +
  // 		Color(fgColor).alpha(0.11).rgba().string() + " 100%)";
  // insertCSSRule(sheet, revSelector + " .color-gradient", s);
  // insertCSSRule(sheet, revSelector + ".color-gradient", s);
}

module.exports = function () {
  var attrs, fgColor, bgColor, lnColor, hasDarkBg;
  attrs = Globals.DEFAULT_COLORS;
  fgColor = new Color(Globals.DEFAULT_COLORS["color"]);
  bgColor = new Color(Globals.DEFAULT_COLORS["background-color"]);
  lnColor = new Color(Globals.DEFAULT_COLORS["link-color"]);
  hasDarkBg = fgColor.luminosity() > bgColor.luminosity();
  var colorStyles = document.createElement("style");
  colorStyles.id = "colors";
  colorStyles.type = "text/css";
  document.head.appendChild(colorStyles); // var colorStyles = document.querySelector("link#folio");

  initRootStyles(colorStyles.sheet, ".app", attrs, fgColor, bgColor, lnColor, hasDarkBg);
  initCarouselStyles(colorStyles.sheet, ".carousel", attrs, fgColor, bgColor, lnColor, hasDarkBg); // - - - - - - - - - - - - - - - -
  // per-bundle rules
  // - - - - - - - - - - - - - - - -

  bundles.each(function (bundle) {
    attrs = bundle.attrs(); //get("attrs");

    fgColor = bundle.colors.fgColor;
    bgColor = bundle.colors.bgColor;
    lnColor = bundle.colors.lnColor;
    hasDarkBg = bundle.colors.hasDarkBg;
    initRootStyles(colorStyles.sheet, ".app." + bundle.get("domid"), attrs, fgColor, bgColor, lnColor, hasDarkBg);
    initCarouselStyles(colorStyles.sheet, ".carousel." + bundle.get("domid"), attrs, fgColor, bgColor, lnColor, hasDarkBg);
  });
};

}).call(this,require("underscore"))

},{"app/control/Globals":55,"app/model/collection/BundleCollection":64,"color":12,"underscore":51}],97:[function(require,module,exports){
"use strict";

/*global XMLHttpRequest */
// /** @type {module:underscore.string/lpad} */
// var classify = require("underscore.string/classify");
// var statusMsg = _.template("<%= status %> received from <%= url %> (<%= statusText %>)");
// var errMsg = _.template("'<%= errName %>' ocurred during request <%= url %>");
if (window.XMLHttpRequest && window.URL && window.Blob) {
  module.exports = function (url, progressFn) {
    return new Promise(function (resolve, reject) {
      var request = new XMLHttpRequest();
      request.open("GET", url, true); // request.timeout = 10000; // in milliseconds

      request.responseType = "blob";

      var errorFromEvent = function errorFromEvent(ev) {
        var err = new Error((ev.target.status > 0 ? "http_" + request.statusText.replace(/\s/g, "_") : ev.type + "_event").toUpperCase());
        err.infoCode = ev.target.status;
        err.infoSrc = url;
        err.logEvent = ev;
        err.logMessage = "_loadImageAsObjectURL::" + ev.type + " [reject]";
        return err;
      }; // if progressFn is supplied
      // - - - - - - - - - - - - - - - - - -


      if (progressFn) {
        request.onprogress = function (ev) {
          progressFn(ev.loaded / ev.total, request);
        };
      } // resolved/success
      // - - - - - - - - - - - - - - - - - -


      request.onload = function (ev) {
        // When the request loads, check whether it was successful
        if (request.status == 200) {
          // If successful, resolve the promise by passing back a reference url
          resolve(URL.createObjectURL(request.response));
        } else {
          reject(errorFromEvent(ev));
        }
      }; // normal abort
      // - - - - - - - - - - - - - - - - - -


      request.onabort = function (ev) {
        resolve(void 0);
      }; // reject/failure
      // - - - - - - - - - - - - - - - - - -


      request.onerror = function (ev) {
        reject(errorFromEvent(ev));
      };

      request.ontimeout = request.onerror; // finally
      // - - - - - - - - - - - - - - - - - -

      request.onloadend = function (ev) {
        //console.log("_loadImageAsObjectURL::%s [cleanup] (%s)", ev ? ev.type : "no event", url);
        request.onabort = request.ontimeout = request.onerror = void 0;
        request.onload = request.onloadend = void 0;

        if (progressFn) {
          request.onprogress = void 0;
        }
      };

      request.send();
    });
  };
} else {
  module.exports = function (url, progressFn) {
    return Promise.resolve(url);
  };
}

},{}],98:[function(require,module,exports){
"use strict";

module.exports = function (image, resolveEmpty) {
  return new Promise(function (resolve, reject) {
    if (!(image instanceof window.HTMLImageElement)) {
      //reject(new Error("not an HTMLImageElement"));
      reject("Error: not an HTMLImageElement");
    } else if (image.complete && (image.src.length > 0 || resolveEmpty)) {
      // if (image.src === "") console.warn("_whenImageLoads resolved with empty src");
      // else console.log("_whenImageLoads resolve-sync", image.src);
      resolve(image);
    } else {
      var handlers = {
        load: function load(ev) {
          // console.log("_whenImageLoads_dom resolve-async", ev.type, image.src);
          removeEventListeners();
          resolve(image);
        },
        error: function error(ev) {
          var err = new Error("Loading failed (" + ev.type + " event)");
          err.infoCode = -1;
          err.infoSrc = image.src;
          err.logEvent = ev;
          err.logMessage = "_whenImageLoads::" + ev.type + " [reject]";
          removeEventListeners();
          reject(err);
        }
      };
      handlers.abort = handlers.error;

      var removeEventListeners = function removeEventListeners() {
        for (var event in handlers) {
          if (handlers.hasOwnProperty(event)) {
            image.removeEventListener(event, handlers[event], false);
          }
        }
      };

      for (var event in handlers) {
        if (handlers.hasOwnProperty(event)) {
          image.addEventListener(event, handlers[event], false);
        }
      }
    }
  });
};

},{}],99:[function(require,module,exports){
(function (_){
"use strict";

/** @type {module:app/view/promise/_whenImageLoads} */
var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */


var _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL"); // var isBlobRE = /^blob\:.*/;
// var logMessage = "%s::whenDefaultImageLoads [%s]: %s";


module.exports = function (view) {
  return new Promise(function (resolve, reject) {
    var source = view.model.get("source");

    if (source.has("prefetched")) {
      view.defaultImage.src = source.get("prefetched");

      _whenImageLoads(view.defaultImage).then(function (targetEl) {
        // console.log(logMessage, view.cid, "resolved", "prefetched");
        resolve(view);
      });
    } else {
      view.mediaState = "pending";
      var sUrl = source.get("original");

      var progressFn = function progressFn(progress, ev) {
        // console.log(logMessage, view.cid, "progress", progress);
        view.updateMediaProgress(progress, sUrl);
      };

      progressFn = _.throttle(progressFn, 100, {
        leading: true,
        trailing: false
      });

      _loadImageAsObjectURL(sUrl, progressFn).then(function (url) {
        if (/^blob\:.*/.test(url)) {
          source.set("prefetched", url);
        }

        view.defaultImage.src = url; // URL.revokeObjectURL(url);

        return view.defaultImage;
      }).then(_whenImageLoads).then(function (targetEl) {
        // console.log(logMessage, view.cid, "resolved", targetEl.src);
        view.on("view:removed", function () {
          var prefetched = source.get("prefetched");

          if (prefetched && /^blob\:/.test(prefetched)) {
            source.unset("prefetched", {
              silent: true
            });
            URL.revokeObjectURL(prefetched);
          }
        }); // view.placeholder.removeAttribute("data-progress");
        // view.updateMediaProgress(imageUrl, "complete");

        resolve(view);
      }, // 	})
      // .catch(
      function (err) {
        // console.warn(logMessage, view.cid, "rejected", err.message);
        // view.placeholder.removeAttribute("data-progress");
        // view.updateMediaProgress(imageUrl, progress);
        reject(err);
      });
    }
  });
};

}).call(this,require("underscore"))

},{"app/view/promise/_loadImageAsObjectURL":97,"app/view/promise/_whenImageLoads":98,"underscore":51}],100:[function(require,module,exports){
"use strict";

/* global Promise */

/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError");
/** @type {module:app/view/base/ViewError} */


var whenViewIsAttached = require("app/view/promise/whenViewIsAttached");

function whenScrollingEnds(view) {
  return new Promise(function (resolve, reject) {
    var parent = view.parentView;

    if (parent === null) {
      console.error("%s::whenScrollingEnds [%s] (sync)", view.cid, "rejected", view.attached);
      reject(new ViewError(view, new Error("whenScrollingEnds: view has no parent")));
    } else if (!parent.scrolling) {
      // console.log("%s::whenScrollingEnds [%s] (sync)", view.cid, "resolved", view.attached);
      resolve(view);
    } else {
      var cleanup = function cleanup() {
        parent.off("view:scrollend", onScrollend);
        parent.off("view:remove", onRemove);
      };

      var onScrollend = function onScrollend() {
        // console.log("%s::whenScrollingEnds [%s]", view.cid, "resolved", view.attached);
        cleanup();
        resolve(view);
      };

      var onRemove = function onRemove() {
        // console.log("%s::whenScrollingEnds [%s]", view.cid, "rejected", view.attached);
        cleanup();
        reject(new ViewError(view, new Error("whenScrollingEnds: view was removed")));
      };

      parent.on("view:scrollend", onScrollend);
      parent.on("view:remove", onRemove);
    }
  });
}

module.exports = function (view) {
  return Promise.resolve(view).then(whenViewIsAttached).then(whenScrollingEnds);
};
/*
module.exports = function(view) {
	return Promise.resolve(view)
		.then(function(view) {
			if (view.attached) {
				return view;
			} else {
				return new Promise(function(resolve, reject) {
					view.once("view:attached", function(view) {
						resolve(view);
					});
				});
			}
		})
		.then(function(view) {
			if (!view.parentView.scrolling) {
				return view;
			} else {
				return new Promise(function(resolve, reject) {
					var resolveOnScrollend = function() {
						// console.log("%s::whenScrollingEnds [%s]", view.cid, "resolved");
						view.off("view:remove", rejectOnRemove);
						resolve(view);
					};
					var rejectOnRemove = function(view) {
						// console.log("%s::whenScrollingEnds [%s]", view.cid, "rejected");
						view.parentView.off("view:scrollend", resolveOnScrollend);
						reject(new ViewError(view,
							new Error("whenSelectScrollingEnds: view was removed ("+ view.cid +")")));
					};
					view.parentView.once("view:scrollend", resolveOnScrollend);
					view.once("view:remove", rejectOnRemove);
				});
			}
		});
};
*/

},{"app/view/base/ViewError":83,"app/view/promise/whenViewIsAttached":103}],101:[function(require,module,exports){
"use strict";

/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError"); // var logMessage = "%s::whenSelectionDistanceIs [%s]: %s";

/**
 * @param {module:app/view/base/View}
 * @param {number} distance
 */


module.exports = function (view, distance) {
  return new Promise(function (resolve, reject) {
    // if (!(view.model && view.model.collection)) {
    // 	reject(new ViewError(view, new Error("whenSelectionIsContiguous: model.collection is empty")));
    // }
    var model = view.model;
    var collection = model.collection;

    var check = function check(n) {
      // Check indices for contiguity
      return Math.abs(collection.indexOf(model) - collection.selectedIndex) <= distance;
    };

    if (check()) {
      // console.log(logMessage, view.cid, "resolve", "sync");
      resolve(view);
    } else {
      var cleanupOnSettle = function cleanupOnSettle() {
        // console.log(logMessage, view.cid, "cleanup", "async");
        collection.off("select:one select:none", resolveOnSelect);
        view.off("view:removed", rejectOnRemove);
      };

      var resolveOnSelect = function resolveOnSelect(model) {
        if (check()) {
          // console.log(logMessage, view.cid, "resolve", "async");
          cleanupOnSettle();
          resolve(view);
        }
      };

      var rejectOnRemove = function rejectOnRemove(view) {
        cleanupOnSettle();
        reject(new ViewError(view, new Error("whenSelectionDistanceIs: view was removed")));
      };

      collection.on("select:one select:none", resolveOnSelect);
      view.on("view:removed", rejectOnRemove);
    }
  });
};

},{"app/view/base/ViewError":83}],102:[function(require,module,exports){
"use strict";

// /** @type {module:app/view/base/ViewError} */
// var ViewError = require("app/view/base/ViewError");

/** @type {module:app/view/promise/whenSelectionDistanceIs} */
var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");
/** @param {module:app/view/base/View} */


module.exports = function (view) {
  return whenSelectionDistanceIs(view, 1);
};

},{"app/view/promise/whenSelectionDistanceIs":101}],103:[function(require,module,exports){
"use strict";

module.exports = function (view) {
  return new Promise(function (resolve, reject) {
    if (view.attached) {
      resolve(view);
    } else {
      view.on("view:attached", function (view) {
        resolve(view);
      });
    }
  });
};

},{}],104:[function(require,module,exports){
"use strict";

module.exports = function (view) {
  return new Promise(function (resolve, reject) {
    if (!view.invalidated) {
      resolve(view);
    } else {
      view.once("view:render:after", function (view, flags) {
        resolve(view);
      });
    }
  });
};

},{}],105:[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/render/CarouselRenderer
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:underscore} */


var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles"); // FIXME: this fixup should not be done here
// /** @type {module:utils/net/toAbsoluteURL} */
// var toAbsoluteURL = require("utils/net/toAbsoluteURL");
// /** @type {string} */
// var ABS_APP_ROOT = toAbsoluteURL(require("app/control/Globals").APP_ROOT);

/**
 * @constructor
 * @type {module:app/view/render/CarouselRenderer}
 */


var CarouselRenderer = View.extend({
  /** @type {string} */
  cidPrefix: "carouselRenderer",

  /** @override */
  tagName: "div",

  /** @override */
  className: "carousel-item",

  /** @override */
  template: _.template("<div class=\"content sizing\"><%= name %></div>"),
  properties: {
    content: {
      get: function get() {
        return this._content || (this._content = this.el.querySelector(".content"));
      }
    },
    sizing: {
      get: function get() {
        return this._sizing || (this._sizing = this.el.querySelector(".sizing"));
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    if (this.model.attr("@classname") !== void 0) {
      var clsAttr = this.model.attr("@classname").split(" ");

      for (var i = 0; i < clsAttr.length; i++) {
        this.el.classList.add(clsAttr[i]);
      }
    }

    options.parentView && (this.parentView = options.parentView);
    this.metrics = {};
    this.metrics.content = {};
    this.createChildren(); // this.enabled = !!options.enabled; // force bool

    this.setEnabled(!!options.enabled);
  },
  createChildren: function createChildren() {
    this.el.innerHTML = this.template(this.model.toJSON()); // FIXME: this fixup should not be done here
    // FIXED: now done in xslt

    /*this.el.querySelectorAll("a[href]").forEach(function(el) {
    	var url = toAbsoluteURL(el.getAttribute("href"));
    	if (url.indexOf(ABS_APP_ROOT) !== 0) {
    		el.setAttribute("target", "_blank");
    	}
    });*/
  },

  /** @return {HTMLElement} */
  getSizingEl: function getSizingEl() {
    return this._sizing || (this._sizing = this.el.querySelector(".sizing"));
  },

  /** @return {HTMLElement} */
  getContentEl: function getContentEl() {
    return this._content || (this._content = this.el.querySelector(".content"));
  },

  /** @return {this} */
  measure: function measure() {
    var sizing = this.getSizingEl();
    this.metrics = getBoxEdgeStyles(this.el, this.metrics);
    this.metrics.content = getBoxEdgeStyles(this.getContentEl(), this.metrics.content);
    sizing.style.maxWidth = "";
    sizing.style.maxHeight = "";
    this.metrics.content.x = sizing.offsetLeft + sizing.clientLeft;
    this.metrics.content.y = sizing.offsetTop + sizing.clientTop;
    this.metrics.content.width = sizing.clientWidth;
    this.metrics.content.height = sizing.clientHeight;
    return this;
  },

  /** @override */
  render: function render() {
    this.measure();
    return this;
  },
  getSelectionDistance: function getSelectionDistance() {
    return Math.abs(this.model.collection.indexOf(this.model) - this.model.collection.selectedIndex);
  }
});
module.exports = CarouselRenderer;

}).call(this,require("underscore"))

},{"app/view/base/View":82,"underscore":51,"utils/css/getBoxEdgeStyles":139}],106:[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/ClickableRenderer
 */

/** @type {module:app/view/render/LabelRenderer} */
var LabelRenderer = require("app/view/render/LabelRenderer");
/**
 * @constructor
 * @type {module:app/view/render/ClickableRenderer}
 */


var ClickableRenderer = LabelRenderer.extend({
  /** @type {string} */
  cidPrefix: "clickableRenderer",
  // defaults: {
  // 	target: ".label"
  // },

  /** @override */
  events: {
    "click .label": function clickLabel(ev) {
      if (ev.defaultPrevented) return;
      ev.preventDefault();
      this.trigger("renderer:click", this.model, ev);
    },
    "click a": function clickA(ev) {
      ev.defaultPrevented || ev.preventDefault();
    }
  } // initialize: function(options) {
  // 	options || (options = {});
  // 	// if (options) {
  // 	options = _.defaults({}, options, _.result(this, 'defaults'));
  // 	// } else {
  // 	// 	 _.defaults({}, _.result(this, 'defaults'));
  // 	// }
  // 	this.events["click " + options.target] = this.clickHandler;
  // },
  //
  // clickHandler: function(ev) {
  // 	if (ev.defaultPrevented) return;
  //
  // 	ev.preventDefault();
  // 	this.trigger("renderer:click", this.model, ev);
  // }

});
module.exports = ClickableRenderer;

},{"app/view/render/LabelRenderer":113}],107:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function";

  return "<a href=\"#"
    + container.escapeExpression(((helper = (helper = helpers.domid || (depth0 != null ? depth0.domid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domid","hash":{},"data":data}) : helper)))
    + "\"><span class=\"label\">"
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</span></a>";
},"useData":true});

},{"hbsfy/runtime":35}],108:[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/DefaultSelectableRenderer
 */

/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("app/view/render/ClickableRenderer");
/**
 * @constructor
 * @type {module:app/view/render/DefaultSelectableRenderer}
 */


var DefaultSelectableRenderer = ClickableRenderer.extend({
  /** @override */
  tagName: "li",

  /** @override */
  className: "list-item",

  /** @override */
  template: require("./DefaultSelectableRenderer.hbs"),
  initialize: function initialize(options) {
    this.listenTo(this.model, "selected deselected", this._renderClassList);

    this._renderClassList();
  },

  /** @override */
  render: function render() {
    this.el.innerHTML = this.template(this.model.toJSON());

    this._renderClassList();

    return this;
  },
  _renderClassList: function _renderClassList() {
    this.el.classList.toggle("selected", this.model.selected);
  }
});
module.exports = DefaultSelectableRenderer;

},{"./DefaultSelectableRenderer.hbs":107,"app/view/render/ClickableRenderer":106}],109:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<span class=\"label\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span><a href=\"#"
    + alias4(((helper = (helper = helpers.domid || (depth0 != null ? depth0.domid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domid","hash":{},"data":data}) : helper)))
    + "\"><b> </b></a>";
},"useData":true});

},{"hbsfy/runtime":35}],110:[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/DotNavigationRenderer
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View"); // /** @type {module:app/view/component/ClickableRenderer} */
// var ClickableRenderer = require("app/view/render/LabelRenderer");

/** @type {string} */


var viewTemplate = require("./DotNavigationRenderer.hbs");
/**
 * @constructor
 * @type {module:app/view/render/DotNavigationRenderer}
 */


var DotNavigationRenderer = View.extend({
  /** @type {string} */
  cidPrefix: "dotRenderer",

  /** @override */
  tagName: "li",

  /** @override */
  className: "list-item",

  /** @override */
  template: viewTemplate,

  /** @override */
  events: {
    "click": function click(ev) {
      if (ev.defaultPrevented) return;
      ev.preventDefault();
      this.trigger("renderer:click", this.model, ev);
    },
    "click a": function clickA(ev) {
      ev.defaultPrevented || ev.preventDefault();
    }
  },

  /** @override */
  initialize: function initialize(options) {
    this.listenTo(this.model, "selected deselected", this.renderClassList);
    this.renderClassList();
  },

  /** @override */
  render: function render() {
    this.el.innerHTML = this.template(this.model.toJSON());
    this.renderClassList();
    return this;
  },
  renderClassList: function renderClassList() {
    this.el.classList.toggle("selected", this.model.selected);
  }
});
module.exports = DotNavigationRenderer;

},{"./DotNavigationRenderer.hbs":109,"app/view/base/View":82}],111:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"placeholder sizing\"></div>\n<img class=\"content media-border default\" alt=\""
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "\" longdesc=\"#desc_m"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" />\n";
},"useData":true});

},{"hbsfy/runtime":35}],112:[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("./MediaRenderer");
/** @type {Function} */


var viewTemplate = require("./ImageRenderer.hbs");
/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */


var ImageRenderer = MediaRenderer.extend({
  /** @type {string} */
  cidPrefix: "imageRenderer",

  /** @type {string} */
  className: MediaRenderer.prototype.className + " image-item",

  /** @type {Function} */
  template: viewTemplate,

  /** @override */
  initialize: function initialize(opts) {
    MediaRenderer.prototype.initialize.apply(this, arguments); // this.createChildren();
    // this.initializeAsync();
  },

  /* --------------------------- *
  /* children/layout
  /* --------------------------- */

  /** @override */
  createChildren: function createChildren() {
    MediaRenderer.prototype.createChildren.apply(this, arguments); // this.el.innerHTML = this.template(this.model.toJSON());

    this.placeholder = this.el.querySelector(".placeholder");
  },

  /** @override */
  render: function render() {
    MediaRenderer.prototype.render.apply(this, arguments); // this.measure();

    var img = this.getDefaultImage();
    img.setAttribute("width", this.metrics.media.width);
    img.setAttribute("height", this.metrics.media.height);
    var content = this.getContentEl();
    content.style.left = this.metrics.content.x + "px";
    content.style.top = this.metrics.content.y + "px"; // var sizing = this.getSizingEl();
    // sizing.style.maxWidth = this.metrics.content.width + "px";
    // sizing.style.maxHeight = this.metrics.content.height + "px";

    return this;
  },

  /* --------------------------- *
  /* initializeAsync
  /* --------------------------- */
  initializeAsync: function initializeAsync() {
    return MediaRenderer.prototype.initializeAsync.apply(this, arguments) // return MediaRenderer.whenSelectionIsContiguous(this)
    // // return Promise.resolve(this)
    // // 	.then(MediaRenderer.whenSelectionIsContiguous)
    // 	.then(MediaRenderer.whenSelectTransitionEnds)
    // 	.then(MediaRenderer.whenDefaultImageLoads)
    // .then(
    // 	function(view) {
    // 		view.mediaState = "ready";
    // 	})
    // .catch(
    // 	function(err) {
    // 		if (err instanceof ViewError) {
    // 			// NOTE: ignore ViewError type
    // 			// console.log(err.view.cid, err.view.model.cid, "ImageRenderer: " + err.message);
    // 		} else {
    // 			console.error(this.cid, err.name, err);
    // 			this.placeholder.innerHTML = "<p class=\"color-fg\" style=\"position:absolute;bottom:0;padding:3rem;\"><strong>" + err.name + "</strong> " + err.message + "</p>";
    // 			this.mediaState = "error";
    // 		}
    // 	}.bind(this))
    ;
  }
});
module.exports = ImageRenderer;

},{"./ImageRenderer.hbs":111,"./MediaRenderer":114}],113:[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/LabelRenderer
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/**
 * @constructor
 * @type {module:app/view/render/LabelRenderer}
 */


var LabelRenderer = View.extend({
  /** @type {string} */
  cidPrefix: "labelRenderer",
  properties: {
    label: {
      get: function get() {
        return this._label || (this._label = this.el.querySelector(".label"));
      } // measuredWidth: {
      // 	get: function() {
      // 		return this._measuredWidth;
      // 	}
      // },
      // measuredHeight: {
      // 	get: function() {
      // 		return this._measuredHeight;
      // 	}
      // },

    }
  }
  /* -------------------------------
  /* measure
  /* ------------------------------- */
  // _measuredWidth: null,
  // _measuredHeight: null,
  // measure: function() {},

});
module.exports = LabelRenderer;

},{"app/view/base/View":82}],114:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/*global XMLHttpRequest, HTMLMediaElement, MediaError*/

/**
 * @module app/view/render/MediaRenderer
 */

/** @type {module:underscore.strings/lpad} */
var lpad = require("underscore.string/lpad");
/** @type {module:app/model/item/MediaItem} */


var MediaItem = require("app/model/item/MediaItem");
/** @type {module:app/view/CarouselRenderer} */


var CarouselRenderer = require("app/view/render/CarouselRenderer"); // var errorTemplate = require("../template/ErrorBlock.hbs");
// /** @type {module:utils/css/getBoxEdgeStyles} */
// var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");


var MediaRenderer = CarouselRenderer.extend({
  /** @type {string} */
  cidPrefix: "mediaRenderer",

  /** @type {string} */
  className: CarouselRenderer.prototype.className + " media-item",

  /** @type {module:app/model/MediaItem} */
  model: MediaItem,
  properties: {
    defaultImage: {
      get: function get() {
        return this._defaultImage || (this._defaultImage = this.el.querySelector("img.default"));
      }
    },
    mediaState: {
      get: function get() {
        return this._mediaState;
      },
      set: function set(state) {
        this._setMediaState(state);
      }
    }
  },

  /** @override */
  initialize: function initialize(opts) {
    // if (this.model.attrs().hasOwnProperty("@classname")) {
    // 	this.el.className += " " + this.model.attr("@classname");
    // }
    // NOTE: @classname attr handling moved to CarouselRenderer
    // if (this.model.attr("@classname") !== void 0) {
    // 	var clsAttr = this.model.attr("@classname").split(" ");
    // 	for (var i = 0; i < clsAttr.length; i++) {
    // 		this.el.classList.add(clsAttr[i]);
    // 	}
    // }
    CarouselRenderer.prototype.initialize.apply(this, arguments);
    this.metrics.media = {};
    this.mediaState = "idle";
    this.initializeAsync().then(this.whenInitialized).catch(this.whenInitializeError.bind(this));
  },
  initializeAsync: function initializeAsync() {
    // var MediaRenderer = Object.getPrototypeOf(this).constructor;
    return Promise.resolve(this).then(MediaRenderer.whenSelectionIsContiguous).then(MediaRenderer.whenScrollingEnds).then(MediaRenderer.whenDefaultImageLoads);
  },
  whenInitialized: function whenInitialized(view) {
    // console.log("%s::whenInitialized [%s]", view.cid, "resolved");
    view.mediaState = "ready";
    view.placeholder.removeAttribute("data-progress");
    return view;
  },
  whenInitializeError: function whenInitializeError(err) {
    if (err instanceof CarouselRenderer.ViewError) {
      // NOTE: ignore ViewError type
      return;
    } else if (err instanceof Error) {
      console.error(err.stack);
    }

    this.placeholder.removeAttribute("data-progress");
    this.mediaState = "error";
  },
  updateMediaProgress: function updateMediaProgress(progress, id) {
    if (_.isNumber(progress)) {
      this.placeholder.setAttribute("data-progress", lpad(Math.floor(progress * 100), 2, '0'));
    } // else if (progress === "complete") {
    // 	this.placeholder.removeAttribute("data-progress");
    // }

  },
  // whenMediaIsReady: function(view) {
  // 	return MediaRenderer.whenDefaultImageLoads(this, this.updateMediaProgress.bind(this));
  // },

  /* --------------------------- *
  /* child getters
  /* --------------------------- */

  /** @return {HTMLElement} */
  getDefaultImage: function getDefaultImage() {
    return this.defaultImage;
  },

  /* --------------------------- *
  /* children/layout
  /* --------------------------- */
  createChildren: function createChildren() {
    this.el.innerHTML = this.template(this.model.toJSON());
  },

  /** @override */
  measure: function measure() {
    CarouselRenderer.prototype.measure.apply(this, arguments);
    var sw, sh; // source dimensions

    var pcw, pch; // measured values

    var cx, cy, cw, ch, cs; // computed values

    var ew, eh; // content edge totals

    var cm; // content metrics

    cm = this.metrics.content;
    cx = cm.x;
    cy = cm.y;
    pcw = cm.width;
    pch = cm.height;
    ew = cm.paddingLeft + cm.paddingRight + cm.borderLeftWidth + cm.borderRightWidth;
    eh = cm.paddingTop + cm.paddingBottom + cm.borderTopWidth + cm.borderBottomWidth;
    pcw -= ew;
    pch -= eh;
    sw = this.model.get("source").get("w");
    sh = this.model.get("source").get("h"); // Unless both client dimensions are larger than the source's
    // choose constraint direction by aspect ratio

    if (sw < pcw && sh < pch) {
      cs = 1;
      cw = sw;
      ch = sh;
      this.metrics.fitDirection = "both";
    } else if (pcw / pch < sw / sh) {
      // fit width
      cw = pcw;
      cs = cw / sw; // ch = cs * sh;

      ch = Math.round(cs * sh);
      this.metrics.fitDirection = "width";
    } else {
      // fit height
      ch = pch;
      cs = ch / sh; // cw = cs * sw;

      cw = Math.round(cs * sw);
      this.metrics.fitDirection = "height";
    }

    this.metrics.content.x = cx;
    this.metrics.content.y = cy;
    this.metrics.content.width = cw + ew;
    this.metrics.content.height = ch + eh;
    this.metrics.media.x = cx + cm.paddingLeft + cm.borderLeftWidth;
    this.metrics.media.y = cy + cm.paddingTop + cm.borderTopWidth;
    this.metrics.media.width = cw;
    this.metrics.media.height = ch;
    this.metrics.media.scale = cs; // console.log("%s::measure mw:%s mh:%s fit: %s metrics: %o", this.cid, pcw, pch, this.metrics.fitDirection, this.metrics);
    // var sizing = this.getSizingEl();
    // sizing.style.maxWidth = (cw + ew) + "px";
    // sizing.style.maxHeight = (ch + eh) + "px";

    return this;
  },
  render: function render() {
    // NOTE: not calling super.render, calling measure ourselves
    this.measure();
    var sizing = this.getSizingEl();
    sizing.style.maxWidth = this.metrics.content.width + "px";
    sizing.style.maxHeight = this.metrics.content.height + "px";
    this.el.setAttribute("data-fit-dir", this.metrics.fitDirection);
    return this;
  },

  /* --------------------------- *
  /* mediaState
  /* --------------------------- */
  _mediaStateEnum: ["idle", "pending", "ready", "error"],
  _setMediaState: function _setMediaState(key) {
    if (this._mediaStateEnum.indexOf(key) === -1) {
      throw new Error("Argument " + key + " invalid. Must be one of: " + this._mediaStateEnum.join(", "));
    }

    if (this._mediaState !== key) {
      if (this._mediaState) {
        this.el.classList.remove(this._mediaState);
      }

      this.el.classList.add(key);
      this._mediaState = key;
      this.trigger("media:" + key);
    }
  }
}, {
  LOG_TO_SCREEN: true,

  /** @type {module:app/view/promise/whenSelectionDistanceIs} */
  whenSelectionDistanceIs: require("app/view/promise/whenSelectionDistanceIs"),

  /** @type {module:app/view/promise/whenSelectionIsContiguous} */
  whenSelectionIsContiguous: require("app/view/promise/whenSelectionIsContiguous"),
  // /** @type {module:app/view/promise/whenSelectTransitionEnds} */
  // whenSelectTransitionEnds: require("app/view/promise/whenSelectTransitionEnds"),

  /** @type {module:app/view/promise/whenScrollingEnds} */
  whenScrollingEnds: require("app/view/promise/whenScrollingEnds"),

  /** @type {module:app/view/promise/whenDefaultImageLoads} */
  whenDefaultImageLoads: require("app/view/promise/whenDefaultImageLoads")
});
/* ---------------------------
/* log to screen
/* --------------------------- */

if (DEBUG) {
  MediaRenderer = function (MediaRenderer) {
    if (!MediaRenderer.LOG_TO_SCREEN) return MediaRenderer;
    /** @type {Function} */

    var Color = require("color"); // /** @type {module:underscore.string/lpad} */
    // var lpad = require("underscore.string/lpad");
    // /** @type {module:underscore.string/rpad} */
    // var rpad = require("underscore.string/rpad");


    return MediaRenderer.extend({
      /** @override */
      initialize: function initialize() {
        var fgColor = new Color(this.model.attr("color"));
        var bgColor = new Color(this.model.attr("background-color"));
        this.__logColors = {
          normal: Color(fgColor).mix(bgColor, 0.75).hsl().string(),
          ignored: Color(fgColor).mix(bgColor, 0.25).hsl().string(),
          error: "brown",
          abort: "orange"
        };
        this.__logFrameStyle = "1px dashed " + Color(fgColor).mix(bgColor, 0.5).hsl().string();
        this.__logStartTime = Date.now();
        this.__rafId = -1;
        this.__onFrame = this.__onFrame.bind(this);
        MediaRenderer.prototype.initialize.apply(this, arguments);
      },
      initializeAsync: function initializeAsync() {
        return MediaRenderer.prototype.initializeAsync.apply(this, arguments).catch(function (err) {
          if (!(err instanceof MediaRenderer.ViewError)) {
            this.__logMessage(err.message, err.name, this.__logColors["error"]);
          }

          return Promise.reject(err);
        }.bind(this));
      },

      /** @override */
      createChildren: function createChildren() {
        var ret = MediaRenderer.prototype.createChildren.apply(this, arguments);
        this.__logElement = document.createElement("div");
        this.__logElement.className = "debug-log"; // this.__logElement.style.touchAction = "pan-y";

        this.__logHeaderEl = document.createElement("pre");
        this.__logHeaderEl.className = "log-header color-bg"; // Color(this.model.colors.fgColor).mix(fgColor, 0.9).rgb().string()
        // Color(this.model.colors.fgColor).alpha

        this.__logHeaderEl.textContent = this.__getHeaderText();

        this.__logElement.appendChild(this.__logHeaderEl);

        this.el.insertBefore(this.__logElement, this.el.firstElementChild);
        return ret;
      },

      /** @override */
      render: function render() {
        var ret = MediaRenderer.prototype.render.apply(this, arguments);
        this.__logElement.style.top = this.metrics.content.height + this.metrics.content.y + "px";
        this.__logElement.style.left = this.metrics.content.x + "px";
        this.__logElement.style.width = this.metrics.content.width + "px";
        this.__logElement.scrollTop = this.__logElement.scrollHeight;
        return ret;
      },
      whenInitializeError: function whenInitializeError(err) {
        // NOTE: not calling super
        // MediaRenderer.prototype.whenInitializeError.apply(this, arguments);
        if (err instanceof CarouselRenderer.ViewError) {
          // NOTE: ignore ViewError type
          // console.warn("%s::whenInitializeError ", err.view.cid, err.message);
          return;
        } else if (err instanceof Error) {
          console.warn(err.stack);
        } // this.placeholder.innerHTML = err ? errorTemplate(err) : "";


        this.placeholder.removeAttribute("data-progress");
        this.mediaState = "error"; // console.error("%s::initializeAsync [%s (caught)]: %s", this.cid, err.name, (err.info && err.info.logMessage) || err.message);
        // err.logEvent && console.log(err.logEvent);
      },

      /* --------------------------- *
      /* log methods
      /* --------------------------- */
      __logMessage: function __logMessage(msg, logtype, color) {
        var logEntryEl = document.createElement("pre");
        logtype || (logtype = "-");
        logEntryEl.textContent = this.__getTStamp() + " " + msg;
        logEntryEl.setAttribute("data-logtype", logtype);
        logEntryEl.style.color = color || this.__logColors[logtype] || this.__logColors.normal;

        this.__logElement.appendChild(logEntryEl);

        this.__logElement.scrollTop = this.__logElement.scrollHeight;

        if (this.__rafId == -1) {
          this.__rafId = this.requestAnimationFrame(this.__onFrame);
        }
      },
      __onFrame: function __onFrame(tstamp) {
        this.__rafId = -1;
        this.__logElement.lastElementChild.style.borderBottom = this.__logFrameStyle;
        this.__logElement.lastElementChild.style.paddingBottom = "2px";
        this.__logElement.lastElementChild.style.marginBottom = "2px";
      },
      __getTStamp: function __getTStamp() {
        // return new Date(Date.now() - this.__logStartTime).toISOString().substr(11, 12);
        return lpad(((Date.now() - this.__logStartTime) / 1000).toFixed(3), 8, "0");
      },
      __getHeaderText: function __getHeaderText() {
        return '';
      }
    });
  }(MediaRenderer);
} // end debug

/**
 * @constructor
 * @type {module:app/view/render/MediaRenderer}
 */


module.exports = MediaRenderer;

}).call(this,true,require("underscore"))

},{"app/model/item/MediaItem":71,"app/view/promise/whenDefaultImageLoads":99,"app/view/promise/whenScrollingEnds":100,"app/view/promise/whenSelectionDistanceIs":101,"app/view/promise/whenSelectionIsContiguous":102,"app/view/render/CarouselRenderer":105,"color":12,"underscore":51,"underscore.string/lpad":47}],115:[function(require,module,exports){
(function (DEBUG,GA,_){
"use strict";

/**
 * @module app/view/render/PlayableRenderer
 */

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("app/view/render/MediaRenderer"); // /** @type {module:app/view/component/CanvasProgressMeter} */
// var ProgressMeter = require("app/view/component/CanvasProgressMeter");

/** @type {Function} */


var prefixedProperty = require("utils/prefixedProperty");
/** @type {Function} */


var prefixedEvent = require("utils/prefixedEvent"); // var visibilityHiddenProp = prefixedProperty("hidden", document);

/** @type {String} */


var visibilityStateProp = prefixedProperty("visibilityState", document);
/** @type {String} */

var visibilityChangeEvent = prefixedEvent("visibilitychange", document, "hidden"); // /** @type {Function} */
// var Color = require("color");
//
// /** @type {Function} */
// // var duotone = require("utils/canvas/bitmap/duotone");
// // var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// // var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");
// var getAverageRGB = require("utils/canvas/bitmap/getAverageRGB");
// // var inflateRect = require("utils/geom/inflateRect");
//
// var WAIT_DEBOUNCE_MS = require("app/control/Globals").TRANSITION_DURATION;
// /** @type {HTMLCanvasElement} */
// var _sharedCanvas = null;
// /** @return {HTMLCanvasElement} */
// var getSharedCanvas = function() {
// 	if (_sharedCanvas === null) {
// 		_sharedCanvas = document.createElement("canvas");
// 	}
// 	return _sharedCanvas;
// };
// var SVG_NS = "http://www.w3.org/2000/svg";
// var XLINK_NS = "http://www.w3.org/1999/xlink";
//
// var useIdSeed = 0
// var createSVGUseElement = function() {
// 	var svgEl = document.createElementNS(SVG_NS, "use");
// 	svgEl.setAttributeNS(null, "id", name + (useIdSeed++));
// 	svgEl.setAttributeNS(null, "class", [name, "symbol"].join(" "));
// 	svgEl.setAttributeNS(XLINK_NS, "xlink:href", "#" + name);
// 	return svgEl;
// };
// function logAttachInfo(view, name, level) {
// 	if (["log", "info", "warn", "error"].indexOf(level) != -1) {
// 		level = "log";
// 	}
// 	console[level].call(console, "%s::%s [parent:%s %s %s depth:%s]", view.cid, name, view.parentView && view.parentView.cid, view.attached ? "attached" : "detached", view._viewPhase, view.viewDepth);
// }

/**
 * @constructor
 * @type {module:app/view/render/PlayableRenderer}
 */

var PlayableRenderer = MediaRenderer.extend({
  /** @type {string} */
  cidPrefix: "playableRenderer",

  /** @type {string|Function} */
  className: MediaRenderer.prototype.className + " playable-item",
  properties: {
    mediaPaused: {
      /** @return {Boolean} */
      get: function get() {
        return this._isMediaPaused();
      }
    },
    mediaWaiting: {
      /** @return {Boolean} */
      get: function get() {
        return this._isMediaWaiting();
      }
    },
    playbackRequested: {
      /** @return {Boolean} */
      get: function get() {
        return this._playbackRequested;
      },
      set: function set(value) {
        this._setPlaybackRequested(value);
      }
    },
    overlay: {
      /** @return {HTMLElement} */
      get: function get() {
        return this._overlay || (this._overlay = this.el.querySelector(".overlay"));
      }
    },
    // playToggle: {
    // 	/** @return {HTMLElement} */
    // 	get: function() {
    // 		return this._playToggle || (this._playToggle = this.el.querySelector(".play-toggle"));
    // 	}
    // },
    // playToggleSymbol: {
    // 	/** @return {HTMLElement} */
    // 	get: function() {
    // 		return this._playToggleSymbol || (this._playToggleSymbol = this.el.querySelector(".play-toggle-symbol"));
    // 	}
    // },
    playToggleHitarea: {
      /** @return {HTMLElement} */
      get: function get() {
        return this._playToggleHitarea || (this._playToggleHitarea = this.el.querySelector(".play-toggle-hitarea"));
      }
    }
  },

  /** @override */
  initialize: function initialize(opts) {
    this._playToggleSymbol = {}; // this._toggleWaiting = _.debounce(this._toggleWaiting, 500);
    // this._toggleWaiting = _.throttle(this._toggleWaiting, WAIT_DEBOUNCE_MS, { leading: true, trailing: true });

    _.bindAll(this, "_onPlaybackToggle", "_onVisibilityChange");

    MediaRenderer.prototype.initialize.apply(this, arguments);

    this._setPlaybackRequested(this._playbackRequested); // this.listenTo(this, "view:parentChange", function(childView, newParent, oldParent) {
    // 	// logAttachInfo(this, "[view:parentChange]", "info");
    // 	console.info("%s::[view:parentChange] '%s' to '%s'", this.cid, oldParent && oldParent.cid, newParent && newParent.cid);
    // });

  },
  // /** @override */
  // initializeAsync: function() {
  // 	return MediaRenderer.prototype.initialize.initializeAsync.apply(this, arguments);
  // },
  // /** @override */
  // remove: function() {
  // 	MediaRenderer.prototype.remove.apply(this, arguments);
  // 	return this;
  // },

  /* --------------------------- *
  /* children/layout
  /* --------------------------- */
  // createChildren: function() {
  // },

  /* --------------------------- *
  /* setEnabled
  /* --------------------------- */

  /** @override */
  setEnabled: function setEnabled(enabled) {
    MediaRenderer.prototype.setEnabled.apply(this, arguments); // this._validatePlayback(enabled);
    // if (enabled) {

    this._validatePlayback(); // } else {
    // 	// if selected, pause media
    // 	this.model.selected && this._togglePlayback(false);
    // 	// this._togglePlayback(false);
    // }
    // console.log("%s::setEnabled", this.cid, this.enabled);
    // this._playToggleSymbol.paused = (this.enabled && this.model.selected);
    //}

  },

  /* ---------------------------
  /* selection handlers
  /* --------------------------- */
  listenToSelection: function listenToSelection() {
    if (this._viewPhase != "initialized") throw new Error(this.cid + "::listenToSelection called while " + this._viewPhase); // logAttachInfo(this, "listenToSelection", "log");
    // this.listenTo(this, "view:removed", this.removeSelectionListeners);

    this.listenTo(this.model, "selected", this._onModelSelected);
    this.listenTo(this.model, "deselected", this._onModelDeselected);

    if (this.model.selected) {
      this._onModelSelected();
    }
  },

  /* model selected handlers:
  /* model selection toggles playback
  /* --------------------------- */
  _onModelSelected: function _onModelSelected() {
    console.log("%s::_onModelSelected _playbackRequested: %s, event: %s", this.cid, this._playbackRequested, this._toggleEvent);
    this.listenTo(this, "view:parentChange", this._onParentChange);
    if (this.parentView) this._onParentChange(this, this.parentView, null); // this.enabled = true;

    this._playToggleSymbol.paused = !this.enabled;

    this._listenWhileSelected();

    this._validatePlayback();
  },
  _onModelDeselected: function _onModelDeselected() {
    console.log("%s::_onModelDeselected _playbackRequested: %s, event: %s", this.cid, this._playbackRequested, this._toggleEvent);
    this.stopListening(this, "view:parentChange", this._onParentChange);
    if (this.parentView) this._onParentChange(this, null, this.parentView);
    this._playToggleSymbol.paused = true;

    this._stopListeningWhileSelected();

    this._validatePlayback(false); // this._togglePlayback(false);

  },

  /* view:parentChange handlers 3
  /* --------------------------- */
  _onParentChange: function _onParentChange(childView, newParent, oldParent) {
    // console.log("[scroll] %s::_onParentChange '%s' to '%s'", this.cid, oldParent && oldParent.cid, newParent && newParent.cid);
    if (oldParent) this.stopListening(oldParent, "view:scrollstart view:scrollend", this._onScrollChange);
    if (newParent) this.listenTo(newParent, "view:scrollstart view:scrollend", this._onScrollChange);
  },
  _onScrollChange: function _onScrollChange() {
    if (this.parentView === null) {
      throw new Error(this.cid + "::_onScrollChange parentView is null");
    }

    this._validatePlayback();
  },

  /* visibility dom event
  /* --------------------------- */
  _onVisibilityChange: function _onVisibilityChange(ev) {
    this._validatePlayback();
  },

  /* listen to DOM events
   * --------------------------- */
  _listenWhileSelected: function _listenWhileSelected() {
    this.listenTo(this, "view:removed", this._stopListeningWhileSelected);
    document.addEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
    this.playToggleHitarea.addEventListener(this._toggleEvent, this._onPlaybackToggle, false);
  },
  _stopListeningWhileSelected: function _stopListeningWhileSelected() {
    this.stopListening(this, "view:removed", this._stopListeningWhileSelected);
    document.removeEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
    this.playToggleHitarea.removeEventListener(this._toggleEvent, this._onPlaybackToggle, false);
  },

  /* --------------------------- *
  /* play-toggle
  /* --------------------------- */

  /** @type {String} */
  _toggleEvent: MediaRenderer.CLICK_EVENT,
  //window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",
  _onPlaybackToggle: function _onPlaybackToggle(ev) {
    //console.log("%s[%sabled]::_onPlaybackToggle[%s] defaultPrevented: %s", this.cid, this.enabled ? "en" : "dis", ev.type, ev.defaultPrevented);
    // NOTE: Perform action if MouseEvent.button is 0 or undefined (0: left-button)
    if (this.enabled && !ev.defaultPrevented && !ev.button) {
      ev.preventDefault();
      this.playbackRequested = !this.playbackRequested;
    }
  },

  /* --------------------------- *
  /* playbackRequested
  /* --------------------------- */
  _playbackCount: 0,

  /** @type {Boolean?} */
  _playbackRequested: null,
  _setPlaybackRequested: function _setPlaybackRequested(value) {
    this._playbackRequested = value;
    var classList = this.content.classList;
    classList.toggle("playing", value === true);
    classList.toggle("paused", value === false);
    classList.toggle("requested", value === true || value === false);

    this._renderPlaybackState(); // this._validatePlayback(this.playbackRequested);
    // if (this.playbackRequested) {


    this._validatePlayback(); // } else {
    // 	this._togglePlayback(false);
    // }

  },

  /* --------------------------- *
  /* _togglePlayback
  /* --------------------------- */

  /** @param {Boolean} */
  _togglePlayback: function _togglePlayback(newPlayState) {
    if (DEBUG) this.__logMessage(["args:", Array.prototype.join.apply(arguments), "paused:", this._isMediaPaused() ? "pause" : "play", "media-state:", this.mediaState].join(" "), "toggle-playback");

    if (_.isBoolean(newPlayState) && newPlayState !== this._isMediaPaused()) {
      return; // requested state is current, do nothing
    } else {
      newPlayState = this._isMediaPaused();
    }

    if (newPlayState) {
      // changing to what?
      // this._playbackCount++;
      this._playMedia();
    } else {
      this._pauseMedia();
    }
    /* NOTE: called from _setPlaybackRequested */
    // this._renderPlaybackState();

  },
  _canResumePlayback: function _canResumePlayback() {
    return !!(this.enabled && this.model.selected && this.playbackRequested && this.mediaState === "ready" && this.attached && this.parentView !== null && !this.parentView.scrolling && document[visibilityStateProp] != "hidden");
  },
  _validatePlayback: function _validatePlayback(shortcircuit) {
    // a 'shortcircuit' boolean argument can be passed, and if false,
    // skip _canResumePlayback and pause playback right away
    if (arguments.length !== 0 && !shortcircuit) {
      this._togglePlayback(false);
    } else {
      this._togglePlayback(this._canResumePlayback());
    }

    this._playToggleSymbol.paused = !(this.attached && this.enabled && this.model.selected);
  },

  /* ---------------------------
  /* _setPlayToggleSymbol
  /* --------------------------- */
  _renderPlaybackState: function _renderPlaybackState() {
    if (!this.attached) {
      return;
    }

    if (this.progressMeter) {
      this.progressMeter.stalled = this._isMediaWaiting();
    } // this._setPlayToggleSymbol("waiting");
    // this.content.classList.toggle("waiting", true);
    // if (!this.content.classList.contains("started")) {
    // 	this._setPlayToggleSymbol("play");
    // } else


    var waiting = !this.parentView.scrolling && this._isMediaWaiting();

    if (this.playbackRequested) {
      if (waiting) {
        this._setPlayToggleSymbol("waiting");
      } else {
        this._setPlayToggleSymbol("play");
      }
    } else {
      if (this.content.classList.contains("started")) {
        this._setPlayToggleSymbol("pause");
      } else {
        this._setPlayToggleSymbol("play");
      }
    }

    var cls = this.content.classList;
    cls.toggle("playing", this.playbackRequested);
    cls.toggle("paused", !this.playbackRequested);
    cls.toggle("waiting", waiting); //console.log("%s::_renderPlaybackState [play: %s] [wait: %s] [symbol: %s]", this.cid, this.playbackRequested, this._isMediaWaiting(), this._playToggleSymbol.symbolName);
  },
  _setPlayToggleSymbol: function _setPlayToggleSymbol(symbolName) {
    //console.log("%s::_setPlayToggleSymbol [enabled: %s] [selected: %s] [symbol: %s]", this.cid, this.enabled, !!(this.model.selected), symbolName);
    // this._playToggleSymbol.paused = !(this.attached && this.enabled && !!(this.model.selected));
    this._playToggleSymbol.symbolName = symbolName;

    if (this.mediaState === "ready") {
      //this._playToggleSymbol.renderFlags) {
      this._playToggleSymbol.renderNow();
    }
  },
  // _playToggleSymbolSvg: null,
  // _playToggleSymbolName: null,
  // _setPlayToggleSymbol_svg: function(symbolName) {
  // 	if (this._playToggleSymbolName !== symbolName) {
  // 		var svgDoc = this.el.querySelector("svg.play-toggle-symbol");
  // 		if (this._playToggleSymbolSvg) {
  // 			svgDoc.removeChild(this._playToggleSymbolSvg);
  // 		}
  // 		var svgSym = document.createElementNS("http://www.w3.org/2000/svg", "use");
  // 		svgSym.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + symbolName);
  // 		svgDoc.appendChild(svgSym);
  // 		svgDoc.setAttributeNS(null, "class", symbolName + "-symbol play-toggle-symbol");
  //
  // 		this._playToggleSymbolSvg = svgSym;
  // 		this._playToggleSymbolName = symbolName;
  // 	}
  // },

  /* --------------------------- *
  /* waiting
  /* --------------------------- */
  _isWaiting: false,
  _isMediaWaiting: function _isMediaWaiting() {
    return this._isWaiting;
  },
  _toggleWaiting: function _toggleWaiting(waiting) {
    if (arguments.length === 0) {
      waiting = !this._isWaiting;
    } // if (this._isMediaPaused()) {
    // 	waiting = false;
    // }


    if (this._isWaiting !== waiting) {
      this._isWaiting = waiting;

      this._renderPlaybackState();
    }
  },

  /* --------------------------- *
  /* abstract
  /* --------------------------- */
  _isMediaPaused: function _isMediaPaused() {
    console.warn("%s::_isMediaPaused Not implemented", this.cid);
    return true;
  },
  _playMedia: function _playMedia() {
    console.warn("%s::_playMedia Not implemented", this.cid);
  },
  _pauseMedia: function _pauseMedia() {
    console.warn("%s::_pauseMedia Not implemented", this.cid);
  },

  /* --------------------------- *
  /* util
  /* --------------------------- */
  updateOverlay: function updateOverlay(mediaEl, targetEl, rectEl) {// this method is not critical, just catch and log all errors
    // try {
    // 	this._updateOverlay(mediaEl, targetEl, rectEl)
    // } catch (err) {
    // 	console.error("%s::updateOverlay", this.cid, err);
    // }
  }
  /**\/
  _drawMediaElement: function(ctx, mediaEl, dest) {
  	// destination rect
  	// NOTE: mediaEl is expected to have the same dimensions in this.metrics.media
  	mediaEl || (mediaEl = this.defaultImage);
  	dest || (dest = {
  		x: 0,
  		y: 0,
  		width: this.metrics.media.width,
  		height: this.metrics.media.height
  	});
  		// native/display scale
  	var sW = this.model.get("source").get("w"),
  		sH = this.model.get("source").get("h"),
  		rsX = sW / this.metrics.media.width,
  		rsY = sH / this.metrics.media.height;
  		// dest, scaled to native
  	var src = {
  		x: Math.max(0, dest.x * rsX),
  		y: Math.max(0, dest.y * rsY),
  		width: Math.min(sW, dest.width * rsX),
  		height: Math.min(sH, dest.height * rsY)
  	};
  		// resize canvas
  	// var canvas = ctx.canvas;
  	// if (canvas.width !== dest.width || canvas.height !== dest.height) {
  	// 	canvas.width = dest.width;
  	// 	canvas.height = dest.height;
  	// }
  	ctx.canvas.width = dest.width;
  	ctx.canvas.height = dest.height;
  		// copy image to canvas
  	ctx.clearRect(0, 0, dest.width, dest.height);
  	ctx.drawImage(mediaEl,
  		src.x, src.y, src.width, src.height,
  		0, 0, dest.width, dest.height // destination rect
  	);
  		return ctx;
  },
  	_getImageData: function(mediaEl, targetEl, rectEl) {
  	// src/dest rects
  	// ------------------------------
  	rectEl || (rectEl = targetEl);
  		// NOTE: does not work with svg element
  	// var tRect = rectEl.getBoundingClientRect();
  	// var cRect = mediaEl.getBoundingClientRect();
  	// var tX = tRect.x - cRect.x,
  	// 	tY = tRect.y - cRect.y,
  	// 	tW = tRect.width,
  	// 	tH = tRect.height;
  		// target bounds
  	var tX = rectEl.offsetLeft,
  		tY = rectEl.offsetTop,
  		tW = rectEl.offsetWidth,
  		tH = rectEl.offsetHeight;
  		if (tX === void 0 || tY === void 0 || tW === void 0 || tH === void 0) {
  		return;
  	}
  		// destination rect
  	var RECT_GROW = 0;
  	var dest = {
  		x: tX - RECT_GROW,
  		y: tY - RECT_GROW,
  		width: tW + RECT_GROW * 2,
  		height: tH + RECT_GROW * 2
  	};
  		// native/display scale
  	var sW = this.model.get("source").get("w"),
  		sH = this.model.get("source").get("h"),
  		rsX = sW / this.metrics.media.width,
  		rsY = sH / this.metrics.media.height;
  		// dest, scaled to native
  	var src = {
  		x: Math.max(0, dest.x * rsX),
  		y: Math.max(0, dest.y * rsY),
  		width: Math.min(sW, dest.width * rsX),
  		height: Math.min(sH, dest.height * rsY)
  	};
  		// Copy image to canvas
  	// ------------------------------
  	// canvas = document.createElement("canvas");
  	// canvas.style.width  = dest.width + "px";
  	// canvas.style.height = dest.height + "px";
  		var canvas = getSharedCanvas();
  	if (canvas.width !== dest.width || canvas.height !== dest.height) {
  		canvas.width = dest.width;
  		canvas.height = dest.height;
  	}
  	var ctx = canvas.getContext("2d");
  	ctx.clearRect(0, 0, dest.width, dest.height);
  	ctx.drawImage(mediaEl,
  		src.x, src.y, src.width, src.height,
  		0, 0, dest.width, dest.height // destination rect
  	);
  	return ctx.getImageData(0, 0, dest.width, dest.height);
  },
  	_updateOverlay: function(mediaEl, targetEl, rectEl) {
  	var canvas, ctx;
  	var imageData = this._getImageData(mediaEl, targetEl, rectEl);
  	var avgColor = Color().rgb(getAverageRGB(imageData));
  		// var avgHex = avgColor.hex().string(), els = this.el.querySelectorAll("img, video");
  	// for (var i = 0; i < els.length; i++) {
  	// 	els.item(i).style.backgroundColor = avgHex;
  	// }
  		targetEl.classList.toggle("over-dark", avgColor.dark());
  		// console.log("%s::updateOverlay() avgColor:%s (%s)", this.cid, avgColor.rgb().string(), avgColor.dark()?"dark":"light", targetEl);
  		// Color, filter opts
  	// ------------------------------
  		this.fgColor || (this.fgColor = new Color(this.model.attr("color")));
  	this.bgColor || (this.bgColor = new Color(this.model.attr("background-color")));
  		var opts = { radius: 20 };
  	var isFgDark = this.fgColor.luminosity() < this.bgColor.luminosity();
  	opts.x00 = isFgDark ? Color(this.fgColor).lighten(0.5) : Color(this.bgColor).darken(0.5);
  	opts.xFF = isFgDark ? Color(this.bgColor).lighten(0.5) : Color(this.fgColor).darken(0.5);
  		stackBlurRGB(imageData, { radius: 40 });
  	// stackBlurMono(imageData, opts);
  	// duotone(imageData, opts);
  		ctx = getSharedCanvas();
  	if (canvas.width !== imageData.width || canvas.height !== imageData.height) {
  		canvas.width = imageData.width;
  		canvas.height = imageData.height;
  	}
  	ctx = canvas.getContext("2d");
  	ctx.putImageData(imageData, 0, 0);
  	targetEl.style.backgroundOrigin = "border-box";
  	targetEl.style.backgroundClip = "content-box";
  	targetEl.style.backgroundSize = "100%";
  	// targetEl.style.padding = "0 0 5rem 0";
  	targetEl.style.backgroundImage = "url(" + canvas.toDataURL() + ")";
  } /**/

});
/* ---------------------------
/* Google Analytics
/* --------------------------- */

if (GA) {
  PlayableRenderer = function (PlayableRenderer) {
    /** @type {module:underscore.strings/dasherize} */
    var dasherize = require("underscore.string/dasherize"); // var readyEvents = ["playing", "waiting", "ended"];
    // var userEvents = ["play", "pause"];


    return PlayableRenderer.extend({
      /** @override */
      initialize: function initialize() {
        var retval = PlayableRenderer.prototype.initialize.apply(this, arguments);
        this._gaEventSuffix = this.playbackRequested ? "-autoplay" : "";
        return retval;
      },

      /** @override */
      _onPlaybackToggle: function _onPlaybackToggle(ev) {
        var retval = PlayableRenderer.prototype._onPlaybackToggle.apply(this, arguments);

        if (window.ga) {
          window.ga("send", {
            hitType: "event",
            eventCategory: dasherize(this.cidPrefix),
            eventAction: (this.playbackRequested ? "play" : "pause") + this._gaEventSuffix,
            eventLabel: this.model.get("text")
          });
        } else {
          console.warn("%s::_onPlaybackToggle window.ga is %s", this.cid, window.ga);
        }

        return retval;
      } // /** @override */
      // _togglePlayback: function(newPlayState) {
      // 	var retval = PlayableRenderer.prototype._togglePlayback.apply(this, arguments);
      // 	window.ga("send", {
      // 		hitType: "event",
      // 		eventCategory: "Playable",
      // 		eventAction: this.playbackRequested ? "play" : "pause",
      // 		eventLabel: this.model.get("text"),
      // 	});
      // 	return retval;
      // },

    });
  }(PlayableRenderer);
} // if (DEBUG) {
// 	PlayableRenderer.prototype._logFlags = "";
//
// 	PlayableRenderer = (function(PlayableRenderer) {
// 		if (!PlayableRenderer.LOG_TO_SCREEN) return PlayableRenderer;
//
// 		/** @type {module:underscore.strings/lpad} */
// 		var lpad = require("underscore.string/lpad");
//
// 		return PlayableRenderer.extend({
// 			_canResumePlayback: function() {
// 				var retval = PlayableRenderer.prototype._canResumePlayback.apply(this.arguments);
// 				console.log("[scroll] %s::_canResumePlayback():%s", this.cid, retval, {
// 					"enabled": this.enabled,
// 					"selected": (!!this.model.selected),
// 					"playbackRequested": this.playbackRequested,
// 					"attached": this.attached,
// 					"parentView": (this.parentView && this.parentView.cid),
// 					"!scrolling": (this.parentView && !this.parentView.scrolling),
// 					"mediaState": this.mediaState,
// 					// "!document.hidden": !document[visibilityHiddenProp],
// 					"visibilityState": document[visibilityStateProp]
// 				});
// 				return retval;
// 			},
// 		});
// 	})(PlayableRenderer);
// }


module.exports = PlayableRenderer;

}).call(this,true,false,require("underscore"))

},{"app/view/render/MediaRenderer":114,"underscore":51,"underscore.string/dasherize":42,"utils/prefixedEvent":145,"utils/prefixedProperty":146}],116:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"placeholder sizing\"></div>\n<div class=\"content\">\n	<div class=\"media-border content-size\"></div>\n	<div class=\"controls content-size\">\n		<canvas class=\"progress-meter\"></canvas>\n	</div>\n	<div class=\"sequence media-size\">\n		<img class=\"sequence-step current default\" alt=\""
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "\" longdesc=\"#desc_m"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" />\n	</div>\n	<div class=\"overlay media-size play-toggle-hitarea\">\n		<canvas class=\"play-toggle\"/>\n	</div>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":35}],117:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/render/SequenceRenderer
 */

/* --------------------------- *
 * Imports
 * --------------------------- */

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/render/PlayableRenderer} */


var PlayableRenderer = require("app/view/render/PlayableRenderer"); // /** @type {module:app/model/SelectableCollection} */
// var SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/view/component/CanvasProgressMeter} */


var ProgressMeter = require("app/view/component/CanvasProgressMeter");
/** @type {module:app/view/component/PlayToggleSymbol} */


var PlayToggleSymbol = require("app/view/component/PlayToggleSymbol");
/** @type {module:utils/Timer} */


var Timer = require("utils/Timer"); // /** @type {Function} */
// var transitionEnd = require("utils/event/transitionEnd");
// /** @type {module:utils/prefixedProperty} */
// var prefixed = require("utils/prefixedProperty");

/** @type {Function} */


var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */


var _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL"); // /** @type {Function} */
// var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");
// var whenSelectTransitionEnds = require("app/view/promise/whenSelectTransitionEnds");
// var whenDefaultImageLoads = require("app/view/promise/whenDefaultImageLoads");
// /** @type {Function} */
// var Color = require("color");
// var duotone = require("utils/canvas/bitmap/duotone");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");


var errorTemplate = require("../template/ErrorBlock.hbs");

var MIN_STEP_INTERVAL = 2 * Globals.TRANSITION_DURATION + Globals.TRANSITION_DELAY_INTERVAL;
var DEFAULT_STEP_INTERVAL = 6 * Globals.TRANSITION_DURATION + Globals.TRANSITION_DELAY_INTERVAL;
/* --------------------------- *
 * Private classes
 * --------------------------- */

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer.PrefetechedSourceRenderer}
 */

var PrefetechedSourceRenderer = View.extend({
  cidPrefix: "sequenceStepRenderer",

  /** @type {string} */
  className: "sequence-step",

  /** @type {string} */
  tagName: "img",
  properties: {
    ready: {
      get: function get() {
        return this._ready;
      }
    }
  },

  /** @override */
  initialize: function initialize(opts) {
    !this.el.hasAttribute("alt") && this.el.setAttribute("alt", this.model.get("src")); // this.el.setAttribute("longdesc", this.model.get("original"));

    if (this.model.has("prefetched")) {
      this._renderPrefetched();
    } else {
      this.listenTo(this.model, "change:prefetched", this._renderPrefetched);
    }

    this.listenTo(this.model, "selected deselected", this._renderSelection);

    this._renderSelection();
  },
  _renderSelection: function _renderSelection() {
    this.el.classList.toggle("current", !!this.model.selected);
  },
  _renderPrefetched: function _renderPrefetched() {
    var prefetched = this.model.get("prefetched");

    if (prefetched !== this.el.src) {
      this.el.src = prefetched;
    }

    _whenImageLoads(this.el).then(function (el) {
      this.requestAnimationFrame(function (tstamp) {
        this._setReady(true);
      });
    }.bind(this), function (err) {
      // this._setReady(false);
      err instanceof Error || (err = new Error("cannot load prefetched url"));
      throw err;
    }.bind(this));
  },

  /** @type {boolean} */
  _ready: false,
  _setReady: function _setReady(ready) {
    if (this._ready !== ready) {
      this._ready = !!ready; // make bool

      this.trigger("renderer:ready", this);
    }
  },
  render: function render() {
    // if (this.model.has("prefetched")) {
    // 	this._renderPrefetched();
    // }
    // this.el.classList.toggle("current", !!this.model.selected);
    console.log("%s::render", this.cid);
    return this;
  }
});
/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer.SimpleSourceRenderer}
 */
// var SimpleSourceRenderer = View.extend({
//
// 	cidPrefix: "sequenceStepRenderer",
// 	/** @type {string} */
// 	className: "sequence-step",
// 	/** @type {string} */
// 	tagName: "img",
//
// 	/** @override */
// 	initialize: function (options) {
// 		// this.el.classList.toggle("current", this.model.hasOwnProperty("selected"));
// 		this.el.classList.toggle("current", !!this.model.selected);
// 		this.listenTo(this.model, {
// 			"selected": function () {
// 				this.el.classList.add("current");
// 			},
// 			"deselected": function () {
// 				this.el.classList.remove("current");
// 			}
// 		});
// 		if (this.el.src === "") {
// 			this.el.src = Globals.MEDIA_DIR + "/" + this.model.get("src");
// 		}
//
// 		if (this.model.has("error")) {
// 			this._onModelError();
// 		} else {
// 			this.listenToOnce(this.model, "change:error", this._onModelError);
// 			// this.listenToOnce(this.model, {
// 			// 	"change:source": this._onModelSource,
// 			// 	"change:error": this._onModelError,
// 			// });
// 		}
// 	},
//
// 	// _onModelSource: function() {
// 	// 	this.el.src = Globals.MEDIA_DIR + "/" + this.model.get("src");
// 	// 	// console.log("%s::change:src", this.cid, this.model.get("src"));
// 	// },
//
// 	_onModelError: function() {
// 		var err = this.model.get("error");
// 		var errEl = document.createElement("div");
// 		errEl.className = "error color-bg" + (this.model.selected? " current" : "");
// 		errEl.innerHTML = errorTemplate(err);
// 		this.setElement(errEl, true);
// 		console.log("%s::change:error", this.cid, err.message, err.infoSrc);
// 	},
// });

var SourceErrorRenderer = View.extend({
  /** @type {string} */
  className: "sequence-step error",

  /** @override */
  cidPrefix: "sourceErrorRenderer",

  /** @override */
  template: errorTemplate,

  /** @type {boolean} */
  ready: true,
  initialize: function initialize(opts) {
    // var handleSelectionChange = function onSelectionChange () {
    // 	this.el.classList.toggle("current", !!this.model.selected);
    // };
    // this.listenTo(this.model, "selected deselected", handleSelectionChange);
    // // this.el.classList.toggle("current", !!this.model.selected);
    // handleSelectionChange.call(this);
    this.listenTo(this.model, "selected deselected", function () {
      this.el.classList.toggle("current", !!this.model.selected);
    });
  },
  render: function render() {
    this.el.classList.toggle("current", !!this.model.selected);
    this.el.innerHTML = this.template(this.model.get("error"));
    return this;
  }
});
var SequenceStepRenderer = PrefetechedSourceRenderer; // var SequenceStepRenderer = SimpleSourceRenderer;

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer}
 */

var SequenceRenderer = PlayableRenderer.extend({
  /** @type {string} */
  cidPrefix: "sequenceRenderer",

  /** @type {string} */
  className: PlayableRenderer.prototype.className + " sequence-item",

  /** @type {Function} */
  template: require("./SequenceRenderer.hbs"),

  /* --------------------------- *
  /* initialize
  /* --------------------------- */
  initialize: function initialize(opts) {
    this.sources = this.model.get("sources");
    PlayableRenderer.prototype.initialize.apply(this, arguments);
  },

  /* --------------------------- *
   * children
   * --------------------------- */

  /** @override */
  createChildren: function createChildren() {
    PlayableRenderer.prototype.createChildren.apply(this, arguments);
    this.placeholder = this.el.querySelector(".placeholder");
    this.sequence = this.content.querySelector(".sequence"); // styles
    // ---------------------------------

    var s,
        attrs = this.model.attrs(); // var s, attrs = this.model.get("attrs");

    s = _.pick(attrs, "box-shadow", "border", "border-radius");

    _.extend(this.content.querySelector(".media-border").style, s);

    s = _.pick(attrs, "border-radius");

    _.extend(this.sequence.style, s);

    _.extend(this.placeholder.style, s); // model
    // ---------------------------------


    this.sources.select(this.model.get("source")); // itemViews
    // ---------------------------------

    this.itemViews = new Container(); // add default image as renderer (already in DOM)

    this.itemViews.add(new SequenceStepRenderer({
      el: this.getDefaultImage(),
      model: this.model.get("source")
    }));
  },

  /* --------------------------- *
   * layout/render
   * --------------------------- */

  /** @override */
  render: function render() {
    PlayableRenderer.prototype.render.apply(this, arguments);
    var els, el, i, cssW, cssH;
    var content = this.content; // media-size
    // ---------------------------------

    cssW = this.metrics.media.width + "px";
    cssH = this.metrics.media.height + "px";
    els = this.el.querySelectorAll(".media-size");

    for (i = 0; i < els.length; i++) {
      el = els.item(i);
      el.style.width = cssW;
      el.style.height = cssH;
    }

    content.style.width = cssW;
    content.style.height = cssH; // content-position
    // ---------------------------------

    var cssX, cssY;
    cssX = this.metrics.content.x + "px";
    cssY = this.metrics.content.y + "px";
    content.style.left = cssX;
    content.style.top = cssY;
    el = this.el.querySelector(".controls"); // el.style.left = cssX;
    // el.style.top = cssY;

    el.style.width = this.metrics.content.width + "px";
    el.style.height = this.metrics.content.height + "px"; // // content-size
    // // ---------------------------------
    // cssW = this.metrics.content.width + "px";
    // cssH = this.metrics.content.height + "px";
    //
    // els = this.el.querySelectorAll(".content-size");
    // for (i = 0; i < els.length; i++) {
    // 	el = els.item(i);
    // 	el.style.width = cssW;
    // 	el.style.height = cssH;
    // }

    return this;
  },

  /* --------------------------- *
   * initializeAsync
   * --------------------------- */
  initializePlayable: function initializePlayable() {
    // model
    // ---------------------------------
    // this.sources.select(this.model.get("source"));
    this.content.classList.add("started"); // Sequence model
    // ---------------------------------

    PlayableRenderer.whenSelectionDistanceIs(this, 0) // .then(function(view) {
    // 	/* defaultImage is loaded, add `started` rightaway */
    // 	view.content.classList.add("started");
    // 	return view;
    // })
    .then(this._preloadAllItems, function (err) {
      return err instanceof View.ViewError ? void 0 : err; // Ignore ViewError
    });
    this._sequenceInterval = Math.max(parseInt(this.model.attr("@sequence-interval")), MIN_STEP_INTERVAL) || DEFAULT_STEP_INTERVAL; // timer
    // ---------------------------------

    /* timer will be started when _validatePlayback is called from _onModelSelected */

    this.timer = new Timer();
    this.listenTo(this, "view:removed", function () {
      this.timer.stop();
      this.stopListening(this.timer);
    });
    this.listenTo(this.timer, {
      "start": this._onTimerStart,
      "resume": this._onTimerResume,
      "pause": this._onTimerPause,
      "end": this._onTimerEnd // "stop": function () {}, // stop is only called on view remove

    }); // play-toggle-symbol
    // ---------------------------------

    this._playToggleSymbol = new PlayToggleSymbol(_.extend({
      el: this.el.querySelector(".play-toggle")
    }, this._playToggleSymbol || {})); // progress-meter model
    // ---------------------------------

    this._sourceProgressByIdx = this.sources.map(function () {
      return 0;
    });
    this._sourceProgressByIdx[0] = 1; // first item is already loaded
    // progress-meter
    // ---------------------------------

    this.progressMeter = new ProgressMeter({
      el: this.el.querySelector(".progress-meter"),
      color: this.model.attr("color"),
      // backgroundColor: this.model.attr("background-color"),
      values: {
        available: this._sourceProgressByIdx.concat()
      },
      maxValues: {
        amount: this.sources.length,
        available: this.sources.length
      },
      labelFn: function () {
        if (this.playbackRequested === false) return Globals.PAUSE_CHAR;
        return this.sources.selectedIndex + 1 + "/" + this.sources.length;
      }.bind(this)
    }); // this.el.querySelector(".top-bar")
    //		.appendChild(this.progressMeter.render().el);
  },
  initializeAsync: function initializeAsync() {
    return PlayableRenderer.prototype.initializeAsync.apply(this, arguments).then(function (view) {
      return view.whenAttached();
    }).then(function (view) {
      view.initializePlayable(); // view.updateOverlay(view.defaultImage, view.playToggle); //view.overlay);

      view.listenToSelection();
      return view;
    });
  },
  whenInitialized: function whenInitialized(view) {
    var retval = PlayableRenderer.prototype.whenInitialized.apply(this, arguments);

    view._validatePlayback();

    return retval;
  },

  /* --------------------------- *
   * _preloadAllItems
   * --------------------------- */
  _preloadAllItems: function _preloadAllItems(view) {
    view.once("view:remove", function () {
      var silent = {
        silent: true
      };
      view.sources.forEach(function (item, index, sources) {
        // view.stopListening(item, "change:progress");
        var prefetched = item.get("prefetched");

        if (prefetched && /^blob\:/.test(prefetched)) {
          item.set("progress", 0, silent);
          item.unset("prefetched", silent);
          URL.revokeObjectURL(prefetched);
        }
      });
    });
    return view.sources.reduce(function (lastPromise, item, index, sources) {
      return lastPromise.then(function (view) {
        if (view._viewPhase === "disposed") {
          /** do nothing */
          return view;
        } else if (item.has("prefetched")) {
          view._updateItemProgress(1, index);

          return view;
        } else {
          var onItemProgress = function onItemProgress(item, progress) {
            view._updateItemProgress(progress, index);
          };

          view.listenTo(item, "change:progress", onItemProgress);
          view.once("view:remove", function (view) {
            view.stopListening(item, "change:progress", onItemProgress);
          });
          return _loadImageAsObjectURL(item.get("original"), function (progress, request) {
            /* NOTE: Since we are calling URL.revokeObjectURL when view is removed, also abort incomplete requests. Otherwise, clear the callback reference from XMLHttpRequest.onprogress  */
            if (view._viewPhase === "disposed") {
              //console.warn("%s::_preloadAllItems aborting XHR [%s %s] (%s)", view.cid, request.status, request.readyState, item.get("original"), request);
              request.abort(); // request.onprogress = void 0;
            } else {
              item.set("progress", progress);
            }
          }).then(function (pUrl) {
            item.set({
              "progress": pUrl ? 1 : 0,
              "prefetched": pUrl
            });
            return view;
          }, function (err) {
            item.set({
              "progress": 0,
              "error": err
            });
            return view;
          });
        }
      });
    }, Promise.resolve(view));
  },
  // _preloadAllItems2: function(view) {
  // 	return view.sources.reduce(function(lastPromise, item, index, sources) {
  // 		return lastPromise.then(function(view) {
  // 			var itemView = view._getItemView(item);
  // 			return _whenImageLoads(itemView.el).then(function(url){
  // 				view._updateItemProgress(1, index);
  // 				return view;
  // 			}, function(err) {
  // 				view._updateItemProgress(0, index);
  // 				item.set("error", err);
  // 				return view;
  // 			});
  // 		});
  // 	}, Promise.resolve(view));
  // },
  _updateItemProgress: function _updateItemProgress(progress, index) {
    this._sourceProgressByIdx[index] = progress;

    if (this.progressMeter) {
      this.progressMeter.valueTo("available", this._sourceProgressByIdx, 300);
    }
  },

  /* ---------------------------
   * PlayableRenderer implementation
   * --------------------------- */

  /** @override initial value */
  _playbackRequested: true,

  /** @type {Boolean} internal store */
  _paused: true,

  /** @override */
  _isMediaPaused: function _isMediaPaused() {
    return this._paused;
  },

  /** @override */
  _playMedia: function _playMedia() {
    if (!this._paused) return;
    this._paused = false;

    if (!this._isMediaWaiting()) {
      if (this.timer.status === Timer.PAUSED) {
        this.timer.start(); // resume, actually
      } else {
        this.timer.start(this._sequenceInterval);
      }
    }
  },

  /** @override */
  _pauseMedia: function _pauseMedia() {
    if (this._paused) return;
    this._paused = true;

    if (this.timer.status === Timer.STARTED) {
      this.timer.pause();
    }
  },
  // /** @override */
  // _renderPlaybackState: function() {
  // 	// if (!this.content.classList.contains("started")) {
  // 	// 	this.content.classList.add("started");
  // 	// }
  // 	PlayableRenderer.prototype._renderPlaybackState.apply(this, arguments);
  // },

  /* --------------------------- *
  /* sequence private
  /* --------------------------- */
  _onTimerStart: function _onTimerStart(duration) {
    var item;

    if (this.sources.selectedIndex === -1) {
      item = this.model.get("source");
    } else {
      item = this.sources.followingOrFirst();
    }

    this.sources.select(item);
    this.progressMeter.valueTo("amount", this.sources.selectedIndex + 1, duration);
    this.content.classList.toggle("playback-error", item.has("error")); // var currView = this.itemViews.findByModel(item);
    // if (!item.has("error") && currView !== null) {
    // 	this._playToggleSymbol.setImageSource(currView.el);
    // 	// this.updateOverlay(currView.el, this.playToggle);
    // } else {
    // 	this._playToggleSymbol.setImageSource(null);
    // }
    // // init next renderer now to have smoother transitions
    // this._getItemView(this.sources.followingOrFirst());
  },
  _onTimerResume: function _onTimerResume(duration) {
    this.progressMeter.valueTo("amount", this.sources.selectedIndex + 1, duration);
  },
  _onTimerPause: function _onTimerPause(duration) {
    this.progressMeter.valueTo("amount", this.progressMeter.getRenderedValue("amount"), 0);
  },

  /* last completely played sequence index */
  // _lastPlayedIndex: -1,
  _onTimerEnd: function _onTimerEnd() {
    var nextItem, nextView;

    var showNextView = function (result) {
      // console.log("%s::showNextView %sms %s", context.cid, context._sequenceInterval, nextItem.cid)
      this.setImmediate(function () {
        if (!this.mediaPaused) {
          this.timer.start(this._sequenceInterval);
        }
      });
      return result;
    }.bind(this); // get next item init next renderer


    nextItem = this.sources.followingOrFirst();
    nextView = this._getItemView(nextItem);

    if (nextItem.has("error")) {
      showNextView();
    } else if (nextItem.has("prefetched")) {
      _whenImageLoads(nextView.el).then(showNextView, showNextView);
    } else {
      /* TODO: add ga event 'media-waiting' */
      // window.ga("send", "event", "sequence-item", "waiting", this.model.get("text"));
      // console.log("%s:[waiting] %sms %s", context.cid, nextItem.cid);
      this._toggleWaiting(true);

      this.listenToOnce(nextItem, "change:prefetched change:error", function (model) {
        // console.log("%s:[playing] %sms %s", context.cid, nextItem.cid);
        this._toggleWaiting(false);

        _whenImageLoads(nextView.el).then(showNextView, showNextView);
      });
    }
  },
  _getItemView: function _getItemView(item) {
    var view = this.itemViews.findByModel(item);

    if (!view) {
      view = new (item.has("error") ? SourceErrorRenderer : SequenceStepRenderer)({
        model: item
      });
      this.itemViews.add(view);
      this.sequence.appendChild(view.render().el);
    }

    return view;
  }
  /* --------------------------- *
  /* progress meter
  /* --------------------------- */
  // _createDefaultItemData: function() {
  // 	var canvas = document.createElement("canvas");
  // 	var context = canvas.getContext("2d");
  // 	var imageData = this._drawMediaElement(context).getImageData(0, 0, canvas.width, canvas.height);
  //
  // 	var opts = { radius: 20 };
  // 	var fgColor = new Color(this.model.attr("color"));
  // 	var bgColor = new Color(this.model.attr("background-color"));
  // 	var isFgDark = fgColor.luminosity() < bgColor.luminosity();
  // 	opts.x00 = isFgDark? Color(fgColor).lighten(0.33) : Color(bgColor).darken(0.33);
  // 	opts.xFF = isFgDark? Color(bgColor).lighten(0.33) : Color(fgColor).darken(0.33);
  //
  // 	stackBlurMono(imageData, opts);
  // 	duotone(imageData, opts);
  // 	// stackBlurRGB(imageData, opts);
  //
  // 	context.putImageData(imageData, 0, 0);
  // 	return canvas.toDataURL();
  // },

});

if (DEBUG) {
  SequenceRenderer = function (SequenceRenderer) {
    if (!SequenceRenderer.LOG_TO_SCREEN) return SequenceRenderer; // /** @type {module:underscore.strings/lpad} */
    // var rpad = require("underscore.string/rpad");

    /** @type {module:underscore.strings/lpad} */

    var lpad = require("underscore.string/lpad");
    /** @type {module:underscore.strings/capitalize} */


    var caps = require("underscore.string/capitalize");

    return SequenceRenderer.extend({
      /** @override */
      initialize: function initialize() {
        SequenceRenderer.prototype.initialize.apply(this, arguments);
        this.__logColors = _.extend({
          "media:play": "darkred",
          "media:pause": "darkred",
          "timer:start": "darkgreen",
          "timer:end": "darkgreen",
          "timer:resume": "green",
          "timer:pause": "green",
          "load:progress": "blue",
          "load:complete": "darkblue"
        }, this.__logColors);
      },
      // __getHeaderText: function() {
      // 	var fmt1 = function(s) {
      // 		return lpad(caps(s), 8).substr(0, 8).toUpperCase();
      // 	};
      // 	var fmt2 = function(s) {
      // 		return lpad(caps(s), 8).substr(0, 8).toUpperCase();
      // 	};
      // 	var o = {
      // 		"tstamp": fmt1,
      // 		"index": fmt2,
      // 		"duration": fmt1,
      // 		"playback": fmt1,
      // 		"media": fmt1,
      // 		"timer": fmt1,
      // 		"next": fmt1,
      // 	};
      // 	return Object.keys(o).map(function(s, i, a) {
      // 		return o[s](s);
      // 	}).join(" ");
      // 	// Object.keys(o).reduce(function(ss, s, i, a) {
      // 	// 	return ss + " " + lpad(caps(s), 8).substr(0, 8).toUpperCase();
      // 	// }, "");
      // },
      __getHeaderText: function __getHeaderText() {
        return ["tstamp", "index", "duration", "playback", "media", "timer", "next"].map(function (s, i, a) {
          return lpad(caps(s), 8).substr(0, 8).toUpperCase();
        }).join(" ");
      },
      __logTimerEvent: function __logTimerEvent(evname, msg) {
        var logMsg = [this.sources.selectedIndex, (this.timer.getDuration() * .001).toFixed(3), this.playbackRequested ? ">>" : "::", this.mediaPaused ? "paused" : this.mediaWaiting ? "waiting" : "playing", this.timer.getStatus(), this.sources.followingOrFirst().has("prefetched") ? "ready" : "pending"].map(function (s, i, a) {
          return lpad(s, 8).substr(0, 8).toUpperCase();
        });
        msg && logMsg.push(msg);
        logMsg = logMsg.join(" ");

        this.__logMessage(logMsg, evname); // console.log("%s::[%s] %s", this.cid, evname, logMsg);

      },
      _playMedia: function _playMedia() {
        this.__logTimerEvent("media:play");

        SequenceRenderer.prototype._playMedia.apply(this, arguments); // this.__logTimerEvent("< media:play");
        // console.log("%s::_playMedia()", this.cid);

      },
      _pauseMedia: function _pauseMedia() {
        this.__logTimerEvent("media:pause");

        SequenceRenderer.prototype._pauseMedia.apply(this, arguments); // this.__logTimerEvent("< media:pause");
        // console.log("%s::_pauseMedia()", this.cid);

      },
      _onTimerStart: function _onTimerStart() {
        this.__logTimerEvent("timer:start");

        SequenceRenderer.prototype._onTimerStart.apply(this, arguments);
      },
      _onTimerResume: function _onTimerResume() {
        this.__logTimerEvent("timer:resume");

        SequenceRenderer.prototype._onTimerResume.apply(this, arguments);
      },
      _onTimerPause: function _onTimerPause() {
        this.__logTimerEvent("timer:pause");

        SequenceRenderer.prototype._onTimerPause.apply(this, arguments);
      },
      _onTimerEnd: function _onTimerEnd() {
        this.__logTimerEvent("timer:end");

        SequenceRenderer.prototype._onTimerEnd.apply(this, arguments);
      },
      _updateItemProgress: function _updateItemProgress(progress, srcIdx) {
        if (progress == 1) {
          this.__logTimerEvent("load:complete", "item " + srcIdx + ": complete");
        } else if (srcIdx === this.sources.selectedIndex) {
          this.__logTimerEvent("load:progress", "item " + srcIdx + ": " + progress);
        }

        SequenceRenderer.prototype._updateItemProgress.apply(this, arguments);
      },
      _preloadAllItems: function _preloadAllItems(view) {
        view.__logMessage(view.cid + "::_preloadAllItems", "load:start");

        SequenceRenderer.prototype._preloadAllItems.apply(view, arguments);
      }
    });
  }(SequenceRenderer);
}

module.exports = SequenceRenderer;

}).call(this,true,require("underscore"))

},{"../template/ErrorBlock.hbs":122,"./SequenceRenderer.hbs":116,"app/control/Globals":55,"app/view/base/View":82,"app/view/component/CanvasProgressMeter":87,"app/view/component/PlayToggleSymbol":94,"app/view/promise/_loadImageAsObjectURL":97,"app/view/promise/_whenImageLoads":98,"app/view/render/PlayableRenderer":115,"backbone.babysitter":3,"underscore":51,"underscore.string/capitalize":41,"underscore.string/lpad":47,"utils/Timer":126}],118:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
var partial$0 = require('../template/svg/FullscreenSymbol.hbs');
HandlebarsCompiler.registerPartial('../template/svg/FullscreenSymbol.hbs', partial$0);
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"placeholder sizing\"></div>\n<div class=\"content media-border\">\n	<div class=\"controls content-size\">\n		<canvas class=\"progress-meter\"></canvas>\n	</div>\n	<div class=\"crop-box media-size\">\n		<video width=\"240\" height=\"180\" muted playsinline></video>\n		<img class=\"poster default\" alt=\""
    + container.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"text","hash":{},"data":data}) : helper)))
    + "\" width=\"240\" height=\"180\" />\n	</div>\n	<div class=\"overlay media-size play-toggle-hitarea\">\n			<canvas class=\"play-toggle\"></canvas>\n		<a class=\"fullscreen-toggle\" href=\"javascript:(void 0)\">\n"
    + ((stack1 = container.invokePartial(partials["../template/svg/FullscreenSymbol.hbs"],depth0,{"name":"../template/svg/FullscreenSymbol.hbs","data":data,"indent":"\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "		</a>\n	</div>\n</div>\n";
},"usePartial":true,"useData":true});

},{"../template/svg/FullscreenSymbol.hbs":125,"hbsfy/runtime":35}],119:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/*global HTMLMediaElement, MediaError*/

/**
 * @module app/view/render/VideoRenderer
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
 */

/* --------------------------- *
 * Imports
 * --------------------------- */
// /** @type {module:backbone} */
// var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/render/PlayableRenderer} */


var PlayableRenderer = require("app/view/render/PlayableRenderer");
/** @type {module:app/view/component/CanvasProgressMeter} */


var ProgressMeter = require("app/view/component/CanvasProgressMeter"); // /** @type {module:app/view/component/PlayToggleSymbol} */


var PlayToggleSymbol = require("app/view/component/PlayToggleSymbol"); // var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// /** @type {module:utils/prefixedStyleName} */
// var prefixedStyleName = require("utils/prefixedStyleName");

/** @type {module:utils/prefixedEvent} */


var prefixedEvent = require("utils/prefixedEvent"); // var whenViewIsAttached = require("app/view/promise/whenViewIsAttached");
// /** @type {Function} */
// var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");

/* --------------------------- *
 * private static
 * --------------------------- */


var fullscreenChangeEvent = prefixedEvent("fullscreenchange", document); // var fullscreenErrorEvent = prefixedEvent("fullscreenerror", document);

var formatTimecode = function formatTimecode(value) {
  if (isNaN(value)) return ""; //value = 0;

  if (value >= 3600) return (value / 3600 | 0) + "H";
  if (value >= 60) return (value / 60 | 0) + "M"; // if (value >= 10) return "0" + (value | 0) + "S";

  return (value | 0) + "S";
};

var VIDEO_CROP_PX = Globals.VIDEO_CROP_PX;
var SYNC_TIMEOUT_MS = 1200;
var SYNC_THRESHOLD_MS = 100;
/**
 * @constructor
 * @type {module:app/view/render/VideoRenderer}
 */

var VideoRenderer = PlayableRenderer.extend({
  /** @type {string} */
  cidPrefix: "videoRenderer",

  /** @type {string} */
  className: PlayableRenderer.prototype.className + " video-item",

  /** @type {Function} */
  template: require("./VideoRenderer.hbs"),
  // events: (function() {
  // 	var ret = {};
  // 	ret[PlayableRenderer.CLICK_EVENT + " .fullscreen-toggle"] = "_onFullscreenToggle";
  // 	return ret;
  // }()),
  // events: function() {
  // 	var events = {};
  // 	events[PlayableRenderer.CLICK_EVENT + " .fullscreen-toggle"] = "_onFullscreenToggle";
  // 	return _.extend(events, _.result(this, PlayableRenderer.prototype.events));
  // },
  // events: {
  // 	"click .fullscreen-toggle": "_onFullscreenToggle",
  // },
  properties: {
    fullscreenToggle: {
      /** @return {HTMLElement} */
      get: function get() {
        return this._fullscreenToggle || (this._fullscreenToggle = this.el.querySelector(".fullscreen-toggle"));
      }
    }
  },

  /** @override */
  initialize: function initialize(opts) {
    PlayableRenderer.prototype.initialize.apply(this, arguments);

    _.bindAll(this, "_updatePlaybackState", "_updateCurrTimeValue", "_updateBufferedValue", "_onMediaError", "_onMediaEnded", // "_onMediaPlayingOnce",
    "_onFullscreenChange", "_onFullscreenToggle");

    _.bindAll(this, "_playbackTimeoutFn_playing", "_playbackTimeoutFn_waiting"); // var onPeerSelect = function() {
    // 	this.content.style.display = (this.getSelectionDistance() > 1)? "none": "";
    // };
    // this.listenTo(this.model.collection, "select:one select:none", onPeerSelect);
    // onPeerSelect();

  },

  /* --------------------------- *
   * children
   * --------------------------- */

  /** @override */
  createChildren: function createChildren() {
    PlayableRenderer.prototype.createChildren.apply(this, arguments);
    this.placeholder = this.el.querySelector(".placeholder"); // this.overlay = this.content.querySelector(".overlay");

    this.video = this.content.querySelector("video"); // this.video.loop = this.model.attrs().hasOwnProperty("@video-loop");
    // this.video.setAttribute("muted", "muted");
    // this.video.setAttribute("playsinline", "playsinline");
    // if (this.model.attr("@video-loop") !== void 0) {
    // 	this.video.setAttribute("loop", "loop");
    // }

    this.video.setAttribute("preload", "none");
    if (this.video.controlList) this.video.controlList.add("nodownload"); // this.video.muted = true;
    // this.video.playsinline = true;
    // this.video.preload = "auto";

    this.video.loop = this.model.attr("@video-loop") !== void 0;
    this.video.src = this.findPlayableSource(this.video);
  },

  /* --------------------------- *
   * layout/render
   * --------------------------- */
  measure: function measure() {
    PlayableRenderer.prototype.measure.apply(this, arguments); // NOTE: Vertical 1px video crop
    // - Cropped in CSS: video, .poster { margin-top: -1px; margin-bottom: -1px;}
    // - Cropped height is adjusted in metrics obj
    // - Crop amount added back to actual video on render()

    this.metrics.media.height += VIDEO_CROP_PX * 2;
    this.metrics.content.height += VIDEO_CROP_PX * 2;
  },

  /** @override */
  render: function render() {
    PlayableRenderer.prototype.render.apply(this, arguments);
    var els, el, i, cssW, cssH;
    var img = this.defaultImage;
    var content = this.content; // media-size
    // ---------------------------------

    cssW = this.metrics.media.width + "px";
    cssH = this.metrics.media.height + "px";
    els = this.el.querySelectorAll(".media-size");

    for (i = 0; i < els.length; i++) {
      el = els.item(i);
      el.style.width = cssW;
      el.style.height = cssH;
    }

    content.style.width = cssW;
    content.style.height = this.metrics.media.height + VIDEO_CROP_PX + "px"; // content-position
    // ---------------------------------

    var cssX, cssY;
    cssX = this.metrics.content.x + "px";
    cssY = this.metrics.content.y + "px";
    content.style.left = cssX;
    content.style.top = cssY;
    el = this.el.querySelector(".controls"); // el.style.left = cssX;
    // controls.style.top = cssY;

    el.style.width = this.metrics.content.width + "px";
    el.style.height = this.metrics.content.height + "px"; // // content-size
    // // ---------------------------------
    // cssW = this.metrics.content.width + "px";
    // cssH = this.metrics.content.height + "px";
    //
    // els = this.el.querySelectorAll(".content-size");
    // for (i = 0; i < els.length; i++) {
    // 	el = els.item(i);
    // 	el.style.width = cssW;
    // 	el.style.height = cssH;
    // }
    // NOTE: elements below must use video's UNCROPPED height, so +2px

    this.video.setAttribute("width", this.metrics.media.width);
    this.video.setAttribute("height", this.metrics.media.height - VIDEO_CROP_PX * 2);
    img.setAttribute("width", this.metrics.media.width);
    img.setAttribute("height", this.metrics.media.height - VIDEO_CROP_PX * 2);
    return this;
  },

  /* --------------------------- *
   * initializeAsync
   * --------------------------- */
  initializeAsync: function initializeAsync() {
    return Promise.resolve(this).then(PlayableRenderer.whenSelectionIsContiguous).then(PlayableRenderer.whenScrollingEnds).then(PlayableRenderer.whenViewIsAttached).then(function (view) {
      // console.log("%s::initializeAsync [attached, scrollend, selected > %o, preload:%s] ('%o')", view.cid, view.model.getDistanceToSelected(), view.video.preload, view.model.get("name"));
      return Promise.all([PlayableRenderer.whenDefaultImageLoads(view), view.whenVideoHasMetadata(view)]).then(function () {
        return view;
      });
    }).then(function (view) {
      // console.log("%s::initializeAsync [defaultImage, preload:%s] ('%o')", view.cid, view.video.preload, view.model.get("name"));
      view.initializePlayable(); // view.updateOverlay(view.defaultImage, view.playToggle); //view.overlay);

      view.listenToSelection();
      return view;
    }); // videoEl.setAttribute("preload", "metadata");
  },
  initializePlayable: function initializePlayable() {
    // When selected for the first time
    // ---------------------------------
    PlayableRenderer.whenSelectionDistanceIs(this, 0).then(function (view) {
      view.video.setAttribute("preload", "auto");
      view.video.preload = "auto"; // console.log("%s::initializeAsync [selected, preload:%s] ('%o')", view.cid, view.video.preload, view.model.get("name"));

      return view;
    }).catch(function (reason) {
      if (reason instanceof PlayableRenderer.ViewError) {
        console.log("%s::%s", reason.view.cid, reason.message);
      } else {
        console.warn(reason); // return Promise.reject(reason);
      }
    }); // play-toggle-symbol
    // ---------------------------------

    this._playToggleSymbol = new PlayToggleSymbol(_.extend({
      el: this.el.querySelector(".play-toggle")
    }, this._playToggleSymbol || {})); // this._playToggleSymbol.setImageSource(this.defaultImage, 0, 0);
    // this.listenToElementOnce(this.video, "timeupdate", function(ev) {
    // 	this._playToggleSymbol.setImageSource(this.video);
    // });
    // progress-meter
    // ---------------------------------

    this.progressMeter = new ProgressMeter({
      el: this.el.querySelector(".progress-meter"),
      color: this.model.attr("color"),
      // backgroundColor: this.model.attr("background-color"),
      maxValues: {
        amount: this.video.duration,
        available: this.video.duration
      },
      labelFn: function (value, total) {
        if (!this._started || this.video.ended || isNaN(value)) {
          return formatTimecode(total);
        } else if (!this.playbackRequested) {
          return Globals.PAUSE_CHAR;
        } else {
          return formatTimecode(total - value);
        }
      }.bind(this)
    }); // this.el.querySelector(".controls").appendChild(this.progressMeter.el);
    // var el = this.el.querySelector(".progress-meter");
    // el.parentNode.replaceChild(this.progressMeter.el, el);
    // var parentEl = this.el.querySelector(".controls");
    // parentEl.insertBefore(this.progressMeter.el, parentEl.firstChild);
    // this._setPlayToggleSymbol("play-symbol");

    this._renderPlaybackState(); // listen to video events
    // ---------------------------------
    // this.video.poster = this.model.get("source").get("original");


    this.addMediaListeners();
  },

  /* --------------------------- *
   * whenVideoHasMetadata promise
   * --------------------------- */
  whenVideoHasMetadata: function whenVideoHasMetadata(view) {
    // NOTE: not pretty !!!
    return new Promise(function (resolve, reject) {
      var videoEl = view.video;
      var eventHandlers = {
        loadedmetadata: function loadedmetadata(ev) {
          if (ev) removeEventListeners(); // console.log("%s::whenVideoHasMetadata [%s] %s", view.cid, "resolved", ev ? ev.type : "sync");

          resolve(view);
        },
        abort: function abort(ev) {
          if (ev) removeEventListeners();
          reject(new PlayableRenderer.ViewError(view, new Error("whenVideoHasMetadata: view was removed")));
        },
        error: function error(ev) {
          if (ev) removeEventListeners();
          var err;

          if (videoEl.error) {
            err = new Error(_.invert(MediaError)[videoEl.error.code]);
            err.infoCode = videoEl.error.code;
          } else {
            err = new Error("Unspecified error");
          }

          err.infoSrc = videoEl.src;
          err.logMessage = "whenVideoHasMetadata: " + err.name + " " + err.infoSrc;
          err.logEvent = ev;
          reject(err);
        }
      }; //  (videoEl.preload == "auto" && videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)
      // 	(videoEl.preload == "metadata" && videoEl.readyState >= HTMLMediaElement.HAVE_METADATA)

      if (videoEl.error) {
        eventHandlers.error();
      } else if (videoEl.readyState >= HTMLMediaElement.HAVE_METADATA) {
        eventHandlers.loadedmetadata();
      } else {
        var sources = videoEl.querySelectorAll("source");
        var errTarget = sources.length > 0 ? sources.item(sources.length - 1) : videoEl;
        var errCapture = errTarget === videoEl; // use capture with HTMLMediaElement

        var removeEventListeners = function removeEventListeners() {
          errTarget.removeEventListener("error", eventHandlers.error, errCapture);

          for (var ev in eventHandlers) {
            if (ev !== "error" && eventHandlers.hasOwnProperty(ev)) {
              videoEl.removeEventListener(ev, eventHandlers[ev], false);
            }
          }
        };

        errTarget.addEventListener("error", eventHandlers.error, errCapture);

        for (var ev in eventHandlers) {
          if (ev !== "error" && eventHandlers.hasOwnProperty(ev)) {
            videoEl.addEventListener(ev, eventHandlers[ev], false);
          }
        }
        /* NOTE: MS Edge ignores js property, using setAttribute */


        videoEl.setAttribute("preload", "metadata");
        videoEl.preload = "metadata"; // videoEl.setAttribute("poster", view.get("source").get("original"));
        // videoEl.setAttribute("preload", "metadata");
        // videoEl.poster = view.model.get("source").get("original");
        // videoEl.loop = view.model.attr("@video-loop") !== void 0;
        // videoEl.src = view.findPlayableSource(videoEl);
        // videoEl.load();
        // console.log("%s::whenVideoHasMetadata [preload:%s]", view.cid, videoEl.preload);
      }
    });
  },
  findPlayableSource: function findPlayableSource(video) {
    var playable = this.model.get("sources").find(function (source) {
      return /^video\//.test(source.get("mime")) && video.canPlayType(source.get("mime")) != "";
    });
    return playable ? playable.get("original") : "";
  },

  /* ---------------------------
   * PlayableRenderer implementation
   * --------------------------- */
  // /** @override */
  // _canResumePlayback: function() {
  // 	return PlayableRenderer.prototype._canResumePlayback.apply(this, arguments) && this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  // },

  /** @override initial value */
  _playbackRequested: false,

  /** @override */
  _isMediaPaused: function _isMediaPaused() {
    return this.video.paused;
  },

  /** @override */
  _playMedia: function _playMedia() {
    if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && this.video.seekable.length == 0) {
      console.warn(this.cid, "WTF! got video data, but cannot seek, calling load()"); // this._logMessage("call:load", "got video data, but cannot seek, calling load()", "orange");

      if (_.isFunction(this.video.load)) {
        this.video.load();
      }
    }
    /* NOTE: loop is false, restart from end on request */
    else if (this.video.ended) {
        this.video.currentTime = this.video.seekable.start(0);
      }
    /* if not enough data */


    if (this.video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      if (this.video.networkState == HTMLMediaElement.NETWORK_IDLE) {
        this.video.load();
      } //else {
      // var _playStamp = this._playbackCount;
      // console.log("%s::_playMedia %s waiting [#%s]", this.cid, this._isMediaWaiting() ? "continue" : "begin", _playStamp);
      //
      // this.listenToElementOnce(this.video, "canplaythrough", function(ev) {
      // 	console.log("%s::_playMedia end waiting [#%s]", this.cid, _playStamp);
      //
      // 	this._toggleWaiting(false);
      // 	// this.playbackRequested && this.video.play();
      // 	this._validatePlayback();
      // });
      //}

      /* NOTE: on "canplaythrough" _playMedia() will be called again if still required */


      this._toggleWaiting(true);
    }
    /* play */
    else {
        /* NOTE: current browsers return a promise */
        this.video.play();
      }
  },

  /** @override */
  _pauseMedia: function _pauseMedia() {
    // this._setPlayToggleSymbol("play-symbol");
    this.video.pause(); // this._renderPlaybackState();
  },

  /* ---------------------------
  /* DOM events
  /* --------------------------- */
  _listenWhileSelected: function _listenWhileSelected() {
    PlayableRenderer.prototype._listenWhileSelected.apply(this, arguments);

    this.fullscreenToggle.addEventListener(this._toggleEvent, this._onFullscreenToggle, false);
  },
  _stopListeningWhileSelected: function _stopListeningWhileSelected() {
    PlayableRenderer.prototype._stopListeningWhileSelected.apply(this, arguments);

    this.fullscreenToggle.removeEventListener(this._toggleEvent, this._onFullscreenToggle, false);
  },

  /* ---------------------------
  /* media events
  /* --------------------------- */
  addMediaListeners: function addMediaListeners() {
    // if (!this._started) {
    // 	this.addListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
    // }
    this.addListeners(this.video, this.updatePlaybackEvents, this._updatePlaybackState);
    this.addListeners(this.video, this.updateBufferedEvents, this._updateBufferedValue);
    this.addListeners(this.video, this.updateCurrTimeEvents, this._updateCurrTimeValue);
    this.video.addEventListener("ended", this._onMediaEnded, false);
    this.video.addEventListener("error", this._onMediaError, true);
    this.on("view:removed", this.removeMediaListeners, this);
  },
  removeMediaListeners: function removeMediaListeners() {
    this.off("view:removed", this.removeMediaListeners, this); // if (!this._started) {
    // 	this.removeListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
    // }

    this.removeListeners(this.video, this.updatePlaybackEvents, this._updatePlaybackState);
    this.removeListeners(this.video, this.updateBufferedEvents, this._updateBufferedValue);
    this.removeListeners(this.video, this.updateCurrTimeEvents, this._updateCurrTimeValue);
    this.video.removeEventListener("ended", this._onMediaEnded, false);
    this.video.removeEventListener("error", this._onMediaError, true);
  },

  /* ---------------------------
  /* media event handlers
  /* --------------------------- */
  _onMediaError: function _onMediaError(ev) {
    this.removeMediaListeners();
    this.removeSelectionListeners();
    this._started = false;
    this.content.classList.remove("started");
    this.mediaState = "error";
    this.playbackRequested = false; // this.content.classList.remove("ended");
    // this.content.classList.remove("waiting");

    this._exitFullscreen();
  },
  _onMediaEnded: function _onMediaEnded(ev) {
    this.playbackRequested = false;

    this._exitFullscreen();
  },
  _exitFullscreen: function _exitFullscreen() {
    /* NOTE: polyfill should handle this on iOS? */
    if (this.video.webkitDisplayingFullscreen) {
      this.video.webkitExitFullscreen();
    }

    if (document.fullscreenElement === this.video) {
      this.video.exitFullscreen();
    }
  },

  /* ---------------------------
  /* _onMediaPlayingOnce
  /* --------------------------- */
  // playingOnceEvents: "playing waiting",
  //
  // _onMediaPlayingOnce: function(ev) {
  // 	this.removeListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
  // 	if (!this._started) {
  // 		this._started = true;
  // 		this.content.classList.add("started");
  // 	}
  // },

  /* ---------------------------
  /* _updateCurrTimeValue
  /* --------------------------- */
  updateCurrTimeEvents: "playing waiting pause timeupdate seeked",
  //.split(" "),
  _updateCurrTimeValue: function _updateCurrTimeValue(ev) {
    if (this.video.played.length) {
      this.content.classList.add("started");
    }

    if (this.progressMeter) {
      this.progressMeter.valueTo("amount", this.video.currentTime, 0);
    }
  },

  /* ---------------------------
  /* _updatePlaybackState
  /* --------------------------- */
  // updatePlaybackEvents: "playing play waiting pause seeking seeked ended",
  updatePlaybackEvents: "timeupdate playing pause waiting canplaythrough seeked",
  _isPlaybackWaiting: false,
  _playbackStartTS: -1,
  _playbackStartTC: -1,
  _updatePlaybackState: function _updatePlaybackState(ev) {
    // var isWaiting = false;
    // var symbolName = "play-symbol";
    // NOTE: clearTimeout will cancel both setTimeout and setInterval IDs
    window.clearTimeout(this._playbackTimeoutID);
    this._playbackTimeoutID = -1;

    if (this.playbackRequested) {
      if (ev.type !== "timeupdate") {
        this._playbackStartTS = ev.timeStamp;
        this._playbackStartTC = this.video.currentTime;
      }

      switch (ev.type) {
        case "timeupdate":
          if (SYNC_THRESHOLD_MS < Math.abs(ev.timeStamp - this._playbackStartTS - (this.video.currentTime - this._playbackStartTC) * 1000)) {
            this._playbackStartTS = ev.timeStamp;
            this._playbackStartTC = this.video.currentTime;
            this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_waiting, SYNC_TIMEOUT_MS);

            this._toggleWaiting(true); // break;

          } else {
            this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);

            this._toggleWaiting(false);
          }

          break;

        case "playing":
          this._playbackStartTS = ev.timeStamp;
          this._playbackStartTC = this.video.currentTime;
          this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);

          this._toggleWaiting(false);

          break;

        case "pause":
          /* NOTE: this.playbackRequested is true, the pause wasn't triggered
           * from UI, but by the waiting handler below, so we treat it as
           * waiting */
          // if (!this.playbackRequested) {
          // 	this._toggleWaiting(false);
          // }
          this._toggleWaiting(this.playbackRequested);

          break;

        case "canplaythrough":
          this._toggleWaiting(false);

          this._validatePlayback();

          break;

        case "waiting":
          /* NOTE: if the video is seeking, give it a chance to resume, so do
           * nothing, and handle things on seeked/playing */
          if (!this.video.seeking) {
            /* if not enough data */
            if (this.video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
              this.video.pause(); // this.listenToElementOnce(this.video, "canplaythrough", function() {
              // 	this._toggleWaiting(false);
              // 	this._validatePlayback();
              // this.playbackRequested && this.video.play();
              // });
            }

            this._toggleWaiting(true);
          }

          break;

        default:
          this._toggleWaiting(false);

          break;
      }
    } else {
      this._toggleWaiting(false);
    }
  },
  _playbackTimeoutID: -1,
  _playbackTimeoutFn_playing: function _playbackTimeoutFn_playing() {
    this._playbackTimeoutID = -1;

    this._toggleWaiting(true); // this._renderPlaybackState();
    // this._setPlayToggleSymbol("waiting-symbol");
    // this.content.classList.add("waiting");
    // this.progressMeter.stalled = true;
    // this._isPlaybackWaiting = true;

  },
  _playbackTimeoutFn_waiting: function _playbackTimeoutFn_waiting() {
    if (SYNC_THRESHOLD_MS < (this.video.currentTime - this._playbackStartTC) * 1000) {
      this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_waiting, SYNC_TIMEOUT_MS);
    } else {
      // since there is no event.timeStamp
      // var delta = this.video.currentTime - this._playbackStartTC;
      // this._playbackStartTS += delta * 1000;
      // this._playbackStartTS = window.performance.now();
      this._playbackStartTS += SYNC_TIMEOUT_MS;
      this._playbackStartTC = this.video.currentTime;
      this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);

      this._toggleWaiting(false); // this._renderPlaybackState();
      // this._setPlayToggleSymbol("pause-symbol");
      // this.content.classList.remove("waiting");
      // this.progressMeter.stalled = false;
      // this._isPlaybackWaiting = false;

    }
  },

  /** @override */
  _renderPlaybackState: function _renderPlaybackState() {
    // if (DEBUG) {
    // 	this.__logMessage([
    // 	"mediaState:", this.mediaState,
    // 	"played:", this.video.played.length,
    // 	"ended:", this.video.ended,
    // 	"toggle.paused:", this._playToggleSymbol.paused
    // ].join(" "), "_renderPlaybackState");
    // }
    // console.log("%s::_renderPlaybackState mediaState:%s played:%o ended:%o",
    // 	this.cid, this.mediaState, this.video.played.length, this.video.ended);
    //
    // if (this.mediaState === "ready") {
    // 	this.updateOverlay(this.video, this.playToggle);
    // }
    var cls = this.content.classList; // if (!this._started && this.playbackRequested &&
    // 		this.video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
    // 	this._started = true;
    // 	cls.add("started");
    // }
    // cls.toggle("started", (this.video.played.length > 0));

    cls.toggle("ended", this.video.ended);

    PlayableRenderer.prototype._renderPlaybackState.apply(this, arguments);
  },
  _setPlayToggleSymbol: function _setPlayToggleSymbol(symbolName) {
    // if (this.video.ended) {
    // 	console.log("%s::_setPlayToggleSymbol %s -> ended", this.cid, symbolName);
    // }
    // if (this.mediaState === "ready") {
    // 	if (this.playbackRequested && !this._isMediaWaiting()) {
    // 		this._playToggleSymbol.setImageSource(null);
    // 	} else {
    // 		this._playToggleSymbol.setImageSource(this.video);
    // 	}
    // 	this._playToggleSymbol.refreshImageSource();
    // }
    return PlayableRenderer.prototype._setPlayToggleSymbol.call(this, this.video.ended ? "ended" : symbolName);
  },

  /* ---------------------------
  /* _updateBufferedValue
  /* --------------------------- */
  // updateBufferedEvents: "progress canplay canplaythrough playing timeupdate",//loadeddata
  updateBufferedEvents: "progress canplay canplaythrough play playing",
  _updateBufferedValue: function _updateBufferedValue(ev) {
    // if (!this._started) return;
    var bRanges = this.video.buffered;

    if (bRanges.length > 0) {
      this._bufferedValue = bRanges.end(bRanges.length - 1);

      if (this.progressMeter && this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        this.progressMeter.valueTo("available", this._bufferedValue, 300); // this.progressMeter.valueTo("available", this._bufferedValue, Math.max(0, 1000 * (this._bufferedValue - (this.progressMeter.getTargetValue("available") | 0))));
      }
    }
  },

  /* ---------------------------
  /* fullscreen api
  /* --------------------------- */
  _onFullscreenToggle: function _onFullscreenToggle(ev) {
    // NOTE: Ignore if MouseEvent.button is 0 or undefined (0: left-button)
    if (!ev.defaultPrevented && !ev.button && this.model.selected) {
      ev.preventDefault();

      try {
        if (document.hasOwnProperty("fullscreenElement") && document.fullscreenElement !== this.video) {
          document.addEventListener(fullscreenChangeEvent, this._onFullscreenChange, false);
          this.video.requestFullscreen();
        } else if (this.video.webkitSupportsFullscreen && !this.video.webkitDisplayingFullscreen) {
          this.video.addEventListener("webkitbeginfullscreen", this._onFullscreenChange, false);
          this.video.webkitEnterFullScreen();
        }
      } catch (err) {
        this.video.controls = false;
        console.error(err);
      }
    }
  },
  _onFullscreenChange: function _onFullscreenChange(ev) {
    switch (ev.type) {
      case fullscreenChangeEvent:
        // var isOwnFullscreen = Modernizr.prefixed("fullscreenElement", document) === this.video;
        var isOwnFullscreen = document.fullscreenElement === this.video;
        this.video.controls = isOwnFullscreen;

        if (!isOwnFullscreen) {
          document.removeEventListener(fullscreenChangeEvent, this._onFullscreenChange, false);
        }

        break;

      case "webkitbeginfullscreen":
        this.video.controls = true;
        this.video.removeEventListener("webkitbeginfullscreen", this._onFullscreenChange, false);
        this.video.addEventListener("webkitendfullscreen", this._onFullscreenChange, false);
        break;

      case "webkitendfullscreen":
        this.video.removeEventListener("webkitendfullscreen", this._onFullscreenChange, false);
        this.video.controls = false;
        break;
    }
  }
});
module.exports = VideoRenderer;
/* ---------------------------
/* log to screen
/* --------------------------- */

if (DEBUG) {
  module.exports = function (VideoRenderer) {
    if (!VideoRenderer.LOG_TO_SCREEN) return VideoRenderer;
    /** @type {Function} */

    var Color = require("color");
    /** @type {module:underscore.strings/lpad} */


    var lpad = require("underscore.string/lpad");
    /** @type {module:underscore.strings/rpad} */


    var rpad = require("underscore.string/rpad"); // var fullscreenEvents = [
    // 	fullscreenChangeEvent, fullscreenErrorEvent,
    // 	"webkitbeginfullscreen", "webkitendfullscreen",
    // ];


    var mediaEvents = require("utils/event/mediaEventsEnum");

    var logPlaybackStateEvents, logBufferedEvents, logPlayedEvents; // logPlaybackStateEvents = ["playing", "waiting", "ended", "pause", "seeking", "seeked"];
    // logBufferedEvents = ["progress", "durationchange", "canplay", "play"];
    // logPlayedEvents = ["playing", "timeupdate"];

    logPlaybackStateEvents = ["loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled"];
    logBufferedEvents = ["loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting", "seeking", // seeking changed to true
    "seeked", // seeking changed to false
    "ended"];
    logPlayedEvents = ["play", "pause"]; // Exclude some events from log

    mediaEvents = _.without(mediaEvents, "resize", "error"); // Make sure event subsets exist in the main set

    logPlaybackStateEvents = _.intersection(mediaEvents, logPlaybackStateEvents);
    logBufferedEvents = _.intersection(mediaEvents, logBufferedEvents);
    logPlayedEvents = _.intersection(mediaEvents, logPlayedEvents);

    var readyStateSymbols = _.invert(_.pick(HTMLMediaElement, function (val, key, obj) {
      return /^HAVE_/.test(key);
    }));

    var readyStateToString = function readyStateToString(el) {
      return readyStateSymbols[el.readyState] + "(" + el.readyState + ")";
    };

    var networkStateSymbols = _.invert(_.pick(HTMLMediaElement, function (val, key, obj) {
      return /^NETWORK_/.test(key);
    }));

    var networkStateToString = function networkStateToString(el) {
      return networkStateSymbols[el.networkState] + "(" + el.networkState + ")";
    };

    var mediaErrorSymbols = _.invert(MediaError);

    var mediaErrorToString = function mediaErrorToString(el) {
      return el.error ? mediaErrorSymbols[el.error.code] + "(" + el.error.code + ")" : "[MediaError null]";
    };

    var findRangeIndex = function findRangeIndex(range, currTime) {
      for (var i = 0, ii = range.length; i < ii; i++) {
        if (range.start(i) <= currTime && currTime <= range.end(i)) {
          return i;
        }
      }

      return -1;
    };

    var formatVideoError = function formatVideoError(video) {
      return [mediaErrorToString(video), networkStateToString(video), readyStateToString(video)].join(" ");
    };

    var getVideoStatsCols = function getVideoStatsCols() {
      return "0000.000 [Curr/Total] [Seekable]  [Buffered]  networkState readyState      Playback"; // return "0000.620 [t:  0.0  27.4] [s: 27.4 0/1] [b:  0.5 0/1] LOADING(2)   FUTURE_DATA(3)  :: (::)";
    };

    var formatVideoStats = function formatVideoStats(video) {
      var currTime = video.currentTime,
          durTime = video.duration,
          bRanges = video.buffered,
          bRangeIdx,
          sRanges = video.seekable,
          sRangeIdx;
      bRangeIdx = findRangeIndex(bRanges, currTime);
      sRangeIdx = findRangeIndex(sRanges, currTime);
      return ["[" + lpad(currTime.toFixed(1), 5) + " " + lpad(!isNaN(durTime) ? durTime.toFixed(1) : "-", 4) + "]", "[" + lpad(sRangeIdx >= 0 ? sRanges.end(sRangeIdx).toFixed(1) : "-", 5) + " " + (sRangeIdx >= 0 ? sRangeIdx : "-") + "/" + sRanges.length + "]", "[" + lpad(bRangeIdx >= 0 ? bRanges.end(bRangeIdx).toFixed(1) : "-", 5) + " " + (bRangeIdx >= 0 ? bRangeIdx : "-") + "/" + bRanges.length + "]", rpad(networkStateToString(video).substr(8), 12), rpad(readyStateToString(video).substr(5), 15), video.ended ? ">:" : video.paused ? "::" : ">>"]; //.join(" ");
    };

    return VideoRenderer.extend({
      /** @override */
      initialize: function initialize() {
        VideoRenderer.prototype.initialize.apply(this, arguments);

        _.bindAll(this, "__handleMediaEvent");

        var fgColor = this.model.attr("color"),
            red = new Color("red"),
            blue = new Color("blue"),
            green = new Color("green");

        for (var i = 0; i < mediaEvents.length; i++) {
          var ev = mediaEvents[i];
          this.video.addEventListener(ev, this.__handleMediaEvent, false);
          var c = new Color(fgColor),
              cc = 1;
          if (logBufferedEvents.indexOf(ev) != -1) c.mix(green, cc /= 2);
          if (logPlayedEvents.indexOf(ev) != -1) c.mix(red, cc /= 2);
          if (logPlaybackStateEvents.indexOf(ev) != -1) c.mix(blue, cc /= 2);
          this.__logColors[ev] = c.rgb().string();
        }

        this.video.addEventListener("error", this.__handleMediaEvent, true);
      },

      /** @override */
      remove: function remove() {
        VideoRenderer.prototype.remove.apply(this, arguments);

        for (var i = 0; i < mediaEvents.length; i++) {
          if (mediaEvents[i] == "error") continue;
          this.video.removeEventListener(mediaEvents[i], this.__handleMediaEvent, false);
        }

        this.video.removeEventListener("error", this.__handleMediaEvent, true);
      },
      // /** @override */
      // _onVisibilityChange: function(ev) {
      // 	VideoRenderer.prototype._onVisibilityChange.apply(this, arguments);
      // 	var stateVal = Modernizr.prefixed("visibilityState", document);
      // 	this.__logEvent("visibilityState:" + stateVal, ev.type + ":" + stateVal);
      // },
      //
      // /** @override */
      // _onFullscreenChange: function(ev) {
      // 	VideoRenderer.prototype._onFullscreenChange.apply(this, arguments);
      // 	var logtype = (document.fullscreenElement === this.video ? "enter:" : "exit:") + ev.type;
      // 	this.__logEvent("document.fullscreenElement: " + this.cid, logtype);
      // },

      /** @override */
      _onFullscreenToggle: function _onFullscreenToggle(ev) {
        if (!ev.defaultPrevented && this.model.selected) {
          this.__logEvent("fullscreen-toggle", ev.type);
        }

        VideoRenderer.prototype._onFullscreenToggle.apply(this, arguments);
      },

      /** @override */
      _playbackTimeoutFn_playing: function _playbackTimeoutFn_playing() {
        VideoRenderer.prototype._playbackTimeoutFn_playing.apply(this, arguments); // this.__logEvent(formatVideoStats(this.video).join(" "), "timeout-play");


        this.__handleMediaEvent({
          type: "timeout-play",
          timeStamp: null,
          isTimeout: true
        });
      },

      /** @override */
      _playbackTimeoutFn_waiting: function _playbackTimeoutFn_waiting() {
        VideoRenderer.prototype._playbackTimeoutFn_waiting.apply(this, arguments); // this.__logEvent(formatVideoStats(this.video).join(" "), "timeout-wait");


        this.__handleMediaEvent({
          type: "timeout-wait",
          timeStamp: null,
          isTimeout: true
        });
      },
      __handleMediaEvent: function __handleMediaEvent(ev) {
        var evmsg = formatVideoStats(this.video);

        if (this.playbackRequested === true) {
          evmsg.push("(>>)");
        } else if (this.playbackRequested === false) {
          evmsg.push("(::)");
        } else {
          evmsg.push("(--)");
        }

        if (this.playbackRequested) {
          evmsg.push(this._playbackTimeoutID !== -1 ? "W" : "-");
        } else {
          evmsg.push(this._playbackTimeoutID !== -1 ? "?" : "!");
        } // evmsg.push(this._playToggleSymbol.symbolName);


        var ts, tc;

        if (this.updatePlaybackEvents.indexOf(ev.type) > -1 || ev.isTimeout) {
          // evmsg.push(this._playbackStartTS.toFixed(2));
          ts = ev.timeStamp - this._playbackStartTS;
          tc = this.video.currentTime - this._playbackStartTC;
          ts *= .001; // s to ms

          evmsg.push(Math.abs(tc - ts).toFixed(3));
        } // else {
        // 	ts = this._playbackStartTS;
        // 	tc = this._playbackStartTC;
        // }
        // ts *= .001; // s to ms
        // evmsg.push(Math.abs(tc - ts).toFixed(3));
        // evmsg.push("TC:" + tc.toFixed(3));
        // evmsg.push("TS:" + ts.toFixed(3));


        this.__logEvent(evmsg.join(" "), ev.type);

        if (ev.type === "error" || ev.type === "abort") {
          this.__logMessage(formatVideoError(this.video), ev.type);
        }
      },
      __logEvent: function __logEvent(msg, logtype, color) {
        var logEntryEl = this.__logElement.lastElementChild;

        if (logEntryEl && logEntryEl.getAttribute("data-logtype") == logtype && (logtype === "timeupdate" || logtype === "progress")) {
          var logRepeatVal = parseInt(logEntryEl.getAttribute("data-logrepeat"));
          logEntryEl.textContent = this.__getTStamp() + " " + msg;
          logEntryEl.setAttribute("data-logrepeat", isNaN(logRepeatVal) ? 2 : ++logRepeatVal);
        } else {
          this.__logMessage(msg, logtype, color);
        }
      },
      __getHeaderText: function __getHeaderText() {
        return getVideoStatsCols();
      }
    });
  }(module.exports);
}

}).call(this,true,require("underscore"))

},{"./VideoRenderer.hbs":118,"app/control/Globals":55,"app/view/component/CanvasProgressMeter":87,"app/view/component/PlayToggleSymbol":94,"app/view/render/PlayableRenderer":115,"color":12,"underscore":51,"underscore.string/lpad":47,"underscore.string/rpad":49,"utils/event/mediaEventsEnum":143,"utils/prefixedEvent":145}],120:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function";

  return "<div id=\"desc_b"
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"content sizing mdown\">"
    + ((stack1 = ((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"desc","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});

},{"hbsfy/runtime":35}],121:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function";

  return "<div id=\"desc_m"
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"content sizing\"><p>"
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</p>"
    + ((stack1 = ((helper = (helper = helpers.sub || (depth0 != null ? depth0.sub : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sub","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});

},{"hbsfy/runtime":35}],122:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "		<p><code>"
    + container.escapeExpression(((helper = (helper = helpers.infoSrc || (depth0 != null ? depth0.infoSrc : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"infoSrc","hash":{},"data":data}) : helper)))
    + "</code></p>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"error-title color-fg color-reverse\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</div>\n<div class=\"error-message color-fg\">\n	<p><strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong> <code>"
    + alias4(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"message","hash":{},"data":data}) : helper)))
    + "</code></p>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.infoSrc : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});

},{"hbsfy/runtime":35}],123:[function(require,module,exports){
"use strict";

// var Handlebars = require("handlebars")["default"];
var Handlebars = require("hbsfy/runtime");
/** @type {Function} */


var Color = require("color");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals"); // (function() {


var helpers = {
  /*
  /* Arithmetic helpers
  /*/
  add: function add(value, addition) {
    return value + addition;
  },
  subtract: function subtract(value, substraction) {
    return value - substraction;
  },
  divide: function divide(value, divisor) {
    return value / divisor;
  },
  multiply: function multiply(value, multiplier) {
    return value * multiplier;
  },
  floor: function floor(value) {
    return Math.floor(value);
  },
  ceil: function ceil(value) {
    return Math.ceil(value);
  },
  round: function round(value) {
    return Math.round(value);
  },
  global: function global(value) {
    return Globals[value];
  },

  /*
  /* Flow control helpers
  /*/
  is: function is(a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
  },
  isnot: function isnot(a, b, opts) {
    return a !== b ? opts.fn(this) : opts.inverse(this);
  },
  isany: function isany(value) {
    var i = 0,
        ii = arguments.length - 2,
        opts = arguments[ii + 1];

    do {
      if (value === arguments[++i]) {
        return opts.fn(this);
      }
    } while (i < ii);

    return opts.inverse(this);
  },
  contains: function contains(a, b, opts) {
    return a.indexOf(b) !== -1 ? opts.fn(this) : opts.inverse(this);
  },
  ignore: function ignore() {
    return "";
  },

  /*
  /* Color helpers
  /*/
  mix: function mix(colora, colorb, amount) {
    return new Color(colora).mix(new Color(colorb), amount).rgb().string();
  },
  lighten: function lighten(color, amount) {
    return new Color(color).lighten(amount).rgb().string();
  },
  darken: function darken(color, amount) {
    return new Color(color).darken(amount).rgb().string();
  } // colorFormat: function(color, fmt) {
  // 	switch (fmt) {
  // 		case "rgb":
  // 			return new Color(color).rgb().string();
  // 		case "hsl":
  // 			return new Color(color).hsl().string();
  // 		case "hex": default:
  // 			return new Color(color).hex().string();
  // 	}
  // },

};

for (var helper in helpers) {
  if (helpers.hasOwnProperty(helper)) {
    Handlebars.registerHelper(helper, helpers[helper]);
  }
} // })();
// module.exports = Handlebars;

},{"app/control/Globals":55,"color":12,"hbsfy/runtime":35}],124:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<svg class=\"cog-symbol icon\" viewBox=\"-100 -100 200 200\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMidYMid meet\">\n	<path d=\"M11.754,-99.307c-7.809,-0.924 -15.699,-0.924 -23.508,0l-3.73,20.82c-6.254,1.234 -12.338,3.21 -18.123,5.888l-15.255,-14.651c-6.861,3.842 -13.244,8.48 -19.018,13.818l9.22,19.036c-4.335,4.674 -8.095,9.849 -11.201,15.416l-20.953,-2.886c-3.292,7.141 -5.731,14.645 -7.265,22.357l18.648,9.981c-0.759,6.329 -0.759,12.727 0,19.056l-18.648,9.981c1.534,7.712 3.973,15.216 7.265,22.357l20.953,-2.886c3.106,5.567 6.866,10.742 11.201,15.416l-9.22,19.036c5.774,5.338 12.157,9.976 19.018,13.818l15.255,-14.651c5.785,2.678 11.869,4.654 18.123,5.888l3.73,20.82c7.809,0.924 15.699,0.924 23.508,0l3.73,-20.82c6.254,-1.234 12.338,-3.21 18.123,-5.888l15.255,14.651c6.861,-3.842 13.244,-8.48 19.018,-13.818l-9.22,-19.036c4.335,-4.674 8.095,-9.849 11.201,-15.416l20.953,2.886c3.292,-7.141 5.731,-14.645 7.265,-22.357l-18.648,-9.981c0.759,-6.329 0.759,-12.727 0,-19.056l18.648,-9.981c-1.534,-7.712 -3.973,-15.216 -7.265,-22.357l-20.953,2.886c-3.106,-5.567 -6.866,-10.742 -11.201,-15.416l9.22,-19.036c-5.774,-5.338 -12.157,-9.976 -19.018,-13.818l-15.255,14.651c-5.785,-2.678 -11.869,-4.654 -18.123,-5.888l-3.73,-20.82ZM0,-33c18.213,0 33,14.787 33,33c0,18.213 -14.787,33 -33,33c-18.213,0 -33,-14.787 -33,-33c0,-18.213 14.787,-33 33,-33Z\" style=\"fill:currentColor;fill-rule:evenodd;\"/>\n</svg>\n";
},"useData":true});

},{"hbsfy/runtime":35}],125:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<svg class=\"fullscreen-symbol\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"-21 -21 42 42\">\n	<path id=\"fullscreen-shadow\" d=\"M-5,5 L-20,20 M-7,20 L-20,20 L-20,7 M5,-5 L20,-20 M7,-20 L20,-20 L20,-7\" class=\"bg-color-stroke\" style=\"fill:none\" vector-effect=\"non-scaling-stroke\" transform=\"translate(2 2)\"/>\n	<path id=\"fullscreen-path\" d=\"M-5,5 L-20,20 M-7,20 L-20,20 L-20,7 M5,-5 L20,-20 M7,-20 L20,-20 L20,-7\" class=\"color-stroke\" style=\"fill:none\" vector-effect=\"non-scaling-stroke\" />\n</svg>\n";
},"useData":true});

},{"hbsfy/runtime":35}],126:[function(require,module,exports){
(function (_){
"use strict";

/** @type {module:backbone} */
var Events = require("backbone").Events; // var defaultOptions = {
// 	tick: 1,
// 	onstart: null,
// 	ontick: null,
// 	onpause: null,
// 	onstop: null,
// 	onend: null
// }


var idSeed = 0;

var Timer = function Timer(options) {
  // if (!(this instanceof Timer)) {
  // 	return new Timer(options);
  // }
  this._id = idSeed++; // this._options = {};

  this._duration = 0;
  this._status = "initialized";
  this._start = 0; // this._measures = [];
  // for (var prop in defaultOptions) {
  // 	this._options[prop] = defaultOptions[prop];
  // }
  // this.options(options);
};

_.extend(Timer.prototype, Events, {
  start: function start(duration) {
    if (!_.isNumber(duration) && !this._duration) {
      return this;
    } // duration && (duration *= 1000)


    if (this._timeout && this._status === "started") {
      return this;
    }

    var evName = this._status === "stopped" ? "start" : "resume";
    this._duration = duration || this._duration;
    this._timeout = window.setTimeout(end.bind(this), this._duration); // if (typeof this._options.ontick === "function") {
    // 	this._interval = setInterval(function() {
    // 		this.trigger("tick", this.getDuration())
    // 	}.bind(this), +this._options.tick * 1000)
    // }

    this._start = _now();
    this._status = "started";
    this.trigger(evName, this.getDuration());
    return this;
  },
  pause: function pause() {
    if (this._status !== "started") {
      return this;
    }

    this._duration -= _now() - this._start;
    clear.call(this, false);
    this._status = "paused";
    this.trigger("pause", this.getDuration());
    return this;
  },
  stop: function stop() {
    if (!/started|paused/.test(this._status)) {
      return this;
    }

    clear.call(this, true);
    this._status = "stopped";
    this.trigger("stop");
    return this;
  },
  getDuration: function getDuration() {
    if (this._status === "started") {
      return this._duration - (_now() - this._start);
    }

    if (this._status === "paused") {
      return this._duration;
    }

    return 0;
  },
  getStatus: function getStatus() {
    return this._status;
  }
});

var _now = window.performance ? window.performance.now.bind(window.performance) : Date.now.bind(Date);

function end() {
  clear.call(this);
  this._status = "stopped";
  this.trigger("end");
}

function clear(clearDuration) {
  window.clearTimeout(this._timeout); // window.clearInterval(this._interval);

  if (clearDuration === true) {
    this._duration = 0;
  }
}

Object.defineProperties(Timer.prototype, {
  duration: {
    enumerable: true,
    get: function get() {
      return this.getDuration();
    }
  },
  status: {
    enumerable: true,
    get: function get() {
      return this.getStatus();
    }
  }
});
Object.defineProperties(Timer, {
  STOPPED: {
    enumerable: true,
    value: "stopped"
  },
  STARTED: {
    enumerable: true,
    value: "started"
  },
  PAUSED: {
    enumerable: true,
    value: "paused"
  }
});
module.exports = Timer;

}).call(this,require("underscore"))

},{"backbone":5,"underscore":51}],127:[function(require,module,exports){
"use strict";

/* -------------------------------
/* Imports
/* ------------------------------- */

/** @type {module:utils/TransformItem} */
var TransformItem = require("./TransformItem");

var idSeed = 0;
var cidSeed = 100;
var slice = Array.prototype.slice;
/**
 * @constructor
 * @type {module:app/helper/TransformHelper}
 */

function TransformHelper() {
  this.id = idSeed++;
  this._items = [];
  this._itemsById = {};
}

TransformHelper.prototype = Object.create({
  /* -------------------------------
  /* Private
  /* ------------------------------- */
  _get: function _get(el) {
    if (this.has(el)) {
      return this._itemsById[el.eid];
    } else {
      return this._add(el);
    }
  },
  _add: function _add(el) {
    var item, id; // id = el.eid || el.cid || el.id;
    // if (!id || (this._itemsById[id] && (this._itemsById[id].el !== el))) {
    // 	id = "elt" + cidSeed++;
    // }
    // if (!el.eid) {
    // 	id = el.eid || el.cid || ("elt" + cidSeed++);
    // }

    id = el.eid || el.cid || "elt" + cidSeed++;
    item = new TransformItem(el, id);
    this._itemsById[id] = item;

    this._items.push(item);

    return item;
  },
  _remove: function _remove(el) {
    if (this.has(el)) {
      var o = this._itemsById[el.eid];

      this._items.splice(this._items.indexOf(o), 1);

      o.destroy();
      delete this._itemsById[el.eid];
    }
  },
  _invoke: function _invoke(funcName, args, startIndex) {
    var i, ii, j, jj, el, o, rr;
    var funcArgs = null;

    if (startIndex !== void 0) {
      funcArgs = slice.call(args, 0, startIndex);
    } else {
      startIndex = 0;
    }

    for (i = startIndex, ii = args.length, rr = []; i < ii; ++i) {
      el = args[i]; // iterate on NodeList, Arguments, Array...

      if (el.length) {
        for (j = 0, jj = el.length; j < jj; ++j) {
          o = this._get(el[j]);
          rr.push(o[funcName].apply(o, funcArgs));
        }
      } else {
        o = this._get(el);
        rr.push(o[funcName].apply(o, funcArgs));
      }
    }

    return rr;
  },

  /* -------------------------------
  /* Public
  /* ------------------------------- */
  has: function has(el) {
    return el.eid && this._itemsById[el.eid] !== void 0;
  },
  getItems: function getItems() {
    var i,
        j,
        el,
        ret = [];

    for (i = 0; i < arguments.length; ++i) {
      el = arguments[i];

      if (el.length) {
        for (j = 0; j < el.length; ++j) {
          ret.push(this._get(el[j]));
        }
      } else {
        ret.push(this._get(el));
      }
    }

    return ret;
  },
  get: function get(el) {
    return this._get(el);
  },
  add: function add() {
    var i, j, el;

    for (i = 0; i < arguments.length; ++i) {
      el = arguments[i];

      if (el.length) {
        for (j = 0; j < el.length; ++j) {
          this._get(el[j]);
        }
      } else {
        this._get(el);
      }
    }
  },
  remove: function remove() {
    var i, j, el;

    for (i = 0; i < arguments.length; ++i) {
      el = arguments[i];

      if (el.length) {
        for (j = 0; j < el.length; ++j) {
          this._remove(el[j]);
        }
      } else {
        this._remove(el);
      }
    }
  },

  /* --------------------------------
  /* public
  /* -------------------------------- */

  /* public: single arg
  /* - - - - - - - - - - - - - - - - */
  hasOffset: function hasOffset(el) {
    return this.has(el) ? this._itemsById[el.eid].hasOffset : void 0;
  },

  /* public: capture
  /* - - - - - - - - - - - - - - - - */
  capture: function capture() {
    this._invoke("capture", arguments);
  },
  captureAll: function captureAll() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].capture();
    }
  },
  clearCapture: function clearCapture() {
    this._invoke("clearCapture", arguments);
  },
  clearAllCaptures: function clearAllCaptures() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].clearCapture();
    }
  },

  /* public: offset
  /* - - - - - - - - - - - - - - - - */
  offset: function offset(x, y) {
    this._invoke("offset", arguments, 2);
  },
  offsetAll: function offsetAll(x, y) {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].offset(x, y);
    }
  },
  clearOffset: function clearOffset() {
    this._invoke("clearOffset", arguments);
  },
  clearAllOffsets: function clearAllOffsets() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].clearOffset();
    }
  },

  /* public: transitions
  /* - - - - - - - - - - - - - - - - */
  runTransition: function runTransition(transition) {
    this._invoke("runTransition", arguments, 1);
  },
  runAllTransitions: function runAllTransitions(transition) {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].runTransition(transition);
    }
  },
  clearTransition: function clearTransition() {
    this._invoke("clearTransition", arguments);
  },
  clearAllTransitions: function clearAllTransitions() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].clearTransition();
    }
  },
  stopTransition: function stopTransition() {
    this._invoke("stopTransition", arguments);
  },
  stopAllTransitions: function stopAllTransitions() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].stopTransition();
    }
  },
  whenTransitionEnds: function whenTransitionEnds() {
    var res = this._invoke("whenTransitionEnds", arguments);

    return res.length != 0 ? Promise.all(res) : Promise.resolve(null);
  },
  whenAllTransitionsEnd: function whenAllTransitionsEnd() {
    return this._items.length != 0 ? Promise.all(this._items.map(function (o) {
      return o.whenTransitionEnds();
    })) : Promise.resolve(null);
  },
  promise: function promise() {
    return arguments.length == 0 ? this.whenAllTransitionsEnd() : this.whenTransitionEnds.call(this, arguments);
  },

  /* -------------------------------
  /* validation
  /* ------------------------------- */
  validate: function validate() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].validate();
    }
  }
}, {
  items: {
    get: function get() {
      return this._items;
    }
  }
});
module.exports = TransformHelper;

},{"./TransformItem":128}],128:[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/* -------------------------------
 * Imports
 * ------------------------------- */

/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/prefixedStyleName} */


var prefixedStyleName = require("utils/prefixedStyleName");
/** @type {module:utils/prefixedEvent} */


var prefixedEvent = require("utils/prefixedEvent");
/** @type {String} */


var transitionEnd = prefixedEvent("transitionend"); //var transitionEnd = require("utils/event/transitionEnd");
// /** @type {Function} */
// var slice = Array.prototype.slice;
// /** @type {module:utils/debug/traceElement} */
// var traceElt = require("./debug/traceElement");
// var traceEltCache = {};
// var log = function() {
// 	var logFn = "log";
// 	var args = slice.apply(arguments);
// 	switch(args[0]) {
// 		case "error":
// 		case "warn":
// 		case "info":
// 			logFn = args.shift();
// 			break;
// 		default:
// 			// break;
// 			return;
// 	}
// 	var el, txId;
// 	if ((el = args[0]) && (txId = el.eid)) {
// 		args[0] = traceEltCache[txId] || (traceEltCache[txId] = el);
// 	}
// 	args[0] = "\t" + args[0];
// 	console[logFn].apply(console, args);
// };

/* jshint -W079 */
// var console = (function(target) {
// 	return Object.getOwnPropertyNames(target).reduce(function(proxy, prop) {
// 		if ((typeof target[prop]) == "function") {
// 			switch (prop) {
// 				case "error":
// 				case "warn":
// 				case "info":
// 					proxy[prop] = function () {
// 						var args = slice.apply(arguments);
// 						if (typeof args[0] == "string") {
// 							args[0] = prop + "::" + args[0];
// 						}
// 						return target[prop].apply(target, args);
// 					};
// 					break;
// 				case "log":
// 					proxy[prop] = function() {};
// 					break;
// 				default:
// 					proxy[prop] = target[prop].bind(target);
// 					break;
// 			}
// 		} else {
// 			Object.defineProperty(proxy, prop, {
// 				get: function() { return target[prop]; },
// 				set: function(val) { target[prop] = val; }
// 			});
// 		}
// 		return proxy;
// 	}, {});
// })(window.console);

/* jshint +W079 */

/* -------------------------------
/* Private static
/* ------------------------------- */

var NO_TRANSITION_VALUE = "none 0s step-start 0s"; // var NO_TRANSITION_VALUE = "all 0.001s step-start 0.001s";

var UNSET_TRANSITION = {
  name: "unset",
  className: "tx-unset",
  property: "none",
  easing: "ease",
  delay: 0,
  duration: 0,
  cssText: "unset"
}; // var translateTemplate = _.template("translate(<%= _renderedX %>px, <%= _renderedY %>px)";
// var translate3dTemplate = _.template("translate3d(<%= _renderedX %>px, <%= _renderedY %>px, 0px)";
// var transitionTemplate = _.template("<%= property %> <% duration/1000 %>s <%= easing %> <% delay/1000 %>s");

var translateTemplate = function (fn) {
  return function (o) {
    return fn(o._renderedX, o._renderedY);
  };
}(require("app/control/Globals").TRANSLATE_TEMPLATE);

var transitionTemplate = function transitionTemplate(o) {
  return o.property + " " + o.duration / 1000 + "s " + o.easing + " " + o.delay / 1000 + "s";
};

var propDefaults = {
  "opacity": "1",
  "visibility": "visible",
  "transform": "matrix(1, 0, 0, 1, 0, 0)",
  "transformStyle": "",
  "transition": "" // "willChange": "",
  // "transitionDuration": "0s",
  // "transitionDelay": "0s",
  // "transitionProperty": "none",
  // "transitionTimingFunction": "ease"

};
var propKeys = Object.keys(propDefaults);
var propNames = propKeys.reduce(function (obj, propName) {
  obj[propName] = prefixedProperty(propName);
  return obj;
}, {});

var styleNames = function (camelToDashed) {
  return propKeys.map(camelToDashed).reduce(function (obj, propName) {
    obj[propName] = prefixedStyleName(propName);
    return obj;
  }, {});
}(require("utils/strings/camelToDashed"));

var resolveAll = function resolveAll(pp, result) {
  if (pp.length != 0) {
    pp.forEach(function (p, i, a) {
      p.resolve(result);
      a[i] = null;
    });
    pp.length = 0;
  }

  return pp;
};

var rejectAll = function rejectAll(pp, reason) {
  if (pp.length != 0) {
    pp.forEach(function (p, i, a) {
      p.reject(reason);
      a[i] = null;
    });
    pp.length = 0;
  }

  return pp;
};
/* -------------------------------
 * TransformItem
 * ------------------------------- */

/**
 * @constructor
 */


var TransformItem = function TransformItem(el, id) {
  this.el = el;
  this.id = id;
  this.el.eid = id;
  this._onTransitionEnd = this._onTransitionEnd.bind(this);
  this.el.addEventListener(transitionEnd, this._onTransitionEnd, false);
  this._captureInvalid = false;
  this._capturedChanged = false;
  this._capturedX = null;
  this._capturedY = null;
  this._currCapture = {};
  this._lastCapture = {};
  this._hasOffset = false;
  this._offsetInvalid = false;
  this._offsetX = null;
  this._offsetY = null;
  this._renderedX = null;
  this._renderedY = null;
  this._hasTransition = false;
  this._transitionInvalid = false;
  this._transitionRunning = false;
  this._transition = _.extend({}, UNSET_TRANSITION); //{};

  this._promises = [];
  this._pendingPromises = [];
};

TransformItem.prototype = Object.create({
  /* -------------------------------
  /* Public
  /* ------------------------------- */

  /* destroy
  /* - - - - - - - - - - - - - - - - */
  destroy: function destroy() {
    // NOTE: style property may have been modified; clearOffset(element) should
    // be called explicitly if clean up is required.
    this.el.removeEventListener(transitionEnd, this._onTransitionEnd, false);
    rejectAll(this._pendingPromises, this);
    rejectAll(this._promises, this); // delete this.el.eid;
  },

  /* capture
  /* - - - - - - - - - - - - - - - - */
  capture: function capture(force) {
    // console.log("tx[%s]::capture", this.id);
    if (force) {
      this.clearCapture();
    }

    this._validateCapture();

    return this;
  },
  clearCapture: function clearCapture() {
    // console.log("tx[%s]::clearCapture", this.id);
    // this._hasOffset = false;
    this._captureInvalid = true;
    return this;
  },

  /* offset/clear
  /* - - - - - - - - - - - - - - - - */
  offset: function offset(x, y) {
    // console.log("tx[%s]::offset", this.id);
    this._hasOffset = true;
    this._offsetInvalid = true;
    this._offsetX = x || 0;
    this._offsetY = y || 0; // if (this.immediate) this._validateOffset();

    return this;
  },
  clearOffset: function clearOffset() {
    if (this._hasOffset) {
      // console.log("tx[%s]::clearOffset", this.id);
      this._hasOffset = false;
      this._offsetInvalid = true;
      this._offsetX = null;
      this._offsetY = null; // if (this.immediate) this._validateOffset();
    } // else {
    // 	console.log("tx[%s]::clearOffset no offset to clear", this.id);
    // }


    return this;
  },

  /* transitions
  /* - - - - - - - - - - - - - - - - */
  runTransition: function runTransition(transition) {
    if (!transition) {
      // || (transition.duration + transition.delay) == 0) {
      return this.clearTransition();
    }

    var lastValue = this._transitionValue;
    var lastName = this._transition.name;
    this._transition.property = styleNames["transform"];
    this._transition = _.extend(this._transition, transition);
    this._transitionValue = transitionTemplate(this._transition);

    if (this._transitionInvalid) {
      console.warn("tx[%s]::runTransition set over (%s:'%s' => %s:'%s')", this.id, lastName, lastValue, this._transition.name, this._transitionValue);
    }

    this._hasTransition = true;
    this._transitionInvalid = true; // if (this.immediate) this._validateTransition();

    return this;
  },
  clearTransition: function clearTransition() {
    this._transition = _.extend(this._transition, UNSET_TRANSITION);
    this._transitionValue = NO_TRANSITION_VALUE;
    this._hasTransition = false;
    this._transitionInvalid = true; // if (this.immediate) this._validateTransition();

    return this;
  },
  stopTransition: function stopTransition() {
    // this._transition.name = "[none]";
    // this._transition.property = "none";
    this._transition = _.extend(this._transition, UNSET_TRANSITION);
    this._transitionValue = NO_TRANSITION_VALUE;
    this._hasTransition = false;
    this._transitionInvalid = true; // if (this.immediate) this._validateTransition();

    return this;
  },
  whenTransitionEnds: function whenTransitionEnds() {
    var d, p, pp;

    if (this._transitionInvalid || this._transitionRunning) {
      d = {};
      p = new Promise(function (resolve, reject) {
        d.resolve = resolve;
        d.reject = reject;
      });
      pp = this._transitionInvalid ? this._pendingPromises : this._promises;
      pp.push(d);
    } else {
      p = Promise.resolve(this);
    }

    return p;
  },

  /* validation
  /* - - - - - - - - - - - - - - - - */
  validate: function validate() {
    // this.el.removeEventListener(transitionEnd, this._onTransitionEnd, false);
    this._ignoreEvent = true;

    if (this._captureInvalid) {
      var lastX = this._renderedX !== null ? this._renderedX : this._capturedX,
          lastY = this._renderedY !== null ? this._renderedY : this._capturedY; // this._validateTransition();

      this._validateCapture();

      this._validateOffset();

      var currX = this._renderedX !== null ? this._renderedX : this._capturedX,
          currY = this._renderedY !== null ? this._renderedY : this._capturedY;

      if (lastX === currX && lastY === currY) {
        this._hasTransition && console.warn("tx[%s]::validate unchanged: last:[%i,%i] curr:[%i,%i]", this.el.id || this.id, lastX, lastY, currX, currY); // console.info("tx[%s]::validate unchanged: last:[%f,%f] curr:[%f,%f] render:[%f,%f] captured[%f,%f]", this.el.id || this.id, lastX, lastY, currX, currY, this._renderedX, this._renderedY, this._capturedX, this._capturedY);

        this.clearTransition(); // this._validateTransition();
      }

      this._validateTransition();
    } else {
      // this._validateCapture();
      this._validateTransition();

      this._validateOffset();
    } // this.el.addEventListener(transitionEnd, this._onTransitionEnd, false);


    this._ignoreEvent = false; // if (this._capturedChanged) {
    // 	console.error("tx[%s]::validate capture changed: [%f,%f]", this.id, this._capturedX, this._capturedY);
    // }

    this._capturedChanged = false;
    return this;
  },

  /* -------------------------------
  /* Private
  /* ------------------------------- */
  _validateCapture: function _validateCapture() {
    if (!this._captureInvalid) {
      return;
    } // var computed, capturedValues;


    var transformValue = null;

    if (this._hasOffset && !this._offsetInvalid) {
      // this is an explicit call to capture() instead of a subcall from _validateOffset()
      transformValue = this._getCSSProp("transform");

      if (transformValue === "") {
        console.error("tx[%s]::_capture valid offset (%i,$i) but transformValue=\"\"", this.id, this._offsetX, this._offsetY);
      }

      this._removeCSSProp("transform");
    } // NOTE: reusing object, all props will be overwritten


    this._lastCapture = this._currCapture;
    this._currCapture = this._getComputedCSSProps();

    if (this._currCapture.transform !== this._lastCapture.transform) {
      var m, mm; //, ret = {};

      mm = this._currCapture.transform.match(/(matrix|matrix3d)\(([^\)]+)\)/);

      if (mm) {
        m = mm[2].split(",");

        if (mm[1] === "matrix") {
          this._capturedX = parseFloat(m[4]);
          this._capturedY = parseFloat(m[5]);
        } else {
          this._capturedX = parseFloat(m[12]);
          this._capturedY = parseFloat(m[13]);
        }
      } else {
        this._capturedX = 0;
        this._capturedY = 0;
      }

      this._capturedChanged = true;
    }

    if (transformValue !== null) {
      console.log("tx[%s]::_capture reapplying '%s'", this.id, transformValue);

      this._setCSSProp("transform", transformValue);
    }

    this._captureInvalid = false;
  },
  _validateOffset: function _validateOffset() {
    if (this._offsetInvalid) {
      // this._validateCapture();
      this._offsetInvalid = false;

      if (this._hasOffset) {
        var tx = this._offsetX + this._capturedX;
        var ty = this._offsetY + this._capturedY;

        if (tx !== this._renderedX || ty !== this._renderedY) {
          this._renderedX = tx;
          this._renderedY = ty;

          this._setCSSProp("transform", translateTemplate(this));
        }
      } else {
        this._renderedX = null;
        this._renderedY = null;

        this._removeCSSProp("transform");
      }
    }
  },
  _validateTransition: function _validateTransition() {
    if (this._transitionInvalid) {
      // this._validateCapture();
      this._transitionInvalid = false; // save promises made while invalid

      var reject = this._promises; // prepare _promises and push in new ones

      this._promises = this._pendingPromises; // whatever still here is to be rejected. reuse array

      this._pendingPromises = rejectAll(reject, this); // Set running flag, if there's a transition to run

      this._transitionRunning = this._hasTransition; // Set the css value (which will be empty string if there's no transition)

      this._setCSSProp("transition", this._transitionValue);

      if (DEBUG) {
        if (this._hasTransition) {
          this.el.setAttribute("data-tx", this._transition.name);
        }
      }

      if (!this._hasTransition) {
        // if there is no transition, resolve promises now
        resolveAll(this._promises, this);
      }
    }
  },
  _onTransitionEnd: function _onTransitionEnd(ev) {
    if (this._ignoreEvent) {
      return;
    }

    if (this._transitionRunning && this.el === ev.target && this._transition.property == ev.propertyName) {
      this._hasTransition = false;
      this._transitionRunning = false;

      this._removeCSSProp("transition");

      resolveAll(this._promises, this);

      if (DEBUG) {
        if (this.el.hasAttribute("data-tx")) {
          // this.el.setAttribute("data-tx-last", this.el.getAttribute("data-tx"));
          this.el.removeAttribute("data-tx");
        }
      }
    }
  },

  /* -------------------------------
  /* CSS
  /* ------------------------------- */
  _getCSSProp: function _getCSSProp(prop) {
    return this.el.style[propNames[prop]]; // return this.el.style[prefixedProperty(prop)];
    // return this.el.style.getPropertyValue(styleNames[prop]);
  },
  _setCSSProp: function _setCSSProp(prop, value) {
    if (prop === "transition" && value == NO_TRANSITION_VALUE) {
      value = "";
    }

    if (value === null || value === void 0 || value === "") {
      this._removeCSSProp(prop);
    } else {
      this.el.style[propNames[prop]] = value; // this.el.style.setProperty(styleNames[prop], value);
    }
  },
  _removeCSSProp: function _removeCSSProp(prop) {
    this.el.style[propNames[prop]] = ""; // this.el.style.removeProperty(styleNames[prop]);
  },
  _getComputedCSSProps: function _getComputedCSSProps() {
    var values = {};
    var computed = window.getComputedStyle(this.el);

    for (var p in propNames) {
      values[p] = computed[propNames[p]];
    }

    return values;
  }
}, {
  transition: {
    get: function get() {
      return this._transition;
    }
  },
  hasTransition: {
    get: function get() {
      return this._hasTransition;
    }
  },
  capturedChanged: {
    get: function get() {
      return this._capturedChanged;
    }
  },
  capturedX: {
    get: function get() {
      return this._capturedX;
    }
  },
  capturedY: {
    get: function get() {
      return this._capturedY;
    }
  },
  hasOffset: {
    get: function get() {
      return this._hasOffset;
    }
  },
  offsetX: {
    get: function get() {
      return this._offsetX;
    }
  },
  offsetY: {
    get: function get() {
      return this._offsetY;
    }
  }
});
module.exports = TransformItem;

}).call(this,true,require("underscore"))

},{"app/control/Globals":55,"underscore":51,"utils/prefixedEvent":145,"utils/prefixedProperty":146,"utils/prefixedStyleName":147,"utils/strings/camelToDashed":151}],129:[function(require,module,exports){
"use strict";

module.exports = function (a1, a2, dest) {
  return a1.reduce(function (res, o, i, a) {
    if (a2.indexOf(o) == -1) res.push(o);
    return res;
  }, dest !== void 0 ? dest : []);
};

},{}],130:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var PI2 = Math.PI * 2;
var splice = Array.prototype.splice; // var concat = Array.prototype.concat;

/*
 *	Using javascript to convert radians to degrees with positive and
 *	negative values [https://stackoverflow.com/questions/29588404/]
 *	`(((r * (180/Math.PI)) % 360) + 360) % 360;`
 *	`function mod(n, m) {
 *		return ((n % m) + m) % m;
 *	}`
 */

var _mod = function _mod(n, m) {
  return (n % m + m) % m;
};

var setStyle = function setStyle(ctx, s) {
  if (_typeof(s) != "object") return;

  for (var p in s) {
    switch (_typeof(ctx[p])) {
      case "undefined":
        break;

      case "function":
        if (Array.isArray(s[p])) {
          ctx[p].apply(ctx, s[p]);
        } else {
          ctx[p].call(ctx, s[p]);
        }

        break;

      default:
        ctx[p] = s[p];
    }
  }
};

var _drawShape = function _drawShape(fn, s, ctx) {
  ctx.save();

  if (s) {
    setStyle(ctx, s);
  }

  fn.apply(null, splice.call(arguments, 2));

  if ('strokeStyle' in s) {
    /* ctx.lineWidth > 0 */
    ctx.stroke();
  }

  if ('fillStyle' in s) {
    /* ctx.fillStyle !== "transparent" */
    ctx.fill();
  }

  ctx.restore();
};

module.exports = {
  setStyle: setStyle,
  vGuide: function vGuide(ctx, x) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
  },
  drawVGuide: function drawVGuide(ctx, s, x) {
    _drawShape(this.vGuide, s, ctx, x);
  },
  hGuide: function hGuide(ctx, y) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
  },
  drawHGuide: function drawHGuide(ctx, s, y) {
    _drawShape(this.hGuide, s, ctx, y);
  },
  crosshair: function crosshair(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.restore();
  },
  drawCrosshair: function drawCrosshair(ctx, s, x, y, r) {
    _drawShape(this.crosshair, s, ctx, x, y, r);
  },
  circle: function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, PI2);
  },
  drawCircle: function drawCircle(ctx, s, x, y, r) {
    _drawShape(this.circle, s, ctx, x, y, r);
  },
  square: function square(ctx, x, y, r) {
    r = Math.floor(r / 2) * 2;
    ctx.beginPath();
    ctx.rect(x - r, y - r, r * 2, r * 2);
  },
  drawSquare: function drawSquare(ctx, s, x, y, r) {
    _drawShape(this.square, s, ctx, x, y, r);
  },
  arrowhead: function arrowhead(ctx, x, y, r, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(_mod(t, PI2));
    ctx.translate(r * 0.5, 0);
    ctx.beginPath();
    ctx.moveTo(0, 0); // ctx.lineTo(-r, r * Math.SQRT1_2);
    // ctx.lineTo(-r, -r * Math.SQRT1_2);

    ctx.lineTo(-r * Math.SQRT2, r * Math.SQRT1_2);
    ctx.arcTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2, r); // ctx.quadraticCurveTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2);

    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.restore();
  },
  drawArrowhead: function drawArrowhead(ctx, s, x, y, r, t) {
    _drawShape(this.arrowhead, s, ctx, x, y, r, t);
  },
  arrowhead2: function arrowhead2(ctx, x, y, r, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(_mod(t, PI2));
    ctx.beginPath();
    ctx.moveTo(-r, r * Math.SQRT1_2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-r, -r * Math.SQRT1_2);
    ctx.restore();
  },
  drawArrowhead2: function drawArrowhead2(ctx, s, x, y, r, t) {
    _drawShape(this.arrowhead, s, ctx, x, y, r, t);
  },
  rect: function rect(ctx, a1, a2, a3, a4) {
    if (_typeof(a1) === "object") {
      a4 = a1.height;
      a3 = a1.width;
      a2 = a1.top;
      a1 = a1.left;
    }

    ctx.beginPath();
    ctx.rect(a1, a2, a3, a4);
  },
  drawRect: function drawRect(ctx, s, a1, a2, a3, a4) {
    _drawShape(this.rect, s, ctx, a1, a2, a3, a4);
  },
  roundRect: function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },
  drawRoundRect: function drawRoundRect(ctx, s, x, y, w, h, r) {
    _drawShape(this.roundRect, s, ctx, x, y, h, r);
  },
  quadRoundRect: function quadRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.closePath();
  },
  drawQuadRoundRect: function drawQuadRoundRect(ctx, s, x, y, w, h, r) {
    _drawShape(this.quadRoundRect, s, ctx, x, y, h, r);
  }
};

},{}],131:[function(require,module,exports){
"use strict";

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = function () {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
};

},{}],132:[function(require,module,exports){
"use strict";

module.exports = function (imageData, adj) {
  var pixels = imageData.data;
  var r, g, b, s;
  var i, ii;

  if (arguments.length === 1) {
    for (i = 0, ii = pixels.length; i < ii; i += 4) {
      pixels[i] = (pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 144) / 1000;
    }
  } else if (arguments.length === 2) {
    if (0 >= adj > 1) {
      console.warn("argument out of range (1-0)", adj);
      return imageData;
    }

    for (i = 0, ii = pixels.length; i < ii; i += 4) {
      r = pixels[i];
      g = pixels[i + 1];
      b = pixels[i + 2]; // s = ((r * 299 + g * 587 + b * 144) / 1000) * (1 - adj);
      // pixels[i] = r * adj + s;
      // pixels[i + 1] = g * adj + s;
      // pixels[i + 2] = b * adj + s;

      s = Math.max(r, g, b);

      if (s === 0) {
        pixels[i] = Math.round(255 * adj);
        pixels[i + 1] = Math.round(255 * adj);
        pixels[i + 2] = Math.round(255 * adj);
      } else {
        s = 255 * adj / s;
        pixels[i] = Math.round(r * s);
        pixels[i + 1] = Math.round(g * s);
        pixels[i + 2] = Math.round(b * s);
      }
    }
  }

  return imageData;
}; // function saturation(r,g,b, s) {
//     var min = rgb.indexOf(Math.min.apply(null, rgb)), // index of min
//         max = rgb.indexOf(Math.max.apply(null, rgb)), // index of max
//         mid = [0, 1, 2].filter(function (i) {return i !== min && i !== max;})[0],
//         a = rgb[max] - rgb[min],
//         b = rgb[mid] - rgb[min],
//         x = rgb[max],
//         arr = [x, x, x];
//     if (min === max) {
//         min = 2; // both max = min = 0, => mid = 1, so set min = 2
//         a = 1;   // also means a = b = 0, don't want division by 0 in `b / a`
//     }
//
//     arr[max] = x;
//     arr[min] = Math.round(x * (1 - s));
//     arr[mid] = Math.round(x * ((1 - s) + s * b / a));
//
//     return arr;
// }
// function nvalue(rgb, v) {
//     var x = Math.max.apply(null, rgb);
//     if (x === 0)
//         return [
//             Math.round(255 * v),
//             Math.round(255 * v),
//             Math.round(255 * v)
//         ];
//     x = 255 * v / x;
//     return [
//         Math.round(rgb[0] * x),
//         Math.round(rgb[1] * x),
//         Math.round(rgb[2] * x)
//     ];
// }

},{}],133:[function(require,module,exports){
"use strict";

module.exports = function (imageData, opts) {
  var pixels = imageData.data;
  var pixelsNum = pixels.length;
  var rgbAvg = [0, 0, 0];
  var i;

  for (i = 0; i < pixelsNum; i += 4) {
    rgbAvg[0] += pixels[i];
    rgbAvg[1] += pixels[i + 1];
    rgbAvg[2] += pixels[i + 2];
  }

  for (i = 0; i < 3; i++) {
    rgbAvg[i] = rgbAvg[i] / (pixelsNum / 4) | 0;
  }

  return rgbAvg;
};

},{}],134:[function(require,module,exports){
"use strict";

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

},{}],135:[function(require,module,exports){
"use strict";

module.exports = function (pixels, adjustment) {
  var d = pixels.data;

  for (var i = 0; i < d.length; i += 4) {
    d[i] *= adjustment;
    d[i + 1] *= adjustment;
    d[i + 2] *= adjustment;
  }

  return pixels;
};

},{}],136:[function(require,module,exports){
"use strict";

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

},{}],137:[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* jshint ignore:start */

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr:
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
var mul_table = require("./mul_table");

var shg_table = require("./shg_table");

var BlurStack = require("./BlurStack");

module.exports = function (imageData, opts) {
  if (_typeof(opts) === "object" && opts.hasOwnProperty("radius")) {
    opts = opts.radius;
  }

  if (typeof opts !== "number" || isNaN(opts) || 1 > opts) {
    // no valid argument value do nothing
    return imageData;
  }

  var radius = opts | 0;
  var pixels = imageData.data,
      width = imageData.width,
      height = imageData.height;
  var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;
  var div = radius + radius + 1;
  var w4 = width << 2;
  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;

  for (i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();
    if (i == radiusPlus1) var stackEnd = stack;
  }

  stack.next = stackStart;
  var stackIn = null;
  var stackOut = null;
  yw = yi = 0;
  var mul_sum = mul_table[radius];
  var shg_sum = shg_table[radius];

  for (y = 0; y < height; y++) {
    r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    for (i = 1; i < radiusPlus1; i++) {
      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
      r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (x = 0; x < width; x++) {
      pixels[yi] = r_sum * mul_sum >> shg_sum;
      pixels[yi + 1] = g_sum * mul_sum >> shg_sum;
      pixels[yi + 2] = b_sum * mul_sum >> shg_sum;
      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
      r_in_sum += stackIn.r = pixels[p];
      g_in_sum += stackIn.g = pixels[p + 1];
      b_in_sum += stackIn.b = pixels[p + 2];
      r_sum += r_in_sum;
      g_sum += g_in_sum;
      b_sum += b_in_sum;
      stackIn = stackIn.next;
      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (x = 0; x < width; x++) {
    g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
    yi = x << 2;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    yp = width;

    for (i = 1; i <= radius; i++) {
      yi = yp + x << 2;
      r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      stack = stack.next;

      if (i < heightMinus1) {
        yp += width;
      }
    }

    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p] = r_sum * mul_sum >> shg_sum;
      pixels[p + 1] = g_sum * mul_sum >> shg_sum;
      pixels[p + 2] = b_sum * mul_sum >> shg_sum;
      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
      r_sum += r_in_sum += stackIn.r = pixels[p];
      g_sum += g_in_sum += stackIn.g = pixels[p + 1];
      b_sum += b_in_sum += stackIn.b = pixels[p + 2];
      stackIn = stackIn.next;
      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
};
/* jshint ignore:end */

},{"./BlurStack":131,"./mul_table":134,"./shg_table":136}],138:[function(require,module,exports){
"use strict";

/**
 * @module utils/canvas/calcArcHConnector
 */
module.exports = function (x1, y1, r1, x2, y2, r2, ro) {
  var qx = x2 > x1 ? 1 : -1;
  var qy = y2 > y1 ? 1 : -1;
  var dy = Math.abs(y2 - y1);
  var dx = Math.abs(x2 - x1);
  var rr = r1 + r2;
  var tx1, tx2, c, tx, ty;

  if (dy < 1) {
    // points are aligned horizontally, no arcs needed
    tx1 = 0;
    tx2 = dx; // return [x1, x2];
  }

  if (dy >= rr && dx >= rr) {
    // arcs fit horizontally:
    // second circle center is r1+r2, tangent intersect at x=r1
    c = rr;
    tx1 = r1;
    tx2 = r1;
  } else {
    // arcs overlap horizontally:
    // find second circle center
    c = Math.sqrt(dy * r2 * 2 + dy * r1 * 2 - dy * dy); // circles tangent point

    tx = c * r1 / rr;
    ty = dy * r1 / rr;

    if (r1 < ty || c > dx) {
      return;
    } // tangent perpendicular slope


    var slope = (rr - dy) / c; // tangent intersections

    tx1 = tx - ty * slope;
    tx2 = dy * slope + tx1;
    /*
    // circle centers
    var ccx1, ccy1, ccx2, ccy2;
    ccx1 = 0;
    ccy1 = r1;
    ccx2 = c;
    ccy2 = dy - r2;
    // tangent perpendicular slope
    var slope = (ccy1 - ccy2) / (ccx2 - ccx1);
    var xSec = tx - (ty * slope);
    // tangent intersections
    tx1 = xSec;
    tx2 = (dy * slope) + xSec;
    */
  } // offset arcTo's in x-axis


  if (ro > 0) {
    if (ro > 1) {
      ro = Math.min(dx - rr, ro);
    } else {
      ro *= dx - rr;
    }

    tx1 += ro;
    tx2 += ro;
  }

  return [tx1 * qx + x1, tx2 * qx + x1, tx1, tx2];
};
/*
var drawArcConnector = function(ctx, x1, y1, x2, y2, r) {
	var dx, dy, hx, hy, gx, gy;

	hx = 0;
	hy = 0;
	gx = (x1 + x2) / 2;
	gy = (y1 + y2) / 2;
	dx = Math.abs(x1 - gx);
	dy = Math.abs(y1 - gy);

	if (dx < r && dy < r) {
		r = Math.min(dx * Math.SQRT1_2, dy * Math.SQRT1_2);
	} else {
		if (dx < r) {
			hy = Math.acos(dx / r) * r * 0.5;
			if (y1 > y2) hy *= -1;
		}
		if (dy < r) {
			hx = Math.acos(dy / r) * r * 0.5;
			if (x1 > x2) hx *= -1;
		}
	}
	ctx.arcTo(gx - hx, y1, gx + hx, y2, r);
	ctx.arcTo(gx + hx, y2, x2, y2, r);
};

var drawArcConnector2 = function(ctx, x1, y1, x2, y2, r) {
	var dx, dy, hx, hy, cx1, cx2;

	hx = 0;
	hy = 0;
	dx = Math.abs(x2 - x1) / 2;
	dy = Math.abs(y1 - y2) / 2;

	if (dx < r && dy < r) {
		r = Math.min(dx * Math.SQRT1_2, dy * Math.SQRT1_2);
	} else {
		if (dx < r) {
			hy = Math.acos(dx / r) * r;
		}
		if (dy < r) {
			hx = Math.acos(dy / r) * r;
		}
	}
	cx1 = x1 + dx;
	cx2 = x2 - (dx - hx / 2);
	ctx.arcTo(cx1, y1, cx2, y2, r);
	ctx.arcTo(cx2, y2, x2, y2, r);
};

var drawArcConnector1 = function(ctx, x1, y1, x2, y2, r) {
	var dx, dy, cx;

	dx = Math.abs(x2 - x1) / 2;
	dy = Math.abs(y1 - y2) / 2;
	r = Math.min(r, dy * Math.SQRT1_2);
	if (x1 < x2) {
		cx = x1 + dx + r;
	} else {
		cx = x2 - dx - r;
	}
	// cx = (x2 + x1) / 2;
	// cx += x1 < x2 ? r : -r;

	ctx.arcTo(cx, y1, cx, y2, r);
	ctx.arcTo(cx, y2, x2, y2, r);
};
*/

},{}],139:[function(require,module,exports){
(function (DEBUG){
"use strict";

/* global HTMLElement, CSSStyleDeclaration */
// var parseSize = require("./parseSize");
var CSS_BOX_PROPS = ["boxSizing", "position", "objectFit"];
var CSS_EDGE_PROPS = ["marginTop", "marginBottom", "marginLeft", "marginRight", "borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"];
var CSS_POS_PROPS = ["top", "bottom", "left", "right"];
var CSS_SIZE_PROPS = ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"];
var CSS_ALL_PROPS = CSS_EDGE_PROPS.concat(CSS_SIZE_PROPS, CSS_POS_PROPS); // var COMPUTED_PROPS = [
// 	"clientLeft", "clientTop", "clientWidth", "clientHeight",
// 	"offsetLeft", "offsetTop", "offsetWidth", "offsetHeight"
// ];
// var o = _.pick(element, function(val) {
// 	return /^(offset|client)(Left|Top|Width|Height)/.test(val);
// });

var cssDimensionRE = /^(-?[\d\.]+)(px|em|rem)$/; // var cssDimRe = /^([-\.0-9]+)([rem]+)$/;

module.exports = function (s, m, includeSizePos) {
  if (s instanceof HTMLElement) {
    s = getComputedStyle(s);
  }

  if (DEBUG) {
    if (!(s instanceof CSSStyleDeclaration)) {
      throw new Error("Not a CSSStyleDeclaration nor HTMLElement");
    }
  }

  var v, p, i, ii, emPx, remPx;
  m || (m = {});
  emPx = m.fontSize = parseFloat(s.fontSize);

  for (i = 0, ii = CSS_BOX_PROPS.length; i < ii; i++) {
    p = CSS_BOX_PROPS[i];

    if (p in s) {
      m[p] = s[p];
    }
  }

  var cssProps = includeSizePos ? CSS_EDGE_PROPS : CSS_ALL_PROPS;

  for (i = 0, ii = cssProps.length; i < ii; i++) {
    p = cssProps[i];
    m["_" + p] = s[p];

    if (s[p] && (v = cssDimensionRE.exec(s[p]))) {
      if (v[2] === "px") {
        m[p] = parseFloat(v[1]);
      } else if (v[2] === "em") {
        m[p] = parseFloat(v[1]) * emPx;
      } else if (v[2] === "rem") {
        remPx || (remPx = parseFloat(getComputedStyle(document.documentElement).fontSize));
        m[p] = parseFloat(v[1]) * remPx;
      } else {
        console.warn("Ignoring value", p, v[1], v[2]);
        m[p] = null;
      }
    } // else {
    //	console.warn("Ignoring unitless value", p, v);
    //}

  }

  return m;
};

}).call(this,true)

},{}],140:[function(require,module,exports){
"use strict";

/* easeInQuad */
module.exports = function (x, t, b, c, d) {
  return c * (t /= d) * t + b;
};

},{}],141:[function(require,module,exports){
"use strict";

/* easeOutQuad */
module.exports = function (t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b;
};

},{}],142:[function(require,module,exports){
"use strict";

/**
 * @param {number} i current iteration
 * @param {number} s start value
 * @param {number} d change in value
 * @param {number} t total iterations
 * @return {number}
 */
var linear = function linear(i, s, d, t) {
  return d * i / t + s;
};

module.exports = linear;

},{}],143:[function(require,module,exports){
"use strict";

/* https://html.spec.whatwg.org/multipage/media.html#event-media-canplay
 */
module.exports = [// networkState
"loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled", // readyState
"loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting", //
"seeking", // seeking changed to true
"seeked", // seeking changed to false
"ended", // ended is true
//
"durationchange", // duration updated
"timeupdate", // currentTime updated
"play", // paused is false
"pause", // paused is false
"paused", // ??
"ratechange", //
"resize", "volumechange"];

},{}],144:[function(require,module,exports){
"use strict";

/**
 * @module app/view/component/GraphView
 */
module.exports = function (rect, dx, dy) {
  if (arguments.length == 2) {
    dy = dx;
  }

  var r = {
    width: rect.width + dx * 2,
    height: rect.height + dy * 2
  };

  if (r.width >= 0) {
    r.left = rect.left - dx;
    r.right = r.left + r.width;
    r.x = r.left;
  } else {
    r.right = rect.right + dx;
    r.left = rect.right - r.width;
    r.y = r.right;
  }

  if (r.height >= 0) {
    r.top = rect.top - dy;
    r.bottom = r.top + r.height;
    r.y = r.top;
  } else {
    r.bottom = rect.bottom + dy;
    r.top = rect.bottom - r.height;
    r.y = r.bottom;
  }

  return r;
};

},{}],145:[function(require,module,exports){
"use strict";

/** @type {Array} lowercase prefixes */
var lcPrefixes = [""].concat(require("./prefixes"));
/** @type {Array} capitalized prefixes */

var ucPrefixes = lcPrefixes.map(function (s) {
  return s === "" ? s : s.charAt(0).toUpperCase() + s.substr(1);
});
/** @type {Object} specific event solvers */

var _solvers = {};
/** @type {Object} cached values */

var _cache = {};
/**
 * @param {String} name Unprefixed event name
 * @param {?Object} obj Prefix test target
 * @param {?String} testProp Proxy property to test prefixes
 * @return {String|null}
 */

var _prefixedEvent = function _prefixedEvent(name, obj, testProp) {
  var prefixes = /^[A-Z]/.test(name) ? ucPrefixes : lcPrefixes;
  obj || (obj = document);

  for (var i = 0; i < prefixes.length; i++) {
    if (testProp) {
      if (prefixes[i] + testProp in obj) {
        return prefixes[i] + name;
      }
    }

    if ("on" + prefixes[i] + name in obj) {
      return prefixes[i] + name;
    }
  }

  return null;
}; // transitionend


_solvers["transitionend"] = function () {
  var prop,
      style = document.body.style,
      map = {
    "transition": "transitionend",
    "WebkitTransition": "webkitTransitionEnd",
    "MozTransition": "transitionend",
    // "msTransition" : "MSTransitionEnd",
    "OTransition": "oTransitionEnd"
  };

  for (prop in map) {
    if (prop in style) {
      return map[prop];
    }
  }

  return null;
};
/**
 * get the prefixed property
 * @param {String} property name
 * @param {Object} look-up object
 * @returns {String|null} prefixed
 */


module.exports = function (evName) {
  if (!_cache.hasOwnProperty(evName)) {
    _cache[evName] = _solvers.hasOwnProperty(evName) ? _solvers[evName]() : _prefixedEvent.apply(null, arguments);

    if (_cache[evName] === null) {
      console.warn("Event '%s' not found", evName);
    } else {
      console.log("Event '%s' found as '%s'", evName, _cache[evName]);
    }
  }

  return _cache[evName]; // return _cache[evName] || (_cache[evName] = _solvers[evName]? _solvers[evName].call() : _prefixedProperty.apply(null, arguments));
};
/*
var defaultTest = function(name, obj) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	for (var i = 0; i < prefixes.length; i++) {
		if (("on" + prefixes[i] + name) in obj) {
			console.log("Event '%s' found as '%s'", name, prefixes[i] + name);
			return prefixes[i] + name;
		}
	}
	return null;
};

var proxyTest = function(name, obj, testProp) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	for (var i = 0; i < prefixes.length; i++) {
		if ((prefixes[i] + testProp) in obj) {
			console.log("Event %s inferred as '%s' from property '%s'", name, prefixes[i] + name, testProp);
			return prefixes[i] + name;
		}
	}
	return null;
};
*/

},{"./prefixes":148}],146:[function(require,module,exports){
"use strict";

/**
/* @module utils/prefixedProperty
/*/

/** @type {module:utils/prefixes} */
var prefixes = require("./prefixes");
/** @type {Number} prefix count */


var _prefixNum = prefixes.length;
/** @type {Array} cached values */

var _cache = {};

var _prefixedProperty = function _prefixedProperty(prop, obj) {
  var prefixedProp, camelProp;

  if (prop in obj) {
    console.log("Property '%s' found unprefixed", prop);
    return prop;
  }

  camelProp = prop[0].toUpperCase() + prop.slice(1);

  for (var i = 0; i < _prefixNum; i++) {
    prefixedProp = prefixes[i] + camelProp;

    if (prefixedProp in obj) {
      console.log("Property '%s' found as '%s'", prop, prefixedProp);
      return prefixedProp;
    }
  }

  console.error("Property '%s' not found", prop);
  return null;
};
/**
 * get the prefixed property
 * @param {String} property name
 * @param {Object} look-up object
 * @returns {String|null} prefixed
 */


module.exports = function (prop, obj) {
  return _cache[prop] || (_cache[prop] = _prefixedProperty(prop, obj || document.body.style));
};

},{"./prefixes":148}],147:[function(require,module,exports){
"use strict";

/**
/* @module utils/prefixedStyleName
/*/

/** @type {module:utils/prefixes} */
var prefixes = require("./prefixes"); //.map(function(prefix) { return "-" + prefix + "-"; });

/** @type {Number} prefix count */


var _prefixNum = prefixes.length;
/** @type {Array} cached values */

var _cache = {};

var _prefixedStyleName = function _prefixedStyleName(style, styleObj) {
  var prefixedStyle;

  if (style in styleObj) {
    console.log("CSS style '%s' found unprefixed", style);
    return style;
  }

  for (var i = 0; i < _prefixNum; i++) {
    prefixedStyle = "-" + prefixes[i] + "-" + style; // prefixedStyle = prefixes[i] + style;

    if (prefixedStyle in styleObj) {
      console.log("CSS style '%s' found as '%s'", style, prefixedStyle);
      return prefixedStyle;
    }
  }

  console.warn("CSS style '%s' not found", style);
  return null;
};
/**
 * get the prefixed style name
 * @param {String} style name
 * @param {Object} look-up style object
 * @returns {String|Undefined} prefixed
 */


module.exports = function (style, styleObj) {
  // return _cache[style] || (_cache[style] = _prefixedStyleName_reverse(style, styleObj || document.body.style));
  return _cache[style] || (_cache[style] = _prefixedStyleName(style, styleObj || document.body.style));
}; // /** @type {module:utils/strings/camelToDashed} */
// var camelToDashed = require("./strings/camelToDashed");
// /** @type {module:utils/prefixedProperty} */
// var prefixedProperty = require("./prefixedProperty");
// /** @type {module:utils/strings/dashedToCamel} */
// var dashedToCamel = require("./strings/dashedToCamel");
//
// var _prefixedStyleName_reverse = function (style, styleObj) {
// 	var camelProp, prefixedProp;
// 	camelProp = dashedToCamel(style);
// 	prefixedProp = prefixedProperty(camelProp, styleObj);
// 	return prefixedProp? (camelProp === prefixedProp? "" : "-") + camelToDashed(prefixedProp) : null;
// };

},{"./prefixes":148}],148:[function(require,module,exports){
"use strict";

module.exports = ["webkit", "moz", "ms", "o"];

},{}],149:[function(require,module,exports){
"use strict";

module.exports = function (pp, reason) {
  if (pp.length > 0) {
    pp.forEach(function (p, i, a) {
      p.reject(reason);
      a[i] = null;
    });
    pp.length = 0;
  }

  return pp;
};

},{}],150:[function(require,module,exports){
"use strict";

module.exports = function (pp, result) {
  if (pp.length != 0) {
    pp.forEach(function (p, i, a) {
      p.resolve(result);
      a[i] = null;
    });
    pp.length = 0;
  }

  return pp;
};

},{}],151:[function(require,module,exports){
"use strict";

module.exports = function (str) {
  return str.replace(/[A-Z]/g, function ($0) {
    return "-" + $0.toLowerCase();
  });
};

},{}],152:[function(require,module,exports){
"use strict";

module.exports = function (s) {
  return s.replace(/<[^>]+>/g, "");
};

},{}],153:[function(require,module,exports){
"use strict";

/** @type {module:hammerjs} */
var Hammer = require("hammerjs"); // /**
//  * get a usable string, used as event postfix
//  * @param {Const} state
//  * @returns {String} state
//  */
// function stateStr(state) {
// 	if (state & Hammer.STATE_CANCELLED) {
// 		return "cancel";
// 	} else if (state & Hammer.STATE_ENDED) {
// 		return "end";
// 	} else if (state & Hammer.STATE_CHANGED) {
// 		return "move";
// 	} else if (state & Hammer.STATE_BEGAN) {
// 		return "start";
// 	}
// 	return "";
// }

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */


function dirStr(direction) {
  if (direction == Hammer.DIRECTION_DOWN) {
    return "down";
  } else if (direction == Hammer.DIRECTION_UP) {
    return "up";
  } else if (direction == Hammer.DIRECTION_LEFT) {
    return "left";
  } else if (direction == Hammer.DIRECTION_RIGHT) {
    return "right";
  }

  return "";
} ///**
// * Pan
// * Recognized when the pointer is down and moved in the allowed direction.
// * @constructor
// * @extends AttrRecognizer
// */
//function PanRecognizer() {
//	Hammer.AttrRecognizer.apply(this, arguments);
//
//	this.pX = null;
//	this.pY = null;
//}
//
//inherit(PanRecognizer, Hammer.AttrRecognizer, {
//	/**
//	/* @namespace
//	/* @memberof PanRecognizer
//	/*/
//	defaults: {
//		event: "pan",
//		threshold: 10,
//		pointers: 1,
//		direction: DIRECTION_ALL
//	},
//
//	getTouchAction: function() {
//		var direction = this.options.direction;
//		var actions = [];
//		if (direction & DIRECTION_HORIZONTAL) {
//			actions.push(TOUCH_ACTION_PAN_Y);
//		}
//		if (direction & DIRECTION_VERTICAL) {
//			actions.push(TOUCH_ACTION_PAN_X);
//		}
//		return actions;
//	},
//
//	directionTest: function(input) {
//		var options = this.options;
//		var hasMoved = true;
//		var distance = input.distance;
//		var direction = input.direction;
//		var x = input.deltaX;
//		var y = input.deltaY;
//
//		// lock to axis?
//		if (!(direction & options.direction)) {
//			if (options.direction & DIRECTION_HORIZONTAL) {
//				direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
//				hasMoved = x != this.pX;
//				distance = Math.abs(input.deltaX);
//			} else {
//				direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
//				hasMoved = y != this.pY;
//				distance = Math.abs(input.deltaY);
//			}
//		}
//		input.direction = direction;
//		return hasMoved && distance > options.threshold && direction & options.direction;
//	},
//
//	attrTest: function(input) {
//		return AttrRecognizer.prototype.attrTest.call(this, input) &&
//			(this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
//	},
//
//	emit: function(input) {
//		this.pX = input.deltaX;
//		this.pY = input.deltaY;
//
//		var direction = dirStr(input.direction);
//		if (direction) {
//			this.manager.emit(this.options.event + direction, input);
//		}
//
//		this._super.emit.call(this, input);
//	}
//});

/**
 * SmoothPan
 * @constructor
 * @extends Hammer.Pan
 */


function SmoothPan() {
  var ret = Hammer.Pan.apply(this, arguments);
  this.thresholdOffsetX = null;
  this.thresholdOffsetY = null;
  this.thresholdOffset = null;
  return ret;
}

Hammer.inherit(SmoothPan, Hammer.Pan, {
  emit: function emit(input) {
    // Inheritance breaks, so this code is taken from PanRecognizer.emit
    //	this._super.emit.call(this, input); // Triggers infinite recursion
    //	Hammer.Pan.prototype.emit.apply(this, arguments); // This breaks too
    var threshold = this.options.threshold;
    var direction = input.direction;

    if (this.state == Hammer.STATE_BEGAN) {
      this.thresholdOffsetX = direction & Hammer.DIRECTION_HORIZONTAL ? direction & Hammer.DIRECTION_LEFT ? threshold : -threshold : 0;
      this.thresholdOffsetY = direction & Hammer.DIRECTION_VERTICAL ? direction & Hammer.DIRECTION_UP ? threshold : -threshold : 0; // this.thresholdOffset = (direction & Hammer.DIRECTION_HORIZONTAL)? input.thresholdOffsetX : input.thresholdOffsetY;
      // console.log("RECOGNIZER STATE", dirStr(direction), stateStr(this.state), this.thresholdOffsetX);
    }

    input.thresholdOffsetX = this.thresholdOffsetX;
    input.thresholdOffsetY = this.thresholdOffsetY;
    input.thresholdDeltaX = input.deltaX + this.thresholdOffsetX;
    input.thresholdDeltaY = input.deltaY + this.thresholdOffsetY;
    this.pX = input.deltaX;
    this.pY = input.deltaY;
    direction = dirStr(direction);

    if (direction) {
      this.manager.emit(this.options.event + direction, input);
    }

    return Hammer.Recognizer.prototype.emit.apply(this, arguments);
  }
});
module.exports = SmoothPan;

},{"hammerjs":15}],154:[function(require,module,exports){
module.exports={
	"video_crop_px": "0",
	"transform_type": "3d",
	"transitions": {
		"ease": "ease-in-out",
		"duration_ms": "350",
		"delay_interval_ms": "34",
		"min_delay_ms": "34"
	},
	"breakpoints": {
		"landscape": "'(orientation: landscape)'",
		"portrait": "'(orientation: portrait)'",
		"xsmall-stretch": "'not screen and (min-width: 460px), not screen and (min-height: 420px)'",
		"small-stretch": "'not screen and (min-width: 704px), not screen and (min-height: 540px)'",
		"default":"'only screen and (min-width: 704px) and (min-height: 540px)'",
		"medium-wide": "'only screen and (min-width: 1024px) and (min-height: 540px)'",
		"large-wide": "'only screen and (min-width: 1224px) and (min-height: 704px)'",
		"xlarge-wide": "'only screen and (min-width: 1824px) and (min-height: 1024px)'"
	},
	"default_colors": {
		"color": "hsl(47, 5%, 15%)",
		"background-color": "hsl(47, 5%, 95%)",
		"link-color": "hsl(10, 80%, 50%)"
	},
	"temp": {
		"collapse_offset": "360"
	},
	"_ignore": {
		"transitions": {
			"ease": "cubic-bezier(0.42, 0.0, 0.58, 1.0)",
			"duration_ms": "400",
			"delay_interval_ms": "134",
			"min_delay_ms": "34"
		},
		"default_colors": {
			"--link-color": "hsl(10, 80%, 50%)",
			"--alt-background-color": "unset"
		},
		"units": {
			"hu_px": "20",
			"vu_px": "12"
		},
		"breakpoints": {
			"mobile": "'not screen and (min-width: 704px), not screen and (min-height: 540px)'",
			"unsupported": "'not screen and (min-width: 704px)'",
			"unquoted": "only screen and (min-width: 1824px)",
			"unquoted_neg": "not screen and (min-width: 704px)",
			"quoted_combined": "'not screen and (min-width: 704px), not screen and (min-height: 540px)'",
			"array": [
				"only screen and (min-width: 704px)",
				"not screen and (min-width: 704px)",
				"not screen and (min-height: 540px)"
			]
		}
	}
}

},{}]},{},[53])
//# sourceMappingURL=folio-dev-main.js.map
