/**
 * @module app/view/render/DefaultSelectableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("../template/DefaultSelectableRenderer.tpl");

/**
 * @constructor
 * @type {module:app/view/render/DefaultSelectableRenderer}
 */
var DefaultSelectableRenderer = Backbone.View.extend({

	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item",
	/** @override */
	template: viewTemplate,
	/** @override */
	events: {
		"click": "onClick",
	},

	initialize: function (options) {
		this.listenTo(this.model, "selected", function () {
			this.$el.addClass("selected");
		});
		this.listenTo(this.model, "deselected", function () {
			this.$el.removeClass("selected");
		});
		if (this.model.selected) {
			this.$el.addClass("selected");
		}
	},

	/** @override */
	render: function () {
		this.$el.html(this.template({
			href: this.model.cid,
			label: this.model.toString()
		}));
		return this;
	},

	onClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		this.trigger("renderer:click", this.model);
	},
});

module.exports = DefaultSelectableRenderer;
