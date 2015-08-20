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
		this._valueInvalid = true;
		this.listenTo(this.model, "change", function() {
			this._valueInvalid = true;
			this.render();
		});
	},
	
	render: function () {
		if (this._valueInvalid) {
			this._valueInvalid = false;
			var val = this.model.get("value") / this.model.get("total");
			val = (val * 100) | 0; // make it base 100, then truncate decimals
			this.el.textContent = val + "%";
		}
		return this;
	},
}, {
	/** @type {Function} */
	Model: _modelImpl,
});
