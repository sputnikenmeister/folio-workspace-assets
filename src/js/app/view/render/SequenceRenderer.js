/**
 * @module app/view/render/SequenceRenderer
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
// var loadImage = require("../../utils/net/loadImage");
var loadImageXHR = require("../../utils/net/loadImageXHR");
var loadImageDOM = require("../../utils/net/loadImageDOM");

/** @type {Function} */
var viewTemplate = require( "./SequenceRenderer.tpl" );

/** @type {Function} */
// var progressTemplate = require( "../template/ProgressCircleSVG.tpl" );

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer}
 */
module.exports = View.extend({
	
	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item media-item sequence-renderer idle",
	/** @type {module:app/model/ImageItem} */
	model: ImageItem,
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		this._onProgress = _.throttle(this._onProgress, 100, {leading: true, trailing: true});
		
		this.createChildren();
		
		if (this.model.has("prefetched")) {
			// console.log("SequenceRenderer.initialize: using prefetched " + this.model.get("prefetched"));
			// this._sequenceSrc[0] = this.model.get("prefetched");
			// this._sequenceIdx = 0;
			
			this.image.src = this.model.get("prefetched");
			this.el.classList.remove("idle");
			this.el.classList.add("done");
			this.initializeSequence();
		} else {
			this.addSiblingListeners();
		}
	},
	
	remove: function() {
		// NOTE: pending promises are destroyed on "view:remove" event
		// this.el.classList.contains("pending") && this.promise.destroy();
		this.content.removeEventListener("dragstart", this._preventDragstartDefault, true);
		return View.prototype.remove.apply(this, arguments);
	},
	
	/* --------------------------- *
	 * children/layout
	 * --------------------------- */
	
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.content = this.el.querySelector(".content");
		this.image = this.content.querySelector("img.current");
		
		this.content.addEventListener("dragstart", this._preventDragstartDefault, true);
		
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
		
		var content = this.content;
		var sizing = this.placeholder;
		
		sizing.style.maxWidth = "";
		sizing.style.maxHeight = "";
		
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
		
		cX = sizing.offsetLeft + sizing.clientLeft;
		cY = sizing.offsetTop + sizing.clientTop;
		
		this.image.setAttribute("width", cW);
		this.image.setAttribute("height", cH);
		
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
	
	/** @override */
	setEnabled: function(enabled) {
		if (enabled && this.model.collection.selected === this.model) {
			this.startSequence();
		} else {
			this.stopSequence();
		}
	},
	
	/* --------------------------- *
	 * dom event handlers
	 * --------------------------- */
	
	_preventDragstartDefault: function (ev) {
		ev.defaultPrevented || ev.preventDefault();
	},
	
	/* --------------------------- *
	 * selection
	 * --------------------------- */
	
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
			exec && this._onSelectSibling();
		};
		handleRemove = function() {
			transitionCancellable(false);
		};
		handleSelect = function(model) {
			if (check(owner.selectedIndex)) {
				this.stopListening(owner, "select:one select:none", handleSelect);
				this.on("view:remove", handleRemove);
				transitionCancellable = this.onTransitionEnd(this.el, transitionProp, transitionCallback, Globals.TRANSITION_DELAY * 2);
			}
		};
		if (check(owner.selectedIndex)) {
			this._onSelectSibling();
		} else {
			this.listenTo(owner, "select:one select:none", handleSelect);
		}
	},
	
	_onSelectSibling: function() {
		this.createFirstImagePromise().request();
	},
	
	/* --------------------------- *
	 * first image promise
	 * --------------------------- */
	
	createFirstImagePromise: function() {
		var promise = loadImageXHR(this.model.getImageUrl(), this.image, this);
		promise.then(
			this._onFirstImageDone,
			this._onFirstImageError, 
			this._onFirstImageProgress
		).always(function() {
			this.placeholder.removeAttribute("data-progress");
			this.off("view:remove", promise.destroy);
		});
		this.on("view:remove", promise.destroy);
		return promise;
	},
	
	_onFirstImageProgress: function (progress, source, ev) {
		if (progress == "loadstart") {
			this.el.classList.remove("idle");
			this.el.classList.add("pending");
		} else {
			this.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
		}
	},
	
	_onFirstImageDone: function (url, source, ev) {
		this.model.set({"prefetched": url});
		this.el.classList.remove("pending");
		this.el.classList.add("done");
		this.initializeSequence();
	},
	
	_onFirstImageError: function (err, source, ev) {
		console.error("VideoRenderer.onError: " + err.message, arguments);
		this.el.classList.remove("pending");
		this.el.classList.add("error");
	},
	
	/* --------------------------- *
	 * sequence image promise
	 * --------------------------- */
	
	createNextImagePromise: function(url) {
		var promise = loadImageDOM(url, this.image, this);
		promise.then(
			this._onNextImageDone,
			this._onNextImageError,
			this._onNextImageProgress
		).always(function() {
			this.off("view:remove", promise.destroy);
		});
		this.on("view:remove", promise.destroy);
		return promise;
	},
	_onNextImageProgress: function (progress, source, ev) {},
	_onNextImageError: function (err, source, ev) {},
	_onNextImageDone: function (url, source, ev) {},
	
	/* --------------------------- *
	 * selection #2
	 * --------------------------- */
	
	// addSelectionListeners: function() {
	// 	this.listenTo(this.model.collection, "select:one select:none", this._onSelectAny);
	// 	this._onSelectAny();
	// },
	// 
	// _onSelectAny: function() {
	// 	var modelIndex = this.model.collection.indexOf(this.model);
	// 	var selectedIndex = this.model.collection.selectedIndex;
	// 	var indexDelta = Math.abs(selectedIndex - modelIndex);
	// 	if (modelIndex != 0) return;
	// 	switch (indexDelta) {
	// 		case 0:
	// 			// prepare resources & show media
	// 			break;
	// 		case 1:
	// 			// prepare resources
	// 			break;
	// 		default:
	// 			// clean resources
	// 	}
	// },
	
	/* --------------------------- *
	 * sequence init
	 * --------------------------- */
		
	initializeSequence: function() {
		this._sequenceIntervalId = -1;
		this._sequenceInterval = 3000;
		this._onSequenceStep = this._onSequenceStep.bind(this);
		
		this.createSequenceChildren();
		
		var owner = this.model.collection;
		var startOnSelect = function(model) {
			if (model === this.model) {
				this.startSequence();
				this.listenToOnce(owner, "deselect:one", this.stopSequence);
			}
		};
		this.listenTo(owner, "select:one", startOnSelect);
		startOnSelect.call(this, owner.selected);
	},
	
	createSequenceChildren: function() {
		if (this.model.has("srcset")) {
			var buffer = document.createDocumentFragment();
			var srcset = this.model.get("srcset");
			var img, i = srcset.length;
			this.image.className = "current"; // ensure who is the current node...
			while (i--) {
				img = this.image.cloneNode();
				img.className = ""; // ...and who is not
				img.src = Globals.MEDIA_DIR + "/" + srcset[i]["src"];
				buffer.appendChild(img);
			}
			this.content.insertBefore(buffer, this.content.firstElementChild);
		}
	},
	
	// createSequenceModel: function() {
	// 	this._sequenceIdx = -1;
	// 	this._sequenceSrc = [];
	// 	// add first image
	// 	this._sequenceSrc[0] = this.model.getImageUrl();
	// 	this._sequenceEls[0] = this.image;
	// 	
	// 	if (this.model.has("srcset")) {
	// 		var buffer = document.createDocumentFragment();
	// 		var srcset = this.model.get("srcset");
	// 		for (var i = 0, img, src; i < srcset.length; i++) {
	// 			img = this.image.cloneNode();
	// 			src = Globals.MEDIA_DIR + "/" + srcset[i]["src"];
	// 			img.className = "";
	// 			img.src = src;
	// 			this._sequenceSrc[i + 1] = src;
	// 			this._sequenceEls[i + 1] = img;
	// 			buffer.appendChild(img);
	// 		}
	// 		this.content.insertBefore(buffer, this.content.firstElementChild);
	// 	}
	// },
	
	/* --------------------------- *
	 * sequence ctl
	 * --------------------------- */
	
	isSequenceRunning: function() {
		return this._sequenceIntervalId != -1;
	},
	
	startSequence: function() {
		if (this._sequenceIntervalId == -1) {
			this._sequenceIntervalId = window.setInterval(this._onSequenceStep, this._sequenceInterval);
			this.listenTo(this, "view:remove", this.stopSequence);
			console.log(this.cid, "SequenceRenderer.startSequence");
		}
	},
	
	stopSequence: function() {
		if (this._sequenceIntervalId != -1) {
			window.clearInterval(this._sequenceIntervalId);
			this._sequenceIntervalId = -1;
			this.stopListening(this, "view:remove", this.stopSequence);
			console.log(this.cid, "SequenceRenderer.stopSequence");
		}
	},
	
	_onSequenceStep: function() {
		var outgoing = this.content.querySelector(".current");
		var incoming = outgoing.previousElementSibling;
		if (!incoming) {
			incoming = this.content.lastElementChild;
		}
		outgoing.className = "";
		incoming.className = "current";
		console.log(this.cid, "SequenceRenderer._onSequenceStep");
	},
	
	/* --------------------------- *
	 * svg progress display
	 * --------------------------- */
	
	createProgressDisplay: function() {
		var progressEl = this.el.querySelector(".progress-circle");
		
		var amountShape = progressEl.querySelector("#amount");
		var stepsShape = progressEl.querySelector("#steps");
		
		var start = 0.75;
		var stepsWidth = 8;
		var stepsNum = this.content.children.length;

		var c2 = stepsShape.getAttribute("r") * Math.PI * 2;
		stepsShape.style.strokeDashoffset = (start) * c2 + stepsWidth/2;
		stepsShape.style.strokeDasharray = [stepsWidth, (c2 - (stepsNum*stepsWidth))/stepsNum].join(",");

		var clampFloat = function(val) {
		  if (isNaN(val)) return 0; 
		  else if (val < 0) return 0;
		  else if (val > 1) return 1;
		  else return val;
		};

		this.updateProgress = function() {
			var amount = 0.33;

			var c = amountShape.getAttribute("r") * Math.PI * 2;
			amountShape.style.strokeDashoffset = (start) * c;
			amountShape.style.strokeDasharray = [amount * c, (1-amount) * c].join(",");
			
			progressEl.setAttribute("data-amount", amount);
		};
	},
	
	updateProgress: function() {},
});
