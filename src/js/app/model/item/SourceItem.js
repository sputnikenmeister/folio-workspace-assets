/**
* @module app/model/item/SourceItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require("backbone");

/**
 * @constructor
 * @type {module:app/model/item/SourceItem}
 */
module.exports = Backbone.Model.extend({
	
	/** @type {Object} */
	defaults: {
		src: null,
		mime: null,
		w: null,
		h: null,
	},
	
	mutators: {
		domid: function() {
			return "s" + this.id;
		},
	},
});
