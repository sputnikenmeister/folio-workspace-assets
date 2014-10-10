/**
* jscs standard:Jquery
* @module view/AppView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/BundleList} */
var BundleList = require( "../model/BundleList" );
/** @type {module:app/model/KeywordList} */
var KeywordList = require( "../model/KeywordList" );
/** @type {module:app/model/TypeList} */
var TypeList = require( "../model/TypeList" );

/** @type {module:app/view/ItemListView} */
var ItemListView = require( "./ItemListView" );
/** @type {module:app/view/BundleDetailView} */
var BundleDetailView = require( "./BundleDetailView" );
/** @type {module:app/view/CollectionPagerView} */
var CollectionPagerView = require( "./CollectionPagerView" );
/** @type {module:app/view/ImageListView} */
var ImageListView = require( "./ImageListView" );

/**
 * @constructor
 * @type {module:app/view/AppView
 */
module.exports = Backbone.View.extend({

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
//		this.$("#navigation").append(this.bundlePagerView.render().el);
		
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
			this.keywordListView.collapsed(false);
			this.bundleListView.collapsed(false);
		} 
//		else {
//			this.keywordListView.collapsed(true);
//		}
	},
	
//	render: function() {
//		return this;
//	}
});