mediavizDirectives.directive('sourceSelectChips', function(SourceList, $q, $filter) {
return {
    restrict: 'AE',
    scope: '=',
    template: 
      '<md-chips ng-model="selectedSources" md-autocomplete-snap md-require-match>' +
        '<md-autocomplete md-no-cache="true" md-min-length="0" md-selected-item="selectedSource" md-search-text="searchText" md-items="source in querySearch(searchText)" md-item-text="" placeholder="Escolher fonte">' +
          '<span md-highlight-text="searchText" md-highlight-flags="">{{source.name}}</span>' +
        '</md-autocomplete>' +
        '<md-chip-template>' +
          '<span>' +
            '{{$chip.name}}' +
          '</span>' +
        '</md-chip-template>' +
      '</md-chips>',
    link: function(scope, elem, attrs) {

      SourceList.get().then(function(data) {
        scope.listSources = data;
        var defaultSource = $filter('filter')(scope.listSources, {acronym: scope.defaultSource}, true);
        // scope.selectedSource = defaultSource[0];
      });

      scope.selectedSources = [];

      // scope.addToSelectedSources = function(source) {
      //   scope.selectedSources.push(source);
      // }

      scope.$watch('selectedSources', function(val) {
        console.log(val);
      }, true);

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
        }
      }
    },
    
  };
});

    // <md-chips ng-model="ctrl.selectedVegetables" md-autocomplete-snap md-require-match>
    //   <md-autocomplete
    //       md-selected-item="ctrl.selectedItem"
    //       md-search-text="ctrl.searchText"
    //       md-items="item in ctrl.querySearch(ctrl.searchText)"
    //       md-item-text="item.name"
    //       placeholder="Search for a vegetable">
    //     <span md-highlight-text="ctrl.searchText">{{item.name}} :: {{item.type}}</span>
    //   </md-autocomplete>
    //   <md-chip-template>
    //     <span>
    //       <strong>{{$chip.name}}</strong>
    //       <em>({{$chip.type}})</em>
    //     </span>
    //   </md-chip-template>
    // </md-chips>