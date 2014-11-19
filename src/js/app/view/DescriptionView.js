/**
 * @module app/view/BundleDetailView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("./template/DescriptionView.tpl");

/**
 * @constructor
 * @type {module:app/view/BundleDetailView}
 */
module.exports = Backbone.View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	template: viewTemplate,

	initialize: function (options) {
		_.bindAll(this, "deferredRender");
		// options
		options.template && (this.template = options.template);
		// listeners
		this.listenTo(this.collection, "select:one", this.addModelListeners);
		this.listenTo(this.collection, "deselect:one", this.removeModelListeners);
		if (this.collection.selected) {
			this.addModelListeners(this.collection.selected);
		}
		this.listenTo(this.collection, "select:one select:none", this.render);
	},

	addModelListeners: function (model) {
		this.listenTo(model, "change", this.render);
	},

	removeModelListeners: function (model) {
		this.stopListening(model);
	},

	render: function () {
		_.defer(this.deferredRender);
		return this;
	},

	deferredRender: function () {
		if (this.$content) {
			this.$content
				.stop().css(_.extend({
					width: this.$content.outerWidth(),
					height: this.$content.outerHeight(),
					position: "absolute"
				}, this.$content.position()))
				.delay(300).animate({opacity: 0}, {duration: 150})
				.promise().always(function() {
					this.remove();
				})
				;
			delete this.$content;
		}
		var item = this.collection.selected;
		if (item) {
			this.$content = Backbone.$(this.createRenderedElement(item));
			this.$content
				.appendTo(this.$el).css({opacity: 0})
				.delay(500).animate({opacity: 1}, {duration: 150})
				;
		}
		return this;
	},

	createRenderedElement: function(item) {
		var elt = document.createElement("div");
		elt.innerHTML = this.template(item.attributes);
		return (elt.childElementCount == 1)? elt.children[0]: elt;
	},
});
