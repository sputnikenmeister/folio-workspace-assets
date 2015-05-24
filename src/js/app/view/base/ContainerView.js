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
		this.transitions = [];
		this.transforms = new TransformHelper();
		View.apply(this, arguments);
	},

	runTransformTransition: function(targets, transition, useEvent) {
		this.transforms.runTransition(targets, transition);
	},

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

	enableTransitions: function(el) {
		this.transforms.enableTransitions(el);
	},

	disableTransitions: function(el) {
		this.transforms.disableTransitions(el);
	},

	/* -------------------------------
	 * old
	 * ------------------------------- */

	/*
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

	runTransformTransition: function (targets, transition, useEvent) {
		if (!_.isBoolean(useEvent)) {
			useEvent = false;
		}
		if (!_.isArray(targets)) {
			if (_.isString(targets)) {
				targets = this.el.querySelectorAll(targets);
			} else {
				targets = [targets];
			}
		}
		// if (_.isString(transition)) {
		// 	transition = this.transitions[transition];
		// }
		if (targets && targets.length > 0) {
			var transitionProp, transformProp, val, callback, timeout;

			timeout = transition.duration + transition.delay + 300;
			transitionProp = this.getPrefixedProperty("transition");
			transformProp = this.getPrefixedStyle("transform");

			val = transformProp + " ";
			val += transition.duration/1000 + "s ";
			val += transition.easing + " ";
			val += transition.delay/1000 + "s";

			callback = _.bind(function(exec, target) {
				var idx2 = this.transitions.indexOf(target);
				if (idx2 != -1) {
					this.transitions.splice(idx2, 1);
				} else {
					console.warn("runTransformTransition > callback: element already removed",
						target.id || target.className);
				}

				// target.classList.remove(transition.className);
				if (target.style[transitionProp] == val) {
					target.style[transitionProp] = "";
					// console.log("runTransformTransition: clearing '" + transitionProp + "'");
				} else {
					console.log("runTransformTransition: '" + transitionProp + "' has changed from '" +
						val + "' to '" + target.style[transitionProp] + "', leaving as-is.",
						target.id || target.className);
				}
			}, this);

			var i, num, idx1, target;

			for (i = 0; i < targets.length; ++i) {
				target = targets[i];
				idx1 = this.transitions.indexOf(target);
				if (idx1 != -1) {
					console.warn("runTransformTransition: element already transitioning",
						target.id || target.className);
				} else {
					idx1 = this.transitions.length;
					this.transitions[idx1] = target;
				}

				// target.classList.add(transition.className);
				target.style[transitionProp] = val;
				if (useEvent) {
					this.onTransitionEnd(target, transformProp, callback, timeout);
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
	*/
});
