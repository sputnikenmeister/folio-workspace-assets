/**
* jscs standard:Jquery
* @module App
*/

/** @type {module:jquery} */
var $ = require( "jquery" );

/** @type {module:underscore} */
var _ = require( "underscore" );

_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/view/AppView} */
var AppView = require( "./view/AppView" );

//$(function(){
$(document).ready(function($) {
	var bootstrap = window.bootstrap || {
		"all-bundles": [],
		"all-keywords": [],
		"all-types": []
	};
	delete window.bootstrap;
	
	/* Fill-in back references: Bundle.keywords -> Keyword.bundles) */
	_.each(bootstrap["all-keywords"], function(ko, ki, ka) {
		ko.bundles = [];
		_.each(bootstrap["all-bundles"], function(bi, bo, ba) {
			if (_.contains(bi.keywords, ko.id)) {
				ko.bundles.push(bi.id);
			}
		});
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
	delete kIndex;
	
	// Start Backbone history a necessary step for bookmarkable URL's
	Backbone.history.start();
	
	window.app = new AppView({bootstrap: bootstrap});
});
