/**
 * @module app/helper/SelectOneList
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );
// require("backbone.select");
require("backbone.cycle");

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require( "../model/item/ImageItem" );

/**
 * @constructor
 * @type {module:app/model/SelectOneList}
 */
module.exports = Backbone.Collection.extend({

	model: ImageItem,

	initialize: function( models, options ) {
		var opts = _.extend({
			enableModelSharing: true,
			selectIfRemoved: "prev",
			initialSelection: "none",
		}, options);
		Backbone.Cycle.SelectableCollection.applyTo(this, models, opts);
		// Backbone.Select.One.applyTo( this, models, opts );
		// var singleSelect = new Backbone.Picky.SingleSelect(this);
		// _.extend(this, singleSelect);
	},

	reset: function () {
		Backbone.Collection.prototype.reset.apply(this, arguments);
		if (this.length) {
			this.selectAt(0);
		}
	}
});
