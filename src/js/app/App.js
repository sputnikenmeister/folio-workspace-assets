/**
* @module App
*/

/* global jQuery */

/** @type {module:jquery} */
var $ = require( "jquery" );

/** @type {module:underscore} */
var _ = require( "underscore" );
_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

/** @type {module:backbone} */
var Backbone = require( "backbone" );
Backbone.$ = $ || jQuery;

/** @type {module:app/view/AppView} */
var AppView = require( "./view/AppView" );

//$(function(){
$(document).ready(function($) {
//	var opts = {};
	var opts = { keywords: [], bundles: [], types: [], params:{} };

	if (window.bootstrap) {
		opts.keywords = window.bootstrap["all-keywords"],
		opts.bundles = window.bootstrap["all-bundles"],
		opts.types = window.bootstrap["all-types"],
		opts.params = window.bootstrap["params"];

		// Fill-in back references: Bundle.keywords -> Keyword.bundles)
		_.each(opts.keywords, function(ko, ki, ka) {
			ko.bundles = [];
			ko._domIds = [];
			_.each(opts.bundles, function(bo, bi, ba) {
				if (_.contains(bo.keywords, ko.id)) {
					ko.bundles.push(bo.id);
					ko._domIds.push(bo.handle);
				}
			});
		});

		// Add all related ids (keywords+types) to bundle prop _resolvedDomIds
		// TODO: Implement GroupingCollectionView
		var kIndex = _.indexBy(opts.keywords, "id");
		_.each(opts.bundles, function (bo, bi, ba) {
			bo._domIds = [];
			_.each(bo.keywords, function(ko, ki, ka) {
				var kItem = kIndex[ko];
				if (bo._domIds.indexOf(kItem.type) == -1) {
					bo._domIds.push(kItem.type);
				}
				bo._domIds.push(kItem.handle);
			});
		});
		/* jshint -W051 */
		delete kIndex;
		delete window.bootstrap;
		/* jshint +W051 */
	}

	window.app = new AppView(opts);
});
