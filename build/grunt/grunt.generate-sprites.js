/*global module*/
module.exports = function (grunt) {
	"use strict";
	
	/* --------------------------------
	 * Resources
	 * -------------------------------- */
	
	// TODO: get all this resources stuff out of here
	
	/* generate-sprites
	 * - - - - - - - - - - - - - - - - - */
	var previewSize = "10%";
	grunt.loadNpmTasks("grunt-responsive-images");
	grunt.config("responsive_images.bundle-sprites", {
		options: {
			sizes: [{
				width: previewSize,
			}]
		},
		files: [{
			expand: true,
			src: ["../uploads/*.{jpg,gif,png}"],
			custom_dest: "build/bundle-sprites/{%= width %}/"
		}]
	});
	
	grunt.loadNpmTasks("grunt-spritesmith");
	grunt.config("sprite.bundle-sprites", {
		algorithm: "binary-tree",
		engine: "gmsmith",
		imgOpts: {quality: 50},
		src: "build/bundle-sprites/"+previewSize+"/*.{jpg,gif,png}",
		dest: "images/bundle-sprites.png",
		destCss: "src/sass/generated/_bundle-sprites-generated.scss"
	});
	
	grunt.registerTask("generate-sprites",
		["responsive_images:bundle-sprites", "sprite:bundle-sprites"]);
	
};
