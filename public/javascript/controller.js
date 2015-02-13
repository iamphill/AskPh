angular.module('AskPh', ['xml', 'ngSanitize'])
       .config(function ($httpProvider) {
         $httpProvider.interceptors.push('xmlHttpInterceptor');
       })
       .controller('AskPh.Controller.Main', ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
        $scope.trustSource = function (src) {
          return $sce.trustAsResourceUrl(src);
        }

        $http.get('/feed').success(function (d) {
          $scope.items = d['rss']['channel']['item'];
        });
      }]);
