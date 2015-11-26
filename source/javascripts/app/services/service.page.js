mediavizServices.factory('Page', function($rootScope) {
	return {
		setTitle: function(newTitle) {
		  var title = 'IRNews Viewer';
			$rootScope.pageTitle = title + ' || ' + newTitle 
		}
	}
});
