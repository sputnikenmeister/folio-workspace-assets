/**
 * @module app/view/base/View
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {Function} */
var prefixed = require("../../utils/strings/prefixed");
/** @type {Function} */
var dashedToCamel = require("../../utils/strings/dashedToCamel");
/** @type {Function} */
var camelToDashed = require("../../utils/strings/camelToDashed");

var _jsPrefixed = {};
var _cssPrefixed = {};

//var _viewsByCid = {};
var _views = [];
var _elements = [];
var _count = 0;

var _callLaterQueue = [];
var _callLaterQueueId = 0;

function requestCallLater() {
	if (_callLaterQueueId == 0) {
		_callLaterQueueId = window.requestAnimationFrame(function() {
			var num = _callLaterQueue.length;
			do {
				_callLaterQueue[--num].call();
			}
			while (num > 0);
			_callLaterQueueId = 0;
		});
	}
}

/**
 * @constructor
 * @type {module:app/view/base/View}
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
		var idx = _views.indexOf(this);
		_views.splice(idx, 1);
		_elements.splice(idx, 1);
		_count--;
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
		_views[_count] = this;
		_elements[_count] = this.el;
		_count++;
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
	},

	callLater: function(fn) {
		return this.applyLater(fn, Array.prototype.slice.call(1, arguments));
	},

	applyLater: function(fn, args) {
		var context = this;
		var bound = function () {
			_callLaterQueue.splice(_callLaterQueue.indexOf(bound), 1);
			return fn.apply(context, args);
		};
		_callLaterQueue.push(bound);
		requestCallLater();
		return bound;
	},

},{
	findByElement: function(element) {
		return _views[_elements.indexOf(element)];
	},
});

module.exports = View;

