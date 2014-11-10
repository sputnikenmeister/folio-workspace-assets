/**
* @module app/view/component/GroupingListView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require( "./SelectableListView" );

/**
 * @constructor
 * @type {module:app/view/component/GroupingView}
 */
var GroupingView = Backbone.View.extend({
	/** @override */
	tagName: "dt",
	/** @override */
	className: "list-group",

	// initialize: function(options) {
	// 	this.listenTo(this.model, "change:excluded", this.onExcludedChange);
	// },

	// onExcludedChange: function(model, value) {
	// 	if (value) {
	// 		this.$el.addClass("excluded");
	// 	} else {
	// 		this.$el.removeClass("excluded");
	// 	}
	// },
});

/**
 * @constructor
 * @type {module:app/view/component/GroupingListView}
 */
module.exports = SelectableListView.extend({

	/** @override */
	tagName: "dl",
	/** @override */
	className: "list selectable filterable grouped",
	/** @private */
	groupings: {},
	/** @type {Backbone.ChildViewContainer} */
	groupingViews: new Backbone.ChildViewContainer(),

	/** @override */
	initialize: function(options) {
		/* call "super" */
		SelectableListView.prototype.initialize.apply(this, arguments);

		if (options["groupings"]) {
			this.groupings = options["groupings"];
			this.groupings.collection.each(this.assignGroupingView, this);
		}
	},

	/** @private */
	renderFilters: function(newAssoc, oldAssoc) {
		var groupIds;
		if (newAssoc) {
			groupIds = newAssoc.get(this.groupings.key);
		}
		this.renderChildrenGroups(groupIds);
		SelectableListView.prototype.renderFilters.apply(this, arguments);
	},

	/** @private */
	renderChildrenGroups: function(modelIds) {
		if (modelIds) {
			this.groupings.collection.each(function(model, index, arr) {
				if (_.contains(modelIds, model.id)) {
					this.groupingViews.findByModel(model).$el
						.removeClass("excluded")
						// .addClass("included")
						;
				} else {
					this.groupingViews.findByModel(model).$el
						.addClass("excluded")
						// .removeClass("included")
						;
				}
			}, this);
		} else {
			this.groupingViews.each(function(view) {
				view.$el
					.removeClass("excluded")
					// .removeClass("included")
					;
			});
		}
	},

	/*
	* Create children views
	*/
	/** @private */
	assignGroupingView: function(item, index, arr) {
		var view = new GroupingView({
			model: item,
			el: item.selector()
		});
		this.groupingViews.add(view, item.id);
	},

});
