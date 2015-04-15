/**
 * @module app/view/base/View
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/utils/css/prefixedProperty} */
var prefixedProperty = require("../../utils/css/prefixedProperty");
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

// var _frameHandlers = [];
// var _frameQueue = [];
// var _frameQueueNum = [];
// var _frameQueueId = 0;
//
// function _runFrameQueue() {
// 	do {
// 		_frameQueue[--_frameQueueNum].call();
// 	} while (_frameQueueNum > 0);
// 	_frameHandlers.length = 0;
// 	_frameQueue.length = 0;
// 	_frameQueueId = 0;
// }
//
// function _requestFrameRun() {
// 	if (_frameQueueId == 0) {
// 		_frameQueueId = window.requestAnimationFrame(_frameCallback);
// 	}
// }

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
		return _prefixedProps[prop] || (_prefixedProps[prop] = prefixedProperty(this.el.style, prop));
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

	onTransitionEnd: function(target, props, callback, timeout) {
		return addTransitionCallback(props, callback, target, this, timeout || 2000);
	},

	requestAnimationFrame: function(callback) {
		return window.requestAnimationFrame(_.bind(callback, this));
	},

	cancelAnimationFrame: function(id) {
		return window.cancelAnimationFrame(id);
	},

	// callNextFrame: function(fn) {
	// 	return this.applyNextFrame(fn, Array.prototype.slice.call(1, arguments));
	// },
	//
	// onNextFrame: function(handler, args) {
	// 	var context = this;
	// 	var bound = function () {
	// 		context.offNextFrame(handler)
	// 		return handler.apply(context, args);
	// 	};
	// 	var idx = _frameHandlers.indexOf(handler);
	// 	if (idx == -1)
	// 		idx = _frameQueueNum;
	// 		_frameQueueNum++;
	// 	}
	// 	_frameHandlers[idx] = handler;
	// 	_frameQueue[idx] = bound;
	// 	_requestFrameRun();
	// 	return bound;
	// },
	//
	// offNextFrame: function(fn) {
	// 	var idx = _frameHandlers.indexOf(fn);
	// 	if (idx == -1) {
	// 		_frameHandlers.splice(idx, 1);
	// 		_frameQueue.splice(idx, 1);
	// 		_frameQueueNum--;
	// 	} else {
	// 		console.error("onNextFrame not registered");
	// 	}
	// },

},{
	findByElement: function(element) {
		return _views[_elements.indexOf(element)];
	},
});

module.exports = View;
