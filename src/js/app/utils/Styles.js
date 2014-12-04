/**
 * Some static helper functions
 * @module app/utils/Styles
 */

/** @type {module:jquery} */
var jQuery = require("jquery");

/** @type {module:underscore} */
var _ = require("underscore");

var _rules = {};
var _aliases = {};
var _initialValues = {};

var refreshCSSRule = function(selector) {
	if (!_.isEmpty(selector)) {
		_aliases.hasOwnProperty(selector) && (selector = _aliases[selector]);
		_rules[selector] = _.findWhere(document.styleSheets[0].cssRules, {
			selectorText: selector
		});
	}
};
/**
 * @param [selector]
 */
var getCSSRule = function (selector) {
	if (!_.isEmpty(selector)) {
		_aliases.hasOwnProperty(selector) && (selector = _aliases[selector]);
		_rules.hasOwnProperty(selector) || (_rules[selector] = _.findWhere(document.styleSheets[0].cssRules, {
			selectorText: selector
		}));
		return _rules[selector];
	} else {
		return;
	}
};

/**
 * @param [selector]
 * @param [propName]
 */
var getCSSProperty = function (selector, propName) {
	try {
		return getCSSRule(selector).style[jQuery.camelCase(propName)];
	} catch (e) {
		return "";
	}
};

var setCSSProperty = function (selector, propName, value) {
	var name = jQuery.camelCase(propName),
		key = selector + "$$" + propName,
		rule = getCSSRule(selector);
	_initialValues.hasOwnProperty(key) || (_initialValues[key] = rule.style[name]);
	rule.style[name] = _.isEmpty(value) ? _initialValues[key] : value;
};

/**
 * Some static helper functions
 * @type {Object}
 */
module.exports = {
	getCSSRule: getCSSRule,
	getCSSProperty: getCSSProperty,
	setCSSProperty: setCSSProperty,
	refreshCSSRule: refreshCSSRule,
};
