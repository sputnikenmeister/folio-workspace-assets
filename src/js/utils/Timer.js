/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Events = require("backbone").Events;


// var defaultOptions = {
// 	tick: 1,
// 	onstart: null,
// 	ontick: null,
// 	onpause: null,
// 	onstop: null,
// 	onend: null
// }
var idSeed = 0;

var Timer = function(options) {
	// if (!(this instanceof Timer)) {
	// 	return new Timer(options);
	// }
	this._id = idSeed++;
	// this._options = {};
	this._duration = 0;
	this._status = "initialized";
	this._start = 0;
	// this._measures = [];

	// for (var prop in defaultOptions) {
	// 	this._options[prop] = defaultOptions[prop];
	// }
	// this.options(options);
};

_.extend(Timer.prototype, Events, {

	start: function(duration) {
		if (!_.isNumber(duration) && !this._duration) {
			return this;
		}
		// duration && (duration *= 1000)
		if (this._timeout && this._status === "started") {
			return this;
		}
		this._duration = duration || this._duration;
		this._timeout = window.setTimeout(end.bind(this), this._duration);
		// if (typeof this._options.ontick === "function") {
		// 	this._interval = setInterval(function() {
		// 		this.trigger("tick", this.getDuration())
		// 	}.bind(this), +this._options.tick * 1000)
		// }
		this._start = Date.now();
		this._status = "started";
		this.trigger("start", this.getDuration());
		return this;
	},

	pause: function() {
		if (this._status !== "started") {
			return this;
		}
		this._duration -= (Date.now() - this._start);
		clear.call(this, false);
		this._status = "paused";
		this.trigger("pause");
		return this;
	},

	stop: function() {
		if (!/started|paused/.test(this._status)) {
			return this;
		}
		clear.call(this, true);
		this._status = "stopped";
		this.trigger("stop");
		return this;
	},

	getDuration: function() {
		if (this._status === "started") {
			return this._duration - (Date.now() - this._start);
		}
		if (this._status === "paused") {
			return this._duration;
		}
		return 0;
	},

	getStatus: function() {
		return this._status;
	},
});

function end() {
	clear.call(this);
	this._status = "stopped";
	this.trigger("end");
}

function clear(clearDuration) {
	window.clearTimeout(this._timeout);
	// window.clearInterval(this._interval);
	if (clearDuration === true) {
		this._duration = 0;
	}
}

module.exports = Timer;
