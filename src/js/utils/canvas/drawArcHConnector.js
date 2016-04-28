/**
 * @module utils/canvas/drawArcHConnector
 */
module.exports = function(ctx, x1, y1, x2, y2, r1, r2, ro) {
	var qx = x2 > x1 ? 1 : -1;
	var qy = y2 > y1 ? 1 : -1;
	var dy = Math.abs(y2 - y1);
	var dx = Math.abs(x2 - x1);
	var rr = r1 + r2;

	// var cx1, cy1, cx2, cy2;
	// var ccx1, ccy1, ccx2, ccy2;
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

/*
var drawConnector = function(ctx, x1, y1, x2, y2, r1, r2, ro) {
	var qx = x2 > x1 ? 1 : -1;
	var qy = y2 > y1 ? 1 : -1;
	var dy = Math.abs(y2 - y1);
	var dx = Math.abs(x2 - x1);
	var rr = r1 + r2;

	var tx1, tx2;

	if (dy > rr) {
		tx1 = r1;
		tx2 = r1;
	} else {
		var cx1, cy1, cx2, cy2;
		var c = Math.sqrt(dy * r2 * 2 + dy * r1 * 2 - dy * dy);
		// circle centers
		cx1 = 0;
		cy1 = r1;
		cx2 = c;
		cy2 = dy - r2;
		// tangent pt
		var tx = (c * r1) / rr;
		var ty = (dy * r1) / rr;

		var cSlope = (cy2 - cy1) / (cx2 - cx1);
		var pxSlope = -cSlope;
		var xSec = tx - (ty * pxSlope);
		// var pySlope = -1/cSlope;
		// var ySec = ty-(tx*pySlope);

		tx1 = xSec;
		tx2 = (dy * pxSlope) + xSec;

		// cx1 = x1 + cx1 * qx;
		// cy1 = y1 + cy1 * qy;
		// cy2 = y1 + cy2 * qy;
		// cx2 = x1 + cx2 * qx;
	}

	tx1 = x1 + qx * tx1;
	tx2 = x1 + qx * tx2;

	// ctx.beginPath();
	// ctx.moveTo(x1, y1);
	ctx.arcTo(tx1, y1, tx2, y2, r1);
	ctx.arcTo(tx2, y2, x2, y2, r2);
	// ctx.lineTo(x2, y2);
	// ctx.stroke();
};
*/
