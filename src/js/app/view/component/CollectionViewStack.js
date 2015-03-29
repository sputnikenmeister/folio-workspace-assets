/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");

/** @type {module:app/helper/View} */
var View = require("../../helper/View");
/** @type {module:app/helper/DeferredRenderView} */
var DeferredRenderView = require("../../helper/DeferredRenderView");
/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");

/**
 * @constructor
 * @type {module:app/component/CollectionViewStack}
 */
module.exports = DeferredRenderView.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "view-stack",

	initialize: function (options) {
//		_.bindAll(this, "renderLater");
		// options
		options.renderer && (this.renderer = options.renderer);
		options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);
		if (options.direction === Hammer.DIRECTION_VERTICAL) {
			this.direction = Hammer.DIRECTION_VERTICAL;
		}

		this.childSizes = {};
		this.children = new Container();
		this.skipTransitions = true;

		_.bindAll(this, "_onTouch", "_onResize");
		this.hammer = (options.hammer)? options.hammer : this.createHammer();
		this.hammer.on("panstart panmove panend pancancel tap", this._onTouch);
//		Backbone.$(window).on("orientationchange resize", this._onResize);

		this.listenTo(this.collection, {
			"reset": this._onCollectionReset,
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
			"deselect:one": this._onDeselectOne,
			"deselect:none": this._onDeselectNone,
		});
		this._selectedItem = this.collection.selected;

		if (this.el.parentElement) {
			this.createChildrenNow();
		} else {
			this.createChildrenLater();
		}
	},

	remove: function () {
//		Backbone.$(window).off("orientationchange resize", this._onResize);
		this.hammer.off("panstart panmove panend pancancel tap", this._onTouch);
		if (this._hammerIsLocal) this.hammer.destroy();
		this.removeChildren();
		DeferredRenderView.prototype.remove.apply(this);
	},

	/* --------------------------- *
	 * create children
	 * --------------------------- */

	$createContentElement: function(item) {
		return Backbone.$(this._createContentElement(item));
	},

	_createContentElement: function(item) {
		var elt = document.createElement("div");
		elt.innerHTML = this.template(item.toJSON());
		return (elt.childElementCount == 1)? elt.children[0]: elt;
	},

	/* --------------------------- *
	 * render
	 * --------------------------- */

	renderLater: function () {
		this.render();
	},

	render: function () {
		if (this.skipTransitions) {
			// remove
			if (this.$content) {
				this.$el.removeAttr("style");
				this.$content
					.stop()
//					.clearQueue()
					.remove();
				delete this.$content;
			}
			if (this._selectedItem) {
				this.$content = this.$createContentElement(this._selectedItem);
				this.$content.prependTo(this.$el);
			}
			this.skipTransitions = false;
		} else {
			if (this.$content) {
				// Get content's size while still in the flow
				var content = this.$content[0];
				var contentRect = {//_.extend({
					top: content.offsetTop,
					left: content.offsetLeft,
					width: content.offsetWidth,
					minHeight: content.offsetHeight,
					position: "absolute",
					display: "block",
				};
				//var contentRect = _.extend(contentRect, this.$content[0].getBoundingClientRect(), this.$content.position());

				// Have the parent keep it's previous size
				this.$el.css({
					minWidth: this.el.offsetWidth,
					minHeight: this.el.offsetHeight,
				});

				// Fade it out
				this.$content
//					.stop()
					.clearQueue()
					.css(contentRect)
					.delay(Globals.TRANSITION_DELAY)
					.transit({opacity: 0}, Globals.TRANSITION_DURATION)
					.promise().always(function($content) {
						$content.parent().removeAttr("style");
						$content.remove();
					});
				delete this.$content;
			}
			if (this._selectedItem) {
				this.$content = this.$createContentElement(this._selectedItem);
				this.$content
					.css({opacity: 0})
					.delay(Globals.TRANSITION_DELAY * 2)
					.prependTo(this.el)
					.transit({opacity: 1}, Globals.TRANSITION_DURATION);
			}
		}
		return this;
	},

	/* --------------------------- *
	 * collection event handlers
	 * --------------------------- */

	_onCollectionReset: function() {
		this.skipTransitions = true;
	},

	_onDeselectOne: function (model) {
		// clear only if a different model hasn't been set
		if (this._selectedItem && this._selectedItem === model) {
			this._selectedItem = null;
			this.stopListening(model);
			this.requestRender();
		}
	},

	_onSelectOne: function(model) {
		if (model && model !== this._selectedItem) {
			this._selectedItem = model;
			this.listenTo(model, "change", this.requestRender);
			this.requestRender();
		}
	},
});
