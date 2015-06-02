/* -------------------------------
* Imports
* ------------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/helper/TransformItem} */
var TransformItem = require("./TransformItem");

/** @type {module:app/utils/debug/traceElement} */
var traceElt = require("../utils/debug/traceElement");

require("../../shims/requestAnimationFrame");

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

	this._validateCallbackId = -1;
	this._validateCallback = this._validateCallback.bind(this);

	this.get = this.add;
	this.clearTransitions = this.enableTransitions;
}

TransformHelper.prototype = {

	/* -------------------------------
	* Public
	* ------------------------------- */

	has: function(el) {
		return el.cid && this._items[el.cid] !== void 0;
	},

	add: function(el) {
		if (this.has(el)) {
			return this._items[el.cid];
		} else {
			if (!el.cid) {
				el.cid = "elt" + cidSeed++;
				el.setAttribute("data-cid", el.cid);
			}
			return this._items[el.cid] = new TransformItem(el);
		}
	},

	remove: function(el) {
		if (this.has(el)) {
			var o = this._items[el.cid];
			o.destroy();
			delete this._items[el.cid];
		}
	},

	/* --------------------------------
	 * public
	 * -------------------------------- */
	
	/* public: capture
	 * - - - - - - - - - - - - - - - - */

	capture: function() {
		//  _.each(_.flatten(arguments, true), function(el) {
		// 	this.get(el).capture();
		// }, this);
		this._invoke("capture", arguments);
	},

	clearCapture: function() {
		//  _.each(_.flatten(arguments, true), function(el) {
		// 	this.get(el).clearCapture();
		// }, this);
		this._invoke("clearCapture", arguments);
	},

	captureAll: function() {
		for (var i in this._items) {
			this._items[i].capture();
		}
	},

	clearCaptureAll: function() {
		for (var i in this._items) {
			this._items[i].clearCapture();
		}
	},

	/* public: offset
	 * - - - - - - - - - - - - - - - - */

	offset: function(x, y){
		//  _.each(_.flatten(slice.call(arguments, 2), true), function(el) {
		// 	this.get(el).offset(x, y);
		// 	// this._invalidate();
		// }, this);
		this._invoke("offset", arguments, 2);
	},

	clearOffset: function() {
		//  _.each(_.flatten(arguments, true), function(el) {
		// 	this.get(el).clearOffset();
		// 	// this._invalidate();
		// }, this);
		this._invoke("clearOffset", arguments);
	},

	offsetAll: function(x, y) {
		for (var i in this._items) {
			this._items[i].offset(x, y);
		}
	},

	clearOffsetAll: function() {
		for (var i in this._items) {
			this._items[i].clearOffset();
		}
	},

	/* public: transitions
	 * - - - - - - - - - - - - - - - - */

	runTransition: function(transition) {
		this._invoke("runTransition", arguments, 1);
	},

	enableTransitions: function(el) {
		this._invoke("enableTransitions", arguments);
	},

	disableTransitions: function(el) {
		this._invoke("disableTransitions", arguments);
	},

	/* -------------------------------
	 * private utils
	 * ------------------------------- */

	_invoke: function(funcName, args, startIndex) {
		var i, j, el, o;
		var funcArgs = null;
		if (startIndex !== void 0) {
			funcArgs = slice.call(args, 0, startIndex);
		} else {
			startIndex = 0;
		}
		for (i = startIndex; i < args.length; ++i) {
			el = args[i];
			if (_.isArray(el)) {
				for (j = 0; j < el.length; ++j) {
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
	 * validation
	 * ------------------------------- */

	validate: function () {
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
		console.log("TransformHelper._validate", this.id);
		for (var i in this._items) {
			// if (this._items.hasOwnProperty(i)) {
				this._items[i].validate();
			// }
		}
	},
};


module.exports = TransformHelper;
