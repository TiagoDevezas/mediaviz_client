mediavizServices.factory('SourceList', ['$http',
	function($http) {
		var baseUrl = 'http://localhost:4567/';
		// var callback = '?callback=JSON_CALLBACK';
		var factory = {};
		factory.getDefaultList = function() {
			return $http.get(baseUrl + 'sources', {cache: true}).then(function(response) {
				var sources = response.data;
				sources.unshift({'name': 'Todas arquivo', 'type': 'archive', 'acronym': 'archive', 'group': true });
				sources.unshift({'name': 'Todos os blogues', 'type': 'blogs', 'acronym': 'blogs', 'group': true });
				sources.unshift({'name': 'Todas internacionais', 'type': 'international', 'acronym': 'international', 'group': true});
				sources.unshift({'name': 'Todas nacionais', 'type': 'national', 'acronym': 'national', 'group': true });
				sources.unshift({'name': 'Investigação', 'type': 'research', 'acronym': 'research', 'group': true });
				return sources;
			});
		},
		factory.getSAPONewsList = function() {
			var allSources = "A Bola,Agência Ecclesia,Agência financeira,Ambitur,Blitz,Caras,Computerworld,Correio da Manhã,Destak,Diário de Notícias,Diário Digital,Diário Economico,Diário IOL,Dinheiro Digital,Dinheiro Vivo,Euronews,Exame Informática,Expresso,Futebol 365,GameOver,iOnline,Jornal da Madeira,Jornal de Negócios,Jornal de Notícias,Jornal Diário,Jornal Digital,Jornal Record,Lusa,lusa25,maisfutebol,Meios & Publicidade,MetroNews,O Jogo,OJE - o Jornal Economico,Público,Publituris,Record OnLine,Relvado,Renascença,RTP,RTPl,Sábado,SAPO Desporto,SIC,Sol,SuperMotores,Tek,TSF,Visão,zerozero";
			// Remove Meios & Publicidade - not working 
			var sourceNames = "A Bola,Agência Ecclesia,Agência financeira,Ambitur,Blitz,Caras,Computerworld,Correio da Manhã,Destak,Diário de Notícias,Diário Digital,Diário Economico,Diário IOL,Dinheiro Digital,Dinheiro Vivo,Euronews,Exame Informática,Expresso,Futebol 365,GameOver,iOnline,Jornal da Madeira,Jornal de Negócios,Jornal de Notícias,Jornal Diário,Jornal Digital,Jornal Record,Lusa,maisfutebol,MetroNews,O Jogo,OJE - o Jornal Economico,Público,Publituris,Record OnLine,Relvado,Renascença,RTP,RTPl,Sábado,SAPO Desporto,SIC,Sol,SuperMotores,Tek,TSF,Visão,zerozero";
			var sourceNamesArray = sourceNames.split(',');
	  	var sourceListArray = sourceNamesArray.map(function(el) {
	  		if(el === 'Lusa') {
	  			return {name: 'Lusa', value: 'Lusa,lusa25'};
	  		} else {
	  			return {name: el, value: el};
	  		}
	    });
	    sourceListArray.unshift({name: 'Todas', value: sourceNames});
	    return sourceListArray;
		}
		return factory;
	}]);