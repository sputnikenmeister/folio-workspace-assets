/**
 * @module app/view/DebugToolbar
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
/** @type {module:cookies-js} */
var Cookies = require("cookies-js");

var DebugToolbar = Backbone.View.extend({
	initialize: function (options) {
		var $backendEl = this.$("#edit-backend");
		var $container = Backbone.$("#container");

		Cookies.defaults = {
			domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
		};

		$backendEl.text("Edit");
		this.listenTo(this.collection, {
			"select:one": function(model) {
				$backendEl.attr("href", Globals.APP_ROOT + "symphony/publish/bundles/edit/" + model.id);
			},
			"select:none": function() {
				$backendEl.attr("href", Globals.APP_ROOT + "symphony/publish/bundles/");
			}
		});
		this.initializeToggle("debug-grid", this.$("#show-grid"), $container);
		this.initializeToggle("debug-blocks", this.$("#show-blocks"), $container);
	},

	initializeToggle: function (className, toggleEl, targetEl) {
		toggleEl.on("click", function (ev) {
			targetEl.toggleClass(className);
			Cookies.set(className, targetEl.hasClass(className)? "true": "");
		});
		if (Cookies.get(className)) {
			targetEl.addClass(className);
		}
	}
});

module.exports = DebugToolbar;
