/**
/* @module app/control/Globals
/*/
/** @type {module:underscore} */
var _ = require("underscore");

module.exports = (function() {
	// reusable vars
	var o, s, so;
	// global hash
	var g = {};
	// SASS <--> JS shared hash
	var sass = require("../../../sass/variables.json");

	// JUNK FIRST: Some app-wide defaults
	// - - - - - - - - - - - - - - - - -
	g.VPAN_DRAG = 0.95; // as factor of pointer delta
	g.HPAN_OUT_DRAG = 0.4; // factor
	g.VPAN_OUT_DRAG = 0.1; // factor
	g.PAN_THRESHOLD = 15; // px
	g.COLLAPSE_THRESHOLD = 75; // px
	g.COLLAPSE_OFFSET = parseInt(sass.temp["collapse_offset"]);

	// breakpoints
	// - - - - - - - - - - - - - - - - -
	g.BREAKPOINTS = {};
	for (s in sass.breakpoints) {
		o = sass.breakpoints[s];
		/*if (Array.isArray(o)) {
			g.BREAKPOINTS[s] = Object.defineProperties({}, {
				"matches": {
					get: _.partial(_.some, o.map(window.matchMedia), _.property("matches"))
				},
				"media": {
					value: o.join(", ")
				},
				"queries": {
					value: o.map(window.matchMedia)
				},
			});
		} else {
			g.BREAKPOINTS[s] = window.matchMedia(o);
		}*/
		o = Array.isArray(o) ? o.join(", ") : o;
		o = o.replace(/[\'\"]/g, "");
		o = window.matchMedia(o);
		o.className = s;
		g.BREAKPOINTS[s] = o;
	}
	if (DEBUG) {
		console.group("Breakpoints");
		for (s in g.BREAKPOINTS) {
			// console.log("%s: %o %o", s, g.BREAKPOINTS[s], sass.breakpoints[s] + '');
			console.log("%s: %o", s, g.BREAKPOINTS[s].media);
		}
		console.groupEnd();
	}

	// base colors, dimensions
	// - - - - - - - - - - - - - - - - -
	g.DEFAULT_COLORS = _.clone(sass.default_colors);
	g.HORIZONTAL_STEP = parseFloat(sass.units["hu_px"]);
	g.VERTICAL_STEP = parseFloat(sass.units["vu_px"]);


	// paths, networking
	// - - - - - - - - - - - - - - - - -
	// var toAbsoluteURL = (function() {
	// 	var a = null;
	// 	return function(url) {
	// 		a = a || document.createElement('a');
	// 		a.href = url;
	// 		return a.href;
	// 	};
	// })();
	// g.APP_ROOT = toAbsoluteURL(window.approot);
	// g.MEDIA_DIR = toAbsoluteURL(window.mediadir);

	g.APP_ROOT = window.approot;
	g.MEDIA_DIR = window.mediadir;

	delete window.approot;
	delete window.mediadir;

	// hardcoded font data
	// - - - - - - - - - - - - - - - - -
	g.FONT_METRICS = {
		"Franklin Gothic FS": {
			"unitsPerEm": 1000,
			"ascent": 827,
			"descent": -173
		},
		"ITCFranklinGothicStd": {
			"unitsPerEm": 1000,
			"ascent": 686,
			"descent": -314
		},
		"FolioFigures": {
			"unitsPerEm": 1024,
			"ascent": 939,
			"descent": -256
		},
	};

	g.PAUSE_CHAR = String.fromCharCode(0x23F8);
	g.PLAY_CHAR = String.fromCharCode(0x23F5);
	g.STOP_CHAR = String.fromCharCode(0x23F9);

	// translate common template

	g.TRANSLATE_TEMPLATE = function(x, y) {
		return "translate(" + x + "px, " + y + "px)";
		// return "translate3d(" + x + "px, " + y + "px ,0px)";
	};
	// timing, easing
	// - - - - - - - - - - - - - - - - -
	var ease = g.TRANSITION_EASE = sass.transitions["ease"];
	var duration = g.TRANSITION_DURATION = parseFloat(sass.transitions["duration_ms"]);
	var delayInterval = g.TRANSITION_DELAY_INTERVAL = parseFloat(sass.transitions["delay_interval_ms"]);
	var minDelay = g.TRANSITION_MIN_DELAY = parseFloat(sass.transitions["min_delay_ms"]);
	var delay = g.TRANSITION_DELAY = g.TRANSITION_DURATION + g.TRANSITION_DELAY_INTERVAL;

	// css transition presets
	// TODO: get rid of this
	// - - - - - - - - - - - - - - - - -

	// var tx = function(txo, durationCount, delayCount) {
	// 	txo.duration = (duration * durationCount)
	// 		+ (delayInterval * (durationCount - 1));
	// 	txo.delay = (delay * delayCount) + minDelay;
	// };

	o = {};

	o.NONE = {
		delay: 0,
		duration: 0,
		easing: "step-start"
	};
	o.NOW = {
		delay: 0,
		duration: duration,
		easing: ease
	};
	o.UNSET = _.defaults({
		cssText: ""
	}, o.NONE);

	var txAligned = _.defaults({
		duration: duration - minDelay
	}, o.NOW);
	o.FIRST = _.defaults({
		delay: delay * 0.0 + minDelay
	}, txAligned);
	o.BETWEEN = _.defaults({
		delay: delay * 1.0 + minDelay
	}, txAligned);
	o.LAST = _.defaults({
		delay: delay * 2.0 + minDelay
	}, txAligned);
	o.AFTER = _.defaults({
		delay: delay * 2.0 + minDelay
	}, txAligned);

	o.BETWEEN_EARLY = _.defaults({
		delay: delay * 1.0 + minDelay - 60
	}, txAligned);
	o.BETWEEN_LATE = _.defaults({
		delay: delay * 1.0 + minDelay + 60
	}, txAligned);

	o.FIRST_LATE = _.defaults({
		delay: delay * 0.5 + minDelay
	}, txAligned);
	o.LAST_EARLY = _.defaults({
		delay: delay * 1.5 + minDelay
	}, txAligned);
	// o.FIRST_LATE = 		_.defaults({delay: txDelay*0.0 + txMinDelay*2}, txAligned);
	// o.LAST_EARLY = 		_.defaults({delay: txDelay*2.0 + txMinDelay*0}, txAligned);
	// o.AFTER = 			_.defaults({delay: txDelay*2.0 + txMinDelay}, txAligned);

	console.groupCollapsed("Transitions");
	for (s in o) {
		so = o[s];
		so.name = s;
		so.className = "tx-" + s.replace("_", "-").toLowerCase();
		if (!so.hasOwnProperty("cssText")) {
			so.cssText = so.duration / 1000 + "s " + so.easing + " " + so.delay / 1000 + "s";
		}
		console.log("%s: %s", so.name, so.cssText);
	}
	console.groupEnd();
	g.transitions = o;

	return g;
}());