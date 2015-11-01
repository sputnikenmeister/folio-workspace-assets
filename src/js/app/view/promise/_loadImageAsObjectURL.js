/*global XMLHttpRequest */
var _ = require("underscore");

var statusMsg = _.template("<%= status %> received from <%= url %> (<%= statusText %>)");
var errMsg = _.template("'<%= errName %>' ocurred during request <%= url %>");

if (window.XMLHttpRequest && window.URL && window.Blob) {
	module.exports = function (url, progressFn) {
		return new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.responseType = "blob";
			
			// if progressFn is supplied
			// - - - - - - - - - - - - - - - - - -
			if (progressFn) {
				request.onprogress = function(ev) {
					progressFn(ev.loaded / ev.total);
				};
			}
			// resolved/success
			// - - - - - - - - - - - - - - - - - -
			request.onload = function (ev) {
				// When the request loads, check whether it was successful
				if (request.status == 200) {
					// If successful, resolve the promise by passing back a reference url
					resolve(URL.createObjectURL(request.response));
				} else {
					var err = new Error(statusMsg({
						statusText: request.statusText,
						status: request.status, url: url
					}));
					err.event = ev;
					reject(err);
				}
			};
			// reject/failure
			// - - - - - - - - - - - - - - - - - -
			request.onerror = function (ev) {
				var err = new Error(errMsg({
					errName: ev.type,
					url: url
				}));
				err.event = ev;
				reject(err);
			};
			request.onabort = request.ontimeout = request.onerror;
			// finally
			// - - - - - - - - - - - - - - - - - -
			request.onloadend = function () {
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
	module.exports = function (url) {
		return Promise.resolve(url);
	};
}
