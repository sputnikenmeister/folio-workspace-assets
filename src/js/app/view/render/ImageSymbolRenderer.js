/**
 * @module app/view/render/ImageSymbolRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/utils/Styles} */
var Styles = require("../../utils/Styles");

/** @type {string} */
//var viewTemplate = require("../template/DefaultSelectableRenderer.tpl");
//var viewTemplate = _.template("<div></div>");

/**
 * @constructor
 * @type {module:app/view/render/ImageSymbolRenderer}
 */
var ImageSymbolRenderer = Backbone.View.extend({

	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item image-symbol",
	/** @override */
	//	template: viewTemplate,
	/** @override */
	events: {
		"click": "onClick",
	},

	initialize: function (options) {
		this.listenTo(this.model, "selected", this.renderSelection);
		this.listenTo(this.model, "deselected", this.renderSelection);
		this.$el.data("cid", this.model.cid);
	},

	/** @override */
	render: function () {
		var currColor = Styles.getCSSProperty("body", "color");
		this.$el.css({
			width: "0.6em",
			height: String(this.model.get("h") / this.model.get("w")) + "em",
			borderColor: Styles.getCSSProperty("body", "color"),
		});
		this.renderSelection();
		return this;
	},

	renderSelection: function () {
		if (this.model.selected) {
			this.$el.css("backgroundColor", "transparent")
				.addClass("selected");
		} else {
			this.$el.css("backgroundColor", Styles.getCSSProperty("body", "color"))
				.removeClass("selected");
		}
		return this;
	},

	onClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		this.trigger("renderer:click", this.model);
	},
});

module.exports = ImageSymbolRenderer;
