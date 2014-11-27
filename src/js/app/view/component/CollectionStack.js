/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("../template/CollectionStack.tpl");

/**
 * @constructor
 * @type {module:app/component/CollectionStack}
 */
module.exports = Backbone.View.extend({
	/** @override */
	tagName: "div",
	/** @override */
	className: "item-detail",
	/** @override */
	template: viewTemplate,

	initialize: function (options) {
		_.bindAll(this, "deferredRender");
		// options
		options.template && (this.template = options.template);
		// listeners
		// this.listenTo(this.collection, "reset", this.unsetModel);
		this.listenTo(this.collection, "deselect:one", this.unsetModel);
		this.listenTo(this.collection, "select:one", this.setModel);

		if (this.collection.selected) {
			this.setModel(this.collection.selected);
		}
	},

	unsetModel: function (model) {
		// clear only if a different model hasn't been set
		if (this.model === model) {
			this.model = null;
		}
		this.stopListening(model);
		this.requestRender();
	},

	setModel: function(model) {
		this.model = model;
		this.listenTo(model, "change", this.requestRender);
		this.requestRender();
	},

	requestRender: function() {
		if (!this.renderPending) {
			this.renderPending = true;
			_.defer(this.deferredRender);
		}
	},

	deferredRender: function () {
		this.render();
		this.renderPending = false;
	},

	render: function () {
		if (this.$content) {
			// Get content's size while still in the flow
			var contentRect = _.extend({
				width: this.$content.innerWidth(),
				height: this.$content.innerHeight(),
				position: "absolute"
			}, this.$content.position());
			// Have the parent keep it's size
			this.$el.css({
				minWidth: contentRect.width,
				minHeight: contentRect.height,
			});
			this.$content
				.clearQueue()
				.css(contentRect)
				.delay(300)
				.transit({opacity: 0}, 150)
				.promise().always(function($content) {
					$content.parent().removeAttr("style");
					$content.remove();
				})
				;
			delete this.$content;
		}
		if (this.model) {
			this.$content = Backbone.$(this.createRenderedElement(this.model));
			this.$content
				.css({opacity: 0})
				.appendTo(this.$el)
				.delay(550)
				.transit({opacity: 1}, 150)
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
