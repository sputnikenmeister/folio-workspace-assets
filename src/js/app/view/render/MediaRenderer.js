/**
 * @module app/view/render/MediaRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("../../model/item/MediaItem");

/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");

/** @type {module:app/view/promise/whenTransitionEnds} */
var whenTransitionEnds = require("../promise/whenTransitionEnds");
/** @type {module:app/view/promise/whenImageLoads} */
var whenImageLoads = require("../promise/whenImageLoads");
/** @type {module:app/view/promise/whenSelectTransitionEnds} */
var whenSelectTransitionEnds = require("../promise/whenSelectTransitionEnds");
/** @type {module:app/view/promise/whenSelectionIsContiguous} */
var whenSelectionIsContiguous = require("../promise/whenSelectionIsContiguous");
/** @type {module:app/view/promise/whenDefaultImageLoads} */
var whenDefaultImageLoads = require("../promise/whenDefaultImageLoads");

// /** @type {module:app/utils/net/loadImage} */
// var loadImage = require("../../../utils/net/loadImage");
// var loadImageXHR = require("../../../utils/net/loadImageXHR");
// var loadImageDOM = require("../../../utils/net/loadImageDOM");


/** @type {Function} */
var viewTemplate = require( "./MediaRenderer.tpl" );

/**
 * @constructor
 * @type {module:app/view/render/MediaRenderer}
 */
module.exports = View.extend({
	
	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item media-item idle",
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	/** @type {Function} */
	template: viewTemplate,
	
	// /** @override */
	constructor: function(options) {
		_.bindAll(this, "_onToggleEvent");
		View.apply(this, arguments);
	},
	
	// /** @override */
	// initialize: function (opts) {
	// 	// this.createChildren();
	// },
	
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
	
	/** @return {this} */
	render: function () {
		var sW, sH; // source dimensions
		var pcW, pcH; // measured values
		var cX, cY, cW, cH; // computed values
		var pA, sA;
		
		var content = this.content;
		var sizing = this.placeholder;
		
		sizing.style.maxWidth = "";
		sizing.style.maxHeight = "";
		
		cX = sizing.offsetLeft + sizing.clientLeft;
		cY = sizing.offsetTop + sizing.clientTop;
		
		pcW = sizing.clientWidth;
		pcH = sizing.clientHeight;
		sW = this.model.get("w");
		sH = this.model.get("h");
		
		// Unless both client dimensions are larger than the source's
		// choose constraint direction by aspect ratio
		if (sW < pcW && sH < pcH) {
			cW = sW;
			cH = sH;
		} else if ((pcW/pcH) < (sW/sH)) {
			cW = pcW;
			cH = Math.round((cW / sW) * sH);
		} else {
			cH = pcH;
			cW = Math.round((cH / sH) * sW);
		}
		
		// crop video 1px top
		this.video.style.marginTop = "-1px";
		this.video.setAttribute("width", cW);
		this.video.setAttribute("height", cH);
		cH--; // NOTE: other elements must use video's CROPPED height 
		
		content.style.left = cX + "px";
		content.style.top = cY + "px";
		content.style.width = cW + "px";
		content.style.height = cH + "px";
		
		// sizing.style.maxWidth = (cW + (poW - pcW)) + "px";
		// sizing.style.maxHeight = (cH + (poH - pcH)) + "px";
		// sizing.style.maxWidth = cW + "px";
		// sizing.style.maxHeight = cH + "px";
		sizing.style.maxWidth = content.offsetWidth + "px";
		sizing.style.maxHeight = content.offsetHeight + "px";
		
		return this;
	},
	
	setEnabled: function(enabled) {
		this.model.selected && this.toggleMediaPlayback(enabled);
	},
	
	/* --------------------------- *
	/* utils
	/* --------------------------- */
	
	_getSelectionDistance: function() {
		return Math.abs(this.model.collection.indexOf(this.model) - this.model.collection.selectedIndex);
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
		domev.defaultPrevented || this.toggleMediaPlayback();
		console.log("XXX-C MediaRenderer._onToggleEvent", domev.type, "defaultPrevented: " + domev.defaultPrevented);
	},
	
	/* --------------------------- *
	/* abstract methods
	/* --------------------------- */
	
	toggleMediaPlayback: function(newPlayState) {
		// abstract
	},
},{
	whenSelectionIsContiguous: whenSelectionIsContiguous,
	whenSelectTransitionEnds: whenSelectTransitionEnds,
	whenDefaultImageLoads: whenDefaultImageLoads, 
});

/*
addSiblingListener: function (handler) {
	var owner = this.model.collection;
	var m = owner.indexOf(this.model);
	var check = function (n) {
		// Check indices for contiguity
		return (m === n) || (m + 1 === n) || (m - 1 === n);
	};
	
	var transitionCallback, transitionProp, transitionCancellable;
	var handleRemove, handleSelect;

	transitionProp = this.getPrefixedStyle("transform");
	transitionCallback = function(exec) {
		this.off("view:remove", handleRemove);
		exec && handler.call(this);
	};
	handleRemove = function() {
		transitionCancellable(false);
	};
	handleSelect = function(model) {
		if (check(owner.selectedIndex)) {
			this.stopListening(owner, "select:one select:none", handleSelect);
			this.on("view:remove", handleRemove);
			transitionCancellable = this.onTransitionEnd(this.el, transitionProp, transitionCallback, 400);
		}
	};
	if (check(owner.selectedIndex)) {
		handler.call(this);
	} else {
		this.listenTo(owner, "select:one select:none", handleSelect);
	}
},

_onSiblingSelect: function() {
	if (this.model.has("prefetched")) {
		this.image.src = this.model.get("prefetched");
		this.el.classList.remove("idle");
		this.el.classList.add("done");
	} else {
		this.createDeferredImage(this.model.getImageUrl(), this.image).promise();
	}
},
*/

/* --------------------------- *
/* default image promise
/* --------------------------- */
/*
createDeferredImage: function(url, target) {
	var o = loadImage(url, target, this);
	o.always(function() {
		this.placeholder.removeAttribute("data-progress");
		this.off("view:remove", o.cancel);
	}).then(
		this._onLoadImageDone,
		this._onLoadImageError, 
		this._onLoadImageProgress
	).then(function(url) {
		// this.model.set({"prefetched": url});
		o.isXhr && this.on("view:remove", function() {
			window.URL.revokeObjectURL(url);
		});
	});
	this.on("view:remove", o.cancel);
	return o;
},

_onLoadImageProgress: function (progress) {
	if (progress == "loadstart") {
		this.el.classList.remove("idle");
		this.el.classList.add("pending");
	} else {
		this.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
	}
},

_onLoadImageDone: function (url) {
	this.el.classList.remove("pending");
	this.el.classList.add("done");
},

_onLoadImageError: function (err) {
	console.error("VideoRenderer.onError: " + err.message, err.ev);
	this.el.classList.remove("pending");
	this.el.classList.add("error");
},
*/
