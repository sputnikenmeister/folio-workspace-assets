/**
 * @module app/view/component/CollectionPager
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");

/** @type {Function} */
var viewTemplate = require("./CollectionPager.hbs");
//var viewTemplate = require("./CollectionPager.withClose.hbs");

/**
 * @constructor
 * @type {module:app/view/component/CollectionPager}
 */
module.exports = View.extend({
	
	/** @override */
	tagName: "div",
	/** @override */
	className: "pager",
	/** @type {Function} */
	template: viewTemplate,
	/** @type {String|Function} */
	labelAttribute: "name",

	/** @type {Object.<{String|Function}>}*/
	events: {
		"click .preceding-button": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("view:select:one", this.collection.precedingOrLast());
		},
		"click .following-button": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("view:select:one", this.collection.followingOrFirst());
		},
		"click .close-button": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("view:select:none");
		}
	},

	/** @override */
	initialize: function (options) {
		options.template && (this.template = options.template);
		options.labelAttribute && (this.labelAttribute = options.labelAttribute);
		this.listenTo(this.collection, "select:one select:none", this.render);
		this.listenTo(this.collection, "reset", this.render);
	},

	/** @override */
	render: function () {
		if (this.collection.length > 1 && this.collection.selected) {
			var preceding = this.collection.precedingOrLast();
			var following = this.collection.followingOrFirst();
			this.el.innerHTML = this.template({
				preceding: {
					label: this.getLabel(preceding),
					href: preceding.get("handle"),
				},
				following: {
					label: this.getLabel(following),
					href: following.get("handle"),
				}
			});
		} else {
			this.el.innerHTML = "";
		}
		return this;
	},

	/** @param {Object} model */
	getLabel: function (model) {
		return model.has(this.labelAttribute)? model.get(this.labelAttribute) : model.toString();
	},
});
