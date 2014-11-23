/**
 * @module app/view/component/CollectionPagerView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {string} */
var viewTemplate = require("../template/CollectionPagerView.tpl");

/**
 * @constructor
 * @type {module:app/view/component/CollectionPagerView}
 */
module.exports = Backbone.View.extend({
	/** @override */
	tagName: "div",
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
		"click .close-button": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("view:select:none");
		}
	},

	/** @override */
	initialize: function (options) {
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
				"following_label": this.getLabel(following),
				"close_label": "Close",
				"preceding_href": "#preceding", //this.preceding.get("handle"),
				"following_href": "#following", //this.following.get("handle"),
				"close_href": "#close",
			}));
		} else {
			this.$el.empty();
		}
		return this;
	},

	/** @param {Object} model */
	getLabel: function (model) {
		if (model.has(this.labelAttribute))
			return model.get(this.labelAttribute);
		return model.toString();
	},
});
