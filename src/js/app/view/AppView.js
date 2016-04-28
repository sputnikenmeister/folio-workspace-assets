/**
/* @module app/view/AppView
/*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/utils/debug/traceArgs} */
var stripTags = require("utils/strings/stripTags");
/** @type {Function} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {Function} */
var prefixedEvent = require("utils/prefixedEvent");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/base/TouchManager} */
var TouchManager = require("app/view/base/TouchManager");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");
/** @type {module:app/model/AppState} */
var AppState = require("app/model/AppState");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/NavigationView} */
var NavigationView = require("app/view/NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("app/view/ContentView");

var AppView = {
	getInstance: function() {
		if (!(window.app instanceof this)) {
			window.app = new (this)({
				model: new AppState()
			});
		}
		return window.app;
	}
};

var AppViewProto = {
	
	/** @override */
	cidPrefix: "app",
	/** @override */
	el: "body",
	/** @override */
	className: "without-bundle without-media",
	/** @override */
	model: AppState,
	
	/** @override */
	events: {
		"visibilitychange": function(ev) { console.log(ev.type) ;},
		"fullscreenchange": function(ev) { console.log(ev.type) ;},
	},
	
	/** @override */
	initialize: function (options) {
		// document.documentElement.classList.toggle("desktop-small", Globals.BREAKPOINTS["desktop-small"].matches);
		
		/* prevent touch overscroll on iOS */
		document.addEventListener("touchmove", function(ev) { ev.preventDefault(); }, false);
		/* create single hammerjs manager */
		this.touch = TouchManager.init(this.el);//document.body);//document.querySelector("#container")
		
		/* render on resize, onorientationchange, visibilitychange */
		this._onResize = this._onResize.bind(this);// _.bindAll(this, "_onResize");
		window.addEventListener("orientationchange", this._onResize, false);
		window.addEventListener("resize", _.debounce(this._onResize, 100, false/* immediate? */), false);
		
		/* initialize controller/model listeners BEFORE views register their own */
		this.listenTo(controller, "change:after", this._afterControllerChanged);
		this.listenTo(this.model, "change", this._onModelChange); /* FIXME */
		
		/* initialize views */
		this.navigationView = new NavigationView({ el: "#navigation", model: this.model });
		this.contentView = new ContentView({ el: "#content", model: this.model });
		
		/* startup listener */
		this.listenToOnce(controller, "route", this._appStart);
		// start router, which will request appropiate state
		Backbone.history.start({ pushState: false, hashChange: true });
	},
	
	/* -------------------------------
	/* _appStart
	/* ------------------------------- */
	
	_appStart: function() {
		console.log("%s::_appStart", this.cid, arguments[0]);
		this._appStartChanged = true;
		this.requestRender(View.MODEL_INVALID | View.SIZE_INVALID);
	},
	
	/* --------------------------- *
	/* model changed
	/* --------------------------- */
	
	_afterControllerChanged: function(bundle, media) {
		/* update model on controller event */
		console.log("%s::[controller change:after]", this.cid);
		this.model.set({
			bundle: bundle || null,
			withBundle: !!bundle,
			media: media || null,
			withMedia: !!media,
			collapsed: !!bundle // reset collapsed on bundle change
		});
	},
	
	/* --------------------------- *
	/* model changed
	/* --------------------------- */
	
	_onModelChange: function() {
		console.group(this.cid + "::_onModelChange changed:");
		Object.keys(this.model.changedAttributes()).forEach(function(key) {
			console.log("\t%s: %s -> %s", key, this.model.previous(key), this.model.get(key));
		}, this);
		console.groupEnd();
		
		if (this.model.hasChanged("bundle") || this.model.hasChanged("media")) {
			this.requestRender(View.MODEL_INVALID);
		}
	},
	
	/* -------------------------------
	/* resize
	/* ------------------------------- */
	
	_onResize: function() {
		console.log("%s::_onResize", this.cid);
		this.requestRender(View.SIZE_INVALID).renderNow();
	},
	
	/* -------------------------------
	/* render
	/* ------------------------------- */
	
	renderFrame: function(tstamp, flags) {
		if (flags & View.MODEL_INVALID) {
			this.renderModelChange();
		}
		if (flags & View.SIZE_INVALID) {
			this.renderResize();
		}
		if (this._appStartChanged) {
			this._appStartChanged = false;
			this.requestAnimationFrame(this.renderAppStart);
		}
	},
	
	renderAppStart: function() {
		console.log("%s::renderAppStart", this.cid);
		document.documentElement.classList.remove("app-initial");
		// document.documentElement.classList.add("app-ready");
	},
	
	renderResize: function() {
		console.log("%s::renderResize", this.cid);
		document.body.scrollTop = 0;
		document.body.classList.toggle("desktop-small", Globals.BREAKPOINTS["desktop-small"].matches);
		
		this.requestChildrenRender(View.SIZE_INVALID, true);
		
		// var ccid, view;
		// for (ccid in this.childViews) {
		// 	view = this.childViews[ccid];
		// 	view.skipTransitions = true;
		// 	// view.invalidateSize();
		// 	// view.renderNow();
		// 	view.requestRender(View.SIZE_INVALID).renderNow();
		// }
	},
	
	/* -------------------------------
	/* body classes etc
	/* ------------------------------- */
	
	// _controllerChanged: true,
	
	renderModelChange: function() {
		console.log("%s::renderModelChange", this.cid);
		
		var bundle = this.model.get("bundle");
		var media = this.model.get("media");
		
		this.updateDocumentTitle(bundle, media);
		this.updateClassList(bundle, media);
	},
	
	updateDocumentTitle: function(bundle, media) {
		// Set browser title
		var docTitle = "Portfolio";
		if (bundle) {
			docTitle += " - " + stripTags(bundle.get("name"));
			if (media) {
				docTitle += ": " + stripTags(media.get("name"));
			}
		}
		document.title = docTitle;
	},
	
	updateClassList: function(bundle, media) {
		// classList target
		var cls = this.el.classList;
		var prevAttr = null, hasDarkBg = false;
		
		// Set state classes
		cls.toggle("with-bundle", !!bundle);
		cls.toggle("without-bundle", !bundle);
		cls.toggle("with-media", !!media);
		cls.toggle("without-media", !media);
		// if (this.model.hasChanged("withBundle")) {
		// 	cls.toggle("with-bundle", this.model.get("withBundle"));
		// 	cls.toggle("without-bundle", !this.model.get("withBundle"));
		// }
		// if (this.model.hasChanged("withMedia")) {
		// 	cls.toggle("with-media", this.model.get("withMedia"));
		// 	cls.toggle("without-media", !this.model.get("withMedia"));
		// }
		
		// Set bundle class
		if (this.model.hasChanged("bundle")) {
			prevAttr = this.model.previous("bundle");
			if (prevAttr) {
				cls.remove(prevAttr.get("domid"));
			}
			if (bundle) {
				cls.add(bundle.get("domid"));
				// hasDarkBg = hasDarkBg || bundle.colors.hasDarkBg;
			}
		}
		// Set media class
		if (this.model.hasChanged("media")) {
			prevAttr = this.model.previous("media");
			if (prevAttr) {
				cls.remove(prevAttr.get("domid"));
			}
			if (media) {
				cls.add(media.get("domid"));
				// hasDarkBg = hasDarkBg || media.colors.hasDarkBg;
			}
		}
		// Set color-dark class
		// cls.toggle("color-dark", hasDarkBg);
		cls.toggle("color-dark", 
			(media && media.colors.hasDarkBg) ||
			(bundle && bundle.colors.hasDarkBg));
	},
};

if (DEBUG) {
	/** @type {module:app/view/DebugToolbar} */
	var DebugToolbar = require("app/view/DebugToolbar");
	
	AppViewProto.initialize = (function(fn) {
		return function() {
			var view = new DebugToolbar({
				id: "debug-toolbar",
				model: this.model
			});
			this.el.appendChild(view.render().el);
			
			this.listenTo(this.model, "change:layoutName", function() {
				this.requestRender(View.SIZE_INVALID);//.renderNow();
			});
			return fn.apply(this, arguments);
		};
	})(AppViewProto.initialize);
	
	// AppViewProto.renderFrame = (function(fn) {
	// 	return function() {
	// 		// var retVal = fn.apply(this, arguments); return retVal;
	// 		console.log(this.model);
	// 		var layoutName;
	// 		if (View.SIZE_INVALID && this.model.hasChanged("layoutName")) {
	// 			
	// 				var prev = this.model.previous("layoutName");
	// 				var curr = this.model.get("layoutName");
	// 				if (prev) document.body.classList.remove(prev);
	// 				if (curr) document.body.classList.add(curr);
	// 				
	// 			// if (layoutName = this.model.previous("layoutName")) {
	// 			// 	document.body.classList.remove(layoutName);
	// 			// }
	// 			// if (layoutName = this.model.get("layoutName")) {
	// 			// 	document.body.classList.add(layoutName);
	// 			// }
	// 		}
	// 		return fn.apply(this, arguments);
	// 	};
	// })(AppViewProto.renderFrame);
	
	// AppViewProto.initialize = _.wrap(AppViewProto.initialize, function(fn) {
	// 	this.el.appendChild((new DebugToolbar({id: "debug-toolbar", collection: bundles})).render().el);
	// 	// wrapped fn is first argument, so call shift result directly with (already shifted) arguments
	// 	Array.prototype.shift.apply(arguments).apply(this, arguments);
	// });
}

/**
/* @constructor
/* @type {module:app/view/AppView}
/*/
module.exports = View.extend(AppViewProto, AppView);
