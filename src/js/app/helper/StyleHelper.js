/**
 * Some static helper functions
 * @module app/helper/StyleHelper
 */

/** @type {module:jquery} */
var jQuery = require("jquery");
/** @type {module:underscore} */
var _ = require("underscore");

/**
 * @param [propName]
 * @return {String}
 */
var camelCase = jQuery.camelCase;

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
 * @param [selector]
 */
var getCSSRule = function (selector) {
	if (!_.isEmpty(selector)) {
		_aliases[selector] !== void 0 && (selector = _aliases[selector]);
		return _rules[selector] || (_rules[selector] = findCSSRule(selector));
	} else {
		console.warn("StyleHelper: empty string is not a valid selector");
		return;
	}
};

var findCSSRule = function (selector) {
	var match = null;
	for (var i = document.styleSheets.length; i > 0 && match === null; --i) {
		match = _.findWhere(document.styleSheets[i].cssRules, {selectorText: selector});
	}
	return match
};
var findCSSRule2 = function (selector) {
	return [].slice.call(document.styleSheets).reduce(
		function (prev, styleSheet) {
			if (styleSheet.cssRules) {
				return prev + [].slice.call(styleSheet.cssRules).reduce(
					function (prev, cssRule) {
						return prev + cssRule.cssText;
					});
			} else {
				return prev;
			}
		});
};

/**
 * @param [selector]
 * @param [propName]
 */
var getCSSProperty = function (selector, propName) {
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
var setCSSProperty = function (selector, propName, value) {
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
var createCSSRule = function (selector, style) {
	var cssText = "";
	for (var prop in style) {
		cssText += prop + ":" + style[prop] + ";";
	}
	var sheet = getWorkSheet();//document.styleSheets[0];
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
