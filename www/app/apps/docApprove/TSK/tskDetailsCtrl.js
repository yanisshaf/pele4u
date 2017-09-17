/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('tskDetailsCtrl', ['$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup',
    function($scope, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup) {

      $scope.actionNote = {
        text: ""
      };
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

          $scope.docDetails = PelApi.getJsonString(apiData.Result, "JSON[0]", true);
          $scope.docDetails.attachments = $scope.docDetails.TASK_ATTACHMENTS_CUR || [];
          $scope.extendActionHistory($scope.docDetails);
          $scope.buttonsArr = $scope.docDetails.BUTTONS || [];
          PelApi.lagger.info("scope.docDetails", JSON.stringify($scope.docDetails))
        }).error(function(error) {
          PelApi.goError("api", "GetUserNotifNew", JSON.stringify(error))
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

        if (file.SHOW_CONTENT !== 'Y') {
          PelApi.showPopup(PelApi.appSettings.config.ATTACHMENT_TYPE_NOT_SUPORTED_FOR_OPEN, "");
          return true;
        }
        var links = PelApi.getDocApproveServiceUrl("GetFileURI");

        PelApi.showLoading();
        var pinCode = PelApi.pinState.get().code;
        //var full_path = PelApi.appSettings.shareFileDirectory + file.TARGET_PATH + "/" + file.TARGET_FILENAME;
        var full_path = PelApi.appSettings.shareFileDirectory + "/DV/TASK/TEST" + "/" + "pdf.pdf";
        console.log("full_path :", full_path)

        var getFilePromise = PelApi.GetFileURI(links, $scope.params.appId, PelApi.pinState.get().code, full_path);
        getFilePromise.success(function(data) {
          var fileApiData = PelApi.checkApiResponse(data);

          targetPath = PelApi.getAttchDirectory() + '/' + file.TARGET_FILENAME;
          alert(window.cordova)
          if (!window.cordova) {
            console.log(fileApiData)
            window.open(fileApiData.URI, "_system", "location=yes,enableViewportScale=yes,hidden=no");
          } else {
            PelApi.showPopup("start download", "");
            $cordovaFileTransfer.download(fileApiData.URI, targetPath, {}, true)
              .then(
                //success
                function(result) {
                  PelApi.showPopup(JSON.stringify(result), "");
                  window.open(result.nativeURL, "_system", "location=yes,enableViewportScale=yes,hidden=no");
                },
                //error
                function(error) {
                  PelApi.showPopup(JSON.stringify(error), "");
                },
                // in progress
                function(progress) {
                  //  $timeout(function() {
                  //    $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                  //  });
                })
          }
        }).error(function(error) {
          PelApi.showPopup("שגיאה בהורדת קובץ", "");
        }).finally(function() {
          PelApi.hideLoading();
        });

        return true;

        PelApi.lagger.info(" file info : ", file)
      }

      $scope.toggle = function(element) {
        element.display = !element.display;
        if (element.display) element.icon = 'ion-chevron-down';
        else element.icon = 'ion-chevron-left';
      }


      $scope.toggleInit = function(elementStr, isDisplay) {
        $scope[elementStr] = {
          display: false
        };
        if (typeof isDisplay === true) {
          $scope[elementStr] = {
            display: true
          };
        }
        if ($scope[elementStr].display) $scope[elementStr].icon = 'ion-chevron-down';
        else $scope[elementStr].icon = 'ion-chevron-left';
      }


      $scope.toggleActionItem = function(action) {
        action.display = !action.display;
        if (action.display) action.left_icon = 'ion-chevron-down';
        else action.left_icon = 'ion-chevron-left';
      }


      $scope.extendActionHistory = function(doc) {
        if (!doc.ACTION_HISTORY) return [];
        doc.ACTION_HISTORY.forEach(function(action) {
          action.display = false;
          action.right_icon = "";
          action.left_icon = "";

          if (typeof action.NOTE != "undefined" && action.NOTE.length) {
            action.display = true;
            action.left_icon = 'ion-chevron-down';
            if (action.ACTION_CODE == "REJECT") {
              action.right_icon = 'ion-close-circled';
            }
          }

          if (action.ACTION_CODE === "FORWARD" || action.ACTION_CODE === "APPROVE") {

            action.left_icon = 'ion-chevron-left';
            action.right_icon = 'ion-checkmark-circled'
          }

          if (action.ACTION_CODE === "NO_ACTION") {
            action.left_icon = 'ion-chevron-left';
            action.right_icon = 'ion-minus-circled';
          }
          if (!action.ACTION_CODE) {
            action.display = false;
            action.right_icon = "";
            action.left_icon = "";
          }
        })
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
            $ionicHistory.goBack();
          }).error(
            function(error) {
              PelApi.goError("api", "SubmitNotif", JSON.stringify(error))
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
