mediavizControllers.controller('HomeCtrl', function($scope, Page) {

  Page.setTitle('Início');

  $scope.toolsToDisplay = [
    {name: 'Palavras-chave', description: 'Comparar palavras-chave.', url: '/chronicle'},
    {name: 'Fontes', description: 'Comparar fontes.', url: '/sources'},
    {name: 'SAPO Fontes', description: 'Comparar fontes (SAPO).', url: '/sapo'},
    {name: 'NewsMap', description: 'Comparar coberturas geográficas.', url: '/newsmap'}
  ]

});