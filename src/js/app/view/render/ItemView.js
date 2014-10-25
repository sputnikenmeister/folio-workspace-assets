 /**
* @module app/view/render/ItemView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/view/render/ItemView}
 */
module.exports = Backbone.View.extend({

	events: {
		"click ": "onClick",
	},

	onClick: function (event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
			this.trigger("item:click", this.model);
		}
	},

	/** @private */
	_selected: false,
	/**
	 * @param {Boolean}
	 * @return {Boolean}
	 */
	selected: function (value) {
		if (arguments.length == 1 && this._selected !== value) {
			this._selected = value;
			if (this._selected) {
				this.$el.addClass("selected");
			} else {
				this.$el.removeClass("selected");
			}
		}
		return this._selected;
	},

	// /** @private */
	// _highlight: false,
	// /**
	//  * @param {Boolean}
	//  * @return {Boolean}
	//  */
	// highlight: function (value) {
	// 	if (arguments.length == 1 && this._highlighted !== value) {
	// 		this._highlighted = value;
	// 		if (this._highlighted) {
	// 			this.$el.addClass("highlight");
	// 		} else {
	// 			this.$el.removeClass("highlight");
	// 		}
	// 	}
	// 	return this._highlighted;
	// },
});
