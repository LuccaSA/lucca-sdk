module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});
	// load the different contribs
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('remap-istanbul');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		clean: {
			debug: {
				src: [
					".tests",
				]
			},
		},
		karma: {
			options: {
				configFile: 'karma.conf.js'
			},
			debug: {
				singleRun: true,
				autoWatch: false,
			},
			coverage: {
				singleRun: true,
				autoWatch: false,
				browsers: ['PhantomJS'],
				reporters: ['junit', 'coverage'],
			}
		},
		ts: {
			options:{
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				fast: "never",
			},
			debug:{
				src: [
					"src/**/*.ts",
					"typings/index.d.ts",
				],
				outDir: ".tests",
			},
		},
		tslint: {
			options: {
				configuration: "tslint-options.json"
			},
			files: {
				src: [ "src/**/*.ts", "!src/**/*.spec.ts"]
			}
		},
		remapIstanbul: {
			src: 'coverage/coverage-final.json',
			options: {
				reports: {
					'lcovonly': 'coverage/coverage.lcov',
					'html': 'coverage'
				}
			}
		},
		watch: {
			options: {
				nospawn: true
			},
			debug: {
				files: ["src/**/*.ts"],
				tasks: ["ts:debug", "karma:debug", "tslint"],
			}, 
		},
	});

	grunt.registerTask("debug", [
		"clean",
		"ts:debug",
		"watch:debug",
	]);
	grunt.registerTask("test", [
		"clean",
		"ts:debug",
		"karma:coverage",
		"remapIstanbul",
	]);

	grunt.registerTask("default", ["debug"]);
};
