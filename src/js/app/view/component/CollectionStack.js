/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/** @type {string} */
var viewTemplate = require("./CollectionStack.tpl");

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
		_.bindAll(this, "renderLater", "_onTransitionEnd");
		// options
		options.template && (this.template = options.template);
		// listeners
		this.listenTo(this.collection, {
			"reset": this._onCollectionReset,
			"select:one": this._onSelectOne,
			"deselect:one": this._onDeselectOne,
			// "select:none": this._onSelectNone,
			// "deselect:none": this._onDeselectNone,
		});
		
		this.$content = null;
		this.$lastContent = null;

		this.renderPending = true;
		this.skipTransitions = true;
		this._selectedItem = this.collection.selected;
		if (this._selectedItem) {
			this.listenTo(this._selectedItem, "change", this.requestRender);
		}
	},

	/* --------------------------- *
	 * create children
	 * --------------------------- */

	$createContentElement: function(item) {
		return $(this._createContentElement(item));
	},

	_createContentElement: function(item) {
		var elt = document.createElement("div");
		elt.innerHTML = this.template(item.toJSON());
		return (elt.childElementCount == 1)? elt.children[0]: elt;
	},

	/* --------------------------- *
	 * render
	 * --------------------------- */

	render: function () {
		if (this.renderPending) {
			if (this.$content) {
				if (this.skipTransitions) {
					// this.$el.css({ minWidth: "", minHeight: ""});
					// this.$el.removeAttr("style");
					this.$content
						.stop()
						.clearQueue()
						// .remove()
						;
					this._onTransitionEnd(this.$content);
				} else {
					var content = this.$content[0];		// Get content's size while still in the flow
					var contentRect = {//_.extend({
						top: content.offsetTop,
						left: content.offsetLeft,
						width: content.offsetWidth,
						minHeight: content.offsetHeight,
						position: "absolute",
						display: "block",
					};
					//var contentRect = _.extend(contentRect, this.$content[0].getBoundingClientRect(),
					//	this.$content.position());
					this.$el.css({						// Have the parent keep it's previous size
						minWidth: this.el.offsetWidth,
						minHeight: this.el.offsetHeight,
					});
					this.$content						// Fade it out
						.clearQueue()
						.css(contentRect)
						.delay(Globals.TRANSITION_DELAY * 0 + 1).transit({opacity: 0, delay: 1})
						// .transit({opacity: 0, delay: Globals.TRANSITION_DELAY * 0 + 1})
						.promise().always(this._onTransitionEnd);
						// .promise().always(function($content) {
						// 	$content.parent().css({ minWidth: "", minHeight: ""});
						// 	$content.parent().removeAttr("style");
						// 	$content.remove();
						// });
				}
				delete this.$content;
			}
			if (this._selectedItem) {
				this.$content = this.$createContentElement(this._selectedItem);
				if (this.skipTransitions) {
					this.$content
						.prependTo(this.$el);
				} else {
					this.$content
						.css({opacity: 0})
						// .prependTo(this.el).transit({opacity: 1, delay: Globals.TRANSITION_DELAY * 1 + 1});
						.delay(Globals.TRANSITION_DELAY * 1).prependTo(this.el).transit({opacity: 1, delay: 1});
				}
			}

			this.skipTransitions = false;
			this.renderPending = false;
		}
		return this;
	},
	
	_onTransitionEnd: function($content) {
		$content.remove();
		this.$el.css({ minWidth: "", minHeight: ""});
	},

	/* --------------------------- *
	 * render once per frame
	 * --------------------------- */

	requestRender: function() {
		if (!this.renderPending) {
			this.renderPending = true;
			_.defer(this.renderLater);
		}
	},

	renderLater: function () {
		this.render();
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

	// _onDeselectNone: function() {},
	// _onSelectNone: function() {},

});
