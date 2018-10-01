/**
 * @module app/view/base/TouchManager
 */

/** @type {module:app/control/Globals} */
const Globals = require("app/control/Globals");
/** @type {module:hammerjs} */
const Hammer = require("hammerjs");
// /** @type {module:hammerjs.Tap} */
// const Tap = Hammer.Tap;
/** @type {module:utils/touch/SmoothPanRecognizer} */
const Pan = require("utils/touch/SmoothPanRecognizer");
/** @type {module:hammerjs.Pan} */
// const Pan = Hammer.Pan;

/* -------------------------------
/* Static private
/* ------------------------------- */

/**
 * @param el HTMLElement
 * @return {Hammer.Manager}
 */
function createInstance(el) {
	let manager = new Hammer.Manager(el);
	// manager.set({ domevents: true });

	// let tap = new Hammer.Tap({
	// 	threshold: Globals.PAN_THRESHOLD - 1
	// });
	// manager.add(tap);
	let hpan = new Pan({
		event: "hpan",
		direction: Hammer.DIRECTION_HORIZONTAL,
		threshold: Globals.PAN_THRESHOLD,
		// touchAction: "pan-y",
	});
	manager.add(hpan);

	// let vpan = new Pan({
	// 	event: "vpan",
	// 	direction: Hammer.DIRECTION_VERTICAL,
	// 	// threshold: Globals.PAN_THRESHOLD,
	// 	// touchAction: "pan-x",
	// });
	// manager.add(vpan);
	// vpan.requireFailure(hpan);

	return manager;
}

/* -------------------------------
 * hammerjs fixup handlers
 * ------------------------------- */

/* eslint-disable no-unused-vars */
const PANEND_THRES_MS = 300; // millisecs
const PANEND_THRES_PX = 25; // pixels
const UP_EVENT = window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup";

let touchHandlers = {};
let captureHandlers = {};
let bubblingHandlers = {};

/*https://gist.githubusercontent.com/jtangelder/361052976f044200ea17/raw/f54c2cef78d59da3f38286fad683471e1c976072/PreventGhostClick.js*/
var lastTimeStamp = NaN;
var panSessionOpened = false;

let saveTimeStamp = function(hev) {
	panSessionOpened = !hev.isFinal;
	if (hev.isFinal) {
		lastTimeStamp = hev.srcEvent.timeStamp;
	}
	if (DEBUG) {
		logPanEvent(hev);
	}
};

// let preventSrcEvent = function(hev) {
// 	//console.log(hev.type, "preventDefault");
// 	hev.srcEvent.preventDefault();
// };

// let preventWhilePanning = function(domev) {
// 	panSessionOpened && domev.preventDefault();
// };

// let preventWhileNotPanning = function(domev) {
// 	!panSessionOpened && domev.preventDefault();
// };

let stopEventAfterPan = function(domev) {
	if ((domev.timeStamp - lastTimeStamp) < PANEND_THRES_MS) {
		// domev.defaultPrevented ||
		domev.preventDefault();
		domev.stopPropagation();
	}
	if (DEBUG) {
		logEvent(domev, (domev.timeStamp - lastTimeStamp).toFixed(3));
	}
	lastTimeStamp = NaN;
};

touchHandlers["hpanstart hpanend hpancancel"] = saveTimeStamp;
// touchHandlers["vpanstart vpanend vpancancel"] = saveTimeStamp;
// touchHandlers["hpanmove hpanend hpancancel"] = preventSrcEvent;
// touchHandlers["vpanmove vpanend vpancancel"] = preventSrcEvent;

captureHandlers["click"] = stopEventAfterPan;
// bubblingHandlers["click"] = stopEventAfterPan;

// touchHandlers[[
// 	"vpanstart", "vpanend", "vpancancel", "vpanmove",
// 	"hpanstart", "hpanend", "hpancancel", "hpanmove"
// ].join(" ")] = logHammerEvent;

/* -------------------------------
/* DOM event handlers
/* ------------------------------- */


// captureHandlers[UP_EVENT] = preventWhilePanning;
// captureHandlers["touchmove"] = captureHandlers["mousemove"] = logDOMEvent;

if (DEBUG) {
	var logPanEvent = function(hev) {
		logEvent(hev.srcEvent, `[${hev.type}]`);
	};
	var logEvent = function(domev, msg) {
		let msgs = [];
		if (domev.defaultPrevented)
			msgs.push("prevented");
		if (msg)
			msgs.push(msg);
		msgs.push(`${panSessionOpened ? "panning" : "pan ended"} ${(domev.timeStamp - lastTimeStamp).toFixed(3)}`);
		console.log("TouchManager %s [%s]",
			domev.timeStamp.toFixed(3),
			domev.type,
			msgs.join(", ")
		);
	};
}

/* eslint-enable no-unsused-vars */

// -------------------------------
//
// -------------------------------

function addHandlers() {
	let eventName;
	const el = instance.element;
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
	let eventName;
	const el = instance.element;
	for (eventName in captureHandlers)
		if (captureHandlers.hasOwnProperty(eventName))
			el.removeEventListener(eventName, captureHandlers[eventName], true);
	for (eventName in bubblingHandlers)
		if (captureHandlers.hasOwnProperty(eventName))
			el.removeEventListener(eventName, bubblingHandlers[eventName], true);
	// document.removeEventListener("touchmove", preventWhileNotPanning, false);
}

/** @type {Hammer.Manager} */
let instance = null;

/* -------------------------------
/* Static public
/* ------------------------------- */

let TouchManager = {
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
