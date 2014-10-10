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
var viewTemplate = require( "./CollectionPagerView.tpl" );

/**
 * @constructor
 * @type {module:app/view/CollectionPagerView
 */
module.exports = Backbone.View.extend({

	
	current: null,
	
	following: null,
	
	preceding: null,
	
	events: {
		"click .preceding-button": 	"onPrecedingClick",
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
		
//		this.template = _.template(viewTemplate);
		
		this.collection.on("collection:select", this.whenCollectionSelect, this);
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
		this.collection.select(this.preceding);
	},
	
	onFollowingClick: function(event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
		}
		this.collection.select(this.following);
	},
	
	onCloseClick: function(event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
		}
		if (this.current) {
			this.collection.select(null);
		}
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