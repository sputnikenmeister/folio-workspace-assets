
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:utils/setImmediate} */
var setImmediate = require("utils/setImmediate");

var _now = window.performance? 
	window.performance.now.bind(window.performance) :
	Date.now.bind(Date);

var _queueItems = [];
var _queueLen = 0;
var _queueRafId = -1;
var _queueIdxOffset = 0;
var _queueRunning = false;
var _queuePriority = [];

/**
/* @param tstamp {int}
/*/
var _runQueue = function(tstamp) {
	var currItems = _queueItems;
	var currLen = _queueLen;
	var currRafId = _queueRafId;
	var currPriority = _queuePriority;
	
	_queueItems = [];
	_queueLen = 0;
	_queueIdxOffset += currItems.length;
	_queuePriority = [];
	_queueRunning = true;
	
	// currPriority.sort(function (a, b) {
	// 	return a.priority - b.priority;
	// });
	currPriority.sort(function (a, b) {
		if (a.priority > b.priority) {
			return 1;
		}
		if (a.priority < b.priority) {
			return -1;
		}
		// a must be equal to b
		return 0;
	});
	currPriority.forEach(function(o) {
		var fn = currItems[o.id];
		if (fn !== null) fn(tstamp);
	});
	// currItems.forEach(function(fn, index) {
	// 	if (fn !== null) fn(tstamp);
	// });
	
	_queueRafId = -1;
	_queueRunning = false;
	
	if (_queueLen > 0) {
		_queueRafId = window.requestAnimationFrame(_runQueue);
	}
};


/**
/* @param fn {Function}
/* @param forceNext {int}
/* @return {int}
/*/
var _requestCallback = function(fn, priority) {
	if (!_queueRunning && _queueRafId == -1) {
		_queueRafId = window.requestAnimationFrame(_runQueue);
	}
	var index = _queueItems.length;
	_queueItems[index] = fn;
	_queuePriority[index] = { priority: (priority || 0), id: index };
	_queueLen++;
	
	return index + _queueIdxOffset;
};

/**
/* @param id {int}
/* @return {Function?}
/*/
var _cancelCallback = function(id) {
	var fn, index;
	
	if (id < _queueIdxOffset) {
		console.warn("FrameQueue::cancel [id:%i] past current offset %i", id, _queueIdxOffset);
		return void 0;
	}
	index = id - _queueIdxOffset;
	if (index >= _queueItems.length) {
		return void 0;
	}
	fn = _queueItems[index];
	if (fn === null) {
		return null;
	}
	_queueItems[index] = null;
	_queueLen--;
	if (!_queueRunning && _queueLen == 0) {
		window.cancelAnimationFrame(_queueRafId);
		_queueRafId = -1;
		_queueIdxOffset += _queueItems.length;
		_queueItems.length = 0;
	}
	return fn;
};

var FrameQueue = Object.create({
	request: _requestCallback,
	cancel: _cancelCallback
}, {
	running: {
		get: function () {
			return _queueRunning;
		}
	}
});

if (DEBUG) {
	
	console.info("Using app/view/base/FrameQueue2");
	// // log exec time
	// _runQueue = _.wrap(_runQueue, function(fn, tstamp) {
	// 	var retval, tframe;
	// 	console.log("[BEGIN] [%ims] %i calls (id offset: %i)", tstamp, _queueLen, _queueIdxOffset + _queueItems.length);
	// 	tframe = _now();
	// 	retval = fn(tstamp);
	// 	tframe = _now() - tframe;
	// 	console.log("[ENDED] [%ims] took %ims\n---\n", tstamp + tframe, tframe);
	// 	if (_queueLen != 0) console.info("[ENDED] %i scheduled for [raf:%i]", _queueLen,  _queueRafId);
	// 	return retval;
	// });
	
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
			if (!_queueRunning && _queueLen == 0) {
				console.info("FrameQueue::cancel [raf:%i] cancelled (empty queue)", rafId);
			} else {
				// console.log("FrameQueue::cancel [id:%i] cancelled", id);
			}
		}
		return retval;
	});
}

module.exports = FrameQueue;
