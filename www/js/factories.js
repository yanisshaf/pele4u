angular.module('pele.factories', ['ngStorage','LocalStorageModule'])
.factory('PelApi',function( $http
                          , $rootScope
                          , appSettings
                          , $state
                          , $ionicLoading
                          , $filter
                          , $ionicPopup
                          , $timeout
                          , $fileLogger
                          , $sessionStorage
                          , $localStorage
                          , $cordovaFile
                          ) {
  return {
    sendPincode: function (pincode) {
      return $http({
        url:appSettings.api ,
        method:"POST" ,
        data: {pincode:pincode},

        timeout:appSettings.timeout,
        headers: {'Content-Type': 'application/json; charset=utf-8' }
      });
    },
    login: function() {
      return $http({
        url:appSettings.api ,
        method:"POST" ,
        data: {},
        timeout:appSettings.timeout,
        headers: {'Content-Type': 'application/json; charset=utf-8' }
      });
    },
    getAppId : function(){

      var menuList = config_app.GetUserMenu;

      var pinCodeReq = "N";
      var appId = "";

      if(menuList.menuItems !== undefined){
        var appList = menuList.menuItems;
        var length = appList.length;

        for(var i = 0; i < length ; i++ ){
          var pin = appList[i].Pin
          if(pin !== false){
            pinCodeReq = "Y";
            appId = appList[i].AppId;
            i = length;
          }
        }
        try{
        if(appId === ""){
          appId = appList[0].AppId;
        }
        }catch(e){
          appId = config_app.appId;
        }
      }
      return appId;
    },
    GetMsisdn:function(){
      /*
      var msisdn = window.localStorage.get("msisdn")
      return msisdn;
      */
      return "";
    },// GetMsisdn
    //----------------------------------------------------------------------------//
    //--                        sendScanPrint
    //----------------------------------------------------------------------------//
    sendScanPrint:function(links){
      var headers = {"Accept":"application/json, text/plain, */*"};
      var version = config_app.APP_VERSION;
      //{"Content-Type": "application/json; charset=utf-8"};
      var envUrl = links + "&UserName=" + config_app.userName + "&ID=" + config_app.user;

      if("wifi" === config_app.network){
        headers = {"Content-Type": "application/json; charset=utf-8","VERSION":version , "msisdn":config_app.MSISDN_VALUE}
      }else{
        headers = {"Content-Type": "application/json; charset=utf-8","VERSION":version};
      }

      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , " URL : " + envUrl );
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , " headers : " + headers );

      console.log("=========================== PRINT URL =============================")
      console.log(envUrl);
      console.log("===================================================================")
      return   $http({
        url:envUrl,
        method: "GET",
        timeout :appSettings.menuTimeout,
        headers:headers
      });
    },
    //--------------------------------------------------------------------------//
    //--                       IsSessionValidJson                             --//
    //--------------------------------------------------------------------------//
    IsSessionValidJson:function(links , appId , pin){
      var envUrl = links.URL;
      var headers = "";
      var version = config_app.APP_VERSION
      var parameters = "/" + config_app.token + "/" + appId + "/" + pin;
      if("wifi" === config_app.network){
        envUrl = links.URL_WIFI + parameters;
        headers = {"Content-Type": "application/json; charset=utf-8","VERSION":version , "msisdn":config_app.MSISDN_VALUE}
      }else{
        envUrl = links.URL + parameters;
        headers = {"Content-Type": "application/json; charset=utf-8","VERSION":version};
      }

      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "======== factories.IsSessionValidJson() ===========");
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , envUrl);

      return   $http({
        url:envUrl,
        method: "GET",
        timeout :appSettings.menuTimeout,
        headers:headers
      });
    },
    //--------------------------------------------------------------------//
    //                    GetUserMenu PAGE 1                              //
    //--------------------------------------------------------------------//
    getMenu: function (links) {
      // LOADING
      var envUrl = "";
      var headers = {};
      var version = config_app.APP_VERSION;

      if("wifi" === config_app.network){
        envUrl = links.URL_WIFI;
        headers = {"Content-Type": "application/json; charset=utf-8","VERSION":version, "msisdn":config_app.MSISDN_VALUE}
      }else{
        envUrl = links.URL;
        headers = {"Content-Type": "application/json; charset=utf-8","VERSION":version};
        //headers = {"Content-Type": "application/json; charset=utf-8"};
      }

      this.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"====== getMenu ======");
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "URL :" + JSON.stringify(envUrl));
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "VERSION :" + version);

      return $http({
        url:envUrl,
        method: "GET",
        timeout :appSettings.menuTimeout,
        headers:headers
      });

    },
    //------------------------------------------------------------------------//
    //                        getUserModuleTypes PAGE 2                       //
    //------------------------------------------------------------------------//
    getUserModuleTypes: function (links,appId,pin) {

      var token = config_app.token;
      console.log("P2 : " + config_app.token);
      var userName = config_app.userName;

      var envUrl = links.URL;
      var headers = {};

      if("wifi" === config_app.network){
        envUrl  = links.URL_WIFI;
        headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json","msisdn":config_app.MSISDN_VALUE};
      }else{
        envUrl = links.URL;
        headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json"};
      }

      var RequestHeader = links.RequestHeader;
      var data = { "Request": {
        "RequestHeader": RequestHeader,
        "InParams": {
          "Token": token,
          "AppId": appId,
          "PIN": pin,
          "UserName": userName
        }
      }
      };

      this.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"====== getUserModuleTypes ======");
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "URL :" + JSON.stringify(envUrl));
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "DATA : " + JSON.stringify(data));

      return $http({
        url:envUrl ,
        method:"POST" ,
        data: data,
        timeout:appSettings.timeout,
        headers: headers
      });
    },
    //--------------------------------------------------------------------------//
    //--                       GetUserFormGroups  PAGE3                       --//
    //--------------------------------------------------------------------------//
    GetUserFormGroups:function (links , appId , formType, pin) {


        var token = config_app.token;
        var userName = config_app.userName;

        var envUrl = links.URL;
        var headers = {};

        if("wifi" === config_app.network){
          envUrl  = links.URL_WIFI;
          headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json","msisdn":config_app.MSISDN_VALUE};
        }else{
          envUrl = links.URL;
          headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json"};
        }

        var RequestHeader = links.RequestHeader;
        var data = { "Request": {
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

        this.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"====== GetUserFormGroups ======");
        this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "URL :" + JSON.stringify(envUrl));
        this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "DATA : " + JSON.stringify(data));
        return $http({
          url:envUrl ,
          method:"POST" ,
          data: data,
          timeout:appSettings.timeout,
          headers: headers
        });
    },
    //--------------------------------------------------------------
    //--      REQ P3
    //--------------------------------------------------------------
    GetUserRqGroups:function (links , appId , formType, pin) {


      var token = config_app.token;
      var userName = config_app.userName;

      var envUrl = links.URL;
      var headers = {};

      if("wifi" === config_app.network){
        envUrl  = links.URL_WIFI;
        headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json","msisdn":config_app.MSISDN_VALUE};
      }else{
        envUrl = links.URL;
        headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json"};
      }

      var RequestHeader = links.RequestHeader;
      var data = { "Request": {
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

      this.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"====== GetUserFormGroups ======");
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "URL :" + JSON.stringify(envUrl));
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "DATA : " + JSON.stringify(data));
      return $http({
        url:envUrl ,
        method:"POST" ,
        data: data,
        timeout:appSettings.timeout,
        headers: headers
      });
    },
    //--------------------------------------------------------------------------//
    //--                       GetUserNotifications  PAGE4                    --//
    //--------------------------------------------------------------------------//
    GetUserNotifications:function(links , appId , docId , docInitId){
        var token = config_app.token;
        var userName = config_app.userName;

        var envUrl = links.URL;
        var headers = {};

        if("wifi" === config_app.network){
          envUrl  = links.URL_WIFI;
          headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json","msisdn":config_app.MSISDN_VALUE};
        }else{
          envUrl = links.URL;
          headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json"};
        }

        var RequestHeader = links.RequestHeader;
        var data = { "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
                "Token": token,
                "AppId": appId,
                "PIN": "0",
                "UserName": userName,
                "DocId":docId,
                "DocInitId":docInitId
            }
        }
        };

        this.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"====== GetUserNotifications ======");
        this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "URL :" + JSON.stringify(envUrl));
        this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "DATA : " + JSON.stringify(data));

        return $http({
          url:envUrl,
          method:"POST",
          data: data,
          timeout:appSettings.timeout,
          headers: headers
        });

    },
    //--------------------------------------------------------------------------//
    //--                       SubmitNotification  PAGE4                      --//
    //--------------------------------------------------------------------------//
    SubmitNotification:function(links , appId , notificationId , note , actionType){
        var token = config_app.token;
        var userName = config_app.userName;

        if(note!= undefined && note != null){
          note = note.replace(/[^\w\d\s\א-ת\(\)\@]/g, " ");
        }

        var envUrl = links.URL;
        var headers = {};

        if("wifi" === config_app.network){
          envUrl  = links.URL_WIFI;
          headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json","msisdn":config_app.MSISDN_VALUE};
        }else{
          envUrl = links.URL;
          headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json"};
        }

        var RequestHeader = links.RequestHeader;

        var data = { "Request": {
            "RequestHeader": RequestHeader,
            "InParams": {
                "Token": token,
                "AppId": appId,
                "PIN": "0",
                "UserName": userName,
                "NotificationId":notificationId,
                "Note":note,
                "ActionType":actionType
            }
        }
        };
        this.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"====== SubmitNotification ======");
        this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "URL :" + JSON.stringify(envUrl));
        this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "DATA : " + JSON.stringify(data));
        return $http({
            url:envUrl,
            method:"POST",
            data: data,
            timeout:appSettings.timeout,
            headers: headers
        });
    },
    //--------------------------------------------------------------------------//
    //--                       GetFileURI  PAGE_PO4 ATTACHMENTS               --//
    //--------------------------------------------------------------------------//
    GetFileURI:function (links , appId , pin , fileOrFolder) {


      var token = config_app.token;
      var userName = config_app.userName;
      var envUrl = links.URL;

      if("wifi" === config_app.network){
        envUrl  = links.URL_WIFI;
        headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json","msisdn":config_app.MSISDN_VALUE};
      }else{
        envUrl = links.URL;
        headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json"};
      }

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

      this.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"====== GetFileURI ======");
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "URL :" + JSON.stringify(envUrl));
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "DATA : " + JSON.stringify(data));
      console.log("====== GetFileURI ======");
      console.log( JSON.stringify(data));

      return $http({
        url:envUrl ,
        method:"POST" ,
        data: data,
        timeout:appSettings.timeout,
        headers: headers
      });
    },// End GetFileURI

    //--------------------------------------------------------------------------//
    //--                       GetUserPoOrdGroupGroup  PAGE_PO3                       --//
    //--------------------------------------------------------------------------//
    GetUserPoOrdGroupGroup:function (links , appId , formType, pin) {


      var token = config_app.token;
      var userName = config_app.userName;

      var envUrl = links.URL;
      var headers = {};

      if("wifi" === config_app.network){
        envUrl  = links.URL_WIFI;
        headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json","msisdn":config_app.MSISDN_VALUE};
      }else{
        envUrl = links.URL;
        headers = {"Content-Type": "application/json; charset=utf-8","Accept":"application/json"};
      }

      var RequestHeader = links.RequestHeader;
      var data = { "Request": {
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

      this.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"====== GetUserFormGroups ======");
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "URL :" + JSON.stringify(envUrl));
      this.writeToLog(config_app.LOG_FILE_INFO_TYPE , "DATA : " + JSON.stringify(data));

      return $http({
        url:envUrl ,
        method:"POST" ,
        data: data,
        timeout:appSettings.timeout,
        headers: headers
      });

    },
    //-----------------------------------------------------------------------------//
    //--                      GetPinCodeStatus                                   --//
    //-----------------------------------------------------------------------------//
    GetPinCodeStatus2:function(data,interface){
      var stat = {status:"",description:""};
      //------------------------------------
      //-- Check EAI Status
      //------------------------------------
      if("SubmitNotif" === interface){
        var eaiStatus_SubmitNotif = undefined;
        var SessionStatus_SubmitNotif = undefined;
        var P_ERROR_CODE = undefined;
        var P_ERROR_DESC = undefined;

        //-- Get EAI_Status --//
        try{
          eaiStatus_SubmitNotif = data.Response.ResponseHeader.EAI_Status;
        }catch(e){
          eaiStatus_SubmitNotif = undefined;
        }

        //-- Get SessionStatus -- //
        try{
          SessionStatus_SubmitNotif = data.Response.OutParams.SessionStatus
        }catch(e){
          SessionStatus_SubmitNotif = undefined;
        }

        //-- Get P_ERROR_CODE & P_ERROR_DESC -- //
        try{
          P_ERROR_CODE_SubmitNotif = data.Response.OutParams.P_ERROR_CODE;
          P_ERROR_DESC_SubmitNotif = data.Response.OutParams.P_ERROR_DESC;
        }catch(e){
          P_ERROR_CODE_SubmitNotif = undefined;
          P_ERROR_DESC_SubmitNotif = undefined;
        }

        if("0" !== eaiStatus_SubmitNotif && eaiStatus_SubmitNotif !== undefined){
          stat.status = "EAI_ERROR";
        }else if(0!==P_ERROR_CODE_SubmitNotif && undefined !== P_ERROR_CODE_SubmitNotif){
          stat.status = "ERROR_CODE";
          stat.description = P_ERROR_DESC_SubmitNotif;
        }else {
          stat.status = data.Response.OutParams.SessionStatus;
        }
      }else{
        var eaiStatus = data.Response.ResponseHeader.EAI_Status;
        if("0"!== eaiStatus && undefined !== eaiStatus){
          stat.status = "EAI_ERROR";
        }else{
          try{
            var SessionStatus = data.Response.OutParams.SessionStatus;

            if("InValid" === SessionStatus && SessionStatus != undefined){
              stat.status = "InValid";
              return stat;
            }
            var errorCode = data.Response.OutParams.P_ERROR_CODE;
            var errorDesc = data.Response.OutParams.P_ERROR_DESC;
            if(undefined !== errorCode){
              errorCode = errorCode.toString();
            }else{
              errorCode = "0";
            }

            if("0"!==errorCode ){
               stat.status = "ERROR_CODE";
               stat.description = errorDesc;
            }else{
              if("getMenu" === interface){
                stat.status = data.Status;
                if("OLD" === status.status){
                  return stat;
                }
                if("PAD" !== stat ){
                  stat.status = "Valid";
                }
              }else if("getUserModuleTypes" === interface
                || "GetUserFormGroups" === interface
                || "GetUserPoOrdGroupGroup" === interface
                || "GetUserNotif" === interface
                || "GetUserNotifications" === interface

                || "SubmitNotif" === interface
                || "IsSessionValidJson" === interface
                || "GetUserPoOrdGroupGroup" === interface
                || "GetUserNotifNew" === interface
              ){
                if(undefined !== data.Response.OutParams.SessionStatus){
                  stat.status = data.Response.OutParams.SessionStatus;
                }else{
                  stat.status = "Valid";
                }
              }

            }
          }catch(e){
            stat.status = "Valid";
          }
        }
      }
      return stat;
    },
    //-----------------------------------------------------------------------------//
    //--                      GetPinCodeStatus                                   --//
    //-----------------------------------------------------------------------------//
    GetPinCodeStatus:function(data,interface){
        var status = "";
        try{
          if("getMenu" === interface){
              status = data.Status;
              if("OLD" === status){
                return status;
              }
              if("PAD" !== status ){
                  status = "Valid"
              }
          }else if("getUserModuleTypes" === interface || "GetUserFormGroups" === interface){
          status = data.Response.OutParams.SessionStatus;
          }
        }catch(e){
          status = "Valid";
        }
        return status;
    },
    //--------------------------------------------------------------------------------//
    //--                       PincodeAction                                        --//
    //--------------------------------------------------------------------------------//
    PincodeAction:function(pinRetValue){
        if("EOL" === pinRetValue){

        }
        if("PAD" === pinRetValue){

        }
        if("PWA" === pinRetValue){

        }
        if("NRP" === pinRetValue){

        }
        if("PNE" === pinRetValue){

        }
        if("PCR" === pinRetValue)
        {
            config_app.pinCodeErrorInd = "N";
            $state.go(auth.login);
        }
        if("Invalid" === pinRetValue){

        }
        if("Valid" === pinRetValue){

        }
    },// PincodeAction
    //----------------------------------------------------------//
    //--                    GetServiceUrl                     --//
    //----------------------------------------------------------//
    getDocApproveServiceUrl:function(service){
      var env = appSettings.enviroment;
      var links = appSettings.enviromentLinks;
      var ServiceList = $filter('filter')(links, {Environment: env})[0].ServiceList;
      var Service = $filter('filter')(ServiceList, {Service: service})[0];
      return Service
    },
    //===========================================================//
    //==               Update Version                          ==//
    //===========================================================//
    showPopupVersionUpdate:function(title , subTitle){
      $rootScope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        title: title, //'WI-FI נא לסגור',
        subTitle: subTitle,//
        scope: $rootScope,
        buttons: [
          {
            text: '<a class="pele-popup-positive-text-collot">אישור</a>',
            type: 'button-positive',
            onTap: function(e) {
              var isIOS = ionic.Platform.isIOS();
              var isAndroid = ionic.Platform.isAndroid();
              if(isAndroid){
                window.open(config_app.GOOGLE_PLAY_APP_LINK, '_system', 'location=yes');
              }else if(isIOS){
                window.open(config_app.APPLE_STORE_APP_LING, '_system', 'location=yes');
              }
              return true;
            }
          },
        ]
      });
      myPopup.then(function(res) {

      });

    },
    //----------------------------------------------------------//
    //                   WI_FI Pop Up
    //----------------------------------------------------------//
    showPopup:function(title , subTitle){
      $rootScope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        title: title, //'WI-FI נא לסגור',
        subTitle: subTitle,//
        scope: $rootScope,
        buttons: [
          {
            text: '<a class="pele-popup-positive-text-collot">אישור</a>',
            type: 'button-positive',
            onTap: function(e) {
              return true;
            }
          },
        ]
      });
      myPopup.then(function(res) {

      });

    },
    //===========================================================//
    //==                Pin Code PopUp                         ==//
    //===========================================================//
    showPinCode:function(appId , titleDisp , subTitleTxt) {
      $rootScope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<input type="tel" ng-model="data.pincode" maxlength="4">',
        title: 'הזינו קוד מחמיר',
        subTitle: subTitleTxt,
        scope: $rootScope,
        buttons: [
          {
            text: '<a class="pele-popup-positive-text-collot">אישור</a>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$rootScope.data.pincode) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                var pin = $rootScope.data.pincode;
                $state.go("app.p2_moduleList",{"AppId" : appId , "Title":titleDisp ,"Pin":pin});
                return $rootScope.data.pincode;
              }
            }
          },
          { text: '<a class="pele-popup-positive-text-collot">ביטול</a>',
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
    showLoading:function(){
      $ionicLoading.show({

        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    },
    hideLoading:function(){
      $ionicLoading.hide();
    },
    //===========================================================================================//
    //== When         Who       Description
    //== -----------  --------  ----------------------------------------------------------------
    //== 06/01/2015   R.W.      function calculate list Action Buttons Display in Approve page
    //===========================================================================================//
    getButtons : function(buttonsArr){

      var buttons = [];
      var arrLength = buttonsArr.length;
      for(var i=0;i<arrLength;i++){

        if("OK" === buttonsArr[i].LOOKUP_CODE){
          buttons.push(appSettings.OK);
        }
        if("APPROVE" === buttonsArr[i].LOOKUP_CODE){
          buttons.push(appSettings.APPROVE);
        }
        if("APPROVE_AND_NOTE" === buttonsArr[i].LOOKUP_CODE){
          buttons.push(appSettings.APPROVE_AND_NOTE);
        }
        if("REJECT" === buttonsArr[i].LOOKUP_CODE){
          buttons.push(appSettings.REJECT);
        }
      } // for
      return buttons;
    },
    writeToLog : function( textType , text ){
      console.log(textType + ' : ' + text);
      $fileLogger.setStorageFilename(config_app.LOG_FILE_NAME);

      if("I" === textType && text !==undefined){
        console.log('== I ==');
        $fileLogger.info(text);
      }
      else if("D" === textType && text !==undefined){
        console.log('== D ==');
        $fileLogger.debug(text)
      }
      else if("W" === textType && text !==undefined){
        console.log('== W ==');
        $fileLogger.warn(text);
      }
      else if("E" === textType && text !==undefined){
        console.log('== E ==');
        $fileLogger.error(text);
      }

    },// writeToLog
    goHome:function(){
      //window.location = "./../../index.html" ;
      $state.go("app.p1_appsLists");
    },
    goLogIn:function(){
      $state.go("app.login");
    },
    showIconCollapseInAcctionHistory : function(showFlag , hidenFlag){
      var retVal = "";
      if(hidenFlag === true){
        retVal = "";
      }else if(showFlag === true){
        retVal = "icon-collapse";
      }else if(showFlag === false){
        retVal = "icon-expand";
      }

      return retVal;

    },
    get_SETTINGS_DIRECTORY_NAME : function() {
      var retVal = "";
      var platformPath = "";
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();
      var platform = ionic.Platform.platform();
      if ("win32" !== platform) {

        if(isIOS){
          platformPath = cordova.file.dataDirectory;
        }else if(isAndroid){
          platformPath = cordova.file.externalApplicationStorageDirectory
        }
        retVal = platformPath;
      }
      return retVal;
    },
    getfull_SETTINGS_DIRECTORY_NAME : function() {
      var retVal = "";
      var platformPath = "";
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();
      var platform = ionic.Platform.platform();
      if ("win32" !== platform) {

        if(isIOS){
          platformPath = cordova.file.dataDirectory;
        }else if(isAndroid){
          platformPath = cordova.file.externalApplicationStorageDirectory
        }
        retVal = platformPath + config_app.SETTINGS_DIRECTORY_NAME;
      }
      return retVal;
    },
    getfull_ATTACHMENT_DIRECTORY_NAME : function() {
      var retVal = "";
      var platformPath = "";
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();
      var platform = ionic.Platform.platform();
      if ("win32" !== platform) {

        if(isIOS){
          platformPath = cordova.file.dataDirectory;
        }else if(isAndroid){
          platformPath = cordova.file.externalApplicationStorageDirectory
        }

        retVal = platformPath + config_app.ATTACHMENT_DIRECTORY_NAME;
      }
      return retVal;
    },

    setPELE4_ATTACHMENT_DIRECTORY : function(){
      var platform = ionic.Platform.platform();
      var platformPath = "";
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();

      if ("win32" !== platform) {

        if(isIOS){
          platformPath = cordova.file.dataDirectory;
        }else if(isAndroid){
          platformPath = cordova.file.externalApplicationStorageDirectory
        }

        //------------------------------- Set ATTACHMENT_DIRECTORY_NAME ---------------------//
        $cordovaFile.checkDir(platformPath, config_app.ATTACHMENT_DIRECTORY_NAME)
          .then(function (success) {
            // success
            console.log("SUCCESS 1 : " + success);
          }, function (error) {
            // error

            if (error.message === "NOT_FOUND_ERR") {
              $cordovaFile.createDir(platformPath, config_app.ATTACHMENT_DIRECTORY_NAME, true)
                .then(function (success) {
                  // success
                  console.log("$cordovaFile.createDir SUCCESS : " + success);
                }, function (error) {
                  // error
                  console.log("$cordovaFile.createDir ERROR : " + error);
                });
            }
            console.log("ERROR : " + error);
          });
      }
    },
    setPELE4_SETTINGS_DIRECTORY : function(){
      //------------------------------- Set SETTINGS_DIRECTORY ---------------------//
      var platform = ionic.Platform.platform();
      var platformPath = "";
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();

      if ("win32" !== platform) {
        if(isIOS){
          platformPath = cordova.file.dataDirectory;
        }else if(isAndroid){
          platformPath = cordova.file.externalApplicationStorageDirectory
        }

        $cordovaFile.checkDir(platformPath , config_app.SETTINGS_DIRECTORY_NAME)
          .then(function (success) {
            // success
            console.log("SUCCESS 2 : " + success);
          }, function (error) {
            // error
            if (error.message === "NOT_FOUND_ERR") {
              $cordovaFile.createDir(platformPath , config_app.SETTINGS_DIRECTORY_NAME, false)
                .then(function (success) {
                  // success
                  console.log("$cordovaFile.createDir SUCCESS 3: " + success);
                }, function (error) {
                  // error
                  console.log("$cordovaFile.createDir ERROR : " + error);
                });
            }
            console.log("ERROR : " + error);
          });
      }
    },
    delete_ATTACHMENT_DIRECTORY_NAME : function(){
      var platform = ionic.Platform.platform();
      var platformPath = "";
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();

      if ("win32" !== platform) {

        if(isIOS){
          platformPath = cordova.file.dataDirectory;
        }else if(isAndroid){
          platformPath = cordova.file.externalApplicationStorageDirectory
        }

        $cordovaFile.checkDir(platformPath , config_app.ATTACHMENT_DIRECTORY_NAME)
          .then(function (success) {
            // success
            var filePath = platformPath + config_app.ATTACHMENT_DIRECTORY_NAME;

            $cordovaFile.removeRecursively(platformPath , config_app.ATTACHMENT_DIRECTORY_NAME )
              .then(function (success) {
                // success
                console.log("$cordovaFile.removeRecursively SUCCESS 4: " + success);
                $cordovaFile.createDir(platformPath , config_app.SETTINGS_DIRECTORY_NAME, false)
                  .then(function (success) {
                    // success
                    console.log("$cordovaFile.createDir SUCCESS 5: " + success);
                  }, function (error) {
                    // error
                    console.log("$cordovaFile.createDir ERROR : " + error);
                  });
              }, function (error) {
                // error
                console.log("$cordovaFile.removeRecursively ERROR : " + error);
              });


          }, function (error) {
            // error
            if (error.message === "NOT_FOUND_ERR") {
              $cordovaFile.createDir(platformPath , config_app.ATTACHMENT_DIRECTORY_NAME, true)
                .then(function (success) {
                  // success
                  console.log("$cordovaFile.createDir SUCCESS 6: " + success);
                }, function (error) {
                  // error
                  console.log("$cordovaFile.createDir ERROR : " + error);
                });
            }
            console.log("ERROR : " + error);
          });
      }
    },
    replaceSpecialChr : function(data){
      if(data!= undefined && data != null){
        data = data.replace(/[^\w\d\s\א-ת\(\)\@]/g, " ");
        //data = data.replace(/[\\]/g, '\\\\');
        //data = data.replace(/[\/]/g, '\\/');
        //data = data;
      }
      return data;
    },
    checkResponceStatus : function(data){

      var retVal = {};

      var EAI_Status         = data.Response.ResponseHeader.EAI_Status;
      var Application_Status = data.Response.ResponseHeader.Application_Status;
      var StatusCode         = data.Response.OutParams.Status.StatusCode;
      var SessionStatus      = data.Response.OutParams.SessionStatus;

      retVal.Status = "S";

      if("0" !== EAI_Status){
        retVal.Status ="EAI_Status";
        return;
      }

      if("S" !== Application_Status){
        retVal.Status ="Application_Status";
        return retVal;
      }

      if("0" !== StatusCode){
        retVal.Status ="StatusCode";
        return retVal;
      }

      if("Valid" !== SessionStatus){
        retVal.Status = SessionStatus;
        return retVal;
      }

      retVal.URL    =  data.Response.OutParams.URI;
      return retVal;
    },
    getChevronIcon : function(flag){
      var ret_val;
      if(flag){
        ret_val = "ion-chevron-left";
      }else{
        ret_val = "ion-chevron-down";
      }
    },
    //------------------------------------------------------------//
    //--                  getAttachedDocuments
    //------------------------------------------------------------//
    getAttachedDocuments : function(arr){
    var myArr = [];
    for(var i = 0 ; i < arr.length ; i++ ){

      if( arr[i].DISPLAY_FLAG_1 === "Y") {
        var file_name = "";

        file_name = arr[i].FILE_NAME_3;

        var mayObj = {
          "SEQ"                      : i,
          "CATEGORY_TYPE"            : arr[i].CATEGORY_TYPE_4,
          "DOCUMENT_ID"              : arr[i].DOCUMENT_ID_2,
          "FILE_NAME"                : file_name,
          "FILE_MAOF_TYPE"           : arr[i].FILE_TYPE_6,
          "FILE_TYPE"                : arr[i].FILE_TYPE_9,
          "FULL_FILE_NAME"           : arr[i].FULL_FILE_NAME_8,
          "OPEN_FILE_NAME"           : "/My Files &amp; Folders/" + arr[i].OPEN_FOLDER_5 + '/' +  arr[i].FULL_FILE_NAME_8,
          //"SHORT_TEXT"               : arr[i].SHORT_TEXT_7,
          //"LONG_TEXT"                : arr[i].LONG_TEXT_VALUE_11,
          "IS_FILE_OPENED_ON_MOBILE" : arr[i].IS_FILE_OPENED_ON_MOBILE_10,
          "IOS_OPEN_FILE_NAME"       : "/My Files &amp; Folders/" + arr[i].OPEN_FOLDER_5 + '/' + arr[i].IOS_FILE_NAME_12
        }

        myArr.push(mayObj);

      } // if

    }// for

    return myArr;
  }//getAttachedDocuments


  };
})
;
