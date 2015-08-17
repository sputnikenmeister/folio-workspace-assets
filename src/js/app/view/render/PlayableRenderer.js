/**
 * @module app/view/render/PlayableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("./MediaRenderer");

// var duotone = require("../../../utils/canvas/bitmap/duotone");
// var stackBlurRGB = require("../../../utils/canvas/bitmap/stackBlurRGB");
// var stackBlurMono = require("../../../utils/canvas/bitmap/stackBlurMono");
// var getAverageRGBA = require("../../../utils/canvas/bitmap/getAverageRGBA");
var getAverageRGB = require("../../../utils/canvas/bitmap/getAverageRGB");

var _sharedCanvas = null;
var getSharedCanvas =  function() {
	if (_sharedCanvas === null) {
		_sharedCanvas = document.createElement("canvas");
	}
	return _sharedCanvas;
};

/**
 * @constructor
 * @type {module:app/view/render/PlayableRenderer}
 */
module.exports = MediaRenderer.extend({
	
	// /** @type {Function} */
	// template: require( "./PlayableRenderer.hbs" ),
	
	/** @type {string|Function} */
	className: MediaRenderer.prototype.className + " playable-renderer",
	
	/** @override */
	initialize: function (opts) {
		MediaRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this, "_onToggleEvent");
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	// createChildren: function() {
	// 	this.el.innerHTML = this.template(this.model.toJSON());
	// 	this.placeholder = this.el.querySelector(".placeholder");
	// 	this.content = this.el.querySelector(".content");
	// 	this.image = this.content.querySelector("img.current");
	// 	this.playToggle = this.el.querySelector(".play-toggle");
	// },
	
	setEnabled: function(enabled) {
		this.model.selected && this.toggleMediaPlayback(enabled);
	},
	
	/* ---------------------------
	/* selection handlers
	/* when model is selected, click toggles playback
	/* --------------------------- */
	
	addSelectionListeners: function() {
		this.listenTo(this.model, {
			"selected": this._onModelSelected,
			"deselected": this._onModelDeselected,
		});
		this.model.selected && this._onModelSelected();
	},
	
	/* model selection
	/* --------------------------- */
	
	/** @type {String} */
	_toggleEvent: "mouseup",
	
	_onModelSelected: function() {
		// this.toggleMediaPlayback(true);
		this.playToggle.addEventListener(this._toggleEvent, this._onToggleEvent, false);
		this.listenTo(this, "view:remove", this._removeClickHandler);
	},
	
	_onModelDeselected: function() {
		this.toggleMediaPlayback(false);
		this.playToggle.removeEventListener(this._toggleEvent, this._onToggleEvent, false);
		this.stopListening(this, "view:remove", this._removeClickHandler);
	},
	
	_removeClickHandler: function() {
		this.playToggle.removeEventListener(this._toggleEvent, this._onToggleEvent, false);
	},
	
	/* click dom event
	/* --------------------------- */
	_onToggleEvent: function(domev) {
		// console.log("PlayableRenderer._onToggleEvent", domev.type, "defaultPrevented: " + domev.defaultPrevented);
		
		// NOTE: Perform action if MouseEvent.button is 0 or undefined (0: left-button)
		if (!domev.defaultPrevented && !domev.button) {
			this.toggleMediaPlayback();
			domev.preventDefault();
		}
	},
	
	/* --------------------------- *
	/* abstract methods
	/* --------------------------- */
	
	toggleMediaPlayback: function(newPlayState) {
		// abstract
	},
	
	setMediaState: function(key) {
		this.content.classList.toggle("pending-network", key === "network");
		this.content.classList.toggle("pending-user", key === "user");
		this.content.classList.toggle("pending-media", key === "media");
	},
	
	/* --------------------------- *
	/* util
	/* --------------------------- */
	
	updateOverlayBackground: function(targetEl, contentEl) {
		// src/dest rects
		// ------------------------------
		var tX = targetEl.offsetLeft,
			tY = targetEl.offsetTop + 1,
			tW = targetEl.offsetWidth,
			tH = targetEl.offsetHeight;
			
		// rendered size
		var rW = this.contentWidth;
		var rH = this.contentHeight + 1;
		// source size
		var sW = this.model.get("w");
		var sH = this.model.get("h");
		// source/rendered scale
		var rsX = sW/rW;
		var rsY = sH/rH;
		// Copy image to canvas
		// ------------------------------
		var canvas, context, imageData;
		
		canvas = getSharedCanvas();
		// canvas = document.createElement("canvas");
		canvas.style.width  = tW + "px";
		canvas.style.height = tH + "px";
		canvas.width = tW;
		canvas.height = tH;
		context = canvas.getContext("2d");
		context.clearRect(0, 0, tW, tH);
		context.drawImage(contentEl, tX*rsX, tY*rsY, tW*rsX, tH*rsY, 0, 0, tW, tH);
		imageData = context.getImageData(0, 0, tW, tH);
		
		// Color, filter opts
		// ------------------------------
		
		// this.fgColor || (this.fgColor = new Color(this.model.attrs()["color"]));
		// this.bgColor || (this.bgColor = new Color(this.model.attrs()["background-color"]));
		
		// var opts, isFgDark;
		// opts = {};
		// isFgDark = this.fgColor.luminosity() < this.bgColor.luminosity();
		// opts.x00 = isFgDark? this.fgColor.clone().lighten(0.5) : this.bgColor.clone().darken(0.5);
		// opts.xFF = isFgDark? this.bgColor.clone().lighten(0.5) : this.fgColor.clone().darken(0.5);
		
		// opts.radius = 20;
		// stackBlurMono(imageData, opts);
		// opts.radius = 50;
		// stackBlurRGB(imageData, opts);
		// duotone(imageData, opts);
		
		// context.putImageData(imageData, 0, 0);
		// targetEl.style.backgroundImage = "url(" + canvas.toDataURL() + ")";
		
		var avgColor = Color().rgb(getAverageRGB(imageData));
		targetEl.classList.toggle("over-dark", !avgColor.dark());
		
		// var fgContrast, bgContrast;
		// fgContrast = avgColor.contrast(this.fgColor);
		// bgContrast = avgColor.contrast(this.bgColor);
		// console.log("isFgDark", isFgDark, avgColor.hexString(), "fgContrast", fgContrast, "bgContrast", bgContrast);
		
		// targetEl.style.color = (fgContrast >= bgContrast? this.fgColor : this.bgColor).rgbString();
		
		// targetEl.style.color = avgColor.dark()?
		// 		"rgb(255,255,255)" : "rgb(0,0,0)";
		// targetEl.style.backgroundColor = avgColor.dark()?
		// 		"rgba(0,0,0,0.75)" : "rgba(255,255,255,0.75)";
		// targetEl.style.boxShadow = "0 0 2px -1px " + (avgColor.dark()?
		// 		"rgb(255,255,255)" : "rgb(0,0,0)");
			// avgColor.rgbString();
			
	},
}/*,{
	whenSelectionIsContiguous: whenSelectionIsContiguous,
	whenSelectTransitionEnds: whenSelectTransitionEnds,
	whenDefaultImageLoads: whenDefaultImageLoads, 
}*/);
