mediavizDirectives.directive('loadingFlash', function() {
 return {
   restrict: 'AE',
   transclude: true,
   template: '<div ng-show="loading" layout="column" layout-margin><md-progress-linear md-mode="indeterminate"></md-progress-linear></div>'
 }
});