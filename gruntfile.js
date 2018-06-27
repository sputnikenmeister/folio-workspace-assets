/*global module*/

'use strict';

module.exports = function(grunt) {

	var _ = require('underscore');

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
			fonts: '*.{eot,woff,woff2,svg,ttf,otf}',
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
	grunt.registerTask('deps-install', [
		'copy:resources', 'copy:sources', 'deps-build']);
	grunt.registerTask('deps-build', [
		'compass:fonts', 'build-favicons', 'modernizr-build:production']);

	// debug build tasks
	grunt.registerTask('debug-styles', [
		'compass:debug', 'compass:ie', 'autoprefixer:debug']);
	grunt.registerTask('debug-vendor', [
		'browserify:vendor', 'exorcise:vendor']);
	grunt.registerTask('debug-client', [
		'browserify:client', 'exorcise:client']);
	grunt.registerTask('debug', [
		'debug-vendor', 'debug-client', 'debug-styles']);

	// dist build tasks
	grunt.registerTask('dist-styles', [
		'compass:dist', 'compass:ie', 'autoprefixer:dist']);
	grunt.registerTask('dist-js', [
		'browserify:dist', 'uglify:dist']);
	grunt.registerTask('dist', [
		'dist-js', 'dist-styles']);

	// watch
	grunt.registerTask('debug-watch', [
		'browserify:watch-client', 'browserify:watch-vendor', 'watch']);

	grunt.registerTask('clean-all', [
		'clean:js', 'clean:css', 'compass:clean']);
	grunt.registerTask('build', [
		'debug', 'dist']);
	grunt.registerTask('rebuild', [
		'clean-all', 'deps-install', 'build']);
	// Default task
	grunt.registerTask('default', [
		'debug', 'debug-watch']);

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
			tasks: ['rebuild'],
		},
		'build-styles': {
			tasks: ['compass:debug', 'compass:ie', 'autoprefixer:debug'],
			files: ['src/sass/**/*.scss', 'src/sass/**/*.json'],
		},
		'build-deps': {
			tasks: ['modernizr-build:production'],
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
					'./src/resources/fonts/franklin-gothic-fs/<%= paths.ext.fonts %>',
					// './node_modules/@folio/webfonts-numbers/target/glyphs-app/<%= paths.ext.fonts %>',
					'./node_modules/@folio/webfonts/build/fonts/folio-figures/<%= paths.ext.fonts %>',
					// './node_modules/@folio/webfonts/build/fonts/franklin-gothic-itc-cp/<%= paths.ext.fonts %>',
					// './src/resources/fonts/fontello*/**/<%= paths.ext.fonts %>',
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
				expand: true,
				dest: './build/generated/sass/fonts',
				cwd: './node_modules/@folio/webfonts/build/sass/',
				src: [
					'_folio-figures.scss',
				]
			}]
		}
	});

	/* ---------------------------------
	/* Style Sheets
	/* --------------------------------- */

	/* sass
	/* `npm install --save-dev grunt-sass`
	/* `npm install --save-dev node-sass-json-importer node-sass-import-once`
	/* - - - - - - - - - - - - - - - - - */
	// var sassJsonImporter = require('node-sass-json-importer');
	// var sassImportOnce = require('node-sass-import-once');
	//
	// grunt.loadNpmTasks('grunt-sass');
	// grunt.config('sass', {
	// 	options: {
	// 		includePaths: ['src/sass/', 'build/compass-stylesheets/'],
	// 		importer: [sassJsonImporter] //, sassImportOnce],
	// 	},
	// 	debug: {
	// 		options: {
	// 			sourceMap: true,
	// 		},
	// 		files: {
	// 			'css/folio-debug.css': 'src/sass/<%= paths.filebase.debugStyles %>.scss'
	// 		}
	// 	}
	// });

	/* NOTE: compass dependencies
	 *`gem install compass sass-json-vars compass-import-once`
	 */

	/* compass
	/* - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.config('compass.options', {
		require: [
			'sass-json-vars',
			'compass-import-once',
			'./build/grunt/compass-encode.rb', // alternative to compass inline-image()
		],
		sassDir: 'src/sass',
		cssDir: 'css',
		imagesDir: 'images',
		fontsDir: 'fonts',
		javascriptsDir: 'js',
		relativeAssets: true,
		importPath: [
			'build/generated/sass'
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
	grunt.config('compass.fonts.options', {
		specify: 'src/sass/fonts.scss',
		sourcemap: false,
		// outputStyle: 'compressed',
	});

	grunt.config('compass.ie.options', {
		specify: ['src/sass/<%= paths.filebase.ieStyles %>.scss'],
		sourcemap: true,
	});

	/* autoprefixer
	/* - - - - - - - - - - - - - - - - - */
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.config('autoprefixer.debug', {
		options: { map: true },
		src: 'css/<%= paths.filebase.debugStyles %>.css'
		// files: {'css/<%= paths.filebase.debugStyles %>.css': 'css/<%= paths.filebase.debugStyles %>.css',
		// 'css/fonts.css': 'css/fonts.css'},
	});

	/* - - - - - - - - - - - - - - - - - */
	/* base64 font encode and embed
	/* - - - - - - - - - - - - - - - - - */
	grunt.config('compass.b64fonts.options', {
		specify: 'src/sass/fonts.scss',
		sourcemap: false,
		assetCacheBuster: false,
		cssDir: 'build/generated/b64fonts',
		sassDir: 'src/sass',
		fontsDir: 'fonts',
		environment: 'production',
		outputStyle: 'expanded'
	});

	grunt.loadNpmTasks('grunt-embed-fonts');
	grunt.config('embedFonts', {
		b64fonts: {
			options: {
				applyTo: ['woff', 'woff2']
			},
			files: {
				'build/generated/b64fonts/fonts-embedded.css': ['build/generated/b64fonts/fonts.css']
			}
		},
		franklin: {
			files: [{
				expand: true,
				dest: 'build/generated/b64fonts',
				cwd: 'src/resources/fonts/franklin-gothic-fs/',
				src: [
					'FranklinGothic-Book.css',
					'FranklinGothic-Demi.css',
				]
			}]
		}
	});
	grunt.registerTask('b64fonts', ['compass:b64fonts', 'embedFonts:b64fonts']);

	/* --------------------------------
	/* Build JS dependencies
	/* -------------------------------- */

	grunt.loadTasks('./build/grunt/tasks');
	grunt.config('modernizr-build.production', {
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
		// dest: './build/tasks/browserify.vendor/<%= paths.filebase.debugVendorJs %>.js',
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
				// './node_modules/webcomponents.js/MutationObserver.js:mutationobserver-polyfill',
				'./build/generated/js/modernizr-dist.js:modernizr-dist',
				'./src/js/shims/modernizr-shim.js:Modernizr',
				'./src/js/shims/fullscreen.js:fullscreen-polyfill',
				'./src/js/shims/matchesSelector.js:matches-polyfill',
				'./src/js/shims/requestAnimationFrame.js:raf-polyfill',
				'./src/js/shims/math-sign-polyfill.js:math-sign-polyfill',
			]
		},
	});

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
				['hbsfy', { extensions: ['hbs'] }],
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
		return grunt.config('browserify.vendor.options.alias').map(function(s) {
			return s.split(':').pop();
		}).concat(grunt.config('browserify.vendor.options.require'));

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
	/* dist
	/* -------------------------------- */

	grunt.config('compass.dist.options', {
		specify: 'src/sass/<%= paths.filebase.distStyles %>.scss',
		sourcemap: false,
		outputStyle: 'compressed'
	});

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
	/* resources
	/* -------------------------------- */

	grunt.config('paths.favicons', {
		src: 'src/resources/favicons',
		dest: 'images/favicons',
		generated: '<%= paths.src.generated %>/favicons',

	});

	// NOTE: already loaded above
	// grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.config('clean.favicons', {
		src: [
			'<%= paths.favicons.generated %>',
			'<%= paths.favicons.dest %>',
		]
	});
	grunt.loadNpmTasks('grunt-favicons');
	grunt.config('favicons', {
		options: {
			// debug: false,
			apple: false,
			regular: false,
			windowsTile: false,
			timestamp: true
		},
	});

	/* generate-favicons
	 * NOTE: requires `brew install imagemagick`
	 * - - - - - - - - - - - - - - - - - */
	var favTasks = ['clean:favicons'];
	var favicons = {
		black: { filename: 'profile-abstract2-black.png', color: '#000000', },
		white: { filename: 'profile-abstract2-white.png', color: '#FFFFFF', },
		prtfl: { filename: 'prtfl.png', color: '#D0021B', },
	};
	// sizes = [16, 32, 48, 64, 128, 256, 512];
	var sizes = [57, 72, 114, 120, 144, 152];

	var favObj, obj;
	for (var favName in favicons) {
		if (!favicons.hasOwnProperty(favName)) continue;

		favObj = favicons[favName];

		grunt.config('copy.svg-favicons_' + favName, {
			files: [{
				src: '<%= paths.favicons.src %>/' + favObj.filename,
				dest: '<%= paths.favicons.generated %>/' + favName + '/favicon.png',
			}]
		});

		obj = {
			templateData: [],
			globals: [{
				maskRadius: '50%',
				viewBox: '0 0 512 512',
				transform: 'translate(256, 256) scale(1.05) translate(-256, -256)'
				}],
			files: [{
				src: '<%= paths.favicons.src %>/favicon_template.hbs',
				dest: []
				}],
		};
		// NOTE: templateData.location is relative
		obj = sizes.reduce(function(acc, val, idx, arr) {
			// grunt.log.writeln('args: ' + JSON.stringify(arguments));
			acc.files[0].dest[idx] = '<%= paths.favicons.generated %>/'
				+ favName + '/apple-touch-icon-' + val + 'x' + val + '.svg';
			acc.templateData[idx] = {
				location: './favicon.png',
				size: val,
			};
			return acc;
		}, obj);
		obj.files[0].dest.push('<%= paths.favicons.generated %>/' + favName + '/favicon_roundel.svg');
		obj.templateData.push({ location: './favicon.png', size: 600 });

		grunt.loadNpmTasks('grunt-compile-handlebars');
		grunt.config('compile-handlebars.svg-wrap_' + favName, obj);

		grunt.loadNpmTasks('grunt-svg2png');
		grunt.config('svg2png.favicons_' + favName, {
			files: [
				{
					cwd: '<%= paths.favicons.generated %>/' + favName + '/',
					src: ['apple-touch-icon-*.svg'],
					dest: '<%= paths.favicons.dest %>/' + favName + '/',
				}, {
					cwd: '<%= paths.favicons.generated %>/' + favName + '/',
					src: ['favicon_roundel.svg'],
					dest: '<%= paths.favicons.generated %>/' + favName + '/',
					/* this plugin seems to be using src as cwd, and swaps the file ext to png :( */
					// dest: './<%= paths.favicons.generated %>/'
				}
			]
		});
		grunt.config('favicons.square_' + favName, {
			options: {
				trueColor: false,
				tileColor: favObj.color,
				windowsTile: true,
				tileBlackWhite: false,
				apple: false,
				regular: false,
				html: '<%= paths.favicons.generated %>/favicon_square.html',
				HTMLPrefix: '/workspace/assets/images/favicons/' + favName + '/',
			},
			src: '<%= paths.favicons.generated %>/' + favName + '/favicon.png',
			dest: '<%= paths.favicons.dest %>/' + favName + '/',
		});
		grunt.config('favicons.roundel_' + favName, {
			options: {
				apple: true,
				regular: true,
				trueColor: true,
				precomposed: true,
				appleTouchBackgroundColor: favObj.color,
				appleTouchPadding: 20,
				html: '<%= paths.favicons.generated %>/' + favName + '/favicon_roundel.html',
				HTMLPrefix: '/workspace/assets/images/favicons/' + favName + '/',
			},
			src: '<%= paths.favicons.generated %>/' + favName + '/favicon_roundel.png',
			dest: '<%= paths.favicons.dest %>/' + favName + '/',

		});

		grunt.registerTask('build-favicons_' + favName, [
			// 'clean:favicons_' + favName,
			'copy:svg-favicons_' + favName,
			'compile-handlebars:svg-wrap_' + favName,
			'svg2png:favicons_' + favName,
			'favicons:square_' + favName,
			'favicons:roundel_' + favName,
		]);

		favTasks.push('build-favicons_' + favName);
	}
	grunt.registerTask('build-favicons', favTasks);

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