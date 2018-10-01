/**
 * @module app/model/BaseItem
 * @requires module:backbone
 *//** @type {module:backbone} */
const BaseModel = require("backbone").Model;
// /** @type {module:app/model/BaseModel} */
// var BaseModel = require("app/model/BaseModel");

module.exports = BaseModel.extend({

	defaults: {
		collapsed: false,
		routeName: "initial",
		article: null,
		bundle: null,
		media: null,
		fromRouteName: "",
		withArticle: false,
		withBundle: false,
		withMedia: false,
	},

	getters: [
		"collapsed",
		"routeName",
		"article",
		"bundle",
		"media",
		"fromRouteName",
		"withArticle",
		"withBundle",
		"withMedia"
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
	}

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
