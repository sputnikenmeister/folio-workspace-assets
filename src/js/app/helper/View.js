/**
 * @module app/helper/View
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {Object} */
var _viewsByCid = {};

/**
 * @constructor
 * @type {module:app/helper/View}
 */
var View = Backbone.View.extend({
	constructor: function(options) {
		if (options && options.className && this.className) {
			options.className += " " + _.result(this, 'className');
		}
		Backbone.View.apply(this, arguments);
		_viewsByCid[this.cid] = this;
	},

	remove: function() {
		delete _viewsByCid[this.cid];
		return Backbone.View.prototype.remove.apply(this, arguments);
	},

    setElement: function(element, delegate) {
		// setElement always initializes this.el,
		// so this.el has to be checked before calling super
		if (this.el) {
			Backbone.View.prototype.setElement.apply(this, arguments);
			this.$el.addClass(_.result(this, 'className'));
		} else {
			Backbone.View.prototype.setElement.apply(this, arguments);
		}
		return this;
	},
},{
	findByElement: function(element) {
		for (var cid in _viewsByCid) {
			if (_viewsByCid[cid].el === element) {
				return _viewsByCid[cid];
			}
		}
		return void 0;
	}
});

module.exports = View;
