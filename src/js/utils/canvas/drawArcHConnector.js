/**
 * @module utils/canvas/drawArcHConnector
 */
module.exports = function(ctx, x1, y1, x2, y2, r1, r2, ro) {
	var qx = x2 > x1 ? 1 : -1;
	var qy = y2 > y1 ? 1 : -1;
	var dy = Math.abs(y2 - y1);
	var dx = Math.abs(x2 - x1);
	var rr = r1 + r2;
	var tx1, tx2, c, tx, ty;

	if (dy < 1) {
		// points are aligned horizontally, no arcs needed
		return;
	}

	if (dy >= rr && dx >= rr) {
		// arcs fit horizontally:
		// second circle center is r1+r2, tangent intersect at x=r1
		c = rr;
		tx1 = r1;
		tx2 = r1;
	} else {
		// arcs overlap horizontally:
		// find second circle center
		c = Math.sqrt(dy * r2 * 2 + dy * r1 * 2 - dy * dy);

		// circles tangent point
		tx = (c * r1) / rr;
		ty = (dy * r1) / rr;

		if (r1 < ty || c > dx) {
			return;
		}

		// tangent perpendicular slope
		var slope = (rr - dy) / c;
		// tangent intersections
		tx1 = tx - (ty * slope);
		tx2 = (dy * slope) + tx1;

		// // circle centers
		// var ccx1, ccy1, ccx2, ccy2;
		// ccx1 = 0;
		// ccy1 = r1;
		// ccx2 = c;
		// ccy2 = dy - r2;
		// // tangent perpendicular slope
		// var slope = (ccy1 - ccy2) / (ccx2 - ccx1);
		// var xSec = tx - (ty * slope);
		// // tangent intersections
		// tx1 = xSec;
		// tx2 = (dy * slope) + xSec;
	}

	// offset arcTo's in x-axis
	if (0 < ro || ro <= 1) {
		ro *= dx - rr;
		tx1 += ro;
		tx2 += ro;
	}

	tx1 = tx1 * qx + x1;
	tx2 = tx2 * qx + x1;

	ctx.arcTo(tx1, y1, tx2, y2, r1);
	ctx.arcTo(tx2, y2, x2, y2, r2);
};
