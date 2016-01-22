

function RequestQueue(indexOffset) {
	this._offset = indexOffset | 0;
	this._items = [];
	this._priorities = [];
	this._length = 0;
}

RequestQueue.prototype = Object.create({
	enqueue: function(item, priority) {
		var i = this._items.length;
		this._items[i] = item;
		this._priorities[i] = { 
			priority: (priority | 0),
			index: i
		};
		this._length++;
		return this._offset + i;
	},
	
	skip: function(index) {
		if (this.firstIndex > index || index > this.lastIndex) return;
		var i = index - this.firstIndex;
		var item = this._items[i];
		this._items[i] = null;
		this._length--;
		if (this._length == 0) {
			this.empty();
		}
		return item;
	},
	
	items: function() {
		return this._priorities.sort(function (a, b) {
			if (a.priority > b.priority)
				return 1;
			if (a.priority < b.priority)
				return -1;
			return 0;
		}).map(function(o, i, a) {
			return this[o.index];
		}, this._items);
	},
	
	empty: function() {
		this._offset = this.lastIndex + 1;
		this._items.length = 0;
		this._priorities.length = 0;
		this._length = 0;
	}
}, {
	
	firstIndex: { get: function() {
		return this._offset;
	}},
	
	lastIndex: { get: function() {
		return this._offset + this._items.length - 1;
	}},
	
	length: { get: function() {
		return this._length;
	}},
});

var _queueRunning = false;
var _queueItems = new RequestQueue(0);
var _queueRafId = -1;
/**
/* @param tstamp {int}
/*/
var _runQueue = function(tstamp) {
	var currItems = _queueItems;
	var currRafId = _queueRafId;
	var itemsArr;
	
	_queueItems = new RequestQueue(currItems.lastIndex);
	_queueRunning = true;
	itemsArr = currItems.items();
	itemsArr.forEach(function(fn) {
		if (fn !== null) fn(tstamp);
	});
	_queueRafId = -1;
	_queueRunning = false;
	
	if (_queueItems.length > 0) {
		_queueRafId = window.requestAnimationFrame(_runQueue);
	}
};

var FrameQueue = Object.create({
	/**
	/* @param fn {Function}
	/* @param forceNext {int}
	/* @return {int}
	/*/
	request: function(fn, priority) {
		if (!_queueRunning && _queueRafId == -1) {
			_queueRafId = window.requestAnimationFrame(_runQueue);
		}
		return _queueItems.enqueue(fn, priority);
	},
	
	/**
	/* @param id {int}
	/* @return {Function?}
	/*/
	cancel: function(id) {
		var fn = _queueItems.skip(id);
		if (!_queueRunning && _queueItems.length == 0) {
			window.cancelAnimationFrame(_queueRafId);
		}
		return fn;
	},
}, {
	running: {
		get: function () {
			return _queueRunning;
		}
	}
});

if (DEBUG) {
	/** @type {module:underscore} */
	var _ = require("underscore");
	
	// // log frame exec time
	// var _now = window.performance? 
	// 	window.performance.now.bind(window.performance) :
	// 	Date.now.bind(Date);
	// _runQueue = _.wrap(_runQueue, function(fn, tstamp) {
	// 	var retval, tframe;
	// 	console.log("[FRAME BEGIN] [%ims] %i items [ids:%i-%i]", tstamp, _queueItems.length, _queueItems.firstIndex, _queueItems.lastIndex);
	// 	tframe = _now();
	// 	retval = fn(tstamp);
	// 	tframe = _now() - tframe;
	// 	console.log("[FRAME ENDED] [%ims] took %ims\n---\n", tstamp + tframe, tframe);
	// 	if (_queueItems.length != 0) console.info("[FRAME ENDED] %i items scheduled for [raf:%i]", _queueItems.length, _queueRafId);
	// 	return retval;
	// });
	
	// log frame end
	_runQueue = _.wrap(_runQueue, function(fn, tstamp) {
		var retval;
		retval = fn(tstamp);
		console.log("[Frame exit]\n---\n");
		return retval;
	});
	
	// use log prefix
	_runQueue = _.wrap(_runQueue, function(fn, tstamp) {
		var retval, logprefix;
		logprefix = console.prefix;
		console.prefix += "[raf:" + _queueRafId + "] ";
		retval = fn(tstamp);
		console.prefix = logprefix;
		return retval;
	});
	
	FrameQueue.cancel = _.wrap(FrameQueue.cancel, function(fn, id) {
		var rafId = _queueRafId;
		var retval = fn(id);
		
		if (retval === void 0) {
			console.warn("FrameQueue::cancel [id:%i] not found", id);
		} else if (retval === null) {
			console.warn("FrameQueue::cancel [id:%i] already cancelled", id);
		} else {
			if (!_queueRunning && _queueItems.length == 0) {
				console.info("FrameQueue::cancel [raf:%i] cancelled (empty queue)", rafId);
			} else {
				// console.log("FrameQueue::cancel [id:%i] cancelled", id);
			}
		}
		return retval;
	});
}

module.exports = FrameQueue;
