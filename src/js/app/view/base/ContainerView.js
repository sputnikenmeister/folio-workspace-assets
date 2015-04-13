/**
 * @module app/view/base/ContainerView
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/view/base/View} */
var View = require("./View");
/** @type {module:app/helper/TransformHelper} */
var TransformHelper = require("../../helper/TransformHelper");
/** @type {module:app/utils/event/addTransitionEndCommand} */
//var addTransitionCallback = require("../utils/event/addTransitionCallback");

//var CSS_CLEAR_TRANSITIONS = {"transition": "", "-webkit-transition": ""};
//var CSS_REMOVE_TRANSITIONS = {"transition": "none 0s 0s", "-webkit-transition": "none 0s 0s"};

/**
 * @constructor
 * @type {module:app/view/base/ContainerView}
 */
module.exports = View.extend({

	// transforms: TransformHelper(),

	constructor: function(options) {
		this.__initializeContainer();
		View.apply(this, arguments);
	},
	/** @override */
	__initializeContainer: function () {
		this.transforms = new TransformHelper();

		this.transitions = {};
		this.transitions["exiting"] = _.clone(Globals.TRANSIT_EXITING);
		this.transitions["changing"] = _.clone(Globals.TRANSIT_CHANGING);
		this.transitions["entering"] = _.clone(Globals.TRANSIT_ENTERING);
		this.transitions["immediate"] = _.clone(Globals.TRANSIT_IMMEDIATE);

		//this.transition = {};
		//this.transition.easing = Globals.TRANSITION_EASE;
		//this.transition.delay = Globals.TRANSITION_DELAY - 1;
		//this.transition.duration = Globals.TRANSITION_DURATION + 1;
		//this.transition[this.getPrefixedStyle("transform")] = "";
		//this.transition[this.getPrefixedProperty("transform")] = "";
		//this.transition.transform = "";

		//var transformStyle = this.getPrefixedStyle("transform");
		//for (var t in this.transitions) {
		//	this.transitions[t][transformStyle] = "";
		//}
	},

	runTransformTransition: function (targets, transition, useEvent) {
		if (_.isString(targets)) {
			targets = this.el.querySelectorAll(targets);
		}
		if (_.isString(transition)) {
			transition = this.transitions[transition];
		}
		if (targets && targets.length > 0) {
			var i, num, target, styleProp, prop, val, callback, timeout;

			timeout = transition.duration + transition.delay + 500;
			styleProp = this.getPrefixedProperty("transition");
			prop = this.getPrefixedStyle("transform");

			val = prop + " ";
			val += transition.duration/1000 + "s ";
			val += transition.easing + " ";
			val += transition.delay/1000 + "s";

			callback = function(exec, el) {
				if (el.style[styleProp] == val) {
					el.style[styleProp] = "";
				} else {
					console.log("Transition: '" + styleProp + "' has changed from '" + val + "' to '" + el.style[styleProp] + "', leaving as-is.");
				}
			};

			for (i = 0; i < targets.length; ++i) {
				target = targets[i];
				target.style[styleProp] = val;
				if (useEvent) {
					this.onTransitionEnd(target, prop, callback, timeout);
				}
			}
			if (!useEvent) {
				window.setTimeout(function() {
					for (i = 0; i < targets.length; ++i) {
						callback(true, targets[i]);
					}
				}, timeout);
			}
		}
	},

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

	enableTransitions: function(el) {
		el.style[this.getPrefixedProperty("transition")] = "";
		//this.$el.removeClass("skip-transitions");
		//view.$el.css(CSS_CLEAR_TRANSITIONS);
		//view.$wrapper.css(CSS_CLEAR_TRANSITIONS);
	},

	disableTransitions: function(el) {
		el.style[this.getPrefixedProperty("transition")] = "none 0s 0s";
		//this.$el.addClass("skip-transitions");
		//view.$el.css(CSS_REMOVE_TRANSITIONS);
		//view.$wrapper.css(CSS_REMOVE_TRANSITIONS);
	},
});
