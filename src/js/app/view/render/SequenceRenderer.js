/**
 * @module app/view/render/SequenceRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/view/render/PlayableRenderer} */
var PlayableRenderer = require("./PlayableRenderer");
/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("../../model/SelectableCollection");
/** @type {module:app/view/component/CircleProgressMeter} */
var ProgressMeter = require("../component/CircleProgressMeter");

/** @type {Function} */
var transitionEnd = require("../../../utils/event/transitionEnd");
/** @type {Function} */
var _whenImageLoads = require("../promise/_whenImageLoads");
/** @type {module:utils/Timer} */
var Timer = require("../../../utils/Timer");

/** @type {Function} */
var progressTemplate = require( "../template/CircleProgressMeter.svg.hbs" );

var SequenceImageCollection = SelectableCollection.extend({
	model: Backbone.Model
});

var SequenceImageRenderer = Backbone.View.extend({
	/** @type {string} */
	tagName: "img",
	/** @type {Object|Function} */
	attributes: function() {
		return { src: Globals.MEDIA_DIR + "/" + this.model.get("src") };
	},
	/** @override */
	initialize: function (options) {
		// this.el.classList.toggle("current", this.model.hasOwnProperty("selected"));
		this.listenTo(this.model, {
			"selected": function () {
				this.el.classList.add("current");
			},
			"deselected": function () {
				this.el.classList.remove("current");
			}
		});
		
		// this.listenTo(this.model, "selected deselected", function() {
		// 	this.el.classList.toggle("current", this.model.hasOwnProperty("selected"));
		// });
	},
});
/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer}
 */
module.exports = PlayableRenderer.extend({
	
	/** @type {Function} */
	template: require("./SequenceRenderer.hbs"),
	/** @type {string} */
	className: PlayableRenderer.prototype.className + " sequence-renderer",
	
	/** @override */
	initialize: function (opts) {
		PlayableRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this,
			"createSequenceChildren",
			"startSequence",
			"stopSequence",
			"_startSequenceStep",
			"_cancelSequenceStep"
		);
		
		var srcVal = this.model.get("srcset").concat();
		srcVal.unshift(_.pick(this.model.attributes, ["src"]));
		
		this.sources = new SequenceImageCollection(srcVal, {initialSelection: "first"});
		this.children = new Container();
		
		
		this.createChildren();
		this.initializeSequence();
		this.initializeAsync();
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	createChildren: function() {
		var o = null;
		
		o = this.el;
		o.innerHTML = this.template(this.model.toJSON());
		this.placeholder = o.querySelector(".placeholder");
		this.playToggle = o.querySelector(".play-toggle");
		
		o = this.content = o.querySelector(".content");
		this.sequence = o.querySelector(".sequence");
		this.image = o.querySelector("img.current");
		this.overlay = o.querySelector(".overlay");
		this.overlayLabel = o.querySelector(".overlay .play-button"),
		
		this.defaultImage = this.image;
	},
	
	/** @return {this} */
	render: function () {
		var content = this.content;
		var sizing = this.placeholder;
		
		this.measure(sizing);
		
		// NOTE: image elements are given 100% w/h in CSS (.sequence-renderer .content img);
		// actual dimensions are set to the parent element (.sequence-renderer .content)
		// this.image.setAttribute("width", cW);
		// this.image.setAttribute("height", cH);
		
		content.style.left = this.contentX + "px";
		content.style.top = this.contentY + "px";
		this.overlay.style.width = this.sequence.style.width = content.style.width = this.contentWidth + "px";
		this.overlay.style.height = this.sequence.style.height = content.style.height = this.contentHeight + "px";
		
		// sizing.style.maxWidth = (cW + (poW - pcW)) + "px";
		// sizing.style.maxHeight = (cH + (poH - pcH)) + "px";
		// sizing.style.maxWidth = cW + "px";
		// sizing.style.maxHeight = cH + "px";
		sizing.style.maxWidth = content.offsetWidth + "px";
		sizing.style.maxHeight = content.offsetHeight + "px";
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		PlayableRenderer.whenSelectionIsContiguous(this)
			.then(PlayableRenderer.whenSelectTransitionEnds)
			.then(PlayableRenderer.whenDefaultImageLoads)
			.then(
				function(view) {
					view.createSequenceChildren();
					view.addSelectionListeners();
					try {
						view.updateOverlayBackground(view.overlayLabel, view.defaultImage);
					} catch (err) {
						return Promise.reject(err);
					}
				})
			.catch(function(err) {
					if (err instanceof PlayableRenderer.ViewError) {
						console.log(err.view.cid, err.view.model.cid, "SequenceRenderer: " + err.message);
					} else {
						console.error("SequenceRenderer promise error", err);
					}
				});
	},
	
	/* ---------------------------
	/* PlayableRenderer overrides
	/* --------------------------- */
	
	/** @override */
	_onModelSelected: function() {
		// this.togglePlayback(true);
		return PlayableRenderer.prototype._onModelSelected.apply(this, arguments);
		// this.content.addEventListener("click", this._onContentClick, false);
		// this.listenTo(this, "view:remove", this._removeClickHandler);
	},
	
	/** @override */
	togglePlayback: function(newPlayState) {
		if (_.isBoolean(newPlayState) && newPlayState === this.isSequenceRunning()) {
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
	/* sequence private
	/* --------------------------- */
	
	initializeSequence: function() {
		this._isSequenceRunning = false;
		this._sequenceInterval = 2500;
		this.timer = new Timer();
		this.listenTo(this, "view:remove", function () {
			this.timer.stop();
		});
		
		this.listenTo(this.timer, {
			"start": function() {
				var delta = this.timer.getDuration() / this._sequenceInterval;
				this.updateProgress(
					this.sources.selectedIndex + (1 - delta),
					delta, this.timer.getDuration());
			},
			"pause": function () {
				var delta = this.timer.getDuration() / this._sequenceInterval;
				this.updateProgress(
					this.sources.selectedIndex + (1 - delta),
					0, 0);
			},
			"stop": function () {
				// this.updateProgress(this.sources.selectedIndex, 0, true);
			},
			// "end": function () {}
		});
		this.listenTo(this.sources, "select:one", function () {
			this.updateProgressLabel(this.sources.selectedIndex);
		});
	},
	
	isSequenceRunning: function() {
		return this._isSequenceRunning;
	},
	
	startSequence: function() {
		if (!this._isSequenceRunning) {
			this._isSequenceRunning = true;
			
			this.setMediaState("media");
			if (this.timer.getStatus() === "paused") {
				this.timer.start();
			} else {
				this._startSequenceStep();
			}
			
			console.log("(%s) SequenceRenderer.startSequence", this.cid);
		}
	},
	
	stopSequence: function() {
		if (this._isSequenceRunning) {
			this._isSequenceRunning = false;
			
			if (this.model.selected) {
				this.updateOverlayBackground(
					this.overlayLabel,
					this.children.findByModel(this.sources.selected).el
				);
			}
			// this.updateProgress(this.sources.selectedIndex);
			// this._cancelSequenceStep();
			if (this.timer.getStatus() === "started") {
				this.timer.pause();
			}
			this.setMediaState("user");
			
			console.log("(%s) SequenceRenderer.stopSequence", this.cid);
		}
	},
	
	_cancelSequenceStep: function () {
		// if (this.timer.getStatus() === "started") {
		// 	this.timer.stop();
		// }
	},
	
	_startSequenceStep: function () {
		var view = this;
		var logSeq = function () {
			console.log("(%s) SequenceRenderer::step(%i)::%s[%i] %s",
				view.cid, view.sources.selectedIndex, view.timer.getStatus(), view.timer.getDuration(),
				Array.prototype.join.call(arguments, " "));
		};
		
		return new Promise(
			function(resolve, reject) {
				// view.updateProgress(view.sources.selectedIndex, view.sources.selectedIndex + 1);
				view.timer.start(view._sequenceInterval)
					.on("stop", reject).on("end", resolve);
				logSeq("promise created");
			}
		).then(
			function () {
				logSeq("resolved:1 (timer ended, checking next image)", view.timer.getStatus(), view.timer.getDuration());
				var nextSource = view.sources.followingOrFirst();
				var nextView = view.children.findByModel(nextSource);
				
				return _whenImageLoads(nextView.el)
					.then(
						function() {
							if (view._isSequenceRunning) {
								logSeq("resolved:2 (calling next step)");
								// NOTE: step increase done here
								view.sources.select(view.sources.followingOrFirst());
								view._startSequenceStep();
							} else {
								logSeq("resolved:2 (sequence not running)");
							}
						}
					);
			},
			function (errmsg) {
				logSeq("rejected:1 (timer stopped): ", view.timer.getStatus(), view.timer.getDuration());
				// logSeq("rejected:1 (timeout cleared): ", errmsg);
				// window.clearTimeout(timeoutId);
				// timeoutId = null;
			}
		);
	},
	
	/* --------------------------- *
	/* sequence init
	/* --------------------------- */
		
	createSequenceChildren: function() {
		var buffer = document.createDocumentFragment();
		
		// add default image as renderer (already in DOM)
		this.children.add(new SequenceImageRenderer({
			el: this.el.querySelector("img.default"),
			model: this.sources.selected
		}));
		
		this.sources.each(function (item, index, arr) {
			if (!item.selected) {
				var view = new SequenceImageRenderer({ model: item });
				this.children.add(view);
				buffer.appendChild(view.render().el);
			}
		}, this);
		this.sequence.appendChild(buffer);
		
		this.progressMeter = this.createProgressMeter();
		
		// for (var i = 1, img; i < this._sequenceSrc.length; i++) {
		// 	img = this._sequenceEls[i] = this.image.cloneNode();
		// 	img.className = "";
		// 	img.src = this._sequenceSrc[i];
		// 	buffer.appendChild(img);
		// }
		// this.sequence.appendChild(buffer);
		// From PlayableRenderer
		// this.addSelectionListeners();
	},
	
	/* --------------------------- *
	/* progress meter
	/* --------------------------- */
	createProgressMeter: function() {
		var view = new ProgressMeter({
			model: new ProgressMeter.Model({
				value: 0,
				total: this.sources.length
			})
		});
		this.content.appendChild(view.render().el);
		return view;
	},
	
	updateProgress: function(valueFrom, valueDelta, duration) {
		var valueTo = valueFrom + valueDelta;
		var shape = this.progressMeter.amountShape;
		var model = this.progressMeter.model;
		var transitionProp = this.getPrefixedProperty("transition");
		
		// var cid = this.cid;
		// console.log("-\n(%s) SequenceRenderer.updateProgress(%s)", cid,
		// 	Array.prototype.join.call(arguments,", "));
		// function logtx() {
		// 	console.log("(%s) SequenceRenderer.updateProgress() %s " +
		// 			"\n\tfrom:%i delta: %i value: %i prop: %s tx: %s",
		// 		cid, Array.prototype.join.call(arguments,", "),
		// 		
		// 		valueFrom, valueDelta, model.get("value"),
		// 		shape.style.strokeDashoffset,
		// 		shape.style[transitionProp]
		// 	);
		// }
		
		if (duration > 0) {
			// if (prevValue > valueTo) {
			if (valueFrom === 0) {
				// set to 0, then animate
				var transitionFn = function(ev) {
					shape.removeEventListener(transitionEnd, transitionFn, false);
					shape.style[transitionProp] = "stroke-dashoffset " + duration + "ms linear 1ms";
					model.set("value", valueTo);
					// logtx("passthrough-zero-2");
				};
				shape.style[transitionProp] = "stroke-dashoffset 1ms linear 1ms";
				shape.addEventListener(transitionEnd, transitionFn, false);
				model.set("value", 0.00001);
				// logtx("passthrough-zero-1");
			} else {
				// animate
				shape.style[transitionProp] = "stroke-dashoffset " + duration + "ms linear 1ms";
				model.set("value", valueTo);
				// logtx("animated");
			}
		} else {
			// update immediately
			shape.style[transitionProp] = "stroke-dashoffset 1ms linear 1ms";
			model.set("value", valueTo);
			// logtx("immediate");
		}
	},
	
	updateProgressLabel: function(value) {
		this.progressMeter.labelEl.textContent = (value | 0) + 1;
	},
	
	createProgressMeter2: function() {
		var p, el, shape;
		
		// TODO: all this should be static
		// sw: step mark width in px
		// p = { w: 30, h: 30, s1: 1.5, s2: 1.4 };
		// p.sw = Math.max(p.s1, p.s2) * 1.5;
		// p = { w: 100, h: 100, s1: 5, s2: 4.9, sw: 10 };
		// for (var prop in p) p[prop] = Math.round(p[prop] * 10 * 10) / 10;
		// console.log(p);
		// p.r1 = p.r2 = ((Math.min(p.w, p.h) - Math.max(p.s1, p.s2)) / 2) - 1;
		
		// p = { w: 24, h: 24, r1: 10, s1: 1.50, r2: 10, s2: 1.50, sw: 2 };
		// p = { w: 32, h: 32, r1: 13.3, s1: 2, r2: 13.3, s2: 2, sw: 2.7 };
		// p = { w: 37, h: 37, r1: 16, s1: 2, r2: 16, s2: 1.8, sw: 3 };
		
		// p = { w: 24, h: 24, s1: 1.51, s2: 0.51, sw: 2.5 };
		// p.r1 = ((Math.min(p.w, p.h) - p.s1) / 2) - 0.5;
		// p.r2 = ((Math.min(p.w, p.h) - p.s2) / 2) - 0.5;
		
		p = { w: 24, h: 24, s1: 1.2, s2: 1.1, sw: 3 };
		p.r1 = p.r2 = ((Math.min(p.w, p.h) - Math.max(p.s1, p.s2)) / 2) - 1;
		
		// circumferences in px
		p.c1 = p.r1 * Math.PI * 2;
		p.c2 = p.r2 * Math.PI * 2;
		// rotate CCW ( 90 + half a step mark, in degrees ) so that:
		// the arc starts from the top and step gaps appear centered
		p.sr = ((p.sw / 2) / p.r1) * (180/Math.PI) - 90;
		
		// pass params to svg template, insert
		this.content.insertAdjacentHTML("beforeend", progressTemplate(p));
		// get new htmlelement
		el = this.content.lastElementChild;
		// not used in template
		p.stepsNum = this.sources.length;
		
		// store params for updates
		this._progress = {};
		this._progress.params = p;
		this._progress.updateDelay = 200;
		
		this._progress.el = el;
		this._progress.labelEl = el.querySelector("#step-label");
		this._progress.amountShape = el.querySelector("#amount");
		this._progress.stepsShape = el.querySelector("#steps");
		
		shape = this._progress.stepsShape;
		shape.style.strokeDasharray = [(p.c2 / p.stepsNum) - p.sw, p.sw];
		shape.style.strokeOpacity = 0.3;
		// shape.style.strokeDasharray = [p.sw, (p.c2 / p.stepsNum) - p.sw];
		// shape.style.strokeDashoffset = p.sw;
		
		shape = this._progress.amountShape;
		shape.style.strokeDasharray = [p.c1 - p.sw, p.c1 + p.sw];
		shape.style.strokeDashoffset = p.c1;
		
		// shape = el.querySelector("#stepsnum-label");
		// shape.textContent = p.stepsNum;
		
		// this.amountShape.addEventListener(transitionEndEvent, function(ev) {
		// 	console.log(ev.propertyName, ev);
		// 	if (ev.propertyName == "stroke-dashoffset") {
		// 		ev.target.style.transition = "none 0s";
		// 	}
		// });
		return el;
	},
	
	updateProgressLabel2: function(step) {
		// this._progress.labelEl.textContent = this.sources.selectedIndex + 1;
		this._progress.labelEl.textContent = (step | 0) + 1;
	},
	
	updateProgress2: function(valueFrom, valueDelta, duration) {
		console.log("(%s) SequenceRenderer.updateProgress(%s)", this.cid,
			Array.prototype.join.call(arguments,","));
		
		var s = this._progress.amountShape.style;
		var p = this._progress.params;
		var valueTo = valueFrom + valueDelta;
		
		
		var strokeTxDur = Math.max(0, (duration - this._progress.updateDelay - 1) / 1000);
		var strokeTx = "stroke-dashoffset " + strokeTxDur + "s linear 0s";
		
		var updateImmediately = function () {
			s.transition = "none 0s";//stroke-dashoffset 0s linear 0s";
			s.strokeDashoffset = (1 - valueFrom/p.stepsNum) * p.c1;
		};
		var updateAnimated = function () {
			s.transition = strokeTx;
			s.strokeDashoffset = (1 - valueTo/p.stepsNum) * p.c1;
		};
		
		if (this._progress.updateId) {
			window.clearTimeout(this._progress.updateId);
			delete this._progress.updateId;
		}
		
		if (strokeTxDur === 0) {
			updateImmediately();
		} else {
			if (valueFrom > 0) {
				updateAnimated();
			} else {
				updateImmediately();
				this._progress.updateId = window.setTimeout(updateAnimated, this._progress.updateDelay / 2);
			}
		}
		
		// this._progress.labelEl.textContent = (valueFrom | 0) + 1;
	},
});
