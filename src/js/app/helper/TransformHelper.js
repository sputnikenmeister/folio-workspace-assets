/* -------------------------------
* Imports
* ------------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:jshashtable} */
// var HashTable = require("jshashtable");
/** @type {module:hashes.HashTable} */
// var HashTable = require('hashes').HashTable;

/** @type {module:app/helper/TransformItem} */
var TransformItem = require("./TransformItem");

function traceElt(el) {
	var traceId = "";
	var cid;
	if (el.hasAttribute("id")) {
		traceId += "#" + el.id + " ";
	}
	if (el.hasAttribute("data-cid")) {
		cid = el.getAttribute("data-cid");
		if (el.cid === cid) {
			traceId += "@" + cid + " ";
		} else {
			traceId += "@!" + cid + " ";
		}
	}
	if (traceId == "") {
		traceId += "?(" + el.tagName + ") ";
	}
	traceId += "[" + el.classList[0] + "]";
	return traceId;
}

/**
 * @constructor
 * @type {module:app/helper/TransformHelper}
 */
function TransformHelper() {
	// this._elements = [];
	// this._values = [];
	this._items = {};
}

TransformHelper.prototype = {

	add: function(el) {
		this._add(el);
	},

	has: function(el) {
		return this._has(el);
	},

	get: function(el) {
		return this._get(el);
	},

	remove: function(el) {
		this._remove(el);
	},

	/* -------------------------------
	* Private
	* ------------------------------- */

	_add: function(el) {
		if (this._has(el)) {
			return this._items[el.cid];
		} else {
			var o = new TransformItem(el);
			this._items[o.cid] = o;
			return o;
		}
	},
	_get: function(el) {
		return this._has(el)? this._items[el.cid] : this._add(el);
	},
	_has: function(el) {
		return el.cid && this._items[el.cid] !== void 0;
	},
	_remove: function(el) {
		if (this._has(el)) {
			var o = this._items[el.cid];
			o.destroy();
			delete this._items[el.cid];
		}
	},
	releaseAll: function() {
		for (var i in this._items) {
			this._items[i]._release();
		}
	},

	/* -------------------------------
	 * Private
	 * ------------------------------- */

	/*_add: function(el) {
		var idx = this._elements.indexOf(el);
		if (el && idx == -1) {
			idx = this._elements.length;
			this._elements[idx] = el;
			this._values[idx] = new TransformItem(el);
			// el.addEventListener(transitionEnd, this.handleTransitionEnd, false);
		}
		return idx;
	},
	_has: function(el) {
		return this._elements.indexOf(el) != -1;
	},
	_get: function(el) {
		var idx = this._elements.indexOf(el);
		if (idx == -1) {
			idx = this._add(el);
		}
		return this._values[idx];
	},
	_remove: function(el) {
		var o, idx = this._elements.indexOf(el);
		if (idx != -1) {
			o = this._values[idx];
			this._elements.splice(idx, 1);
			this._values.splice(idx, 1);
			o.destroy();
		}
	},
	moveAll: function(x, y) {
		for (var i = 0; i < this._values.length; ++i) {
			this._values[i]._move(x, y);
		}
	},

	captureAll: function() {
		for (var i = 0; i < this._values.length; ++i) {
			this._values[i]._capture();
		}
	},


	releaseAll: function() {
		for (var i = 0; i < this._values.length; ++i) {
			this._values[i]._release();
		}
	},

	clearAll: function() {
		for (var i = 0; i < this._values.length; ++i) {
			this._values[i]._clear();
		}
	},*/

	/* -------------------------------
	 * Public: transitions
	 * ------------------------------- */

	runTransition: function(el, transition) {
		if (_.isArray(el)) {
			for (var i = 0; i < el.length; ++i) {
				this.get(el[i]).runTransition(transition);
			}
		} else {
			this.get(el).runTransition(transition);
		}
	},

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

	/* --------------------------------
	 * Public: transform
	 * -------------------------------- */

	move: function(el, x, y){
		this.get(el)._move(x, y);
	},

	capture: function(el) {
		this.get(el)._capture();
	},

	release: function(el) {
		this.get(el)._release();
	},

	clear: function(el) {
		this.get(el)._clear();
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
	 * old
	 * ------------------------------- */

	/*update: function(el) {
		var o = this.get(el);
		if (o.offset) {
			if (!o.captured) {
				console.info("TransformHelper._updateCSSTransform", "captured values not set: capturing now");
				o.captured = this._captureElementTransform(o.$el.css("transform"));
			}
			o.$el.css({transform: "translate3d(" +
					   (o.offset.x + o.captured.x) + "px, " +
					   (o.offset.y + o.captured.y) + "px, 0px)"
			});
		} else {
			o.$el.css({"transform": ""});
		}
	},*/

	/*_captureElementTransform: function(css) {
		var o = { css: css };
		var m = css.match(/(-?[\d\.]+)(?=[\)\,])/g);
		if (m && m.length == 6) {
			o.x = parseFloat(m[4]);
			o.y = parseFloat(m[5]);
		} else if (m && m.length == 16) {
			o.x = parseFloat(m[12]);
			o.y = parseFloat(m[13]);
		} else {
			o.x = 0;
			o.y = 0;
		}
		console.log("TransformHelper._captureElementTransform_2", o.x, o.y, cssval);
		return o;
	},*/

// _parseTransformValue: function(css) {
// 	var m, mm, ret = {};
// 	mm = css.match(/(matrix|matrix3d)\(([^\)]+)\)/);
// 	if (mm) {
// 		m = mm[2].split(",");
// 		if (mm[1] === "matrix") {
// 			ret.x = parseFloat(m[4]);
// 			ret.y = parseFloat(m[5]);
// 		} else {
// 			ret.x = parseFloat(m[12]);
// 			ret.y = parseFloat(m[13]);
// 		}
// 	} else {
// 		ret.x = 0;
// 		ret.y = 0;
// 	}
// 	return ret;
// },

	/*hasTransition: function(el) {
		var css, prop, ret;
		//css = window.getComputedStyle(el);
		//prop = css.webkitTransition || css.MozTransitionProperty || css.webkitTransitionProperty
		//		|| css.MozTransition || css.transition;
		css = this.get(el).$el.css(["transition-property", "transition"]);
		prop = css["transition-property"] || css["transition"];
		ret = prop.indexOf("transform") != -1;
		console.log("TransformHelper._hasCSSTransition", (ret?"has":"has no") + " transition", css);
		return ret;
	},*/

	/*_captureElementTransform: function(css) {
		var o = { css: css };
		var m = css.match(/(-?[\d\.]+)(?=[\)\,])/g);
		if (m && m.length == 6) {
			o.x = parseFloat(m[4]);
			o.y = parseFloat(m[5]);
		} else if (m && m.length == 16) {
			o.x = parseFloat(m[12]);
			o.y = parseFloat(m[13]);
		} else {
			o.x = 0;
			o.y = 0;
		}
		console.log("TransformHelper._captureElementTransform_2", o.x, o.y, cssval);
		return o;
	},*/

	/* -------------------------------
	 * transition
	 * ------------------------------- */

	/*_parseTransitionValues: function(o) {
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
