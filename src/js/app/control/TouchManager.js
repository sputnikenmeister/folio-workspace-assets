/**
 * @module app/control/TouchManager
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:app/utils/debug/traceElement} */
var SmoothPan = require("utils/touch/SmoothPanRecognizer");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");

/* -------------------------------
/* Static private
/* ------------------------------- */

/**
 * @type {Hammer.Manager}
 */
var instance = null;

function createInstance(el) {
	var recognizers = [];
	var manager = new Hammer.Manager(el);
	
	var hpan = new SmoothPan({
	// var hpan = new Hammer.Pan({
		threshold: Globals.THRESHOLD,
		direction: Hammer.DIRECTION_HORIZONTAL,
	});
	recognizers.push(hpan);
	
	var vpan = new SmoothPan({
		event: "vpan",
		threshold: Globals.THRESHOLD,
		direction: Hammer.DIRECTION_VERTICAL,
	});
	recognizers.push(vpan);
	vpan.requireFailure(hpan);
	
	var tap = new Hammer.Tap({
		// threshold: Globals.THRESHOLD - 1,
		// interval: 50,
		// time: 200,
	});
	recognizers.push(tap);
	tap.recognizeWith(hpan);
	
	manager.add(recognizers);
	return manager;
}

/*https://gist.githubusercontent.com/jtangelder/361052976f044200ea17/raw/f54c2cef78d59da3f38286fad683471e1c976072/PreventGhostClick.js*/

// function	logEvent(message) {
// 	console.log(message, domev.type,
// 		"panSessionOpened: " + panSessionOpened,
// 		"defaultPrevented: " + domev.defaultPrevented
// 	);
// }

var lastTimeStamp = -1;
var panSessionOpened = false;

var touchHandlers = {
	"panstart panend pancancel vpanstart vpanend vpancancel": function(hev) {
		panSessionOpened = !hev.isFinal;
		if (hev.isFinal)
			lastTimeStamp = hev.srcEvent.timeStamp;
	}
};

var captureHandlers = {
	"click": function(domev) {
		if (lastTimeStamp == domev.timeStamp) {
			lastTimeStamp = -1;
			domev.defaultPrevented || domev.preventDefault();
			domev.stopPropagation();
		}
	},
	"dragstart": function(domev) {
		if (domev.target.nodeName == "IMG") {
			domev.defaultPrevented || domev.preventDefault();
		}
	},
	"mouseup": function(domev) {
		panSessionOpened && domev.preventDefault();
	}
};

var bubblingHandlers = {};

/* -------------------------------
/* Static public
/* ------------------------------- */
var TouchManager = {
	
	init: function(target) {
		if (instance === null) {
			instance = createInstance(target);
			
			var eventName, el = instance.element;
			for (eventName in touchHandlers) {
				if (touchHandlers.hasOwnProperty(eventName)) {
					instance.on(eventName, touchHandlers[eventName]);
				}
			}
			for (eventName in captureHandlers) {
				if (captureHandlers.hasOwnProperty(eventName)) {
					el.addEventListener(eventName, captureHandlers[eventName], true);
				}
			}
			for (eventName in bubblingHandlers) {
				if (bubblingHandlers.hasOwnProperty(eventName)) {
					el.addEventListener(eventName, bubblingHandlers[eventName], false);
				}
			}
		} else if (instance.element !== target) {
			console.warn("TouchManager already initialized with another element");
		}
		return instance;
	},
	
	destroy: function() {
		if (instance !== null) {
			var eventName, el = instance.element;
			for (eventName in captureHandlers) {
				if (captureHandlers.hasOwnProperty(eventName)) {
					el.removeEventListener(eventName, captureHandlers[eventName], true);
				}
			}
			for (eventName in bubblingHandlers) {
				if (captureHandlers.hasOwnProperty(eventName)) {
					el.removeEventListener(eventName, bubblingHandlers[eventName], true);
				}
			}
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
