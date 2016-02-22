/**
/* @module app/view/base/ContainerView
/*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:utils/TransformHelper} */
var TransformHelper = require("utils/TransformHelper");
/** @type {module:app/view/base/TouchManager} */
var TouchManager = require("app/view/base/TouchManager");

/**
/* @constructor
/* @type {module:app/view/base/ContainerView}
/*/
module.exports = View.extend({
	
	/** @override */
	className: "container",
	
	/** @override */
	initialize: function (options) {
		this.transforms = new TransformHelper();
		this.touch = TouchManager.getInstance();
	},
	
	/** @override */
	properties: {
		collapsed: {
			get: function() {
				throw new Error("deprecated");
				// return this._collapsed;
			},
		}
	},
});
