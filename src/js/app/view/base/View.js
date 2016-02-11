/* global HTMLElement, MutationObserver */
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

function addChildViews(el) {
	var view, els = el.querySelectorAll("*[data-cid]");
	for (var i = 0, ii = els.length; i < ii; i++) {
		view = View.findByElement(els.item(i));
		if (view) {
			if (!view.attached) {
				// console.log("View::[attached (parent)] %s", view.cid);
				view._elementAttached();
			// } else {
			// 	console.warn("View::[attached (parent)] %s (ignored)", view.cid);
			}
		}
	}
}
function removeChildViews(el) {
	var view, els = el.querySelectorAll("*[data-cid]");
	for (var i = 0, ii = els.length; i < ii; i++) {
		view = View.findByElement(els.item(i));
		if (view) {
			if (view.attached) {
				console.log("View::[detached (parent)] %s", view.cid);
				view._elementDetached();
			} else {
				console.warn("View::[detached (parent)] %s (ignored)", view.cid);
			}
		}
	}
}

var observer = new MutationObserver(function(mm) {
	// console.log("View::mutations %s", JSON.stringify(mm, null, " "));
	var i, ii, m;
	var j, jj, e;
	var view;
	for (i = 0, ii = mm.length; i < ii; i++) {
		m = mm[i];
		if (m.type == "childList") {
			for (j = 0, jj = m.addedNodes.length; j < jj; j++) {
				e = m.addedNodes.item(j);
				view = View.findByElement(e);
				if (view) {
					if (!view.attached) {
						// console.log("View::[attached (childList)] %s", view.cid);
						view._elementAttached();
					// } else {
					// 	console.warn("View::[attached (childList)] %s (ignored)", view.cid);
					}
				}
				if (e instanceof HTMLElement) addChildViews(e);
			}
			for (j = 0, jj = m.removedNodes.length; j < jj; j++) {
				e = m.removedNodes.item(j);
				// console.log("View::[detached (childList)] %s", e.cid);
				view = View.findByElement(e);
				if (view) {
					if (view.attached) {
						console.log("View::[detached (childList)] %s", view.cid, view.attached);
						view._elementDetached();
					} else {
						console.warn("View::[detached (childList)] %s (ignored)", view.cid, view.attached);
					}
				}
				if (e instanceof HTMLElement) removeChildViews(e);
			}
		} else if (m.type == "attributes") {
			view = View.findByElement(m.target);
			if (view) {
				if (!view.attached) {
					// console.log("View::[attached (attribute)] %s", view.cid);
					view._elementAttached();
				// } else {
				// 	console.warn("View::[attached (attribute)] %s (ignored)", view.cid);
				}
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
/* static private
/* ------------------------------- */

/** @type {module:app/view/base/FrameQueue} */
var FrameQueue = require("app/view/base/FrameQueue");

/** @type {module:app/view/base/PrefixedEvents} */
var PrefixedEvents = require("app/view/base/PrefixedEvents");

var _now = window.performance? 
	window.performance.now.bind(window.performance):
	Date.now.bind(Date);
// var _now = window.performance? 
// 	function() { return window.performance.now(); }: 
// 	function() { return Date.now(); };

var applyEventPrefixes = function(events) {
	var selector, prefixed, unprefixed;
	for (selector in events) {
		unprefixed = selector.match(/^\w+/i)[0];
		if (PrefixedEvents.hasOwnProperty(unprefixed)) {
			events[selector.replace(unprefixed, PrefixedEvents[unprefixed])] = events[selector];
			// console.log("applyEventPrefixes", unprefixed, prefixedEvents[unprefixed]);
			delete events[selector];
		}
	}
	return events;
};

// var getViewDepth = function(view) {
// 	if (!view) {
// 		return null;
// 	}
// 	if (view.attached) {
// 		if (view.parentView === null) {
// 			return 0;
// 		} else {
// 			return view.parentView.viewDepth + 1;
// 		}
// 	} else {
// 		return NaN;
// 	}
// };

var getViewDepth = function(view) {	
	if (!view) {
		return null;
	}
	if (!view.attached) {
		return NaN;
	}
	if (view.parentView === null) {
		return 0;
	}
	return view.parentView.viewDepth + 1;
};

function logAttachInfo(view, name, level) {
	if (["log", "info", "warn", "error"].indexOf(level) != -1) {
		level = "log";
	}
	console[level].call(console, "%s::%s [parent:%s %s %s depth:%s]", view.cid, name, view.parentView && view.parentView.cid, view.attached? "attached" : "detached", view._viewPhase, view.viewDepth);
}

/* -------------------------------
/* static public
/* ------------------------------- */


var View = {
	
	/** @const */
	NONE_INVALID: 0,
	/** @const */
	CHILDREN_INVALID: 1,
	/** @const */
	PROPS_INVALID: 2,
	
	/** @const */
	RENDER_INVALID: 8 | 16,
	/** @const */
	CLASSES_INVALID: 4,
	/** @const */
	SIZE_INVALID: 8,
	/** @const */
	LAYOUT_INVALID: 16,
	
	/** @type {module:app/view/base/ViewError} */
	ViewError: require("app/view/base/ViewError"),
	
	/** @type {module:utils/prefixedProperty} */
	prefixedProperty: require("utils/prefixedProperty"),
	
	/** @type {module:utils/prefixedStyleName} */
	prefixedStyleName: require("utils/prefixedStyleName"),
	
	/** @type {module:utils/prefixedEvent} */
	prefixedEvent: require("utils/prefixedEvent"),
	
	/** @type {module:utils/setImmediate} */
	setImmediate: require("utils/setImmediate"),
	
	/** @type {module:app/view/promise/whenViewIsAttached} */
	whenViewIsAttached: require("app/view/promise/whenViewIsAttached"),
	
	/**
	/* @param el {HTMLElement}
	/* @return {module:app/view/base/View}
	/*/
	findByElement: function(el) {
		if (_viewsByCid[el.cid]) {
			return _viewsByCid[el.cid];
		}
		return null;
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
		if (PrefixedEvents.length && proto.events) {
			if (_.isFunction(proto.events)) {
				proto.events = _.wrap(proto.events, function(fn) {
					return applyEventPrefixes(fn.apply(this));
				});
			} else
			if (_.isObject(proto.events)) {
				proto.events = applyEventPrefixes(proto.events);
			}
		}
		if (proto.properties && this.prototype.properties) {
			_.defaults(proto.properties, this.prototype.properties);
		}
		return Backbone.View.extend.apply(this, arguments);
	},
	
	// get viewsByCid() {
	// 	return _viewsByCid;
	// },
};

Object.defineProperty(View, "instances", {
	value: _viewsByCid,
	enumerable: true
});

/* -------------------------------
/* prototype
/* ------------------------------- */

var ViewProto = {
	
	/** @type {string} */
	cidPrefix: "view",
	/** @type {Boolean} */
	_attached: false,
	/** @type {HTMLElement|null} */
	_parentView: null,
	/** @type {int|null} */
	_viewDepth: null,
	/** @type {string} initializing > initialized > disposing > disposed */
	_viewPhase: "initializing",
	/** @type {int} */
	_frameQueueId: -1,
	/** @type {int} */
	_renderFlags: 0,
	
	/** @type {object} */
	properties: {
		cid: {
			get: function() {
				return this._cid || (this._cid = this.cidPrefix + _cidSeed++);
			}
		},
		attached: {
			get: function() {
				return this._attached;
			}
		},
		parentView: {
			get: function() {
				return this._parentView;
			}
		},
		viewDepth: {
			get: function() {
				return this._getViewDepth();
			}
		},
		invalidated: {
			get: function() {
				return this._frameQueueId !== -1;
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
	},
	
	/**
	* @constructor
	* @type {module:app/view/base/View}
	*/
	constructor: function(options) {
		// this._frameQueueId = -1;
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
		if (options && options.parentView) {
			this._setParentView(options.parentView, true);
		}
		Backbone.View.apply(this, arguments);
		
		// console.log("%s::initialize viewPhase:[%s => initialized]", this.cid, this._viewPhase);
		this._viewPhase = "initialized";
		
		if (this.parentView !== null) {
			this.trigger("view:parentChange", this.parentView, null);
		}
		if (this.attached) {
			this.trigger("view:attached", this);
		}
	},
	
	/* -------------------------------
	/* remove
	/* ------------------------------- */
	
	/** @override */
	remove: function() {
		if (this._viewPhase == "disposing") {
			logAttachInfo(this, "remove", "warn");
		} else {
			// logAttachInfo(this, "remove", "log");
		}
		
		// before removal
		this._viewPhase = "disposing";
		this._cancelRender();
		
		// call Backbone impl
		// Backbone.View.prototype.remove.apply(this, arguments);
		
		// NOTE: from Backbone impl
		this.$el.remove(); // from Backbone impl
		
		this._attached = false;
		this.trigger("view:removed", this);
		
		// remove parent/child references
		this._setParentView(null);
		
		// NOTE: from Backbone impl. No more events after this
		this.stopListening();
		
		// check for invalidations that may have been triggered by "view:removed"
		if (this.invalidated) {
			console.warn("%s::remove invalidated after remove()", this.cid);
			this._cancelRender();
		}
		// // check for children still here
		// var ccids = Object.keys(this.childViews);
		// if (ccids.length) {
		// 	console.warn("%s::remove %i children not removed [%s]", this.cid, ccids.length, ccids.join(", "), this.childViews);
		// }
		// // remove childViews
		// for (var cid in this.childViews) {
		// 	this.childViews[cid].remove();
		// }
		// clear reference in view map
		delete _viewsByCid[this.cid];
		// delete this.el.cid;
		// update phase
		this._viewPhase = "disposed";
		return this;
	},
	
	/* -------------------------------
	/* _elementAttached _elementDetached
	/* ------------------------------- */
	
	_elementAttached: function() {
		// this._addToParentView();
		this._attached = true;
		this._viewDepth = null;
		this._setParentView(View.findByDescendant(this.el.parentElement));
		
		// if (this.parentView) {
		// 	console.log("[attach] [%i] %s > %s::_elementAttached", this.viewDepth, this.parentView.cid, this.cid);
		// } else {
		// 	console.log("[attach] [%i] %s::_elementAttached", this.viewDepth, this.cid);
		// }
		
		// if (this._viewPhase == "initializing") {
		// 	// this.trigger("view:attached", this);
		// } else
		if (this._viewPhase == "initialized") {
			this.trigger("view:attached", this);
		} else
		if (this._viewPhase == "replacing") {
			this._viewPhase = "initialized";
			this.trigger("view:replaced", this);
		}
	},
	
	_elementDetached: function() {
		if (!this.attached || (this._viewPhase == "disposing") || (this._viewPhase == "disposed")) {
			logAttachInfo(this, "_elementDetached", "error");
		} else {
			// logAttachInfo(this, "_elementDetached", "log");
		}
		this._attached = false;
		this._viewDepth = null;
		
		if (this._viewPhase != "disposing" || this._viewPhase == "disposed") {
			this.remove();
		}
	},
	
	// _addToParentView: function() {
	// 	this._attached = true;
	// 	this._setParentView(View.findByDescendant(this.el.parentElement));
	// 	// this._viewDepth = this._getViewDepth();
	// 	
	// 	// var parentView = View.findByDescendant(this.el.parentElement);
	// 	// this._attached = true;
	// 	// if (parentView) {
	// 	// 	this._parentView = parentView;
	// 	// 	this._parentView.childViews[this.cid] = this;
	// 	// 	this.viewDepth = this._parentView.viewDepth + 1;
	// 	// } else {
	// 	// 	this.viewDepth = 0;
	// 	// }
	// },
	
	// _removeFromParentView: function() {
	// 	// if (this._parentView && (this.cid in this._parentView.childViews)) {
	// 	// 	delete this._parentView.childViews[this.cid];
	// 	// 	this._parentView = null;
	// 	// 	this.viewDepth = NaN;
	// 	// }
	// 	this._attached = false;
	// 	this._setParentView(null);
	// 	// this._viewDepth = this._getViewDepth();
	// },
	
	/* -------------------------------
	/* parentView
	/* ------------------------------- */
	
	_setParentView: function(newParent, silent) {
		if (newParent === void 0) {
			console.warn("$s::_setParentView invalid value '%s'", this.cid, newParent);
			newParent = null;
		}
		var oldParent = this._parentView;
		this._parentView = newParent;
		
		// force update of _viewDepth
		this._viewDepth = null;//getViewDepth(this);
		
		// skip the rest if arg is the same
		if (newParent === oldParent) {
			return;
		}
		if (oldParent !== null) {
			if (this.cid in oldParent.childViews) {
				delete oldParent.childViews[this.cid];
			}
		}
		if (newParent !== null) {
			newParent.childViews[this.cid] = this;
		}
		if (!silent)
			this.trigger("view:parentChange", newParent, oldParent);
	},
	
	whenAttached: function() {
		return View.whenViewIsAttached(this);
	},
	
	_getViewDepth: function() {
		if (this._viewDepth === null) {
			this._viewDepth = getViewDepth(this);
		}
		return this._viewDepth;
		// return getViewDepth(this);
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
				if (this.attached) {
					// Since old element is attached to document tree, _elementAttached will be
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
	
	requestAnimationFrame: function(callback, priority) {
		// var retval = FrameQueue.request(callback.bind(this), priority);
		// if (!this._skipLog)
		// 	console.log("%s::requestAnimationFrame ID:%i requested", this.cid, retval);
		// return retval;
		return FrameQueue.request(callback.bind(this), priority);
	},
	
	cancelAnimationFrame: function(id) {
		// var retval = FrameQueue.cancel(id);
		// if (!this._skipLog)
		// 	console.log("%s::requestAnimationFrame ID:%i cancelled", this.cid, id);
		// return retval;
		return FrameQueue.cancel(id);
	},
	
	/* -------------------------------
	/* simple render deferring
	/* ------------------------------- */
	
	/** @private */
	_applyRender: function (tstamp) {
		if (!this._skipLog) {
			if (this._frameQueueId == -1) {
				console.log("%s::_applyRender [synchronous]", this.cid);
			} else {
				console.log("%s::_applyRender ID:%i", this.cid, this._frameQueueId);
			}
		}
		
		this._frameQueueId = -1;
		this.renderFrame(tstamp);
	},
	
	_cancelRender: function() {
		if (this._frameQueueId != -1) {
			var cancelId, cancelFn;
			
			cancelId = this._frameQueueId;
			this._frameQueueId = -1;
			cancelFn = FrameQueue.cancel(cancelId);
			
			if (cancelFn === void 0) {
				console.warn("%s::_cancelRender ID:%i not found", this.cid, cancelId);
			} else if (cancelFn === null) {
				console.warn("%s::_cancelRender ID:%i already cancelled", this.cid, cancelId);
			// } else {
			// 	if (!this._skipLog && !FrameQueue.running)
			// 		console.log("%s::_cancelRender ID:%i cancelled", this.cid, cancelId);
			}
		}
	},
	
	_requestRender: function() {
		if (this._frameQueueId == -1) {
			this._frameQueueId = FrameQueue.request(this._applyRender, isNaN(this.viewDepth)? Number.MAX_VALUE : this.viewDepth);
			// if (!this._skipLog && !FrameQueue.running)
			// 	console.log("%s::_requestRender ID:%i rescheduled", this.cid, this._frameQueueId);
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
		if (this._frameQueueId != -1) {
			// /* jshint -W059 */
			// console.warn("%s::renderNow (raf:%i)", this.cid, this._frameQueueId, _queueRafId, arguments.callee);
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


// Object.defineProperty(module.exports, "instances", {
// 	value: _viewsByCid
// });
