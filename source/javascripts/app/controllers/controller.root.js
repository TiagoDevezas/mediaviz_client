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

  $scope.theme = 'default';

  $scope.$watch(function() { return $location.path() }, function(newVal) {
    if(newVal && newVal.indexOf('/SAPO') !== -1) {
      $scope.theme = 'sapoTheme';
    } else {
      $scope.theme = 'default';
    }
  });

});