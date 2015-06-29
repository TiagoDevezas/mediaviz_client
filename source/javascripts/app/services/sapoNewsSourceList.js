// mediavizServices.factory('SAPONewsSourceList', function() {
//   var baseUrl = "http://services.sapo.pt/InformationRetrieval/Epicentro/GetTrendline"
//   var factory = {};
//   factory.get = function() {
//   	var sourceListArray = "A Bola,Agência Ecclesia,Agência financeira,Ambitur,Blitz,Caras,Computerworld,Correio da Manhã,Destak,Diário de Notícias,Diário Digital,Diário Economico,Diário IOL,Dinheiro Digital,Dinheiro Vivo,Euronews,Exame Informática,Expresso,Futebol 365,GameOver,iOnline,Jornal da Madeira,Jornal de Negócios,Jornal de Notícias,Jornal Diário,Jornal Digital,Jornal Record,Lusa,lusa25,maisfutebol,Meios & Publicidade,MetroNews,O Jogo,OJE - o Jornal Economico,Público,Publituris,Record OnLine,Relvado,Renascença,RTP,RTPl,Sábado,SAPO Desporto,SIC,Sol,SuperMotores,Tek,TSF,Visão,zerozero".split(',');
//   	sourceListArray = sourceListArray.map(function(el) {
//       return {name: el, value: el}
//     });
//     sourceListArray.unshift({name: 'Todas', value: sourceListArray.join(',')});
//     return sourceListArray;
//   }
//   return factory;
// });