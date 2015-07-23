mediavizDirectives.directive('svgCrowbar', function($window) {
  return {
    restrict: 'AE',
    scope: '=',
    template: '<md-button class="md-icon-button" aria-label="descarregar" ng-show="svgPresent">' +
                '<md-icon>file_download</md-icon>' +
              '</md-button>',
    link: function postLink(scope, element, attrs) {
      var d3 = $window.d3
      scope.svgPresent = false;

      var theme = scope.theme;

      var containerClass = '.chart-container';

      var svgIds = [];

      scope.$watch(function() { return document.querySelectorAll(containerClass).length }, function(newVal) {
        if(newVal > 0) {
          scope.svgPresent = true;
        }
      }, true);

      element.on('click', function() {
        var foundSvgs = d3.selectAll(containerClass)[0];
        foundSvgs.forEach(function(svg) {
          svgIds.push('#' + angular.element(svg)[0].id);
        });
      });

      scope.$watch(function() {return svgIds.length > 0}, function(newVal) {
        if(newVal) {
          svgIds.forEach(function(svgId) {
            createImages(svgId);
          });
        }
      });

      function createImages(svgId) {
        var svgElement = d3.select(svgId + ' > svg');

        var canvasId = svgId + 'canvas';
        
        // Remove defs element
        svgElement.attr('transform', 'scale(2)')
            .select('defs').remove();

        // Append canvas to body
        d3.select('body').append('canvas')
          .attr('width', function() { return parseInt(svgElement.style("width")) * 2 })
          .attr('height', function() { return parseInt(svgElement.style("height")) * 2 })
          .attr('id', canvasId.replace('#', ''))
          .style('display', 'none');

        var canvas = angular.element(document.querySelector(canvasId)).empty()[0];
        var canvasContext = canvas.getContext('2d');

        var svg = svgElement[0][0];
        var offsetLeft = svg.getBoundingClientRect().left;
        var offsetTop = svg.getBoundingClientRect().top;

        var outerSvg = svgElement[0][0].outerHTML;
        // var serializer = new XMLSerializer();
        // svg = serializer.serializeToString(svg);

        canvasContext.drawSvg(outerSvg, 0, 0);

        var filename = 'mediaVizChart_' + svgId.replace('#', '');

        var fabButton = '<md-button class="md-fab md-mini md-primary" aria-label="Descarregar"><md-icon>file_download</md-icon></md-button>';

        d3.select(svgId)
          .append('a')
          .attr('href', canvas.toDataURL('png'))
          .attr('download', function() { return filename + '.png';})
          .style('position', 'absolute')
          .style('top', -20 + 'px')
          .style('left', -20 + 'px')
          .attr('id', svgId.replace('#', '') + 'button' )
          .html('<button class="md-fab md-mini md-primary md-button md-' + theme + '-theme"><md-icon class="md-sapoTheme-theme material-icons">file_download</md-icon>')
          

        // console.log(angular.element(d3.select('body')))
        // .append('div')
        //   .html(fabButton);

        // d3.select('.chart-container')
        //   .insert('md-button')
        //   .style('position', 'relative')
        //   .style('top', 30)
        //   .style('left', 40)
        //   .attr('class', 'md-fab md-mini md-primary')
        //   .html('<md-icon>file_download</md-icon>');



      }

    }
  }
});