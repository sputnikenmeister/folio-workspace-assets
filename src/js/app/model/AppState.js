/**
 * @module app/model/BaseItem
 * @requires module:backbone
 */
/** @type {module:backbone} */
const BaseModel = require("backbone").Model;
// /** @type {module:app/model/BaseModel} */
// var BaseModel = require("app/model/BaseModel");

// /** @type {module:utils/strings/stripTags} */
// const stripTags = require("utils/strings/stripTags");
// /** @type {module:app/control/Globals} */
// const Globals = require("app/control/Globals");

module.exports = BaseModel.extend({

	defaults: {
		routeName: "initial",
		fromRouteName: "",
		page: "",
		article: null,
		bundle: null,
		media: null,
		withArticle: false,
		withBundle: false,
		withMedia: false,
		collapsed: false
	},

	getters: [
		"page",
		"routeName",
		"fromRouteName",
		"article",
		"bundle",
		"media",
		"withArticle",
		"withBundle",
		"withMedia",
		"collapsed"
	],

	// mutators: {
	// 	routeName: {
	// 		set: function(key, value, opts, set) {
	// 			// Set fromRoute to avoid losing current "changing" state
	// 			this._previousAttributes["fromRouteName"] = this.attributes["fromRouteName"];
	// 			this.changed["fromRouteName"] = this.attributes["fromRouteName"] = this.previous("routeName");
	// 			// set("fromRouteName", this.previous("routeName"), {
	// 			// 	silent: true
	// 			// });
	// 		}
	// 	}
	// },

	initialize: function() {
		// this.listenTo(this, {
		// 	"change:routeName": function() {
		// 		this.set("fromRouteName", this.previous("routeName"));
		// 	},
		// 	"change:article": function(val) {
		// 		console.log("%s:[change] %o", this.cid, arguments);
		// 		this.set("withArticle", (typeof val === 'object'));
		// 	},
		// 	"change:bundle": function(val) {
		// 		console.log("%s:[change] %o", this.cid, arguments);
		// 		this.set("withBundle", (typeof val === 'object'));
		// 	},
		// 	"change:media": function(val) {
		// 		console.log("%s:[change] %o", this.cid, arguments);
		// 		this.set("withMedia", (typeof val === 'object'));
		// 	},
		// });

		// this.set({
		// 	fromRouteName: "",
		// 		withArticle: false,
		// 		withBundle: false,
		// 		withMedia: false
		// });
		var opts = { silent: false };

		this.listenTo(this, "change", function(attrs) {
			// var opts = { silent: false };
			if (this.hasChanged("routeName")) {
				this.set("fromRouteName", this.previous("routeName"), opts);
			}
			if (this.hasChanged("article")) {
				this.set("withArticle", this.has("article"), opts);
			}
			if (this.hasChanged("bundle")) {
				this.set("withBundle", this.has("bundle"), opts);
			}
			if (this.hasChanged("media")) {
				this.set("withMedia", this.has("media"), opts);
			}
			// this.set("pageTitle", this._getDocumentTitle(), { silent: true });
		});

		this.listenTo(this, "change:routeName",
			function(val) {
				console.log("%s:[change:routeName] %o", this.cid, val);
				// this.set("fromRouteName", this.previous("routeName"));
			});
		this.listenTo(this, "change:article",
			function(val) {
				console.log("%s:[change:article] %o", this.cid, val);
				// this.set("withArticle", _.isObject(val));
			});
		this.listenTo(this, "change:bundle",
			function(val) {
				console.log("%s:[change:bundle] %o", this.cid, val);
				// this.set("withBundle", _.isObject(val));
			});
		this.listenTo(this, "change:media",
			function(val) {
				console.log("%s:[change:media] %o", this.cid, val);
				// this.set("withMedia", _.isObject(val));
			});
	},

	hasAnyPrevious: function(attr) {
		return this.previous(attr) != null;
	},

	hasAnyChanged: function(attr) {
		return this.hasChanged(attr) && (this.has(attr) != this.hasAnyPrevious(attr));
	},

	// _getDocumentTitle: function() {
	// 	let docTitle = [];
	// 	docTitle.push(Globals.APP_NAME);
	// 	if (this.get("bundle")) {
	// 		docTitle.push(stripTags(this.get("bundle").get("name")));
	// 		if (this.model.get("media")) {
	// 			docTitle.push(stripTags(this.get("media").get("name")));
	// 		}
	// 	} else if (this.get("article")) {
	// 		docTitle.push(stripTags(this.get("article").get("name")));
	// 	}
	// 	return _.unescape(docTitle.join(" / "));
	// }

	// constructor: function() {
	// 	Object.keys(this.defaults).forEach(function(getterName) {
	// 		Object.defineProperty(this, getterName, {
	// 			enumerable: true,
	// 			get: function() {
	// 				return this.get(getterName);
	// 			}
	// 		});
	// 	});
	// 	BaseModel.apply(this, arguments);
	// }
});
