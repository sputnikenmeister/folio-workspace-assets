/**
 * @module app/view/component/CollectionPager
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/helper/View} */
var View = require("../../helper/View");

/** @type {Function} */
var viewTemplate = require("./CollectionPager.tpl");
//var viewTemplate = require("./CollectionPager.withClose.tpl");

/**
 * @constructor
 * @type {module:app/view/component/CollectionPager}
 */
module.exports = View.extend({
	/** @override */
	tagName: "div",
	/** @override */
	className: "pager",
	/** @type {Function} */
	template: viewTemplate,
	/** @type {String|Function} */
	labelAttribute: "name",

	/** @type {Object.<{String|Function}>}*/
	events: {
		"click .preceding-button": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("view:select:one", this.collection.precedingOrLast());
		},
		"click .following-button": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("view:select:one", this.collection.followingOrFirst());
		},
//		"click .close-button": function (ev) {
//			ev.isDefaultPrevented() || ev.preventDefault();
//			this.trigger("view:select:none");
//		}
	},

	/** @override */
	initialize: function (options) {
		options.template && (this.template = options.template);
		options.labelAttribute && (this.labelAttribute = options.labelAttribute);
		this.listenTo(this.collection, "select:one select:none", this.render);
		this.listenTo(this.collection, "reset", this.render);
	},

	/** @override */
	render: function () {
		if (this.collection.length > 1 && this.collection.selected) {
			var preceding = this.collection.precedingOrLast();
			var following = this.collection.followingOrFirst();
			this.$el.html(this.template({
				"preceding_label": this.getLabel(preceding),
				"preceding_href": preceding.get("handle"),
				"following_label": this.getLabel(following),
				"following_href": following.get("handle"),
//				"close_label": "Close",
//				"close_href": "#close",

			}));
		} else {
			this.$el.empty();
		}
		return this;
	},

	/** @param {Object} model */
	getLabel: function (model) {
		return model.has(this.labelAttribute)? model.get(this.labelAttribute) : model.toString();
	},
});
