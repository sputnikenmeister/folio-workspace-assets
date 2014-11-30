/**
 * @module app/helper/SelectableList
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/**
 * @constructor
 * @type {module:app/helper/SelectableList}
 */
var SelectableList = Backbone.Collection.extend({

	/*initialize: function (models, options) {
		options = _.defaults({}, options, {initialSelection: "none", silentInitial: true});
		var initialOptions = {silent: options.silentInitial};
		if (options.initialSelection == "first") {
			this.listenTo(this, "reset", function() {
				this.select(this.at(0), initialOptions);
			});
			this.select(models[0], initialOptions);
		} else {
			this.listenTo(this, "reset", function() {
				this.deselect(initialOptions);
			});
			this.deselect(initialOptions);
		}
	},*/

	initialize: function (models, options) {
		options = _.defaults({}, options, {
			initialSelection: "none",
			silentInitial: true
		});
		this.initialSelection = options.initialSelection;
		this.initialOptions = {
			silent: options.silentInitial
		};
	},

	reset: function (models, options) {
		this.deselect(this.initialOptions);
		Backbone.Collection.prototype.reset.apply(this, arguments);
		if (this.initialSelection == "first" && this.length) this.select(models[0], this.initialOptions);
	},

	select: function (newModel, options) {
		if (this.selected === newModel) {
			return;
		}
		var oldModel = this.selected;
		var triggerEvents = !(options && options.silent);
		if (oldModel) {
			if (_.isFunction(oldModel.deselect)) oldModel.deselect(options);
			if (triggerEvents) this.trigger("deselect:one", oldModel);
		}
		this.selected = newModel;
		if (newModel) {
			if (_.isFunction(newModel.select)) newModel.select(options);
			if (triggerEvents) this.trigger("select:one", newModel, oldModel);
		} else {
			if (triggerEvents) this.trigger("select:none", newModel, oldModel);
		}
	},

	deselect: function (options) {
		this.select(null, options);
	},

	/* TODO: MOVE INTO MIXIN */

	/** @return boolean	 */
	hasFollowing: function (model) {
		model || (model = this.selected);
		return this.indexOf(model) < (this.length - 1);
	},

	/** @return next model	*/
	following: function (model) {
		model || (model = this.selected);
		return this.hasFollowing(model) ? this.at(this.indexOf(model) + 1) : null;
	},

	/** @return next model or the beginning if at the end */
	followingOrFirst: function (model) {
		model || (model = this.selected);
		return this.at((this.indexOf(model) + 1) % this.length);
	},

	/** @return boolean	 */
	hasPreceding: function (model) {
		model || (model = this.selected);
		return this.indexOf(model) > 0;
	},

	/** @return the previous model */
	preceding: function (model) {
		model || (model = this.selected);
		return this.hasPreceding(model) ? this.at(this.indexOf(model) - 1) : null;
	},

	/** @return the previous model or the end if at the beginning */
	precedingOrLast: function (model) {
		model || (model = this.selected);
		var index = this.indexOf(model) - 1;
		return this.at(index > -1 ? index : this.length - 1);
	},

});

module.exports = SelectableList;
