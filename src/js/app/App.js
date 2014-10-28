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

/** @type {module:app/view/AppView} */
var AppView = require( "./view/AppView" );

//$(function(){
$(document).ready(function($) {
	// "use strict";
	var keywords, bundles, types, params;

	if (window.bootstrap) {
		keywords = window.bootstrap["all-keywords"],
		bundles = window.bootstrap["all-bundles"],
		types = window.bootstrap["all-types"],
		params = window.bootstrap["params"];

		// Fill-in back references:
		// Create Keyword.bundleIds from existing Bundle.keywordIds,
		// then Bundle.typeIds from unique Keyword.typeId
		_.each(keywords, function(ko, ki, ka) {
			ko.bundleIds = [];
			_.each(bundles, function(bo, bi, ba) {
				if (ki === 0) bo.typeIds = [];
				if (_.contains(bo.keywordIds, ko.id)) {
					ko.bundleIds.push(bo.id);
					if (bo.typeIds.indexOf(ko.typeId) == -1) {
						bo.typeIds.push(ko.typeId);
					}
				}
			});
		});

		// model.keywords().reset(keywords);
		// model.bundles().reset(bundles);
		// model.types().reset(types);

		/* jshint -W051 */
		delete window.bootstrap;
		/* jshint +W051 */
	}

	window.app = new AppView({keywords: keywords, bundles: bundles, types: types});
});
