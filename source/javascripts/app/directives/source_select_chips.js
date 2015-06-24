mediavizDirectives.directive('sourceSelectChips', function(SourceList, $q, $filter, $location) {
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

      var sourceList = null;
      var sourceListArray = "A Bola,Agência Ecclesia,Agência financeira,Ambitur,Blitz,Caras,Computerworld,Correio da Manhã,Destak,Diário de Notícias,Diário Digital,Diário Economico,Diário IOL,Dinheiro Digital,Dinheiro Vivo,Euronews,Exame Informática,Expresso,Futebol 365,GameOver,iOnline,Jornal da Madeira,Jornal de Negócios,Jornal de Notícias,Jornal Diário,Jornal Digital,Jornal Record,Lusa,lusa25,maisfutebol,Meios & Publicidade,MetroNews,O Jogo,OJE - o Jornal Economico,Público,Publituris,Record OnLine,Relvado,Renascença,RTP,RTPl,Sábado,SAPO Desporto,SIC,Sol,SuperMotores,Tek,TSF,Visão,zerozero".split(',');

      if(attrs.sources === "SAPO") {
        sourceList = sourceListArray.map(function(el) {
          return {name: el, value: el}
        });
        sourceList.unshift({name: 'Todas', value: sourceListArray.join(',')});
      } else {
        SourceList.get().then(function(data) {
          sourceList = data;
          var defaultSource = $filter('filter')(sourceList, {acronym: scope.defaultSource}, true);
        });
      }

/*      SourceList.get().then(function(data) {
        scope.listSources = data;
        var defaultSource = $filter('filter')(scope.listSources, {acronym: scope.defaultSource}, true);
        // scope.selectedSource = defaultSource[0];
      });*/

      scope.selectedSources = [];

      // scope.addToSelectedSources = function(source) {
      //   scope.selectedSources.push(source);
      // }

      scope.$watch('selectedSources', function(sources) {
        if(sources.length > 0) {
          sources = sources.map(function(el) { return el.name }).join(',');
          $location.search(angular.extend($location.search(), {sources: sources}));
        } else {
          $location.search('sources', null);
        }
      }, true);

      scope.querySearch = function(query) {
        sources = sourceList;
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