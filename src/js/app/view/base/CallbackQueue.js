var PriorityQueue = function(offset) {
	this._offset = offset | 0;
	this._items = [];
	this._priorities = [];
	this._numItems = 0;
};

PriorityQueue.prototype = Object.create({
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
		}
		return item;
	},

	indexes: function() {
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

var CallbackQueue = function(requestFn, cancelFn) {
	this._nextQueue = new PriorityQueue(0);
	this._currQueue = null;

	// this._pending = false;
	this._running = false;
	this._runId = -1;

	this._requestFn = requestFn;
	this._cancelFn = cancelFn;
	this._runQueue = this._runQueue.bind(this)
};

CallbackQueue.prototype = Object.create({
	/**
	 * @param tstamp {int}
	 */
	_runQueue: function() {
		if (this._running) throw new Error("wtf!!!");

		this._currQueue = this._nextQueue;
		this._nextQueue = new PriorityQueue(this._currQueue.offset + this._currQueue.length);

		this._runId = -1;
		this._running = true;

		var i, item;
		var indexes = this._currQueue.indexes();
		var items = this._currQueue._items;
		for (i = 0; i < indexes.length; i++) {
			item = items[indexes[i]];
			if (item !== null) {
				item.apply(null, arguments);
			}
		}

		// var self = this;
		// this._currQueue.indexes().forEach(function(index) {
		// 	var fn = self._currQueue._items[index];
		// 	if (fn !== null) {
		// 		fn.apply(null, arguments);
		// 	}
		// });
		this._running = false;
		this._currQueue = null;

		if (this._nextQueue.numItems > 0) {
			this._runId = this._requestFn.call(null, this._runQueue);
			// this._runId = this._requestFn(this._runQueue);
		}
	},

	/**
	 * @param fn {Function}
	 * @param priority {int}
	 * @return {int}
	 */
	request: function(fn, priority) {
		// if (!this._running && !this._pending) {
		// 	this._pending = true;
		// 	console.warn("FrameQueue::request setImmediate: pending");
		// 	setImmediate(function() {
		// 		this._pending = false;
		// 		if (this._nextQueue.numItems > 0) {
		// 			this._runId = window.requestAnimationFrame(_runQueue);
		// 			console.warn("FrameQueue::request setImmediate: raf:%i for %i items", this._runId, this._nextQueue.numItems);
		// 		} else {
		// 			console.warn("FrameQueue::request setImmediate: no items");
		// 		}
		// 	});
		// }
		if (!this._running && this._runId === -1) {
			this._runId = this._requestFn.call(null, this._runQueue);
			// this._runId = this._requestFn(this._runQueue);
		}
		return this._nextQueue.enqueue(fn, priority);
	},

	/**
	 * @param id {int}
	 * @return {Function?}
	 */
	cancel: function(id) {
		var fn;
		if (this._running) {
			fn = this._currQueue.skip(id) || this._nextQueue.skip(id);
		} else {
			fn = this._nextQueue.skip(id);
			if ((this._runId !== -1) && (this._nextQueue.numItems === 0)) {
				this._cancelFn.call(null, this._runId);
				// this._cancelFn(this._runId);
				this._runId = -1;
			}
		}
		return fn;
	},
}, {
	running: {
		get: function() {
			return this._running;
		}
	}
});

module.exports = CallbackQueue;