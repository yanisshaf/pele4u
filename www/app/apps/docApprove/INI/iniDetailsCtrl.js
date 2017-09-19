/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('tskDetailsCtrl', ['$scope', '$stateParams', '$ionicLoading', '$ionicActionSheet', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup',
    function($scope, $stateParams, $ionicLoading, $ionicActionSheet, $ionicModal, PelApi, $ionicHistory, $ionicPopup) {

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
        var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");
        var retGetUserNotifications = PelApi.GetUserNotifications(links, $stateParams.appId, $stateParams.docId, $stateParams.docInitId);
        retGetUserNotifications.success(function(data) {
          var apiData = PelApi.checkApiResponse(data);
          PelApi.lagger.info("PelApi.GetUserNotifications : ");
          $scope.docDetails = PelApi.getJsonString(apiData.Result, "JSON[0]", true);
          PelApi.lagger.info("$scope.docDetails : ", JSON.stringify($scope.docDetails))
          $scope.extendActionHistory($scope.docDetails);
          $scope.buttonsArr = $scope.docDetails.BUTTONS || [];
        }).error(function(error,httpStatus) {
            PelApi.throwError("api", "GetUserNotifNew", "httpStatus : "+httpStatus)
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
          $scope.displayNotePopup(btn)
        } else {
          $scope.submitUpdateInfo(btn, $scope.actionNote.text);
        }
      };

      $scope.submitUpdateInfo = function(btn, note) {
        PelApi.showLoading();
        PelApi.SubmitNotification($scope.notifLinks, $scope.params.appId, $scope.docDetails.NOTIFICATION_ID, note, btn.action)
          .success(function(data) {
            var apiData = PelApi.checkApiResponse(data);
            PelApi.lagger.info(JSON.stringify(apiData));
          }).error(
            function(response) {
              PelApi.lagger.error("SubmitNotif : " + JSON.stringify(response));
            }).finally(function() {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            $ionicHistory.goBack();
          });
      };

      $scope.displayNotePopup = function(btn) {
        var noteModal = $ionicPopup.show({
          template: '<div class="list pele-note-background pele_rtl">' +
            '<label class="item item-input"><textarea rows="8" ng-model="actionNote.text" type="text">{{actionNote.text}}</textarea></label>' +
            '</div>',
          title: '<strong class="float-right">הערות</strong>',
          subTitle: '',
          scope: $scope,
          buttons: [{
              text: '<a class="pele-popup-positive-text-collot">המשך</a>',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.actionNote.text) {
                  e.preventDefault();
                  PelApi.showPopup("יש להזין הערה", "");
                } else {
                  return $scope.actionNote.text;
                }
              }
            },
            {
              text: 'ביטול',
              type: 'button-assertive',
              onTap: function(e) {
                return $scope.actionNote.text;
              }
            },
          ]
        });
        noteModal.then(function(res) {
          $scope.actionNote.text = res;
          if (btn)
            $scope.submitUpdateInfo(btn, res);
        });
      }

      $scope.showBtnActions = function() {
        var buttons = PelApi.getButtons($scope.buttonsArr);

        var hideSheet = $ionicActionSheet.show({
          buttons: buttons,
          titleText: 'רשימת פעולות עבור טופס',
          cancelText: 'ביטול',
          cancel: function() {
            return true;
          },
          buttonClicked: function(index, button) {
            $scope.updateDoc(buttons[index]);
            return true;
          },
        });
      }

      $scope.getData();

    }
  ]);
