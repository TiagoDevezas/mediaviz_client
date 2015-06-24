mediavizControllers.controller('SourcesCtrl', function($scope, Page, SAPONews) {

  Page.setTitle('Fontes');

  $scope.selectedSources = {};

  $scope.selectedSources.selected = [];

  var params = {beginDate: '2015-02-01', endDate: '2015-04-31', timeFrame: 'DAY', source: 'lusa25', q: 'nepal'}

  SAPONews.get(params).then(function(data) {
    console.log(data);
  });

});