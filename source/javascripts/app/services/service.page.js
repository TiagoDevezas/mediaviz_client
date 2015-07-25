mediavizServices.factory('Page', function($rootScope, $location) {
	
	return {
		// title: function() { $rootScope.pageTitle = title; },
		setTitle: function(newTitle) {
			var title = null;
			if($location.path().indexOf('/SAPO') !== -1) {
	    	title = 'SAPO NewsViz';
		  } else {
		  	title = 'MediaViz';
		  }
			$rootScope.pageTitle = title + ' || ' + newTitle 
		}
	}
});
