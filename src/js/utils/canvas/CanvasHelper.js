var PI2 = Math.PI * 2;

var splice = Array.prototype.splice;
// var concat = Array.prototype.concat;

var setStyle = function(ctx, s) {
	if (typeof s != "object") return;
	for (var p in s) {
		switch (typeof ctx[p]) {
			case "undefined":
				break;
			case "function":
				if (Array.isArray(s[p])) ctx[p].apply(ctx, s[p]);
				else ctx[p].call(ctx, s[p]);
				break;
			default:
				ctx[p] = s[p];
		}
	}
};

var _drawShape = function(fn, s, ctx) {
	ctx.save();
	if (s) setStyle(ctx, s);
	fn.apply(null, splice.call(arguments, 2));
	if (ctx.lineWidth !== "transparent") ctx.stroke();
	if (ctx.fillStyle !== "transparent") ctx.fill();
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
		ctx.rotate(t); // - Math.PI * 0.5);
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

	rect: function(ctx, a1, a2, a3, a4) {

		ctx.beginPath();
		if (isNaN(a1)) {
			ctx.rect(a1.left, a1.top, a1.width, a1.height);
		} else {
			ctx.rect(a1, a2, a3, a4);
		}
	},
	drawRect: function(ctx, s, a1, a2, a3, a4) {
		_drawShape(this.rect, s, ctx, a1, a2, a3, a4);
	},
};