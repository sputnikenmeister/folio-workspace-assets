/**
 * @module app/helper/HammerCarousel
 * @requires module:hammerjs
 */

/** @type {module:hammerjs} */
var Hammer = require("hammerjs");

/** @private */
function dirProp(direction, hProp, vProp) {
	return (direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
}

/**
 * Carousel
 * @param container
 * @param direction
 * @constructor
 */
function HammerCarousel(container, direction) {
	this.container = container;
	this.direction = direction;
	this.transformProp = Hammer.prefixed(this.container, "transform");

	this.panes = Array.prototype.slice.call(this.container.children, 0);
	this.containerSize = (this.direction & Hammer.DIRECTION_HORIZONTAL)?
		this.container.offsetWidth : this.container.offsetHeight;

	this.currentIndex = 0;

	this.hammer = new Hammer.Manager(this.container);
	this.hammer.add(new Hammer.Pan({
		direction: this.direction,
		threshold: 10
	}));
	this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(this.onPan, this));

	this.show(this.currentIndex);
}

HammerCarousel.prototype = {
	/**
	 * show a pane
	 * @param {Number} showIndex
	 * @param {Number} [percent] percentage visible
	 * @param {Boolean} [animate]
	 */
	show: function (showIndex, percent, animate) {
		showIndex = Math.max(0, Math.min(showIndex, this.panes.length - 1));
		percent = percent || 0;

		var className = this.container.className;
		if (animate) {
			if (className.indexOf("animate") === -1) {
				this.container.className += " animate";
			}
		} else {
			if (className.indexOf("animate") !== -1) {
				this.container.className = className.replace("animate", "").trim();
			}
		}

		var paneIndex, pos, translate;
		for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {
			pos = (this.containerSize / 100) * (((paneIndex - showIndex) * 100) + percent);
			this.panes[paneIndex].style[this.transformProp] = (this.direction & Hammer.DIRECTION_HORIZONTAL)?
				"translate3d(" + pos + "px, 0, 0)" : "translate3d(0, " + pos + "px, 0)";
		}

		this.currentIndex = showIndex;
	},

	/**
	 * handle pan
	 * @param {Object} ev
	 */
	onPan: function (ev) {
		var delta = (this.direction & Hammer.DIRECTION_HORIZONTAL)? ev.deltaX: ev.deltaY;
		var percent = (100 / this.containerSize) * delta;
		var animate = false;

		if (ev.type == "panend" || ev.type == "pancancel") {
			if (Math.abs(percent) > 20 && ev.type == "panend") {
				this.currentIndex += (percent < 0) ? 1 : -1;
			}
			percent = 0;
			animate = true;
		}

		this.show(this.currentIndex, percent, animate);
	}
};

module.exports = HammerCarousel;