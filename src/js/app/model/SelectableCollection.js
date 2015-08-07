/**
 * @module app/model/SelectableCollection
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/**
 * @constructor
 * @type {module:app/model/SelectableCollection}
 */
var SelectableCollection = Backbone.Collection.extend({
	
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
		if (newModel === void 0) {
			newModel = null;
		}
		if (this.selected === newModel) {
			return;
		}
		var triggerEvents = !(options && options.silent);
		var oldModel = this.selected;
		
		this.lastSelected = this.selected;
		this.lastSelectedIndex = this.selectedIndex;
		this.selected = newModel;
		this.selectedIndex = this.indexOf(newModel);
		
		if (oldModel) {
			if (_.isFunction(oldModel.deselect)) {
				oldModel.deselect(options);
			} else if (triggerEvents) {
				oldModel.selected = void 0;
				oldModel.trigger("deselected");
			}
			if (triggerEvents) this.trigger("deselect:one", oldModel);
		} else {
			if (triggerEvents) this.trigger("deselect:none");
		}
		
		if (newModel) {
			if (_.isFunction(newModel.select)) {
				newModel.select(options);
			} else if (triggerEvents) {
				newModel.selected = true;
				newModel.trigger("selected");
			}
			if (triggerEvents) this.trigger("select:one", newModel);
		} else {
			if (triggerEvents) this.trigger("select:none");
		}
	},
	
	deselect: function (options) {
		this.select(void 0, options);
	},
	
	selectAt: function (index, options) {
		if (0 > index || index >= this.length) {
			new RangeError("index is out of bounds");
		}
		this.select(this.at(index), options);
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

module.exports = SelectableCollection;
