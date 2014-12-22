/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/helper/View} */
var View = require("../../helper/View");

/** @type {string} */
var viewTemplate = require("../template/CollectionStack.tpl");

/**
 * @constructor
 * @type {module:app/component/CollectionStack}
 */
module.exports = View.extend({

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
		this._model = this.collection.selected;
		if (this._model) {
			this._model = this.collection.selected;
			this.listenTo(this._model, "change", this.requestRender);
		}
	},

	onCollectionReset: function() {
		this.skipAnimation = true;
	},

	unsetModel: function (model) {
		// clear only if a different model hasn't been set
		if (this._model && this._model === model) {
			this._model = null;
			this.stopListening(model);
			this.requestRender();
		}
	},

	setModel: function(model) {
		if (model && model !== this._model) {
			this._model = model;
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
		if (this.skipAnimation) {
			if (this.$content) {
				this.$el.removeAttr("style");
				this.$content.clearQueue().remove();
			}
			if (this._model) {
				this.$content = this.$createContentElement(this._model);
				this.$content.appendTo(this.$el);
			}
			this.skipAnimation = false;
		} else {
			if (this.$content) {
				// Get content's size while still in the flow
				var contentRect = _.extend({
					width: this.$el.innerWidth(),
					minHeight: this.$el.innerHeight(),
					position: "absolute",
					display: "block",
				}, this.$content.position());

				// Have the parent keep it's size
				this.$el.css({
					minWidth: this.$el.outerWidth,
					minHeight: this.$el.outerHeight,
				});

				// Fade it out
				this.$content
					.clearQueue()
					.css(contentRect)
//					.delay(350)
					.transit({opacity: 0}, 300)
					.promise().always(function($this) {
						$this.parent().removeAttr("style");
						$this.remove();
					});
				delete this.$content;
			}
			if (this._model) {
				this.$content = this.$createContentElement(this._model);
				this.$content
					.css({opacity: 0})
					.delay(700)
					.appendTo(this.$el)
					.transit({opacity: 1}, 300);
			}
		}
		if (this.skipAnimation) {
			this.skipAnimation = false;
		}
		return this;
	},

	$createContentElement: function(item) {
		return Backbone.$(this._createContentElement(item));
	},

	_createContentElement: function(item) {
		var elt = document.createElement("div");
		elt.innerHTML = this.template(item.attributes);
		return (elt.childElementCount == 1)? elt.children[0]: elt;
	},
});
