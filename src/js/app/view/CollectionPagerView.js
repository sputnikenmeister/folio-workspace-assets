/**
* jscs standard:Jquery
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

	events: {
		"click .preceding-button":	"onPrecedingClick",
		"click .following-button":	"onFollowingClick",
		"click .close-button":		"onCloseClick"
	},

	template: _.template(viewTemplate),

	initialize: function(options) {
//		if (options["labelFunction"])
//			this.labelFunction = options["labelFunction"];
		if (options["labelAttribute"]) {
			this.labelAttribute = options["labelAttribute"];
		}
		this.listenTo(this.collection, "collection:select", this.whenCollectionSelect);
		this.listenTo(this.collection, "reset", this.whenCollectionReset);
	},

	current: null,

	following: null,

	preceding: null,

	whenCollectionReset: function() {
		if (this.collection.length > 1) {
			this.$el.show();
		} else {
			this.$el.hide();
		}
	},

	whenCollectionSelect: function(newItem, oldItem) {
		if (newItem) {
			this.current = this.collection.selected;
			this.preceding = this.collection.precedingOrLast(this.current);
			this.following = this.collection.followingOrFirst(this.current);
		} else {
			this.current = this.preceding = this.following = null;
		}
		this.render();
	},

	onPrecedingClick: function (event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
		}
		this.trigger("view:itemSelect", this.preceding);
	},

	onFollowingClick: function(event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
		}
		this.trigger("view:itemSelect", this.following);
	},

	onCloseClick: function(event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
		}
		this.trigger("view:itemDeselect");
	},

//	labelAttribute: "name",

	getItemLabel: function(item) {
		if (!this.labelAttibute)
			return item.toString();
		return item.get(this.labelAttribute);
	},

	render: function() {
		if (this.current) {
			var values = {
				"preceding_label": this.getItemLabel(this.preceding),
				"preceding_href": "#",//this.preceding.get("handle"),
				"following_label": this.getItemLabel(this.following),
				"following_href": "#",//this.following.get("handle"),
				"close_label": "Close",
				"close_href": "#",//this.following.get("handle"),
			};
			this.$el.html(this.template(values));
		} else {
			this.$el.empty();
		}
		return this;
	}
});
