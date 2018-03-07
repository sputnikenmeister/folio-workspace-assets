/**
 * @module utils/canvas/drawArcHConnector
 */

var calcArcHConnector = require("./calcArcHConnector");

module.exports = function(ctx, x1, y1, r1, x2, y2, r2, ro) {
	var tx = calcArcHConnector(x1, y1, r1, x2, y2, r2, ro || 0);

	ctx.arcTo(tx[0], y1, tx[1], y2, r1);
	ctx.arcTo(tx[1], y2, x2, y2, r2);
};
