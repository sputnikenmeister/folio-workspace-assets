/**
 * @module app/view/render/MediaRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:underscore} */
var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("app/model/item/MediaItem");
/** @type {module:app/view/CarouselRenderer} */
var CarouselRenderer = require("app/view/render/CarouselRenderer");

/**
 * @constructor
 * @type {module:app/view/render/MediaRenderer}
 */
var MediaRenderer = CarouselRenderer.extend({
	
	/** @type {string} */
	cidPrefix: "mediaRenderer",
	/** @type {string} */
	className: CarouselRenderer.prototype.className + " media-item",
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	
	properties: {
		defaultImage: {
			get: function() {
				return this._defaultImage || (this._defaultImage = this.el.querySelector("img.default"));
			}
		}
	},
	
	/** @override */
	initialize: function (opts) {
		if (this.model.attrs().hasOwnProperty("@classname")) {
			this.el.className += " " + this.model.attrs()["@classname"];
		}
		CarouselRenderer.prototype.initialize.apply(this, arguments);
		
		this.metrics.media = {};
		
		this.setState("idle");
		
		this.initializeAsync()
			.then(
				function(view) {
					console.log("%s initializeAsync resolved", view.cid);
					view.setState("done");
				})
			.catch(
				function(err) {
					if (err instanceof CarouselRenderer.ViewError) {
						// NOTE: ignore ViewError type
						// console.log(this.cid, err.name, err.message);
						return;
					}
					// this.placeholder.innerHTML = "<p class=\"color-fg\" style=\"position:absolute;bottom:0;padding:3rem;\"><strong>" + err.name + "</strong> " + err.message + "</p>";
					this.setState("error");
					console.error("%s initializeAsync %s: %s", this.cid, err.name, err.message);
					err.event && console.log(err.event);
				}.bind(this));
	},
	
	initializeAsync: function() {
		// var MediaRenderer = Object.getPrototypeOf(this).constructor;
		// return MediaRenderer.whenSelectionIsContiguous(this)
		return Promise.resolve(this)
			.then(MediaRenderer.whenSelectionIsContiguous)
			.then(MediaRenderer.whenSelectTransitionEnds)
			.then(MediaRenderer.whenDefaultImageLoads);
		// return Promise.resolve(this);
	},
	
	/* --------------------------- *
	/* child getters
	/* --------------------------- */
	
	/** @return {HTMLElement} */
	getDefaultImage: function () {
		return this.defaultImage;
		// return this._defaultImage || (this._defaultImage = this.el.querySelector("img.default"));
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
	},
	
	/** @override */
	measure: function () {
		CarouselRenderer.prototype.measure.apply(this, arguments);
		
		var sw, sh; // source dimensions
		var pcw, pch; // measured values
		var cx, cy, cw, ch, cs; // computed values
		var ew, eh; // content edge totals
		var cm; // content metrics
		
		cm = this.metrics.content;
		cx = cm.x;
		cy = cm.y;
		pcw = cm.width;
		pch = cm.height;
		
		ew = (cm.paddingLeft + cm.paddingRight + cm.borderLeftWidth + cm.borderRightWidth);
		eh = (cm.paddingTop + cm.paddingBottom + cm.borderTopWidth + cm.borderBottomWidth);
		pcw -= ew;
		pch -= eh;
		
		sw = this.model.get("w");
		sh = this.model.get("h");
		
		// Unless both client dimensions are larger than the source's
		// choose constraint direction by aspect ratio
		if (sw < pcw && sh < pch) {
			cs = 1;
			cw = sw;
			ch = sh;
		} else if ((pcw / pch) < (sw / sh)) {
			cw = pcw;
			cs = cw / sw;
			ch = Math.round(cs * sh);
		} else {
			ch = pch;
			cs = ch / sh;
			cw = Math.round(cs * sw);
		}
		
		this.metrics.content.x = cx;
		this.metrics.content.y = cy;
		this.metrics.content.width = cw + ew;
		this.metrics.content.height = ch + eh;
		
		this.metrics.media.width = cw;
		this.metrics.media.height = ch;
		this.metrics.media.scale = cs;
		
		// var sizing = this.getSizingEl();
		// sizing.style.maxWidth = (cw + ew) + "px";
		// sizing.style.maxHeight = (ch + eh) + "px";
		
		return this;
	},
	
	render: function () {
		// NOTE: not calling super.render, calling measure ourselves
		this.measure();
		
		var sizing = this.getSizingEl();
		sizing.style.maxWidth = this.metrics.content.width + "px";
		sizing.style.maxHeight = this.metrics.content.height + "px";
		
		return this;
	},
	
	_stateEnum: ["idle", "pending", "done", "error"],
	
	setState: function(key) {
		if (this._stateEnum.indexOf(key) === -1) {
			throw new Error("Argument " + key + " invalid. Must be one of: " + this._stateEnum.join(", "));
		}
		if (this._lastState !== key) {
			if (this._lastState) {
				this.el.classList.remove(this._lastState);
			}
			this.el.classList.add(key);
			this._lastState = key;
		}
	},
	
	// constructor: function () {
	// 	View.apply(this, arguments);
	// 	
	// 	// var _defaultImage;
	// 	// Object.defineProperty(this, "defaultImage", {get: function() {
	// 	// 	return _defaultImage || (_defaultImage = this.el.querySelector("img.default"));
	// 	// }});
	// 	// var _sizing;
	// 	// Object.defineProperty(this, "sizing", {get: function() {
	// 	// 	return _sizing || (_sizing = this.el.querySelector(".sizing"));
	// 	// }});
	// 	// var _content;
	// 	// Object.defineProperty(this, "content", {get: function() {
	// 	// 	return _content || (_content = this.el.querySelector(".content"));
	// 	// }});
	// 	
	// 	var _defaultImage, _sizing, _content;
	// 	Object.defineProperties(this, {
	// 		"defaultImage": { get: this.getDefaultImage },
	// 		"sizing": { get: this.getSizingEl },
	// 		"content": { get: this.getContentEl },
	// 	});
	// },
},{
	/** @type {module:app/view/promise/whenSelectionIsContiguous} */
	whenSelectionIsContiguous: require("app/view/promise/whenSelectionIsContiguous"),
	/** @type {module:app/view/promise/whenSelectTransitionEnds} */
	whenSelectTransitionEnds: require("app/view/promise/whenSelectTransitionEnds"),
	/** @type {module:app/view/promise/whenDefaultImageLoads} */
	whenDefaultImageLoads: require("app/view/promise/whenDefaultImageLoads"), 
});

/* ---------------------------
/* log to screen
/* --------------------------- */
if (DEBUG) {

MediaRenderer = (function(MediaRenderer) {
	
	/** @type {Function} */
	var Color = require("color");
	/** @type {module:underscore.strings/lpad} */
	var lpad = require("underscore.string/lpad");
	/** @type {module:underscore.strings/rpad} */
	var rpad = require("underscore.string/rpad");
	
	return MediaRenderer.extend({
		
		/** @override */
		initialize: function() {
			MediaRenderer.prototype.initialize.apply(this, arguments);
			
			var fgColor = this.model.attrs()["color"];
			// var bgColor = this.model.attrs()["background-color"];
			this.__logColors = {
				normal: new Color(fgColor).alpha(0.75).rgbaString(),
				ignored: new Color(fgColor).alpha(0.25).rgbaString(),
				error: "brown",
				abort: "orange"
			};
			this.__logStartTime = Date.now();
		},
		
		initializeAsync: function() {
			return MediaRenderer.prototype.initializeAsync.apply(this, arguments).catch(function(err) {
				if (!(err instanceof MediaRenderer.ViewError)) {
					this.__logMessage(err.message, err.name, this.__logColors["error"]);
				}
				return Promise.reject(err);
			}.bind(this));
		},
		
		/** @override */
		createChildren: function() {
			MediaRenderer.prototype.createChildren.apply(this, arguments);
			
			this.__logElement = document.createElement("div");
			this.__logElement.className = "debug-log";
			this.el.insertBefore(this.__logElement, this.el.firstElementChild);
		},
		
		/** @override */
		render: function() {
			MediaRenderer.prototype.render.apply(this, arguments);
			
			this.__logElement.style.marginTop = "3rem";
			this.__logElement.style.maxHeight = "calc(100% - " + (this.metrics.media.height) + "px - 3rem)";
			this.__logElement.style.width = this.metrics.media.width + "px";
			this.__logElement.scrollTop = this.__logElement.scrollHeight;
			
			return this;
		},
		
		__getTStamp: function() {
			// return new Date(Date.now() - this.__logStartTime).toISOString().substr(11, 12);
			return lpad(((Date.now() - this.__logStartTime)/1000).toFixed(3), 8, "0");
		},
		
		__logMessage: function(msg, logtype, color) {
			var logEntryEl = document.createElement("pre");
			
			logEntryEl.textContent = this.__getTStamp() + " " + msg;
			logEntryEl.setAttribute("data-logtype", logtype || "-");
			logEntryEl.style.color = color || this.__logColors[logtype] || this.__logColors.normal;
			
			this.__logElement.appendChild(logEntryEl);
			this.__logElement.scrollTop = this.__logElement.scrollHeight;
		},
	});
})(MediaRenderer);

} // end debug

module.exports = MediaRenderer;
