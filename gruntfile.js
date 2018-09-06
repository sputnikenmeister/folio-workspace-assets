/*global module*/

'use strict';

module.exports = function(grunt) {

	var _ = require('underscore');
	var path = require('path');

	grunt.config('pkg', grunt.file.readJSON('package.json'));

	grunt.config('paths', {
		src: {
			js: './src/js',
			sass: './src/sass',
			resources: './src/resources',
			generated: './build/generated',
		},
		dest: {
			js: './js',
			css: './css',
			// fonts: './images',
		},
		ext: {
			fonts: '{eot,woff,woff2,svg,ttf,otf}',
		},
		web: {
			root: 'http://localhost/projects/folio-sym',
			workspace: '<%= paths.web.root %>/workspace'
		},
		filebase: {
			debugClientJs: 'folio-debug-client',
			debugVendorJs: 'folio-debug-vendor',
			debugStyles: 'folio-debug',
			distJs: 'folio',
			distStyles: 'folio',
			ieStyles: 'folio-ie',
		}
	});

	/* --------------------------------
	/* Main Targets
	/* -------------------------------- */

	// resources
	grunt.registerTask('deps-build', ['build-favicons', 'modernizr-build:dist']);
	grunt.registerTask('deps-install', ['copy:resources', 'copy:sources', 'deps-build', 'symlink:vendor']);

	// debug build tasks
	/* NOTE debug-styles defined next to task config */
	grunt.registerTask('debug-styles', ['debug-styles-sass']);
	grunt.registerTask('debug-vendor', ['browserify:vendor', 'exorcise:vendor']);
	grunt.registerTask('debug-client', ['browserify:client', 'exorcise:client']);
	grunt.registerTask('debug', ['debug-vendor', 'debug-client', 'debug-styles']);

	// dist build tasks
	grunt.registerTask('dist-styles', ['sass:dist', 'sass:ie', 'autoprefixer:dist']);
	grunt.registerTask('dist-js', ['browserify:dist', 'uglify:dist']);
	grunt.registerTask('dist', ['dist-js', 'dist-styles']);

	// watch
	grunt.registerTask('debug-watch', ['browserify:watch-client', 'browserify:watch-vendor', 'watch']);

	grunt.registerTask('clean-all', ['clean:js', 'clean:css']);
	grunt.registerTask('install', ['deps-install']);
	grunt.registerTask('build', ['debug', 'dist']);
	grunt.registerTask('rebuild', ['clean-all', 'build']);
	// Default task
	grunt.registerTask('default', ['debug', 'debug-watch']);

	/* --------------------------------
	/* watch
	/* -------------------------------- */

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.config('watch', {
		options: {
			spawn: false,
			forever: true
		},
		'reload-config': {
			files: ['gruntfile.js', 'package.json'],
			tasks: ['build'],
		},
		'build-styles': {
			tasks: ['sass:debug', 'sass:ie', 'autoprefixer:debug'],
			files: ['src/sass/**/*.scss', 'src/sass/**/*.json'],
		},
		'build-deps': {
			tasks: ['modernizr-build:dist'],
			files: ['build/grunt/modernizr-config.json'],
		},
		'process-vendor': {
			tasks: ['exorcise:vendor'],
			files: ['js/<%= paths.filebase.debugVendorJs %>.js'],
		},
		'process-client': {
			tasks: ['exorcise:client'],
			files: ['js/<%= paths.filebase.debugClientJs %>.js'],
		},
	});

	/* --------------------------------
	/* clean
	/* -------------------------------- */

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.config('clean', {
		js: { src: ['./js/*'] },
		css: { src: ['./css/*'] },
	});

	/* --------------------------------
	/* copy
	/* -------------------------------- */

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.config('copy', {
		resources: {
			files: [{
				flatten: true,
				expand: true,
				dest: './fonts/',
				src: [
					'./node_modules/@folio/webfonts/build/fonts/folio-figures/*.<%= paths.ext.fonts %>',
					// './node_modules/@folio/webfonts/build/fonts/brown/*.<%= paths.ext.fonts %>',
					// './node_modules/@folio/webfonts/build/fonts/rubik/*.<%= paths.ext.fonts %>',
					'./src/resources/fonts/franklin-gothic-fs/*.<%= paths.ext.fonts %>',
				]
			}]
		},
		favicons: {
			files: [{
				flatten: false,
				expand: true,
				dest: './images/favicons',
				cwd: './node_modules/@folio/favicons/build/',
				src: [
						// './node_modules/@folio/favicons/build/**/*',
						'**/*.{png,ico}',
					]
				}]
		},
		sources: {
			options: {
				process: function(content, srcpath) {
					return content.replace(/(\s)url\((["']).*?(?=[^\/]*["'])/g, '$1font-url($2');
				}
			},
			files: [{
				flatten: true,
				expand: true,
				dest: './build/generated/sass/fonts',
				src: [
					'./node_modules/@folio/webfonts/build/sass/_folio-figures.scss',
					// './node_modules/@folio/webfonts/build/sass/_brown.scss',
					// './node_modules/@folio/webfonts/build/sass/_rubik.scss',
					'./src/resources/fonts/franklin-gothic-fs/*.css',
				],
				rename: function(dest, src) {
					var name = path.parse(src).name;
					name = name.replace(/^_/g, '').toLowerCase();
					// if (name.charAt(0) != '_') name = '_' + name;
					return dest + path.sep + name + '.scss';
				}
			}]
		}
	});

	/* ---------------------------------
	/* Style Sheets
	/* --------------------------------- */

	grunt.registerTask('debug-styles-sass', [
		'sass:debug',
		'sass:fonts-debug',
		'sass:ie',
		'autoprefixer:debug'
	]);

	// grunt.loadNpmTasks('grunt-sass-format');
	// grunt.loadNpmTasks('grunt-sass');
	// grunt.loadNpmTasks('grunt-contrib-compass');

	/* sass
	/* `npm install --save-dev grunt-sass`
	/* `npm install --save-dev compass-importer`
	/* `npm install --save-dev node-sass-json-importer`
	/* `npm install --save-dev node-sass-import-once`
	/* `npm install --save-dev compass-sass-mixins`
	/* - - - - - - - - - - - - - - - - - */

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.config('sass', {
		options: {
			sourcemap: 'none',
			precision: 9,
			loadPath: [
				'src/sass',
				'node_modules/compass-mixins/lib/',
				'build/generated/sass/'
			],
			require: [
				'sass-json-vars',
				'compass-import-once'
			]
		}
	});
	grunt.config('sass.debug', {
		options: {
			sourcemap: 'auto',
		},
		files: {
			'css/folio-debug.css': 'src/sass/<%= paths.filebase.debugStyles %>.scss',
		}
	});
	grunt.config('sass.fonts-debug', {
		files: {
			'css/fonts-debug.css': 'src/sass/fonts-debug.scss',
		}
	});
	grunt.config('sass.ie', {
		files: {
			'css/folio-ie.css': 'src/sass/folio-ie.scss',
		}
	});

	/* libsass
	/* - - - - - - - - - - - - - - - - - */

	/*
	grunt.loadNpmTasks('grunt-sass');
	grunt.config('sass', {
		options: {
			// precision: 9,
			includePaths: [
				'src/sass',
				// 'node_modules/compass-mixins/lib/',
			],
			importer: [
				require('node-sass-json-importer'),
				require('compass-importer'),
				// require('node-sass-import-once'),
			],
			// functions: {'image-url($url)': function(url) {
			// url.setValue('url("../images/' + url.getValue() + '")'); return url;
			// }}
		},
		debug: {
			options: {
				sourceMap: true,
				sourceComments: true,
				outputStyle: 'expanded',
			},
			files: {
				'css/folio-debug.css': 'src/sass/<%= paths.filebase.debugStyles %>.scss',
			}

		}
	});
	*/

	/* - - - - - - - - - - - - - - - - - -
	 * compass
	 *
	 * NOTE: dependencies
	 * `gem install compass sass-json-vars compass-import-once`
	 * - - - - - - - - - - - - - - - - - */

	/*
	grunt.registerTask('debug-styles-compass', [
		'compass:debug',
		'compass:fonts-debug',
		'compass:ie',
		'autoprefixer:debug'
	]);

	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.config('compass.options', {
		require: [
			'sass-json-vars',
			'compass-import-once',
			'./build/grunt/compass-encode.rb',
			// alternative to compass inline-image()
		],
		sassDir: 'src/sass',
		cssDir: 'css/compass',
		imagesDir: 'images',
		fontsDir: 'fonts',
		javascriptsDir: 'js',
		relativeAssets: true,
		importPath: [
			'node_modules/compass-mixins/lib/',
			'build/generated/sass/'
		]
		//httpPath: '/workspace/assets',
	});
	grunt.config('compass.clean.options', {
		clean: true
	});
	grunt.config('compass.debug.options', {
		specify: ['src/sass/<%= paths.filebase.debugStyles %>.scss'],
		sourcemap: true,
	});
	grunt.config('compass.fonts-debug.options', {
		specify: 'src/sass/fonts-debug.scss',
		sourcemap: false,
		assetCacheBuster: true,
	});
	grunt.config('compass.ie.options', {
		specify: ['src/sass/<%= paths.filebase.ieStyles %>.scss'],
		sourcemap: false,
	});
	*/

	/* autoprefixer
	/* - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.config('autoprefixer.debug', {
		options: {
			// map: {
			// 	prev: 'css/',
			// 	sourcesContent: true
			// },
			// diff: true,
			map: true,
			// safe: true,

		},
		src: 'css/folio-debug.css', //'css/<%= paths.filebase.debugStyles %>.css'
		// files: {'css/<%= paths.filebase.debugStyles %>.css': 'css/<%= paths.filebase.debugStyles %>.css',
		// 'css/fonts.css': 'css/fonts.css'},
	});


	/* -------------------------------- */
	/* base64 font encode and embed		*/
	/* -------------------------------- */


	// var xmlWrapper = {
	// 	header: '<?xml version="1.0" encoding="UTF-8"?><data><![CDATA[',
	// 	footer: ']]></data>',
	// };
	// grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.config('copy.fonts-xmlwrap', {
		options: {
			process: function(content, srcpath) {
				return '<?xml version="1.0" encoding="UTF-8"?><data><![CDATA[' + content + ']]></data>';
			}
		},
		files: [{
			flatten: true,
			expand: true,
			src: 'fonts/base64/*.b64',
			dest: 'fonts/base64',
			ext: '.xml',
			extDot: 'last',
		}]
	});

	grunt.loadNpmTasks('grunt-embed-fonts');
	grunt.config('embedFonts.fonts-inline', {
		options: {
			applyTo: ['woff2', 'woff', 'ttf']
		},
		files: {
			'css/fonts-inline.css': ['css/fonts.css']
		}
	});

	grunt.registerTask('fonts-inline', ['sass:dist', 'embedFonts:fonts-inline']);

	/* --------------------------------
	/* Build JS dependencies
	/* -------------------------------- */

	grunt.loadTasks('./build/grunt/tasks');
	grunt.config('modernizr-build.dist', {
		files: {
			'./build/generated/js/modernizr-dist.js': [
				'./build/grunt/modernizr-config.json'
			]
		}
	});

	/* --------------------------------
	/* Javascript
	/* -------------------------------- */

	/* browserify */
	grunt.loadNpmTasks('grunt-browserify');
	grunt.config('browserify.options', {
		browserifyOptions: {
			fullPaths: false,
			debug: true
		},
	});

	/* browserify:vendor */
	grunt.config('browserify.vendor', {
		dest: './js/<%= paths.filebase.debugVendorJs %>.js',
		src: [],
		options: {
			exclude: [
				'jquery'
			],
			require: [
				'underscore',
				'webfontloader',
				// 'underscore.string',
				'backbone',
				'backbone.native',
				'Backbone.Mutators',
				'backbone.babysitter',
				'hammerjs',
				'color',
				'es6-promise',
				'classlist-polyfill',
				'cookies-js',
			],
			alias: [
				'./build/generated/js/modernizr-dist.js:modernizr-dist',
				'./src/js/shims/modernizr-shim.js:Modernizr',
				'./src/js/shims/fullscreen.js:fullscreen-polyfill',
				'./src/js/shims/matchesSelector.js:matches-polyfill',
				'./src/js/shims/requestAnimationFrame.js:raf-polyfill',
				'./src/js/shims/math-sign-polyfill.js:math-sign-polyfill',
				'./node_modules/webcomponents.js/MutationObserver.js:mutation-polyfill',
				// './node_modules/path2d-polyfill/build/index.js:path2d-polyfill',
			]
		},
	});

	/*
		NOTE: path2d-polyfill has to be manually build with babel,
		not included in build yet:
		`cd ./node_modules/path2d-polyfill/ && \
			npm install --save-dev babel-cli && \
			./node_modules/.bin/babel src -d build --presets env`
	*/

	/* browserify:client */
	grunt.config('browserify.client', {
		dest: './js/<%= paths.filebase.debugClientJs %>.js',
		src: ['./src/js/app/App.js'],
		options: {
			browserifyOptions: {
				debug: true,
				fullPaths: false,
				insertGlobalVars: {
					DEBUG: function(file, dir) { return true; },
					GA: function(file, dir) { return true; },
				}
			},
			transform: [
				['hbsfy', { traverse: true, extensions: ['hbs'] }],
				// ['node-underscorify', { extensions: ['tpl'] }],
			],
			plugin: [
				['remapify',
					[
						{
							expose: 'app',
							cwd: './src/js/app',
							src: './**/*.js',
						}, {
							expose: 'utils',
							cwd: './src/js/utils',
							src: './**/*.js',
						}
					]
				]
			],
		}
	});
	/* NOTE: Add requires and aliased requires from vendor as externals in client */
	grunt.config('browserify.client.options.external', (function() {
		// return grunt.config('browserify.vendor.options.require').concat(
		// 	grunt.config('browserify.vendor.options.alias').map(function(s) {
		// 		return s.split(':').pop();
		// 	}));
		// aliases first
		return grunt.config('browserify.vendor.options.alias')
			.map(function(s) {
				return s.split(':').pop();
			})
			.concat(grunt.config('browserify.vendor.options.require'));
	}()));

	grunt.config('browserify.watch-vendor', grunt.config('browserify.vendor'));
	grunt.config('browserify.watch-vendor.options.watch', true);
	grunt.config('browserify.watch-client', grunt.config('browserify.client'));
	grunt.config('browserify.watch-client.options.watch', true);

	/* Extract source maps from browserify */
	grunt.loadNpmTasks('grunt-exorcise');
	grunt.config('exorcise', {
		options: {
			strict: false,
			root: '../',
			// root: '/workspace/assets/'
		},
		vendor: {
			files: {
				'./js/<%= paths.filebase.debugVendorJs %>.js.map': ['./js/<%= paths.filebase.debugVendorJs %>.js']
				// './js/<%= paths.filebase.debugVendorJs %>.js.map': [ grunt.config('browserify.vendor.dest') ]
			}
		},
		client: {
			files: {
				'./js/<%= paths.filebase.debugClientJs %>.js.map': ['./js/<%= paths.filebase.debugClientJs %>.js']
				// './js/<%= paths.filebase.debugClientJs %>.js.map': [ grunt.config('browserify.client.dest') ]
			}
		},
	});


	/* --------------------------------
	/* Create symlinks to js deps for quick access
	/* -------------------------------- */

	grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.config('symlink.vendor', {
		files: [{
			expand: true,
			overwrite: false,
			filter: 'isDirectory',
			cwd: 'node_modules',
			dest: 'build/src/lib',
			src: grunt.config('browserify.vendor.options.require').concat()
		}]
	});

	/* --------------------------------
	/* dist
	/* -------------------------------- */

	grunt.config('sass.dist', {
		// options: {
		// 	sourceMap: false,
		// 	sourceComments: false,
		// 	outputStyle: 'compressed',
		// },
		files: {
			'css/folio.css': 'src/sass/<%= paths.filebase.distStyles %>.scss',
			'css/folio-ie.css': 'src/sass/folio-ie.scss',
			'css/fonts.css': 'src/sass/fonts.scss',
		}
	});

	/*
	grunt.config('compass.dist.options', {
		specify: 'src/sass/<%= paths.filebase.distStyles %>.scss',
		sourcemap: false,
		environment: 'production',
		outputStyle: 'compressed',
		// httpPath: '/workspace/assets',
	});

	grunt.config('compass.fonts-dist.options', {
		specify: 'src/sass/fonts.scss',
		sourcemap: false,
		assetCacheBuster: false,
		environment: 'production',
		outputStyle: 'compressed'
	});
	*/

	grunt.config('autoprefixer.dist', {
		options: {
			map: false
		},
		files: {
			'css/<%= paths.filebase.distStyles %>.css': 'css/<%= paths.filebase.distStyles %>.css'
		}
	});

	grunt.config('browserify.dist', {
		src: ['./src/js/app/App.js'],
		dest: './js/<%= paths.filebase.distJs %>.js',
		// dest: './build/tasks/browserify.dist/<%= paths.filebase.distJs %>.js',
		options: _.defaults({
				external: [],
				browserifyOptions: {
					debug: false,
					fullPaths: false,
					insertGlobalVars: {
						DEBUG: function(file, dir) { return false; },
						GA: function(file, dir) { return true; }
					}
				},
			},
			grunt.config('browserify.vendor.options'),
			grunt.config('browserify.client.options')
		),
		// options: {
		// 	browserifyOptions: {
		// 		fullPaths: false,
		// 		debug: false
		// 	},
		// 	exclude: grunt.config('browserify.vendor.options.exclude'),
		// 	require: grunt.config('browserify.vendor.options.require'),
		// 	alias: grunt.config('browserify.vendor.options.alias'),
		//
		// 	transform: grunt.config('browserify.client.options.transform'),
		// 	plugin: grunt.config('browserify.client.options.plugin'),
		// },
	});

	/* Uglify */
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.config('uglify.dist', {
		options: {
			sourceMap: false,
			mangle: true,
			compress: {
				dead_code: true,
				drop_console: true,
				global_defs: {
					'DEBUG': false,
					'GA': true,
				},
			}
		},
		files: {
			'js/<%= paths.filebase.distJs %>.js': ['./js/<%= paths.filebase.distJs %>.js']
			// 'js/<%= paths.filebase.distJs %>.js': [grunt.config('browserify.dist.dest')]
		}
	});

	/* Remove most console messages */
	var dropFuncs = [
		'console.log',
		'console.info',
		// 'console.warn',
		// 'console.error',
		'console.group',
		'console.groupCollapsed',
		'console.groupEnd'
	];
	grunt.config('uglify.dist.options.mangle.reserve', dropFuncs);
	grunt.config('uglify.dist.options.compress.pure_funcs', dropFuncs);
	grunt.config('uglify.dist.options.compress.drop_console', false);

	/* --------------------------------
	/* offline data
	/* -------------------------------- */
	grunt.loadNpmTasks('grunt-http');
	grunt.config('http', {
		options: {
			ignoreErrors: true
		},
		bootstrap: {
			options: { url: '<%= paths.web.root %>/json' },
			dest: '<%= paths.src.generated %>/js/bootstrap.js'
		}
	});
};