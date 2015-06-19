mediavizDirectives.directive('sourceSelect', function(SourceList, $q) {
  return {
    restrict: 'AE',
    scope: '=',
    link: function(scope, elem, attrs) {

      scope.selectedSource = {};
      scope.selectedSource.selected;

      scope.listSources = SourceList.get(function(data) {
        scope.listSources = data;
        // scope.selectedSource.selected = scope.listSources[0] ;
      });


      scope.querySearch = function(query) {
        sources = scope.listSources;
        var results = query ? sources.filter( createFilterFor(query) ) : sources, deferred;
        deferred = $q.defer();
        deferred.resolve(results);
        return deferred.promise;
      }

      function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(source) {
          var sourceName = source.name.toLowerCase();
          var sourceAcronym = source.acronym.toLowerCase();
          if(sourceName.search(lowercaseQuery) !== -1) {
            return sourceName.search(lowercaseQuery) !== -1;
          } else if (!source.group && sourceAcronym.search(lowercaseQuery) !== -1) {
            return sourceAcronym.search(lowercaseQuery) !== -1;
          }
          // return sourceName.search(lowercaseQuery) !== -1;
        };
      }
    },
    template: 
        '<md-autocomplete md-min-length="0" md-selected-item="selectedSource.selected" md-search-text="searchText" md-items="source in querySearch(searchText)" md-item-text="source.name" placeholder="Escolher fonte">' +
        '<span md-highlight-text="searchText" md-highlight-flags="">{{source.name}}</span>' +
        '</md-autocomplete>'
  };
});

  // <div layout="row" layout-align="center center">
  //   <md-autocomplete md-min-length="0" md-selected-item="selectedSource.selected" md-search-text="searchText" md-items="source in querySearch(searchText)" md-item-text="source.name" md-autoselect="true" placeholder="Escolher fonte">
  //     <span md-highlight-text="searchText" md-highlight-flags="">{{source.name}}</span>
  //   </md-autocomplete>
  // </div>