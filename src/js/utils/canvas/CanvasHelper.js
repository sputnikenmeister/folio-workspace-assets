var PI2 = Math.PI * 2;

var splice = Array.prototype.splice;
// var concat = Array.prototype.concat;

/*
 *	Using javascript to convert radians to degrees with positive and
 *	negative values [https://stackoverflow.com/questions/29588404/]
 *	`(((r * (180/Math.PI)) % 360) + 360) % 360;`
 *	`function mod(n, m) {
 *		return ((n % m) + m) % m;
 *	}`
 */
var _mod = function(n, m) {
	return ((n % m) + m) % m;
};

var setStyle = function(ctx, s) {
	if (typeof s != "object") return;
	for (var p in s) {
		switch (typeof ctx[p]) {
			case "undefined":
				break;
			case "function":
				if (Array.isArray(s[p])) {
					ctx[p].apply(ctx, s[p]);
				} else {
					ctx[p].call(ctx, s[p]);
				}
				break;
			default:
				ctx[p] = s[p];
		}
	}
};

var _drawShape = function(fn, s, ctx) {
	ctx.save();
	if (s) {
		setStyle(ctx, s);
	}
	fn.apply(null, splice.call(arguments, 2));
	if ('strokeStyle' in s) { /* ctx.lineWidth > 0 */
		ctx.stroke();
	}
	if ('fillStyle' in s) { /* ctx.fillStyle !== "transparent" */
		ctx.fill();
	}
	ctx.restore();
};

module.exports = {
	setStyle: setStyle,

	vGuide: function(ctx, x) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, ctx.canvas.height);
	},
	drawVGuide: function(ctx, s, x) {
		_drawShape(this.vGuide, s, ctx, x);
	},

	hGuide: function(ctx, y) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(ctx.canvas.width, y);
	},
	drawHGuide: function(ctx, s, y) {
		_drawShape(this.hGuide, s, ctx, y);
	},

	crosshair: function(ctx, x, y, r) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(Math.PI / 4);
		ctx.beginPath();
		ctx.moveTo(0, -r);
		ctx.lineTo(0, r);
		ctx.moveTo(-r, 0);
		ctx.lineTo(r, 0);
		ctx.restore();
	},
	drawCrosshair: function(ctx, s, x, y, r) {
		_drawShape(this.crosshair, s, ctx, x, y, r);
	},

	circle: function(ctx, x, y, r) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, PI2);
	},
	drawCircle: function(ctx, s, x, y, r) {
		_drawShape(this.circle, s, ctx, x, y, r);
	},

	square: function(ctx, x, y, r) {
		r = Math.floor(r / 2) * 2;
		ctx.beginPath();
		ctx.rect(x - r, y - r, r * 2, r * 2);
	},
	drawSquare: function(ctx, s, x, y, r) {
		_drawShape(this.square, s, ctx, x, y, r);
	},

	arrowhead: function(ctx, x, y, r, t) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(_mod(t, PI2));
		ctx.translate(r * 0.5, 0);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		// ctx.lineTo(-r, r * Math.SQRT1_2);
		// ctx.lineTo(-r, -r * Math.SQRT1_2);
		ctx.lineTo(-r * Math.SQRT2, r * Math.SQRT1_2);
		ctx.arcTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2, r);
		// ctx.quadraticCurveTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2);
		ctx.lineTo(0, 0);
		ctx.closePath();
		ctx.restore();
	},
	drawArrowhead: function(ctx, s, x, y, r, t) {
		_drawShape(this.arrowhead, s, ctx, x, y, r, t);
	},

	arrowhead2: function(ctx, x, y, r, t) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(_mod(t, PI2));
		ctx.beginPath();
		ctx.moveTo(-r, r * Math.SQRT1_2);
		ctx.lineTo(0, 0);
		ctx.lineTo(-r, -r * Math.SQRT1_2);
		ctx.restore();
	},
	drawArrowhead2: function(ctx, s, x, y, r, t) {
		_drawShape(this.arrowhead, s, ctx, x, y, r, t);
	},

	rect: function(ctx, a1, a2, a3, a4) {
		if (typeof a1 === "object") {
			a4 = a1.height;
			a3 = a1.width;
			a2 = a1.top;
			a1 = a1.left;
		}
		ctx.beginPath();
		ctx.rect(a1, a2, a3, a4);
	},
	drawRect: function(ctx, s, a1, a2, a3, a4) {
		_drawShape(this.rect, s, ctx, a1, a2, a3, a4);
	},

	roundRect: function(ctx, x, y, w, h, r) {
		if (w < 2 * r) r = w / 2;
		if (h < 2 * r) r = h / 2;
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	},
	drawRoundRect: function(ctx, s, x, y, w, h, r) {
		_drawShape(this.roundRect, s, ctx, x, y, h, r);
	},

	quadRoundRect: function(ctx, x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.closePath();
	},
	drawQuadRoundRect: function(ctx, s, x, y, w, h, r) {
		_drawShape(this.quadRoundRect, s, ctx, x, y, h, r);
	},
};
