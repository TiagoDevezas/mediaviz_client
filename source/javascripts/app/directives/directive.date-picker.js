mediavizDirectives.directive('datePicker', function($location, $mdDatePicker) {
  return {
    restrict: 'AE',
    scope: '=',
    link: function(scope, elem, attrs) {
      scope.$on('OpenPicker', function(ev) {
        var sinceDate = moment($location.search()['since']).toDate();
        var untilDate = moment($location.search()['until']).toDate();
        var until, since;
        $mdDatePicker(ev, sinceDate).then(function(selectedDate) {
          since = moment(selectedDate).format('YYYY-MM-DD');
          $mdDatePicker(ev, untilDate).then(function(selectedDate) {
            until = moment(selectedDate).format('YYYY-MM-DD');
            $location.search('until', until);
            $location.search('since', since);
          });
        });
      });
    }
  }
});