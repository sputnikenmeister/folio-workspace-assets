/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../../model/item/ImageItem");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/** @type {module:app/utils/net/loadImage} */
var loadImage = require("../../utils/net/loadImage");
//var loadImage = require("../../utils/net/loadImageDOM");

/** @type {Function} */
var viewTemplate = require( "./ImageRenderer.tpl" );

/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */
module.exports = View.extend({
	
	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item media-item image-renderer idle",
	/** @type {module:app/model/ImageItem} */
	model: ImageItem,
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		this.createChildren();
		
		if (this.model.has("prefetched")) {
			// console.log("ImageRenderer.initialize: using prefetched " + this.model.get("prefetched"));
			this.content.src = this.model.get("prefetched");
			this.el.classList.remove("idle");
			this.el.classList.add("done");
			// this.$el.removeClass("idle").addClass("done");
		} else {
			this.addSiblingListeners();
		}
	},
	
	remove: function() {
		// NOTE: pending promises are destroyed on "view:remove" event
		// this.el.classList.contains("pending") && this.promise.destroy();
		this.content.removeEventListener("dragstart", this._preventDragstartDefault, false);
		// this.$(".content").off("dragstart");
		return View.prototype.remove.apply(this, arguments);
	},
	
	/* --------------------------- *
	 * children/layout
	 * --------------------------- */
	
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.content = this.el.querySelector(".content");
		this.content.addEventListener("dragstart", this._preventDragstartDefault, false);
		
		// this.$el.html(this.template(this.model.toJSON()));
		// this.$placeholder = this.$(".placeholder");
		// this.$content = this.$(".content");
		// this.placeholder = this.$placeholder[0];
		// this.content = this.$content[0];
		// this.$(".content").on("dragstart", function (ev) {
		// 	ev.isDefaultPrevented() || ev.preventDefault();
		// });
	},
	
	/** @return {this} */
	render: function () {
		var sW, sH; // source dimensions
		var pcW, pcH; // measured values
		var cX, cY, cW, cH; // computed values
		var pA, sA;
		
		var img = this.content;
		var p = this.placeholder;
		
		// clear placeholder size
		p.style.maxWidth = "";
		p.style.maxHeight = "";
		
		cX = p.offsetLeft + p.clientLeft;
		cY = p.offsetTop + p.clientTop;
		
		pcW = p.clientWidth;
		pcH = p.clientHeight;
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

		// this.$content.attr({width: cW, height: cH});
		img.setAttribute("width", cW);
		img.setAttribute("height", cH);
		
		// this.$content.css({left: cX, top: cY});
		img.style.left = cX + "px";
		img.style.top = cY + "px";
		
		// this.$placeholder.css({maxWidth: cW + (poW - pcW), maxHeight: cH + (poH - pcH)});
		// this.$placeholder.css({maxWidth: cW, maxHeight: cH});
		p.style.maxWidth = img.offsetWidth + "px";
		p.style.maxHeight = img.offsetHeight + "px";
		
		return this;
	},
	
	/* --------------------------- *
	 * dom event handlers
	 * --------------------------- */
	
	_preventDragstartDefault: function (ev) {
		// ev.isDefaultPrevented() || ev.preventDefault();
		ev.defaultPrevented || ev.preventDefault();
	},
	
	/* --------------------------- *
	 * image loading
	 * --------------------------- */
	
	createImagePromise: function() {
		var onLoad, onError, onProgress, doAlways, promise;
		
		onProgress = function (progress, source, ev) {
			if (progress == "loadstart") {
				//console.debug("VideoRenderer.onProgress_loadstart: " + this.model.get("src"));
				this.el.classList.remove("idle");
				this.el.classList.add("pending");
				// this.$el.removeClass("idle").addClass("pending");
			} else {
				// this.$placeholder.attr("data-progress", (progress * 100).toFixed(0));
				this.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
			}
		};
		onProgress = _.throttle(onProgress, 100, {leading: true, trailing: true});
		onError = function (err, source, ev) {
			console.error("VideoRenderer.onError: " + err.message, arguments);
			this.el.classList.remove("pending");
			this.el.classList.add("error");
			// this.$el.removeClass("pending").addClass("error");
		};
		onLoad = function (url, source, ev) {
			//console.debug("VideoRenderer.onLoad: " + this.model.get("src"));
			this.model.set({"prefetched": url});
			this.el.classList.remove("pending");
			this.el.classList.add("done");
			// this.$el.removeClass("pending").addClass("done");
		};
		doAlways = function() {
			// this.$placeholder.removeAttr("data-progress");
			this.placeholder.removeAttribute("data-progress");
			this.off("view:remove", promise.destroy);
		};
		
		promise = loadImage(this.model.getImageUrl(), this.content, this);
		promise.then(onLoad, onError, onProgress).always(doAlways);
		this.on("view:remove", promise.destroy);
		
		return promise;
	},
	
	addSiblingListeners: function () {
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
			exec && this._onSiblingSelect();
		};
		handleRemove = function() {
			transitionCancellable(false);
		};
		handleSelect = function(model) {
			if (check(owner.selectedIndex)) {
				this.stopListening(owner, "select:one select:none", handleSelect);
				this.on("view:remove", handleRemove);
				
				transitionCancellable = this.onTransitionEnd(this.el, transitionProp, transitionCallback, Globals.TRANSITION_DELAY * 2);
				// transitionCancellable = addTransitionCallback(transitionProp, transitionCallback, this.el, this, Globals.TRANSITION_DELAY * 2);
			}
		};
		if (check(owner.selectedIndex)) {
			this._onSiblingSelect();
		} else {
			this.listenTo(owner, "select:one select:none", handleSelect);
		}
	},
	
	_onSiblingSelect: function() {
		this.createImagePromise().request();
	},
});
