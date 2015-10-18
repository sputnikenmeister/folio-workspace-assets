/*global module*/
module.exports = function (grunt) {
	"use strict";
		
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
};
