mediavizDirectives.directive('sourceSelectSapo', function($q, $filter) {
  return {
    restrict: 'AE',
    scope: '=',
    template: 
        '<md-autocomplete md-min-length="0" md-selected-item="selectedSource" md-search-text="searchText" md-items="source in querySearch(searchText)" md-item-text="source.name" placeholder="Escolher fonte">' +
        '<span md-highlight-text="searchText" md-highlight-flags="">{{source.name}}</span>' +
        '</md-autocomplete>',
    link: function(scope, elem, attrs) {

      var sourceListArray = "A Bola,Agência Ecclesia,Agência financeira,Ambitur,Blitz,Caras,Computerworld,Correio da Manhã,Destak,Diário de Notícias,Diário Digital,Diário Economico,Diário IOL,Dinheiro Digital,Dinheiro Vivo,Euronews,Exame Informática,Expresso,Futebol 365,GameOver,iOnline,Jornal da Madeira,Jornal de Negócios,Jornal de Notícias,Jornal Diário,Jornal Digital,Jornal Record,Lusa,lusa25,maisfutebol,Meios & Publicidade,MetroNews,O Jogo,OJE - o Jornal Economico,Público,Publituris,Record OnLine,Relvado,Renascença,RTP,RTPl,Sábado,SAPO Desporto,SIC,Sol,SuperMotores,Tek,TSF,Visão,zerozero".split(',');

      var sourceList = sourceListArray.map(function(el) {
        return {name: el}
      });


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