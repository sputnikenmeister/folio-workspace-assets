/**
/* @module app/view/component/ArticleView
/*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");

// /** @type {module:utils/net/toAbsoluteURL} */
// var toAbsoluteURL = require("utils/net/toAbsoluteURL");
//
// /** @type {string} */
// var ABS_APP_ROOT = toAbsoluteURL(require("app/control/Globals").APP_ROOT);

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
	className: "article-view mdown",

	/** @override */
	initialize: function(options) {},

	/* --------------------------- *
	/* Render
	/* --------------------------- */

	renderFrame: function(tstamp, flags) {
		this.el.innerHTML = this.model.get("text");
		// FIXME: now done in xslt
		// this.el.querySelectorAll("a[href]").forEach(function(el) {
		// 	var url = toAbsoluteURL(el.getAttribute("href"));
		// 	if (url.indexOf(ABS_APP_ROOT) !== 0) {
		// 		el.setAttribute("target", "_blank");
		// 	}
		// });
	},
});
module.exports = ArticleView;
