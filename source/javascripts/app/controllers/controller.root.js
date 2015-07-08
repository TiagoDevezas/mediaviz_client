mediavizControllers.controller('RootCtrl', function($scope, $rootScope, $mdSidenav, $location, SourceList, $mdMedia) {

  $scope.toggleMenu = function() {
    $mdSidenav('left').toggle();
  }

  $scope.pageIs = function(url) {
    if($location.path() === url) {
      return 'isPage';
    } else {
      return 'isNotPage'
    }
  }

});