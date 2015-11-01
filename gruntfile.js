/*global module*/
module.exports = function (grunt) {
	"use strict";

	grunt.config("pkg", grunt.file.readJSON("package.json"));
	
	grunt.config("paths", {
		src: {
			js:			"./src/js",
			sass:		"./src/sass",
			resources:	"./src/resources",
		},
		dest: {
			js:			"./js",
			css:		"./css",
			fonts:		"./images",
		},
		ext: {
			fonts: "*.{eot,woff,woff2,svg,ttf,otf}"
		}
	});
	
	grunt.config("DEBUG_CLIENT_JS", "folio-debug-client");
	grunt.config("DEBUG_VENDOR_JS", "folio-debug-vendor");
	grunt.config("DEBUG_STYLES", "folio-debug");
	grunt.config("DIST_JS", "folio");
	grunt.config("DIST_STYLES", "folio");
	
	grunt.loadTasks("./build/grunt/tasks");
	
	/* --------------------------------
	/* Main Targets
	/* -------------------------------- */
	
	grunt.registerTask("build-deps", ["modernizr-build:production"]);
	grunt.registerTask("build-debug-vendor", ["build-deps","browserify:vendor", "exorcise:vendor"]);
	grunt.registerTask("build-debug-client", ["browserify:client", "exorcise:client"]);
	grunt.registerTask("build-debug-styles", ["compass:debug", "autoprefixer:debug"]);
	
	grunt.registerTask("build-debug", ["build-debug-vendor", "build-debug-client","build-debug-styles"]);
	grunt.registerTask("build-dist",  ["build-deps", "browserify:dist", "uglify:dist", "compass:dist", "autoprefixer:dist"]);
	
	grunt.registerTask("clean-all", ["clean", "compass:clean", "compass:fonts"]);
	grunt.registerTask("build-all", ["build-debug", "build-dist"]);
	grunt.registerTask("build-clean-all", ["clean-all", "build-all"]);
	grunt.registerTask("build-watch", ["browserify:watch-client", "browserify:watch-vendor", "watch"]);
	
	// Default task
	grunt.registerTask("default", ["build-debug"]);
	
	/* --------------------------------
	/* watch
	/* -------------------------------- */

	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.config("watch", {
		options: {
			spawn: false,
			forever: true
		},
		"reload-config": {
			// options: { spawn: true },
			files: ["gruntfile.js", "package.json"],
			tasks: ["clean-all", 
				"compass:debug", "autoprefixer:debug", 
				"modernizr-build:production", "browserify:vendor", "browserify:client"
			],
		},
		"build-styles": {
			tasks: ["compass:debug", "autoprefixer:debug"],
			files: ["src/sass/**/*.scss", "src/sass/**/*.json"],
		},
		"build-deps": {
			tasks: ["modernizr-build:production"],
			files: ["build/grunt/modernizr-config.json"],
		},
		"process-vendor": {
			tasks: ["exorcise:vendor"],
			files: ["js/<%= DEBUG_VENDOR_JS %>.js"],
		},
		"process-client": {
			tasks: ["exorcise:client"],
			files: ["js/<%= DEBUG_CLIENT_JS %>.js"],
		},
		// "copy-module-resources": {
		// 	tasks: ["copy:resources", "copy:sources"],
		// 	files: [
		// 		"node_modules/@folio/**/*.scss",
		// 		"node_modules/@folio/**/<%= paths.ext.fonts %>"
		// 	]
		// },
		// "build-styles-svg":{
		// 	tasks: ["compass:clean", "compass:debug", "autoprefixer:debug"],
		// 	files: ["images/**/*.svg"]
		// },
	});

	/* --------------------------------
	/* clean
	/* -------------------------------- */

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.config("clean", {
		src: [
			"./js/*",
			"./css/*"
		]
	});

	/* --------------------------------
	/* copy
	/* -------------------------------- */
	
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.config("copy", {
		resources: {
			files: [{
				flatten: true,
				expand: true,
				dest:"./fonts/",
				src: [
					"./node_modules/@folio/webfonts/build/fonts/franklin-gothic-itc-cp/<%= paths.ext.fonts %>",
					"./node_modules/@folio/webfonts/build/fonts/folio/<%= paths.ext.fonts %>",
					"./src/resources/fonts/franklin-gothic-fs/<%= paths.ext.fonts %>",
					"./src/resources/fonts/fontello*/**/<%= paths.ext.fonts %>",
				]
			}]
		},
		sources: {
			options: {
				process: function(content, srcpath) {
					return content.replace(/(\s)url\((['"]).*?(?=[^\/]*['"])/g, "$1font-url($2");
				}
			},
			files: [{
				expand: true,
				dest: "./build/generated/sass/fonts",
				cwd: "./node_modules/@folio/webfonts/build/sass/",
				src: [
					"_folio.scss",
					"_franklin-gothic-itc-cp.scss",
				]
			}]
		}
	});
	
	/* ---------------------------------
	/* Style Sheets
	/* --------------------------------- */
	// NOTE: `gem install compass sass-json-vars`
	
	/* Task defaults
	/* - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks("grunt-contrib-compass");
	grunt.config("compass.options", {
		require: [
			"sass-json-vars",
			"./build/grunt/compass-encode.rb", // alternative to compass inline-image()
		],
		sassDir: "src/sass",
		cssDir: "css",
		imagesDir: "images",
		fontsDir: "fonts",
		javascriptsDir: "js",
		relativeAssets: true,
		importPath: [
			"build/generated/sass"
		]
		//httpPath: "/workspace/assets",
	});
	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.config("autoprefixer.options", {
		map: true, //{ inline: false },
		//browsers: [ "ie > 8", "> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1"]
	});
	
	// grunt.loadNpmTasks("grunt-sass");
	// grunt.config("sass", {
	// 	options: {
	// 		sourceMap: true,
	// 		includePaths: [
	// 			"/usr/local/lib/ruby/gems/2.2.0/gems/compass-core-1.0.3/stylesheets",
	// 			"./src/sass"
	// 		],
	// 	},
	// 	dist: {
	// 		files: {
	// 			"./css/folio.css": "./src/sass/folio.scss",
	// 			"./css/fonts.css": "./src/sass/fonts.scss",
	// 		}
	// 	},
	// });

	/* Targets
	/* - - - - - - - - - - - - - - - - - */
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

	/* Separate fonts stylesheet
	/* - - - - - - - - - - - - - - - - - */
	grunt.config("compass.fonts.options", {
		specify: "src/sass/fonts.scss",
		outputStyle: "compressed",
		sourcemap: false,
	});
	
	/* --------------------------------
	/* Build JS dependencies
	/* -------------------------------- */
	
	grunt.config("modernizr-build.production", {
		files: {
			"./build/generated/js/modernizr-dist.js": [
				"./build/grunt/modernizr-config.json"
			]
		}
	});

	/* --------------------------------
	/* Javascript
	/* -------------------------------- */

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
			exclude: [
				"jquery"
			],
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
			],
			alias: [
				// "./node_modules/webcomponents.js/MutationObserver.js:mutationobserver-polyfill",
				"./build/generated/js/modernizr-dist.js:Modernizr",
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
		],
		options: {
			transform: [
				["hbsfy", { extensions: ["hbs"] }],
				// ["node-underscorify", { extensions: ["tpl"] }],
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
			// 		// cwd: __dirname + "./src/js",
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
	// grunt.config("uglify", {
	// 	options: {},
	// 	vendor: {
	// 		options: {
	// 			mangle: false,
	// 			beautify: true,
	// 			sourceMap: true,
	// 			sourceMapIn: "./js/<%= DEBUG_VENDOR_JS %>.js.map",
	// 			sourceMapIncludeSources: false,
	// 		},
	// 		files: {
	// 			"./js/<%= DEBUG_VENDOR_JS %>.js": ["./js/<%= DEBUG_VENDOR_JS %>.js"]
	// 		}
	// 	},
	// 	client: {
	// 		options: {
	// 			mangle: false,
	// 			beautify: true,
	// 			sourceMap: true,
	// 			sourceMapIn: "./js/<%= DEBUG_CLIENT_JS %>.js.map",
	// 			sourceMapIncludeSources: false,
	// 			compress: {
	// 				global_defs: {
	// 					DEBUG: true
	// 				}
	// 			}
	// 		},
	// 		files: {
	// 			"./js/<%= DEBUG_CLIENT_JS %>.js": ["./js/<%= DEBUG_CLIENT_JS %>.js"]
	// 		}
	// 	},
	// });

	/* --------------------------------
	/* dist
	/* -------------------------------- */

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
			exclude: grunt.config("browserify.vendor.options.exclude"),
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
	/* resources
	/* -------------------------------- */
	
	/* generate-favicons
	* - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks("grunt-svg2png");
	grunt.config("svg2png.favicons", {
		files: [{
			cwd: "src/resources/favicon/", src: "*.svg"
		}]
	});
	grunt.loadNpmTasks("grunt-favicons");
	grunt.config("favicons", {
		options: {
			trueColor: true,
			tileBlackWhite: false,
			html: "./build/sandbox/favicons.html",
			HTMLPrefix: "/workspace/assets/images/favicon/"
		},
		steampunk: {
			options: {
				appleTouchPadding: 10,
				appleTouchBackgroundColor: "#FEFCE7",
				tileColor: "#FEFCE7",
			},
			src: "src/resources/favicon/steampunk.png",
			dest: "images/favicon"
		},
		img_0139: {
			options: {
				appleTouchPadding: 0,
			},
			src: "src/resources/favicon/IMG_0139_fav.png",
			dest: "images/favicon",
		},
	});
	grunt.registerTask("generate-favicons", [
		"svg2png:favicons",
		"favicons:img_0139",
		// "favicons:steampunk",
	]);
};
