mediavizServices.factory('SourceList', ['$http',
	function($http) {
		var callback = '?callback=JSON_CALLBACK';
		var factory = {};
		factory.getDefaultList = function() {
			return $http.jsonp(baseUrl + 'sources' + callback, {cache: true}).then(function(response) {
				var sources = response.data.map(function(el) {
					return { 'name': el.name, 'type': el.type, 'acronym': el.acronym };
				});
				sources.unshift({'name': 'Todas arquivo', 'type': 'archive', 'acronym': 'archive', 'group': true });
				sources.unshift({'name': 'Todos os blogues', 'type': 'blogs', 'acronym': 'blogs', 'group': true });
				sources.unshift({'name': 'Todas internacionais', 'type': 'international', 'acronym': 'international', 'group': true});
				sources.unshift({'name': 'Todas nacionais', 'type': 'national', 'acronym': 'national', 'group': true });
				return sources;
			});
		},
		factory.getSAPONewsList = function() {
			var sourceNames = "A Bola,Agência Ecclesia,Agência financeira,Ambitur,Blitz,Caras,Computerworld,Correio da Manhã,Destak,Diário de Notícias,Diário Digital,Diário Economico,Diário IOL,Dinheiro Digital,Dinheiro Vivo,Euronews,Exame Informática,Expresso,Futebol 365,GameOver,iOnline,Jornal da Madeira,Jornal de Negócios,Jornal de Notícias,Jornal Diário,Jornal Digital,Jornal Record,Lusa,lusa25,maisfutebol,Meios & Publicidade,MetroNews,O Jogo,OJE - o Jornal Economico,Público,Publituris,Record OnLine,Relvado,Renascença,RTP,RTPl,Sábado,SAPO Desporto,SIC,Sol,SuperMotores,Tek,TSF,Visão,zerozero";
			var sourceNamesArray = sourceNames.split(',');
	  	var sourceListArray = sourceNamesArray.map(function(el) {
	      return {name: el, value: el}
	    });
	    sourceListArray.unshift({name: 'Todas', value: ''});
	    return sourceListArray;
		}
		return factory;
	}]);