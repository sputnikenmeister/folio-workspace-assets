/**
 * @module app/helper/View
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

var prefixed = require("../utils/strings/prefixed");
var dashedToCamel = require("../utils/strings/dashedToCamel");
var camelToDashed = require("../utils/strings/camelToDashed");

///** @type {Object} */
//var _viewsByCid = {};
///**
// * @param element
// * @return {module:app/helper/View}
// */
//function findByElement (element) {
//	for (var cid in _viewsByCid) {
//		if (_viewsByCid[cid].el === element) {
//			return _viewsByCid[cid];
//		}
//	}
//	return void 0;
//}

var _jsPrefixed = {};
var _cssPrefixed = {};

var _views = [];
var _elements = [];
var _count = 0;

function registerView(view) {
	_views[_count] = view;
	_elements[_count] = view.el;
	_count++;
}
function unregisterView(view) {
	var idx = _views.indexOf(view);
	_views.splice(idx, 1);
	_elements.splice(idx, 1);
	_count--;
}

/**
 * @constructor
 * @type {module:app/helper/View}
 */
var View = Backbone.View.extend({

	constructor: function(options) {
		if (options && options.className && this.className) {
			options.className += " " + _.result(this, "className");
		}
		Backbone.View.apply(this, arguments);
	},

	remove: function() {
		this.trigger("view:remove", this);
		unregisterView(this);
		//delete _viewsByCid[this.cid];
		return Backbone.View.prototype.remove.apply(this, arguments);
	},

    setElement: function(element, delegate) {
		// setElement always initializes this.el,
		// so this.el has to be checked before calling super
		if (this.el) {
			Backbone.View.prototype.setElement.apply(this, arguments);
			this.$el.addClass(_.result(this, "className"));
		} else {
			Backbone.View.prototype.setElement.apply(this, arguments);
		}
		this.$el.attr("data-cid", this.cid);
		registerView(this);
		//_viewsByCid[this.cid] = this;
		return this;
	},

	getPrefixedJS: function(prop) {
		return _jsPrefixed[prop] || (_jsPrefixed[prop] = prefixed(this.el.style, prop));
	},

	getPrefixedCSS: function(prop) {
		var p, pp;
		if (_cssPrefixed[prop] === void 0) {
			p = dashedToCamel(prop);
			pp = this.getPrefixedJS(p);
			_cssPrefixed[prop] = (p === pp? "" : "-") + camelToDashed(pp);
		}
		return _cssPrefixed[prop];
	}

},{

	findByElement: function(element) {
		return _views[_elements.indexOf(element)];
	},
});

module.exports = View;
