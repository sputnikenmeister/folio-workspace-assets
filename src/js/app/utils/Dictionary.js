/**
 * @module app/utils/Dictionary
 */

var hashFn = function(str, max) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		var letter = str[i];
		hash = (hash << 5) + letter.charCodeAt(0);
		hash = (hash & hash) % max;
	}
	return hash;
};

/**
 * @constructor
 * @type {module:app/utils/Dictionary}
 */
var Dictionary = function() {
	this._storage = [];
	this._count = 0;
	this._limit = 8;
};

Dictionary.prototype.add = function(key, value) {
	//create an index for our storage location by passing it through our hashing function
	var index = hashFn(key, this._limit);
	//retrieve the bucket at this particular index in our storage, if one exists
	//[[ [k,v], [k,v], [k,v] ] , [ [k,v], [k,v] ]	 [ [k,v] ] ]
	var bucket = this._storage[index];
		//does a bucket exist or do we get undefined when trying to retrieve said index?
	if (!bucket) {
		//create the bucket
		bucket = [];
		//add the bucket to our hashTable
		this._storage[index] = bucket;
	}

	var override = false;
	//now iterate through our bucket to see if there are any conflicting
	//key value pairs within our bucket. If there are any, override them.
	for (var i = 0; i < bucket.length; i++) {
		var tuple = bucket[i];
		if (tuple[0] === key) {
			//overide value stored at this key
			tuple[1] = value;
			override = true;
		}
	}

	if (!override) {
		//create a new tuple in our bucket
		//note that this could either be the new empty bucket we created above
		//or a bucket with other tuples with keys that are different than
		//the key of the tuple we are adding. These tupules are in the same
		//bucket because their keys all equate to the same numeric index when
		//passing through our hash function.
		bucket.push([key, value]);
		this._count++;
		//now that we've added our new key/val pair to our storage
		//let's check to see if we need to resize our storage
		if (this._count > this._limit * 0.75) {
			this.resize(this._limit * 2);
		}
	}
	return this;
};

Dictionary.prototype.remove = function(key) {
	var index = hashFn(key, this._limit);
	var bucket = this._storage[index];
	if (!bucket) {
		return null;
	}
	//iterate over the bucket
	for (var i = 0; i < bucket.length; i++) {
		var tuple = bucket[i];
		//check to see if key is inside bucket
		if (tuple[0] === key) {
			//if it is, get rid of this tuple
			bucket.splice(i, 1);
			this._count--;
			if (this._count < this._limit * 0.25) {
				this._resize(this._limit / 2);
			}
			return tuple[1];
		}
	}
};

Dictionary.prototype.get = function(key) {
	var index = hashFn(key, this._limit);
	var bucket = this._storage[index];

	if (!bucket) {
		return null;
	}

	for (var i = 0; i < bucket.length; i++) {
		var tuple = bucket[i];
		if (tuple[0] === key) {
			return tuple[1];
		}
	}

	return null;
};

Dictionary.prototype.resize = function(newLimit) {
	var oldStorage = this._storage;

	this._limit = newLimit;
	this._count = 0;
	this._storage = [];

	oldStorage.forEach(function(bucket) {
		if (!bucket) {
			return;
		}
		for (var i = 0; i < bucket.length; i++) {
			var tuple = bucket[i];
			this.add(tuple[0], tuple[1]);
		}
	}.bind(this));
};

module.exports = Dictionary;
