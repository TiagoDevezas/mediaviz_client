mediavizDirectives.directive('cycleSelect', function($location, $filter) {
  return {
    restrict: 'AE',
    scope: '=',
    template: 
      '<md-input-container>' + 
        '<label>Ciclo</label>' +
        '<md-select ng-model="selectedCycle" ng-change="setCycle(selectedCycle)">' +
          '<md-option ng-repeat="cycle in allCycles" value="{{cycle.name}}">{{cycle.name}}</md-option>' +
        '</md-select>' +
      '</md-input-container>',
    link: function(scope, elem, attrs) {

      scope.selectedCycle;

      scope.allCycles = !scope.SAPOMode ? 
      [
        {name: 'Hora', value: 'hour'},
        {name: 'Dia', value: 'day'},
        {name: 'Semana', value: 'week'},
        {name: 'Mês', value: 'month'}
      ] : [
        {name: 'Dia', value: 'day'},
        {name: 'Semana', value: 'week'},
        {name: 'Mês', value: 'month'}
      ]


      scope.selectedCycle = scope.allCycles[0].name;

      scope.setCycle = function(cycleName) {
        var cycleObj = $filter('filter')(scope.allCycles, {name: cycleName}, true)[0] || null;
        $location.search('by', cycleObj.value);
      }

      scope.$watch('urlParams.by', function(newVal, oldVal) {
        var cycleObj = $filter('filter')(scope.allCycles, {value: newVal}, true)[0] || null;
        if(cycleObj) {
          scope.selectedCycle = cycleObj.name;
        }
      }, true);


    }
  }
});
