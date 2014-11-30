/*global module*/
module.exports = function (grunt) {
	"use strict";

	// grunt.initConfig({});
	grunt.config("pkg", grunt.file.readJSON("package.json"));

	/* Sass: Compass (requires compass gem) */
	grunt.loadNpmTasks("grunt-contrib-compass");
	grunt.config("compass.options", {
		sassDir: "src/sass",
		cssDir: "css",
		imagesDir: "images",
		fontsDir: "fonts",
		javascriptsDir: "js",
		httpPath: "/workspace/assets",
	});
	grunt.config("compass.client.options", {
		specify: "src/sass/folio.scss",
		sourcemap: true,
		outputStyle: "compressed",
	});

	/* CSS prefixes (-moz-, -webkit-, etc.) */
	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.config("autoprefixer.client", {
		options: {
			map: true //{ inline: false }
		},
		files: {
			"css/folio.css": "css/folio.css"
		}
	});
	// grunt.config("autoprefixer.flash.files",
	// 	{ "css/flash.css": "css/flash.css"});

	/* --------------------------------
	 * Javascript
	 * -------------------------------- */

	/* JSHint */
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.config("jshint", {
		options: {
			jshintrc: "./.jshintrc"
		},
		files: [
			"./src/js/app/**/*.js"
		]
	});

	/*
	 * browserify
	 */
	grunt.loadNpmTasks("grunt-browserify");
	grunt.config("browserify", {
		"vendor": {
			dest: "./js/vendor.js",
			src: [],
			options: {
				browserifyOptions: {
					debug: true
				},
			},
		},
		"client": {
			dest: "./js/folio.js",
			src: [
				"./src/js/app/App.js"
			],
			options: {
				browserifyOptions: {
					baseDir: "src/js/",
					fullPaths: false,
					debug: true
				},
				transform: [
					"node-underscorify"
				]
			}
		}
	});

	var vendorRequires = [
		"jquery",
		"underscore",
		"backbone",
		"hammerjs",
		"jquery-hammerjs",
		"jquery.transit",
		"backbone.babysitter",
		"backbone.select",
		"backbone.cycle",
	];
	grunt.config("browserify.vendor.options.require", vendorRequires);
	grunt.config("browserify.vendor.options.alias", [
		"./bower_components/jquery-color/jquery.color.js:jquery-color"
	]);
	grunt.config("browserify.vendor.options.shim", {
		"jquery-color": {
			// path: "./bower_components/jquery-color/jquery.color.js",
			exports: "jquery-color",
			depends: {
				jquery: "$"
			}
		},
	});

	/** browserify:client */
	grunt.config("browserify.client.options.external", vendorRequires.concat([
		"jquery-color",
	])); // Vendor requires as externals

	/** browserify:watchable */
	grunt.config("browserify.watchable", grunt.config("browserify.client")); // Duplicate browserify.client task for watch
	grunt.config("browserify.watchable.options.watch", true);

	/* Add bower deps to browserify */
	// grunt.loadNpmTasks("grunt-browserify-bower");
	// grunt.config("browserifyBower.vendor", {
	// 	options: {
	// 		file: "./js/vendor-bower.js",
	// 		forceResolve: {
	// 			"backbone.picky": "lib/backbone.picky.js",
	// 			"jquery-color": "jquery.color.js"
	// 		}
	// 	}
	// });

	/* Extract source maps from browserify */
	grunt.loadNpmTasks("grunt-exorcise");
	grunt.config("exorcise", {
		options: {
			root: "/workspace/assets/"
		},
		"vendor": {
			files: {
				"js/vendor.js.map": ["js/vendor.js"]
			}
		},
		"client": {
			files: {
				"js/folio.js.map": ["js/folio.js"]
			}
		},
	});

	/* Uglify */
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.config("uglify", {
		options: {
			mangle: false,
			sourceMap: true,
		},
		"vendor": {
			options: {
				mangle: true,
				sourceMapIn: "js/vendor.js.map"
			},
			files: {
				"js/vendor.min.js": ["js/vendor.js"]
			}
		},
		"client": {
			options: {
				sourceMapIn: "js/folio.js.map"
			},
			files: {
				"js/folio.min.js": ["js/folio.js"]
			}
		},
	});

	/* Watch tasks */
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.config("watch", {
		options: {
			spawn: false
		},
		"reload-config": {
			files: ["gruntfile.js"],
		},
//		"lint-scripts": {
//			tasks: ["jshint"],
//			files: ["src/js/**/*.js"],
//		},
		"build-scripts": {
			tasks: ["exorcise:client"],
			files: ["js/folio.js"],
		},
		"build-styles": {
			tasks: ["compass:client", "autoprefixer:client"],
			files: ["src/sass/**/*.scss"],
		}
	});

	// DEBUG: check config result
	// grunt.file.write("./.build/grunt-config.json", JSON.stringify(grunt.config.get()));

	// Other
	//	grunt.registerTask("buildVendor", 	["browserifyBower:vendor", "browserify:vendor", "exorcise:vendor", "uglify:vendor"]);
	grunt.registerTask("buildVendor", ["browserify:vendor", "exorcise:vendor", "uglify:vendor"]);
	// Simple build
	grunt.registerTask("buildStyles", ["compass:client", "autoprefixer:client"]);
	grunt.registerTask("buildClient", ["browserify:client", "exorcise:client", "uglify:client"]);
	grunt.registerTask("buildScripts", ["buildVendor", "buildClient"]);//"jshint", 
	grunt.registerTask("build", ["buildStyles", "buildScripts"]);
	// Watch build
	grunt.registerTask("watchAll", ["browserify:watchable", "watch"]);
//	grunt.registerTask("watchEditor", ["browserify:watchable", "watch:build-scripts", "watch:build-styles", ]);
	grunt.registerTask("sublimeBuild", ["watchAll"]);
	grunt.registerTask("watchEditor", ["watchAll"]);
	// Default task
	grunt.registerTask("default", ["build"]);


};