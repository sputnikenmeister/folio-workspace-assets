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
		require: "./build/compass-encode.rb",
	});
	grunt.config("compass.client.options", {
//		specify: "src/sass/folio.scss",
		sourcemap: true,
	});
	grunt.config("compass.clean.options", {
		clean: true
	});

	/* CSS prefixes */
	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.config("autoprefixer.options", {
		map: true, //{ inline: false },
		//browsers: [ "ie > 8", "> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1"]
	});
	grunt.config("autoprefixer.client.files", {
		"css/folio.css": "css/folio.css"
	});
	// grunt.config("autoprefixer.flash.files", { "css/flash.css": "css/flash.css"});

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
		dest: "./js/folio-vendor.js",
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
		dest: "./js/folio-client.js",
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
	grunt.config("browserify.watchable", grunt.config("browserify.client")); // Duplicate browserify.client task for watch
	grunt.config("browserify.watchable.options.watch", true);

	/* Extract source maps from browserify */
	grunt.loadNpmTasks("grunt-exorcise");
	grunt.config("exorcise", {
		options: {
			strict: false,
			root: "../"
		},
		vendor: {
			files: {
				"./js/folio-vendor.js.map": ["./js/folio-vendor.js"]
			}
		},
		client: {
			files: {
				"./js/folio-client.js.map": ["./js/folio-client.js"]
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
				sourceMapIn: "./js/folio-vendor.js.map",
				sourceMapIncludeSources: false,
			},
			files: {
				"./js/folio-vendor.js": ["./js/folio-vendor.js"]
			}
		},
		client: {
			options: {
				mangle: false,
				beautify: true,
				sourceMap: true,
				sourceMapIn: "./js/folio-client.js.map",
				sourceMapIncludeSources: false,
				compress: {
					global_defs: {
						DEBUG: true
					}
				}
			},
			files: {
				"./js/folio-client.js": ["./js/folio-client.js"]
			}
		},
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.config("clean", {
		src: ["./js/", "./css/"]
	});

	/* Watch tasks */
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.config("watch", {
		options: {
			spawn: false
		},
		"reload-config": {
			options: {
				spawn: true
			},
			files: ["gruntfile.js"],
			tasks: ["clean", "compass:clean", "compass:client", "autoprefixer:client", "browserify:vendor", "browserify:client"],
		},
		"build-styles": {
			tasks: ["compass:client", "autoprefixer:client"],
			files: ["src/sass/**/*.scss"],
		},
		"build-styles-svg": {
			tasks: ["compass:clean", "compass:client", "autoprefixer:client"],
			files: ["images/**/*.svg"],
		},
		//"process-sources": {
		//	tasks: ["jshint"],
		//	files: ["src/js/**/*.js"],
		//},
		"process-vendor": {
			tasks: ["exorcise:vendor", "uglify:vendor"],
			files: ["js/folio-vendor.js"],
		},
		"process-client": {
			tasks: ["exorcise:client", "uglify:client"],
			files: ["js/folio-client.js"],
		},
	});

	// DEBUG: check config result
	// grunt.file.write("./.build/grunt-config.json", JSON.stringify(grunt.config.get()));
	var _tasks = {};
	_tasks.buildStyles 		= ["compass:client", "autoprefixer:client"];
	_tasks.buildVendor 		= ["browserify:vendor", "exorcise:vendor", "uglify:vendor"];
	_tasks.buildClient 		= ["browserify:client", "exorcise:client", "uglify:client"];
	_tasks.buildScripts 	= _tasks.buildVendor.concat(_tasks.buildClient);
	_tasks.buildAll 		= _tasks.buildStyles.concat(_tasks.buildScripts)

	// Task Groups
	grunt.registerTask("build-all", _tasks.buildAll);
	grunt.registerTask("watch-all", ["browserify:watchable", "watch"]);
	grunt.registerTask("watch-clean", ["clean", "compass:clean", "buildAll", "watchAll"]);

	// Default task
	grunt.registerTask("default", ["buildAll"]);

	/* --------------------------------
	 * dist
	 * -------------------------------- */

	grunt.config("compass.dist.options", {
		specify: "src/sass/folio.scss",
		sourcemap: false,
		outputStyle: "compressed"
	});

	grunt.config("autoprefixer.dist", {
		options: {
			map: false
		},
		files: {
			"css/folio.css": "css/folio.css"
		}
	});

	grunt.config("browserify.dist", {
		dest: "./js/folio.js",
		src: [
			"./src/js/app/App.js"
		],
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
			"js/folio.js": ["./js/folio.js"]
		}
	});

	grunt.registerTask("dist", ["compass:clean", "compass:dist", "autoprefixer:dist", "browserify:dist", "uglify:dist"]);


	/* --------------------------------
	 * Custom tasks/ CLI executions
	 * -------------------------------- */

	grunt.registerTask('fontello', 'Open fontello configuration in browser', function() {
		var child = grunt.util.spawn({
			cmd: "fontello-cli",
			args: ["open", "--config", "build/fontello.json"],
			opts: {stdio: "inherit"}
		}, this.async());
	});
};
