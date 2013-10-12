module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		less: {
            dev: {
                files: {
                    "styles/tree.css": "less/tree.less",
                }
            }
        },

		watch: {
			styles: {
				files: ['less/*.less'],
				tasks: ['less']
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['less']);
};
