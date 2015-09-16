mediavizControllers.controller('ArticlesCtrl', function($scope, $timeout, $filter, $location, $rootScope, Page, Resources, SourceList) {
	
	Page.setTitle('Artigos');

	var itemsToLoad = 50;

	var itemsOffset = 0;

	$scope.predicate = 'pub_date';
  $scope.reverse = true;
  $scope.order = function(predicate) {
  	if(predicate === 'pub_date') {
    	$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
  	} else {
  		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : true;
  	}
    $scope.predicate = predicate;
  };

  $scope.loadingQueue = [];

	$scope.urlParams = {
    source: null,
    keyword: null,
    since: "2015-01-01",
    until: moment().format("YYYY-MM-DD")
  }

  SourceList.getDefaultList().then(function(data) {
    $scope.sourceList = data;
    $scope.defaultSource = 'Todas nacionais';
    $timeout(function() {
      if(!$scope.urlParams.source) {
        $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: $scope.defaultSource}, true)[0];
      }
    }, 600);
  });

  $scope.$watch(function() { return $location.search() }, function(newVal) {
  	var source = $location.search()['source'];
  	var keyword = $location.search()['keyword'];
    var since = $location.search()['since'];
    var until = $location.search()['until'];
		if(source) {
      $timeout(function() {
        $scope.urlParams.source = $filter('filter')($scope.sourceList, {name: source}, true)[0];
      }, 500);
    }
    if(keyword) {
      $scope.inputKeyword = keyword;
      $scope.urlParams.keyword = keyword;
    }
    if(since) {
      $scope.urlParams.since = since;
    }
    if(until) {
      $scope.urlParams.until = until;
    }
  }, true);

  $scope.$watch('urlParams', function(urlParams) {
    for (var key in urlParams) {
      if(urlParams[key] && urlParams[key].name) {
        $location.search(key, urlParams[key].name);
      } else if(urlParams[key]) {
        $location.search(key, urlParams[key])
      } else if(!urlParams[key]) {
        $location.search(key, null)
      }
    }
    getItems();      
  }, true);

  $scope.$watch('loadingQueue', function(newVal, oldVal) {
    if($scope.loadingQueue.length !== 0) {
      $rootScope.loading = true;
    } else {
      $rootScope.loading = false;
    }
  }, true);

  $scope.setQuery = function(value) {
  	if(value) {
    	$scope.urlParams.keyword = value;
  	} else {
  		$scope.urlParams.keyword = null;
  	}
  }

  function createParamsObj() {
    if($scope.urlParams.source.group) {
      return {resource: 'items', since: $scope.urlParams.since, limit: itemsToLoad, until: $scope.urlParams.until, type: $scope.urlParams.source.type, q: $scope.urlParams.keyword};    
    } else {
      return {resource: 'items', since: $scope.urlParams.since, limit: itemsToLoad, until: $scope.urlParams.until, source: $scope.urlParams.source.acronym, q: $scope.urlParams.keyword};
    }
  }

	// getItems();
	
	function getItems() {
		if($scope.urlParams.source) {
			$rootScope.loading = true;
		}
		var paramsObj = createParamsObj();
		Resources.get(paramsObj).$promise.then(function(data) {
			if($scope.urlParams.source) {
				$rootScope.loading = false;
			}
			$scope.items = data;
		});
	}
});