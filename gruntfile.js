/*global module*/
module.exports = function (grunt) {
	"use strict";

	grunt.config("pkg", grunt.file.readJSON("package.json"));
	
	
	grunt.config("DEBUG_CLIENT_JS", "folio-debug-client");
	grunt.config("DEBUG_VENDOR_JS", "folio-debug-vendor");
	grunt.config("DEBUG_STYLES", "folio-debug");
	grunt.config("DIST_JS", "folio");
	grunt.config("DIST_STYLES", "folio");
	
	grunt.config("FONTELLO_DIR", "fonts/fontello-27278fbd");

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
				// "jquery",
				"underscore",
				"backbone",
				"backbone.native",
				"Backbone.Mutators",
				"backbone.babysitter",
				"hammerjs",
				"color",
				"es6-promise",
				"classlist-polyfill",
				"cookies-js"
			],
			alias: [
				"./src/js/shims/matchesSelector.js:matches-polyfill",
				"./src/js/shims/requestAnimationFrame.js:raf-polyfill",
			]
		},
	});

	/* browserify:client */
	grunt.config("browserify.client", {
		dest: "./js/<%= DEBUG_CLIENT_JS %>.js",
		src: [
			"./src/js/app/App.js"
		],
		options: {
			transform: [
				["hbsfy", { extensions: ["hbs"] }],
				// "decomponentify",
				// ["node-underscorify", { extensions: ["tpl"] }],
			]
		}
	});
	/* NOTE: Add requires and aliased requires from vendor as externals in client */
	grunt.config("browserify.client.options.external", (function() {
		return grunt.config("browserify.vendor.options.require").concat(
			grunt.config("browserify.vendor.options.alias").map(function(s) {
				return s.split(":").pop();
			})
		);
	}()));
	grunt.log.verbose.subhead("Vendor Externals");
	grunt.log.verbose.writeln(grunt.config("browserify.client.options.external").join(", "));
	
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
	 * Resources
	 * -------------------------------- */
	
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
	
	// grunt.config("compass.bundle-sprites.options", {
	// 	specify: "src/sass/generated/_bundle-sprites.scss",
	// 	sourcemap: false,
	// });
	
	grunt.registerTask("generate-sprites",
		["responsive_images:bundle-sprites", "sprite:bundle-sprites"]);

	/* fontello-open (run CLI program)
	 * - - - - - - - - - - - - - - - - - */
	grunt.registerTask("fontello-open",
		"Open fontello configuration in browser",
		function() {
			var child = grunt.util.spawn({
				cmd: "fontello-cli",
				args: ["open", "--config", "<%= FONTELLO_DIR %>/config.json"],
				opts: {stdio: "inherit"}
			}, this.async());
		}
	);
	
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
			html: "html/static.xhtml",
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
				// appleTouchBackgroundColor: "#FF00FF",
				// tileColor: "#FF00FF",
			},
			src: "src/resources/favicon/IMG_0139.png",
			dest: "images/favicon",
		},
	});
	grunt.registerTask("generate-favicons", [
		"svg2png:favicons",
		"favicons:img_0139",
		// "favicons:steampunk",
	]);

	// DEBUG: check config result
	// grunt.file.write("./.build/grunt-config.json", JSON.stringify(grunt.config.get()));
};
