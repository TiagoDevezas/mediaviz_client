mediavizDirectives.directive('loadingFlash', function() {
 return {
   restrict: 'AE',
   transclude: true,
   template: '<div ng-show="loading" style="position: absolute; top: -5px; left: 0; right: 0;"><md-progress-linear md-mode="indeterminate" class="md-accent"></md-progress-linear></div>'
 }
});