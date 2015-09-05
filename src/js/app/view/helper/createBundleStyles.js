

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
var Color = require("color");
/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:utils/StyleHelper} */
var Styles = require("../../../utils/StyleHelper");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("../../model/collection/BundleCollection");

module.exports = function() {
	var s, attrs, tmpVal;
	var fgColor, bgColor, bgLum, fgLum, isLightOverDark;
	var bodySelector, bodyStyles = ["background", "background-color", "color"];
	var bgDefault, fgDefault, fgColorHex, bgColorHex;
	var revSelector, revFgColorHex, revBgColorHex;
	var carouselSelector, carouselMediaStyles = ["box-shadow", "border", "border-radius"];//, "background-color"];
	
	fgDefault = new Color(Globals.DEFAULT_COLORS["color"]);
	bgDefault = new Color(Globals.DEFAULT_COLORS["background-color"]);
	// fgDefault = new Color(Styles.getCSSProperty("body", "color") || "hsl(47, 5%, 15%)");
	// bgDefault = new Color(Styles.getCSSProperty("body", "background-color") || "hsl(47, 5%, 95%)");
	
	bundles.each(function (bundle) {
		attrs = bundle.attrs();//get("attrs");
		fgColor = attrs["color"]? new Color(attrs["color"]) : fgDefault;
		bgColor = attrs["background-color"]? new Color(attrs["background-color"]) : bgDefault;
		fgColorHex = fgColor.hexString();
		bgColorHex = bgColor.hexString();
		fgLum = fgColor.luminosity();
		bgLum = bgColor.luminosity();
		isLightOverDark = fgLum > bgLum;
		
		bundle.colors = {
			fgColor: fgColor, bgColor: bgColor, dark: fgLum > bgLum
		};
		
		// - - - - - - - - - - - - - - - - 
		// per-bundle body rules
		// - - - - - - - - - - - - - - - - 
		bodySelector = "body." + bundle.get("domid");
		s = _.pick(attrs, bodyStyles);
		s["-webkit-font-smoothing"] = (isLightOverDark? "antialiased" : "auto");
		/* NOTE: In Firefox 'body { -moz-osx-font-smoothing: grayscale; }'
		/* works both in light over dark and dark over light, hardcoded in _base.scss */
		//s["-moz-osx-font-smoothing"] = (isLightOverDark? "grayscale" : "auto");
		Styles.createCSSRule(bodySelector, s);
		
		s = {};
		s["color"] = fgColor.clone().mix(bgColor, 0.5).hexString();
		s["border-color"] = fgColor.clone().mix(bgColor, 0.7).hexString();
		Styles.createCSSRule(bodySelector + " .color-fg05", s);
		
		// inverted fg/bg colors (slightly muted)
		revFgColorHex = bgColor.clone().mix(fgColor, 0.1).hexString();
		revBgColorHex = fgColor.clone().mix(bgColor, 0.1).hexString();
		// var lineColorHex = bgColor.clone().mix(fgColor, 0.3).hexString();
		revSelector = bodySelector + " .color-reverse";
		
		// .color-fg .color-bg
		// - - - - - - - - - - - - - - - - 
		s = { "color" : fgColorHex };
		Styles.createCSSRule(bodySelector + " .color-fg", s);
		s = { "background-color": bgColorHex };
		Styles.createCSSRule(bodySelector + " .color-bg", s);
		
		// inverted html
		s = { "color" : revFgColorHex };
		s["-webkit-font-smoothing"] = (isLightOverDark? "auto" : "antialiased");
		Styles.createCSSRule(revSelector + " .color-fg", s);
		Styles.createCSSRule(revSelector + ".color-fg", s);
		s = { "background-color" : revBgColorHex };
		Styles.createCSSRule(revSelector + " .color-bg", s);
		Styles.createCSSRule(revSelector + ".color-bg", s);
		
		// .color-stroke .color-fill (SVG)
		// - - - - - - - - - - - - - - - - 
		s = { "stroke": fgColorHex };
		Styles.createCSSRule(bodySelector + " .color-stroke", s);
		s = { "fill": bgColorHex };
		Styles.createCSSRule(bodySelector + " .color-fill", s);
		// svg inverted fill/stroke
		s = { "stroke": bgColorHex };
		Styles.createCSSRule(revSelector + " .color-stroke", s);
		Styles.createCSSRule(revSelector + ".color-stroke", s);
		s = { "fill": fgColorHex };
		Styles.createCSSRule(revSelector + " .color-fill", s);
		Styles.createCSSRule(revSelector + ".color-fill", s);
		
		// .color-overclip
		// - - - - - - - - - - - - - - - - 
		s = {};
		// Darken if dark, lighten if light, then clamp value to 0-1
		tmpVal = Math.min(Math.max(bgLum * (isLightOverDark? 0.95 : 1.05), 0), 1); 
		s["background-color"] = bgColor.clone().lighten(tmpVal).alpha(0.5).rgbaString();
		Styles.createCSSRule(bodySelector + " .color-overclip", s);
		s = {};
		tmpVal = Math.min(Math.max(fgLum * (isLightOverDark? 0.95 : 1.05), 0), 1); 
		s["background-color"] = fgColor.clone().lighten(tmpVal).alpha(0.5).rgbaString();
		Styles.createCSSRule(revSelector + " .color-overclip", s);
		Styles.createCSSRule(revSelector + ".color-overclip", s);
		
		// .color-gradient
		// - - - - - - - - - - - - - - - - 
		s = {};
		s["background-color"] = "transparent";
		s["background"] = "linear-gradient(to bottom, " +
				bgColor.clone().alpha(0.00).rgbaString() + " 0%, " +
				bgColor.clone().alpha(0.11).rgbaString() + " 100%)";
		Styles.createCSSRule(bodySelector + " .color-gradient", s);
		s = {};
		s["background-color"] = "transparent";
		s["background"] = "linear-gradient(to bottom, " +
				fgColor.clone().alpha(0.00).rgbaString() + " 0%, " +
				fgColor.clone().alpha(0.11).rgbaString() + " 100%)";
		Styles.createCSSRule(revSelector + " .color-gradient", s);
		Styles.createCSSRule(revSelector + ".color-gradient", s);
		
		// - - - - - - - - - - - - - - - - 
		// per-bundle .carousel .media-item rules
		// - - - - - - - - - - - - - - - - 
		carouselSelector = ".carousel." + bundle.get("domid");
		s = _.pick(attrs, carouselMediaStyles);//, "background-color"]);
		Styles.createCSSRule(carouselSelector + " .media-item .content", s);
		
		// text color luminosity is inverse from body, apply oposite rendering mode
		s = {};
		s["-webkit-font-smoothing"] = (isLightOverDark? "auto" : "antialiased");
		s["background-color"] = bgColor.clone().mix(fgColor, 0.95).hexString();
		// s["color"] = bgColor.clone().mix(fgColor, 0.995).hexString();
		s["color"] = bgColor.hexString();
		("border-radius" in attrs) && (s["border-radius"] = attrs["border-radius"]);
		Styles.createCSSRule(carouselSelector + " .media-item .placeholder", s);
	});
};
