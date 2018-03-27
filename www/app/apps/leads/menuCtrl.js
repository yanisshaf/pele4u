/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('menuCtrl', ['$scope', '$state',
    function($scope, $state) {
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