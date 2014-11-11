'use strict';

var mediavizControllers = angular.module('mediavizControllers', []);

mediavizControllers.controller('MainCtrl', function($scope, $http, $location, Source) {

	$scope.selectedSource;

	Source.get().$promise.then(function(obj) {
		$scope.sourceList = obj;
		$scope.sourceList.unshift({'name': 'All', 'type': ''});
		$scope.selectedSource = $scope.sourceList[0];
	});

	$scope.getSourceData = function(sourceName) {
		Source.get({name: sourceName}).$promise.then(function(obj) {
			$scope.sourceData = obj;
			console.log($scope.sourceData);
		});
	}
	
});