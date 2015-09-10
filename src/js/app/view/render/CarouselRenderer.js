/**
 * @module app/view/render/CarouselRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/**
 * @constructor
 * @type {module:app/view/render/CarouselRenderer}
 */
module.exports = View.extend({
	
	/** @type {string} */
	cidPrefix: "carousel-renderer-",
	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel-item",
	/** @override */
	template: _.template("<div class=\"content sizing\"><%= name %></div>"),
	
	/** @override */
	initialize: function (options) {
		this.createChildren();
	},
	
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
	},
	
	/** @return {HTMLElement} */
	getSizingEl: function () {
		return this._sizing || (this._sizing = this.el.querySelector(".sizing"));
	},
	
	/** @return {HTMLElement} */
	getContentEl: function () {
		return this._content || (this._content = this.el.querySelector(".content"));
	},
	
	/** @return {this} */
	measure: function () {
		var sizing = this.getSizingEl();
		
		this.contentX = sizing.offsetLeft + sizing.clientLeft;
		this.contentY = sizing.offsetTop + sizing.clientTop;
		this.contentWidth = sizing.clientWidth;
		this.contentHeight = sizing.clientHeight;
		this.contentScale = 1;
		return this;
	},
	
	/** @override */
	render: function() {
		this.measure();
		return this;
	}
});
