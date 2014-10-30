/**
* @module app/App
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

// /** @type {module:app/model} */
// var model = require("./control/AppModel");

/** @type {module:app/model/collection/BundleList} */
var bundleList = require( "./model/collection/BundleList" );
/** @type {module:app/model/collection/KeywordList} */
var keywordList = require( "./model/collection/KeywordList" );
/** @type {module:app/model/collection/TypeList} */
var typeList = require( "./model/collection/TypeList" );

/** @type {module:app/view/AppView} */
var AppView = require( "./view/AppView" );

//$(function(){
$(document).ready(function($) {
	"use strict";
	var keywords, bundles, types, images, params;

	if (window.bootstrap) {
		types = window.bootstrap["all-types"],
		keywords = window.bootstrap["all-keywords"],
		bundles = window.bootstrap["all-bundles"],
		images = window.bootstrap["all-images"],
		params = window.bootstrap["params"];

		// Fill-in back references:
		// Create Keyword.bundleIds from existing Bundle.keywordIds,
		// then Bundle.typeIds from unique Keyword.typeId
		_.each(keywords, function(ko, ki, ka) {
			ko.bIds = [];
			_.each(bundles, function(bo, bi, ba) {
				if (ki === 0) bo.tIds = [];
				if (_.contains(bo.kIds, ko.id)) {
					ko.bIds.push(bo.id);
					if (!_.contains(bo.tIds, ko.tId)) {
						bo.tIds.push(ko.tId);
					}
				}
			});
		});

		keywordList.reset(keywords);
		bundleList.reset(bundles);
		typeList.reset(types);

		/* jshint -W051 */
		delete window.bootstrap;
		/* jshint +W051 */
	}

	window.app = new AppView();//{keywords: keywords, bundles: bundles, types: types});
});
