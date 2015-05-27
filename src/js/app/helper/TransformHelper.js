/* -------------------------------
* Imports
* ------------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/helper/TransformItem} */
var TransformItem = require("./TransformItem");

/** @type {module:app/utils/debug/traceElement} */
var traceElt = require("../utils/debug/traceElement");

var _idSeed = 100;

/**
 * @constructor
 * @type {module:app/helper/TransformHelper}
 */
function TransformHelper() {
	this._items = {};
	this.get = this.add;
	this.clearTransitions = this.enableTransitions;
}

TransformHelper.prototype = {

	/* -------------------------------
	* Public
	* ------------------------------- */

	add: function(el) {
		if (this.has(el)) {
			return this._items[el.cid];
		} else {
			if (!el.cid) {
				el.cid = "elt" + _idSeed++;
				el.setAttribute("data-cid", el.cid);
			}
			return this._items[el.cid] = new TransformItem(el);
		}
	},

	// get: function(el) {
	// 	return this.has(el)? this._items[el.cid] : this.add(el);
	// },

	has: function(el) {
		return el.cid && this._items[el.cid] !== void 0;
	},

	remove: function(el) {
		if (this.has(el)) {
			var o = this._items[el.cid];
			o.destroy();
			delete this._items[el.cid];
		}
	},

	/* --------------------------------
	 * Public: transform
	 * -------------------------------- */

	move: function(x, y, el){
		this.get(el).move(x, y);
	},

	capture: function(el) {
		this.get(el).capture();
	},

	release: function(el) {
		this.get(el).release();
	},

	clear: function(el) {
		this.get(el).clear();
	},

	moveAll: function(x, y) {
		for (var i in this._items) {
			this._items[i].move(x, y);
		}
	},

	captureAll: function() {
		for (var i in this._items) {
			this._items[i].capture();
		}
	},

	releaseAll: function() {
		for (var i in this._items) {
			this._items[i].release();
		}
	},

	clearAll: function() {
		for (var i in this._items) {
			this._items[i].clear();
		}
	},

	/* -------------------------------
	 * Public: transitions
	 * ------------------------------- */

	runTransition: function(transition) {
		for (var i = 1; i < arguments.length; ++i) {
			var el = arguments[i];
			if (_.isArray(el)) {
				for (var j = 0; j < el.length; ++j) {
					this.get(el[j]).runTransition(transition);
				}
			} else {
				this.get(el).runTransition(transition);
			}
		}
	},

	// runTransition2: function(transition, el) {
	// 	if (arguments.length > 2) {
	// 		for (var i = 1; i < arguments.length; ++i) {
	// 			this.get(arguments[i]).runTransition(transition);
	// 		}
	// 	} else if (_.isArray(el)) {
	// 		for (var j = 0; j < el.length; ++j) {
	// 			this.get(el[j]).runTransition(transition);
	// 		}
	// 	} else {
	// 		this.get(el).runTransition(transition);
	// 	}
	// },

	enableTransitions: function(el) {
		if (this.has(el)) {
			var o = this.get(el);
			o.enableTransitions();
		} else {
			console.warn("element not being tracked:" , traceElt(el));
			// el.style[_properties["transition"]] = "";
		}
	},

	disableTransitions: function(el) {
		if (this.has(el)) {
			var o = this.get(el);
			o.disableTransitions();
		} else {
			console.warn("element not being tracked:" , traceElt(el));
			// el.style[_properties["transition"]] = "none 0s 0s";
		}
	},



	/* -------------------------------
	* Private 1
	* ------------------------------- */

	// _add_ht: function(el) {
	// 	if (!this._store.containsKey(el)) {
	// 		_addPrefixed(el);
	// 		this._store.put(el, {el: el, $el: $(el)})
	// 	}
	// 	return this._store.get(el);
	// },
	//
	// _get_ht: function(el) {
	// 	return this._add(el);
	// },
	//
	// _remove_ht: function(el) {
	// 	this._store.remove(el);
	// },

	/* -------------------------------
	 * transition
	 * ------------------------------- */

	/*
	_parseTransitionValues: function(o) {
		var ret = {};
		var css, values, idx, d = 0;
		css = o.$el.css(["transition-property", "transition-duration", "transition-delay"]);
		values = css["transition-property"].split(",");
		idx = values.length;
		do { --idx; } while (idx != -1 && values[idx].indexOf("transform") == -1);
		//while (idx && values[--idx].indexOf("transform")) {}
		if (idx != -1) {
			values = css["transition-duration"].split(",");
			ret.duration = parseFloat((idx < values.length)? values[idx] : values[values.length - 1]);
			values = css["transition-delay"].split(",");
			ret.delay = parseFloat((idx < values.length)? values[idx] : values[values.length - 1]);
		} else {
			ret.duration = 0;
			ret.delay = 0;
		}
		return ret;
	},

	hasTransition: function(el) {
		var o = this.get(el), ret = false;
		if (o.transition === void 0) {
			o.transition = this._parseTransitionValues(o);
			ret = o.transition.delay + o.transition.duration > 0;
			console.log("TransformHelper.hasTransition", o.id, ret,
				o.transition.delay, o.transition.duration);
		} else {
			ret = o.transition.delay + o.transition.duration > 0;
			console.log("TransformHelper.hasTransition", o.id, ret,
				o.transition.delay, o.transition.duration, "(cached)");
		}
		return ret;
	},*/
};


module.exports = TransformHelper;
