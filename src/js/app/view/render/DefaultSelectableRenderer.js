/**
 * @module app/view/render/DefaultSelectableRenderer
 */

/** @type {module:app/view/component/ClickableRenderer} */
const ClickableRenderer = require("app/view/render/ClickableRenderer");

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
	template: require("./DefaultSelectableRenderer.hbs"),

	initialize: function(options) {
		this.listenTo(this.model, "selected deselected", this._renderClassList);
		this._renderClassList();
	},

	/** @override */
	render: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		this._renderClassList();
		return this;
	},

	_renderClassList: function() {
		this.el.classList.toggle("selected", this.model.selected);
	},
});

module.exports = DefaultSelectableRenderer;
