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

  $scope.selectedIndex = {};
  $scope.selectedIndex.value = null;

  // $scope.tabSelected = function(index) {
  //   $scope.selectedIndex.value = index;
  // };

  $scope.$watch('selectedIndex.value', function(newVal) {
    if(newVal === 0) {
      $scope.selectedIndex.value = 0;
      $location.url('/SAPO/cronica');
    }
    if(newVal === 1) {
      $scope.selectedIndex.value = 1;
      $location.url('/SAPO/fontes');
    }
  });

  $scope.$watch(function() { return $location.path() }, function(newVal) {
    if(newVal && newVal.indexOf('/SAPO') !== -1) {
      $scope.theme = 'sapoTheme';
      $scope.SAPOToolbar = true;
      $scope.defaultToolbar = false;
    } else {
      $scope.theme = 'default';
      $scope.defaultToolbar = true;
      $scope.SAPOToolbar = false;
    }
  });

});