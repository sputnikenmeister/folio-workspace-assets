/*global XMLHttpRequest */

// var _ = require("underscore");
// /** @type {module:underscore.string/lpad} */
// var classify = require("underscore.string/classify");

// var statusMsg = _.template("<%= status %> received from <%= url %> (<%= statusText %>)");
// var errMsg = _.template("'<%= errName %>' ocurred during request <%= url %>");

if (window.XMLHttpRequest && window.URL && window.Blob) {
	module.exports = function(url, progressFn) {
		return new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			// request.timeout = 10000; // in milliseconds
			request.responseType = "blob";

			var errorFromEvent = function(ev) {
				var err = new Error((ev.target.status > 0 ?
					"http_" + request.statusText.replace(/\s/g, "_") :
					ev.type + "_event").toUpperCase());
				err.infoCode = ev.target.status;
				err.infoSrc = url;
				err.logEvent = ev;
				err.logMessage = "_loadImageAsObjectURL::" + ev.type + " [reject]";
				return err;
			};

			// if progressFn is supplied
			// - - - - - - - - - - - - - - - - - -
			if (progressFn) {
				request.onprogress = function(ev) {
					progressFn(ev.loaded / ev.total, request);
				};
			}

			// resolved/success
			// - - - - - - - - - - - - - - - - - -
			request.onload = function(ev) {
				// When the request loads, check whether it was successful
				if (request.status == 200) {
					// If successful, resolve the promise by passing back a reference url
					resolve(URL.createObjectURL(request.response));
				} else {
					reject(errorFromEvent(ev));
				}
			};
			// normal abort
			// - - - - - - - - - - - - - - - - - -
			request.onabort = function(ev) {
				resolve(void 0);
			};
			// reject/failure
			// - - - - - - - - - - - - - - - - - -
			request.onerror = function(ev) {
				reject(errorFromEvent(ev));
			};
			request.ontimeout = request.onerror;

			// finally
			// - - - - - - - - - - - - - - - - - -
			request.onloadend = function(ev) {
				console.log("_loadImageAsObjectURL::%s [cleanup] (%s)", ev ? ev.type : "no event", url);
				request.onabort = request.ontimeout = request.onerror = void 0;
				request.onload = request.onloadend = void 0;
				if (progressFn) {
					request.onprogress = void 0;
				}
			};

			request.send();
		});
	};
} else {
	module.exports = function(url, progressFn) {
		return Promise.resolve(url);
	};
}