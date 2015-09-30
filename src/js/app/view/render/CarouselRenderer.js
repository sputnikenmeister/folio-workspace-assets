/**
 * @module app/view/render/CarouselRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:underscore} */
var getBoxEdgeStyles = require("../../../utils/css/getBoxEdgeStyles");

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
		this.metrics = {};
		this.metrics.content = {};
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
	}
});
