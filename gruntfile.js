/* eslint-env node, es6 */
'use strict';

module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

	const _ = require('underscore');
	// const path = require('path');

	grunt.config('pkg', grunt.file.readJSON('package.json'));

	grunt.config('paths', {
		src: {
			js: 'src/js',
			sass: 'src/sass',
			main: 'src/js/App.js'
		},
		resources: 'src/resources',
		target: 'build/target',
		dev: {
			main: 'js/folio-dev-main.js',
			vendor: 'js/folio-dev-vendor.js',
			styles: 'css/folio-dev.css',
			fonts: 'css/folio-fonts.css',
			ieStyles: 'css/folio-dev-ie.css'
		},
		dist: {
			main: 'js/folio.js',
			styles: 'css/folio.css',
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
	grunt.registerTask('deps-clean', [
		'clean:favicons',
		'clean:font-files',
		'clean:font-sass'
	]);
	grunt.registerTask('deps-install', [
		'deps-clean',
		'copy:favicons',
		'copy:font-files',
		'copy:font-sass',
		'modernizr-build:dist',
		'symlink:vendor'
	]);
	grunt.registerTask('install', ['deps-install']);

	grunt.registerTask('clean-all', [
		'clean:js',
		'clean:css'
	]);

	// dev build tasks
	/* NOTE dev-styles defined next to task config */
	grunt.registerTask('dev-styles', [
		'dev-styles-sass'
	]);
	grunt.registerTask('dev-vendor', [
		'browserify:dev-vendor',
		'exorcise:dev-vendor'
	]);
	grunt.registerTask('dev-main', [
		'browserify:dev-main',
		'exorcise:dev-main'
	]);

	// dist build tasks
	grunt.registerTask('dist-styles', [
		'sass:dist',
		'sass:ie',
		'autoprefixer:dist'
	]);
	grunt.registerTask('dist-js', [
		'browserify:dist',
		// 'uglify:dist'
		'exorcise:dist'
	]);

	// watch
	grunt.registerTask('watch-dev', [
		'browserify-watch',
		'watch'
	]);

	grunt.registerTask('dist', ['dist-js', 'dist-styles']);
	grunt.registerTask('dev', ['dev-vendor', 'dev-main', 'dev-styles']);
	grunt.registerTask('build', ['dev', 'dist']);
	grunt.registerTask('rebuild', ['clean-all', 'build']);
	// Default task
	grunt.registerTask('default', ['dev', 'watch-dev']);

	/* --------------------------------
	 * watch
	 * -------------------------------- */

	// grunt.loadNpmTasks('grunt-contrib-watch');
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
			tasks: ['sass:dev', 'sass:ie', 'autoprefixer:dev'],
			files: ['src/sass/**/*.scss', 'src/sass/**/*.json'],
		},
		'build-deps': {
			tasks: ['modernizr-build:dist'],
			files: ['build/tasks/modernizr-build/modernizr-config.json'],
		},
		'process-vendor': {
			tasks: ['exorcise:dev-vendor'],
			files: ['<%= paths.dev.vendor %>'],
		},
		'process-main': {
			tasks: ['exorcise:dev-main'],
			files: ['<%= paths.dev.main %>'],
		},
	});

	/* --------------------------------
	 * clean
	 * -------------------------------- */

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.config('clean', {
		'js': { src: ['js/*'] },
		'css': { src: ['css/*'] },
		'babel': { src: ['build/target/babel'] },
		'favicons': { src: ['images/favicons'] },
		'font-files': { src: ['fonts/*.<%= paths.ext.fonts %>'] },
		'font-sass': { src: ['build/target/sass/fonts/*.scss', './build/target/sass/fonts/'] },

	});

	/* --------------------------------
	 * copy
	 * -------------------------------- */

	// grunt.loadNpmTasks('grunt-contrib-copy');
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
				// 	let name = path.parse(src).name;
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
	 * dev stylesheets
	 * --------------------------------- */

	grunt.registerTask('dev-styles-sass', [
		'sass:dev',
		'sass:fonts',
		'sass:ie',
		'autoprefixer:dev'
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

	// grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.config('sass', {
		options: {
			sourcemap: 'none',
			precision: 9,
			require: [
				'sass-json-vars',
				'compass-import-once'
			],
			loadPath: [
				'src/sass',
				'node_modules/compass-mixins/lib/',
				'build/target/sass/'
			],
		}
	});
	grunt.config('sass.dev', {
		options: {
			sourcemap: 'auto',
		},
		files: {
			'css/folio-dev.css': 'src/sass/folio-dev.scss',
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
	// grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.config('autoprefixer.dev', {
		options: {
			// map: {
			// 	prev: 'css/',
			// 	sourcesContent: true
			// },
			// diff: true,
			map: true,
			// safe: true,

		},
		src: 'css/folio-dev.css',
	});

	/* --------------------------------
	 * Javascript
	 * -------------------------------- */


	/* browserify
	 * - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks('grunt-browserify');
	grunt.config('browserify.options', {
		exclude: [
			'jquery'
		],
		browserifyOptions: {
			fullPaths: false,
			debug: true
		},
	});

	/* browserify:vendor
	 * - - - - - - - - - - - - - - - - - */
	grunt.config('browserify.vendor', {
		dest: './js/folio-vendor.js',
		src: [
			'src/js/shims/fullscreen.js',
			'src/js/shims/math-sign-polyfill.js',
		],
		options: {
			require: [
				'underscore',
				'setimmediate',
				'webfontloader',
				'hammerjs',
				'color',
				'backbone',
				'backbone.native',
				'Backbone.Mutators',
				'backbone.babysitter',
			],
			alias: [
				'./src/js/shims/fullscreen.js:fullscreen-polyfill',
				'./src/js/shims/math-sign-polyfill.js:math-sign-polyfill',
			]
		},
	});

	/* browserify:polyfills
	 * - - - - - - - - - - - - - - - - - */
	/*
		NOTE: path2d-polyfill has to be manually build with babel,
		not included in build yet:
		`cd ./node_modules/path2d-polyfill/ && \
			npm install --save-dev babel-cli && \
			./node_modules/.bin/babel src -d build --presets env`
		add to config:
		`{
			src: [ 'node_modules/path2d-polyfill/build/index.js'],
			options: {
				alias: [
					'node_modules/path2d-polyfill/build/index.js:path2d-polyfill',
				]
			}
		}`
	*/
	grunt.config('browserify.polyfills', {
		dest: 'js/folio-polyfills.js',
		src: [
			'src/js/shims/matchesSelector.js',
			'src/js/shims/requestAnimationFrame.js',
			'node_modules/es6-promise/auto.js'
		],
		options: {
			require: [
				'classlist-polyfill',
				'mutation-observer',
				'path2d-polyfill',
				// 'es6-promise/auto',
			],
			alias: [
				'./src/js/shims/requestAnimationFrame.js:raf-polyfill',
				'./src/js/shims/matchesSelector.js:matches-polyfill',
				// './node_modules/es6-promise/auto.js:es6-promise/auto'
			],
		}
	});

	/* browserify:dev
	 * - - - - - - - - - - - - - - - - - */
	grunt.config('browserify.dev-vendor', {
		dest: 'js/folio-dev-vendor.js',
		src: [].concat(
			grunt.config('browserify.polyfills.src'),
			grunt.config('browserify.vendor.src'),
			[
				'build/target/modernizr-build/modernizr-dist.js',
				'src/js/shims/modernizr-shim.js'
			]
		),
		options: {
			require: [
				'cookies-js',
				'underscore.string',
			],
			alias: [].concat(
				grunt.config('browserify.polyfills.options.alias'),
				grunt.config('browserify.vendor.options.alias'),
				[
					'./build/target/modernizr-build/modernizr-dist.js:modernizr-dist',
					'./src/js/shims/modernizr-shim.js:Modernizr',
				]
			)
		}
	});


	/* browserify:dev-main
	 * - - - - - - - - - - - - - - - - - */

	/* NOTE: Add requires and aliases from vendor as external */
	let JS_EXTERNAL_MODULES = [
		// 'browserify.polyfills.options',
		// 'browserify.vendor.options',
		'browserify.dev-vendor.options',
	].reduce((r, s) => {
		let o = grunt.config(s);
		if (Array.isArray(o.alias))
			r = r.concat(o.alias.map((ss) => ss.split(':').pop()));
		if (Array.isArray(o.require))
			r = r.concat(o.require);
		return r;
	}, []);

	grunt.config('browserify.dev-main', {
		dest: './<%= paths.dev.main %>',
		src: ['./src/js/app/App.js'],
		options: {
			external: JS_EXTERNAL_MODULES,
			browserifyOptions: {
				debug: true,
				fullPaths: false,
				insertGlobalVars: {
					'DEBUG': (file, dir) => 'true',
					'GA': (file, dir) => 'false',
					'_': (file, dir) => 'require("underscore")',
				}
			},
			transform: [
				[
					'hbsfy',
					{
						traverse: true,
						extensions: ['hbs']
					}
				],
				[
					'babelify',
					{
						global: true,
						only: ['./src/js/**/*.js'],
					}
				],
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

	/* browserify:*-watch
	 * - - - - - - - - - - - - - - - - - */
	grunt.registerTask('browserify-watch', [
		'browserify.dev-vendor',
		'browserify.dev-main'
	].map(t => {
		let wo = _.clone(grunt.config(t)),
			wt = t + '-watch';
		wo.options.watch = true;
		grunt.config(wt, wo);
		return wt.replace(/\./, ':');
	}));

	/* exorcise:client exorcise:vendor
	 * Extract source maps from browserify
	 * - - - - - - - - - - - - - - - - - */
	// grunt.loadNpmTasks('grunt-exorcise');
	grunt.config('exorcise', {
		options: {
			strict: false,
			root: '../',
		},
		'dev-vendor': {
			files: {
				'./<%= paths.dev.vendor %>.map': [
					'./<%= paths.dev.vendor %>'
				]
			}
		},
		'dev-main': {
			files: {
				'./<%= paths.dev.main %>.map': [
					'./<%= paths.dev.main %>'
				]
			}
		},
		'dist': {
			files: {
				'./<%= paths.dist.main %>.map': [
					'./<%= paths.dist.main %>'
				]
			}
		},
	});

	/* --------------------------------
	 * Dist stylesheets
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

	/* --------------------------------
	 * Dist javascript
	 * -------------------------------- */
	/* Remove most console messages */
	const DROP_FN = [
		'console.log',
		'console.info',
		// 'console.warn',
		// 'console.error',
		'console.group',
		'console.groupCollapsed',
		'console.groupEnd'
	];

	/* browserify:dist
	 * - - - - - - - - - - - - - - - - - */
	grunt.config('browserify.dist', {
		src: [].concat(
			grunt.config('browserify.polyfills.src'),
			grunt.config('browserify.vendor.src'),
			['./src/js/app/App.js']
		),
		dest: './<%= paths.dist.main %>',
		// dest: 'build/target/browserify-dist/folio.js',
		options: {
			// external: [], // set in browserify:dev-main task, override
			browserifyOptions: {
				debug: true,
				fullPaths: false,
				insertGlobalVars: {
					'DEBUG': function(file, dir) { return 'false'; },
					'GA': function(file, dir) { return 'true'; },
					'_': function(file, dir) { return 'require("underscore")'; },
				}
			},
			transform: [
				[
					'hbsfy',
					{
						traverse: true,
						extensions: ['hbs']
					}
				],
				[
					'babelify',
					{
						global: true,
						only: ['./src/js/**/*.js'],
					}
				],
				[
					'uglifyify',
					{
						global: true,
						sourceMap: true,
						mangle: {
							reserved: DROP_FN
						},
						compress: {
							pure_funcs: DROP_FN,
							drop_console: false, // true
							dead_code: true,
							global_defs: {
								'DEBUG': false,
								'GA': true,
							},
						}
					}
				]
			],
			plugin: grunt.config('browserify.dev-main.options.plugin'),
			// exclude: grunt.config('browserify.vendor.options.exclude'),
			require: [].concat(
				grunt.config('browserify.polyfills.options.require'),
				grunt.config('browserify.vendor.options.require')
			),
			alias: [].concat(
				grunt.config('browserify.polyfills.options.alias'),
				grunt.config('browserify.vendor.options.alias')
			),
		},
		// options: {
		// 	browserifyOptions: {
		// 		fullPaths: false,
		// 		debug: false
		// 	},
		// 	exclude: grunt.config('browserify.vendor.options.exclude'),
		// 	require: grunt.config('browserify.vendor.options.require'),
		// 	alias: grunt.config('browserify.vendor.options.alias'),
		//
		// 	transform: grunt.config('browserify.dev-main.options.transform'),
		// 	plugin: grunt.config('browserify.dev-main.options.plugin'),
		// },
	});

	/* uglify:dist
	 * - - - - - - - - - - - - - - - - - */
	// grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.config('uglify.dist', {
	// 	options: {
	// 		sourceMap: false,
	// 		mangle: true,
	// 		compress: {
	// 			dead_code: true,
	// 			drop_console: true,
	// 			global_defs: {
	// 				'DEBUG': false,
	// 				'GA': true,
	// 			},
	// 		}
	// 	},
	// 	files: {
	// 		'<%= paths.dist.main %>': ['./<%= browserify.dist.dest %>']
	// 	}
	// });

	/* Remove most console messages */
	// grunt.config('uglify.dist.options.mangle.reserve', DROP_FN);
	// grunt.config('uglify.dist.options.compress.pure_funcs', DROP_FN);
	// grunt.config('uglify.dist.options.compress.drop_console', false);

	/* --------------------------------
	 * Utils
	 * -------------------------------- */

	/* babel
	 * compile output to build/target/babel
	 * - - - - - - - - - - - - - - - - - */
	grunt.config('babel', {
		options: {
			sourceMap: false,
			presets: ['@babel/preset-env']
		},
		all: {
			files: [
				{
					flatten: false,
					expand: true,
					dest: 'build/target/babel/',
					cwd: 'src/js/app/',
					src: ['**/*.js']
				}
			]
		},
	});

	/* - - - - - - - - - - - - - - - - -
	 * modernizr-build:dist
	 * Build JS dependencies
	 * - - - - - - - - - - - - - - - - - */
	// grunt.loadTasks('./build/tasks/modernizr-build');
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

	/* - - - - - - - - - - - - - - - - -
	 * http:cms
	 * Get offline data from CMS
	 * - - - - - - - - - - - - - - - - - */
	// grunt.loadNpmTasks('grunt-http');
	grunt.config('http', {
		options: {
			ignoreErrors: true
		},
		cms: {
			options: { url: '<%= paths.web.root %>/json' },
			dest: '<%= paths.target %>/http-cms/bootstrap.js'
		}
	});

	/* - - - - - - - - - - - - - - - - -
	 * js_beautify:scripts
	 * - - - - - - - - - - - - - - - - - */
	// grunt.loadNpmTasks('grunt-js-beautify');
	grunt.config('js_beautify.scripts', {
		files: {
			sources: [
				'<%= paths.src.js %>/app/**/*.js',
				'<%= paths.src.js %>/utils/**/*.js'
			]
		}
	});
	grunt.config('js_beautify.sources.options', grunt.file.readJSON('.jsbeautifyrc'));


	/* - - - - - - - - - - - - - - - - -
	 * symlink:vendor
	 * Create symlinks to js deps for quick access
	 * - - - - - - - - - - - - - - - - - */
	// grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.config('symlink.vendor', {
		files: [{
			expand: true,
			overwrite: false,
			filter: 'isDirectory',
			cwd: 'node_modules',
			dest: 'build/target/symlink-vendor',
			src: grunt.config('browserify.vendor.options.require').concat([
				'mutation-observer',
				'path2d-polyfill'
			])
		}]
	});

	grunt.registerTask('fonts-inline', ['sass:dist', 'embedFonts:fonts-inline']);

};
