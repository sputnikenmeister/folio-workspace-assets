/**
 * @module app/control/TouchElement
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");

var hammerInstance = null;

module.exports = {
	init: function(el) {
		if (!hammerInstance) {
			hammerInstance = new Hammer.Manager(el);
			hammerInstance.add(new Hammer.Pan({
//				direction: this.direction,
				threshold: 15,
			}));
		} else {
			console.error("cannot initialize TouchElement more than once");
		}
	},
	destroy: function() {
		if (hammerInstance) {
			hammerInstance.destroy();
			hammerInstance = null;
		} else {
			console.error("no TouchElement instance to destroy");
		}
	},
	getInstance: function() {
		return hammerInstance;
	}
};
