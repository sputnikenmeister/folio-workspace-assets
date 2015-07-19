/**
 * @module app/view/render/MediaRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("../../model/item/MediaItem");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/** @type {Function} */
var viewTemplate = require( "./MediaRenderer.tpl" );

/** @type {module:app/view/promise/whenSelectionIsContiguous} */
var whenSelectionIsContiguous = require("../promise/whenSelectionIsContiguous");
/** @type {module:app/view/promise/whenTransitionEnds} */
var whenTransitionEnds = require("../promise/whenTransitionEnds");

/**
 * @constructor
 * @type {module:app/view/render/MediaRenderer}
 */
module.exports = View.extend({
	
	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item media-item idle",
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	/** @type {Function} */
	template: viewTemplate,
	
	// /** @override */
	constructor: function(options) {
		_.bindAll(this, "_onContentClick");
		View.apply(this, arguments);
	},
	
	// /** @override */
	// initialize: function (opts) {
	// 	// this.createChildren();
	// },
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	// createChildren: function() {
	// 	this.el.innerHTML = this.template(this.model.toJSON());
	// 	
	// 	this.placeholder = this.el.querySelector(".placeholder");
	// 	this.content = this.el.querySelector(".content");
	// 	this.image = this.content.querySelector("img.current");
	// 	this.playToggle = this.el.querySelector(".play-toggle");
	// },
	
	// /** @return {this} */
	// render: function () {
	// 	return this;
	// },
	
	setEnabled: function(enabled) {
		this.model.selected && this.toggleMediaPlayback(enabled);
	},
	
	/* --------------------------- *
	/* utils
	/* --------------------------- */
	
	_getSelectionDistance: function() {
		return Math.abs(this.model.collection.indexOf(this.model) - this.model.collection.selectedIndex);
	},
	
	/* ---------------------------
	/* selection handlers
	/* when model is selected, click toggles playback
	/* --------------------------- */
	
	addSelectionListeners: function() {
		this.listenTo(this.model, {
			"selected": this._onModelSelected,
			"deselected": this._onModelDeselected,
		});
		this.model.selected && this._onModelSelected();
	},
	
	/* model selection
	/* --------------------------- */
	_onModelSelected: function() {
		// this.toggleMediaPlayback(true);
		this.playToggle.addEventListener("click", this._onContentClick, false);
		this.listenTo(this, "view:remove", this._removeClickHandler);
	},
	
	_onModelDeselected: function() {
		this.toggleMediaPlayback(false);
		this.playToggle.removeEventListener("click", this._onContentClick, false);
		this.stopListening(this, "view:remove", this._removeClickHandler);
	},
	
	_removeClickHandler: function() {
		this.playToggle.removeEventListener("click", this._onContentClick, false);
	},
	
	/* click dom event
	/* --------------------------- */
	_onContentClick: function(ev) {
		ev.defaultPrevented || this.toggleMediaPlayback();
	},
	
	/* --------------------------- *
	/* abstract methods
	/* --------------------------- */
	
	toggleMediaPlayback: function(newPlayState) {
		// abstract
	},
}, {
	
	whenSelectTransitionEnds: function(view) {
		if (view.model.selected) {
			return Promise.resolve(view);
		} else {
			return whenTransitionEnds(view, view.el, "transform");
		}
	},
});
