
/*
 * bower - bower.json
 */
bower_json = {
	"es5-shim": "~4.0.3",
	"html5shiv": "~3.7.2",
	"animation-frame": "~0.1.7",
	"modernizr": "~2.8.3",
    "source-sans-pro": "*",
};

/*
 * node - package.json
 */
pkg_json = {
    "grunt-csso": "~0.6.3",
    "grunt-bowercopy": "^1.1.0",
    "grunt-contrib-copy": "^0.7.0",
    "grunt-contrib-cjsc": "*",
    "grunt-contrib-concat": "~0.5.0",
    "grunt-contrib-jscs": "*",
    "grunt-contrib-uglify": "~0.6.0",
};

/*
 * grunt - gruntfile.js
 */
	grunt.registerTask("debug", [ "compass:debug", "autoprefixer:styles", "jshint", "cjsc:debug" ]);
	grunt.registerTask("dist", [ "compass:dist", "autoprefixer:styles", "jshint", "cjsc:dist"]);

	/* Add bower deps to browserify */
	grunt.loadNpmTasks("grunt-browserify-bower");
	grunt.config("browserifyBower.vendor", {
		options: {
			file: "./js/vendor-bower.js",
			forceResolve: {
				"backbone.picky": "lib/backbone.picky.js",
				"jquery-color": "jquery.color.js"
			}
		}
	});

	grunt.loadNpmTasks("grunt-bowercopy");
	grunt.config("bowercopy",
	{
		options: {
			srcPrefix: ".bower_components"
		},
		vendor: {
			options: {
				destPrefix: "assets/lib"
			},
			files: {
				"jquery.js"					: "jquery/dist/jquery.js",
				"hammer.js"					: "hammerjs/hammer.js",
				"jquery.hammer.js"			: "jquery-hammerjs/jquery.hammer.js",
				"velocity.js"				: "velocity/velocity.js",
				"underscore.js"				: "underscore/underscore.js",
				"backbone.js"				: "backbone/backbone.js",
				"backbone.babysitter.js"	: "backbone.babysitter/lib/backbone.babysitter.js",
				"backbone.picky.js"			: "backbone.picky/lib/amd/backbone.picky.js",
				"backbone.select.js"		: "backbone.select/dist/amd/backbone.select.js",
				"backbone.cycle.js"			: "backbone.cycle/dist/amd/backbone.cycle.js",
			}
		}
	});

	grunt.loadNpmTasks("grunt-csso");
	grunt.config("csso",
	{
		styles: {
			files: { "assets/css/folio.min.css": "assets/css/folio.css" }
		},
		flash: {
			files: { "assets/css/flash.min.css": "assets/css/flash.css" }
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jscs");
	grunt.config("jscs",
	{
		dist: {
			options: {
				standard: "Jquery",
				reportFull: true
			},
			files: {
				src: [ "assets/src/js" ]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.config("concat",
	{
		flash: {
			files: {
				"assets/css/flash.css": [
					"assets/src/css/reset.css",
					"assets/src/css/flash.css"
				]
			}
		}
	});

	/* cjsc: CommonJS compiler */
	grunt.loadNpmTasks("grunt-contrib-cjsc");
	grunt.config("cjsc",
	{
		debug: {
			options: {
				sourceMap: "assets/js/*.map",
				sourceMapRoot: "../src/js/app",
				minify: false,
				config: {
					"jquery"      			: { "globalProperty": "$" },
					"hammerjs"      		: { "globalProperty": "Hammer" },
					"underscore"      		: { "globalProperty": "_" },
					"backbone"      		: { "globalProperty": "Backbone" },
					// "backbone.picky"   		: { "path": "assets/src/js/vendor/backbone.picky" },
					// "backbone.select"   	: { "path": "assets/src/js/vendor/backbone.select" },
					// "backbone.cycle"   		: { "path": "assets/src/js/vendor/backbone.cycle" },
				}
			 },
			 files: {
					"assets/js/folio.js": "assets/src/js/app/App.js"
			 }
		 },
		 dist: {
			options: {
				debug: false,
				minify: true,
				banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - " +
							"<%= grunt.template.today(\"yyyy-mm-dd\") %> */",
				config: {
					"jquery"      			: { "path": "assets/lib/jquery" },
					"hammerjs"    			: { "path": "assets/lib/hammer.js" },
					"underscore"  			: { "path": "assets/lib/underscore.js" },
					"backbone"    			: { "path": "assets/lib/backbone.js" },
					"backbone.picky"   		: {
						"path": "assets/lib/backbone.picky",
						"require": "backbone", "exports": "backbone"
					},
					"backbone.babysitter"   : {
						"path": "assets/lib/backbone.babysitter",
						"require": "backbone", "exports": "backbone"
					},
				}
			},
			files: {
				"assets/js/folio.min.js": "assets/src/js/app/App.js"
			}
		}
	});

	grunt.loadNpmTasks("grunt-fontello");
	grunt.config("fontello",
	{
		install: {
			options: {
				config  : "./fontello.json",
				zip		: "./build/fontello-grunt",
				fonts   : "./assets/fonts/fontello-grunt/fonts",
				styles  : "./assets/fonts/fontello-grunt/sass",
				scss    : true,
				force   : true,
			}
		}
	});

	grunt.loadNpmTasks("grunt-bower-install-simple");
	grunt.config("bower-install-simple",
	{
		install: {
			options: {
				production: false,
				clean: false
			}
		}
	});

	/*
	 * Modernirzr build
	 */
	grunt.loadNpmTasks("grunt-modernizr");
	grunt.config("modernizr",
	{
		dist: {
			// [REQUIRED] Path to the build you're using for development.
			"devFile" : "assets/js/modernizr.js",
			// Path to save out the built file.
			"outputFile" : "assets/js/modernizr.js",
			// Based on default settings on http://modernizr.com/download/
			"extra" : {
				"shiv" : true,
				"printshiv" : false,
				"load" : true,
				"mq" : false,
				"cssclasses" : true
			},
			// Based on default settings on http://modernizr.com/download/
			"extensibility" : {
				"addtest" : false,
				"prefixed" : false,
				"teststyles" : false,
				"testprops" : false,
				"testallprops" : false,
				"hasevents" : false,
				"prefixes" : false,
				"domprefixes" : false,
				"cssclassprefix": ""
			},
			// By default, source is uglified before saving
			"uglify" : false,
			// Define any tests you want to implicitly include.
			"tests" : [],
			// By default, this task will crawl your project for references to Modernizr tests.
			// Set to false to disable.
			"parseFiles" : true,

			// When parseFiles = true, this task will crawl all *.js, *.css, *.scss and *.sass files,
			// except files that are in node_modules/.
			// You can override this by defining a "files" array below.
			// "files" : {
				// "src": []
			// },

			// This handler will be passed an array of all the test names passed to the Modernizr API, and will run after the API call has returned
			// "handler": function (tests) {},

			// When parseFiles = true, matchCommunityTests = true will attempt to
			// match user-contributed tests.
			"matchCommunityTests" : false,

			// Have custom Modernizr tests? Add paths to their location here.
			"customTests" : []
		}
	});
