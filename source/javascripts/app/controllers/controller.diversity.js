mediavizControllers.controller('DiversityCtrl', function($scope, $rootScope, $location, Page) {

	Page.setTitle('Diversity');

  var divWidth = document.getElementById("diversity").offsetWidth;
	
	$scope.diversityData = [];
  $scope.countData = [];

  var dateExtent = ["2015-09-01", "2015-09-30"];


  $rootScope.loading = true;
  
  d3.csv("data/diversity.csv", function(d) {
	  return {
	    date: d['window'].split('..')[0],
	    news: +d.news,
	    blogs: +d.blogs
	  };
	}, function(error, rows) {
		var dates = ['x'];
		var news = ['News'];
		var blogs = ['Blogs'];
    $scope.streamData = rows;
		rows.forEach(function(el) {
			dates.push(el.date)
			news.push(el.news);
			blogs.push(el.blogs);
		});
		$scope.diversityData.push(dates, news, blogs);
		$scope.diversity = $scope.diversityData;
		$rootScope.loading = false;
	});

  d3.csv("data/document_count.csv", function(d) {
    $rootScope.loading = true;
    return {
      date: d['window'].split('..')[0],
      news: +d.news,
      blogs: +d.blogs
    };
  }, function(error, rows) {
    var dates = ['x'];
    var news = ['News'];
    var blogs = ['Blogs'];
    rows.forEach(function(el) {
      dates.push(el.date)
      news.push(el.news);
      blogs.push(el.blogs);
    });
    $scope.countData.push(dates, news, blogs);
    $scope.count = $scope.countData;
    $rootScope.loading = false;
  });

	function showArticles(d) {
		var dateSince = moment(d.x).format("YYYY-MM-DD");
		var dateUntil = moment(dateSince).add(5, 'days').format("YYYY-MM-DD");
		var source = d.id == 'Blogs' ? 'Blog' : d.id;
		$location.path('/articles').search({since: dateSince, until: dateUntil, source: source });
		$scope.$apply();
	}

  function setNewRange(domain) {
    var newRange = [moment(domain[0]).format("YYYY-MM-DD"), moment(domain[1]).format("YYYY-MM-DD")];
    // $scope.countChartOpts.axis.x.extent = newRange;
    $scope.$broadcast('changeZoomRange', newRange);
  }

$scope.countChartOpts = {
  size: {
    height: 200
  },
  legend: {
    position: 'right'
  },
  tooltip: {
    grouped: true 
  },
  data: {
    x: 'x',
    onclick: function (d, i) { showArticles(d); },
    groups: [
        ['Blogs', 'News']
    ]
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: {
          format: '%Y-%m-%d',
          culling: {
            max: divWidth / 150
          } 
      },
      extent: dateExtent
    },
    y: {
      label: {
        text: 'Documents',
        position: 'outer-middle'
      },
      tick: {
        values: [0, 50000, 100000, 150000, 200000]
      }
    }
  },
  grid: {
    x: {
      show: false
    },
    y: {
      show: true
    }
  },
  subchart: {
    show: true,
    onbrush: function(domain) { setNewRange(domain); },
    size: {
      height: 20
    }
  }
}

$scope.timeChartOpts = {
  size: {
    height: 350
  },
  legend: {
    position: 'right'
  },
  tooltip: {
    grouped: true 
  },
  data: {
  	x: 'x',
    onclick: function (d, i) { showArticles(d); }
  },
  transition: {
    duration: 0
  },
  axis: {
    x: {
      //padding: {left: 0, right: 0},
      type: 'timeseries',
      tick: {
        format: '%Y-%m-%d',
        culling: {
            max: divWidth / 150
          }
      },
      extent: dateExtent
    },
    y: {
      label: {
        text: 'Diversity score',
        position: 'outer-middle'
      },
      tick: {
        format: d3.format(".5g")
      }
    }
  },
  grid: {
    x: {
      show: false
    },
    y: {
      show: true
    }
  },
  padding: {
    //left: 50
  },
  subchart: {
    show: true,
    onbrush: function(domain) { setNewRange(domain); },
    size: {
        height: 20
      }
  }
};

});