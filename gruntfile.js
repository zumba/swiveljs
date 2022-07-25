/*global module:false*/

module.exports = function(grunt) {
    'use strict';
    var gruntConfig = { pkg : grunt.file.readJSON('package.json') };

    grunt.file.recurse('grunt/config', function(config) {
        gruntConfig = Object.assign({}, gruntConfig, grunt.file.readJSON(config));
    });

    // Project configuration.
    grunt.initConfig(gruntConfig);
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-wrap');

    grunt.registerTask('default', ['clean', 'concat', 'wrap', 'jshint', 'uglify']);
};
