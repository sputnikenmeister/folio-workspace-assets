/**
* @module app/model/item/SourceItem
* @requires module:backbone
*/

// /** @type {module:backbone} */
// var Backbone = require("backbone");
// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");
/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");

/** @type {String} */
var noCacheSuffix = "?" + Date.now();

/**
 * @constructor
 * @type {module:app/model/item/SourceItem}
 */
// module.exports = Backbone.Model.extend({
module.exports = BaseItem.extend({
	
	/** @type {Object} */
	defaults: {
		src: null,
		mime: null,
		w: null,
		h: null,
	},
	
	getters: [ "src", "original" ],
	
	mutators: {
		src: {
			set: function (key, value, options, set) {
				if (DEBUG) {
					value += noCacheSuffix;
				}
				set(key, value, options);
			}
		},
		// original: { 
		// 	transient: true,
		// 	get: function (key, value, options, set) {
		// 		return this.attributes.original || (this.attributes.original = this._composeOriginalSrc());
		// 	},
		// },
		// media: {
		// 	transient: true,
		// 	get: function () {
		// 		var retval;
		// 		if (this._noRecusion) {
		// 			console.log("%s::media returning null", this.cid);
		// 			retval = null;//this.id;
		// 		} else {
		// 			console.log("%s::media returning Object", this.cid);
		// 			this._noRecusion = true;
		// 			retval = this.attributes.media;
		// 			this._noRecusion = false;
		// 		}
		// 		return retval;
		// 	},
		// 	set: function (key, value, options, set) {
		// 		if (value instanceof BaseItem) {
		// 			set(key, value, options);
		// 		}
		// 	},
		// },
	},
	
	// initialize: function() {
	// 	if (DEBUG) {
	// 		var cb = function() {
	// 			// console.log("@debug-bandwidth:", JSON.stringify(this.get("media").attr("@debug-bandwidth")));
	// 			console.log("media:", JSON.stringify(this.toJSON()));
	// 			// if ((this.get("media") instanceof BaseItem) && this.get("media").attr("@debug-bandwidth")) {
	// 			// 	console.log("original", this.get("original"));
	// 			// 	console.log("media:", JSON.stringify(this.get("media").toJSON()));
	// 			// }
	// 		}.bind(this);
	// 		window.requestAnimationFrame(cb);
	// 	}
	// },
	// 
	// _composeOriginalSrc: function() {
	// 	var values = { src: this.get("src") };
	// 	if (this.has("media") && (values.kbps = this.get("media").attr("@debug-bandwidth"))) {
	// 	// if (this.has("media") && this.get("media").attrs().hasOwnProperty("@debug-bandwidth")) {
	// 	// 	values.kbps = this.get("media").attrs()["@debug-bandwidth"];
	// 		return Globals.MEDIA_SRC_TPL["debug-bandwidth"](values);
	// 	}
	// 	return Globals.MEDIA_SRC_TPL["original"](values);
	// },
});
