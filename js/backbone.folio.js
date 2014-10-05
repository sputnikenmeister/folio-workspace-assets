/* ©2014 Pablo Canillas */

$(function(){
	var bootstrap = window.bootstrap || {"all-bundles":[],"all-keywords":[],"all-types":[]};
	delete window.bootstrap;
	
	/** Fill-in back references: Bundle.keywords -> Keyword.bundles) */
	_.each(bootstrap["all-keywords"], function(ko, ki, ka) {
		ko.bundles = [];
		_.each(bootstrap["all-bundles"], function(bi, bo, ba) {
			if (_.contains(bi.keywords, ko.id)) {
				ko.bundles.push(bi.id);
			}
		})
//		ko._resolvedDomIds = ko.bundles.concat(); // make a copy
	});
	
	
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};
	
	/**
	 * Item
	 */
	var Item = Backbone.Model.extend({
//		defaults: {
//			selected: false,
//			highlight: false
//		},
		
		/** @override */
		url: function() {
			return Backbone.Model.prototype.url.apply(this, arguments) + "/";
		},
		
//		setSelected: function(value){
//			this.set("selected", value);
//		}
	});
	
	/**
	 * ItemList
	 */
	var ItemList = Backbone.Collection.extend({
		model: Item,
		selected: null,
		
		select: function(newItem) {
			if (this.selected === newItem) {
				return;
			}
			oldItem = this.selected;
//			if (oldItem) {
//				oldItem.setSelected(false);
//			}
			this.selected = newItem;
//			if (newItem) {
//				newItem.setSelected(true);
//			}
			this.trigger("collection:select", newItem, oldItem);
		},
		
		selectedItem: function(){
			return this.selected;
		},
		
		hasFollowing:function(model) {
			return this.indexOf(model) < (this.length - 1);
		},
		
		hasPreceding: function(model) {
			return this.indexOf(model) > 0;
		},
		
		/** return next model  */
		following: function(model) {
			return this.hasFollowing(model)? this.at(this.indexOf(model) + 1): null;
		},
		
		/** return the previous model */
		preceding: function(model) {
			return this.hasPreceding(model)? this.at(this.indexOf(model) - 1): null;
		},
		
		/** return next model or the beginning if at the end */
		followingOrFirst: function(model) {
			return this.at((this.indexOf(model) + 1) % this.length);
		},
		
		/** return the previous model or the end if at the beginning */
		precedingOrLast: function(model) {
			var index = this.indexOf(model) - 1;
			return this.at(index > -1 ? index : this.length - 1);
		}
		
	});
	
	
	/**
	 * ItemView
	 */
	var ItemView = Backbone.View.extend({
		
		events: {
			"click ": "whenClick"
		},
		
//		initialize: function() {
//			this.model.on('change:selected', this.render, this);
//			this.model.on('change:highlight', this.render, this);
//		},
		
		whenClick: function(event) {
			if (!event.isDefaultPrevented()) {
				event.preventDefault();
			}
			this.trigger("item:click", this.model);
		},
		
//		render: function() {
//			if (this.model.get('selected')) {
//				this.$el.addClass('selected');
//			} else {
//				this.$el.removeClass('selected');
//			}
//			return this;
//		}
	});
	
	
	
	/// TODO: remove need for this
	var kIndex = _.indexBy(bootstrap["all-keywords"], "id");
	_.each(bootstrap["all-bundles"], function (bo, bi, ba) {
		var bTypes = [];
		_.each(bo.keywords, function(ko, ki, ka) {
			var kType = kIndex[ko].type;
			if (bTypes.indexOf(kType) == -1) {
				bTypes.push(kType);
			}
		});
		bo._resolvedDomIds = bo.keywords.concat(bTypes);
	});
	
	/**
	 * ItemListView
	 */
	var ItemListView = Backbone.View.extend({
	
		tagName: "ul",
		className: "mapped",
		
		initialize: function(options) {
			this.associations = options["associations"];
			this.key = options["key"];
			
			this._views = {};
			this.collection.each(this.assignItemView, this);
			
			this._els = this.$(".item, .group");
			
			this.collection.on('collection:select', this.onModelSelection, this);
			if (this.associations && this.key) {
				this.associations.on('collection:select', this.onAssocSelection, this);
			}
		},
		
		assignItemView: function (item, idx, list) {
			var view = new ItemView({ el: "#" + item.id, model: item });
			view.on("item:click", this.onItemViewClick, this);
			this._views[item.id] = view;
		},
				
		onModelSelection: function(newItem, oldItem) {
			if (oldItem) {
				this._views[oldItem.id].$el.removeClass("selected");
			}
			if (newItem) {
				this._views[newItem.id].$el.addClass("selected");
			}
			// TODO: refactor
			this.$el.removeClass("collapsed");
		},
		
		onAssocSelection: function(newItem, oldItem) {
			
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
			} else {
				$(this._els).removeClass("highlight");
			}
			// TODO: refactor
			if (newItem) {
				this.$el.addClass("collapsed");
			} else {
				this.$el.removeClass("collapsed");
			}
//			this.collection.each(function (model, idx, list) {
//				model.set("highlight", newItem && _.contains(refIds, model.id));
//			});
		},
		
		onItemViewClick: function(item) {
			this.collection.select(item);
			// bad place to do this...
			this.associations.select(null); 
		},
		
		render: function(){
			return this;
		}
	});
		
		
	/** BundleItem */
	var BundleItem = Item.extend({
		defaults: { name: "", description: "", completed: 0 }
	});
	/** BundleList */
	var BundleList = ItemList.extend({
	 	model: BundleItem,
//	 	comparator: "completed",
	 	url: "/json/bundles/"
	});
	
	/** KeywordItem */
	var KeywordItem = Item.extend({
		defaults: { name: "", type: "" }
	});
	/** KeywordList */
	var KeywordList = ItemList.extend({
		model: KeywordItem
	});
	
	var bundleList = new BundleList;
	bundleList.reset(bootstrap["all-bundles"]);
	
	var keywordList = new KeywordList;
	keywordList.reset(bootstrap["all-keywords"]);
	
	/** bundleListView */
	var bundleListView = new ItemListView({
		el: "#bundles",
		collection: bundleList,
		associations: keywordList,
		key: "bundles"
	});
	
	/** keywordListView */
	var keywordListView = new ItemListView({
		el: "#keywords",
		collection: keywordList,
		associations: bundleList,
		key: "_resolvedDomIds"
	});
	
	/**
	 * BundlePagerView
	 */
	var BundlePagerView = Backbone.View.extend({
		el: "#bd-nav",
		
		current: null,
		following: null,
		preceding: null,
		
		events: {
			"click #preceding-bundle": 	"selectPrecedingBundle",
			"click #following-bundle":	"selectFollowingBundle",
			"click #close-bundle":		"closeBundle"
		},
				
		initialize: function() {
			this.template = _.template(this.$(".template").html());
			this.collection.on('collection:select', this.onSelectionChange, this);
		},
		
		onSelectionChange: function(newItem, oldItem) {
			if (newItem) {
				this.current = this.collection.selected;
				this.preceding = this.collection.precedingOrLast(this.current);
				this.following = this.collection.followingOrFirst(this.current);
			} else {
				this.current = this.preceding = this.following = null;
			}
			this.render();
		},
		
		selectPrecedingBundle: function() {
			this.collection.select(this.preceding);
		},
		
		selectFollowingBundle: function() {
			this.collection.select(this.following);
		},
		
		closeBundle: function() {
			if (this.current) this.collection.select(null);
		},
		
		render: function() {
			if (this.current) {
				var values = {};
				values["preceding"] = this.preceding.get("name");
				values["following"] = this.following.get("name");
				this.$el.html(this.template(values));
			} else {
				this.$el.empty();
			}
			return this;
		}
	});
	var bundlePagerView = new BundlePagerView({collection:bundleList});
	
	/**
	 * BundleDetailView
	 */
	var BundleDetailView = Backbone.View.extend({
	
		el: "#bd-detail",
		
		initialize: function() {
			this.template = _.template(this.$(".template").html());
			this.collection.on('collection:select', this.onSelectionChange, this);
		},
		
		onSelectionChange: function(newItem, oldItem) {
			if (newItem && !newItem.has("images")) {
				newItem.once("change", this.onModelUpdate, this);
				newItem.fetch({
					success: function() { console.log("bundle fetch success") },
					error: function() { console.log("bundle fetch error"); }
				});
			} else {
				this.render();
			}
		},
		
		onModelUpdate: function() {
			this.render();
		},
		
		render: function() {
			var item = this.collection.selected;
			if (item) {
				this.$el.html(this.template(item.attributes));
			} else {
				this.$el.empty();
			}
			return this;
		},
		
		renderToDOM: function() {
			var attrs = this.collection.selected
				? this.collection.selected.attributes
				: this.collection.model.defaults;
			this.$(".bd-title").html(attrs["name"]);
			this.$(".pubDate").html(attrs["completed"]);
			this.$(".description").html(attrs["description"]);
		}
	});
	var bundleDetailView = new BundleDetailView({collection:bundleList});
	
	/**
	 * AppView
	 */
	var AppView = Backbone.View.extend({
	
		el: "#container",
		
		/** Setup listening to model changes */
		initialize: function() {
		},
		
		render: function() {
			return this;
		}
	});
	var App = new AppView({model:bundleList});
	
});
