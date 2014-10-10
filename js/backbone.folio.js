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
	});
		
	/// TODO: Implement GroupingCollectionView
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
	
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};
	
	/**
	 * Item
	 */
//	var Item = Backbone.Model.extend({
//		/** @override */
//	});
	
	/**
	 * ItemList
	 */
	var ItemList = Backbone.Collection.extend({
	
//		model: Item,
		selected: null,
		
		select: function(newItem) {
			if (this.selected === newItem) {
				return;
			}
			oldItem = this.selected;
			this.selected = newItem;
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
		
	/* ~~~~~~ MODELS ~~~~~~ */
	
	/** KeywordItem */
	var KeywordItem = Backbone.Model.extend({
		defaults: {
			name: "",
			handle: "",
			type: "",
			attributes: []
		},
		toString: function() {
			return this.attributes["name"];
		}
	});
	
	/** TypeItem */
	var TypeItem = Backbone.Model.extend({
		defaults: {
			name: "",
			handle: "",
			attributes: []
		},
		toString: function() {
			return this.attributes["name"];
		}
	});
	/** BundleItem */
	var BundleItem = Backbone.Model.extend({
		defaults: {
			name: "",
			handle: "",
			description: "",
			completed: 0,
			attributes: []
			// images
		},
		url: function() {
			return Backbone.Model.prototype.url.apply(this, arguments) + "/";
		},
		toString: function() {
			return this.attributes["name"];
		}
	});
	
	/** ImageItem */
	var ImageItem = Backbone.Model.extend({
		defaults: {
			url: null,
			width: NaN,
			height: NaN,
			description: null,
			attributes: []
		},
		toString: function() {
			return this.attributes["description"];
		}
		
	});
	
	/* ~~~~~~ COLLECTIONS ~~~~~~ */
	
	/** TypeList */
	var TypeList = Backbone.Collection.extend({
	 	model: TypeItem
	});
	/** BundleList */
	var BundleList = ItemList.extend({
	 	model: BundleItem,
	 	url: "/json/bundles/"
	});
	/** KeywordList */
	var KeywordList = ItemList.extend({
		model: KeywordItem
	});
	/** ImageList */
	var ImageList = ItemList.extend({
	 	model: ImageItem
	});
	
	/* ~~~~~~ VIEWS ~~~~~~ */
	
	/**
	 * ItemView
	 */
	var ItemView = Backbone.View.extend({
	
		events: {
			"click ": "onClick",
		},
		
		onClick: function (event) {
			if (!event.isDefaultPrevented()) {
				event.preventDefault();
			}
			this.trigger("item:click", this.model);
		},
		
		_selected: null,
		selected: function (value) {
			if (arguments.length == 1 && this._selected !== value)
			{
				this._selected = value;
				if (this._selected) {
					this.$el.addClass("selected");
				} else {
					this.$el.removeClass("selected");
				}
			}
			return this._selected;
		},
		
		_highlight: null,
		highlight: function (value) {
			if (arguments.length == 1 && this._highlighted !== value)
			{
				this._highlighted = value;
				if (this._highlighted) {
					this.$el.addClass("highlight");
				} else {
					this.$el.removeClass("highlight");
				}
			}
			return this._highlighted;
		},
	});
	
	/**
	 * ItemListView
	 */
	var ItemListView = Backbone.View.extend({
	
		initialize: function(options) {
			this.associations = options["associations"];
			this.key = options["key"];
			
			this._views = [];
			this._viewIndex = {};
			
			this.collection.each(this.assignItemView, this);
			
			this._els = this.$(".item, .group");
			
			this.collection.on('collection:select', this.whenModelSelect, this);
			if (this.associations && this.key) {
				this.associations.on('collection:select', this.whenAssocSelect, this);
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
					if (_.contains(refIds, o.id))
						jqo.addClass("highlight");
					else
						jqo.removeClass("highlight");
				});
				if (!oldItem) {
					this.$el.addClass("has-highlight");
				}
			} else {
				$(this._els).removeClass("highlight");
				this.$el.removeClass("has-highlight");
			}
//			this.render();
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
//				this.render();
			}
			return this._collapsed;
		},
		
		render: function(){
			return this;
		}
	});
	
	/**
	 * CollectionPagerView
	 */
	var CollectionPagerView = Backbone.View.extend({
	
		template: _.template($("#pager-nav_tmpl").html()),
		
		current: null,
		following: null,
		preceding: null,
		
		events: {
			"click .preceding-button": 	"onPrecedingClick",
			"click .following-button":	"onFollowingClick",
			"click .close-button":		"onCloseClick"
		},
		
		initialize: function(options) {
//			if (options["labelFunction"])
//				this.labelFunction = options["labelFunction"];
			if (options["labelAttribute"])
				this.labelAttribute = options["labelAttribute"];
			
			this.collection.on('collection:select', this.whenCollectionSelect, this);
		},
		
		whenCollectionSelect: function(newItem, oldItem) {
			if (newItem) {
				this.current = this.collection.selected;
				this.preceding = this.collection.precedingOrLast(this.current);
				this.following = this.collection.followingOrFirst(this.current);
			} else {
				this.current = this.preceding = this.following = null;
			}
			this.render();
		},
		
		onPrecedingClick: function (event) {
			if (!event.isDefaultPrevented()) {
				event.preventDefault();
			}
			this.collection.select(this.preceding);
		},
		
		onFollowingClick: function(event) {
			if (!event.isDefaultPrevented()) {
				event.preventDefault();
			}
			this.collection.select(this.following);
		},
		
		onCloseClick: function(event) {
			if (!event.isDefaultPrevented()) {
				event.preventDefault();
			}
			if (this.current) {
				this.collection.select(null);
			}
		},
		
//		labelAttribute: "name",
		
		getItemLabel: function(item) {
			if (!this.labelAttibute)
				return item.toString();
			return item.get(this.labelAttribute);
		},
		
		render: function() {
			if (this.current) {
				var values = {
					"preceding_label": this.getItemLabel(this.preceding),
					"preceding_href": "#",//this.preceding.get("handle"),
					"following_label": this.getItemLabel(this.following),
					"following_href": "#",//this.following.get("handle"),
					"close_label": 'Close',
					"close_href": "#",//this.following.get("handle"),
				};
				this.$el.html(this.template(values));
			} else {
				this.$el.empty();
			}
			return this;
		}
	});
	
	/**
	 * BundleDetailView
	 */
	var BundleDetailView = Backbone.View.extend({
	
		el: "#bd-detail",
		template: _.template($("#bd-detail_tmpl").html()),
	
		initialize: function(options) {
			this.collection.on('collection:select', this.whenBundleSelect, this);
		},
		
		whenBundleSelect: function(newItem, oldItem) {
			if (newItem && !newItem.has("images")) {
				newItem.once("change", this.onFetchSuccess, this);
			} else {
				this.render();
			}
		},
		
		onFetchSuccess: function() {
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
	});
	
	/**
	 * ImageItemView
	 */
	var ImageItemView = Backbone.View.extend({
		
		model: ImageItem,
		className: "bd-images-item",
		template: _.template($("#bd-images-item_tmpl").html()),
		
		_recipe: { prefix: "/1/700/0", constraint: 700, }, // resize to 700
//		_recipe: { prefix: "/w480", constraint: 480, }, // named recipe
		
//		initialize: function(options) {
//		},
		
		render: function() {
			var values = {
				url: this._recipe.prefix + this.model.get("url"),
				description: this.model.get("description"),
				width: this._recipe.constraint,
				height: Math.floor((this._recipe.constraint / this.model.get("width")) * this.model.get("height")),
			};
			this.$el.html(this.template(values));
			return this;
		},
	});
	
	/**
	 * ImageListView
	 */
	var ImageListView = Backbone.View.extend({
	
		tagName: "ul",
		className: "bd-images",
		
		initialize: function(options) {
			this.images = new ImageList;
			this.collection.on('collection:select', this.whenBundleSelect, this);
			this.collection.on('error', this.whenFetchError, this);
		},
		
		whenBundleSelect: function(newItem, oldItem) {
			if (newItem && !newItem.has("images")) {
				newItem.once("change:images", this.whenFetchSuccess, this);
				newItem.fetch();
			} else {
				this.render();
			}
		},
		
		whenFetchSuccess: function() {
			this.render();
		},
		
		whenFetchError: function(model, resp, opts) {
			// TODO: something more useful here
			console.log("bundle fetch error");
		},
		
		render: function() {
			var item = this.collection.selected;
			if (item) {
				this.images.reset(item.get("images"));
				this.$el.empty();
				
				if (this.images.length) {
					var view = new ImageItemView({model : this.images.first()});
					this.$el.append(view.render().el);
				}
			} else {
				this.$el.empty();
				this.images.reset();
			}
			return this;
		},
	});
	
	/**
	 * AppView
	 */
	var AppView = Backbone.View.extend({
	
		el: "#container",
		
		/** Setup listening to model changes */
		initialize: function(options) {
			this.bundleList = new BundleList;
			this.bundleList.reset(options["bootstrap"]["all-bundles"]);
			
			this.keywordList = new KeywordList;
			this.keywordList.reset(options["bootstrap"]["all-keywords"]);
			
			this.typeList = new TypeList;
			this.typeList.reset(options["bootstrap"]["all-types"]);
			
			this.bundleListView = new ItemListView({
				el: "#bundles",
				collection: this.bundleList,
				associations: this.keywordList,
				key: "bundles"
			});
			this.keywordListView = new ItemListView({
				el: "#keywords",
				collection: this.keywordList,
				associations: this.bundleList,
				key: "_resolvedDomIds"
			});
			
			this.bundleDetailView = new BundleDetailView({
				collection:this.bundleList
			});
			this.bundlePagerView = new CollectionPagerView({
				el: "#bd-nav",
				collection:this.bundleList
			});
//			this.$("#navigation").append(this.bundlePagerView.render().el);
			
			this.imageListView = new ImageListView({
				id: "bd-images",
				collection:this.bundleList
			});
			this.$("#main").append(this.imageListView.render().el);
			
			this.bundleList.on("collection:select", this.whenBundleSelect, this);
			this.keywordList.on("collection:select", this.whenKeywordSelect, this);
		},
		
		whenBundleSelect: function(newItem, oldItem) {
			if (newItem) {
				this.keywordList.select(null);
				this.keywordListView.collapsed(true);
				this.bundleListView.collapsed(true);
			} else {
				this.keywordListView.collapsed(false);
				this.bundleListView.collapsed(false);
			}
		},
		
		whenKeywordSelect: function(newItem, oldItem) {
			if (newItem) {
				this.keywordListView.collapsed(false)
				this.bundleListView.collapsed(false);
			} else {
//				this.keywordListView.collapsed(true);
			}
		},
		
		render: function() {
			return this;
		}
	});
	var App = new AppView({bootstrap: bootstrap});
	
	// Start Backbone history a necessary step for bookmarkable URL's
	Backbone.history.start();
	
});
