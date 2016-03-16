mediavizDirectives.directive('sourceSelect', function($q, $filter, SourceList) {
  return {
    restrict: 'AE',
    scope: {
      sourceList: '=',
      selectedSource: '='
    },
    template: 
        '<md-autocomplete md-no-cache="true" md-min-length="0" md-selected-item="selectedSource" md-search-text="searchText" md-items="item in querySearch(searchText)" md-item-text="item.name" placeholder="Select source">' +
        '<span md-highlight-text="searchText" md-highlight-flags="">{{item.name}}</span>' +
        '</md-autocomplete>',
    link: function(scope, elem, attrs) {

      scope.querySearch = function(query) {
        sources = scope.sourceList;
        var results = query ? sources.filter( createFilterFor(query) ) : sources, deferred;
        deferred = $q.defer();
        deferred.resolve(results);
        return deferred.promise;
      }

      function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(source) {
          var sourceName = source.name.toLowerCase();
          var sourceAcronym = source.acronym ? source.acronym.toLowerCase() : null;
          if(sourceName.search(lowercaseQuery) !== -1) {
            return sourceName.search(lowercaseQuery) !== -1;
          } else if (!source.group && sourceAcronym && sourceAcronym.search(lowercaseQuery) !== -1) {
            return sourceAcronym.search(lowercaseQuery) !== -1;
          }
          // return sourceName.search(lowercaseQuery) !== -1;
        }
      }
    },
    
  };
});