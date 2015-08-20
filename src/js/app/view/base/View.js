/**
* @module app/view/base/View
*/

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:utils/css/prefixedProperty} */
var prefixedProperty = require("../../../utils/css/prefixedProperty");
/** @type {module:utils/css/prefixedStyleName} */
var prefixedStyleName = require("../../../utils/css/prefixedStyleName");

/** @type {module:utils/event/addTransitionCallback} */
var addTransitionCallback = require("../../../utils/event/addTransitionCallback");
/** @type {Function} */
var transitionEnd = require("../../../utils/event/transitionEnd");

// var _styleProps = {};
// var _styleNames = {};
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
		if ("transitionend" !== transitionEnd) {
			for (var selector in this.events) {
				if (this.events.hasOwnProperty(selector) && /^transitionend(\s.+)?$/i.test(selector)) {
					this.events[selector.toLowerCase().replace("transitionend", transitionEnd)] = this.events[selector];
					delete this.events[selector];
				}
			}
		}
		Backbone.View.apply(this, arguments);
	},
	
	remove: function() {
		this.trigger("view:remove", this);
		Backbone.View.prototype.remove.apply(this, arguments);
		delete _viewsByCid[this.cid];
		return this;
	},
	
	setElement: function(element, delegate) {
		// setElement always initializes this.el,
		// so this.el has to be checked before calling super
		if (this.el && this.className) {
			Backbone.View.prototype.setElement.apply(this, arguments);
			_.result(this, "className").split(" ").forEach(function (item) {
				this.el.classList.add(item);
			}, this);
		} else {
			Backbone.View.prototype.setElement.apply(this, arguments);
		}
		if (this.el === void 0) {
			console.warn("Backbone view has no element");
		} else {
			this.el.setAttribute("data-cid", this.cid);
			this.el.cid = this.cid;
		}
		_viewsByCid[this.cid] = this;
		return this;
	},
	
	setEnabled: function(enable) {},
	
	/* -------------------------------
	/* css prefix helpers
	/* ------------------------------- */
	
	getPrefixedProperty: function(prop) {
		return prefixedProperty(prop, this.el.style);
		// return _styleProps[prop] || (_styleProps[prop] = prefixedProperty(prop, this.el.style));
	},
	
	getPrefixedStyle: function(prop) {
		return prefixedStyleName(prop, this.el.style);
		// var p, pp;
		// if (_styleNames[prop] === void 0) {
		// 	p = dashedToCamel(prop);
		// 	pp = this.getPrefixedProperty(p);
		// 	_styleNames[prop] = (p === pp? "" : "-") + camelToDashed(pp);
		// }
		// return _styleNames[prop];
	},
	
	/* -------------------------------
	/* transitionEnd helpers
	/* ------------------------------- */
	 
	onTransitionEnd: function(target, prop, callback, timeout) {
		// prop = this.getPrefixedStyle(prop)
		return addTransitionCallback(target, prop, callback, this, timeout);
	},
	
	// getTransitionPromise: function(target, prop, timeout) {
	// 	var promise = getTransitionPromise(target, this.getPrefixedStyle(prop), this, timeout);
	// 	promise.always(function() {
	// 		this.off("view:remove", promise.cancel, promise);
	// 	});
	// 	this.on("view:remove", promise.cancel, promise);
	// 	return promise;
	// },
	
	/* -------------------------------
	/* requestAnimationFrame
	/* ------------------------------- */
	
	requestAnimationFrame: function(callback) {
		return window.requestAnimationFrame(callback.bind(this));
	},
	
	cancelAnimationFrame: function(id) {
		return window.cancelAnimationFrame(id);
	},
},{
	// extend: function(protoProps, staticProps) {
	// 	var child = Backbone.View.extend.apply(this, arguments);
	// 	var childClassName = child.prototype.className;
	// 	var parentClassName = this.prototype.className;
	// 	
	// 	if (parentClassName && childClassName) {
	// 		if (_.isFunction(childClassName) || _.isFunction(parentClassName)) {
	// 			child.prototype.className = function () {
	// 				return _.result(this, parentClassName) + " " + _.result(this, childClassName);
	// 			};
	// 		} else {
	// 			child.prototype.className = parentClassName + " " + childClassName;
	// 		}
	// 		console.log("extend className: ", parentClassName, "|", childClassName);
	// 	}
	// 	
	// 	return child;
	// },
	
	findByElement: function(element) {
		return _viewsByCid[element.cid];
	},
	
	ViewError: require("./ViewError"),
});

module.exports = View;
