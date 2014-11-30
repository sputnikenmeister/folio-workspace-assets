/**
 * Some static helper functions
 * @module app/helper/Styles
 */

/** @type {module:underscore} */
var _ = require("underscore");

var _rules = {};
var _aliases = {};
var _initialValues = {};

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
		return getCSSRule(selector).styles[propName];
	} catch (e) {
		return "";
	}
};

var setCSSProperty = function (selector, propName, value) {
	var key = selector + "$$" + propName;
	var rule = getCSSRule(selector);
	_initialValues.hasOwnProperty(key) || (_initialValues[key] = rule.style[propName]);
	rule.style[propName] = _.isEmpty(value) ? _initialValues[key] : value;
};

/**
 * Some static helper functions
 * @type {Object}
 */
module.exports = {
	getCSSRule: getCSSRule,
	getCSSProperty: getCSSProperty,
	setCSSProperty: setCSSProperty,
};
