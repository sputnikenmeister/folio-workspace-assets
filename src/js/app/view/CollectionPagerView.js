/**
* @module view/CollectionPagerView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {string} */
var viewTemplate = require( "./template/CollectionPagerView.tpl" );

/**
 * @constructor
 * @type {module:app/view/CollectionPagerView}
 */
module.exports = Backbone.View.extend({

	tagName: "div",

	template: _.template(viewTemplate),

	events: {
		"click .preceding-button":	"onPrecedingClick",
		"click .following-button":	"onFollowingClick",
		"click .close-button":		"onCloseClick"
	},

	initialize: function(options) {
//		if (options["labelFunction"])
//			this.labelFunction = options["labelFunction"];
		if (options["labelAttribute"]) {
			this.labelAttribute = options["labelAttribute"];
		}
		this.listenTo(this.collection, "collection:select", this.whenCollectionSelect);
		this.listenTo(this.collection, "reset", this.whenCollectionReset);
	},

	onPrecedingClick: function (ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			// this.trigger("view:itemSelect", this.collection.precedingOrLast(this.collection.selected));
			this.trigger("view:itemPreceding");
		}
	},

	onFollowingClick: function(ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			// this.trigger("view:itemSelect", this.collection.followingOrFirst(this.collection.selected));
			this.trigger("view:itemFollowing");
		}
	},

	onCloseClick: function(ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			this.trigger("view:itemDeselect");
		}
	},

//	labelAttribute: "name",

	getItemLabel: function(item) {
		if (!this.labelAttibute)
			return item.toString();
		return item.get(this.labelAttribute);
	},

	// current: null,
	// following: null,
	// preceding: null,

	whenCollectionSelect: function(newItem, oldItem) {
		// if (newItem && this.collection.length > 1) {
		// 	this.current = this.collection.selected;
		// 	this.preceding = this.collection.precedingOrLast(this.current);
		// 	this.following = this.collection.followingOrFirst(this.current);
		// } else {
		// 	this.current = this.preceding = this.following = null;
		// }
		this.render();
	},

	whenCollectionReset: function() {
		// this.current = this.preceding = this.following = null;
		this.render();
	},


	render: function() {
		if (this.collection.selected && this.collection.length > 1) {
			var preceding = this.collection.precedingOrLast(this.collection.selected);
			var following = this.collection.followingOrFirst(this.collection.selected);
			this.$el.html(this.template({
				"preceding_label": 	this.getItemLabel(preceding),
				"following_label": 	this.getItemLabel(following),
				"close_label": 		"Close",
				"preceding_href": 	"#",	//this.preceding.get("handle"),
				"following_href": 	"#",	//this.following.get("handle"),
				"close_href": 		"#",	//this.following.get("handle"),
			}));
		} else {
			this.$el.empty();
		}
		return this;
	}
});
