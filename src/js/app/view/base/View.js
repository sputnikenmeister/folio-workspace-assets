/* global MutationObserver */
/**
* @module app/view/base/View
*/

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/* -------------------------------
/* MutationObserver 
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
			// else {
			// 	console.warn("View::[attributes] target has no cid (%s='%s')", m.attributeName, m.target.getAttribute(m.attributeName), m);
			// }
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

var _now = window.performance? 
	window.performance.now.bind(window.performance) :
	Date.now.bind(Date);

/** @type {module:app/view/base/FrameQueue} */
var FrameQueue = require("app/view/base/FrameQueue");

/* -------------------------------
/* prefixed events
/* ------------------------------- */

/** @type {module:utils/prefixedEvent} */
var prefixedEvent = require("utils/prefixedEvent");
// /** @type {module:utils/event/transitionEnd} */
// var transitionEnd = require("utils/event/transitionEnd");

var prefixProtoEvents = (function() {
	var prefixedEvents = (function(){
		var eventNum = 0, eventMap = {
			"transitionend": prefixedEvent("transitionend"),//transitionEnd,
			"fullscreenchange": prefixedEvent("fullscreenchange", document),
			"fullscreenerror": prefixedEvent("fullscreenerror", document),
			"visibilitychange": prefixedEvent("visibilitychange", document, "hidden")
		};
		for (var eventName in eventMap) {
			if (eventName === eventMap[eventName]) {
				delete eventMap[eventName];
			} else {
				eventNum++;
			}
		}
		console.log("View::[init] prefixes enabled for %i events", eventNum, Object.keys(eventMap));
		return eventNum > 0? eventMap : null;
	})();
	
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
		return events;
	};
	
	return function(events) {
		if (prefixedEvents) {
			if (_.isFunction(events)) {
				return _.wrap(events, function(fn) {
					return prefixEventDelegates(fn.apply(this));
				});
			} else if (_.isObject(events)) {
				return prefixEventDelegates(events);
			}
		}
		return events;
	};
})();

/* -------------------------------
/* static public
/* ------------------------------- */

// /** @type {module:utils/object/getPrototypeChainValue} */
// var getPrototypeChainValue = require("utils/object/getPrototypeChainValue");
// /** @type {module:utils/prefixedProperty} */
// var prefixedProperty = require("utils/prefixedProperty");
// /** @type {module:utils/prefixedStyleName} */
// var prefixedStyleName = require("utils/prefixedStyleName");

/** @type {module:utils/setImmediate} */
var setImmediate = require("utils/setImmediate");

var View = {
	
	/** @const */
	NONE_INVALID: 0,
	/** @const */
	CHILDREN_INVALID: 1,
	/** @const */
	PROPS_INVALID: 2,
	/** @const */
	CLASSES_INVALID: 4,
	/** @const */
	SIZE_INVALID: 8,
	/** @const */
	LAYOUT_INVALID: 16,
	
	/** @const */
	RENDER_INVALID: 8 | 16,
	
	/** @type {module:app/view/base/ViewError} */
	ViewError: require("app/view/base/ViewError"),
	
	/** @type {module:utils/prefixedProperty} */
	prefixedProperty: require("utils/prefixedProperty"),
	
	/** @type {module:utils/prefixedStyleName} */
	prefixedStyleName: require("utils/prefixedStyleName"),
	
	/** @type {module:utils/prefixedEvent} */
	prefixedEvent: require("utils/prefixedEvent"),
	
	// /** @type {module:FrameQueue.request} */
	// requestAnimationFrame: FrameQueue.request,
	// 
	// /** @type {module:FrameQueue.cancel} */
	// cancelAnimationFrame: FrameQueue.cancel,
	
	/** @type {module:utils/setImmediate} */
	setImmediate: setImmediate,
	
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
	extend: function(proto, obj) {
		if (proto.events) {
			proto.events = prefixProtoEvents(proto.events);
		}
		if (proto.properties && this.prototype.properties) {
			_.defaults(proto.properties, this.prototype.properties);
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
	
	/** @type {int} */
	_renderFlags: 0,
	
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
		},
		attached: {
			get: function() {
				return this._domPhase === "added";
			}
		},
		invalidated: {
			get: function() {
				return this._renderRafId !== -1;
			}
		}
	},
	
	/**
	* @constructor
	* @type {module:app/view/base/View}
	*/
	constructor: function(options) {
		// this._renderRafId = -1;
		// this.parentView = null;
		this.childViews = {};
		this._applyRender = this._applyRender.bind(this);
		
		if (this.properties) {
			// Object.defineProperties(this, getPrototypeChainValue(this, "properties", Backbone.View));
			Object.defineProperties(this, this.properties);
		}
		if (options && options.className && this.className) {
			options.className += " " + _.result(this, "className");
		}
		
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
				// Element is being replaced
				if (this._domPhase === "added") {
					// Since old element is attached to document tree, _viewAdded will be
					// triggered by replaceChild: set _viewPhase = "replacing" to flag this
					// change and trigger 'view:replaced' instead of 'view:added'.
					this._viewPhase = "replacing";
				}
				this.el.parentElement.replaceChild(element, this.el);
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
	
	requestAnimationFrame: function(callback, noBinding, priority) {
		var retval = FrameQueue.request(noBinding? callback : callback.bind(this), priority);
		// if (!this._skipLog)
		// 	console.log("%s::requestAnimationFrame [id:%i] rescheduled", this.cid, retval);
		return retval;
	},
	
	cancelAnimationFrame: function(id) {
		var retval = FrameQueue.cancel(id);
		// if (!this._skipLog)
		// 	console.log("%s::requestAnimationFrame [id:%i] cancelled", this.cid, id);
		return retval;
	},
	
	/* -------------------------------
	/* simple render deferring
	/* ------------------------------- */
	
	/** @private */
	_applyRender: function (tstamp) {
		if (!this._skipLog) {
			if (this._renderRafId == -1) {
				console.log("%s::_applyRender [synchronous]", this.cid);
			} else {
				console.log("%s::_applyRender [id:%i]", this.cid, this._renderRafId);
			}
		}
		
		this._renderRafId = -1;
		this.renderFrame(tstamp);
	},
	
	_cancelRender: function() {
		if (this._renderRafId != -1) {
			var cancelId, cancelFn;
			
			cancelId = this._renderRafId;
			this._renderRafId = -1;
			cancelFn = FrameQueue.cancel(cancelId);
			
			if (cancelFn === void 0) {
				console.warn("%s::_cancelRender [id:%i] not found", this.cid, cancelId);
			} else if (cancelFn === null) {
				console.warn("%s::_cancelRender [id:%s] already cancelled", this.cid, cancelId);
			} else {
				if (!this._skipLog && !FrameQueue.running)
					console.log("%s::_cancelRender [id:%s] cancelled", this.cid, cancelId);
			}
		}
	},
	
	_requestRender: function() {
		if (this._renderRafId == -1) {
			this._renderRafId = FrameQueue.request(this._applyRender);
			
			if (!this._skipLog && !FrameQueue.running)
				console.log("%s::_requestRender [id:%i] rescheduled", this.cid, this._renderRafId);
		}
	},
	
	requestRender: function() {
		this._requestRender();
	},
	
	/** @abstract */
	renderFrame: function (tstamp) {
		// subclasses should override this method
	},

	renderNow: function(alwaysRun) {
		if (this._renderRafId != -1) {
			// /* jshint -W059 */
			// console.warn("%s::renderNow (raf:%i)", this.cid, this._renderRafId, _queueRafId, arguments.callee);
			// /* jshint +W059 */
			var cancelId = this._cancelRender();
			alwaysRun = true;
		}
		if (alwaysRun === true) {
			this._applyRender(_now());
		}
		return this;
	},
	
	render: function() {
		return this.renderNow(true);
	},
	
	invalidateSize: function() {
		this._renderFlags |= (View.SIZE_INVALID | View.LAYOUT_INVALID);
		this.requestRender();
	},
	
	invalidateLayout: function() {
		this._renderFlags |= View.LAYOUT_INVALID;
		this.requestRender();
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
	/*/
	setEnabled: function(enable) {
		this._enabled = enable;
	},
};

module.exports = Backbone.View.extend(ViewProto, View);
