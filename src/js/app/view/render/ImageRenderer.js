/**
 * @module app/view/render/ImageRenderer
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
/** @type {module:app/view/promise/whenSelectionIsContiguous} */
var whenSelectionIsContiguous = require("../promise/whenSelectionIsContiguous");
/** @type {module:app/view/promise/whenTransitionEnds} */
var whenTransitionEnds = require("../promise/whenTransitionEnds");

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
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		this._onLoadImageProgress = _.throttle(this._onLoadImageProgress, 100,
				{leading: true, trailing: true});
				
		this.createChildren();
		this.addSiblingListeners();
	},
	
	remove: function() {
		// NOTE: pending promises are destroyed on "view:remove" event
		return View.prototype.remove.apply(this, arguments);
	},
	
	/* --------------------------- *
	 * children/layout
	 * --------------------------- */
	
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.image = this.content = this.el.querySelector(".content");
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
	 * selection
	 * --------------------------- */
	
	whenSelectionIsContiguous: function() {
		return new Promise(function(resolve, reject) {
			var owner = this.model.collection;
			var m = owner.indexOf(this.model);
			var check = function (n) {
				// Check indices for contiguity
				// return (m === n) || (m + 1 === n) || (m - 1 === n);
				return Math.abs(m - n) < 2;
			};
			if (check(owner.selectedIndex)) {
				resolve(this.model);
			} else {
				var handleSelect = function(model) {
					if (check(owner.selectedIndex)) {
						this.stopListening(owner, "select:one select:none", handleSelect);
						resolve(this.model);
					}
				};
				this.listenTo(owner, "select:one select:none", handleSelect);
			}
		}.bind(this));
	},
	
	addSiblingListeners: function() {
		// this.whenSelectionIsContiguous().then(
		whenSelectionIsContiguous(this).then(
			function(view) {
				if (!view.model.selected) {
					// return this.whenTransitionEnds(this.el, "transform", Globals.TRANSITION_DELAY * 2);
					return whenTransitionEnds(view, view.el, "transform", Globals.TRANSITION_DELAY * 2);
				}
			}
		).then(
			function() {
				console.log(this.model.cid, "transition promise resolved");
				if (this.model.has("prefetched")) {
					console.log(this.model.cid, "image promise resolved (prefetched)");
					this.el.classList.remove("idle");
					this.el.classList.add("done");
					return this.image.src = this.model.get("prefetched");
				} else {
					return this.createDeferredImage(this.model.getImageUrl(), this.image).promise();
				}
			}.bind(this)
		).catch(function(err) {
			if (err instanceof ViewError) {
				console.log("ImageRenderer:" + err.message);
			} else {
				console.error("ImageRenderer promise error", err);
			}
		});
			
	},
	
	/* --------------------------- *
	/* media loading
	/* --------------------------- */
	
	createDeferredImage: function(url, target) {
		var o = loadImage(url, target, this);
		o.always(function() {
			this.placeholder.removeAttribute("data-progress");
			this.off("view:remove", o.cancel);
		}).then(
			this._onLoadImageDone,
			this._onLoadImageError, 
			this._onLoadImageProgress
		);
		this.on("view:remove", o.cancel);
		return o.promise();
	},
	
	_onLoadImageDone: function (url) {
		console.log(this.model.cid, "ImageRenderer._onImageLoad", url);
		this.el.classList.remove("pending");
		this.el.classList.add("done");
		if (/^blob\:.*/.test(url)) {
			this.model.set({"prefetched": url});
			// this.on("view:remove", function() {
			// 	window.URL.revokeObjectURL(url);
			// });
		}
	},
	
	_onLoadImageError: function (err) {
		console.error(this.model.cid, "ImageRenderer._onImageError: " + err.message, err.ev);
		this.el.classList.remove("pending");
		this.el.classList.add("error");
	},
	
	_onLoadImageProgress: function (progress) {
		console.log(this.model.cid, "ImageRenderer._onImageProgress", progress);
		if (progress == "loadstart") {
			this.el.classList.remove("idle");
			this.el.classList.add("pending");
		} else {
			this.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
		}
	},
	
	/*
	
	addSiblingListeners2: function () {
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
		if (this.model.has("prefetched")) {
			this.image.src = this.model.get("prefetched");
			this.el.classList.remove("idle");
			this.el.classList.add("done");
		} else {
			this.createDeferredImage(this.model.getImageUrl(), this.image).promise();
		}
	},
	
	*/
	
	/*createDeferredImage2: function() {
		return Promise.resolve(function() {
			this.el.classList.remove("idle");
			if (this.model.has("prefetched")) {
				this.el.classList.add("done");
				return this.image.src = this.model.get("prefetched");
			} else {
				var deferred = loadImage(this.model.getImageUrl(), this.image, this);
				deferred.always(function() {
						this.el.classList.remove("pending");
						this.placeholder.removeAttribute("data-progress");
						this.off("view:remove", deferred.cancel);
					})
				.then(function(url) {
						this.el.classList.add("done");
						deferred.isXhr && this.on("view:remove", function() {
							window.URL.revokeObjectURL(url);
						});
						// this.model.set({"prefetched": url});
					}, function(err) {
						console.error("ImageRenderer._onImageError: " + err.message, err.ev);
						this.el.classList.add("error");
					}, function(progress) {
						isNaN(progress) || this.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
					}
				);
				this.on("view:remove", deferred.cancel);
				this.el.classList.add("pending");
				
				// if (deferred.isXhr) {
				// 	deferred.source.onprogress = function (ev) {
				// 		this.placeholder.setAttribute("data-progress",
				// 					((ev.loaded / ev.total) * 100).toFixed(0));
				// 	}.bind(this);
				// }
				return deferred.promise();
			}
		}.bind(this));
	},*/
	
	/* --------------------------- *
	 * utils
	 * --------------------------- */
	 
	_getSelectionDistance: function() {
		return Math.abs(this.model.collection.indexOf(this.model) - this.model.collection.selectedIndex);
	},
	
});
