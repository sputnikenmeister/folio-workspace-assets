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
/** @type {module:app/utils/event/addTransitionCallback} */
var addTransitionCallback = require("../../utils/event/addTransitionCallback");
/** @type {Function} */
var transitionEnd = require("../../utils/event/transitionEnd");

var _styleProps = {};
var _styleNames = {};
var _viewsByCid = {};

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
		delete _viewsByCid[this.cid];
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
		if (this.el === void 0) {
			console.warn("Backbone view has no element");
		} else {
			this.$el.attr("data-cid", this.cid);
			this.el.cid = this.cid;
		}
		_viewsByCid[this.cid] = this;
		return this;
	},
	
	setEnabled: function(enable) {},
	
	getPrefixedProperty: function(prop) {
		return _styleProps[prop] || (_styleProps[prop] = prefixedProperty(this.el.style, prop));
	},
	
	getPrefixedStyle: function(prop) {
		var p, pp;
		if (_styleNames[prop] === void 0) {
			p = dashedToCamel(prop);
			pp = this.getPrefixedProperty(p);
			_styleNames[prop] = (p === pp? "" : "-") + camelToDashed(pp);
		}
		return _styleNames[prop];
	},
	
	/* -------------------------------
	 * transitionEnd helpers
	 * ------------------------------- */
	 
	onTransitionEnd: function(target, prop, callback, timeout) {
		return addTransitionCallback(target, prop, callback, this, timeout || 2000);
	},
	
	whenTransitionEnds: function(target, prop, timeout) {
		var view = this;
		var eventHandler, timeoutId, viewRemoveHandler;
		timeout || (timeout = 1000);
		
		var cleanup = function() {
         console.log(view.cid, "whenTransitionEnds promise: cleanup");
			timeoutId && window.clearTimeout(timeoutId);
			target.removeEventListener(transitionEnd, eventHandler, false);
			view.off("view:remove", viewRemoveHandler);
		};
		
		return Promise.race([
			new Promise(function(resolve, reject){
				// resolve on event
				eventHandler = function(ev) {
					if (ev.target === target && prop == ev.propertyName) {
						console.log(view.cid, "whenTransitionEnds promise", "DOM Event: " + transitionEnd);
						resolve();
					}
				};
				target.addEventListener(transitionEnd, eventHandler, false);
			}),
			new Promise(function(resolve, reject){
				// resolve on timeout
				timeoutId = window.setTimeout(function () {
					console.log(view.cid, "whenTransitionEnds promise", "timeoutId: " + timeoutId);
					timeoutId = null;
					resolve();
				}, timeout);
			}),
			new Promise(function(resolve, reject){
				// resolve on view removal
				viewRemoveHandler = function() {
					console.log(view.cid, "whenTransitionEnds promise", "view:remove");
					reject();
				};
				view.on("view:remove", viewRemoveHandler);
			}),
		]).then(cleanup, cleanup);
	},
	
	/* -------------------------------
	 * requestAnimationFrame
	 * ------------------------------- */
	
	requestAnimationFrame: function(callback) {
		return window.requestAnimationFrame(callback.bind(this));
	},
	
	cancelAnimationFrame: function(id) {
		return window.cancelAnimationFrame(id);
	},
	
},{
	findByElement: function(element) {
		return _viewsByCid[element.cid];
	},
});

module.exports = View;
