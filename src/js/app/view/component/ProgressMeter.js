/**
 * @module app/view/component/ProgressMeter
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @private */
var _modelImpl = Backbone.Model.extend({
	defaults: {
		value: 0,
		total: 1
	}
});

module.exports = Backbone.View.extend({
	
	/** @type {string} */
	className: "progress-meter",
	/** @type {Function} */
	model: _modelImpl,
	
	/** @override */
	initialize: function (options) {
		this._value = options.value || this.model.get("value") || 0;
		this._total = options.total || this.model.get("total") || 1;
		this._valueChanged = true;
		this.listenTo(this.model, "change", function() {
			this.valueTo(this.model.get("value"));
		});
	},
	
	valueTo: function (value, duration) {
		this._valueChanged = true;
		this.render();
	},
	
	render: function () {
		if (this._valueChanged) {
			this._valueChanged = false;
			
			// make it base 100, then truncate decimals
			var val = (this._value / this._total * 100) | 0;
			this.el.textContent = val + "%";
		}
		return this;
	},
}, {
	/** @type {Function} */
	Model: _modelImpl,
});
