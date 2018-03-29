var PI2 = Math.PI * 2;

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

module.exports = {
	setStyle: setStyle,

	vGuide: function(ctx, x, s) {
		ctx.save();
		if (s) setStyle(ctx, s);
		ctx.beginPath();
		ctx.moveTo(x, ctx.canvas.offsetTop);
		ctx.lineTo(x, ctx.canvas.offsetHeight);
		ctx.stroke();
		ctx.restore();
	},

	crosshair: function(ctx, x, y, r, s) {
		ctx.save();
		if (s) {
			setStyle(ctx, s);
		}
		// if (s && s.style != "vertical") {
		ctx.translate(x, y);
		ctx.rotate(Math.PI / 4);
		// }
		ctx.beginPath();
		ctx.moveTo(0, -r);
		ctx.lineTo(0, r);
		ctx.moveTo(-r, 0);
		ctx.lineTo(r, 0);
		ctx.stroke();
		ctx.restore();
	},

	circle: function(ctx, x, y, r, solid, s) {
		ctx.save();
		if (s) setStyle(ctx, s);
		ctx.beginPath();
		ctx.arc(x, y, r, 0, PI2);
		ctx.closePath();
		if (solid) ctx.fill();
		else ctx.stroke();
		ctx.restore();
	},

	square: function(ctx, x, y, r, solid, s) {
		r = Math.floor(r / 2) * 2;
		if (solid) r += 0.5;
		ctx.save();
		if (s) setStyle(ctx, s);
		ctx.beginPath();
		ctx.rect(x - r, y - r, r * 2, r * 2);
		if (solid) ctx.fill();
		else ctx.stroke();
		ctx.restore();
	},

	arrowhead: function(ctx, x, y, r, a, solid, s) {
		ctx.save();
		if (s) {
			setStyle(ctx, s);
		}
		if (r < 10) {
			ctx.setLineDash([]);
		}
		ctx.translate(x, y);
		ctx.rotate(a); // - Math.PI * 0.5);
		ctx.translate(r * 0.5, 0);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		// ctx.lineTo(-r, r * Math.SQRT1_2);
		// ctx.lineTo(-r, -r * Math.SQRT1_2);
		ctx.lineTo(-r * Math.SQRT2, r * Math.SQRT1_2);
		ctx.arcTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2, r);
		// ctx.quadraticCurveTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2);
		ctx.lineTo(0, 0);
		if (solid) ctx.fill();
		else ctx.stroke();
		ctx.restore();
	}
};
