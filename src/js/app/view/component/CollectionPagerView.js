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

	tagName: "div",

	// template: _.template(viewTemplate),
	template: viewTemplate,

	events: {
		"click .preceding-button": "onPrecedingClick",
		"click .following-button": "onFollowingClick",
		"click .close-button": "onCloseClick"
	},

	initialize: function (options) {
		//		if (options["labelFunction"])
		//			this.labelFunction = options["labelFunction"];
		if (options["labelAttribute"]) {
			this.labelAttribute = options["labelAttribute"];
		}
		this.listenTo(this.collection, "collection:select", this.onCollectionSelect);
		this.listenTo(this.collection, "select:one", this.onCollectionSelect);
		this.listenTo(this.collection, "select:none", this.onCollectionSelect);
		this.listenTo(this.collection, "reset", this.onCollectionReset);
	},

	onPrecedingClick: function (ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			this.trigger("view:itemSelect", this.collection.precedingOrLast(this.collection.selected));
			// this.trigger("view:itemPreceding");
		}
	},

	onFollowingClick: function (ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			this.trigger("view:itemSelect", this.collection.followingOrFirst(this.collection.selected));
			// this.trigger("view:itemFollowing");
		}
	},

	onCloseClick: function (ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			this.trigger("view:itemDeselect");
		}
	},

	labelAttribute: null,

	getItemLabel: function (item) {
		if (item.has(this.labelAttribute))
			return item.get(this.labelAttribute);
		return item.toString();
	},

	onCollectionSelect: function (newItem, oldItem) {
		this.render();
	},

	onCollectionReset: function () {
		this.render();
	},

	render: function () {
		if (this.collection.selected && this.collection.length > 1) {
			var preceding = this.collection.precedingOrLast(this.collection.selected);
			var following = this.collection.followingOrFirst(this.collection.selected);
			this.$el.html(this.template({
				"preceding_label": this.getItemLabel(preceding),
				"following_label": this.getItemLabel(following),
				"close_label": "Close",
				"preceding_href": "#preceding", //this.preceding.get("handle"),
				"following_href": "#following", //this.following.get("handle"),
				"close_href": "#close",
			}));
		} else {
			this.$el.empty();
		}
		return this;
	}
});
