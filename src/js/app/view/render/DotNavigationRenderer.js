/**
 * @module app/view/render/DotNavigationRenderer
 */

/** @type {module:app/view/base/View} */
const View = require("app/view/base/View");

// /** @type {module:app/view/component/ClickableRenderer} */
// var ClickableRenderer = require("app/view/render/LabelRenderer");
/** @type {string} */
const viewTemplate = require("./DotNavigationRenderer.hbs");

/**
 * @constructor
 * @type {module:app/view/render/DotNavigationRenderer}
 */
var DotNavigationRenderer = View.extend({

	/** @type {string} */
	cidPrefix: "dotRenderer",
	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item",
	/** @override */
	template: viewTemplate,

	/** @override */
	events: {
		"click": function(ev) {
			if (ev.defaultPrevented) return;

			ev.preventDefault();
			this.trigger("renderer:click", this.model, ev);
		},
		"click a": function(ev) {
			ev.defaultPrevented || ev.preventDefault();
		}
	},

	/** @override */
	initialize: function(options) {
		this.listenTo(this.model, "selected deselected", this.renderClassList);
		this.renderClassList();
	},

	/** @override */
	render: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		this.renderClassList();
		return this;
	},

	renderClassList: function() {
		this.el.classList.toggle("selected", this.model.selected);
	},
});

module.exports = DotNavigationRenderer;
