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
// /** @type {Function} */
var getPrototypeChainValue = require("utils/object/getPrototypeChainValue");
// /** @type {module:utils/event/addTransitionCallback} */
// var addTransitionCallback = require("utils/event/addTransitionCallback");

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

var _rendering = false;
var _queue = [];
var _queueRafId = -1;
var _fnidSeed = 0;

var _callQueuedAF = function(tstamp) {
	// console.log("View::callQueuedAF (%i calls)", _queue.length);
	var queue = _queue;
	_queue = [];
	_fnidSeed += queue.length;
	_queueRafId = -1;
	_rendering = true;
	queue.forEach(function(fn) {
		fn && fn(tstamp);
	});
	_rendering = false;
};

var requestQueuedAF = function(fn) {
	// _rendering && console.warn("View::requestQueuedAF", "nested invocation");
	if (_queueRafId == -1) {
		_queueRafId = window.requestAnimationFrame(_callQueuedAF);
	}
	_queue.push(fn);
	return (_queue.length - 1) + _fnidSeed;
};

var cancelQueuedAF = function(fnid) {
	var fnRef;
	if (fnid >= _fnidSeed) {
		fnRef = _queue[fnid - _fnidSeed];
		_queue[fnid - _fnidSeed] = null;
		if (!fnRef) console.warn("View::cancelQueuedAF raf:%i not found", fnid);
		// else console.info("View::cancelQueuedAF raf:%s cancelled", fnid);
	}
	// else console.warn("View::cancelQueuedAF raf id past execution (raf: %i, curr seed: %i)", fnid, _fnidSeed);
	return fnRef;
};

/* -------------------------------
/* prefixed events
/* ------------------------------- */

var prefixedEvents = (function(){
	var events = {
		"transitionend": transitionEnd,
		"fullscreenchange": prefixedEvent("fullscreenchange", document),
		"fullscreenerror": prefixedEvent("fullscreenerror", document),
		"visibilitychange": prefixedEvent("visibilitychange", document, "hidden")
	};
	for (var eventName in events) {
		if (eventName === events[eventName]) {
			delete events[eventName];
		}
	}
	return events;
})();

/* -------------------------------
/* static public
/* ------------------------------- */

var View = {
	
	/** @type {module:app/view/base/ViewError} */
	ViewError: require("app/view/base/ViewError"),
	
	/**
	/* @param el {HTMLElement}
	/* @return {module:app/view/base/View}
	/*/
	findByElement: function(el) {
		return _viewsByCid[el.cid];
	},
	
	/**
	/* @param el {HTMLElement}
	/* @return {module:app/view/base/View}
	/*/
	findByDescendant: function(el) {
		do {
			if (_viewsByCid[el.cid]) {
				return _viewsByCid[el.cid];
			}
		} while (el = el.parentElement);
		return null;
	},
	
	/** @override */
	extend: function(proto) {
		var prefixEventDelegates = function(events) {
			// var replaced = [];
			var selector, prefixed, unprefixed;
			for (selector in events) {
				unprefixed = selector.match(/^\w+/i)[0];
				if (prefixedEvents.hasOwnProperty(unprefixed)) {
					// replaced.push(unprefixed);
					events[selector.replace(unprefixed, prefixedEvents[unprefixed])] = events[selector];
					delete events[selector];
				}
			}
			// replaced.length && console.log("[prefixEventDelegates]", replaced, events);
		};
		if (_.isFunction(proto.events)) {
			proto.delegateEvents = _.wrap(proto.delegateEvents, function(fn) {
				// console.log("%s::prefixEventDelegates", this.cid);
				proto.events = prefixEventDelegates(_.result(this, "events"));
				fn.apply(this, Array.prototype.slice.call(arguments, 1));
			});
		} else if (_.isObject(proto.events)) {
			// console.log("[proto:%s]::prefixEventDelegates", proto.cidPrefix);
			prefixEventDelegates(proto.events);
		}
		return Backbone.View.extend.apply(this, arguments);
	},
};

/* -------------------------------
/* prototype
/* ------------------------------- */

var ViewProto = {
	
	/** @type {string} */
	cidPrefix: "view",
	
	/** @type {HTMLElement|null} */
	parentView: null,
	
	/** @type {string} created > added > removed */
	_domPhase: "created",
	
	/** @type {string} initializing > initialized > disposing > disposed */
	_viewPhase: "initializing",
	
	/** @type {int} */
	_renderRafId: -1,
	
	/** @type {object} */
	properties: {
		cid: {
			get: function() {
				return this._cid || (this._cid = this.cidPrefix + _cidSeed++);
			}
		},
		enabled: {
			get: function() {
				return this.isEnabled();
			},
			set: function(enabled) {
				this.setEnabled(enabled);
			}
		},
		domPhase: {
			get: function() {
				return this._domPhase;
			}
		}
	},
	
	/**
	* @constructor
	* @type {module:app/view/base/View}
	*/
	constructor: function(options) {
		Object.defineProperties(this, getPrototypeChainValue(this, "properties", Backbone.View));
		
		if (options && options.className && this.className) {
			options.className += " " + _.result(this, "className");
		}
		// this._renderRafId = -1;
		// this.parentView = null;
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
		this._cancelRender();
		
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
	/* simple render deferring
	/* ------------------------------- */
	
	render: function() {
		return this.renderNow(true);
	},
	
	/** @abstract */
	renderLater: function (tstamp) {
		// subclasses should override this method
	},
	
	requestRender: function() {
		this._requestRender();
	},

	renderNow: function(force) {
		if (this._isPendingRender()) {
			this._cancelRender();
			force = true;
		}
		if (force === true) {
			this._applyRender(window.performance? window.performance.now() : Date.now());
			// this._applyRender(Date.now());
		}
		return this;
	},
	
	/** @private */
	_applyRender: function (tstamp) {
		// console.warn("%s::_applyRender (raf:%i)", this.cid, this._renderRafId);
		this._renderRafId = -1;
		this.renderLater(tstamp);
	},
	
	_cancelRender: function() {
		// cancelQueuedAF(this)
		if (this._isPendingRender()) {
			var ref = this.cancelAnimationFrame(this._renderRafId);
			if (!ref) console.warn("%s::_cancelRender id '%i' not found", this.cid, this._renderRafId);
			this._renderRafId = -1;
		}
	},
	
	_requestRender: function() {
		// requestQueuedAF(this);
		if (!this._isPendingRender()) {
			_rendering && console.log("%s::requestRender inside render loop", this.cid);
			this._renderRafId = this.requestAnimationFrame(this._applyRender);
		}
	},
	
	_isPendingRender: function() {
		// hasQueuedAF(this);
		return this._renderRafId !== -1;
	},
	
	/* -------------------------------
	/* common abstract
	/* ------------------------------- */
	
	
	/** @private */
	_enabled: undefined,
	
	/**
	/* @return {?Boolean}
	/*/
	isEnabled: function () {
		return this._enabled;
	},
	
	/**
	/* @param {Boolean}
	/* @return {?Boolean}
	/*/
	setEnabled: function(enable) {
		this._enabled = enable;
	},
};

module.exports = Backbone.View.extend(ViewProto, View);
