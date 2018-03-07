/**
 * @module app/view/DebugToolbar
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:cookies-js} */
var Cookies = require("cookies-js");
/** @type {module:modernizr} */
var Modernizr = require("Modernizr");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
// /** @type {module:app/control/Controller} */
// var controller = require("app/control/Controller");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");

/** @type {Function} */
var viewTemplate = require("./template/DebugToolbar.hbs");

/** @type {Function} */
var mediaInfoTemplate = _.template("<%= w %> \u00D7 <%= h %>");

// var appStateSymbols = { withBundle: "b", withMedia: "m", collapsed: "c"};
// var appStateKeys = Object.keys(appStateSymbols);

var DebugToolbar = View.extend({

	/** @override */
	cidPrefix: "debugToolbar",
	/** @override */
	tagName: "div",
	/** @override */
	className: "toolbar",
	/** @override */
	template: viewTemplate,

	initialize: function(options) {
		Cookies.defaults = {
			domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
		};

		this.el.innerHTML = this.template({
			layouts: Globals.LAYOUT_NAMES,
			tests: Modernizr,
			navigator: window.navigator
		});

		/* toggle's target: container
		/* - - - - - - - - - - - - - - - - */
		var container = document.body.querySelector("#container");

		/* info elements
		/* - - - - - - - - - - - - - - - - */
		this.backendEl = this.el.querySelector("#edit-backend a");
		this.mediaInfoEl = this.el.querySelector("#media-info span");
		this.appStateEl = this.el.querySelector("#app-state");

		/* toggle visibility
				/* - - - - - - - - - - - - - - - - */
		this.initializeClassToggle("show-links", this.el.querySelector(".debug-links #links-toggle"), this.el);
		this.initializeClassToggle("show-tests", this.el.querySelector("#toggle-tests a"), this.el);
		this.initializeClassToggle("hide-passed", this.el.querySelector("#toggle-passed"), this.el);

		/* toggle container classes
		/* - - - - - - - - - - - - - - - - */
		this.initializeClassToggle("debug-grid-bg", this.el.querySelector("#toggle-grid-bg a"), container);
		this.initializeClassToggle("debug-blocks", this.el.querySelector("#toggle-blocks a"), container);
		this.initializeClassToggle("debug-logs", this.el.querySelector("#toggle-logs a"), container);
		this.initializeClassToggle("debug-tx", this.el.querySelector("#toggle-tx a"), container,
			function(key, value) {
				this.el.classList.toggle("show-tx", value);
			}
		);

		this.initializeLayoutSelect();

		this.listenTo(this.model, "change", this._onModelChange);
		this._onModelChange();
	},

	initializeLayoutSelect: function() {
		var layoutSelectEl = this.el.querySelector("#select-layout select");
		var cookieValue, cookieKey = "layout-name";
		var modelValue, modelKey = "layoutName";

		this.listenTo(this.model, "change:layoutName", function(model, value) {
			var previousValue = model.previous(modelKey);
			if (previousValue)
				document.body.classList.remove(previousValue);
			if (value)
				document.body.classList.add(value);
			Cookies.set(cookieKey, value);
			console.info("%s::[change:layoutName] layout-name value:'%s' previous:'%s'\n\tdoc:'%s'", this.cid, value, previousValue, document.body.className);
		});

		layoutSelectEl.addEventListener("change", function(ev) {
			console.info("%s:[change] value:'%s'", this.cid, ev.target.value, ev);
			this.model.set(modelKey, ev.target.value);
		}.bind(this), false);

		modelValue = this.model.get(modelKey);
		cookieValue = Cookies.get(cookieKey);

		if (!cookieValue) {
			Cookies.set(cookieKey, modelValue);
			cookieValue = modelValue;
		}
		layoutSelectEl.value = cookieValue;
		this.model.set(modelKey, cookieValue);
		console.info("%s::init layout-name cookie:'%s' model:'%s' select:'%s'\n\tdoc:'%s'", this.cid, Cookies.get(cookieKey), this.model.get(modelKey), layoutSelectEl.value, document.body.className);
	},

	initializeToggle: function(key, toggleEl, callback) {
		var ctx = this;
		var toggleValue = Cookies.get(key) === "true";
		callback.call(ctx, key, toggleValue);

		toggleEl.addEventListener("click", function(ev) {
			if (ev.defaultPrevented) return;
			else ev.preventDefault();
			toggleValue = !toggleValue;
			Cookies.set(key, toggleValue ? "true" : "");
			callback.call(ctx, key, toggleValue);
		}, false);
	},

	initializeClassToggle: function(key, toggleEl, targetEl, callback) {
		var hasCallback = _.isFunction(callback);

		this.initializeToggle(key, toggleEl, function(key, toggleValue) {
			targetEl.classList.toggle(key, toggleValue);
			toggleEl.classList.toggle("toggle-enabled", toggleValue);
			toggleEl.classList.toggle("color-reverse", toggleValue);
			hasCallback && callback.apply(this, arguments);
		});
	},

	_onModelChange: function() {
		console.log("%s::_onModelChange changedAttributes:%o", this.cid, this.model.changedAttributes());
		var i, ii, prop, el, els = this.appStateEl.children;
		for (i = 0, ii = els.length; i < ii; i++) {
			el = els[i];
			prop = el.getAttribute("data-prop");
			el.classList.toggle("has-value", this.model.get(prop));
			el.classList.toggle("has-changed", this.model.hasChanged(prop));
			el.classList.toggle("color-reverse", this.model.hasChanged(prop));
		}
		if (this.model.hasChanged("bundle")) {
			var attrVal = Globals.APP_ROOT;
			if (this.model.has("media")) {
				attrVal += "symphony/publish/media/edit/" + this.model.get("media").id;
			} else if (this.model.has("bundle")) {
				attrVal += "symphony/publish/bundles/edit/" + this.model.get("bundle").id;
			} else {
				attrVal += "symphony/";
			}
			this.backendEl.setAttribute("href", attrVal);
		}
		if (this.model.hasChanged("media")) {
			if (this.model.has("media")) {
				this.mediaInfoEl.textContent = mediaInfoTemplate(this.model.get("media").get("source").toJSON());
				this.mediaInfoEl.style.display = "";
			} else {
				this.mediaInfoEl.textContent = "";
				this.mediaInfoEl.style.display = "none";
			}
		}
	},
});

module.exports = DebugToolbar;
