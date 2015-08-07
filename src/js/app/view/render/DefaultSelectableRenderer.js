/**
 * @module app/view/render/DefaultSelectableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("./DefaultSelectableRenderer.hbs");
/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("./ClickableRenderer");

/**
 * @constructor
 * @type {module:app/view/render/DefaultSelectableRenderer}
 */
var DefaultSelectableRenderer = ClickableRenderer.extend({
	
	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item",
	/** @override */
	template: viewTemplate,
	
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

module.exports = DefaultSelectableRenderer;
