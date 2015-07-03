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
    var weekDaysZero = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]];

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