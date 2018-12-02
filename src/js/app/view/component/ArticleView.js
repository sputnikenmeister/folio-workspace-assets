/**
/* @module app/view/component/ArticleView
/*/

/** @type {module:app/view/base/View} */
const View = require("app/view/base/View");

// /** @type {module:utils/net/toAbsoluteURL} */
// var toAbsoluteURL = require("utils/net/toAbsoluteURL");
//
// /** @type {string} */
// var ABS_APP_ROOT = toAbsoluteURL(require("app/control/Globals").APP_ROOT);

const RECAPTCHA_KEYS = {
	'canillas.name': '6LcaPHwUAAAAAAfzEnqRchIx8jY1YkUEpuswJDHx'
};
const RECAPTCHA_URL = (key) => `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_KEYS[key]}`;

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

		// let linkEls = this.el.querySelectorAll("a[href]");
		// if (linkEls.length) {
		// 	RECAPTCHA_URL('canillas.name');
		// }
		// linkEls.forEach(el => {
		// });

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
