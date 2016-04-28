module.exports = function(el) {
	// var _export =  function (el) {
	el || (el = document.documentElement);
	if (!document.fullscreenElement && // alternative standard method
		!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
		if (el.requestFullscreen) {
			el.requestFullscreen();
		} else if (el.msRequestFullscreen) {
			el.msRequestFullscreen();
		} else if (el.mozRequestFullScreen) {
			el.mozRequestFullScreen();
		} else if (el.webkitRequestFullscreen) {
			el.webkitRequestFullscreen(); //window.Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
	return document.fullscreenElement || document.mozFullScreenElement || document.webkitCurrentFullScreenElement || document.msFullscreenElement;
};
// module.exports = function() {
// 	var retval = _export.apply(void 0, arguments);
// 	console.log(retval);
// 	return retval;
// };

// "webkitfullscreenchange" "mozfullscreenchange" "fullscreenchange" "MSFullscreenChange"
