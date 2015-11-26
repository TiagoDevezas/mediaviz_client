mediavizServices.factory('DefaultDates', function($rootScope, $location) {
	return {
		setStartDate: function(sDate) {
			$rootScope.startDate = sDate;
		},
		setEndDate: function(eDate) {
			$rootScope.endDate = eDate;
		},
		getDates: function() {
		  return {'sDate': $rootScope.startDate, 'eDate': $rootScope.endDate}
		}
	}
});