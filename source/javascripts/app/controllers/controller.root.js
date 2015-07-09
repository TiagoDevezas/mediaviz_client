mediavizControllers.controller('RootCtrl', function($scope, $mdSidenav, $location, SourceList) {

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