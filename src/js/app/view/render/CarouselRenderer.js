/**
 * @module app/view/render/CarouselRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:backbone} */
// var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:underscore} */
var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

/** @type {module:utils/net/toAbsoluteURL} */
var toAbsoluteURL = require("utils/net/toAbsoluteURL");

/** @type {string} */
var ABS_APP_ROOT = toAbsoluteURL(
	require("app/control/Globals").APP_ROOT);

/**
 * @constructor
 * @type {module:app/view/render/CarouselRenderer}
 */
var CarouselRenderer = View.extend({

	/** @type {string} */
	cidPrefix: "carouselRenderer",
	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel-item",
	/** @override */
	template: _.template("<div class=\"content sizing markdown-html\"><%= name %></div>"),

	properties: {
		content: {
			get: function() {
				return this._content || (this._content = this.el.querySelector(".content"));
			},
		},
		sizing: {
			get: function() {
				return this._sizing || (this._sizing = this.el.querySelector(".sizing"));
			},
		}
	},

	/** @override */
	initialize: function(options) {
		if (this.model.attr("@classname") !== void 0) {
			var clsAttr = this.model.attr("@classname").split(" ");
			for (var i = 0; i < clsAttr.length; i++) {
				this.el.classList.add(clsAttr[i]);
			}
		}
		options.parentView && (this.parentView = options.parentView);
		this.metrics = {};
		this.metrics.content = {};
		this.createChildren();
		// this.enabled = !!options.enabled; // force bool
		this.setEnabled(!!options.enabled);
	},

	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		this.el.querySelectorAll("a[href]").forEach(function(el) {
			var url = toAbsoluteURL(el.getAttribute("href"));
			if (url.indexOf(ABS_APP_ROOT) !== 0) {
				el.setAttribute("target", "_blank");
			}
		});
	},

	/** @return {HTMLElement} */
	getSizingEl: function() {
		return this._sizing || (this._sizing = this.el.querySelector(".sizing"));
	},

	/** @return {HTMLElement} */
	getContentEl: function() {
		return this._content || (this._content = this.el.querySelector(".content"));
	},

	/** @return {this} */
	measure: function() {
		var sizing = this.getSizingEl();

		this.metrics = getBoxEdgeStyles(this.el, this.metrics);
		this.metrics.content = getBoxEdgeStyles(this.getContentEl(), this.metrics.content);

		sizing.style.maxWidth = "";
		sizing.style.maxHeight = "";

		this.metrics.content.x = sizing.offsetLeft + sizing.clientLeft;
		this.metrics.content.y = sizing.offsetTop + sizing.clientTop;
		this.metrics.content.width = sizing.clientWidth;
		this.metrics.content.height = sizing.clientHeight;

		return this;
	},

	/** @override */
	render: function() {
		this.measure();
		return this;
	},

	getSelectionDistance: function() {
		return Math.abs(this.model.collection.indexOf(this.model) - this.model.collection.selectedIndex);
	},
});

module.exports = CarouselRenderer;