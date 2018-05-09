// var Handlebars = require("handlebars")["default"];
var Handlebars = require("hbsfy/runtime");

// (function() {
Handlebars.registerPartial("svgWrapper", require("./SVGSymbolWrapper.hbs"));
Handlebars.registerPartial("svgSymbolPlay", require("./SVGSymbolPlay.hbs"));
Handlebars.registerPartial("svgSymbolReplay", require("./SVGSymbolReplay.hbs"));
Handlebars.registerPartial("svgSymbolWait", require("./SVGSymbolWait.hbs"));
// })();

// module.exports = Handlebars;
