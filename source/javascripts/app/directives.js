'use strict';

var mediavizDirectives = angular.module('mediavizDirectives', []);

mediavizDirectives.directive('loadingFlash', function() {
	return {
		restrict: 'AE',
		transclude: true,
		template: '<div class="flash-notice" ng-show="loading" style="background-color: #2980B9;"><p><img src="images/svg-loaders/oval.svg" width="50" /><p><span ng-transclude style="color: #fff;"></span></div>'
	}
});