mediavizDirectives.directive('dateSelect', function($location, $filter) {
  return {
    restrict: 'AE',
    scope: '=',
    template: 
      '<md-input-container>' + 
        '<label>Data</label>' +
        '<md-select ng-model="selectedPeriod">' +
          '<md-option ng-repeat="period in allPeriods" value="{{period.name}}">{{period.name}}</md-option>' +
        '</md-select>' +
      '</md-input-container>',
    link: function(scope, elem, attrs) {

      var dateFormat = "YYYY-MM-DD";

      var today = moment().format(dateFormat);

      var oneDay = moment(today).subtract(1, 'days').format(dateFormat);

      var sevenDays = moment(today).subtract(7, 'days').format(dateFormat);

      var oneMonth = moment(today).subtract(1, 'months').format(dateFormat);

      var oneYear = moment(today).subtract(1, 'years').format(dateFormat);

      scope.allPeriods = [
        {name: '1 ano', startDate: oneYear, endDate: today},
        {name: '1 dia', startDate: oneDay, endDate: today},
        {name: '7 dias', startDate: sevenDays, endDate: today},
        {name: '30 dias', startDate: oneMonth, endDate: today},
        {name: 'Personalizado', startDate: null, endDate: null}
      ];

      scope.selectedPeriod = scope.allPeriods[0].name;

/*      scope.$watch('selectedPeriod', function(period) {
        var periodObj = $filter('filter')(scope.allPeriods, {name: period}, true)[0];
        $location.search('since', periodObj.startDate);
        $location.search('until', periodObj.endDate);
      });*/


    }
  }
});
