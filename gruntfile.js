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

	/* install
	 * - - - - - - - - - - - - - - - - - */
	grunt.registerTask('clean-deps', [
		'clean:favicons',
		'clean:font-files',
		'clean:font-sass',
		'clean:modernizr',
	]);
	grunt.registerTask('install-deps', [
		'clean-deps',
		'copy:favicons',
		'copy:font-files',
		'copy:font-sass',
		'modernizr-build:dist'
	]);
	grunt.registerTask('install-utils', [
		'clean:utils',
		'symlink:vendor',
	]);

	/* dev
	 * - - - - - - - - - - - - - - - - - */
	grunt.registerTask('clean-build', [
		'clean:js',
		'clean:css'
	]);
	grunt.registerTask('dev-styles', [
		'sass:dev',
		'autoprefixer:dev'
	]);
	grunt.registerTask('dev-vendor', [
		'browserify:dev-vendor',
		// 'exorcise:dev-vendor'
	]);
	grunt.registerTask('dev-main', [
		'githash:main',
		'browserify:dev-main',
		'exorcise:dev-main'
	]);
	grunt.registerTask('dev', [
		'dev-vendor',
		'dev-main',
		'dev-styles'
	]);
	grunt.registerTask('watch-dev', [
		'dev', // build once before watch
		'browserify-watch',
		'watch'
	]);

	/* dist
	 * - - - - - - - - - - - - - - - - - */
	grunt.registerTask('dist-styles', [
		'sass:dist',
		'autoprefixer:dist'
	]);
	grunt.registerTask('dist-js', [
		'githash:main',
		'browserify:dist',
		'exorcise:dist'
	]);
	grunt.registerTask('dist', [
		'dist-js',
		'dist-styles'
	]);

	/* main goals
	 * - - - - - - - - - - - - - - - - - */
	grunt.registerTask('build', ['dev', 'dist']);

	grunt.registerTask('stage', ['build', 'run_grunt:stage']);
	grunt.registerTask('deploy', ['build', 'run_grunt:deploy']);

	grunt.registerTask('install', ['install-deps', 'install-utils']);
	grunt.registerTask('rebuild', ['clean-build', 'build']);
	// Default task
	grunt.registerTask('default', ['watch-dev']);

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
			tasks: ['install', 'rebuild'],
		},
		'build-styles': {
			tasks: ['sass:dev', 'autoprefixer:dev'],
			files: ['src/sass/**/*.scss', 'src/sass/**/*.json'],
		},
		// 'process-vendor': {
		// 	tasks: ['exorcise:dev-vendor'],
		// 	files: ['<%= paths.dev.vendor %>'],
		// },
		'process-main': {
			tasks: ['exorcise:dev-main'],
			files: ['<%= paths.dev.main %>'],
		},
		// 'build-deps': {
		// 	tasks: ['modernizr-build:dist'],
		// 	files: ['build/tasks/modernizr-build/modernizr-config.json'],
		// },
	});


	/* --------------------------------
	 * get current git hash/tag/branch
	 * -------------------------------- */
	grunt.loadNpmTasks('grunt-githash');
	grunt.config('githash.main', {
		options: {}
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
		'font-sass': { src: ['build/target/sass/fonts/*.scss', 'build/target/sass/fonts/'] },

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

	/* ================================
	 * stylesheets
	 * ================================ */

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


	/* sass
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
			// 'css/folio-dev-ie.css': 'src/sass/folio-ie.scss',
			// 'css/folio-dev-fonts.css': 'src/sass/fonts.scss',
		}
	});

	grunt.config('sass.dist', {
		options: {
			sourcemap: 'auto',
			// 	sourceComments: false,
			// 	outputStyle: 'compressed',
		},
		files: {
			'css/folio.css': 'src/sass/folio.scss',
			// 'css/folio-ie.css': 'src/sass/folio-ie.scss',
			// 'css/folio-fonts.css': 'src/sass/fonts.scss',
		}
	});

	/* autoprefixer
	 * - - - - - - - - - - - - - - - - - */
	grunt.config('autoprefixer.dev', {
		options: {
			map: true,
			// map: {
			// 	prev: 'css/',
			// 	sourcesContent: true
			// },
			// diff: true,
			// safe: true,
		},
		files: {
			'<%= paths.dev.styles %>': '<%= paths.dev.styles %>'
		}
	});

	grunt.config('autoprefixer.dist', {
		options: {
			map: true
		},
		files: {
			'<%= paths.dist.styles %>': '<%= paths.dist.styles %>'
		}
	});

	/* ================================
	 * Javascript
	 * ================================ */

	/* browserify
	 * - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks('grunt-browserify');
	grunt.config('browserify.options', {
		exclude: [
			'jquery'
		],
		browserifyOptions: {
			basedir: '.',
			debug: true,
			fullPaths: true,
			paths: [
				'./src/js/'
			],
		}
	});

	/* exorcise
	 * - - - - - - - - - - - - - - - - - */
	// grunt.loadNpmTasks('grunt-exorcise');
	grunt.config('exorcise', {
		options: {
			strict: true,
			root: '.',
		}
	});

	/* browserify:vendor
	 * - - - - - - - - - - - - - - - - - */
	grunt.config('browserify.vendor', {
		dest: './js/folio-vendor.js',
		src: [
			// 'src/js/shims/fullscreen.js',
			// 'src/js/shims/math-sign-polyfill.js',
			// 'src/js/shims/matchesSelector.js',
			// 'src/js/shims/requestAnimationFrame.js',
			// 'node_modules/es6-promise/auto.js'
		],
		options: {
			require: [
				// 'setimmediate',
				// 'es6-promise/auto',
				// 'mutation-observer',
				// 'classlist-polyfill',
				// 'path2d-polyfill',
				'underscore',
				'backbone',
				'backbone.native',
				'backbone.babysitter',
				'Backbone.Mutators',
				'hammerjs',
				'color',
				'webfontloader',
				'hbsfy/runtime',
			],
			alias: [
				// './src/js/shims/fullscreen.js:fullscreen-polyfill',
				// './src/js/shims/math-sign-polyfill.js:math-sign-polyfill',
				// './src/js/shims/requestAnimationFrame.js:raf-polyfill',
				// './src/js/shims/matchesSelector.js:matches-polyfill',
				// './node_modules/es6-promise/auto.js:es6-promise/auto'
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
	// grunt.config('browserify.polyfills', {
	// 	dest: 'js/folio-polyfills.js',
	// 	src: [
	// 	],
	// 	options: {
	// 		require: [
	// 		],
	// 		alias: [
	// 		],
	// 	}
	// });

	/* browserify:dev
	 * - - - - - - - - - - - - - - - - - */
	grunt.config('browserify.dev-vendor', {
		dest: 'js/folio-dev-vendor.js',
		src: [].concat(
			// grunt.config('browserify.polyfills.src'),
			grunt.config('browserify.vendor.src'),
			[
				'build/target/modernizr-build/modernizr-dist.js',
				'src/js/shims/modernizr-shim.js'
			]
		),
		options: {
			require: [].concat(
				// grunt.config('browserify.polyfills.options.require'),
				grunt.config('browserify.vendor.options.require'),
				[
					'cookies-js',
					// 'underscore.string',
				]
			),
			alias: [].concat(
				// grunt.config('browserify.polyfills.options.alias'),
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

	grunt.log.writeln(JS_EXTERNAL_MODULES);

	grunt.config('browserify.dev-main', {
		src: ['./src/js/app/App.js'],
		dest: './<%= paths.dev.main %>',
		options: {
			browserifyOptions: _.extend({
				fullPaths: true,
				insertGlobalVars: {
					'DEBUG': (file, dir) => 'true',
					'GTAG_ENABLED': (file, dir) => 'false',
					'GIT_REV': (file, dir) => `'${grunt.config.process('<%= githash.main.short %>')}'`,
					'_': (file, dir) => 'require("underscore")',
				}
			}, grunt.config('browserify.options.browserifyOptions')),
			external: JS_EXTERNAL_MODULES,
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
						sourceMaps: 'inline',
						only: [
							'./src/js/app/**/*.js',
							'./src/js/utils/**/*.js'
						],
					}
				],
				// [
				// 	'strictify'
				// ],
			],
			plugin: [
				[
					'remapify',
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

	grunt.config('exorcise.dev-vendor', {
		options: {
			root: '../',
			// base: 'src/js/'
		},
		files: {
			'./<%= paths.dev.vendor %>.map': [
				'./<%= paths.dev.vendor %>'
			]
		}
	});

	grunt.config('exorcise.dev-main', {
		options: {
			// base: './src/js/',
			root: '../'
		},
		files: {
			'./<%= paths.dev.main %>.map': [
				'./<%= paths.dev.main %>'
			]
		}
	});

	/* --------------------------------
	 * dist javascript
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
			// grunt.config('browserify.polyfills.src'),
			// grunt.config('browserify.vendor.src'),
			grunt.config('browserify.dev-vendor.src'),
			['./src/js/app/App.js']
		),
		dest: './<%= paths.dist.main %>',
		// dest: 'build/target/browserify-dist/folio.js',
		options: {
			browserifyOptions: _.extend({
				insertGlobalVars: {
					'GIT_REV': (file, dir) => `'${grunt.config.process('<%= githash.main.short %>')}'`,
					'DEBUG': (file, dir) => 'false',
					'GTAG_ENABLED': (file, dir) => 'true',
					'_': (file, dir) => 'require("underscore")',
				}
			}, grunt.config('browserify.options.browserifyOptions')),
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
						sourceMap: {
							includeSources: true
						},
						mangle: {
							reserved: DROP_FN
						},
						compress: {
							pure_funcs: DROP_FN,
							drop_console: false, // true
							dead_code: true,
							global_defs: {
								'DEBUG': false,
								// 'GTAG_ENABLED': true,
								// 'DEBUG': (file, dir) => 'false',
								// 'GTAG_ENABLED': (file, dir) => 'true',
							},
						}
					}
				],
				[
					'strictify'
				]
			],
			plugin: grunt.config('browserify.dev-main.options.plugin'),
			// exclude: grunt.config('browserify.dev-vendor.options.exclude'),
			require: grunt.config('browserify.dev-vendor.options.require'),
			alias: grunt.config('browserify.dev-vendor.options.alias'),
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
	// 				'GTAG_ENABLED': true,
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

	grunt.config('exorcise.dist', {
		// options: { root: '../src/js/' },
		files: {
			'./<%= paths.dist.main %>.map': [
				'./<%= paths.dist.main %>'
			]
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

	/* - - - - - - - - - - - - - - - - -
	 * modernizr-build:dist
	 * Build JS dependencies
	 * - - - - - - - - - - - - - - - - - */
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
	grunt.config('clean.modernizr', {
		src: ['build/target/modernizr-build']
	});

	/* NOTE: browserify + path2d-polyfill
	 * - - - - - - - - - - - - - - - - - */
	/*
		NOTE: path2d-polyfill has to be manually build with babel,
		not included in build yet:
		`cd ./node_modules/path2d-polyfill/ && \
			npm install --save-dev babel-cli && \
			./node_modules/.bin/babel src -d build --presets env`
		add to browserify config:
		`{
			src: [ 'node_modules/path2d-polyfill/build/index.js'],
			options: {
				alias: [
					'node_modules/path2d-polyfill/build/index.js:path2d-polyfill',
				]
			}
		}`
	*/

	/* ================================
	 * deploy
	 * ================================ */

	// grunt.loadNpmTasks('grunt-run-grunt');
	grunt.config('run_grunt.stage', {
		options: {
			task: ['build', 'deploy']
		},
		src: [
			'../fulanito-canillas.github.io/gruntfile.js',
		]
	});
	grunt.config('run_grunt.deploy', {
		options: {
			task: ['build', 'deploy']
		},
		src: [
			'../folio-github.io/gruntfile.js',
		]
	});

	/* ================================
	 * utils
	 * ================================ */

	grunt.config('clean.utils', {
		src: [
			'build/target/symlink-vendor',
			'build/target/http-cms',
			'build/target/babel',
		]
	});

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
			dest: 'build/target/http-cms/bootstrap.js'
		}
	});

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

	grunt.registerTask('fonts-inline', ['sass:dist', 'embedFonts:fonts-inline']);

};
