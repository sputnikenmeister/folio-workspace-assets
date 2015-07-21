///** @type {module:app/utils/net/loadImage} */
//var loadImageDOM = require("./loadImageDOM");
///** @type {module:app/utils/net/loadImageXHR} */
//var loadImageXHR = require("./loadImageXHR");

/**
 * @param
 * @param
 * @param
 * @returns
 */
module.exports = (window.XMLHttpRequest && window.URL && window.Blob)? require("./loadImageXHR") : require("./loadImageDOM");
