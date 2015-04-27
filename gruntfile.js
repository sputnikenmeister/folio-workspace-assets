/*global module*/
module.exports = function (grunt) {
	"use strict";

	// grunt.initConfig({});
	grunt.config("pkg", grunt.file.readJSON("package.json"));

	grunt.config("DEBUG_CLIENT_JS", "folio-debug-client");
	grunt.config("DEBUG_VENDOR_JS", "folio-debug-vendor");
	grunt.config("DEBUG_STYLES", "folio-debug");
	grunt.config("DIST_JS", "folio");
	grunt.config("DIST_STYLES", "folio");

	/* ---------------------------------
	 * Style Sheets
	 * --------------------------------- */

	/* Task defaults
	 * - - - - - - - - - - - - - - - - - */
	// "gem install compass sass-json-vars"
	grunt.loadNpmTasks("grunt-contrib-compass"); /* Compass (SASS) (requires compass gem) */
	grunt.config("compass.options", {
		require: [
			"sass-json-vars",
			// "/usr/local/lib/ruby/gems/2.2.0/gems/sass-json-vars-0.3.2/lib/sass-json-vars.rb",
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
	grunt.loadNpmTasks("grunt-autoprefixer"); /* CSS prefixes */
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

	/* browserify */
	grunt.loadNpmTasks("grunt-browserify");
	grunt.config("browserify.vendor", {
		dest: "./js/<%= DEBUG_VENDOR_JS %>.js",
		src: [],
		options: {
			browserifyOptions: {
				fullPaths: false,
				debug: true
			},
			require: [
				"backbone.babysitter", "backbone", "Backbone.Mutators",
				"jquery.transit", "hammerjs", "jquery", "underscore"
			],
			alias: [
				"./bower_components/jquery-color/jquery.color.js:jquery-color"
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
			browserifyOptions: {
				fullPaths: false,
				debug: true
			},
			transform: [
				"node-underscorify"
			],
			external: ["jquery-color"].concat(grunt.config("browserify.vendor.options.require"))
		}
	});
	/* browserify:watchable */
	// Duplicate browserify.client task for watch
	grunt.config("browserify.watchable", grunt.config("browserify.client"));
	grunt.config("browserify.watchable.options.watch", true);

	/* Extract source maps from browserify */
	grunt.loadNpmTasks("grunt-exorcise");
	grunt.config("exorcise", {
		options: {
			strict: false,
			root: "../",
//			root: "/workspace/assets/"
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
			files: ["src/sass/**/*.scss"],
		},
		"process-vendor": {
			tasks: ["exorcise:vendor"],//"uglify:vendor"],
			files: ["js/<%= DEBUG_VENDOR_JS %>.js"],
		},
		"process-client": {
			tasks: ["exorcise:client"],//"uglify:client"
			files: ["js/<%= DEBUG_CLIENT_JS %>.js"],
		},
		"reload-config": {
			options: {
				spawn: true
			},
			files: ["gruntfile.js"],
			// tasks: ["clean-all", "compass:debug", "autoprefixer:debug",
			// 	"browserify:vendor", "browserify:client", "build-dist"],
			tasks: ["compass:debug", "autoprefixer:debug",
				"browserify:vendor", "browserify:client"],
		},
		// "build-styles-svg": {
		// 	tasks: ["compass:clean", "compass:client", "autoprefixer:client"],
		// 	files: ["images/**/*.svg"],
		// },
		//"process-sources": { tasks: ["jshint"], files: ["src/js/**/*.js"], },
	});


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
			transform: [
				"node-underscorify"
			],
			alias: [
				"./bower_components/jquery-color/jquery.color.js:jquery-color"
			]
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

	// DEBUG: check config result
	// grunt.file.write("./.build/grunt-config.json", JSON.stringify(grunt.config.get()));
	var _debugTasks = (function() {
		var _tasks = {};
		_tasks.buildStyles 		= ["compass:debug", "autoprefixer:debug"];
		_tasks.buildVendor 		= ["browserify:vendor", "exorcise:vendor"];//, "uglify:vendor"];
		_tasks.buildClient 		= ["browserify:client", "exorcise:client"];//, "uglify:client"];
		_tasks.buildScripts 	= _tasks.buildVendor.concat(_tasks.buildClient);
		_tasks.buildAll 		= _tasks.buildStyles.concat(_tasks.buildScripts);
		return _tasks.buildAll;
	})();

	grunt.registerTask("clean-all",
		["clean", "compass:clean", "compass:fonts"]);
	grunt.registerTask("build-debug", _debugTasks);
	grunt.registerTask("build-watch",
		["build-debug", "browserify:watchable", "watch"]);
	grunt.registerTask("build-dist",
		["compass:dist", "autoprefixer:dist", "browserify:dist", "uglify:dist"]);
	grunt.registerTask("build-all",
		["clean-all", "build-debug", "build-dist"]);
	// Default task
	grunt.registerTask("default", ["build-all"]);

	/* --------------------------------
	 * Resources: Sprites
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
		destCss: "src/sass/includes/_bundle-sprites-generated.scss"
	});

	// grunt.config("compass.bundle-sprites.options", {
	// 	specify: "src/sass/includes/_bundle-sprites.scss",
	// 	sourcemap: false,
	// });
	grunt.registerTask("generate-sprites",
		["responsive_images:bundle-sprites", "sprite:bundle-sprites"]);

	/* fontello-open (run CLI program)
	 * - - - - - - - - - - - - - - - - - */
	grunt.registerTask("fontello-open", "Open fontello configuration in browser", function() {
		var child = grunt.util.spawn({
			cmd: "fontello-cli",
			args: ["open", "--config", "build/fontello.json"],
			opts: {stdio: "inherit"}
		}, this.async());
	});

	/* generate-favicons
	 * - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks("grunt-favicons");
	grunt.config("favicons", {
		options: {
			trueColor: true,
			appleTouchBackgroundColor: "#FEFCE7",
			tileColor: "#FEFCE7",
			tileBlackWhite: false,
			html: "html/static.xhtml",
			HTMLPrefix: "/workspace/assets/images/favicon/"
		},
		icons: {
			src: "src/resources/favicon/favicon.png",
			dest: "images/favicon"
		}
	});
	grunt.registerTask("generate-favicon", ["favicons"]);
};
