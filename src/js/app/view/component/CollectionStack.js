/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {Function} */
var transitionEnd = require("../../../utils/event/transitionEnd");
/** @type {Function} */
var setImmediate = require("../../../utils/setImmediate");

/** @type {string} */
var viewTemplate = require("./CollectionStack.hbs");

/**
 * @constructor
 * @type {module:app/component/CollectionStack}
 */
module.exports = View.extend({
	
	/** @override */
	tagName: "div",
	/** @override */
	className: "stack",
	/** @override */
	template: viewTemplate,
	
	events: {
		"transitionend": function(ev) {
			// console.log("CollectionStack._onTransitionEnd");
			this._renderContent();
		}
	},
	
	// _onTransitionEnd: function(ev) {
	// 	if (this.content === ev.target && this.content.className == "not-current"
	// 			&& ev.propertyName === "opacity") {
	// 		this._renderContent();
	// 		console.log("CollectionStack._onTransitionEnd");
	// 	}
	// },
	
	initialize: function (options) {
		this._enabled = true;
		this._skipTransitions = true;
		this._contentInvalid = true;
		
		options.template && (this.template = options.template);
		this.content = this.el.appendChild(document.createElement("div"));
		
		this.listenTo(this.collection, "select:one select:none", this._onSelectChange);
	},
	
	setEnabled: function(enabled) {
		if (this._enabled !== enabled) {
			this._enabled = enabled;
			this.el.classList.toggle("disabled", !this._enabled);
		}
	},
	
	_onSelectChange: function(item) {
		if (this._renderedItem !== this.collection.selected) {
			this._contentInvalid = true;
			this.render();
		}
	},
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	render: function () {
		if (this._skipTransitions) {
			this._skipTransitions = false;
			this.el.classList.add("skip-transitions");
			setImmediate(function() {
				this.el.classList.remove("skip-transitions");
			}.bind(this));
			this._renderContent();
		} else {
			if (this._contentInvalid) {
				this.content.className = "not-current";
				// console.log("CollectionStack.render", "transition start");
			}
		}
		return this;
	},
	
	_renderContent: function() {
		if (this._contentInvalid) {
			this._contentInvalid = false;
			this._renderedItem = this.collection.selected;
			this.content.innerHTML =
				this._renderedItem? this.template(this._renderedItem.toJSON()): "";
			this.content.className = "current";
		}
	},
});
