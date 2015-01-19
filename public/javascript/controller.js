angular.module('AskPh', []).controller('AskPh.Controller.Main', ['$scope', '$http', function ($scope, $http) {
  $http.get('/feed').success(function (d) {
    
  });
}]);
