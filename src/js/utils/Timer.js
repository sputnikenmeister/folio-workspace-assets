/** @type {module:backbone} */
const Events = require("backbone").Events;


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
		var evName = (this._status === "stopped") ? "start" : "resume";
		this._duration = duration || this._duration;
		this._timeout = window.setTimeout(end.bind(this), this._duration);
		// if (typeof this._options.ontick === "function") {
		// 	this._interval = setInterval(function() {
		// 		this.trigger("tick", this.getDuration())
		// 	}.bind(this), +this._options.tick * 1000)
		// }
		this._start = _now();
		this._status = "started";
		this.trigger(evName, this.getDuration());
		return this;
	},

	pause: function() {
		if (this._status !== "started") {
			return this;
		}
		this._duration -= (_now() - this._start);
		clear.call(this, false);
		this._status = "paused";
		this.trigger("pause", this.getDuration());
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
			return this._duration - (_now() - this._start);
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

var _now = window.performance ?
	window.performance.now.bind(window.performance) :
	Date.now.bind(Date);

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

Object.defineProperties(Timer.prototype, {
	duration: {
		enumerable: true,
		get: function() {
			return this.getDuration();
		}
	},
	status: {
		enumerable: true,
		get: function() {
			return this.getStatus();
		}
	}
});

Object.defineProperties(Timer, {
	STOPPED: {
		enumerable: true,
		value: "stopped"
	},
	STARTED: {
		enumerable: true,
		value: "started"
	},
	PAUSED: {
		enumerable: true,
		value: "paused"
	},
});

module.exports = Timer;
