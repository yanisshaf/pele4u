/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('tskDetailsCtrl', ['$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaFileTransfer',
    function($scope, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaFileTransfer) {
      $scope.actionNote = {};
      $scope.params = $stateParams;
      $scope.title = "אישור משימה " + $stateParams.docInitId
      //    $scope.tabs = appSettings.tabs;
      $scope.tabs = [{
        "text": "סבב מאשרים"
      }, {
        "text": "תיאור משימה"
      }, {
        "text": "תוכן משימה"
      }];

      $scope.notifLinks = PelApi.getDocApproveServiceUrl("SubmitNotif");

      $scope.getData = function() {

        PelApi.showLoading({
          noBackdrop: true
        });

        PelApi.deleteAttachDirecoty();

        var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");
        var retGetUserNotifications = PelApi.GetUserNotifications(links, $stateParams.appId, $stateParams.docId, $stateParams.docInitId);
        retGetUserNotifications.success(function(data) {
          var apiData = PelApi.checkApiResponse(data);
          if (apiData.error) return false;
          $scope.docDetails = PelApi.getJsonString(apiData.Result, "JSON[0]", true);
          $scope.docDetails.attachments = $scope.docDetails.TASK_ATTACHMENTS_CUR || [];
          PelApi.extendActionHistory($scope.docDetails);
          $scope.buttonsArr = $scope.docDetails.BUTTONS || [];
          PelApi.lagger.info("scope.docDetails", JSON.stringify($scope.docDetails))
        }).error(function(error, httpStatus) {
          PelApi.throwError("api", "GetUserNotifNew", "httpStatus : " + httpStatus)
        }).finally(function() {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $scope.createNote = function(u) {
        $scope.Note = u.Note;
        $scope.modal.hide();
      };

      $scope.openAttachment = function(file) {
        PelApi.openAttachment(file, $scope.params.appId);
      }

      $scope.toggleActionItem = function(action) {
        action.display = !action.display;
        if (action.display) action.left_icon = 'ion-chevron-down';
        else action.left_icon = 'ion-chevron-left';
      }

      $scope.onSlideMove = function(data) {
        //alert("You have selected " + data.index + " tab");
      };

      $scope.updateDoc = function(btn) {
        if (btn.note) {
          PelApi.displayNotePopup($scope, btn)
        } else {
          $scope.submitUpdateInfo(btn, $scope.actionNote.text);
        }
      };

      $scope.submitUpdateInfo = function(btn, note) {
        PelApi.showLoading();
        PelApi.SubmitNotification($scope.notifLinks, $scope.params.appId, $scope.docDetails.NOTIFICATION_ID, note, btn.action)
          .success(function(data) {
            var apiData = PelApi.checkApiResponse(data);
            if (apiData.error) return false;
            $ionicHistory.goBack();
          }).error(
            function(error, httpStatus) {
              PelApi.throwError("api", "SubmitNotif", "httpStatus : " + httpStatus)
            }).finally(function() {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      $scope.displayNotePopup = function() {
        PelApi.displayNotePopup($scope);
      }

      $scope.showBtnActions = function() {
        PelApi.showBtnActions($scope, $scope.buttonsArr);
      }

      $scope.getData();

    }
  ]);