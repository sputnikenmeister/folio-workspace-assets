/**
 * @module app/view/DebugToolbar
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;

/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
/** @type {module:cookies-js} */
var Cookies = require("cookies-js");

/** @type {string} */
var viewTemplate = require("./template/DebugToolbar.tpl");

var DebugToolbar = Backbone.View.extend({

	/** @override */
	tagName: "ul",
	/** @override */
	className: "toolbar",
	/** @override */
	template: viewTemplate,

	initialize: function (options) {
		var $container, $backendEl, $viewSourceEl, $showGridEl, $showBlocksEl;

		this.$el.html(this.template({approot: Globals.APP_ROOT}));

		$backendEl = this.$("#edit-backend");
		$showBlocksEl = this.$("#show-blocks");
		$showGridEl = this.$("#show-grid");
		$viewSourceEl = this.$("#source");

		$backendEl.text("Edit");
		this.listenTo(this.collection, {
			"select:one": function(model) {
				$backendEl.attr("href", Globals.APP_ROOT + "symphony/publish/bundles/edit/" + model.id);
			},
			"select:none": function() {
				$backendEl.attr("href", Globals.APP_ROOT + "symphony/publish/bundles/");
			}
		});

		Cookies.defaults = {
			domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
		};

		$container = Backbone.$("#container");
		this.initializeToggle("debug-grid", $showGridEl, $container);
		this.initializeToggle("debug-blocks", $showBlocksEl, $container);
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
