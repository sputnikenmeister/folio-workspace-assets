/* https://html.spec.whatwg.org/multipage/media.html#event-media-canplay
 */
module.exports = [
	// networkState
	"loadstart",
	"progress",
	"suspend",
	"abort",
	"error",
	"emptied",
	"stalled",
	// readyState
	"loadedmetadata",
	"loadeddata",
	"canplay",
	"canplaythrough",
	"playing",
	"waiting",
	//
	"seeking", // seeking changed to true
	"seeked", // seeking changed to false
	"ended", // ended is true
	//
	"durationchange", // duration updated
	"timeupdate", // currentTime updated
	"play", // paused is false
	"pause", // paused is false
	"paused", // ??
	"ratechange",
	//
	"resize",
	"volumechange",
];
