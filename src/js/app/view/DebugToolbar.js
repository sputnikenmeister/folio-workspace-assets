/**
 * @module app/view/DebugToolbar
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:cookies-js} */
var Cookies = require("cookies-js");

/** @type {module:utils/toggleFullScreen} */
// var toggleFullScreen = require("../../utils/toggleFullScreen");
/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");

/** @type {Function} */
var viewTemplate = require("./template/DebugToolbar.hbs");
/** @type {Function} */
var mediaInfoTemplate = _.template("<%= w %> \u00D7 <%= h %>");

var DebugToolbar = Backbone.View.extend({
	/** @override */
	tagName: "div",
	/** @override */
	className: "toolbar show-info color-fg05",
	/** @override */
	template: viewTemplate,
	
	events: {
		"click dt": function(ev) {
			this.el.classList.toggle("show-info");
			this.el.classList.toggle("show-links");
		},
	},
	
	initialize: function (options) {
		Cookies.defaults = {
			domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
		};
		
		this.el.innerHTML = this.template({approot: Globals.APP_ROOT});
		
		/* .debug-group
		 * - - - - - - - - - - - - - - - - */
 		var container = document.body.querySelector("#container");
		var showGridEl = this.el.querySelector("#show-grid");
		var showBlocksEl = this.el.querySelector("#show-blocks");
		this.initializeToggle(showBlocksEl, "debug-blocks", container);
		this.initializeToggle(showGridEl, "debug-grid-bg", container);
		
		// var debugImgEl = document.createElement("img");
		// debugImgEl.id = "debug-grid";
		// debugImgEl.src = Globals.APP_ROOT + "/workspace/assets/images/debug-background.svg";
		// this.initializeToggleFn(showGridEl, "debug-grid-img", function(toggleValue) {
		// 		if (toggleValue && debugImgEl.parentElement !== container) {
		// 			container.insertBefore(debugImgEl, container.firstElementChild);
		// 		} else if (debugImgEl.parentElement === container) {
		// 			container.removeChild(debugImgEl);
		// 		}
		// 	});
		
		// this.el.querySelector("#toggle-full-screen").addEventListener("click", toggleFullScreen);
		
		this.backendEl = this.el.querySelector("#edit-backend");
		this.listenTo(this.collection, "select:one select:none", this._onSelectAnyBundle);
		
		this.mediaInfoEl = this.el.querySelector("#media-info");
		this.listenTo(this.collection, "select:one", this._onSelectOneBundle);
		
		/* .classes-group
		 * - - - - - - - - - - - - - - - - */
		// var documentClassesEl = this.el.querySelector("#document-classes");
		// var bodyClassesEl = this.el.querySelector("#body-classes");
		// var updateClassesGroup = function () {
		// 	documentClassesEl.textContent = document.documentElement.className;
		// 	bodyClassesEl.textContent = document.body.className;
		// };
		// this.listenTo(controller, "change:after", updateClassesGroup);
		// window.addEventListener("resize", updateClassesGroup, false);
		// window.addEventListener("orientationchange", updateClassesGroup, false);
		// updateClassesGroup();
		
		/* show dt.debug-group | dt.classes-group
		 * - - - - - - - - - - - - - - - - */
		// this.events["click dt.classes-group"].call(this, void 0);
	},
	
	initializeToggle: function (toggleEl, className, targetEl) {
		toggleEl.addEventListener("click", function (ev) {
			targetEl.classList.toggle(className);
			Cookies.set(className, targetEl.classList.contains(className)? "true": "");
		}, false);
		if (Cookies.get(className)) {
			targetEl.classList.add(className);
		}
	},
	
	initializeToggleFn: function (toggleEl, key, callback) {
		var toggleValue = Cookies.get(key) === "true";
		callback(toggleValue, key);
		
		toggleEl.addEventListener("click", function (ev) {
			toggleValue = !toggleValue;
			Cookies.set(key, toggleValue? "true": "");
			callback(toggleValue, key);
		}, false);
	},
	
	_onSelectAnyBundle: function(bundle) {
		this.backendEl.setAttribute("href", Globals.APP_ROOT + "symphony/publish/bundles/edit/" + (bundle? bundle.id : ""));
	},
	
	_onSelectOneBundle: function(bundle) {
		var mediaItems = bundle.get("media");
		
		this._onSelectAnyMedia.call(this, mediaItems.selected);
		this.listenTo(mediaItems, "select:one select:none", this._onSelectAnyMedia);
		this.listenToOnce(bundle, "deselected", function () {
			this.stopListening(mediaItems, "select:one select:none", this._onSelectAnyMedia);
		});
	},
	
	_onSelectAnyMedia: function(media) {
		this.mediaInfoEl.textContent = media? mediaInfoTemplate(media.attributes) : "";
		this.mediaInfoEl.style.display = media? "" : "none";
	},
});

module.exports = DebugToolbar;
