mediavizDirectives.directive('dateSelect', function() {
  return {
    restrict: 'AE',
    scope: '=',
    template: 
      '<md-select placeholder="Intervalo" ng-model="selectedPeriod">' +
        '<md-option ng-repeat="period in allPeriods" value="{{period.name}}">{{period.name}}</md-option>' +
      '</md-select>',
    link: function(scope, elem, attrs) {

      scope.allPeriods = [
        {name: 'Tudo'},
        {name: '1 dia'},
        {name: '7 dias'},
        {name: '30 dias'},
        {name: 'Personalizado'}
      ];

      scope.selectedPeriod = scope.allPeriods[0].name;

    }
  }
});
