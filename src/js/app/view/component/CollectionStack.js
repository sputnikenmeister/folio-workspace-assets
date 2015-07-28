/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {Function} */
var transitionEnd = require("../../../utils/event/transitionEnd");
/** @type {Function} */
var setImmediate = require("../../../utils/setImmediate");

/** @type {string} */
var viewTemplate = require("./CollectionStack.tpl");

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

	initialize: function (options) {
		_.bindAll(this, "_onTransitionEnd");
		
		this._skipTransitions = true;
		this.content = this.el.appendChild(document.createElement("div"));
		options.template && (this.template = options.template);
		
		this.content.addEventListener(transitionEnd, this._onTransitionEnd, false);
		this.listenTo(this, "view:remove", function() {
			this.content.removeEventListener(transitionEnd, this._onTransitionEnd, false);
		});
		this.listenTo(this.collection, "select:one select:none", this.render);
	},
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	render: function () {
		if (this._renderedItem === this.collection.selected) {
			return;
		}
		this.el.classList.toggle("skip-transitions", this._skipTransitions);
		if (this._skipTransitions) {
			this._skipTransitions = false;
			this._renderContent();
		} else {
			this.content.className = "not-current";
		}
		return this;
	},
	
	_renderContent: function() {
		this._renderedItem = this.collection.selected;
		this.content.innerHTML = this._renderedItem? this.template(this._renderedItem.toJSON()): "";
		this.content.className = "current";
	},
	
	_onTransitionEnd: function(ev) {
		if (ev.propertyName === "opacity" && ev.target === this.content) {
			if (this.content.className == "not-current") {
				this._renderContent();
			}
		}
	},
});
