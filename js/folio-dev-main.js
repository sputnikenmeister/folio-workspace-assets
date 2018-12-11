(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/App.js":[function(require,module,exports){
(function (GIT_REV,_){
/**
 * @module app/App
 */
"use strict";

console.info("Portfolio App started GIT:".concat(GIT_REV)); // if (!DEBUG) {
// 	window.addEventListener("error", function(ev) {
// 		console.error("Uncaught Error", ev);
// 	});
// }

/*
var features = [
	'default-3.4',
	// 'Date.now',
	// 'Element.prototype.classList',
	// 'Element.prototype.matches',
	// 'Event.hashchange',
	// 'Function.prototype.bind',
	'IntersectionObserver',
	'IntersectionObserverEntry',
	'Math.sign',
	'MutationObserver',
	// 'Object.create',
	// 'Object.defineProperties',
	// 'Object.defineProperty',
	// 'Object.keys',
	'Promise',
	'Promise.prototype.finally',
	'devicePixelRatio',
	'document.head',
	// 'document.querySelector',
	// 'document.visibilityState',
	'getComputedStyle',
	'matchMedia',
	// 'requestAnimationFrame',
	'setImmediate',
];

if (features.length) {
  var s = document.createElement('script');
  s.src = 'https://cdn.polyfill.io/v2/polyfill.min.js?features='+features.join(',')+'&callback=main';
  s.async = true;
  document.head.appendChild(s);
} else {
	main();
}
function main() {
	console.log('Now to do the cool stuff...');
}

if (DEBUG) {
	require("Modernizr");
}
require("setimmediate");
require("es6-promise/auto");
require("classlist-polyfill");
require("raf-polyfill");
require("matches-polyfill");
require("fullscreen-polyfill");
require("math-sign-polyfill");
require("mutation-observer");
// require("path2d-polyfill");
*/

require("backbone").$ = require("backbone.native");

require("backbone.babysitter");

require("Backbone.Mutators");

require("hammerjs"); // document.addEventListener('DOMContentLoaded', function(ev) {
// 	console.log("%s:[event %s]", ev.target, ev.type);
// });


window.addEventListener("load", function (ev) {
  console.log("%s:[event %s]", ev.target, ev.type); // process bootstrap data, let errors go up the stack

  try {
    require("app/model/helper/bootstrap")(window.bootstrap);
  } catch (err) {
    var el = document.querySelector(".app");
    el.classList.remove("app-initial");
    el.classList.add("app-error");
    throw new Error("bootstrap data error (" + err.message + ")", err.fileName, err.lineNumber);
  } finally {
    // detele global var
    delete window.bootstrap;
  }

  require("app/view/template/_helpers");
  /** @type {module:app/view/helper/createColorStyleSheet} */


  require("app/view/helper/createColorStyleSheet").call();
  /** @type {module:app/view/AppView} */


  var AppView = require("app/view/AppView"); // var startApp = AppView.getInstance.bind(AppView);

  /** @type {module:webfontloader} */


  var WebFont = require("webfontloader");

  var loadOpts = {
    async: false,
    groupName: "",
    classes: false,
    loading: function loading() {
      console.log("WebFont:%s:loading", this.groupName);
    },
    active: function active() {
      console.info("WebFont:%s:active", this.groupName);
    },
    inactive: function inactive() {
      console.warn("WebFont:%s:inactive", this.groupName);
    },
    fontactive: function fontactive(familyName, variantFvd) {
      console.info("WebFont:%s:fontactive '%s' (%s)", this.groupName, familyName, variantFvd);
    },
    fontinactive: function fontinactive(familyName, variantFvd) {
      console.warn("WebFont:%s:fontinactive '%s' (%s)", this.groupName, familyName, variantFvd);
    } // fontloading: function(familyName, variantDesc) {
    // 	console.log("WebFont::fontloading", familyName, JSON.stringify(variantDesc, null, " "));
    // },

  };
  WebFont.load(_.defaults({
    async: false,
    groupName: "required",
    custom: {
      families: ["FranklinGothicFS:n4,n6", // "FranklinGothicFS:i4,i6"
      "FolioFigures:n4"],
      testStrings: {
        "FolioFigures": "hms"
      }
    },
    active: function active() {
      return AppView.getInstance();
    },
    inactive: function inactive() {
      return AppView.getInstance();
    }
  }, loadOpts));
  WebFont.load(_.defaults({}, loadOpts)); // requestAnimationFrame(function(tstamp) {
  // 	AppView.getInstance();
  // });
}); // if (DEBUG) {
// /** @type {module:underscore} */
// var _ = require("underscore");
// var isFF = /Firefox/.test(window.navigator.userAgent);
// var isIOS = /iPad|iPhone/.test(window.navigator.userAgent);

/*
if (/Firefox/.test(window.navigator.userAgent)) {
	console.prefix = "# ";
	var shift = [].shift;
	var logWrapFn = function() {
		if (typeof arguments[1] == "string") arguments[1] = console.prefix + arguments[1];
		return shift.apply(arguments).apply(console, arguments);
	};
	console.group = _.wrap(console.group, logWrapFn);
	console.log = _.wrap(console.log, logWrapFn);
	console.info = _.wrap(console.info, logWrapFn);
	console.warn = _.wrap(console.warn, logWrapFn);
	console.error = _.wrap(console.error, logWrapFn);
}
*/

/*
var saveLogs = function() {
	var logWrapFn = function(name, fn, msg) {
		document.documentElement.appendChild(
			document.createComment("[" + name + "] " + msg));
	};
	console.group = _.wrap(console.group, _.partial(logWrapFn, "group"));
	console.log = _.wrap(console.log, _.partial(logWrapFn, "log"));
	console.info = _.wrap(console.info, _.partial(logWrapFn, "info"));
	console.warn = _.wrap(console.warn, _.partial(logWrapFn, "warn"));
	console.error = _.wrap(console.error, _.partial(logWrapFn, "error"));
};
*/
// handle error events on some platforms and production

/*
if (isIOS) {
	// saveLogs();
	window.addEventListener("error", function() {
		var args = Array.prototype.slice.apply(arguments),
			el = document.createElement("div"),
			html = "";
		_.extend(el.style, {
			fontfamily: "monospace",
			display: "block",
			position: "absolute",
			zIndex: "999",
			backgroundColor: "white",
			color: "black",
			width: "calc(100% - 3em)",
			bottom: "0",
			margin: "1em 1.5em",
			padding: "1em 1.5em",
			outline: "0.5em solid red",
			outlineOffset: "0.5em",
			boxSizing: "border-box",
			overflow: "hidden",
		});
		html += "<pre><b>location:<b> " + window.location + "</pre>";
		html += "<pre><b>event:<b> " + JSON.stringify(args.shift(), null, " ") + "</pre>";
		if (args.length) html += "<pre><b>rest:<b> " + JSON.stringify(args, null, " ") + "</pre>";
		el.innerHTML = html;
		document.body.appendChild(el);
	});
}*/
// }

}).call(this,'65e3bc7',require("underscore"))

},{"Backbone.Mutators":"Backbone.Mutators","app/model/helper/bootstrap":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/helper/bootstrap.js","app/view/AppView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/AppView.js","app/view/helper/createColorStyleSheet":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/helper/createColorStyleSheet.js","app/view/template/_helpers":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/_helpers.js","backbone":"backbone","backbone.babysitter":"backbone.babysitter","backbone.native":"backbone.native","hammerjs":"hammerjs","underscore":"underscore","webfontloader":"webfontloader"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Controller.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/control/Controller
 */

/** @type {module:backbone} */
var Backbone = require("backbone"); // /** @type {module:app/model/collection/TypeCollection} */
// var types = require("app/model/collection/TypeCollection");
// /** @type {module:app/model/collection/KeywordCollection} */
// var keywords = require("app/model/collection/KeywordCollection");

/** @type {module:app/model/collection/ArticleCollection} */


var articles = require("app/model/collection/ArticleCollection");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection");
/* --------------------------- *
/* Static private
/* --------------------------- */

/**
/* @constructor
/* @type {module:app/control/Controller}
/*/


var Controller = Backbone.Router.extend({
  // /** @override */
  // routes: {},

  /** @override */
  initialize: function initialize(options) {
    if (DEBUG) {
      this._routeNames = [];

      this.route = function (route, name, callback) {
        this._routeNames.push(_.isString(name) ? name : '');

        return Backbone.Router.prototype.route.apply(this, arguments);
      };

      this.on("route", function (routeName, args) {
        console.log("controller:[route] %s [%s]", routeName, args.join());
      });
    }
    /*
     * Prefixed article regexp: /^article(?:\/([^\/]+))\/?$/
     * Single bundle regexp: /^bundles(?:\/([^\/]+)(?:\/(\d+))?)?\/?$/
     */


    this.route(/(.*)/, "notfound", this.toNotFound);
    this.route(/^([a-z][a-z0-9\-]*)\/?$/, "article-item", this.toArticleItem);
    this.route(/^(?:bundles)?\/?$/, "root", this.toRoot); // this.route(/^bundles\/?$/,
    // 	"bundle-list", this.toBundleList);
    // this.route(/^bundles\/([^\/]+)\/?$/,
    // 	"bundle-item", this.toBundleItem);
    // this.route(/^bundles\/([^\/]+)\/(\d+)\/?$/,
    // 	"media-item", this.toMediaItem);
    // this.route(/^bundles(?:\/([^\/]+)(?:\/(\d+))?)?\/?$/,
    // 	"media-item", this.toMediaItem);

    this.route(/^bundles\/([^\/]+)(?:\/(\d+)?)?\/?$/, "media-item", this.toMediaItem);

    if (DEBUG) {
      console.log("%s::initialize routes: %o", "controller", this._routeNames);
    }
  },

  /* ---------------------------
  /* JS to URL: public command methods
  /* --------------------------- */
  selectMedia: function selectMedia(media) {
    this._goToLocation(media.get("bundle"), media);
  },
  selectBundle: function selectBundle(bundle) {
    if (bundle.attr("@no-desc")) {
      this._goToLocation(bundle, bundle.get("media").at(0), {
        replace: true,
        trigger: true
      });
    } else {
      this._goToLocation(bundle);
    }
  },
  deselectMedia: function deselectMedia() {
    this._goToLocation(bundles.selected);
  },
  deselectBundle: function deselectBundle() {
    this._goToLocation();
  },
  selectArticle: function selectArticle(article) {
    this.navigate(article.get("handle"), {
      trigger: true
    });
  },
  deselectArticle: function deselectArticle() {
    this.navigate("", {
      trigger: true
    });
  },

  /* ---------------------------
  /* JS to URL: private helpers
  /* --------------------------- */

  /** Update location when navigation happens internally */

  /*_updateLocation: function() {
  	var bundle, media;
  	bundle = bundles.selected;
  	if (bundle) {
  		media = bundle.get("media").selected;
  	}
  	this.navigate(this._getLocation(bundle, media), {
  		trigger: false
  	});
  },*/
  _getLocation: function _getLocation(bundle, media) {
    var mediaIndex,
        location = [];

    if (bundle) {
      location.push("bundles");
      location.push(bundle.get("handle"));

      if (media) {
        mediaIndex = bundle.get("media").indexOf(media);

        if (mediaIndex >= 0) {
          location.push(mediaIndex);
        }
      }
    } // location.push("");


    return location.join("/");
  },
  _goToLocation: function _goToLocation(bundle, media, opts) {
    this.navigate(this._getLocation(bundle, media), _.defaults(opts || {}, {
      trigger: true
    }));
  },

  /* --------------------------- *
   * URL to JS: router handlers
   * --------------------------- */
  toRoot: function toRoot() {
    this.trigger("change:before");

    if (bundles.selected) {
      // bundles.selected.get("media").deselect();
      bundles.deselect();
    } // keywords.deselect();


    articles.deselect();
    this.trigger("change:after");
  },
  toNotFound: function toNotFound(slug) {
    console.info("route:[*:%s]", slug);
  },
  // toBundleList: function() {
  // 	this.navigate("", {
  // 		trigger: true,
  // 		replace: true
  // 	});
  // },
  toBundleItem: function toBundleItem(bundleHandle) {
    var bundle = bundles.findWhere({
      handle: bundleHandle
    });

    if (!bundle) {
      throw new Error("No bundle found with handle '".concat(bundleHandle, "'")); // } else if (bundle.attr("@no-desc")) {
      // this._changeSelection(bundle, bundle.get("media").at(0));
      // this.navigate(this._getLocation(bundle, bundle.get("media").at(0)), { trigger: true, replace: false });
    }

    this._changeSelection(bundle);
  },
  toMediaItem: function toMediaItem(bundleHandle, mediaIndex) {
    var bundle = bundles.findWhere({
      handle: bundleHandle
    });

    if (!bundle) {
      throw new Error("No bundle found with handle '".concat(bundleHandle, "'"));
    }

    var media = bundle.get("media").at(mediaIndex ? mediaIndex : 0);

    if (!media) {
      throw new Error("No media found at index ".concat(mediaIndex, " in bundle '").concat(bundleHandle, "'"));
    }

    this._changeSelection(bundle, media);
  },
  toArticleItem: function toArticleItem(articleHandle) {
    var article = articles.findWhere({
      handle: articleHandle
    });

    if (!article) {
      throw new Error("No article found with handle '".concat(articleHandle, "'"));
    }

    this.trigger("change:before", article);
    bundles.deselect();
    articles.select(article);
    this.trigger("change:after", article);
  },

  /* -------------------------------
  /* URL to JS: private helpers
  /* ------------------------------- */

  /*
  /* NOTE: Selection order
  /* - Apply media selection to *incoming bundle*, as not to trigger
  /*	unneccesary events on an outgoing bundle. Outgoing bundle media selection
  /*	remains untouched.
  /* - Apply media selection *before* selecting the incoming bundle. Views
  /*	normally listen to the selected bundle only, so if the bundle is changing,
  /*	they will not be listening to media selection changes yet.
  /*/
  _changeSelection: function _changeSelection(bundle, media) {
    var lastBundle, lastMedia;
    if (bundle === void 0) bundle = null;
    if (media === void 0) media = null; // if (bundle !== null && media === null && bundle.attr("@no-desc")) {
    // 	media = bundle.get("media").at(0);
    // 	this._goToLocation(bundle, media);
    // 	return;
    // }

    lastBundle = bundles.selected;
    lastMedia = lastBundle ? lastBundle.get("media").selected : null;
    console.log("controller::_changeSelection bundle:[%s -> %s] media:[%s -> %s]", lastBundle ? lastBundle.cid : lastBundle, bundle ? bundle.cid : bundle, lastMedia ? lastMedia.cid : lastMedia, media ? media.cid : media);

    if (!articles.selected && lastBundle === bundle && lastMedia === media) {
      return;
    }

    this.trigger("change:before", bundle, media);
    bundle && bundle.get("media").select(media);
    bundles.select(bundle);
    articles.deselect();
    this.trigger("change:after", bundle, media);
  }
});
module.exports = new Controller();

}).call(this,true,require("underscore"))

},{"app/model/collection/ArticleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/ArticleCollection.js","app/model/collection/BundleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/BundleCollection.js","backbone":"backbone","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/control/Globals
 */
module.exports = function () {
  // reusable vars
  var o, s, so; // global hash

  var g = {}; // SASS <--> JS shared hash

  var sass = require("../../../sass/variables.json"); // JUNK FIRST: Some app-wide defaults
  // - - - - - - - - - - - - - - - - -


  g.VPAN_DRAG = 0.95; // as factor of pointer delta

  g.HPAN_OUT_DRAG = 0.4; // factor

  g.VPAN_OUT_DRAG = 0.1; // factor

  g.PAN_THRESHOLD = 15; // px

  g.COLLAPSE_THRESHOLD = 75; // px

  g.COLLAPSE_OFFSET = parseInt(sass.temp["collapse_offset"]); // g.CLICK_EVENT = "click"; //window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup";

  g.VIDEO_CROP_PX = parseInt(sass["video_crop_px"]); // breakpoints
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
    console.groupCollapsed("Breakpoints");

    for (s in g.BREAKPOINTS) {
      console.log("%s: %o", s, g.BREAKPOINTS[s].media);
    }

    console.groupEnd();
  } // base colors, dimensions
  // - - - - - - - - - - - - - - - - -


  g.DEFAULT_COLORS = _.clone(sass.default_colors); // g.HORIZONTAL_STEP = parseFloat(sass.units["hu_px"]);
  // g.VERTICAL_STEP = parseFloat(sass.units["vu_px"]);
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
  delete window.mediadir; // hardcoded font data
  // - - - - - - - - - - - - - - - - -

  g.FONT_METRICS = {
    "FranklinGothicFS": {
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
    }
  };
  g.PAUSE_CHAR = String.fromCharCode(0x23F8);
  g.PLAY_CHAR = String.fromCharCode(0x23F5);
  g.STOP_CHAR = String.fromCharCode(0x23F9); // translate common template

  if (sass.transform_type == "3d") {
    g.TRANSLATE_TEMPLATE = function (x, y) {
      return "translate3d(" + x + "px, " + y + "px, 0px)";
    };
  } else {
    g.TRANSLATE_TEMPLATE = function (x, y) {
      return "translate(" + x + "px, " + y + "px)";
    };
  }

  g.TRANSLATE_TEMPLATE = function (x, y) {
    return "translate(" + x + "px, " + y + "px)"; // return "translate3d(" + x + "px, " + y + "px ,0px)";
  }; // timing, easing
  // - - - - - - - - - - - - - - - - -


  var ease = g.TRANSITION_EASE = sass.transitions["ease"];
  var duration = g.TRANSITION_DURATION = parseFloat(sass.transitions["duration_ms"]);
  var delayInterval = g.TRANSITION_DELAY_INTERVAL = parseFloat(sass.transitions["delay_interval_ms"]);
  var minDelay = g.TRANSITION_MIN_DELAY = parseFloat(sass.transitions["min_delay_ms"]);
  var delay = g.TRANSITION_DELAY = g.TRANSITION_DURATION + g.TRANSITION_DELAY_INTERVAL; // css transitions
  // - - - - - - - - - - - - - - - - -

  o = {}; // match tx() in _transitions.scss
  // - - - - - - - - - - - - - - - - -

  o.tx = function tx(durationCount, delayCount, easeVal) {
    _.isNumber(durationCount) || (durationCount = 1);
    _.isNumber(delayCount) || (delayCount = -1);
    _.isString(easeVal) || (easeVal = ease);
    var o = {};

    if (delayCount < 0) {
      o.duration = duration * durationCount + delayInterval * (durationCount - 1);
      o.delay = 0;
    } else {
      o.duration = duration * durationCount + delayInterval * (durationCount - 1) - minDelay;
      o.delay = delay * delayCount - minDelay;
    }

    o.easeing = easeVal;
    return 0;
  }; // transition presets
  // TODO: get rid of this
  // - - - - - - - - - - - - - - - - -


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
  }, txAligned); // o.FIRST_LATE = 		_.defaults({delay: txDelay*0.0 + txMinDelay*2}, txAligned);
  // o.LAST_EARLY = 		_.defaults({delay: txDelay*2.0 + txMinDelay*0}, txAligned);
  // o.AFTER = 			_.defaults({delay: txDelay*2.0 + txMinDelay}, txAligned);

  console.groupCollapsed("Transitions");

  for (s in o) {
    if (!_.isFunction(o[s])) {
      so = o[s];
      so.name = s;
      so.className = "tx-" + s.replace("_", "-").toLowerCase();

      if (!so.hasOwnProperty("cssText")) {
        so.cssText = so.duration / 1000 + "s " + so.easing + " " + so.delay / 1000 + "s";
      }

      console.log("%s: %s", so.name, so.cssText);
    }
  }

  console.groupEnd();
  g.transitions = o;
  return g;
}();

}).call(this,true,require("underscore"))

},{"../../../sass/variables.json":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/sass/variables.json","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/debug/DebugToolbar.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/DebugToolbar
 */

/** @type {module:cookies-js} */
var Cookies = require("cookies-js");
/** @type {module:modernizr} */


var Modernizr = require("Modernizr");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals"); // /** @type {module:app/control/Controller} */
// var controller = require("app/control/Controller");

/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {Function} */


var viewTemplate = require("./template/DebugToolbar.hbs");
/** @type {Function} */


var gridTemplate = require("./template/DebugToolbar.SVGGrid.hbs");
/** @type {Function} */


var sizeTemplate = _.template("<%= w %> \xD7 <%= h %>"); // var appStateSymbols = { withBundle: "b", withMedia: "m", collapsed: "c"};
// var appStateKeys = Object.keys(appStateSymbols);


module.exports = View.extend({
  /** @override */
  cidPrefix: "debugToolbar",

  /** @override */
  tagName: "div",

  /** @override */
  className: "toolbar",

  /** @override */
  template: viewTemplate,

  /** @override */
  properties: {
    grid: {
      get: function get() {
        return this._grid || (this._grid = this.createGridElement());
      }
    }
  },
  initialize: function initialize(options) {
    Cookies.defaults = {
      expires: new Date(0x7fffffff * 1e3),
      domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
    };
    this.el.innerHTML = this.template({
      tests: Modernizr,
      navigator: window.navigator
    });
    /* toggle's target: container
    /* - - - - - - - - - - - - - - - - */

    var container = document.getElementById("container"); //.querySelector("#container");

    /* create/attach svg grid element
    /* - - - - - - - - - - - - - - - - */

    container.insertBefore(this.createGridElement(), container.firstElementChild);
    /* info elements
    /* - - - - - - - - - - - - - - - - */

    this.backendEl = this.el.querySelector("#edit-backend a");
    this.mediaInfoEl = this.el.querySelector("#media-info span");
    this.appStateEl = this.el.querySelector("#app-state");
    /* toggle visibility
    /* - - - - - - - - - - - - - - - - */

    this.initializeClassToggle("show-links", this.el.querySelector("#links-toggle"), this.el, function (key, value) {
      this.el.classList.toggle("not-" + key, !value);
    });
    this.initializeClassToggle("show-tests", this.el.querySelector("#toggle-tests a"), this.el);
    this.initializeClassToggle("hide-passed", this.el.querySelector("#toggle-passed"), this.el);
    /* toggle container classes
    /* - - - - - - - - - - - - - - - - */

    this.initializeClassToggle("debug-state", this.el.querySelector("#toggle-state a"), container);
    this.initializeClassToggle("debug-blocks-nav", this.el.querySelector("#toggle-blocks-nav a"), container);
    this.initializeClassToggle("debug-blocks-content", this.el.querySelector("#toggle-blocks-content a"), container);
    this.initializeClassToggle("debug-mdown", this.el.querySelector("#toggle-mdown a"), container);
    this.initializeClassToggle("debug-tx", this.el.querySelector("#toggle-tx a"), container, function (key, value) {
      this.el.classList.toggle("show-tx", value);
      this.el.classList.toggle("not-show-tx", !value);
    });
    this.initializeClassToggle("debug-graph", this.el.querySelector("#toggle-graph a"), container);
    this.initializeClassToggle("debug-logs", this.el.querySelector("#toggle-logs a"), container);
    this.initializeClassToggle("debug-grid-bg", this.el.querySelector("#toggle-grid-bg a"), document.body);
    this.initializeViewportInfo(); // this.initializeLayoutSelect();

    this.listenTo(this.model, "change", this._onModelChange);

    this._onModelChange();
  },
  initializeViewportInfo: function initializeViewportInfo() {
    var viewportInfoEl = this.el.querySelector("#viewport-info span");

    var callback = function callback() {
      viewportInfoEl.textContent = sizeTemplate({
        w: window.innerWidth,
        h: window.innerHeight
      });
    };

    callback.call();
    window.addEventListener("resize", _.debounce(callback, 100, false, false));
  },
  initializeToggle: function initializeToggle(key, toggleEl, callback) {
    if (!toggleEl) return;
    var ctx = this;
    var toggleValue = Cookies.get(key) === "true";
    callback.call(ctx, key, toggleValue);
    toggleEl.addEventListener("click", function (ev) {
      if (ev.defaultPrevented) return;else ev.preventDefault();
      toggleValue = !toggleValue;
      Cookies.set(key, toggleValue ? "true" : "");
      callback.call(ctx, key, toggleValue);
    }, false);
  },
  initializeClassToggle: function initializeClassToggle(key, toggleEl, targetEl, callback) {
    var hasCallback = _.isFunction(callback);

    this.initializeToggle(key, toggleEl, function (key, toggleValue) {
      targetEl.classList.toggle(key, toggleValue);
      toggleEl.classList.toggle("toggle-enabled", toggleValue);
      toggleEl.classList.toggle("color-reverse", toggleValue);
      hasCallback && callback.apply(this, arguments);
    });
  },
  _onModelChange: function _onModelChange() {
    // console.log("%s::_onModelChange changedAttributes: %o", this.cid, this.model.changedAttributes());
    var i,
        ii,
        prop,
        el,
        els = this.appStateEl.children;

    for (i = 0, ii = els.length; i < ii; i++) {
      el = els[i];
      prop = el.getAttribute("data-prop");
      el.classList.toggle("has-value", this.model.get(prop));
      el.classList.toggle("has-changed", this.model.hasChanged(prop));
      el.classList.toggle("color-reverse", this.model.hasChanged(prop));
    } // NOTE: Always but rewrite CMS href.
    // Only collapsed may have changed, but not worth all the logic


    var attrVal = Globals.APP_ROOT + "symphony/";

    switch (this.model.get("routeName")) {
      case "article-item":
        attrVal += "publish/articles/edit/" + this.model.get("article").id;
        break;

      case "bundle-item":
        attrVal += "publish/bundles/edit/" + this.model.get("bundle").id;
        break;

      case "media-item":
        attrVal += "publish/media/edit/" + this.model.get("media").id;
        break;

      case "root":
        attrVal += "publish/bundles";
        break;
    }

    this.backendEl.setAttribute("href", attrVal);

    if (this.model.hasChanged("routeName")) {
      document.body.setAttribute("last-route", this.model.previous("routeName"));
      document.body.setAttribute("current-route", this.model.get("routeName"));
    }

    if (this.model.hasChanged("media")) {
      if (this.model.has("media")) {
        this.mediaInfoEl.textContent = sizeTemplate(this.model.get("media").get("source").toJSON());
        this.mediaInfoEl.style.display = "";
      } else {
        this.mediaInfoEl.textContent = "";
        this.mediaInfoEl.style.display = "none";
      }
    }
  },
  createGridElement: function createGridElement() {
    var el = document.createElement("div");
    el.id = "grid-wrapper";
    el.innerHTML = gridTemplate();
    return el;
  }
});
module.exports.prototype._logFlags = "";

}).call(this,require("underscore"))

},{"./template/DebugToolbar.SVGGrid.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/debug/template/DebugToolbar.SVGGrid.hbs","./template/DebugToolbar.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/debug/template/DebugToolbar.hbs","Modernizr":"Modernizr","app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","cookies-js":"cookies-js","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/debug/template/DebugToolbar.SVGGrid.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<svg id=\"debug-grid\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" preserveAspectRatio=\"xMaxYMid slice\" viewport-fill=\"hsl(0,0%,100%)\" viewport-fill-opacity=\"1\" style=\"fill:none;stroke:none;stroke-width:1px;fill:none;fill-rule:evenodd;\">\n<defs>\n	<pattern id=\"pat-baseline-12px\" class=\"baseline base12\" x=\"0\" y=\"0\" width=\"20\" height=\"12\" patternUnits=\"userSpaceOnUse\">\n		<line x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\" stroke-opacity=\"1.0\"/>\n		<line x1=\"0\" x2=\"100%\" y1=\"3\" y2=\"3\" stroke-opacity=\"0.125\"/>\n		<line x1=\"0\" x2=\"100%\" y1=\"6\" y2=\"6\" stroke-opacity=\"0.375\"/>\n		<line x1=\"0\" x2=\"100%\" y1=\"9\" y2=\"9\" stroke-opacity=\"0.125\"/>\n	</pattern>\n\n	<pattern id=\"pat-baseline-24px\" class=\"baseline base12\" x=\"0\" y=\"0\" width=\"20\" height=\"24\" patternUnits=\"userSpaceOnUse\">\n		<line x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\" stroke-opacity=\"1.0\"/>\n	</pattern>\n\n	<pattern id=\"pat-baseline-10px\" class=\"baseline base10\" x=\"0\" y=\"0\" width=\"20\" height=\"10\" patternUnits=\"userSpaceOnUse\">\n		<line x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\" stroke-opacity=\"1.00\"/>\n		<line x1=\"0\" x2=\"100%\" y1=\"5\" y2=\"5\" stroke-opacity=\"0.75\"/>\n	</pattern>\n	<pattern id=\"pat-baseline-20px\" class=\"baseline base10\" x=\"0\" y=\"0\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\">\n		<line x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\" stroke-opacity=\"1.0\"/>\n	</pattern>\n	<pattern id=\"pat-cols-220px\" x=\"0\" y=\"0\" width=\"220\" height=\"36\" patternUnits=\"userSpaceOnUse\">\n		<rect transform=\"translate(0,0)\" x=\"0\" y=\"0\" width=\"20\" height=\"100%\" fill=\"hsl(336,50%,40%)\" fill-opacity=\"0.1\"/>\n		<rect transform=\"translate(200,0)\" x=\"0\" y=\"0\" width=\"20\" height=\"100%\" fill=\"hsl(336,50%,40%)\" fill-opacity=\"0.1\"/>\n		<line transform=\"translate(20 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(336,50%,60%)\" stroke-opacity=\"0.2\"/>\n		<line transform=\"translate(200 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(336,50%,40%)\" stroke-opacity=\"0.2\"/>\n\n		<line transform=\"translate(140 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(336,50%,40%)\" stroke-opacity=\"0.3\"/>\n		<line transform=\"translate(80 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(336,50%,40%)\" stroke-opacity=\"0.3\"/>\n\n		<line transform=\"translate(0 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(236,50%,40%)\" stroke-opacity=\"0.4\" stroke-width=\"1\"/>\n		<line transform=\"translate(220 0)\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\" stroke=\"hsl(236,50%,40%)\" stroke-opacity=\"0.4\" stroke-width=\"1\"/>\n	</pattern>\n</defs>\n<g id=\"debug-grid-body\" transform=\"translate(0 0.5)\">\n	<rect id=\"baseline\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"/>\n	<g id=\"debug-grid-container\">\n		<g id=\"debug-grid-content\">\n			<rect id=\"baseline-content\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"/>\n			<line id=\"gct0\" class=\"hguide\" x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\"/>\n			<line id=\"gct1\" class=\"hguide\" x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\"/>\n		</g>\n		<line id=\"gnv0\" class=\"hguide\" x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\"/>\n		<line id=\"gnv1\" class=\"hguide\" x1=\"0\" x2=\"100%\" y1=\"0\" y2=\"0\"/>\n	</g>\n\n	<g id=\"abs-cols\">\n		<rect id=\"columns\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"/>\n	</g>\n\n	<g id=\"rel-cols\">\n		<line id=\"le\" class=\"vguide edge\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n		<line id=\"re\" class=\"vguide edge\" x1=\"100%\" x2=\"100%\" y1=\"0\" y2=\"100%\"/>\n\n		<line id=\"gl0\" class=\"vguide margin\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n		<line id=\"gl1\" class=\"vguide gutter\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n\n		<line id=\"gr0\" class=\"vguide margin\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n		<line id=\"gr1\" class=\"vguide gutter\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n\n		<line id=\"gm\" class=\"vguide\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"100%\"/>\n	</g>\n</g>\n</svg>\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/debug/template/DebugToolbar.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
var partial$0 = require('../../view/template/svg/CogSymbol.hbs');
HandlebarsCompiler.registerPartial('../../view/template/svg/CogSymbol.hbs', partial$0);
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	<dd id=\"select-layout\">\n		<select size=1>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.layouts : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</select>\n	</dd>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "			<option value=\""
    + alias2(alias1(depth0, depth0))
    + "\">"
    + alias2(alias1(depth0, depth0))
    + "</option>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "		<li class=\""
    + ((stack1 = helpers["if"].call(alias1,depth0,{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\">"
    + container.escapeExpression(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"key","hash":{},"data":data}) : helper)))
    + "</li>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "passed";
},"7":function(container,depth0,helpers,partials,data) {
    return "failed";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression;

  return "<dl class=\"debug-links color-bg\">\n	<dt id=\"links-toggle\">\n"
    + ((stack1 = container.invokePartial(partials["../../view/template/svg/CogSymbol.hbs"],depth0,{"name":"../../view/template/svg/CogSymbol.hbs","data":data,"indent":"\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "	</dt>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.layouts : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	<dd id=\"edit-backend\">\n		<a href=\""
    + alias2((helpers.global || (depth0 && depth0.global) || helpers.helperMissing).call(alias1,"APP_ROOT",{"name":"global","hash":{},"data":data}))
    + "symphony/\" class=\"color-fg color-bg\" target=\"_blank\">CMS</a>\n	</dd>\n	<dd id=\"toggle-tests\">\n		<a href=\"#toggle-tests\" class=\"color-fg color-bg\">Tests</a>\n	</dd>\n	<dd id=\"toggle-state\">\n		<a href=\"#toggle-state\" class=\"color-fg color-bg\">Route</a>\n	</dd>\n	<dd id=\"toggle-blocks-nav\">\n		<a href=\"#toggle-blocks-nav\" class=\"color-fg color-bg\">Nav</a>\n	</dd>\n	<dd id=\"toggle-blocks-content\">\n		<a href=\"#toggle-blocks-content\" class=\"color-fg color-bg\">Content</a>\n	</dd>\n	<dd id=\"toggle-mdown\">\n		<a href=\"#toggle-mdown\" class=\"color-fg color-bg\">Markdown</a>\n	</dd>\n	<dd id=\"toggle-tx\">\n		<a href=\"#toggle-tx\" class=\"color-fg color-bg\">TX/FX</a>\n	</dd>\n	<dd id=\"toggle-grid-bg\">\n		<a href=\"#toggle-grid-bg\" class=\"color-fg color-bg\">Grid</a>\n	</dd>\n	<dd id=\"toggle-graph\">\n		<a href=\"#toggle-graph\" class=\"color-fg color-bg\">Graph</a>\n	</dd>\n	<dd id=\"toggle-logs\">\n		<a href=\"#toggle-logs\" class=\"color-fg color-bg\">Logs</a>\n	</dd>\n	<dd id=\"media-info\">\n		<span></span>\n	</dd>\n	<dd id=\"viewport-info\">\n		<span></span>\n	</dd>\n	<dd id=\"app-state\">\n		<span class=\"color-fg color-bg\" data-prop=\"collapsed\">c</span><span class=\"color-fg color-bg\" data-prop=\"withBundle\">b</span><span class=\"color-fg color-bg\" data-prop=\"withMedia\">m</span><span class=\"color-fg color-bg\" data-prop=\"withArticle\">a</span>\n	</dd>\n</dl>\n<div id=\"test-results\">\n	<h6>Tests <a id=\"toggle-passed\" href=\"#toggle-passed\">Passed</a></h6>\n	<p>"
    + alias2(container.lambda(((stack1 = (depth0 != null ? depth0.navigator : depth0)) != null ? stack1.userAgent : stack1), depth0))
    + "</p>\n	<ul>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tests : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	</ul>\n</div>\n";
},"usePartial":true,"useData":true});

},{"../../view/template/svg/CogSymbol.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/svg/CogSymbol.hbs","hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/AppState.js":[function(require,module,exports){
"use strict";

/**
 * @module app/model/BaseItem
 * @requires module:backbone
 */

/** @type {module:backbone} */
var BaseModel = require("backbone").Model; // /** @type {module:app/model/BaseModel} */
// var BaseModel = require("app/model/BaseModel");
// /** @type {module:utils/strings/stripTags} */
// const stripTags = require("utils/strings/stripTags");
// /** @type {module:app/control/Globals} */
// const Globals = require("app/control/Globals");


module.exports = BaseModel.extend({
  defaults: {
    routeName: "initial",
    fromRouteName: "",
    page: "",
    article: null,
    bundle: null,
    media: null,
    withArticle: false,
    withBundle: false,
    withMedia: false,
    collapsed: false
  },
  getters: ["page", "routeName", "fromRouteName", "article", "bundle", "media", "withArticle", "withBundle", "withMedia", "collapsed"],
  // mutators: {
  // 	routeName: {
  // 		set: function(key, value, opts, set) {
  // 			// Set fromRoute to avoid losing current "changing" state
  // 			this._previousAttributes["fromRouteName"] = this.attributes["fromRouteName"];
  // 			this.changed["fromRouteName"] = this.attributes["fromRouteName"] = this.previous("routeName");
  // 			// set("fromRouteName", this.previous("routeName"), {
  // 			// 	silent: true
  // 			// });
  // 		}
  // 	}
  // },
  initialize: function initialize() {
    // this.listenTo(this, {
    // 	"change:routeName": function() {
    // 		this.set("fromRouteName", this.previous("routeName"));
    // 	},
    // 	"change:article": function(val) {
    // 		console.log("%s:[change] %o", this.cid, arguments);
    // 		this.set("withArticle", (typeof val === 'object'));
    // 	},
    // 	"change:bundle": function(val) {
    // 		console.log("%s:[change] %o", this.cid, arguments);
    // 		this.set("withBundle", (typeof val === 'object'));
    // 	},
    // 	"change:media": function(val) {
    // 		console.log("%s:[change] %o", this.cid, arguments);
    // 		this.set("withMedia", (typeof val === 'object'));
    // 	},
    // });
    // this.set({
    // 	fromRouteName: "",
    // 		withArticle: false,
    // 		withBundle: false,
    // 		withMedia: false
    // });
    var opts = {
      silent: false
    };
    this.listenTo(this, "change", function (attrs) {
      // var opts = { silent: false };
      if (this.hasChanged("routeName")) {
        this.set("fromRouteName", this.previous("routeName"), opts);
      }

      if (this.hasChanged("article")) {
        this.set("withArticle", this.has("article"), opts);
      }

      if (this.hasChanged("bundle")) {
        this.set("withBundle", this.has("bundle"), opts);
      }

      if (this.hasChanged("media")) {
        this.set("withMedia", this.has("media"), opts);
      } // this.set("pageTitle", this._getDocumentTitle(), { silent: true });

    });
    this.listenTo(this, "change:routeName", function (val) {
      console.log("%s:[change:routeName] %o", this.cid, val); // this.set("fromRouteName", this.previous("routeName"));
    });
    this.listenTo(this, "change:article", function (val) {
      console.log("%s:[change:article] %o", this.cid, val); // this.set("withArticle", _.isObject(val));
    });
    this.listenTo(this, "change:bundle", function (val) {
      console.log("%s:[change:bundle] %o", this.cid, val); // this.set("withBundle", _.isObject(val));
    });
    this.listenTo(this, "change:media", function (val) {
      console.log("%s:[change:media] %o", this.cid, val); // this.set("withMedia", _.isObject(val));
    });
  },
  hasAnyPrevious: function hasAnyPrevious(attr) {
    return this.previous(attr) != null;
  },
  hasAnyChanged: function hasAnyChanged(attr) {
    return this.hasChanged(attr) && this.has(attr) != this.hasAnyPrevious(attr);
  } // _getDocumentTitle: function() {
  // 	let docTitle = [];
  // 	docTitle.push(Globals.APP_NAME);
  // 	if (this.get("bundle")) {
  // 		docTitle.push(stripTags(this.get("bundle").get("name")));
  // 		if (this.model.get("media")) {
  // 			docTitle.push(stripTags(this.get("media").get("name")));
  // 		}
  // 	} else if (this.get("article")) {
  // 		docTitle.push(stripTags(this.get("article").get("name")));
  // 	}
  // 	return _.unescape(docTitle.join(" / "));
  // }
  // constructor: function() {
  // 	Object.keys(this.defaults).forEach(function(getterName) {
  // 		Object.defineProperty(this, getterName, {
  // 			enumerable: true,
  // 			get: function() {
  // 				return this.get(getterName);
  // 			}
  // 		});
  // 	});
  // 	BaseModel.apply(this, arguments);
  // }

});

},{"backbone":"backbone"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseItem.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/BaseItem
 * @requires module:backbone
 */

/** @type {module:app/model/BaseModel} */
var BaseModel = require("app/model/BaseModel"); // /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");
// /** @type {module:app/utils/strings/stripTags} */
// var stripTags = require("utils/strings/stripTags");
// /** @type {module:app/model/parseSymAttrs} */
//var parseSymAttrs = require("app/model/parseSymAttrs");


var parseSymAttrs = function parseSymAttrs(s) {
  return s.replace(/(\,|\;)/g, function (m) {
    return m == "," ? ";" : ",";
  });
};

var toAttrsHash = function toAttrsHash(obj, attr) {
  if (_.isString(attr)) {
    var idx = attr.indexOf(":");

    if (idx > 0) {
      obj[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
    } else {
      obj[attr] = attr; // to match HTML5<>XHTML valueless attributes
    }
  } // else ignore non-string values


  return obj;
};
/**
 * @constructor
 * @type {module:app/model/BaseItem}
 */


module.exports = BaseModel.extend({
  _domPrefix: "_",

  /** @type {Object} */
  defaults: {
    // attrs: function() { return {}; },
    get attrs() {
      return {};
    }

  },
  getters: ["domid"],
  mutators: {
    domid: function domid() {
      if (!this.hasOwnProperty("_domId")) this._domId = this._domPrefix + this.id;
      return this._domId;
    },
    attrs: {
      set: function set(key, value, options, _set) {
        if (Array.isArray(value)) {
          value = value.reduce(toAttrsHash, {});
        }

        if (!_.isObject(value)) {
          console.error("%s::attrs value not an object or string array", this.cid, value);
          value = {};
        }

        _set(key, value, options);
      }
    }
  },
  attr: function attr(_attr) {
    return this.attrs()[_attr];
  },
  attrs: function attrs() {
    return this.get("attrs");
  },
  toString: function toString() {
    return this.get("domid");
  },
  getDistanceToSelected: function getDistanceToSelected() {
    if (this.collection && this.collection.selectedIndex > 0) {
      return this.collection.indexOf(this) - this.collection.selectedIndex;
    }

    return -1;
  },
  getIndex: function getIndex() {
    if (this.collection) {
      return this.collection.indexOf(this);
    }

    return -1;
  }
});

}).call(this,require("underscore"))

},{"app/model/BaseModel":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseModel.js","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseModel.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/BaseModel
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");

var BaseModelProto = {// constructor: function() {
  // 	if (this.properties) {
  // 		Object.defineProperties(this, this.properties);
  // 	}
  // 	Backbone.Model.apply(this, arguments);
  // }
};
var BaseModel = {
  extend: function extend(proto, obj) {
    var constr, propName; //, propDef;

    for (propName in proto) {
      if (proto.hasOwnProperty(propName) && _.isObject(proto[propName])) {
        //(Object.getPrototypeOf(proto[propName]) === Object.prototype)) {
        proto[propName] = _.defaults(proto[propName], this.prototype[propName]); // console.log("BaseModel::extend '%s:%s' is Object\n%s", proto._domPrefix, propName, JSON.stringify(proto[propName]));
      }
    } // if (_.isObject(proto.properties)) {
    // 	if (Array.isArray(proto.getters)) {
    // 		proto.properties = _.omit(proto.properties, proto.getters);
    // 	}
    // }
    // if (proto.properties && this.prototype.properties) {
    // 	_.defaults(proto.properties, this.prototype.properties);
    // }


    constr = Backbone.Model.extend.apply(this, arguments);

    if (Array.isArray(constr.prototype.getters)) {
      constr.prototype.getters.forEach(function (getterName) {
        Object.defineProperty(constr.prototype, getterName, {
          enumerable: true,
          get: function get() {
            return this.get(getterName);
          }
        });
      });
    } // if (Array.isArray(constr.prototype.properties)) {
    // }
    // if (_.isObject(proto.properties)) {
    // 	for (propName in proto.properties) {
    // 		if (proto.properties.hasOwnProperty(propName)) {
    // 			propDef = proto.properties[propName];
    // 			if (_.isFunction(propDef)) {
    // 				proto.properties[propName] = {
    // 					enumerable: true, get: propDef
    // 				};
    // 			} else if (_.isObject(propDef)){
    // 				propDef.enumerable = true;
    // 			} else {
    // 				delete proto.properties[propName];
    // 			}
    // 		}
    // 	}
    // 	Object.defineProperties(proto, proto.properties);
    // 	delete proto.properties;
    // }


    return constr;
  }
};
/**
 * @constructor
 * @type {module:app/model/BaseModel}
 */

module.exports = Backbone.Model.extend.call(Backbone.Model, BaseModelProto, BaseModel); // module.exports = Model.extend(BaseModelProto, BaseModel);

}).call(this,require("underscore"))

},{"backbone":"backbone","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/SelectableCollection.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/SelectableCollection
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/**
 * @constructor
 * @type {module:app/model/SelectableCollection}
 */


var SelectableCollection = Backbone.Collection.extend({
  initialize: function initialize(models, options) {
    options = _.defaults({}, options, {
      initialSelection: "none",
      silentInitial: true
    });
    this.initialSelection = options.initialSelection;
    this.initialOptions = {
      silent: options.silentInitial
    };
  },
  reset: function reset(models, options) {
    this.deselect(this.initialOptions);
    Backbone.Collection.prototype.reset.apply(this, arguments);

    if (this.initialSelection === "first" && this.length) {
      this.select(this.at(0), this.initialOptions);
    }
  },
  select: function select(newModel, options) {
    if (newModel === void 0) {
      newModel = null;
    }

    if (this.selected === newModel) {
      return;
    }

    var triggerEvents = !(options && options.silent);
    var oldModel = this.selected;
    this.lastSelected = this.selected;
    this.lastSelectedIndex = this.selectedIndex;
    this.selected = newModel;
    this.selectedIndex = this.indexOf(newModel);

    if (oldModel) {
      if (_.isFunction(oldModel.deselect)) {
        oldModel.deselect(options);
      } else if (triggerEvents) {
        oldModel.selected = void 0;
        oldModel.trigger("deselected", newModel, oldModel);
      }

      if (triggerEvents) this.trigger("deselect:one", oldModel);
    } else {
      if (triggerEvents) this.trigger("deselect:none", null);
    }

    if (newModel) {
      if (_.isFunction(newModel.select)) {
        newModel.select(options);
      } else if (triggerEvents) {
        newModel.selected = true;
        newModel.trigger("selected", newModel, oldModel);
      }

      if (triggerEvents) this.trigger("select:one", newModel);
    } else {
      if (triggerEvents) this.trigger("select:none", null);
    }
  },
  deselect: function deselect(options) {
    this.select(null, options);
  },
  selectAt: function selectAt(index, options) {
    if (0 > index || index >= this.length) {
      new RangeError("index is out of bounds");
    }

    this.select(this.at(index), options);
  },
  distance: function distance(a, b) {
    var aIdx, bIdx;
    if (!a) return NaN;
    aIdx = this.indexOf(a);
    if (aIdx == -1) return NaN;

    if (arguments.length == 1) {
      bIdx = this.selectedIndex;
    } else {
      if (!b) return NaN;
      bIdx = this.indexOf(b);
      if (bIdx == -1) return NaN;
    }

    return Math.abs(bIdx - aIdx);
  },

  /* TODO: MOVE INTO MIXIN */

  /** @return boolean	/*/
  hasFollowing: function hasFollowing(model) {
    model || (model = this.selected);
    return this.indexOf(model) < this.length - 1;
  },

  /** @return next model	*/
  following: function following(model) {
    model || (model = this.selected);
    return this.hasFollowing(model) ? this.at(this.indexOf(model) + 1) : null;
  },

  /** @return next model or the beginning if at the end */
  followingOrFirst: function followingOrFirst(model) {
    model || (model = this.selected);
    return this.at((this.indexOf(model) + 1) % this.length);
  },

  /** @return boolean	/*/
  hasPreceding: function hasPreceding(model) {
    model || (model = this.selected);
    return this.indexOf(model) > 0;
  },

  /** @return the previous model */
  preceding: function preceding(model) {
    model || (model = this.selected);
    return this.hasPreceding(model) ? this.at(this.indexOf(model) - 1) : null;
  },

  /** @return the previous model or the end if at the beginning */
  precedingOrLast: function precedingOrLast(model) {
    model || (model = this.selected);
    var index = this.indexOf(model) - 1;
    return this.at(index > -1 ? index : this.length - 1);
  }
});
module.exports = SelectableCollection;

}).call(this,require("underscore"))

},{"backbone":"backbone","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/ArticleCollection.js":[function(require,module,exports){
"use strict";

/**
 * @module app/model/collection/ArticleCollection
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/model/item/ArticleItem} */


var ArticleItem = require("app/model/item/ArticleItem");
/**
 * @constructor
 * @type {module:app/model/collection/ArticleCollection}
 */


var ArticleCollection = SelectableCollection.extend({
  /** @type {Backbone.Model} */
  model: ArticleItem
});
module.exports = new ArticleCollection();

},{"app/model/SelectableCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/SelectableCollection.js","app/model/item/ArticleItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/ArticleItem.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/BundleCollection.js":[function(require,module,exports){
"use strict";

/**
 * @module app/model/collection/BundleCollection
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/model/item/BundleItem} */


var BundleItem = require("app/model/item/BundleItem");
/**
 * @constructor
 * @type {module:app/model/collection/BundleCollection}
 */


var BundleCollection = SelectableCollection.extend({
  /** @type {Backbone.Model} */
  model: BundleItem,

  /** @type {Function} */
  comparator: function comparator(oa, ob) {
    var a = oa.get("completed");
    var b = ob.get("completed");

    if (a > b) {
      return -1;
    } else if (a < b) {
      return 1;
    } else {
      return 0;
    }
  },

  /** @type {String} */
  url: "/json/bundles/"
});
module.exports = new BundleCollection();

},{"app/model/SelectableCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/SelectableCollection.js","app/model/item/BundleItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/BundleItem.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/KeywordCollection.js":[function(require,module,exports){
"use strict";

/**
 * @module app/model/collection/KeywordCollection
 * @requires module:backbone
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/model/item/KeywordItem} */


var KeywordItem = require("app/model/item/KeywordItem");
/**
 * @constructor
 * @type {module:app/model/collection/KeywordCollection}
 */


var KeywordCollection = SelectableCollection.extend({
  /** @type {Backbone.Model} */
  model: KeywordItem
});
module.exports = new KeywordCollection();

},{"app/model/SelectableCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/SelectableCollection.js","app/model/item/KeywordItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/KeywordItem.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/TypeCollection.js":[function(require,module,exports){
"use strict";

/**
 * @module app/model/collection/TypeCollection
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/model/item/TypeItem} */


var TypeItem = require("app/model/item/TypeItem");
/**
 * @constructor
 * @type {module:app/model/collection/TypeCollection}
 */


var TypeCollection = Backbone.Collection.extend({
  /** @type {Backbone.Model} */
  model: TypeItem
});
module.exports = new TypeCollection();

},{"app/model/item/TypeItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/TypeItem.js","backbone":"backbone"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/helper/bootstrap.js":[function(require,module,exports){
(function (_){
"use strict";

module.exports = function (bootstrap) {
  /** @type {module:app/control/Globals} */
  var Globals = require("app/control/Globals"); // Globals.GA_TAGS = bootstrap["ga-tags"];
  // Globals.PARAMS = bootstrap["params"];
  // Globals.APP_ROOT = bootstrap["params"]["root"];
  // Globals.MEDIA_DIR = bootstrap["params"]["uploads"];


  Globals.APP_NAME = bootstrap["params"]["website-name"];
  /** @type {module:app/model/collection/TypeCollection} */

  var typeList = require("app/model/collection/TypeCollection");
  /** @type {module:app/model/collection/KeywordCollection} */


  var keywordList = require("app/model/collection/KeywordCollection");
  /** @type {module:app/model/collection/BundleCollection} */


  var bundleList = require("app/model/collection/BundleCollection");
  /** @type {module:app/model/collection/ArticleCollection} */


  var articleList = require("app/model/collection/ArticleCollection"); // Fix-ups to bootstrap data.


  var articles = bootstrap["articles-all"];
  var types = bootstrap["types-all"];
  var keywords = bootstrap["keywords-all"];
  var bundles = bootstrap["bundles-all"];
  var media = bootstrap["media-all"]; // Attach media to their bundles

  var mediaByBundle = _.groupBy(media, "bId"); // Fill-in back-references:
  // Create Keyword.bundleIds from existing Bundle.keywordIds,
  // then Bundle.typeIds from unique Keyword.typeId
  // _.each(bundles, function (bo, bi, ba) {


  bundles.forEach(function (bo, bi, ba) {
    bo.tIds = [];
    bo.media = mediaByBundle[bo.id]; // _.each(keywords, function (ko, ki, ka) {

    keywords.forEach(function (ko, ki, ka) {
      if (bi === 0) {
        ko.bIds = [];
      } // if (_.contains(bo.kIds, ko.id)) {


      if (bo.kIds.indexOf(ko.id) != -1) {
        ko.bIds.push(bo.id); // if (!_.contains(bo.tIds, ko.tId)) {

        if (bo.tIds.indexOf(ko.tId) == -1) {
          bo.tIds.push(ko.tId);
        }
      }
    });
  }); // Fill collection singletons

  articleList.reset(articles);
  typeList.reset(types);
  keywordList.reset(keywords);
  bundleList.reset(bundles); // bootstrap["params"] = bootstrap["articles-all"] = bootstrap["types-all"] = bootstrap["keywords-all"] = bootstrap["bundles-all"] = bootstrap["media-all"] = null;
};

}).call(this,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/model/collection/ArticleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/ArticleCollection.js","app/model/collection/BundleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/BundleCollection.js","app/model/collection/KeywordCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/KeywordCollection.js","app/model/collection/TypeCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/TypeCollection.js","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/ArticleItem.js":[function(require,module,exports){
"use strict";

/**
 * @module app/model/item/ArticleItem
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/**
 * @constructor
 * @type {module:app/model/item/ArticleItem}
 */


module.exports = BaseItem.extend({
  _domPrefix: "a",

  /** @type {Object} */
  defaults: {
    name: "",
    handle: "",
    text: ""
  }
});

},{"app/model/BaseItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseItem.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/BundleItem.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/item/BundleItem
 * @requires module:backbone
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");/** @type {Function} */
var Color = require("color");
/** @type {module:app/model/item/SourceItem} */


var BaseItem = require("app/model/BaseItem");
/** @type {module:app/model/item/MediaItem} */


var MediaItem = require("app/model/item/MediaItem");
/** @type {module:app/model/SelectableCollection} */


var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/utils/strings/stripTags} */


var stripTags = require("utils/strings/stripTags"); // /** @type {module:app/utils/strings/parseTaglist} */
// var parseSymAttrs = require("app/model/parseSymAttrs");
// /** @type {module:app/model/collection/KeywordCollection} */
// var keywords = require("app/model/collection/KeywordCollection");
// Globals.DEFAULT_COLORS["color"];
// Globals.DEFAULT_COLORS["background-color"];


var attrsDefault = _.defaults({
  "has-colors": "defaults"
}, Globals.DEFAULT_COLORS);
/** @private */


var MediaCollection = SelectableCollection.extend({
  model: MediaItem,
  comparator: "o"
});
/**
 * @constructor
 * @type {module:app/model/item/BundleItem}
 */

module.exports = BaseItem.extend({
  _domPrefix: "b",

  /** @type {Object|Function} */
  // defaults: function() {
  // 	return {
  // 		name: "",
  // 		handle: "",
  // 		desc: "",
  // 		completed: 0,
  // 		kIds: [],
  // 	};
  // },
  defaults: {
    name: "",
    handle: "",
    desc: "",
    completed: 0,

    get kIds() {
      return [];
    }

  },
  getters: ["name", "media"],
  mutators: {
    text: function text() {
      return stripTags(this.get("desc"));
    },
    // kIds: {
    // 	set: function (key, value, options, set) {
    // 		if (Array.isArray(value)) {
    // 			set("keywords", value.map(function(id) {
    // 				var obj = keywords.get(id);
    // 				return obj;
    // 			}, this), options;
    // 		}
    // 		set(key, value, options);
    // 	},
    // },
    media: {
      transient: true,
      set: function set(key, value, options, _set) {
        if (Array.isArray(value)) {
          value.forEach(function (o) {
            o.bundle = this;
          }, this);
          value = new MediaCollection(value);
        }

        _set(key, value, options);
      }
    }
  },
  initialize: function initialize(attrs, options) {
    this.colors = {
      fgColor: new Color(this.attr("color")),
      bgColor: new Color(this.attr("background-color")),
      lnColor: new Color(this.attr("link-color"))
    };
    this.colors.hasDarkBg = this.colors.fgColor.luminosity() > this.colors.bgColor.luminosity();
  },
  attrs: function attrs() {
    return this._attrs || (this._attrs = _.defaults({}, this.get("attrs"), attrsDefault));
  }
});

}).call(this,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/model/BaseItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseItem.js","app/model/SelectableCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/SelectableCollection.js","app/model/item/MediaItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/MediaItem.js","color":"color","underscore":"underscore","utils/strings/stripTags":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/strings/stripTags.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/KeywordItem.js":[function(require,module,exports){
"use strict";

/**
 * @module app/model/item/KeywordItem
 * @requires module:app/model/BaseItem
 */

/** @type {module:app/model/BaseItem} */
var BaseItem = require("app/model/BaseItem"); // /** @type {module:app/model/collection/TypeCollection} */
// var types = require("app/model/collection/TypeCollection");

/**
 * @constructor
 * @type {module:app/model/item/KeywordItem}
 */


module.exports = BaseItem.extend({
  _domPrefix: "k",

  /** @type {Object} */
  defaults: {
    name: "",
    handle: "",
    tId: -1
  } // mutators: {
  // 	tId: {
  // 		set: function (key, value, options, set) {
  // 			var type = types.get(value);
  // 			if (type) {
  // 				type.get("keywords").push(this);
  // 				set("type", type, options);
  // 			}
  // 			set(key, value, options);
  // 		}
  // 	},
  // }

});

},{"app/model/BaseItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseItem.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/MediaItem.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/model/item/MediaItem
 * @requires module:backbone
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");/** @type {Function} */
var Color = require("color");
/** @type {module:app/model/item/SourceItem} */


var BaseItem = require("app/model/BaseItem");
/** @type {module:app/model/item/SourceItem} */


var SourceItem = require("app/model/item/SourceItem");
/** @type {module:app/model/SelectableCollection} */


var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/utils/strings/stripTags} */


var stripTags = require("utils/strings/stripTags"); // /** @type {module:app/model/parseSymAttrs} */
// var parseSymAttrs = require("app/model/parseSymAttrs");
// console.log(Globals.PARAMS);


var urlTemplates = {
  "original": _.template(Globals.MEDIA_DIR + "/<%= src %>"),
  "constrain-width": _.template(Globals.APP_ROOT + "image/1/<%= width %>/0/uploads/<%= src %>"),
  "constrain-height": _.template(Globals.APP_ROOT + "image/1/0/<%= height %>/uploads/<%= src %>"),
  "debug-bandwidth": _.template(Globals.MEDIA_DIR.replace(/(https?\:\/\/[^\/]+)/, "$1/slow/<%= kbps %>") + "/<%= src %>")
};
/**
 * @constructor
 * @type {module:app/model/item/MediaItem.SourceCollection}
 */

var SourceCollection = SelectableCollection.extend({
  model: SourceItem
});
/**
 * @constructor
 * @type {module:app/model/item/MediaItem}
 */

module.exports = BaseItem.extend({
  _domPrefix: "m",

  /** @type {Object} */
  defaults: {
    name: "<p><em>Untitled</em></p>",
    sub: "",
    o: 0,
    bId: -1,
    srcIdx: 0,

    get srcset() {
      return [];
    },

    get sources() {
      return new SourceCollection();
    }

  },
  getters: ["name", "bundle", "source", "sources"],
  mutators: {
    // desc: function() {
    // 	return this.get("name");
    // },
    handle: function handle() {
      return this.get("src");
    },
    text: function text() {
      if (!this.hasOwnProperty("_text")) this._text = _.unescape(stripTags(this.get("name")));
      return this._text;
    },
    attrs: {
      set: function set(key, value, opts, _set) {
        this._attrs = null;
        BaseItem.prototype.mutators.attrs.set.apply(this, arguments);

        this._updateSources();
      }
    },
    srcset: {
      set: function set(key, value, opts, _set2) {
        _set2(key, value, opts);

        this.get("sources").reset(value, opts);

        this._updateSources();
      }
    },
    source: {
      transient: true,
      get: function get() {
        return this.get("sources").at(this.get("srcIdx"));
      }
    }
  },
  initialize: function initialize() {
    this._updateColors();

    this.listenTo(this, "change:attrs change:bundle", function () {
      this._attrs = null;
    });
  },
  attrs: function attrs() {
    return this._attrs || (this._attrs = _.defaults({}, this.get("bundle").attrs(), this.get("attrs")));
  },
  _updateColors: function _updateColors() {
    this.colors = {
      fgColor: new Color(this.attr("color")),
      bgColor: new Color(this.attr("background-color"))
    };
    this.colors.hasDarkBg = this.colors.fgColor.luminosity() > this.colors.bgColor.luminosity();
  },
  _updateSources: function _updateSources() {
    var srcObj = {
      kbps: this.attr("@debug-bandwidth")
    };
    var srcTpl = urlTemplates[srcObj.kbps ? "debug-bandwidth" : "original"];
    this.get("sources").forEach(function (item) {
      srcObj.src = item.get("src");
      item.set("original", srcTpl(srcObj));
    });
  } // _updateSourcesArr: function() {
  // 	var srcset = this.get("srcset");
  // 	if (Array.isArray(srcset)) {
  // 		var srcObj = { kbps: this.attr("@debug-bandwidth") };
  // 		var srcTpl = Globals.MEDIA_SRC_TPL[srcObj.kbps? "debug-bandwidth" : "original"];
  // 		srcset.forEach(function(o) {
  // 			srcObj.src = o.src;
  // 			o.original = srcTpl(srcObj);
  // 		}, this);
  // 	}
  // 	this.get("sources").reset(srcset);
  // },

});

}).call(this,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/model/BaseItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseItem.js","app/model/SelectableCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/SelectableCollection.js","app/model/item/SourceItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/SourceItem.js","color":"color","underscore":"underscore","utils/strings/stripTags":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/strings/stripTags.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/SourceItem.js":[function(require,module,exports){
(function (DEBUG){
"use strict";

/**
 * @module app/model/item/SourceItem
 * @requires module:backbone
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");
// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/** @type {String} */


var noCacheSuffix = "?" + Date.now();
/**
 * @constructor
 * @type {module:app/model/item/SourceItem}
 */
// module.exports = Backbone.Model.extend({

module.exports = BaseItem.extend({
  /** @type {Object} */
  defaults: {
    src: null,
    mime: null,
    w: null,
    h: null
  },
  getters: ["src", "original"],
  mutators: {
    src: {
      set: function set(key, value, options, _set) {
        if (DEBUG) {
          value += noCacheSuffix;
        }

        _set(key, value, options);
      }
    } // original: { 
    // 	transient: true,
    // 	get: function (key, value, options, set) {
    // 		return this.attributes.original || (this.attributes.original = this._composeOriginalSrc());
    // 	},
    // },
    // media: {
    // 	transient: true,
    // 	get: function () {
    // 		var retval;
    // 		if (this._noRecusion) {
    // 			console.log("%s::media returning null", this.cid);
    // 			retval = null;//this.id;
    // 		} else {
    // 			console.log("%s::media returning Object", this.cid);
    // 			this._noRecusion = true;
    // 			retval = this.attributes.media;
    // 			this._noRecusion = false;
    // 		}
    // 		return retval;
    // 	},
    // 	set: function (key, value, options, set) {
    // 		if (value instanceof BaseItem) {
    // 			set(key, value, options);
    // 		}
    // 	},
    // },

  } // initialize: function() {
  // 	if (DEBUG) {
  // 		var cb = function() {
  // 			// console.log("@debug-bandwidth:", JSON.stringify(this.get("media").attr("@debug-bandwidth")));
  // 			console.log("media:", JSON.stringify(this.toJSON()));
  // 			// if ((this.get("media") instanceof BaseItem) && this.get("media").attr("@debug-bandwidth")) {
  // 			// 	console.log("original", this.get("original"));
  // 			// 	console.log("media:", JSON.stringify(this.get("media").toJSON()));
  // 			// }
  // 		}.bind(this);
  // 		window.requestAnimationFrame(cb);
  // 	}
  // },
  // 
  // _composeOriginalSrc: function() {
  // 	var values = { src: this.get("src") };
  // 	if (this.has("media") && (values.kbps = this.get("media").attr("@debug-bandwidth"))) {
  // 	// if (this.has("media") && this.get("media").attrs().hasOwnProperty("@debug-bandwidth")) {
  // 	// 	values.kbps = this.get("media").attrs()["@debug-bandwidth"];
  // 		return Globals.MEDIA_SRC_TPL["debug-bandwidth"](values);
  // 	}
  // 	return Globals.MEDIA_SRC_TPL["original"](values);
  // },

});

}).call(this,true)

},{"app/model/BaseItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseItem.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/TypeItem.js":[function(require,module,exports){
"use strict";

/**
 * @module app/model/item/TypeItem
 */
// /** @type {module:backbone} */
// var Backbone = require("backbone");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/**
 * @constructor
 * @type {module:app/model/item/TypeItem}
 */


module.exports = BaseItem.extend({
  _domPrefix: "t",

  /** @type {Object} */
  defaults: {
    name: "",
    handle: "" // get kIds() { return []; },
    // get keywords() { return []; },

  }
});

},{"app/model/BaseItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/BaseItem.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/AppView.js":[function(require,module,exports){
(function (DEBUG,GTAG_ENABLED,_){
"use strict";

/**
 * @module app/view/AppView
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/utils/debug/traceArgs} */


var stripTags = require("utils/strings/stripTags");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/control/Controller} */


var controller = require("app/control/Controller");
/** @type {module:app/model/AppState} */


var AppState = require("app/model/AppState");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */


var articles = require("app/model/collection/ArticleCollection");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/NavigationView} */


var NavigationView = require("app/view/NavigationView");
/** @type {module:app/view/ContentView} */


var ContentView = require("app/view/ContentView");
/** @type {module:app/view/base/TouchManager} */


var TouchManager = require("app/view/base/TouchManager"); // /** @type {module:hammerjs} */
// const Hammer = require("hammerjs");
// /** @type {module:utils/touch/SmoothPanRecognizer} */
// const Pan = require("utils/touch/SmoothPanRecognizer");
// /** @type {module:hammerjs.Tap} */
// const Tap = Hammer.Tap;
// /** @type {module:utils/debug/traceElement} */
// const traceElement = require("utils/debug/traceElement");
//
// const vpanLogFn = _.debounce(console.log.bind(console), 100, false);
// const hpanLogFn = _.debounce(console.log.bind(console), 100, false);

/**
 * @constructor
 * @type {module:app/view/AppView}
 */


module.exports = View.extend({
  /** @override */
  cidPrefix: "app",

  /** @override */
  el: "html",
  // /** @override */
  className: "app",
  // without-bundle without-media without-article",

  /** @override */
  model: AppState,

  /** @override */
  events: {
    "visibilitychange": function visibilitychange(ev) {
      console.log("%s:[%s]", this.cid, ev.type);
    },
    "fullscreenchange": function fullscreenchange(ev) {
      console.log("%s:[%s] fullscreen: %o", this.cid, ev.type, document.fullscreenElement !== null, document.fullscreen);
    },
    "dragstart": function dragstart(ev) {
      if (ev.target.nodeName == "IMG" || ev.target.nodeName == "A") {
        ev.defaultPrevented || ev.preventDefault();
      }
    } // "touchmove body": function(ev) {
    // 	ev.defaultPrevented || ev.preventDefault();
    // },

  },
  properties: {
    container: {
      get: function get() {
        return this._container || (this._container = document.getElementById("container")); // (this._container = document.body);
      }
    },
    navigation: {
      get: function get() {
        return this._navigation || (this._navigation = document.getElementById("navigation"));
      }
    },
    content: {
      get: function get() {
        return this._content || (this._content = document.getElementById("content"));
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    var _this = this;

    /* elements */
    // this.routeEl = this.el;
    // this.stateEl = this.el
    this.breakpointEl = this.el;
    /* init HammerJS handlers */

    var vtouch, htouch, touchEl; // var vpan, hpan, tap;
    // this._vpanEnableFn = function(mc, ev) {
    // 	var retval = !this._hasOverflowY(this.container);
    // 	vpanLogFn("%s::_vpanEnableFn -> %o\n%o", this.cid, retval, arguments);
    // 	return retval;
    // }.bind(this);
    //
    // this._hpanEnableFn = function(mc, ev) {
    // 	var retval = this.model.get("withBundle") && this.model.get("collapsed");
    // 	hpanLogFn("%s::_hpanEnableFn -> %o\n%o", this.cid, retval, arguments);
    // 	return !!retval;
    // }.bind(this);

    touchEl = this.content; // touchEl = document.body;

    vtouch = htouch = TouchManager.init(touchEl); // vtouch.get("vpan").set({ enable: this._vpanEnableFn });
    // htouch.get("hpan").set({ enable: this._hpanEnableFn });
    // 		vtouch.set({
    // 			enable: function() {
    // 				console.log("app1::hammerjs enable", arguments);
    // 				return true;
    // 			}
    // 		});
    // hpan = vpan;
    // this.el.style.touchAction = "none"; //"pan-x pan-y";
    // tap = new Hammer.Tap();
    // hpan = new Pan({
    // 	event: "hpan",
    // 	direction: Hammer.DIRECTION_HORIZONTAL
    // });
    // hpan.set({
    // 	enable: this._hpanEnableFn
    // });
    // vpan = new Pan({
    // 	event: "vpan",
    // 	direction: Hammer.DIRECTION_VERTICAL
    // });
    // vpan.set({
    // 	enable: this._vpanEnableFn
    // });
    // hpan.requireFailure(vpan);
    // vpan.requireFailure(hpan);
    // vtouch.add([]);
    // htouch = vtouch = new Hammer.Manager(this.content);
    // htouch.add([tap, hpan, vpan]);
    // htouch.add([hpan, vpan]);
    // htouch.set({ touchAction: "pan-x pan-y" });
    // vpan = new Hammer(this.navigation, {
    // 	recognizers: [
    // 		[Pan, {
    // 			event: 'vpan',
    // 			touchAction: "pan-y",
    // 			direction: Hammer.DIRECTION_VERTICAL,
    // 			enable: vpanEnableFn
    // 		}],
    // 	]
    // });
    // hpan = new Hammer(this.content, {
    // 	recognizers: [
    // 		[Pan, {
    // 			event: 'hpan',
    // 			touchAction: "pan-x",
    // 			direction: Hammer.DIRECTION_HORIZONTAL,
    // 			enable: hpanEnableFn
    // 		}],
    // 		[Tap]
    // 	]
    // });
    // hpan.get("hpan").requireFailure(vpan.get("vpan"));
    // this._afterRender = this._afterRender.bind(this);

    this._onResize = this._onResize.bind(this);
    /* render on resize, onorientationchange, visibilitychange */
    // window.addEventListener("orientationchange", this._onResize, false);
    // window.addEventListener("resize", _.debounce(this._onResize.bind(this), 30, false), false);

    window.addEventListener("resize", this._onResize, false); // var h = function(ev) { console.log(ev.type, ev) };
    // window.addEventListener("scroll", h, false);
    // window.addEventListener("wheel", h, false);

    /* TODO: replace resize w/ mediaquery listeners. Caveat: some components
    (vg. Carousel) require update on resize */
    // this._onBreakpointChange = this._onBreakpointChange.bind(this);
    // Object.keys(Globals.BREAKPOINTS).forEach(function(s) {
    // 	Globals.BREAKPOINTS[s].addListeners(this._onBreakpointChange);
    // }, this);

    /* initialize controller/model listeners BEFORE views register their own */

    this.listenTo(controller, "route", this._onRoute); // this.listenTo(controller, "change:after", this._afterControllerChanged);

    this.listenTo(this.model, "change", this._onModelChange);
    /* FIXME */

    /* initialize views */

    this.navigationView = new NavigationView({
      el: this.navigation,
      model: this.model,
      vpan: vtouch,
      hpan: htouch
    });
    this.contentView = new ContentView({
      el: this.content,
      model: this.model,
      vpan: vtouch,
      hpan: htouch
    });
    /* TouchEvents fixups
     * ------------------------------- */
    // var traceTouchEvent = (msg, traceObj) => {
    // 	if (msg.hasOwnProperty("type")) {
    // 		msg = msg.type + " : " +
    // 			(msg.defaultPrevented ? "prevented" : "not prevented");
    // 	}
    // 	var sy, sh, ch;
    // 	sy = this.el.scrollTop;
    // 	sh = this.el.scrollHeight - 1;
    // 	ch = this.el.clientHeight;
    // 	console.log("%s:[%s] " +
    // 		"sy:[1>%o>=%s = %o] " +
    // 		"sh:[%o<=%o = %o] " +
    // 		"nav:[css:%o val:%o]",
    // 		this.cid, msg,
    // 		sy, sh - ch, (1 <= sy <= (sh - ch)),
    // 		sh, ch, (sh <= ch),
    // 		this.navigationView.el.style.height,
    // 		this.navigationView.el.scrollHeight,
    // 		traceObj || ""
    // 	);
    // };
    // var scrolltouch = new Hammer.Manager(this.el);
    // scrolltouch.add(new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL, threshold: 0 }));
    // scrolltouch.on("panmove", function(ev) {
    //
    // 	// var sy, sh, ch;
    // 	// sy = this.el.scrollTop;
    // 	// sh = this.el.scrollHeight - 1;
    // 	// ch = this.el.clientHeight;
    // 	//
    // 	// if ((1 > sy) && (ev.direction | Hammer.DIRECTION_DOWN)) {
    // 	// 	ev.preventDefault();
    // 	// 	console.log("%s:[panmove] %s", this.cid, "prevent at top");
    // 	// } else
    // 	// if ((sy > (sh - ch)) && (ev.direction | Hammer.DIRECTION_UP)) {
    // 	// 	ev.preventDefault();
    // 	// 	console.log("%s:[panmove] %s", this.cid, "prevent at bottom");
    // 	// }
    // 	if ((this.el.scrollHeight - 1) <= this.el.clientHeight) {
    // 		ev.srcEvent.preventDefault();
    // 	}
    // 	// traceTouchEvent(ev);
    // }.bind(this));

    var touchOpts = {
      capture: false,
      passive: false
    };

    var onTouchStart = function onTouchStart(ev) {
      _this.el.addEventListener("touchmove", onTouchMove, touchOpts);

      _this.el.addEventListener("touchend", onTouchEnd, touchOpts);

      _this.el.addEventListener("touchcancel", onTouchEnd, touchOpts);
    };

    var onTouchMove = function onTouchMove(ev) {
      if (!ev.defaultPrevented && _this.el.scrollHeight - 1 <= _this.el.clientHeight) {
        ev.preventDefault();
      } //traceTouchEvent(ev);

    };

    var onTouchEnd = function onTouchEnd(ev) {
      _this.el.removeEventListener("touchmove", onTouchMove, touchOpts);

      _this.el.removeEventListener("touchend", onTouchEnd, touchOpts);

      _this.el.removeEventListener("touchcancel", onTouchEnd, touchOpts);
    };

    this.el.addEventListener("touchstart", onTouchStart, {
      passive: true
    });

    var onMeasured = function onMeasured(view) {
      _this.setImmediate(function () {
        _this.requestAnimationFrame(function () {
          if (_this.el.scrollHeight - 1 <= _this.el.clientHeight) {
            _this.el.style.overflowY = "hidden";
          } else {
            _this.el.style.overflowY = "";
          }

          _this.el.scrollTop = 1; //traceTouchEvent("view:collapsed:measured");
        });
      });
    };

    this.listenTo(this.navigationView, "view:collapsed:measured", onMeasured);
    /* Google Analytics
     * ------------------------------- */
    // if (window.GTAG_ID) {
    // 	// let gaPageviewDisable = /(?:(localhost|\.local))$/.test(location.hostname) || window.GTAG_ID === "UA-0000000-0";
    // 	if (window.gtag) {
    // 		controller
    // 			.on("route", (name) => {
    // 				var page = Backbone.history.getFragment();
    // 				// Add a slash if neccesary
    // 				if (page.charAt(0) !== '/') {
    // 					page = '/' + page;
    // 				}
    // 				// page.replace(/^(?!\/)/, "/");
    // 				window.gtag('config', window.GTAG_ID, {
    // 					'page_title': page,
    // 					'page_path': page
    // 				});
    // 				console.warn("GTAG page set to '%s'", page);
    // 			});
    // 		// } else
    // 		// if (window.ga) {
    // 		// 	controller
    // 		// 		.once("route", () => {
    // 		// 			window.ga("create", window.GTAG_ID, "auto");
    // 		// 			// if localhost or dummy ID, disable analytics
    // 		// 			if (gaPageviewDisable) {
    // 		// 				window.ga("set", "sendHitTask", null);
    // 		// 			}
    // 		// 			console.warn("GA enabled tag '%s'", window.GTAG_ID);
    // 		// 		})
    // 		// 		.on("route", (name) => {
    // 		// 			var page = Backbone.history.getFragment();
    // 		// 			// Add a slash if neccesary
    // 		// 			if (page.charAt(0) !== '/') {
    // 		// 				page = '/' + page;
    // 		// 			}
    // 		// 			// page.replace(/^(?!\/)/, "/");
    // 		// 			window.ga("set", "page", page);
    // 		// 			window.ga("send", "pageview");
    // 		//
    // 		// 			console.warn("GA page set to '%s'", page);
    // 		// 		});
    // 	} else {
    // 		console.warn("GA/GTAG not loaded (LIB: %s, GA_ID: %s)", !!(window.ga || window.gtag), window.GTAG_ID);
    // 	}
    // } else {
    // 	console.warn("GA/GTAG not enabled (LIB: %s, GA_ID: %s)", !!(window.ga || window.gtag), window.GTAG_ID);
    // }
    // if (window.ga && window.GTAG_ID) {
    // 	controller
    // 		.once("route", () => {
    // 			window.ga("create", window.GTAG_ID, "auto");
    // 			// if localhost or dummy ID, disable analytics
    // 			if (/(?:(localhost|\.local))$/.test(location.hostname)
    // 				|| window.GTAG_ID == "XX-0000000-0") {
    // 				window.ga("set", "sendHitTask", null);
    // 				window.gtag('config', 'GA_TRACKING_ID', { 'send_page_view': false });
    // 				console.warn("GA disabled for localhost", window.GTAG_ID);
    // 			}
    // 		})
    // 		.on("route", (name) => {
    // 			var page = Backbone.history.getFragment();
    // 			// Add a slash if neccesary
    // 			if (page.charAt(0) !== '/') {
    // 				page = '/' + page;
    // 			}
    // 			// page.replace(/^(?!\/)/, "/");
    // 			window.ga("set", "page", page);
    // 			window.ga("send", "pageview");
    //
    // 			console.warn("GA page set to '%s'", page);
    // 		});
    // } else {
    // 	console.warn("GA not enabled (LIB: %s, GA_ENABLED: %s, GA_ID: %s)", !!window.ga, window.GA_ENABLED, window.GTAG_ID);
    // }
    // if (window.ga && window.GTAG_ID) {
    // 	controller.once("route", () => {
    // 		window.ga("create", window.GTAG_ID, "auto");
    // 	});
    // }
    // console.info("Git: %s", GIT_REV);

    console.info("Analytics GTAG_ENABLED: %s, GTAG_ID: %s, GA_LIB: %s", GTAG_ENABLED, window.GTAG_ID, !!window.ga);
    /* Startup listener, added last */

    this.listenToOnce(controller, "route", this._appStart);
    /* start router, which will request appropiate state */

    Backbone.history.start({
      pushState: false,
      hashChange: true
    });
  },

  /* -------------------------------
  /* _appStart
  /* ------------------------------- */
  _appStart: function _appStart(name, args) {
    console.info("%s::_appStart(%s, %s)", this.cid, name, args.join());
    this.skipTransitions = true;
    this.el.classList.add("skip-transitions");

    if (window.ga && window.GTAG_ID) {
      window.ga("create", window.GTAG_ID, "auto");
    }

    this.requestRender(View.MODEL_INVALID | View.SIZE_INVALID).requestChildrenRender(View.MODEL_INVALID | View.SIZE_INVALID).listenToOnce(this, "view:render:after", function (view, flags) {
      // this.setImmediate(function() {
      this.requestAnimationFrame(function () {
        console.log("%s::_appStart[view:render:after][raf]", this.cid);
        this.skipTransitions = false;
        this.el.classList.remove("skip-transitions");
        this.el.classList.remove("app-initial");
      });
    });
  },

  /* --------------------------- *
  /* route changed
  /* --------------------------- */
  _onRoute: function _onRoute(name, args) {
    console.info("%s::_onRoute %o -> %o", this.cid, this.model.get("routeName"), name); // var o = _.defaults({ routeName: name }, AppState.prototype.defaults);

    var o = {
      routeName: name,
      bundle: null,
      media: null,
      article: null,
      page: Backbone.history.getFragment().replace(/^(?!\/)/, "/")
    };

    switch (name) {
      case "media-item":
        o.bundle = bundles.selected; // o.withBundle = true;

        o.media = o.bundle.media.selected; // o.withMedia = true;

        o.collapsed = true;
        break;

      case "bundle-item":
        o.bundle = bundles.selected; // o.withBundle = true;

        o.collapsed = true;
        break;

      case "article-item":
        o.article = articles.selected; // o.withArticle = true;

        o.collapsed = true;
        break;

      case "bundle-list":
      case "notfound":
      case "root":
      default:
        o.collapsed = false;
        break;
    } // console.log("%s::_onRoute args: %o", this.cid, name, args);


    this.model.set(o);
  },

  /* --------------------------- *
  /* model changed
  /* --------------------------- */
  _onModelChange: function _onModelChange() {
    if (DEBUG) {
      console.groupCollapsed(this.cid + "::_onModelChange");
      console.groupCollapsed("changes");
      Object.keys(this.model.changedAttributes()).forEach(function (key) {
        console.info("%s::_onModelChange %s: %s -> %s", this.cid, key, this.model.previous(key), this.model.get(key));
      }, this);
      ["Article", "Bundle", "Media"].forEach(function (name) {
        var key = name.toLowerCase();
        var wName = "with".concat(name); // let logArgs = [
        // 	"%s::_onModelChange with%s: %o with%sChanged: %o", this.cid,
        // 	wName, this.has(key), name, this.hasAnyChanged(key)
        // ];
        // if (this.hasChanged(wName) !== this.hasAnyChanged(key)) {
        // 	console.error.apply(console, logArgs);
        // } else {
        // 	console.log.apply(console, logArgs);
        // }

        console.assert(this.hasChanged(wName) === this.hasAnyChanged(key), this);
      }, this.model);
      console.groupEnd();
      this.once("view:render:after", function (view, flags) {
        console.info("%s::_onModelChange [view:render:after]", view.cid);
        console.groupEnd();
      });
    }

    this.requestRender(View.MODEL_INVALID); // this.requestChildrenRender(View.MODEL_INVALID);
  },

  /* -------------------------------
  /* resize
  /* ------------------------------- */
  _onResize: function _onResize(ev) {
    console.group(this.cid + "::_onResize [event]");
    this.skipTransitions = true;
    this.el.classList.add("skip-transitions");
    this.requestRender(View.SIZE_INVALID) // .whenRendered().then(function(view) {
    .once("view:render:after", function (view, flags) {
      // this.requestChildrenRender(View.SIZE_INVALID, true);
      // this.setImmediate(function() {
      this.requestAnimationFrame(function () {
        console.info("%s::_onResize [view:render:after][raf]", view.cid);
        view.skipTransitions = false;
        this.el.scrollTop = 1;
        view.el.classList.remove("skip-transitions");
        console.groupEnd();
      });
    });
    if (document.fullscreenElement === null) this.renderNow();
  },

  /* -------------------------------
  /* render
  /* ------------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    console.log("%s::renderFrame [%s]", this.cid, View.flagsToString(flags));
    /* model: set route & model id classes */

    if (flags & View.MODEL_INVALID) {
      this.renderModelChange(flags);
    }
    /* size: check breakpoints and set classes*/


    if (flags & View.SIZE_INVALID) {
      _.each(Globals.BREAKPOINTS, function (o, s) {
        this.toggle(s, o.matches);
      }, this.breakpointEl.classList);
    }
    /* request children render:  always render now */


    this.requestChildrenRender(flags, true);
    /* request children render:  set 'now' flag if size is invalid */
    // this.requestChildrenRender(flags, flags & View.SIZE_INVALID);
    // if ((this.el.scrollHeight - 1) <= this.el.clientHeight) {
    // 	this.el.scrollTop = 1;
    // 	this.el.style.overflowY = "hidden";
    // } else {
    // 	this.el.style.overflowY = "";
    // }
    // this.navigationView.whenRendered().then(function(view) {
    // 	this.requestAnimationFrame(function() {
    // 		console.log("%s::renderFrame [raf] css:%o val:%o",
    // 			this.cid,
    // 			this.navigationView.el.style.height,
    // 			this.navigationView.el.scrollHeight,
    // 			this.el.scrollTop,
    // 			this.el.scrollHeight - 1,
    // 			this.el.clientHeight,
    // 			(this.el.scrollHeight - 1) <= this.el.clientHeight,
    // 			this.el.style.overflowY
    // 		);
    // 	});
    // }.bind(this));
  },

  /* -------------------------------
  /* body classes etc
  /* ------------------------------- */
  renderModelChange: function renderModelChange() {
    var cls = this.el.classList;
    var prevAttr = null;
    var hasDarkBg = false;
    var docTitle = [];
    docTitle.push(Globals.APP_NAME);

    if (this.model.get("bundle")) {
      docTitle.push(stripTags(this.model.get("bundle").get("name")));

      if (this.model.get("media")) {
        docTitle.push(stripTags(this.model.get("media").get("name")));
      }
    } else if (this.model.get("article")) {
      docTitle.push(stripTags(this.model.get("article").get("name")));
    }

    docTitle = _.unescape(docTitle.join(" / "));
    document.title = docTitle;
    var metaTitle = docTitle;
    var metaUrl = document.location.origin + document.location.pathname + document.location.hash;
    document.head.querySelector("meta[property='og:title']").setAttribute("content", metaTitle);
    document.head.querySelector("meta[property='og:url']").setAttribute("content", metaUrl);
    document.head.querySelector("link[rel='canonical']").setAttribute("href", metaUrl);

    if (window.ga && window.GTAG_ID) {
      window.ga('send', {
        'hitType': 'pageview',
        'page': this.model.get("page"),
        'title': docTitle
      });
    }
    /* Set route class */


    if (this.model.hasChanged("routeName")) {
      prevAttr = this.model.previous("fromRouteName");

      if (prevAttr) {
        cls.remove("from-route-" + prevAttr);
      }

      cls.add("from-route-" + this.model.get("fromRouteName"));
      prevAttr = this.model.previous("routeName");

      if (prevAttr) {
        cls.remove("route-" + prevAttr);
      }

      cls.add("route-" + this.model.get("routeName"));
    }
    /* Set model id classes for color styles */


    ["article", "bundle", "media"].forEach(function (prop) {
      var item = this.model.get(prop);

      if (this.model.hasChanged(prop)) {
        prevAttr = this.model.previous(prop);

        if (prevAttr) {
          cls.remove(prevAttr.get("domid"));
        }

        if (item) {
          cls.add(item.get("domid"));
        }
      }

      cls.toggle("with-" + prop, !!item);
      cls.toggle("without-" + prop, !item);
      hasDarkBg |= item && item.colors && item.colors.hasDarkBg;
    }.bind(this));
    /* flag dark background */

    cls.toggle("color-dark", hasDarkBg);
  }
}, {
  getInstance: function getInstance() {
    if (!(window.app instanceof this)) {
      window.app = new this({
        model: new AppState()
      });
    }

    return window.app;
  }
});

if (DEBUG) {
  module.exports = function (AppView) {
    /** @type {module:app/debug/DebugToolbar} */
    var DebugToolbar = require("app/debug/DebugToolbar");

    return AppView.extend({
      initialize: function initialize() {
        var retval;
        var view = new DebugToolbar({
          id: "debug-toolbar",
          model: this.model
        });
        document.body.appendChild(view.render().el);
        retval = AppView.prototype.initialize.apply(this, arguments);
        this._logFlags["view.trace"] = true;
        this.navigationView._logFlags["view.trace"] = true;
        return retval;
      }
    });
  }(module.exports);
}

}).call(this,true,false,require("underscore"))

},{"app/control/Controller":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Controller.js","app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/debug/DebugToolbar":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/debug/DebugToolbar.js","app/model/AppState":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/AppState.js","app/model/collection/ArticleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/ArticleCollection.js","app/model/collection/BundleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/BundleCollection.js","app/view/ContentView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/ContentView.js","app/view/NavigationView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/NavigationView.js","app/view/base/TouchManager":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/TouchManager.js","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","backbone":"backbone","underscore":"underscore","utils/strings/stripTags":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/strings/stripTags.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/ContentView.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/ContentView
 */

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/TransformHelper} */


var TransformHelper = require("utils/TransformHelper"); // /** @type {module:app/view/base/TouchManager} */
// var TouchManager = require("app/view/base/TouchManager");

/** @type {module:app/control/Controller} */


var controller = require("app/control/Controller");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */


var articles = require("app/model/collection/ArticleCollection"); // /** @type {module:app/model/collection/BundleItem} */
// var BundleItem = require("app/model/item/BundleItem");

/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/component/ArticleView} */


var ArticleView = require("app/view/component/ArticleView");
/** @type {module:app/view/component/CollectionStack} */


var CollectionStack = require("app/view/component/CollectionStack");
/** @type {module:app/view/component/CollectionStack} */


var SelectableListView = require("app/view/component/SelectableListView");
/** @type {module:app/view/render/DotNavigationRenderer} */


var DotNavigationRenderer = require("app/view/render/DotNavigationRenderer");
/** @type {module:app/view/component/Carousel} */


var Carousel = require("app/view/component/Carousel");
/** @type {module:app/view/render/CarouselRenderer} */


var CarouselRenderer = require("app/view/render/CarouselRenderer");
/** @type {module:app/view/render/ImageRenderer} */


var ImageRenderer = require("app/view/render/ImageRenderer");
/** @type {module:app/view/render/VideoRenderer} */


var VideoRenderer = require("app/view/render/VideoRenderer");
/** @type {module:app/view/render/SequenceRenderer} */


var SequenceRenderer = require("app/view/render/SequenceRenderer"); // /** @type {module:app/view/component/CanvasProgressMeter} */
// var ProgressMeter = require("app/view/component/CanvasProgressMeter");

/** @type {Function} */


var carouselEmptyTemplate = require("./template/Carousel.EmptyRenderer.Bundle.hbs");
/** @type {Function} */


var mediaStackTemplate = require("./template/CollectionStack.Media.hbs"); // var transitionEnd = View.prefixedEvent("transitionend");


var transformProp = View.prefixedProperty("transform");
var transitionProp = View.prefixedProperty("transition");
var tx = Globals.transitions; // var clickEvent = window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */

module.exports = View.extend({
  /** @override */
  cidPrefix: "contentView",

  /** @override */
  className: "container-expanded",

  /** @override */
  events: {
    "transitionend .adding-child": "_onAddedTransitionEnd",
    "transitionend .removing-child": "_onRemovedTransitionEnd" // "transitionend": "_onTransitionEnd",

  },

  /** @override */
  initialize: function initialize(options) {
    _.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal", "_onCollapsedEvent");

    this.transforms = new TransformHelper(); // this.touch = options.touch || new Error("no touch"); //TouchManager.getInstance();

    this.vpan = options.vpan || new Error("no vpan");
    this.hpan = options.hpan || new Error("no hpan");
    this.listenTo(this.model, "change", this._onModelChange); // disconnect children before last change
    // this.listenTo(bundles, "deselect:one", this._onDeselectOneBundle);

    this.skipTransitions = true;
    this.itemViews = []; // this.progressWrapper = this.createProgressWrapper(),
    // this.el.appendChild(this.progressWrapper.el);
  },

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    // values
    var collapsed = this.model.get("collapsed");
    var collapsedChanged = flags & View.MODEL_INVALID && this.model.hasChanged("collapsed");
    var childrenChanged = flags & View.MODEL_INVALID && (this.model.hasChanged("bundle") || this.model.hasChanged("article")); // flags

    var sizeChanged = !!(flags & View.SIZE_INVALID);
    var transformsChanged = !!(flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID));
    transformsChanged = transformsChanged || this._transformsChanged || this.skipTransitions; // debug
    // - - - - - - - - - - - - - - - - -
    // if (flags & View.MODEL_INVALID) {
    // 	console.group(this.cid + "::renderFrame model changed:");
    // 	Object.keys(this.model.changed).forEach(function(key) {
    // 		console.log("\t%s: %s -> %s", key, this.model._previousAttributes[key], this.model.changed[key]);
    // 	}, this);
    // 	console.groupEnd();
    // }
    // model:children
    // - - - - - - - - - - - - - - - - -

    if (childrenChanged) {
      this.removeChildren();

      if (bundles.selected) {
        this.createChildren(bundles.selected);
      } else if (articles.selected) {
        this.createChildren(articles.selected);
      }
    } // model:collapsed
    // - - - - - - - - - - - - - - - - -


    if (collapsedChanged) {
      this.el.classList.toggle("container-collapsed", collapsed);
      this.el.classList.toggle("container-expanded", !collapsed);
    } // size
    // - - - - - - - - - - - - - - - - -


    if (sizeChanged) {
      this.transforms.clearAllCaptures();
    } // transforms
    // - - - - - - - - - - - - - - - - -


    if (transformsChanged) {
      this.el.classList.remove("container-changing");

      if (this.skipTransitions) {
        this.transforms.stopAllTransitions();
        this.el.classList.remove("container-changed");

        if (!childrenChanged) {
          // this.transforms.clearAllOffsets();
          if (collapsedChanged) {
            this._setChildrenEnabled(collapsed);
          }
        }
      } else {
        if (!childrenChanged) {
          if (collapsedChanged) {
            var afterTransitionsFn;
            this.el.classList.add("container-changed"); // this.transforms.clearAllOffsets();

            if (collapsed) {
              // container-collapsed, enable last
              afterTransitionsFn = function afterTransitionsFn() {
                this._setChildrenEnabled(true);

                this.el.classList.remove("container-changed");
              };

              this.transforms.runAllTransitions(tx.LAST);
            } else {
              // container-expanded, disable first
              afterTransitionsFn = function afterTransitionsFn() {
                this.el.classList.remove("container-changed");
              };

              this._setChildrenEnabled(false);

              this.transforms.runAllTransitions(tx.FIRST);
            }

            afterTransitionsFn = afterTransitionsFn.bind(this);
            this.transforms.whenAllTransitionsEnd().then(afterTransitionsFn, afterTransitionsFn);
          } else {
            this.transforms.items.forEach(function (o) {
              if (o.hasOffset) {
                o.runTransition(tx.NOW); // o.clearOffset();
              }
            });
          }
        }
      }

      if (!childrenChanged) {
        this.transforms.clearAllOffsets();
      }

      this.transforms.validate();
    }

    if (sizeChanged) {
      this.itemViews.forEach(function (view) {
        view.skipTransitions = this.skipTransitions;
        view.requestRender(View.SIZE_INVALID).renderNow();
      }, this);
      /*Promise.all(this.itemViews.map(function(view) {
      		view.skipTransitions = this.skipTransitions;
      		return view.requestRender(View.SIZE_INVALID).whenRendered();
      	}, this))
      	.then(
      		function(views) {
      			var nh = this.el.offsetParent.offsetHeight - this.el.offsetTop;
      			// var oh = views.reduce(function(h, view) {
      			// 	return Math.max(h, view.el.offsetHeight);
      			// }, nh);
      			// oh++;
      			// console.log("%s:[whenRendered] [result: %s %s] %o", this.cid,
      			// 	nh, oh, this.el.parent, views);
      			this.el.style.minHeight = nh + "px";
      			return views;
      		}.bind(this),
      		function(reason) {
      			console.warn("%s:[whenRendered] [rejected] %o", this.cid, reason);
      			return reason;
      		}.bind(this)
      	);*/
    }

    this.skipTransitions = this._transformsChanged = false;
  },
  _setChildrenEnabled: function _setChildrenEnabled(enabled) {
    // if (enabled) {
    // 	this.el.removeEventListener("click", this._onCollapsedClick, false);
    // } else {
    // 	this.el.addEventListener("click", this._onCollapsedClick, false);
    // }
    this.itemViews.forEach(function (view) {
      view.setEnabled(enabled);
    });
  },

  /* -------------------------------
  /* Collapse UI gestures/events
  /* ------------------------------- */
  _onCollapsedEvent: function _onCollapsedEvent(ev) {
    console.log("%s:[%s -> _onCollapsedEvent] target: %s", this.cid, ev.type, ev.target);

    if (!ev.defaultPrevented && this.model.has("bundle") && !this.model.get("collapsed") && !this.enabled) {
      // this.setImmediate(function() {
      // if (ev.type == "click") ev.stopPropagation();
      ev.preventDefault();
      this.setImmediate(function () {
        // if (ev.type == "click") ev.stopPropagation();
        this.model.set("collapsed", true);
      }); // });
    }
  },

  /* --------------------------- *
  /* model changed
  /* --------------------------- */
  _onModelChange: function _onModelChange() {
    if (this.model.hasAnyChanged("bundle")) {
      if (this.model.has("bundle")) {
        this.vpan.on("vpanstart", this._onVPanStart);
      } else {
        this.vpan.off("vpanstart", this._onVPanStart);
      }
    }
    /*
    if (this.model.hasChanged("withBundle") ||
    	this.model.hasChanged("collapsed")) {
    	if (this.model.get("withBundle") &&
    		!this.model.get("collapsed")) {
    		this.hpan.on("hpanleft hpanright", this._onCollapsedEvent);
    		this.el.addEventListener(View.CLICK_EVENT, this._onCollapsedEvent, false);
    	} else {
    		this.hpan.off("hpanleft hpanright", this._onCollapsedEvent);
    		this.el.removeEventListener(View.CLICK_EVENT, this._onCollapsedEvent, false);
    	}
    }
    */


    this.requestRender(View.MODEL_INVALID);
  },

  /* -------------------------------
  /* Vertical touch/move (_onVPan*)
  /* ------------------------------- */
  _collapsedOffsetY: Globals.COLLAPSE_OFFSET,
  _onVPanStart: function _onVPanStart(ev) {
    this.vpan.on("vpanmove", this._onVPanMove);
    this.vpan.on("vpanend vpancancel", this._onVPanFinal);
    this.transforms.stopAllTransitions(); // this.transforms.clearAllOffsets();
    // this.transforms.validate();

    this.transforms.clearAllCaptures();
    this.el.classList.add("container-changing");

    this._onVPanMove(ev);
  },
  _onVPanMove: function _onVPanMove(ev) {
    var collapsed = this.model.get("collapsed");
    var delta = ev.deltaY; //ev.thresholdDeltaY;

    var maxDelta = this._collapsedOffsetY; // + Math.abs(ev.thresholdOffsetY);
    // check if direction is aligned with collapsed/expand

    var isValidDir = collapsed ? delta > 0 : delta < 0;
    var moveFactor = collapsed ? Globals.VPAN_DRAG : 1 - Globals.VPAN_DRAG;
    delta = Math.abs(delta); // remove sign

    delta *= moveFactor;
    maxDelta *= moveFactor;

    if (isValidDir) {
      if (delta > maxDelta) {
        // overshooting
        delta = (delta - maxDelta) * Globals.VPAN_OUT_DRAG + maxDelta;
      } else {// no overshooting
        // delta = delta;
      }
    } else {
      delta = -delta * Globals.VPAN_OUT_DRAG; // delta is opposite
    }

    delta *= collapsed ? 1 : -1; // reapply sign

    this.transforms.offsetAll(0, delta);
    this.transforms.validate();
  },
  _onVPanFinal: function _onVPanFinal(ev) {
    this.vpan.off("vpanmove", this._onVPanMove);
    this.vpan.off("vpanend vpancancel", this._onVPanFinal); // FIXME: model.collapsed may have already changed, _onVPanMove would run with wrong values:
    // model.collapsed is changed in a setImmediate callback from NavigationView.

    this._onVPanMove(ev);

    this.setImmediate(function () {
      this._transformsChanged = true;
      this.requestRender();
    });
  },
  // willCollapsedChange: function(ev) {
  // 	var collapsed = this.model.get("collapsed");
  // 	return ev.type == "vpanend"? collapsed?
  // 		ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
  // 		ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
  // 		false;
  // },

  /* -------------------------------
  /* create/remove children on bundle selection
  /* ------------------------------- */

  /** Create children on bundle select */
  createChildren: function createChildren(model) {
    var view;

    if (model.__proto__.constructor === bundles.model) {
      // will be attached to dom in this order
      view = this.createMediaCaptionStack(model);
      this.itemViews.push(view);
      this.transforms.add(view.el);
      view = this.createMediaCarousel(model);
      this.itemViews.push(view);
      this.transforms.add(view.el);
      view = this.createMediaDotNavigation(model);
      this.itemViews.push(view);
    } else if (model.__proto__.constructor === articles.model) {
      view = this.createArticleView(model);
      this.itemViews.push(view);
    }

    this.itemViews.forEach(function (view) {
      if (!this.skipTransitions) {
        view.el.classList.add("adding-child");
        view.el.style.opacity = 0;
      }

      this.el.appendChild(view.el);
      view.render();
    }, this);

    if (!this.skipTransitions) {
      this.requestAnimationFrame(function () {
        console.log("%s::createChildren::[callback:requestAnimationFrame]", this.cid);
        this.itemViews.forEach(function (view) {
          if (!this.skipTransitions) {
            view.el.style[transitionProp] = "opacity " + tx.LAST.cssText;
          }

          view.el.style.removeProperty("opacity");
        }, this);
      });
    }
  },
  removeChildren: function removeChildren() {
    this.itemViews.forEach(function (view, i, arr) {
      this.transforms.remove(view.el);

      if (this.skipTransitions) {
        view.remove();
      } else {
        var s = window.getComputedStyle(view.el);

        if (s.opacity == "0" || s.visibility == "hidden") {
          console.log("%s::removeChildren [view:%s] removed immediately (invisible)", this.cid, view.cid);
          view.remove();
        } else {
          view.el.classList.add("removing-child");
          if (s[transformProp]) view.el.style[transformProp] = s[transformProp];
          view.el.style[transitionProp] = "opacity " + tx.FIRST.cssText;
          view.el.style.opacity = 0;
        }
      }

      arr[i] = null;
    }, this);
    this.itemViews.length = 0;
  },
  _onAddedTransitionEnd: function _onAddedTransitionEnd(ev) {
    if (ev.target.cid && this.childViews.hasOwnProperty(ev.target.cid)) {
      console.log("%s::_onAddedTransitionEnd [view:%s] [prop:%s] [ev:%s]", this.cid, ev.target.cid, ev.propertyName, ev.type);
      var view = this.childViews[ev.target.cid];
      view.el.classList.remove("adding-child");
      view.el.style.removeProperty(transitionProp);
    }
  },
  _onRemovedTransitionEnd: function _onRemovedTransitionEnd(ev) {
    if (ev.target.cid && this.childViews.hasOwnProperty(ev.target.cid)) {
      console.log("%s::_onRemovedTransitionEnd [view:%s] [prop:%s] [ev:%s]", this.cid, ev.target.cid, ev.propertyName, ev.type);
      var view = this.childViews[ev.target.cid];
      view.el.classList.remove("removing-child");
      view.remove();
    }
  },
  // purgeChildren: function() {
  // 	var i, el, els = this.el.querySelectorAll(".removing-child");
  // 	for (i = 0; i < els.length; i++) {
  // 		el = els.item(i);
  // 		if (el.parentElement === this.el) {
  // 			try {
  // 				console.error("%s::purgeChildren", this.cid, el.getAttribute("data-cid"));
  // 				View.findByElement(el).remove();
  // 			} catch (err) {
  // 				console.error("s::purgeChildren", this.cid, "orphaned element", err);
  // 				this.el.removeChild(el);
  // 			}
  // 		}
  // 	}
  // },

  /* -------------------------------
  /* Components
  /* ------------------------------- */

  /**
   * media-carousel
   */
  createMediaCarousel: function createMediaCarousel(bundle) {
    // Create carousel
    var EmptyRenderer = CarouselRenderer.extend({
      className: "carousel-item empty-item",
      model: bundle,
      template: carouselEmptyTemplate
    });

    var rendererFunction = function rendererFunction(item, index, arr) {
      if (index === -1) {
        return EmptyRenderer;
      }

      switch (item.attr("@renderer")) {
        case "video":
          return VideoRenderer;

        case "sequence":
          return SequenceRenderer;

        case "image":
          return ImageRenderer;

        default:
          return ImageRenderer;
      }
    };

    var view = new Carousel({
      className: "media-carousel " + bundle.get("domid"),
      collection: bundle.get("media"),
      rendererFunction: rendererFunction,
      requireSelection: !!bundle.attr("@no-desc"),
      // direction: Carousel.DIRECTION_HORIZONTAL,
      touch: this.hpan
    });
    controller.listenTo(view, {
      "view:select:one": function viewSelectOne(model) {
        console.log("%s:[view:select:one] %s", view.cid, model.cid);
        controller.selectMedia(model);
      },
      "view:select:none": controller.deselectMedia // "view:removed": controller.stopListening

    });
    view.listenTo(bundle, "deselected", function () {
      this.stopListening(this.collection);
      controller.stopListening(this);
    });
    return view;
  },

  /**
   * media-caption-stack
   */
  createMediaCaptionStack: function createMediaCaptionStack(bundle) {
    var view = new CollectionStack({
      className: "media-caption-stack",
      collection: bundle.get("media"),
      template: mediaStackTemplate
    });
    view.listenTo(bundle, "deselected", function () {
      this.stopListening(this.collection);
    });
    return view;
  },

  /**
   * media-dotnav
   */
  createMediaDotNavigation: function createMediaDotNavigation(bundle) {
    var view = new SelectableListView({
      className: "media-dotnav dots-fontface color-fg05",
      collection: bundle.get("media"),
      renderer: DotNavigationRenderer
    });
    controller.listenTo(view, {
      "view:select:one": controller.selectMedia,
      "view:select:none": controller.deselectMedia // "view:removed": controller.stopListening

    });
    view.listenTo(bundle, "deselected", function () {
      this.stopListening(this.collection);
      controller.stopListening(this);
    });
    return view;
  },

  /**
   * @param el {module:app/model/item/ArticleView}
   * @return {module:app/view/base/View}
   */
  createArticleView: function createArticleView(article) {
    var view = new ArticleView({
      model: article
    });
    return view;
  } // createProgressWrapper: function() {
  // 	// var view = new ProgressMeter({
  // 	// 	id: "media-progress-wrapper",
  // 	// 	// className: "color-bg color-fg05",
  // 	// 	useOpaque: false,
  // 	// 	labelFn: function() { return "0%"; }
  // 	// });
  // 	// this.el.appendChild(this.progressWrapper.el);
  // 	// return view;
  // 	return null;
  // },

});

}).call(this,require("underscore"))

},{"./template/Carousel.EmptyRenderer.Bundle.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/Carousel.EmptyRenderer.Bundle.hbs","./template/CollectionStack.Media.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/CollectionStack.Media.hbs","app/control/Controller":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Controller.js","app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/model/collection/ArticleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/ArticleCollection.js","app/model/collection/BundleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/BundleCollection.js","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","app/view/component/ArticleView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/ArticleView.js","app/view/component/Carousel":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/Carousel.js","app/view/component/CollectionStack":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/CollectionStack.js","app/view/component/SelectableListView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/SelectableListView.js","app/view/render/CarouselRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/CarouselRenderer.js","app/view/render/DotNavigationRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/DotNavigationRenderer.js","app/view/render/ImageRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ImageRenderer.js","app/view/render/SequenceRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/SequenceRenderer.js","app/view/render/VideoRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/VideoRenderer.js","underscore":"underscore","utils/TransformHelper":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/TransformHelper.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/NavigationView.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/NavigationView
 */

/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:utils/TransformHelper} */


var TransformHelper = require("utils/TransformHelper"); // /** @type {module:app/view/base/TouchManager} */
// var TouchManager = require("app/view/base/TouchManager");

/** @type {module:app/control/Controller} */


var controller = require("app/control/Controller");
/** @type {module:app/model/collection/TypeCollection} */


var types = require("app/model/collection/TypeCollection");
/** @type {module:app/model/collection/KeywordCollection} */


var keywords = require("app/model/collection/KeywordCollection");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */


var articles = require("app/model/collection/ArticleCollection");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/component/FilterableListView} */


var FilterableListView = require("app/view/component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */


var GroupingListView = require("app/view/component/GroupingListView"); // /** @type {module:app/view/component/CollectionPager} */
// var CollectionPager = require("app/view/component/CollectionPager");

/** @type {module:app/view/component/GraphView} */


var GraphView = require("app/view/component/GraphView");
/** @type {module:app/view/component/ArticleButton} */


var ArticleButton = require("app/view/component/ArticleButton"); // /** @type {module:utils/prefixedProperty} */
// var prefixedProperty = require("utils/prefixedProperty");
// var traceElement = require("utils/debug/traceElement");


var tx = Globals.transitions;

var txNow = _.clone(tx.NOW);

txNow.easing = "ease"; // var hTx = _.clone(collapsed ? tx.LAST : tx.FIRST);
// hTx.easing = "ease";

/**
 * @constructor
 * @type {module:app/view/NavigationView}
 */

module.exports = View.extend({
  // /** @override */
  // tagName: "div",

  /** @override */
  cidPrefix: "navigationView",

  /** @override */
  className: "navigation container-expanded",

  /** @override */
  initialize: function initialize(options) {
    _.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");

    _.bindAll(this, "_onHPanStart", "_onHPanMove", "_onHPanFinal");

    _.bindAll(this, "_onNavigationClick"); // _.bindAll(this, "_whenTransitionsEnd", "_whenTransitionsAbort");
    // _.bindAll(this, "_whenListsRendered");
    // this._metrics = {
    // 	minHeight: 0
    // };


    this.itemViews = [];
    this.transforms = new TransformHelper(); // this.touch = options.touch || new Error("no touch"); //TouchManager.getInstance();

    this.vpan = options.vpan || new Error("no vpan");
    this.hpan = options.hpan || new Error("no hpan");
    this.listenTo(this.model, "change", this._onModelChange);
    this.listenTo(keywords, "select:one select:none", this._onKeywordSelect); // this.listenTo(this.model, "withBundle:change", this._onwithBundleChange);

    this.vpanGroup = this.el.querySelector("#vpan-group"); // this.el.style.touchAction = "none";
    // this.el.style.webkitUserSelect = "none";
    // this.el.style.webkitUserDrag = "none";

    this.keywordList = this.createKeywordList();
    this.bundleList = this.createBundleList();
    this.itemViews.push(this.keywordList);
    this.itemViews.push(this.bundleList);
    this.graph = this.createGraphView(this.bundleList, this.keywordList, this.vpanGroup);
    this.sitename = this.createSitenameButton();
    this.about = this.createAboutButton();
    /* NOTE: .list-group .label moves horizontally (cf. sass/layouts/*.scss) */

    this.hGroupings = this.keywordList.el.querySelectorAll(".list-group .label");
    this.transforms.add(this.vpanGroup, this.bundleList.wrapper, this.keywordList.wrapper, this.bundleList.el, this.keywordList.el, this.hGroupings, this.sitename.wrapper, this.about.wrapper, this.sitename.el, this.about.el, this.graph.el); // this.itemViews.push(this.graph);
    // this.listenTo(this.graph, {
    // 	"canvas:update": this._onGraphUpdate,
    // 	"canvas:redraw": this._onGraphRedraw,
    // });

    /*this.listenTo(this.graph, "view:render:before", function(view, flags) {
    	var vmax;
    	if (!view.el.style.height) {
    		// if (flags & (View.SIZE_INVALID | View.MODEL_INVALID)) {
    		// if ((this.bundleList.renderFlags | View.SIZE_INVALID) ||
    		// 	(this.keywordList.renderFlags | View.SIZE_INVALID)) {
    		// }
    		vmax = Math.max(
    			this.bundleList._metrics.height,
    			this.keywordList._metrics.height
    		);
    		if (_.isNumber(vmax)) {
    			view.el.style.height = vmax + "px";
    			console.log("%s:[view:render:before][once]:%s [%s] heights:[%i, %i] (max %i)",
    				this.cid, view.cid, View.flagsToString(flags),
    				this.bundleList._metrics.height,
    				this.keywordList._metrics.height,
    				vmax);
    		}
    	}
    });*/
    // this.listenTo(this.bundleList, "view:render:after", function(view, flags) {
    // 	console.info("%s:[view:render:after %s]", this.cid, view.cid, View.flagsToString(flags & View.SIZE_INVALID));
    // 		if (flags & View.SIZE_INVALID) {
    // 			// console.info("%s:[%s view:render:after] bundleList height", this.cid, view.cid, this.bundleList.el.style.height);
    // 			// this.graph.el.style.height = this.bundleList.el.style.height;
    // 			this.graph.el.style.opacity = this.bundleList.collapsed? 0 : 1;
    // 			this.graph.requestRender(View.SIZE_INVALID).renderNow();
    // 	// 	}
    // });
    // this.listenTo(this.bundleList, "view:render:after", this._onListResize);
    // this.listenTo(this.keywordList, "view:render:after", this._onListResize);
  },

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    if (flags & View.MODEL_INVALID) {
      if (this.model.hasChanged("collapsed")) {
        this.el.classList.toggle("container-collapsed", this.model.get("collapsed"));
        this.el.classList.toggle("container-expanded", !this.model.get("collapsed"));
      }

      if (this.model.hasChanged("collapsed") || this.model.hasChanged("withBundle")) {
        this.el.classList.add("container-changing");
      }

      if (this.model.hasChanged("routeName")) {
        this.bundleList.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
        this.keywordList.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
      }
    } // transforms
    // - - - - - - - - - - - - - - - - -


    if (this.skipTransitions || flags & View.ALL_INVALID) {
      // (flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID))) {
      // if (transformsChanged) {
      if (this.skipTransitions) {
        this.transforms.stopAllTransitions();
        this.transforms.validate();
        this.transforms.clearAllOffsets();
      } else {
        this.renderTransitions(flags);
      }

      this.transforms.validate(); // console.log("%s::renderFrame %o", this.cid,
      // 	this.transforms.items.map(function(o) {
      // 		return traceElement(o.el) + ":" +
      // 			(o.hasTransition ? o.transition.name : "-");
      // 	}));
    } // if (this.model.hasChanged("collapsed") && this.model.get("collapsed")) {
    // 	this.el.style.height = "";
    // 	// this.el.style.minHeight = hval + "px";
    // 	this.graph.el.style.height = "";
    // }
    // promise handlers
    // - - - - - - - - - - - - - - - - -


    var measureRenderedLists = function (result) {
      // var hval = result.reduce(function(a, o) {
      // 	return Math.max(a, o.metrics.height);
      // }, 0);
      var hval = Math.max(this.bundleList.metrics.height, this.keywordList.metrics.height);

      if (this.model.get("collapsed")) {
        this.el.style.height = ""; // this.el.style.minHeight = hval + "px";

        this.graph.el.style.height = "";
      } else {
        this.el.style.height = hval + "px"; // this.el.style.minHeight = "";

        this.graph.el.style.height = hval + "px";
      } // this.el.style.height = this.model.get("collapsed") ? "" : "100%";
      // this.vpanGroup.style.height = hval;


      this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
      console.log("%s:[whenListsRenderedDone] height set to %s", this.cid, this.model.get("collapsed") ? hval + "px" : "[not set]", result);
      this.trigger("view:collapsed:measured", this);
      return result;
    }.bind(this);

    var toggleGraph = function (result) {
      this.graph.enabled = !this.model.get("collapsed");
      this.graph.valueTo("a2b", 0, 0);

      if (!this.model.get("collapsed")) {
        this.graph.valueTo("a2b", 1, Globals.TRANSITION_DURATION);
      }

      return result;
    }.bind(this);

    var whenCollapsedChangeDone = function (result) {
      console.log("%s:[whenCollapsedChangeDone][flags: %s]", this.cid, View.flagsToString(flags), result);
      this.el.classList.remove("container-changing");
      this.trigger("view:collapsed:end", this);
      return result;
    }.bind(this); // promises
    // - - - - - - - - - - - - - - - - -


    var p; // p = Promise.all([
    // 		this.bundleList.whenRendered(),
    // 		this.keywordList.whenRendered(),
    // 		this.bundleList.whenCollapseChangeEnds(),
    // 		this.keywordList.whenCollapseChangeEnds(),
    // 		this.transforms.whenAllTransitionsEnd(),
    // 	]);

    p = Promise.all([this.bundleList.whenCollapseChangeEnds(), this.keywordList.whenCollapseChangeEnds()]).then(measureRenderedLists);

    if (flags & View.MODEL_INVALID && this.model.hasChanged("collapsed")) {
      p = p.then(toggleGraph);
    }

    p.then(this.transforms.whenAllTransitionsEnd()).then(whenCollapsedChangeDone, function (reason) {
      console.error(reason);
    }).catch(function (reason) {
      console.warn("%s::renderFrame promise rejected", this.cid);
    }.bind(this));
    /*
    var whenListsRendered = Promise.all([
    	this.bundleList.whenRendered(),
    	this.keywordList.whenRendered()
    ]);
    	var whenTransformsEnd = this.transforms.promise();
    	whenListsRendered.then(
    	whenListsRenderedDone,
    	function(reason) {
    		console.warn("%s:[whenListsRendered] failed: %o", this.cid, reason);
    		return reason;
    	}.bind(this)
    );
    	Promise.all([
    	whenListsRendered,
    	whenTransformsEnd
    ])
    	.then(
    		function(result) {
    			console.log("%s:[whenListsRendered+whenTransformsEnd] [%s]", this.cid, View.flagsToString(flags), result);
    			this.el.classList.remove("container-changing");
    			this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    		}.bind(this),
    		function(reason) {
    			console.warn("%s:[whenListsRendered+whenTransformsEnd] [%s]", this.cid, View.flagsToString(flags), reason);
    			this.el.classList.remove("container-changing");
    			this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    		}.bind(this)
    	);*/
    // trace result handlers
    // - - - - - - - - - - - - - - - - -

    /*if (this.model.hasChanged("collapsed")) {
    	var msgBase = this.model.get("collapsed") ? "collaps" : "expand";
    	Promise.all([
    		Promise.all([
    				this.bundleList.whenRendered(),
    				this.keywordList.whenRendered()
    			])
    			.then(
    				function() {
    					console.log("nav-tx:%sing", msgBase, arguments);
    				}),
    		this.transforms.promise()
    	])
    		.catch(
    			function() {
    				console.warn("nav-tx:%sed [rejected]", msgBase, arguments);
    			})
    		.finally(
    			function() {
    				console.log("nav-tx:%sed", msgBase, arguments);
    			}
    		);
    }*/
    // graph
    // - - - - - - - - - - - - - - - - -
    // if ((flags & (View.SIZE_INVALID | ~View.MODEL_INVALID))
    // 	/* collapsed has not changed, no bundle selected */
    // 	&& !this.model.hasChanged("collapsed")
    // 	&& !this.model.get("withBundle")) {
    // 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    // 	if (!this.skipTransitions) {
    // 		this.graph.renderNow();
    // 	}
    // }
    // else
    // if ((flags & View.SIZE_INVALID) && !this.model.get("collapsed")) {
    // 	/* NavigationView has resized while uncollapsed,
    // 	but model is unchanged */
    // 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    // }
    // children loop
    // - - - - - - - - - - - - - - - - -

    this.itemViews.forEach(function (view) {
      // view.skipTransitions = view.skipTransitions || this.skipTransitions;
      if (this.skipTransitions) {
        view.skipTransitions = true;
      }

      if (flags & View.SIZE_INVALID) {
        view.requestRender(View.SIZE_INVALID);
      } // if (!view.skipTransitions) {


      view.renderNow(); // }
    }, this);
    this.requestAnimationFrame(function () {
      this.skipTransitions = false;
    });
  },

  /*_whenListsRendered: function(result) {
  	var hval;
  	if (this.model.get("collapsed")) {
  		this.el.style.height = "";
  		// this.graph.el.style.height = "100%";
  	} else {
  		// hval = result.reduce(function(a, o) {
  		// 	return Math.max(a, o.metrics.height);
  		// }, 0);
  		hval = Math.max(
  			this.bundleList.metrics.height,
  			this.keywordList.metrics.height);
  		this.el.style.height = hval + "px";
  		// this.graph.el.style.height = hval + "px";
  	}
  	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
  	console.log("%s:[_whenListsRendered] height set to %opx", this.cid, hval ? hval : "[empty]", arguments);
  	return result
  },
  	_whenTransitionsEnd: function(result) {
  	console.info("%s::_whenTransitionsEnd", this.cid);
  	this.el.classList.remove("container-changing");
  	// if (!Globals.BREAKPOINTS["medium-wide"].matches)
  	// 	return;
  	// if (!this.model.get("collapsed")) {
  	// 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID); //.renderNow();
  	// }
  	return result;
  },
  	_whenTransitionsAbort: function(reason) {
  	console.warn("%s::_whenTransitionsAbort %o", this.cid, reason);
  	this.el.classList.remove("container-changing");
  	// if (!Globals.BREAKPOINTS["medium-wide"].matches)
  	// 	return;
  	// if (!this.model.get("collapsed")) {
  	// 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID); //.renderNow();
  	// }
  	return result;
  },*/

  /* -------------------------------
  /* renderTransitions
  /* ------------------------------- */
  renderTransitions: function renderTransitions(flags) {
    var modelChanged = flags & View.MODEL_INVALID;
    var fromRoute = this.model.get("fromRouteName");
    var toRoute = this.model.get("routeName");
    var routeChanged = modelChanged && this.model.hasChanged("routeName");
    /* bundle */

    var withBundle = this.model.has("bundle");
    var withBundleChanged = modelChanged && this.model.hasAnyChanged("bundle");
    var bundleChanged = modelChanged && this.model.hasChanged("bundle");
    /* media */

    var withMedia = this.model.has("media");
    var withMediaChanged = modelChanged && this.model.hasAnyChanged("media"); //var mediaChanged = modelChanged && this.model.hasChanged("media");

    /* article */
    // var withArticle = this.model.has("article");

    var withArticleChanged = modelChanged && this.model.hasAnyChanged("article"); //var articleChanged = modelChanged && this.model.hasChanged("article");

    /* collapsed */

    var collapsed = this.model.get("collapsed");
    var collapsedChanged = modelChanged && this.model.hasChanged("collapsed");
    var tf;
    /* this.vpanGroup */

    tf = this.transforms.get(this.vpanGroup);

    if (tf && tf.hasOffset) {
      tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
      tf.clearOffset();
    }
    /* this.bundleList.el */
    // tf = this.transforms.get(this.bundleList.el);
    // if (tf.hasOffset) {
    // 	tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
    // 	tf.clearOffset();
    // }

    /* this.keywordList.el */
    // tf = this.transforms.get(this.keywordList.el);
    // if (tf.hasOffset) {
    // 	tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
    // 	tf.clearOffset();
    // }

    /* this.graph.el */
    // tf = this.transforms.get(this.graph.el);
    // if (tf && tf.hasOffset) {
    // 	tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
    // 	tf.clearOffset();
    // }

    /*
     * NOTE:
     * Vertical:
     *		site-name-wrapper,
     *		article-list-wrapper
     * Horizontal:
     *		site-name,
     *		article-buttons,
     *		keywordList.wrapper,
     *		bundleList.wrapper,
     *		hGroupings
     */


    if (Globals.BREAKPOINTS["medium-wide"].matches || Globals.BREAKPOINTS["medium-wide-stretch"].matches) {
      /* HORIZONTAL: keywordList.wrapper */
      tf = this.transforms.get(this.keywordList.wrapper);

      if (collapsedChanged && !withArticleChanged) {
        // if (collapsedChanged) {
        if (withBundleChanged) {
          if (withMediaChanged) tf.runTransition(withBundle ? tx.LAST : tx.FIRST);
        } else {
          if (withMedia) tf.runTransition(collapsed ? tx.LAST : tx.FIRST);
        }
      } else {
        if (!withBundleChanged && withMediaChanged) tf.runTransition(bundleChanged ? tx.BETWEEN : txNow); //tx.NOW);
      }

      if (tf.hasOffset) tf.clearOffset();
      /* HORIZONTAL: the rest */

      if (collapsedChanged ^ withArticleChanged) {
        this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.sitename.el, this.about.el, this.bundleList.wrapper); // if (fromRoute != 'article-item' && toRoute != 'media-item') {

        this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.hGroupings); // }
      }
      /* VERTICAL */


      if (routeChanged && (fromRoute == 'root' || toRoute == 'root')) {
        this.transforms.runTransition(tx.BETWEEN, this.sitename.wrapper, this.about.wrapper);
      }
      /* this.hGroupings */
      // if (collapsedChanged ^ withArticleChanged) {
      // 	// if (collapsedChanged && !withArticleChanged) {
      // 	this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.hGroupings);
      // }
      // if (collapsedChanged) {
      // 	if (!withArticleChanged) {
      // 		// if (fromRoute == 'root' || toRoute == 'root') {
      // 		this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.bundleList.wrapper);
      // 	}
      // } else {
      // 	if (withArticleChanged && withBundleChanged) {
      // 		this.transforms.runTransition(withArticle ? tx.BETWEEN : tx.LAST, this.bundleList.wrapper);
      // 	}
      // }

    } else if (Globals.BREAKPOINTS["small-stretch"].matches) {
      // if (collapsedChanged ) {
      if (collapsedChanged ^ withArticleChanged) {
        this.transforms.runTransition(collapsed ? tx.FIRST : tx.LAST, this.sitename.el, this.about.el);
      }
    } else {
      if (withBundleChanged) {
        this.transforms.runTransition(tx.BETWEEN, this.sitename.el, this.about.el);
      }
    } // this.transforms.clearOffset(
    // 	// this.bundleList.el,
    // 	// this.keywordList.el,
    // 	this.bundleList.wrapper);

  },

  /* --------------------------- *
  /* own model changed
  /* --------------------------- */
  _onModelChange: function _onModelChange() {
    // 	this.setImmediate(this.commitModel);
    // },
    //
    // commitModel: function() {
    // this.requestRender(View.MODEL_INVALID | View.LAYOUT_INVALID);
    this.requestRender(View.MODEL_INVALID); // keywords.deselect();

    if (this.model.hasChanged("collapsed")) {
      if (this.model.get("collapsed")) {
        // clear keyword selection
        keywords.deselect();
      } // else {}


      this.keywordList.collapsed = this.model.get("collapsed");
      this.bundleList.collapsed = this.model.get("collapsed");
    }

    if (this.model.hasChanged("bundle")) {
      this.bundleList.selectedItem = this.model.get("bundle");
      this.keywordList.refreshFilter(); // if (!this.model.get("collapsed") && this.graph) {
      // 	this.listenToOnce(this.keywordList, "view:render:after", function(view, flags) {
      // 		console.log("%s::_onBundleSelect -> %s:[view:render:after] flags:%s", this.cid, view.cid, View.flagsToString(flags));
      // 		this.graph.valueTo( "a2b", 0,  0);
      // 		// this.graph.renderNow();
      // 		this.graph.valueTo( "a2b", 1,  Globals.TRANSITION_DURATION);
      // 	});
      // }
      // keywords.deselect();
      // this.graph && this.graph.requestRender(View.SIZE_INVALID);
    } // var clickEv = "click";//View.CLICK_EVENT


    if (this.model.hasChanged("withBundle")) {
      // this.keywordList.refreshFilter()
      if (this.model.get("withBundle")) {
        this.el.addEventListener(View.CLICK_EVENT, this._onNavigationClick);
        this.vpan.on("vpanstart", this._onVPanStart);
        this.hpan.on("hpanstart", this._onHPanStart); // this.hpan.on("tap", this._onTap);
      } else {
        this.el.removeEventListener(View.CLICK_EVENT, this._onNavigationClick);
        this.vpan.off("vpanstart", this._onVPanStart);
        this.hpan.off("hpanstart", this._onHPanStart);
        keywords.deselect(); // this.hpan.off("tap", this._onTap);
      } // this.graph.valueTo()

    }
  },
  // _onwithBundleChange: function(withBundle) {
  // 	if (withBundle) {
  // 		this.listenTo(this.model, "collapsed:change", function(collapsed){
  //
  // 		});
  // 	} else {
  // 		this.stopListening(this.model, "collapsed:change", function(collapsed){
  //
  // 		});
  // 	}
  // },

  /* --------------------------- *
  /* keyword collection changed
  /* --------------------------- */
  _onKeywordSelect: function _onKeywordSelect(keyword) {
    // use collection listener to avoid redundant refreshFilter calls
    if (!this.model.get("collapsed") && this.graph) {
      this.listenToOnce(this.bundleList, "view:render:after", function (view, flags) {
        // console.log("%s::_onKeywordSelect -> %s:[view:render:after] flags:%s", this.cid, view.cid, View.flagsToString(flags));
        this.graph.valueTo("b2a", 0, 0);
        this.graph.valueTo("b2a", 1, Globals.TRANSITION_DURATION);
      });
    }

    this.bundleList.refreshFilter();
  },

  /* --------------------------- *
  /* UI Events: bundleList keywordList buttons
  /* --------------------------- */
  _onNavigationClick: function _onNavigationClick(ev) {
    console.log("%s::_onNavigationClick [%s] defaultPrevented:%s", this.cid, ev.type, ev.defaultPrevented);
    if (ev.defaultPrevented) return; // if (ev.target !== this.graph.el && ev.target !== this.el) return;

    ev.preventDefault();

    if (this.model.has("bundle")) {
      // this.transforms.offset(0, 1, this.graph.el);
      // this.transforms.validate();
      // this._setCollapsed(!this.model.get("collapsed"));
      // this.setImmediate(function() {
      this.model.set("collapsed", !this.model.get("collapsed")); // });
    }
  },
  _setCollapsed: function _setCollapsed(value) {
    if (value !== this.model.get("collapsed")) {
      // this.transforms.offset(0, 1, this.graph.el);
      // this.transforms.validate();
      this.setImmediate(function () {
        // console.log("%s::_setCollapsed -> %s (setImmediate)", this.cid, value);
        this.model.set("collapsed", value);
      });
    }
  },

  /* -------------------------------
  /* Horizontal touch/move (HammerJS)
  /* ------------------------------- */
  _onHPanStart: function _onHPanStart(ev) {
    this.transforms.get(this.keywordList.wrapper).stopTransition().clearOffset().validate(); // if (this.model.get("layoutName") != "left-layout"
    // 	&& this.model.get("layoutName") != "default-layout") {
    // 	return;
    // }

    if ((Globals.BREAKPOINTS["medium-wide"].matches || Globals.BREAKPOINTS["medium-wide-stretch"].matches) && this.model.get("routeName") === "bundleItem" && this.model.get("bundle").get("media").selectedIndex <= 0 && this.model.get("collapsed")) {
      this.transforms.get(this.keywordList.wrapper).clearCapture();

      this._onHPanMove(ev);

      this.hpan.on("hpanmove", this._onHPanMove);
      this.hpan.on("hpanend hpancancel", this._onHPanFinal);
    }
  },
  _onHPanMove: function _onHPanMove(ev) {
    // var HPAN_DRAG = 1;
    // var HPAN_DRAG = 0.75;
    var HPAN_DRAG = 720 / 920;
    var delta = ev.deltaX; //ev.thresholdDeltaX;
    // var mediaItems = this.model.get("bundle").get("media");

    if (this.model.has("media")) {
      delta *= ev.offsetDirection & Hammer.DIRECTION_LEFT ? 0.0 : HPAN_DRAG;
    } else {
      delta *= ev.offsetDirection & Hammer.DIRECTION_LEFT ? HPAN_DRAG : Globals.HPAN_OUT_DRAG;
    }

    this.transforms.offset(delta, null, this.keywordList.wrapper);
    this.transforms.validate();
  },
  _onHPanFinal: function _onHPanFinal(ev) {
    this.hpan.off("hpanmove", this._onHPanMove);
    this.hpan.off("hpanend hpancancel", this._onHPanFinal);
    /* NOTE: if there is no model change, set tx here. Otherwise just wait for render */

    var kTf = this.transforms.get(this.keywordList.wrapper);

    if (!(this._renderFlags & View.MODEL_INVALID) && kTf.hasOffset) {
      if (kTf.offsetX != 0) {
        kTf.runTransition(tx.NOW);
      }

      kTf.clearOffset().validate();
    }
  },

  /* -------------------------------
  /* Vertical touch/move (_onVPan*)
  /* ------------------------------- */
  _collapsedOffsetY: Globals.COLLAPSE_OFFSET,
  _onVPanStart: function _onVPanStart(ev) {
    this.vpan.on("vpanmove", this._onVPanMove);
    this.vpan.on("vpanend vpancancel", this._onVPanFinal);
    this.transforms.stopTransition(this.vpanGroup);
    this.transforms.clearCapture(this.vpanGroup); // this.transforms.stopTransition(this.bundleList.el, this.keywordList.el); //, this.graph.el);
    // // this.transforms.clearOffset(this.bundleList.el, this.keywordList.el);
    // // this.transforms.validate();
    // this.transforms.clearCapture(this.bundleList.el, this.keywordList.el); //, this.graph.el);
    //
    // if (!this.model.get("collapsed")) {
    // 	this.transforms.stopTransition(this.graph.el);
    // 	this.transforms.clearCapture(this.graph.el);
    // }
    // // this.el.classList.add("container-changing");
    // this._onVPanMove(ev);
  },
  _onVPanMove: function _onVPanMove(ev) {
    var delta = this._computeVPanDelta(ev.deltaY); //ev.thresholdDeltaY);


    this.transforms.offset(0, delta, this.vpanGroup); // this.transforms.offset(0, delta,
    // 	this.bundleList.el, this.keywordList.el);
    // if (!this.model.get("collapsed")) {
    // 	this.transforms.offset(0, delta, this.graph.el);
    // }

    this.transforms.validate();
  },
  _onVPanFinal: function _onVPanFinal(ev) {
    this.vpan.off("vpanmove", this._onVPanMove);
    this.vpan.off("vpanend vpancancel", this._onVPanFinal); // this._onVPanMove(ev);
    // this.transforms.validate();

    this.setImmediate(function () {
      // this.transforms.clearOffset(this.bundleList.el, this.keywordList.el, this.graph.el);
      if (this.willCollapsedChange(ev)) {
        // this._setCollapsed(!this.model.get("collapsed"));
        this.model.set("collapsed", !this.model.get("collapsed"));
      }

      this.requestRender(View.LAYOUT_INVALID); //.renderNow();
    });
  },
  willCollapsedChange: function willCollapsedChange(ev) {
    return ev.type == "vpanend" ? this.model.get("collapsed") ? ev.deltaY > Globals.COLLAPSE_THRESHOLD : ev.deltaY < -Globals.COLLAPSE_THRESHOLD : false;
  },
  _computeVPanDelta: function _computeVPanDelta(delta) {
    var collapsed = this.model.get("collapsed");
    var maxDelta = this._collapsedOffsetY; // + Math.abs(ev.thresholdOffsetY);
    // check if direction is aligned with collapsed/expand

    var isValidDir = collapsed ? delta > 0 : delta < 0;
    var moveFactor = collapsed ? 1 - Globals.VPAN_DRAG : Globals.VPAN_DRAG;
    delta = Math.abs(delta); // remove sign

    delta *= moveFactor;
    maxDelta *= moveFactor;

    if (isValidDir) {
      if (delta > maxDelta) {
        // overshooting
        delta = (delta - maxDelta) * Globals.VPAN_OUT_DRAG + maxDelta;
      } else {// no overshooting
        // delta = delta;
      }
    } else {
      delta = -delta * Globals.VPAN_OUT_DRAG; // delta is opposite
    }

    delta *= collapsed ? 0.5 : -1; // reapply sign

    return delta;
  },

  /* -------------------------------
  /* Create children components
  /* ------------------------------- */
  // -------------------------------
  // #site-name
  // -------------------------------
  createSitenameButton: function createSitenameButton() {
    var view = new View({
      el: "#site-name",
      events: {
        "click a": function clickA(domev) {
          domev.defaultPrevented || domev.preventDefault();
          this.trigger("view:click");
        }
      }
    });
    view.wrapper = view.el.parentElement;
    this.listenTo(view, "view:click", this._onSitenameClick);
    return view;
  },
  _onSitenameClick: function _onSitenameClick() {
    switch (this.model.get("routeName")) {
      case "media-item":
      case "bundle-item":
        // if (this.model.get("collapsed")) {
        // 	this._setCollapsed(false);
        // } else {
        controller.deselectBundle(); // }

        break;

      case "article-item":
        controller.deselectArticle();
        break;
    }
  },
  // -------------------------------
  // .article-button
  // -------------------------------
  createArticleButton: function createArticleButton(articleItem) {
    var view = new ArticleButton({
      el: ".article-button[data-handle='about']",
      model: articleItem
    }).render();
    view.wrapper = view.el.parentElement;
    this.listenTo(view, "view:click", this._onArticleClick);
    return view;
  },
  _onArticleClick: function _onArticleClick(item) {
    switch (this.model.get("routeName")) {
      case "article-item":
        controller.deselectArticle();
        break;

      case "root":
      default:
        controller.selectArticle(item);
        break;
    }
  },
  createAboutButton: function createAboutButton() {
    return this.createArticleButton(articles.findWhere({
      handle: "about"
    }));
  },
  // -------------------------------
  // #bundle-list
  // -------------------------------

  /**
   * @param el {HTMLElement}
   * @return {module:app/base/view/component/FilterableListView}
   */
  createBundleList: function createBundleList(el) {
    var view = new FilterableListView({
      el: "#bundle-list",
      collection: bundles,
      collapsed: false,
      filterFn: function filterFn(bundle, index, arr) {
        return keywords.selected ? bundle.get("kIds").indexOf(keywords.selected.id) !== -1 : false;
      }
    });
    view.wrapper = view.el.parentElement;
    this.listenTo(view, "view:select:one view:select:none", function (bundle) {
      this.setImmediate(function () {
        controller.selectBundle(bundle);
      });
    });
    this.listenTo(view, "view:select:same", this._onBundleListSame);
    return view;
  },
  _onBundleListSame: function _onBundleListSame(bundle) {
    // this.transforms.offset(0, 1, this.graph.el);
    // this.transforms.validate();
    // this.setImmediate(function() {
    this.model.set("collapsed", !this.model.get("collapsed")); // });
  },
  // -------------------------------
  // #keyword-list
  // -------------------------------

  /**
   * @param el {HTMLElement}
   * @return {module:app/base/view/component/GroupingListView}
   */
  createKeywordList: function createKeywordList(el) {
    var view = new GroupingListView({
      el: "#keyword-list",
      collection: keywords,
      collapsed: false,
      filterFn: function filterFn(item, idx, arr) {
        return bundles.selected ? bundles.selected.get("kIds").indexOf(item.id) !== -1 : false;
      },
      groupingFn: function groupingFn(item, idx, arr) {
        return types.get(item.get("tId"));
      }
    });
    view.wrapper = view.el.parentElement;
    view.listenTo(keywords, "select:one select:none", function (item) {
      view.selectedItem = item;
    });
    this.listenTo(view, "view:select:one view:select:none", this._onKeywordListChange);
    return view;
  },
  _onKeywordListChange: function _onKeywordListChange(keyword) {
    if (!this.model.get("collapsed")) {
      keywords.select(keyword);
    }
  },
  // -------------------------------
  // #nav-graph
  // -------------------------------

  /**
   * @param listA {module:app/base/view/component/FilterableListView}
   * @param listB {module:app/base/view/component/FilterableListView}
   * @param parentEl {HTMLElement}
   * @return {module:app/base/view/component/GraphView}
   */
  createGraphView: function createGraphView(listA, listB, parentEl) {
    var view = new GraphView({
      id: "nav-graph",
      listA: listA,
      listB: listB,
      model: this.model,
      useOpaque: false
    });
    parentEl || (parentEl = this.el);
    parentEl.insertBefore(view.el, parentEl.firstElementChild);
    return view;
  }
  /* -------------------------------
  /* Horizontal touch/move (MutationObserver)
  /* ------------------------------- */

  /*
  _beginTransformObserve: function() {
  	if (!(Globals.BREAKPOINTS["medium-wide"].matches && this.model.get("bundle").get("media").selectedIndex <= 0 && this.model.get("collapsed"))) {
  		return;
  	}
  	var target = document.querySelector(".carousel > .empty-item");
  	if (target === null) {
  		return;
  	}
  	if (!this._transformObserver) {
  		this._transformObserver = new MutationObserver(this._onTransformMutation);
  	}
  	this._transformObserver.observe(target, { attributes: true, attributeFilter: ["style"] });
  	this.hpan.on("hpanend hpancancel", this._endTransformObserve);
  	this.transforms.get(this.keywordList.wrapper)
  		.stopTransition()
  		.clearOffset()
  		.clearCapture()
  		.validate();
  },
  	_endTransformObserve: function() {
  	this._transformObserver.disconnect();
  	this.hpan.off("hpanend hpancancel", this._endTransformObserve);
  	this.transforms.get(this.keywordList.wrapper)
  		.clearOffset()
  		.runTransition(tx.NOW)
  		.validate();
  },
  	_onTransformMutation: function(mutations) {
  	var tView, tMetrics, tCss, dTxObj, pos;
  		// this.keywordList.wrapper.style[prefixedProperty("transform")];
  	// transform = mutations[0].target.style.getPropertyValue(prefixedProperty("transform"));
  		tView = View.findByElement(mutations[0].target);
  	if (tView) {
  		tMetrics = tView.metrics;
  		dTxObj = this.transforms.get(this.keywordList.wrapper);
  		console.log("%s::_onTransformMutation [withMedia: %s] target: (%f\+%f) %f wrapper: (%f) %f", this.cid,
  			this.model.has("media"),
  			tMetrics.translateX, tMetrics.width, tMetrics.translateX + tMetrics.width,
  			dTxObj.capturedX, tMetrics.translateX - dTxObj.capturedX,
  			tMetrics
  		);
  			this.transforms.offset(tMetrics.translateX - dTxObj.capturedX, void 0, this.keywordList.wrapper);
  		this.transforms.validate();
  	}
  },
  */

});

}).call(this,require("underscore"))

},{"app/control/Controller":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Controller.js","app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/model/collection/ArticleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/ArticleCollection.js","app/model/collection/BundleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/BundleCollection.js","app/model/collection/KeywordCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/KeywordCollection.js","app/model/collection/TypeCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/TypeCollection.js","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","app/view/component/ArticleButton":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/ArticleButton.js","app/view/component/FilterableListView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/FilterableListView.js","app/view/component/GraphView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/GraphView.js","app/view/component/GroupingListView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/GroupingListView.js","hammerjs":"hammerjs","underscore":"underscore","utils/TransformHelper":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/TransformHelper.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/CallbackQueue.js":[function(require,module,exports){
"use strict";

var PriorityQueue = function PriorityQueue(offset) {
  this._offset = offset | 0;
  this._items = [];
  this._priorities = [];
  this._numItems = 0;
};

PriorityQueue.prototype = Object.create({
  enqueue: function enqueue(item, priority) {
    var i = this._items.length;
    this._items[i] = item;
    this._priorities[i] = {
      priority: priority | 0,
      index: i
    };
    this._numItems++; // console.log("FrameQueue::RequestQueue::enqueue() [numItems:%i] ID:%i", this._numItems, this._offset + i);

    return this._offset + i;
  },
  contains: function contains(index) {
    index -= this.offset;
    return 0 <= index && index < this._items.length;
  },
  skip: function skip(index) {
    var i, item;
    i = index - this._offset;

    if (0 > i || i >= this._items.length) {
      // 	console.warn("FrameQueue::RequestQueue::skip(id:%i) out of range (%i-%i)", index, this._offset, this._offset + (this._numItems - 1));
      return void 0;
    }

    item = this._items[i];

    if (item !== null) {
      // if (item = this._items[i]) {
      this._items[i] = null;
      this._numItems--;
    }

    return item;
  },
  indexes: function indexes() {
    var items = this._priorities.concat();

    items.sort(function (a, b) {
      if (a.priority > b.priority) return 1;
      if (a.priority < b.priority) return -1;
      return 0;
    });
    items.forEach(function (o, i, a) {
      a[i] = o.index;
    }, this);
    return items;
  },
  items: function items() {
    var items = this._priorities.concat();

    items.sort(function (a, b) {
      if (a.priority > b.priority) return 1;
      if (a.priority < b.priority) return -1;
      return 0;
    });
    items.forEach(function (o, i, a) {
      a[i] = this._items[o.index];
    }, this);
    return items;
  },
  _empty: function _empty(offset) {
    this._offset = offset;
    this._items.length = 0;
    this._priorities.length = 0;
    this._numItems = 0;
  }
}, {
  offset: {
    get: function get() {
      return this._offset;
    }
  },
  length: {
    get: function get() {
      return this._items.length;
    }
  },
  numItems: {
    get: function get() {
      return this._numItems;
    }
  }
});

var CallbackQueue = function CallbackQueue(requestFn, cancelFn) {
  this._nextQueue = new PriorityQueue(0);
  this._currQueue = null; // this._pending = false;

  this._running = false;
  this._runId = -1;
  this._requestFn = requestFn;
  this._cancelFn = cancelFn;
  this._runQueue = this._runQueue.bind(this);
};

CallbackQueue.prototype = Object.create({
  /**
   * @param tstamp {int}
   */
  _runQueue: function _runQueue() {
    if (this._running) throw new Error("wtf!!!");
    this._currQueue = this._nextQueue;
    this._nextQueue = new PriorityQueue(this._currQueue.offset + this._currQueue.length);
    this._runId = -1;
    this._running = true;
    var i, item;

    var indexes = this._currQueue.indexes();

    var items = this._currQueue._items;

    for (i = 0; i < indexes.length; i++) {
      item = items[indexes[i]];

      if (item !== null) {
        item.apply(null, arguments);
      }
    } // var self = this;
    // this._currQueue.indexes().forEach(function(index) {
    // 	var fn = self._currQueue._items[index];
    // 	if (fn !== null) {
    // 		fn.apply(null, arguments);
    // 	}
    // });


    this._running = false;
    this._currQueue = null;

    if (this._nextQueue.numItems > 0) {
      this._runId = this._requestFn.call(null, this._runQueue); // this._runId = this._requestFn(this._runQueue);
    }
  },

  /**
   * @param fn {Function}
   * @param priority {int}
   * @return {int}
   */
  request: function request(fn, priority) {
    // if (!this._running && !this._pending) {
    // 	this._pending = true;
    // 	console.warn("FrameQueue::request setImmediate: pending");
    // 	setImmediate(function() {
    // 		this._pending = false;
    // 		if (this._nextQueue.numItems > 0) {
    // 			this._runId = window.requestAnimationFrame(_runQueue);
    // 			console.warn("FrameQueue::request setImmediate: raf:%i for %i items", this._runId, this._nextQueue.numItems);
    // 		} else {
    // 			console.warn("FrameQueue::request setImmediate: no items");
    // 		}
    // 	});
    // }
    if (!this._running && this._runId === -1) {
      this._runId = this._requestFn.call(null, this._runQueue); // this._runId = this._requestFn(this._runQueue);
    }

    return this._nextQueue.enqueue(fn, priority);
  },

  /**
   * @param id {int}
   * @return {Function?}
   */
  cancel: function cancel(id) {
    var fn;

    if (this._running) {
      fn = this._currQueue.skip(id) || this._nextQueue.skip(id);
    } else {
      fn = this._nextQueue.skip(id);

      if (this._runId !== -1 && this._nextQueue.numItems === 0) {
        this._cancelFn.call(null, this._runId); // this._cancelFn(this._runId);


        this._runId = -1;
      }
    }

    return fn;
  }
}, {
  running: {
    get: function get() {
      return this._running;
    }
  }
});
module.exports = CallbackQueue;

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/CanvasView.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* global Path2D */

/**
 * @module app/view/component/progress/CanvasView
 */
// /** @type {module:color} */
// var Color = require("color");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/view/base/Interpolator} */


var Interpolator = require("app/view/base/Interpolator");
/** @type {module:utils/css/getBoxEdgeStyles} */


var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

var MIN_CANVAS_RATIO = 1; // /Firefox/.test(window.navigator.userAgent)? 2 : 1;

/**
 * @constructor
 * @type {module:app/view/component/progress/CanvasView}
 */

var CanvasView = View.extend({
  /** @type {string} */
  cidPrefix: "canvasView",

  /** @type {string} */
  tagName: "canvas",

  /** @type {string} */
  className: "canvas-view",
  properties: {
    paused: {
      get: function get() {
        return this._paused;
      },
      set: function set(paused) {
        paused = !!paused;

        if (this._interpolator.paused !== paused) {
          this._interpolator.paused = paused;

          if (!paused) {
            this.requestRender();
          }
        }
      }
    },
    context: {
      get: function get() {
        return this._ctx;
      }
    },
    interpolator: {
      get: function get() {
        return this._interpolator;
      }
    },
    canvasRatio: {
      get: function get() {
        return this._canvasRatio;
      }
    }
  },

  /** @type {Object} */
  defaults: {
    values: {
      value: 0
    },
    maxValues: {
      value: 1
    },
    paused: false,
    useOpaque: false
  },

  /* --------------------------- *
   * children/layout
   * --------------------------- */

  /** @override */
  initialize: function initialize(options) {
    // TODO: cleanup this options mess
    options = _.defaults(options || {}, this.defaults);
    options.values = _.defaults(options.values || {}, this.defaults.values);
    options.maxValues = _.defaults(options.maxValues || {}, this.defaults.maxValues);
    this._interpolator = new Interpolator(options.values, options.maxValues);
    this._interpolator.paused = options.paused;
    this._useOpaque = options.useOpaque;
    this._options = _.pick(options, "color", "backgroundColor"); // opaque background
    // --------------------------------

    var ctxOpts = {}; // if (this._useOpaque) {
    // 	this._opaqueProp = Modernizr.prefixed("opaque", this.el, false);
    // 	if (this._opaqueProp) {
    // 		this.el[this._opaqueProp] = true;
    // 	} else {
    // 		ctxOpts.alpha = true;
    // 	}
    // 	this.el.classList.add("color-bg");
    // }
    // canvas' context init
    // --------------------------------

    this._ctx = this.el.getContext("2d", ctxOpts); // adjust canvas size to pixel ratio
    // upscale the canvas if the two ratios don't match
    // --------------------------------

    var ratio = MIN_CANVAS_RATIO;
    var ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;

    if (window.devicePixelRatio !== ctxRatio) {
      // ratio = Math.max(window.devicePixelRatio / ctxRatio, MIN_CANVAS_RATIO);
      ratio = window.devicePixelRatio / ctxRatio;
      ratio = Math.max(ratio, MIN_CANVAS_RATIO);
    }

    this._canvasRatio = ratio; // console.log("%s::init canvasRatio: %f", this.cid, this._canvasRatio);

    this.listenTo(this, "view:attached", function () {
      // this.invalidateSize();
      // this.renderNow();
      this.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
    });
  },
  // _computeCanvasRatio: function() {
  // 	var ratio = MIN_CANVAS_RATIO;
  // 	var ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;
  // 	if (window.devicePixelRatio !== ctxRatio) {
  // 		// ratio = Math.max(window.devicePixelRatio / ctxRatio, MIN_CANVAS_RATIO);
  // 		ratio = window.devicePixelRatio / ctxRatio;
  // 		ratio = Math.max(ratio, MIN_CANVAS_RATIO);
  // 	}
  // 	this._canvasRatio = ratio;
  // },
  _updateCanvas: function _updateCanvas() {
    // adjust canvas size to pixel ratio
    // upscale the canvas if the two ratios don't match
    // --------------------------------
    var s = getComputedStyle(this.el); // this._canvasWidth = this.el.offsetWidth;
    // this._canvasHeight = this.el.offsetHeight;

    this._canvasWidth = this.el.scrollWidth;
    this._canvasHeight = this.el.scrollHeight;

    if (s.boxSizing === "border-box") {
      var m = getBoxEdgeStyles(s);
      this._canvasWidth -= m.paddingLeft + m.paddingRight + m.borderLeftWidth + m.borderRightWidth;
      this._canvasHeight -= m.paddingTop + m.paddingBottom + m.borderTopWidth + m.borderBottomWidth;
    }

    this._canvasWidth *= this._canvasRatio;
    this._canvasHeight *= this._canvasRatio;
    this.measureCanvas(this._canvasWidth, this._canvasHeight, s);
    this.el.width = this._canvasWidth;
    this.el.height = this._canvasHeight; // this.el.style.height = h + "px";
    // this.el.style.width = w + "px";
    // colors
    // --------------------------------

    this._color = this._options.color || s.color || Globals.DEFAULT_COLORS["color"];
    this._backgroundColor = this._options.backgroundColor || s.backgroundColor || Globals.DEFAULT_COLORS["background-color"]; // mozOpaque
    // --------------------------------

    if (this._useOpaque && this._opaqueProp) {
      // this.el.style.backgroundColor = this._backgroundColor;
      this.el[this._opaqueProp] = true;
    } // fontSize
    // --------------------------------


    this._fontSize = parseFloat(s.fontSize) * this._canvasRatio;
    this._fontFamily = s.fontFamily; // prepare canvas context
    // --------------------------------

    this._ctx.restore();

    this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px/1", s.fontFamily].join(" ");
    this._ctx.textAlign = "left";
    this._ctx.lineCap = "butt";
    this._ctx.lineJoin = "miter";
    this._ctx.strokeStyle = this._color;
    this._ctx.fillStyle = this._color;
    this.updateCanvas(this._ctx, s);

    this._ctx.save(); // console.group(this.cid+"::_updateCanvas");
    // console.log("ratio:    %f (min: %f, device: %f, context: %s)", this._canvasRatio, MIN_CANVAS_RATIO, window.devicePixelRatio, this._ctx.webkitBackingStorePixelRatio || "(webkit-only)");
    // console.log("colors:   fg: %s bg: %s", this._color, this._backgroundColor);
    // console.log("style:    %s, %s, padding: %s (%s)", s.width, s.height, s.padding, s.boxSizing);
    // console.log("box:      %f x %f px", m.width, m.height);
    // console.log("measured: %f x %f px", w, h);
    // console.log("canvas:   %f x %f px", this._canvasWidth, this._canvasHeight);
    // console.groupEnd();

  },
  measureCanvas: function measureCanvas(w, h, s) {
    /* abstract */
  },
  updateCanvas: function updateCanvas(ctx, s) {
    /* abstract */
  },
  _getFontMetrics: function _getFontMetrics(str) {
    var key,
        idx,
        mObj,
        mIdx = str.length;

    for (key in Globals.FONT_METRICS) {
      idx = str.indexOf(key);

      if (idx !== -1 && idx < mIdx) {
        mIdx = idx;
        mObj = Globals.FONT_METRICS[key];
      }
    }

    return mObj || {
      "unitsPerEm": 1024,
      "ascent": 939,
      "descent": -256
    };
  },
  _clearCanvas: function _clearCanvas() {
    if (arguments.length == 4) {
      this._clearCanvasRect.apply(this, arguments);
    } else {
      this._ctx.save();

      this._ctx.setTransform(1, 0, 0, 1, 0, 0);

      this._clearCanvasRect(0, 0, this.el.width, this.el.height);

      this._ctx.restore();
    }
  },
  _clearCanvasRect: function _clearCanvasRect(x, y, w, h) {
    this._ctx.clearRect(x, y, w, h);

    if (this._useOpaque) {
      this._ctx.save();

      this._ctx.fillStyle = this._backgroundColor;

      this._ctx.fillRect(x, y, w, h);

      this._ctx.restore();
    }
  },
  _setStyle: function _setStyle(s) {
    CanvasView.setStyle(this._ctx, s);
  },

  /* --------------------------- *
   * render
   * --------------------------- */

  /** @override */
  render: function render() {
    if (this.attached) {
      return this.renderNow();
    }

    return this;
  },

  /** @override */
  renderFrame: function renderFrame(tstamp, flags) {
    if (!this.attached) {
      return flags;
    }

    if (flags & View.SIZE_INVALID) {
      this._updateCanvas();
    }

    if (this._interpolator.valuesChanged) {
      flags |= View.LAYOUT_INVALID;

      this._interpolator.interpolate(tstamp);
    }

    if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
      this.redraw(this._ctx, this._interpolator, flags);

      if (this._interpolator.valuesChanged) {
        this.requestRender();
      }
    }
  },
  // setEnabled: function(enabled) {
  // 	View.prototype.setEnabled.apply(this, arguments);
  // 	if (this.attached) {
  // 		console.info("[%s] %s::setEnabled", this.parentView.cid, this.cid, this.enabled);
  // 		// if (this._enabled && this._interpolator.valuesChanged) {
  // 		// this.requestRender();
  // 		// this.requestRender(CanvasView.LAYOUT_INVALID);
  // 		// }
  // 	}
  // },

  /* --------------------------- *
  /* public
  /* --------------------------- */
  getTargetValue: function getTargetValue(key) {
    return this._interpolator.getTargetValue(key);
  },
  getRenderedValue: function getRenderedValue(key) {
    return this._interpolator.getRenderedValue(key);
  },
  valueTo: function valueTo(key, value, duration) {
    this._interpolator.valueTo(key, value, duration);

    this.requestRender(View.MODEL_INVALID | View.LAYOUT_INVALID);
  },
  // updateValue: function(key) {
  // 	return this._interpolator.updateValue(key || this.defaultKey);
  // },

  /* --------------------------- *
  /* redraw
  /* --------------------------- */
  redraw: function redraw(ctx, interp, flags) {}
}, {
  setStyle: function setStyle(ctx, s) {
    if (_typeof(s) != "object") return;

    for (var p in s) {
      switch (_typeof(ctx[p])) {
        case "undefined":
          break;

        case "function":
          if (Array.isArray(s[p])) ctx[p].apply(ctx, s[p]);else ctx[p].call(ctx, s[p]);
          break;

        default:
          ctx[p] = s[p];
      }
    }
  }
});

if (DEBUG) {
  CanvasView.prototype._logFlags = "";
}

module.exports = CanvasView;

}).call(this,true,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/view/base/Interpolator":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/Interpolator.js","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","underscore":"underscore","utils/css/getBoxEdgeStyles":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/css/getBoxEdgeStyles.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/Interpolator.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/base/Interpolator
 */

/** @type {module:utils/ease/fn/linear} */
var linear = require("utils/ease/fn/linear");
/**
 * @constructor
 * @type {module:app/view/base/Interpolator}
 */


var Interpolator = function Interpolator(values, maxValues, easeValues) {
  this._tstamp = 0; // gets thrown away by first interpolate() but avoid null access errors

  this._renderableKeys = [];
  this._renderedKeys = [];
  this._paused = false;
  this._pausedChanging = false; //this._pausedKeys = [];

  this._maxValues = _.isObject(maxValues) ? _.extend({}, maxValues) : {};
  this._easeFn = _.isObject(easeValues) ? _.extend({}, easeValues) : {};
  this._valueData = {}; // var key, val, maxVal, easeFn;

  for (var key in values) {
    _.isNumber(this._maxValues[key]) || (this._maxValues[key] = null);
    _.isFunction(this._easeFn[key]) || (this._easeFn[key] = linear); // create value object and store it

    this._valueData[key] = this._initValue(values[key], 0, this._maxValues[key]); // add to next render list

    this._renderableKeys.push(key);
  }
};

Interpolator.prototype = Object.create({
  /* --------------------------- *
  /* public interface
  /* --------------------------- */
  isAtTarget: function isAtTarget(key) {
    return this._renderableKeys.indexOf(key) === -1;
  },
  getCurrentValue: function getCurrentValue(key) {
    return this._valueData[key]._renderedValue || this._valueData[key]._value;
  },
  getTargetValue: function getTargetValue(key) {
    return this._valueData[key]._value;
  },
  getStartValue: function getStartValue(key) {
    return this._valueData[key]._startValue;
  },
  getRenderedValue: function getRenderedValue(key) {
    return this._valueData[key]._renderedValue;
  },
  getOption: function getOption(key, opt) {
    if (opt === "max") return this._maxValues[key];
    if (opt === "ease") return this._easeFn[key];
  },
  valueTo: function valueTo(key, value, duration, ease) {
    var changed,
        dataObj = this._valueData[key];

    if (_.isFunction(ease)) {
      this._easeFn[key] = ease;
    } // console.log("%s::valueTo [%s]", "[interpolator]", key, value);


    if (Array.isArray(dataObj)) {
      changed = value.reduce(function (prevChanged, itemValue, i) {
        if (dataObj[i]) {
          dataObj[i] = this._initNumber(itemValue, duration, this._maxValues[key]);
          return true;
        }

        return this._setValue(dataObj[i], itemValue, duration) || prevChanged;
      }.bind(this), changed);
    } else {
      changed = this._setValue(dataObj, value, duration);
    }

    if (changed) {
      this._renderableKeys.indexOf(key) !== -1 || this._renderableKeys.push(key);
    }

    return this;
  },
  updateValue: function updateValue(key) {
    // Call _interpolateKey only if needed. _interpolateKey() returns false
    // once interpolation is done, in which case remove key from _renderableKeys.
    var kIndex = this._renderableKeys.indexOf(key);

    if (kIndex !== -1 && !this._interpolateKey(key)) {
      this._renderableKeys.splice(kIndex, 1);
    }

    return this;
  },

  /* --------------------------- *
  /* private: valueData
  /* --------------------------- */
  _initValue: function _initValue(value, duration, maxVal) {
    if (Array.isArray(value)) {
      return value.map(function (val) {
        return this._initNumber(val, duration, maxVal);
      }, this);
    }

    return this._initNumber(value, duration, maxVal);
  },
  _initNumber: function _initNumber(value, duration, maxVal) {
    var o = {};
    o._value = value;
    o._startValue = value;
    o._valueDelta = 0;
    o._duration = duration || 0;
    o._startTime = NaN;
    o._elapsedTime = NaN;
    o._lastRenderedValue = null;
    o._renderedValue = o._startValue;
    o._maxVal = maxVal; // if (maxVal !== void 0) o._maxVal = maxVal;
    // o._maxVal = this._maxValues[key];
    // o._maxVal = this._maxVal;// FIXME

    return o;
  },
  _setValue: function _setValue(o, value, duration) {
    if (o._value !== value) {
      o._startValue = o._value;
      o._valueDelta = value - o._value;
      o._value = value;
      o._duration = duration || 0;
      o._startTime = NaN;
      o._elapsedTime = NaN; // o._lastRenderedValue = o._renderedValue;
      // o._renderedValue = o._startValue;

      return true;
    }

    return false;
  },

  /* --------------------------- *
  /* private: interpolate
  /* --------------------------- */
  _tstamp: 0,

  /** @override */
  interpolate: function interpolate(tstamp) {
    this._tstamp = tstamp;

    if (this.valuesChanged) {
      if (this._pausedChanging) {
        this._renderableKeys.forEach(function (key) {
          var o = this._valueData[key];

          if (!isNaN(o._elapsedTime)) {
            o._startTime = tstamp - o._elapsedTime;
          }
        }, this);

        this._pausedChanging = false;
      }

      var changedKeys = this._renderableKeys;
      this._renderableKeys = changedKeys.filter(function (key) {
        return this._interpolateValue(tstamp, this._valueData[key], this._easeFn[key]);
      }, this);
      this._renderedKeys = changedKeys;
    }

    return this;
  },
  _interpolateKey: function _interpolateKey(key) {
    return this._interpolateValue(this._tstamp, this._valueData[key], this._easeFn[key]);
  },
  _interpolateValue: function _interpolateValue(tstamp, o, fn) {
    if (Array.isArray(o)) {
      return o.reduce(function (changed, item, index, arr) {
        return this._interpolateNumber(tstamp, item, fn) || changed;
      }.bind(this), false);
    }

    return this._interpolateNumber(tstamp, o, fn);
  },
  _interpolateNumber: function _interpolateNumber(tstamp, o, fn) {
    if (isNaN(o._startTime)) {
      o._startTime = tstamp;
    }

    o._lastRenderedValue = o._renderedValue;
    var elapsed = Math.max(0, tstamp - o._startTime);

    if (elapsed < o._duration) {
      if (o._maxVal && o._valueDelta < 0) {
        // upper-bound values
        o._renderedValue = fn(elapsed, o._startValue, o._valueDelta + o._maxVal, o._duration) - o._maxVal;
      } else {
        // unbound values
        o._renderedValue = fn(elapsed, o._startValue, o._valueDelta, o._duration);
      }

      o._elapsedTime = elapsed;
      return true;
    }

    o._renderedValue = o._value;
    o._elapsedTime = NaN;
    o._startTime = NaN;
    return false;
  }
}, {
  /**
   * @type {boolean}
   */
  paused: {
    get: function get() {
      return this._paused;
    },
    set: function set(value) {
      value = !!value; // Convert to boolean

      if (this._paused !== value) {
        this._paused = value;
        this._pausedChanging = true;
      }
    }
  },

  /**
   * @type {boolean} Has any value been changed by valueTo() since last interpolate()
   */
  valuesChanged: {
    get: function get() {
      return !this._paused && this._renderableKeys.length > 0;
    }
  },

  /**
   * @type {array} Keys that are not yet at target value
   */
  renderableKeys: {
    get: function get() {
      return this._renderableKeys;
    }
  },

  /**
   * @type {array} Keys that have been rendered in the last interpolate()
   */
  renderedKeys: {
    get: function get() {
      return this._renderedKeys;
    }
  },

  /**
   * @type {array} All keys
   */
  keys: {
    get: function get() {
      return Object.keys(this._valueData);
    }
  }
});
module.exports = Interpolator;

}).call(this,require("underscore"))

},{"underscore":"underscore","utils/ease/fn/linear":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/ease/fn/linear.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/PrefixedEvents.js":[function(require,module,exports){
(function (DEBUG){
"use strict";

/** @type {module:utils/prefixedEvent} */
var prefixedEvent = require("utils/prefixedEvent");

var eventMap = {
  "transitionend": prefixedEvent("transitionend"),
  "fullscreenchange": prefixedEvent("fullscreenchange", document),
  "fullscreenerror": prefixedEvent("fullscreenerror", document),
  "visibilitychange": prefixedEvent("visibilitychange", document, "hidden")
};
var eventNum = 0;

for (var eventName in eventMap) {
  if (eventName === eventMap[eventName]) {
    delete eventMap[eventName];
  } else {
    Object.defineProperty(eventMap, eventName, {
      value: eventMap[eventName],
      enumerable: true
    });
    Object.defineProperty(eventMap, eventNum, {
      value: eventName,
      enumerable: false
    });
    eventNum++;
  }
}

Object.defineProperty(eventMap, "length", {
  value: eventNum
});

if (DEBUG) {
  console.log("prefixes enabled for %i events", eventMap.length, Object.keys(eventMap));
}

module.exports = eventMap; // module.exports = eventNum > 0? eventMap : null;

}).call(this,true)

},{"utils/prefixedEvent":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedEvent.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/TouchManager.js":[function(require,module,exports){
(function (DEBUG){
"use strict";

/**
 * @module app/view/base/TouchManager
 */

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:hammerjs} */


var Hammer = require("hammerjs"); // /** @type {module:hammerjs.Tap} */
// const Tap = Hammer.Tap;

/** @type {module:utils/touch/SmoothPanRecognizer} */


var Pan = require("utils/touch/SmoothPanRecognizer");
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
  var manager = new Hammer.Manager(el); // manager.set({ domevents: true });
  // let tap = new Hammer.Tap({
  // 	threshold: Globals.PAN_THRESHOLD - 1
  // });
  // manager.add(tap);

  var hpan = new Pan({
    event: "hpan",
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: Globals.PAN_THRESHOLD // touchAction: "pan-y",

  });
  manager.add(hpan); // let vpan = new Pan({
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


var PANEND_THRES_MS = 300; // millisecs

var PANEND_THRES_PX = 25; // pixels

var UP_EVENT = window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup";
var touchHandlers = {};
var captureHandlers = {};
var bubblingHandlers = {};
/*https://gist.githubusercontent.com/jtangelder/361052976f044200ea17/raw/f54c2cef78d59da3f38286fad683471e1c976072/PreventGhostClick.js*/

var lastTimeStamp = NaN;
var panSessionOpened = false;

var saveTimeStamp = function saveTimeStamp(hev) {
  panSessionOpened = !hev.isFinal;

  if (hev.isFinal) {
    lastTimeStamp = hev.srcEvent.timeStamp;
  }

  if (DEBUG) {
    logPanEvent(hev);
  }
}; // let preventSrcEvent = function(hev) {
// 	//console.log(hev.type, "preventDefault");
// 	hev.srcEvent.preventDefault();
// };
// let preventWhilePanning = function(domev) {
// 	panSessionOpened && domev.preventDefault();
// };
// let preventWhileNotPanning = function(domev) {
// 	!panSessionOpened && domev.preventDefault();
// };


var stopEventAfterPan = function stopEventAfterPan(domev) {
  if (domev.timeStamp - lastTimeStamp < PANEND_THRES_MS) {
    // domev.defaultPrevented ||
    domev.preventDefault();
    domev.stopPropagation();
  }

  if (DEBUG) {
    logEvent(domev, (domev.timeStamp - lastTimeStamp).toFixed(3));
  }

  lastTimeStamp = NaN;
};

touchHandlers["hpanstart hpanend hpancancel"] = saveTimeStamp; // touchHandlers["vpanstart vpanend vpancancel"] = saveTimeStamp;
// touchHandlers["hpanmove hpanend hpancancel"] = preventSrcEvent;
// touchHandlers["vpanmove vpanend vpancancel"] = preventSrcEvent;

captureHandlers["click"] = stopEventAfterPan; // bubblingHandlers["click"] = stopEventAfterPan;
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
  var logPanEvent = function logPanEvent(hev) {
    logEvent(hev.srcEvent, "[".concat(hev.type, "]"));
  };

  var logEvent = function logEvent(domev, msg) {
    var msgs = [];
    if (domev.defaultPrevented) msgs.push("prevented");
    if (msg) msgs.push(msg);
    msgs.push("".concat(panSessionOpened ? "panning" : "pan ended", " ").concat((domev.timeStamp - lastTimeStamp).toFixed(3)));
    console.log("TouchManager %s [%s]", domev.timeStamp.toFixed(3), domev.type, msgs.join(", "));
  };
}
/* eslint-enable no-unsused-vars */
// -------------------------------
//
// -------------------------------


function addHandlers() {
  var eventName;
  var el = instance.element;

  for (eventName in touchHandlers) {
    if (touchHandlers.hasOwnProperty(eventName)) instance.on(eventName, touchHandlers[eventName]);
  }

  for (eventName in captureHandlers) {
    if (captureHandlers.hasOwnProperty(eventName)) el.addEventListener(eventName, captureHandlers[eventName], true);
  }

  for (eventName in bubblingHandlers) {
    if (bubblingHandlers.hasOwnProperty(eventName)) el.addEventListener(eventName, bubblingHandlers[eventName], false);
  } // document.addEventListener("touchmove", preventWhileNotPanning, false);

}

function removeHandlers() {
  var eventName;
  var el = instance.element;

  for (eventName in captureHandlers) {
    if (captureHandlers.hasOwnProperty(eventName)) el.removeEventListener(eventName, captureHandlers[eventName], true);
  }

  for (eventName in bubblingHandlers) {
    if (captureHandlers.hasOwnProperty(eventName)) el.removeEventListener(eventName, bubblingHandlers[eventName], true);
  } // document.removeEventListener("touchmove", preventWhileNotPanning, false);

}
/** @type {Hammer.Manager} */


var instance = null;
/* -------------------------------
/* Static public
/* ------------------------------- */

var TouchManager = {
  init: function init(target) {
    if (instance === null) {
      instance = createInstance(target);
      addHandlers();
    } else if (instance.element !== target) {
      console.warn("TouchManager already initialized with another element");
    }

    return instance;
  },
  destroy: function destroy() {
    if (instance !== null) {
      removeHandlers();
      instance.destroy();
      instance = null;
    } else {
      console.warn("no instance to destroy");
    }
  },
  getInstance: function getInstance() {
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

}).call(this,true)

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","hammerjs":"hammerjs","utils/touch/SmoothPanRecognizer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/touch/SmoothPanRecognizer.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/* global HTMLElement, MutationObserver */

/**
 * @module app/view/base/View
 */
// /** @type {module:setimmediate} */
// require("setimmediate");

/** @type {module:backbone} */
var Backbone = require("backbone");
/* -------------------------------
/* MutationObserver
/* ------------------------------- */


var _cidSeed = 1;
var _viewsByCid = {};

function addChildViews(el) {
  var view,
      els = el.querySelectorAll("*[data-cid]");

  for (var i = 0, ii = els.length; i < ii; i++) {
    view = View.findByElement(els.item(i));

    if (view) {
      if (!view.attached) {
        // console.log("View::[attached (parent)] %s", view.cid);
        view._elementAttached(); // } else {
        // 	console.warn("View::[attached (parent)] %s (ignored)", view.cid);

      }
    }
  }
}

function removeChildViews(el) {
  var view,
      els = el.querySelectorAll("*[data-cid]");

  for (var i = 0, ii = els.length; i < ii; i++) {
    view = View.findByElement(els.item(i));

    if (view) {
      if (view.attached) {
        console.log("View::[detached (parent)] %s", view.cid);

        view._elementDetached();
      } else {
        console.warn("View::[detached (parent)] %s (ignored)", view.cid);
      }
    }
  }
}

var observer = new MutationObserver(function (mm) {
  // console.log("View::mutations %s", JSON.stringify(mm, null, " "));
  var i, ii, m;
  var j, jj, e;
  var view;

  for (i = 0, ii = mm.length; i < ii; i++) {
    m = mm[i];

    if (m.type == "childList") {
      for (j = 0, jj = m.addedNodes.length; j < jj; j++) {
        e = m.addedNodes.item(j);
        view = View.findByElement(e);

        if (view) {
          if (!view.attached) {
            // console.log("View::[attached (childList)] %s", view.cid);
            view._elementAttached(); // } else {
            // 	console.warn("View::[attached (childList)] %s (ignored)", view.cid);

          }
        }

        if (e instanceof HTMLElement) addChildViews(e);
      }

      for (j = 0, jj = m.removedNodes.length; j < jj; j++) {
        e = m.removedNodes.item(j); // console.log("View::[detached (childList)] %s", e.cid);

        view = View.findByElement(e);

        if (view) {
          if (view.attached) {
            console.log("View::[detached (childList)] %s", view.cid, view.attached);

            view._elementDetached();
          } else {
            console.warn("View::[detached (childList)] %s (ignored)", view.cid, view.attached);
          }
        }

        if (e instanceof HTMLElement) removeChildViews(e);
      }
    } else if (m.type == "attributes") {
      view = View.findByElement(m.target);

      if (view) {
        if (!view.attached) {
          // console.log("View::[attached (attribute)] %s", view.cid);
          view._elementAttached(); // } else {
          // 	console.warn("View::[attached (attribute)] %s (ignored)", view.cid);

        }
      } // else {
      // 	console.warn("View::[attributes] target has no cid (%s='%s')", m.attributeName, m.target.getAttribute(m.attributeName), m);
      // }

    }
  }
});
observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ["data-cid"]
});
/* -------------------------------
/* static private
/* ------------------------------- */

var _now = window.performance ? window.performance.now.bind(window.performance) : Date.now.bind(Date); // var _now = window.performance?
// 	function() { return window.performance.now(); }:
// 	function() { return Date.now(); };
// /** @type {module:app/view/base/renderQueue} */
// var renderQueue = require("app/view/base/renderQueue");
//

/** @type {module:app/view/base/CallbackQueue} */


var renderQueue = function (CallbackQueue) {
  return new CallbackQueue(function (callback) {
    return window.requestAnimationFrame(callback);
  }, function (id) {
    return window.cancelAnimationFrame(id);
  });
}(require("app/view/base/CallbackQueue"));
/** @type {module:app/view/base/CallbackQueue} */


var modelQueue = function (CallbackQueue) {
  return new CallbackQueue(function (callback) {
    return window.setImmediate(function () {
      callback.call(null, _now());
    });
  }, function (id) {
    return window.clearImmediate(id);
  });
}(require("app/view/base/CallbackQueue"));
/** @type {module:app/view/base/PrefixedEvents} */


var PrefixedEvents = require("app/view/base/PrefixedEvents");

var applyEventPrefixes = function applyEventPrefixes(events) {
  var selector, unprefixed;

  for (selector in events) {
    unprefixed = selector.match(/^\w+/i)[0];

    if (PrefixedEvents.hasOwnProperty(unprefixed)) {
      events[selector.replace(unprefixed, PrefixedEvents[unprefixed])] = events[selector]; // console.log("applyEventPrefixes", unprefixed, prefixedEvents[unprefixed]);

      delete events[selector];
    }
  }

  return events;
};

var getViewDepth = function getViewDepth(view) {
  if (!view) {
    return null;
  }

  if (!view.attached) {
    return NaN;
  }

  if (view.parentView === null) {
    return 0;
  }

  return view.parentView.viewDepth + 1;
};

function logAttachInfo(view, name, level) {
  if (["log", "info", "warn", "error"].indexOf(level) != -1) {
    level = "log";
  }

  console[level].call(console, "%s::%s [parent:%s %s %s depth:%s]", view.cid, name, view.parentView && view.parentView.cid, view.attached ? "attached" : "detached", view._viewPhase, view.viewDepth);
}
/* -------------------------------
/* static public
/* ------------------------------- */


var View = {
  /** @const */
  NONE_INVALID: 0,

  /** @const */
  ALL_INVALID: ~0 >>> 1,

  /** @const */
  CHILDREN_INVALID: 1,

  /** @const */
  MODEL_INVALID: 2,

  /** @const */
  STYLES_INVALID: 4,

  /** @const */
  SIZE_INVALID: 8,

  /** @const */
  LAYOUT_INVALID: 16,

  /** @const */
  CLICK_EVENT: "click",
  //window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",

  /** @type {module:app/view/base/ViewError} */
  ViewError: require("app/view/base/ViewError"),

  /** @type {module:utils/prefixedProperty} */
  prefixedProperty: require("utils/prefixedProperty"),

  /** @type {module:utils/prefixedStyleName} */
  prefixedStyleName: require("utils/prefixedStyleName"),

  /** @type {module:utils/prefixedEvent} */
  prefixedEvent: require("utils/prefixedEvent"),

  /** @type {module:app/view/promise/whenViewIsAttached} */
  whenViewIsAttached: require("app/view/promise/whenViewIsAttached"),

  /** @type {module:app/view/promise/whenViewIsRendered} */
  whenViewIsRendered: require("app/view/promise/whenViewIsRendered"),

  /**
  /* @param el {HTMLElement}
  /* @return {module:app/view/base/View}
  /*/
  findByElement: function findByElement(el) {
    if (_viewsByCid[el.cid]) {
      return _viewsByCid[el.cid];
    }

    return null;
  },

  /**
  /* @param el {HTMLElement}
  /* @return {module:app/view/base/View}
  /*/
  findByDescendant: function findByDescendant(el) {
    do {
      if (_viewsByCid[el.cid]) {
        return _viewsByCid[el.cid];
      }
    } while (el = el.parentElement || el.parentNode);

    return null;
  },

  /** @override */
  extend: function extend(proto, obj) {
    if (PrefixedEvents.length && proto.events) {
      if (_.isFunction(proto.events)) {
        proto.events = _.wrap(proto.events, function (fn) {
          return applyEventPrefixes(fn.apply(this));
        });
      } else if (_.isObject(proto.events)) {
        proto.events = applyEventPrefixes(proto.events);
      }
    }

    if (proto.properties && this.prototype.properties) {
      _.defaults(proto.properties, this.prototype.properties);
    }

    return Backbone.View.extend.apply(this, arguments);
  },
  _flagsToStrings: ["-"],
  flagsToString: function flagsToString(flags) {
    var s = View._flagsToStrings[flags | 0];

    if (!s) {
      s = [];
      if (flags & View.CHILDREN_INVALID) s.push("children");
      if (flags & View.MODEL_INVALID) s.push("model");
      if (flags & View.STYLES_INVALID) s.push("styles");
      if (flags & View.SIZE_INVALID) s.push("size");
      if (flags & View.LAYOUT_INVALID) s.push("layout");
      View._flagsToStrings[flags] = s = s.join(" ");
    }

    return s; // return (flags | 0).toString(2);
  }
};
Object.defineProperty(View, "instances", {
  value: _viewsByCid,
  enumerable: true
});
/* -------------------------------
/* prototype
/* ------------------------------- */
// module.exports = Backbone.View.extend({

var ViewProto = {
  /** @type {string} */
  cidPrefix: "view",

  /** @type {Boolean} */
  _attached: false,

  /** @type {HTMLElement|null} */
  _parentView: null,

  /** @type {int|null} */
  _viewDepth: null,

  /** @type {string} initializing > initialized > disposing > disposed */
  _viewPhase: "initializing",

  /** @type {int} */
  _renderQueueId: -1,

  /** @type {int} */
  _renderFlags: 0,

  /** @type {Boolean} */
  _enabled: null,

  /** @type {object} */
  properties: {
    cid: {
      get: function get() {
        return this._cid || (this._cid = this.cidPrefix + _cidSeed++);
      },
      set: function set(value) {// ignored
      }
    },
    attached: {
      get: function get() {
        return this._attached;
      }
    },
    parentView: {
      get: function get() {
        return this._parentView;
      }
    },
    viewDepth: {
      get: function get() {
        return this._getViewDepth();
      }
    },
    invalidated: {
      get: function get() {
        return this._renderQueueId !== -1;
      }
    },
    enabled: {
      get: function get() {
        return this._enabled;
      },
      set: function set(enabled) {
        this.setEnabled(enabled);
      }
    },
    renderFlags: {
      get: function get() {
        return this._renderFlags;
      }
    }
  },
  $: Backbone.$,

  /**
   * @constructor
   * @type {module:app/view/base/View}
   */
  constructor: function constructor(options) {
    this.transform = {};
    this.childViews = {};
    this._applyRender = this._applyRender.bind(this);

    if (this.properties) {
      // Object.defineProperties(this, getPrototypeChainValue(this, "properties", Backbone.View));
      Object.defineProperties(this, this.properties);
    }

    if (options && options.className && this.className) {
      options.className += " " + _.result(this, "className");
    }

    if (options && options.parentView) {
      this._setParentView(options.parentView, true);
    }

    Backbone.View.apply(this, arguments); // console.log("%s::initialize viewPhase:[%s => initialized]", this.cid, this._viewPhase);

    this._viewPhase = "initialized";

    if (this.parentView !== null) {
      this.trigger("view:parentChange", this.parentView, null);
    }

    if (this.attached) {
      this.trigger("view:attached", this);
    }
  },

  /* -------------------------------
  /* remove
  /* ------------------------------- */

  /** @override */
  remove: function remove() {
    if (this._viewPhase == "disposing") {
      logAttachInfo(this, "remove", "warn");
    } else {} // logAttachInfo(this, "remove", "log");
    // before removal


    this._viewPhase = "disposing";

    this._cancelRender(); // call Backbone impl
    // Backbone.View.prototype.remove.apply(this, arguments);
    // NOTE: from Backbone impl


    this.$el.remove(); // from Backbone impl

    this._attached = false;
    this.trigger("view:removed", this); // remove parent/child references

    this._setParentView(null); // NOTE: from Backbone impl. No more events after this


    this.stopListening(); // check for invalidations that may have been triggered by "view:removed"

    if (this.invalidated) {
      console.warn("%s::remove invalidated after remove()", this.cid);

      this._cancelRender();
    } // // check for children still here
    // var ccids = Object.keys(this.childViews);
    // if (ccids.length) {
    // 	console.warn("%s::remove %i children not removed [%s]", this.cid, ccids.length, ccids.join(", "), this.childViews);
    // }
    // // remove childViews
    // for (var cid in this.childViews) {
    // 	this.childViews[cid].remove();
    // }
    // clear reference in view map


    delete _viewsByCid[this.cid]; // delete this.el.cid;
    // update phase

    this._viewPhase = "disposed";
    return this;
  },

  /* -------------------------------
  /* _elementAttached _elementDetached
  /* ------------------------------- */
  _elementAttached: function _elementAttached() {
    // this._addToParentView();
    this._attached = true;
    this._viewDepth = null;
    this.setEnabled(true);

    this._setParentView(View.findByDescendant(this.el.parentElement)); // if (this.parentView) {
    // 	console.log("[attach] [%i] %s > %s::_elementAttached", this.viewDepth, this.parentView.cid, this.cid);
    // } else {
    // 	console.log("[attach] [%i] %s::_elementAttached", this.viewDepth, this.cid);
    // }
    // if (this._viewPhase == "initializing") {
    // 	// this.trigger("view:attached", this);
    // } else


    if (this._viewPhase == "initialized") {
      this.trigger("view:attached", this);
    } else if (this._viewPhase == "replacing") {
      this._viewPhase = "initialized";
      this.trigger("view:replaced", this);
    }
  },
  _elementDetached: function _elementDetached() {
    if (!this.attached || this._viewPhase == "disposing" || this._viewPhase == "disposed") {
      logAttachInfo(this, "_elementDetached", "error"); // } else {
      // 	logAttachInfo(this, "_elementDetached", "log");
    }

    this._attached = false;
    this._viewDepth = null;
    this.setEnabled(false);

    if (this._viewPhase != "disposing" || this._viewPhase == "disposed") {
      this.remove();
    }
  },

  /* -------------------------------
  /* parentView
  /* ------------------------------- */
  _setParentView: function _setParentView(newParent, silent) {
    if (newParent === void 0) {
      console.warn("$s::_setParentView invalid value '%s'", this.cid, newParent);
      newParent = null;
    }

    var oldParent = this._parentView;
    this._parentView = newParent; // force update of _viewDepth

    this._viewDepth = null; //getViewDepth(this);
    // skip the rest if arg is the same

    if (newParent === oldParent) {
      return;
    }

    if (oldParent !== null) {
      if (this.cid in oldParent.childViews) {
        delete oldParent.childViews[this.cid];
      }
    }

    if (newParent !== null) {
      newParent.childViews[this.cid] = this;
    }

    if (!silent) this.trigger("view:parentChange", this, newParent, oldParent);
  },
  whenAttached: function whenAttached() {
    return View.whenViewIsAttached(this);
  },
  _getViewDepth: function _getViewDepth() {
    if (this._viewDepth === null) {
      this._viewDepth = getViewDepth(this);
    }

    return this._viewDepth;
  },

  /* -------------------------------
  /* Backbone.View overrides
  /* ------------------------------- */

  /** @override */
  setElement: function setElement(element, delegate) {
    // setElement always initializes this.el, so check it to be non-null before calling super
    if (this.el) {
      if (this.el !== element && this.el.parentElement) {
        // Element is being replaced
        if (this.attached) {
          // Since old element is attached to document tree, _elementAttached will be
          // triggered by replaceChild: set _viewPhase = "replacing" to flag this
          // change and trigger 'view:replaced' instead of 'view:added'.
          this._viewPhase = "replacing";
        }

        this.el.parentElement.replaceChild(element, this.el);
      }

      Backbone.View.prototype.setElement.apply(this, arguments); // Merge classes specified by this view with the ones already in the element,
      // as backbone will not:

      if (this.className) {
        _.result(this, "className").split(" ").forEach(function (item) {
          this.el.classList.add(item);
        }, this);
      }
    } else {
      Backbone.View.prototype.setElement.apply(this, arguments);
    }

    if (this.el === void 0) {
      throw new Error("Backbone view has no element");
    }

    _viewsByCid[this.cid] = this;
    this.el.cid = this.cid;
    this.el.setAttribute("data-cid", this.cid);

    if (this.model) {
      this.el.setAttribute("data-mcid", this.model.cid);
    }

    return this;
  },

  /* ---------------------------
  /* event helpers
  /* --------------------------- */
  addListeners: function addListeners(target, events, handler, useCapture) {
    if (!_.isObject(useCapture)) useCapture = !!useCapture;

    if (typeof events === "string") {
      events = events.split(" ");
    }

    for (var i = 0; i < events.length; i++) {
      target.addEventListener(events[i], handler, useCapture);
    }

    return this;
  },
  removeListeners: function removeListeners(target, events, handler, useCapture) {
    if (!_.isObject(useCapture)) useCapture = !!useCapture;

    if (typeof events === "string") {
      events = events.split(" ");
    }

    for (var i = 0; i < events.length; i++) {
      target.removeEventListener(events[i], handler, useCapture);
    }

    return this;
  },
  listenToElement: function listenToElement(target, events, handler) {
    target = Backbone.$(target);

    if (typeof events === "string") {
      events = events.split(" ");
    }

    for (var i = 0; i < events.length; i++) {
      this.listenTo(target, events[i], handler);
    }
  },
  stopListeningToElement: function stopListeningToElement(target, events, handler) {
    target = Backbone.$(target);

    if (typeof events === "string") {
      events = events.split(" ");
    }

    for (var i = 0; i < events.length; i++) {
      this.stopListening(target, events[i], handler);
    }
  },
  // listenToElementOnce: function(target, event, handler, useCapture) {
  // 	this.listenToOnce(this.$(target), event, handler);
  // },
  // stopListenToElement: function(target, event, handler, useCapture) {
  // 	this.stopListening(Backbone.$(target), event, handler);
  // },
  listenToElementOnce: function listenToElementOnce(target, event, handler, useCapture) {
    if (!_.isObject(useCapture)) useCapture = !!useCapture;

    var _cleanup, wrapper, ctx;

    ctx = this;

    _cleanup = function cleanup() {
      ctx.off("view:remove", _cleanup);
      target.removeEventListener(event, wrapper, useCapture);
    };

    wrapper = function wrapper(ev) {
      _cleanup();

      handler.call(ctx, ev);
    };

    ctx.on("view:remove", _cleanup);
    target.addEventListener(event, wrapper, useCapture);
    return this;
  },

  /* -------------------------------
  /* requestAnimationFrame
  /* ------------------------------- */
  requestAnimationFrame: function requestAnimationFrame(callback, priority, ctx) {
    return renderQueue.request(callback.bind(ctx || this), priority);
  },
  cancelAnimationFrame: function cancelAnimationFrame(id) {
    return renderQueue.cancel(id);
  },
  setImmediate: function setImmediate(callback, priority, ctx) {
    return modelQueue.request(callback.bind(ctx || this), priority);
  },
  clearImmediate: function clearImmediate(id) {
    return modelQueue.cancel(id); // return window.clearImmediate(id);
  },

  /* -------------------------------
  /* deferred render: private methods
  /* ------------------------------- */
  _traceRenderStatus: function _traceRenderStatus() {
    return [this._renderQueueId != -1 ? "async id:" + this._renderQueueId : "sync", View.flagsToString(this._renderFlags), this.attached ? "attached" : "detached", (this.skipTransitions ? "skip" : "run") + "-tx"].join(", ");
  },

  /** @private */
  _applyRender: function _applyRender(tstamp) {
    if (DEBUG) {
      if (this._logFlags["view.render"]) {
        console.log("%s::_applyRender [%s]", this.cid, this._traceRenderStatus(), this._logFlags["view.trace"] ? this._logRenderCallers.join("\n") : "");
      }

      this._logRenderCallers.length = 0;
    }

    var flags = this._renderFlags;
    this.trigger("view:render:before", this, flags);
    this._renderFlags = 0;
    this._renderQueueId = -1;
    this._renderFlags |= this.renderFrame(tstamp, flags);
    this.trigger("view:render:after", this, flags);

    if (this._renderFlags != 0) {
      console.warn("%s::_applyRender [returned] phase: %s flags: %s (%s)", this.cid, this._viewPhase, View.flagsToString(this._renderFlags), this._renderFlags);
    }
  },
  _cancelRender: function _cancelRender() {
    if (this._renderQueueId != -1) {
      var cancelId, cancelFn;
      cancelId = this._renderQueueId;
      this._renderQueueId = -1;
      cancelFn = renderQueue.cancel(cancelId);

      if (cancelFn === void 0) {
        console.warn("%s::_cancelRender [id:%i] not found", this.cid, cancelId);
      } else if (cancelFn === null) {
        console.warn("%s::_cancelRender [id:%i] already cancelled", this.cid, cancelId); // } else {
        // 	if (this._logFlags["view.render"] && !renderQueue.running)
        // 		console.log("%s::_cancelRender ID:%i cancelled", this.cid, cancelId);
      }
    }
  },
  _requestRender: function _requestRender() {
    if (renderQueue.running) {
      this._cancelRender(); // if (DEBUG) {
      // 	if (this._logFlags["view.render"]) {
      // 		console.info("%s::_requestRender rescheduled [%s (%s)]", this.cid, View.flagsToString(this._renderFlags), this._renderFlags);
      // 	}
      // }

    }

    if (this._renderQueueId == -1) {
      this._renderQueueId = renderQueue.request(this._applyRender, isNaN(this.viewDepth) ? Number.MAX_VALUE : this.viewDepth);
    }

    if (DEBUG) {
      if (this._logFlags["view.trace"]) {
        // if (this._logFlags["view.trace"]) {
        // 	console.groupCollapsed(this.cid + "::_requestRender [" + this._traceRenderStatus() + "] trace");
        // 	console.trace();
        // 	console.groupEnd();
        // } else {
        console.log("%s::_requestRender %s [%s]", this.cid, renderQueue.running ? "rescheduled " : "", this._traceRenderStatus()); // }
      }
    }
  },

  /* -------------------------------
  /* render: public / abstract methods
  /* ------------------------------- */
  invalidate: function invalidate(flags) {
    if (flags !== void 0) {
      /*if (DEBUG) {
      	if (this._logFlags["view.render"]) {
      		if (this._renderFlags > 0) {
      			console.log("%s::invalidate [%s (%s)] + [%s (%s)]", this.cid, View.flagsToString(this._renderFlags), this._renderFlags, View.flagsToString(flags), flags);
      		} else {
      			console.log("%s::invalidate [%s (%s)]", this.cid, View.flagsToString(flags), flags);
      		}
      	}
      }*/
      this._renderFlags |= flags;
    }

    return this;
  },
  requestRender: function requestRender(flags) {
    // if (DEBUG) {
    // 	if (this._logFlags["view.trace"]) {
    // 		var fnPath = [];
    // 		var fn = arguments.callee.caller;
    // 		while (fn) {
    // 			if (fnPath.length > 5) break;
    // 			fnPath.push(fn.name);
    // 			fn = fn.caller;
    // 		}
    // 		// this._logRenderCallers.push(fnPath.join("\n\t->"));
    // 		this._logRenderCallers.push(fnPath.join(" -> "));
    // 	}
    // }
    // if (flags !== void 0) {
    // 	this._renderFlags |= flags;
    // }
    this.invalidate(flags);

    this._requestRender();

    return this;
  },

  /** @abstract */
  renderFrame: function renderFrame(tstamp, flags) {
    // subclasses should override this method
    return View.NONE_INVALID;
  },
  renderNow: function renderNow(alwaysRun) {
    if (this._renderQueueId != -1) {
      this._cancelRender();

      alwaysRun = true;
    } // if (alwaysRun === true) {


    if (alwaysRun) {
      this._applyRender(_now());
    }

    return this;
  },
  whenRendered: function whenRendered() {
    return View.whenViewIsRendered(this);
  },

  /* -------------------------------
  /* render bitwise flags
  /* - check: this._renderFlags & flags
  /* - add: this._renderFlags |= flags
  /* - remove: this._renderFlags &= ~flags
  /* ------------------------------- */

  /* helpers ------------------ */
  requestChildrenRender: function requestChildrenRender(flags, now, force) {
    var ccid, view;

    for (ccid in this.childViews) {
      view = this.childViews[ccid];
      view.skipTransitions = view.skipTransitions || this.skipTransitions;
      view.requestRender(flags);

      if (now) {
        view.renderNow(force);
      }
    }

    return this;
  },
  render: function render() {
    return this.renderNow(true);
  },

  /* -------------------------------
  /* common abstract
  /* ------------------------------- */

  /**
  /* @param {Boolean}
  /*/
  setEnabled: function setEnabled(enable) {
    if (this._enabled == enable) return;
    this._enabled = !!enable;

    if (this._enabled) {
      this.delegateEvents();
    } else {
      this.undelegateEvents();
    }
  }
}; //, View);

if (DEBUG) {
  ViewProto._logFlags = ["view.render"].join(" ");

  ViewProto.constructor = function (fn) {
    return function () {
      var retval;
      this._logRenderCallers = [];
      this._logFlags = this._logFlags.split(" ").reduce(function (r, o) {
        r[o] = true;
        return r;
      }, {});
      retval = fn.apply(this, arguments); // console.log("------ %s %o", this.cid, this._logFlags);

      return retval;
    };
  }(ViewProto.constructor);
}

module.exports = Backbone.View.extend(ViewProto, View);

}).call(this,true,require("underscore"))

},{"app/view/base/CallbackQueue":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/CallbackQueue.js","app/view/base/PrefixedEvents":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/PrefixedEvents.js","app/view/base/ViewError":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/ViewError.js","app/view/promise/whenViewIsAttached":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenViewIsAttached.js","app/view/promise/whenViewIsRendered":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenViewIsRendered.js","backbone":"backbone","underscore":"underscore","utils/prefixedEvent":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedEvent.js","utils/prefixedProperty":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedProperty.js","utils/prefixedStyleName":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedStyleName.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/ViewError.js":[function(require,module,exports){
"use strict";

function ViewError(view, err) {
  this.view = view;
  this.err = err;
  this.message = err.message;
}

ViewError.prototype = Object.create(Error.prototype);
ViewError.prototype.constructor = ViewError;
ViewError.prototype.name = "ViewError";
module.exports = ViewError;

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/ArticleButton.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression, alias4="function";

  return "<a href=\""
    + alias3((helpers.global || (depth0 && depth0.global) || alias2).call(alias1,"APP_ROOT",{"name":"global","hash":{},"data":data}))
    + "#"
    + alias3(((helper = (helper = helpers.handle || (depth0 != null ? depth0.handle : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"handle","hash":{},"data":data}) : helper)))
    + "\"><span class=\"label\">"
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</span></a>\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/ArticleButton.js":[function(require,module,exports){
"use strict";

/**
/* @module app/view/component/ArticleView
/*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {Function} */


var viewTemplate = require("./ArticleButton.hbs");
/**
/* @constructor
/* @type {module:app/view/component/ArticleButton}
/*/


var ArticleButton = View.extend({
  /** @type {string} */
  cidPrefix: "articleButton",

  /** @override */
  tagName: "h2",

  /** @override */
  className: "article-button",

  /** @type {Function} */
  template: viewTemplate,
  events: {
    "click a": function clickA(domev) {
      domev.defaultPrevented || domev.preventDefault();
      this.trigger("view:click", this.model);
    }
  },
  // /** @override */
  // initialize: function(options) {},

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    this.el.innerHTML = this.template(this.model.toJSON());
  }
});
module.exports = ArticleButton;

},{"./ArticleButton.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/ArticleButton.hbs","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/ArticleView.js":[function(require,module,exports){
"use strict";

/**
/* @module app/view/component/ArticleView
/*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View"); // /** @type {module:utils/net/toAbsoluteURL} */
// var toAbsoluteURL = require("utils/net/toAbsoluteURL");
//
// /** @type {string} */
// var ABS_APP_ROOT = toAbsoluteURL(require("app/control/Globals").APP_ROOT);


var RECAPTCHA_KEYS = {
  'canillas.name': '6LcaPHwUAAAAAAfzEnqRchIx8jY1YkUEpuswJDHx'
};

var RECAPTCHA_URL = function RECAPTCHA_URL(key) {
  return "https://www.google.com/recaptcha/api.js?render=".concat(RECAPTCHA_KEYS[key]);
};
/**
/* @constructor
/* @type {module:app/view/component/ArticleView}
/*/


var ArticleView = View.extend({
  /** @type {string} */
  cidPrefix: "articleView",

  /** @override */
  tagName: "article",

  /** @override */
  className: "article-view mdown",

  /** @override */
  initialize: function initialize(options) {},

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  renderFrame: function renderFrame(tstamp, flags) {
    this.el.innerHTML = this.model.get("text"); // let linkEls = this.el.querySelectorAll("a[href]");
    // if (linkEls.length) {
    // 	RECAPTCHA_URL('canillas.name');
    // }
    // linkEls.forEach(el => {
    // });
    // FIXME: now done in xslt
    // this.el.querySelectorAll("a[href]").forEach(function(el) {
    // 	var url = toAbsoluteURL(el.getAttribute("href"));
    // 	if (url.indexOf(ABS_APP_ROOT) !== 0) {
    // 		el.setAttribute("target", "_blank");
    // 	}
    // });
  }
});
module.exports = ArticleView;

},{"app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/CanvasProgressMeter.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/component/progress/CanvasProgressMeter
 */

/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");

var PI2 = Math.PI * 2;
/* NOTE: avoid negative rotations */

var BASE_ROTATION = 1 - 0.25; // of PI2 (-90 degrees)

var GAP_ARC = PI2 / 48;
/** @type {module:utils/ease/fn/easeInQuad} */

var easeIn = require("utils/ease/fn/easeInQuad");
/** @type {module:utils/ease/fn/easeOutQuad} */


var easeOut = require("utils/ease/fn/easeOutQuad");

var LOOP_OFFSET = 1.833333;
var STEP_MS = 400; // tween time base

var ARC_DEFAULTS = {
  "amount": {
    lineWidth: 0.75,
    radiusOffset: 0
  },
  "available": {
    lineWidth: 0.75,
    // lineDash: [1.3, 0.7],
    inverse: "not-available"
  },
  "not-available": {
    lineWidth: 0.8,
    lineDash: [0.3, 0.7],
    lineDashOffset: 0
  },
  "indeterminate": {
    lineWidth: 2.0,
    //0.8,
    lineDash: [0.3, 1.7],
    // lineDash: [0.6, 1.4],
    lineDashOffset: 0
  }
};
/**
 * @constructor
 * @type {module:app/view/component/progress/CanvasProgressMeter}
 */

module.exports = CanvasView.extend({
  /** @type {string} */
  cidPrefix: "canvasProgressMeter",

  /** @type {string} */
  className: "progress-meter canvas-progress-meter",
  defaultKey: "amount",
  defaults: {
    values: {
      amount: 0,
      available: 0,
      _loop: 0,
      _stalled_arc: 0,
      _stalled_loop: 0
    },
    maxValues: {
      amount: 1,
      available: 1,
      _stalled_loop: 1
    },
    useOpaque: true,
    labelFn: function labelFn(value, max) {
      return value / max * 100 | 0;
    }
  },
  properties: {
    stalled: {
      get: function get() {
        return false; //this._stalled;
      },
      set: function set(value) {// this._setStalled(value)
      }
    }
  },
  _setStalled: function _setStalled(value) {
    if (this._stalled !== value) {
      this._stalled = value;
      this.requestRender(CanvasView.MODEL_INVALID | CanvasView.LAYOUT_INVALID);
    }
  },

  /* --------------------------- *
  /* children/layout
  /* --------------------------- */

  /** @override */
  initialize: function initialize(options) {
    // TODO: cleanup options mess in CanvasView
    CanvasView.prototype.initialize.apply(this, arguments); // options = _.defaults(options, this.defaults);

    this._labelFn = options.labelFn;
    this._stalled = !!options.stalled;
    this._valueStyles = {};
    this._canvasSize = null;
    this._canvasOrigin = null;
  },
  _needsLoop: false,

  /** @override */
  valueTo: function valueTo(key, value, duration) {
    if (key === "amount" && value < this.interpolator.getCurrentValue("amount")) {
      this._needsLoop = true;
    }

    CanvasView.prototype.valueTo.apply(this, arguments);
  },

  /* --------------------------- *
  /* private
  /* --------------------------- */

  /** @override */
  measureCanvas: function measureCanvas(w, h, s) {
    // make canvas square
    this._canvasHeight = this._canvasWidth = Math.min(w, h);
  },

  /** @override */
  updateCanvas: function updateCanvas() {
    // CanvasView.prototype._updateCanvas.apply(this, arguments);
    // size, lines, gaps, dashes (this._valueStyles, GAP_ARC, this._arcRadius)
    // --------------------------------
    // var arcName, s, arcDefault;
    // var mapLineDash = function(n) {
    // 	return n * this.radius * GAP_ARC;
    // };
    // var sumFn = function(s, n) {
    // 	return s + n;
    // };
    // this._canvasSize = Math.min(this._canvasWidth, this._canvasHeight);
    var s; // this._maxDashArc = 0

    for (var styleName in ARC_DEFAULTS) {
      s = _.defaults({}, ARC_DEFAULTS[styleName]);
      s.lineWidth *= this._canvasRatio;
      s.radius = (this._canvasWidth - s.lineWidth) / 2;

      if (s.radiusOffset) {
        s.radius += s.radiusOffset * this._canvasRatio;
      }

      if (_.isArray(s.lineDash)) {
        s.lineDash = s.lineDash.map(function (val, i, arr) {
          return val * this.radius * GAP_ARC;
        }, s);
        s.lineDashLength = s.lineDash.reduce(function (res, val, i, arr) {
          return res + val;
        }, 0);
        s.lineDashArc = s.lineDash[0] * GAP_ARC; // this._maxDashArc = Math.max(this._maxDashArc, s.lineDashArc);
      } else {
        s.lineDashArc = 0;
      }

      this._valueStyles[styleName] = s;
    } // baselineShift
    // --------------------------------
    // NOTE: Center baseline: use ascent data to center to x-height, or sort-of.
    // with ascent/descent values (0.7, -0.3), x-height is 0.4


    var mObj = this._getFontMetrics(this._fontFamily);

    this._baselineShift = mObj ? (mObj.ascent + mObj.descent) / mObj.unitsPerEm : 0.7; // default value

    this._baselineShift *= this._fontSize * 0.5; // apply to font-size, halve it

    this._baselineShift = Math.round(this._baselineShift); // save canvas context
    // --------------------------------
    // reset matrix and translate 0,0 to center

    this._ctx.restore();

    this._ctx.setTransform(1, 0, 0, 1, this._canvasWidth / 2, this._canvasHeight / 2);

    this._ctx.save();
  },

  /** @override */
  redraw: function redraw(ctx, intrp, flags) {
    this._clearCanvas(-this._canvasWidth / 2, -this._canvasHeight / 2, this._canvasWidth, this._canvasHeight);

    var s, // reused style objects
    valData, // reused for interpolated data
    arcVal; // reused arc values
    // amount label
    // --------------------------------

    valData = intrp._valueData["amount"];
    this.drawLabel(this._labelFn(valData._renderedValue, valData._maxVal)); // indeterminate
    // --------------------------------

    /*
    var indVal;
    if (this.stalled) {
    	// _ind loop indefinitely while indeterminate: restart if at end
    	if (intrp.isAtTarget("_ind")) {
    		// if (intrp.renderedKeys && (intrp.renderedKeys.indexOf("_ind") === -1)) {
    		intrp.valueTo("_ind", 0, 0);
    		intrp.valueTo("_ind", 1, 1000);
    		intrp.updateValue("_ind");
    	}
    	indVal = intrp.getCurrentValue("_ind");
    	//indVal = intrp._valueData["_ind"]._renderedValue || 0;
    		// draw spinning arc
    	// --------------------------------
    	// s = this._valueStyles["amount"];
    	// ctx.save();
    	// ctx.rotate(PI2 * (BASE_ROTATION + (indVal))); // + GAP_ARC);
    	// lastEndArc = this.drawArc(1,
    	// 	GAP_ARC,
    	// 	PI2 - GAP_ARC,
    	// 	0, s);
    	// ctx.restore();
    	// return;
    		// lineDashOffset animation
    	// --------------------------------
    	s = this._valueStyles["indeterminate"];
    	s.lineDashOffset = s.lineDashLength * ((1 - indVal) % 3) * 3;
    	this._valueStyles["available"].inverse = "indeterminate";
    		// console.log("%s::redraw indVal:%o s.lineDashOffset:%o s.lineDash:%o", this.cid, indVal, s.lineDashOffset, s.lineDash[0]);
    		// draw spinning wheel
    	// --------------------------------
    	// ctx.save();
    	// ctx.rotate((PI2 / WHEEL_NUM) * indVal); // + GAP_ARC);
    	// this.drawWheel(this._valueStyles["amount"], 2 / 5, 3 / 5);
    	// ctx.restore();
    	} else {
    	if (!intrp.isAtTarget("_ind")) {
    		// if (intrp.renderedKeys && (intrp.renderedKeys.indexOf("_ind") !== -1)) {
    		intrp.valueTo("_ind", 0, 0);
    		intrp.updateValue("_ind");
    	}
    	// lineDashOffset animation
    	// --------------------------------
    	this._valueStyles["available"].inverse = "not-available";
    }*/
    // save ctx before drawing arcs

    ctx.save(); // loop (amount)
    // --------------------------------

    var loopVal;
    /*
    NOTE: If value "amount" has changed (with valueTo()) but no yet
    interpolated, and its last rendered value is less, then its been reset
    (a reload, a loop, etc): we trigger a 'loop' of the whole arc.
    */
    // if ((intrp.renderedKeys.indexOf("amount") !== -1) && (valData._lastRenderedValue > valData._renderedValue)) {

    if (this._needsLoop) {
      this._needsLoop = false; // trigger loop

      intrp.valueTo("_loop", 1, 0);
      intrp.valueTo("_loop", 0, 750);
      intrp.updateValue("_loop");
    } // loopVal = intrp._valueData["_loop"]._renderedValue || 0;


    loopVal = intrp.getCurrentValue("_loop");
    ctx.rotate(PI2 * (BASE_ROTATION + (1 - loopVal))); // + GAP_ARC);
    // amount arc
    // --------------------------------
    // var amountGapArc = GAP_ARC;

    var lastEndArc = 0;
    s = this._valueStyles["amount"];
    arcVal = loopVal + valData._renderedValue / valData._maxVal;

    if (arcVal > 0) {
      lastEndArc = this.drawArc(arcVal, GAP_ARC, PI2 - GAP_ARC, lastEndArc, s);
      this.drawEndCap(lastEndArc, s);
      lastEndArc = lastEndArc + GAP_ARC * 2;
    } // available arc
    // --------------------------------


    s = this._valueStyles["available"];
    valData = intrp._valueData["available"];
    var stepsNum = valData.length || 1;
    var stepBaseArc = PI2 / stepsNum;
    var stepAdjustArc = stepBaseArc % GAP_ARC;
    var stepGapArc = GAP_ARC + (stepAdjustArc - s.lineDashArc) / 2;

    if (Array.isArray(valData)) {
      for (var i = 0; i < stepsNum; i++) {
        arcVal = valData[i]._renderedValue / (valData[i]._maxVal / stepsNum);
        this.drawArc(arcVal, i * stepBaseArc + stepGapArc, (i + 1) * stepBaseArc - stepGapArc, lastEndArc, s);
      }
    } else {
      arcVal = valData._renderedValue / valData._maxVal;
      this.drawArc(arcVal, stepGapArc, PI2 - stepGapArc, lastEndArc, s);
    } // restore ctx after drawing arcs
    // keep rotation transform
    //ctx.restore();


    if (this._stalled) {
      if (intrp.getTargetValue('_stalled_arc') === 0) {
        intrp.valueTo('_stalled_arc', 1, 1 * STEP_MS, easeIn).updateValue('_stalled_arc');
      }
    } else {
      if (intrp.getTargetValue('_stalled_arc') === 1) {
        intrp.valueTo('_stalled_arc', 0, 1 * STEP_MS, easeOut).updateValue('_stalled_arc');
      }
    }

    var a = intrp.getRenderedValue("_stalled_arc"); // while arc is > 0, loop indefinitely while spinning and restart
    // if at end. Otherwise let interp exhaust arc duration

    if (a > 0) {
      if (!intrp.paused && intrp.isAtTarget('_stalled_loop')) {
        intrp.valueTo('_stalled_loop', 0, 0).valueTo('_stalled_loop', 1, 2 * STEP_MS).updateValue('_stalled_loop');
      }
    }

    var l = intrp.getRenderedValue("_stalled_loop"); // always render while arc is > 0

    if (a > 0) {
      // arc span bounce
      var b = (l < 0.5 ? l % 0.5 : 0.5 - l % 0.5) * 2; // bounce + main arc span

      var aa = a * b * 0.25 + a * 0.125 + .0001; // rotation loop

      var ll = l + LOOP_OFFSET;
      ctx.save();
      ctx.lineWidth = 10 * this._canvasRatio;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeColor = 'red';
      ctx.beginPath();
      ctx.arc(0, 0, this._canvasWidth / 2, (1 - aa + ll) * PI2, (aa + ll) * PI2, false);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  },
  drawArc: function drawArc(value, startArc, endArc, prevArc, style) {
    var valArc, valStartArc, valEndArc, invStyle, invStartArc, invEndArc;
    prevArc || (prevArc = 0);
    valArc = endArc - startArc;
    valEndArc = startArc + valArc * value;
    valStartArc = Math.max(startArc, prevArc);

    if (valEndArc > valStartArc) {
      this._ctx.save();

      this.applyValueStyle(style);

      this._ctx.beginPath();

      this._ctx.arc(0, 0, style.radius, valEndArc, valStartArc, true);

      this._ctx.stroke();

      this._ctx.restore();
    } // if there's valueStyle, draw rest of span, minus prevArc overlap too


    if (style.inverse !== void 0) {
      invStyle = this._valueStyles[style.inverse];
      invEndArc = valEndArc + valArc * (1 - value);
      invStartArc = Math.max(valEndArc, prevArc);

      if (invEndArc > invStartArc) {
        this._ctx.save();

        this.applyValueStyle(invStyle);

        this._ctx.beginPath();

        this._ctx.arc(0, 0, invStyle.radius, invEndArc, invStartArc, true);

        this._ctx.stroke();

        this._ctx.restore();
      }
    }

    return valEndArc;
  },
  applyValueStyle: function applyValueStyle(s) {
    this._ctx.lineWidth = s.lineWidth;

    if (_.isArray(s.lineDash)) {
      this._ctx.setLineDash(s.lineDash);
    }

    if (_.isNumber(s.lineDashOffset)) {
      this._ctx.lineDashOffset = s.lineDashOffset;
    }
  },
  drawNotch: function drawNotch(arcPos, length, s) {
    var ex, ey, ec1, ec2;
    ex = Math.cos(arcPos);
    ey = Math.sin(arcPos);
    ec1 = s.radius;
    ec2 = s.radius - length;

    this._ctx.save();

    this.applyValueStyle(s);
    this._ctx.lineCap = "square";

    this._ctx.beginPath();

    this._ctx.moveTo(ec1 * ex, ec1 * ey);

    this._ctx.lineTo(ec2 * ex, ec2 * ey);

    this._ctx.stroke();

    this._ctx.restore();
  },
  drawEndCap: function drawEndCap(arcPos, s) {
    var radius = s.radius;

    this._ctx.save();

    this._ctx.lineWidth = s.lineWidth;

    this._ctx.rotate(arcPos - GAP_ARC * 2); // 1.5);


    this._ctx.beginPath();

    this._ctx.arc(0, 0, radius, GAP_ARC * 0.5, GAP_ARC * 2, false);

    this._ctx.lineTo(radius - GAP_ARC * radius, 0);

    this._ctx.closePath();

    this._ctx.fill();

    this._ctx.stroke();

    this._ctx.restore();
  },
  drawLabel: function drawLabel(s) {
    if (this._labelText !== s) {
      this._labelText = s;
      this._labelWidth = this._ctx.measureText(s).width;
    }

    this._ctx.fillText(s, this._labelWidth * -0.5, this._baselineShift, this._labelWidth);
  }
});

if (DEBUG) {
  module.exports.prototype._logFlags = "";
}

}).call(this,true,require("underscore"))

},{"app/view/base/CanvasView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/CanvasView.js","underscore":"underscore","utils/ease/fn/easeInQuad":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/ease/fn/easeInQuad.js","utils/ease/fn/easeOutQuad":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/ease/fn/easeOutQuad.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/Carousel.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/component/Carousel
 */

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:hammerjs} */


var Hammer = require("hammerjs");
/** @type {module:utils/touch/SmoothPanRecognizer} */


var Pan = require("utils/touch/SmoothPanRecognizer");
/** @type {module:hammerjs.Tap} */


var Tap = Hammer.Tap;
/** @type {module:app/control/Globals} */

var Globals = require("app/control/Globals");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View"); // /** @type {module:app/view/base/DeferredView} */
// var View = require("app/view/base/DeferredView");

/** @type {module:app/view/render/CarouselRenderer} */


var CarouselRenderer = require("app/view/render/CarouselRenderer");
/** @type {module:utils/prefixedProperty} */


var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/prefixedStyleName} */


var prefixedStyleName = require("utils/prefixedStyleName");

var transformStyleName = prefixedStyleName("transform");
var transformProperty = prefixedProperty("transform");
var translateTemplate = Globals.TRANSLATE_TEMPLATE; // var cssToPx = function(cssVal, el) {
// 	return parseInt(cssVal);
// };
// var defaultRendererFunction = (function() {
// 	var defaultRenderer = CarouselRenderer.extend({ className: "carousel-item default-renderer"}),
// 		emptyRenderer = CarouselRenderer.extend({ className: "carousel-item empty-renderer"});
// 	return function(item, index, arr) {
// 		return (index === -1)? emptyRenderer: defaultRenderer;
// 	};
// })();

/** @const */

var MAX_SELECT_THRESHOLD = 20; // /** @const */
// var CHILDREN_INVALID = View.CHILDREN_INVALID,
// 	STYLES_INVALID = View.STYLES_INVALID,
// 	MODEL_INVALID = View.MODEL_INVALID,
// 	SIZE_INVALID = View.SIZE_INVALID,
// 	LAYOUT_INVALID = View.LAYOUT_INVALID;

var VERTICAL = Hammer.DIRECTION_VERTICAL,
    HORIZONTAL = Hammer.DIRECTION_HORIZONTAL; // x: ["x", "y"],
// y: ["y", "x"],
// offsetLeft: ["offsetLeft", "offsetTop"],
// offsetTop: ["offsetTop", "offsetLeft"],
// offsetWidth: ["offsetWidth", "offsetHeight"],
// offsetHeight: ["offsetHeight", "offsetWidth"],
// width: ["width","height"],
// height: ["height","width"],
// marginLeft: ["marginLeft","marginTop"],
// marginRight: ["marginRight","marginBottom"],

/*
var HORIZONTAL_PROPS = {
	pos: "x",
	size: "width",
	offsetPos: "offsetLeft",
	offsetSize: "offsetWidth",
	marginBefore: "marginLeft",
	marginAfter: "marginRight",
};
var VERTICAL_PROPS = {
	pos: "y",
	size: "height",
	offsetPos: "offsetTop",
	offsetSize: "offsetHeight",
	marginBefore: "marginTop",
	marginAfter: "marginBottom",
};
*/
// var DIRECTION_NONE = 1;
// var DIRECTION_LEFT = 2;
// var DIRECTION_RIGHT = 4;
// var DIRECTION_UP = 8;
// var DIRECTION_DOWN = 16;

var dirToStr = function dirToStr(dir) {
  if (dir === Hammer.DIRECTION_NONE) return 'NONE';
  if (dir === Hammer.DIRECTION_LEFT) return 'LEFT';
  if (dir === Hammer.DIRECTION_RIGHT) return 'RIGHT';
  if (dir === Hammer.DIRECTION_UP) return 'UP';
  if (dir === Hammer.DIRECTION_DOWN) return 'DOWN';
  if (dir === Hammer.DIRECTION_HORIZONTAL) return 'HOR'; //IZONTAL';

  if (dir === Hammer.DIRECTION_VERTICAL) return 'VER'; //TICAL';

  if (dir === Hammer.DIRECTION_ALL) return 'ALL';
  return 'UNREC'; //OGNIZED';
};

var isValidTouchManager = function isValidTouchManager(touch, direction) {
  // var retval;
  try {
    return touch.get("hpan").options.direction == direction;
  } catch (err) {
    return false;
  } // return retval;

}; // /** @type {int} In pixels */
// var panThreshold: 15;


var createTouchManager = function createTouchManager(el, dir, thres) {
  var touch = new Hammer.Manager(el);
  var pan = new Pan({
    event: "hpan",
    threshold: Globals.THRESHOLD,
    direction: Hammer.DIRECTION_HORIZONTAL
  });
  var tap = new Tap({
    threshold: Globals.THRESHOLD - 1,
    interval: 50,
    time: 200
  });
  tap.recognizeWith(pan);
  touch.add([pan, tap]);
  return touch;
};

var Carousel = {
  /** const */
  ANIMATED: false,

  /** const */
  IMMEDIATE: true,

  /** copy of Hammer.DIRECTION_VERTICAL */
  DIRECTION_VERTICAL: VERTICAL,

  /** copy of Hammer.DIRECTION_HORIZONTAL */
  DIRECTION_HORIZONTAL: HORIZONTAL,

  /** @type {Object} */
  defaults: {
    /** @type {boolean} */
    selectOnScrollEnd: false,

    /** @type {boolean} */
    requireSelection: false,

    /** @type {int} */
    direction: HORIZONTAL,

    /** @type {int} In pixels */
    selectThreshold: 20,

    /** @type {Function} */
    rendererFunction: function () {
      var defaultRenderer = CarouselRenderer.extend({
        className: "carousel-item default-renderer"
      }),
          emptyRenderer = CarouselRenderer.extend({
        className: "carousel-item empty-renderer"
      });
      return function (item, index, arr) {
        return index === -1 ? emptyRenderer : defaultRenderer;
      };
    }()
  }
};
Carousel.validOptions = _.keys(Carousel.defaults);
/**
/* @constructor
/* @type {module:app/view/component/Carousel}
/*/

var CarouselProto = {
  /** @override */
  cidPrefix: "carousel",

  /** @override */
  tagName: "div",

  /** @override */
  className: "carousel skip-transitions",

  /* --------------------------- *
  /* properties
  /* --------------------------- */
  properties: {
    scrolling: {
      get: function get() {
        return this._scrolling;
      }
    },
    selectedItem: {
      get: function get() {
        return this._selectedView.model;
      },
      set: function set(value) {
        if (value) this._onSelectOne(value);else this._onSelectNone();
      }
    }
  },
  events: {
    // "mousedown": "_onMouseDown", "mouseup": "_onMouseUp",
    "transitionend .carousel-item.selected": "_onScrollTransitionEnd",
    "click .carousel-item:not(.selected)": "_onClick"
  },

  /** @override */
  initialize: function initialize(options) {
    _.bindAll(this, "_onPointerEvent", "_onClick");

    this.itemViews = new Container();
    this.metrics = {};

    _.extend(this, _.defaults(_.pick(options, Carousel.validOptions), Carousel.defaults)); // this.childGap = 0; //this.dirProp(20, 18);


    this._precedingDir = (Hammer.DIRECTION_LEFT | Hammer.DIRECTION_UP) & this.direction;
    this._followingDir = (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_DOWN) & this.direction; // use supplied touch mgr or create private

    if (isValidTouchManager(options.touch, this.direction)) {
      this.touch = options.touch;
    } else {
      console.warn("%s::initialize creating Hammer instance", this.cid);
      this.touch = createTouchManager(this.el, this.direction); // this.on("view:removed", this.touch.destroy, this.touch);

      this.listenTo(this, "view:removed", function () {
        this.touch.destroy();
      });
    }
    /* create children and props */


    this.setEnabled(true);
    this.skipTransitions = true;
    this._renderFlags = View.CHILDREN_INVALID; // this.invalidateChildren();

    this.listenTo(this, "view:attached", function () {
      this.skipTransitions = true; // this.invalidateSize();
      // this.renderNow();
      // this.requestRender();

      this.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
    });
    /* collection listeners */

    this.listenTo(this.collection, {
      "reset": this._onReset,
      "select:one": this._onSelectOne,
      "select:none": this._onSelectNone,
      "deselect:one": this._onDeselectAny,
      "deselect:none": this._onDeselectAny
    });
  },

  /* --------------------------- *
  /* Hammer init
  /* --------------------------- */
  // validateTouchManager: function(touch, direction) {
  // 	try {
  // 		return touch.get("pan").options.direction === direction);
  // 	} catch (err) {
  // 		return false;
  // 	}
  // },
  // initializeHammer: function(options) {
  // 	// direction from opts/defaults
  // 	if (options.direction === VERTICAL) {
  // 		this.direction = VERTICAL;
  // 	} // do nothing: the default is horizontal
  //
  // 	// validate hammer instance or create local
  // 	if ((touch = options.touch) && (pan = touch.get("pan"))) {
  // 		// Override direction only if specific
  // 		if (pan.options.direction !== Hammer.DIRECTION_ALL) {
  // 			this.direction = pan.options.direction;
  // 		}
  // 		this.panThreshold = pan.options.threshold;
  // 	} else {
  // 		console.warn("%s::initializeHammer using private Hammer instance", this.cid);
  // 		touch = createHammerInstance(this.el, this.panThreshold, this.direction);
  // 		this.on("view:removed", touch.destroy, touch);
  // 	}
  // 	this.touch = touch;
  // },
  remove: function remove() {
    // this._scrollPendingAction && this._scrollPendingAction(true);
    // if (this._enabled) {
    // 	this.touch.off("tap", this._onTap);
    // 	this.touch.off("hpanstart hpanmove hpanend hpancancel", this._onPan);
    // }
    this._togglePointerEvents(false);

    this.removeChildren();
    View.prototype.remove.apply(this, arguments);
    return this;
  },

  /* --------------------------- *
  /* helper functions
  /* --------------------------- */
  dirProp: function dirProp(hProp, vProp) {
    return this.direction & HORIZONTAL ? hProp : vProp;
  },

  /* --------------------------- *
  /* Render
  /* --------------------------- */
  // render: function() {
  // 	if (this.attached) {
  // 		this.skipTransitions = true;
  // 		// this.invalidateSize();
  // 		this.renderNow(true);
  // 	}
  // },
  // /** @override */
  // render: function () {
  // 	if (!this.attached) {
  // 		if (!this._renderPending) {
  // 			this._renderPending = true;
  // 			this.listenTo(this, "view:attached", this.render);
  // 		}
  // 	} else {
  // 		if (this._renderPending) {
  // 			this._renderPending = false;
  // 			this.stopListening(this, "view:attached", this.render);
  // 		}
  // 		this._delta = 0;
  // 		this.skipTransitions = true;
  // 		this.invalidateSize();
  // 		// this.invalidateLayout();
  // 		this.renderNow();
  // 	}
  // 	return this;
  // },
  // render: function () {
  // 	this.measureLater();
  // 	this.scrollBy(0, Carousel.IMMEDIATE);
  //
  // 	if (this.el.parentElement) {
  // 		this.renderNow();
  // 	}
  // 	return this;
  // },

  /** @override */
  renderFrame: function renderFrame(tstamp, flags) {
    if (flags & View.CHILDREN_INVALID) {
      this._createChildren(); // clear this flag now: render may be deferred until attached


      flags &= ~View.CHILDREN_INVALID;
    }

    if (this.attached) {
      if (flags & View.SIZE_INVALID) {
        this._measure();
      }

      if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
        this._scrollBy(this._delta, this.skipTransitions);
      }
    } else if (flags) {
      this.listenToOnce(this, "view:attached", function () {
        this.requestRender(flags);
      });
    }
  },

  /* --------------------------- *
  /* enabled
  /* --------------------------- */
  // /** @override */
  // _enabled: undefined,

  /** @override */
  setEnabled: function setEnabled(enabled) {
    if (this._enabled !== enabled) {
      this._enabled = enabled; // toggle events immediately

      this._togglePointerEvents(enabled); // dom manipulation on render (_renderEnabled)
      // this._renderFlags |= View.STYLES_INVALID;
      // this.requestRender();


      this.setImmediate(this._renderEnabled); // this._renderEnabled();
    }
  },
  _renderEnabled: function _renderEnabled() {
    this.el.classList.toggle("disabled", !this.enabled);
    this.itemViews.each(function (view) {
      view.setEnabled(this.enabled);
    }, this);
  },

  /* --------------------------- *
  /* Create children
  /* --------------------------- */
  _createChildren: function _createChildren() {
    // var sIndex;
    var buffer, renderer, view, viewOpts;
    this.removeChildren();

    if (this.collection.length) {
      viewOpts = {
        // viewDepth: this.viewDepth + 1,
        // parentView: this,
        enabled: this.enabled
      };
      buffer = document.createDocumentFragment(); // buffer = this.el;

      if (!this.requireSelection) {
        renderer = this.rendererFunction(null, -1, this.collection);
        view = new renderer(viewOpts);
        this.itemViews.add(view);
        buffer.appendChild(view.el);
        this.emptyView = view;
      }

      this.collection.each(function (item, index, arr) {
        viewOpts.model = item;
        renderer = this.rendererFunction(item, index, arr);
        view = new renderer(viewOpts);
        this.itemViews.add(view);
        buffer.appendChild(view.el);
      }, this); // if (!this.requireSelection) {
      // 	buffer = this.appendItemView(buffer, this.model, -1, this.collection);
      // 	this.emptyView = this.itemViews.first();
      // }
      // buffer = this.collection.reduce(this.appendItemView, buffer, this);

      this.adjustToSelection();

      this._selectedView.el.classList.add("selected");

      this.el.appendChild(buffer);
    }
  },
  // appendItemView: function (parentEl, model, index, arr) {
  // 	var renderer = this.rendererFunction(model, index, arr);
  // 	var view = new renderer({
  // 		model: model,
  // 		parentView: this,
  // 		enabled: this.enabled
  // 	});
  // 	this.itemViews.add(view);
  // 	parentEl.appendChild(view.el);
  // 	return parentEl;
  // },
  // createItemView: function (renderer, opts) {
  // 	var view = new renderer(opts);
  // 	this.itemViews.add(view);
  // 	return view;
  // },
  removeChildren: function removeChildren() {
    this.itemViews.each(this.removeItemView, this);
    this.emptyView = void 0;
  },
  removeItemView: function removeItemView(view) {
    this.itemViews.remove(view);
    view.remove();
    return view;
  },

  /* --------------------------- *
  /* measure
  /* --------------------------- */
  _measure: function _measure() {
    var m, mm;
    var pos = 0,
        posInner = 0;
    var maxAcross = 0,
        maxOuter = 0;
    var maxOuterView, maxAcrossView;
    maxOuterView = maxAcrossView = this.emptyView || this.itemViews.first(); // chidren metrics

    this.itemViews.each(function (view) {
      view.render();
    });
    this.itemViews.each(function (view) {
      m = this.measureItemView(view);
      m.pos = pos;
      pos += m.outer; // + this.childGap;

      m.posInner = posInner;
      posInner += m.inner; //+ this.childGap;

      if (view !== this.emptyView) {
        if (m.across > maxAcross) {
          maxAcross = m.across;
          maxAcrossView = view;
        }

        if (m.outer > maxOuter) {
          maxOuter = m.outer;
          maxOuterView = view;
        }
      }
    }, this); // measure self + max child metrics

    mm = this.metrics[this.cid] || (this.metrics[this.cid] = {});
    mm.outer = this.el[this.dirProp("offsetWidth", "offsetHeight")];
    mm.before = maxOuterView.el[this.dirProp("offsetLeft", "offsetTop")];
    mm.inner = maxOuterView.el[this.dirProp("offsetWidth", "offsetHeight")];
    mm.after = mm.outer - (mm.inner + mm.before);
    mm.across = maxAcross; // m = this.metrics[maxOuterView.cid];
    // mm.inner = m.inner;
    // tap area

    this._tapAcrossBefore = maxAcrossView.el[this.dirProp("offsetTop", "offsetLeft")];
    this._tapAcrossAfter = this._tapAcrossBefore + maxAcross;
    this._tapBefore = mm.before + this._tapGrow;
    this._tapAfter = mm.before + mm.inner - this._tapGrow;
    this.selectThreshold = Math.min(MAX_SELECT_THRESHOLD, mm.outer * 0.1);
  },
  measureItemView: function measureItemView(view) {
    var m, viewEl; // var s, sizeEl;

    viewEl = view.el;
    m = this.metrics[view.cid] || (this.metrics[view.cid] = {});
    m.outer = viewEl[this.dirProp("offsetWidth", "offsetHeight")];
    m.across = viewEl[this.dirProp("offsetHeight", "offsetWidth")];

    if (view.metrics) {
      m.before = view.metrics[this.dirProp("marginLeft", "marginTop")];
      m.outer += m.before;
      m.outer += view.metrics[this.dirProp("marginRight", "marginBottom")];
      m.inner = view.metrics.content[this.dirProp("width", "height")];
      m.before += view.metrics.content[this.dirProp("x", "y")];
      m.after = m.outer - (m.inner + m.before); // var marginBefore = view.metrics[this.dirProp("marginLeft","marginTop")];
      // var marginAfter = view.metrics[this.dirProp("marginRight","marginBottom")];
      // var pos = view.metrics.content[this.dirProp("x","y")];
      //
      // m.inner = view.metrics.content[this.dirProp("width","height")];
      // m.before = marginBefore + pos;
      // m.outer += marginBefore + marginAfter;
      // m.after = m.outer - (m.inner + m.before);
    } else {
      // throw new Error("renderer has no metrics");
      console.warn("%s::measureItemView view '%s' has no metrics", this.cid, view.cid);
      m.inner = m.outer;
      m.after = m.before = 0;
    }

    return m;
  },

  /* --------------------------- *
  /* scrolling property
  /* --------------------------- */
  _delta: 0,
  _scrolling: false,
  _setScrolling: function _setScrolling(scrolling) {
    // console.warn("_setScrolling current/requested", this._scrolling, scrolling);
    if (this._scrolling != scrolling) {
      this._scrolling = scrolling;
      this.el.classList.toggle("scrolling", scrolling);
      this.trigger(scrolling ? "view:scrollstart" : "view:scrollend");
    }
  },

  /* --------------------------- *
  /* Scroll/layout
  /* --------------------------- */
  scrollBy: function scrollBy(delta, skipTransitions) {
    this._delta = delta || 0;
    this.skipTransitions = !!skipTransitions; // this.invalidateLayout();

    this.requestRender(View.LAYOUT_INVALID);
  },
  _scrollBy: function _scrollBy(delta, skipTransitions) {
    var sMetrics, metrics, pos;
    sMetrics = this.metrics[(this._scrollCandidateView || this._selectedView).cid];
    this.itemViews.each(function (view) {
      metrics = this.metrics[view.cid];
      pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics));
      view.metrics.translateX = this.direction & HORIZONTAL ? pos : 0;
      view.metrics.translateY = this.direction & HORIZONTAL ? 0 : pos;
      view.metrics._transform = translateTemplate(view.metrics.translateX, view.metrics.translateY);
      view.el.style[transformProperty] = view.metrics._transform; // view.el.style[transformProperty] = (this.direction & HORIZONTAL)?
      // 	"translate3d(" + pos + "px,0,0)":
      // 	"translate3d(0," + pos + "px,0)";
    }, this);
    this.el.classList.toggle("skip-transitions", skipTransitions);
    this.selectFromView();
  },
  _getScrollOffset: function _getScrollOffset(delta, mCurr, mSel) {
    var pos,
        offset = 0;
    pos = mCurr.pos - mSel.pos + delta;

    if (pos < 0) {
      if (Math.abs(pos) < mSel.outer) {
        offset += -mCurr.after / mSel.outer * pos;
      } else {
        offset += mCurr.after;
      }
    } else if (0 <= pos) {
      if (Math.abs(pos) < mSel.outer) {
        offset -= mCurr.before / mSel.outer * pos;
      } else {
        offset -= mCurr.before;
      }
    }

    return pos + offset;
  },
  _onScrollTransitionEnd: function _onScrollTransitionEnd(ev) {
    if (ev.propertyName === transformStyleName && this.scrolling) {
      console.log("%s::_onScrollTransitionEnd selected: %s", this.cid, ev.target.cid);

      this._setScrolling(false);
    }
  },

  /* --------------------------- *
  /* toggle touch events
  /* --------------------------- */
  _togglePointerEvents: function _togglePointerEvents(enable) {
    // console.log("%s::_togglePointerEvents", this.cid, enable);
    if (this._pointerEventsEnabled == enable) return;
    this._pointerEventsEnabled = enable;

    if (enable) {
      this.touch.on("hpanstart hpanmove hpanend hpancancel", this._onPointerEvent);
      this.el.addEventListener(View.CLICK_EVENT, this._onClick, true);
    } else {
      this.touch.off("hpanstart hpanmove hpanend hpancancel", this._onPointerEvent);
      this.el.removeEventListener(View.CLICK_EVENT, this._onClick, true);
    }
  },
  _onPointerEvent: function _onPointerEvent(ev) {
    // NOTE: https://github.com/hammerjs/hammer.js/pull/1118
    if (ev.srcEvent.type === 'pointercancel') return;
    console.log("%s:[%s (%s)]:_onPointerEvent offs:%s [%s|%s==%s] [%s]", this.cid, ev.type, ev.srcEvent.type, dirToStr(ev.offsetDirection), dirToStr(ev.direction), dirToStr(this.direction), dirToStr(ev.direction | this.direction), ev.srcEvent.defaultPrevented ? "prevented" : "-"); // if (ev.direction & this.direction) {

    switch (ev.type) {
      // case View.CLICK_EVENT:
      // 	return this._onClick(ev);
      // case "tap":
      // 	return this._onTap(ev);
      case "hpanstart":
        return this._onPanStart(ev);

      case "hpanmove":
        return this._onPanMove(ev);

      case "hpanend":
        return this._onPanFinal(ev);

      case "hpancancel":
        return this._onPanFinal(ev);
    } // }

  },

  /* --------------------------- *
  /* touch event: pan
  /* --------------------------- */
  getViewAtPanDir: function getViewAtPanDir(dir) {
    // return (dir & this._precedingDir) ? this._precedingView : this._followingView;
    return dir & this._followingDir ? this._precedingView : this._followingView;
  },
  // _panCapturedOffset: 0,

  /** @param {Object} ev */
  _onPanStart: function _onPanStart(ev) {
    this.selectFromView();
    this.el.classList.add("panning");

    this._setScrolling(true);
  },

  /** @param {Object} ev */
  _onPanMove: function _onPanMove(ev) {
    // var delta = (this.direction & HORIZONTAL) ? ev.thresholdDeltaX : ev.thresholdDeltaY;
    var delta = this.direction & HORIZONTAL ? ev.deltaX : ev.deltaY;
    var view = this.getViewAtPanDir(ev.offsetDirection);
    var cView = this._panCandidateView;

    if (cView !== view) {
      cView && cView.el.classList.remove("candidate");
      view && view.el.classList.add("candidate");
      this._panCandidateView = view;
    }

    if (cView === void 0) {
      delta *= Globals.HPAN_OUT_DRAG;
    }

    if (this._renderRafId !== -1) {
      this.scrollBy(delta, Carousel.IMMEDIATE);
      this.renderNow();
    } else {
      this._scrollBy(delta, Carousel.IMMEDIATE);
    }
  },

  /** @param {Object} ev */
  _onPanFinal: function _onPanFinal(ev) {
    var scrollCandidate; // NOTE: this delta is used for determining selection, NOT for layout
    // var delta = (this.direction & HORIZONTAL) ? ev.thresholdDeltaX : ev.thresholdDeltaY;

    var delta = this.direction & HORIZONTAL ? ev.deltaX : ev.deltaY;

    if (ev.type == "hpanend" &&
    /* pan direction (current event) and offsetDirection (whole gesture) must match */
    ev.direction ^ ev.offsetDirection ^ this.direction // && (ev.direction & ev.offsetDirection & this.direction)

    /* gesture must overshoot selectThreshold */
    && Math.abs(delta) > this.selectThreshold) {
      /* choose next scroll target */
      scrollCandidate = this.getViewAtPanDir(ev.offsetDirection);
    }

    this._scrollCandidateView = scrollCandidate || void 0;

    if (this._panCandidateView && this._panCandidateView !== scrollCandidate) {
      this._panCandidateView.el.classList.remove("candidate");
    }

    this._panCandidateView = void 0;
    this.el.classList.remove("panning");
    console.log("%s:[%s]:_onPanFinal thres:(%s>%s) dir:(e:%s o:%s c:%s)=%s\n", this.cid, ev.type, Math.abs(delta), this.selectThreshold, dirToStr(ev.direction), dirToStr(ev.offsetDirection), dirToStr(this.direction), dirToStr(ev.direction ^ ev.offsetDirection ^ this.direction), scrollCandidate ? scrollCandidate.cid + ":" + scrollCandidate.model.cid : "none"); // console.log("%s::_onPanFinal", this.cid, ev);

    this.scrollBy(0, Carousel.ANIMATED);
    this.selectFromView(); // if (this._renderRafId !== -1) {
    // 	this.scrollBy(0, Carousel.ANIMATED);
    // 	this.renderNow();
    // } else {
    // 	this._scrollBy(0, Carousel.ANIMATED);
    // }
  },

  /* --------------------------- *
  /* touch event: tap
  /* --------------------------- */

  /** @type {int} In pixels */
  _tapGrow: 10,
  getViewAtTapPos: function getViewAtTapPos(posAlong, posAcross) {
    if (this._tapAcrossBefore < posAcross && posAcross < this._tapAcrossAfter) {
      if (posAlong < this._tapBefore) {
        return this._precedingView;
      } else if (posAlong > this._tapAfter) {
        return this._followingView;
      }
    }

    return void 0;
  },
  _onClick: function _onClick(ev) {
    console.log("%s::_onClick [%s]", this.cid, ev.type, ev.defaultPrevented ? "prevented" : "not-prevented");

    this._onTap(ev);
  },
  _onTap: function _onTap(ev) {
    if (ev.defaultPrevented) return;
    var tapCandidate;
    var targetView = View.findByDescendant(ev.target); // console.log("%s::_onTap %o", this.cid, targetView.cid, ev.target);
    // if (!this.itemViews.contains(targetView)) {
    // 	return;
    // }

    do {
      if (this._selectedView === targetView) {
        tapCandidate = null;
        break;
      } else if (this === targetView.parentView) {
        tapCandidate = targetView;
        break;
      } else if (this === targetView) {
        var bounds, tapX, tapY;
        bounds = this.el.getBoundingClientRect();
        tapX = (ev.type === "tap" ? ev.center.x : ev.clientX) - bounds.left;
        tapY = (ev.type === "tap" ? ev.center.y : ev.clientY) - bounds.top;
        tapCandidate = this.getViewAtTapPos(this.dirProp(tapX, tapY), this.dirProp(tapY, tapX));
        break;
      }
    } while (targetView = targetView.parentView);

    if (tapCandidate) {
      ev.preventDefault(); // ev.stopPropagation();
      // this._scrollCandidateView = tapCandidate;
      // this._setScrolling(true);
      // this.scrollBy(0, Carousel.ANIMATED);
      // this._scrollCandidateView.el.classList.add("candidate");
      // this.selectFromView();
      //// NOT using internalSelection
      // this.triggerSelectionEvents(tapCandidate, false);
      // using internalSelection

      this._scrollCandidateView = tapCandidate;

      this._setScrolling(true);

      this.scrollBy(0, Carousel.ANIMATED);
      this.triggerSelectionEvents(tapCandidate, true); // this.renderNow();
    }
  },

  /* --------------------------- *
  /* Private
  /* --------------------------- */
  triggerSelectionEvents: function triggerSelectionEvents(view, internal) {
    if (view === void 0 || this._internalSelection) {
      return;
    }

    this._internalSelection = !!internal;

    if (view === this.emptyView) {
      this.trigger("view:select:none");
    } else {
      this.trigger("view:select:one", view.model);
    }

    this._internalSelection = false;
  },
  selectFromView: function selectFromView() {
    if (this._scrollCandidateView) {
      this.triggerSelectionEvents(this._scrollCandidateView, true);
    } // if (this._scrollCandidateView === (void 0)) {
    // 	return;
    // }
    // var view = this._scrollCandidateView;
    // this.triggerSelectionEvents(view, true);

  },
  adjustToSelection: function adjustToSelection() {
    var m,
        i = this.collection.selectedIndex; // assume -1 < index < this.collection.length

    if (this.requireSelection) {
      i == -1 && i++; // if selection is null (index -1), set _selectedView to first item (index 0)

      this._selectedView = (m = this.collection.at(i)) && this.itemViews.findByModel(m);
      this._precedingView = (m = this.collection.at(i - 1)) && this.itemViews.findByModel(m);
      this._followingView = (m = this.collection.at(i + 1)) && this.itemViews.findByModel(m);
    } else {
      this._selectedView = (m = this.collection.at(i)) ? this.itemViews.findByModel(m) : this.emptyView;
      this._precedingView = m && ((m = this.collection.at(i - 1)) ? this.itemViews.findByModel(m) : this.emptyView);
      this._followingView = (m = this.collection.at(i + 1)) && this.itemViews.findByModel(m);
    }
  },

  /* --------------------------- *
  /* Model listeners
  /* --------------------------- */

  /** @private */
  _onSelectOne: function _onSelectOne(model) {
    if (model === this._selectedView.model) {
      // console.info("INTERNAL");
      return;
    }

    this._onSelectAny(model);
  },

  /** @private */
  _onSelectNone: function _onSelectNone() {
    if ((this.requireSelection ? this.itemViews.first() : this.emptyView) === this._selectedView) {
      // console.info("INTERNAL");
      return;
    }

    this._onSelectAny();
  },

  /** @private */
  _onSelectAny: function _onSelectAny(model) {
    this._selectedView.el.classList.remove("selected");

    this.adjustToSelection();

    this._selectedView.el.classList.add("selected");

    if (this._scrollCandidateView) {
      this._scrollCandidateView.el.classList.remove("candidate");

      this._scrollCandidateView = void 0;
    }

    if (!this._internalSelection) {
      this._setScrolling(true);

      this.scrollBy(0, Carousel.ANIMATED);
    }
  },
  // _onDeselectAny: function (model) {},

  /** @private */
  _onReset: function _onReset() {
    // this._createChildren();
    // this.invalidateChildren();
    this.requestRender(View.CHILDREN_INVALID | View.MODEL_INVALID);
  }
  /* --------------------------- *
  /* TEMP
  /* --------------------------- */
  // _scrollBy2: function (delta, skipTransitions) {
  // 	var metrics, pos;
  // 	var sMetrics = this.metrics[(this._scrollCandidateView || this._selectedView).cid];
  // 	var cMetrics = this.metrics[(this._panCandidateView || this._selectedView).cid];
  //
  // 	this.itemViews.each(function (view) {
  // 		metrics = this.metrics[view.cid];
  // 		pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics, cMetrics));
  // 		view.el.style[transformProperty] = (this.direction & HORIZONTAL)?
  // 				"translate3d(" + pos + "px,0,0)" : "translate3d(0," + pos + "px,0)";
  // 				// "translate(" + pos + "px,0)" : "translate(0," + pos + "px)";
  // 				// "translateX(" + pos + "px)" : "translateY(" + pos + "px)";
  // 	}, this);
  // 	this.el.classList.toggle("skip-transitions", skipTransitions);
  // 	this.selectFromView();
  // },
  // _getScrollOffset2: function (delta, mCurr, mSel, mCan) {
  // 	var offset = 0;
  // 	var posInner = mCurr.posInner - mSel.posInner + delta;
  //
  // 	if (posInner < -mSel.inner) {
  // 		offset = -(mCurr.before);
  // 	} else if (posInner > mSel.inner) {
  // 		offset = (mSel.after);
  // 	} else {
  // 		if (posInner < 0) {
  // 			offset = (mCurr.before) / (mCurr.inner) * posInner;
  // 		} else {
  // 			offset = (mSel.after) / (mCan.inner) * posInner;
  // 		}
  // 	}
  // 	return posInner + offset;
  // },
  // captureSelectedOffset: function() {
  // 	var val, view, cssval, m, mm;
  //
  // 	val = 0;
  // 	view = this._scrollCandidateView || this._selectedView;
  // 	cssval = getComputedStyle(view.el)[transformProperty];
  //
  // 	mm = cssval.match(/(matrix|matrix3d)\(([^\)]+)\)/);
  // 	if (mm) {
  // 		m = mm[2].split(",");
  // 		if (this.direction & HORIZONTAL) {
  // 			val = m[mm[1]=="matrix"? 4 : 12];
  // 		} else {
  // 			val = m[mm[1]=="matrix"? 5 : 13];
  // 		}
  // 		val = parseFloat(val);
  // 	}
  //
  // 	console.log("%s::captureSelectedOffset", this.cid, cssval, val, cssval.match(/matrix\((?:\d\,){3}(\d)\,(\d)|matrix3d\((?:\d\,){11}(\d)\,(\d)/));
  //
  // 	return val;
  // },
  // _onScrollEnd: function(exec) {
  // 	this._scrollEndCancellable = (void 0);
  // 	// this.el.classList.remove("disabled-changing");
  // 	if (exec) {
  // 		this._setScrolling(false);
  // 		// this.el.classList.remove("scrolling");
  // 		// this.trigger("view:scrollend");
  // 		console.log("%s::_onScrollEnd", this.cid);
  // 	}
  // },
  // _onMouseDown: function(ev) {
  // 	if (this._scrolling) {
  // 		this._panCapturedOffset = this.captureSelectedOffset();
  // 		console.log("%s::events[mousedown] scrolling interrupted (pos %f)", this.cid, this._panCapturedOffset);
  // 	}
  // },
  // _onMouseUp:function(ev) {
  // 	this._panCapturedOffset = 0;
  // },

};

if (DEBUG) {
  CarouselProto._logFlags = "";
}

module.exports = Carousel = View.extend(CarouselProto, Carousel);

}).call(this,true,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","app/view/render/CarouselRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/CarouselRenderer.js","backbone.babysitter":"backbone.babysitter","hammerjs":"hammerjs","underscore":"underscore","utils/prefixedProperty":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedProperty.js","utils/prefixedStyleName":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedStyleName.js","utils/touch/SmoothPanRecognizer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/touch/SmoothPanRecognizer.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/CollectionStack.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"id","hash":{},"data":data}) : helper)));
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/CollectionStack.js":[function(require,module,exports){
"use strict";

/**
 * @module app/view/component/CollectionStack
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {string} */


var viewTemplate = require("./CollectionStack.hbs");
/**
 * @constructor
 * @type {module:app/component/CollectionStack}
 */


module.exports = View.extend({
  /** @override */
  cidPrefix: "stack",

  /** @override */
  tagName: "div",

  /** @override */
  className: "stack",

  /** @override */
  template: viewTemplate,
  events: {
    "transitionend": function transitionend(ev) {
      // console.log("%s::transitionend [invalid: %s] [transition: %s]", this.cid, this._contentInvalid, (this._skipTransitions? "skip": "run"), ev.target.id, ev.target.className);
      this._renderContent();
    }
  },
  initialize: function initialize(options) {
    this._enabled = true;
    this._skipTransitions = true;
    this._contentInvalid = true;
    options.template && (this.template = options.template);
    this.content = document.createElement("div");
    this.content.className = "stack-item";
    this.el.appendChild(this.content);
    this.listenTo(this.collection, "select:one select:none", this._onSelectChange);
  },
  setEnabled: function setEnabled(enabled) {
    if (this._enabled !== enabled) {
      this._enabled = enabled;
      this.el.classList.toggle("disabled", !this._enabled);
    }
  },
  _onSelectChange: function _onSelectChange(item) {
    if (this._renderedItem === this.collection.selected) {
      throw new Error("change event received but item is identical");
    }

    this._renderedItem = this.collection.selected;
    this._contentInvalid = true;
    this.render();
  },

  /* --------------------------- *
  /* render
  /* --------------------------- */
  render: function render() {
    if (this._skipTransitions) {
      // execute even if content has not changed to apply styles immediately
      this._skipTransitions = false;
      this.el.classList.add("skip-transitions");
      this.setImmediate(function () {
        this.el.classList.remove("skip-transitions");
      }); // render changed content immediately

      if (this._contentInvalid) {
        this._renderContent();
      }
    } else {
      // else remove 'current' class and render on transitionend
      if (this._contentInvalid) {
        this.content.classList.remove("current"); // this.content.className = "stack-item";
      }
    }

    return this;
  },
  _renderContent: function _renderContent() {
    if (this._contentInvalid) {
      this._contentInvalid = false;
      var item = this.collection.selected;
      this.content.innerHTML = item ? this.template(item.toJSON()) : "";
      this.content.classList.add("current"); // this.content.className = "stack-item current";
    }
  }
});

},{"./CollectionStack.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/CollectionStack.hbs","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/FilterableListView.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
/* @module app/view/component/FilterableListView
/*/

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/component/ClickableRenderer} */


var ClickableRenderer = require("app/view/render/ClickableRenderer");
/** @type {module:utils/prefixedProperty} */


var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/css/getBoxEdgeStyles} */


var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");
/** @type {module:utils/array/difference} */


var diff = require("utils/array/difference");
/** @type {module:utils/promise/resolveAll} */


var resolveAll = require("utils/promise/resolveAll");
/** @type {module:utils/promise/rejectAll} */


var rejectAll = require("utils/promise/rejectAll"); // var resolveAll = function(pp, result) {
// 	if (pp.length != 0) {
// 		pp.forEach(function(p, i, a) {
// 			p.resolve(result);
// 			a[i] = null;
// 		});
// 		pp.length = 0;
// 	}
// 	return pp;
// };
// var rejectAll = function(pp, reason) {
// 	if (pp.length != 0) {
// 		pp.forEach(function(p, i, a) {
// 			p.reject(reason);
// 			a[i] = null;
// 		});
// 		pp.length = 0;
// 	}
// 	return pp;
// };

/** @type {module:app/control/Globals.TRANSLATE_TEMPLATE} */


var translateCssValue = require("app/control/Globals").TRANSLATE_TEMPLATE;
/** @const */


var transformProp = prefixedProperty("transform");
/**
/* @constructor
/* @type {module:app/view/component/FilterableListView}
/*/

var FilterableListView = View.extend({
  /** @type {string} */
  cidPrefix: "filterableList",

  /** @override */
  tagName: "ul",

  /** @override */
  className: "list selectable filterable",

  /** @override */
  defaults: {
    collapsed: true,
    filterFn: function filterFn() {
      return true;
    },
    renderer: ClickableRenderer.extend({
      /** @override */
      cidPrefix: "listItem",

      /** @override */
      className: "list-item list-node"
    })
  },

  /** @override */
  properties: {
    collapsed: {
      get: function get() {
        return this._collapsed;
      },
      set: function set(value) {
        this._setCollapsed(value);
      }
    },
    selectedItem: {
      get: function get() {
        return this._selectedItem;
      },
      set: function set(value) {
        this._setSelection(value);
      }
    },
    filteredItems: {
      get: function get() {
        return this._filteredItems;
      }
    },
    metrics: {
      get: function get() {
        return this._metrics;
      }
    }
  },

  /** @override */
  events: {
    "transitionend .list-node": function transitionendListNode(ev) {
      // if (!ev.target.classList.contains("list-node")) {}
      if (ev.propertyName == transformProp && ev.target.parentElement === this.el) {
        this._changedPosNum--; // console.log("%s:[%s (%s)] [%s]", this.cid, ev.type, ev.target.className, ev.propertyName, this._changedPosNum, ev);
      }

      if (!this._collapsedChanging) {
        return;
      }

      if (this._changedPosNum == 0) {
        // if ((ev.propertyName == transformProp) ||
        // 	(ev.propertyName == "visibility")) {
        console.log("%s:[%s .list-item] [%s] collapsed-changing end (resolving %s promises)", this.cid, ev.type, ev.propertyName, this._collapsePromises.length);
        this._collapsedChanging = false;
        this.el.classList.remove("collapsed-changing");
        resolveAll(this._collapsePromises, this);
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    this._filteredItems = [];
    this._filteredIncoming = [];
    this._filteredOutgoing = [];
    this._metrics = {};
    this._itemMetrics = [];
    this._collapsePromises = [];
    this.itemViews = new Container();

    _.defaults(options, this.defaults);

    this.renderer = options.renderer;
    this._filterFn = options.filterFn; // this.computeFilter();
    // this.collection.each(this.createItemView, this);

    this.collection.each(this.createItemView, this);

    this._setSelection(this.collection.selected);

    this._setCollapsed(options.collapsed);

    this.refreshFilter(); // this.skipTransitions = true;
    // this.renderNow();
    // this.listenTo(this.collection, "select:one select:none", this._setSelection);

    this.listenTo(this.collection, "reset", function () {
      this._allItems = null;
      throw new Error("not implemented");
    }); // will trigger on return if this.el is already attached
    // this.skipTransitions = true;
    // this.el.classList.add("skip-transitions");
    // this.requestRender(View.ALL_INVALID);

    console.log("%s::initialize attached: %o", this.cid, this.attached);
    this.once("view:attached", function (view) {
      console.log("%s::initialize -> [view:attached] attached: %o", view.cid, view.attached); // view.requestRender(View.ALL_INVALID).renderNow();

      view.skipTransitions = true;
      view.el.classList.add("skip-transitions");
      view.setImmediate(function () {
        // this.skipTransitions = true;
        view.renderNow();
      });
    });
  },

  /**
   * Get an array with a collection contens
   * @private
   */
  _getAllItems: function _getAllItems() {
    return this._allItems || (this._allItems = this.collection.slice());
  },

  /* --------------------------- *
  /* Transition promises
  /* --------------------------- */
  _whenCollapseChangeEnds: function _whenCollapseChangeEnds() {
    if (this._collapsedChanged) {
      var view = this;
      return new Promise(function (resolve, reject) {
        view.on("view:render:after", resolve);
      });
    } else {
      return Promise.resolve(this);
    }
  },
  whenCollapseChangeEnds: function whenCollapseChangeEnds() {
    var d, p, pp;

    if (this._collapsedChanging || this._collapsedChanged) {
      d = {};
      p = new Promise(function (resolve, reject) {
        d.resolve = resolve;
        d.reject = reject;
      });
      pp = this._collapsePromises;
      pp.push(d);
    } else {
      p = Promise.resolve(this);
    }

    return p;
  },

  /* --------------------------- *
  /* Render
  /* --------------------------- */

  /** @override */
  renderFrame: function renderFrame(tstamp, flags) {
    // if (DEBUG) {
    // 	var changed = [];
    // 	this._collapsedChanged && changed.push("collapsed");
    // 	this._selectionChanged && changed.push("selection");
    // 	this._filterChanged && changed.push("filter");
    // 	console.log("%s::renderFrame [%s]", this.cid, changed.join(" "));
    // }
    // collapsed transition flag
    if (this._collapsedChanging) {
      console.warn("%s::renderFrame collapsed tx interrupted", this.cid);
      this._collapsedChanging = false;
      this.el.classList.remove("collapsed-changing");
      rejectAll(this._collapsePromises, this);
    }

    if (this.skipTransitions) {
      this.el.classList.add("skip-transitions"); // this.requestAnimationFrame(function() {

      this.setImmediate(function () {
        this.skipTransitions = false;
        this.el.classList.remove("skip-transitions");
      });
    }

    if (this._collapsedChanged) {
      this._collapsedChanged = false;
      flags |= View.SIZE_INVALID;
      this.el.classList.toggle("collapsed", this._collapsed);

      if (this.skipTransitions) {
        this._collapsedChanging = false; // resolveAll(this._collapsePromises, this.el);

        this.once("view:render:after", function (view) {
          this._changedPosNum = 0;
          resolveAll(view._collapsePromises, view);
        });
      } else {
        this._collapsedChanging = true;
        this.el.classList.add("collapsed-changing"); // this will be resolved on transitionend
      }

      console.log("%s:[collapse changed] %s promises", this.cid, this._collapsePromises.length, this._collapsedChanging ? "resolving now" : "resolving on transitionend");
    }

    if (this._selectionChanged) {
      this._selectionChanged = false;
      flags |= View.LAYOUT_INVALID;
      this.renderSelection(this.collection.selected, this.collection.lastSelected);
    }

    if (this._filterChanged) {
      this._filterChanged = false;
      flags |= View.LAYOUT_INVALID;
      var lastFilteredItems = this.filteredItems; // this._printStats(lastFilteredItems);

      this.computeFilter();
      this.applyFilter();

      if (DEBUG) {
        this._printStats(lastFilteredItems);
      }
    }

    if (flags & View.SIZE_INVALID) {
      this.measure(); // NOTE: measures children
    }

    if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
      this.renderLayout();
    }
  },
  measure: function measure() {
    // var i, ii, el, els, m, mm;
    // els = this.el.children;
    // ii = els.length;
    // mm = this._itemMetrics;
    // for (i = 0; i < ii; i++) {
    // 	mm[i] = _.pick(els[i], "offsetTop", "offsetHeight");
    // }
    this._metrics = getBoxEdgeStyles(this.el, this._metrics); // var itemEl, itemView, baseline = 0;
    // if (itemEl = this.el.querySelector(".list-item:not(.excluded) .label")) {
    // 	// itemView = this.itemViews.findByCid(itemEl.cid);
    // 	var elA = itemEl, elB = itemEl.parentElement;
    // 	var yA = elA.offsetTop,
    // 		hA = elA.offsetHeight,
    // 		yB = elB.offsetTop,
    // 		hB = elB.offsetHeight;
    // 	baseline = ((yA + hA) - (yB + hB));
    // 	console.log("%s::measure fontSize: %spx (%s+%s)-(%s+%s)=%s", this.cid, this._metrics.fontSize,
    // 		yA, hA, yB, hB, baseline
    // 	);
    // }

    this.itemViews.forEach(function (view) {
      if (!view._metrics) view._metrics = {}; // view._metrics.baseline = this._metrics.fontSize - baseline;

      view._metrics.offsetTop = view.el.offsetTop;
      view._metrics.offsetHeight = view.el.offsetHeight;
      view._metrics.offsetLeft = view.el.offsetLeft;
      view._metrics.offsetWidth = view.el.offsetWidth;

      if (!this._collapsed && view.label) {
        view._metrics.textLeft = view.label.offsetLeft;
        view._metrics.textWidth = view.label.offsetWidth;
      } else {
        view._metrics.textLeft = view._metrics.offsetLeft;
        view._metrics.textWidth = view._metrics.offsetWidth;
      }
    }, this); // this._metrics.baseline = this._metrics.fontSize - baseline;
  },
  renderLayout: function renderLayout() {
    var posX, posY, lastX, lastY;
    posX = this._metrics.paddingLeft;
    posY = this._metrics.paddingTop;
    this._changedPosNum = 0; // use HTMLElement.children to keep layout order

    for (var i = 0, ii = this.el.children.length; i < ii; i++) {
      var view = this.itemViews.findByCid(this.el.children[i].cid);
      lastX = view.transform.tx;
      lastY = view.transform.ty;

      if ((this.collection.selected && !view.model.selected || view.el.classList.contains("excluded")) && this._collapsed) {
        view.transform.tx = posX;
        view.transform.ty = posY;
      } else {
        if (view._metrics.offsetHeight == 0) {
          posY -= view._metrics.offsetTop;
        }

        view.transform.tx = posX;
        view.transform.ty = posY;
        posY += view._metrics.offsetHeight + view._metrics.offsetTop;
      }

      view.el.style[transformProp] = translateCssValue(view.transform.tx, view.transform.ty);

      if (view.transform.tx != lastX || view.transform.ty != lastY) {
        this._changedPosNum++;
      }
    } // posY += this._metrics.paddingBottom;


    this._metrics.height = Math.max(0, posY + this._metrics.paddingBottom);
    this.el.style.height = this._metrics.height + "px"; // this.el.style.height = (posY > 0) ? posY + "px" : "";
  },

  /* --------------------------- *
  /* Child views
  /* --------------------------- */

  /** @private */
  createItemView: function createItemView(item, index) {
    var view = new this.renderer({
      model: item,
      el: this.el.querySelector(".list-item[data-id=\"" + item.id + "\"]")
    }); // item.set("excluded", false, { silent: true });
    // view.listenTo(item, "change:excluded", function(item, newVal) {
    // 	// console.log(arguments);
    // 	if (this.el.classList.contains("excluded") !== newVal) {
    // 		console.warn("%s:[change:excluded] m:%o css: %o", this.cid, newVal, this.el.classList.contains("excluded"));
    // 	}
    // 	// this.el.classList.toggle("excluded", excluded);
    // });

    this.listenTo(view, "renderer:click", this._onRendererClick);
    this.itemViews.add(view);
    return view;
  },

  /** @private */
  _onRendererClick: function _onRendererClick(item, ev) {
    if (this._collapsedChanging || this._collapsed && item.get("excluded")) {
      return;
    }

    if (this.collection.selected !== item) {
      this.trigger("view:select:one", item);
    } else {
      if (ev.altKey) {
        this.trigger("view:select:none");
      } else {
        this.trigger("view:select:same", item);
      } // this.trigger("view:select:none");

    }
  },

  /* --------------------------- *
  /* Collapsed
  /* --------------------------- */

  /** @private */
  _collapsed: undefined,

  /**
   * @param {Boolean}
   */
  _setCollapsed: function _setCollapsed(collapsed) {
    if (collapsed !== this._collapsed) {
      this._collapsed = collapsed;
      this._collapsedChanged = true;
      this.requestRender();
    }
  },

  /* --------------------------- *
  /* Selection
  /* --------------------------- */

  /** @private */
  _selectedItem: undefined,

  /** @param {Backbone.Model|null} */
  _setSelection: function _setSelection(item) {
    if (item !== this._selectedItem) {
      this._selectedItem = item;
      this._selectionChanged = true;
      this.requestRender(View.MODEL_INVALID);
    }
  },

  /** @private */
  renderSelection: function renderSelection(newItem, oldItem) {
    var view;

    if (oldItem) {
      view = this.itemViews.findByModel(oldItem);
      view.el.classList.remove("selected"); // view.label.classList.remove("color-fg");
      // view.label.classList.remove("color-reverse");
    }

    if (newItem) {
      view = this.itemViews.findByModel(newItem);
      view.el.classList.add("selected"); // view.label.classList.add("color-fg");
      // view.label.classList.add("color-reverse");
    }

    this.el.classList.toggle("has-selected", this.selectedItem !== null);
  },

  /* --------------------------- *
  /* Filter
  /* --------------------------- */
  refreshFilter: function refreshFilter() {
    if (this._filterFn) {
      this._filterChanged = true;
      this.requestRender(View.MODEL_INVALID);
    }
  },

  /* --------------------------- *
  /* Filter impl 2
  /* --------------------------- */
  computeFilter: function computeFilter() {
    var newItems, oldItems;
    var hasNew, hasOld;
    this._filteredIncoming.length = 0;
    this._filteredOutgoing.length = 0;
    newItems = this._filterFn ? this.collection.filter(this._filterFn, this) : this._getAllItems();
    oldItems = this._filteredItems;
    hasNew = !!(newItems && newItems.length);
    hasOld = !!(oldItems && oldItems.length); // NOTE: diff third arg is destination array

    if (hasNew) {
      // incoming exclusions
      diff(hasOld ? oldItems : this._getAllItems(), newItems, this._filteredIncoming); // this._filteredIncoming.forEach(function(item) {
      // 	item.set("excluded", true);
      // });
    }

    if (hasOld) {
      // outgoing exclusions
      diff(hasNew ? newItems : this._getAllItems(), oldItems, this._filteredOutgoing); // this._filteredOutgoing.forEach(function(item) {
      // 	item.set("excluded", false);
      // });
    } // console.log("%s::renderFilterFn", this.cid, newItems);


    this._filteredItems = newItems;
  },
  applyFilter: function applyFilter() {
    // this.itemViews.forEach(function(view) {
    // 	view.el.classList.toggle("excluded", view.model.get("excluded"));
    // });
    this._filteredIncoming.forEach(function (item) {
      this.itemViews.findByModel(item).el.classList.add("excluded");
      item.set("excluded", true);
    }, this);

    this._filteredOutgoing.forEach(function (item) {
      this.itemViews.findByModel(item).el.classList.remove("excluded");
      item.set("excluded", false);
    }, this);

    this.el.classList.toggle("has-excluded", this.filteredItems.length > 0);
  }
  /* --------------------------- *
  /* Filter impl 1
  /* --------------------------- */

  /*
  computeFilter_1: function() {
  	var items = this._filterFn ? this.collection.filter(this._filterFn, this) : this._getAllItems();
  	this.renderFilters(items, this._filteredItems);
  	this._filteredItems = items;
  },
  	renderFilters: function(newItems, oldItems) {
  	var hasNew = !!(newItems && newItems.length);
  	var hasOld = !!(oldItems && oldItems.length);
  	var inExcl = [];
  	var outExcl = [];
  		// console.log("%s::renderFilterFn", this.cid, newItems);
  	// NOTE: diff third arg is destination array
  	if (hasNew) {
  		diff((hasOld ? oldItems : this._getAllItems()), newItems, inExcl)
  		// .forEach(function(item) {
  		// 	this.itemViews.findByModel(item).el.classList.add("excluded");
  		// 	item.set("excluded", true);
  		// }, this);
  	}
  	if (hasOld) {
  		diff((hasNew ? newItems : this._getAllItems()), oldItems, outExcl)
  		// .forEach(function(item) {
  		// 	this.itemViews.findByModel(item).el.classList.remove("excluded");
  		// 	item.set("excluded", false);
  		// }, this);
  	}
  	this._filteredIncoming = inExcl;
  	this._filteredOutgoing = outExcl;
  	// this.el.classList.toggle("has-excluded", hasNew);
  	// this.applyFilter();
  },
  */
  // computeFiltered: function() {
  // 	this._filterResult = this.collection.map(this._filterFn, this);
  // },
  //
  // renderFiltered: function() {
  // 	this.collection.forEach(function(item, index) {
  // 		this.itemViews.findByModel(item).el.classList.toggle("excluded", !this._filterResult[index]);
  // 	}, this);
  // },

});

if (DEBUG) {
  FilterableListView.prototype._logFlags = ["view.render"].join(" ");

  FilterableListView.prototype._printStats = function (lastFilteredItems) {
    if (this._logFlags["view.trace"]) console.log("%s::renderFrame %s filtered:%o(=%o)/%o (changed:%o, in:%o, out:%o)", this.cid, this.filteredItems.length > 0 ? "has" : "has not", this.filteredItems.length, lastFilteredItems ? this.filteredItems.length + this._filteredIncoming.length - this._filteredOutgoing.length : this.filteredItems.length, this.collection.length, this._filteredIncoming.length + this._filteredOutgoing.length, this._filteredIncoming.length, this._filteredOutgoing.length);
  };
}

module.exports = FilterableListView;

}).call(this,true,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","app/view/render/ClickableRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ClickableRenderer.js","backbone.babysitter":"backbone.babysitter","underscore":"underscore","utils/array/difference":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/array/difference.js","utils/css/getBoxEdgeStyles":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/css/getBoxEdgeStyles.js","utils/prefixedProperty":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedProperty.js","utils/promise/rejectAll":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/promise/rejectAll.js","utils/promise/resolveAll":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/promise/resolveAll.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/GraphView.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/component/GraphView
 */

/** @type {Function} */
var Color = require("color");
/** @type {module:app/view/base/CanvasView} */


var CanvasView = require("app/view/base/CanvasView");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:utils/canvas/calcArcHConnector} */


var calcArcHConnector = require("utils/canvas/calcArcHConnector");
/** @type {module:utils/canvas/CanvasHelper} */


var CanvasHelper = require("utils/canvas/CanvasHelper");
/** @type {module:utils/geom/inflateRect} */


var inflateRect = require("utils/geom/inflateRect"); // /** @type {module:utils/dom/getAbsoluteClientRect} */
// var getAbsoluteClientRect = require("utils/dom/getAbsoluteClientRect");
// var BEZIER_CIRCLE = 0.551915024494;
// var MIN_CANVAS_RATIO = 2;
// var PI2 = Math.PI * 2;


var styleBase = {
  lineCap: "butt",
  // round, butt, square
  lineWidth: 0.75,
  lineDashOffset: 0,
  setLineDash: [[]] // radiusBase: 2,
  // /* factored to rem unit */ //6,
  // radiusIncrement: 0.21, //3, //0.25,
  // /* uses lineWidth multiplier */
  // outlineWidth: 3,
  // /* uses lineWidth multiplier */
  // arrowSize: 0.3,

};
var paramsBase = {
  radiusBase: 1.25,

  /* factored to rem unit */
  //6,
  radiusIncrement: 0.21,
  //3, //0.25,

  /* uses lineWidth multiplier */
  outlineWidth: 3,

  /* factored to rem unit */
  arrowSize: 0.4 //0.3,

}; // var overlayStyleBase = {
// 	globalAlpha: 0.75,
// 	globalCompositeOperation: "destination-out",
// 	lineWidth: 4,
// 	lineJoin: "round",
// 	textBaseline: "top",
// 	textAlign: "left",
// };

if (DEBUG) {
  /* eslint-disable no-unused-vars */
  var _dStyles = {
    defaults: {
      globalAlpha: 0.66,
      lineWidth: 0,
      fillStyle: "transparent",
      strokeStyle: "transparent",
      lineDashOffset: 0,
      setLineDash: [[]]
    }
  };
  /* Stroke */

  ["red", "salmon", "sienna", "green", "yellowgreen", "olive", "blue", "lightskyblue", "midnightblue", "grey", "silver"].forEach(function (colorName) {
    var rgbaValue = Color(colorName).alpha(0.75).string();
    _dStyles[colorName] = _.defaults({
      lineWidth: 0.75,
      strokeStyle: rgbaValue
    }, _dStyles["defaults"]);
    _dStyles[colorName + "_dashed"] = _.defaults({
      setLineDash: [[4, 2]],
      strokeStyle: rgbaValue
    }, _dStyles["defaults"]);
    _dStyles[colorName + "_thick"] = _.defaults({
      lineWidth: 5,
      strokeStyle: rgbaValue
    }, _dStyles["defaults"]);
    _dStyles[colorName + "_fill"] = _.defaults({
      fillStyle: rgbaValue
    }, _dStyles["defaults"]);
  });
  /* eslint-enable no-unused-vars */
}

var getRectDirX = function getRectDirX(r1, r2) {
  if (r1.right < r2.left) {
    return 1;
  }

  if (r2.right < r1.left) {
    return -1;
  }

  return 0;
};
/**
 * @constructor
 * @type {module:app/view/component/GraphView}
 */


var GraphView = CanvasView.extend({
  /** @type {string} */
  cidPrefix: "graph",

  /** @override */
  tagName: "canvas",

  /** @override */
  className: "graph",
  defaultKey: "a2b",
  defaults: {
    values: {
      a2b: 0,
      b2a: 0
    },
    maxValues: {
      a2b: 1,
      b2a: 1
    } // useOpaque: true,
    // labelFn: function(value, max) {
    // 	return ((value / max) * 100) | 0;
    // },

  },

  /** @override */
  initialize: function initialize(options) {
    CanvasView.prototype.initialize.apply(this, arguments);
    this._listA = options.listA;
    this._listB = options.listB;
    this._a2b = {
      srcView: options.listA,
      destView: options.listB,
      s: _.defaults({
        lineWidth: 0.7 //1.25
        // radiusIncrement: 0.25,

      }, styleBase, paramsBase),
      p: _.defaults({}, paramsBase),
      strokeStyleFn: function strokeStyleFn(fg, bg, ln) {
        return Color(ln).mix(bg, 0.1).hex();
      }
    };
    this._b2a = {
      srcView: options.listB,
      destView: options.listA,
      s: _.defaults({
        lineWidth: 0.7 // arrowSize: 0.25,
        // radiusIncrement: 0,
        // outlineWidth: 0,

      }, styleBase, paramsBase),
      p: _.defaults({}, paramsBase),
      strokeStyleFn: function strokeStyleFn(fg, bg, ln) {
        return Color(fg).mix(bg, 0.4).hex();
      }
    }; // this.listenTo(this._a2b.srcView.collection, "view:select:one view:select:none", function(item) {
    // 	this._a2b.connectorsOut = this._a2b.connectors;
    // 	this._a2b.connectors = null;
    // });
    //
    // this.listenTo(this._b2a.srcView.collection, "view:select:one view:select:none", function(item) {
    // 	this._b2a.connectorsOut = this._b2a.connectors;
    // 	this._b2a.connectors = null;
    // });
    // this.listenTo(this, "view:render:before", this._beforeViewRender);
    // this._traceScroll = _.debounce(this.__raceScroll, 100, false);
    // var viewportChanged = function(ev) {
    // 	console.log("%s:[%s]", this.cid, ev.type);
    //
    // 	// this._traceScroll(ev.type);
    // 	// this._labelOverlays = null;
    // 	this.invalidate(CanvasView.LAYOUT_INVALID | CanvasView.SIZE_INVALID);
    // 	// this.requestRender(CanvasView.LAYOUT_INVALID | CanvasView.SIZE_INVALID);
    // 	// this.requestRender().renderNow();
    // }.bind(this);
    // viewportChanged = _.debounce(viewportChanged, 60, false);
    // window.addEventListener("scroll",
    // 		_.debounce(viewportChanged, 100, false), false);
    // window.addEventListener("wheel",
    // 	_.debounce(viewportChanged, 100, false), false);
    // window.addEventListener("scroll", viewportChanged, false);
    // window.addEventListener("wheel", viewportChanged, false);
    // window.addEventListener("resize", viewportChanged, false);
    // window.addEventListener("orientationchange", viewportChanged, false);
    // this._addListListeners(this._a2b);
    // this._addListListeners(this._b2a);
  },

  /** @override */
  measureCanvas: function measureCanvas(w, h, s) {
    console.log("%s::measureCanvas style:%o scroll:%o offset:%o client:%o arg:%o", this.cid, s.height, this.el.offsetHeight, this.el.scrollHeight, this.el.clientHeight, h);
  },

  /** @override */
  updateCanvas: function updateCanvas() {
    this._updateMetrics();

    this._updateStyles();
  },

  /* --------------------------- *
  /* styles
  /* --------------------------- */
  _updateStyles: function _updateStyles() {
    var b, bgColor, lnColor;

    if (this.model.has("bundle")) {
      b = this.model.get("bundle");
      lnColor = Color(b.colors.lnColor); //.clone();

      bgColor = Color(b.colors.bgColor); //.clone();
    } else {
      bgColor = Color(Globals.DEFAULT_COLORS["background-color"]);
      lnColor = Color(Globals.DEFAULT_COLORS["link-color"]);
    }

    this._a2b.s.strokeStyle = this._a2b.s.fillStyle = this._a2b.strokeStyleFn(this._color, bgColor, lnColor);
    this._b2a.s.strokeStyle = this._b2a.s.fillStyle = this._b2a.strokeStyleFn(this._color, bgColor, lnColor);

    if (DEBUG) {
      this._debugBlocks = this.el.matches(".debug-blocks ." + this.className);
      this._debugGraph = this.el.matches(".debug-graph ." + this.className);
    }
  },
  _setStyle: function _setStyle(s) {
    if (typeof s == "string") {
      s = this._styleData[s];
    }

    CanvasView.setStyle(this._ctx, s);
  },

  /* --------------------------- *
  /* metrics
  /* --------------------------- */
  _updateMetrics: function _updateMetrics() {
    var bounds;
    this._rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    bounds = this.el.getBoundingClientRect(); // bounds = getAbsoluteClientRect(this.el);

    this._ctx.setTransform(this._canvasRatio, 0, 0, this._canvasRatio, -(bounds.left + window.pageXOffset) * this._canvasRatio - 0.5, -(bounds.top + window.pageYOffset) * this._canvasRatio - 0.5);

    var i, ii, els;
    var srcRect, destRect;
    var srcMin, destMin;
    srcRect = this._a2b.srcView.el.getBoundingClientRect();
    destRect = this._a2b.destView.el.getBoundingClientRect();
    this._a2b.qx = getRectDirX(srcRect, destRect);
    els = this._listA.el.querySelectorAll(".label");
    srcMin = srcRect.left + window.pageXOffset;

    for (i = 0, ii = els.length; i < ii; i++) {
      srcMin = Math.max(srcMin, els[i].getBoundingClientRect().right + window.pageXOffset);
    }

    this._a2b.xMin = srcMin;
    els = this._listB.el.querySelectorAll(".label");
    destMin = destRect.left + window.pageXOffset;

    for (i = 0, ii = els.length; i < ii; i++) {
      destMin = Math.min(destMin, els[i].getBoundingClientRect().left + window.pageXOffset);
    }

    this._a2b.destMinX = destMin;
    this._b2a.qx = -this._a2b.qx;
    this._b2a.xMin = this._a2b.destMinX;
    this._b2a.destMinX = this._a2b.xMin; // var s = getComputedStyle(document.documentElement);
    // this._rootFontSize = parseFloat(s.fontSize); // * this._canvasRatio;
    // console.log("%s::_updateMetrics _rootFontSize: %s %o", this.cid, this._rootFontSize, s);
    // var c = Math.abs(sData.xMin - dData.xMin) / 6;
    // sMin = sData.xMin + c * qx;
    // dMin = dData.xMin - c * qx;
    // this._a2b.targets = this._measureListItems(listView);
    // this._b2a.targets = this._measureListItems(listView);
    // // connector minimum branch x2
    // listView = this._listB;
    // for (i = 0, ii = listView.groups.length; i < ii; i++) {
    // 	itemView = listView.itemViews.findByModel(listView.groups[i]);
    // 	itemRect = (itemView.label || itemView.el).getBoundingClientRect();
    // 	this._b2a.xMin = Math.min(this._b2a.xMin, itemRect.left);
    // 	// if (itemView._metrics) this._b2a.rect.left + itemView.transform.tx + itemView._metrics.textLeft;
    // }
  },

  /* --------------------------- *
  /* redraw
  /* --------------------------- */
  redraw: function redraw(ctx, interp, flags) {
    this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeight);

    ctx.save();

    this._redraw_fromElements(ctx, interp, flags); // this._redraw_fromViews(ctx, interp);


    ctx.restore();
  },
  _redraw_fromElements: function _redraw_fromElements(ctx, interp, flags) {
    // b2a: keyword to bundles, right to left
    // a2b: bundle to keywords, left to right
    if (flags & (CanvasView.SIZE_INVALID | CanvasView.MODEL_INVALID)) {
      console.log("%s::redraw [valuesChanged: %s] [flags: %s]", this.cid, interp.valuesChanged, CanvasView.flagsToString(flags));
      this._a2b.connectorsOut = this._a2b.connectors;
      this._b2a.connectorsOut = this._b2a.connectors;
      this._b2a.connectors = this._computeConnectors(this._b2a);
      this._a2b.connectors = this._computeConnectors(this._a2b);
      this._labelOverlays = this._computeLabelOverlays(this._listB);
    }
    /* line dash value interpolation */


    var b2aVal, a2bVal;
    b2aVal = interp.getRenderedValue("b2a") / interp.getOption("b2a", "max"); //_valueData["b2a"]._maxVal;
    // b2aVal = interp._valueData["b2a"]._renderedValue / interp._valueData["b2a"]._maxVal;

    a2bVal = interp.getRenderedValue("a2b") / interp.getOption("a2b", "max"); //interp._valueData["a2b"]._maxVal;
    // a2bVal = interp._valueData["a2b"]._renderedValue / interp._valueData["a2b"]._maxVal;

    /* draw */

    this._drawConnectors(this._b2a.connectors, this._b2a.s, b2aVal, 1);

    this._drawConnectors(this._b2a.connectorsOut, this._b2a.s, 1 - b2aVal, 1);

    this._drawConnectors(this._a2b.connectors, this._a2b.s, a2bVal, 2); // this._drawConnectors(this._a2b.connectorsOut, this._a2b.s, 1 - a2bVal, 2);


    this._drawLabelOverlays(this._labelOverlays);
  },

  /* --------------------------- *
   * label overlays
   * --------------------------- */
  _computeLabelOverlays: function _computeLabelOverlays(list) {
    var data = {
      rects: []
    };
    var els = list.el.querySelectorAll(".list-group .label span");
    var i, ii, r;

    for (i = 0, ii = els.length; i < ii; i++) {
      // r = inflateRect(els[i].getBoundingClientRect(), 0, 0);
      r = _.clone(els[i].getBoundingClientRect());
      r.top += window.pageYOffset; // - 0.5;

      r.left += window.pageXOffset; // - 0.5;
      // r.innerText = els[i].innerText;

      data.rects[i] = r;
    } // data.cssStyle = getComputedStyle(els[0]);
    // data.boxStyle = getBoxEdgeStyles(overlayData.cssStyle);
    // data.ctxStyle = {
    // 	font: [s.fontWeight, s.fontStyle, s.fontSize + "/" + s.lineHeight, s.fontFamily].join(" ")
    // };


    return data;
  },
  _drawLabelOverlays: function _drawLabelOverlays(data) {
    this._ctx.save(); // CanvasView.setStyle(this._ctx, s);


    this._ctx.globalAlpha = 0.85;
    this._ctx.globalCompositeOperation = "destination-out"; // this._ctx.canvas.style.letterSpacing = overlayData.cssStyle.letterSpacing;

    data.rects.forEach(function (r) {
      // this._ctx.clearRect(r.left, r.top, r.width, r.height);
      this._ctx.fillRect(r.left, r.top, r.width, r.height); // this._ctx.strokeText(r.innerText, r.left, r.top);

    }, this);

    this._ctx.restore();

    if (DEBUG) {
      if (this._debugGraph || this._debugBlocks) {
        data.rects.forEach(function (r) {
          r = inflateRect(r, 0, 0);
          CanvasHelper.drawRect(this._ctx, _dStyles["silver_dashed"], r.left, r.top, r.width, r.height);
        }, this);
      }
    }
  },

  /* --------------------------- *
   * connectors
   * --------------------------- */
  _computeConnectors: function _computeConnectors(d) {
    var sMin = d.xMin;
    var dMin = d.destMinX;
    var qx = d.qx;
    var rBase, rInc;
    rBase = this._roundTo(d.s.radiusBase * this._rootFontSize, 0.5);
    rInc = this._roundTo(d.s.radiusIncrement * this._rootFontSize, 0.5); // var root = {};

    var i,
        p,
        ddNum,
        connectors = [];
    var x1, y1, tx;
    var sView, ddView, ddItems;

    if (d.srcView.collection.selected && d.destView.filteredItems) {
      sView = d.srcView.itemViews.findByModel(d.srcView.collection.selected);
      var rect = sView.label.getBoundingClientRect();
      x1 = rect.left;
      y1 = rect.top + rect.height / 2;
      if (qx > 0) x1 += rect.width;
      x1 += window.pageXOffset;
      y1 += window.pageYOffset; // if (!sView._metrics) return;
      // x1 = d.rect.left + sView.transform.tx
      // 	+ sView._metrics.textLeft;
      // y1 = d.rect.top + sView.transform.ty
      // 	+ sView._metrics.offsetHeight / 2;
      // if (qx > 0) x1 += sView._metrics.textWidth;

      ddItems = d.destView.filteredItems;
      ddNum = d.destView.filteredItems.length;

      for (i = 0; i < ddNum; i++) {
        p = {};
        ddView = d.destView.itemViews.findByModel(ddItems[i]);
        rect = ddView.label.getBoundingClientRect();
        p.x2 = rect.left;
        p.y2 = rect.top + rect.height / 2;
        if (qx < 0) p.x2 += rect.width;
        p.x2 += window.pageXOffset;
        p.y2 += window.pageYOffset; // p.x2 = d.destRect.left + ddView.transform.tx
        // 	+ ddView._metrics.textLeft;
        // p.y2 = d.destRect.top + ddView.transform.ty
        // 	+ ddView._metrics.offsetHeight / 2;
        // if (qx < 0) p.x2 += ddView._metrics.textWidth;

        p.x1 = x1;
        p.y1 = y1;
        p.qx = qx;
        connectors[i] = p;
      }

      connectors.sort(function (a, b) {
        return a.y2 - b.y2;
      }); // ssEl's number of items above in the Y axis

      var si = 0; // Node first arc (r0) max radius (cx0)
      // They are centered to the label, so halve it

      var rMax0 = ddNum * rInc * 0.5; // cy1 offset from y1

      var a; // First pass, calc first radius (r0, at the source of the connector),
      // and the amount of dest connectors vertically closer to the source (di)

      for (i = 0; i < ddNum; i++) {
        p = connectors[i];
        a = (i - (ddNum - 1) / 2) * rInc;
        p.cy1 = p.y1 + a;
        p.cy2 = p.y2;
        p.r0 = Math.abs(a);
        p.cx0 = p.x1 + (rMax0 - p.r0) * qx; // If src (cy1) is above dest (y2), decrease index diff (di)

        p.di = p.cy1 - p.y2 > 0 ? i : ddNum - (i + 1);
        si = Math.max(si, p.di); // p.dx = x1 - p.x2;
        // p.dy = y1 - p.y2;
      } // Calc max radius that fits sMin to dMin:
      // from space btw sMin to dMin, remove first arc and max arc increase,
      // then halve (there's two arcs left)


      var rBaseMax = (Math.abs(dMin - sMin) - (rMax0 + si * rInc)) / 2; // Ensure 0 > rBase > rBaseMax

      rBase = Math.max(0, Math.min(rBase, rBaseMax)); // console.log("%s::_computeConnectors 1rem = %spx rBase:%s rBaseMax:%s", this.cid, this._rootFontSize, rBase, rBaseMax);

      for (i = 0; i < ddNum; i++) {
        p = connectors[i];
        p.r1 = p.di * rInc + rBase;
        p.r2 = rBase; // p.r1 = p.di * rInc + rBase;
        // p.r2 = (si - p.di) * rInc + rBase;

        p.cx1 = sMin + rMax0 * qx;
        p.cx2 = dMin - (si - p.di) * rInc * qx; //
        // p.cx1 = sMin + (rMax0 * qx);
        // p.cx2 = dMin;

        tx = calcArcHConnector(p.cx1, p.cy1, p.r1, p.cx2, p.cy2, p.r2, 0.7);

        if (tx) {
          p.tx1 = tx[0];
          p.tx2 = tx[1];
        } else {
          p.tx1 = p.cx1;
          p.tx2 = p.cx2;
        }

        p.length = Math.abs(p.x1 - p.x2) + Math.abs(p.cy1 - p.cy2); // Find out longest node connection for setLineDash
        // root.maxLength = Math.max(root.maxLength, p.length);
      }

      connectors.sort(function (a, b) {
        return a.di - b.di;
      } // Sort by index distance to from source point
      // a.r0 - b.r0 // Sort by first arc (centered)
      // (a.r1 + a.r2) - (b.r1 + b.r2)
      // a.tx2 - b.tx2
      );
      connectors.si = si;
      connectors.qx = qx;
      connectors.sMin = sMin;
      connectors.dMin = dMin; // root.x = x1;
      // root.y = y1;
      // root.qx = qx;
      // root.r0 = si * rInc;
    } // d.connectors = connectors;
    // d.root = root;
    // return d;


    return connectors;
  },
  _drawConnectors: function _drawConnectors(pp, s, lVal, dir) {
    var i, ii, p;
    var ow, ra1, ra2, ta;
    if (!(pp && pp.length && lVal)) return;
    ii = pp.length;
    /* outline width */

    ow = s.lineWidth + s.outlineWidth; // ow = Math.min(
    // 	this._roundTo(s.radiusIncrement * this._rootFontSize, 0.5),
    // 	this._roundTo(s.lineWidth * (1 + s.outlineWidth), 0.5)
    // );

    /* arrow radiuses, direction */
    // ra1 = (s.radiusIncrement * this._rootFontSize) + s.lineWidth;

    ra1 = s.arrowSize * this._rootFontSize;
    ra2 = ra1 + (ow - s.lineWidth);
    ta = Math.PI * dir; // dir -= 2;

    this._setStyle(s); // if (lVal < 1) {
    // 	this._ctx.lineDashOffset = lMax * (1 + lVal);
    // 	this._ctx.setLineDash([lMax, lMax])
    // 	// this._ctx.lineDashOffset = lMax * (1 + lVal);;
    // 	// this._ctx.setLineDash([lMax * (1 - lVal), lMax]);
    // }
    // for (i = 0; i < ii; i++) {
    // p = pp[i];


    if (s.outlineWidth) {
      this._ctx.save();

      this._ctx.globalCompositeOperation = "destination-out";
      this._ctx.lineWidth = ow;

      for (i = 0; i < ii; i++) {
        p = pp[i];

        if (lVal < 1) {
          this._ctx.lineDashOffset = p.length * (1 + lVal);

          this._ctx.setLineDash([p.length, p.length]);
        }

        this._drawConnector(p, i, pp);

        if (lVal == 1) {
          this._drawArrowhead(p.x2, p.y2, ra2, dir * ta);
        }
      }

      this._ctx.restore();
    }

    for (i = 0; i < ii; i++) {
      p = pp[i];

      if (lVal < 1) {
        this._ctx.lineDashOffset = p.length * (1 + lVal);

        this._ctx.setLineDash([p.length, p.length]);
      }

      this._drawConnector(p, i, pp);

      if (lVal == 1) {
        this._drawArrowhead(p.x2, p.y2, ra1, dir * ta);
      }
    }
  },
  _drawArrowhead: function _drawArrowhead(x, y, r, t) {
    // this._ctx.save();
    // this._ctx.lineDashOffset = 0;
    // this._ctx.setLineDash([]);
    CanvasHelper.arrowhead2(this._ctx, x, y, r, t);

    this._ctx.stroke(); // this._ctx.restore();

  },
  _drawArrowhead2: function _drawArrowhead2(x, y, r, t) {
    CanvasHelper.arrowhead(this._ctx, x, y, r, t);

    this._ctx.fill();
  },
  // _drawArrowheadH: function(x, y, r, a) {
  // 	this._ctx.save();
  // 	this._ctx.lineDashOffset = 0;
  // 	this._ctx.setLineDash([]);
  // 	this._ctx.beginPath();
  // 	this._ctx.moveTo(x + r * 1 / dir, y - r);
  // 	this._ctx.lineTo(x, y);
  // 	this._ctx.lineTo(x + r * 1 / dir, y + r);
  // 	this._ctx.stroke();
  // 	this._ctx.restore();
  // },
  _drawConnector: function _drawConnector(p, i, pp) {
    this._ctx.beginPath();

    this._ctx.moveTo(p.x2, p.cy2);

    this._ctx.arcTo(p.tx2, p.cy2, p.tx1, p.cy1, p.r2);

    this._ctx.arcTo(p.tx1, p.cy1, p.cx1, p.cy1, p.r1);

    this._ctx.arcTo(p.cx0, p.cy1, p.cx0, p.y1, p.r0); // p.cx00 = p.x1 + ((p.r0 + p.di) * p.qx);
    // p.cy00 = (p.cy1 + p.y1) / 2;
    // this._ctx.arcTo(p.cx00, p.cy1, p.cx00, p.cy00, p.r0 / 2);
    // this._ctx.arcTo(p.cx00, p.y1, p.x1, p.y1, p.r0 / 2);
    // this._ctx.lineTo(p.x1, p.y1);
    // p.cx00 = p.x1 + (p.r0 * p.qx * 2);
    // this._ctx.lineTo(p.cx00, p.cy1);
    // this._ctx.quadraticCurveTo(p.cx0, p.cy1, p.cx0, p.y1);
    // this._ctx.lineTo(p.cx0, p.y1);


    this._ctx.stroke();
  },
  _roundTo: function _roundTo(n, p) {
    if (p > 1) p = 1 / p;
    return Math.round(n / p) * p;
  }
  /*
  _computeConnectors: function(d) {
  	var rBase = d.s.radiusBase;
  	var rInc = d.s.radiusIncrement;
  	var sMin = d.xMin;
  	var dMin = d.destMinX;
  		var lMax = 0;
  	var p, connectors = [];
  	var qx, x1, y1, tx;
  	var si; // ssEl's number of items above in the Y axis
  		if (d.rect.right < d.destRect.left) {
  		qx = 1;
  	} else if (d.destRect.right < d.rect.left) {
  		qx = -1;
  	} else {
  		qx = 0;
  	}
  		var ssEl, ddEls, ddNum, ssRect, ddRect, i;
  	ssEl = d.srcView.el.querySelector(".list-item.selected .label");
  	if (ssEl) {
  		ssRect = ssEl.getBoundingClientRect();
  		x1 = ssRect.left;
  		if (qx > 0) x1 += ssRect.width;
  		y1 = ssRect.top + ssRect.height / 2;
  		// r2 = rBase;
  		// cx1 = d.xMin;
  			si = 0;
  		ddEls = d.destView.el.querySelectorAll(".list-item:not(.excluded) .label");
  		ddNum = ddEls.length;
  		// dx = Math.abs(d.xMin - dData.xMin);
  			for (i = 0; i < ddNum; i++) {
  			p = {};
  			ddRect = ddEls[i].getBoundingClientRect();
  			p.x2 = ddRect.left;
  			if (qx < 0) p.x2 += ddRect.width;
  			p.y2 = ddRect.top + ddRect.height / 2;
  			p.x1 = x1;
  			p.y1 = y1;
  			p.dx = p.x1 - p.x2;
  			p.dy = p.y1 - p.y2;
  			p.qx = qx;
  			p.qy = Math.sign(p.dy);
  			// p.dLength = Math.abs(p.x) + Math.abs(p.y);
  			p.di = p.dy > 0 ? i : ddNum - (i + 1);
  			si = Math.max(si, p.di);
  			connectors[i] = p;
  		}
  			var a, rMax0 = ddNum * 0.5 * rInc;
  		for (i = 0; i < ddNum; i++) {
  			p = connectors[i];
  			p.r1 = p.di * rInc + rBase;
  			p.r2 = rBase;
  			// p.r2 = (si - p.di) * rInc + rBase;
  				p.cx1 = sMin;
  			p.cx2 = dMin - ((si - p.di) * rInc) * qx;
  			// p.cx2 = dMin;
  				a = (i - (ddNum - 1) / 2) * rInc;
  			p.cy1 = p.y1 + a;
  			p.cy2 = p.y2;
  				a = Math.abs(a);
  			p.r0 = a;
  			p.cx0 = p.x1 + (rMax0 - a) * qx;
  				tx = calcArcHConnector(p.cx1, p.cy1, p.r1, p.cx2, p.cy2, p.r2, 0.8);
  			p.tx1 = tx[0];
  			p.tx2 = tx[1];
  				// Find out longest node connection for setLineDash
  			lMax = Math.max(lMax, Math.abs(p.x1 - p.x2) + Math.abs(p.cy1 - p.cy2));
  		}
  		// Sort by distance y1 (original) > cy1 (rInc offset) distance
  		connectors.sort(function(a, b) {
  			// return Math.abs(b.y1 - b.cy1) - Math.abs(a.y1 - a.cy1);
  			// return a.r0 - b.r0;
  			return b.di - a.di;
  		});
  	}
  	d.connectors = connectors;
  	d.maxLength = lMax;
  	d.maxLength = qx;
  }, */

});

if (DEBUG) {
  // GraphView.prototype._logFlags = "";
  var applyFn = function applyFn(context, args) {
    return Array.prototype.shift.apply(args).apply(context, args);
  };

  GraphView.prototype._drawConnector = _.wrap(GraphView.prototype._drawConnector, function (fn, p, i, pp) {
    if (!this._debugGraph) {
      // visual debug aids are off
      return fn.call(this, p, i, pp);
    } // var isRtl = p.qx < 0;


    var isFirst = i == 0;
    var isLast = i == pp.length - 1; // guide color

    var gs = _dStyles[isFirst ? "salmon_dashed" : "lightskyblue_dashed"];

    if (isFirst) {
      CanvasHelper.drawVGuide(this._ctx, _dStyles["grey"], pp.sMin);
      CanvasHelper.drawVGuide(this._ctx, _dStyles["grey"], pp.dMin);
    }

    if (isFirst) {
      CanvasHelper.drawHGuide(this._ctx, _dStyles["silver_dashed"], p.y1);
      CanvasHelper.drawVGuide(this._ctx, _dStyles["silver_dashed"], p.x1);
      CanvasHelper.drawCircle(this._ctx, _dStyles["midnightblue"], p.x1, p.y1, 10);
    }

    if (isFirst || isLast) {
      // CanvasHelper.drawVGuide(this._ctx, gs, p.cx1 + (p.r1 * p.qx));
      CanvasHelper.drawVGuide(this._ctx, gs, p.tx2);
      CanvasHelper.drawVGuide(this._ctx, gs, p.cx2 - p.r2 * p.qx); // CanvasHelper.drawVGuide(this._ctx, gs, p.cx2);
      // CanvasHelper.drawHGuide(this._ctx, gs, p.cy2);
    }

    if (isFirst || isLast) {
      this._ctx.save();

      this._ctx.strokeStyle = _dStyles[isFirst ? "red" : "blue"].strokeStyle;
      this._ctx.lineWidth *= 1.5;
    } // }


    fn.call(this, p, i, pp); // if (isRtl) {

    if (isFirst || isLast) {
      this._ctx.restore();
    } // point color


    var pCol = isLast ? "midnightblue" : isFirst ? "sienna" : "grey";
    var ps = _dStyles[pCol];
    var pf = _dStyles[pCol + "_fill"]; // CanvasHelper.drawCrosshair(this._ctx, ps, p.x1 + ((p.r0 + p.di) * p.qx), p.cy1, 3);

    if (isFirst || isLast) {
      // moveTo(p.x2, p.cy2)
      CanvasHelper.drawCrosshair(this._ctx, ps, p.x2, p.cy2, 10);
      CanvasHelper.drawCircle(this._ctx, ps, p.x2, p.cy2, 3); // arcTo #1: (p.tx2, p.cy2, p.tx1, p.cy1, p.r2)

      CanvasHelper.drawSquare(this._ctx, ps, p.tx2, p.cy2, 4); // p1

      CanvasHelper.drawCircle(this._ctx, pf, p.tx1, p.cy1, 2); // p2
      // arcTo #2: (p.tx1, p.cy1, p.cx1, p.cy1, p.r1)

      CanvasHelper.drawSquare(this._ctx, ps, p.tx1, p.cy1, 4); // p1

      CanvasHelper.drawCircle(this._ctx, pf, p.cx1, p.cy1, 2); // p2
      // arcTo #2: (p.cx0, p.cy1, p.cx0, p.y1, p.r0)

      CanvasHelper.drawSquare(this._ctx, ps, p.cx0, p.cy1, 4); // p1

      CanvasHelper.drawCircle(this._ctx, pf, p.cx0, p.y1, 2); // p2

      CanvasHelper.drawCircle(this._ctx, _dStyles["green"], p.tx1, p.cy1, 4);
      CanvasHelper.drawCircle(this._ctx, _dStyles["green"], p.cx1, p.cy1, 4);
      CanvasHelper.drawCircle(this._ctx, _dStyles["green"], p.cx2, p.cy2, 4);
    } // }

  });

  GraphView.prototype._traceScroll = function (type) {
    var tpl = "%s:[%s] DPR:%i " + "[window: %i %i] " + "[html: %i %i %i] " + "[body: %i %i %i] " + "[container: %i %i %i] " + "[graph: %i %i %i]";
    console.log(tpl, this.cid, type, this._canvasRatio, window.pageYOffset, window.pageYOffset, document.documentElement.clientHeight, document.documentElement.scrollTop, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollTop, document.body.scrollHeight, document.body.firstElementChild.clientHeight, document.body.firstElementChild.scrollTop, document.body.firstElementChild.scrollHeight, this.el.clientHeight, this.el.scrollTop, this.el.scrollHeight);
  };

  if (GraphView.prototype._logFlags.split(" ")["view.render"]) {
    // GraphView.prototype._requestRender = _.wrap(CanvasView.prototype._requestRender, function(fn) {
    // 	debouncedLog("%s::_requestRender", this.cid);
    // 	return applyMethod(this, arguments);
    // });
    var debouncedLog = _.debounce(_.bind(console.log, console), 500, true);

    GraphView.prototype._applyRender = _.wrap(CanvasView.prototype._applyRender, function (fn) {
      var retval;
      this._logFlags["view.render"] = false;
      debouncedLog("%s::_applyRender [debounced]", this.cid);
      retval = applyFn(this, arguments);
      this._logFlags["view.render"] = true;
      return retval;
    });
  }
}

module.exports = GraphView;

}).call(this,true,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/view/base/CanvasView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/CanvasView.js","color":"color","underscore":"underscore","utils/canvas/CanvasHelper":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/CanvasHelper.js","utils/canvas/calcArcHConnector":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/calcArcHConnector.js","utils/geom/inflateRect":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/geom/inflateRect.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/GroupingListView.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/component/GroupingListView
 */

/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("app/view/component/FilterableListView");
/** @type {module:app/view/component/ClickableRenderer} */


var ClickableRenderer = require("app/view/render/ClickableRenderer");
/** @type {module:app/view/render/LabelRenderer} */


var LabelRenderer = require("app/view/render/LabelRenderer"); // /** @type {module:utils/array/difference} */
// var diff = require("utils/array/difference");

/**
 * @constructor
 * @type {module:app/view/component/GroupingListView}
 */


var GroupingListView = FilterableListView.extend({
  /** @type {string} */
  cidPrefix: "groupingList",

  /** @override */
  tagName: "dl",

  /** @override */
  className: "grouped",

  /** @type {Function|null} empty array */
  _groupingFn: null,
  //function() { return null; },

  /** @override */
  defaults: _.defaults({
    // defaults: {
    renderer: ClickableRenderer.extend({
      /** @override */
      cidPrefix: "groupingListItem",

      /** @override */
      tagName: "dl",

      /** @override */
      className: "list-item list-node"
    }),
    groupingRenderer: LabelRenderer.extend({
      /** @override */
      cidPrefix: "groupingListGroup",

      /** @override */
      tagName: "dt",

      /** @override */
      className: "list-group list-node"
    }),
    groupingFn: null // },

  }, FilterableListView.prototype.defaults),
  properties: {
    groups: {
      get: function get() {
        return this._groups;
      }
    },
    filteredGroups: {
      get: function get() {
        return this._filteredGroups;
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    FilterableListView.prototype.initialize.apply(this, arguments);
    this._groups = [];
    this._filteredGroups = [];
    this._changedFilteredGroups = [];
    this._groupsByItemCid = {};
    this._groupingFn = options.groupingFn;
    this.groupingRenderer = options.groupingRenderer;

    this._computeGroups();

    if (this._groupingFn) {
      this._groups.forEach(this.createGroupingView, this);
    }
  },

  /**
   * Called once on collection change
   * @private
   */
  _computeGroups: function _computeGroups() {
    // this._groups = _.uniq(this.collection.map(this._groupingFn, this));
    this._groups.length = 0; // this._groupItems.length = 0;

    if (this._groupingFn) {
      this.collection.forEach(function (item) {
        var gIdx, gObj;
        gObj = this._groupingFn.apply(null, arguments);

        if (gObj) {
          gIdx = this._groups.indexOf(gObj);

          if (gIdx == -1) {
            gIdx = this._groups.length;
            this._groups[gIdx] = gObj; // this._groupItems[gIdx] = [];
          } // this._groupItems[gIdx].push(item);

        }

        this._groupsByItemCid[item.cid] = gObj;
      }, this);
    } else {
      this.collection.forEach(function (item) {
        this._groupsByItemCid[item.cid] = null;
      }, this);
    }
  },

  /** @private Create children views */
  createGroupingView: function createGroupingView(item) {
    var view = new this.groupingRenderer({
      model: item,
      el: this.el.querySelector(".list-group[data-id=\"" + item.id + "\"]")
    });
    this.itemViews.add(view);
    return view;
  },

  /* --------------------------- *
  /* Filter impl 1
  /* --------------------------- */

  /** @override */

  /*
  computeFilter_1: function() {
  	FilterableListView.prototype.computeFilter_1.apply(this, arguments);
  		if (this._groupingFn) {
  		if (this._filteredItems.length == 0) {
  			this._filteredGroups = [];
  		} else {
  			this._filteredGroups = _.uniq(this._filteredItems.map(function(item) {
  				return this._groupsByItemCid[item.cid];
  			}, this));
  		}
  	}
  	// if (this._groupingFn) {
  	// 	if (this._filteredItems.length == 0) {
  	// 		this._filteredGroups = [];
  	// 		this._groups.forEach(function(group) {
  	// 			this.itemViews.findByModel(group).el.classList.remove("excluded");
  	// 		}, this);
  	// 	} else {
  	// 		this._filteredGroups = _.uniq(this._filteredItems.map(function(item) {
  	// 			return this._groupsByItemCid[item.cid];
  	// 		}, this));
  	// 		this._groups.forEach(function(group) {
  	// 			this.itemViews.findByModel(group).el.classList.toggle("excluded", this._filteredGroups.indexOf(group) == -1);
  	// 		}, this);
  	// 	}
  	// }
  },
  */

  /* --------------------------- *
  /* Filter impl 2
  /* --------------------------- */
  // /** @override */
  // renderFilterFn_2: function() {
  // 	FilterableListView.prototype.renderFilterFn_2.apply(this, arguments);
  // },

  /** @override */
  computeFilter: function computeFilter() {
    FilterableListView.prototype.computeFilter.apply(this, arguments);

    if (this._groupingFn) {
      if (this._filteredItems.length == 0) {
        this._filteredGroups = this._groups.concat(); //[];
      } else {
        this._filteredGroups = _.uniq(this._filteredItems.map(function (item) {
          return this._groupsByItemCid[item.cid];
        }, this));
      }
    }
  },

  /** @override */
  applyFilter: function applyFilter() {
    FilterableListView.prototype.applyFilter.apply(this, arguments);

    this._groups.forEach(function (group) {
      this.itemViews.findByModel(group).el.classList.toggle("excluded", this._filteredGroups.indexOf(group) == -1);
    }, this);
  } // computeFiltered: function() {
  // 	FilterableListView.prototype.computeFiltered.apply(this, arguments);
  // },
  //
  // renderFiltered: function() {
  // 	FilterableListView.prototype.renderFiltered.apply(this, arguments);
  // },

});
module.exports = GroupingListView;

}).call(this,require("underscore"))

},{"app/view/component/FilterableListView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/FilterableListView.js","app/view/render/ClickableRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ClickableRenderer.js","app/view/render/LabelRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/LabelRenderer.js","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/PlayToggleSymbol.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/component/PlayToggleSymbol
 */
// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");

/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");
/** @type {Function} */


var Color = require("color");
/** @type {module:utils/canvas/bitmap/stackBlurRGB} */


var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
/** @type {module:utils/canvas/bitmap/getAverageRGB} */


var getAverageRGB = require("utils/canvas/bitmap/getAverageRGB");
/** @type {module:utils/canvas/bitmap/multiply} */


var multiply = require("utils/canvas/bitmap/multiply");
/** @type {module:utils/canvas/bitmap/desaturate} */


var desaturate = require("utils/canvas/bitmap/desaturate");
/** @type {module:utils/canvas/CanvasHelper} */


var roundRect = require("utils/canvas/CanvasHelper").roundRect;
/** @type {module:utils/ease/fn/easeInQuad} */


var easeIn = require("utils/ease/fn/easeInQuad");
/** @type {module:utils/ease/fn/easeOutQuad} */


var easeOut = require("utils/ease/fn/easeOutQuad");

var PI2 = Math.PI * 2;
var LOOP_OFFSET = 1.833333;

var INTEP_MS = require("app/control/Globals").TRANSITION_DURATION;

var FILTER_REFRESH_THRESHOLD = 0.5; //seconds elapsed

var FILTER_SCALE = 1.5;
var FILTER_RADIUS = 30; //pixels

var FILTER_MULTIPLY = 0.1;
var PlayToggleSymbol = {
  PLAY: "playing",
  PAUSE: "paused",
  WAITING: "waiting",
  ENDED: "ended"
};
module.exports = CanvasView.extend({
  /** @type {string} */
  cidPrefix: "playToggleSymbol",

  /** @type {string} */
  className: "play-toggle",
  defaults: {
    values: {
      _loop: 0,
      _arc: 0
    },
    maxValues: {
      _loop: 1
    },
    color: "rgba(255,255,255,1.0)",
    backgroundColor: "rgba(0,0,0,0.25)",
    paused: true,
    symbolName: "" // borderRadius: 3,
    // borderWidth: 3,

  },
  properties: {
    symbolName: {
      get: function get() {
        return this._symbolName;
      },
      set: function set(value) {
        this._setSymbolName(value);
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    // TODO: cleanup options mess in CanvasView
    CanvasView.prototype.initialize.apply(this, arguments);
    this._options = _.extend(this._options, _.pick(options, "symbolName", "borderRadius", "borderWidth"));
    this.symbolName = this._options.symbolName;
  },

  /** @override */
  measureCanvas: function measureCanvas(w, h, s) {
    // make canvas square
    this._canvasHeight = this._canvasWidth = Math.min(w, h);
  },

  /** @override */
  updateCanvas: function updateCanvas(ctx, s) {
    var mObj = this._getFontMetrics(this._fontFamily);

    this._baselineShift = mObj ? (mObj.ascent + mObj.descent) / mObj.unitsPerEm : 0.7; // default value

    this._baselineShift *= this._fontSize * 0.5; // apply to font-size, halve it

    this._baselineShift = Math.round(this._baselineShift);
    this._canvasOffsetX = this._canvasOffsetY = this._canvasWidth / 2; // double SQRT1_2: square within circle within square

    this._radius = this._canvasWidth / 2 * Math.SQRT1_2 * Math.SQRT1_2 * Math.SQRT1_2;
    this._side = this._radius; // * Math.SQRT1_2; // * Math.SQRT1_2;
    // this._borderWidth = this._options.borderWidth * this._canvasRatio;
    // this._borderRadius = this._canvasWidth * this._canvasRatio / 2; //this._options.borderRadius * this._canvasRatio;
    // reset matrix and translate 0,0 to center

    this._ctx.setTransform(1, 0, 0, 1, this._canvasOffsetX, this._canvasOffsetY); // this._ctx.restore();
    // this._ctx.textBaseline = "middle";


    this._ctx.lineWidth = this._radius * (1 - Math.SQRT1_2); // this._ctx.fillStyle = "#FFF";

    this._ctx.shadowColor = "rgba(0,0,0,0.75)";
    this._ctx.shadowBlur = 1;
    this._ctx.shadowOffsetX = 2;
    this._ctx.shadowOffsetY = 2; // this._ctx.save();

    this._isImageDataInvalid = true; //console.log("%s::updateCanvas %s", this.cid, this._backgroundColor);
  },

  /* --------------------------- *
   * symbolName
   * --------------------------- */
  _symbolName: "",
  _setSymbolName: function _setSymbolName(value) {
    if (this._symbolName !== value) {
      this._lastSymbolName = this._symbolName;
      this._symbolName = value;
      this.refreshImageSource();
      this.requestRender(CanvasView.LAYOUT_INVALID);
      console.log("%s::[set] symbol %o (from %o)", this.attached ? this.parentView.cid : this.cid, this._symbolName, this._lastSymbolName, this.paused ? "paused" : "");
    }
  },

  /* --------------------------- *
   * setImageSource/refreshImageSource
   * --------------------------- */
  _imageSource: null,
  setImageSource: function setImageSource(imageSource) {
    if (this._imageSource !== imageSource) {
      this._imageSource = imageSource;
      this._isImageDataInvalid = true;
      this.requestRender(CanvasView.SIZE_INVALID);
    }
  },
  _imageDataTC: null,
  refreshImageSource: function refreshImageSource(threshold) {
    if (this._isImageDataInvalid || !(this._imageSource instanceof HTMLVideoElement)) {
      return; // data is marked for refresh already, or not a video
    }

    if (!_.isNumber(threshold)) {
      threshold = FILTER_REFRESH_THRESHOLD;
    }

    if (threshold < Math.abs(this._imageDataTC - this._imageSource.currentTime)) {
      this._isImageDataInvalid = true;
      this.requestRender(CanvasView.SIZE_INVALID);
    }
  },
  _imageData: null,
  _updateImageData: function _updateImageData() {
    if (this._imageSource === null) {
      this._imageData = null;
      this._imageDataTC = null;
      return;
    } // source scale, source rect, dest scale, dest rect, current timecode


    var s, sr, d, dr, tc; // Get source/dest offsets, intrinsic scale and timecode
    // ---------------------------------

    sr = this._imageSource.getBoundingClientRect();
    dr = this.el.getBoundingClientRect();

    if (this._imageSource instanceof HTMLVideoElement) {
      s = this._imageSource.videoWidth / sr.width;
      tc = this._imageSource.currentTime;
    } else {
      s = this._imageSource.naturalWidth / sr.width;
      tc = 0;
    }

    d = s * FILTER_SCALE; // draw source canvas maintaining position
    // ---------------------------------

    this._ctx.save();

    this._ctx.setTransform(1, 0, 0, 1, 0, 0);

    this._ctx.drawImage(this._imageSource, (dr.left - sr.left) * s + dr.width / 2 * s - dr.width / 2 * d, (dr.top - sr.top) * s + dr.height / 2 * s - dr.height / 2 * d, dr.width * d, dr.height * d, 0, 0, this.el.width, this.el.height); // if (d == s)
    // this._ctx.drawImage(this._imageSource,
    // 	(dr.left - sr.left) * s, (dr.top - sr.top) * s,
    // 	dr.width * s, dr.height * s,
    // 	0, 0, this.el.width, this.el.height
    // );
    // get ImageData
    // find luminosity threshold form average color
    // ---------------------------------


    var imgdata, isDark;
    imgdata = this._ctx.getImageData(0, 0, this.el.width, this.el.height); // isDark = !Color().rgb(getAverageRGB(imgdata)).dark();
    // this._ctx.globalCompositeOperation = "luminosity";
    // this._ctx.globalAlpha = 0.25;
    // this._ctx.fillStyle = (isDark ? "black" : "white");
    // this._ctx.fillRect(0, 0, this.el.width, this.el.height);

    this._ctx.clearRect(0, 0, this.el.width, this.el.height);

    this._ctx.restore(); // Store appropiate color values
    // ---------------------------------


    this._color = isDark ? "white" : "black"; // this._color = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)";
    // this._backgroundColor = isDark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.74)";
    // this.el.style.color =
    // 	this._ctx.fillStyle =
    // 	this._ctx.strokeStyle =
    // 	this._color;
    // this.el.style.backgroundColor =
    // 	this._ctx.shadowColor =
    // 	this._backgroundColor;
    // this.el.classList.toggle("lod", isDark);
    // this.el.classList.toggle("dol", !isDark);
    // Apply filters and save results
    // ---------------------------------
    // imgdata = this._ctx.getImageData(0, 0, this.el.width, this.el.height);
    // imgdata = multiply(imgdata, (isDark ? 1 - FILTER_MULTIPLY : 1 + FILTER_MULTIPLY));
    // imgdata = desaturate(imgdata, 0.5);

    imgdata = multiply(imgdata, 1 + FILTER_MULTIPLY);
    imgdata = stackBlurRGB(imgdata, FILTER_RADIUS); // imgdata = null;

    this._imageData = imgdata;
    this._imageDataTC = tc;
  },

  /** @override */
  redraw: function redraw(ctx, intrp, flags) {
    this._clearCanvas();

    if (this._symbolName === 'waiting') {
      if (intrp.getTargetValue('_arc') === 0) {
        intrp.valueTo('_arc', 1, 0 * INTEP_MS, easeIn).updateValue('_arc');
      }
    } else {
      if (intrp.getTargetValue('_arc') === 1) {
        intrp.valueTo('_arc', 0, 0 * INTEP_MS, easeOut).updateValue('_arc');
      }
    }

    var a = intrp.getRenderedValue("_arc"); // while arc is > 0, loop indefinitely while spinning and restart
    // if at end. Otherwise let interp exhaust arc duration

    if (a > 0) {
      if (!intrp.paused && intrp.isAtTarget('_loop')) {
        // console.log("%s::redraw [loop]", this.cid, this.parentView.cid);
        intrp.valueTo('_loop', 0, 0).valueTo('_loop', 1, 2 * INTEP_MS).updateValue('_loop');
      }
    }

    var l = intrp.getRenderedValue("_loop"); // if (this._isImageDataInvalid) {
    // 	this._isImageDataInvalid = false;
    // 	this._updateImageData();
    // }
    // if (this._imageData !== null) {
    // 	ctx.putImageData(this._imageData, 0, 0);
    // }
    // always render while arc is > 0

    if (a > 0) {
      // arc span bounce
      var b = (l < 0.5 ? l % 0.5 : 0.5 - l % 0.5) * 2; // bounce + main arc span

      var aa = a * b * 0.25 + a * 0.125 + .0001; // rotation loop

      var ll = l + LOOP_OFFSET;
      ctx.beginPath();
      ctx.arc(0, 0, this._radius, (1 - aa + ll) * PI2, (aa + ll) * PI2, false);
      ctx.stroke();
    }

    switch (this._symbolName) {
      case "replay":
      case "ended":
      case "play":
        // this.drawPlay(ctx, (1 - a) * s);
        this.drawPlay(ctx, this._side);
        ctx.fill();
        break;

      case "pause":
        // this.drawPause(ctx, (1 - a) * s);
        this.drawPause(ctx, this._side);
        ctx.fill();
        break;

      case "waiting":
        switch (this._lastSymbolName) {
          case "replay":
          case "ended":
          case "play":
            this.drawPlay(ctx, (1 - a) * this._side);
            ctx.fill();
            break;

          case "pause":
            this.drawPause(ctx, (1 - a) * this._side);
            ctx.fill();
            break;

          default:
            break;
        }

        break;

      default:
        break;
    }
  },
  drawPlay: function drawPlay(ctx, r) {
    var tx = (1 - Math.SQRT1_2) * r;
    ctx.beginPath();
    ctx.moveTo(tx + r, 0);
    ctx.lineTo(tx - r, -r);
    ctx.lineTo(tx - r, r);
    ctx.closePath();
  },
  drawPause: function drawPause(ctx, r) {
    var w = r * 0.75;
    var h = r * 2;
    ctx.beginPath();
    ctx.rect(-r, -r, w, h);
    ctx.rect(r - w, -r, w, h);
    ctx.closePath();
  },
  drawLabel: function drawLabel(labelString) {
    var labelWidth = this._ctx.measureText(labelString).width;

    this._ctx.fillText(labelString, labelWidth * -0.5, // 0, labelWidth);
    this._baselineShift, labelWidth);
  }
}, PlayToggleSymbol);

}).call(this,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/view/base/CanvasView":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/CanvasView.js","color":"color","underscore":"underscore","utils/canvas/CanvasHelper":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/CanvasHelper.js","utils/canvas/bitmap/desaturate":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/desaturate.js","utils/canvas/bitmap/getAverageRGB":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/getAverageRGB.js","utils/canvas/bitmap/multiply":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/multiply.js","utils/canvas/bitmap/stackBlurRGB":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/stackBlurRGB.js","utils/ease/fn/easeInQuad":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/ease/fn/easeInQuad.js","utils/ease/fn/easeOutQuad":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/ease/fn/easeOutQuad.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/SelectableListView.js":[function(require,module,exports){
"use strict";

/**
 * @module app/view/component/SelectableListView
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:backbone.babysitter} */


var Container = require("backbone.babysitter");
/** @type {module:app/view/component/DefaultSelectableRenderer} */


var DefaultSelectableRenderer = require("app/view/render/DefaultSelectableRenderer");
/** @type {module:app/view/component/ClickableRenderer} */


var ClickableRenderer = require("app/view/render/ClickableRenderer");

var SelectableListView = View.extend({
  /** @type {string} */
  cidPrefix: "selectableList",

  /** @override */
  tagName: "ul",

  /** @override */
  className: "list selectable",

  /** @type {module:app/view/component/DefaultSelectableRenderer} */
  renderer: DefaultSelectableRenderer,

  /** @override */
  initialize: function initialize(options) {
    this._enabled = true;
    this._childrenInvalid = true;
    options.renderer && (this.renderer = options.renderer);
    this.showEmpty = !!options.showEmpty;
    this.itemViews = new Container();
    this.listenTo(this.collection, "add remove reset", this._onCollectionChange);
  },

  /** @override */
  remove: function remove() {
    this.removeChildren();
    View.prototype.remove.apply(this, arguments);
    return this;
  },
  _onCollectionChange: function _onCollectionChange(ev) {
    this._childrenInvalid = true;
    this.render();
  },

  /** @override */
  render: function render() {
    if (this._childrenInvalid) {
      this._childrenInvalid = false;
      this.createChildren();
    }

    return this;
  },

  /** @override */
  setEnabled: function setEnabled(enabled) {
    if (this._enabled !== enabled) {
      this._enabled = enabled;
      this.el.classList.toggle("disabled", !this._enabled);
    }
  },

  /* --------------------------- *
  /* Child views
  /* --------------------------- */
  createChildren: function createChildren() {
    var eltBuffer, view;
    this.removeChildren();
    this.el.innerHTML = "";

    if (this.collection.length) {
      eltBuffer = document.createDocumentFragment();

      if (this.showEmpty) {
        view = this.createEmptyView();
        eltBuffer.appendChild(view.render().el);
      }

      this.collection.each(function (model, index, arr) {
        view = this.createItemView(model, index);
        eltBuffer.appendChild(view.render().el);
      }, this);
      this.el.appendChild(eltBuffer);
    }
  },
  createItemView: function createItemView(model, index) {
    var view = new this.renderer({
      model: model
    });
    this.itemViews.add(view);
    this.listenTo(view, "renderer:click", this.onItemViewClick);
    return view;
  },
  removeChildren: function removeChildren() {
    this.itemViews.each(this.removeItemView, this);
  },
  removeItemView: function removeItemView(view) {
    this.stopListening(view);
    this.itemViews.remove(view);
    view.remove();
    return view;
  },

  /* --------------------------- *
  /* Child event handlers
  /* --------------------------- */

  /** @private */
  onItemViewClick: function onItemViewClick(item) {
    if (this.collection.selected !== item && this._enabled) {
      this.trigger("view:select:one", item);
    }
  },

  /* --------------------------- *
  /* Empty view
  /* --------------------------- */
  createEmptyView: function createEmptyView() {
    var view = new SelectableListView.EmptyRenderer({
      model: this.collection
    });
    this.itemViews.add(view);
    this.listenTo(view, "renderer:click", function () {
      this._enabled && this.trigger("view:select:none");
    });
    return view;
  }
}, {
  EmptyRenderer: ClickableRenderer.extend({
    /** @override */
    tagName: "li",

    /** @override */
    className: "list-item empty-item",

    /** @override */
    initialize: function initialize(options) {
      this.listenTo(this.model, "selected deselected", this.renderClassList);
      this.renderClassList();
    },

    /** @override */
    render: function render() {
      this.el.innerHTML = "<a href=\"#clear\"><b> </b></a>";
      this.renderClassList();
      return this;
    },
    renderClassList: function renderClassList() {
      this.el.classList.toggle("selected", this.model.selectedIndex === -1);
    }
  })
});
module.exports = SelectableListView;

},{"app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","app/view/render/ClickableRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ClickableRenderer.js","app/view/render/DefaultSelectableRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/DefaultSelectableRenderer.js","backbone.babysitter":"backbone.babysitter"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/helper/createColorStyleSheet.js":[function(require,module,exports){
(function (_){
"use strict";

/** @type {Function} */
var Color = require("color");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/model/collection/BundleCollection} */


var bundles = require("app/model/collection/BundleCollection"); // - - - - - - - - - - - - - - - -
//  utils
// - - - - - - - - - - - - - - - -


function insertCSSRule(sheet, selector, style) {
  var cssText = "";

  for (var prop in style) {
    cssText += prop + ":" + style[prop] + ";";
  }

  sheet.insertRule(selector + "{" + cssText + "}", sheet.cssRules.length);
}

function selfAndDescendant(selfCls, cls) {
  return selfCls + " " + cls + ", " + selfCls + cls;
} // - - - - - - - - - - - - - - - -
//  root rules
// - - - - - - - - - - - - - - - -


var rootStyles = ["color", "background", "background-color"];

function initRootStyles(sheet, rootSelector, attrs, fgColor, bgColor, lnColor, hasDarkBg) {
  var s, revSelector, fgColorVal, bgColorVal; // var revFgColorVal, revBgColorVal;

  s = _.pick(attrs, rootStyles); // s["-webkit-font-smoothing"] = (hasDarkBg ? "antialiased" : "auto");

  /* NOTE: In Firefox '-moz-osx-font-smoothing: grayscale;'
  /* works both in light over dark and dark over light, hardcoded in _base.scss */
  //s["-moz-osx-font-smoothing"] = (hasDarkBg? "grayscale" : "auto");

  insertCSSRule(sheet, rootSelector, s); // A element
  // - - - - - - - - - - - - - - - -

  s = {};
  s["color"] = lnColor.rgb().string();
  insertCSSRule(sheet, rootSelector + " a", s);
  insertCSSRule(sheet, rootSelector + " .color-ln", s); // .color-fg05
  // - - - - - - - - - - - - - - - -

  s = {};
  s["color"] = Color(fgColor).mix(bgColor, 0.5).rgb().string();
  s["border-color"] = Color(fgColor).mix(bgColor, 0.3).rgb().string();
  insertCSSRule(sheet, rootSelector + " .color-fg05", s);
  fgColorVal = fgColor.rgb().string();
  bgColorVal = bgColor.rgb().string(); // revFgColorVal = Color(bgColor).mix(fgColor, 0.9).rgb().string();
  // revBgColorVal = Color(fgColor).mix(bgColor, 0.6).rgb().string();

  revSelector = rootSelector + " .color-reverse"; // .color-fg .color-bg
  // - - - - - - - - - - - - - - - -

  s = {
    "color": fgColorVal
  };
  insertCSSRule(sheet, rootSelector + " .color-fg", s);
  s = {
    "background-color": bgColorVal
  };
  insertCSSRule(sheet, rootSelector + " .color-bg", s); // html inverted text/background

  s = {
    "color": bgColorVal
  }; // s = { "color" : revFgColorVal };
  // s["-webkit-font-smoothing"] = (hasDarkBg ? "auto" : "antialiased");
  // insertCSSRule(sheet, revSelector + " .color-fg", s);
  // insertCSSRule(sheet, revSelector + ".color-fg", s);

  insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-fg"), s);
  s = {
    "background-color": fgColorVal
  }; // s = { "background-color" : revBgColorVal };
  // insertCSSRule(sheet, revSelector + " .color-bg", s);
  // insertCSSRule(sheet, revSelector + ".color-bg", s);

  insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-bg"), s); // .color-stroke .color-fill (SVG)
  // - - - - - - - - - - - - - - - -

  s = {
    "stroke": fgColorVal
  };
  insertCSSRule(sheet, rootSelector + " .color-stroke", s);
  s = {
    "fill": bgColorVal
  };
  insertCSSRule(sheet, rootSelector + " .color-fill", s); // svg inverted fill/stroke

  s = {
    "stroke": bgColorVal
  }; // insertCSSRule(sheet, revSelector + " .color-stroke", s);
  // insertCSSRule(sheet, revSelector + ".color-stroke", s);

  insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-stroke"), s);
  s = {
    "fill": fgColorVal
  }; // insertCSSRule(sheet, revSelector + " .color-fill", s);
  // insertCSSRule(sheet, revSelector + ".color-fill", s);

  insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-fill"), s); // .text-outline
  // - - - - - - - - - - - - - - - -
  // s = {
  // 	"text-shadow": "-1px -1px 0 " + bgColorVal +
  // 		", 1px -1px 0 " + bgColorVal +
  // 		", -1px 1px 0 " + bgColorVal +
  // 		", 1px 1px 0 " + bgColorVal
  // };
  // insertCSSRule(sheet, rootSelector + " :not(..collapsed-changing) .text-outline-bg", s);
} // - - - - - - - - - - - - - - - -
// carousel styles
// - - - - - - - - - - - - - - - -


var carouselStyles = ["box-shadow", "border", "border-radius"];

function initCarouselStyles(sheet, carouselSelector, attrs, fgColor, bgColor, lnColor, hasDarkBg) {
  var s = _.pick(attrs, carouselStyles); //, "background-color"]);


  insertCSSRule(sheet, carouselSelector + " .media-item .content", s); // .media-item .color-bg09
  // - - - - - - - - - - - - - - - -

  s = {};
  s["background-color"] = Color(bgColor).mix(fgColor, 0.05).rgb().string(); // s["background-color"] = Color(bgColor)[hasDarkBg ? "darken" : "lighten"](0.045).rgb().string();
  // s["background-color"] = Color(bgColor)[hasDarkBg ? "lighten" : "darken"](0.03).rgb().string();

  insertCSSRule(sheet, carouselSelector + " .media-item .color-bg09", s); // .media-item .placeholder
  // - - - - - - - - - - - - - - - -

  s = {}; // s["-webkit-font-smoothing"] = (hasDarkBg ? "auto" : "antialiased");
  // text color luminosity is inverse from body, apply oposite rendering mode

  s["color"] = bgColor.rgb().string(); // s["color"] = Color(bgColor)[hasDarkBg ? "darken" : "lighten"](0.045).rgb().string();

  s["background-color"] = Color(bgColor).mix(fgColor, 0.05).rgb().string(); // s["background-color"] = Color(bgColor).mix(fgColor, 0.8).alpha(0.3).rgba().string();
  // s["background-color"] = Color(bgColor)[hasDarkBg ? "lighten" : "darken"](0.03).rgb().string();

  "border-radius" in attrs && (s["border-radius"] = attrs["border-radius"]);
  insertCSSRule(sheet, carouselSelector + " .media-item .placeholder", s); // .image-item img
  // .sequence-item .sequence-step
  // - - - - - - - - - - - - - - - -

  s = {};
  s["background-color"] = bgColor.rgb().string();
  insertCSSRule(sheet, carouselSelector + " .image-item img", s);
  insertCSSRule(sheet, carouselSelector + " .sequence-item .sequence-step", s); // .empty-item A
  // - - - - - - - - - - - - - - - -

  s = {};
  s["text-decoration-color"] = Color(fgColor).mix(bgColor, 0.7).rgb().string();
  insertCSSRule(sheet, carouselSelector + " .empty-item A", s); // // .color-gradient
  // // - - - - - - - - - - - - - - - -
  // s = {};
  // s["background-color"] = "transparent";
  // s["background"] = "linear-gradient(to bottom, " +
  // 		Color(bgColor).alpha(0.00).rgba().string() + " 0%, " +
  // 		Color(bgColor).alpha(0.11).rgba().string() + " 100%)";
  // insertCSSRule(sheet, rootSelector + " .color-gradient", s);
  // s = {};
  // s["background-color"] = "transparent";
  // s["background"] = "linear-gradient(to bottom, " +
  // 		Color(fgColor).alpha(0.00).rgba().string() + " 0%, " +
  // 		Color(fgColor).alpha(0.11).rgba().string() + " 100%)";
  // insertCSSRule(sheet, revSelector + " .color-gradient", s);
  // insertCSSRule(sheet, revSelector + ".color-gradient", s);
}

module.exports = function () {
  var attrs, fgColor, bgColor, lnColor, hasDarkBg;
  attrs = Globals.DEFAULT_COLORS;
  fgColor = new Color(Globals.DEFAULT_COLORS["color"]);
  bgColor = new Color(Globals.DEFAULT_COLORS["background-color"]);
  lnColor = new Color(Globals.DEFAULT_COLORS["link-color"]);
  hasDarkBg = fgColor.luminosity() > bgColor.luminosity();
  var colorStyles = document.createElement("style");
  colorStyles.id = "colors";
  colorStyles.type = "text/css";
  document.head.appendChild(colorStyles); // var colorStyles = document.querySelector("link#folio");

  initRootStyles(colorStyles.sheet, ".app", attrs, fgColor, bgColor, lnColor, hasDarkBg);
  initCarouselStyles(colorStyles.sheet, ".carousel", attrs, fgColor, bgColor, lnColor, hasDarkBg); // - - - - - - - - - - - - - - - -
  // per-bundle rules
  // - - - - - - - - - - - - - - - -

  bundles.each(function (bundle) {
    attrs = bundle.attrs(); //get("attrs");

    fgColor = bundle.colors.fgColor;
    bgColor = bundle.colors.bgColor;
    lnColor = bundle.colors.lnColor;
    hasDarkBg = bundle.colors.hasDarkBg;
    initRootStyles(colorStyles.sheet, ".app." + bundle.get("domid"), attrs, fgColor, bgColor, lnColor, hasDarkBg);
    initCarouselStyles(colorStyles.sheet, ".carousel." + bundle.get("domid"), attrs, fgColor, bgColor, lnColor, hasDarkBg);
  });
};

}).call(this,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/model/collection/BundleCollection":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/collection/BundleCollection.js","color":"color","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/_loadImageAsObjectURL.js":[function(require,module,exports){
"use strict";

// /** @type {module:underscore.string/lpad} */
// var classify = require("underscore.string/classify");
// var statusMsg = _.template("<%= status %> received from <%= url %> (<%= statusText %>)");
// var errMsg = _.template("'<%= errName %>' ocurred during request <%= url %>");
if (window.XMLHttpRequest && window.URL && window.Blob) {
  module.exports = function (url, progressFn) {
    return new Promise(function (resolve, reject) {
      var request = new XMLHttpRequest();
      request.open("GET", url, true); // request.timeout = 10000; // in milliseconds

      request.responseType = "blob";

      var errorFromEvent = function errorFromEvent(ev) {
        var err = new Error((ev.target.status > 0 ? "http_" + request.statusText.replace(/\s/g, "_") : ev.type + "_event").toUpperCase());
        err.logMessage = "_loadImageAsObjectURL::" + ev.type + " [reject]";
        err.infoCode = ev.target.status;
        err.infoSrc = url;
        err.logEvent = ev;
        return err;
      }; // if progressFn is supplied
      // - - - - - - - - - - - - - - - - - -


      if (progressFn) {
        request.onprogress = function (ev) {
          progressFn(ev.loaded / ev.total, request);
        };
      } // resolved/success
      // - - - - - - - - - - - - - - - - - -


      request.onload = function (ev) {
        // When the request loads, check whether it was successful
        if (request.status == 200) {
          // If successful, resolve the promise by passing back a reference url
          resolve(URL.createObjectURL(request.response));
        } else {
          reject(errorFromEvent(ev));
        }
      }; // normal abort
      // - - - - - - - - - - - - - - - - - -


      request.onabort = function (ev) {
        resolve(void 0);
      }; // reject/failure
      // - - - - - - - - - - - - - - - - - -


      request.onerror = function (ev) {
        reject(errorFromEvent(ev));
      };

      request.ontimeout = request.onerror; // finally
      // - - - - - - - - - - - - - - - - - -

      request.onloadend = function (ev) {
        //console.log("_loadImageAsObjectURL::%s [cleanup] (%s)", ev ? ev.type : "no event", url);
        request.onabort = request.ontimeout = request.onerror = void 0;
        request.onload = request.onloadend = void 0;

        if (progressFn) {
          request.onprogress = void 0;
        }
      };

      request.send();
    });
  };
} else {
  module.exports = function (url, progressFn) {
    return Promise.resolve(url);
  };
}

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/_whenImageLoads.js":[function(require,module,exports){
"use strict";

module.exports = function (image, resolveEmpty) {
  return new Promise(function (resolve, reject) {
    if (!(image instanceof window.HTMLImageElement)) {
      //reject(new Error("not an HTMLImageElement"));
      reject("Error: not an HTMLImageElement");
    } else if (image.complete && (image.src.length > 0 || resolveEmpty)) {
      // if (image.src === "") console.warn("_whenImageLoads resolved with empty src");
      // else console.log("_whenImageLoads resolve-sync", image.src);
      resolve(image);
    } else {
      var handlers = {
        load: function load(ev) {
          // console.log("_whenImageLoads_dom resolve-async", ev.type, image.src);
          removeEventListeners();
          resolve(image);
        },
        error: function error(ev) {
          var err = new Error("Loading failed (" + ev.type + " event)");
          err.infoCode = -1;
          err.infoSrc = image.src;
          err.logEvent = ev;
          err.logMessage = "_whenImageLoads::" + ev.type + " [reject]";
          removeEventListeners();
          reject(err);
        }
      };
      handlers.abort = handlers.error;

      var removeEventListeners = function removeEventListeners() {
        for (var event in handlers) {
          if (handlers.hasOwnProperty(event)) {
            image.removeEventListener(event, handlers[event], false);
          }
        }
      };

      for (var event in handlers) {
        if (handlers.hasOwnProperty(event)) {
          image.addEventListener(event, handlers[event], false);
        }
      }
    }
  });
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenDefaultImageLoads.js":[function(require,module,exports){
(function (_){
"use strict";

/** @type {module:app/view/promise/_whenImageLoads} */
var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */


var _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL"); // var isBlobRE = /^blob\:.*/;
// var logMessage = "%s::whenDefaultImageLoads [%s]: %s";


module.exports = function (view) {
  return new Promise(function (resolve, reject) {
    var source = view.model.get("source");

    if (source.has("prefetched")) {
      view.defaultImage.src = source.get("prefetched");

      _whenImageLoads(view.defaultImage).then(function (targetEl) {
        resolve(view);
      });
    } else {
      view.mediaState = "pending";
      var sUrl = source.get("original");

      var progressFn = function progressFn(progress, ev) {
        // console.log(logMessage, view.cid, "progress", progress);
        view.updateMediaProgress(progress, sUrl);
      };

      progressFn = _.throttle(progressFn, 100, {
        leading: true,
        trailing: false
      });

      _loadImageAsObjectURL(sUrl, progressFn).then(function (url) {
        if (/^blob\:.*/.test(url)) {
          source.set("prefetched", url);
        }

        view.defaultImage.src = url;
        return view.defaultImage;
      }).then(_whenImageLoads).then(function (targetEl) {
        view.on("view:removed", function () {
          var prefetched = source.get("prefetched");

          if (prefetched && /^blob\:/.test(prefetched)) {
            source.unset("prefetched", {
              silent: true
            });
            URL.revokeObjectURL(prefetched);
          }
        });
        resolve(view);
      }, function (err) {
        reject(err);
      });
    }
  });
};

}).call(this,require("underscore"))

},{"app/view/promise/_loadImageAsObjectURL":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/_loadImageAsObjectURL.js","app/view/promise/_whenImageLoads":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/_whenImageLoads.js","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenScrollingEnds.js":[function(require,module,exports){
"use strict";

/* global Promise */

/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError");
/** @type {module:app/view/base/ViewError} */


var whenViewIsAttached = require("app/view/promise/whenViewIsAttached");

function whenScrollingEnds(view) {
  return new Promise(function (resolve, reject) {
    var parent = view.parentView;

    if (parent === null) {
      console.error("%s::whenScrollingEnds [%s] (sync)", view.cid, "rejected", view.attached);
      reject(new ViewError(view, new Error("whenScrollingEnds: view has no parent")));
    } else if (!parent.scrolling) {
      // console.log("%s::whenScrollingEnds [%s] (sync)", view.cid, "resolved", view.attached);
      resolve(view);
    } else {
      var cleanup = function cleanup() {
        parent.off("view:scrollend", onScrollend);
        parent.off("view:remove", onRemove);
      };

      var onScrollend = function onScrollend() {
        // console.log("%s::whenScrollingEnds [%s]", view.cid, "resolved", view.attached);
        cleanup();
        resolve(view);
      };

      var onRemove = function onRemove() {
        // console.log("%s::whenScrollingEnds [%s]", view.cid, "rejected", view.attached);
        cleanup();
        reject(new ViewError(view, new Error("whenScrollingEnds: view was removed")));
      };

      parent.on("view:scrollend", onScrollend);
      parent.on("view:remove", onRemove);
    }
  });
}

module.exports = function (view) {
  return Promise.resolve(view).then(whenViewIsAttached).then(whenScrollingEnds);
};
/*
module.exports = function(view) {
	return Promise.resolve(view)
		.then(function(view) {
			if (view.attached) {
				return view;
			} else {
				return new Promise(function(resolve, reject) {
					view.once("view:attached", function(view) {
						resolve(view);
					});
				});
			}
		})
		.then(function(view) {
			if (!view.parentView.scrolling) {
				return view;
			} else {
				return new Promise(function(resolve, reject) {
					var resolveOnScrollend = function() {
						// console.log("%s::whenScrollingEnds [%s]", view.cid, "resolved");
						view.off("view:remove", rejectOnRemove);
						resolve(view);
					};
					var rejectOnRemove = function(view) {
						// console.log("%s::whenScrollingEnds [%s]", view.cid, "rejected");
						view.parentView.off("view:scrollend", resolveOnScrollend);
						reject(new ViewError(view,
							new Error("whenSelectScrollingEnds: view was removed ("+ view.cid +")")));
					};
					view.parentView.once("view:scrollend", resolveOnScrollend);
					view.once("view:remove", rejectOnRemove);
				});
			}
		});
};
*/

},{"app/view/base/ViewError":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/ViewError.js","app/view/promise/whenViewIsAttached":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenViewIsAttached.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenSelectionDistanceIs.js":[function(require,module,exports){
"use strict";

/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError"); // var logMessage = "%s::whenSelectionDistanceIs [%s]: %s";

/**
 * @param {module:app/view/base/View}
 * @param {number} distance
 */


module.exports = function (view, distance) {
  return new Promise(function (resolve, reject) {
    // if (!(view.model && view.model.collection)) {
    // 	reject(new ViewError(view, new Error("whenSelectionIsContiguous: model.collection is empty")));
    // }
    var model = view.model;
    var collection = model.collection;

    var check = function check(n) {
      // Check indices for contiguity
      return Math.abs(collection.indexOf(model) - collection.selectedIndex) <= distance;
    };

    if (check()) {
      // console.log(logMessage, view.cid, "resolve", "sync");
      resolve(view);
    } else {
      var cleanupOnSettle = function cleanupOnSettle() {
        // console.log(logMessage, view.cid, "cleanup", "async");
        collection.off("select:one select:none", resolveOnSelect);
        view.off("view:removed", rejectOnRemove);
      };

      var resolveOnSelect = function resolveOnSelect(model) {
        if (check()) {
          // console.log(logMessage, view.cid, "resolve", "async");
          cleanupOnSettle();
          resolve(view);
        }
      };

      var rejectOnRemove = function rejectOnRemove(view) {
        cleanupOnSettle();
        reject(new ViewError(view, new Error("whenSelectionDistanceIs: view was removed")));
      };

      collection.on("select:one select:none", resolveOnSelect);
      view.on("view:removed", rejectOnRemove);
    }
  });
};

},{"app/view/base/ViewError":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/ViewError.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenSelectionIsContiguous.js":[function(require,module,exports){
"use strict";

// /** @type {module:app/view/base/ViewError} */
// var ViewError = require("app/view/base/ViewError");

/** @type {module:app/view/promise/whenSelectionDistanceIs} */
var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");
/** @param {module:app/view/base/View} */


module.exports = function (view) {
  return whenSelectionDistanceIs(view, 1);
};

},{"app/view/promise/whenSelectionDistanceIs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenSelectionDistanceIs.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenViewIsAttached.js":[function(require,module,exports){
"use strict";

module.exports = function (view) {
  return new Promise(function (resolve, reject) {
    if (view.attached) {
      resolve(view);
    } else {
      view.on("view:attached", function (view) {
        resolve(view);
      });
    }
  });
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenViewIsRendered.js":[function(require,module,exports){
"use strict";

module.exports = function (view) {
  return new Promise(function (resolve, reject) {
    if (!view.invalidated) {
      resolve(view);
    } else {
      view.once("view:render:after", function (view, flags) {
        resolve(view);
      });
    }
  });
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/CarouselRenderer.js":[function(require,module,exports){
(function (_){
"use strict";

/**
 * @module app/view/render/CarouselRenderer
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:underscore} */


var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles"); // FIXME: this fixup should not be done here
// /** @type {module:utils/net/toAbsoluteURL} */
// var toAbsoluteURL = require("utils/net/toAbsoluteURL");
// /** @type {string} */
// var ABS_APP_ROOT = toAbsoluteURL(require("app/control/Globals").APP_ROOT);

/**
 * @constructor
 * @type {module:app/view/render/CarouselRenderer}
 */


var CarouselRenderer = View.extend({
  /** @type {string} */
  cidPrefix: "carouselRenderer",

  /** @override */
  tagName: "div",

  /** @override */
  className: "carousel-item",

  /** @override */
  template: _.template("<div class=\"content sizing\"><%= name %></div>"),
  properties: {
    content: {
      get: function get() {
        return this._content || (this._content = this.el.querySelector(".content"));
      }
    },
    sizing: {
      get: function get() {
        return this._sizing || (this._sizing = this.el.querySelector(".sizing"));
      }
    }
  },

  /** @override */
  initialize: function initialize(options) {
    if (this.model.attr("@classname") !== void 0) {
      var clsAttr = this.model.attr("@classname").split(" ");

      for (var i = 0; i < clsAttr.length; i++) {
        this.el.classList.add(clsAttr[i]);
      }
    }

    options.parentView && (this.parentView = options.parentView);
    this.metrics = {};
    this.metrics.content = {};
    this.createChildren(); // this.enabled = !!options.enabled; // force bool

    this.setEnabled(!!options.enabled);
  },
  createChildren: function createChildren() {
    this.el.innerHTML = this.template(this.model.toJSON()); // FIXME: this fixup should not be done here
    // FIXED: now done in xslt

    /*this.el.querySelectorAll("a[href]").forEach(function(el) {
    	var url = toAbsoluteURL(el.getAttribute("href"));
    	if (url.indexOf(ABS_APP_ROOT) !== 0) {
    		el.setAttribute("target", "_blank");
    	}
    });*/
  },

  /** @return {HTMLElement} */
  getSizingEl: function getSizingEl() {
    return this._sizing || (this._sizing = this.el.querySelector(".sizing"));
  },

  /** @return {HTMLElement} */
  getContentEl: function getContentEl() {
    return this._content || (this._content = this.el.querySelector(".content"));
  },

  /** @return {this} */
  measure: function measure() {
    var sizing = this.getSizingEl();
    this.metrics = getBoxEdgeStyles(this.el, this.metrics);
    this.metrics.content = getBoxEdgeStyles(this.getContentEl(), this.metrics.content);
    sizing.style.maxWidth = "";
    sizing.style.maxHeight = "";
    this.metrics.content.x = sizing.offsetLeft + sizing.clientLeft;
    this.metrics.content.y = sizing.offsetTop + sizing.clientTop;
    this.metrics.content.width = sizing.clientWidth;
    this.metrics.content.height = sizing.clientHeight;
    return this;
  },

  /** @override */
  render: function render() {
    this.measure();
    return this;
  },
  getSelectionDistance: function getSelectionDistance() {
    return Math.abs(this.model.collection.indexOf(this.model) - this.model.collection.selectedIndex);
  }
});
module.exports = CarouselRenderer;

}).call(this,require("underscore"))

},{"app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","underscore":"underscore","utils/css/getBoxEdgeStyles":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/css/getBoxEdgeStyles.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ClickableRenderer.js":[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/ClickableRenderer
 */

/** @type {module:app/view/render/LabelRenderer} */
var LabelRenderer = require("app/view/render/LabelRenderer");
/**
 * @constructor
 * @type {module:app/view/render/ClickableRenderer}
 */


var ClickableRenderer = LabelRenderer.extend({
  /** @type {string} */
  cidPrefix: "clickableRenderer",
  // defaults: {
  // 	target: ".label"
  // },

  /** @override */
  events: {
    "click .label": function clickLabel(ev) {
      if (ev.defaultPrevented) return;
      ev.preventDefault();
      this.trigger("renderer:click", this.model, ev);
    },
    "click a": function clickA(ev) {
      ev.defaultPrevented || ev.preventDefault();
    }
  } // initialize: function(options) {
  // 	options || (options = {});
  // 	// if (options) {
  // 	options = _.defaults({}, options, _.result(this, 'defaults'));
  // 	// } else {
  // 	// 	 _.defaults({}, _.result(this, 'defaults'));
  // 	// }
  // 	this.events["click " + options.target] = this.clickHandler;
  // },
  //
  // clickHandler: function(ev) {
  // 	if (ev.defaultPrevented) return;
  //
  // 	ev.preventDefault();
  // 	this.trigger("renderer:click", this.model, ev);
  // }

});
module.exports = ClickableRenderer;

},{"app/view/render/LabelRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/LabelRenderer.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/DefaultSelectableRenderer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function";

  return "<a href=\"#"
    + container.escapeExpression(((helper = (helper = helpers.domid || (depth0 != null ? depth0.domid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domid","hash":{},"data":data}) : helper)))
    + "\"><span class=\"label\">"
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</span></a>";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/DefaultSelectableRenderer.js":[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/DefaultSelectableRenderer
 */

/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("app/view/render/ClickableRenderer");
/**
 * @constructor
 * @type {module:app/view/render/DefaultSelectableRenderer}
 */


var DefaultSelectableRenderer = ClickableRenderer.extend({
  /** @override */
  tagName: "li",

  /** @override */
  className: "list-item",

  /** @override */
  template: require("./DefaultSelectableRenderer.hbs"),
  initialize: function initialize(options) {
    this.listenTo(this.model, "selected deselected", this._renderClassList);

    this._renderClassList();
  },

  /** @override */
  render: function render() {
    this.el.innerHTML = this.template(this.model.toJSON());

    this._renderClassList();

    return this;
  },
  _renderClassList: function _renderClassList() {
    this.el.classList.toggle("selected", this.model.selected);
  }
});
module.exports = DefaultSelectableRenderer;

},{"./DefaultSelectableRenderer.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/DefaultSelectableRenderer.hbs","app/view/render/ClickableRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ClickableRenderer.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/DotNavigationRenderer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<span class=\"label\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span><a href=\"#"
    + alias4(((helper = (helper = helpers.domid || (depth0 != null ? depth0.domid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"domid","hash":{},"data":data}) : helper)))
    + "\"><b> </b></a>";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/DotNavigationRenderer.js":[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/DotNavigationRenderer
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View"); // /** @type {module:app/view/component/ClickableRenderer} */
// var ClickableRenderer = require("app/view/render/LabelRenderer");

/** @type {string} */


var viewTemplate = require("./DotNavigationRenderer.hbs");
/**
 * @constructor
 * @type {module:app/view/render/DotNavigationRenderer}
 */


var DotNavigationRenderer = View.extend({
  /** @type {string} */
  cidPrefix: "dotRenderer",

  /** @override */
  tagName: "li",

  /** @override */
  className: "list-item",

  /** @override */
  template: viewTemplate,

  /** @override */
  events: {
    "click": function click(ev) {
      if (ev.defaultPrevented) return;
      ev.preventDefault();
      this.trigger("renderer:click", this.model, ev);
    },
    "click a": function clickA(ev) {
      ev.defaultPrevented || ev.preventDefault();
    }
  },

  /** @override */
  initialize: function initialize(options) {
    this.listenTo(this.model, "selected deselected", this.renderClassList);
    this.renderClassList();
  },

  /** @override */
  render: function render() {
    this.el.innerHTML = this.template(this.model.toJSON());
    this.renderClassList();
    return this;
  },
  renderClassList: function renderClassList() {
    this.el.classList.toggle("selected", this.model.selected);
  }
});
module.exports = DotNavigationRenderer;

},{"./DotNavigationRenderer.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/DotNavigationRenderer.hbs","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ImageRenderer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"placeholder sizing\"></div>\n<img class=\"content media-border default\" alt=\""
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "\" longdesc=\"#desc_m"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" />\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ImageRenderer.js":[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("./MediaRenderer");
/** @type {Function} */


var viewTemplate = require("./ImageRenderer.hbs");
/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */


var ImageRenderer = MediaRenderer.extend({
  /** @type {string} */
  cidPrefix: "imageRenderer",

  /** @type {string} */
  className: MediaRenderer.prototype.className + " image-item",

  /** @type {Function} */
  template: viewTemplate,

  /** @override */
  initialize: function initialize(opts) {
    MediaRenderer.prototype.initialize.apply(this, arguments); // this.createChildren();
    // this.initializeAsync();
  },

  /* --------------------------- *
  /* children/layout
  /* --------------------------- */

  /** @override */
  createChildren: function createChildren() {
    MediaRenderer.prototype.createChildren.apply(this, arguments); // this.el.innerHTML = this.template(this.model.toJSON());

    this.placeholder = this.el.querySelector(".placeholder");
  },

  /** @override */
  render: function render() {
    MediaRenderer.prototype.render.apply(this, arguments); // this.measure();

    var img = this.getDefaultImage();

    if (this.metrics.media.width) {
      img.setAttribute("width", this.metrics.media.width);
    }

    if (this.metrics.media.height) {
      img.setAttribute("height", this.metrics.media.height);
    }

    var content = this.getContentEl();
    content.style.left = this.metrics.content.x + "px";
    content.style.top = this.metrics.content.y + "px"; // var sizing = this.getSizingEl();
    // sizing.style.maxWidth = this.metrics.content.width + "px";
    // sizing.style.maxHeight = this.metrics.content.height + "px";

    return this;
  },

  /* --------------------------- *
  /* initializeAsync
  /* --------------------------- */
  initializeAsync: function initializeAsync() {
    return MediaRenderer.prototype.initializeAsync.apply(this, arguments) // return MediaRenderer.whenSelectionIsContiguous(this)
    // // return Promise.resolve(this)
    // // 	.then(MediaRenderer.whenSelectionIsContiguous)
    // 	.then(MediaRenderer.whenSelectTransitionEnds)
    // 	.then(MediaRenderer.whenDefaultImageLoads)
    // .then(
    // 	function(view) {
    // 		view.mediaState = "ready";
    // 	})
    // .catch(
    // 	function(err) {
    // 		if (err instanceof ViewError) {
    // 			// NOTE: ignore ViewError type
    // 			// console.log(err.view.cid, err.view.model.cid, "ImageRenderer: " + err.message);
    // 		} else {
    // 			console.error(this.cid, err.name, err);
    // 			this.placeholder.innerHTML = "<p class=\"color-fg\" style=\"position:absolute;bottom:0;padding:3rem;\"><strong>" + err.name + "</strong> " + err.message + "</p>";
    // 			this.mediaState = "error";
    // 		}
    // 	}.bind(this))
    ;
  }
});
module.exports = ImageRenderer;

},{"./ImageRenderer.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/ImageRenderer.hbs","./MediaRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/MediaRenderer.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/LabelRenderer.js":[function(require,module,exports){
"use strict";

/**
 * @module app/view/render/LabelRenderer
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/**
 * @constructor
 * @type {module:app/view/render/LabelRenderer}
 */


var LabelRenderer = View.extend({
  /** @type {string} */
  cidPrefix: "labelRenderer",
  properties: {
    label: {
      get: function get() {
        return this._label || (this._label = this.el.querySelector(".label"));
      } // measuredWidth: {
      // 	get: function() {
      // 		return this._measuredWidth;
      // 	}
      // },
      // measuredHeight: {
      // 	get: function() {
      // 		return this._measuredHeight;
      // 	}
      // },

    }
  }
  /* -------------------------------
  /* measure
  /* ------------------------------- */
  // _measuredWidth: null,
  // _measuredHeight: null,
  // measure: function() {},

});
module.exports = LabelRenderer;

},{"app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/MediaRenderer.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/*global XMLHttpRequest, HTMLMediaElement, MediaError*/

/**
 * @module app/view/render/MediaRenderer
 */
// /** @type {module:underscore.strings/lpad} */
// const lpad = require("underscore.string/lpad");

/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("app/model/item/MediaItem");
/** @type {module:app/view/CarouselRenderer} */


var CarouselRenderer = require("app/view/render/CarouselRenderer"); // var errorTemplate = require("../template/ErrorBlock.hbs");
// /** @type {module:utils/css/getBoxEdgeStyles} */
// var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");


var MediaRenderer = CarouselRenderer.extend({
  /** @type {string} */
  cidPrefix: "mediaRenderer",

  /** @type {string} */
  className: CarouselRenderer.prototype.className + " media-item",

  /** @type {module:app/model/MediaItem} */
  model: MediaItem,
  properties: {
    defaultImage: {
      get: function get() {
        return this._defaultImage || (this._defaultImage = this.el.querySelector("img.default"));
      }
    },
    mediaState: {
      get: function get() {
        return this._mediaState;
      },
      set: function set(state) {
        this._setMediaState(state);
      }
    }
  },

  /** @override */
  initialize: function initialize(opts) {
    // if (this.model.attrs().hasOwnProperty("@classname")) {
    // 	this.el.className += " " + this.model.attr("@classname");
    // }
    // NOTE: @classname attr handling moved to CarouselRenderer
    // if (this.model.attr("@classname") !== void 0) {
    // 	var clsAttr = this.model.attr("@classname").split(" ");
    // 	for (var i = 0; i < clsAttr.length; i++) {
    // 		this.el.classList.add(clsAttr[i]);
    // 	}
    // }
    CarouselRenderer.prototype.initialize.apply(this, arguments);
    this.metrics.media = {};
    this.mediaState = "idle";
    this.initializeAsync().then(this.whenInitialized).catch(this.whenInitializeError.bind(this));
  },
  initializeAsync: function initializeAsync() {
    // var MediaRenderer = Object.getPrototypeOf(this).constructor;
    return Promise.resolve(this).then(MediaRenderer.whenSelectionIsContiguous).then(MediaRenderer.whenScrollingEnds).then(MediaRenderer.whenDefaultImageLoads);
  },
  whenInitialized: function whenInitialized(view) {
    // console.log("%s::whenInitialized [%s]", view.cid, "resolved");
    view.mediaState = "ready";
    view.placeholder.removeAttribute("data-progress");
    return view;
  },
  whenInitializeError: function whenInitializeError(err) {
    if (err instanceof CarouselRenderer.ViewError) {
      // NOTE: ignore ViewError type
      return;
    } else if (err instanceof Error) {
      console.error(err.stack);
    }

    this.placeholder.removeAttribute("data-progress");
    this.mediaState = "error";
  },
  updateMediaProgress: function updateMediaProgress(progress, id) {
    if (_.isNumber(progress)) {
      this.placeholder.setAttribute("data-progress", String(Math.floor(progress * 100)).padStart(2, '0'));
    } // else if (progress === "complete") {
    // 	this.placeholder.removeAttribute("data-progress");
    // }

  },
  // whenMediaIsReady: function(view) {
  // 	return MediaRenderer.whenDefaultImageLoads(this, this.updateMediaProgress.bind(this));
  // },

  /* --------------------------- *
  /* child getters
  /* --------------------------- */

  /** @return {HTMLElement} */
  getDefaultImage: function getDefaultImage() {
    return this.defaultImage;
  },

  /* --------------------------- *
  /* children/layout
  /* --------------------------- */
  createChildren: function createChildren() {
    this.el.innerHTML = this.template(this.model.toJSON());
  },

  /** @override */
  measure: function measure() {
    CarouselRenderer.prototype.measure.apply(this, arguments);
    var sw, sh; // source dimensions

    var pcw, pch; // measured values

    var cx, cy, cw, ch, cs; // computed values

    var ew, eh; // content edge totals

    var cm; // content metrics

    cm = this.metrics.content;
    cx = cm.x;
    cy = cm.y;
    pcw = cm.width;
    pch = cm.height;
    ew = cm.paddingLeft + cm.paddingRight + cm.borderLeftWidth + cm.borderRightWidth;
    eh = cm.paddingTop + cm.paddingBottom + cm.borderTopWidth + cm.borderBottomWidth;
    pcw -= ew;
    pch -= eh;
    sw = this.model.get("source").get("w"); // || this.defaultImage.naturalWidth || pcw;

    sh = this.model.get("source").get("h"); // || this.defaultImage.naturalHeight || pch;
    // if (!(sw && sh)) {
    // 	sw = pcw;
    // 	sh = pch;
    // }
    // Unless both client dimensions are larger than the source's
    // choose constraint direction by aspect ratio

    if (sw < pcw && sh < pch) {
      cs = 1;
      cw = sw;
      ch = sh;
      this.metrics.fitDirection = "both";
    } else if (pcw / pch < sw / sh) {
      // fit width
      cw = pcw;
      cs = cw / sw; // ch = cs * sh;

      ch = Math.round(cs * sh);
      this.metrics.fitDirection = "width";
    } else {
      // fit height
      ch = pch;
      cs = ch / sh; // cw = cs * sw;

      cw = Math.round(cs * sw);
      this.metrics.fitDirection = "height";
    }

    this.metrics.content.x = cx;
    this.metrics.content.y = cy;
    this.metrics.content.width = cw + ew;
    this.metrics.content.height = ch + eh;
    this.metrics.media.x = cx + cm.paddingLeft + cm.borderLeftWidth;
    this.metrics.media.y = cy + cm.paddingTop + cm.borderTopWidth;
    this.metrics.media.width = cw;
    this.metrics.media.height = ch;
    this.metrics.media.scale = cs; // console.log("%s::measure mw:%s mh:%s fit: %s metrics: %o", this.cid, pcw, pch, this.metrics.fitDirection, this.metrics);
    // var sizing = this.getSizingEl();
    // sizing.style.maxWidth = (cw + ew) + "px";
    // sizing.style.maxHeight = (ch + eh) + "px";

    return this;
  },
  render: function render() {
    // NOTE: not calling super.render, calling measure ourselves
    this.measure();
    var sizing = this.getSizingEl();
    sizing.style.maxWidth = this.metrics.content.width + "px";
    sizing.style.maxHeight = this.metrics.content.height + "px";
    this.el.setAttribute("data-fit-dir", this.metrics.fitDirection);
    return this;
  },

  /* --------------------------- *
  /* mediaState
  /* --------------------------- */
  _mediaStateEnum: ["idle", "pending", "ready", "error"],
  _setMediaState: function _setMediaState(key) {
    if (this._mediaStateEnum.indexOf(key) === -1) {
      throw new Error("Argument " + key + " invalid. Must be one of: " + this._mediaStateEnum.join(", "));
    }

    if (this._mediaState !== key) {
      if (this._mediaState) {
        this.el.classList.remove(this._mediaState);
      }

      this.el.classList.add(key);
      this._mediaState = key;
      this.trigger("media:" + key);
    }
  }
}, {
  LOG_TO_SCREEN: true,

  /** @type {module:app/view/promise/whenSelectionDistanceIs} */
  whenSelectionDistanceIs: require("app/view/promise/whenSelectionDistanceIs"),

  /** @type {module:app/view/promise/whenSelectionIsContiguous} */
  whenSelectionIsContiguous: require("app/view/promise/whenSelectionIsContiguous"),
  // /** @type {module:app/view/promise/whenSelectTransitionEnds} */
  // whenSelectTransitionEnds: require("app/view/promise/whenSelectTransitionEnds"),

  /** @type {module:app/view/promise/whenScrollingEnds} */
  whenScrollingEnds: require("app/view/promise/whenScrollingEnds"),

  /** @type {module:app/view/promise/whenDefaultImageLoads} */
  whenDefaultImageLoads: require("app/view/promise/whenDefaultImageLoads")
});
/* ---------------------------
/* log to screen
/* --------------------------- */

if (DEBUG) {
  MediaRenderer = function (MediaRenderer) {
    if (!MediaRenderer.LOG_TO_SCREEN) return MediaRenderer;
    /** @type {Function} */

    var Color = require("color");

    return MediaRenderer.extend({
      /** @override */
      initialize: function initialize() {
        var fgColor = new Color(this.model.attr("color"));
        var bgColor = new Color(this.model.attr("background-color"));
        this.__logColors = {
          normal: Color(fgColor).mix(bgColor, 0.75).hsl().string(),
          ignored: Color(fgColor).mix(bgColor, 0.25).hsl().string(),
          error: "brown",
          abort: "orange"
        };
        this.__logFrameStyle = "1px dashed " + Color(fgColor).mix(bgColor, 0.5).hsl().string();
        this.__logStartTime = Date.now();
        this.__rafId = -1;
        this.__onFrame = this.__onFrame.bind(this);
        MediaRenderer.prototype.initialize.apply(this, arguments);
      },
      initializeAsync: function initializeAsync() {
        return MediaRenderer.prototype.initializeAsync.apply(this, arguments).catch(function (err) {
          if (!(err instanceof MediaRenderer.ViewError)) {
            this.__logMessage(err.message, err.name, this.__logColors["error"]);
          }

          return Promise.reject(err);
        }.bind(this));
      },

      /** @override */
      createChildren: function createChildren() {
        var ret = MediaRenderer.prototype.createChildren.apply(this, arguments);
        this.__logElement = document.createElement("div");
        this.__logElement.className = "debug-log"; // this.__logElement.style.touchAction = "pan-y";

        this.__logHeaderEl = document.createElement("pre");
        this.__logHeaderEl.className = "log-header color-bg"; // Color(this.model.colors.fgColor).mix(fgColor, 0.9).rgb().string()
        // Color(this.model.colors.fgColor).alpha

        this.__logHeaderEl.textContent = this.__getHeaderText();

        this.__logElement.appendChild(this.__logHeaderEl);

        this.el.insertBefore(this.__logElement, this.el.firstElementChild);
        return ret;
      },

      /** @override */
      render: function render() {
        var ret = MediaRenderer.prototype.render.apply(this, arguments);
        this.__logElement.style.top = this.metrics.content.height + this.metrics.content.y + "px";
        this.__logElement.style.left = this.metrics.content.x + "px";
        this.__logElement.style.width = this.metrics.content.width + "px";
        this.__logElement.scrollTop = this.__logElement.scrollHeight;
        return ret;
      },
      whenInitializeError: function whenInitializeError(err) {
        // NOTE: not calling super
        // MediaRenderer.prototype.whenInitializeError.apply(this, arguments);
        if (err instanceof CarouselRenderer.ViewError) {
          // NOTE: ignore ViewError type
          // console.warn("%s::whenInitializeError ", err.view.cid, err.message);
          return;
        } else if (err instanceof Error) {
          console.warn(err.stack);
        } // this.placeholder.innerHTML = err ? errorTemplate(err) : "";


        this.placeholder.removeAttribute("data-progress");
        this.mediaState = "error"; // console.error("%s::initializeAsync [%s (caught)]: %s", this.cid, err.name, (err.info && err.info.logMessage) || err.message);
        // err.logEvent && console.log(err.logEvent);
      },

      /* --------------------------- *
      /* log methods
      /* --------------------------- */
      __logMessage: function __logMessage(msg, logtype, color) {
        var logEntryEl = document.createElement("pre");
        logtype || (logtype = "-");
        logEntryEl.textContent = this.__getTStamp() + " " + msg;
        logEntryEl.setAttribute("data-logtype", logtype);
        logEntryEl.style.color = color || this.__logColors[logtype] || this.__logColors.normal;

        this.__logElement.appendChild(logEntryEl);

        this.__logElement.scrollTop = this.__logElement.scrollHeight;

        if (this.__rafId == -1) {
          this.__rafId = this.requestAnimationFrame(this.__onFrame);
        }
      },
      __onFrame: function __onFrame(tstamp) {
        this.__rafId = -1;
        this.__logElement.lastElementChild.style.borderBottom = this.__logFrameStyle;
        this.__logElement.lastElementChild.style.paddingBottom = "2px";
        this.__logElement.lastElementChild.style.marginBottom = "2px";
      },
      __getTStamp: function __getTStamp() {
        // return new Date(Date.now() - this.__logStartTime).toISOString().substr(11, 12);
        return String(((Date.now() - this.__logStartTime) / 1000).toFixed(3)).padStart(8, "0");
      },
      __getHeaderText: function __getHeaderText() {
        return '';
      }
    });
  }(MediaRenderer);
} // end debug

/**
 * @constructor
 * @type {module:app/view/render/MediaRenderer}
 */


module.exports = MediaRenderer;

}).call(this,true,require("underscore"))

},{"app/model/item/MediaItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/model/item/MediaItem.js","app/view/promise/whenDefaultImageLoads":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenDefaultImageLoads.js","app/view/promise/whenScrollingEnds":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenScrollingEnds.js","app/view/promise/whenSelectionDistanceIs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenSelectionDistanceIs.js","app/view/promise/whenSelectionIsContiguous":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/whenSelectionIsContiguous.js","app/view/render/CarouselRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/CarouselRenderer.js","color":"color","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/PlayableRenderer.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/render/PlayableRenderer
 */

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("app/view/render/MediaRenderer"); // /** @type {module:app/view/component/CanvasProgressMeter} */
// var ProgressMeter = require("app/view/component/CanvasProgressMeter");

/** @type {Function} */


var prefixedProperty = require("utils/prefixedProperty");
/** @type {Function} */


var prefixedEvent = require("utils/prefixedEvent"); // var visibilityHiddenProp = prefixedProperty("hidden", document);

/** @type {String} */


var visibilityStateProp = prefixedProperty("visibilityState", document);
/** @type {String} */

var visibilityChangeEvent = prefixedEvent("visibilitychange", document, "hidden"); // /** @type {Function} */
// var Color = require("color");
//
// /** @type {Function} */
// // var duotone = require("utils/canvas/bitmap/duotone");
// // var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// // var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");
// var getAverageRGB = require("utils/canvas/bitmap/getAverageRGB");
// // var inflateRect = require("utils/geom/inflateRect");
//
// var WAIT_DEBOUNCE_MS = require("app/control/Globals").TRANSITION_DURATION;
// /** @type {HTMLCanvasElement} */
// var _sharedCanvas = null;
// /** @return {HTMLCanvasElement} */
// var getSharedCanvas = function() {
// 	if (_sharedCanvas === null) {
// 		_sharedCanvas = document.createElement("canvas");
// 	}
// 	return _sharedCanvas;
// };
// var SVG_NS = "http://www.w3.org/2000/svg";
// var XLINK_NS = "http://www.w3.org/1999/xlink";
//
// var useIdSeed = 0
// var createSVGUseElement = function() {
// 	var svgEl = document.createElementNS(SVG_NS, "use");
// 	svgEl.setAttributeNS(null, "id", name + (useIdSeed++));
// 	svgEl.setAttributeNS(null, "class", [name, "symbol"].join(" "));
// 	svgEl.setAttributeNS(XLINK_NS, "xlink:href", "#" + name);
// 	return svgEl;
// };
// function logAttachInfo(view, name, level) {
// 	if (["log", "info", "warn", "error"].indexOf(level) != -1) {
// 		level = "log";
// 	}
// 	console[level].call(console, "%s::%s [parent:%s %s %s depth:%s]", view.cid, name, view.parentView && view.parentView.cid, view.attached ? "attached" : "detached", view._viewPhase, view.viewDepth);
// }

/**
 * @constructor
 * @type {module:app/view/render/PlayableRenderer}
 */

var PlayableRenderer = MediaRenderer.extend({
  /** @type {string} */
  cidPrefix: "playableRenderer",

  /** @type {string|Function} */
  className: MediaRenderer.prototype.className + " playable-item",
  properties: {
    mediaPaused: {
      /** @return {Boolean} */
      get: function get() {
        return this._isMediaPaused();
      }
    },
    mediaWaiting: {
      /** @return {Boolean} */
      get: function get() {
        return this._isMediaWaiting();
      }
    },
    playbackRequested: {
      /** @return {Boolean} */
      get: function get() {
        return this._playbackRequested;
      },
      set: function set(value) {
        this._setPlaybackRequested(value);
      }
    },
    overlay: {
      /** @return {HTMLElement} */
      get: function get() {
        return this._overlay || (this._overlay = this.el.querySelector(".overlay"));
      }
    },
    // playToggle: {
    // 	/** @return {HTMLElement} */
    // 	get: function() {
    // 		return this._playToggle || (this._playToggle = this.el.querySelector(".play-toggle"));
    // 	}
    // },
    // playToggleSymbol: {
    // 	/** @return {HTMLElement} */
    // 	get: function() {
    // 		return this._playToggleSymbol || (this._playToggleSymbol = this.el.querySelector(".play-toggle-symbol"));
    // 	}
    // },
    playToggleHitarea: {
      /** @return {HTMLElement} */
      get: function get() {
        return this._playToggleHitarea || (this._playToggleHitarea = this.el.querySelector(".play-toggle-hitarea"));
      }
    }
  },

  /** @override */
  initialize: function initialize(opts) {
    this._playToggleSymbol = {}; // this._toggleWaiting = _.debounce(this._toggleWaiting, 500);
    // this._toggleWaiting = _.throttle(this._toggleWaiting, WAIT_DEBOUNCE_MS, { leading: true, trailing: true });

    _.bindAll(this, "_onPlaybackToggle", "_onVisibilityChange");

    MediaRenderer.prototype.initialize.apply(this, arguments);

    this._setPlaybackRequested(this._playbackRequested); // this.listenTo(this, "view:parentChange", function(childView, newParent, oldParent) {
    // 	// logAttachInfo(this, "[view:parentChange]", "info");
    // 	console.info("%s::[view:parentChange] '%s' to '%s'", this.cid, oldParent && oldParent.cid, newParent && newParent.cid);
    // });

  },
  // /** @override */
  // initializeAsync: function() {
  // 	return MediaRenderer.prototype.initialize.initializeAsync.apply(this, arguments);
  // },
  // /** @override */
  // remove: function() {
  // 	MediaRenderer.prototype.remove.apply(this, arguments);
  // 	return this;
  // },

  /* --------------------------- *
  /* children/layout
  /* --------------------------- */
  // createChildren: function() {
  // },

  /* --------------------------- *
  /* setEnabled
  /* --------------------------- */

  /** @override */
  setEnabled: function setEnabled(enabled) {
    MediaRenderer.prototype.setEnabled.apply(this, arguments); // this._validatePlayback(enabled);
    // if (enabled) {

    this._validatePlayback(); // } else {
    // 	// if selected, pause media
    // 	this.model.selected && this._togglePlayback(false);
    // 	// this._togglePlayback(false);
    // }
    // console.log("%s::setEnabled", this.cid, this.enabled);
    // this._playToggleSymbol.paused = (this.enabled && this.model.selected);
    //}

  },

  /* ---------------------------
  /* selection handlers
  /* --------------------------- */
  listenToSelection: function listenToSelection() {
    if (this._viewPhase != "initialized") throw new Error(this.cid + "::listenToSelection called while " + this._viewPhase); // logAttachInfo(this, "listenToSelection", "log");
    // this.listenTo(this, "view:removed", this.removeSelectionListeners);

    this.listenTo(this.model, "selected", this._onModelSelected);
    this.listenTo(this.model, "deselected", this._onModelDeselected);

    if (this.model.selected) {
      this._onModelSelected();
    }
  },

  /* model selected handlers:
  /* model selection toggles playback
  /* --------------------------- */
  _onModelSelected: function _onModelSelected() {
    console.log("%s::_onModelSelected _playbackRequested: %s, event: %s", this.cid, this._playbackRequested, this._toggleEvent);
    this.listenTo(this, "view:parentChange", this._onParentChange);
    if (this.parentView) this._onParentChange(this, this.parentView, null); // this.enabled = true;

    this._playToggleSymbol.paused = !this.enabled;

    this._listenWhileSelected();

    this._validatePlayback();
  },
  _onModelDeselected: function _onModelDeselected() {
    console.log("%s::_onModelDeselected _playbackRequested: %s, event: %s", this.cid, this._playbackRequested, this._toggleEvent);
    this.stopListening(this, "view:parentChange", this._onParentChange);
    if (this.parentView) this._onParentChange(this, null, this.parentView);
    this._playToggleSymbol.paused = true;

    this._stopListeningWhileSelected();

    this._validatePlayback(false); // this._togglePlayback(false);

  },

  /* view:parentChange handlers 3
  /* --------------------------- */
  _onParentChange: function _onParentChange(childView, newParent, oldParent) {
    // console.log("[scroll] %s::_onParentChange '%s' to '%s'", this.cid, oldParent && oldParent.cid, newParent && newParent.cid);
    if (oldParent) this.stopListening(oldParent, "view:scrollstart view:scrollend", this._onScrollChange);
    if (newParent) this.listenTo(newParent, "view:scrollstart view:scrollend", this._onScrollChange);
  },
  _onScrollChange: function _onScrollChange() {
    if (this.parentView === null) {
      throw new Error(this.cid + "::_onScrollChange parentView is null");
    }

    this._validatePlayback();
  },

  /* visibility dom event
  /* --------------------------- */
  _onVisibilityChange: function _onVisibilityChange(ev) {
    this._validatePlayback();
  },

  /* listen to DOM events
   * --------------------------- */
  _listenWhileSelected: function _listenWhileSelected() {
    this.listenTo(this, "view:removed", this._stopListeningWhileSelected);
    document.addEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
    this.playToggleHitarea.addEventListener(this._toggleEvent, this._onPlaybackToggle, false);
  },
  _stopListeningWhileSelected: function _stopListeningWhileSelected() {
    this.stopListening(this, "view:removed", this._stopListeningWhileSelected);
    document.removeEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
    this.playToggleHitarea.removeEventListener(this._toggleEvent, this._onPlaybackToggle, false);
  },

  /* --------------------------- *
  /* play-toggle
  /* --------------------------- */

  /** @type {String} */
  _toggleEvent: MediaRenderer.CLICK_EVENT,
  //window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",
  _onPlaybackToggle: function _onPlaybackToggle(ev) {
    //console.log("%s[%sabled]::_onPlaybackToggle[%s] defaultPrevented: %s", this.cid, this.enabled ? "en" : "dis", ev.type, ev.defaultPrevented);
    // NOTE: Perform action if MouseEvent.button is 0 or undefined (0: left-button)
    if (this.enabled && !ev.defaultPrevented && !ev.button) {
      ev.preventDefault();
      this.playbackRequested = !this.playbackRequested;
    }
  },

  /* --------------------------- *
  /* playbackRequested
  /* --------------------------- */
  _playbackCount: 0,

  /** @type {Boolean?} */
  _playbackRequested: null,
  _setPlaybackRequested: function _setPlaybackRequested(value) {
    this._playbackRequested = value;
    var classList = this.content.classList;
    classList.toggle("playing", value === true);
    classList.toggle("paused", value === false);
    classList.toggle("requested", value === true || value === false);

    this._renderPlaybackState(); // this._validatePlayback(this.playbackRequested);
    // if (this.playbackRequested) {


    this._validatePlayback(); // } else {
    // 	this._togglePlayback(false);
    // }

  },

  /* --------------------------- *
  /* _togglePlayback
  /* --------------------------- */

  /** @param {Boolean} */
  _togglePlayback: function _togglePlayback(newPlayState) {
    if (DEBUG) this.__logMessage(["args:", Array.prototype.join.apply(arguments), "paused:", this._isMediaPaused() ? "pause" : "play", "media-state:", this.mediaState].join(" "), "toggle-playback");

    if (_.isBoolean(newPlayState) && newPlayState !== this._isMediaPaused()) {
      return; // requested state is current, do nothing
    } else {
      newPlayState = this._isMediaPaused();
    }

    if (newPlayState) {
      // changing to what?
      // this._playbackCount++;
      this._playMedia();
    } else {
      this._pauseMedia();
    }
    /* NOTE: called from _setPlaybackRequested */
    // this._renderPlaybackState();

  },
  _canResumePlayback: function _canResumePlayback() {
    return !!(this.enabled && this.model.selected && this.playbackRequested && this.mediaState === "ready" && this.attached && this.parentView !== null && !this.parentView.scrolling && document[visibilityStateProp] != "hidden");
  },
  _validatePlayback: function _validatePlayback(shortcircuit) {
    // a 'shortcircuit' boolean argument can be passed, and if false,
    // skip _canResumePlayback and pause playback right away
    if (arguments.length !== 0 && !shortcircuit) {
      this._togglePlayback(false);
    } else {
      this._togglePlayback(this._canResumePlayback());
    }

    this._playToggleSymbol.paused = !(this.attached && this.enabled && this.model.selected);
  },

  /* ---------------------------
  /* _setPlayToggleSymbol
  /* --------------------------- */
  _renderPlaybackState: function _renderPlaybackState() {
    if (!this.attached) {
      return;
    }

    if (this.progressMeter) {
      this.progressMeter.stalled = this._isMediaWaiting();
    } // this._setPlayToggleSymbol("waiting");
    // this.content.classList.toggle("waiting", true);
    // if (!this.content.classList.contains("started")) {
    // 	this._setPlayToggleSymbol("play");
    // } else


    var waiting = !this.parentView.scrolling && this._isMediaWaiting();

    if (this.playbackRequested) {
      if (waiting) {
        this._setPlayToggleSymbol("waiting");
      } else {
        this._setPlayToggleSymbol("play");
      }
    } else {
      if (this.content.classList.contains("started")) {
        this._setPlayToggleSymbol("pause");
      } else {
        this._setPlayToggleSymbol("play");
      }
    }

    var cls = this.content.classList;
    cls.toggle("playing", this.playbackRequested);
    cls.toggle("paused", !this.playbackRequested);
    cls.toggle("waiting", waiting); //console.log("%s::_renderPlaybackState [play: %s] [wait: %s] [symbol: %s]", this.cid, this.playbackRequested, this._isMediaWaiting(), this._playToggleSymbol.symbolName);
  },
  _setPlayToggleSymbol: function _setPlayToggleSymbol(symbolName) {
    //console.log("%s::_setPlayToggleSymbol [enabled: %s] [selected: %s] [symbol: %s]", this.cid, this.enabled, !!(this.model.selected), symbolName);
    // this._playToggleSymbol.paused = !(this.attached && this.enabled && !!(this.model.selected));
    this._playToggleSymbol.symbolName = symbolName;

    if (this.mediaState === "ready") {
      //this._playToggleSymbol.renderFlags) {
      this._playToggleSymbol.renderNow();
    }
  },
  // _playToggleSymbolSvg: null,
  // _playToggleSymbolName: null,
  // _setPlayToggleSymbol_svg: function(symbolName) {
  // 	if (this._playToggleSymbolName !== symbolName) {
  // 		var svgDoc = this.el.querySelector("svg.play-toggle-symbol");
  // 		if (this._playToggleSymbolSvg) {
  // 			svgDoc.removeChild(this._playToggleSymbolSvg);
  // 		}
  // 		var svgSym = document.createElementNS("http://www.w3.org/2000/svg", "use");
  // 		svgSym.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + symbolName);
  // 		svgDoc.appendChild(svgSym);
  // 		svgDoc.setAttributeNS(null, "class", symbolName + "-symbol play-toggle-symbol");
  //
  // 		this._playToggleSymbolSvg = svgSym;
  // 		this._playToggleSymbolName = symbolName;
  // 	}
  // },

  /* --------------------------- *
  /* waiting
  /* --------------------------- */
  _isWaiting: false,
  _isMediaWaiting: function _isMediaWaiting() {
    return this._isWaiting;
  },
  _toggleWaiting: function _toggleWaiting(waiting) {
    if (arguments.length === 0) {
      waiting = !this._isWaiting;
    } // if (this._isMediaPaused()) {
    // 	waiting = false;
    // }


    if (this._isWaiting !== waiting) {
      this._isWaiting = waiting;

      this._renderPlaybackState();
    }
  },

  /* --------------------------- *
  /* abstract
  /* --------------------------- */
  _isMediaPaused: function _isMediaPaused() {
    console.warn("%s::_isMediaPaused Not implemented", this.cid);
    return true;
  },
  _playMedia: function _playMedia() {
    console.warn("%s::_playMedia Not implemented", this.cid);
  },
  _pauseMedia: function _pauseMedia() {
    console.warn("%s::_pauseMedia Not implemented", this.cid);
  },

  /* --------------------------- *
  /* util
  /* --------------------------- */
  updateOverlay: function updateOverlay(mediaEl, targetEl, rectEl) {// this method is not critical, just catch and log all errors
    // try {
    // 	this._updateOverlay(mediaEl, targetEl, rectEl)
    // } catch (err) {
    // 	console.error("%s::updateOverlay", this.cid, err);
    // }
  }
  /**\/
  _drawMediaElement: function(ctx, mediaEl, dest) {
  	// destination rect
  	// NOTE: mediaEl is expected to have the same dimensions in this.metrics.media
  	mediaEl || (mediaEl = this.defaultImage);
  	dest || (dest = {
  		x: 0,
  		y: 0,
  		width: this.metrics.media.width,
  		height: this.metrics.media.height
  	});
  		// native/display scale
  	var sW = this.model.get("source").get("w"),
  		sH = this.model.get("source").get("h"),
  		rsX = sW / this.metrics.media.width,
  		rsY = sH / this.metrics.media.height;
  		// dest, scaled to native
  	var src = {
  		x: Math.max(0, dest.x * rsX),
  		y: Math.max(0, dest.y * rsY),
  		width: Math.min(sW, dest.width * rsX),
  		height: Math.min(sH, dest.height * rsY)
  	};
  		// resize canvas
  	// var canvas = ctx.canvas;
  	// if (canvas.width !== dest.width || canvas.height !== dest.height) {
  	// 	canvas.width = dest.width;
  	// 	canvas.height = dest.height;
  	// }
  	ctx.canvas.width = dest.width;
  	ctx.canvas.height = dest.height;
  		// copy image to canvas
  	ctx.clearRect(0, 0, dest.width, dest.height);
  	ctx.drawImage(mediaEl,
  		src.x, src.y, src.width, src.height,
  		0, 0, dest.width, dest.height // destination rect
  	);
  		return ctx;
  },
  	_getImageData: function(mediaEl, targetEl, rectEl) {
  	// src/dest rects
  	// ------------------------------
  	rectEl || (rectEl = targetEl);
  		// NOTE: does not work with svg element
  	// var tRect = rectEl.getBoundingClientRect();
  	// var cRect = mediaEl.getBoundingClientRect();
  	// var tX = tRect.x - cRect.x,
  	// 	tY = tRect.y - cRect.y,
  	// 	tW = tRect.width,
  	// 	tH = tRect.height;
  		// target bounds
  	var tX = rectEl.offsetLeft,
  		tY = rectEl.offsetTop,
  		tW = rectEl.offsetWidth,
  		tH = rectEl.offsetHeight;
  		if (tX === void 0 || tY === void 0 || tW === void 0 || tH === void 0) {
  		return;
  	}
  		// destination rect
  	var RECT_GROW = 0;
  	var dest = {
  		x: tX - RECT_GROW,
  		y: tY - RECT_GROW,
  		width: tW + RECT_GROW * 2,
  		height: tH + RECT_GROW * 2
  	};
  		// native/display scale
  	var sW = this.model.get("source").get("w"),
  		sH = this.model.get("source").get("h"),
  		rsX = sW / this.metrics.media.width,
  		rsY = sH / this.metrics.media.height;
  		// dest, scaled to native
  	var src = {
  		x: Math.max(0, dest.x * rsX),
  		y: Math.max(0, dest.y * rsY),
  		width: Math.min(sW, dest.width * rsX),
  		height: Math.min(sH, dest.height * rsY)
  	};
  		// Copy image to canvas
  	// ------------------------------
  	// canvas = document.createElement("canvas");
  	// canvas.style.width  = dest.width + "px";
  	// canvas.style.height = dest.height + "px";
  		var canvas = getSharedCanvas();
  	if (canvas.width !== dest.width || canvas.height !== dest.height) {
  		canvas.width = dest.width;
  		canvas.height = dest.height;
  	}
  	var ctx = canvas.getContext("2d");
  	ctx.clearRect(0, 0, dest.width, dest.height);
  	ctx.drawImage(mediaEl,
  		src.x, src.y, src.width, src.height,
  		0, 0, dest.width, dest.height // destination rect
  	);
  	return ctx.getImageData(0, 0, dest.width, dest.height);
  },
  	_updateOverlay: function(mediaEl, targetEl, rectEl) {
  	var canvas, ctx;
  	var imageData = this._getImageData(mediaEl, targetEl, rectEl);
  	var avgColor = Color().rgb(getAverageRGB(imageData));
  		// var avgHex = avgColor.hex().string(), els = this.el.querySelectorAll("img, video");
  	// for (var i = 0; i < els.length; i++) {
  	// 	els.item(i).style.backgroundColor = avgHex;
  	// }
  		targetEl.classList.toggle("over-dark", avgColor.dark());
  		// console.log("%s::updateOverlay() avgColor:%s (%s)", this.cid, avgColor.rgb().string(), avgColor.dark()?"dark":"light", targetEl);
  		// Color, filter opts
  	// ------------------------------
  		this.fgColor || (this.fgColor = new Color(this.model.attr("color")));
  	this.bgColor || (this.bgColor = new Color(this.model.attr("background-color")));
  		var opts = { radius: 20 };
  	var isFgDark = this.fgColor.luminosity() < this.bgColor.luminosity();
  	opts.x00 = isFgDark ? Color(this.fgColor).lighten(0.5) : Color(this.bgColor).darken(0.5);
  	opts.xFF = isFgDark ? Color(this.bgColor).lighten(0.5) : Color(this.fgColor).darken(0.5);
  		stackBlurRGB(imageData, { radius: 40 });
  	// stackBlurMono(imageData, opts);
  	// duotone(imageData, opts);
  		ctx = getSharedCanvas();
  	if (canvas.width !== imageData.width || canvas.height !== imageData.height) {
  		canvas.width = imageData.width;
  		canvas.height = imageData.height;
  	}
  	ctx = canvas.getContext("2d");
  	ctx.putImageData(imageData, 0, 0);
  	targetEl.style.backgroundOrigin = "border-box";
  	targetEl.style.backgroundClip = "content-box";
  	targetEl.style.backgroundSize = "100%";
  	// targetEl.style.padding = "0 0 5rem 0";
  	targetEl.style.backgroundImage = "url(" + canvas.toDataURL() + ")";
  } /**/

});
/* ---------------------------
/* Google Analytics
/* --------------------------- */
// if (window.GTAG_ENABLED && window.ga) {

if (window.ga) {
  PlayableRenderer = function (PlayableRenderer) {
    // /** @type {module:underscore.strings/dasherize} */
    // var dasherize = require("underscore.string/dasherize");
    var dasherize = function dasherize(s) {
      String(s).trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
    }; // var readyEvents = ["playing", "waiting", "ended"];
    // var userEvents = ["play", "pause"];


    return PlayableRenderer.extend({
      /** @override */
      initialize: function initialize() {
        var retval = PlayableRenderer.prototype.initialize.apply(this, arguments);
        this._gaEventSuffix = this.playbackRequested ? "-autoplay" : "";
        return retval;
      },

      /** @override */
      _onPlaybackToggle: function _onPlaybackToggle(ev) {
        var retval = PlayableRenderer.prototype._onPlaybackToggle.apply(this, arguments);

        if (window.ga) {
          window.ga("send", {
            hitType: "event",
            eventCategory: dasherize(this.cidPrefix),
            eventAction: (this.playbackRequested ? "play" : "pause") + this._gaEventSuffix,
            eventLabel: this.model.get("text")
          });
        } else {
          console.warn("%s::_onPlaybackToggle window.ga is %s", this.cid, window.ga);
        }

        return retval;
      } // /** @override */
      // _togglePlayback: function(newPlayState) {
      // 	var retval = PlayableRenderer.prototype._togglePlayback.apply(this, arguments);
      // 	window.ga("send", {
      // 		hitType: "event",
      // 		eventCategory: "Playable",
      // 		eventAction: this.playbackRequested ? "play" : "pause",
      // 		eventLabel: this.model.get("text"),
      // 	});
      // 	return retval;
      // },

    });
  }(PlayableRenderer);
} // if (DEBUG) {
// 	PlayableRenderer.prototype._logFlags = "";
//
// 	PlayableRenderer = (function(PlayableRenderer) {
// 		if (!PlayableRenderer.LOG_TO_SCREEN) return PlayableRenderer;
//
// 		/** @type {module:underscore.strings/lpad} */
// 		var lpad = require("underscore.string/lpad");
//
// 		return PlayableRenderer.extend({
// 			_canResumePlayback: function() {
// 				var retval = PlayableRenderer.prototype._canResumePlayback.apply(this.arguments);
// 				console.log("[scroll] %s::_canResumePlayback():%s", this.cid, retval, {
// 					"enabled": this.enabled,
// 					"selected": (!!this.model.selected),
// 					"playbackRequested": this.playbackRequested,
// 					"attached": this.attached,
// 					"parentView": (this.parentView && this.parentView.cid),
// 					"!scrolling": (this.parentView && !this.parentView.scrolling),
// 					"mediaState": this.mediaState,
// 					// "!document.hidden": !document[visibilityHiddenProp],
// 					"visibilityState": document[visibilityStateProp]
// 				});
// 				return retval;
// 			},
// 		});
// 	})(PlayableRenderer);
// }


module.exports = PlayableRenderer;

}).call(this,true,require("underscore"))

},{"app/view/render/MediaRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/MediaRenderer.js","underscore":"underscore","utils/prefixedEvent":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedEvent.js","utils/prefixedProperty":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedProperty.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/SequenceRenderer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"placeholder sizing\"></div>\n<div class=\"content\">\n	<div class=\"media-border content-size\"></div>\n	<div class=\"controls content-size\">\n		<canvas class=\"progress-meter\"></canvas>\n	</div>\n	<div class=\"sequence media-size\">\n		<img class=\"sequence-step current default\" alt=\""
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "\" longdesc=\"#desc_m"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" />\n	</div>\n	<div class=\"overlay media-size play-toggle-hitarea\">\n		<canvas class=\"play-toggle\"/>\n	</div>\n</div>\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/SequenceRenderer.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/**
 * @module app/view/render/SequenceRenderer
 */

/* --------------------------- *
 * Imports
 * --------------------------- */

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */


var View = require("app/view/base/View");
/** @type {module:app/view/render/PlayableRenderer} */


var PlayableRenderer = require("app/view/render/PlayableRenderer"); // /** @type {module:app/model/SelectableCollection} */
// var SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals");
/** @type {module:app/view/component/CanvasProgressMeter} */


var ProgressMeter = require("app/view/component/CanvasProgressMeter");
/** @type {module:app/view/component/PlayToggleSymbol} */


var PlayToggleSymbol = require("app/view/component/PlayToggleSymbol");
/** @type {module:utils/Timer} */


var Timer = require("utils/Timer"); // /** @type {Function} */
// var transitionEnd = require("utils/event/transitionEnd");
// /** @type {module:utils/prefixedProperty} */
// var prefixed = require("utils/prefixedProperty");

/** @type {Function} */


var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */


var _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL"); // /** @type {Function} */
// var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");
// var whenSelectTransitionEnds = require("app/view/promise/whenSelectTransitionEnds");
// var whenDefaultImageLoads = require("app/view/promise/whenDefaultImageLoads");
// /** @type {Function} */
// var Color = require("color");
// var duotone = require("utils/canvas/bitmap/duotone");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");


var errorTemplate = require("../template/ErrorBlock.hbs");

var MIN_STEP_INTERVAL = 2 * Globals.TRANSITION_DURATION + Globals.TRANSITION_DELAY_INTERVAL;
var DEFAULT_STEP_INTERVAL = 6 * Globals.TRANSITION_DURATION + Globals.TRANSITION_DELAY_INTERVAL;
/* --------------------------- *
 * Private classes
 * --------------------------- */

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer.PrefetechedSourceRenderer}
 */

var PrefetechedSourceRenderer = View.extend({
  cidPrefix: "sequenceStepRenderer",

  /** @type {string} */
  className: "sequence-step",

  /** @type {string} */
  tagName: "img",
  properties: {
    ready: {
      get: function get() {
        return this._ready;
      }
    }
  },

  /** @override */
  initialize: function initialize(opts) {
    !this.el.hasAttribute("alt") && this.el.setAttribute("alt", this.model.get("src")); // this.el.setAttribute("longdesc", this.model.get("original"));

    if (this.model.has("prefetched")) {
      this._renderPrefetched();
    } else {
      this.listenTo(this.model, "change:prefetched", this._renderPrefetched);
    }

    this.listenTo(this.model, "selected deselected", this._renderSelection);

    this._renderSelection();
  },
  _renderSelection: function _renderSelection() {
    this.el.classList.toggle("current", !!this.model.selected);
  },
  _renderPrefetched: function _renderPrefetched() {
    var prefetched = this.model.get("prefetched");

    if (prefetched !== this.el.src) {
      this.el.src = prefetched;
    }

    _whenImageLoads(this.el).then(function (el) {
      this.requestAnimationFrame(function (tstamp) {
        this._setReady(true);
      });
    }.bind(this), function (err) {
      // this._setReady(false);
      err instanceof Error || (err = new Error("cannot load prefetched url"));
      throw err;
    }.bind(this));
  },

  /** @type {boolean} */
  _ready: false,
  _setReady: function _setReady(ready) {
    if (this._ready !== ready) {
      this._ready = !!ready; // make bool

      this.trigger("renderer:ready", this);
    }
  },
  render: function render() {
    // if (this.model.has("prefetched")) {
    // 	this._renderPrefetched();
    // }
    // this.el.classList.toggle("current", !!this.model.selected);
    console.log("%s::render", this.cid);
    return this;
  }
});
/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer.SimpleSourceRenderer}
 */
// var SimpleSourceRenderer = View.extend({
//
// 	cidPrefix: "sequenceStepRenderer",
// 	/** @type {string} */
// 	className: "sequence-step",
// 	/** @type {string} */
// 	tagName: "img",
//
// 	/** @override */
// 	initialize: function (options) {
// 		// this.el.classList.toggle("current", this.model.hasOwnProperty("selected"));
// 		this.el.classList.toggle("current", !!this.model.selected);
// 		this.listenTo(this.model, {
// 			"selected": function () {
// 				this.el.classList.add("current");
// 			},
// 			"deselected": function () {
// 				this.el.classList.remove("current");
// 			}
// 		});
// 		if (this.el.src === "") {
// 			this.el.src = Globals.MEDIA_DIR + "/" + this.model.get("src");
// 		}
//
// 		if (this.model.has("error")) {
// 			this._onModelError();
// 		} else {
// 			this.listenToOnce(this.model, "change:error", this._onModelError);
// 			// this.listenToOnce(this.model, {
// 			// 	"change:source": this._onModelSource,
// 			// 	"change:error": this._onModelError,
// 			// });
// 		}
// 	},
//
// 	// _onModelSource: function() {
// 	// 	this.el.src = Globals.MEDIA_DIR + "/" + this.model.get("src");
// 	// 	// console.log("%s::change:src", this.cid, this.model.get("src"));
// 	// },
//
// 	_onModelError: function() {
// 		var err = this.model.get("error");
// 		var errEl = document.createElement("div");
// 		errEl.className = "error color-bg" + (this.model.selected? " current" : "");
// 		errEl.innerHTML = errorTemplate(err);
// 		this.setElement(errEl, true);
// 		console.log("%s::change:error", this.cid, err.message, err.infoSrc);
// 	},
// });

var SourceErrorRenderer = View.extend({
  /** @type {string} */
  className: "sequence-step error",

  /** @override */
  cidPrefix: "sourceErrorRenderer",

  /** @override */
  template: errorTemplate,

  /** @type {boolean} */
  ready: true,
  initialize: function initialize(opts) {
    // var handleSelectionChange = function onSelectionChange () {
    // 	this.el.classList.toggle("current", !!this.model.selected);
    // };
    // this.listenTo(this.model, "selected deselected", handleSelectionChange);
    // // this.el.classList.toggle("current", !!this.model.selected);
    // handleSelectionChange.call(this);
    this.listenTo(this.model, "selected deselected", function () {
      this.el.classList.toggle("current", !!this.model.selected);
    });
  },
  render: function render() {
    this.el.classList.toggle("current", !!this.model.selected);
    this.el.innerHTML = this.template(this.model.get("error"));
    return this;
  }
});
var SequenceStepRenderer = PrefetechedSourceRenderer; // var SequenceStepRenderer = SimpleSourceRenderer;

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer}
 */

var SequenceRenderer = PlayableRenderer.extend({
  /** @type {string} */
  cidPrefix: "sequenceRenderer",

  /** @type {string} */
  className: PlayableRenderer.prototype.className + " sequence-item",

  /** @type {Function} */
  template: require("./SequenceRenderer.hbs"),

  /* --------------------------- *
  /* initialize
  /* --------------------------- */
  initialize: function initialize(opts) {
    this.sources = this.model.get("sources");
    PlayableRenderer.prototype.initialize.apply(this, arguments);
  },

  /* --------------------------- *
   * children
   * --------------------------- */

  /** @override */
  createChildren: function createChildren() {
    PlayableRenderer.prototype.createChildren.apply(this, arguments);
    this.placeholder = this.el.querySelector(".placeholder");
    this.sequence = this.content.querySelector(".sequence"); // styles
    // ---------------------------------

    var s,
        attrs = this.model.attrs(); // var s, attrs = this.model.get("attrs");

    s = _.pick(attrs, "box-shadow", "border", "border-radius");

    _.extend(this.content.querySelector(".media-border").style, s);

    s = _.pick(attrs, "border-radius");

    _.extend(this.sequence.style, s);

    _.extend(this.placeholder.style, s); // model
    // ---------------------------------


    this.sources.select(this.model.get("source")); // itemViews
    // ---------------------------------

    this.itemViews = new Container(); // add default image as renderer (already in DOM)

    this.itemViews.add(new SequenceStepRenderer({
      el: this.getDefaultImage(),
      model: this.model.get("source")
    }));
  },

  /* --------------------------- *
   * layout/render
   * --------------------------- */

  /** @override */
  render: function render() {
    PlayableRenderer.prototype.render.apply(this, arguments);
    var els, el, i, cssW, cssH;
    var content = this.content; // media-size
    // ---------------------------------

    cssW = this.metrics.media.width + "px";
    cssH = this.metrics.media.height + "px";
    els = this.el.querySelectorAll(".media-size");

    for (i = 0; i < els.length; i++) {
      el = els.item(i);
      el.style.width = cssW;
      el.style.height = cssH;
    }

    content.style.width = cssW;
    content.style.height = cssH; // content-position
    // ---------------------------------

    var cssX, cssY;
    cssX = this.metrics.content.x + "px";
    cssY = this.metrics.content.y + "px";
    content.style.left = cssX;
    content.style.top = cssY;
    el = this.el.querySelector(".controls"); // el.style.left = cssX;
    // el.style.top = cssY;

    el.style.width = this.metrics.content.width + "px";
    el.style.height = this.metrics.content.height + "px"; // // content-size
    // // ---------------------------------
    // cssW = this.metrics.content.width + "px";
    // cssH = this.metrics.content.height + "px";
    //
    // els = this.el.querySelectorAll(".content-size");
    // for (i = 0; i < els.length; i++) {
    // 	el = els.item(i);
    // 	el.style.width = cssW;
    // 	el.style.height = cssH;
    // }

    return this;
  },

  /* --------------------------- *
   * initializeAsync
   * --------------------------- */
  initializePlayable: function initializePlayable() {
    // model
    // ---------------------------------
    // this.sources.select(this.model.get("source"));
    this.content.classList.add("started"); // Sequence model
    // ---------------------------------

    PlayableRenderer.whenSelectionDistanceIs(this, 0) // .then(function(view) {
    // 	/* defaultImage is loaded, add `started` rightaway */
    // 	view.content.classList.add("started");
    // 	return view;
    // })
    .then(this._preloadAllItems, function (err) {
      return err instanceof View.ViewError ? void 0 : err; // Ignore ViewError
    });
    this._sequenceInterval = Math.max(parseInt(this.model.attr("@sequence-interval")), MIN_STEP_INTERVAL) || DEFAULT_STEP_INTERVAL; // timer
    // ---------------------------------

    /* timer will be started when _validatePlayback is called from _onModelSelected */

    this.timer = new Timer();
    this.listenTo(this, "view:removed", function () {
      this.timer.stop();
      this.stopListening(this.timer);
    });
    this.listenTo(this.timer, {
      "start": this._onTimerStart,
      "resume": this._onTimerResume,
      "pause": this._onTimerPause,
      "end": this._onTimerEnd // "stop": function () {}, // stop is only called on view remove

    }); // play-toggle-symbol
    // ---------------------------------

    this._playToggleSymbol = new PlayToggleSymbol(_.extend({
      el: this.el.querySelector(".play-toggle")
    }, this._playToggleSymbol || {})); // progress-meter model
    // ---------------------------------

    this._sourceProgressByIdx = this.sources.map(function () {
      return 0;
    });
    this._sourceProgressByIdx[0] = 1; // first item is already loaded
    // progress-meter
    // ---------------------------------

    this.progressMeter = new ProgressMeter({
      el: this.el.querySelector(".progress-meter"),
      color: this.model.attr("color"),
      // backgroundColor: this.model.attr("background-color"),
      values: {
        available: this._sourceProgressByIdx.concat()
      },
      maxValues: {
        amount: this.sources.length,
        available: this.sources.length
      },
      labelFn: function () {
        if (this.playbackRequested === false) return Globals.PAUSE_CHAR;
        return this.sources.selectedIndex + 1 + "/" + this.sources.length;
      }.bind(this)
    }); // this.el.querySelector(".top-bar")
    //		.appendChild(this.progressMeter.render().el);
  },
  initializeAsync: function initializeAsync() {
    return PlayableRenderer.prototype.initializeAsync.apply(this, arguments).then(function (view) {
      return view.whenAttached();
    }).then(function (view) {
      view.initializePlayable(); // view.updateOverlay(view.defaultImage, view.playToggle); //view.overlay);

      view.listenToSelection();
      return view;
    });
  },
  whenInitialized: function whenInitialized(view) {
    var retval = PlayableRenderer.prototype.whenInitialized.apply(this, arguments);

    view._validatePlayback();

    return retval;
  },

  /* --------------------------- *
   * _preloadAllItems
   * --------------------------- */
  _preloadAllItems: function _preloadAllItems(view) {
    view.once("view:remove", function () {
      var silent = {
        silent: true
      };
      view.sources.forEach(function (item, index, sources) {
        // view.stopListening(item, "change:progress");
        var prefetched = item.get("prefetched");

        if (prefetched) {
          item.set("progress", 0, silent);
          item.unset("prefetched", silent);

          if (/^blob\:/.test(prefetched)) {
            URL.revokeObjectURL(prefetched);
          }
        }
      });
    });
    return view.sources.reduce(function (lastPromise, item, index, sources) {
      return lastPromise.then(function (view) {
        if (view._viewPhase === "disposed") {
          /** do nothing */
          return view;
        } else if (item.has("prefetched")) {
          view._updateItemProgress(1, index);

          return view;
        } else {
          var onItemProgress = function onItemProgress(item, progress) {
            view._updateItemProgress(progress, index);
          };

          view.listenTo(item, "change:progress", onItemProgress);
          view.once("view:remove", function (view) {
            view.stopListening(item, "change:progress", onItemProgress);
          });
          console.log("%s:_preloadAllItems", view.cid, item.get("original"), item.get("mime"));
          return _loadImageAsObjectURL(item.get("original"), function (progress, request) {
            /* NOTE: Since we are calling URL.revokeObjectURL when view is removed, also abort incomplete requests. Otherwise, clear the callback reference from XMLHttpRequest.onprogress  */
            if (view._viewPhase === "disposed") {
              //console.warn("%s::_preloadAllItems aborting XHR [%s %s] (%s)", view.cid, request.status, request.readyState, item.get("original"), request);
              request.abort(); // request.onprogress = void 0;
            } else {
              item.set("progress", progress);
            }
          }).then(function (pUrl) {
            item.set({
              "progress": pUrl ? 1 : 0,
              "prefetched": pUrl
            });
            return view;
          }, function (err) {
            item.set({
              "progress": 0,
              "error": err
            });
            return view;
          });
        }
      });
    }, Promise.resolve(view));
  },
  // _preloadAllItems2: function(view) {
  // 	return view.sources.reduce(function(lastPromise, item, index, sources) {
  // 		return lastPromise.then(function(view) {
  // 			var itemView = view._getItemView(item);
  // 			return _whenImageLoads(itemView.el).then(function(url){
  // 				view._updateItemProgress(1, index);
  // 				return view;
  // 			}, function(err) {
  // 				view._updateItemProgress(0, index);
  // 				item.set("error", err);
  // 				return view;
  // 			});
  // 		});
  // 	}, Promise.resolve(view));
  // },
  _updateItemProgress: function _updateItemProgress(progress, index) {
    this._sourceProgressByIdx[index] = progress;

    if (this.progressMeter) {
      this.progressMeter.valueTo("available", this._sourceProgressByIdx, 300);
    }
  },

  /* ---------------------------
   * PlayableRenderer implementation
   * --------------------------- */

  /** @override initial value */
  _playbackRequested: true,

  /** @type {Boolean} internal store */
  _paused: true,

  /** @override */
  _isMediaPaused: function _isMediaPaused() {
    return this._paused;
  },

  /** @override */
  _playMedia: function _playMedia() {
    if (!this._paused) return;
    this._paused = false;

    if (!this._isMediaWaiting()) {
      if (this.timer.status === Timer.PAUSED) {
        this.timer.start(); // resume, actually
      } else {
        this.timer.start(this._sequenceInterval);
      }
    }
  },

  /** @override */
  _pauseMedia: function _pauseMedia() {
    if (this._paused) return;
    this._paused = true;

    if (this.timer.status === Timer.STARTED) {
      this.timer.pause();
    }
  },
  // /** @override */
  // _renderPlaybackState: function() {
  // 	// if (!this.content.classList.contains("started")) {
  // 	// 	this.content.classList.add("started");
  // 	// }
  // 	PlayableRenderer.prototype._renderPlaybackState.apply(this, arguments);
  // },

  /* --------------------------- *
  /* sequence private
  /* --------------------------- */
  _onTimerStart: function _onTimerStart(duration) {
    var item;

    if (this.sources.selectedIndex === -1) {
      item = this.model.get("source");
    } else {
      item = this.sources.followingOrFirst();
    }

    this.sources.select(item);
    this.progressMeter.valueTo("amount", this.sources.selectedIndex + 1, duration);
    this.content.classList.toggle("playback-error", item.has("error")); // var currView = this.itemViews.findByModel(item);
    // if (!item.has("error") && currView !== null) {
    // 	this._playToggleSymbol.setImageSource(currView.el);
    // 	// this.updateOverlay(currView.el, this.playToggle);
    // } else {
    // 	this._playToggleSymbol.setImageSource(null);
    // }
    // // init next renderer now to have smoother transitions
    // this._getItemView(this.sources.followingOrFirst());
  },
  _onTimerResume: function _onTimerResume(duration) {
    this.progressMeter.valueTo("amount", this.sources.selectedIndex + 1, duration);
  },
  _onTimerPause: function _onTimerPause(duration) {
    this.progressMeter.valueTo("amount", this.progressMeter.getRenderedValue("amount"), 0);
  },

  /* last completely played sequence index */
  // _lastPlayedIndex: -1,
  _onTimerEnd: function _onTimerEnd() {
    var nextItem, nextView;

    var showNextView = function (result) {
      // console.log("%s::showNextView %sms %s", context.cid, context._sequenceInterval, nextItem.cid)
      this.setImmediate(function () {
        if (!this.mediaPaused) {
          this.timer.start(this._sequenceInterval);
        }
      });
      return result;
    }.bind(this); // get next item init next renderer


    nextItem = this.sources.followingOrFirst();
    nextView = this._getItemView(nextItem);

    if (nextItem.has("error")) {
      showNextView();
    } else if (nextItem.has("prefetched")) {
      _whenImageLoads(nextView.el).then(showNextView, showNextView);
    } else {
      /* TODO: add ga event 'media-waiting' */
      // window.ga("send", "event", "sequence-item", "waiting", this.model.get("text"));
      // console.log("%s:[waiting] %sms %s", context.cid, nextItem.cid);
      this._toggleWaiting(true);

      this.listenToOnce(nextItem, "change:prefetched change:error", function (model) {
        // console.log("%s:[playing] %sms %s", context.cid, nextItem.cid);
        this._toggleWaiting(false);

        _whenImageLoads(nextView.el).then(showNextView, showNextView);
      });
    }
  },
  _getItemView: function _getItemView(item) {
    var view = this.itemViews.findByModel(item);

    if (!view) {
      view = new (item.has("error") ? SourceErrorRenderer : SequenceStepRenderer)({
        model: item
      });
      this.itemViews.add(view);
      this.sequence.appendChild(view.render().el);
    }

    return view;
  }
  /* --------------------------- *
  /* progress meter
  /* --------------------------- */
  // _createDefaultItemData: function() {
  // 	var canvas = document.createElement("canvas");
  // 	var context = canvas.getContext("2d");
  // 	var imageData = this._drawMediaElement(context).getImageData(0, 0, canvas.width, canvas.height);
  //
  // 	var opts = { radius: 20 };
  // 	var fgColor = new Color(this.model.attr("color"));
  // 	var bgColor = new Color(this.model.attr("background-color"));
  // 	var isFgDark = fgColor.luminosity() < bgColor.luminosity();
  // 	opts.x00 = isFgDark? Color(fgColor).lighten(0.33) : Color(bgColor).darken(0.33);
  // 	opts.xFF = isFgDark? Color(bgColor).lighten(0.33) : Color(fgColor).darken(0.33);
  //
  // 	stackBlurMono(imageData, opts);
  // 	duotone(imageData, opts);
  // 	// stackBlurRGB(imageData, opts);
  //
  // 	context.putImageData(imageData, 0, 0);
  // 	return canvas.toDataURL();
  // },

});

if (DEBUG) {
  SequenceRenderer = function (SequenceRenderer) {
    if (!SequenceRenderer.LOG_TO_SCREEN) return SequenceRenderer; // /** @type {module:underscore.strings/lpad} */
    // var rpad = require("underscore.string/rpad");
    // /** @type {module:underscore.strings/lpad} */
    // var lpad = require("underscore.string/lpad");
    // /** @type {module:underscore.strings/capitalize} */
    // var caps = require("underscore.string/capitalize");

    return SequenceRenderer.extend({
      /** @override */
      initialize: function initialize() {
        SequenceRenderer.prototype.initialize.apply(this, arguments);
        this.__logColors = _.extend({
          "media:play": "darkred",
          "media:pause": "darkred",
          "timer:start": "darkgreen",
          "timer:end": "darkgreen",
          "timer:resume": "green",
          "timer:pause": "green",
          "load:progress": "blue",
          "load:complete": "darkblue"
        }, this.__logColors);
      },
      // __getHeaderText: function() {
      // 	var fmt1 = function(s) {
      // 		return lpad(caps(s), 8).substr(0, 8).toUpperCase();
      // 	};
      // 	var fmt2 = function(s) {
      // 		return lpad(caps(s), 8).substr(0, 8).toUpperCase();
      // 	};
      // 	var o = {
      // 		"tstamp": fmt1,
      // 		"index": fmt2,
      // 		"duration": fmt1,
      // 		"playback": fmt1,
      // 		"media": fmt1,
      // 		"timer": fmt1,
      // 		"next": fmt1,
      // 	};
      // 	return Object.keys(o).map(function(s, i, a) {
      // 		return o[s](s);
      // 	}).join(" ");
      // 	// Object.keys(o).reduce(function(ss, s, i, a) {
      // 	// 	return ss + " " + lpad(caps(s), 8).substr(0, 8).toUpperCase();
      // 	// }, "");
      // },
      __getHeaderText: function __getHeaderText() {
        return ["tstamp", "index", "duration", "playback", "media", "timer", "next"].map(function (s, i, a) {
          return s.padStart(8).substr(0, 8).toUpperCase();
        }).join(" ");
      },
      __logTimerEvent: function __logTimerEvent(evname, msg) {
        var logMsg = [this.sources.selectedIndex, (this.timer.getDuration() * .001).toFixed(3), this.playbackRequested ? ">>" : "::", this.mediaPaused ? "paused" : this.mediaWaiting ? "waiting" : "playing", this.timer.getStatus(), this.sources.followingOrFirst().has("prefetched") ? "ready" : "pending"].map(function (s, i, a) {
          return String(s).padStart(8).substr(0, 8).toUpperCase();
        });
        msg && logMsg.push(msg);
        logMsg = logMsg.join(" ");

        this.__logMessage(logMsg, evname); // console.log("%s::[%s] %s", this.cid, evname, logMsg);

      },
      _playMedia: function _playMedia() {
        this.__logTimerEvent("media:play");

        SequenceRenderer.prototype._playMedia.apply(this, arguments); // this.__logTimerEvent("< media:play");
        // console.log("%s::_playMedia()", this.cid);

      },
      _pauseMedia: function _pauseMedia() {
        this.__logTimerEvent("media:pause");

        SequenceRenderer.prototype._pauseMedia.apply(this, arguments); // this.__logTimerEvent("< media:pause");
        // console.log("%s::_pauseMedia()", this.cid);

      },
      _onTimerStart: function _onTimerStart() {
        this.__logTimerEvent("timer:start");

        SequenceRenderer.prototype._onTimerStart.apply(this, arguments);
      },
      _onTimerResume: function _onTimerResume() {
        this.__logTimerEvent("timer:resume");

        SequenceRenderer.prototype._onTimerResume.apply(this, arguments);
      },
      _onTimerPause: function _onTimerPause() {
        this.__logTimerEvent("timer:pause");

        SequenceRenderer.prototype._onTimerPause.apply(this, arguments);
      },
      _onTimerEnd: function _onTimerEnd() {
        this.__logTimerEvent("timer:end");

        SequenceRenderer.prototype._onTimerEnd.apply(this, arguments);
      },
      _updateItemProgress: function _updateItemProgress(progress, srcIdx) {
        if (progress == 1) {
          this.__logTimerEvent("load:complete", "item " + srcIdx + ": complete");
        } else if (srcIdx === this.sources.selectedIndex) {
          this.__logTimerEvent("load:progress", "item " + srcIdx + ": " + progress);
        }

        SequenceRenderer.prototype._updateItemProgress.apply(this, arguments);
      },
      _preloadAllItems: function _preloadAllItems(view) {
        view.__logMessage(view.cid + "::_preloadAllItems", "load:start");

        SequenceRenderer.prototype._preloadAllItems.apply(view, arguments);
      }
    });
  }(SequenceRenderer);
}

module.exports = SequenceRenderer;

}).call(this,true,require("underscore"))

},{"../template/ErrorBlock.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/ErrorBlock.hbs","./SequenceRenderer.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/SequenceRenderer.hbs","app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/view/base/View":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/base/View.js","app/view/component/CanvasProgressMeter":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/CanvasProgressMeter.js","app/view/component/PlayToggleSymbol":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/PlayToggleSymbol.js","app/view/promise/_loadImageAsObjectURL":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/_loadImageAsObjectURL.js","app/view/promise/_whenImageLoads":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/promise/_whenImageLoads.js","app/view/render/PlayableRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/PlayableRenderer.js","backbone.babysitter":"backbone.babysitter","underscore":"underscore","utils/Timer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/Timer.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/VideoRenderer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
var partial$0 = require('../template/svg/FullscreenSymbol.hbs');
HandlebarsCompiler.registerPartial('../template/svg/FullscreenSymbol.hbs', partial$0);
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"placeholder sizing\"></div>\n<div class=\"content media-border\">\n	<div class=\"controls content-size\">\n		<canvas class=\"progress-meter\"></canvas>\n	</div>\n	<div class=\"crop-box media-size\">\n		<video width=\"240\" height=\"180\" muted playsinline></video>\n		<img class=\"poster default\" alt=\""
    + container.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"text","hash":{},"data":data}) : helper)))
    + "\" width=\"240\" height=\"180\" />\n	</div>\n	<div class=\"overlay media-size play-toggle-hitarea\">\n			<canvas class=\"play-toggle\"></canvas>\n		<a class=\"fullscreen-toggle\" href=\"javascript:(void 0)\">\n"
    + ((stack1 = container.invokePartial(partials["../template/svg/FullscreenSymbol.hbs"],depth0,{"name":"../template/svg/FullscreenSymbol.hbs","data":data,"indent":"\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "		</a>\n	</div>\n</div>\n";
},"usePartial":true,"useData":true});

},{"../template/svg/FullscreenSymbol.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/svg/FullscreenSymbol.hbs","hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/VideoRenderer.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/*global HTMLMediaElement, MediaError*/

/**
 * @module app/view/render/VideoRenderer
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
 */

/* --------------------------- *
 * Imports
 * --------------------------- */
// /** @type {module:backbone} */
// var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/render/PlayableRenderer} */


var PlayableRenderer = require("app/view/render/PlayableRenderer");
/** @type {module:app/view/component/CanvasProgressMeter} */


var ProgressMeter = require("app/view/component/CanvasProgressMeter"); // /** @type {module:app/view/component/PlayToggleSymbol} */


var PlayToggleSymbol = require("app/view/component/PlayToggleSymbol"); // var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// /** @type {module:utils/prefixedStyleName} */
// var prefixedStyleName = require("utils/prefixedStyleName");

/** @type {module:utils/prefixedEvent} */


var prefixedEvent = require("utils/prefixedEvent"); // var whenViewIsAttached = require("app/view/promise/whenViewIsAttached");
// /** @type {Function} */
// var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");

/* --------------------------- *
 * private static
 * --------------------------- */


var fullscreenChangeEvent = prefixedEvent("fullscreenchange", document); // var fullscreenErrorEvent = prefixedEvent("fullscreenerror", document);

var formatTimecode = function formatTimecode(value) {
  if (isNaN(value)) return ""; //value = 0;

  if (value >= 3600) return (value / 3600 | 0) + "H";
  if (value >= 60) return (value / 60 | 0) + "M"; // if (value >= 10) return "0" + (value | 0) + "S";

  return (value | 0) + "S";
};

var VIDEO_CROP_PX = Globals.VIDEO_CROP_PX;
var SYNC_TIMEOUT_MS = 1200;
var SYNC_THRESHOLD_MS = 100;
/**
 * @constructor
 * @type {module:app/view/render/VideoRenderer}
 */

var VideoRenderer = PlayableRenderer.extend({
  /** @type {string} */
  cidPrefix: "videoRenderer",

  /** @type {string} */
  className: PlayableRenderer.prototype.className + " video-item",

  /** @type {Function} */
  template: require("./VideoRenderer.hbs"),
  // events: (function() {
  // 	var ret = {};
  // 	ret[PlayableRenderer.CLICK_EVENT + " .fullscreen-toggle"] = "_onFullscreenToggle";
  // 	return ret;
  // }()),
  // events: function() {
  // 	var events = {};
  // 	events[PlayableRenderer.CLICK_EVENT + " .fullscreen-toggle"] = "_onFullscreenToggle";
  // 	return _.extend(events, _.result(this, PlayableRenderer.prototype.events));
  // },
  // events: {
  // 	"click .fullscreen-toggle": "_onFullscreenToggle",
  // },
  properties: {
    fullscreenToggle: {
      /** @return {HTMLElement} */
      get: function get() {
        return this._fullscreenToggle || (this._fullscreenToggle = this.el.querySelector(".fullscreen-toggle"));
      }
    }
  },

  /** @override */
  initialize: function initialize(opts) {
    PlayableRenderer.prototype.initialize.apply(this, arguments);

    _.bindAll(this, "_updatePlaybackState", "_updateCurrTimeValue", "_updateBufferedValue", "_onMediaError", "_onMediaEnded", // "_onMediaPlayingOnce",
    "_onFullscreenChange", "_onFullscreenToggle");

    _.bindAll(this, "_playbackTimeoutFn_playing", "_playbackTimeoutFn_waiting"); // var onPeerSelect = function() {
    // 	this.content.style.display = (this.getSelectionDistance() > 1)? "none": "";
    // };
    // this.listenTo(this.model.collection, "select:one select:none", onPeerSelect);
    // onPeerSelect();

  },

  /* --------------------------- *
   * children
   * --------------------------- */

  /** @override */
  createChildren: function createChildren() {
    PlayableRenderer.prototype.createChildren.apply(this, arguments);
    this.placeholder = this.el.querySelector(".placeholder"); // this.overlay = this.content.querySelector(".overlay");

    this.video = this.content.querySelector("video"); // this.video.loop = this.model.attrs().hasOwnProperty("@video-loop");
    // this.video.setAttribute("muted", "muted");
    // this.video.setAttribute("playsinline", "playsinline");
    // if (this.model.attr("@video-loop") !== void 0) {
    // 	this.video.setAttribute("loop", "loop");
    // }

    this.video.setAttribute("preload", "none");
    if (this.video.controlList) this.video.controlList.add("nodownload"); // this.video.muted = true;
    // this.video.playsinline = true;
    // this.video.preload = "auto";

    this.video.loop = this.model.attr("@video-loop") !== void 0;
    this.video.src = this.findPlayableSource(this.video);
  },

  /* --------------------------- *
   * layout/render
   * --------------------------- */
  measure: function measure() {
    PlayableRenderer.prototype.measure.apply(this, arguments); // NOTE: Vertical 1px video crop
    // - Cropped in CSS: video, .poster { margin-top: -1px; margin-bottom: -1px;}
    // - Cropped height is adjusted in metrics obj
    // - Crop amount added back to actual video on render()

    this.metrics.media.height += VIDEO_CROP_PX * 2;
    this.metrics.content.height += VIDEO_CROP_PX * 2;
  },

  /** @override */
  render: function render() {
    PlayableRenderer.prototype.render.apply(this, arguments);
    var els, el, i, cssW, cssH;
    var img = this.defaultImage;
    var content = this.content; // media-size
    // ---------------------------------

    cssW = this.metrics.media.width + "px";
    cssH = this.metrics.media.height + "px";
    els = this.el.querySelectorAll(".media-size");

    for (i = 0; i < els.length; i++) {
      el = els.item(i);
      el.style.width = cssW;
      el.style.height = cssH;
    }

    content.style.width = cssW;
    content.style.height = this.metrics.media.height + VIDEO_CROP_PX + "px"; // content-position
    // ---------------------------------

    var cssX, cssY;
    cssX = this.metrics.content.x + "px";
    cssY = this.metrics.content.y + "px";
    content.style.left = cssX;
    content.style.top = cssY;
    el = this.el.querySelector(".controls"); // el.style.left = cssX;
    // controls.style.top = cssY;

    el.style.width = this.metrics.content.width + "px";
    el.style.height = this.metrics.content.height + "px"; // // content-size
    // // ---------------------------------
    // cssW = this.metrics.content.width + "px";
    // cssH = this.metrics.content.height + "px";
    //
    // els = this.el.querySelectorAll(".content-size");
    // for (i = 0; i < els.length; i++) {
    // 	el = els.item(i);
    // 	el.style.width = cssW;
    // 	el.style.height = cssH;
    // }
    // NOTE: elements below must use video's UNCROPPED height, so +2px

    this.video.setAttribute("width", this.metrics.media.width);
    this.video.setAttribute("height", this.metrics.media.height - VIDEO_CROP_PX * 2);
    img.setAttribute("width", this.metrics.media.width);
    img.setAttribute("height", this.metrics.media.height - VIDEO_CROP_PX * 2);
    return this;
  },

  /* --------------------------- *
   * initializeAsync
   * --------------------------- */
  initializeAsync: function initializeAsync() {
    return Promise.resolve(this).then(PlayableRenderer.whenSelectionIsContiguous).then(PlayableRenderer.whenScrollingEnds).then(PlayableRenderer.whenViewIsAttached).then(function (view) {
      // console.log("%s::initializeAsync [attached, scrollend, selected > %o, preload:%s] ('%o')", view.cid, view.model.getDistanceToSelected(), view.video.preload, view.model.get("name"));
      return Promise.all([PlayableRenderer.whenDefaultImageLoads(view), view.whenVideoHasMetadata(view)]).then(function () {
        return view;
      });
    }).then(function (view) {
      // console.log("%s::initializeAsync [defaultImage, preload:%s] ('%o')", view.cid, view.video.preload, view.model.get("name"));
      view.initializePlayable(); // view.updateOverlay(view.defaultImage, view.playToggle); //view.overlay);

      view.listenToSelection();
      return view;
    }); // videoEl.setAttribute("preload", "metadata");
  },
  initializePlayable: function initializePlayable() {
    // When selected for the first time
    // ---------------------------------
    PlayableRenderer.whenSelectionDistanceIs(this, 0).then(function (view) {
      view.video.setAttribute("preload", "auto");
      view.video.preload = "auto"; // console.log("%s::initializeAsync [selected, preload:%s] ('%o')", view.cid, view.video.preload, view.model.get("name"));

      return view;
    }).catch(function (reason) {
      if (reason instanceof PlayableRenderer.ViewError) {
        console.log("%s::%s", reason.view.cid, reason.message);
      } else {
        console.warn(reason); // return Promise.reject(reason);
      }
    }); // play-toggle-symbol
    // ---------------------------------

    this._playToggleSymbol = new PlayToggleSymbol(_.extend({
      el: this.el.querySelector(".play-toggle")
    }, this._playToggleSymbol || {})); // this._playToggleSymbol.setImageSource(this.defaultImage, 0, 0);
    // this.listenToElementOnce(this.video, "timeupdate", function(ev) {
    // 	this._playToggleSymbol.setImageSource(this.video);
    // });
    // progress-meter
    // ---------------------------------

    this.progressMeter = new ProgressMeter({
      el: this.el.querySelector(".progress-meter"),
      color: this.model.attr("color"),
      // backgroundColor: this.model.attr("background-color"),
      maxValues: {
        amount: this.video.duration,
        available: this.video.duration
      },
      labelFn: function (value, total) {
        if (!this._started || this.video.ended || isNaN(value)) {
          return formatTimecode(total);
        } else if (!this.playbackRequested) {
          return Globals.PAUSE_CHAR;
        } else {
          return formatTimecode(total - value);
        }
      }.bind(this)
    }); // this.el.querySelector(".controls").appendChild(this.progressMeter.el);
    // var el = this.el.querySelector(".progress-meter");
    // el.parentNode.replaceChild(this.progressMeter.el, el);
    // var parentEl = this.el.querySelector(".controls");
    // parentEl.insertBefore(this.progressMeter.el, parentEl.firstChild);
    // this._setPlayToggleSymbol("play-symbol");

    this._renderPlaybackState(); // listen to video events
    // ---------------------------------
    // this.video.poster = this.model.get("source").get("original");


    this.addMediaListeners();
  },

  /* --------------------------- *
   * whenVideoHasMetadata promise
   * --------------------------- */
  whenVideoHasMetadata: function whenVideoHasMetadata(view) {
    // NOTE: not pretty !!!
    return new Promise(function (resolve, reject) {
      var videoEl = view.video;
      var eventHandlers = {
        loadedmetadata: function loadedmetadata(ev) {
          if (ev) removeEventListeners(); // console.log("%s::whenVideoHasMetadata [%s] %s", view.cid, "resolved", ev ? ev.type : "sync");

          resolve(view);
        },
        abort: function abort(ev) {
          if (ev) removeEventListeners();
          reject(new PlayableRenderer.ViewError(view, new Error("whenVideoHasMetadata: view was removed")));
        },
        error: function error(ev) {
          if (ev) removeEventListeners();
          var err;

          if (videoEl.error) {
            err = new Error(_.invert(MediaError)[videoEl.error.code]);
            err.infoCode = videoEl.error.code;
          } else {
            err = new Error("Unspecified error");
          }

          err.infoSrc = videoEl.src;
          err.logMessage = "whenVideoHasMetadata: " + err.name + " " + err.infoSrc;
          err.logEvent = ev;
          reject(err);
        }
      }; //  (videoEl.preload == "auto" && videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)
      // 	(videoEl.preload == "metadata" && videoEl.readyState >= HTMLMediaElement.HAVE_METADATA)

      if (videoEl.error) {
        eventHandlers.error();
      } else if (videoEl.readyState >= HTMLMediaElement.HAVE_METADATA) {
        eventHandlers.loadedmetadata();
      } else {
        var sources = videoEl.querySelectorAll("source");
        var errTarget = sources.length > 0 ? sources.item(sources.length - 1) : videoEl;
        var errCapture = errTarget === videoEl; // use capture with HTMLMediaElement

        var removeEventListeners = function removeEventListeners() {
          errTarget.removeEventListener("error", eventHandlers.error, errCapture);

          for (var ev in eventHandlers) {
            if (ev !== "error" && eventHandlers.hasOwnProperty(ev)) {
              videoEl.removeEventListener(ev, eventHandlers[ev], false);
            }
          }
        };

        errTarget.addEventListener("error", eventHandlers.error, errCapture);

        for (var ev in eventHandlers) {
          if (ev !== "error" && eventHandlers.hasOwnProperty(ev)) {
            videoEl.addEventListener(ev, eventHandlers[ev], false);
          }
        }
        /* NOTE: MS Edge ignores js property, using setAttribute */


        videoEl.setAttribute("preload", "metadata");
        videoEl.preload = "metadata"; // videoEl.setAttribute("poster", view.get("source").get("original"));
        // videoEl.setAttribute("preload", "metadata");
        // videoEl.poster = view.model.get("source").get("original");
        // videoEl.loop = view.model.attr("@video-loop") !== void 0;
        // videoEl.src = view.findPlayableSource(videoEl);
        // videoEl.load();
        // console.log("%s::whenVideoHasMetadata [preload:%s]", view.cid, videoEl.preload);
      }
    });
  },
  findPlayableSource: function findPlayableSource(video) {
    var playable = this.model.get("sources").find(function (source) {
      return /^video\//.test(source.get("mime")) && video.canPlayType(source.get("mime")) != "";
    });
    return playable ? playable.get("original") : "";
  },

  /* ---------------------------
   * PlayableRenderer implementation
   * --------------------------- */
  // /** @override */
  // _canResumePlayback: function() {
  // 	return PlayableRenderer.prototype._canResumePlayback.apply(this, arguments) && this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  // },

  /** @override initial value */
  _playbackRequested: false,

  /** @override */
  _isMediaPaused: function _isMediaPaused() {
    return this.video.paused;
  },

  /** @override */
  _playMedia: function _playMedia() {
    if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && this.video.seekable.length == 0) {
      console.warn(this.cid, "WTF! got video data, but cannot seek, calling load()"); // this._logMessage("call:load", "got video data, but cannot seek, calling load()", "orange");

      if (_.isFunction(this.video.load)) {
        this.video.load();
      }
    }
    /* NOTE: loop is false, restart from end on request */
    else if (this.video.ended) {
        this.video.currentTime = this.video.seekable.start(0);
      }
    /* if not enough data */


    if (this.video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      if (this.video.networkState == HTMLMediaElement.NETWORK_IDLE) {
        this.video.load();
      } //else {
      // var _playStamp = this._playbackCount;
      // console.log("%s::_playMedia %s waiting [#%s]", this.cid, this._isMediaWaiting() ? "continue" : "begin", _playStamp);
      //
      // this.listenToElementOnce(this.video, "canplaythrough", function(ev) {
      // 	console.log("%s::_playMedia end waiting [#%s]", this.cid, _playStamp);
      //
      // 	this._toggleWaiting(false);
      // 	// this.playbackRequested && this.video.play();
      // 	this._validatePlayback();
      // });
      //}

      /* NOTE: on "canplaythrough" _playMedia() will be called again if still required */


      this._toggleWaiting(true);
    }
    /* play */
    else {
        /* NOTE: current browsers return a promise */
        this.video.play();
      }
  },

  /** @override */
  _pauseMedia: function _pauseMedia() {
    // this._setPlayToggleSymbol("play-symbol");
    this.video.pause(); // this._renderPlaybackState();
  },

  /* ---------------------------
  /* DOM events
  /* --------------------------- */
  _listenWhileSelected: function _listenWhileSelected() {
    PlayableRenderer.prototype._listenWhileSelected.apply(this, arguments);

    this.fullscreenToggle.addEventListener(this._toggleEvent, this._onFullscreenToggle, false);
  },
  _stopListeningWhileSelected: function _stopListeningWhileSelected() {
    PlayableRenderer.prototype._stopListeningWhileSelected.apply(this, arguments);

    this.fullscreenToggle.removeEventListener(this._toggleEvent, this._onFullscreenToggle, false);
  },

  /* ---------------------------
  /* media events
  /* --------------------------- */
  addMediaListeners: function addMediaListeners() {
    // if (!this._started) {
    // 	this.addListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
    // }
    this.addListeners(this.video, this.updatePlaybackEvents, this._updatePlaybackState);
    this.addListeners(this.video, this.updateBufferedEvents, this._updateBufferedValue);
    this.addListeners(this.video, this.updateCurrTimeEvents, this._updateCurrTimeValue);
    this.video.addEventListener("ended", this._onMediaEnded, false);
    this.video.addEventListener("error", this._onMediaError, true);
    this.on("view:removed", this.removeMediaListeners, this);
  },
  removeMediaListeners: function removeMediaListeners() {
    this.off("view:removed", this.removeMediaListeners, this); // if (!this._started) {
    // 	this.removeListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
    // }

    this.removeListeners(this.video, this.updatePlaybackEvents, this._updatePlaybackState);
    this.removeListeners(this.video, this.updateBufferedEvents, this._updateBufferedValue);
    this.removeListeners(this.video, this.updateCurrTimeEvents, this._updateCurrTimeValue);
    this.video.removeEventListener("ended", this._onMediaEnded, false);
    this.video.removeEventListener("error", this._onMediaError, true);
  },

  /* ---------------------------
  /* media event handlers
  /* --------------------------- */
  _onMediaError: function _onMediaError(ev) {
    this.removeMediaListeners();
    this.removeSelectionListeners();
    this._started = false;
    this.content.classList.remove("started");
    this.mediaState = "error";
    this.playbackRequested = false; // this.content.classList.remove("ended");
    // this.content.classList.remove("waiting");

    this._exitFullscreen();
  },
  _onMediaEnded: function _onMediaEnded(ev) {
    this.playbackRequested = false;

    this._exitFullscreen();
  },
  _exitFullscreen: function _exitFullscreen() {
    /* NOTE: polyfill should handle this on iOS? */
    if (this.video.webkitDisplayingFullscreen) {
      this.video.webkitExitFullscreen();
    }

    if (document.fullscreenElement === this.video) {
      this.video.exitFullscreen();
    }
  },

  /* ---------------------------
  /* _onMediaPlayingOnce
  /* --------------------------- */
  // playingOnceEvents: "playing waiting",
  //
  // _onMediaPlayingOnce: function(ev) {
  // 	this.removeListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
  // 	if (!this._started) {
  // 		this._started = true;
  // 		this.content.classList.add("started");
  // 	}
  // },

  /* ---------------------------
  /* _updateCurrTimeValue
  /* --------------------------- */
  updateCurrTimeEvents: "playing waiting pause timeupdate seeked",
  //.split(" "),
  _updateCurrTimeValue: function _updateCurrTimeValue(ev) {
    if (this.video.played.length) {
      this.content.classList.add("started");
    }

    if (this.progressMeter) {
      this.progressMeter.valueTo("amount", this.video.currentTime, 0);
    }
  },

  /* ---------------------------
  /* _updatePlaybackState
  /* --------------------------- */
  // updatePlaybackEvents: "playing play waiting pause seeking seeked ended",
  updatePlaybackEvents: "timeupdate playing pause waiting canplaythrough seeked",
  _isPlaybackWaiting: false,
  _playbackStartTS: -1,
  _playbackStartTC: -1,
  _updatePlaybackState: function _updatePlaybackState(ev) {
    // var isWaiting = false;
    // var symbolName = "play-symbol";
    // NOTE: clearTimeout will cancel both setTimeout and setInterval IDs
    window.clearTimeout(this._playbackTimeoutID);
    this._playbackTimeoutID = -1;

    if (this.playbackRequested) {
      if (ev.type !== "timeupdate") {
        this._playbackStartTS = ev.timeStamp;
        this._playbackStartTC = this.video.currentTime;
      }

      switch (ev.type) {
        case "timeupdate":
          if (SYNC_THRESHOLD_MS < Math.abs(ev.timeStamp - this._playbackStartTS - (this.video.currentTime - this._playbackStartTC) * 1000)) {
            this._playbackStartTS = ev.timeStamp;
            this._playbackStartTC = this.video.currentTime;
            this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_waiting, SYNC_TIMEOUT_MS);

            this._toggleWaiting(true); // break;

          } else {
            this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);

            this._toggleWaiting(false);
          }

          break;

        case "playing":
          this._playbackStartTS = ev.timeStamp;
          this._playbackStartTC = this.video.currentTime;
          this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);

          this._toggleWaiting(false);

          break;

        case "pause":
          /* NOTE: this.playbackRequested is true, the pause wasn't triggered
           * from UI, but by the waiting handler below, so we treat it as
           * waiting */
          // if (!this.playbackRequested) {
          // 	this._toggleWaiting(false);
          // }
          this._toggleWaiting(this.playbackRequested);

          break;

        case "canplaythrough":
          this._toggleWaiting(false);

          this._validatePlayback();

          break;

        case "waiting":
          /* NOTE: if the video is seeking, give it a chance to resume, so do
           * nothing, and handle things on seeked/playing */
          if (!this.video.seeking) {
            /* if not enough data */
            if (this.video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
              this.video.pause(); // this.listenToElementOnce(this.video, "canplaythrough", function() {
              // 	this._toggleWaiting(false);
              // 	this._validatePlayback();
              // this.playbackRequested && this.video.play();
              // });
            }

            this._toggleWaiting(true);
          }

          break;

        default:
          this._toggleWaiting(false);

          break;
      }
    } else {
      this._toggleWaiting(false);
    }
  },
  _playbackTimeoutID: -1,
  _playbackTimeoutFn_playing: function _playbackTimeoutFn_playing() {
    this._playbackTimeoutID = -1;

    this._toggleWaiting(true); // this._renderPlaybackState();
    // this._setPlayToggleSymbol("waiting-symbol");
    // this.content.classList.add("waiting");
    // this.progressMeter.stalled = true;
    // this._isPlaybackWaiting = true;

  },
  _playbackTimeoutFn_waiting: function _playbackTimeoutFn_waiting() {
    if (SYNC_THRESHOLD_MS < (this.video.currentTime - this._playbackStartTC) * 1000) {
      this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_waiting, SYNC_TIMEOUT_MS);
    } else {
      // since there is no event.timeStamp
      // var delta = this.video.currentTime - this._playbackStartTC;
      // this._playbackStartTS += delta * 1000;
      // this._playbackStartTS = window.performance.now();
      this._playbackStartTS += SYNC_TIMEOUT_MS;
      this._playbackStartTC = this.video.currentTime;
      this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);

      this._toggleWaiting(false); // this._renderPlaybackState();
      // this._setPlayToggleSymbol("pause-symbol");
      // this.content.classList.remove("waiting");
      // this.progressMeter.stalled = false;
      // this._isPlaybackWaiting = false;

    }
  },

  /** @override */
  _renderPlaybackState: function _renderPlaybackState() {
    // if (DEBUG) {
    // 	this.__logMessage([
    // 	"mediaState:", this.mediaState,
    // 	"played:", this.video.played.length,
    // 	"ended:", this.video.ended,
    // 	"toggle.paused:", this._playToggleSymbol.paused
    // ].join(" "), "_renderPlaybackState");
    // }
    // console.log("%s::_renderPlaybackState mediaState:%s played:%o ended:%o",
    // 	this.cid, this.mediaState, this.video.played.length, this.video.ended);
    //
    // if (this.mediaState === "ready") {
    // 	this.updateOverlay(this.video, this.playToggle);
    // }
    var cls = this.content.classList; // if (!this._started && this.playbackRequested &&
    // 		this.video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
    // 	this._started = true;
    // 	cls.add("started");
    // }
    // cls.toggle("started", (this.video.played.length > 0));

    cls.toggle("ended", this.video.ended);

    PlayableRenderer.prototype._renderPlaybackState.apply(this, arguments);
  },
  _setPlayToggleSymbol: function _setPlayToggleSymbol(symbolName) {
    // if (this.video.ended) {
    // 	console.log("%s::_setPlayToggleSymbol %s -> ended", this.cid, symbolName);
    // }
    // if (this.mediaState === "ready") {
    // 	if (this.playbackRequested && !this._isMediaWaiting()) {
    // 		this._playToggleSymbol.setImageSource(null);
    // 	} else {
    // 		this._playToggleSymbol.setImageSource(this.video);
    // 	}
    // 	this._playToggleSymbol.refreshImageSource();
    // }
    return PlayableRenderer.prototype._setPlayToggleSymbol.call(this, this.video.ended ? "ended" : symbolName);
  },

  /* ---------------------------
  /* _updateBufferedValue
  /* --------------------------- */
  // updateBufferedEvents: "progress canplay canplaythrough playing timeupdate",//loadeddata
  updateBufferedEvents: "progress canplay canplaythrough play playing",
  _updateBufferedValue: function _updateBufferedValue(ev) {
    // if (!this._started) return;
    var bRanges = this.video.buffered;

    if (bRanges.length > 0) {
      this._bufferedValue = bRanges.end(bRanges.length - 1);

      if (this.progressMeter && this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        this.progressMeter.valueTo("available", this._bufferedValue, 300); // this.progressMeter.valueTo("available", this._bufferedValue, Math.max(0, 1000 * (this._bufferedValue - (this.progressMeter.getTargetValue("available") | 0))));
      }
    }
  },

  /* ---------------------------
  /* fullscreen api
  /* --------------------------- */
  _onFullscreenToggle: function _onFullscreenToggle(ev) {
    // NOTE: Ignore if MouseEvent.button is 0 or undefined (0: left-button)
    if (!ev.defaultPrevented && !ev.button && this.model.selected) {
      ev.preventDefault();

      try {
        if (document.hasOwnProperty("fullscreenElement") && document.fullscreenElement !== this.video) {
          document.addEventListener(fullscreenChangeEvent, this._onFullscreenChange, false);
          this.video.requestFullscreen();
        } else if (this.video.webkitSupportsFullscreen && !this.video.webkitDisplayingFullscreen) {
          this.video.addEventListener("webkitbeginfullscreen", this._onFullscreenChange, false);
          this.video.webkitEnterFullScreen();
        }
      } catch (err) {
        this.video.controls = false;
        console.error(err);
      }
    }
  },
  _onFullscreenChange: function _onFullscreenChange(ev) {
    switch (ev.type) {
      case fullscreenChangeEvent:
        // var isOwnFullscreen = Modernizr.prefixed("fullscreenElement", document) === this.video;
        var isOwnFullscreen = document.fullscreenElement === this.video;
        this.video.controls = isOwnFullscreen;

        if (!isOwnFullscreen) {
          document.removeEventListener(fullscreenChangeEvent, this._onFullscreenChange, false);
        }

        break;

      case "webkitbeginfullscreen":
        this.video.controls = true;
        this.video.removeEventListener("webkitbeginfullscreen", this._onFullscreenChange, false);
        this.video.addEventListener("webkitendfullscreen", this._onFullscreenChange, false);
        break;

      case "webkitendfullscreen":
        this.video.removeEventListener("webkitendfullscreen", this._onFullscreenChange, false);
        this.video.controls = false;
        break;
    }
  }
});
module.exports = VideoRenderer;
/* ---------------------------
/* log to screen
/* --------------------------- */

if (DEBUG) {
  module.exports = function (VideoRenderer) {
    if (!VideoRenderer.LOG_TO_SCREEN) return VideoRenderer;
    /** @type {Function} */

    var Color = require("color"); // /** @type {module:underscore.strings/lpad} */
    // var lpad = require("underscore.string/lpad");
    // /** @type {module:underscore.strings/rpad} */
    // var rpad = require("underscore.string/rpad");
    // var fullscreenEvents = [
    // 	fullscreenChangeEvent, fullscreenErrorEvent,
    // 	"webkitbeginfullscreen", "webkitendfullscreen",
    // ];


    var mediaEvents = require("utils/event/mediaEventsEnum");

    var logPlaybackStateEvents, logBufferedEvents, logPlayedEvents; // logPlaybackStateEvents = ["playing", "waiting", "ended", "pause", "seeking", "seeked"];
    // logBufferedEvents = ["progress", "durationchange", "canplay", "play"];
    // logPlayedEvents = ["playing", "timeupdate"];

    logPlaybackStateEvents = ["loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled"];
    logBufferedEvents = ["loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting", "seeking", // seeking changed to true
    "seeked", // seeking changed to false
    "ended"];
    logPlayedEvents = ["play", "pause"]; // Exclude some events from log

    mediaEvents = _.without(mediaEvents, "resize", "error"); // Make sure event subsets exist in the main set

    logPlaybackStateEvents = _.intersection(mediaEvents, logPlaybackStateEvents);
    logBufferedEvents = _.intersection(mediaEvents, logBufferedEvents);
    logPlayedEvents = _.intersection(mediaEvents, logPlayedEvents);

    var readyStateSymbols = _.invert(_.pick(HTMLMediaElement, function (val, key, obj) {
      return /^HAVE_/.test(key);
    }));

    var readyStateToString = function readyStateToString(el) {
      return readyStateSymbols[el.readyState] + "(" + el.readyState + ")";
    };

    var networkStateSymbols = _.invert(_.pick(HTMLMediaElement, function (val, key, obj) {
      return /^NETWORK_/.test(key);
    }));

    var networkStateToString = function networkStateToString(el) {
      return networkStateSymbols[el.networkState] + "(" + el.networkState + ")";
    };

    var mediaErrorSymbols = _.invert(MediaError);

    var mediaErrorToString = function mediaErrorToString(el) {
      return el.error ? mediaErrorSymbols[el.error.code] + "(" + el.error.code + ")" : "[MediaError null]";
    };

    var findRangeIndex = function findRangeIndex(range, currTime) {
      for (var i = 0, ii = range.length; i < ii; i++) {
        if (range.start(i) <= currTime && currTime <= range.end(i)) {
          return i;
        }
      }

      return -1;
    };

    var formatVideoError = function formatVideoError(video) {
      return [mediaErrorToString(video), networkStateToString(video), readyStateToString(video)].join(" ");
    };

    var getVideoStatsCols = function getVideoStatsCols() {
      return "0000.000 [Curr/Total] [Seekable]  [Buffered]  networkState readyState      Playback"; // return "0000.620 [t:  0.0  27.4] [s: 27.4 0/1] [b:  0.5 0/1] LOADING(2)   FUTURE_DATA(3)  :: (::)";
    };

    var formatVideoStats = function formatVideoStats(video) {
      var currTime = video.currentTime,
          durTime = video.duration,
          bRanges = video.buffered,
          bRangeIdx,
          sRanges = video.seekable,
          sRangeIdx;
      bRangeIdx = findRangeIndex(bRanges, currTime);
      sRangeIdx = findRangeIndex(sRanges, currTime);
      return ["[" + String(currTime.toFixed(1)).padStart(5) + " " + String(!isNaN(durTime) ? durTime.toFixed(1) : "-").padStart(4) + "]", "[" + String(sRangeIdx >= 0 ? sRanges.end(sRangeIdx).toFixed(1) : "-").padStart(5) + " " + (sRangeIdx >= 0 ? sRangeIdx : "-") + "/" + sRanges.length + "]", "[" + String(bRangeIdx >= 0 ? bRanges.end(bRangeIdx).toFixed(1) : "-").padStart(5) + " " + (bRangeIdx >= 0 ? bRangeIdx : "-") + "/" + bRanges.length + "]", networkStateToString(video).substr(8).padEnd(12), readyStateToString(video).substr(5).padEnd(15), video.ended ? ">:" : video.paused ? "::" : ">>"]; //.join(" ");
    };

    return VideoRenderer.extend({
      /** @override */
      initialize: function initialize() {
        VideoRenderer.prototype.initialize.apply(this, arguments);

        _.bindAll(this, "__handleMediaEvent");

        var fgColor = this.model.attr("color"),
            red = new Color("red"),
            blue = new Color("blue"),
            green = new Color("green");

        for (var i = 0; i < mediaEvents.length; i++) {
          var ev = mediaEvents[i];
          this.video.addEventListener(ev, this.__handleMediaEvent, false);
          var c = new Color(fgColor),
              cc = 1;
          if (logBufferedEvents.indexOf(ev) != -1) c.mix(green, cc /= 2);
          if (logPlayedEvents.indexOf(ev) != -1) c.mix(red, cc /= 2);
          if (logPlaybackStateEvents.indexOf(ev) != -1) c.mix(blue, cc /= 2);
          this.__logColors[ev] = c.rgb().string();
        }

        this.video.addEventListener("error", this.__handleMediaEvent, true);
      },

      /** @override */
      remove: function remove() {
        VideoRenderer.prototype.remove.apply(this, arguments);

        for (var i = 0; i < mediaEvents.length; i++) {
          if (mediaEvents[i] == "error") continue;
          this.video.removeEventListener(mediaEvents[i], this.__handleMediaEvent, false);
        }

        this.video.removeEventListener("error", this.__handleMediaEvent, true);
      },
      // /** @override */
      // _onVisibilityChange: function(ev) {
      // 	VideoRenderer.prototype._onVisibilityChange.apply(this, arguments);
      // 	var stateVal = Modernizr.prefixed("visibilityState", document);
      // 	this.__logEvent("visibilityState:" + stateVal, ev.type + ":" + stateVal);
      // },
      //
      // /** @override */
      // _onFullscreenChange: function(ev) {
      // 	VideoRenderer.prototype._onFullscreenChange.apply(this, arguments);
      // 	var logtype = (document.fullscreenElement === this.video ? "enter:" : "exit:") + ev.type;
      // 	this.__logEvent("document.fullscreenElement: " + this.cid, logtype);
      // },

      /** @override */
      _onFullscreenToggle: function _onFullscreenToggle(ev) {
        if (!ev.defaultPrevented && this.model.selected) {
          this.__logEvent("fullscreen-toggle", ev.type);
        }

        VideoRenderer.prototype._onFullscreenToggle.apply(this, arguments);
      },

      /** @override */
      _playbackTimeoutFn_playing: function _playbackTimeoutFn_playing() {
        VideoRenderer.prototype._playbackTimeoutFn_playing.apply(this, arguments); // this.__logEvent(formatVideoStats(this.video).join(" "), "timeout-play");


        this.__handleMediaEvent({
          type: "timeout-play",
          timeStamp: null,
          isTimeout: true
        });
      },

      /** @override */
      _playbackTimeoutFn_waiting: function _playbackTimeoutFn_waiting() {
        VideoRenderer.prototype._playbackTimeoutFn_waiting.apply(this, arguments); // this.__logEvent(formatVideoStats(this.video).join(" "), "timeout-wait");


        this.__handleMediaEvent({
          type: "timeout-wait",
          timeStamp: null,
          isTimeout: true
        });
      },
      __handleMediaEvent: function __handleMediaEvent(ev) {
        var evmsg = formatVideoStats(this.video);

        if (this.playbackRequested === true) {
          evmsg.push("(>>)");
        } else if (this.playbackRequested === false) {
          evmsg.push("(::)");
        } else {
          evmsg.push("(--)");
        }

        if (this.playbackRequested) {
          evmsg.push(this._playbackTimeoutID !== -1 ? "W" : "-");
        } else {
          evmsg.push(this._playbackTimeoutID !== -1 ? "?" : "!");
        } // evmsg.push(this._playToggleSymbol.symbolName);


        var ts, tc;

        if (this.updatePlaybackEvents.indexOf(ev.type) > -1 || ev.isTimeout) {
          // evmsg.push(this._playbackStartTS.toFixed(2));
          ts = ev.timeStamp - this._playbackStartTS;
          tc = this.video.currentTime - this._playbackStartTC;
          ts *= .001; // s to ms

          evmsg.push(Math.abs(tc - ts).toFixed(3));
        } // else {
        // 	ts = this._playbackStartTS;
        // 	tc = this._playbackStartTC;
        // }
        // ts *= .001; // s to ms
        // evmsg.push(Math.abs(tc - ts).toFixed(3));
        // evmsg.push("TC:" + tc.toFixed(3));
        // evmsg.push("TS:" + ts.toFixed(3));


        this.__logEvent(evmsg.join(" "), ev.type);

        if (ev.type === "error" || ev.type === "abort") {
          this.__logMessage(formatVideoError(this.video), ev.type);
        }
      },
      __logEvent: function __logEvent(msg, logtype, color) {
        var logEntryEl = this.__logElement.lastElementChild;

        if (logEntryEl && logEntryEl.getAttribute("data-logtype") == logtype && (logtype === "timeupdate" || logtype === "progress")) {
          var logRepeatVal = parseInt(logEntryEl.getAttribute("data-logrepeat"));
          logEntryEl.textContent = this.__getTStamp() + " " + msg;
          logEntryEl.setAttribute("data-logrepeat", isNaN(logRepeatVal) ? 2 : ++logRepeatVal);
        } else {
          this.__logMessage(msg, logtype, color);
        }
      },
      __getHeaderText: function __getHeaderText() {
        return getVideoStatsCols();
      }
    });
  }(module.exports);
}

}).call(this,true,require("underscore"))

},{"./VideoRenderer.hbs":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/VideoRenderer.hbs","app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","app/view/component/CanvasProgressMeter":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/CanvasProgressMeter.js","app/view/component/PlayToggleSymbol":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/component/PlayToggleSymbol.js","app/view/render/PlayableRenderer":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/render/PlayableRenderer.js","color":"color","underscore":"underscore","utils/event/mediaEventsEnum":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/event/mediaEventsEnum.js","utils/prefixedEvent":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedEvent.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/Carousel.EmptyRenderer.Bundle.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function";

  return "<div id=\"desc_b"
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"content sizing mdown\">"
    + ((stack1 = ((helper = (helper = helpers.desc || (depth0 != null ? depth0.desc : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"desc","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/CollectionStack.Media.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function";

  return "<div id=\"desc_m"
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"content sizing\"><p>"
    + ((stack1 = ((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</p>"
    + ((stack1 = ((helper = (helper = helpers.sub || (depth0 != null ? depth0.sub : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sub","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/ErrorBlock.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "		<p><code>"
    + container.escapeExpression(((helper = (helper = helpers.infoSrc || (depth0 != null ? depth0.infoSrc : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"infoSrc","hash":{},"data":data}) : helper)))
    + "</code></p>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"error-title color-fg color-reverse\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</div>\n<div class=\"error-message color-fg\">\n	<p><strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong> <code>"
    + alias4(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"message","hash":{},"data":data}) : helper)))
    + "</code></p>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.infoSrc : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/_helpers.js":[function(require,module,exports){
"use strict";

// var Handlebars = require("handlebars")["default"];
var Handlebars = require("hbsfy/runtime");
/** @type {Function} */


var Color = require("color");
/** @type {module:app/control/Globals} */


var Globals = require("app/control/Globals"); // (function() {


var helpers = {
  /*
  /* Arithmetic helpers
  /*/
  add: function add(value, addition) {
    return value + addition;
  },
  subtract: function subtract(value, substraction) {
    return value - substraction;
  },
  divide: function divide(value, divisor) {
    return value / divisor;
  },
  multiply: function multiply(value, multiplier) {
    return value * multiplier;
  },
  floor: function floor(value) {
    return Math.floor(value);
  },
  ceil: function ceil(value) {
    return Math.ceil(value);
  },
  round: function round(value) {
    return Math.round(value);
  },
  global: function global(value) {
    return Globals[value];
  },

  /*
  /* Flow control helpers
  /*/
  is: function is(a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
  },
  isnot: function isnot(a, b, opts) {
    return a !== b ? opts.fn(this) : opts.inverse(this);
  },
  isany: function isany(value) {
    var i = 0,
        ii = arguments.length - 2,
        opts = arguments[ii + 1];

    do {
      if (value === arguments[++i]) {
        return opts.fn(this);
      }
    } while (i < ii);

    return opts.inverse(this);
  },
  contains: function contains(a, b, opts) {
    return a.indexOf(b) !== -1 ? opts.fn(this) : opts.inverse(this);
  },
  ignore: function ignore() {
    return "";
  },

  /*
  /* Color helpers
  /*/
  mix: function mix(colora, colorb, amount) {
    return new Color(colora).mix(new Color(colorb), amount).rgb().string();
  },
  lighten: function lighten(color, amount) {
    return new Color(color).lighten(amount).rgb().string();
  },
  darken: function darken(color, amount) {
    return new Color(color).darken(amount).rgb().string();
  } // colorFormat: function(color, fmt) {
  // 	switch (fmt) {
  // 		case "rgb":
  // 			return new Color(color).rgb().string();
  // 		case "hsl":
  // 			return new Color(color).hsl().string();
  // 		case "hex": default:
  // 			return new Color(color).hex().string();
  // 	}
  // },

};

for (var helper in helpers) {
  if (helpers.hasOwnProperty(helper)) {
    Handlebars.registerHelper(helper, helpers[helper]);
  }
} // })();
// module.exports = Handlebars;

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","color":"color","hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/svg/CogSymbol.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<svg class=\"cog-symbol icon\" viewBox=\"-100 -100 200 200\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMidYMid meet\">\n	<path d=\"M11.754,-99.307c-7.809,-0.924 -15.699,-0.924 -23.508,0l-3.73,20.82c-6.254,1.234 -12.338,3.21 -18.123,5.888l-15.255,-14.651c-6.861,3.842 -13.244,8.48 -19.018,13.818l9.22,19.036c-4.335,4.674 -8.095,9.849 -11.201,15.416l-20.953,-2.886c-3.292,7.141 -5.731,14.645 -7.265,22.357l18.648,9.981c-0.759,6.329 -0.759,12.727 0,19.056l-18.648,9.981c1.534,7.712 3.973,15.216 7.265,22.357l20.953,-2.886c3.106,5.567 6.866,10.742 11.201,15.416l-9.22,19.036c5.774,5.338 12.157,9.976 19.018,13.818l15.255,-14.651c5.785,2.678 11.869,4.654 18.123,5.888l3.73,20.82c7.809,0.924 15.699,0.924 23.508,0l3.73,-20.82c6.254,-1.234 12.338,-3.21 18.123,-5.888l15.255,14.651c6.861,-3.842 13.244,-8.48 19.018,-13.818l-9.22,-19.036c4.335,-4.674 8.095,-9.849 11.201,-15.416l20.953,2.886c3.292,-7.141 5.731,-14.645 7.265,-22.357l-18.648,-9.981c0.759,-6.329 0.759,-12.727 0,-19.056l18.648,-9.981c-1.534,-7.712 -3.973,-15.216 -7.265,-22.357l-20.953,2.886c-3.106,-5.567 -6.866,-10.742 -11.201,-15.416l9.22,-19.036c-5.774,-5.338 -12.157,-9.976 -19.018,-13.818l-15.255,14.651c-5.785,-2.678 -11.869,-4.654 -18.123,-5.888l-3.73,-20.82ZM0,-33c18.213,0 33,14.787 33,33c0,18.213 -14.787,33 -33,33c-18.213,0 -33,-14.787 -33,-33c0,-18.213 14.787,-33 33,-33Z\" style=\"fill:currentColor;fill-rule:evenodd;\"/>\n</svg>\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/view/template/svg/FullscreenSymbol.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<svg class=\"fullscreen-symbol\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"-21 -21 42 42\">\n	<path id=\"fullscreen-shadow\" d=\"M-5,5 L-20,20 M-7,20 L-20,20 L-20,7 M5,-5 L20,-20 M7,-20 L20,-20 L20,-7\" class=\"bg-color-stroke\" style=\"fill:none\" vector-effect=\"non-scaling-stroke\" transform=\"translate(2 2)\"/>\n	<path id=\"fullscreen-path\" d=\"M-5,5 L-20,20 M-7,20 L-20,20 L-20,7 M5,-5 L20,-20 M7,-20 L20,-20 L20,-7\" class=\"color-stroke\" style=\"fill:none\" vector-effect=\"non-scaling-stroke\" />\n</svg>\n";
},"useData":true});

},{"hbsfy/runtime":"hbsfy/runtime"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/Timer.js":[function(require,module,exports){
(function (_){
"use strict";

/** @type {module:backbone} */
var Events = require("backbone").Events; // var defaultOptions = {
// 	tick: 1,
// 	onstart: null,
// 	ontick: null,
// 	onpause: null,
// 	onstop: null,
// 	onend: null
// }


var idSeed = 0;

var Timer = function Timer(options) {
  // if (!(this instanceof Timer)) {
  // 	return new Timer(options);
  // }
  this._id = idSeed++; // this._options = {};

  this._duration = 0;
  this._status = "initialized";
  this._start = 0; // this._measures = [];
  // for (var prop in defaultOptions) {
  // 	this._options[prop] = defaultOptions[prop];
  // }
  // this.options(options);
};

_.extend(Timer.prototype, Events, {
  start: function start(duration) {
    if (!_.isNumber(duration) && !this._duration) {
      return this;
    } // duration && (duration *= 1000)


    if (this._timeout && this._status === "started") {
      return this;
    }

    var evName = this._status === "stopped" ? "start" : "resume";
    this._duration = duration || this._duration;
    this._timeout = window.setTimeout(end.bind(this), this._duration); // if (typeof this._options.ontick === "function") {
    // 	this._interval = setInterval(function() {
    // 		this.trigger("tick", this.getDuration())
    // 	}.bind(this), +this._options.tick * 1000)
    // }

    this._start = _now();
    this._status = "started";
    this.trigger(evName, this.getDuration());
    return this;
  },
  pause: function pause() {
    if (this._status !== "started") {
      return this;
    }

    this._duration -= _now() - this._start;
    clear.call(this, false);
    this._status = "paused";
    this.trigger("pause", this.getDuration());
    return this;
  },
  stop: function stop() {
    if (!/started|paused/.test(this._status)) {
      return this;
    }

    clear.call(this, true);
    this._status = "stopped";
    this.trigger("stop");
    return this;
  },
  getDuration: function getDuration() {
    if (this._status === "started") {
      return this._duration - (_now() - this._start);
    }

    if (this._status === "paused") {
      return this._duration;
    }

    return 0;
  },
  getStatus: function getStatus() {
    return this._status;
  }
});

var _now = window.performance ? window.performance.now.bind(window.performance) : Date.now.bind(Date);

function end() {
  clear.call(this);
  this._status = "stopped";
  this.trigger("end");
}

function clear(clearDuration) {
  window.clearTimeout(this._timeout); // window.clearInterval(this._interval);

  if (clearDuration === true) {
    this._duration = 0;
  }
}

Object.defineProperties(Timer.prototype, {
  duration: {
    enumerable: true,
    get: function get() {
      return this.getDuration();
    }
  },
  status: {
    enumerable: true,
    get: function get() {
      return this.getStatus();
    }
  }
});
Object.defineProperties(Timer, {
  STOPPED: {
    enumerable: true,
    value: "stopped"
  },
  STARTED: {
    enumerable: true,
    value: "started"
  },
  PAUSED: {
    enumerable: true,
    value: "paused"
  }
});
module.exports = Timer;

}).call(this,require("underscore"))

},{"backbone":"backbone","underscore":"underscore"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/TransformHelper.js":[function(require,module,exports){
"use strict";

/* -------------------------------
/* Imports
/* ------------------------------- */

/** @type {module:utils/TransformItem} */
var TransformItem = require("./TransformItem");

var idSeed = 0;
var cidSeed = 100;
var slice = Array.prototype.slice;
/**
 * @constructor
 * @type {module:app/helper/TransformHelper}
 */

function TransformHelper() {
  this.id = idSeed++;
  this._items = [];
  this._itemsById = {};
}

TransformHelper.prototype = Object.create({
  /* -------------------------------
  /* Private
  /* ------------------------------- */
  _get: function _get(el) {
    if (this.has(el)) {
      return this._itemsById[el.eid];
    } else {
      return this._add(el);
    }
  },
  _add: function _add(el) {
    var item, id; // id = el.eid || el.cid || el.id;
    // if (!id || (this._itemsById[id] && (this._itemsById[id].el !== el))) {
    // 	id = "elt" + cidSeed++;
    // }
    // if (!el.eid) {
    // 	id = el.eid || el.cid || ("elt" + cidSeed++);
    // }

    id = el.eid || el.cid || "elt" + cidSeed++;
    item = new TransformItem(el, id);
    this._itemsById[id] = item;

    this._items.push(item);

    return item;
  },
  _remove: function _remove(el) {
    if (this.has(el)) {
      var o = this._itemsById[el.eid];

      this._items.splice(this._items.indexOf(o), 1);

      o.destroy();
      delete this._itemsById[el.eid];
    }
  },
  _invoke: function _invoke(funcName, args, startIndex) {
    var i, ii, j, jj, el, o, rr;
    var funcArgs = null;

    if (startIndex !== void 0) {
      funcArgs = slice.call(args, 0, startIndex);
    } else {
      startIndex = 0;
    }

    for (i = startIndex, ii = args.length, rr = []; i < ii; ++i) {
      el = args[i]; // iterate on NodeList, Arguments, Array...

      if (el.length) {
        for (j = 0, jj = el.length; j < jj; ++j) {
          o = this._get(el[j]);
          rr.push(o[funcName].apply(o, funcArgs));
        }
      } else {
        o = this._get(el);
        rr.push(o[funcName].apply(o, funcArgs));
      }
    }

    return rr;
  },

  /* -------------------------------
  /* Public
  /* ------------------------------- */
  has: function has(el) {
    return el.eid && this._itemsById[el.eid] !== void 0;
  },
  getItems: function getItems() {
    var i,
        j,
        el,
        ret = [];

    for (i = 0; i < arguments.length; ++i) {
      el = arguments[i];

      if (el.length) {
        for (j = 0; j < el.length; ++j) {
          ret.push(this._get(el[j]));
        }
      } else {
        ret.push(this._get(el));
      }
    }

    return ret;
  },
  get: function get(el) {
    return this._get(el);
  },
  add: function add() {
    var i, j, el;

    for (i = 0; i < arguments.length; ++i) {
      el = arguments[i];

      if (el.length) {
        for (j = 0; j < el.length; ++j) {
          this._get(el[j]);
        }
      } else {
        this._get(el);
      }
    }
  },
  remove: function remove() {
    var i, j, el;

    for (i = 0; i < arguments.length; ++i) {
      el = arguments[i];

      if (el.length) {
        for (j = 0; j < el.length; ++j) {
          this._remove(el[j]);
        }
      } else {
        this._remove(el);
      }
    }
  },

  /* --------------------------------
  /* public
  /* -------------------------------- */

  /* public: single arg
  /* - - - - - - - - - - - - - - - - */
  hasOffset: function hasOffset(el) {
    return this.has(el) ? this._itemsById[el.eid].hasOffset : void 0;
  },

  /* public: capture
  /* - - - - - - - - - - - - - - - - */
  capture: function capture() {
    this._invoke("capture", arguments);
  },
  captureAll: function captureAll() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].capture();
    }
  },
  clearCapture: function clearCapture() {
    this._invoke("clearCapture", arguments);
  },
  clearAllCaptures: function clearAllCaptures() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].clearCapture();
    }
  },

  /* public: offset
  /* - - - - - - - - - - - - - - - - */
  offset: function offset(x, y) {
    this._invoke("offset", arguments, 2);
  },
  offsetAll: function offsetAll(x, y) {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].offset(x, y);
    }
  },
  clearOffset: function clearOffset() {
    this._invoke("clearOffset", arguments);
  },
  clearAllOffsets: function clearAllOffsets() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].clearOffset();
    }
  },

  /* public: transitions
  /* - - - - - - - - - - - - - - - - */
  runTransition: function runTransition(transition) {
    this._invoke("runTransition", arguments, 1);
  },
  runAllTransitions: function runAllTransitions(transition) {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].runTransition(transition);
    }
  },
  clearTransition: function clearTransition() {
    this._invoke("clearTransition", arguments);
  },
  clearAllTransitions: function clearAllTransitions() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].clearTransition();
    }
  },
  stopTransition: function stopTransition() {
    this._invoke("stopTransition", arguments);
  },
  stopAllTransitions: function stopAllTransitions() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].stopTransition();
    }
  },
  whenTransitionEnds: function whenTransitionEnds() {
    var res = this._invoke("whenTransitionEnds", arguments);

    return res.length != 0 ? Promise.all(res) : Promise.resolve(null);
  },
  whenAllTransitionsEnd: function whenAllTransitionsEnd() {
    return this._items.length != 0 ? Promise.all(this._items.map(function (o) {
      return o.whenTransitionEnds();
    })) : Promise.resolve(null);
  },
  promise: function promise() {
    return arguments.length == 0 ? this.whenAllTransitionsEnd() : this.whenTransitionEnds.call(this, arguments);
  },

  /* -------------------------------
  /* validation
  /* ------------------------------- */
  validate: function validate() {
    for (var i = 0, ii = this._items.length; i < ii; i++) {
      this._items[i].validate();
    }
  }
}, {
  items: {
    get: function get() {
      return this._items;
    }
  }
});
module.exports = TransformHelper;

},{"./TransformItem":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/TransformItem.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/TransformItem.js":[function(require,module,exports){
(function (DEBUG,_){
"use strict";

/* -------------------------------
 * Imports
 * ------------------------------- */

/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/prefixedStyleName} */


var prefixedStyleName = require("utils/prefixedStyleName");
/** @type {module:utils/prefixedEvent} */


var prefixedEvent = require("utils/prefixedEvent");
/** @type {String} */


var transitionEnd = prefixedEvent("transitionend"); //var transitionEnd = require("utils/event/transitionEnd");
// /** @type {Function} */
// var slice = Array.prototype.slice;
// /** @type {module:utils/debug/traceElement} */
// var traceElt = require("./debug/traceElement");
// var traceEltCache = {};
// var log = function() {
// 	var logFn = "log";
// 	var args = slice.apply(arguments);
// 	switch(args[0]) {
// 		case "error":
// 		case "warn":
// 		case "info":
// 			logFn = args.shift();
// 			break;
// 		default:
// 			// break;
// 			return;
// 	}
// 	var el, txId;
// 	if ((el = args[0]) && (txId = el.eid)) {
// 		args[0] = traceEltCache[txId] || (traceEltCache[txId] = el);
// 	}
// 	args[0] = "\t" + args[0];
// 	console[logFn].apply(console, args);
// };

/* jshint -W079 */
// var console = (function(target) {
// 	return Object.getOwnPropertyNames(target).reduce(function(proxy, prop) {
// 		if ((typeof target[prop]) == "function") {
// 			switch (prop) {
// 				case "error":
// 				case "warn":
// 				case "info":
// 					proxy[prop] = function () {
// 						var args = slice.apply(arguments);
// 						if (typeof args[0] == "string") {
// 							args[0] = prop + "::" + args[0];
// 						}
// 						return target[prop].apply(target, args);
// 					};
// 					break;
// 				case "log":
// 					proxy[prop] = function() {};
// 					break;
// 				default:
// 					proxy[prop] = target[prop].bind(target);
// 					break;
// 			}
// 		} else {
// 			Object.defineProperty(proxy, prop, {
// 				get: function() { return target[prop]; },
// 				set: function(val) { target[prop] = val; }
// 			});
// 		}
// 		return proxy;
// 	}, {});
// })(window.console);

/* jshint +W079 */

/* -------------------------------
/* Private static
/* ------------------------------- */

var NO_TRANSITION_VALUE = "none 0s step-start 0s"; // var NO_TRANSITION_VALUE = "all 0.001s step-start 0.001s";

var UNSET_TRANSITION = {
  name: "unset",
  className: "tx-unset",
  property: "none",
  easing: "ease",
  delay: 0,
  duration: 0,
  cssText: "unset"
}; // var translateTemplate = _.template("translate(<%= _renderedX %>px, <%= _renderedY %>px)";
// var translate3dTemplate = _.template("translate3d(<%= _renderedX %>px, <%= _renderedY %>px, 0px)";
// var transitionTemplate = _.template("<%= property %> <% duration/1000 %>s <%= easing %> <% delay/1000 %>s");

var translateTemplate = function (fn) {
  return function (o) {
    return fn(o._renderedX, o._renderedY);
  };
}(require("app/control/Globals").TRANSLATE_TEMPLATE);

var transitionTemplate = function transitionTemplate(o) {
  return o.property + " " + o.duration / 1000 + "s " + o.easing + " " + o.delay / 1000 + "s";
};

var propDefaults = {
  "opacity": "1",
  "visibility": "visible",
  "transform": "matrix(1, 0, 0, 1, 0, 0)",
  "transformStyle": "",
  "transition": "" // "willChange": "",
  // "transitionDuration": "0s",
  // "transitionDelay": "0s",
  // "transitionProperty": "none",
  // "transitionTimingFunction": "ease"

};
var propKeys = Object.keys(propDefaults);
var propNames = propKeys.reduce(function (obj, propName) {
  obj[propName] = prefixedProperty(propName);
  return obj;
}, {});

var styleNames = function (camelToDashed) {
  return propKeys.map(camelToDashed).reduce(function (obj, propName) {
    obj[propName] = prefixedStyleName(propName);
    return obj;
  }, {});
}(require("utils/strings/camelToDashed"));

var resolveAll = function resolveAll(pp, result) {
  if (pp.length != 0) {
    pp.forEach(function (p, i, a) {
      p.resolve(result);
      a[i] = null;
    });
    pp.length = 0;
  }

  return pp;
};

var rejectAll = function rejectAll(pp, reason) {
  if (pp.length != 0) {
    pp.forEach(function (p, i, a) {
      p.reject(reason); //

      a[i] = null;
    });
    pp.length = 0; //
  }

  return pp;
};
/* -------------------------------
 * TransformItem
 * ------------------------------- */

/**
 * @constructor
 */


var TransformItem = function TransformItem(el, id) {
  this.el = el;
  this.id = id;
  this.el.eid = id;
  this._onTransitionEnd = this._onTransitionEnd.bind(this);
  this.el.addEventListener(transitionEnd, this._onTransitionEnd, false);
  this._captureInvalid = false;
  this._capturedChanged = false;
  this._capturedX = null;
  this._capturedY = null;
  this._currCapture = {};
  this._lastCapture = {};
  this._hasOffset = false;
  this._offsetInvalid = false;
  this._offsetX = null;
  this._offsetY = null;
  this._renderedX = null;
  this._renderedY = null;
  this._hasTransition = false;
  this._transitionInvalid = false;
  this._transitionRunning = false;
  this._transition = _.extend({}, UNSET_TRANSITION); //{};

  this._promises = [];
  this._pendingPromises = [];
};

TransformItem.prototype = Object.create({
  /* -------------------------------
  /* Public
  /* ------------------------------- */

  /* destroy
  /* - - - - - - - - - - - - - - - - */
  destroy: function destroy() {
    // NOTE: style property may have been modified; clearOffset(element) should
    // be called explicitly if clean up is required.
    this.el.removeEventListener(transitionEnd, this._onTransitionEnd, false);
    resolveAll(this._pendingPromises, this);
    resolveAll(this._promises, this); // delete this.el.eid;
  },

  /* capture
  /* - - - - - - - - - - - - - - - - */
  capture: function capture(force) {
    // console.log("tx[%s]::capture", this.id);
    if (force) {
      this.clearCapture();
    }

    this._validateCapture();

    return this;
  },
  clearCapture: function clearCapture() {
    // console.log("tx[%s]::clearCapture", this.id);
    // this._hasOffset = false;
    this._captureInvalid = true;
    return this;
  },

  /* offset/clear
  /* - - - - - - - - - - - - - - - - */
  offset: function offset(x, y) {
    // console.log("tx[%s]::offset", this.id);
    this._hasOffset = true;
    this._offsetInvalid = true;
    this._offsetX = x || 0;
    this._offsetY = y || 0; // if (this.immediate) this._validateOffset();

    return this;
  },
  clearOffset: function clearOffset() {
    if (this._hasOffset) {
      // console.log("tx[%s]::clearOffset", this.id);
      this._hasOffset = false;
      this._offsetInvalid = true;
      this._offsetX = null;
      this._offsetY = null; // if (this.immediate) this._validateOffset();
    } // else {
    // 	console.log("tx[%s]::clearOffset no offset to clear", this.id);
    // }


    return this;
  },

  /* transitions
  /* - - - - - - - - - - - - - - - - */
  runTransition: function runTransition(transition) {
    if (!transition) {
      // || (transition.duration + transition.delay) == 0) {
      return this.clearTransition();
    }

    var lastValue = this._transitionValue;
    var lastName = this._transition.name;
    this._transition.property = styleNames["transform"];
    this._transition = _.extend(this._transition, transition);
    this._transitionValue = transitionTemplate(this._transition);

    if (this._transitionInvalid) {
      console.warn("tx[%s]::runTransition set over (%s:'%s' => %s:'%s')", this.id, lastName, lastValue, this._transition.name, this._transitionValue);
    }

    this._hasTransition = true;
    this._transitionInvalid = true; // if (this.immediate) this._validateTransition();

    return this;
  },
  clearTransition: function clearTransition() {
    this._transition = _.extend(this._transition, UNSET_TRANSITION);
    this._transitionValue = NO_TRANSITION_VALUE;
    this._hasTransition = false;
    this._transitionInvalid = true; // if (this.immediate) this._validateTransition();

    return this;
  },
  stopTransition: function stopTransition() {
    // this._transition.name = "[none]";
    // this._transition.property = "none";
    this._transition = _.extend(this._transition, UNSET_TRANSITION);
    this._transitionValue = NO_TRANSITION_VALUE;
    this._hasTransition = false;
    this._transitionInvalid = true; // if (this.immediate) this._validateTransition();

    return this;
  },
  whenTransitionEnds: function whenTransitionEnds() {
    var d, p, pp;

    if (this._transitionInvalid || this._transitionRunning) {
      d = {};
      p = new Promise(function (resolve, reject) {
        d.resolve = resolve;
        d.reject = reject;
      });
      pp = this._transitionInvalid ? this._pendingPromises : this._promises;
      pp.push(d);
    } else {
      p = Promise.resolve(this);
    }

    return p;
  },

  /* validation
  /* - - - - - - - - - - - - - - - - */
  validate: function validate() {
    // this.el.removeEventListener(transitionEnd, this._onTransitionEnd, false);
    this._ignoreEvent = true;

    if (this._captureInvalid) {
      var lastX = this._renderedX !== null ? this._renderedX : this._capturedX,
          lastY = this._renderedY !== null ? this._renderedY : this._capturedY; // this._validateTransition();

      this._validateCapture();

      this._validateOffset();

      var currX = this._renderedX !== null ? this._renderedX : this._capturedX,
          currY = this._renderedY !== null ? this._renderedY : this._capturedY;

      if (lastX === currX && lastY === currY) {
        this._hasTransition && console.warn("tx[%s]::validate unchanged: last:[%i,%i] curr:[%i,%i]", this.el.id || this.id, lastX, lastY, currX, currY); // console.info("tx[%s]::validate unchanged: last:[%f,%f] curr:[%f,%f] render:[%f,%f] captured[%f,%f]", this.el.id || this.id, lastX, lastY, currX, currY, this._renderedX, this._renderedY, this._capturedX, this._capturedY);

        this.clearTransition(); // this._validateTransition();
      }

      this._validateTransition();
    } else {
      // this._validateCapture();
      this._validateTransition();

      this._validateOffset();
    } // this.el.addEventListener(transitionEnd, this._onTransitionEnd, false);


    this._ignoreEvent = false; // if (this._capturedChanged) {
    // 	console.error("tx[%s]::validate capture changed: [%f,%f]", this.id, this._capturedX, this._capturedY);
    // }

    this._capturedChanged = false;
    return this;
  },

  /* -------------------------------
  /* Private
  /* ------------------------------- */
  _validateCapture: function _validateCapture() {
    if (!this._captureInvalid) {
      return;
    } // var computed, capturedValues;


    var transformValue = null;

    if (this._hasOffset && !this._offsetInvalid) {
      // this is an explicit call to capture() instead of a subcall from _validateOffset()
      transformValue = this._getCSSProp("transform");

      if (transformValue === "") {
        console.error("tx[%s]::_capture valid offset (%i,$i) but transformValue=\"\"", this.id, this._offsetX, this._offsetY);
      }

      this._removeCSSProp("transform");
    } // NOTE: reusing object, all props will be overwritten


    this._lastCapture = this._currCapture;
    this._currCapture = this._getComputedCSSProps();

    if (this._currCapture.transform !== this._lastCapture.transform) {
      var m, mm; //, ret = {};

      mm = this._currCapture.transform.match(/(matrix|matrix3d)\(([^\)]+)\)/);

      if (mm) {
        m = mm[2].split(",");

        if (mm[1] === "matrix") {
          this._capturedX = parseFloat(m[4]);
          this._capturedY = parseFloat(m[5]);
        } else {
          this._capturedX = parseFloat(m[12]);
          this._capturedY = parseFloat(m[13]);
        }
      } else {
        this._capturedX = 0;
        this._capturedY = 0;
      }

      this._capturedChanged = true;
    }

    if (transformValue !== null) {
      console.log("tx[%s]::_capture reapplying '%s'", this.id, transformValue);

      this._setCSSProp("transform", transformValue);
    }

    this._captureInvalid = false;
  },
  _validateOffset: function _validateOffset() {
    if (this._offsetInvalid) {
      // this._validateCapture();
      this._offsetInvalid = false;

      if (this._hasOffset) {
        var tx = this._offsetX + this._capturedX;
        var ty = this._offsetY + this._capturedY;

        if (tx !== this._renderedX || ty !== this._renderedY) {
          this._renderedX = tx;
          this._renderedY = ty;

          this._setCSSProp("transform", translateTemplate(this));
        }
      } else {
        this._renderedX = null;
        this._renderedY = null;

        this._removeCSSProp("transform");
      }
    }
  },
  _validateTransition: function _validateTransition() {
    if (this._transitionInvalid) {
      // this._validateCapture();
      this._transitionInvalid = false; // save promises made while invalid

      var pp = this._promises; // prepare _promises and push in new ones

      this._promises = this._pendingPromises; // whatever still here is to be rejected. reuse array

      this._pendingPromises = resolveAll(pp, this); // Set running flag, if there's a transition to run

      this._transitionRunning = this._hasTransition; // Set the css value (which will be empty string if there's no transition)

      this._setCSSProp("transition", this._transitionValue);

      if (DEBUG) {
        if (this._hasTransition) {
          this.el.setAttribute("data-tx", this._transition.name);
        }
      }

      if (!this._hasTransition) {
        // if there is no transition, resolve promises now
        resolveAll(this._promises, this);
      }
    }
  },
  _onTransitionEnd: function _onTransitionEnd(ev) {
    if (this._ignoreEvent) {
      return;
    }

    if (this._transitionRunning && this.el === ev.target && this._transition.property == ev.propertyName) {
      this._hasTransition = false;
      this._transitionRunning = false;

      this._removeCSSProp("transition");

      resolveAll(this._promises, this);

      if (DEBUG) {
        if (this.el.hasAttribute("data-tx")) {
          // this.el.setAttribute("data-tx-last", this.el.getAttribute("data-tx"));
          this.el.removeAttribute("data-tx");
        }
      }
    }
  },

  /* -------------------------------
  /* CSS
  /* ------------------------------- */
  _getCSSProp: function _getCSSProp(prop) {
    return this.el.style[propNames[prop]]; // return this.el.style[prefixedProperty(prop)];
    // return this.el.style.getPropertyValue(styleNames[prop]);
  },
  _setCSSProp: function _setCSSProp(prop, value) {
    if (prop === "transition" && value == NO_TRANSITION_VALUE) {
      value = "";
    }

    if (value === null || value === void 0 || value === "") {
      this._removeCSSProp(prop);
    } else {
      this.el.style[propNames[prop]] = value; // this.el.style.setProperty(styleNames[prop], value);
    }
  },
  _removeCSSProp: function _removeCSSProp(prop) {
    this.el.style[propNames[prop]] = ""; // this.el.style.removeProperty(styleNames[prop]);
  },
  _getComputedCSSProps: function _getComputedCSSProps() {
    var values = {};
    var computed = window.getComputedStyle(this.el);

    for (var p in propNames) {
      values[p] = computed[propNames[p]];
    }

    return values;
  }
}, {
  transition: {
    get: function get() {
      return this._transition;
    }
  },
  hasTransition: {
    get: function get() {
      return this._hasTransition;
    }
  },
  capturedChanged: {
    get: function get() {
      return this._capturedChanged;
    }
  },
  capturedX: {
    get: function get() {
      return this._capturedX;
    }
  },
  capturedY: {
    get: function get() {
      return this._capturedY;
    }
  },
  hasOffset: {
    get: function get() {
      return this._hasOffset;
    }
  },
  offsetX: {
    get: function get() {
      return this._offsetX;
    }
  },
  offsetY: {
    get: function get() {
      return this._offsetY;
    }
  }
});
module.exports = TransformItem;

}).call(this,true,require("underscore"))

},{"app/control/Globals":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/control/Globals.js","underscore":"underscore","utils/prefixedEvent":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedEvent.js","utils/prefixedProperty":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedProperty.js","utils/prefixedStyleName":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedStyleName.js","utils/strings/camelToDashed":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/strings/camelToDashed.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/array/difference.js":[function(require,module,exports){
"use strict";

module.exports = function (a1, a2, dest) {
  return a1.reduce(function (res, o, i, a) {
    if (a2.indexOf(o) == -1) res.push(o);
    return res;
  }, dest !== void 0 ? dest : []);
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/CanvasHelper.js":[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var PI2 = Math.PI * 2;
var splice = Array.prototype.splice; // var concat = Array.prototype.concat;

/*
 *	Using javascript to convert radians to degrees with positive and
 *	negative values [https://stackoverflow.com/questions/29588404/]
 *	`(((r * (180/Math.PI)) % 360) + 360) % 360;`
 *	`function mod(n, m) {
 *		return ((n % m) + m) % m;
 *	}`
 */

var _mod = function _mod(n, m) {
  return (n % m + m) % m;
};

var setStyle = function setStyle(ctx, s) {
  if (_typeof(s) != "object") return;

  for (var p in s) {
    switch (_typeof(ctx[p])) {
      case "undefined":
        break;

      case "function":
        if (Array.isArray(s[p])) {
          ctx[p].apply(ctx, s[p]);
        } else {
          ctx[p].call(ctx, s[p]);
        }

        break;

      default:
        ctx[p] = s[p];
    }
  }
};

var _drawShape = function _drawShape(fn, s, ctx) {
  ctx.save();

  if (s) {
    setStyle(ctx, s);
  }

  fn.apply(null, splice.call(arguments, 2));

  if ('strokeStyle' in s) {
    /* ctx.lineWidth > 0 */
    ctx.stroke();
  }

  if ('fillStyle' in s) {
    /* ctx.fillStyle !== "transparent" */
    ctx.fill();
  }

  ctx.restore();
};

module.exports = {
  setStyle: setStyle,
  vGuide: function vGuide(ctx, x) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
  },
  drawVGuide: function drawVGuide(ctx, s, x) {
    _drawShape(this.vGuide, s, ctx, x);
  },
  hGuide: function hGuide(ctx, y) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
  },
  drawHGuide: function drawHGuide(ctx, s, y) {
    _drawShape(this.hGuide, s, ctx, y);
  },
  crosshair: function crosshair(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.restore();
  },
  drawCrosshair: function drawCrosshair(ctx, s, x, y, r) {
    _drawShape(this.crosshair, s, ctx, x, y, r);
  },
  circle: function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, PI2);
  },
  drawCircle: function drawCircle(ctx, s, x, y, r) {
    _drawShape(this.circle, s, ctx, x, y, r);
  },
  square: function square(ctx, x, y, r) {
    r = Math.floor(r / 2) * 2;
    ctx.beginPath();
    ctx.rect(x - r, y - r, r * 2, r * 2);
  },
  drawSquare: function drawSquare(ctx, s, x, y, r) {
    _drawShape(this.square, s, ctx, x, y, r);
  },
  arrowhead: function arrowhead(ctx, x, y, r, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(_mod(t, PI2));
    ctx.translate(r * 0.5, 0);
    ctx.beginPath();
    ctx.moveTo(0, 0); // ctx.lineTo(-r, r * Math.SQRT1_2);
    // ctx.lineTo(-r, -r * Math.SQRT1_2);

    ctx.lineTo(-r * Math.SQRT2, r * Math.SQRT1_2);
    ctx.arcTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2, r); // ctx.quadraticCurveTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2);

    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.restore();
  },
  drawArrowhead: function drawArrowhead(ctx, s, x, y, r, t) {
    _drawShape(this.arrowhead, s, ctx, x, y, r, t);
  },
  arrowhead2: function arrowhead2(ctx, x, y, r, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(_mod(t, PI2));
    ctx.beginPath();
    ctx.moveTo(-r, r * Math.SQRT1_2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-r, -r * Math.SQRT1_2);
    ctx.restore();
  },
  drawArrowhead2: function drawArrowhead2(ctx, s, x, y, r, t) {
    _drawShape(this.arrowhead, s, ctx, x, y, r, t);
  },
  rect: function rect(ctx, a1, a2, a3, a4) {
    if (_typeof(a1) === "object") {
      a4 = a1.height;
      a3 = a1.width;
      a2 = a1.top;
      a1 = a1.left;
    }

    ctx.beginPath();
    ctx.rect(a1, a2, a3, a4);
  },
  drawRect: function drawRect(ctx, s, a1, a2, a3, a4) {
    _drawShape(this.rect, s, ctx, a1, a2, a3, a4);
  },
  roundRect: function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },
  drawRoundRect: function drawRoundRect(ctx, s, x, y, w, h, r) {
    _drawShape(this.roundRect, s, ctx, x, y, h, r);
  },
  quadRoundRect: function quadRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.closePath();
  },
  drawQuadRoundRect: function drawQuadRoundRect(ctx, s, x, y, w, h, r) {
    _drawShape(this.quadRoundRect, s, ctx, x, y, h, r);
  }
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/BlurStack.js":[function(require,module,exports){
"use strict";

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = function () {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/desaturate.js":[function(require,module,exports){
"use strict";

module.exports = function (imageData, adj) {
  var pixels = imageData.data;
  var r, g, b, s;
  var i, ii;

  if (arguments.length === 1) {
    for (i = 0, ii = pixels.length; i < ii; i += 4) {
      pixels[i] = (pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 144) / 1000;
    }
  } else if (arguments.length === 2) {
    if (0 >= adj > 1) {
      console.warn("argument out of range (1-0)", adj);
      return imageData;
    }

    for (i = 0, ii = pixels.length; i < ii; i += 4) {
      r = pixels[i];
      g = pixels[i + 1];
      b = pixels[i + 2]; // s = ((r * 299 + g * 587 + b * 144) / 1000) * (1 - adj);
      // pixels[i] = r * adj + s;
      // pixels[i + 1] = g * adj + s;
      // pixels[i + 2] = b * adj + s;

      s = Math.max(r, g, b);

      if (s === 0) {
        pixels[i] = Math.round(255 * adj);
        pixels[i + 1] = Math.round(255 * adj);
        pixels[i + 2] = Math.round(255 * adj);
      } else {
        s = 255 * adj / s;
        pixels[i] = Math.round(r * s);
        pixels[i + 1] = Math.round(g * s);
        pixels[i + 2] = Math.round(b * s);
      }
    }
  }

  return imageData;
}; // function saturation(r,g,b, s) {
//     var min = rgb.indexOf(Math.min.apply(null, rgb)), // index of min
//         max = rgb.indexOf(Math.max.apply(null, rgb)), // index of max
//         mid = [0, 1, 2].filter(function (i) {return i !== min && i !== max;})[0],
//         a = rgb[max] - rgb[min],
//         b = rgb[mid] - rgb[min],
//         x = rgb[max],
//         arr = [x, x, x];
//     if (min === max) {
//         min = 2; // both max = min = 0, => mid = 1, so set min = 2
//         a = 1;   // also means a = b = 0, don't want division by 0 in `b / a`
//     }
//
//     arr[max] = x;
//     arr[min] = Math.round(x * (1 - s));
//     arr[mid] = Math.round(x * ((1 - s) + s * b / a));
//
//     return arr;
// }
// function nvalue(rgb, v) {
//     var x = Math.max.apply(null, rgb);
//     if (x === 0)
//         return [
//             Math.round(255 * v),
//             Math.round(255 * v),
//             Math.round(255 * v)
//         ];
//     x = 255 * v / x;
//     return [
//         Math.round(rgb[0] * x),
//         Math.round(rgb[1] * x),
//         Math.round(rgb[2] * x)
//     ];
// }

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/getAverageRGB.js":[function(require,module,exports){
"use strict";

module.exports = function (imageData, opts) {
  var pixels = imageData.data;
  var pixelsNum = pixels.length;
  var rgbAvg = [0, 0, 0];
  var i;

  for (i = 0; i < pixelsNum; i += 4) {
    rgbAvg[0] += pixels[i];
    rgbAvg[1] += pixels[i + 1];
    rgbAvg[2] += pixels[i + 2];
  }

  for (i = 0; i < 3; i++) {
    rgbAvg[i] = rgbAvg[i] / (pixelsNum / 4) | 0;
  }

  return rgbAvg;
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/mul_table.js":[function(require,module,exports){
"use strict";

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/multiply.js":[function(require,module,exports){
"use strict";

module.exports = function (pixels, adjustment) {
  var d = pixels.data;

  for (var i = 0; i < d.length; i += 4) {
    d[i] *= adjustment;
    d[i + 1] *= adjustment;
    d[i + 2] *= adjustment;
  }

  return pixels;
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/shg_table.js":[function(require,module,exports){
"use strict";

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/stackBlurRGB.js":[function(require,module,exports){
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* jshint ignore:start */

/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr:
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
var mul_table = require("./mul_table");

var shg_table = require("./shg_table");

var BlurStack = require("./BlurStack");

module.exports = function (imageData, opts) {
  if (_typeof(opts) === "object" && opts.hasOwnProperty("radius")) {
    opts = opts.radius;
  }

  if (typeof opts !== "number" || isNaN(opts) || 1 > opts) {
    // no valid argument value do nothing
    return imageData;
  }

  var radius = opts | 0;
  var pixels = imageData.data,
      width = imageData.width,
      height = imageData.height;
  var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;
  var div = radius + radius + 1;
  var w4 = width << 2;
  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;

  for (i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();
    if (i == radiusPlus1) var stackEnd = stack;
  }

  stack.next = stackStart;
  var stackIn = null;
  var stackOut = null;
  yw = yi = 0;
  var mul_sum = mul_table[radius];
  var shg_sum = shg_table[radius];

  for (y = 0; y < height; y++) {
    r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    for (i = 1; i < radiusPlus1; i++) {
      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
      r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (x = 0; x < width; x++) {
      pixels[yi] = r_sum * mul_sum >> shg_sum;
      pixels[yi + 1] = g_sum * mul_sum >> shg_sum;
      pixels[yi + 2] = b_sum * mul_sum >> shg_sum;
      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
      r_in_sum += stackIn.r = pixels[p];
      g_in_sum += stackIn.g = pixels[p + 1];
      b_in_sum += stackIn.b = pixels[p + 2];
      r_sum += r_in_sum;
      g_sum += g_in_sum;
      b_sum += b_in_sum;
      stackIn = stackIn.next;
      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (x = 0; x < width; x++) {
    g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
    yi = x << 2;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    yp = width;

    for (i = 1; i <= radius; i++) {
      yi = yp + x << 2;
      r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      stack = stack.next;

      if (i < heightMinus1) {
        yp += width;
      }
    }

    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p] = r_sum * mul_sum >> shg_sum;
      pixels[p + 1] = g_sum * mul_sum >> shg_sum;
      pixels[p + 2] = b_sum * mul_sum >> shg_sum;
      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
      r_sum += r_in_sum += stackIn.r = pixels[p];
      g_sum += g_in_sum += stackIn.g = pixels[p + 1];
      b_sum += b_in_sum += stackIn.b = pixels[p + 2];
      stackIn = stackIn.next;
      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
};
/* jshint ignore:end */

},{"./BlurStack":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/BlurStack.js","./mul_table":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/mul_table.js","./shg_table":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/bitmap/shg_table.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/canvas/calcArcHConnector.js":[function(require,module,exports){
"use strict";

/**
 * @module utils/canvas/calcArcHConnector
 */
module.exports = function (x1, y1, r1, x2, y2, r2, ro) {
  var qx = x2 > x1 ? 1 : -1;
  var qy = y2 > y1 ? 1 : -1;
  var dy = Math.abs(y2 - y1);
  var dx = Math.abs(x2 - x1);
  var rr = r1 + r2;
  var tx1, tx2, c, tx, ty;

  if (dy < 1) {
    // points are aligned horizontally, no arcs needed
    tx1 = 0;
    tx2 = dx; // return [x1, x2];
  }

  if (dy >= rr && dx >= rr) {
    // arcs fit horizontally:
    // second circle center is r1+r2, tangent intersect at x=r1
    c = rr;
    tx1 = r1;
    tx2 = r1;
  } else {
    // arcs overlap horizontally:
    // find second circle center
    c = Math.sqrt(dy * r2 * 2 + dy * r1 * 2 - dy * dy); // circles tangent point

    tx = c * r1 / rr;
    ty = dy * r1 / rr;

    if (r1 < ty || c > dx) {
      return;
    } // tangent perpendicular slope


    var slope = (rr - dy) / c; // tangent intersections

    tx1 = tx - ty * slope;
    tx2 = dy * slope + tx1;
    /*
    // circle centers
    var ccx1, ccy1, ccx2, ccy2;
    ccx1 = 0;
    ccy1 = r1;
    ccx2 = c;
    ccy2 = dy - r2;
    // tangent perpendicular slope
    var slope = (ccy1 - ccy2) / (ccx2 - ccx1);
    var xSec = tx - (ty * slope);
    // tangent intersections
    tx1 = xSec;
    tx2 = (dy * slope) + xSec;
    */
  } // offset arcTo's in x-axis


  if (ro > 0) {
    if (ro > 1) {
      ro = Math.min(dx - rr, ro);
    } else {
      ro *= dx - rr;
    }

    tx1 += ro;
    tx2 += ro;
  }

  return [tx1 * qx + x1, tx2 * qx + x1, tx1, tx2];
};
/*
var drawArcConnector = function(ctx, x1, y1, x2, y2, r) {
	var dx, dy, hx, hy, gx, gy;

	hx = 0;
	hy = 0;
	gx = (x1 + x2) / 2;
	gy = (y1 + y2) / 2;
	dx = Math.abs(x1 - gx);
	dy = Math.abs(y1 - gy);

	if (dx < r && dy < r) {
		r = Math.min(dx * Math.SQRT1_2, dy * Math.SQRT1_2);
	} else {
		if (dx < r) {
			hy = Math.acos(dx / r) * r * 0.5;
			if (y1 > y2) hy *= -1;
		}
		if (dy < r) {
			hx = Math.acos(dy / r) * r * 0.5;
			if (x1 > x2) hx *= -1;
		}
	}
	ctx.arcTo(gx - hx, y1, gx + hx, y2, r);
	ctx.arcTo(gx + hx, y2, x2, y2, r);
};

var drawArcConnector2 = function(ctx, x1, y1, x2, y2, r) {
	var dx, dy, hx, hy, cx1, cx2;

	hx = 0;
	hy = 0;
	dx = Math.abs(x2 - x1) / 2;
	dy = Math.abs(y1 - y2) / 2;

	if (dx < r && dy < r) {
		r = Math.min(dx * Math.SQRT1_2, dy * Math.SQRT1_2);
	} else {
		if (dx < r) {
			hy = Math.acos(dx / r) * r;
		}
		if (dy < r) {
			hx = Math.acos(dy / r) * r;
		}
	}
	cx1 = x1 + dx;
	cx2 = x2 - (dx - hx / 2);
	ctx.arcTo(cx1, y1, cx2, y2, r);
	ctx.arcTo(cx2, y2, x2, y2, r);
};

var drawArcConnector1 = function(ctx, x1, y1, x2, y2, r) {
	var dx, dy, cx;

	dx = Math.abs(x2 - x1) / 2;
	dy = Math.abs(y1 - y2) / 2;
	r = Math.min(r, dy * Math.SQRT1_2);
	if (x1 < x2) {
		cx = x1 + dx + r;
	} else {
		cx = x2 - dx - r;
	}
	// cx = (x2 + x1) / 2;
	// cx += x1 < x2 ? r : -r;

	ctx.arcTo(cx, y1, cx, y2, r);
	ctx.arcTo(cx, y2, x2, y2, r);
};
*/

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/css/getBoxEdgeStyles.js":[function(require,module,exports){
(function (DEBUG){
"use strict";

/* global HTMLElement, CSSStyleDeclaration */
// var parseSize = require("./parseSize");
var CSS_BOX_PROPS = ["boxSizing", "position", "objectFit"];
var CSS_EDGE_PROPS = ["marginTop", "marginBottom", "marginLeft", "marginRight", "borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"];
var CSS_POS_PROPS = ["top", "bottom", "left", "right"];
var CSS_SIZE_PROPS = ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"];
var CSS_ALL_PROPS = CSS_EDGE_PROPS.concat(CSS_SIZE_PROPS, CSS_POS_PROPS); // var COMPUTED_PROPS = [
// 	"clientLeft", "clientTop", "clientWidth", "clientHeight",
// 	"offsetLeft", "offsetTop", "offsetWidth", "offsetHeight"
// ];
// var o = _.pick(element, function(val) {
// 	return /^(offset|client)(Left|Top|Width|Height)/.test(val);
// });

var cssDimensionRE = /^(-?[\d\.]+)(px|em|rem)$/; // var cssDimRe = /^([-\.0-9]+)([rem]+)$/;

module.exports = function (s, m, includeSizePos) {
  if (s instanceof HTMLElement) {
    s = getComputedStyle(s);
  }

  if (DEBUG) {
    if (!(s instanceof CSSStyleDeclaration)) {
      throw new Error("Not a CSSStyleDeclaration nor HTMLElement");
    }
  }

  var v, p, i, ii, emPx, remPx;
  m || (m = {});
  emPx = m.fontSize = parseFloat(s.fontSize);

  for (i = 0, ii = CSS_BOX_PROPS.length; i < ii; i++) {
    p = CSS_BOX_PROPS[i];

    if (p in s) {
      m[p] = s[p];
    }
  }

  var cssProps = includeSizePos ? CSS_EDGE_PROPS : CSS_ALL_PROPS;

  for (i = 0, ii = cssProps.length; i < ii; i++) {
    p = cssProps[i];
    m["_" + p] = s[p];

    if (s[p] && (v = cssDimensionRE.exec(s[p]))) {
      if (v[2] === "px") {
        m[p] = parseFloat(v[1]);
      } else if (v[2] === "em") {
        m[p] = parseFloat(v[1]) * emPx;
      } else if (v[2] === "rem") {
        remPx || (remPx = parseFloat(getComputedStyle(document.documentElement).fontSize));
        m[p] = parseFloat(v[1]) * remPx;
      } else {
        console.warn("Ignoring value", p, v[1], v[2]);
        m[p] = null;
      }
    } // else {
    //	console.warn("Ignoring unitless value", p, v);
    //}

  }

  return m;
};

}).call(this,true)

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/ease/fn/easeInQuad.js":[function(require,module,exports){
"use strict";

/* easeInQuad */
module.exports = function (x, t, b, c, d) {
  return c * (t /= d) * t + b;
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/ease/fn/easeOutQuad.js":[function(require,module,exports){
"use strict";

/* easeOutQuad */
module.exports = function (t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b;
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/ease/fn/linear.js":[function(require,module,exports){
"use strict";

/**
 * @param {number} i current iteration
 * @param {number} s start value
 * @param {number} d change in value
 * @param {number} t total iterations
 * @return {number}
 */
var linear = function linear(i, s, d, t) {
  return d * i / t + s;
};

module.exports = linear;

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/event/mediaEventsEnum.js":[function(require,module,exports){
"use strict";

/* https://html.spec.whatwg.org/multipage/media.html#event-media-canplay
 */
module.exports = [// networkState
"loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled", // readyState
"loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting", //
"seeking", // seeking changed to true
"seeked", // seeking changed to false
"ended", // ended is true
//
"durationchange", // duration updated
"timeupdate", // currentTime updated
"play", // paused is false
"pause", // paused is false
"paused", // ??
"ratechange", //
"resize", "volumechange"];

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/geom/inflateRect.js":[function(require,module,exports){
"use strict";

/**
 * @module app/view/component/GraphView
 */
module.exports = function (rect, dx, dy) {
  if (arguments.length == 2) {
    dy = dx;
  }

  var r = {
    width: rect.width + dx * 2,
    height: rect.height + dy * 2
  };

  if (r.width >= 0) {
    r.left = rect.left - dx;
    r.right = r.left + r.width;
    r.x = r.left;
  } else {
    r.right = rect.right + dx;
    r.left = rect.right - r.width;
    r.y = r.right;
  }

  if (r.height >= 0) {
    r.top = rect.top - dy;
    r.bottom = r.top + r.height;
    r.y = r.top;
  } else {
    r.bottom = rect.bottom + dy;
    r.top = rect.bottom - r.height;
    r.y = r.bottom;
  }

  return r;
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedEvent.js":[function(require,module,exports){
"use strict";

/** @type {Array} lowercase prefixes */
var lcPrefixes = [""].concat(require("./prefixes"));
/** @type {Array} capitalized prefixes */

var ucPrefixes = lcPrefixes.map(function (s) {
  return s === "" ? s : s.charAt(0).toUpperCase() + s.substr(1);
});
/** @type {Object} specific event solvers */

var _solvers = {};
/** @type {Object} cached values */

var _cache = {};
/**
 * @param {String} name Unprefixed event name
 * @param {?Object} obj Prefix test target
 * @param {?String} testProp Proxy property to test prefixes
 * @return {String|null}
 */

var _prefixedEvent = function _prefixedEvent(name, obj, testProp) {
  var prefixes = /^[A-Z]/.test(name) ? ucPrefixes : lcPrefixes;
  obj || (obj = document);

  for (var i = 0; i < prefixes.length; i++) {
    if (testProp) {
      if (prefixes[i] + testProp in obj) {
        return prefixes[i] + name;
      }
    }

    if ("on" + prefixes[i] + name in obj) {
      return prefixes[i] + name;
    }
  }

  return null;
}; // transitionend


_solvers["transitionend"] = function () {
  var prop,
      style = document.body.style,
      map = {
    "transition": "transitionend",
    "WebkitTransition": "webkitTransitionEnd",
    "MozTransition": "transitionend",
    // "msTransition" : "MSTransitionEnd",
    "OTransition": "oTransitionEnd"
  };

  for (prop in map) {
    if (prop in style) {
      return map[prop];
    }
  }

  return null;
};
/**
 * get the prefixed property
 * @param {String} property name
 * @param {Object} look-up object
 * @returns {String|null} prefixed
 */


module.exports = function (evName) {
  if (!_cache.hasOwnProperty(evName)) {
    _cache[evName] = _solvers.hasOwnProperty(evName) ? _solvers[evName]() : _prefixedEvent.apply(null, arguments);

    if (_cache[evName] === null) {
      console.warn("Event '%s' not found", evName);
    } else {
      console.log("Event '%s' found as '%s'", evName, _cache[evName]);
    }
  }

  return _cache[evName]; // return _cache[evName] || (_cache[evName] = _solvers[evName]? _solvers[evName].call() : _prefixedProperty.apply(null, arguments));
};
/*
var defaultTest = function(name, obj) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	for (var i = 0; i < prefixes.length; i++) {
		if (("on" + prefixes[i] + name) in obj) {
			console.log("Event '%s' found as '%s'", name, prefixes[i] + name);
			return prefixes[i] + name;
		}
	}
	return null;
};

var proxyTest = function(name, obj, testProp) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	for (var i = 0; i < prefixes.length; i++) {
		if ((prefixes[i] + testProp) in obj) {
			console.log("Event %s inferred as '%s' from property '%s'", name, prefixes[i] + name, testProp);
			return prefixes[i] + name;
		}
	}
	return null;
};
*/

},{"./prefixes":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixes.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedProperty.js":[function(require,module,exports){
"use strict";

/**
/* @module utils/prefixedProperty
/*/

/** @type {module:utils/prefixes} */
var prefixes = require("./prefixes");
/** @type {Number} prefix count */


var _prefixNum = prefixes.length;
/** @type {Array} cached values */

var _cache = {};

var _prefixedProperty = function _prefixedProperty(prop, obj) {
  var prefixedProp, camelProp;

  if (prop in obj) {
    console.log("Property '%s' found unprefixed", prop);
    return prop;
  }

  camelProp = prop[0].toUpperCase() + prop.slice(1);

  for (var i = 0; i < _prefixNum; i++) {
    prefixedProp = prefixes[i] + camelProp;

    if (prefixedProp in obj) {
      console.log("Property '%s' found as '%s'", prop, prefixedProp);
      return prefixedProp;
    }
  }

  console.error("Property '%s' not found", prop);
  return null;
};
/**
 * get the prefixed property
 * @param {String} property name
 * @param {Object} look-up object
 * @returns {String|null} prefixed
 */


module.exports = function (prop, obj) {
  return _cache[prop] || (_cache[prop] = _prefixedProperty(prop, obj || document.body.style));
};

},{"./prefixes":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixes.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixedStyleName.js":[function(require,module,exports){
"use strict";

/**
/* @module utils/prefixedStyleName
/*/

/** @type {module:utils/prefixes} */
var prefixes = require("./prefixes"); //.map(function(prefix) { return "-" + prefix + "-"; });

/** @type {Number} prefix count */


var _prefixNum = prefixes.length;
/** @type {Array} cached values */

var _cache = {};

var _prefixedStyleName = function _prefixedStyleName(style, styleObj) {
  var prefixedStyle;

  if (style in styleObj) {
    console.log("CSS style '%s' found unprefixed", style);
    return style;
  }

  for (var i = 0; i < _prefixNum; i++) {
    prefixedStyle = "-" + prefixes[i] + "-" + style; // prefixedStyle = prefixes[i] + style;

    if (prefixedStyle in styleObj) {
      console.log("CSS style '%s' found as '%s'", style, prefixedStyle);
      return prefixedStyle;
    }
  }

  console.warn("CSS style '%s' not found", style);
  return null;
};
/**
 * get the prefixed style name
 * @param {String} style name
 * @param {Object} look-up style object
 * @returns {String|Undefined} prefixed
 */


module.exports = function (style, styleObj) {
  // return _cache[style] || (_cache[style] = _prefixedStyleName_reverse(style, styleObj || document.body.style));
  return _cache[style] || (_cache[style] = _prefixedStyleName(style, styleObj || document.body.style));
}; // /** @type {module:utils/strings/camelToDashed} */
// var camelToDashed = require("./strings/camelToDashed");
// /** @type {module:utils/prefixedProperty} */
// var prefixedProperty = require("./prefixedProperty");
// /** @type {module:utils/strings/dashedToCamel} */
// var dashedToCamel = require("./strings/dashedToCamel");
//
// var _prefixedStyleName_reverse = function (style, styleObj) {
// 	var camelProp, prefixedProp;
// 	camelProp = dashedToCamel(style);
// 	prefixedProp = prefixedProperty(camelProp, styleObj);
// 	return prefixedProp? (camelProp === prefixedProp? "" : "-") + camelToDashed(prefixedProp) : null;
// };

},{"./prefixes":"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixes.js"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/prefixes.js":[function(require,module,exports){
"use strict";

module.exports = ["webkit", "moz", "ms", "o"];

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/promise/rejectAll.js":[function(require,module,exports){
"use strict";

module.exports = function (pp, reason) {
  if (pp.length > 0) {
    pp.forEach(function (p, i, a) {
      p.reject(reason);
      a[i] = null;
    });
    pp.length = 0;
  }

  return pp;
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/promise/resolveAll.js":[function(require,module,exports){
"use strict";

module.exports = function (pp, result) {
  if (pp.length != 0) {
    pp.forEach(function (p, i, a) {
      p.resolve(result);
      a[i] = null;
    });
    pp.length = 0;
  }

  return pp;
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/strings/camelToDashed.js":[function(require,module,exports){
"use strict";

module.exports = function (str) {
  return str.replace(/[A-Z]/g, function ($0) {
    return "-" + $0.toLowerCase();
  });
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/strings/stripTags.js":[function(require,module,exports){
"use strict";

module.exports = function (s) {
  return s.replace(/<[^>]+>/g, "");
};

},{}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/utils/touch/SmoothPanRecognizer.js":[function(require,module,exports){
"use strict";

/** @type {module:hammerjs} */
var Hammer = require("hammerjs"); // /**
//  * get a usable string, used as event postfix
//  * @param {Const} state
//  * @returns {String} state
//  */
// function stateStr(state) {
// 	if (state & Hammer.STATE_CANCELLED) {
// 		return "cancel";
// 	} else if (state & Hammer.STATE_ENDED) {
// 		return "end";
// 	} else if (state & Hammer.STATE_CHANGED) {
// 		return "move";
// 	} else if (state & Hammer.STATE_BEGAN) {
// 		return "start";
// 	}
// 	return "";
// }

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */


function dirStr(direction) {
  if (direction == Hammer.DIRECTION_DOWN) {
    return "down";
  } else if (direction == Hammer.DIRECTION_UP) {
    return "up";
  } else if (direction == Hammer.DIRECTION_LEFT) {
    return "left";
  } else if (direction == Hammer.DIRECTION_RIGHT) {
    return "right";
  }

  return "";
} ///**
// * Pan
// * Recognized when the pointer is down and moved in the allowed direction.
// * @constructor
// * @extends AttrRecognizer
// */
//function PanRecognizer() {
//	Hammer.AttrRecognizer.apply(this, arguments);
//
//	this.pX = null;
//	this.pY = null;
//}
//
//inherit(PanRecognizer, Hammer.AttrRecognizer, {
//	/**
//	/* @namespace
//	/* @memberof PanRecognizer
//	/*/
//	defaults: {
//		event: "pan",
//		threshold: 10,
//		pointers: 1,
//		direction: DIRECTION_ALL
//	},
//
//	getTouchAction: function() {
//		var direction = this.options.direction;
//		var actions = [];
//		if (direction & DIRECTION_HORIZONTAL) {
//			actions.push(TOUCH_ACTION_PAN_Y);
//		}
//		if (direction & DIRECTION_VERTICAL) {
//			actions.push(TOUCH_ACTION_PAN_X);
//		}
//		return actions;
//	},
//
//	directionTest: function(input) {
//		var options = this.options;
//		var hasMoved = true;
//		var distance = input.distance;
//		var direction = input.direction;
//		var x = input.deltaX;
//		var y = input.deltaY;
//
//		// lock to axis?
//		if (!(direction & options.direction)) {
//			if (options.direction & DIRECTION_HORIZONTAL) {
//				direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
//				hasMoved = x != this.pX;
//				distance = Math.abs(input.deltaX);
//			} else {
//				direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
//				hasMoved = y != this.pY;
//				distance = Math.abs(input.deltaY);
//			}
//		}
//		input.direction = direction;
//		return hasMoved && distance > options.threshold && direction & options.direction;
//	},
//
//	attrTest: function(input) {
//		return AttrRecognizer.prototype.attrTest.call(this, input) &&
//			(this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
//	},
//
//	emit: function(input) {
//		this.pX = input.deltaX;
//		this.pY = input.deltaY;
//
//		var direction = dirStr(input.direction);
//		if (direction) {
//			this.manager.emit(this.options.event + direction, input);
//		}
//
//		this._super.emit.call(this, input);
//	}
//});

/**
 * SmoothPan
 * @constructor
 * @extends Hammer.Pan
 */


function SmoothPan() {
  var ret = Hammer.Pan.apply(this, arguments);
  this.thresholdOffsetX = null;
  this.thresholdOffsetY = null;
  this.thresholdOffset = null;
  return ret;
}

Hammer.inherit(SmoothPan, Hammer.Pan, {
  emit: function emit(input) {
    // Inheritance breaks, so this code is taken from PanRecognizer.emit
    //	this._super.emit.call(this, input); // Triggers infinite recursion
    //	Hammer.Pan.prototype.emit.apply(this, arguments); // This breaks too
    var threshold = this.options.threshold;
    var direction = input.direction;

    if (this.state == Hammer.STATE_BEGAN) {
      this.thresholdOffsetX = direction & Hammer.DIRECTION_HORIZONTAL ? direction & Hammer.DIRECTION_LEFT ? threshold : -threshold : 0;
      this.thresholdOffsetY = direction & Hammer.DIRECTION_VERTICAL ? direction & Hammer.DIRECTION_UP ? threshold : -threshold : 0; // this.thresholdOffset = (direction & Hammer.DIRECTION_HORIZONTAL)? input.thresholdOffsetX : input.thresholdOffsetY;
      // console.log("RECOGNIZER STATE", dirStr(direction), stateStr(this.state), this.thresholdOffsetX);
    }

    input.thresholdOffsetX = this.thresholdOffsetX;
    input.thresholdOffsetY = this.thresholdOffsetY;
    input.thresholdDeltaX = input.deltaX + this.thresholdOffsetX;
    input.thresholdDeltaY = input.deltaY + this.thresholdOffsetY;
    this.pX = input.deltaX;
    this.pY = input.deltaY;
    direction = dirStr(direction);

    if (direction) {
      this.manager.emit(this.options.event + direction, input);
    }

    return Hammer.Recognizer.prototype.emit.apply(this, arguments);
  }
});
module.exports = SmoothPan;

},{"hammerjs":"hammerjs"}],"/Users/pablo/Work/projects/folio/folio-workspace-assets/src/sass/variables.json":[function(require,module,exports){
module.exports={
	"video_crop_px": "0",
	"transform_type": "3d",
	"transitions": {
		"ease": "ease-in-out",
		"duration_ms": "350",
		"delay_interval_ms": "34",
		"min_delay_ms": "34"
	},
	"breakpoints": {
		"landscape": "'(orientation: landscape)'",
		"portrait": "'(orientation: portrait)'",
		"xsmall-stretch": "'not screen and (min-width: 460px), not screen and (min-height: 420px)'",
		"small-stretch": "'not screen and (min-width: 704px), not screen and (min-height: 420px)'",
		"default":"'only screen and (min-width: 704px) and (min-height: 420px)'",
		"medium-wide": "'only screen and (min-width: 1024px) and (max-width: 1223px) and (min-height: 420px)'",
		"medium-wide-stretch": "'only screen and (min-width: 1224px) and (min-height: 420px)'"
	},
	"default_colors": {
		"color": "hsl(47, 5%, 15%)",
		"background-color": "hsl(47, 5%, 95%)",
		"link-color": "hsl(10, 80%, 50%)"
	},
	"temp": {
		"collapse_offset": "360"
	},
	"_ignore": {
		"transitions": {
			"ease": "cubic-bezier(0.42, 0.0, 0.58, 1.0)",
			"duration_ms": "400",
			"delay_interval_ms": "134",
			"min_delay_ms": "34"
		},
		"default_colors": {
			"--link-color": "hsl(10, 80%, 50%)",
			"--alt-background-color": "unset"
		},
		"units": {
			"hu_px": "20",
			"vu_px": "12"
		},
		"breakpoints": {
			"medium-wide-stretch": "'only screen and (min-width: 1024px) and (min-height: 420px)'",
			"large-wide": "'only screen and (min-width: 1824px) and (min-height: 1024px)'",
			"mobile": "'not screen and (min-width: 704px), not screen and (min-height: 540px)'",
			"unsupported": "'not screen and (min-width: 704px)'",
			"unquoted": "only screen and (min-width: 1824px)",
			"unquoted_neg": "not screen and (min-width: 704px)",
			"quoted_combined": "'not screen and (min-width: 704px), not screen and (min-height: 540px)'",
			"array": [
				"only screen and (min-width: 704px)",
				"not screen and (min-width: 704px)",
				"not screen and (min-height: 540px)"
			]
		}
	}
}

},{}]},{},["/Users/pablo/Work/projects/folio/folio-workspace-assets/src/js/app/App.js"])
//# sourceMappingURL=folio-dev-main.js.map
