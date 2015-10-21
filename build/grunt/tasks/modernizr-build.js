module.exports = function (grunt) {
	
	grunt.registerMultiTask(
	// grunt.registerTask(
		"modernizr-build",
		"Build Modernizr",
		function () {
			var modernizr = require("modernizr");
			var _ = require("underscore");
			var done = this.async();
			var noFailures = true;
			
			this.files.forEach(function(file, index, files) {
				var buildOpts = file.src.filter(function(filepath) {
					// Remove nonexistent files (it"s up to you to filter or warn here).
					if (!grunt.file.exists(filepath)) {
						grunt.log.warn("Config file \"" + filepath + "\" not found.");
						return false;
					} else {
						return true;
					}
				}).reduce(function(mergedOpts, filepath) {
					// Read and return the file's source.
					return _.extend(mergedOpts, grunt.file.readJSON(filepath));
				}, {});
				
				// _.extend(modernizr._config, _.pick(buildOpts, Object.keys(modernizr._config)));
				
				modernizr.build(buildOpts, function (result) {
					var success = grunt.file.write(file.dest, result); // the build 
					grunt.log.write("Generated \"" + file.dest + "\": ").ok(success);
					noFailures = noFailures && success;
					if (index === files.length - 1) {
						done(noFailures);
					}
				});
			});
		}
	);
};
