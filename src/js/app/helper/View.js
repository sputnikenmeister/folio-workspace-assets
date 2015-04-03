/**
 * @module app/helper/View
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {Object} */
var _viewsByCid = {};

var _views = [];
var _elements = [];
var _count = 0;

//var viewToString = function (view) {
//	return (view.model && view.model.get("name")) || view.cid;
//};

var registerView = function(view) {
	_views[_count] = view;
	_elements[_count] = view.el;
	_count++;
//	console.log("Registered ("+_count+") '"+viewToString(view)+"'");
};
var unregisterView = function(view) {
	var idx = _views.indexOf(view);
	_views.splice(idx, 1);
	_elements.splice(idx, 1);
	_count--;
//	console.log("Unregistered ("+_count+") "+idx+":'"+viewToString(view)+"'");
};

//window.setInterval(function() {
//	var s = "";
//	_.each(_views, function (view, i) {
//		s += " " + i + ":'" + viewToString(view) + "'";
//	});
//	s = "Views registered ("+_count+") [" + s + "]";
////	console.log(s);
//	console.log(_views.length, _.keys(_viewsByCid).join(" "));
//}, 5000);

/**
 * @constructor
 * @type {module:app/helper/View}
 */
var View = Backbone.View.extend({

	constructor: function(options) {
		if (options && options.className && this.className) {
			options.className += " " + _.result(this, "className");
		}
		Backbone.View.apply(this, arguments);
		_viewsByCid[this.cid] = this;
	},

	remove: function() {
		this.trigger("view:remove", this);
		unregisterView(this);
		delete _viewsByCid[this.cid];
		return Backbone.View.prototype.remove.apply(this, arguments);
	},

    setElement: function(element, delegate) {
		// setElement always initializes this.el,
		// so this.el has to be checked before calling super
		if (this.el) {
			Backbone.View.prototype.setElement.apply(this, arguments);
			this.$el.addClass(_.result(this, "className"));
		} else {
			Backbone.View.prototype.setElement.apply(this, arguments);
		}
		this.$el.attr("data-cid", this.cid);
		registerView(this);
		return this;
	},
},{
	findByElement: function(element) {
		console.error("View.findByElement !!!!");
		return _views[_elements.indexOf(element)];
	},

	_deprecated_findByElement: function(element) {
		for (var cid in _viewsByCid) {
			if (_viewsByCid[cid].el === element) {
				return _viewsByCid[cid];
			}
		}
		return void 0;
	}
});

module.exports = View;
