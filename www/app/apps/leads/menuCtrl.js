/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('menuCtrl', ['$scope', '$state', 'StorageService', 'ApiGateway', 'PelApi', '$ionicModal',
    function($scope, $state, StorageService, ApiGateway, PelApi, $ionicModal) {

      var getInfo = function() {
        return _.get($scope.conf, "clientConfig['leads.client.infoModal']")
      }


      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf", {})
        $scope.info = getInfo();
        if ($scope.conf.types) {
          return;
        }
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60);
          $scope.conf = data;
          $scope.info = getInfo();
        }).error(function(error, httpStatus, headers, config) {
          PelApi.throwError("api", "get Leads conf table", "httpStatus : " + httpStatus + " " + JSON.stringify(error))
        })
      }

      $scope.getConf();


      $ionicModal.fromTemplateUrl('leadInfo.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $scope.openModal = function() {

        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };

      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
    }

  ]);