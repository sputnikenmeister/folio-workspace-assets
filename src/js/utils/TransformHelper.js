/* -------------------------------
/* Imports
/* ------------------------------- */

// /** @type {module:underscore} */
// var _ = require("underscore");

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

	_get: function(el) {
		if (this.has(el)) {
			return this._itemsById[el.eid];
		} else {
			return this._add(el);
		}
	},

	_add: function(el) {
		var item, id;
		// id = el.eid || el.cid || el.id;
		// if (!id || (this._itemsById[id] && (this._itemsById[id].el !== el))) {
		// 	id = "elt" + cidSeed++;
		// }
		// if (!el.eid) {
		// 	id = el.eid || el.cid || ("elt" + cidSeed++);
		// }
		id = el.eid || el.cid || ("elt" + cidSeed++);
		item = new TransformItem(el, id);
		this._itemsById[id] = item;
		this._items.push(item);
		return item;
	},

	_remove: function(el) {
		if (this.has(el)) {
			var o = this._itemsById[el.eid];
			this._items.splice(this._items.indexOf(o), 1);
			o.destroy();
			delete this._itemsById[el.eid];
		}
	},

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

	has: function(el) {
		return el.eid && this._itemsById[el.eid] !== void 0;
	},

	getItems: function() {
		var i, j, el, ret = [];
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

	get: function(el) {
		return this._get(el);
	},

	add: function() {
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

	/* --------------------------------
	/* public
	/* -------------------------------- */

	/* public: single arg
	/* - - - - - - - - - - - - - - - - */

	hasOffset: function(el) {
		return this.has(el) ? this._itemsById[el.eid].hasOffset : (void 0);
	},

	/* public: capture
	/* - - - - - - - - - - - - - - - - */

	capture: function() {
		this._invoke("capture", arguments);
	},
	captureAll: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].capture();
		}
	},

	clearCapture: function() {
		this._invoke("clearCapture", arguments);
	},
	clearAllCaptures: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].clearCapture();
		}
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
	},

	clearOffset: function() {
		this._invoke("clearOffset", arguments);
	},
	clearAllOffsets: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].clearOffset();
		}
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
	},

	clearTransition: function() {
		this._invoke("clearTransition", arguments);
	},
	clearAllTransitions: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].clearTransition();
		}
	},

	stopTransition: function() {
		this._invoke("stopTransition", arguments);
	},
	stopAllTransitions: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].stopTransition();
		}
	},

	whenTransitionEnds: function() {
		var res = this._invoke("whenTransitionEnds", arguments);
		return res.length != 0 ?
			Promise.all(res) :
			Promise.resolve(null);
	},
	whenAllTransitionsEnd: function() {
		return (this._items.length != 0) ? Promise.all(this._items.map(function(o) {
			return o.whenTransitionEnds();
		})) : Promise.resolve(null);
	},

	promise: function() {
		return arguments.length == 0 ?
			this.whenAllTransitionsEnd() :
			this.whenTransitionEnds.call(this, arguments);
	},

	/* -------------------------------
	/* validation
	/* ------------------------------- */

	validate: function() {
		for (var i = 0, ii = this._items.length; i < ii; i++) {
			this._items[i].validate();
		}
	},
}, {
	items: {
		get: function() {
			return this._items;
		}
	}
});

module.exports = TransformHelper;
