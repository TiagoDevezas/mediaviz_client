mediavizServices.factory('DataFormatter', function() {
  return {
    inColumns: function (data, IdKey, key1, key2) {
      if(data.length > 0) {
        var columns = [];
        var timeCol = [];
        var valueCol = [];
        angular.forEach(data, function(datum) {
          timeCol.push(datum['' + key1 + '']);
          valueCol.push(datum['' + key2 + '']);
        });
        timeCol.unshift('timeFor' + IdKey);
        valueCol.unshift(IdKey);
        columns.push(timeCol, valueCol);
        return columns;
      } else {
        return [];
      }
    },
    countOnly: function (data, keyword, value) {
      if(data.length > 0) {
        var columns = [];
        var keywordValues = [data[0]['' + value + '']];
        keywordValues.unshift(keyword);
        columns.push(keywordValues);
        return columns;
      } else {
        return [];
      }
    },
    sumValue: function(data, keyword, value, xLabel) {
      if(data.length > 0) {
        var sum = 0;
        var columns = [];
        var xValueCol = [];
        xValueCol.push('x')
        xValueCol.push(xLabel);
        columns.push(xValueCol);
        var sumValues = [keyword];
        angular.forEach(data, function(d) {
          sum = sum + +d['' + value + ''];
        });
        sumValues.push(sum);
        columns.push(sumValues);
        return columns;
      } else {
        return [];
      }
    }
  }
});