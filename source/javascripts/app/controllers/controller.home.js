mediavizControllers.controller('HomeCtrl', function($scope, Page) {

  Page.setTitle('Início');

  $scope.toolsToDisplay = [
    {name: 'Palavras-chave', description: 'Comparar palavras-chave.', url: '/chronicle'},
    {name: 'Palavras-chave (SAPO)', description: 'Comparar fontes.', url: '/SAPO/cronica'},
    {name: 'Fontes (SAPO)', description: 'Comparar fontes (SAPO).', url: '/SAPO/fontes'},
    {name: 'NewsMap', description: 'Comparar coberturas geográficas.', url: '/newsmap'}
  ]

});