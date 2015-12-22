/* global MutationObserver */
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
/** @type {Function} */
var transitionEnd = require("utils/event/transitionEnd");

/** @type {module:utils/event/addTransitionCallback} */
var addTransitionCallback = require("utils/event/addTransitionCallback");
// /** @type {Function} */
var getPrototypeChainValue = require("utils/object/getPrototypeChainValue");

/* -------------------------------
/* static private
/* ------------------------------- */

var _cidSeed = 1;
var _viewsByCid = {};

var observer = new MutationObserver(function(mm) {
	// console.log("View::mutations %i", mm.length);
	var i, ii, m;
	var j, jj, e;
	var view;
	for (i = 0, ii = mm.length; i < ii; i++) {
		m = mm[i];
		if (m.type == "childList") {
			for (j = 0, jj = m.addedNodes.length; j < jj; j++) {
				e = m.addedNodes.item(j);
				if (e.cid !== void 0) {
					view = _viewsByCid[e.cid];
					view._viewAdded();
					// console.log("View::[viewElementAttached] %s", view.cid);
				}
			}
			for (j = 0, jj = m.removedNodes.length; j < jj; j++) {
				e = m.removedNodes.item(j);
				if (e.cid !== void 0) {
					view = _viewsByCid[e.cid];
					view._viewRemoved();
					// console.log("View::[viewElementRemoved] %s", e.cid);
				}
			}
		} else if (m.type == "attributes") {
			if (m.target.cid !== void 0) {
				view = _viewsByCid[m.target.cid];
				view._viewAdded();
				// console.log("View::[viewAttachedToElement] %s", m.target.cid);
			}
			else {
				console.warn("View::[attributes] target has no cid (%s='%s')", m.attributeName, m.target.getAttribute(m.attributeName), m);
			}
		}
	}
});

observer.observe(document.body, {
	attributes: true,
	childList: true,
	subtree: true,
	attributeFilter: ["data-cid"]
});

/* -------------------------------
/* requestAnimationFrame queue
/* ------------------------------- */

// var _isExecuting = false;
var _queue = [];
var _queueRafId = -1;
var _fnidSeed = 0;

var _callQueuedAF = function(tstamp) {
	// console.log("View::callQueuedAF (%i calls)", _queue.length);
	var queue = _queue;
	_queue = [];
	_fnidSeed += queue.length;
	_queueRafId = -1;
	// _isExecuting = true;
	queue.forEach(function(fn) {
		fn && fn(tstamp);
	});
	// _isExecuting = false;
};
var requestQueuedAF = function(fn) {
	// _isExecuting && console.warn("View::requestQueuedAF", "nested invocation");
	if (_queueRafId == -1) {
		_queueRafId = window.requestAnimationFrame(_callQueuedAF);
	}
	_queue.push(fn);
	return (_queue.length - 1) + _fnidSeed;
};
var cancelQueuedAF = function(fnid) {
	var fnRef;
	if (fnid > _fnidSeed) {
		fnRef = _queue[fnid - _fnidSeed];
		_queue[fnid - _fnidSeed] = null;
	}
	if (!fnRef) console.warn("View::cancelQueuedAF ID %s not found", fnid);
	return fnRef;
};

// var requestRenderImpl = requestQueuedAF;
// var cancelRenderImpl = cancelQueuedAF;

/* -------------------------------
/* static public
/* ------------------------------- */

var View = {
	// rootViews: {},
	findByElement: function(el) {
		return _viewsByCid[el.cid];
	},
	findByDescendant: function(el) {
		do
			if (_viewsByCid[el.cid])
				return _viewsByCid[el.cid];
		while (el = el.parentElement);
		return null;
	},
	ViewError: require("app/view/base/ViewError"),
};

/* -------------------------------
/* prototype
/* ------------------------------- */

var ViewProto = {
	
	/** @type {string} */
	cidPrefix: "view",
	
	/** @type {object} */
	properties: {
		cid: {
			get: function() {
				return this._cid || (this._cid = this.cidPrefix + _cidSeed++);
			}
		},
		enabled: {
			get: function() {
				return this._enabled;
			}
		},
		domPhase: {
			get: function() {
				return this._domPhase;
			}
		}
	},
	
	parentView: null,
	
	_domPhase: "created",// created>added>removed
	
	_viewPhase: "initializing",// initializing>initialized>disposing>disposed
	
	/**
	* @constructor
	* @type {module:app/view/base/View}
	*/
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
		
		this.parentView = null;
		this.childViews = {};
		
		Backbone.View.apply(this, arguments);
		
		// console.log("%s::initialize viewPhase:[%s => initialized]", this.cid, this._viewPhase);
		this._viewPhase = "initialized";
		if (this._domPhase === "added") {
			this.trigger("view:added", this);
		}
	},
	
	/** @override */
	remove: function() {
		// console.log("%s::remove viewPhase:[%s => disposing]", this.cid, this._viewPhase);
		this._viewPhase = "disposing";
		
		this.trigger("view:removed", this);
		for (var cid in this.childViews) {
			this.childViews[cid].remove();
		}
		this._removeFromParentView();
		
		Backbone.View.prototype.remove.apply(this, arguments);
		
		delete _viewsByCid[this.cid];
		delete this.el.cid;
		
		this._viewPhase = "disposed";
		return this;
	},
	
	_viewAdded: function() {
		// console.log("%s::_viewAdded domPhase:[%s => added]", this.cid, this._domPhase);
		this._domPhase = "added";
		this._addToParentView();
		
		if (this._viewPhase === "initialized") {
			this.trigger("view:added", this);
		} else if (this._viewPhase === "replacing") {
			this.trigger("view:replaced", this);
			this._viewPhase === "initialized";
		}
	},
	
	_viewRemoved: function() {
		// console.log("%s::_viewRemoved domPhase:[%s => removed]", this.cid, this._domPhase);
		this._domPhase = "removed";
		if (this._viewPhase === "initialized") {
			this.remove();
		}
	},
	
	_addToParentView: function() {
		this.parentView = View.findByDescendant(this.el.parentElement);
		if (this.parentView) {
			this.parentView.childViews[this.cid] = this;
		}
	},
	
	_removeFromParentView: function() {
		if (this.parentView && (this.cid in this.parentView.childViews)) {
			delete this.parentView.childViews[this.cid];
		}
	},
	
	/* -------------------------------
	/* Backbone.View overrides
	/* ------------------------------- */
	
	/** @override */
	setElement: function(element, delegate) {
		// setElement always initializes this.el, so check it to be non-null before calling super
		if (this.el) {
			if (this.el !== element && this.el.parentElement) {
				// If element is being replaced, set _viewPhase = "replacing"
				if (this._domPhase === "added") {
					this._viewPhase = "replacing";
				}
				this.el.parentElement.replaceChild(element, this.el);
				// var currPhase = this._viewPhase;
				// this._viewPhase = "replacing";
				// this.el.parentElement.replaceChild(element, this.el);
				// this._viewPhase = currPhase;
			}
			Backbone.View.prototype.setElement.apply(this, arguments);
			// Merge classes specified by this view with the ones already in the element,
			// as backbone will not:
			if (this.className) {
				_.result(this, "className").split(" ").forEach(function (item) {
					this.el.classList.add(item);
				}, this);
			}
		} else {
			Backbone.View.prototype.setElement.apply(this, arguments);
		}
		
		if (this.el === void 0) {
			throw new Error("Backbone view has no element");
		}
		_viewsByCid[this.cid] = this;
		this.el.cid = this.cid;
		this.el.setAttribute("data-cid", this.cid);
		
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
	
	/* -------------------------------
	/* transitionEnd helpers
	/* ------------------------------- */
	 
	// onTransitionEnd: function(target, prop, callback, timeout) {
	// 	console.warn("[deprecated] %s::onTransitionEnd", this.cid);
	// 	return addTransitionCallback(target, prop, callback, this, timeout);
	// },
	
	/* -------------------------------
	/* requestAnimationFrame
	/* ------------------------------- */
	
	requestAnimationFrame: function(callback) {
		return requestQueuedAF(callback.bind(this));
		// return window.requestAnimationFrame(callback.bind(this));
	},
	
	cancelAnimationFrame: function(id) {
		return cancelQueuedAF(id);
		// return window.cancelAnimationFrame(id);
	},
	
	/* -------------------------------
	/* common abstract
	/* ------------------------------- */
	
	setEnabled: function(enable) {
		this._enabled = enable;
	},
};

module.exports = Backbone.View.extend(ViewProto, View);
