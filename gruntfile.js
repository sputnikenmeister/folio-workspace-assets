/*global module*/
module.exports = function(grunt) {
	"use strict";

	var _ = require("underscore");

	grunt.config("pkg", grunt.file.readJSON("package.json"));

	grunt.config("paths", {
		src: {
			js: "./src/js",
			sass: "./src/sass",
			resources: "./src/resources",
			generated: "./build/generated",
		},
		dest: {
			js: "./js",
			css: "./css",
			// fonts: "./images",
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

	grunt.loadTasks("./build/grunt/tasks");

	/* --------------------------------
	/* Main Targets
	/* -------------------------------- */

	grunt.registerTask("deps-styles", ["copy:resources", "copy:sources", "compass:fonts"]);
	grunt.registerTask("deps-js", ["modernizr-build:production"]);

	grunt.registerTask("debug-styles", ["compass:debug", "autoprefixer:debug"]);
	grunt.registerTask("debug-vendor", ["browserify:vendor", "exorcise:vendor"]);
	grunt.registerTask("debug-client", ["browserify:client", "exorcise:client"]);
	grunt.registerTask("debug", ["debug-vendor", "debug-client", "debug-styles"]);

	grunt.registerTask("dist-styles", ["compass:dist", "compass:fonts", "autoprefixer:dist"]);
	grunt.registerTask("dist-js", ["browserify:dist", "uglify:dist"]);
	grunt.registerTask("dist", ["dist-js", "dist-styles"]);

	grunt.registerTask("clean-all", ["clean:js", "clean:css", "compass:clean"]);
	grunt.registerTask("build", ["debug", "dist"]);
	grunt.registerTask("rebuild", ["clean-all", "deps-js", "build"]);
	// Default task
	grunt.registerTask("default", ["browserify:watch-client", "browserify:watch-vendor", "watch"]);
	// grunt.registerTask("default", ["build-watch"]);

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
				"modernizr-build:production",
				"compass:fonts", "compass:debug", "autoprefixer:debug",
				"browserify:vendor", "browserify:client"
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
			// files: ["build/tasks/browserify.vendor/*.js"],
			files: ["js/<%= paths.filebase.debugVendorJs %>.js"],
		},
		"process-client": {
			tasks: ["exorcise:client"],
			// files: ["build/tasks/browserify.client/*.js"],
			files: ["js/<%= paths.filebase.debugClientJs %>.js"],
		},
	});

	/* --------------------------------
	/* clean
	/* -------------------------------- */

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.config("clean", {
		js: { src: ["./js/*"] },
		css: { src: ["./css/*"] },
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
				dest: "./fonts/",
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

	/* NOTE: compass dependencies
	 *`gem install compass sass-json-vars compass-import-once`
	 */

	/* compass
	/* - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks("grunt-contrib-compass");
	grunt.config("compass.options", {
		require: [
			"sass-json-vars",
			"compass-import-once",
			// "compass/import-once",
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
		specify: ["src/sass/<%= paths.filebase.debugStyles %>.scss"],
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
		// dest: "./build/tasks/browserify.vendor/<%= paths.filebase.debugVendorJs %>.js",
		dest: "./js/<%= paths.filebase.debugVendorJs %>.js",
		src: [],
		options: {
			exclude: [
				"jquery"
			],
			require: [
				"underscore",
				"webfontloader",
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
				"./build/generated/js/modernizr-dist.js:modernizr-dist",
				"./src/js/shims/modernizr-shim.js:Modernizr",
				"./src/js/shims/fullscreen.js:fullscreen-polyfill",
				"./src/js/shims/matchesSelector.js:matches-polyfill",
				"./src/js/shims/requestAnimationFrame.js:raf-polyfill",
				"./src/js/shims/math-sign-polyfill.js:math-sign-polyfill",
			]
		},
	});

	/* browserify:client */
	grunt.config("browserify.client", {
		dest: "./js/<%= paths.filebase.debugClientJs %>.js",
		// dest: "./build/tasks/browserify.client/<%= paths.filebase.debugClientJs %>.js",
		src: ["./src/js/app/App.js"],
		options: {
			browserifyOptions: {
				debug: true,
				fullPaths: false,
				insertGlobalVars: {
					DEBUG: function(file, dir) {
						return true;
					}
				}
			},
			transform: [
				["hbsfy", { extensions: ["hbs"] }],
				// ["node-underscorify", { extensions: ["tpl"] }],
			],
			plugin: [
				["remapify",
					[
						{
							expose: "app",
							cwd: "./src/js/app",
							src: "./**/*.js",
						}, {
							expose: "utils",
							cwd: "./src/js/utils",
							src: "./**/*.js",
						}
					]
				]
			],
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
				// "./js/<%= paths.filebase.debugVendorJs %>.js.map": [ grunt.config("browserify.vendor.dest") ]
			}
		},
		client: {
			files: {
				"./js/<%= paths.filebase.debugClientJs %>.js.map": ["./js/<%= paths.filebase.debugClientJs %>.js"]
				// "./js/<%= paths.filebase.debugClientJs %>.js.map": [ grunt.config("browserify.client.dest") ]
			}
		},
	});


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
		src: ["./src/js/app/App.js"],
		dest: "./js/<%= paths.filebase.distJs %>.js",
		// dest: "./build/tasks/browserify.dist/<%= paths.filebase.distJs %>.js",
		options: _.defaults({
				external: [],
				browserifyOptions: {
					debug: false,
					fullPaths: false,
					// insertGlobalVars: {
					// 	DEBUG: function(file, dir) {
					// 		return false;
					// 	}
					// }
				},
			},
			grunt.config("browserify.vendor.options"),
			grunt.config("browserify.client.options")
		),
		// options: {
		// 	browserifyOptions: {
		// 		fullPaths: false,
		// 		debug: false
		// 	},
		// 	exclude: grunt.config("browserify.vendor.options.exclude"),
		// 	require: grunt.config("browserify.vendor.options.require"),
		// 	alias: grunt.config("browserify.vendor.options.alias"),
		//
		// 	transform: grunt.config("browserify.client.options.transform"),
		// 	plugin: grunt.config("browserify.client.options.plugin"),
		// },
	});

	/* Uglify */
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.config("uglify.dist", {
		options: {
			mangle: true,
			sourceMap: false,
			compress: {
				dead_code: true,
				drop_console: true,
				global_defs: {
					"DEBUG": false
				},
			}
		},
		files: {
			"js/<%= paths.filebase.distJs %>.js": ["./js/<%= paths.filebase.distJs %>.js"]
			// "js/<%= paths.filebase.distJs %>.js": [grunt.config("browserify.dist.dest")]
		}
	});

	/* --------------------------------
	/* resources
	/* -------------------------------- */

	/* generate-favicons
	 * - - - - - - - - - - - - - - - - - */

	// grunt.loadNpmTasks("grunt-contrib-clean"); // NOTE: already loaded above
	grunt.config("clean.favicons", {
		src: [
			"<%= paths.src.generated %>/resources/favicons",
			"./images/favicons"
		]
	});
	grunt.loadNpmTasks("grunt-svg2png");
	grunt.config("svg2png.favicons", {
		files: [{
			cwd: "src/resources/favicons/",
			src: "IMG_0139_*.svg",
			dest: "<%= paths.src.generated %>/resources/favicons/"
		}]
	});
	grunt.loadNpmTasks("grunt-favicons");
	grunt.config("favicons", {
		options: {
			trueColor: true,
			tileBlackWhite: false,
		},
		steampunk: {
			options: {
				appleTouchPadding: 10,
				appleTouchBackgroundColor: "#FEFCE7",
				tileColor: "#FEFCE7",
				html: "<%= paths.src.generated %>/resources/favicons/steampunk.html",
				HTMLPrefix: "/workspace/assets/images/favicons/steampunk/",
			},
			src: "src/resources/favicons/steampunk.png",
			dest: "images/favicons/steampunk"
		},
		img_0139_square: {
			options: {
				html: "<%= paths.src.generated %>/resources/favicons/img_0139_square.html",
				HTMLPrefix: "/workspace/assets/images/favicons/square/",
				appleTouchPadding: 0,
			},
			src: "<%= paths.src.generated %>/resources/favicons/img_0139_square.png",
			dest: "images/favicons/square",
		},
		img_0139_circle: {
			options: {
				html: "<%= paths.src.generated %>/resources/favicons/img_0139_circle.html",
				HTMLPrefix: "/workspace/assets/images/favicons/circle/",
				appleTouchPadding: 0,
			},
			src: "<%= paths.src.generated %>/resources/favicons/IMG_0139_circle.png",
			dest: "images/favicons/circle",
		},
	});
	grunt.registerTask("generate-favicons", [
		"clean:favicons",
		"svg2png:favicons",
		"favicons:img_0139_square",
		"favicons:img_0139_circle",
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
