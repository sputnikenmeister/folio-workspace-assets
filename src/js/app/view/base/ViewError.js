function ViewError(view, err) {
	this.view = view;
	this.err = err;
	this.message = err.message;
}
ViewError.prototype = Object.create(Error.prototype);
ViewError.prototype.constructor = ViewError;
ViewError.prototype.name = "ViewError";

module.exports = ViewError;
