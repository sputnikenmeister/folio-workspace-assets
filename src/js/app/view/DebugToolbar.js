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
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:cookies-js} */
var Cookies = require("cookies-js");

/** @type {string} */
// var viewTemplate = require("./template/DebugToolbar.tpl");

var DebugToolbar = Backbone.View.extend({
	/** @override */
	tagName: "ul",
	/** @override */
	className: "toolbar",
	/** @override */
	template: require("./template/DebugToolbar.tpl"),//viewTemplate,
	
	events: {
		"click dt.debug-group": function(ev) {
			this.$debugGroup.css("display", "none");
			this.$classesGroup.css("display", "");
		},
		"click dt.classes-group": function(ev) {
			this.$debugGroup.css("display", "");
			this.$classesGroup.css("display", "none");
		},
	},

	initialize: function (options) {
		Cookies.defaults = {
			domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
		};
		
		this.$el.html(this.template({approot: Globals.APP_ROOT}));
		
		/* .debug-group
		 * - - - - - - - - - - - - - - - - */
		this.$debugGroup = this.$(".debug-group");
		
		var $showGridEl = this.$("#show-grid");
		var $showBlocksEl = this.$("#show-blocks");
		var $container = $("#container");
		this.initializeToggle("debug-grid", $showGridEl, $container);
		this.initializeToggle("debug-blocks", $showBlocksEl, $container);
		
		var $backendEl = this.$("#edit-backend");
		this.listenTo(this.collection, {
			"select:one": function(model) {
				$backendEl.attr("href", Globals.APP_ROOT + "symphony/publish/bundles/edit/" + model.id);
			},
			"select:none": function() {
				$backendEl.attr("href", Globals.APP_ROOT + "symphony/publish/bundles/");
			}
		});
		
		// var $viewSourceEl = this.$("#source");
		
		/* .classes-group
		 * - - - - - - - - - - - - - - - - */
		this.$classesGroup = this.$(".classes-group");
		
		var $documentClassesEl = this.$("#document-classes");
		var $bodyClassesEl = this.$("#body-classes");
		var updateClassesGroup = function () {
			$documentClassesEl.text(document.documentElement.className);
			$bodyClassesEl.text(document.body.className);
		};
		$(window).on("resize orientationchange", updateClassesGroup);
		this.listenTo(controller, "change:after", updateClassesGroup);
		updateClassesGroup();
		
		/* show dt.debug-group | dt.classes-group
		 * - - - - - - - - - - - - - - - - */
		this.events["click dt.classes-group"].call(this, void 0);
	},

	initializeToggle: function (className, toggleEl, targetEl) {
		toggleEl.on("click", function (ev) {
			targetEl.toggleClass(className);
			Cookies.set(className, targetEl.hasClass(className)? "true": "");
		});
		if (Cookies.get(className)) {
			targetEl.addClass(className);
		}
	},
});

module.exports = DebugToolbar;
