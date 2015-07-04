/**
 * @module app/view/render/CarouselDefaultRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:app/helper/StyleHelper} */
//var Styles = require("../../helper/StyleHelper");

/**
 * @constructor
 * @type {module:app/view/render/CarouselDefaultRenderer}
 */
module.exports = View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel-item default-renderer",
	/** @override */
	template: _.template("<div class=\"content sizing\"><%= name %></div>"),

//	/** @override */
//	events: {
//		"dragstart img": function (ev) {
//			ev.preventDefault();
//		}
//	},

	/** @override */
	initialize: function (options) {
//		this.listenTo(this.model, "selected deselected", this._onSelectionChange);
//		this.$el.html(this.template(this.model.attributes));
		this.$el.html(this.template(this.model.toJSON()));
//		this.$sizing = this.$(".sizing");
	},

//	/** @override */
//	render: function () {
//		var w = this.$sizing.outerWidth();
//		var h = this.$sizing.outerHeight();
////		var h = Math.floor((w / this.model.get("w")) * this.model.get("h"));
////		this.$sizing.css({width: w, height: h});
//
//		this.$el.css("height", h);
//		return this;
//	},

//	_onSelectionChange: function () {
//		if (this.model.selected) {
//			this.$el.addClass("selected");
//		} else {
//			this.$el.removeClass("selected");
//		}
//	},
});
