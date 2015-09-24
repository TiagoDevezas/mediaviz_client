mediavizDirectives.directive('loadingFlash', function() {
 return {
   restrict: 'AE',
   transclude: true,
   template: '<div ng-show="loading" layout="row" layout-align="space-around"><md-progress-circular md-diameter="20px" md-mode="indeterminate" class="md-accent"></md-progress-circular></div>'
 }
});