angular.module('pele.factories', ['ngStorage', 'LocalStorageModule', 'ngCordova', 'pele.messages'])
  .factory('PelApi', function($cordovaNetwork, $http, $rootScope, appSettings, $state, $ionicLoading, $filter, $ionicPopup, $timeout, $fileLogger, $sessionStorage, $localStorage, $cordovaFile, messages) {
    return {

      init: function() {

        this.messages = messages;
        this.appSettings = appSettings;
        this.topconfig = appSettings.apiConfig;
        this.env = appSettings.env;

        //file "located" in Borwser localStorage
        this.lagger = $fileLogger;

      },
      cordovaInit: function() {
        //file in device file system
        appSettings.config.network = $cordovaNetwork.getNetwork();
        appSettings.config.isOnline = $cordovaNetwork.isOnline();
        //$scope.$apply();

        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
          appSettings.config.isOnline = true;
          appSettings.config.network = $cordovaNetwork.getNetwork();
          if (appSettings.env == "DV") {
            var alertPopup = $ionicPopup.alert({
              title: 'Network Changed',
              template: 'network - DEV only : ' + appSettings.config.network
            });
          }

          $scope.$apply();
        })

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
          appSettings.config.isOnline = false;
          appSettings.config.network = $cordovaNetwork.getNetwork();

          if (appSettings.env == "DV") {
            var alertPopup = $ionicPopup.alert({
              title: 'Network Changed',
              template: 'network - DEV only : ' + appSettings.config.network
            });
          }
          $scope.$apply();
        })

        this.lagger = $fileLogger;

        $fileLogger.setStorageFilename(appSettings.config.LOG_FILE_NAME)
        this.lagger.deleteLogfile().then(function() {
          this.lagger.info('Logfile deleted - start new log');
        });
        this.registerPushNotification();
      },

      registerPushNotification: function() {
        //-----------------------------------------
        //--   Registration for Push Notification
        //-----------------------------------------
        var self = this;
        if (window.plugins !== undefined) {

          cordova.plugins.notification.badge.configure({
            autoClear: true
          });

          cordova.plugins.notification.badge.clear();

          var oneSignalConf = appSettings.apiConfig.OneSignal[appSettings.apiConfig.env] ||"notfound";
          if(oneSignalConf==="notfound") {
            $state.go("app.error", {
                      error:"Onesignal conf not found !"
                });
          }

          self.lagger.info('Open Notification Event');
          window.plugins.OneSignal.setLogLevel({
            logLevel: oneSignalConf.logLevel || 0,
            visualLevel: oneSignalConf.visualLevel || 0
          });
          var notificationOpenedCallback = function(jsonData) {
            self.lagger.info('notificationOpenedCallback: ' + JSON.stringify(jsonData));
          };
          window.plugins.OneSignal
            //.startInit(conf.appId, conf.googleProjectNumber)
            .startInit(oneSignalConf.appId)
            .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
            .handleNotificationOpened(notificationOpenedCallback)
            .endInit();

          window.plugins.OneSignal.getIds(function(ids) {
            appSettings.config.PLAYER_ID = ids.userId;
            self.lagger.info('window.plugins.OneSignal.getIds :' + ids.userId);
          });
        }
      },

      sendPincode: function(pincode) {
        return $http({
          url: appSettings.api,
          method: "POST",
          data: {
            pincode: pincode
          },

          timeout: appSettings.timeout,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        });
      },
      login: function() {
        return $http({
          url: appSettings.api,
          method: "POST",
          data: {},
          timeout: appSettings.timeout,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        });
      },
      getAppId: function() {

        var menuList = appSettings.config.GetUserMenu;

        var pinCodeReq = "N";
        var appId = "";

        if (menuList.menuItems !== undefined) {
          var appList = menuList.menuItems;
          var length = appList.length;

          for (var i = 0; i < length; i++) {
            var pin = appList[i].Pin
            if (pin !== false) {
              pinCodeReq = "Y";
              appId = appList[i].AppId;
              i = length;
            }
          }
          try {
            if (appId === "") {
              appId = appList[0].AppId;
            }
          } catch (e) {
            appId = appSettings.config.appId;
          }
        }
        return appId;
      },
      sendScanPrint: function(links) {
        var headers = {
          "Accept": "application/json, text/plain, */*"
        };
        var version = appSettings.config.APP_VERSION;
        //{"Content-Type": "application/json; charset=utf-8"};
        var envUrl = links + "&UserName=" + appSettings.config.userName + "&ID=" + appSettings.config.user;

        if ("wifi" === appSettings.config.network) {
          headers = {
            "Content-Type": "application/json; charset=utf-8",
            "VERSION": version,
            "msisdn": appSettings.config.MSISDN_VALUE
          }
        } else {
          headers = {
            "Content-Type": "application/json; charset=utf-8",
            "VERSION": version
          };
        }

        this.lagger.info("URL : " + envUrl);
        this.lagger.info("headers : " + headers);

        return $http({
          url: envUrl,
          method: "GET",
          timeout: appSettings.menuTimeout,
          headers: headers
        });
      },
      //--------------------------------------------------------------------------//
      //--                       IsSessionValidJson                             --//
      //--------------------------------------------------------------------------//
      IsSessionValidJson: function(links, appId, pin) {
        var envUrl = links.URL;
        var headers = "";
        var version = appSettings.config.APP_VERSION
        var parameters = "/" + appSettings.config.token + "/" + appId + "/" + pin;
        if ("wifi" === appSettings.config.network) {
          envUrl = links.url + parameters;
          headers = {
            "Content-Type": "application/json; charset=utf-8",
            "VERSION": version,
            "msisdn": appSettings.config.MSISDN_VALUE
          }
        } else {
          envUrl = links.URL + parameters;
          headers = {
            "Content-Type": "application/json; charset=utf-8",
            "VERSION": version
          };
        }

        this.lagger.info("======== factories.IsSessionValidJson() ===========");
        this.lagger.info(envUrl);

        return $http({
          url: envUrl,
          method: "GET",
          timeout: appSettings.menuTimeout,
          headers: headers
        });
      },
      //--------------------------------------------------------------------//
      //                    GetUserMenu PAGE 1                              //
      //--------------------------------------------------------------------//
      getMenu: function(links) {
        // LOADING
        return $http({
          url: links.url,
          method: "GET",
          timeout: appSettings.menuTimeout,
          headers: links.headers
        });

      },
      //------------------------------------------------------------------------//
      //                        getUserModuleTypes PAGE 2                       //
      //------------------------------------------------------------------------//
      getUserModuleTypes: function(links, appId, pin) {

        var token = appSettings.config.token;
        var userName = appSettings.config.userName;

        var RequestHeader = links.RequestHeader;
        var data = {
          "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
              "Token": token,
              "AppId": appId,
              "PIN": pin,
              "UserName": userName
            }
          }
        };
        this.lagger.info("post data :" + JSON.stringify(data));
        return $http({
          url: links.url,
          method: "POST",
          data: data,
          timeout: appSettings.timeout,
          headers: links.headers
        });
      },
      //--------------------------------------------------------------------------//
      //--                       GetUserFormGroups  PAGE3                       --//
      //--------------------------------------------------------------------------//
      GetUserFormGroups: function(links, appId, formType, pin) {

        var token = appSettings.config.token;
        var userName = appSettings.config.userName;


        var RequestHeader = links.RequestHeader;
        var data = {
          "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
              "Token": token,
              "AppId": appId,
              "PIN": pin,
              "UserName": userName,
              "FormType": formType
            }
          }
        };
        this.lagger.info("post data :" + JSON.stringify(data))
        return $http({
          url: links.url,
          method: "POST",
          data: data,
          timeout: appSettings.timeout,
          headers: links.headers
        });
      },
      //--------------------------------------------------------------
      //--      REQ P3
      //--------------------------------------------------------------
      GetUserRqGroups: function(links, appId, formType, pin) {


        var token = appSettings.config.token;
        var userName = appSettings.config.userName;

        var RequestHeader = links.RequestHeader;
        var data = {
          "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
              "Token": token,
              "AppId": appId,
              "PIN": pin,
              "UserName": userName,
              "FormType": formType
            }
          }
        };
        this.lagger.info("post data :" + JSON.stringify(data))
        return $http({
          url: links.url,
          method: "POST",
          data: data,
          timeout: appSettings.timeout,
          headers: links.headers
        });
      },
      //--------------------------------------------------------------------------//
      //--                       GetUserNotifications  PAGE4                    --//
      //--------------------------------------------------------------------------//
      GetUserNotifications: function(links, appId, docId, docInitId) {
        var token = appSettings.config.token;
        var userName = appSettings.config.userName;
        var RequestHeader = links.RequestHeader;
        var data = {
          "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
              "Token": token,
              "AppId": appId,
              "PIN": "0",
              "UserName": userName,
              "DocId": docId,
              "DocInitId": docInitId
            }
          }
        };
        this.lagger.info("post data :" + JSON.stringify(data))
        return $http({
          url: links.url,
          method: "POST",
          data: data,
          timeout: appSettings.timeout,
          headers: links.headers
        });

      },
      //--------------------------------------------------------------------------//
      //--                       SubmitNotification  PAGE4                      --//
      //--------------------------------------------------------------------------//
      SubmitNotification: function(links, appId, notificationId, note, actionType) {
        var token = appSettings.config.token;
        var userName = appSettings.config.userName;

        if (note != undefined && note != null) {
          note = note.replace(/[^\w\d\s\א-ת\(\)\@]/g, " ");
        }



        var RequestHeader = links.RequestHeader;

        var data = {
          "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
              "Token": token,
              "AppId": appId,
              "PIN": "0",
              "UserName": userName,
              "NotificationId": notificationId,
              "Note": note,
              "ActionType": actionType
            }
          }
        };
        this.lagger.info("post data :" + JSON.stringify(data))
        return $http({
          url: links.url,
          method: "POST",
          data: data,
          timeout: appSettings.timeout,
          headers: links.headers
        });
      },
      //--------------------------------------------------------------------------//
      //--                       GetFileURI  PAGE_PO4 ATTACHMENTS               --//
      //--------------------------------------------------------------------------//
      GetFileURI: function(links, appId, pin, fileOrFolder) {


        var token = appSettings.config.token;
        var userName = appSettings.config.userName;

        var RequestHeader = links.RequestHeader;
        var data = {
          "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
              "Token": token,
              "AppId": appId,
              "PIN": pin,
              "UserName": userName,
              "FileOrFolder": fileOrFolder
            }
          }
        };
        this.lagger.info("post data :" + JSON.stringify(data))
        return $http({
          url: links.url,
          method: "POST",
          data: data,
          timeout: appSettings.timeout,
          headers: links.headers
        });
      }, // End GetFileURI

      //--------------------------------------------------------------------------//
      //--                       GetUserPoOrdGroupGroup  PAGE_PO3                       --//
      //--------------------------------------------------------------------------//
      GetUserPoOrdGroupGroup: function(links, appId, formType, pin) {


        var token = appSettings.config.token;
        var userName = appSettings.config.userName;


        var RequestHeader = links.RequestHeader;
        var data = {
          "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
              "Token": token,
              "AppId": appId,
              "PIN": pin,
              "UserName": userName,
              "FormType": formType
            }
          }
        };
        this.lagger.info("post data :" + JSON.stringify(data))

        return $http({
          url: links.url,
          method: "POST",
          data: data,
          timeout: appSettings.timeout,
          headers: links.headers
        });

      },



      checkPinCode:function(data,interface) {
        var stat = {
          status: "",
          description: ""
        };

        //First check EAI ResponseHeader
        var eaiStatus = _.get(data,"Response.ResponseHeader.EAI_Status");
        var SessionStatus = _.get(data,"Response.OutParams.SessionStatus");

        if(eaiStatus && eaiStatus != "0") {
          return  {
                    status :"EAI_ERROR",
                    description: "EAI ResponseHeader return with error"
                  }
        }
        // Then we check EAI OutParams (Application error)
        var P_ERROR_CODE = _.get(data,"Response.OutParams.P_ERROR_CODE","").toString();
        var P_ERROR_DESC = _.get(data,"Response.OutParams.P_ERROR_DESC");

        if(P_ERROR_CODE && P_ERROR_CODE != "0") {
          return  {
                    status :"ERROR_CODE",
                    description: P_ERROR_DESC
                  }
        }
        // then check specical return data from getMenu API
        if ("getMenu" === interface) {
            stat.status = data.Status;
            if ("OLD" !== stat.status && "PAD" !== stat.status) {
              stat.status = "Valid";
            }
            return stat ;
        }

        // Then we check if session is Invalid for All other API-s
        //By default  if we reached here and SessionStatus is undefined - we assume it "Valid" --- aaahhhaaa

        stat.status = _.get(data,"Response.OutParams.SessionStatus","Valid");
        return stat;
      },
      checkApiResponse:function(data,interface) {
        var self = this ;
        var apiStat = self.checkPinCode(data,interface);
        var pinStatus = apiStat.status;

        if (pinStatus == "Valid") {
          self.lagger.info(JSON.stringify(data));
          var result = _.get(data, "Response.OutParams", []);
          return result ;
        } else if (pinStatus === "PDA") {
            $state.go("app.login");
        } else if ("InValid" === pinStatus && "EOL" === pinStatus) {
          appSettings.config.IS_TOKEN_VALID = "N";
          $state.go("app.error", {
            category: "invalid_token",
            description: "Invalid token , status :" + pinStatus
          })
        } else if ("EAI_ERROR" === pinStatus) {
          $state.go("app.error", {
            category: "eai_error",
            description: apiStat.description
          })
        } else if ("ERROR_CODE" === pinStatus) {
          $state.go("app.error", {
            category: "app_error",
            description: apiStat.description
          })
        }

        return this.checkPinCode(data,interface);
      },
      //-----------------------------------------------------------------------------//
      //--                      GetPinCodeStatus                                   --//
      //-----------------------------------------------------------------------------//
        GetPinCodeStatus2: function(data, interface) {
        var stat = {
          status: "",
          description: ""
        };
        //------------------------------------
        //-- Check EAI Status
        //------------------------------------
        if ("SubmitNotif" === interface) {
          var eaiStatus_SubmitNotif = undefined;
          var SessionStatus_SubmitNotif = undefined;
          var P_ERROR_CODE = undefined;
          var P_ERROR_DESC = undefined;

          //-- Get EAI_Status --//
          try {
            eaiStatus_SubmitNotif = data.Response.ResponseHeader.EAI_Status;
          } catch (e) {
            eaiStatus_SubmitNotif = undefined;
          }



          //-- Get SessionStatus -- //
          try {
            SessionStatus_SubmitNotif = data.Response.OutParams.SessionStatus
          } catch (e) {
            SessionStatus_SubmitNotif = undefined;
          }

          //-- Get P_ERROR_CODE & P_ERROR_DESC -- //
          try {
            P_ERROR_CODE_SubmitNotif = data.Response.OutParams.P_ERROR_CODE;
            P_ERROR_DESC_SubmitNotif = data.Response.OutParams.P_ERROR_DESC;
          } catch (e) {
            P_ERROR_CODE_SubmitNotif = undefined;
            P_ERROR_DESC_SubmitNotif = undefined;
          }

          if ("0" !== eaiStatus_SubmitNotif && eaiStatus_SubmitNotif !== undefined) {
            stat.status = "EAI_ERROR";
          } else if (0 !== P_ERROR_CODE_SubmitNotif && undefined !== P_ERROR_CODE_SubmitNotif) {
            stat.status = "ERROR_CODE";
            stat.description = P_ERROR_DESC_SubmitNotif;
          } else {
            stat.status = data.Response.OutParams.SessionStatus;
          }
        } else {
          var eaiStatus = data.Response.ResponseHeader.EAI_Status;
          if ("0" !== eaiStatus && undefined !== eaiStatus) {
            stat.status = "EAI_ERROR";
          } else {
            try {
              var SessionStatus = data.Response.OutParams.SessionStatus;

              if ("InValid" === SessionStatus && SessionStatus != undefined) {
                stat.status = "InValid";
                return stat;
              }
              var errorCode = data.Response.OutParams.P_ERROR_CODE;
              var errorDesc = data.Response.OutParams.P_ERROR_DESC;
              if (undefined !== errorCode) {
                errorCode = errorCode.toString();
              } else {
                errorCode = "0";
              }

              if ("0" !== errorCode) {
                stat.status = "ERROR_CODE";
                stat.description = errorDesc;
              } else {
                if ("getMenu" === interface) {
                  stat.status = data.Status;
                  if ("OLD" === status.status) {
                    return stat;
                  }
                  if ("PAD" !== stat) {
                    stat.status = "Valid";
                  }
                } else if ("getUserModuleTypes" === interface ||
                  "GetUserFormGroups" === interface ||
                  "GetUserPoOrdGroupGroup" === interface ||
                  "GetUserNotif" === interface ||
                  "GetUserNotifications" === interface
                  ||
                  "SubmitNotif" === interface ||
                  "IsSessionValidJson" === interface ||
                  "GetUserPoOrdGroupGroup" === interface ||
                  "GetUserNotifNew" === interface
                ) {
                  if (undefined !== data.Response.OutParams.SessionStatus) {
                    stat.status = data.Response.OutParams.SessionStatus;
                  } else {
                    stat.status = "Valid";
                  }
                }

              }
            } catch (e) {
              stat.status = "Valid";
            }
          }
        }
        return stat;
      },
      //-----------------------------------------------------------------------------//
      //--                      GetPinCodeStatus                                   --//
      //-----------------------------------------------------------------------------//
      GetPinCodeStatus: function(data, interface) {
        var status = "";
        try {
          if ("getMenu" === interface) {
            status = data.Status;
            if ("OLD" === status) {
              return status;
            }
            if ("PAD" !== status) {
              status = "Valid"
            }
          } else if ("getUserModuleTypes" === interface || "GetUserFormGroups" === interface) {
            status = data.Response.OutParams.SessionStatus;
          }
        } catch (e) {
          status = "Valid";
        }
        return status;
      },
      //--------------------------------------------------------------------------------//
      //--                       PincodeAction                                        --//
      //--------------------------------------------------------------------------------//
      PincodeAction: function(pinRetValue) {
        if ("EOL" === pinRetValue) {

        }
        if ("PAD" === pinRetValue) {

        }
        if ("PWA" === pinRetValue) {

        }
        if ("NRP" === pinRetValue) {

        }
        if ("PNE" === pinRetValue) {

        }
        if ("PCR" === pinRetValue) {
          appSettings.config.pinCodeErrorInd = "N";
          $state.go(auth.login);
        }
        if ("Invalid" === pinRetValue) {

        }
        if ("Valid" === pinRetValue) {

        }
      }, // PincodeAction
      //----------------------------------------------------------//
      //--                    GetServiceUrl                     --//
      //----------------------------------------------------------//
      getDocApproveServiceUrl: function(serviceName) {
        var serviceConf = appSettings.apiConfig.services[serviceName];
        if (!serviceConf || serviceConf == undefined) {
          this.lagger.error("No service conf found : " + serviceName);
          return serviceConf;
        }

        var headers = {
          "Content-Type": "application/json; charset=utf-8",
          "VERSION": appSettings.config.APP_VERSION
        };

        if ("wifi" === appSettings.config.network) {
          headers.msisdn = appSettings.config.MSISDN_VALUE;
          serviceConf.url = appSettings.apiConfig.wifi_uri + serviceConf.endpoint;
        } else {
          serviceConf.url = appSettings.apiConfig.uri + serviceConf.endpoint;
        }
        serviceConf.headers = headers;


        this.lagger.info("====== " + serviceName + " ======");
        this.lagger.info("URL :" + serviceConf.url);
        //this.writeToLog(appSettings.config.LOG_FILE_INFO_TYPE, "DATA : " + JSON.stringify(data));

        return serviceConf;
      },
      //===========================================================//
      //==               Update Version                          ==//
      //===========================================================//
      showPopupVersionUpdate: function(title, subTitle) {
        $rootScope.data = {}

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          title: title, //'WI-FI נא לסגור',
          subTitle: subTitle, //
          scope: $rootScope,
          buttons: [{
            text: '<a class="pele-popup-positive-text-collot">אישור</a>',
            type: 'button-positive',
            onTap: function(e) {
              var isIOS = ionic.Platform.isIOS();
              var isAndroid = ionic.Platform.isAndroid();
              if (isAndroid) {
                window.open(appSettings.config.GOOGLE_PLAY_APP_LINK, '_system', 'location=yes');
              } else if (isIOS) {
                window.open(appSettings.config.APPLE_STORE_APP_LING, '_system', 'location=yes');
              }
              return true;
            }
          }, ]
        });
        myPopup.then(function(res) {

        });

      },
      //----------------------------------------------------------//
      //                   WI_FI Pop Up
      //----------------------------------------------------------//
      showPopup: function(title, subTitle) {
        $rootScope.data = {}

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          title: title, //'WI-FI נא לסגור',
          subTitle: subTitle, //
          scope: $rootScope,
          buttons: [{
            text: '<a class="pele-popup-positive-text-collot">אישור</a>',
            type: 'button-positive',
            onTap: function(e) {
              return true;
            }
          }, ]
        });
        return myPopup ;

      },
      //===========================================================//
      //==                Pin Code PopUp                         ==//
      //===========================================================//
      showPinCode: function(appId, titleDisp, subTitleTxt) {
        $rootScope.data = {}

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          template: '<input type="tel" ng-model="data.pincode" maxlength="4">',
          title: 'הזינו קוד מחמיר',
          subTitle: subTitleTxt,
          scope: $rootScope,
          buttons: [{
              text: '<a class="pele-popup-positive-text-collot">אישור</a>',
              type: 'button-positive',
              onTap: function(e) {
                if (!$rootScope.data.pincode) {
                  //don't allow the user to close unless he enters wifi password
                  e.preventDefault();
                } else {
                  var pin = $rootScope.data.pincode;
                  $state.go("app.p2_moduleList", {
                    "AppId": appId,
                    "Title": titleDisp,
                    "Pin": pin
                  });
                  return $rootScope.data.pincode;
                }
              }
            },
            {
              text: '<a class="pele-popup-positive-text-collot">ביטול</a>',
              type: 'button-assertive'
            },
          ]
        });
        myPopup.then(function(res) {

        });
      },
      //====================================================//
      //==            Show Loading                        ==//
      //====================================================//
      showLoading: function() {
        $ionicLoading.show({

          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
        });
      },
      hideLoading: function() {
        $ionicLoading.hide();
      },
      //===========================================================================================//
      //== When         Who       Description
      //== -----------  --------  ----------------------------------------------------------------
      //== 06/01/2015   R.W.      function calculate list Action Buttons Display in Approve page
      //===========================================================================================//
      getButtons: function(buttonsArr) {

        var buttons = [];
        var arrLength = buttonsArr.length;
        for (var i = 0; i < arrLength; i++) {

          if ("OK" === buttonsArr[i].LOOKUP_CODE) {
            buttons.push(appSettings.OK);
          }
          if ("APPROVE" === buttonsArr[i].LOOKUP_CODE) {
            buttons.push(appSettings.APPROVE);
          }
          if ("APPROVE_AND_NOTE" === buttonsArr[i].LOOKUP_CODE) {
            buttons.push(appSettings.APPROVE_AND_NOTE);
          }
          if ("REJECT" === buttonsArr[i].LOOKUP_CODE) {
            buttons.push(appSettings.REJECT);
          }
        } // for
        return buttons;
      },

      logger: function() {
        //$fileLogger.setStorageFilename(appSettings.config.LOG_FILE_NAME);
        return $fileLogger;
      },

      goHome: function() {
        //window.location = "./../../index.html" ;
        $state.go("app.p1_appsLists");
      },
      goLogIn: function() {
        $state.go("app.login");
      },
      showIconCollapseInAcctionHistory: function(showFlag, hidenFlag) {
        var retVal = "";
        if (hidenFlag === true) {
          retVal = "";
        } else if (showFlag === true) {
          retVal = "icon-collapse";
        } else if (showFlag === false) {
          retVal = "icon-expand";
        }

        return retVal;

      },


      getfull_ATTACHMENT_DIRECTORY_NAME: function() {
        var retVal = "";
        var platformPath = "";

        if (!window.cordova) return false;

        if (ionic.Platform.isIOS()) {
          platformPath = cordova.file.dataDirectory;
        } else if (ionic.Platform.isAndroid()) {
          platformPath = cordova.file.externalApplicationStorageDirectory
        }

        retVal = platformPath + appSettings.config.ATTACHMENT_DIRECTORY_NAME;

        return retVal;
      },

      delete_ATTACHMENT_DIRECTORY_NAME: function() {
        var self = this;
        if (!window.cordova) return false;

        var platform = ionic.Platform.platform();
        var platformPath = "";
        if (ionic.Platform.isIOS()) {
          platformPath = cordova.file.dataDirectory;
        } else if (ionic.Platform.isAndroid()) {
          platformPath = cordova.file.externalApplicationStorageDirectory
        }
        self.lagger.info("platformPath: " + platformPath)
        $cordovaFile.checkDir(platformPath, appSettings.config.ATTACHMENT_DIRECTORY_NAME)
          .then(function(success) {
            // success
            var filePath = platformPath + appSettings.config.ATTACHMENT_DIRECTORY_NAME;

            $cordovaFile.removeRecursively(platformPath, appSettings.config.ATTACHMENT_DIRECTORY_NAME)
              .then(function(success) {
                // successdd
                console.log("$cordovaFile.removeRecursively SUCCESS 4: " + success);
                $cordovaFile.createDir(platformPath, appSettings.config.SETTINGS_DIRECTORY_NAME, false)
                  .then(function(success) {
                    // success
                    console.log("$cordovaFile.createDir SUCCESS 5: " + success);
                  }, function(error) {
                    // error
                    console.log("$cordovaFile.createDir ERROR : " + error);
                  });
              }, function(error) {
                // error
                console.log("$cordovaFile.removeRecursively ERROR : " + error);
              });
          }, function(error) {
            // error
            if (error.message === "NOT_FOUND_ERR") {
              $cordovaFile.createDir(platformPath, appSettings.config.ATTACHMENT_DIRECTORY_NAME, true)
                .then(function(success) {
                  // success
                  console.log("$cordovaFile.createDir SUCCESS 6: " + success);
                }, function(error) {
                  // error
                  console.log("$cordovaFile.createDir ERROR : " + error);
                });
            }
            console.log("ERROR : " + error);
          });

      },
      replaceSpecialChr: function(data) {
        if (data != undefined && data != null) {
          data = data.replace(/[^\w\d\s\א-ת\(\)\@]/g, " ");
          //data = data.replace(/[\\]/g, '\\\\');
          //data = data.replace(/[\/]/g, '\\/');
          //data = data;
        }
        return data;
      },
      checkResponceStatus: function(data) {

        var retVal = {};

        var EAI_Status = data.Response.ResponseHeader.EAI_Status;
        var Application_Status = data.Response.ResponseHeader.Application_Status;
        var StatusCode = data.Response.OutParams.Status.StatusCode;
        var SessionStatus = data.Response.OutParams.SessionStatus;

        retVal.Status = "S";

        if ("0" !== EAI_Status) {
          retVal.Status = "EAI_Status";
          return;
        }

        if ("S" !== Application_Status) {
          retVal.Status = "Application_Status";
          return retVal;
        }

        if ("0" !== StatusCode) {
          retVal.Status = "StatusCode";
          return retVal;
        }

        if ("Valid" !== SessionStatus) {
          retVal.Status = SessionStatus;
          return retVal;
        }

        retVal.URL = data.Response.OutParams.URI;
        return retVal;
      },
      getChevronIcon: function(flag) {
        var ret_val;
        if (flag) {
          ret_val = "ion-chevron-left";
        } else {
          ret_val = "ion-chevron-down";
        }
      },
      //------------------------------------------------------------//
      //--                  getAttachedDocuments
      //------------------------------------------------------------//
      getAttachedDocuments: function(arr) {
          var myArr = [];
          for (var i = 0; i < arr.length; i++) {

            if (arr[i].DISPLAY_FLAG_1 === "Y") {
              var file_name = "";

              file_name = arr[i].FILE_NAME_3;

              var mayObj = {
                "SEQ": i,
                "CATEGORY_TYPE": arr[i].CATEGORY_TYPE_4,
                "DOCUMENT_ID": arr[i].DOCUMENT_ID_2,
                "FILE_NAME": file_name,
                "FILE_MAOF_TYPE": arr[i].FILE_TYPE_6,
                "FILE_TYPE": arr[i].FILE_TYPE_9,
                "FULL_FILE_NAME": arr[i].FULL_FILE_NAME_8,
                "OPEN_FILE_NAME": "/My Files &amp; Folders/" + arr[i].OPEN_FOLDER_5 + '/' + arr[i].FULL_FILE_NAME_8,
                //"SHORT_TEXT"               : arr[i].SHORT_TEXT_7,
                //"LONG_TEXT"                : arr[i].LONG_TEXT_VALUE_11,
                "IS_FILE_OPENED_ON_MOBILE": arr[i].IS_FILE_OPENED_ON_MOBILE_10,
                "IOS_OPEN_FILE_NAME": "/My Files &amp; Folders/" + arr[i].OPEN_FOLDER_5 + '/' + arr[i].IOS_FILE_NAME_12
              }

              myArr.push(mayObj);

            } // if

          } // for

          return myArr;
        } //getAttachedDocuments

        ,
      getAttachedDocuments: function(arr) {
        var myArr = [];
        for (var i = 0; i < arr.length; i++) {

          if (arr[i].DISPLAY_FLAG_1 === "Y") {
            var file_name = "";

            file_name = arr[i].FILE_NAME_3;

            var mayObj = {
              "SEQ": i,
              "CATEGORY_TYPE": arr[i].CATEGORY_TYPE_4,
              "DOCUMENT_ID": arr[i].DOCUMENT_ID_2,
              "FILE_NAME": file_name,
              "FILE_MAOF_TYPE": arr[i].FILE_TYPE_6,
              "FILE_TYPE": arr[i].FILE_TYPE_9,
              "FULL_FILE_NAME": arr[i].FULL_FILE_NAME_8,
              "OPEN_FILE_NAME": "/My Files &amp; Folders/" + arr[i].OPEN_FOLDER_5 + '/' + arr[i].FULL_FILE_NAME_8,
              //"SHORT_TEXT"               : arr[i].SHORT_TEXT_7,
              //"LONG_TEXT"                : arr[i].LONG_TEXT_VALUE_11,
              "IS_FILE_OPENED_ON_MOBILE": arr[i].IS_FILE_OPENED_ON_MOBILE_10,
              "IOS_OPEN_FILE_NAME": "/My Files &amp; Folders/" + arr[i].OPEN_FOLDER_5 + '/' + arr[i].IOS_FILE_NAME_12
            }

            myArr.push(mayObj);

          } // if

        } // for

        return myArr;
      },
      //------------------------------------------------------------//
      //--                  getAttachedDocuments
      //------------------------------------------------------------//
      getAttachedDocuments: function(arr) {
        var myArr = [];
        for (var i = 0; i < arr.length; i++) {

          if (arr[i].DISPLAY_FLAG_1 === "Y") {
            var file_name = "";

            file_name = arr[i].FILE_NAME_3;

            var mayObj = {
              "SEQ": i,
              "CATEGORY_TYPE": arr[i].CATEGORY_TYPE_4,
              "DOCUMENT_ID": arr[i].DOCUMENT_ID_2,
              "FILE_NAME": file_name,
              "FILE_MAOF_TYPE": arr[i].FILE_TYPE_6,
              "FILE_TYPE": arr[i].FILE_TYPE_9,
              "FULL_FILE_NAME": arr[i].FULL_FILE_NAME_8,
              "OPEN_FILE_NAME": "/My Files &amp; Folders/" + arr[i].OPEN_FOLDER_5 + '/' + arr[i].FULL_FILE_NAME_8,
              //"SHORT_TEXT"               : arr[i].SHORT_TEXT_7,
              //"LONG_TEXT"                : arr[i].LONG_TEXT_VALUE_11,
              "IS_FILE_OPENED_ON_MOBILE": arr[i].IS_FILE_OPENED_ON_MOBILE_10,
              "IOS_OPEN_FILE_NAME": "/My Files &amp; Folders/" + arr[i].OPEN_FOLDER_5 + '/' + arr[i].IOS_FILE_NAME_12
            }

            myArr.push(mayObj);

          } // if

        } // for

        return myArr;
      }
    };
  })
  .filter('peldate', function() {
    return function(dateString ,opt1,opt2) {
      var date = moment(dateString, "YYYYMMDDHHmmss");
      return date.unix()*1000;
  }
});
