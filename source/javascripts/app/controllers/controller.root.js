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
    if(newVal === 0 && $location.path().indexOf('/SAPO/cronica') === -1) {
      $location.url('/SAPO/cronica');
    }
    if(newVal === 1 && $location.path().indexOf('/SAPO/fontes') === -1) {
      $location.url('/SAPO/fontes');
    }
    if(newVal === 2 && $location.path().indexOf('/SAPO/newsmap') === -1) {
      $location.url('/SAPO/newsmap');
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
    if(newVal.indexOf('/SAPO/cronica') !== -1) {
      $scope.selectedIndex.value = 0;
    }
    if(newVal.indexOf('/SAPO/fontes') !== -1) {
      $scope.selectedIndex.value = 1;
    }
    if(newVal.indexOf('/SAPO/newsmap') !== -1) {
      $scope.selectedIndex.value = 2;
    }
  });

  $scope.toolsToDisplay = [
    {name: 'Palavras-chave', description: 'Comparar palavras-chave.', url: '/chronicle'},
    {name: 'Fontes', description: 'Comparar fontes.', url: '/sources'},
    {name: 'Palavras-chave (SAPO)', description: 'Comparar fontes.', url: '/SAPO/cronica'},
    {name: 'Fontes (SAPO)', description: 'Comparar fontes (SAPO).', url: '/SAPO/fontes'},
    {name: 'NewsMap', description: 'Comparar coberturas geográficas.', url: '/newsmap'}
  ]

});