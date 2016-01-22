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

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/NavigationView} */
var NavigationView = require("app/view/NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("app/view/ContentView");

// var visibilityHiddenProp = prefixedProperty("hidden", document);
// var visibilityChangeEvent = prefixedEvent("visibilitychange", document, "hidden");
// var visibilityStateProp = prefixedProperty("visibilityState", document);

var AppView = {
	getInstance: function() {
		return (window.app instanceof this)? window.app : (window.app = new (this)());
	}
};

var AppViewProto = {
	
	/** @override */
	cidPrefix: "app",
	
	/** @override */
	el: "body",
	
	// /** @override */
	// className: "without-bundle without-media",
	
	model: new Backbone.Model({bundle: null, media: null}),
	
	events: {
		"visibilitychange": function(ev) { console.log(ev.type) ;},
		"fullscreenchange": function(ev) { console.log(ev.type) ;},
	},
	
	/** @override */
	initialize: function (options) {
		document.documentElement.classList.toggle("desktop-small", Globals.BREAKPOINTS["desktop-small"].matches);
		
		/* create single hammerjs manager */
		this.touch = TouchManager.init(document.querySelector("#container"));
		
		// // render on resize, onorientationchange, visibilitychange
		this._onResize = this._onResize.bind(this);// _.bindAll(this, "_onResize");
		window.addEventListener("orientationchange", this._onResize, false);
		window.addEventListener("resize", _.debounce(this._onResize, 100, false/* immediate? */), false);
		
		/* initialize controller listeners */
		// this.listenToOnce(controller, "change:after", this._afterFirstChange);
		this.listenTo(controller, "change:before", this._beforeChange);
		
		/* initialize views */
		this.navigationView = new NavigationView({ el: "#navigation", model: this.model });
		this.contentView = new ContentView({ el: "#content", model: this.model });
		
		// this.listenTo(this.navigationView, "collapsed:change", this._onNavigationCollapsed);
		// this.listenTo(this.contentView, "collapsed:change", this._onContentCollapsed);
		
		this.listenToOnce(controller, "change:after", this._appReady);
		
		this.listenTo(controller, "change:after", function(bundle, media) {
			this.model.set("bundle", bundle);
			this.model.set("media", media);
		});
		
		// start router, which will request appropiate state
		Backbone.history.start({ pushState: false, hashChange: true });
	},
	
	// _onNavigationCollapsed: function(value) {
	// 	console.log("%s::_onNavigationCollapsed content old -> new", this.cid, this.contentView.collapsed, value);
	// 	this.contentView.collapsed = value;
	// },
	// 
	// _onContentCollapsed: function(value) {
	// 	console.log("%s::_onContentCollapsed nav old -> new", this.cid, this.navigationView.collapsed, value);
	// 	this.navigationView.collapsed = value;
	// },
	
	_beforeChange: function(bundle, media) {
		console.log("%s::_beforeChange", this.cid);
		this._controllerChanged = true;
		this.requestRender();
	},
	
	/* -------------------------------
	/* opt A
	/* ------------------------------- */
	
	renderFrame: function(tstamp) {
		if (this._controllerChanged) {
			this._controllerChanged = false;
			this.renderControllerChange();
		}
		if (this._sizeChanged) {
			this._sizeChanged = false;
			this.renderResize();
		}
		if (this._appReadyChanged) {
			this._appReadyChanged = false;
			this.renderAppReady();
			// this._sizeChanged = true;
		}
	},
	
	/* -------------------------------
	/* resize
	/* ------------------------------- */
	
	// _onResize_immediate: function() {
	// 	console.log("%s::_onResize_immediate", this.cid);
	// 	document.body.scrollTop = 0;
	// },
	
	_onResize: function() {
		console.log("%s::_onResize", this.cid);
		// this.renderResize();
		this._sizeChanged = true;
		// this.requestRender();
		this.renderNow(true);
	},
	
	renderResize: function() {
		console.log("%s::renderResize", this.cid);
		document.body.scrollTop = 0;
		document.documentElement.classList.toggle("desktop-small",
			Globals.BREAKPOINTS["desktop-small"].matches);
		
		var ccid, view;
		for (ccid in this.childViews) {
			view = this.childViews[ccid];
			view.skipTransitions = true;
			view.invalidateSize();
			view.renderNow();
		}
		
		// this.navigationView.render();
		// this.contentView.render();
		
		// var viewCids = [];
		// var renderView = function(view) {
		// 	view.skipTransitions = true;
		// 	view.renderNow();
		// 	view.render();
		// 	for (var childId in view.childViews) {
		// 		renderView(view.childViews[childId]);
		// 	}
		// 	// view.skipTransitions = false;
		// 	// viewCids.push(view.cid);
		// };
		// renderView(this.navigationView);
		// renderView(this.contentView);
		// console.log("%s::_onResize", this.cid, viewCids);
	},
	
	
	/* -------------------------------
	/* _appReady
	/* ------------------------------- */
	
	_appReady: function() {
		// NOTE: Change to .app-ready:
		// Wait one frame for views to be rendered. Some may trigger transitions,
		// but they are skipped while in .app-initial. Wait one more frame for 
		// everything to render in it's final state, then finally change to .app-ready.
		// this.requestAnimationFrame(function() {
			console.log("%s::renderAppReady[-2]", this.cid);
			this.requestAnimationFrame(function() {
				console.log("%s::renderAppReady[-1]", this.cid);
				// this.renderAppReady();
				this._sizeChanged = true;
				this._appReadyChanged = true;
				this.requestRender();
				// this.renderNow();
			});
		// });
	},
	
	renderAppReady: function() {
		console.log("%s::renderAppReady", this.cid);
		document.documentElement.classList.remove("app-initial");
		// document.documentElement.classList.add("app-ready");
	},
	
	/* -------------------------------
	/* body classes etc
	/* ------------------------------- */
	
	renderControllerChange: function() {
		console.log("%s::renderControllerChange", this.cid);
		
		var bundle = bundles.selected;
		var media = bundle? bundles.selected.get("media").selected : null;
		
		this.renderModelClasses(bundle, media);
		this.renderDocTitle(bundle, media);
	},
	
	renderDocTitle: function(bundle, media) {
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
	
	renderModelClasses: function(bundle, media) {
		// classList target
		var cls = this.el.classList;
		
		// Set state classes
		cls.toggle("with-bundle", !!bundle);
		cls.toggle("without-bundle", !bundle);
		cls.toggle("with-media", !!media);
		cls.toggle("without-media", !media);
		
		// Set bundle class
		var bDomId = bundle? bundle.get("domid") : null;
		if (bDomId != this._bundleDomId) {
			if (this._bundleDomId) cls.remove(this._bundleDomId);
			if (bDomId) cls.add(bDomId);
			this._bundleDomId = bDomId;
		}
		// Set media class
		var mDomId = media? media.get("domid") : null;
		if (mDomId != this._mediaDomId) {
			if (this._mediaDomId) cls.remove(this._mediaDomId);
			if (mDomId) cls.add(mDomId);
			this._mediaDomId = mDomId;
		}
		// Set color-dark class
		cls.toggle("color-dark", 
			(media && media.colors.hasDarkBg) ||
			(bundle && bundle.colors.hasDarkBg));
	},
	

	
	// renderModelClasses: function(bundle, media) {
	// 	// Set state classes
	// 	var cls = this.el.classList;
	// 	// Set bundle class
	// 	if (this._lastBundle !== bundle) {
	// 		if (this._lastBundle) cls.remove(this._lastBundle.get("domid"));
	// 		if (bundle) cls.add(bundle.get("domid"));
	// 		this._lastBundle = bundle;
	// 	}
	// 	// Set media class
	// 	if (this._lastMedia !== media) {
	// 		if (this._lastMedia) cls.remove(this._lastMedia.get("domid"));
	// 		if (media) cls.add(media.get("domid"));
	// 		this._lastMedia = media;
	// 	}
	// 	cls.toggle("color-dark", (media && media.colors.hasDarkBg) || (bundle && bundle.colors.hasDarkBg));
	// },
	
	/* -------------------------------
	/* opt A
	/* ------------------------------- */
	
	// render: function() {
	// 	// console.log("%s::render [%s]", this.cid, (arguments[0] instanceof window.Event? arguments[0].type : "direct call"));
	// 	document.documentElement.classList.toggle("desktop-small", this.breakpoints["desktop-small"].matches);
	// 	this.navigationView.render();
	// 	this.contentView.render();
	// 	return this;
	// },
	// _onResize: function() { 
	// 	this.render();
	// },
	// _afterFirstChange: function(bundle, media) {
	// 	this.listenTo(controller, "change:before", this._afterChangeDeferred);
	// 	this.renderControllerChange(bundle, media);
	// 	this.render();
	// },
	// _afterChangeDeferred: function(bundle, media) {
	// 	this.requestAnimationFrame(function() {
	// 		this.renderControllerChange(bundle, media);
	// 	});
	// },
};

if (DEBUG) {
	/** @type {module:app/view/DebugToolbar} */
	var DebugToolbar = require("app/view/DebugToolbar");
	// var init = AppViewProto.initialize;
	AppViewProto.initialize = (function(fn) {
		return function() {
			this.el.appendChild((new DebugToolbar({id: "debug-toolbar", collection: bundles})).render().el);
			return fn.apply(this, arguments);
		};
	})(AppViewProto.initialize);
	
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
