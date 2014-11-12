/**
 * @module app/view/CollectionView
 * @requires module:backbone
 */

/**
 * @constructor
 * @type {module:app/view/CollectionView}
 */
var CollectionView = function () {};

CollectionView.prototype = {

	/** @private */
	addView: function (view, index) {
		this._itemIds[index] = view.model.id;
		this._itemViews[index] = this._itemViewsIndex[view.model.id] = view;
		this._itemEls[index] = this._itemElsIndex[view.model.id] = view.el;
	},

	/** @private */
	removeAllViews: function () {
		this._itemViews.length = 0;
		this._itemViewsIndex = {};
		this._itemEls.length = 0;
		this._itemElsIndex = {};
	},

	/** @private */
	_itemIds: [],
	/** @private */
	getItemId: function (index) {
		return this._itemIds[index];
	},
	/** @private */
	getAllItemIds: function () {
		return this._itemIds;
	},

	/** @private */
	_itemViewsIndex: {},
	/** @private */
	getItemView: function (obj) {
		return this._itemViewsIndex[obj] || this._itemViewsIndex[obj.id];
	},

	/** @private */
	_itemElsIndex: {},
	/** @private */
	getItemElement: function (obj) {
		return this._itemElsIndex[obj] || this._itemElsIndex[obj.id];
	},

	/** @private */
	_itemViews: [],
	/** @private */
	getAllItemViews: function () {
		return this._itemViews;
	},

	/** @private */
	_itemEls: [],
	/** @private */
	getAllItemElements: function () {
		return this._itemEls;
	},
};

module.exports = CollectionView;