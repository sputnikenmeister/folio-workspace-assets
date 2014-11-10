/**
 * @module app/helper/SelectOneList
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );
require( "backbone.select" );

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require( "../model/item/ImageItem" );

/**
 * @constructor
 * @type {module:app/model/SelectOneList}
 */
module.exports = Backbone.Collection.extend({

	model: ImageItem,

	initialize: function( models, options ) {
        Backbone.Cycle.SelectableCollection.applyTo(this, models,
        	_.extend({enableModelSharing: true, autoSelect: "first"}, options));
		// Backbone.Select.One.applyTo( this, models, {enableModelSharing: true} );
		// var singleSelect = new Backbone.Picky.SingleSelect(this);
		// _.extend(this, singleSelect);
	},
});
