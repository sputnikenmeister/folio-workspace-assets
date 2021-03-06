/*global XMLHttpRequest, HTMLMediaElement, MediaError*/
/**
 * @module app/view/render/MediaRenderer
 */

// /** @type {module:underscore.strings/lpad} */
// const lpad = require("underscore.string/lpad");

/** @type {module:app/model/item/MediaItem} */
const MediaItem = require("app/model/item/MediaItem");
/** @type {module:app/view/CarouselRenderer} */
const CarouselRenderer = require("app/view/render/CarouselRenderer");

// var errorTemplate = require("../template/ErrorBlock.hbs");
// /** @type {module:utils/css/getBoxEdgeStyles} */
// var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

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
		},
		mediaState: {
			get: function() {
				return this._mediaState;
			},
			set: function(state) {
				this._setMediaState(state);
			}
		}
	},

	/** @override */
	initialize: function(opts) {
		// if (this.model.attrs().hasOwnProperty("@classname")) {
		// 	this.el.className += " " + this.model.attr("@classname");
		// }

		// NOTE: @classname attr handling moved to CarouselRenderer
		// if (this.model.attr("@classname") !== void 0) {
		// 	var clsAttr = this.model.attr("@classname").split(" ");
		// 	for (var i = 0; i < clsAttr.length; i++) {
		// 		this.el.classList.add(clsAttr[i]);
		// 	}
		// }
		CarouselRenderer.prototype.initialize.apply(this, arguments);

		this.metrics.media = {};
		this.mediaState = "idle";

		this.initializeAsync()
			.then(this.whenInitialized)
			.catch(this.whenInitializeError.bind(this));
	},

	initializeAsync: function() {
		// var MediaRenderer = Object.getPrototypeOf(this).constructor;
		return Promise.resolve(this)
			.then(MediaRenderer.whenSelectionIsContiguous)
			.then(MediaRenderer.whenScrollingEnds)
			.then(MediaRenderer.whenDefaultImageLoads);
	},

	whenInitialized: function(view) {
		// console.log("%s::whenInitialized [%s]", view.cid, "resolved");
		view.mediaState = "ready";
		view.placeholder.removeAttribute("data-progress");
		return view;
	},

	whenInitializeError: function(err) {
		if (err instanceof CarouselRenderer.ViewError) {
			// NOTE: ignore ViewError type
			return;
		} else if (err instanceof Error) {
			console.error(err.stack);
		}
		this.placeholder.removeAttribute("data-progress");
		this.mediaState = "error";
	},

	updateMediaProgress: function(progress, id) {
		if (_.isNumber(progress)) {
			this.placeholder.setAttribute("data-progress",
				String(Math.floor(progress * 100)).padStart(2, '0'));
		}
		// else if (progress === "complete") {
		// 	this.placeholder.removeAttribute("data-progress");
		// }
	},

	// whenMediaIsReady: function(view) {
	// 	return MediaRenderer.whenDefaultImageLoads(this, this.updateMediaProgress.bind(this));
	// },

	/* --------------------------- *
	/* child getters
	/* --------------------------- */

	/** @return {HTMLElement} */
	getDefaultImage: function() {
		return this.defaultImage;
	},

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
	},

	/** @override */
	measure: function() {
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

		sw = this.model.get("source").get("w");
		// || this.defaultImage.naturalWidth || pcw;
		sh = this.model.get("source").get("h");
		// || this.defaultImage.naturalHeight || pch;

		// if (!(sw && sh)) {
		// 	sw = pcw;
		// 	sh = pch;
		// }

		// Unless both client dimensions are larger than the source's
		// choose constraint direction by aspect ratio
		if (sw < pcw && sh < pch) {
			cs = 1;
			cw = sw;
			ch = sh;
			this.metrics.fitDirection = "both";
		} else if ((pcw / pch) < (sw / sh)) {
			// fit width
			cw = pcw;
			cs = cw / sw;
			// ch = cs * sh;
			ch = Math.round(cs * sh);
			this.metrics.fitDirection = "width";
		} else {
			// fit height
			ch = pch;
			cs = ch / sh;
			// cw = cs * sw;
			cw = Math.round(cs * sw);
			this.metrics.fitDirection = "height";
		}

		this.metrics.content.x = cx;
		this.metrics.content.y = cy;
		this.metrics.content.width = cw + ew;
		this.metrics.content.height = ch + eh;

		this.metrics.media.x = cx + cm.paddingLeft + cm.borderLeftWidth;
		this.metrics.media.y = cy + cm.paddingTop + cm.borderTopWidth;
		this.metrics.media.width = cw;
		this.metrics.media.height = ch;
		this.metrics.media.scale = cs;

		// console.log("%s::measure mw:%s mh:%s fit: %s metrics: %o", this.cid, pcw, pch, this.metrics.fitDirection, this.metrics);
		// var sizing = this.getSizingEl();
		// sizing.style.maxWidth = (cw + ew) + "px";
		// sizing.style.maxHeight = (ch + eh) + "px";

		return this;
	},

	render: function() {
		// NOTE: not calling super.render, calling measure ourselves
		this.measure();

		var sizing = this.getSizingEl();
		sizing.style.maxWidth = this.metrics.content.width + "px";
		sizing.style.maxHeight = this.metrics.content.height + "px";

		this.el.setAttribute("data-fit-dir", this.metrics.fitDirection);

		return this;
	},

	/* --------------------------- *
	/* mediaState
	/* --------------------------- */

	_mediaStateEnum: ["idle", "pending", "ready", "error"],

	_setMediaState: function(key) {
		if (this._mediaStateEnum.indexOf(key) === -1) {
			throw new Error("Argument " + key + " invalid. Must be one of: " + this._mediaStateEnum.join(", "));
		}
		if (this._mediaState !== key) {
			if (this._mediaState) {
				this.el.classList.remove(this._mediaState);
			}
			this.el.classList.add(key);
			this._mediaState = key;
			this.trigger("media:" + key);
		}
	},
}, {
	LOG_TO_SCREEN: true,
	/** @type {module:app/view/promise/whenSelectionDistanceIs} */
	whenSelectionDistanceIs: require("app/view/promise/whenSelectionDistanceIs"),

	/** @type {module:app/view/promise/whenSelectionIsContiguous} */
	whenSelectionIsContiguous: require("app/view/promise/whenSelectionIsContiguous"),

	// /** @type {module:app/view/promise/whenSelectTransitionEnds} */
	// whenSelectTransitionEnds: require("app/view/promise/whenSelectTransitionEnds"),

	/** @type {module:app/view/promise/whenScrollingEnds} */
	whenScrollingEnds: require("app/view/promise/whenScrollingEnds"),

	/** @type {module:app/view/promise/whenDefaultImageLoads} */
	whenDefaultImageLoads: require("app/view/promise/whenDefaultImageLoads"),
});

/* ---------------------------
/* log to screen
/* --------------------------- */
if (DEBUG) {

	MediaRenderer = (function(MediaRenderer) {
		if (!MediaRenderer.LOG_TO_SCREEN) return MediaRenderer;

		/** @type {Function} */
		var Color = require("color");

		return MediaRenderer.extend({

			/** @override */
			initialize: function() {

				var fgColor = new Color(this.model.attr("color"));
				var bgColor = new Color(this.model.attr("background-color"));
				this.__logColors = {
					normal: Color(fgColor).mix(bgColor, 0.75).hsl().string(),
					ignored: Color(fgColor).mix(bgColor, 0.25).hsl().string(),
					error: "brown",
					abort: "orange"
				};
				this.__logFrameStyle = "1px dashed " + Color(fgColor).mix(bgColor, 0.5).hsl().string();
				this.__logStartTime = Date.now();
				this.__rafId = -1;
				this.__onFrame = this.__onFrame.bind(this);
				MediaRenderer.prototype.initialize.apply(this, arguments);
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
				var ret = MediaRenderer.prototype.createChildren.apply(this, arguments);

				this.__logElement = document.createElement("div");
				this.__logElement.className = "debug-log";
				// this.__logElement.style.touchAction = "pan-y";
				this.__logHeaderEl = document.createElement("pre");
				this.__logHeaderEl.className = "log-header color-bg";
				// Color(this.model.colors.fgColor).mix(fgColor, 0.9).rgb().string()
				// Color(this.model.colors.fgColor).alpha
				this.__logHeaderEl.textContent = this.__getHeaderText();
				this.__logElement.appendChild(this.__logHeaderEl);
				this.el.insertBefore(this.__logElement, this.el.firstElementChild);
				return ret;
			},

			/** @override */
			render: function() {
				var ret = MediaRenderer.prototype.render.apply(this, arguments);

				this.__logElement.style.top = (this.metrics.content.height + this.metrics.content.y) + "px";
				this.__logElement.style.left = this.metrics.content.x + "px";
				this.__logElement.style.width = this.metrics.content.width + "px";
				this.__logElement.scrollTop = this.__logElement.scrollHeight;

				return ret;
			},

			whenInitializeError: function(err) {
				// NOTE: not calling super
				// MediaRenderer.prototype.whenInitializeError.apply(this, arguments);
				if (err instanceof CarouselRenderer.ViewError) {
					// NOTE: ignore ViewError type
					// console.warn("%s::whenInitializeError ", err.view.cid, err.message);
					return;
				} else if (err instanceof Error) {
					console.warn(err.stack);
				}
				// this.placeholder.innerHTML = err ? errorTemplate(err) : "";
				this.placeholder.removeAttribute("data-progress");
				this.mediaState = "error";

				// console.error("%s::initializeAsync [%s (caught)]: %s", this.cid, err.name, (err.info && err.info.logMessage) || err.message);
				// err.logEvent && console.log(err.logEvent);
			},

			/* --------------------------- *
			/* log methods
			/* --------------------------- */

			__logMessage: function(msg, logtype, color) {
				var logEntryEl = document.createElement("pre");

				logtype || (logtype = "-")
				logEntryEl.textContent = this.__getTStamp() + " " + msg;
				logEntryEl.setAttribute("data-logtype", logtype);
				logEntryEl.style.color = color || this.__logColors[logtype] || this.__logColors.normal;

				this.__logElement.appendChild(logEntryEl);
				this.__logElement.scrollTop = this.__logElement.scrollHeight;

				if (this.__rafId == -1) {
					this.__rafId = this.requestAnimationFrame(this.__onFrame);
				}
			},

			__onFrame: function(tstamp) {
				this.__rafId = -1;
				this.__logElement.lastElementChild.style.borderBottom = this.__logFrameStyle;
				this.__logElement.lastElementChild.style.paddingBottom = "2px";
				this.__logElement.lastElementChild.style.marginBottom = "2px";
			},

			__getTStamp: function() {
				// return new Date(Date.now() - this.__logStartTime).toISOString().substr(11, 12);
				return String(((Date.now() - this.__logStartTime) / 1000).toFixed(3)).padStart(8, "0");
			},

			__getHeaderText: function() {
				return '';
			},
		});
	})(MediaRenderer);

} // end debug

/**
 * @constructor
 * @type {module:app/view/render/MediaRenderer}
 */
module.exports = MediaRenderer;
