module.exports = function(view) {
	return new Promise(function(resolve, reject) {
		if (!view.invalidated) {
			resolve(view);
		} else {
			view.once("view:render:after", function(view, flags) {
				resolve(view);
			});
		}
	});
};
