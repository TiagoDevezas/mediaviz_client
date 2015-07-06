mediavizServices.factory('SAPODataFormatter', function() {
  var factory = {};
  factory.toColumns = function(data, timeId, countId, dateFormat) {
      var columns = [];
      var dateAndCounts = data;
      var dates = dateAndCounts.map(function(el) {
        return dateFormat ? moment(el[0]).format(dateFormat) : el[0];
      });
      dates.unshift(timeId);
      var counts = dateAndCounts.map(function(el) {
        return el[1];
      });
      counts.unshift(countId);
      columns.push(dates, counts);
      return columns;
  },
  factory.getWeekDays = function(data) {
    var dateAndCounts = data;
    var weekDaysAndCounts = dateAndCounts.map(function(el) {
      return [moment(el[0], 'YYYY-MM-DD').format('E'), el[1]];
    });
    var weekDataObj = d3.range(1, 8).map(function(isoDay) {
      return {time: isoDay, articles: 0, total_source_articles: 0, percent_of_source: 0 }
    });
    var weekDataMap = d3.map(weekDataObj, function(obj) { return obj.time; });
    var weekDaysZero = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]];

    var totalSourceArticles = 0;

    weekDaysAndCounts.forEach(function(el) {
      var mapObj = weekDataMap.get(el[0]);
      mapObj['articles'] += el[1];
      totalSourceArticles += el[1];
    });

    weekDataObj.forEach(function(obj) {
      obj['total_source_articles'] = totalSourceArticles;
      var percent_of_source = ((obj['articles'] / totalSourceArticles) * 100).toFixed(2);
      obj['percent_of_source'] = parseFloat(percent_of_source);
    });

    weekDaysAndCounts.forEach(function(el) {
      weekDaysZero.forEach(function(elem) {
        if(parseInt(el[0]) === elem[0]) {
          elem[1] += el[1];
        }
      });
    });
    return weekDaysZero;
  }
  return factory;
});