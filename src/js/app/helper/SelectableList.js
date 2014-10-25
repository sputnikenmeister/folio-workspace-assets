/**
 * @module model/SelectableList
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/SelectableList}
 */
module.exports = Backbone.Collection.extend({

	selected: null,

	initialize: function() {
		this.listenTo(this, "reset", function(e) {
			this.selected = null;
		});
	},

	select: function(newModel) {
		if (this.selected === newModel) {
			return;
		}
		var oldModel = this.selected;
		this.selected = newModel;
		this.trigger("collection:select", newModel, oldModel);
	},

	/** @return boolean	 */
	hasFollowing:function(model) {
		return this.indexOf(model) < (this.length - 1);
	},

	/** @return next model	*/
	following: function(model) {
		return this.hasFollowing(model)? this.at(this.indexOf(model) + 1): null;
	},

	/** @return next model or the beginning if at the end */
	followingOrFirst: function(model) {
		return this.at((this.indexOf(model) + 1) % this.length);
	},

	/** @return boolean	 */
	hasPreceding: function(model) {
		return this.indexOf(model) > 0;
	},

	/** @return the previous model */
	preceding: function(model) {
		return this.hasPreceding(model)? this.at(this.indexOf(model) - 1): null;
	},

	/** @return the previous model or the end if at the beginning */
	precedingOrLast: function(model) {
		var index = this.indexOf(model) - 1;
		return this.at(index > -1 ? index : this.length - 1);
	}

});
