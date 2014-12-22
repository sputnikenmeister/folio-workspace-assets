/**
 * @module app/view/render/DefaultSelectableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("../template/DotNavigationRenderer.tpl");

/**
 * @constructor
 * @type {module:app/view/render/DefaultSelectableRenderer}
 */
var DotNavigationRenderer = Backbone.View.extend({

	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item",
	/** @override */
	template: viewTemplate,
	/** @override */
	events: {
		"click": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("renderer:click", this.model);
		}
	},

	/** @override */
	initialize: function (options) {
		this.listenTo(this.model, "selected", function () {
			this.$el.addClass("selected");
		});
		this.listenTo(this.model, "deselected", function () {
			this.$el.removeClass("selected");
		});
	},

	/** @override */
	render: function () {
		this.$el.html(this.template({
			href: this.model.cid,
			name: this.model.get("name")
		}));
		if (this.model.selected) {
			this.$el.addClass("selected");
		} else {
			this.$el.removeClass("selected");
		}
		return this;
	},
});

module.exports = DotNavigationRenderer;
