// /** @type {module:utils/setImmediate} */
// var setImmediate = require("utils/setImmediate");

// function sortByPriority(a, b) {
// 	if (a.priority > b.priority)
// 		return 1;
// 	if (a.priority < b.priority)
// 		return -1;
// 	return 0;
// }

function RequestQueue(offset) {
	this._offset = offset | 0;
	this._items = [];
	this._priorities = [];
	this._numItems = 0;
}

RequestQueue.prototype = Object.create({
	enqueue: function(item, priority) {
		var i = this._items.length;
		this._items[i] = item;
		this._priorities[i] = {
			priority: (priority | 0),
			index: i
		};
		this._numItems++;
		// console.log("FrameQueue::RequestQueue::enqueue() [numItems:%i] ID:%i", this._numItems, this._offset + i);
		return this._offset + i;
	},

	contains: function(index) {
		index -= this.offset;
		return 0 <= index && index < this._items.length;
	},

	skip: function(index) {
		var i, item;
		i = index - this._offset;
		if (0 > i || i >= this._items.length) {
			// 	console.warn("FrameQueue::RequestQueue::skip(id:%i) out of range (%i-%i)", index, this._offset, this._offset + (this._numItems - 1));
			return void 0;
		}
		item = this._items[i];
		if (item !== null) {
			// if (item = this._items[i]) {
			this._items[i] = null;
			this._numItems--;

			// if (this._numItems == 0) {
			// 	this._empty(this._offset + this._items.length);
			// }
			// console.log("FrameQueue::RequestQueue::skip(id:%i) [numItems:%i] skipping", index, this._numItems);
		}
		// else {
		// 	console.warn("FrameQueue::RequestQueue::skip(id:%i) [numItems:%i] item is null", index, this._numItems);
		// }
		return item;
	},

	// forEach: function(fn, context) {
	// 	return this.items.forEach(fn, context);
	// },

	indexes: function() {
		// .map(function(o, i, a) {
		// 	return this[o.index];
		// }, this._items);
		var items = this._priorities.concat();
		items.sort(function(a, b) {
			if (a.priority > b.priority)
				return 1;
			if (a.priority < b.priority)
				return -1;
			return 0;
		});
		items.forEach(function(o, i, a) {
			a[i] = o.index;
		}, this);
		return items;
	},

	items: function() {
		// .map(function(o, i, a) {
		// 	return this[o.index];
		// }, this._items);
		var items = this._priorities.concat();
		items.sort(function(a, b) {
			if (a.priority > b.priority)
				return 1;
			if (a.priority < b.priority)
				return -1;
			return 0;
		});
		items.forEach(function(o, i, a) {
			a[i] = this._items[o.index];
		}, this);
		return items;
	},

	_empty: function(offset) {
		this._offset = offset;
		this._items.length = 0;
		this._priorities.length = 0;
		this._numItems = 0;
	}
}, {

	offset: {
		get: function() {
			return this._offset;
		}
	},

	length: {
		get: function() {
			return this._items.length;
		}
	},

	numItems: {
		get: function() {
			return this._numItems;
		}
	},
});

var _nextQueue = new RequestQueue(0);
var _currQueue = null;

// var _pending = false;
var _running = false;
var _rafId = -1;

/**
/* @param tstamp {int}
/*/
var _runQueue = function(tstamp) {
	if (_running) throw new Error("wtf!!!");

	_rafId = -1;
	_running = true;
	_currQueue = _nextQueue;
	_nextQueue = new RequestQueue(_currQueue.offset + _currQueue.length);

	// _currQueue.items().forEach(function(fn, i, a) {
	// 	if (fn !== null) {
	// 		fn(tstamp);
	// 	}
	// });
	_currQueue.indexes().forEach(function(index, i, a) {
		var fn = _currQueue._items[index];
		if (fn !== null) {
			fn(tstamp);
		}
	});
	_running = false;
	_currQueue = null;

	if (_nextQueue.numItems > 0) {
		_rafId = window.requestAnimationFrame(_runQueue);
	}
};

var FrameQueue = Object.create({
	/**
	/* @param fn {Function}
	/* @param priority {int}
	/* @return {int}
	/*/
	request: function(fn, priority) {
		// if (!_running && !_pending) {
		// 	_pending = true;
		// 	console.warn("FrameQueue::request setImmediate: pending");
		// 	setImmediate(function() {
		// 		_pending = false;
		// 		if (_nextQueue.numItems > 0) {
		// 			_rafId = window.requestAnimationFrame(_runQueue);
		// 			console.warn("FrameQueue::request setImmediate: raf:%i for %i items", _rafId, _nextQueue.numItems);
		// 		} else {
		// 			console.warn("FrameQueue::request setImmediate: no items");
		// 		}
		// 	});
		// }
		if (!_running && _rafId === -1) {
			_rafId = window.requestAnimationFrame(_runQueue);
		}
		return _nextQueue.enqueue(fn, priority);
	},

	/**
	/* @param id {int}
	/* @return {Function?}
	/*/
	cancel: function(id) {
		var fn;
		if (_running) {
			fn = _currQueue.skip(id) || _nextQueue.skip(id);
		} else {
			fn = _nextQueue.skip(id);
			if ((_rafId !== -1) && (_nextQueue.numItems === 0)) {
				window.cancelAnimationFrame(_rafId);
				_rafId = -1;
			}
		}
		return fn;
	},
}, {
	running: {
		get: function() {
			return _running;
		}
	}
});

if (DEBUG) {
	/** @type {module:underscore} */
	var _ = require("underscore");

	// console.info("Using app/view/base/FrameQueue");

	// 	// // log frame exec time
	// 	// var _now = window.performance?
	// 	// 	window.performance.now.bind(window.performance) :
	// 	// 	Date.now.bind(Date);
	// 	// _runQueue = _.wrap(_runQueue, function(fn, tstamp) {
	// 	// 	var retval, tframe;
	// 	// 	console.log("[FRAME BEGIN] [%ims] %i items [ids:%i-%i]", tstamp, _nextQueue.numItems, _nextQueue.offset, _nextQueue.offset + _nextQueue.length);
	// 	// 	tframe = _now();
	// 	// 	retval = fn(tstamp);
	// 	// 	tframe = _now() - tframe;
	// 	// 	console.log("[FRAME ENDED] [%ims] took %ims\n---\n", tstamp + tframe, tframe);
	// 	// 	if (_nextQueue.numItems != 0) console.info("[FRAME ENDED] %i items scheduled for [raf:%i]", _nextQueue.numItems, _rafId);
	// 	// 	return retval;
	// 	// });

	/*
	var wrapConsole = function(prefix) {
		var shift = [].shift;
		var fnNames = ["group", "log", "info", "warn", "error"];
		var fnSrc = {};
		fnNames.forEach(function(fnName) {
			fnSrc[fnName] = console[fnName];
			console[fnName] = _.wrap(console[fnName], function() {
				if (typeof arguments[1] == "string") arguments[1] = prefix + " " + arguments[1];
				return shift.apply(arguments).apply(console, arguments);
			});
		});
		return function() {
			fnNames.forEach(function(fnName) {
				console[fnName] = fnSrc[fnName];
			});
		}
	}
	*/

	// log frame end
	_runQueue = _.wrap(_runQueue, function(fn, tstamp) {
		var retval;
		// var unwrap = wrapConsole("[raf " + _rafId + "]");
		// console.group("FrameQueue #" + _rafId);
		retval = fn(tstamp);
		// console.groupEnd();
		// unwrap();
		return retval;
	});

	// // use log prefix
	// if (console.prefix) {
	// 	_runQueue = _.wrap(_runQueue, function(fn, tstamp) {
	// 		var retval, logprefix;
	// 		logprefix = console.prefix;
	// 		console.prefix += "[raf:" + _rafId + "] ";
	// 		retval = fn(tstamp);
	// 		console.prefix = logprefix;
	// 		return retval;
	// 	});
	// }

	// FrameQueue.cancel = _.wrap(FrameQueue.cancel, function(fn, id) {
	// 	if ((_currQueue !== null) && (_currQueue.offset >= id) && (id < _nextQueue.offset)) {
	// 		console.info("FrameQueue::cancel ID:%i in running range (%i-%i)", id, _currQueue.offset, _nextQueue.offset - 1);
	// 	}
	// 	var rafId = _rafId;
	// 	var retval = fn(id);
	// 	if (retval === void 0) {
	// 		console.warn("FrameQueue::cancel ID:%i not found", id);
	// 	} else if (retval === null) {
	// 		console.warn("FrameQueue::cancel ID:%i already cancelled", id);
	// 	} else {
	// 		if (!_running && _nextQueue.numItems == 0) {
	// 			console.info("FrameQueue::cancel raf:%i cancelled (ID:%i cancelled, empty queue)", rafId, id);
	// 		}
	// 	}
	// 	return retval;
	// });
}


module.exports = FrameQueue;