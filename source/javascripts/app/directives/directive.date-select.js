mediavizDirectives.directive('dateSelect', function($location, $filter, $timeout) {
  return {
    restrict: 'AE',
    scope: '=',
    template: 
      '<md-input-container>' + 
        '<label>Intervalo</label>' +
        '<md-select ng-model="selectedPeriod">' +
          '<md-option ng-repeat="period in allPeriods" value="{{period.name}}" ng-click="setPeriod($event, period.name)">{{period.name}}</md-option>' +
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

      var twoYears = moment(today).subtract(2, 'years').format(dateFormat);

      var fiveYears = moment(today).subtract(5, 'years').format(dateFormat);

      var tenYears = moment(today).subtract(10, 'years').format(dateFormat);

      scope.selectedPeriod;

      scope.allPeriods;

      // scope.customPeriodObj = {name: 'Personalizado', startDate: undefined, endDate: undefined}

      if(scope.SAPOMode) {
        scope.allPeriods = [
          {name: '1 dia', startDate: oneDay, endDate: today},
          {name: '7 dias', startDate: sevenDays, endDate: today},
          {name: '1 mês', startDate: oneMonth, endDate: today},
          {name: '6 meses', startDate: sixMonths, endDate: today},
          {name: '1 ano', startDate: oneYear, endDate: today},
          {name: '2 anos', startDate: twoYears, endDate: today},
          {name: '5 anos', startDate: fiveYears, endDate: today},
          {name: '10 anos', startDate: tenYears, endDate: today},
          {name: 'Personalizado', startDate: undefined, endDate: undefined}
        ]
      } else {
        scope.allPeriods = [
          {name: '1 dia', startDate: oneDay, endDate: today},
          {name: '7 dias', startDate: sevenDays, endDate: today},
          {name: '1 mês', startDate: oneMonth, endDate: today},
          {name: '6 meses', startDate: sixMonths, endDate: today},
          {name: '1 ano', startDate: oneYear, endDate: today},
          {name: 'Personalizado', startDate: undefined, endDate: undefined}
        ];
      }

/*      scope.showDatePicker = function(optionName) {
        console.log(optionName)
        if(optionName.indexOf('Personalizado') !== -1) {
          scope.$broadcast('OpenPicker');
        }
      }*/

      scope.setPeriod = function(evt, periodName) {
        var periodObj = $filter('filter')(scope.allPeriods, {name: periodName}, true)[0];
        if(periodObj.name.indexOf('Personalizado') === -1) {
          $location.search('since', periodObj.startDate);
          $location.search('until', periodObj.endDate);
        } else {
           scope.$broadcast('OpenPicker', evt);
        }
      }

      scope.$watch('urlParams', function(newVal) {
        var periodObj = $filter('filter')(scope.allPeriods, {startDate: newVal.since, endDate: newVal.until}, true)[0];
        var customPeriodObj = scope.allPeriods.filter(function(el) {
          if(el.name.indexOf('Personalizado') !== -1) {
            return el;
          }
        })[0];
        if(periodObj && periodObj.name.indexOf('Personalizado') === -1) {
          scope.selectedPeriod = periodObj.name;
          customPeriodObj.name = 'Personalizado';
        } else {
          scope.allPeriods.splice(scope.allPeriods.indexOf(customPeriodObj));
          var optionObj = {
            name: 'Personalizado (' + newVal.since + ' / ' + newVal.until + ')',
            // startDate: newVal.since,
            // endDate: newVal.until
          };
          scope.allPeriods.push(optionObj);
          $timeout(function() {
            scope.selectedPeriod = optionObj.name;            
          }, 0)
        }
      }, true);


    }
  }
});
