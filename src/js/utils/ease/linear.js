
/**
* @param {number} i current iteration
* @param {number} s start value
* @param {number} d change in value
* @param {number} t total iterations
* @return {number}
*/
var linear = function (i, s, d, t) {
	return d * i / t + s;
};

module.exports = linear;
