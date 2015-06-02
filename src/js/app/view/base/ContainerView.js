/**
 * @module app/view/base/ContainerView
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/view/base/View} */
var View = require("./View");
/** @type {module:app/helper/TransformHelper} */
var TransformHelper = require("../../helper/TransformHelper");
/** @type {module:app/control/TouchManager} */
var TouchManager = require("../../control/TouchManager");

/** @type {module:app/control/Controller} */
var controller = require("../../control/Controller");

/**
 * @constructor
 * @type {module:app/view/base/ContainerView}
 */
module.exports = View.extend({

	className: "expanded",

	/** @override */
	constructor: function(options) {
		View.apply(this, arguments);
	},

	initialize: function (options) {
		this.transforms = new TransformHelper();
		this.touch = TouchManager.getInstance();

		this.listenTo(controller, {
			"change:before": this._beforeChange,
			"change:after": this._afterChange
		});
	},

	/* -------------------------------
	 * Router -> Model change
	 * ------------------------------- */

	_beforeChange: function(bundle,image) {
		console.log("---- ContainerView._beforeChange ----", this.el.id);
		// this.transforms.captureAll();
	},

	_afterChange: function(bundle,image) {
		console.log("---- ContainerView._afterChange ----", this.el.id);
		this.setCollapsed(bundle !== void 0);
		this.transforms.validate();
	},

	/* -------------------------------
	 * collapse
	 * ------------------------------- */

	_collapsed: false,

	isCollapsed: function() {
		return this._collapsed;
	},

	setCollapsed: function(collapsed) {
		if (this._collapsed != collapsed) {
			this._collapsed = collapsed;
			console.log("ContainerView.setCollapsed( " + (collapsed? "true":"false") + " )");

			this.el.classList.toggle("collapsed", collapsed);
			this.el.classList.toggle("expanded", !collapsed);
			this.trigger("collapsed:change", collapsed);
		}
	},
});
