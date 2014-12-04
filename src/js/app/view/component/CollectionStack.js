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
		this.listenTo(this.collection, "reset", this.onCollectionReset);
		this.listenTo(this.collection, "deselect:one", this.unsetModel);
		this.listenTo(this.collection, "select:one", this.setModel);

		this.skipAnimation = true;

//		if (this.collection.selected) {
//			this.listenTo(this.model, "change", this.onModelChange);
//			this.setModel(this.collection.selected);
//		}
	},

	onCollectionReset: function() {
//		console.log("onCollectionReset", this.el.id);
//		if (this.collection.selected) {
			this.skipAnimation = true;
//			this.setModel(this.collection.selected);
//		}
	},

	unsetModel: function (model) {
		// clear only if a different model hasn't been set
//		console.log("unsetModel",this.el.id, String(model));
		if (this.model === model) {
			this.model = null;
			this.stopListening(model);
			this.requestRender();
		}
	},

	setModel: function(model) {
//		console.log("setModel",this.el.id, String(model));
		if (this.model !== model) {
			this.model = model;
			this.listenTo(model, "change", this.requestRender);
			this.requestRender();
		}
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
//		console.log("render", this.el.id, String(this.model));
		if (this.skipAnimation) {
			if (this.$content) {
				this.$content.clearQueue().remove();
				this.$el.removeAttr("style");
			}
			if (this.model) {
				this.$content = Backbone.$(this.createRenderedElement(this.model));
				this.$content.appendTo(this.$el);
			}
			this.skipAnimation = false;
		} else {
			if (this.$content) {
				// Get content's size while still in the flow
				var contentRect = _.extend({
					width: this.$el.outerWidth()+1,
					height: this.$el.outerHeight()+1,
					position: "absolute",
					display: "block",
				}, this.$content.position());
				// Have the parent keep it's size
				this.$el.css({
					minWidth: contentRect.width-1,
					minHeight: contentRect.height-1,
				});
				this.$content
					.clearQueue()
					.css(contentRect)
					.delay(300)
					.transit({opacity: 0}, 150)
					.promise().always(function($content) {
						$content.parent().removeAttr("style");
						$content.remove();
					});
				delete this.$content;
			}
			if (this.model) {
				this.$content = Backbone.$(this.createRenderedElement(this.model));
				this.$content
					.css({opacity: 0})
					.appendTo(this.$el)
					.delay(550)
					.transit({opacity: 1}, 150);
			}
		}
		return this;
	},

	createRenderedElement: function(item) {
		var elt = document.createElement("div");
		elt.innerHTML = this.template(item.attributes);
		return (elt.childElementCount == 1)? elt.children[0]: elt;
	},
});
