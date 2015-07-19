module.exports = function(label, level) {
	//Array.prototype.slice.call(arguments).join(" "));
	switch (level) {
			case "error":	return function() { console.error(label, arguments); };
			case "warn": 	return function() { console.warn(label, arguments); };
			case "info":	return function() { console.info(label, arguments); };
			default: 		return function() { console.log(label, arguments); };
	}
};
