/*global module*/
module.exports = function (grunt) {
	"use strict";

	grunt.config("pkg", grunt.file.readJSON("package.json"));
	
	grunt.config("paths", {
		src: {
			js:			"./src/js",
			sass:		"./src/sass",
			resources:	"./src/resources",
			generated:	"./build/generated",
		},
		dest: {
			js:			"./js",
			css:		"./css",
			fonts:		"./images",
		},
		ext: {
			fonts: "*.{eot,woff,woff2,svg,ttf,otf}",
		},
		dev: {
			appRoot: "http://localhost/projects/folio-sym",
		},
		filebase: {
			debugClientJs: "folio-debug-client",
			debugVendorJs: "folio-debug-vendor",
			debugStyles: "folio-debug",
			distJs: "folio",
			distStyles: "folio",
		}
	});
	
	// grunt.config("paths.filebase.debugClientJs", "folio-debug-client");
	// grunt.config("paths.filebase.debugVendorJs", "folio-debug-vendor");
	// grunt.config("paths.filebase.debugStyles", "folio-debug");
	// grunt.config("paths.filebase.distJs", "folio");
	// grunt.config("paths.filebase.distStyles", "folio");
	
	grunt.loadTasks("./build/grunt/tasks");
	
	/* --------------------------------
	/* Main Targets
	/* -------------------------------- */
	
	grunt.registerTask("build-debug-styles", ["compass:debug", "autoprefixer:debug"]);
	grunt.registerTask("build-dist-styles", ["compass:dist", "compass:fonts", "autoprefixer:dist"]);
	
	grunt.registerTask("build-deps", ["modernizr-build:production"]);
	grunt.registerTask("build-debug-vendor", ["build-deps", "browserify:vendor", "exorcise:vendor"]);
	grunt.registerTask("build-debug-client", ["browserify:client", "exorcise:client"]);
	
	grunt.registerTask("build-debug", ["build-debug-vendor", "build-debug-client","build-debug-styles"]);
	grunt.registerTask("build-dist",  ["build-deps", "browserify:dist", "uglify:dist", "build-dist-styles"]);
	
	grunt.registerTask("clean-all", ["clean", "compass:clean"]);
	grunt.registerTask("build-all", ["build-debug", "build-dist"]);
	grunt.registerTask("build-clean-all", ["clean-all", "build-all"]);
	grunt.registerTask("build-watch", ["browserify:watch-client", "browserify:watch-vendor", "watch"]);
	
	// Default task
	grunt.registerTask("default", ["build-watch"]);
	
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
				"compass:fonts", "compass:debug", "autoprefixer:debug", 
				"modernizr-build:production", "browserify:vendor", "browserify:client"
			],
		},
		// "build-fonts": {
		// 	tasks: ["compass:fonts"],
		// 	files: ["src/sass/fonts.scss", "src/sass/fonts/*.scss",
		// 		"<%= paths.src.generated %>/sass/fonts/*.scss"],
		// },
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
			files: ["js/<%= paths.filebase.debugVendorJs %>.js"],
		},
		"process-client": {
			tasks: ["exorcise:client"],
			files: ["js/<%= paths.filebase.debugClientJs %>.js"],
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
	
	/* compass
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
	grunt.config("compass.clean.options", {
		clean: true
	});
	grunt.config("compass.debug.options", {
		specify: [ "src/sass/<%= paths.filebase.debugStyles %>.scss"],
		sourcemap: true,
	});
	grunt.config("compass.fonts.options", {
		specify: "src/sass/fonts.scss",
		sourcemap: false,
		// outputStyle: "compressed",
	});

	/* autoprefixer
	/* - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.config("autoprefixer.debug", {
		options: { map: true },
		src: "css/<%= paths.filebase.debugStyles %>.css"
		// files: {"css/<%= paths.filebase.debugStyles %>.css": "css/<%= paths.filebase.debugStyles %>.css",
		// "css/fonts.css": "css/fonts.css"},
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
		dest: "./js/<%= paths.filebase.debugVendorJs %>.js",
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
				"webfontloader",
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
		dest: "./js/<%= paths.filebase.debugClientJs %>.js",
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
				"./js/<%= paths.filebase.debugVendorJs %>.js.map": ["./js/<%= paths.filebase.debugVendorJs %>.js"]
			}
		},
		client: {
			files: {
				"./js/<%= paths.filebase.debugClientJs %>.js.map": ["./js/<%= paths.filebase.debugClientJs %>.js"]
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
	// 			sourceMapIn: "./js/<%= paths.filebase.debugVendorJs %>.js.map",
	// 			sourceMapIncludeSources: false,
	// 		},
	// 		files: {
	// 			"./js/<%= paths.filebase.debugVendorJs %>.js": ["./js/<%= paths.filebase.debugVendorJs %>.js"]
	// 		}
	// 	},
	// 	client: {
	// 		options: {
	// 			mangle: false,
	// 			beautify: true,
	// 			sourceMap: true,
	// 			sourceMapIn: "./js/<%= paths.filebase.debugClientJs %>.js.map",
	// 			sourceMapIncludeSources: false,
	// 			compress: {
	// 				global_defs: {
	// 					DEBUG: true
	// 				}
	// 			}
	// 		},
	// 		files: {
	// 			"./js/<%= paths.filebase.debugClientJs %>.js": ["./js/<%= paths.filebase.debugClientJs %>.js"]
	// 		}
	// 	},
	// });

	/* --------------------------------
	/* dist
	/* -------------------------------- */

	grunt.config("compass.dist.options", {
		specify: "src/sass/<%= paths.filebase.distStyles %>.scss",
		sourcemap: false,
		outputStyle: "compressed"
	});

	grunt.config("autoprefixer.dist", {
		options: {
			map: false
		},
		files: {
			"css/<%= paths.filebase.distStyles %>.css": "css/<%= paths.filebase.distStyles %>.css"
		}
	});
	
	grunt.config("browserify.dist", {
		src: [
			"./src/js/app/App.js"
		],
		dest: "./js/<%= paths.filebase.distJs %>.js",
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
			"js/<%= paths.filebase.distJs %>.js": ["./js/<%= paths.filebase.distJs %>.js"]
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
	
	
	/* --------------------------------
	/* offline data
	/* -------------------------------- */
	grunt.loadNpmTasks("grunt-http");
	grunt.config("http", {
		options: {
			ignoreErrors: true
		},
		bootstrap: {
			options: { url: "<%= paths.dev.appRoot %>/json" },
			dest: "<%= paths.src.generated %>/js/bootstrap.js"
		}
	});
};
