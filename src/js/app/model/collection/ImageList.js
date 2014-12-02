/**
 * @module app/model/collection/ImageList
 */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../item/ImageItem");

/**
 * @constructor
 * @type {module:app/model/collection/ImageList}
 */
var ImageList = Backbone.Collection.extend({

	/** @type {Backbone.Model} */
	model: ImageItem,

	comparator: "o",

	initialize: function (models, options) {
		Backbone.Cycle.SelectableCollection.applyTo(this, models, options);
//		this.following = this.nextNoLoop;
//		this.preceding = this.prevNoLoop;
//		this.precedingOrLast = this.prev;
//		this.followingOrFirst = this.next;
	},

	// reset: function(models, options) {
	// 	Backbone.Collection.prototype.reset.apply(this, arguments);
	// 	if (models && models.length) {
	// 		this.selectAt(0, options);
	// 	} else {
	// 		this.deselect(options);
	// 	}
	// }

	/** @return boolean	 */
	hasPreceding: function (model) {
		model || (model = this.selected);
		return this.indexOf(model) > 0;
	},

	/** @return boolean	 */
	hasFollowing: function (model) {
		model || (model = this.selected);
		return this.indexOf(model) < (this.length - 1);
	},

	/** @return next model	*/
	following: function (model) {
		if (arguments.length === 1) {
			return this.hasFollowing(model) ? this.at(this.indexOf(model) + 1) : void 0;
		} else {
			return this.nextNoLoop();
		}
	},

	/** @return next model or the beginning if at the end */
	followingOrFirst: function (model) {
		if (arguments.length === 1) {
			return this.at((this.indexOf(model) + 1) % this.length);
		} else {
			return this.next();
		}
	},


	/** @return the previous model */
	preceding: function (model) {
		if (arguments.length === 1) {
			return this.hasPreceding(model) ? this.at(this.indexOf(model) - 1) : void 0;
		} else {
			return this.prevNoLoop();
		}
	},

	/** @return the previous model or the end if at the beginning */
	precedingOrLast: function (model) {
		if (arguments.length === 1) {
			var index = this.indexOf(model) - 1;
			return this.at(index > -1 ? index : this.length - 1);
		} else {
			return this.prev();
		}
	},
});

module.exports = new ImageList(void 0, {
	comparator: "o"
});
