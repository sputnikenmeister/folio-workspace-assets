/**
/* @module app/view/component/ArticleView
/*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");

/**
/* @constructor
/* @type {module:app/view/component/ArticleView}
/*/
var ArticleView = View.extend({

	/** @type {string} */
	cidPrefix: "articleView",
	/** @override */
	tagName: "article",
	/** @override */
	className: "article-view",

	/** @override */
	initialize: function(options) {},

	/* --------------------------- *
	/* Render
	/* --------------------------- */

	renderFrame: function(tstamp, flags) {
		this.el.innerHTML = this.model.get("text");
	},
});
module.exports = ArticleView;