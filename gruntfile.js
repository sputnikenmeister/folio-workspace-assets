/*global module*/
module.exports = function (grunt) {
	"use strict";

	grunt.config("pkg", grunt.file.readJSON("package.json"));
	
	grunt.config("paths", {
		src: {
			sass:		"./src/sass",
			resources:	"./src/resources",
			fonts:		"./src/resources/fonts",
		},
		dest: {
			fonts:		"./fonts",
			css:		"./fonts",
			js:			"./fonts",
		},
		fontello: "fonts/fontello-27278fbd"
	});
	
	grunt.config("DEBUG_CLIENT_JS", "folio-debug-client");
	grunt.config("DEBUG_VENDOR_JS", "folio-debug-vendor");
	grunt.config("DEBUG_STYLES", "folio-debug");
	grunt.config("DIST_JS", "folio");
	grunt.config("DIST_STYLES", "folio");

	/* ---------------------------------
	 * Style Sheets
	 * --------------------------------- */
	// NOTE: `gem install compass sass-json-vars`

	/* Task defaults
	 * - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks("grunt-contrib-compass");
	grunt.config("compass.options", {
		require: [
			"sass-json-vars",
			// "./build/compass-encode.rb",
		],
		sassDir: "src/sass",
		cssDir: "css",
		imagesDir: "images",
		fontsDir: "fonts",
		javascriptsDir: "js",
		relativeAssets: true,
		//httpPath: "/workspace/assets",
	});
	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.config("autoprefixer.options", {
		map: true, //{ inline: false },
		//browsers: [ "ie > 8", "> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1"]
	});

	/* Targets
	 * - - - - - - - - - - - - - - - - - */
	grunt.config("compass.clean.options", {
		clean: true
	});
	grunt.config("compass.debug.options", {
		specify: "src/sass/<%= DEBUG_STYLES %>.scss",
		sourcemap: true,
	});
	grunt.config("autoprefixer.debug.files", {
		"css/<%= DEBUG_STYLES %>.css": "css/<%= DEBUG_STYLES %>.css"
	});

	/* Discrete fonts SASS stylesheet
	 * - - - - - - - - - - - - - - - - - */
	grunt.config("compass.fonts.options", {
		specify: "src/sass/fonts.scss",
		sourcemap: false,
		outputStyle: "compressed"
	});

	/* --------------------------------
	 * Javascript
	 * -------------------------------- */

	/* browserify */
	grunt.loadNpmTasks("grunt-browserify");
	grunt.config("browserify.options", {
		browserifyOptions: {
			fullPaths: false,
			debug: true
		},
	});
	
	/* browserify:vendor */
	grunt.config("browserify.vendor", {
		dest: "./js/<%= DEBUG_VENDOR_JS %>.js",
		src: [],
		options: {
			require: [
				"underscore",
				// "underscore.string",
				"backbone",
				"backbone.native",
				"Backbone.Mutators",
				"backbone.babysitter",
				"hammerjs",
				"color",
				"es6-promise",
				"classlist-polyfill",
				"cookies-js",
				// "handlebars",
			],
			alias: [
				"./build/modernizr-dist.js:Modernizr",
				"./src/js/shims/fullscreen.js:fullscreen-polyfill",
				"./src/js/shims/matchesSelector.js:matches-polyfill",
				"./src/js/shims/requestAnimationFrame.js:raf-polyfill",
			]
		},
	});
	
	// var remapify = require("remapify");
	
	/* browserify:client */
	grunt.config("browserify.client", {
		dest: "./js/<%= DEBUG_CLIENT_JS %>.js",
		src: [
			"./src/js/app/App.js",
			// "./src/js/app/**/*.js",
		],
		options: {
			// browserifyOptions: {
			// 	extensions: [".js", ".hbs", ".json"],
			// 	fullPaths: true,
			// 	debug: true
			// },
			transform: [
				["hbsfy", { 
					extensions: ["hbs"]
				}],
				// ["node-underscorify", { extensions: ["tpl"] }],
				// "decomponentify",
			],
			plugin: [
				["remapify", [
					{
						src: "./**/*.js",
						expose: "app",
						cwd: "./src/js/app",
					},
					{
						// src: "**/*.js",
						src: "./**/*.js",
						expose: "utils",
						cwd: "./src/js/utils",
					},
				]]
			],
			// preBundleCB: function (b) {
			// 	b.plugin(remapify, [{
			// 		src: "**/*.js",
			// 		expose: "",
			// 		cwd: "./src/js",
			// 	}]);
			// }
		}
	});
	/* NOTE: Add requires and aliased requires from vendor as externals in client */
	grunt.config("browserify.client.options.external", (function() {
		// return grunt.config("browserify.vendor.options.require").concat(
		// 	grunt.config("browserify.vendor.options.alias").map(function(s) {
		// 		return s.split(":").pop();
		// 	}));
		// aliases first
		return grunt.config("browserify.vendor.options.alias").map(function(s) {
			return s.split(":").pop();
		}).concat(grunt.config("browserify.vendor.options.require"));
		
	}()));
	// grunt.log.verbose.subhead("Vendor Externals");
	// grunt.log.verbose.writeln(grunt.config("browserify.client.options.external").join(", "));
	
	/* browserify:watchable */
	// Duplicate browserify.client task for watch
	// grunt.config("browserify.watchable", grunt.config("browserify.client"));
	// grunt.config("browserify.watchable.options.watch", true);
	
	grunt.config("browserify.watch-vendor", grunt.config("browserify.vendor"));
	grunt.config("browserify.watch-vendor.options.watch", true);
	grunt.config("browserify.watch-client", grunt.config("browserify.client"));
	grunt.config("browserify.watch-client.options.watch", true);

	/* Extract source maps from browserify */
	grunt.loadNpmTasks("grunt-exorcise");
	grunt.config("exorcise", {
		options: {
			strict: false,
			root: "../",
			// root: "/workspace/assets/"
		},
		vendor: {
			files: {
				"./js/<%= DEBUG_VENDOR_JS %>.js.map": ["./js/<%= DEBUG_VENDOR_JS %>.js"]
			}
		},
		client: {
			files: {
				"./js/<%= DEBUG_CLIENT_JS %>.js.map": ["./js/<%= DEBUG_CLIENT_JS %>.js"]
			}
		},
	});

	/* Uglify */
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.config("uglify", {
		options: {},
		vendor: {
			options: {
				mangle: false,
				beautify: true,
				sourceMap: true,
				sourceMapIn: "./js/<%= DEBUG_VENDOR_JS %>.js.map",
				sourceMapIncludeSources: false,
			},
			files: {
				"./js/<%= DEBUG_VENDOR_JS %>.js": ["./js/<%= DEBUG_VENDOR_JS %>.js"]
			}
		},
		client: {
			options: {
				mangle: false,
				beautify: true,
				sourceMap: true,
				sourceMapIn: "./js/<%= DEBUG_CLIENT_JS %>.js.map",
				sourceMapIncludeSources: false,
				compress: {
					global_defs: {
						DEBUG: true
					}
				}
			},
			files: {
				"./js/<%= DEBUG_CLIENT_JS %>.js": ["./js/<%= DEBUG_CLIENT_JS %>.js"]
			}
		},
	});

	/* --------------------------------
	 * clean
	 * -------------------------------- */

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.config("clean", {
		src: ["./js/*", "./css/*"]
	});


	/* --------------------------------
	 * watch
	 * -------------------------------- */

	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.config("watch", {
		options: {
			spawn: false
		},
		"build-styles": {
			tasks: ["compass:debug", "autoprefixer:debug"],
			files: ["src/sass/**/*.scss", "src/sass/**/*.json"],
		},
		"process-vendor": {
			tasks: ["exorcise:vendor"],
			files: ["js/<%= DEBUG_VENDOR_JS %>.js"],
		},
		"process-client": {
			tasks: ["exorcise:client"],
			files: ["js/<%= DEBUG_CLIENT_JS %>.js"],
		},
		"reload-config": {
			options: {
				spawn: true
			},
			files: ["gruntfile.js", "package.json"],
			tasks: ["build-clean-all"]
			// tasks: ["compass:debug", "autoprefixer:debug", "browserify:vendor", "browserify:client"],
		}
	});
	grunt.registerTask("build-watch", ["browserify:watch-client", "browserify:watch-vendor", "watch"]);
	// grunt.registerTask("build-watch", ["browserify:watchable", "watch"]);
	
	// grunt.config("watch.build-styles-svg", {
	// 	tasks: ["compass:clean", "compass:client", "autoprefixer:client"],
	// 	files: ["images/**/*.svg"] });


	/* --------------------------------
	 * dist
	 * -------------------------------- */

	grunt.config("compass.dist.options", {
		specify: "src/sass/<%= DIST_STYLES %>.scss",
		sourcemap: false,
		outputStyle: "compressed"
	});

	grunt.config("autoprefixer.dist", {
		options: {
			map: false
		},
		files: {
			"css/<%= DIST_STYLES %>.css": "css/<%= DIST_STYLES %>.css"
		}
	});
	
	grunt.config("browserify.dist", {
		src: [
			"./src/js/app/App.js"
		],
		dest: "./js/<%= DIST_JS %>.js",
		options: {
			browserifyOptions: {
				fullPaths: false,
				debug: false
			},
			alias: grunt.config("browserify.vendor.options.alias"),
			require: grunt.config("browserify.vendor.options.require"),
			transform: grunt.config("browserify.client.options.transform"),
			plugin: grunt.config("browserify.client.options.plugin"),
		}
	});

	grunt.config("uglify.dist", {
		options: {
			mangle: true,
			sourceMap: false,
			compress: {
				global_defs: {
					"DEBUG": false
				},
				dead_code: true,
				drop_console: true
			}
		},
		files: {
			"js/<%= DIST_JS %>.js": ["./js/<%= DIST_JS %>.js"]
		}
	});

	/* --------------------------------
	 * Main Targets
	 * -------------------------------- */

	grunt.registerTask("build-debug", [
		"compass:debug", "autoprefixer:debug",
		"browserify:vendor", "exorcise:vendor",
		"browserify:client", "exorcise:client"
	]);
	grunt.registerTask("build-dist", [
		"compass:dist", "autoprefixer:dist",
		"browserify:dist", "uglify:dist"
	]);
	grunt.registerTask("clean-all", ["clean", "compass:clean", "compass:fonts"]);
	grunt.registerTask("build-all", ["build-debug", "build-dist"]);
	grunt.registerTask("build-clean-all", ["clean-all", "build-all"]);

	// Default task
	grunt.registerTask("default", ["build-debug"]);
	
	/* --------------------------------
	 * build-deps
	 * -------------------------------- */
	
	grunt.loadNpmTasks("grunt-modernizr");
	grunt.config("modernizr.dist", {
		// "cache": false,
		"crawl": false,
		"uglify": false,
		"devFile": "./build/modernizr-dev.js",
		"dest": "./build/modernizr-dist.js",
		
		// "class-prefix": "mod_",
		// "classprefix": "mod_",
		// "class_prefix": "mod_",
		
		"options": [
			// "atrule",
			// "domprefixes",
			"hasEvent",
			"mq",
			"prefixed",
			"prefixedCSS",
			"setClasses",
			// "html5shiv",
			// "testallprops",
			// "testprop",
			// "teststyles",
		],
		
		"tests": [
			"animation",
			"backgroundcliptext",
			"backgroundsize",
			"bgpositionshorthand",
			"bgpositionxy",
			"bgsizecover",
			"bloburls",
			"boxshadow",
			"boxsizing",
			"canvas",
			"canvastext",
			"classlist",
			"cookies",
			"cssanimations",
			"csscalc",
			"csspositionsticky",
			"csspseudoanimations",
			"csspseudotransitions",
			"csstransforms",
			"csstransitions",
			"devicemotion_deviceorientation",
			"display_runin",
			"documentfragment",
			"ellipsis",
			"fullscreen",
			"hashchange",
			"inlinesvg",
			"matchmedia",
			"objectfit",
			"pagevisibility",
			"promises",
			"queryselector",
			"requestanimationframe",
			"smil",
			"svg",
			"svgasimg",
			"userselect",
			"video",
			"videoautoplay",
			"videoloop",
			"videopreload",
			"willchange",
			"xhrresponsetype",
			"xhrresponsetypeblob",
		],
		"excludeTests": [],
		"customTests": [],
	});
};
