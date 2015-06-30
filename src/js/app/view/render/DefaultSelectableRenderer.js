/**
 * @module app/view/render/DefaultSelectableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("./DefaultSelectableRenderer.tpl");
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
	// /** @override */
	// events: {
	// 	"click": function (ev) {
	// 		if (!ev.defaultPrevented) {
	// 			console.log(this.cid, ev.type + " event preventDefault()");
	// 			ev.preventDefault();
	// 			this.trigger("renderer:click", this.model);
	// 		}
	// 	}
	// },
	
	initialize: function (options) {
		this.listenTo(this.model, {
			"selected": function () {
				this.$el.addClass("selected");
			},
			"deselected": function () {
				this.$el.removeClass("selected");
			}
		});
		if (this.model.selected) {
			this.$el.addClass("selected");
		}
	},
	
	/** @override */
	render: function () {
		this.$el.html(this.template({
			href: this.model.cid,
			name: this.model.get("name")
		}));
//		if (this.model.selected) {
//			this.$el.addClass("selected");
//		} else {
//			this.$el.removeClass("selected");
//		}
		return this;
	},
});

module.exports = DefaultSelectableRenderer;
