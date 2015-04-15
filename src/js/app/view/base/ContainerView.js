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

	/** @override */
	constructor: function(options) {
		this.transforms = new TransformHelper();
		View.apply(this, arguments);
	},

	runTransformTransition: function (targets, transition, useEvent) {
		if (_.isString(targets)) {
			targets = this.el.querySelectorAll(targets);
		}
		// if (_.isString(transition)) {
		// 	transition = this.transitions[transition];
		// }
		if (targets && targets.length > 0) {
			var i, num, target, transitionProp, prop, val, callback, timeout;

			timeout = transition.duration + transition.delay + 500;
			transitionProp = this.getPrefixedProperty("transition");
			prop = this.getPrefixedStyle("transform");

			val = prop + " ";
			val += transition.duration/1000 + "s ";
			val += transition.easing + " ";
			val += transition.delay/1000 + "s";

			callback = function(exec, el) {
				if (el.style[transitionProp] == val) {
					el.style[transitionProp] = "";
				} else {
					console.log("runTransformTransition: '" + transitionProp + "' has changed from '" +
						val + "' to '" + el.style[transitionProp] + "', leaving as-is.");
				}
			};

			for (i = 0; i < targets.length; ++i) {
				target = targets[i];
				target.style[transitionProp] = val;
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
