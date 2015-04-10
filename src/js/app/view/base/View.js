/**
 * @module app/view/base/View
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/utils/strings/prefixed} */
var prefixed = require("../../utils/strings/prefixed");
/** @type {module:app/utils/strings/dashedToCamel} */
var dashedToCamel = require("../../utils/strings/dashedToCamel");
/** @type {module:app/utils/strings/camelToDashed} */
var camelToDashed = require("../../utils/strings/camelToDashed");
/** @type {module:app/utils/event/addTransitionEndCommand} */
var addTransitionCallback = require("../../utils/event/addTransitionCallback");

var _prefixedProps = {};
var _prefixedStyles = {};

//var _viewsByCid = {};
var _views = [];
var _elements = [];
var _count = 0;

var _rafQueue = [];
var _rafQueueId = 0;

function requestCallLater() {
	if (_rafQueueId == 0) {
		_rafQueueId = window.requestAnimationFrame(function() {
			var num = _rafQueue.length;
			do {
				_rafQueue[--num].call();
			}
			while (num > 0);
			_rafQueueId = 0;
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

	getPrefixedProperty: function(prop) {
		return _prefixedProps[prop] || (_prefixedProps[prop] = prefixed(this.el.style, prop));
	},

	getPrefixedStyle: function(prop) {
		var p, pp;
		if (_prefixedStyles[prop] === void 0) {
			p = dashedToCamel(prop);
			pp = this.getPrefixedProperty(p);
			_prefixedStyles[prop] = (p === pp? "" : "-") + camelToDashed(pp);
		}
		return _prefixedStyles[prop];
	},

	onTransitionEnd: function(target, props, callback) {
		return addTransitionCallback(props, callback, target, this, 2000);
	},

	callNextFrame: function(fn) {
		return this.applyNextFrame(fn, Array.prototype.slice.call(1, arguments));
	},

	cancelNextFrame: function(fn) {
		var idx = _rafQueue.indexOf(fn);
		(idx != -1) && _rafQueue.splice(idx, 1);
	},

	applyNextFrame: function(fn, args) {
		var context = this;
		var bound = function () {
			_rafQueue.splice(_rafQueue.indexOf(bound), 1);
			return fn.apply(context, args);
		};
		_rafQueue.push(bound);
		requestCallLater();
		return bound;
	},

},{
	findByElement: function(element) {
		return _views[_elements.indexOf(element)];
	},
});

module.exports = View;

