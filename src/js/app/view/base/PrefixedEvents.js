/** @type {module:utils/prefixedEvent} */
const prefixedEvent = require("utils/prefixedEvent");

var eventMap = {
	"transitionend": prefixedEvent("transitionend"),
	"fullscreenchange": prefixedEvent("fullscreenchange", document),
	"fullscreenerror": prefixedEvent("fullscreenerror", document),
	"visibilitychange": prefixedEvent("visibilitychange", document, "hidden")
};

var eventNum = 0;
for (var eventName in eventMap) {
	if (eventName === eventMap[eventName]) {
		delete eventMap[eventName];
	} else {
		Object.defineProperty(eventMap, eventName, {
			value: eventMap[eventName],
			enumerable: true
		});
		Object.defineProperty(eventMap, eventNum, {
			value: eventName,
			enumerable: false
		});
		eventNum++;
	}
}
Object.defineProperty(eventMap, "length", {
	value: eventNum
});

if (DEBUG) {
	console.log("prefixes enabled for %i events", eventMap.length, Object.keys(eventMap));
}

module.exports = eventMap;

// module.exports = eventNum > 0? eventMap : null;
