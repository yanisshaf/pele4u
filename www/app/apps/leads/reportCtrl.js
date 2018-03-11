/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadsReportsCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaSocialSharing',
    function(StorageService, ApiGateway, $scope, $state, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaSocialSharing) {
      console.log("$state.params.personal", $state.params.personal)
      $scope.title = "לידים שלי";

      if ($state.params.personal === "true") {
        $scope.title = "לידים עצמיים";
      }

      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf")
        if ($scope.conf) return;

        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60)
          $scope.conf = data;
        }).error(function(err) {
          alert("Error get conf for leads application")
        })
      }

      $scope.getData = function() {
        ApiGateway.get("leads").success(function(data) {
          $scope.leads = data;
        }).error(function(err) {
          alert("Error get leads")
        })
      }

      $scope.getConf();
      $scope.getData();
      console.log($state.params);
    }
  ]);