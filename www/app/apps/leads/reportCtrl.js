/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadsReportsCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', 'PelApi', '$ionicNavBarDelegate',
    function(StorageService, ApiGateway, $scope, $state, PelApi, $ionicNavBarDelegate) {

      $ionicNavBarDelegate.showBackButton(false);
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
        }).error(function(error, httpStatus, headers, config) {
          PelApi.throwError("api", "get Leads conf table", "httpStatus : " + httpStatus + " " + JSON.stringify(error))
        })
      }

      $scope.showLead = function(lead) {
        lead.SELF = true;
        $state.go("app.leads.lead", {
          lead: lead
        })
      }
      $scope.getData = function() {
        var service = "leads/";

        if ($state.params.type === "T")
          service += "tasks";

        PelApi.showLoading();
        ApiGateway.get(service, {
          type: $state.params.type
        }).success(function(data) {
          $scope.leads = data;
        }).error(function(error, httpStatus, headers, config) {
          PelApi.throwError("api", "fetch leads list by type ", "httpStatus : " + httpStatus + " " + JSON.stringify(error))
        }).finally(function() {
          PelApi.hideLoading();
        })
      }

      $scope.getConf();
      $scope.getData();
    }
  ]);