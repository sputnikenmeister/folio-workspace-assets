/* jshint ignore:start */
/*
Taken from:
https://github.com/webcomponents/webcomponentsjs/blob/master/src/MutationObserver/MutationObserver.js
*/
/*
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var setImmediate;

// As much as we would like to use the native implementation, IE
// (all versions) suffers a rather annoying bug where it will drop or defer
// callbacks when heavy DOM operations are being performed concurrently.
//
// For a thorough discussion on this, see:
// http://codeforhire.com/2013/09/21/setimmediate-and-messagechannel-broken-on-internet-explorer-10/
if (/Trident|Edge/.test(navigator.userAgent)) {
	// Sadly, this bug also affects postMessage and MessageQueues.
	//
	// We would like to use the onreadystatechange hack for IE <= 10, but it is
	// dangerous in the polyfilled environment due to requiring that the
	// observed script element be in the document.
	setImmediate = setTimeout;

	// If some other browser ever implements it, let's prefer their native
	// implementation:
} else if (window.setImmediate) {
	setImmediate = window.setImmediate;

	// Otherwise, we fall back to postMessage as a means of emulating the next
	// task semantics of setImmediate.
} else {
	var setImmediateQueue = [];
	var sentinel = String(Math.random());
	window.addEventListener("message", function(e) {
		if (e.data === sentinel) {
			var queue = setImmediateQueue;
			setImmediateQueue = [];
			queue.forEach(function(func) {
				func();
			});
		}
	});
	setImmediate = function(func) {
		setImmediateQueue.push(func);
		window.postMessage(sentinel, "*");
	};
}

module.exports = setImmediate;
/* jshint ignore:end */
