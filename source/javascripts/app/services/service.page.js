mediavizServices.factory('Page', function($rootScope) {
	return {
		setTitle: function(newTitle) {
		  var title = 'NewsIR Viewer';
			$rootScope.pageTitle = title + ' || ' + newTitle 
		}
	}
});
