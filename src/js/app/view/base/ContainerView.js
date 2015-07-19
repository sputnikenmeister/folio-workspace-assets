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
/** @type {module:utils/TransformHelper} */
var TransformHelper = require("../../../utils/TransformHelper");
/** @type {module:app/control/TouchManager} */
var TouchManager = require("../../control/TouchManager");

/** @type {module:app/control/Controller} */
var controller = require("../../control/Controller");

/**
 * @constructor
 * @type {module:app/view/base/ContainerView}
 */
module.exports = View.extend({

	className: "container-expanded",

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

		this.listenTo(this, "collapsed:change", this._onCollapseChange);
	},

	/* -------------------------------
	 * collapse
	 * ------------------------------- */

	_collapsed: false,

	isCollapsed: function() {
		return this._collapsed;
	},

	setCollapsed: function(collapsed) {
		if (this._collapsed !== collapsed) {
			this._collapsed = collapsed;
			this.el.classList.toggle("container-collapsed", collapsed);
			this.el.classList.toggle("container-expanded", !collapsed);
			this.trigger("collapsed:change", collapsed);
		}
	},

	/* -------------------------------
	 * Router -> Model change
	 * ------------------------------- */

	_beforeChange: function(bundle,media) {
		// console.log(">>>> ContainerView._beforeChange");
		// this.transforms.captureAll();
	},

	_afterChange: function(bundle,media) {
		// console.log("<<<< ContainerView._afterChange");
		// this.setCollapsed(bundle !== void 0);
		// this.transforms.validate();
	},

	_onCollapseChange: function(collapsed) {
		// console.log("ContainerView._onCollapseChange(" + (collapsed?"true":"false") + ")");
	},
});
