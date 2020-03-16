/*
 * Copyright (C) Apis Networks, Inc - All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium, is
 * strictly prohibited without consent. Any dissemination of
 * material herein is prohibited.
 *
 * For licensing inquiries email <licensing@apisnetworks.com>
 *
 * Written by Matt Saladna <matt@apisnetworks.com>, May 2017
 */

var APNSCP_PATH = "/usr/local/apnscp",
	JS_PATH = APNSCP_PATH + "/public/js",
	PRODUCTION = parseInt(process.env.PRODUCTION) || 1,
	DESTINATION = 'apnscp.js';
var es2015 = require('babel-preset-es2015');
module.exports = function (grunt) {
	'use strict'

	// Force use of Unix newlines
	grunt.util.linefeed = '\n'

	RegExp.quote = function (string) {
		return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
	}

	var path = require('path')

	grunt.loadNpmTasks('grunt-browserify');
	var webpack = require("webpack");
	var webpackConfig = require("./webpack.config.js");

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*!\n' +
		' * Bootstrap v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
		' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
		' * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n' +
		' */\n',
		jqueryCheck: 'if (typeof jQuery === \'undefined\') {\n' +
		'  throw new Error(\'Bootstrap\\\'s JavaScript requires jQuery. jQuery must be included before Bootstrap\\\'s JavaScript.\')\n' +
		'}\n',
		jqueryVersionCheck: '+function ($) {\n' +
		'  var version = $.fn.jquery.split(\' \')[0].split(\'.\')\n' +
		'  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] >= 4)) {\n' +
		'    throw new Error(\'Bootstrap\\\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0\')\n' +
		'  }\n' +
		'}(jQuery);\n\n',

		// Task configuration.
		clean: {
			dist: 'dist',
		},
		webpack: {
			options: webpackConfig,
			build: {}
		},
		// JS build configuration
		browserify: {
			dist: {
				files: {
					'dist/js/apnscp.js': ['dist/js/master.js']
				},
				options: {
					transform: [['babelify']]
				},
			}
		},
		babel: {
			dev: {
				options: {
					sourceMap: true
				},
				files: {
					'js/dist/util.js': 'js/src/util.js',
					'js/dist/alert.js': 'js/src/alert.js',
					'js/dist/button.js': 'js/src/button.js',
					'js/dist/carousel.js': 'js/src/carousel.js',
					'js/dist/collapse.js': 'js/src/collapse.js',
					'js/dist/dropdown.js': 'js/src/dropdown.js',
					'js/dist/modal.js': 'js/src/modal.js',
					'js/dist/scrollspy.js': 'js/src/scrollspy.js',
					'js/dist/tab.js': 'js/src/tab.js',
					'js/dist/tooltip.js': 'js/src/tooltip.js',
					'js/dist/popover.js': 'js/src/popover.js'
				}
			},
			dist: {
				options: {
					extends: '../../.babelrc'
				},
				files: {
					'dist/js/apnscp.js': 'dist/js/apnscp.js'
				}
			}
		},

		stamp: {
			options: {
				banner: '<%= banner %>\n<%= jqueryCheck %>\n<%= jqueryVersionCheck %>\n+function () {\n',
				footer: '\n}();'
			},
			bootstrap: {
				files: {
					src: 'dist/js/apnscp.js'
				}
			}
		},

		concat: {
			options: {
				// Custom function to remove all export and import statements
				process: function (src) {
					return src.replace(/^(export|import).*/gm, '')
				}
			},
			bootstrap: {
				src: [
					'js/src/util.js',
					'js/src/alert.js',
					'js/src/button.js',
					'js/src/carousel.js',
					'js/src/collapse.js',
					'js/src/dropdown.js',
					'js/src/modal.js',
					'js/src/scrollspy.js',
					'js/src/tab.js',
					'js/src/tooltip.js',
					'js/src/popover.js',
					'js/src/validator.js'
				],
				dest: 'dist/js/apnscp-bundle.js'
			}
		},
		// CSS build configuration
		copy: {
			webpack: {
				expand: true,
				cwd: 'js/src/',
				src: ['master.js', 'jquery.js', 'apnscp_init.js', 'apnscp.js', 'jquery_ui.js', 'clipboard.js'],
				dest: 'dist/js/'
			},
			js: {
				expand: true,
				cwd: 'dist/js/',
				src: ['apnscp.js'],
				ext: PRODUCTION ? '.js' : '-custom.js',
				extDot: 'last',
				dest: JS_PATH
			},
			'min-js': {
				expand: true,
				cwd: 'dist/js/',
				src: ['apnscp.js'],
				ext: PRODUCTION ? '.min.js' : '-custom.min.js',
				extDot: 'last',
				dest: JS_PATH
			}
		},

		watch: {
			src: {
				files: 'js/src/*.js',
				tasks: ['concat', 'copy:webpack', 'browserify', 'copy:js']
			},
		},

		exec: {
			uglify: {
				command: 'npm run uglify'
			},
		},

		compress: {
			main: {
				options: {
					archive: 'apnscp-js-<%= pkg.version %>-dist.zip',
					mode: 'zip',
					level: 9,
					pretty: true
				},
				files: [
					{
						expand: true,
						cwd: 'dist/',
						src: ['**'],
						dest: 'apnscp-js-<%= pkg.version %>-dist'
					}
				]
			}
		}

	})

	require('jit-grunt')(grunt)
	require('time-grunt')(grunt)

	grunt.registerTask('dist-js', ['babel:dev', 'concat', 'copy:webpack', 'browserify', 'copy:js', 'babel:dist', 'exec:uglify', 'copy:min-js'])
	//grunt.registerTask('dist-js', ['babel:dev', 'concat', 'copy:webpack', 'babel:dist', 'browserify', 'copy:js', /*'exec:uglify'*/])

	grunt.registerTask('js-compile', ['babel:dev', 'concat', 'copy:webpack', 'browserify', 'copy:js']);

	// Full distribution task.
	grunt.registerTask('dist', ['clean:dist', 'dist-js'])

	grunt.registerTask('default', ['dist'])
	grunt.registerTask('prep-release', ['dist', 'compress'])
}
