/**
* @module view/CollectionView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/view/CollectionView}
 */
module.exports = Backbone.View.extend({

	/** @private */
	assignView: function(view, index) {
		this._itemViews[index] = this._itemViewsIndex[view.model.id] = view;
		this._itemEls[index] = this._itemElsIndex[view.model.id] = view.el;
	},

	/** @private */
	_itemViewsIndex: {},
	/** @private */
	getItemView: function(model) {
		return this._itemViewsIndex[model.id];
	},

	/** @private */
	_itemElsIndex: {},
	/** @private */
	getItemElement: function(model) {
		return this._itemElsIndex[model.id];
	},

	/** @private */
	_itemViews: [],
	/** @private */
	getAllItemViews: function() {
		return this._itemViews;
	},

	/** @private */
	_itemEls: [],
	/** @private */
	getAllItemElements: function() {
		return this._itemEls;
	}

});
