/**
 * @module app/view/render/DefaultSelectableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("./DotNavigationRenderer.tpl");
/** @type {module:backbone} */
var Strings = require("../../helper/Strings");

/**
 * @constructor
 * @type {module:app/view/render/DefaultSelectableRenderer}
 */
var DotNavigationRenderer = Backbone.View.extend({

	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item dots-fontello text-color-faded animated",
	/** @override */
	template: viewTemplate,
	/** @override */
	events: {
		"click": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("renderer:click", this.model);
		}
	},

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
			label: Strings.stripTags(this.model.get("desc"))
		}));
//		if (this.model.collection.length === 1) {
//			this.$el.addClass("single-item");
//		}
		if (this.model.selected) {
			this.$el.addClass("selected");
		}
		return this;
	},
});

module.exports = DotNavigationRenderer;
