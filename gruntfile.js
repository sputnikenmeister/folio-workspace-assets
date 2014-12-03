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
	grunt.config("browserify.vendor",  {
		dest: "./js/folio-vendor.js",
		src: [],
		options: {
			browserifyOptions: {
				debug: true
			},
			require: [
				"jquery", "hammerjs", "jquery-hammerjs", "jquery.transit",
				"underscore","backbone", "backbone.babysitter"
			],
			alias: [
				"./bower_components/jquery-color/jquery.color.js:jquery-color"
			],
			shim: {
				"jquery-color": {
					// path: "./bower_components/jquery-color/jquery.color.js",
					exports: "jquery-color",
					depends: {
						jquery: "$"
					}
				},
			}
		},
	});
	/** browserify:client */
	grunt.config("browserify.client",  {
		dest: "./js/folio-client.js",
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
			],
			external: ["jquery-color"].concat(grunt.config("browserify.vendor.options.require"))
		}
	});

//	var vendorRequires =;
//	grunt.config("browserify.vendor.options.require", vendorRequires);
//	grunt.config("browserify.vendor.options.alias", );
//	grunt.config("browserify.vendor.options.shim", );
//	grunt.config("browserify.client.options.external", vendorRequires.concat([
//		"jquery-color",
//	])); // Vendor requires as externals

	/** browserify:watchable */
	grunt.config("browserify.watchable", grunt.config("browserify.client")); // Duplicate browserify.client task for watch
	grunt.config("browserify.watchable.options.watch", true);


	/** browserify:dist */
	grunt.config("browserify.dist", {
		dest: "./js/folio.js",
		src: [
			"./src/js/app/App.js"
		],
		options: {
			browserifyOptions: {
				fullPaths: false,
				debug: true
			},
			transform: [
				"node-underscorify"
			],
			alias: [
				"./bower_components/jquery-color/jquery.color.js:jquery-color"
			],
			shim: {
				"jquery-color": {
					// path: "./bower_components/jquery-color/jquery.color.js",
					exports: "jquery-color",
					depends: {
						jquery: "$"
					}
				},
			}
		}
	});


	/* Extract source maps from browserify */
	grunt.loadNpmTasks("grunt-exorcise");
	grunt.config("exorcise", {
		options: {
			root: "/workspace/assets/"
		},
		vendor: {
			files: {
				"js/folio-vendor.js.map": ["js/folio-vendor.js"]
			}
		},
		client: {
			files: {
				"js/folio-client.js.map": ["js/folio-client.js"]
			}
		},
		dist: {
			files: {
				"js/folio.js.map": ["js/folio.js"]
			}
		},
	});

	/* Uglify */
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.config("uglify", {
		options: {
			sourceMap: true,
		},
		vendor: {
			options: {
				mangle: true,
				sourceMapIn: "js/folio-vendor.js.map"
			},
			files: {
				"js/folio-vendor.min.js": ["js/folio-vendor.js"]
			}
		},
		client: {
			options: {
				mangle: false,
				sourceMapIn: "js/folio-client.js.map",
				compress: {
					global_defs: {
    					DEBUG: true
					}
				}
			},
			files: {
				"js/folio-client.min.js": ["js/folio-client.js"]
			}
		},
		dist: {
			options: {
				mangle: true,
//				beautify: true,
				sourceMapIn: "js/folio.js.map",
				compress: {
					global_defs: {
    					"DEBUG": false
					},
					dead_code: true,
        			drop_console: true
				}
			},
			files: {
				"js/folio.js": ["js/folio.js"]
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
			files: ["js/folio-client.js"],
		},
		"build-styles": {
			tasks: ["compass:client", "autoprefixer:client"],
			files: ["src/sass/**/*.scss"],
		}
	});

	// DEBUG: check config result
	// grunt.file.write("./.build/grunt-config.json", JSON.stringify(grunt.config.get()));
	grunt.registerTask("distScripts", ["browserify:dist", "exorcise:dist", "uglify:dist"]);

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
//	grunt.registerTask("sublimeBuild", ["watchAll"]);
	grunt.registerTask("watchInEditor", ["watchAll"]);
	// Default task
	grunt.registerTask("default", ["build"]);


};
