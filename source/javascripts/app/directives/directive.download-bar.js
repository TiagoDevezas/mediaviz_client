mediavizDirectives.directive('downloadBar', function($window, $document, $timeout) {
	return {
		restrict: 'AE',
		template: 
		'<div layout="row" flex>' +
      '<span flex></span>' +
      '<md-menu md-position-mode="target-right target">' +
      	'<md-button class="md-icon-button" aria-label="Descarregar imagem" ng-click="$mdOpenMenu($event)">' +
        	'<md-icon>file_download</md-icon>' +
      	'</md-button>' +
      	'<md-menu-content>' +
      		'<md-menu-item ng-repeat="opt in downloadOptions">' +
      			'<md-button ng-click="announceClick(opt.format)">{{opt.label}}</md-button>' +
      		'</md-menu-item>' +
    		'</md-menu-content>' +
      '</md-menu>' +
  	'</div>',
    link: function postLink(scope, element, attrs) {
    	var d3 = $window.d3

    	// var originatorEv;
	    // scope.openMenu = function($mdOpenMenu, ev) {
	    //   originatorEv = ev;
	    //   $mdOpenMenu(ev);
	    // };

    	scope.downloadOptions = [
    		{label: 'Guardar como PNG', format: 'PNG'},
    		{label: 'Guardar como SVG', format: 'SVG'}
    	];

    	scope.announceClick = function(format) {
    		if(format === 'PNG') {
    			createChartPNG();
    		}
    	};

    	function createChartPNG() {
    		var parentNode = d3.select(element[0].parentNode);
    		var svg = parentNode.select('svg');

    		// Rescale SVG and remove defs
    		svg
    			.attr('transform', 'scale(2)')
          .select('defs').remove();

        var canvasId = 'canvasid' + Math.floor(Math.random() * 1000000001);
    		
    		// Append canvas to body
        d3.select('body').append('canvas')
          .attr('width', function() { return parseInt(svg.style("width")) * 2 })
          .attr('height', function() { return parseInt(svg.style("height")) * 2 })
          .attr('id', canvasId)
          .style('display', 'none');

        var canvas = angular.element(document.querySelector('#' + canvasId)).empty()[0];
        var canvasContext = canvas.getContext('2d');

        var svg = svg[0][0];

        var outerSvg = svg.outerHTML;

        canvasContext.drawSvg(outerSvg, 0, 0);

        var filename = 'mediaVizChart_' + canvasId;

        d3.select('body')
        	.append('a')
        	.attr('id', canvasId)
        	.attr('href', canvas.toDataURL('png'))
          .attr('download', function() { return filename + '.png';})
          .style('display', 'none');

        var downloadLink = d3.select('a#' + canvasId);

        var e = document.createEvent('UIEvents');
				e.initUIEvent('click', true, true, $window, 1);
				downloadLink.node().dispatchEvent(e);
				downloadLink.remove();
    		
    	}
    }
	}
});