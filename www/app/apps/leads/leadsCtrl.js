/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadsCtrl', ['StorageService', 'ApiGateway', '$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaSocialSharing',
    function(StorageService, ApiGateway, $scope, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaSocialSharing) {
      $scope.lead = {}
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
      $scope.getConf();

      $scope.submit = function() {
        ApiGateway.post("leads", $scope.lead).success(function(data) {
          console.log(data)
        }).error(function(err) {
          swal(JSON.stringify(err))
          $scope.error = err;
          setTimeout(function() {
            $scope.error = ""
          }, 3000)
        })
      }

      $scope.title = "ליד חדש"
    }
  ]);