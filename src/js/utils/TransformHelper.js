/* -------------------------------
/* Imports
/* ------------------------------- */


/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:utils/TransformItem} */
var TransformItem = require("./TransformItem");

// /** @type {module:utils/setImmediate} */
// var setImmediate = require("./setImmediate");

var idSeed = 0;
var cidSeed = 100;
var slice = Array.prototype.slice;

/**
 * @constructor
 * @type {module:app/helper/TransformHelper}
 */
function TransformHelper() {
	this.id = idSeed++;
	this._items = {};
	this.immediate = false;
	
	this._validateCallbackId = -1;
	this._validateCallback = this._validateCallback.bind(this);
}

TransformHelper.prototype = {
	
	/* -------------------------------
	/* Public
	/* ------------------------------- */
	
	has: function(el) {
		return el._txId && this._items[el._txId] !== void 0;
	},
	
	get: function(el) {
		if (this.has(el)) {
			return this._items[el._txId];
		} else {
			if (!el._txId) {
				el._txId = el.cid || ("elt" + cidSeed++);
				// el.setAttribute("data-cid", el._txId);
			}
			return this._items[el._txId] = new TransformItem(el, this.immediate);
		}
	},
	
	add: function() {
		var i, j, el;
		for (i = 0; i < arguments.length; ++i) {
			el = arguments[i];
			if (el.length) { //_.isArray(el)) {
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
			if (el.length) { //_.isArray(el)) {
				for (j = 0; j < el.length; ++j) {
					this._remove(el[j]);
				}
			} else {
				this._remove(el);
			}
		}
	},
	
	_remove: function(el) {
		if (this.has(el)) {
			var o = this._items[el._txId];
			o.destroy();
			delete this._items[el._txId];
		}	
	},
	
	/* --------------------------------
	/* public
	/* -------------------------------- */
	
	/* public: capture
	/* - - - - - - - - - - - - - - - - */
	
	capture: function() {
		this._invoke("capture", arguments);
	},
	captureAll: function() {
		for (var i in this._items) {
			this._items[i].capture();
		}
	},
	
	clearCapture: function() {
		this._invoke("clearCapture", arguments);
	},
	clearAllCaptures: function() {
		for (var i in this._items) {
			this._items[i].clearCapture();
		}
	},
	
	/* public: offset
	/* - - - - - - - - - - - - - - - - */
	
	offset: function(x, y){
		this._invoke("offset", arguments, 2);
	},
	offsetAll: function(x, y) {
		for (var i in this._items) {
			this._items[i].offset(x, y);
		}
	},
	
	clearOffset: function() {
		this._invoke("clearOffset", arguments);
	},
	clearAllOffsets: function() {
		for (var i in this._items) {
			this._items[i].clearOffset();
		}
	},
	
	/* public: transitions
	/* - - - - - - - - - - - - - - - - */
	
	runTransition: function(transition) {
		this._invoke("runTransition", arguments, 1);
	},
	runAllTransitions: function(transition) {
		for (var i in this._items) {
			this._items[i].runTransition(transition);
		}
	},
	
	clearTransitions: function() {
		this._invoke("clearTransitions", arguments);
	},
	clearAllTransitions: function() {
		for (var i in this._items) {
			this._items[i].clearCapture();
		}
	},
	
	stopTransitions: function() {
		this._invoke("stopTransitions", arguments);
	},
	stopAllTransitions: function() {
		for (var i in this._items) {
			this._items[i].stopTransitions();
		}
	},
	
	/* -------------------------------
	/* private utils
	/* ------------------------------- */
	
	_invoke: function(funcName, args, startIndex) {
		var i, ii, j, jj, el, o;
		var funcArgs = null;
		if (startIndex !== void 0) {
			funcArgs = slice.call(args, 0, startIndex);
		} else {
			startIndex = 0;
		}
		for (i = startIndex, ii = args.length; i < ii; ++i) {
			el = args[i];
			if (el.length) { //_.isArray(el)) {
				for (j = 0, jj = el.length; j < jj; ++j) {
					o = this.get(el[j]);
					o[funcName].apply(o, funcArgs);
				}
			} else {
				o = this.get(el);
				o[funcName].apply(o, funcArgs);
			}
		}
	},
	
	/* -------------------------------
	/* validation
	/* ------------------------------- */
	
	validate: function () {
		// if (!this._pending) {
		// 	this._pending = true;
		// 	setImmediate(function() {
		// 		this._validate();
		// 		this._pending = false;
		// 	}.bind(this));
		// }
		
		if (this._validateCallbackId !== -1) {
			window.cancelTimeout(this._validateCallbackId);
			this._validateCallbackId = -1;
		}
		this._validate();
	},
	
	invalidate: function() {
		if (this._validateCallbackId === -1) {
			// console.warn("TransformHelper._invalidate");
			this._validateCallbackId = window.setTimeout(this._validateCallback, 100);
			// this._validateCallbackId = window.requestAnimationFrame(this._validateCallback);
			
			console.log("TransformHelper.invalidate", this._validateCallbackId);
		}
	},
	
	_validateCallback: function() {
		console.log("TransformHelper._validateCallback", this._validateCallbackId);
		this._validateCallbackId = -1;
		this._validate();
	},
	
	_validate: function () {
		for (var i in this._items) {
			this._items[i].validate();
		}
	},
};

module.exports = TransformHelper;
