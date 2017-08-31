/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('tskDetailsCtrl', ['$state', '$rootScope', '$scope', '$stateParams', '$http', '$location', '$window', '$timeout', '$ionicLoading', '$ionicActionSheet', '$ionicModal', 'PelApi', '$ionicNavBarDelegate', '$cordovaNetwork', '$ionicPopup', 'appSettings', '$sessionStorage', function($state, $rootScope, $scope, $stateParams, $http, $location, $window, $timeout, $ionicLoading, $ionicActionSheet, $ionicModal, PelApi, $ionicNavBarDelegate, $cordovaNetwork, $ionicPopup, appSettings, $sessionStorage) {
    //init
    var vm = this;

    vm.title = "אישור משימה " + $stateParams.docInitId
    //    vm.tabs = appSettings.tabs;
    vm.tabs = [{
      "text": "סבב מאשרים"
    }, {
      "text": "תיאור משימה"
    }, {
      "text": "תוכן משימה"
    }];

    vm.goHome = function() {
      PelApi.goHome();
    }


    //---------------------------------------------------------------------------
    //--                         openExistText
    //---------------------------------------------------------------------------
    vm.openExistText = function(text) {
      vm.data = {};
      vm.data.docText1 = text;
      if (text !== null) {
        var myPopup = $ionicPopup.show({
          template: '<div class="list pele-note-background" dir="RTL"><label class="item item-input"><textarea rows="8" readonly="true" ng-model="vm.data.docText1" type="text" >{{vm.data.docText1}}</textarea></label></div>',
          title: '<a class="float-right"></a>',
          subTitle: '',
          scope: vm,
          buttons: [{
            text: '<a class="pele-popup-positive-text-collot">סגור</a>',
            type: 'button-positive',
            onTap: function(e) {}
          }, ]
        });

      }
    }

    vm.isGroupShown = function(group) {
      return vm.shownGroup === group;
    }

    vm.isHourException12Shown = function(exception_note) {
      var retVal = true;

      if (exception_note === undefined || exception_note === " ") {
        retVal = false;
      }

      return retVal;
    }

    vm.toggleGroup = function(group) {
      if (vm.isGroupShown(group)) {
        vm.shownGroup = null;
      } else {
        vm.shownGroup = group;
      }
    };


    //---------------------------------------------------------------------------
    //--                         doRefresh
    //---------------------------------------------------------------------------
    vm.getData = function() {
      console.log('stateParams :', $stateParams)

      PelApi.showLoading();
      var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");
      var retGetUserNotifications = PelApi.GetUserNotifications(links, $stateParams.appId, $stateParams.docId, $stateParams.docInitId);
      retGetUserNotifications.success(function(data) {
        PelApi.lagger.info("============= Get User Notification ===============");
        var apiData = PelApi.checkApiResponse(data);
        PelApi.lagger.info("PelApi.GetUserNotifications : ", JSON.stringify(apiData));
        vm.docDetails = PelApi.getJsonString(apiData.Result, "JSON[0]", true);
        PelApi.lagger.info("vm.docDetails : ", JSON.stringify(vm.docDetails))
        vm.extendActionHistory(vm.docDetails);
      }).error(function(error) {
        PelApi.lagger.error("GetUserNotifNew : " + JSON.stringify(error));
        PelApi.showPopup(appSettings.config.getUserModuleTypesErrorMag, "");
      }).finally(function() {
        $ionicLoading.hide();
        vm.$broadcast('scroll.refreshComplete');
      });
    };

    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: vm
    }).then(function(modal) {
      vm.modal = modal;
    });

    vm.createNote = function(u) {
      vm.Note = u.Note;
      vm.modal.hide();
    };


    vm.toggleActionItem = function(action) {
      action.display = !action.display;
      if (action.display) action.left_icon = 'ion-chevron-down';
      else action.left_icon = 'ion-chevron-left';
    }
    vm.extendActionHistory = function(doc) {
      //set action.display
      //set action.right_icon
      //set left_icon
      //"{'ion-checkmark-circled':action.ACTION_CODE !== 'REJECT','ion-close-circled':action.ACTION_CODE === 'REJECT'}"
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


    vm.onSlideMove = function(data) {
      //alert("You have selected " + data.index + " tab");
    };
    //-----------------------------------
    //--         Btn Action
    //-----------------------------------
    vm.docApprove = function() {

      //var appId = $stateParams.AppId;
      var appId = appSettings.config.appId;
      var notificationId = vm.NOTIFICATION_ID;
      var actionType = 'APPROVE';
      var note = '';
      //===================================================//
      //==        Add Note Yes/No popup
      //===================================================//
      var myYesNoPopup = $ionicPopup.show({
        title: appSettings.config.isAddNoteTitle,
        subTitle: '',
        scope: vm,
        buttons: [{
            text: '<a class="pele-popup-positive-text-collot">כן</a>',
            type: 'button-positive',
            onTap: function(e) {
              return true;
            }
          },
          {
            text: '<a class="pele-popup-positive-text-collot">לא</a>',
            type: 'button-assertive',
            onTap: function(e) {

              return false;
            }
          },
        ]
      });
      myYesNoPopup.then(function(res) {
        if (res) {
          //===============================================//
          //==                 Get Note                  ==//
          //===============================================//
          vm.data = {};
          var myPopup = $ionicPopup.show({
            template: '<div class="list pele-note-background" dir="RTL"><label class="item item-input"><textarea rows="8" ng-model="vm.data.note" type="text"></textarea></label></div>',
            title: '<a class="float-right">הערות</a>',
            subTitle: '',
            scope: vm,
            buttons: [{
                text: '<a class="pele-popup-positive-text-collot">שמירה</a>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!vm.data.note) {
                    //don't allow the user to close unless he enters wifi password
                    e.preventDefault();
                    PelApi.showPopup("יש להזין הערה", "");
                  } else {
                    vm.data.cancel = false;
                    return vm.data;
                  }
                }
              },
              {
                text: 'ביטול',
                type: 'button-assertive',
                onTap: function(e) {
                  vm.data.note = "";
                  vm.data.cancel = true;
                  return vm.data;
                }
              },
            ]
          });
          myPopup.then(function(res) {
            if (!res.cancel) {
              PelApi.showLoading();
              note = res.note;
              var links3 = PelApi.getDocApproveServiceUrl("SubmitNotif");
              var retSubmitNotification = PelApi.SubmitNotification(links3, appId, notificationId, note, actionType);
              retSubmitNotification.success(function(data, status) {

                var stat = PelApi.GetPinCodeStatus(data, "GetUserNotif");
                var pinStatus = stat.status;

                if ("EOL" === pinStatus) {
                  appSettings.config.IS_TOKEN_VALID = "N";
                  vm.goHome();
                } else if ("EAI_ERROR" === pinStatus) {
                  PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");
                } else if ("ERROR_CODE" === pinStatus) {
                  PelApi.showPopup(stat.description, "");
                } else if ("OLD" === pinStatus) {
                  PelApi.showPopupVersionUpdate(data.StatusDesc, "");
                }
                PelApi.lagger.info(JSON.stringify(data));
              }).error(
                function(responce) {
                  PelApi.lagger.error("SubmitNotif : " + JSON.stringify(responce));
                }).finally(function() {
                $ionicLoading.hide();
                vm.$broadcast('scroll.refreshComplete');
                $ionicNavBarDelegate.back();
              });
            }
          });
        } else {
          PelApi.showLoading();
          var links3 = PelApi.getDocApproveServiceUrl("SubmitNotif");
          var retSubmitNotification = PelApi.SubmitNotification(links3, appId, notificationId, note, actionType);
          retSubmitNotification.success(function(data, status, headers, config) {

            var stat = PelApi.GetPinCodeStatus(data, "SubmitNotif");
            var pinStatus = stat.status;

            if ("EOL" === pinStatus) {
              vm.goHome();
            } else if ("EAI_ERROR" === pinStatus) {
              $ionicLoading.hide();
              vm.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");
            }
            PelApi.lagger.info(JSON.stringify(data));
          }).error(function(response) {
            PelApi.lagger.error("SubmitNotif : " + JSON.stringify(response));

          }).finally(function() {
            $ionicLoading.hide();
            vm.$broadcast('scroll.refreshComplete');
            $ionicNavBarDelegate.back();
          });
        };
      });
    };
    //-----------------------------------
    //--         OK
    //-----------------------------------
    vm.docOK = function() {

      //var appId = $stateParams.AppId;
      var appId = appSettings.config.appId;
      var notificationId = vm.NOTIFICATION_ID;
      var actionType = 'OK';
      var note = '';

      PelApi.showLoading();
      var links3 = PelApi.getDocApproveServiceUrl("SubmitNotif");
      var retSubmitNotification = PelApi.SubmitNotification(links3, appId, notificationId, note, actionType);
      retSubmitNotification.success(function(data, status) {
        PelApi.lagger.info(JSON.stringify(data));
        var stat = PelApi.GetPinCodeStatus(data, "SubmitNotif");
        var pinStatus = stat.status;
        if ("EOL" === pinStatus) {
          vm.goHome();
        } else if ("EAI_ERROR" === pinStatus) {
          PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");
        } else if ("ERROR_CODE" === pinStatus) {
          PelApi.showPopup(stat.description, "");
        } else {
          $ionicNavBarDelegate.back();
        }
      }).error(
        function(response) {
          PelApi.lagger.error("SubmitNotif : " + JSON.stringify(response));
        }).finally(function() {
        $ionicLoading.hide();
        vm.$broadcast('scroll.refreshComplete');
        $ionicNavBarDelegate.back();
      });
    };
    //----------------------------------------
    //--         REJECT                     --
    //----------------------------------------
    vm.docReject = function() {
      //var appId = $stateParams.AppId;
      var appId = appSettings.config.appId;
      var notificationId = vm.NOTIFICATION_ID;
      var actionType = "REJECT";

      if (vm.data.note !== undefined) {
        vm.submitNotif(actionType, vm.data.note)
      } else {
        var myPopup = $ionicPopup.show({
          template: '<div class="list pele-note-background" dir="RTL"><label class="item item-input"><textarea rows="8" ng-model="vm.data.note" type="text">{{data.note}}</textarea></label></div>',
          title: '<a class="float-right">הערות</a>',
          subTitle: '',
          scope: vm,
          buttons: [{

              text: '<a class="pele-popup-positive-text-collot">שמירה</a>',
              type: 'button-positive',
              onTap: function(e) {
                if (!vm.data.note) {
                  //don't allow the user to close unless he enters wifi password
                  e.preventDefault();
                  PelApi.showPopup("יש להזין הערה", "");
                } else {

                  return vm.data.note;
                }
              }
            },
            {
              text: 'ביטול',
              type: 'button-assertive'
            },
          ]
        });
        myPopup.then(function(res) {
          note = res
          if (note !== undefined) {
            vm.submitNotif(actionType, note);
          }
        });
      }
    }; // docReject
    //--------------------------------------------------------------
    //
    //--------------------------------------------------------------
    vm.submitNotif = function(action, note) {
      //var appId = $stateParams.AppId;
      var appId = appSettings.config.appId;

      var notificationId = vm.NOTIFICATION_ID;
      var actionType = action;

      PelApi.showLoading();
      var links3 = PelApi.getDocApproveServiceUrl("SubmitNotif");
      var retSubmitNotification = PelApi.SubmitNotification(links3, appId, notificationId, note, actionType);
      retSubmitNotification.success(function(data, status, headers, config) {
        PelApi.lagger.info(JSON.stringify(data));

        var stat = PelApi.GetPinCodeStatus(data, "SubmitNotif");
        var pinStatus = stat.status;
        if ("EOL" === pinStatus) {
          vm.goHome();
        } else if ("EAI_ERROR" === pinStatus) {
          PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");
        } else if ("ERROR_CODE" === pinStatus) {
          PelApi.showPopup(stat.description, "");
        } else {
          $ionicNavBarDelegate.back();
        }
      }).error(function(response) {
        PelApi.lagger.error("SubmitNotif : " + JSON.stringify(response));
        $ionicNavBarDelegate.back();
      }).finally(function() {
        $ionicLoading.hide();
        vm.$broadcast('scroll.refreshComplete');
      });

    };
    //--------------------------------------------------------------
    //-- When         Who       Description
    //-- -----------  --------  ------------------------------------
    //-- 06/01/2016   R.W.
    //--------------------------------------------------------------
    vm.NotePopup = function() {
      var myPopup = $ionicPopup.show({
        template: '<div class="list pele-note-background" dir="RTL"><label class="item item-input"><textarea rows="8" ng-model="vm.data.note" type="text">{{vm.data.note}}</textarea></label></div>',
        title: '<a class="float-right">הערות</a>',
        subTitle: '',
        scope: vm,
        buttons: [{

            text: '<a class="pele-popup-positive-text-collot">המשך</a>',
            type: 'button-positive',
            onTap: function(e) {
              if (!vm.data.note) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
                PelApi.showPopup("יש להזין הערה", "");
              } else {

                return vm.data.note;
              }
            }
          },
          {
            text: 'ביטול',
            type: 'button-assertive',
            onTap: function(e) {
              return vm.data.note;
            }
          },
        ]
      });

      myPopup.then(function(res) {
        vm.data.note = res;
      });
    }; // NotePopup
    //--------------------------------------------------------------
    //--           Button Action
    //--------------------------------------------------------------
    vm.showBtnActions = function() {
      var buttons = PelApi.getButtons(vm.buttonsArr);
      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: buttons,
        titleText: 'רשימת פעולות עבור טופס',
        cancelText: 'ביטול',
        //-----------------------------------------------
        //--               CANCEL
        //-----------------------------------------------
        cancel: function() {
          // add cancel code..
          return true;
        },
        //-----------------------------------------------
        //--               BUTTONS
        //-----------------------------------------------
        buttonClicked: function(index, button) {
          var note = vm.data.note;
          // add buttons code..
          if (button === appSettings.OK) {
            vm.submitNotif("OK", note);
          }
          if (button === appSettings.APPROVE) {

            vm.submitNotif("APPROVE", note);
          }
          if (button === appSettings.REJECT) {
            vm.docReject();
          }
          return true;
        },
      });
    }


    vm.getData();

  }]);
