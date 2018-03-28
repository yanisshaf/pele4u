/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadsReportsCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaSocialSharing',
    function(StorageService, ApiGateway, $scope, $state, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaSocialSharing) {


      $scope.type = $state.params.type;

      if ($state.params.type === "S") {
        $scope.title = "לידים שפתחתי";
      } else {
        $scope.title = "לידים שלי";
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

      $scope.showLead = function(lead) {
        lead.SELF = true;
        $state.go("app.leads.lead", {
          lead: lead
        })
      }

      $scope.getData = function() {

        ApiGateway.get("leads/", {
          type: $state.params.type
        }).success(function(data) {
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