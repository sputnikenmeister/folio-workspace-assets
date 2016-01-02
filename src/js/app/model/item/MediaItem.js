/**
* @module app/model/item/MediaItem
* @requires module:backbone
*/

// /** @type {module:backbone} */
// var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/** @type {module:app/model/item/SourceItem} */
var SourceItem = require("app/model/item/SourceItem");
/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("utils/strings/stripTags");
// /** @type {module:app/model/parseSymAttrs} */
// var parseSymAttrs = require("app/model/parseSymAttrs");

var urlTemplates = {
	"original" :
		_.template(Globals.MEDIA_DIR + "/<%= src %>"),
	"constrain-width" :
		_.template(Globals.APP_ROOT + "image/1/<%= width %>/0/uploads/<%= src %>"),
	"constrain-height" :
		_.template(Globals.APP_ROOT + "image/1/0/<%= height %>/uploads/<%= src %>"),
	"debug-bandwidth":
		_.template(Globals.MEDIA_DIR.replace(/(https?\:\/\/[^\/]+)/, "$1/slow/<%= kbps %>") + "/<%= src %>"),
};

/**
* @constructor
* @type {module:app/model/item/MediaItem.SourceCollection}
*/
var SourceCollection = SelectableCollection.extend({
	model: SourceItem
});

/**
 * @constructor
 * @type {module:app/model/item/MediaItem}
 */
module.exports = BaseItem.extend({
	
	_domPrefix: "m",
	
	/** @type {Object} */
	defaults: {
		o: 0,
		bId: -1,
		desc: "<p><em>Untitled</em></p>",
		srcIdx: 0,
		get srcset() { return []; },
		get sources() { return new SourceCollection(); },
		// srcset: function() { return []; },
		// sources: function() { return new SourceCollection(); },
	},
	
	mutators: {
		// domid: function() {
		// 	return "m" + this.id;
		// },
		name: function () {
			return this.get("text") || this.get("src");
		},
		handle: function () {
			return this.get("src");
		},
		text: function () {
			return stripTags(this.get("desc"));
		},
		attrs: {
			set: function (key, value, opts, set) {
				this._attrs = null;
				BaseItem.prototype.mutators.attrs.set.apply(this, arguments);
				this._updateSources();
			}
		},
		srcset: {
			set: function (key, value, opts, set) {
				set(key, value, opts);
				this.get("sources").reset(value, opts);
				this._updateSources();
			}
		},
		source: {
			transient: true,
			get: function () {
				return this.get("sources").at(this.get("srcIdx"));
			},
		},
		// src: {
		// 	transient: true,
		// 	get: function() {
		// 		return this.has("source")? this.get("source").get("src") : "";
		// 		// return this.get("source").get("src");
		// 	},
		// },
		// w: {
		// 	transient: true,
		// 	get: function() {
		// 		return this.has("source")? this.get("source").get("w") : 0;
		// 		// return this.get("source").get("w");
		// 	},
		// },
		// h: { 
		// 	transient: true,
		// 	get: function() {
		// 		return this.has("source")? this.get("source").get("h") : 0;
		// 		// return this.get("source").get("h");
		// 	},
		// },
	},
	
	initialize: function() {
		this._updateColors();
		this.listenTo(this, "change:attrs", function() {
			this._attrs = null;
		});
	},
	
	attrs: function() {
		// if (this._attrs === void 0) {
		// 	this._attrs = _.defaults({}, this.get("attrs"), this.get("bundle").attrs());
		// }
		return this._attrs || (this._attrs = _.defaults({}, this.get("attrs"), this.get("bundle").attrs()));
	},
	
	_updateColors: function() {
		this.colors = {
			fgColor: new Color(this.attr("color")),
			bgColor: new Color(this.attr("background-color"))
		};
		this.colors.hasDarkBg = this.colors.fgColor.luminosity() > this.colors.bgColor.luminosity();
	},
	
	_updateSources: function() {
		var srcObj = { kbps: this.attr("@debug-bandwidth") };
		var srcTpl = urlTemplates[srcObj.kbps? "debug-bandwidth" : "original"];
		this.get("sources").forEach(function(item) {
			srcObj.src = item.get("src");
			item.set("original", srcTpl(srcObj));
		});
	},
	
	// _updateSourcesArr: function() {
	// 	var srcset = this.get("srcset");
	// 	if (Array.isArray(srcset)) {
	// 		var srcObj = { kbps: this.attr("@debug-bandwidth") };
	// 		var srcTpl = Globals.MEDIA_SRC_TPL[srcObj.kbps? "debug-bandwidth" : "original"];
	// 		srcset.forEach(function(o) {
	// 			srcObj.src = o.src;
	// 			o.original = srcTpl(srcObj);
	// 		}, this);
	// 	}
	// 	this.get("sources").reset(srcset);
	// },
	
});
