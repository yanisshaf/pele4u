/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('menuCtrl', ['$scope', '$state', 'StorageService', 'ApiGateway',
    function($scope, $state, StorageService, ApiGateway) {
      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf", {})

        if ($scope.conf.types) {

          return;
        }
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60)
        }).error(function(err) {
          console.log(err)
        })
      }

      $scope.getConf();

      $scope.info = function() {
        swal({
          text: "שימו לב . ליד עצמי הינו ליד ",
          confirmButtonText: 'אישור'
        }).then(function(ret) {
          console.log(ret)
        })
      }
    }

  ]);