/**
 * @module app/view/render/DotNavigationRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("./DotNavigationRenderer.hbs");
/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("app/view/render/ClickableRenderer");

/**
 * @constructor
 * @type {module:app/view/render/DotNavigationRenderer}
 */
var DotNavigationRenderer = ClickableRenderer.extend({

	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item",
	/** @override */
	template: viewTemplate,

	/** @override */
	initialize: function (options) {
		this.listenTo(this.model, "selected deselected", this.renderClassList);
		this.renderClassList();
	},

	/** @override */
	render: function () {
		this.el.innerHTML = this.template(this.model.toJSON());
		this.renderClassList();
		return this;
	},
	
	renderClassList: function () {
		this.el.classList.toggle("selected", this.model.selected);
	},
});

module.exports = DotNavigationRenderer;
