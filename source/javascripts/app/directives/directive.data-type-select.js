mediavizDirectives.directive('typeSelect', function($location, $filter) {
  return {
    restrict: 'AE',
    scope: '=',
    template: 
      '<md-input-container>' + 
        '<label>Dados</label>' +
        '<md-select ng-model="selectedType" ng-change="setDataType(selectedType)">' +
          '<md-option ng-repeat="dataType in dataTypes" ng-value="dataType">{{dataType.name}}</md-option>' +
        '</md-select>' +
      '</md-input-container>',
    link: function(scope, elem, attrs) {
      
      scope.dataTypes = [
        {name: 'Artigos', type: 'articles'},
        {name: 'Partilhas (Twitter)', type: 'twitter_shares'},
        {name: 'Partilhas (Facebook)', type: 'facebook_shares'},
        {name: 'Partilhas (Todas)', type: 'total_shares'}
      ];

      scope.setDataType = function(dataType) {
        var foundType = $filter('filter')(scope.dataTypes, {type: dataType.type}, true)[0];
        $location.search('data', foundType.type)
      };

      scope.$watch('urlParams.data', function(newVal) {
        if(newVal) {
          scope.selectedType = $filter('filter')(scope.dataTypes, {type: newVal}, true)[0];
        }
      })

    }
  }
});