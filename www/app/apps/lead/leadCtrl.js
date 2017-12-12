/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadCtrl', ['Contact', '$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaSocialSharing',
    function(Contact, $scope, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaSocialSharing) {
      $scope.title = "לידים"
      $scope.handlers = [{
          id: "SHG",
          name: "שגרירים"
        },
        {
          id: "ISKI",
          name: "עיסקיים"
        },
        {
          id: "MANAGER",
          name: "מנהל ישיר"
        },
      ]
    }
  ]);