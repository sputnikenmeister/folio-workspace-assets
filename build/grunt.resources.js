/*global module*/
module.exports = function (grunt) {
	"use strict";
	
	/* --------------------------------
	 * Resources
	 * -------------------------------- */
	
	// TODO: get all this resources stuff out of here
	
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
				args: ["open", "--config", "<%= paths.fontello %>/config.json"],
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
			},
			src: "src/resources/favicon/IMG_0139_fav.png",
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
	
	/* --------------------------------
	 * Fonts
	 * -------------------------------- */
	
	grunt.loadNpmTasks("grunt-fontgen");
	grunt.loadNpmTasks("grunt-contrib-concat");
	// grunt.loadNpmTasks("grunt-contrib-copy");
	//https://github.com/gruntjs/grunt-contrib-copy
	
	grunt.config("paths.src.fonts", "<%= paths.src.resources %>/fonts");
	// grunt.config("paths.build", "./build");
	// grunt.config("fontgen_dest", "./fonts/fontgen");
	// grunt.config("fontgen_dest_scss", "<%= paths.src.sass %>/fonts");
	
	grunt.registerMultiTask(
		"fontgen-create-json",
		"Generate per-font JSON files for grunt-fongen",
		function() {
			var path = require("path");
			this.filesSrc.forEach(function(src) {
				if (!grunt.file.exists(src)) {
					grunt.log.warn("Source file '" + src + "' not found.");
					return false;
				}
				var srcPath = path.parse(src);
				var jsonDest = srcPath.dir + path.sep + srcPath.name + ".json";
				
				if (grunt.file.exists(jsonDest)) {
					grunt.log.warn("JSON file '" + jsonDest + "' exists.");
					return false;
				}
				grunt.file.write(jsonDest, JSON.stringify({
					name: srcPath.name, weight: "normal", style: "normal"
				}, null, 2));
				grunt.log.write("Generated '" + jsonDest + "': ").ok();
			});
		}
	);
	
	grunt.config("fontgen-create-json", {
		all: {
			src: "<%= paths.src.fonts %>/**/*.{ttf,otf}",
			// src: [
			// 	"<%= paths.src.fonts %>/franklin-gothic-itc/*.otf",
			// 	"<%= paths.src.fonts %>/franklin-gothic-itc-cd/*.otf",
			// 	"<%= paths.src.fonts %>/franklin-gothic-itc-cp/*.otf",
			// 	"<%= paths.src.fonts %>/franklin-gothic-itc-xcp/*.otf",
			// 	"<%= paths.src.fonts %>/numbers-htf/*.ttf",
			// ],
		},
	});
	
	/* fontgen-all
	* - - - - - - - - - - - - - - - - - */
	var path = require("path");
	var fontgenTasks = [];
	var fontgenCss = [];
	
	grunt.config("paths.fontgen.css", []);
	grunt.file.expand({ filter: "isDirectory" }, grunt.config.get("paths.src.fonts") + "/*")
		.forEach(function(dirpath) {
			var dirtasks, dirname = path.basename(dirpath);
			grunt.config("fontgen." + dirname, {
				options: {
					path_prefix: "../fonts/" + dirname,
					stylesheet: "<%= paths.dest.fonts %>/" + dirname + ".css",
				},
				files: [{
					src: dirpath + "/*.{ttf,otf}",
					dest: "<%= paths.dest.fonts %>/" + dirname,
				}]
			});
			grunt.config("concat.fontgen-" + dirname, {
				src: [ "<%= paths.dest.fonts %>/" + dirname + "/*.css" ],
				dest: "<%= paths.src.sass %>/generated/_" + dirname + ".scss",
			});
			
			fontgenCss.push(grunt.config.get("paths.dest.fonts") + "/" + dirname + "/*.css");
			
			dirtasks = ["fontgen:" + dirname, "concat:fontgen-" + dirname];
			grunt.registerTask("fontgen-" + dirname, dirtasks);
			fontgenTasks = fontgenTasks.concat(dirtasks);
		});
		
	grunt.registerTask("fontgen-cleantmp", function() {
		grunt.file.expand(fontgenCss).forEach(function(path) {
			grunt.file.delete(path);
			grunt.log.write("Deleted " + path).ok();
		});
	});
	
	fontgenTasks.push("fontgen-cleantmp");
	grunt.registerTask("fontgen-all", fontgenTasks);
	
	
	/* fontgen-test-all
	* - - - - - - - - - - - - - - - - - */
	// var path = require("path");
	// grunt.registerMultiTask("fontgen-tasks", "Dummy test task", function() {
	// 	var fontDir = this.data.fontDir;
	// 	grunt.log.writeln("Running fontgen-tasks", fontDir);
	// 		if (!grunt.file.isDir(fontDir)) {
	// 			grunt.log.warn("Option fontDir '" + fontDir + "' not a.");
	// 			return false;
	// 		}
	// 	// this.filesSrc.forEach(function(src) {
	// 	// 	grunt.log.write("Got file '" + src + "': ").ok();
	// 	// });
	// });
	
	/* fontgen-numbers-htf
	* - - - - - - - - - - - - - - - - - */
	// grunt.config("fontgen.numbers-htf", {
	// 	options: {
	// 		path_prefix: "../fonts/fontgen/numbers-htf",
	// 		stylesheet: "<%= paths.dest.fonts %>/fontgen/numbers-htf.css",
	// 	},
	// 	files: [{
	// 		src: [
	// 			"<%= paths.src.fonts %>/numbers-htf/NumbersRevenue.ttf",
	// 			"<%= paths.src.fonts %>/numbers-htf/NumbersRedbird.ttf",
	// 			"<%= paths.src.fonts %>/numbers-htf/NumbersClaimcheck.ttf",
	// 			"<%= paths.src.fonts %>/numbers-htf/NumbersIndicia.ttf"
	// 		],
	// 		dest: "<%= paths.dest.fonts %>/fontgen/numbers-htf",
	// 	}]
	// });
	// grunt.config("concat.fontgen-numbers-htf", {
	// 	src: [ "<%= paths.dest.fonts %>/fontgen/numbers-htf/*.css" ],
	// 	dest: "<%= paths.src.sass %>/generated/_numbers-htf.scss",
	// });
	// grunt.registerTask("fontgen-numbers-htf", [
	// 	"fontgen:numbers-htf",
	// 	"concat:fontgen-numbers-htf",
	// ]);
	
	/* fontgen-franklin-gothic-itc-all
	* - - - - - - - - - - - - - - - - - */
	// var variantTasks,
	// 	allVariantsTasks = [],
	// 	franklinVariants = [
	// 		"franklin-gothic-itc",
	// 		"franklin-gothic-itc-cp",
	// 		"franklin-gothic-itc-cd",
	// 		"franklin-gothic-itc-xcp"
	// 	];
	// 
	// franklinVariants.forEach(function(variantName) {
	// 	grunt.config("fontgen." + variantName, {
	// 		options: {
	// 			path_prefix: "../fonts/fontgen/" + variantName,
	// 			stylesheet: "<%= paths.dest.fonts %>/fontgen/" + variantName + ".css",
	// 		},
	// 		files: [{
	// 			src: "<%= paths.src.fonts %>/" + variantName + "/*.otf",
	// 			dest: "<%= paths.dest.fonts %>/fontgen/" + variantName,
	// 		}]
	// 	});
	// 	grunt.config("concat.fontgen-" + variantName, {
	// 		src: [ "<%= paths.dest.fonts %>/fontgen/" + variantName + "/*.css" ],
	// 		dest: "<%= paths.src.sass %>/generated/_" + variantName + ".scss",
	// 	});
	// 	variantTasks = ["fontgen:" + variantName, "concat:fontgen-" + variantName];
	// 	grunt.registerTask("fontgen-" + variantName, variantTasks);
	// 	allVariantsTasks = allVariantsTasks.concat(variantTasks);
	// });
	// grunt.registerTask("fontgen-franklin-gothic-itc-all", allVariantsTasks);
};
