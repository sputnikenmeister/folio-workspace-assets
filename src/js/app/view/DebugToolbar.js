/**
 * @module app/view/DebugToolbar
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:cookies-js} */
var Cookies = require("cookies-js");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");

/** @type {Function} */
var viewTemplate = require("./template/DebugToolbar.hbs");
// var viewTemplate = require("app/view/template/DebugToolbar.hbs");

/** @type {Function} */
var mediaInfoTemplate = _.template("<%= w %> \u00D7 <%= h %>");

var DebugToolbar = Backbone.View.extend({
	/** @override */
	tagName: "div",
	/** @override */
	className: "toolbar color-fg05",
	/** @override */
	template: viewTemplate,
	
	initialize: function (options) {
		Cookies.defaults = {
			domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
		};
		
		this.el.innerHTML = this.template();
		
		/* toggle visibility
		 * - - - - - - - - - - - - - - - - */
		this.initializeToggle(this.el.querySelector(".debug-links dt"), "show-links", this.el);
		
		/* container toggles
		 * - - - - - - - - - - - - - - - - */
 		var container = document.body.querySelector("#container");
		
		this.initializeToggle(this.el.querySelector("#toggle-grid-bg a"), "debug-grid-bg", container);
		this.initializeToggle(this.el.querySelector("#toggle-blocks a"), "debug-blocks", container);
		this.initializeToggle(this.el.querySelector("#toggle-logs a"), "debug-logs", container);
		
		this.backendEl = this.el.querySelector("#edit-backend a");
		this.listenTo(this.collection, "select:one select:none", this._onSelectAnyBundle);
		
		this.mediaInfoEl = this.el.querySelector("#media-info span");
		this.listenTo(this.collection, "select:one", this._onSelectOneBundle);
	},
	
	initializeToggle: function (toggleEl, className, targetEl) {
		toggleEl.addEventListener("click", function (ev) {
			if (ev.defaultPrevented) return; else ev.preventDefault();
			targetEl.classList.toggle(className);
			toggleEl.classList.toggle("toggle-enabled");
			Cookies.set(className, targetEl.classList.contains(className)? "true": "");
		}, false);
		if (Cookies.get(className)) {
			targetEl.classList.add(className);
			toggleEl.classList.add("toggle-enabled");
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
