mediavizDirectives.directive('dateSelect', function($location, $filter) {
  return {
    restrict: 'AE',
    scope: '=',
    template: 
      '<md-input-container>' + 
        '<label>Período</label>' +
        '<md-select ng-model="selectedPeriod" ng-change="setPeriod(selectedPeriod)">' +
          '<md-option ng-repeat="period in allPeriods" value="{{period.name}}">{{period.name}}</md-option>' +
        '</md-select>' +
      '</md-input-container>',
    link: function(scope, elem, attrs) {

      var dateFormat = "YYYY-MM-DD";

      var today = moment().format(dateFormat);

      var oneDay = moment(today).subtract(1, 'days').format(dateFormat);

      var sevenDays = moment(today).subtract(7, 'days').format(dateFormat);

      var oneMonth = moment(today).subtract(1, 'months').format(dateFormat);

      var sixMonths = moment(today).subtract(6, 'months').format(dateFormat);

      var oneYear = moment(today).subtract(1, 'years').format(dateFormat);

      scope.selectedPeriod;

      scope.allPeriods = [
        {name: '1 dia', startDate: oneDay, endDate: today},
        {name: '7 dias', startDate: sevenDays, endDate: today},
        {name: '1 mês', startDate: oneMonth, endDate: today},
        {name: '6 meses', startDate: sixMonths, endDate: today},
        {name: '1 ano', startDate: oneYear, endDate: today}
      ];

      scope.setPeriod = function(periodName) {
        var periodObj = $filter('filter')(scope.allPeriods, {name: periodName}, true)[0] || null;
        $location.search('since', periodObj.startDate);
        $location.search('until', periodObj.endDate);
      }

      // function checkURLParams() {
      //   var periodObj = $filter('filter')(scope.allPeriods, {startDate: scope.since, endDate: scope.until}, true)[0] || null;
      //   if(periodObj) {
      //     scope.selectedPeriod = periodObj.name;
      //   } else {
      //     var optionObj = {
      //       name: 'Personalizado (' + scope.since + ' / ' + scope.until + ')'
      //     };
      //     scope.allPeriods.push(optionObj);
      //     scope.selectedPeriod = optionObj.name;
      //   }
      // }


      // function DateIntervalToString() {
      //   return scope.since || scope.until ? 'Personalizado (' + scope.since + ' - ' + scope.until + ')' : null;
      // }


      scope.$watch('period', function(newVal, oldVal) {
        var periodObj = $filter('filter')(scope.allPeriods, {startDate: newVal.since, endDate: newVal.until}, true)[0] || null;
        if(periodObj) {
          scope.selectedPeriod = periodObj.name;
        } else {
          var optionObj = {
            name: 'Personalizado (' + newVal.since + ' / ' + newVal.until + ')'
          };
          scope.allPeriods.push(optionObj);
          scope.selectedPeriod = optionObj.name;
        }
      }, true);


    }
  }
});
