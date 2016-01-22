/**
/* @module app/view/base/ContainerView
/*/

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:utils/TransformHelper} */
var TransformHelper = require("utils/TransformHelper");
/** @type {module:app/control/TouchManager} */
var TouchManager = require("app/control/TouchManager");

/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");

/**
/* @constructor
/* @type {module:app/view/base/ContainerView}
/*/
module.exports = View.extend({
	
	className: "container container-expanded",
	
	properties: {
		collapsed: {
			get: function() {
				return this._collapsed;
			},
			set: function(collapsed) {
				this._setCollapsed(collapsed);
			}
		}
	},
	
	initialize: function (options) {
		this.transforms = new TransformHelper();
		this.touch = TouchManager.getInstance();
		
		// this.listenTo(controller, {
		// 	"change:before": this._beforeChange,
		// 	"change:after": this._afterChange
		// });
		// this.listenTo(this, "collapsed:change", this._onCollapsedChange);
	},
	
	// /** @override */
	// render: function () {
	// 	this.transforms.stopAllTransitions();
	// 	this.transforms.validate();
	// 	this.itemViews.forEach(function(view) {
	// 		view.skipTransitions = true;
	// 		view.invalidateSize();
	// 		view.renderNow();
	// 	}, this);
	// },
	
	renderCollapsed: function() {
		this.el.classList.toggle("container-collapsed", this._collapsed);
		this.el.classList.toggle("container-expanded", !this._collapsed);
	},
	
	/* -------------------------------
	/* collapse
	/* ------------------------------- */
	
	_collapsed: false,
	
	_setCollapsed: function(collapsed) {
		if (this._collapsed !== collapsed) {
			this._collapsed = collapsed;
			this._collapsedChanged = true;
			this.requestRender();
			this.trigger("collapsed:change", collapsed);
		}
	},
});
