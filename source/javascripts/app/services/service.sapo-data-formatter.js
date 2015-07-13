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

    return weekDataObj;
  },
  factory.getMonths = function(data) {
    var dateAndCounts = data;
    var monthsAndCounts = dateAndCounts.map(function(el) {
      return [moment(el[0], 'YYYY-MM-DD').format('M'), el[1]];
    });
    var monthDataObj = d3.range(1, 13).map(function(isoDay) {
      return {time: isoDay, articles: 0, total_source_articles: 0, percent_of_source: 0 }
    });
    var monthDataMap = d3.map(monthDataObj, function(obj) { return obj.time; });
    
    var totalSourceArticles = 0;

    monthsAndCounts.forEach(function(el) {
      var mapObj = monthDataMap.get(el[0]);
      if(!mapObj) return;
      mapObj['articles'] += el[1];
      totalSourceArticles += el[1];        
    });

    monthDataObj.forEach(function(obj) {
      obj['total_source_articles'] = totalSourceArticles;
      var percent_of_source = ((obj['articles'] / totalSourceArticles) * 100).toFixed(2);
      obj['percent_of_source'] = parseFloat(percent_of_source);
    });

    return monthDataObj;
  }
  return factory;
});