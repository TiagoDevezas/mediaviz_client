mediavizControllers.controller('DiversityCtrl', function($scope, $rootScope, $location, Page) {

	Page.setTitle('Diversity');
	
	$scope.data = [];

	$rootScope.loading = true;

	d3.csv("data/diversity.csv", function(d) {
	  return {
	    date: d['window'].split('..')[0], // convert "Year" column to Date
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
		$scope.data.push(dates, news, blogs);
		$scope.diversity = $scope.data;
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



$scope.timeChartOpts = {
  size: {
    height: 450
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
      padding: {left: 0, right: 0},
      type: 'timeseries',
      tick: {
            format: '%Y-%m-%d'
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
        left: 50
      }
    };

});