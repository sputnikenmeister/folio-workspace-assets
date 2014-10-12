/**
* jscs standard:Jquery
* @module view/BundleDetailView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {string} */
var viewTemplate = require( "./BundleDetailView.tpl" );

/**
 * @constructor
 * @type {module:app/view/BundleDetailView}
 */
module.exports = Backbone.View.extend({

	el: "#bd-detail",
	
	template: _.template(viewTemplate),

	initialize: function(options) {
//		this.template = _.template(viewTemplate);
		this.collection.on("collection:select", this.whenBundleSelect, this);
	},
	
	whenBundleSelect: function(newItem, oldItem) {
		if (newItem && !newItem.has("images")) {
			newItem.once("change", this.onFetchSuccess, this);
		} else {
			this.render();
		}
	},
	
	onFetchSuccess: function() {
		this.render();
	},
	
	render: function() {
		var item = this.collection.selected;
		if (item) {
			this.$el.html(this.template(item.attributes));
		} else {
			this.$el.empty();
		}
		return this;
	},
});