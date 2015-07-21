mediavizDirectives.directive('loadingFlash', function() {
 return {
   restrict: 'AE',
   transclude: true,
   template: '<div ng-show="loading" style="margin-top: -5px;"><md-progress-linear md-mode="indeterminate" class="md-accent"></md-progress-linear></div>'
 }
});