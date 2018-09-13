/**
 * @module app/view/base/TouchManager
 */

// /** @type {module:underscore} */
// var _ = require("underscore");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
// /** @type {module:hammerjs.Tap} */
// var Tap = Hammer.Tap;
// /** @type {module:utils/touch/SmoothPanRecognizer} */
// var Pan = require("utils/touch/SmoothPanRecognizer");
/** @type {module:hammerjs.Pan} */
var Pan = Hammer.Pan;

/* -------------------------------
/* Static private
/* ------------------------------- */

/**
 * @param el HTMLElement
 * @return {Hammer.Manager}
 */
function createInstance(el) {
	// var tap = new Hammer.Tap({
	// 	threshold: Globals.PAN_THRESHOLD - 1
	// });
	var hpan = new Pan({
		event: "hpan",
		direction: Hammer.DIRECTION_HORIZONTAL,
		// threshold: Globals.PAN_THRESHOLD,
		// touchAction: "pan-y",
	});
	// var vpan = new Pan({
	// 	event: "vpan",
	// 	direction: Hammer.DIRECTION_VERTICAL,
	// 	// threshold: Globals.PAN_THRESHOLD,
	// 	// touchAction: "pan-x",
	// });

	var manager = new Hammer.Manager(el);
	// manager.set({ domevents: true });
	manager.add([hpan]);
	// manager.add([hpan, vpan]);
	// manager.add([tap, hpan, vpan]);
	// vpan.requireFailure(hpan);
	return manager;
}

/*https://gist.githubusercontent.com/jtangelder/361052976f044200ea17/raw/f54c2cef78d59da3f38286fad683471e1c976072/PreventGhostClick.js*/

// function	logEvent(message) {
// 	console.log(message, domev.type,
// 		"panSessionOpened: " + panSessionOpened,
// 		"defaultPrevented: " + domev.defaultPrevented
// 	);
// }

var touchHandlers = {};
var captureHandlers = {};
var bubblingHandlers = {};

// var lastTimeStamp = -1;
// var panSessionOpened = false;
// var upEventName = window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup";
//
// touchHandlers["vpanstart vpanend vpancancel"] =
// 	touchHandlers["hpanstart hpanend hpancancel"] = function(hev) {
// 		// console.log("TouchManager:[%s]", hev.srcEvent.type);
// 		panSessionOpened = !hev.isFinal;
// 		if (hev.isFinal)
// 			lastTimeStamp = hev.srcEvent.timeStamp;
// 	};
// touchHandlers["hammer.input tap vpanmove hpanmove"] = function(hev) {
// 	console.log("TouchManager:[%s -> %s]", hev.srcEvent.type, hev.type);
// };
//
// var preventWhilePanning = function(domev) {
// 	panSessionOpened && domev.preventDefault();
// };
// var preventWhileNotPanning = function(domev) {
// 	!panSessionOpened && domev.preventDefault();
// };
// captureHandlers["click"] = function(domev) {
// 	if (lastTimeStamp == domev.timeStamp) {
// 		lastTimeStamp = -1;
// 		domev.defaultPrevented || domev.preventDefault();
// 		// domev.stopPropagation();
// 	}
// };
// captureHandlers[upEventName] = preventWhilePanning;

// captureHandlers["dragstart"] = function(domev) {
// 	if (domev.target.nodeName == "IMG") {
// 		domev.defaultPrevented || domev.preventDefault();
// 	}
// };


// -------------------------------
//
// -------------------------------

function addHandlers() {
	var eventName, el = instance.element;
	for (eventName in touchHandlers)
		if (touchHandlers.hasOwnProperty(eventName))
			instance.on(eventName, touchHandlers[eventName]);
	for (eventName in captureHandlers)
		if (captureHandlers.hasOwnProperty(eventName))
			el.addEventListener(eventName, captureHandlers[eventName], true);
	for (eventName in bubblingHandlers)
		if (bubblingHandlers.hasOwnProperty(eventName))
			el.addEventListener(eventName, bubblingHandlers[eventName], false);
	// document.addEventListener("touchmove", preventWhileNotPanning, false);
}

function removeHandlers() {
	var eventName, el = instance.element;
	for (eventName in captureHandlers)
		if (captureHandlers.hasOwnProperty(eventName))
			el.removeEventListener(eventName, captureHandlers[eventName], true);
	for (eventName in bubblingHandlers)
		if (captureHandlers.hasOwnProperty(eventName))
			el.removeEventListener(eventName, bubblingHandlers[eventName], true);
	// document.removeEventListener("touchmove", preventWhileNotPanning, false);
}

/** @type {Hammer.Manager} */
var instance = null;

/* -------------------------------
/* Static public
/* ------------------------------- */

var TouchManager = {
	init: function(target) {
		if (instance === null) {
			instance = createInstance(target);
			addHandlers();
		} else if (instance.element !== target) {
			console.warn("TouchManager already initialized with another element");
		}
		return instance;
	},

	destroy: function() {
		if (instance !== null) {
			removeHandlers();
			instance.destroy();
			instance = null;
		} else {
			console.warn("no instance to destroy");
		}
	},

	getInstance: function() {
		if (instance === null) {
			console.error("TouchManager has not been initialized");
		}
		return instance;
	}
};

module.exports = TouchManager;

/*
// alt syntax
function createInstance(el) {
	return new Hammer(el, {
		recognizers: [
			[Tap],
			[Pan, {
				event: 'hpan',
				direction: Hammer.DIRECTION_HORIZONTAL,
				threshold: Globals.THRESHOLD
			}],
			[Pan, {
				event: 'vpan',
				direction: Hammer.DIRECTION_VERTICAL,
				threshold: Globals.THRESHOLD
			}, ['hpan']]
		]
	});
}
*/
