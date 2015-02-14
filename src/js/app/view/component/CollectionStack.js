/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/helper/View} */
var View = require("../../helper/View");
/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");

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
	className: "stack",
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

		this.skipTransitions = true;
		this._model = this.collection.selected;
		if (this._model) {
			this._model = this.collection.selected;
			this.listenTo(this._model, "change", this.requestRender);
		}
	},

	onCollectionReset: function() {
		this.skipTransitions = true;
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
		if (this.skipTransitions) {
			if (this.$content) {
				this.$el.removeAttr("style");
				this.$content.stop();//clearQueue().remove();
			}
			if (this._model) {
				this.$content = this.$createContentElement(this._model);
				this.$content.appendTo(this.$el);
			}
			this.skipTransitions = false;
		} else {
			if (this.$content) {
				// Get content's size while still in the flow
//				var contentRect = _.extend({
//					position: "absolute",
//					display: "block",
//				}, this.$content[0].getBoundingClientRect());
				var content = this.$content[0];
				var contentRect = {//_.extend({
					top: content.offsetTop,
					left: content.offsetLeft,
					width: content.offsetWidth,
					minHeight: content.offsetHeight,
					position: "absolute",
					display: "block",
				};//, this.$content.position());

				// Have the parent keep it's size
				this.$el.css({
					minWidth: this.el.offsetWidth,
					minHeight: this.el.offsetHeight,
				});

				// Fade it out
				this.$content
					.clearQueue()
					.css(contentRect)
					.delay(Globals.TRANSITION_DELAY)
					.transit({opacity: 0}, Globals.TRANSITION_DURATION)
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
					.delay(Globals.TRANSITION_DELAY * 2)
					.appendTo(this.el)
					.transit({opacity: 1}, Globals.TRANSITION_DURATION);
			}
		}
		if (this.skipTransitions) {
			this.skipTransitions = false;
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
