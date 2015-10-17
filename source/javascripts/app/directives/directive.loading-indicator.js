mediavizDirectives.directive('loadingFlash', function() {
 return {
   restrict: 'AE',
   transclude: true,
   template: '<div ng-show="loading" layout="row" layout-align="space-around"><md-progress-circular md-mode="indeterminate" class="md-accent"></md-progress-circular></div>'
 }
});