module.exports = function(view) {
	return new Promise(function(resolve, reject) {
		if (view.attached) {
			resolve(view);
		} else {
			view.on("view:attached", function(view) {
				resolve(view);
			});
		}
	});
};
