/**
/* @module app/view/component/ArticleView
/*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {Function} */
var viewTemplate = require("./ArticleButton.hbs");

/**
/* @constructor
/* @type {module:app/view/component/ArticleButton}
/*/
var ArticleButton = View.extend({

	/** @type {string} */
	cidPrefix: "articleButton",
	/** @override */
	tagName: "h2",
	/** @override */
	className: "article-button",
	/** @type {Function} */
	template: viewTemplate,

	events: {
		"click a": function(domev) {
			domev.defaultPrevented || domev.preventDefault();
			this.trigger("view:click", this.model);
		}
	},

	// /** @override */
	// initialize: function(options) {},

	/* --------------------------- *
	/* Render
	/* --------------------------- */

	renderFrame: function(tstamp, flags) {
		this.el.innerHTML = this.template(this.model.toJSON());
	},
});
module.exports = ArticleButton;