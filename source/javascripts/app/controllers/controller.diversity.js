mediavizControllers.controller('DiversityCtrl', function($scope, $rootScope, $location, Page) {

	Page.setTitle('Diversity');

  var divWidth = document.getElementById("diversity").offsetWidth;
  console.log(divWidth);
	
	$scope.diversityData = [];
  $scope.countData = [];


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
		console.log(d);
		var dateSince = moment(d.x).format("YYYY-MM-DD");
		var dateUntil = moment(dateSince).add(5, 'days').format("YYYY-MM-DD");
		var source = d.id == 'Blogs' ? 'Blog' : d.id;
		$location.path('/articles').search({since: dateSince, until: dateUntil, source: source });
		$scope.$apply();
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
      }
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
      }
    },
    y: {
      label: {
        text: 'Diversity score',
        position: 'outer-middle'
      },
      tick: {
        format: d3.format(".3g")
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
  }
};

});