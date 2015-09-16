mediavizDirectives.directive('sourceSelectChips', function($q, $filter, $location) {
return {
    restrict: 'AE',
    scope: {
      sourceList: '=',
      selected: '='
    },
    template: 
      '<md-chips ng-model="selected" md-autocomplete-snap md-require-match="true">' +
        '<md-autocomplete md-no-cache="true" md-min-length="0" md-selected-item="selectedSource" md-search-text="searchText" md-items="item in querySearch(searchText)" md-item-text="item.name" placeholder="Escolher fonte">' +
          '<span md-highlight-text="searchText">{{item.name}}</span>' +
        '</md-autocomplete>' +
        '<md-chip-template>' +
          '<span>' +
            '{{$chip.name}}' +
          '</span>' +
        '</md-chip-template>' +
      '</md-chips>',
    link: function(scope, elem, attrs) {

      scope.selectedItemChange = function() {
        this.searchText = undefined;
      }



/*      if(attrs.sources === "SAPO") {
        sourceList = SAPONewsSourceList.get();
      } else {
        SourceList.get().then(function(data) {
          sourceList = data;
          var defaultSource = $filter('filter')(sourceList, {acronym: scope.defaultSource}, true);
        });
      }
      
      scope.$watch('selectedSources.selected', function(sources) {
        if(sources.length > 0) {
          sources = sources.map(function(el) { return el.name }).join(',');
          $location.search(angular.extend($location.search(), {sources: sources}));
        } else {
          $location.search('sources', null);
        }
      }, true);*/

      scope.querySearch = function(query) {
        sources = scope.sourceList;
        console.log(sources);
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
          } else if (sourceAcronym && !source.group && sourceAcronym.search(lowercaseQuery) !== -1) {
            return sourceAcronym.search(lowercaseQuery) !== -1;
          }
          // return sourceName.search(lowercaseQuery) !== -1;
        }
      }
    },
    
  };
});