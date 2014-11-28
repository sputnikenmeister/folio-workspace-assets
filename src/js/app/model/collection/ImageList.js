/**
 * @module app/model/collection/ImageList
 */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require( "../item/ImageItem" );

/**
 * @constructor
 * @type {module:app/model/collection/ImageList}
 */
var ImageList = Backbone.Collection.extend({

	/** @type {Backbone.Model} */
	model: ImageItem,

	comparator: "o",

	initialize: function( models, options ) {
		Backbone.Cycle.SelectableCollection.applyTo(this, models, options);
	},

	// reset: function(models, options) {
	// 	Backbone.Collection.prototype.reset.apply(this, arguments);
	// 	if (models && models.length) {
	// 		this.selectAt(0, options);
	// 	} else {
	// 		this.deselect(options);
	// 	}
	// }
});

module.exports = new ImageList(void 0, {comparator: "o"});
