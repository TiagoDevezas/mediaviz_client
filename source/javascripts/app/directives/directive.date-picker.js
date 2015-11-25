mediavizDirectives.directive('datePicker', function($location, $mdDatePicker) {
  return {
    restrict: 'AE',
    scope: '=',
    link: function(scope, elem, attrs) {
      scope.$on('OpenPicker', function(ev, clickEvt) {
        var sinceDate = moment($location.search()['since']).toDate();
        var untilDate = moment($location.search()['until']).toDate();
        var until, since;
        $mdDatePicker(clickEvt, sinceDate).then(function(selectedDate) {
          since = moment(selectedDate).format('YYYY-MM-DD');
          $mdDatePicker(clickEvt, untilDate).then(function(selectedDate) {
            until = moment(selectedDate).format('YYYY-MM-DD');
            $location.search('until', until);
            $location.search('since', since);
          });
        });
      });
    }
  }
});