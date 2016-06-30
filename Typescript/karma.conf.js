// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
	config.set({
	// base path, that will be used to resolve files and exclude
	basePath: '',

	// testing framework to use (jasmine/mocha/qunit/...)
	frameworks: ['jasmine'],

	// list of files / patterns to load in the browser
	files: [
		'../bower_components/angular/angular.js',
		'../bower_components/angular-mocks/angular-mocks.js',
		'../bower_components/moment/min/moment-with-locales.min.js',
		'../bower_components/underscore/underscore-min.js',
		'.tests/**/*.js',
	],
	
	preprocessors: {
		'.tests/**/!(spec).js': ['coverage'],
	},

	exclude: [],
	port: 9876,
	logLevel: config.LOG_INFO,
	autoWatch: true,
	singleRun: false,

	plugins: [
		'karma-jasmine',
		'karma-phantomjs-launcher',
		'karma-junit-reporter',
		'karma-coverage',
	],
	browsers: ['PhantomJS'],
	reporters: ['progress','coverage'],
	junitReporter: {
		outputFile: 'junit-report.xml',
		useBrowserName: false,
		suite: 'lucca sdk'
	},
	coverageReporter: {
		type : 'json',
		dir : 'coverage/',
		subdir: '.',
		file : 'coverage-final.json'
	}
});
};
