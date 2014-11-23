/**
* @module app/model/item/ImageItem
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );
// require( "backbone.picky" );

/**
 * @constructor
 * @type {module:app/model/item/ImageItem}
 */
module.exports = Backbone.Model.extend({

	/** @type {Object} */
	defaults: {
		f: "",
		w: 0,
		h: 0,
		desc: "<p><em>No description</em></p>",
		attrs: [],
		bId: 0,
	},

	initialize: function() {
        Backbone.Cycle.SelectableModel.applyTo(this);
 		// Backbone.Select.Me.applyTo(this);
		// var selectable = new Backbone.Picky.Selectable(this);
		// _.extend(this, selectable);
	},

	// parse: function(response, options) {
	// 	console.log("parse", response);
	// 	return response;
	// },

	selector: function() {
		return "#i" + this.id;
	},

	/** @override */
	toString: function() {
		return this.id;
	},

});
