var VENDOR_PREFIXES = ["webkit", "moz", "MS", "ms", "o", ""];

/**
 * get the prefixed property
 * @param {Object} style
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
module.exports = function(style, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in style) {
            return prop;
        }
        i++;
    }
    return undefined;
};
