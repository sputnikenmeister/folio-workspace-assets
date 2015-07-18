function ViewError(view, err) {
   if (err.stack) {
        // remove one stack level:
        if (typeof(Components) != "undefined") {
            // Mozilla:
            this.stack = err.stack.substring(err.stack.indexOf("\n")+1);
        }
        else if (typeof(chrome) != "undefined" || typeof(process) != "undefined") {
            // Google Chrome/Node.js:
            this.stack = err.stack.replace(/\n[^\n]*/,"");
        }
        else {
            this.stack = err.stack;
        }
    }
	 this.view = view;
    this.message = "[ view " + view.cid + " model " + view.model.cid + " ] " + err.message;
    this.fileName = err.fileName;
    this.lineNumber = err.lineNumber;
}

ViewError.prototype = Object.create(Error.prototype);
ViewError.prototype.constructor = ViewError;
ViewError.prototype.name = "ViewError";

module.exports = ViewError;
