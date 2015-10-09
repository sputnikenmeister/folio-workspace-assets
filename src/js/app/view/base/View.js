/**
* @module app/view/base/View
*/

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:underscore.string/dasherize} */
var dasherize = require("underscore.string/dasherize");

/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/prefixedStyleName} */
var prefixedStyleName = require("utils/prefixedStyleName");
/** @type {module:utils/prefixedEvent} */
var prefixedEvent = require("utils/prefixedEvent");

/** @type {module:utils/event/addTransitionCallback} */
var addTransitionCallback = require("utils/event/addTransitionCallback");
/** @type {Function} */
var transitionEnd = require("utils/event/transitionEnd");
// /** @type {Function} */
var getPrototypeChainValue = require("utils/object/getPrototypeChainValue");

var _viewsByCid = {};
var _cidSeed = 1;

/**
* @constructor
* @type {module:app/view/base/View}
*/
var View = Backbone.View.extend({
	
	/** @type {string} */
	cidPrefix: "view",
	
	properties: {
		cid: {
			get: function() {
				return this._cid || (this._cid = this.cidPrefix + _cidSeed++);
			}
		}
	},
	
	constructor: function(options) {
		Object.defineProperties(this, getPrototypeChainValue(this, "properties", Backbone.View));
		
		if (options && options.className && this.className) {
			options.className += " " + _.result(this, "className");
		}
		
		if ("transitionend" !== transitionEnd) {
			for (var selector in this.events) {
				if (this.events.hasOwnProperty(selector) && /^transitionend(\s.+)?$/i.test(selector)) {
					this.events[selector.replace("transitionend", transitionEnd)] = this.events[selector];
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
		// If an element was supplied, merge classes specified
		// by this view with the ones already in DOM:
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
	

	// var _prefixedEvents = ["transitionend", "fullscreenchange", "fullscreenerror"];
	
	// delegateEvents: function(events) {
	// 	if (!(events || (events = _.result(this, "events")))) return this;
	// 	
	// 	if ("transitionend" !== transitionEnd) {
	// 		for (var key in events) {
	// 			if (events.hasOwnProperty(key) && /^transitionend(\s.+)?$/i.test(key)) {
	// 				events[key.toLowerCase().replace("transitionend", transitionEnd)] = events[key];
	// 				delete events[key];
	// 			}
	// 		}
	// 	}
	// 	Backbone.View.prototype.delegateEvents.call(this, events);
	// 	return this;
	// },
	
	setEnabled: function(enable) {},
	
	// /* -------------------------------
	// /* css prefix helpers
	// /* ------------------------------- */
	// 
	// getPrefixedProperty: function(prop) {
	// 	return prefixedProperty(prop, this.el.style);
	// 	// return _styleProps[prop] || (_styleProps[prop] = prefixedProperty(prop, this.el.style));
	// },
	// 
	// getPrefixedStyle: function(prop) {
	// 	return prefixedStyleName(prop, this.el.style);
	// 	// var p, pp;
	// 	// if (_styleNames[prop] === void 0) {
	// 	// 	p = dashedToCamel(prop);
	// 	// 	pp = prefixedProperty(p);
	// 	// 	_styleNames[prop] = (p === pp? "" : "-") + camelToDashed(pp);
	// 	// }
	// 	// return _styleNames[prop];
	// },
	
	/* -------------------------------
	/* transitionEnd helpers
	/* ------------------------------- */
	 
	onTransitionEnd: function(target, prop, callback, timeout) {
		// prop = this.getPrefixedStyle(prop)
		return addTransitionCallback(target, prop, callback, this, timeout);
	},
	
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
	
	ViewError: require("app/view/base/ViewError"),
});

module.exports = View;
