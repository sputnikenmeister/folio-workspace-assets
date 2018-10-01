/** @type {Function} */
const Color = require("color");
/** @type {module:app/control/Globals} */
const Globals = require("app/control/Globals");
/** @type {module:app/model/collection/BundleCollection} */
const bundles = require("app/model/collection/BundleCollection");

// - - - - - - - - - - - - - - - -
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
}

// - - - - - - - - - - - - - - - -
//  root rules
// - - - - - - - - - - - - - - - -

var rootStyles = [
	"color",
	"background",
	"background-color",
	// "--link-color"
];

function initRootStyles(sheet, rootSelector, attrs, fgColor, bgColor, lnColor, hasDarkBg) {
	var s, revSelector, fgColorVal, bgColorVal;
	// var revFgColorVal, revBgColorVal;

	s = _.pick(attrs, rootStyles);
	// s["-webkit-font-smoothing"] = (hasDarkBg ? "antialiased" : "auto");
	/* NOTE: In Firefox '-moz-osx-font-smoothing: grayscale;'
	/* works both in light over dark and dark over light, hardcoded in _base.scss */
	//s["-moz-osx-font-smoothing"] = (hasDarkBg? "grayscale" : "auto");
	insertCSSRule(sheet, rootSelector, s);

	// A element
	// - - - - - - - - - - - - - - - -
	s = {}
	s["color"] = lnColor.rgb().string();
	insertCSSRule(sheet, rootSelector + " a", s);
	insertCSSRule(sheet, rootSelector + " .color-ln", s);

	// .color-fg05
	// - - - - - - - - - - - - - - - -
	s = {};
	s["color"] = Color(fgColor).mix(bgColor, 0.5).rgb().string();
	s["border-color"] = Color(fgColor).mix(bgColor, 0.3).rgb().string();
	insertCSSRule(sheet, rootSelector + " .color-fg05", s);

	fgColorVal = fgColor.rgb().string();
	bgColorVal = bgColor.rgb().string();
	// revFgColorVal = Color(bgColor).mix(fgColor, 0.9).rgb().string();
	// revBgColorVal = Color(fgColor).mix(bgColor, 0.6).rgb().string();
	revSelector = rootSelector + " .color-reverse";

	// .color-fg .color-bg
	// - - - - - - - - - - - - - - - -
	s = {
		"color": fgColorVal
	};
	insertCSSRule(sheet, rootSelector + " .color-fg", s);
	s = {
		"background-color": bgColorVal
	};
	insertCSSRule(sheet, rootSelector + " .color-bg", s);
	// html inverted text/background
	s = {
		"color": bgColorVal
	}; // s = { "color" : revFgColorVal };
	// s["-webkit-font-smoothing"] = (hasDarkBg ? "auto" : "antialiased");
	// insertCSSRule(sheet, revSelector + " .color-fg", s);
	// insertCSSRule(sheet, revSelector + ".color-fg", s);
	insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-fg"), s);

	s = {
		"background-color": fgColorVal
	};
	// s = { "background-color" : revBgColorVal };
	// insertCSSRule(sheet, revSelector + " .color-bg", s);
	// insertCSSRule(sheet, revSelector + ".color-bg", s);
	insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-bg"), s);

	// .color-stroke .color-fill (SVG)
	// - - - - - - - - - - - - - - - -
	s = {
		"stroke": fgColorVal
	};
	insertCSSRule(sheet, rootSelector + " .color-stroke", s);
	s = {
		"fill": bgColorVal
	};
	insertCSSRule(sheet, rootSelector + " .color-fill", s);
	// svg inverted fill/stroke
	s = {
		"stroke": bgColorVal
	};
	// insertCSSRule(sheet, revSelector + " .color-stroke", s);
	// insertCSSRule(sheet, revSelector + ".color-stroke", s);
	insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-stroke"), s);
	s = {
		"fill": fgColorVal
	};
	// insertCSSRule(sheet, revSelector + " .color-fill", s);
	// insertCSSRule(sheet, revSelector + ".color-fill", s);
	insertCSSRule(sheet, selfAndDescendant(revSelector, ".color-fill"), s);

	// .text-outline
	// - - - - - - - - - - - - - - - -
	// s = {
	// 	"text-shadow": "-1px -1px 0 " + bgColorVal +
	// 		", 1px -1px 0 " + bgColorVal +
	// 		", -1px 1px 0 " + bgColorVal +
	// 		", 1px 1px 0 " + bgColorVal
	// };
	// insertCSSRule(sheet, rootSelector + " :not(..collapsed-changing) .text-outline-bg", s);

}

// - - - - - - - - - - - - - - - -
// carousel styles
// - - - - - - - - - - - - - - - -

var carouselStyles = ["box-shadow", "border", "border-radius"];

function initCarouselStyles(sheet, carouselSelector, attrs, fgColor, bgColor, lnColor, hasDarkBg) {
	var s = _.pick(attrs, carouselStyles); //, "background-color"]);
	insertCSSRule(sheet, carouselSelector + " .media-item .content", s);

	// .media-item .color-bg09
	// - - - - - - - - - - - - - - - -
	s = {};
	s["background-color"] = Color(bgColor).mix(fgColor, 0.05).rgb().string();
	// s["background-color"] = Color(bgColor)[hasDarkBg ? "darken" : "lighten"](0.045).rgb().string();
	// s["background-color"] = Color(bgColor)[hasDarkBg ? "lighten" : "darken"](0.03).rgb().string();
	insertCSSRule(sheet, carouselSelector + " .media-item .color-bg09", s);

	// .media-item .placeholder
	// - - - - - - - - - - - - - - - -
	s = {};
	// s["-webkit-font-smoothing"] = (hasDarkBg ? "auto" : "antialiased");
	// text color luminosity is inverse from body, apply oposite rendering mode
	s["color"] = bgColor.rgb().string();
	// s["color"] = Color(bgColor)[hasDarkBg ? "darken" : "lighten"](0.045).rgb().string();
	s["background-color"] = Color(bgColor).mix(fgColor, 0.05).rgb().string();
	// s["background-color"] = Color(bgColor).mix(fgColor, 0.8).alpha(0.3).rgba().string();
	// s["background-color"] = Color(bgColor)[hasDarkBg ? "lighten" : "darken"](0.03).rgb().string();
	("border-radius" in attrs) && (s["border-radius"] = attrs["border-radius"]);
	insertCSSRule(sheet, carouselSelector + " .media-item .placeholder", s);

	// .empty-item A
	// - - - - - - - - - - - - - - - -
	s = {};
	s["text-decoration-color"] = Color(fgColor).mix(bgColor, 0.7).rgb().string();
	insertCSSRule(sheet, carouselSelector + " .empty-item A", s);
	// // .color-gradient
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

module.exports = function() {
	var attrs, fgColor, bgColor, lnColor, hasDarkBg;

	attrs = Globals.DEFAULT_COLORS;
	fgColor = new Color(Globals.DEFAULT_COLORS["color"]);
	bgColor = new Color(Globals.DEFAULT_COLORS["background-color"]);
	lnColor = new Color(Globals.DEFAULT_COLORS["link-color"])
	hasDarkBg = fgColor.luminosity() > bgColor.luminosity();

	var colorStyles = document.createElement("style");
	colorStyles.id = "colors";
	colorStyles.type = "text/css";
	document.head.appendChild(colorStyles);
	// var colorStyles = document.querySelector("link#folio");

	initRootStyles(colorStyles.sheet, ".app",
		attrs, fgColor, bgColor, lnColor, hasDarkBg);
	initCarouselStyles(colorStyles.sheet, ".carousel",
		attrs, fgColor, bgColor, lnColor, hasDarkBg);

	// - - - - - - - - - - - - - - - -
	// per-bundle rules
	// - - - - - - - - - - - - - - - -
	bundles.each(function(bundle) {
		attrs = bundle.attrs(); //get("attrs");
		fgColor = bundle.colors.fgColor;
		bgColor = bundle.colors.bgColor;
		lnColor = bundle.colors.lnColor;
		hasDarkBg = bundle.colors.hasDarkBg;

		initRootStyles(colorStyles.sheet,
			".app." + bundle.get("domid"),
			attrs, fgColor, bgColor, lnColor, hasDarkBg);
		initCarouselStyles(colorStyles.sheet,
			".carousel." + bundle.get("domid"),
			attrs, fgColor, bgColor, lnColor, hasDarkBg);
	});
};
