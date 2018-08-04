/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");

/** @type {string} */
var viewTemplate = require("./CollectionStack.hbs");

/**
 * @constructor
 * @type {module:app/component/CollectionStack}
 */
module.exports = View.extend({

	/** @override */
	cidPrefix: "stack",
	/** @override */
	tagName: "div",
	/** @override */
	className: "stack",
	/** @override */
	template: viewTemplate,

	events: {
		"transitionend": function(ev) {
			// console.log("%s::transitionend [invalid: %s] [transition: %s]", this.cid, this._contentInvalid, (this._skipTransitions? "skip": "run"), ev.target.id, ev.target.className);
			this._renderContent();
		}
	},

	initialize: function(options) {
		this._enabled = true;
		this._skipTransitions = true;
		this._contentInvalid = true;

		options.template && (this.template = options.template);
		this.content = document.createElement("div");
		this.content.className = "stack-item";
		this.el.appendChild(this.content);

		this.listenTo(this.collection, "select:one select:none", this._onSelectChange);
	},

	setEnabled: function(enabled) {
		if (this._enabled !== enabled) {
			this._enabled = enabled;
			this.el.classList.toggle("disabled", !this._enabled);
		}
	},

	_onSelectChange: function(item) {
		if (this._renderedItem === this.collection.selected) {
			throw new Error("change event received but item is identical");
		}
		this._renderedItem = this.collection.selected;

		this._contentInvalid = true;
		this.render();
	},

	/* --------------------------- *
	/* render
	/* --------------------------- */

	render: function() {
		if (this._skipTransitions) {
			// execute even if content has not changed to apply styles immediately
			this._skipTransitions = false;
			this.el.classList.add("skip-transitions");
			this.setImmediate(function() {
				this.el.classList.remove("skip-transitions");
			});

			// render changed content immediately
			if (this._contentInvalid) {
				this._renderContent();
			}
		} else {
			// else remove 'current' class and render on transitionend
			if (this._contentInvalid) {
				this.content.classList.remove("current");
				// this.content.className = "stack-item";
			}
		}
		return this;
	},

	_renderContent: function() {
		if (this._contentInvalid) {
			this._contentInvalid = false;
			var item = this.collection.selected;
			this.content.innerHTML = item ? this.template(item.toJSON()) : "";
			this.content.classList.add("current");
			// this.content.className = "stack-item current";
		}
	},
});