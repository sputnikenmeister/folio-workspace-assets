/**
 * @module app/view/render/SequenceRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("../../model/item/MediaItem");
/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("../../model/SelectableCollection");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/** @type {module:app/utils/net/loadImage} */
var loadImage = require("../../utils/net/loadImage");
// var loadImageXHR = require("../../utils/net/loadImageXHR");
// var loadImageDOM = require("../../utils/net/loadImageDOM");

/** @type {Function} */
var viewTemplate = require( "./SequenceRenderer.tpl" );
/** @type {Function} */
var progressTemplate = require( "../template/CircleProgressMeter.svg.tpl" );

var transitionEndEvent = require("../../utils/event/transitionEnd");

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer}
 */
module.exports = View.extend({
	
	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item media-item sequence-renderer idle",
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		_.bindAll(this, 
			"createSequenceChildren",
			"startSequence", "stopSequence",
			"_startSequenceStep", "_completeSequenceStep",
			"_onContentClick"
		);
		this._onLoadImageProgress = _.throttle(this._onLoadImageProgress.bind(this), 100,
					{leading: true, trailing: true});
		
		// Prepare sequence model
		var srcMapFn = function(item) {
			return Globals.MEDIA_DIR + "/" + item.src;
			// return { src: Globals.MEDIA_DIR + "/" + item.src };
		};
		var srcVal = this.model.get("srcset").map(srcMapFn);
		srcVal.unshift(srcMapFn(this.model.attributes));
		
		this._sequenceIdx = -1;
		this._sequenceEls = [];
		this._sequenceSrc = srcVal;
		// this.sources = new SelectableCollection(srcVal);
		
		this.createChildren();
		this.initializeMediaAllocation();
	},
	
	/* --------------------------- *
	 * children/layout
	 * --------------------------- */
	
	createChildren: function() {
		var o = null;
		
		o = this.el;
		o.innerHTML = this.template(this.model.toJSON());
		this.placeholder = o.querySelector(".placeholder");
		this.playToggle = o.querySelector(".play-toggle");
		
		o = this.content = o.querySelector(".content");
		// this.overlay = o.querySelector(".overlay");
		this.sequence = o.querySelector(".sequence");
		this.image = o.querySelector("img.current");
		
		this._isSequenceRunning = false;
		this._sequenceIntervalId = -1;
		this._sequenceInterval = 2500;
		this._sequenceStepDelay = 200;
		this._sequenceStepDur = (this._sequenceInterval - this._sequenceStepDelay - 1);
		
		this.progressMeter = this.createProgressMeter();
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
		
		// NOTE: image elements are given 100% w/h in CSS (.sequence-renderer .content img);
		// actual dimensions are set to the parent element (.sequence-renderer .content)
		// this.image.setAttribute("width", cW);
		// this.image.setAttribute("height", cH);
		
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
		this.model.selected && this.toggleMediaPlayback(enabled);
	},
	
	/* --------------------------- *
	 * media init
	 * --------------------------- */
	
	initializeMediaAllocation: function() {
		this._isMediaRequested = false;
		this.listenTo(this.model.collection,
			"select:one select:none", this._validateMediaAllocation);
		this._validateMediaAllocation();
	},
	
	keepAllocatedMedia: function() {
		this.stopListening(this.model.collection, "select:one select:none", this._validateMediaAllocation);
	},
	
	_getSelectionDistance: function() {
		return Math.abs(this.model.collection.indexOf(this.model) - this.model.collection.selectedIndex);
	},
	
	_validateMediaAllocation: function() {
		var d = this._getSelectionDistance();
		if (d < 2 && !this._isMediaRequested) {
			this._isMediaRequested = true;
			this.allocateMediaResources();
		} else if (d > 1 && this._isMediaRequested) {
			this._isMediaRequested = false;
			this.deallocateMediaResources();
		}
	},
	
	/* ---------------------------
	 * model event handlers
	 * --------------------------- */
	
	_onModelSelected: function() {
		this.toggleMediaPlayback(true);
		this.content.addEventListener("click", this._onContentClick, false);
		this.listenTo(this, "view:remove", this._removeClickHandler);
	},
	
	_onModelDeselected: function() {
		this.toggleMediaPlayback(false);
		this.content.removeEventListener("click", this._onContentClick, false);
		this.stopListening(this, "view:remove", this._removeClickHandler);
	},
	
	_removeClickHandler: function() {
		this.content.removeEventListener("click", this._onContentClick, false);
	},
	
	/* ---------------------------
	 * dom event handlers
	 * --------------------------- */
	
	_preventDragstartDefault: function (ev) {
		ev.defaultPrevented || ev.preventDefault();
	},
	
	_onContentClick: function(ev) {
		var sev = ev.originalEvent || ev;
		console.log("[VideoRenderer] " + sev.type, sev.defaultPrevented, sev.timeStamp, sev);
		ev.defaultPrevented || this.toggleMediaPlayback();
	},
	
	/* --------------------------- *
	 * MediaRenderer impl
	 * --------------------------- */
	
	allocateMediaResources: function() {
		// NOTE: allocating once
		this.keepAllocatedMedia();
		
		var whenSelectTransitionEnds = function() {
			if (!this.model.selected) {
				return this.whenTransitionEnds(this.el, "transform", Globals.TRANSITION_DELAY * 2);
			}
		}.bind(this);
		
		Promise.resolve(whenSelectTransitionEnds)
			.then(this.createDeferredImage(this.model.getImageUrl(), this.image).promise)
			.then(this.createSequenceChildren);
			
		// .then(function() {
		// 	this.model.selected && this.startSequence();
		// }.bind(this));
			
		// if (this.model.selected) {
		// 	deferredImage.promise()
		// 		.then(this.createSequenceChildren)
		// 		.then(this.startSequence);
		// } else {
		// 	this.getTransitionPromise2(this.el, "transform", Globals.TRANSITION_DELAY * 2)
		// 		.then(deferredImage.promise)
		// 		.then(this.createSequenceChildren);
		// }
	},
	
	deallocateMediaResources: function() {
		// abstract
	},
	
	toggleMediaPlayback: function(newPlayState) {
		if (!this.isSequenceReady() ||
				(_.isBoolean(newPlayState) && newPlayState === this.isSequenceRunning())) {
			return; // requested state is current, do nothing
		} else {
			newPlayState = !this.isSequenceRunning();
		}
		if (newPlayState) { // changing to what?
			this.startSequence();
		} else {
			this.stopSequence();
		}
	},
	
	/* --------------------------- *
	 * sequence private
	 * --------------------------- */
	
	isSequenceReady: function() {
		return this._sequenceIdx != -1;
	},
	
	getNextSequenceIndex: function () {
		var nextIdx = this._sequenceIdx + 1;
		if (nextIdx >= this._sequenceSrc.length) {
			nextIdx = 0;
		}
		return nextIdx;
	},
	
	isSequenceRunning: function() {
		return this._isSequenceRunning;
	},
	
	startSequence: function() {
		if (!this._isSequenceRunning) {
			this._isSequenceRunning = true;
			
			this.listenTo(this, "view:remove", this.stopSequence);
			// this.overlay.setAttribute("data-state", "media");
			this.el.setAttribute("data-state", "media");
			
			this._startSequenceStep();
			// this._sequenceIntervalId = this._sequenceStep();
			// this.updateProgress(this._sequenceIdx);
			// this.updateProgress(this._sequenceIdx, this._sequenceIdx + 1);
			// this._sequenceIntervalId = window.setInterval(this._sequenceStep, this._sequenceInterval);
			console.log(this.cid, "SequenceRenderer.startSequence", this._sequenceIntervalId);
		}
	},
	
	stopSequence: function() {
		if (this._isSequenceRunning) {
			this._isSequenceRunning = false;
			
			this.stopListening(this, "view:remove", this.stopSequence);
			// this.overlay.setAttribute("data-state", "user");
			this.el.setAttribute("data-state", "user");
			
			this._cancelSequenceStep();
			// this.updateProgress(this._sequenceIdx);
			// window.clearInterval(this._sequenceIntervalId);
			// this._sequenceIntervalId = -1;
			
			console.log(this.cid, "SequenceRenderer.stopSequence", this._sequenceIntervalId);
		}
	},
	
	_cancelSequenceStep: function () {
		this.updateProgress(this._sequenceIdx);
		this._sequenceIntervalId && window.clearTimeout(this._sequenceIntervalId) || (this._sequenceIntervalId = -1);
	},
	
	// _completeSequenceStep: function () {
	// 	// this._sequenceIntervalId = -1;
	// 	if (this._isSequenceRunning) {
	// 		console.log("SequenceRenderer.applySequenceStep", this._sequenceIdx, this.getNextSequenceIndex());
	// 		var nextIdx = this.getNextSequenceIndex();
	// 		this._sequenceEls[this._sequenceIdx].className = "";
	// 		this._sequenceEls[nextIdx].className = "current";
	// 		this._sequenceIdx = nextIdx;
	// 		this._startSequenceStep();
	// 	} else {
	// 		console.log("SequenceRenderer.applySequenceStep", this._sequenceIdx, "[sequence not running]");
	// 	}
	// },
	
	_startSequenceStep: function() {
		var view = this;
		return new Promise(function(resolve, reject) {
			var nextEl = view._sequenceEls[view.getNextSequenceIndex()];
			view._sequenceIntervalId = window.setTimeout(function() {
				view._sequenceIntervalId = -1;
				if (nextEl.complete) {
					console.log("resolve", "complete", nextEl.src);
					resolve();
				} else {
					resolve(new Promise(function(resolve, reject) {
						nextEl.onload = function(ev) {
							console.log("resolve", ev.type, nextEl.src);
							resolve.apply(this, arguments);
						};
						nextEl.onerror = function(ev) {
							console.log("reject", ev);
							reject.apply(this, arguments);
						};
					}));
				}
			}, view._sequenceInterval);
			view.updateProgress(view._sequenceIdx, view._sequenceIdx + 1);
		}).then(function () {
			// view._sequenceIntervalId = -1;
			if (view._isSequenceRunning) {
				console.log("SequenceRenderer.applySequenceStep", view._sequenceIdx, view.getNextSequenceIndex());
				var nextIdx = view.getNextSequenceIndex();
				view._sequenceEls[view._sequenceIdx].className = "";
				view._sequenceEls[nextIdx].className = "current";
				view._sequenceIdx = nextIdx;
				view._startSequenceStep();
			} else {
				console.log("SequenceRenderer.applySequenceStep", view._sequenceIdx, "[sequence not running]");
			}
		});
	},
	
	// _completeSequenceStep_2: function () {
	// 	this._sequenceIntervalId = -1;
	// 	if (this._isSequenceRunning) {
	// 		console.log("SequenceRenderer.applySequenceStep", this._sequenceIdx, this.getNextSequenceIndex());
	// 		
	// 		var nextIdx = this.getNextSequenceIndex();
	// 		this._sequenceEls[this._sequenceIdx].className = "";
	// 		this._sequenceEls[nextIdx].className = "current";
	// 		this._sequenceIdx = nextIdx;
	// 		this._startSequenceStep();
	// 	} else {
	// 		console.log("SequenceRenderer.applySequenceStep", this._sequenceIdx, "[sequence not running]");
	// 	}
	// },
	// _startSequenceStep_2: function() {	
	// 	var nextElPromise = function(resolve, reject) {
	// 		var nextEl = this._sequenceEls[this.getNextSequenceIndex()];
	// 		if (nextEl.complete) {
	// 			console.log("resolve", "complete", nextEl.src);
	// 			resolve();
	// 		} else {
	// 			nextEl.onload = function(ev) {
	// 				console.log("resolve", ev.type, nextEl.src);
	// 				resolve.apply(this, arguments);
	// 			};
	// 			nextEl.onerror = function(ev) {
	// 				console.log("reject", ev);
	// 				reject.apply(this, arguments);
	// 			};
	// 		}
	// 	}.bind(this);
	// 	
	// 	var timeoutPromise = function(resolve, reject) {
	// 		this.updateProgress(this._sequenceIdx, this._sequenceIdx + 1);
	// 		this._sequenceIntervalId = window.setTimeout(resolve, this._sequenceInterval);
	// 	}.bind(this);
	// 	
	// 	Promise.all([
	// 		new Promise(nextElPromise),
	// 		new Promise(timeoutPromise)
	// 	]).then(
	// 		this._completeSequenceStep.bind(this)
	// 	);
	// },
	
	// _startSequenceStep_1 function() {
	// 	var nextIdx = this.getNextSequenceIndex();
	// 	var currEl = this._sequenceEls[this._sequenceIdx];
	// 	var nextEl = this._sequenceEls[nextIdx];
	// 	
	// 	var applySequenceStep = function () {
	// 		currEl.className = "";
	// 		nextEl.className = "current";
	// 		this._sequenceIdx = nextIdx;
	// 		this._startSequenceStep();
	// 	}.bind(this);
	// 	
	// 	this.updateProgress(this._sequenceIdx, this._sequenceIdx + 1);
	// 	return window.setTimeout(applySequenceStep, this._sequenceInterval);
	// },
	
	/* --------------------------- *
	 * sequence init
	 * --------------------------- */
		
	createSequenceChildren: function() {
		// add first image, set it as selected idx
		this._sequenceEls[0] = this.image;
		this._sequenceIdx = 0;
		
		var buffer = document.createDocumentFragment();
		for (var i = 1, img; i < this._sequenceSrc.length; i++) {
			img = this._sequenceEls[i] = this.image.cloneNode();
			img.className = "";
			img.src = this._sequenceSrc[i];
			buffer.appendChild(img);
		}
		this.sequence.appendChild(buffer);
		
		this.listenTo(this.model, {
			"selected": this._onModelSelected,
			"deselected": this._onModelDeselected,
		});
		this.model.selected && this._onModelSelected();
	},
	
	/* --------------------------- *
	 * progress meter
	 * --------------------------- */
	
	createProgressMeter: function() {
		var p, el, shape;
		var stepsNum = this._sequenceSrc.length;
		
		// TODO: all this should be static
		// sw: step mark width in px
		// p = { w: 30, h: 30, s1: 1.5, s2: 1.4 };
		// p.sw = Math.max(p.s1, p.s2) * 1.5;
		// p = { w: 24, h: 24, s1: 1.2, s2: 1.1, sw: 3 };
		// p = { w: 100, h: 100, s1: 5, s2: 4.9, sw: 10 };
		// for (var prop in p) p[prop] = Math.round(p[prop] * 10 * 10) / 10;
		// console.log(p);
		// p.r1 = p.r2 = ((Math.min(p.w, p.h) - Math.max(p.s1, p.s2)) / 2) - 1;
		
		// p = { w: 24, h: 24, r1: 10, s1: 1.50, r2: 10, s2: 1.50, sw: 2 };
		// p = { w: 32, h: 32, r1: 13.3, s1: 2, r2: 13.3, s2: 2, sw: 2.7 };
		// p = { w: 37, h: 37, r1: 16, s1: 2, r2: 16, s2: 1.8, sw: 3 };
		
		p = { w: 24, h: 24, s1: 1.51, s2: 0.51, sw: 2.5 };
		
		p.r1 = ((Math.min(p.w, p.h) - p.s1) / 2) - 0.5;
		p.r2 = ((Math.min(p.w, p.h) - p.s2) / 2) - 0.5;
		// circumferences in px
		p.c1 = p.r1 * Math.PI * 2;
		p.c2 = p.r2 * Math.PI * 2;
		// rotate CCW ( 90 + half a step mark, in degrees ) so that:
		// the arc starts from the top and step gaps appear centered
		p.sr = ((p.sw / 2) / p.r1) * (180/Math.PI) - 90;
		// store params for updates
		this.amountShapeParams = p;
		
		// pass params to svg template, insert
		this.content.insertAdjacentHTML("beforeend", progressTemplate(p));
		// get new htmlelement
		el = this.content.lastElementChild;
		// el.style.marginLeft = "-100px";
		
		shape = el.querySelector("#steps");
		shape.style.strokeDasharray = [(p.c2 / stepsNum) - p.sw, p.sw];
		// shape.style.strokeDasharray = [p.sw, (p.c2 / stepsNum) - p.sw];
		// shape.style.strokeDashoffset = p.sw;
		
		shape = el.querySelector("#amount");
		shape.style.strokeDasharray = [p.c1 - p.sw, p.c1 + p.sw];
		shape.style.strokeDashoffset = p.c1;
		this.amountShape = shape;
		
		// shape = el.querySelector("#stepsnum-label");
		// shape.textContent = stepsNum;
		
		this.progressLabel = el.querySelector("#step-label");
		
		// this.amountShape.addEventListener(transitionEndEvent, function(ev) {
		// 	console.log(ev.propertyName, ev);
		// 	if (ev.propertyName == "stroke-dashoffset") {
		// 		ev.target.style.transition = "none 0s";
		// 	}
		// });
		return el;
	},
	
	updateProgress: function(stepFrom, stepTo) {
		console.log("SequenceRenderer.updateProgress", Array.prototype.join.call(arguments,","));
		var s = this.amountShape.style;
		var p = this.amountShapeParams;
		var stepsNum = this._sequenceSrc.length;
		var strokeTx = "stroke-dashoffset " + (this._sequenceStepDur / 1000) + "s linear 0s";
		
		var updateImmediately = function () {
			s.transition = "none 0s";//stroke-dashoffset 0s linear 0s";
			s.strokeDashoffset = (1 - stepFrom/stepsNum) * p.c1;
		};
		var updateAnimated = function () {
			s.transition = strokeTx;
			s.strokeDashoffset = (1 - stepTo/stepsNum) * p.c1;
		};
		
		// updateImmediately();
		// if (stepTo && stepTo > stepFrom) {
		// 	// window.requestAnimationFrame(updateAnimated);
		// 	// window.setTimeout(updateAnimated, this._sequenceStepDelay / 2);
		// 	window.setTimeout(updateAnimated, 1);
		// }
		if (stepTo === void 0) {
			updateImmediately();
		} else if (stepFrom == 0) {
			updateImmediately();
			window.setTimeout(updateAnimated, this._sequenceStepDelay / 2);
			// window.setTimeout(updateAnimated, 1);
		} else {
			updateAnimated();
		}
		
		this.progressLabel.textContent = stepFrom + 1;
	},
	
	/* --------------------------- *
	 * default image promise
	 * --------------------------- */
	
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
});
