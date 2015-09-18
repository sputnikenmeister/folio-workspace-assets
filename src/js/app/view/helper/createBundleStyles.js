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
	var fgColor, bgColor, bgLum, fgLum, hasDarkBg;
	var bodySelector, bodyStyles = ["background", "background-color", "color"];
	var bgDefault, fgDefault, fgColorVal, bgColorVal;
	var revSelector, revFgColorVal, revBgColorVal;
	var carouselSelector, carouselMediaStyles = ["box-shadow", "border", "border-radius"];//, "background-color"];
	var intPerChannel = parseInt("010101", 16);
	
	fgDefault = new Color(Globals.DEFAULT_COLORS["color"]);
	bgDefault = new Color(Globals.DEFAULT_COLORS["background-color"]);
	// fgDefault = new Color(Styles.getCSSProperty("body", "color") || "hsl(47, 5%, 15%)");
	// bgDefault = new Color(Styles.getCSSProperty("body", "background-color") || "hsl(47, 5%, 95%)");
	
	bundles.each(function (bundle) {
		attrs = bundle.attrs();//get("attrs");
		fgColor = attrs["color"]? new Color(attrs["color"]) : fgDefault;
		bgColor = attrs["background-color"]? new Color(attrs["background-color"]) : bgDefault;
		fgColorVal = fgColor.hslString();
		bgColorVal = bgColor.hslString();
		fgLum = fgColor.luminosity();
		bgLum = bgColor.luminosity();
		hasDarkBg = fgLum > bgLum;
		
		bundle.colors = {
			fgColor: fgColor, bgColor: bgColor, dark: fgLum > bgLum
		};
		
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
		s["color"] = fgColor.clone().mix(bgColor, 0.5).hslString();
		s["border-color"] = fgColor.clone().mix(bgColor, 0.7).hslString();
		Styles.createCSSRule(bodySelector + " .color-fg05", s);
		
		// inverted fg/bg colors (slightly muted)
		revFgColorVal = bgColor.clone().mix(fgColor, 0.1).hslString();
		revBgColorVal = fgColor.clone().mix(bgColor, 0.1).hslString();
		// var lineColorVal = bgColor.clone().mix(fgColor, 0.3).hslString();
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
		
		// .color-overclip
		// - - - - - - - - - - - - - - - - 
		s = {};
		// Darken if dark, lighten if light, then clamp value to 0-1
		tmpVal = Math.min(Math.max(bgLum * (hasDarkBg? 0.95 : 1.05), 0), 1); 
		s["background-color"] = bgColor.clone().lighten(tmpVal).alpha(0.5).rgbaString();
		Styles.createCSSRule(bodySelector + " .color-overclip", s);
		s = {};
		tmpVal = Math.min(Math.max(fgLum * (hasDarkBg? 0.95 : 1.05), 0), 1); 
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
		
		
		s = {};
		// text color luminosity is inverse from body, apply oposite rendering mode
		s["-webkit-font-smoothing"] = (hasDarkBg? "auto" : "antialiased");
		s["color"]				= bgColor.hslString();
		// s["color"]				= bgColor.clone()[hasDarkBg?"darken":"lighten"](0.045).hslString();
		s["background-color"]	= bgColor.clone().mix(fgColor, 0.95).hslString();
		// s["background-color"]	= bgColor.clone()[hasDarkBg?"lighten":"darken"](0.03).hslString();
		
		// var rgb, bgLighter, bgDarker, b;
		// 
		// b = 6;
		// rgb = bgColor.rgb();
		// rgb.r+=b; rgb.g+=b; rgb.b+=b;
		// bgLighter = new Color(rgb).rgbString();
		// 
		// b = -6;
		// rgb = bgColor.rgb();
		// rgb.r+=b; rgb.g+=b; rgb.b+=b;
		// bgDarker = new Color(rgb).rgbString();
		// 	
		// console.log(bgColor.hexString(), bgDarker, bgLighter);
		// 
		// s["background-color"] = hasDarkBg? bgLighter : bgDarker;
		// s["color"] = hasDarkBg? bgDarker : bgLighter;
		
		("border-radius" in attrs) && (s["border-radius"] = attrs["border-radius"]);
		Styles.createCSSRule(carouselSelector + " .media-item .placeholder", s);
	});
};
