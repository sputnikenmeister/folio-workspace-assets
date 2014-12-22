/**
 * @module app/view/render/DefaultCarouselRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/helper/View} */
var View = require("../../helper/View");
/** @type {module:app/utils/Styles} */
var Styles = require("../../utils/Styles");

/**
 * @constructor
 * @type {module:app/view/render/DefaultCarouselRenderer}
 */
module.exports = View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel-item default-carousel-item",
	/** @override */
	template: _.template("<div class=\"placeholder\"><%= name %></div>"),

	/** @override */
	events: {
		"dragstart img": function (ev) {
			ev.preventDefault();
		} /* prevent conflict with hammer.js */
	},

	initialize: function (options) {
		this.listenTo(this.model, "selected deselected", this._onSelectionChange);
		this.$el.data("cid", this.model.cid);
		this.$el.html(this.template(this.model.toJSON()));
		this.$placeholder = this.$(".placeholder");
	},

	/** @override */
	render: function () {
		var w = this.$placeholder.innerWidth();
		var h = Math.floor((w / this.model.get("w")) * this.model.get("h"));

		this.$el.css("height", h);
		return this;
	},

	_onSelectionChange: function () {
		if (this.model.selected) {
			this.$el.addClass("selected");
		} else {
			this.$el.removeClass("selected");
		}
	},
});
