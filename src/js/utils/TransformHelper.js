/* -------------------------------
/* Imports
/* ------------------------------- */


/** @type {module:underscore} */
var _ = require("underscore");

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

TransformHelper.prototype = {
	
	/* -------------------------------
	/* Public
	/* ------------------------------- */
	
	has: function(el) {
		return el._txId && this._itemsById[el._txId] !== void 0;
	},
	
	get: function(el) {
		if (this.has(el)) {
			return this._itemsById[el._txId];
		} else {
			return this._add(el);
		}
	},
	
	add: function() {
		var i, j, el;
		for (i = 0; i < arguments.length; ++i) {
			el = arguments[i];
			if (el.length) {
				for (j = 0; j < el.length; ++j) {
					this.get(el[j]);
				}
			} else {
				this.get(el);
			}
		}
	},
	
	remove: function() {
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
	
	_add: function(el) {
		var item;
		if (!el._txId) {
			el._txId = el.cid || ("elt" + cidSeed++);
		}
		item = new TransformItem(el);
		this._itemsById[el._txId] = item;
		this._items.push(item);
		return item;
	},
	
	_remove: function(el) {
		if (this.has(el)) {
			var o = this._itemsById[el._txId];
			this._items.splice(this._items.indexOf(o), 1);
			o.destroy();
			delete this._itemsById[el._txId];
		}
	},
	
	/* --------------------------------
	/* public
	/* -------------------------------- */
	
	/* public: capture
	/* - - - - - - - - - - - - - - - - */
	
	capture: function () {
		this._invoke("capture", arguments);
	},
	captureAll: function () {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].capture();
		}
		// for (var i in this._itemsById) {
		// 	this._itemsById[i].capture();
		// }
	},
	
	clearCapture: function () {
		this._invoke("clearCapture", arguments);
	},
	clearAllCaptures: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].clearCapture();
		}
		// for (var i in this._itemsById) {
		// 	this._itemsById[i].clearCapture();
		// }
	},
	
	/* public: offset
	/* - - - - - - - - - - - - - - - - */
	
	offset: function(x, y) {
		this._invoke("offset", arguments, 2);
	},
	offsetAll: function(x, y) {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].offset(x, y);
		}
		// for (var i in this._itemsById) {
		// 	this._itemsById[i].offset(x, y);
		// }
	},
	
	clearOffset: function() {
		this._invoke("clearOffset", arguments);
	},
	clearAllOffsets: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].clearOffset();
		}
		// for (var i in this._itemsById) {
		// 	this._itemsById[i].clearOffset();
		// }
	},
	
	/* public: transitions
	/* - - - - - - - - - - - - - - - - */
	
	runTransition: function(transition) {
		this._invoke("runTransition", arguments, 1);
	},
	runAllTransitions: function(transition) {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].runTransition(transition);
		}
		// for (var i in this._itemsById) {
		// 	this._itemsById[i].runTransition(transition);
		// }
	},
	
	clearTransition: function() {
		this._invoke("clearTransition", arguments);
	},
	clearAllTransitions: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].clearTransition();
		}
		// for (var i in this._itemsById) {
		// 	this._itemsById[i].clearCapture();
		// }
	},
	
	stopTransition: function() {
		this._invoke("stopTransition", arguments);
	},
	stopAllTransitions: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].stopTransition();
		}
		// for (var i in this._itemsById) {
		// 	this._itemsById[i].stopTransition();
		// }
	},
	
	whenTransitionEnds: function() {
		var res = this._invoke("whenTransitionEnds", arguments);
		return res.length != 0? Promise.all(res) : Promise.resolve(null);
	},
	whenAllTransitionsEnd: function() {
		return (this._items.length != 0)? Promise.all(this._items.map(function(o) {
			return o.whenTransitionEnds();
		})) : Promise.resolve(null);
		// var keys = Object.keys(this._itemsById);
		// return keys.length != 0? Promise.all(keys.map(function(key) {
		// 	return this._itemsById[key].whenTransitionEnds();
		// }, this)) : Promise.resolve(null);
	},
	
	/* -------------------------------
	/* private utils
	/* ------------------------------- */
	
	_invoke: function(funcName, args, startIndex) {
		var i, ii, j, jj, el, o, rr;
		var funcArgs = null;
		if (startIndex !== void 0) {
			funcArgs = slice.call(args, 0, startIndex);
		} else {
			startIndex = 0;
		}
		for (i = startIndex, ii = args.length, rr = []; i < ii; ++i) {
			el = args[i];
			// iterate on NodeList, Arguments, Array...
			if (el.length) {
				for (j = 0, jj = el.length; j < jj; ++j) {
					o = this.get(el[j]);
					rr.push(o[funcName].apply(o, funcArgs));
				}
			} else {
				o = this.get(el);
				rr.push(o[funcName].apply(o, funcArgs));
			}
		}
		return rr;
	},
	
	/* -------------------------------
	/* validation
	/* ------------------------------- */
	
	validate: function () {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].validate();
		}
		// for (var i in this._itemsById) {
		// 	this._itemsById[i].validate();
		// }
	},
};

module.exports = TransformHelper;
