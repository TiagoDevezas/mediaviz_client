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
        if(format === 'SVG') {
          createChartSVG();
        }
    	};

    	function createChartPNG() {
    		var parentNode = d3.select(element[0].parentNode);
    		var svg = parentNode.select('svg');

    		// Rescale SVG and remove defs
    		svg
          .select('defs').remove();

        // Copy CSS styles to Canvas
        inlineAllStyles();

        var canvasId = 'canvasid' + Math.floor(Math.random() * 1000000001);
    		
    		// Append canvas to body
        d3.select('body').append('canvas')
          .attr('width', function() { return parseInt(svg.style("width")) })
          .attr('height', function() { return parseInt(svg.style("height")) })
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

      function createChartSVG() {

        var parentNode = d3.select(element[0].parentNode);
        var svg = parentNode.select('svg');

        svg
          .select('defs').remove();

        svg = svg[0][0];

        var prefix = {
           xmlns: 'http://www.w3.org/2000/xmlns/',
           xlink: 'http://www.w3.org/1999/xlink',
           svg: 'http://www.w3.org/2000/svg'
         };

         var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';


         svg.setAttribute('version', '1.1');

         // Disabled defs because it was screwing up SVG output
         //var defsEl = document.createElement("defs");
         //svg.insertBefore(defsEl, svg.firstChild); //TODO   .insert("defs", ":first-child")

         var styleEl = document.createElement('style');
         //defsEl.appendChild(styleEl);
         styleEl.setAttribute('type', 'text/css');


         // removing attributes so they aren't doubled up
         svg.removeAttribute('xmlns');
         svg.removeAttribute('xlink');

         // These are needed for the svg
         if (!svg.hasAttributeNS(prefix.xmlns, 'xmlns')) {
           svg.setAttributeNS(prefix.xmlns, 'xmlns', prefix.svg);
         }

         if (!svg.hasAttributeNS(prefix.xmlns, 'xmlns:xlink')) {
           svg.setAttributeNS(prefix.xmlns, 'xmlns:xlink', prefix.xlink);
         }

         inlineAllStyles();

         var source = (new XMLSerializer()).serializeToString(svg).replace('</style>', '<![CDATA[' + styles + ']]></style>');

         // Quick 'n' shitty hacks to remove stuff that prevents AI from opening SVG
         source = source.replace(/\sfont-.*?: .*?;/gi, '');
         source = source.replace(/\sclip-.*?="url\(http:\/\/.*?\)"/gi, '');
         source = source.replace(/\stransform="scale\(2\)"/gi, '');
         // not needed but good so it validates
         source = source.replace(/<defs xmlns="http:\/\/www.w3.org\/1999\/xhtml">/gi, '<defs>');

        var filename = 'mediaVizChart';

        d3.select('body')
          .append('a')
          .attr('class', 'svg-download-link')
          .attr('href', 'data:text/svg,'+ source)
          .attr('download', function() { return filename + '.svg';})
          .style('display', 'none');

        var downloadLink = d3.select('a.svg-download-link');

        var e = document.createEvent('UIEvents');
        e.initUIEvent('click', true, true, $window, 1);
        downloadLink.node().dispatchEvent(e);
        downloadLink.remove();
             
      };

      function inlineAllStyles() {
        var chartStyle = {}, 
            selector;

        // Get rules from c3.css
        for (var i = 0; i <= document.styleSheets.length - 1; i++) {
          if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf('c3.css') !== -1) {
            if (document.styleSheets[i].rules !== undefined) {
              chartStyle = angular.extend(chartStyle, document.styleSheets[i].rules);
            } else {
              chartStyle = angular.extend(chartStyle, document.styleSheets[i].cssRules);
            }
          }
        }
        
        if (chartStyle !== null && chartStyle !== undefined) {
          // SVG doesn't use CSS visibility and opacity is an attribute, not a style property. Change hidden stuff to "display: none"
          var changeToDisplay = function(){
            if (angular.element(this).css('visibility') === 'hidden' || angular.element(this).css('opacity') === 0) {
              angular.element(this).css('display', 'none');
            }
          };

          // Inline apply all the CSS rules as inline
          for (i = 0; i < chartStyle.length; i++) {
            if (chartStyle[i].type === 1) {
              selector = chartStyle[i].selectorText;
              styles = makeStyleObject(chartStyle[i]);
              d3.selectAll('svg *').each(changeToDisplay);
              // console.log(angular.element(selector).not('.c3-chart path'), d3.selectAll(selector).select(':not(.c3-chart):not(path)'));
              angular.element(selector).not('.c3-chart path').not('.c3-legend-item-tile').css(styles);
            }

            /* C3 puts line colour as a style attribute, which gets overridden
               by the global ".c3 path, .c3 line" in c3.css. The .not() above
               prevents that, but now we need to set fill to "none" to prevent
               weird beziers.
               Which screws with pie charts and whatnot, ergo the is() callback.
            */

            d3.selectAll('.c3-chart path').each(function() {
              if(angular.element(this).css('fill') === 'none') {
                angular.element(this).attr('fill', 'none');
              } else {
                var fill = angular.element(this).css('fill');
                angular.element(this).css('fill', fill);
              }
            });

            // d3.selectAll('.c3-chart path').forEach(function(el) {
            //   if(angular.element(el).css('fill') !== 'none') {
            //     var fill = angular.element(el).attr('fill');
            //     console.log(fill);
            //     angular.element(el).css('fill')
            //   }
            // });

            // angular.element('.c3-chart path')
            //   .filter(function(){
            //     return angular.element(this).css('fill') === 'none';
            //   })
            //   .attr('fill', 'none');

            // angular.element('.c3-chart path')
            //   .filter(function(){
            //     return angular.element(this).css('fill') !== 'none';
            //   })
            //   .attr('fill', function(){
            //     return angular.element(this).css('fill');
            //   });
          }
        }
      };

      // Create an object containing all the CSS styles.
      // TODO move into inlineAllStyles
      var makeStyleObject = function (rule) {
        var styleDec = rule.style;
        var output = {};
        var s;

        for (s = 0; s < styleDec.length; s++) {
          output[styleDec[s]] = styleDec[styleDec[s]];
        }
        return output;
      };


    } // End of link function
	}
});