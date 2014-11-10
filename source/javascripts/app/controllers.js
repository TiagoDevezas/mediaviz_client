'use strict';

var mediavizControllers = angular.module('mediavizControllers', []);

mediavizControllers.controller('MainCtrl', function($scope, $http, $routeParams, $location, Source) {

	$scope.selectedSource;

	Source.get(function(obj) {
		$scope.sourceList = obj;
		$scope.sourceList.unshift({'name': 'All', 'type': ''});
		$scope.selectedSource = $scope.sourceList[0];
	});

	$scope.getSourceData = function(sourceName) {
		Source.get({name: sourceName}, function(obj) {
			$scope.sourceData = obj;
			console.log($scope.sourceData);
		});
	}


	// getSourceData('Expresso');

	// function getSourceData(name) {
	// 	var nameParams = {};
	// 	if (name !== 'All') {
	// 		nameParams = { name: name };
	// 		Source.get(nameParams, function(obj) {
	// 			$scope.sourceNames = obj[0];
	// 			$scope.sourceData = obj[0];
	// 		});
	// 	} else {
	// 		Source.get(nameParams, function(obj) {
	// 			$scope.sourceNames = obj[0].sources;
	// 			$scope.sourceData = obj[0];
	// 		});
	// 	}
	// }
	
});