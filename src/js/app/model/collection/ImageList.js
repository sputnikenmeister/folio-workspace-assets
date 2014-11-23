/**
 * @module app/model/collection/ImageList
 * @requires module:backbone
 */

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

	initialize: function( models, options ) {
		Backbone.Cycle.SelectableCollection.applyTo(this, models, options);
	},

	reset: function () {
		Backbone.Collection.prototype.reset.apply(this, arguments);
		if (this.length) {
			this.selectAt(0);
		} else {
			this.deselect();
		}
	}

});

module.exports = new ImageList();
