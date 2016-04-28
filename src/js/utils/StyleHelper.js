/**
 * Some static helper functions
 * @module app/helper/StyleHelper
 */

/** @type {module:underscore} */
var _ = require("underscore");

// /** @type {module:utils/strings/camelToDashed} */
// var camelToDashed = require("./strings/camelToDashed");

/** @type {module:utils/strings/dashedToCamel} */
var camelCase = require("./strings/dashedToCamel");
// var camelCase = jQuery.camelCase;

var _rules = {};
var _aliases = {};
var _initialValues = {};

var createStyleSheet = function(id) {
	var elt = document.createElement("style");
	id && (elt.id = id);
	elt.type = "text/css";
	document.head.appendChild(elt);
	return elt.sheet;
};

var _worksheet = null;
var getWorkSheet = function() {
	if (_worksheet === null) {
		_worksheet = createStyleSheet();
	}
	return _worksheet;
};

/**
 * @param [selector]
 */
var refreshCSSRule = function(selector) {
	if (!_.isEmpty(selector)) {
		_aliases[selector] !== void 0 && (selector = _aliases[selector]);
		_rules[selector] = findCSSRule(selector);
	}
};

/**
 * @param {String} [selector]
 * @return {CSSRule}
 */
var getCSSRule = function(selector) {
	if (!_.isEmpty(selector)) {
		_aliases[selector] !== void 0 && (selector = _aliases[selector]);
		return _rules[selector] || (_rules[selector] = findCSSRule(selector));
	} else {
		console.warn("StyleHelper: empty string is not a valid selector");
		return;
	}
};

/**
 * @return {CSSRule}
 */
var findCSSRule = function(selector) {
	var sheets = document.styleSheets,
		match = null;
	for (var i = sheets.length; i > 0 && match === null; --i) {
		match = _.findWhere(sheets[i].cssRules, {
			selectorText: selector
		});
	}
	return match;
};

/**
 * @return {CSSRule}
 */
var findCSSRule2 = function(selector) {
	return Array.prototype.slice.call(document.styleSheets).reduce(
		// return Array.prototype.reduce.call(document.styleSheets,
		function(prev, styleSheet) {
			if (styleSheet.cssRules) {
				return prev + Array.prototype.slice.call(styleSheet.cssRules).reduce(
					// return prev + Array.prototype.reduce.call(styleSheet.cssRules,
					function(prev, cssRule) {
						return prev + cssRule.cssText;
					}
				);
			} else {
				return prev;
			}
		}
	);
};

/**
 * @param {String} [selector]
 * @param {String} [propName]
 */
var getCSSProperty = function(selector, propName) {
	try {
		return getCSSRule(selector).style[camelCase(propName)];
	} catch (e) {
		return "";
	}
};

/**
 * @param [selector]
 * @param [propName]
 * @param [value]
 */
var setCSSProperty = function(selector, propName, value) {
	var name = camelCase(propName),
		key = selector + "$$" + propName,
		rule = getCSSRule(selector);
	_initialValues[key] !== void 0 || (_initialValues[key] = rule.style[name]);
	rule.style[name] = _.isEmpty(value) ? _initialValues[key] : value;
};

/**
 * @param [selector]
 * @param [style]
 */
var createCSSRule = function(selector, style) {
	var cssText = "";
	for (var prop in style) {
		cssText += prop + ":" + style[prop] + ";";
	}
	var sheet = getWorkSheet(); //document.styleSheets[0];
	sheet.insertRule(selector + "{" + cssText + "}", sheet.cssRules.length);
};

/**
 * Some static helper functions
 * @type {Object}
 */
module.exports = {
	getCSSRule: getCSSRule,
	createCSSRule: createCSSRule,
	getCSSProperty: getCSSProperty,
	setCSSProperty: setCSSProperty,
	refreshCSSRule: refreshCSSRule,
};
