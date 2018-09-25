/*global module*/

'use strict';

module.exports = function(grunt) {

	var _ = require('underscore');
	// var path = require('path');

	grunt.config('pkg', grunt.file.readJSON('package.json'));

	grunt.config('paths', {
		src: {
			js: 'src/js',
			sass: 'src/sass',
			main: 'src/js/App.js'
		},
		resources: 'src/resources',
		target: 'build/target',
		debug: {
			main: 'js/folio-debug-client.js',
			vendor: 'js/folio-debug-vendor.js',
			styles: 'css/folio-debug.css',
			fonts: 'css/folio-fonts.css',
			ieStyles: 'css/folio-debug-ie.css'
		},
		dist: {
			main: 'js/folio.js',
			styles: 'css/folio-debug.css',
			ieStyles: 'css/folio-ie.css'
		},
		ext: {
			fonts: '{eot,woff,woff2,svg,ttf,otf}',
		},
		web: {
			root: 'http://localhost/projects/folio-sym',
			workspace: '<%= paths.web.root %>/workspace'
		}
	});

	/* --------------------------------
	 * Main Targets
	 * -------------------------------- */

	// resources
	grunt.registerTask('deps-clean', ['clean:favicons', 'clean:font-files', 'clean:font-sass']);
	grunt.registerTask('deps-install', ['deps-clean', 'copy:favicons', 'copy:font-files', 'copy:font-sass', 'modernizr-build:dist', 'symlink:vendor']);

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
	 * watch
	 * -------------------------------- */

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
			files: ['<%= paths.debug.vendor %>'],
		},
		'process-client': {
			tasks: ['exorcise:client'],
			files: ['<%= paths.debug.main %>'],
		},
	});

	/* --------------------------------
	 * clean
	 * -------------------------------- */

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.config('clean', {
		'js': { src: ['js/*'] },
		'css': { src: ['css/*'] },
		'favicons': { src: ['images/favicons'] },
		'font-files': { src: ['fonts/*.<%= paths.ext.fonts %>'] },
		'font-sass': { src: ['build/target/sass/fonts/*.scss', './build/target/sass/fonts/'] },

	});

	/* --------------------------------
	 * copy
	 * -------------------------------- */

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.config('copy', {
		'font-files': {
			files: [{
				flatten: true,
				expand: true,
				dest: 'fonts/',
				cwd: 'node_modules/@folio/webfonts/build/fonts/',
				src: [
					'folio-figures/*.<%= paths.ext.fonts %>',
					'franklin-gothic-fs/*.<%= paths.ext.fonts %>',
					// 'libre-franklin/*.<%= paths.ext.fonts %>',
				]
			}]
		},
		'font-sass': {
			options: {
				process: function(content, srcpath) {
					return content.replace(/(\s)url\((["']).*?(?=[^\/]*["'])/g, '$1font-url($2');
				}
			},
			files: [{
				flatten: true,
				expand: true,
				dest: 'build/target/sass/fonts',
				cwd: 'node_modules/@folio/webfonts/build/sass/',
				src: [
					'_franklin-gothic-fs.scss',
					'_folio-figures.scss',
					// '_libre-franklin.scss',
				],
				// rename: function(dest, src) {
				// 	var name = path.parse(src).name;
				// 	name = name.replace(/^_/g, '').toLowerCase();
				// 	// if (name.charAt(0) != '_') name = '_' + name;
				// 	return dest + path.sep + name + '.scss';
				// }
			}]
		},
		'favicons': {
			files: [{
				flatten: false,
				expand: true,
				dest: 'images/favicons/',
				cwd: 'node_modules/@folio/favicons/build/',
				src: ['**/*.{png,ico}']
			}]
		},
	});

	/* ---------------------------------
	 * Style Sheets
	 * --------------------------------- */

	grunt.registerTask('debug-styles-sass', [
		'sass:debug',
		'sass:fonts',
		'sass:ie',
		'autoprefixer:debug'
	]);

	// grunt.loadNpmTasks('grunt-sass-format');
	// grunt.loadNpmTasks('grunt-sass');
	// grunt.loadNpmTasks('grunt-contrib-compass');

	/* sass
	 * `npm install --save-dev grunt-sass`
	 * `npm install --save-dev compass-importer`
	 * `npm install --save-dev node-sass-json-importer`
	 * `npm install --save-dev node-sass-import-once`
	 * `npm install --save-dev compass-sass-mixins`
	 * - - - - - - - - - - - - - - - - - */

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.config('sass', {
		options: {
			sourcemap: 'none',
			precision: 9,
			loadPath: [
				'src/sass',
				'node_modules/compass-mixins/lib/',
				'build/target/sass/'
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
			'css/folio-debug.css': 'src/sass/folio-debug.scss',
		}
	});
	grunt.config('sass.fonts', {
		files: {
			'css/fonts.css': 'src/sass/fonts.scss',
		}
	});
	grunt.config('sass.ie', {
		files: {
			'css/folio-ie.css': 'src/sass/folio-ie.scss',
		}
	});

	/* autoprefixer
	 * - - - - - - - - - - - - - - - - - */
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
		src: 'css/folio-debug.css',
	});

	/* --------------------------------
	 * Javascript
	 * -------------------------------- */

	/* browserify
	 * -------------------------------- */
	grunt.loadNpmTasks('grunt-browserify');
	grunt.config('browserify.options', {
		browserifyOptions: {
			fullPaths: false,
			debug: true
		},
	});

	/* browserify:vendor
	 * -------------------------------- */
	grunt.config('browserify.vendor', {
		dest: './<%= paths.debug.vendor %>',
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
				'es6-promise/auto',
				'classlist-polyfill',
				'cookies-js',
				'mutation-observer'
			],
			alias: [
				'./build/target/modernizr-build/modernizr-dist.js:modernizr-dist',
				'./src/js/shims/modernizr-shim.js:Modernizr',
				'./src/js/shims/fullscreen.js:fullscreen-polyfill',
				'./src/js/shims/matchesSelector.js:matches-polyfill',
				'./src/js/shims/requestAnimationFrame.js:raf-polyfill',
				'./src/js/shims/math-sign-polyfill.js:math-sign-polyfill',
				// './node_modules/webcomponents.js/MutationObserver.js:mutation-polyfill',
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

	/* browserify:client
	 * -------------------------------- */
	grunt.config('browserify.client', {
		dest: './<%= paths.debug.main %>',
		src: ['./src/js/app/App.js'],
		options: {
			browserifyOptions: {
				debug: true,
				fullPaths: false,
				insertGlobalVars: {
					'DEBUG': function(file, dir) { return 'true'; },
					'GA': function(file, dir) { return 'false'; },
					'_': function(file, dir) { return require('underscore'); },
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

	/* exorcise:client exorcise:vendor
	 * Extract source maps from browserify
	 * -------------------------------- */
	grunt.loadNpmTasks('grunt-exorcise');
	grunt.config('exorcise', {
		options: {
			strict: false,
			root: '../',
			// root: '/workspace/assets/'
		},
		vendor: {
			files: {
				'./<%= paths.debug.vendor %>.map': [
					'./<%= paths.debug.vendor %>'
				]
				// './<%= paths.debug.vendor %>.map': [ grunt.config('browserify.vendor.dest') ]
			}
		},
		client: {
			files: {
				'./<%= paths.debug.main %>.map': [
					'./<%= paths.debug.main %>'
				]
				// './<%= paths.debug.main %>.map': [ grunt.config('browserify.client.dest') ]
			}
		},
	});

	/* --------------------------------
	 * dist
	 * -------------------------------- */

	grunt.config('sass.dist', {
		// options: {
		// 	sourceMap: false,
		// 	sourceComments: false,
		// 	outputStyle: 'compressed',
		// },
		files: {
			'css/folio.css': 'src/sass/folio.scss',
			'css/folio-ie.css': 'src/sass/folio-ie.scss',
			'css/fonts.css': 'src/sass/fonts.scss',
		}
	});

	grunt.config('autoprefixer.dist', {
		options: {
			map: false
		},
		files: {
			'<%= paths.dist.styles %>': '<%= paths.dist.styles %>'
		}
	});

	grunt.config('browserify.dist', {
		src: ['./src/js/app/App.js'],
		dest: './<%= paths.dist.main %>',
		options: _.defaults({
				external: [],
				browserifyOptions: {
					debug: false,
					fullPaths: false,
					insertGlobalVars: {
						'DEBUG': function(file, dir) { return 'false'; },
						'GA': function(file, dir) { return 'true'; },
						'_': function(file, dir) { return require('underscore'); },
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

	/* uglify:dist
	 * -------------------------------- */
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
			'<%= paths.dist.main %>': ['./<%= paths.dist.main %>']
			// '<%= paths.dist.main %>': [grunt.config('browserify.dist.dest')]
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

	/* Build JS dependencies
	 * modernizr-build:dist
	 * -------------------------------- */
	grunt.loadTasks('./build/tasks/modernizr-build');
	grunt.config('modernizr-build.dist', {
		files: {
			'./build/target/modernizr-build/modernizr-dist-all.js': [
				'./build/tasks/modernizr-build/modernizr-config-all.json'
			],
			'./build/target/modernizr-build/modernizr-dist.js': [
					'./build/tasks/modernizr-build/modernizr-config.json'
				]
		}
	});

	/* --------------------------------
	 * http:cms
	 * Get offline data from CMS
	 * -------------------------------- */
	grunt.loadNpmTasks('grunt-http');
	grunt.config('http', {
		options: {
			ignoreErrors: true
		},
		cms: {
			options: { url: '<%= paths.web.root %>/json' },
			dest: '<%= paths.target %>/http-cms/bootstrap.js'
		}
	});

	/* --------------------------------
	 * js_beautify:scripts
	 * -------------------------------- */
	grunt.loadNpmTasks('grunt-js-beautify');
	grunt.config('js_beautify.scripts', {
		files: {
			sources: [
				"<%= paths.src.js %>/app/**/*.js",
				"<%= paths.src.js %>/utils/**/*.js"
			]
		}
	});
	grunt.config('js_beautify.sources.options', grunt.file.readJSON('.jsbeautifyrc'));


	/* --------------------------------
	 * symlink:vendor
	 * Create symlinks to js deps for quick access
	 * -------------------------------- */
	grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.config('symlink.vendor', {
		files: [{
			expand: true,
			overwrite: false,
			filter: 'isDirectory',
			cwd: 'node_modules',
			dest: 'build/target/symlink-vendor',
			src: grunt.config('browserify.vendor.options.require').concat([
				'webcomponents.js',
				'path2d-polyfill'
			])
		}]
	});

	grunt.registerTask('fonts-inline', ['sass:dist', 'embedFonts:fonts-inline']);

};
