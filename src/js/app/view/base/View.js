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

var _now = window.performance ?
	window.performance.now.bind(window.performance) :
	Date.now.bind(Date);
// var _now = window.performance?
// 	function() { return window.performance.now(); }:
// 	function() { return Date.now(); };

// /** @type {module:app/view/base/renderQueue} */
// var renderQueue = require("app/view/base/renderQueue");
//
/** @type {module:app/view/base/CallbackQueue} */
var renderQueue = (function(CallbackQueue) {
	return new CallbackQueue(
		function(callback) {
			return window.requestAnimationFrame(callback);
		},
		function(id) {
			return window.cancelAnimationFrame(id);
		}
	);
})(require("app/view/base/CallbackQueue"));

/** @type {module:app/view/base/CallbackQueue} */
var modelQueue = (function(CallbackQueue) {
	return new CallbackQueue(
		function(callback) {
			return window.setImmediate(function() {
				callback.call(null, _now());
			});
		},
		function(id) {
			return window.clearImmediate(id);
		}
	);
})(require("app/view/base/CallbackQueue"));

/** @type {module:app/view/base/PrefixedEvents} */
var PrefixedEvents = require("app/view/base/PrefixedEvents");

var applyEventPrefixes = function(events) {
	var selector, unprefixed;
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
	console[level].call(console, "%s::%s [parent:%s %s %s depth:%s]", view.cid, name, view.parentView && view.parentView.cid, view.attached ? "attached" : "detached", view._viewPhase, view.viewDepth);
}

/* -------------------------------
/* static public
/* ------------------------------- */


var View = {

	/** @const */
	NONE_INVALID: 0,
	/** @const */
	ALL_INVALID: ~0 >>> 1,

	/** @const */
	CHILDREN_INVALID: 1,
	/** @const */
	MODEL_INVALID: 2,
	/** @const */
	STYLES_INVALID: 4,
	/** @const */
	SIZE_INVALID: 8,
	/** @const */
	LAYOUT_INVALID: 16,

	/** @const */
	CLICK_EVENT: "click", //window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",

	/** @type {module:app/view/base/ViewError} */
	ViewError: require("app/view/base/ViewError"),

	/** @type {module:utils/prefixedProperty} */
	prefixedProperty: require("utils/prefixedProperty"),

	/** @type {module:utils/prefixedStyleName} */
	prefixedStyleName: require("utils/prefixedStyleName"),

	/** @type {module:utils/prefixedEvent} */
	prefixedEvent: require("utils/prefixedEvent"),

	/** @type {module:app/view/promise/whenViewIsAttached} */
	whenViewIsAttached: require("app/view/promise/whenViewIsAttached"),

	/** @type {module:app/view/promise/whenViewIsRendered} */
	whenViewIsRendered: require("app/view/promise/whenViewIsRendered"),

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
		} while ((el = el.parentElement || el.parentNode));
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

	_flagsToStrings: ["-"],

	flagsToString: function(flags) {
		var s = View._flagsToStrings[flags | 0];
		if (!s) {
			s = [];
			if (flags & View.CHILDREN_INVALID) s.push("children");
			if (flags & View.MODEL_INVALID) s.push("model");
			if (flags & View.STYLES_INVALID) s.push("styles");
			if (flags & View.SIZE_INVALID) s.push("size");
			if (flags & View.LAYOUT_INVALID) s.push("layout");
			View._flagsToStrings[flags] = s = s.join(" ");
		}
		return s;
		// return (flags | 0).toString(2);
	},
};

Object.defineProperty(View, "instances", {
	value: _viewsByCid,
	enumerable: true
});

/* -------------------------------
/* prototype
/* ------------------------------- */

// module.exports = Backbone.View.extend({
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
	_renderQueueId: -1,
	/** @type {int} */
	_renderFlags: 0,
	/** @type {Boolean} */
	_enabled: null,

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
				return this._renderQueueId !== -1;
			}
		},
		enabled: {
			get: function() {
				return this._enabled;
			},
			set: function(enabled) {
				this.setEnabled(enabled);
			}
		},
		renderFlags: {
			get: function() {
				return this._renderFlags;
			}
		}
	},

	/**
	 * @constructor
	 * @type {module:app/view/base/View}
	 */
	constructor: function(options) {
		this.transform = {};
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
		this.setEnabled(true);
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
			// } else {
			// 	logAttachInfo(this, "_elementDetached", "log");
		}
		this._attached = false;
		this._viewDepth = null;
		this.setEnabled(false);

		if (this._viewPhase != "disposing" || this._viewPhase == "disposed") {
			this.remove();
		}
	},

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
		this._viewDepth = null; //getViewDepth(this);

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
			this.trigger("view:parentChange", this, newParent, oldParent);
	},

	whenAttached: function() {
		return View.whenViewIsAttached(this);
	},

	_getViewDepth: function() {
		if (this._viewDepth === null) {
			this._viewDepth = getViewDepth(this);
		}
		return this._viewDepth;
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
				_.result(this, "className").split(" ").forEach(function(item) {
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

	requestAnimationFrame: function(callback, priority, ctx) {
		return renderQueue.request(callback.bind(ctx || this), priority);
	},

	cancelAnimationFrame: function(id) {
		return renderQueue.cancel(id);
	},

	setImmediate: function(callback, priority, ctx) {
		return modelQueue.request(callback.bind(ctx || this), priority);
	},

	clearImmediate: function(id) {
		return modelQueue.cancel(id);
		// return window.clearImmediate(id);
	},

	/* -------------------------------
	/* deferred render: private methods
	/* ------------------------------- */

	_traceRenderStatus: function() {
		return [
			(this._renderQueueId != -1 ? "async id:" + this._renderQueueId : "sync"),
			View.flagsToString(this._renderFlags),
			(this.attached ? "attached" : "detached"),
			(this.skipTransitions ? "skip" : "run") + "-tx"
		].join(", ");
	},

	/** @private */
	_applyRender: function(tstamp) {
		if (DEBUG) {
			if (this._logFlags["view.render"]) {
				console.log("%s::_applyRender   [%s]",
					this.cid, this._traceRenderStatus(),
					this._logFlags["view.trace"] ?
					this._logRenderCallers.join("\n") : "");
			}
			this._logRenderCallers.length = 0;
		}

		var flags = this._renderFlags;
		this.trigger("view:render:before", this, flags);
		this._renderFlags = 0;
		this._renderQueueId = -1;
		this._renderFlags |= this.renderFrame(tstamp, flags);
		this.trigger("view:render:after", this, flags);

		if (this._renderFlags != 0) {
			console.warn("%s::_applyRender [returned] flags: %s", this.cid, View.flagsToString(this._renderFlags), this._renderFlags);
		}
	},

	_cancelRender: function() {
		if (this._renderQueueId != -1) {
			var cancelId, cancelFn;

			cancelId = this._renderQueueId;
			this._renderQueueId = -1;
			cancelFn = renderQueue.cancel(cancelId);

			if (cancelFn === void 0) {
				console.warn("%s::_cancelRender [id:%i] not found", this.cid, cancelId);
			} else if (cancelFn === null) {
				console.warn("%s::_cancelRender [id:%i] already cancelled", this.cid, cancelId);
				// } else {
				// 	if (this._logFlags["view.render"] && !renderQueue.running)
				// 		console.log("%s::_cancelRender ID:%i cancelled", this.cid, cancelId);
			}
		}
	},

	_requestRender: function() {
		if (renderQueue.running) {
			this._cancelRender();
			// if (DEBUG) {
			// 	if (this._logFlags["view.render"]) {
			// 		console.info("%s::_requestRender rescheduled [%s (%s)]", this.cid, View.flagsToString(this._renderFlags), this._renderFlags);
			// 	}
			// }
		}
		if (this._renderQueueId == -1) {
			this._renderQueueId = renderQueue.request(this._applyRender, isNaN(this.viewDepth) ? Number.MAX_VALUE : this.viewDepth);
		}
		if (DEBUG) {
			if (this._logFlags["view.render"]) {
				// if (this._logFlags["view.trace"]) {
				// 	console.groupCollapsed(this.cid + "::_requestRender [" + this._traceRenderStatus() + "] trace");
				// 	console.trace();
				// 	console.groupEnd();
				// } else {
				console.log("%s::_requestRender %s [%s]", this.cid,
					(renderQueue.running ? "rescheduled " : ""),
					this._traceRenderStatus()
				);
				// }
			}
		}
	},

	/* -------------------------------
	/* render: public / abstract methods
	/* ------------------------------- */

	invalidate: function(flags) {
		if (flags !== void 0) {
			/*if (DEBUG) {
				if (this._logFlags["view.render"]) {
					if (this._renderFlags > 0) {
						console.log("%s::invalidate [%s (%s)] + [%s (%s)]", this.cid, View.flagsToString(this._renderFlags), this._renderFlags, View.flagsToString(flags), flags);
					} else {
						console.log("%s::invalidate [%s (%s)]", this.cid, View.flagsToString(flags), flags);
					}
				}
			}*/
			this._renderFlags |= flags;
		}
		return this;
	},

	requestRender: function(flags) {
		// if (DEBUG) {
		// 	if (this._logFlags["view.trace"]) {
		// 		var fnPath = [];
		// 		var fn = arguments.callee.caller;
		// 		while (fn) {
		// 			if (fnPath.length > 5) break;
		// 			fnPath.push(fn.name);
		// 			fn = fn.caller;
		// 		}
		// 		// this._logRenderCallers.push(fnPath.join("\n\t->"));
		// 		this._logRenderCallers.push(fnPath.join(" -> "));
		// 	}
		// }
		// if (flags !== void 0) {
		// 	this._renderFlags |= flags;
		// }
		this.invalidate(flags);
		this._requestRender();
		return this;
	},

	/** @abstract */
	renderFrame: function(tstamp, flags) {
		// subclasses should override this method
		return View.NONE_INVALID;
	},

	renderNow: function(alwaysRun) {
		if (this._renderQueueId != -1) {
			this._cancelRender();
			alwaysRun = true;
		}
		// if (alwaysRun === true) {
		if (alwaysRun) {
			this._applyRender(_now());
		}
		return this;
	},

	whenRendered: function() {
		return View.whenViewIsRendered(this);
	},

	/* -------------------------------
	/* render bitwise flags
	/* - check: this._renderFlags & flags
	/* - add: this._renderFlags |= flags
	/* - remove: this._renderFlags &= ~flags
	/* ------------------------------- */

	/* helpers ------------------ */

	requestChildrenRender: function(flags, now, force) {
		var ccid, view;
		for (ccid in this.childViews) {
			view = this.childViews[ccid];
			view.skipTransitions = view.skipTransitions || this.skipTransitions;
			view.requestRender(flags);
			if (now) {
				view.renderNow(force);
			}
		}
		return this;
	},

	render: function() {
		return this.renderNow(true);
	},

	/* -------------------------------
	/* common abstract
	/* ------------------------------- */

	/**
	/* @param {Boolean}
	/*/
	setEnabled: function(enable) {
		if (this._enabled == enable) return;
		this._enabled = !!(enable);
		if (this._enabled) {
			this.delegateEvents();
		} else {
			this.undelegateEvents();
		}
	},
};
//, View);

if (DEBUG) {
	ViewProto._logFlags = [
		"view.render",
		// "view.trace"
	].join(" ");

	ViewProto.constructor = (function(fn) {
		return function() {
			var retval;
			this._logRenderCallers = [];
			this._logFlags = this._logFlags.split(" ").reduce(function(r, o) {
				r[o] = true;
				return r;
			}, {});
			retval = fn.apply(this, arguments);
			// console.log("------ %s %o", this.cid, this._logFlags);
			return retval;
		};
	})(ViewProto.constructor);
}

module.exports = Backbone.View.extend(ViewProto, View);