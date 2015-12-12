/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
var Color = require("color");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/StyleHelper} */
var Styles = require("utils/StyleHelper");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");

module.exports = function() {
	var s, attrs, tmpVal;
	var fgColor, bgColor, hasDarkBg;
	var fgColorVal, bgColorVal;
	var revSelector, revFgColorVal, revBgColorVal;
	var bodySelector, bodyStyles = ["background", "background-color", "color"];
	var carouselSelector, carouselMediaStyles = ["box-shadow", "border", "border-radius"];
	
	// var fgDefault = new Color(Globals.DEFAULT_COLORS["color"]),
	// 	bgDefault = new Color(Globals.DEFAULT_COLORS["background-color"]);
	
	bundles.each(function (bundle) {
		attrs = bundle.attrs();//get("attrs");
		fgColor = bundle.colors.fgColor;
		bgColor = bundle.colors.bgColor;
		hasDarkBg = bundle.colors.hasDarkBg;
		
		// fgColor = attrs["color"]? new Color(attrs["color"]) : fgDefault;
		// bgColor = attrs["background-color"]? new Color(attrs["background-color"]) : bgDefault;
		// hasDarkBg = fgColor.luminosity() > bgColor.luminosity();
		// bundle.colors = {
		// 	fgColor: fgColor,
		// 	bgColor: bgColor,
		// 	hasDarkBg: hasDarkBg
		// };
		
		// - - - - - - - - - - - - - - - - 
		// per-bundle body rules
		// - - - - - - - - - - - - - - - - 
		bodySelector = "body." + bundle.get("domid");
		s = _.pick(attrs, bodyStyles);
		s["-webkit-font-smoothing"] = (hasDarkBg? "antialiased" : "auto");
		/* NOTE: In Firefox 'body { -moz-osx-font-smoothing: grayscale; }'
		/* works both in light over dark and dark over light, hardcoded in _base.scss */
		//s["-moz-osx-font-smoothing"] = (hasDarkBg? "grayscale" : "auto");
		Styles.createCSSRule(bodySelector, s);
		
		s = {};
		s["color"] = fgColor.clone().mix(bgColor, 0.5).rgbString();
		s["border-color"] = fgColor.clone().mix(bgColor, 0.7).rgbString();
		Styles.createCSSRule(bodySelector + " .color-fg05", s);
		
		fgColorVal = fgColor.rgbString();
		bgColorVal = bgColor.rgbString();
		// inverted fg/bg colors (slightly muted)
		revFgColorVal = bgColor.clone().mix(fgColor, 0.1).rgbString();
		revBgColorVal = fgColor.clone().mix(bgColor, 0.1).rgbString();
		revSelector = bodySelector + " .color-reverse";
		
		// .color-fg .color-bg
		// - - - - - - - - - - - - - - - - 
		s = { "color" : fgColorVal };
		Styles.createCSSRule(bodySelector + " .color-fg", s);
		s = { "background-color": bgColorVal };
		Styles.createCSSRule(bodySelector + " .color-bg", s);
		
		// inverted html
		s = { "color" : revFgColorVal };
		s["-webkit-font-smoothing"] = (hasDarkBg? "auto" : "antialiased");
		Styles.createCSSRule(revSelector + " .color-fg", s);
		Styles.createCSSRule(revSelector + ".color-fg", s);
		s = { "background-color" : revBgColorVal };
		Styles.createCSSRule(revSelector + " .color-bg", s);
		Styles.createCSSRule(revSelector + ".color-bg", s);
		
		// .color-stroke .color-fill (SVG)
		// - - - - - - - - - - - - - - - - 
		s = { "stroke": fgColorVal };
		Styles.createCSSRule(bodySelector + " .color-stroke", s);
		s = { "fill": bgColorVal };
		Styles.createCSSRule(bodySelector + " .color-fill", s);
		// svg inverted fill/stroke
		s = { "stroke": bgColorVal };
		Styles.createCSSRule(revSelector + " .color-stroke", s);
		Styles.createCSSRule(revSelector + ".color-stroke", s);
		s = { "fill": fgColorVal };
		Styles.createCSSRule(revSelector + " .color-fill", s);
		Styles.createCSSRule(revSelector + ".color-fill", s);
		
		// .media-item .content
		// - - - - - - - - - - - - - - - - 
		carouselSelector = ".carousel." + bundle.get("domid");
		s = _.pick(attrs, carouselMediaStyles);//, "background-color"]);
		Styles.createCSSRule(carouselSelector + " .media-item .content", s);
		
		// .media-item .color-bg09
		// - - - - - - - - - - - - - - - - 
		s = {};
		s["background-color"]		= bgColor.clone().mix(fgColor, 0.95).rgbString();
		// s["background-color"]		= bgColor.clone()[hasDarkBg?"darken":"lighten"](0.045 ).rgbString();
		// s["background-color"]		= bgColor.clone()[hasDarkBg?"lighten":"darken"](0.03).rgbString();
		Styles.createCSSRule(carouselSelector + " .media-item .color-bg09", s);
		
		// .media-item .placeholder
		// - - - - - - - - - - - - - - - - 
		s = {};
		s["-webkit-font-smoothing"] = (hasDarkBg? "auto" : "antialiased");
		// text color luminosity is inverse from body, apply oposite rendering mode
		s["color"]					= bgColor.rgbString();
		// s["color"]				= bgColor.clone()[hasDarkBg?"darken":"lighten"](0.045).rgbString();
		s["background-color"]		= bgColor.clone().mix(fgColor, 0.95).rgbString();
		// s["background-color"]	= bgColor.clone()[hasDarkBg?"lighten":"darken"](0.03).rgbString();
		("border-radius" in attrs) && (s["border-radius"] = attrs["border-radius"]);
		Styles.createCSSRule(carouselSelector + " .media-item .placeholder", s);
		
		// // .color-gradient
		// // - - - - - - - - - - - - - - - - 
		// s = {};
		// s["background-color"] = "transparent";
		// s["background"] = "linear-gradient(to bottom, " +
		// 		bgColor.clone().alpha(0.00).rgbaString() + " 0%, " +
		// 		bgColor.clone().alpha(0.11).rgbaString() + " 100%)";
		// Styles.createCSSRule(bodySelector + " .color-gradient", s);
		// s = {};
		// s["background-color"] = "transparent";
		// s["background"] = "linear-gradient(to bottom, " +
		// 		fgColor.clone().alpha(0.00).rgbaString() + " 0%, " +
		// 		fgColor.clone().alpha(0.11).rgbaString() + " 100%)";
		// Styles.createCSSRule(revSelector + " .color-gradient", s);
		// Styles.createCSSRule(revSelector + ".color-gradient", s);
	});
};
