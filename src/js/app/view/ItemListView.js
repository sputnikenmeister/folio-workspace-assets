/**
* jscs standard:Jquery
* @module view/ItemListView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/view/ItemView} */
var ItemView = require( "./ItemView" );

/**
 * @constructor
 * @type {module:app/view/ItemListView}
 */
module.exports = Backbone.View.extend({
	
	initialize: function(options) {
		this.associations = options["associations"];
		this.key = options["key"];
		
		this._views = [];
		this._viewIndex = {};
		
		this.collection.each(this.assignItemView, this);
		
		this._els = this.$(".item, .group");
		
		this.collection.on("collection:select", this.whenModelSelect, this);
		if (this.associations && this.key) {
			this.associations.on("collection:select", this.whenAssocSelect, this);
		}
	},
	
	assignItemView: function(item, index, arr) {
		var view = new ItemView({
			el: this.$("#" + item.id),
			model: item
		});
		view.on("item:click", this.whenItemViewClick, this);
		this._viewIndex[item.id] = view;
		this._views[index] = view;
	},
	
	getItemView: function(model) {
		return this._viewIndex[model.id];
	},
	
	whenItemViewClick: function(item) {
		this.collection.select(item);
	},
			
	whenModelSelect: function(newItem, oldItem) {
		if (newItem) {
			this.getItemView(newItem).$el.addClass("selected");
			if (!oldItem) {
				this.$el.addClass("has-selected");
			}
		}
		if (oldItem) {
			this.getItemView(oldItem).$el.removeClass("selected");
			if (!newItem) {
				this.$el.removeClass("has-selected");
			}
		}
		if (!newItem && !oldItem) {
			throw new Error("ItemListView.onModelSelection: both new and old are null");
		}
//			this.render();
	},
	
	whenAssocSelect: function(newItem, oldItem) {
		if (newItem) {
			var refIds = newItem.get(this.key);
			_.each(this._els, function(o, i, a) {
				var jqo = $(o);
				if (_.contains(refIds, o.id)) {
					jqo.addClass("highlight");
				} else {
					jqo.removeClass("highlight");
				}
			});
			if (!oldItem) {
				this.$el.addClass("has-highlight");
			}
		} else {
			$(this._els).removeClass("highlight");
			this.$el.removeClass("has-highlight");
		}
//		this.render();
	},
	
	_collapsed: null,
	collapsed: function(value) {
		if (arguments.length == 1 && value !== this._collapsed) 
		{
			this._collapsed = value;
			if (value) {
				this.$el.addClass("collapsed");
			} else {
				this.$el.removeClass("collapsed");
			}
//			this.render();
		}
		return this._collapsed;
	},
	
	render: function(){
		return this;
	}
});
