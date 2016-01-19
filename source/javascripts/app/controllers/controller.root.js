mediavizControllers.controller('RootCtrl', function($scope, $mdSidenav, $location, $mdDialog, DefaultDates) {

  DefaultDates.setStartDate("2015-07-02");
  DefaultDates.setEndDate("2015-11-01");

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

  $scope.toolsToDisplay = [
    {name: 'Keywords', description: 'Compare keywords.', url: '/chronicle'},
    {name: 'Sources', description: 'Compare sources.', url: '/sources'},
    // {name: 'NewsMap', description: 'Compare geographic coverages.', url: '/newsmap'},
    {name: 'Articles', description: 'Search articles.', url: '/articles'},
    {name: 'Diversity', description: 'Compare topic diversity between streams.', url: '/diversity'}
  ];

  $scope.openAboutDialog = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'dialog1.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true
    });
  }

  function DialogController($scope, $mdDialog) {
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
  }

});