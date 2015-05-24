/**
 * @module app/view/base/View
 */

/** @type {module:classlist-polyfill} */
require("classlist-polyfill");
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

var _viewsByCid = {};
// var _viewElements = [];
// var _viewObjs = [];
// var _viewObjsNum = 0;

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
		// var idx = _viewObjs.indexOf(this);
		// _viewObjs.splice(idx, 1);
		// _viewElements.splice(idx, 1);
		// _viewObjsNum--;
		delete _viewsByCid[this.cid];
		return Backbone.View.prototype.remove.apply(this, arguments);
	},

	// _ensureElement: function() {
	// 	Backbone.View.prototype._ensureElement.apply(this, arguments);
	// },

    setElement: function(element, delegate) {
		// setElement always initializes this.el,
		// so this.el has to be checked before calling super
		if (this.el) {
			Backbone.View.prototype.setElement.apply(this, arguments);
			this.$el.addClass(_.result(this, "className"));
		} else {
			Backbone.View.prototype.setElement.apply(this, arguments);
		}
		if (this.el === void 0) {
			console.warn("Backbone view has no element");
		} else {
			this.$el.attr("data-cid", this.cid);
			this.el.cid = this.cid;
		}
		_viewsByCid[this.cid] = this;
		// _viewObjs[_viewObjsNum] = this;
		// _viewElements[_viewObjsNum] = this.el;
		// _viewObjsNum++;
		return this;
	},

	setEnabled: function(enable) {},

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
		return _viewsByCid[element.cid]
		// return _viewObjs[_viewElements.indexOf(element)];
	},
});

module.exports = View;
