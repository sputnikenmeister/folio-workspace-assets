/**
* @module app/app/helper/DeferredRenderView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/helper/DeferredRenderer} */
var DeferredRenderer = require( "./DeferredRenderer" );

/**
 * @constructor
 * @type {module:app/helper/DeferredRenderView}
 */
module.exports  = Backbone.View.extend(DeferredRenderer.prototype);
