/**
 * Created by User on 25/08/2016.
 */
angular.module('pele.P2_moduleListCtrl', ['ngStorage'])
//=================================================================
//==                    PAGE_2
//=================================================================
  .controller('P2_moduleListCtrl', function($scope,
                                            $http,
                                            $stateParams ,
                                            $state ,
                                            PelApi,
                                            $cordovaNetwork,
                                            $ionicLoading,
                                            $ionicModal ,
                                            $timeout ,
                                            $sessionStorage,
                                            appSettings,
                                            srvShareData
  ) {
    //----------------------- LOGIN --------------------------//

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/apps/docApprove/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    //-----------------------------------------------
    //--    Is show BTN
    //-----------------------------------------------
    $scope.isShowBtn = function(qty){
      var retVal = true;
      if(qty === "-1"){
        return "ng-hide";
      }
      else{
        return "ng-show";
      }

      return retVal;

    }
    $scope.pushBtnClass = function(event){

      console.log("pushBtnClass : " + event);

      if(event === true){
        return "pele-item-on-release";
      }else{
        return "pele-item-on-touch";
      }
    }// pushBtnClass
    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    //---------------------------------
    //--       goHome
    //---------------------------------
    $scope.goHome = function(){
      PelApi.goHome();
    }

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {

      var appId = config_app.appId;
      var pin = $scope.loginData.pin;
      var titleDisp = $sessionStorage.title;
      $state.go("app.p2_moduleList",{AppId : appId , title:titleDisp ,"pin":pin});
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
    //======= onClick ========//
    $scope.onClick = function (formType, docQty) {
      if(0 < docQty){

        var path = "";
        if( "HR" === formType ){
          path = appSettings.MODULE_TYPES_FORWARD_PATH.HR;
        }else if( "POAPPRV" === formType){
          path = appSettings.MODULE_TYPES_FORWARD_PATH.POAPPRV;
        }else if( "PELRQAPR" === formType) {
          path = appSettings.MODULE_TYPES_FORWARD_PATH.PELRQAPR;
        }

        appId = config_app.appId;
        $state.go(path , {AppId: appId, FormType: formType, Pin: config_app.Pin});
      }
    };

    //===========================================================//
    //== When        Who      Description                      ==//
    //== ----------  -------  ---------------------------------==//
    //== 23/02/2016  R.W.                                      ==//
    //===========================================================//
    $scope.ontouch = function(pushFlag){
      pushFlag = !pushFlag;
    };

    //===========================================================//
    //== When        Who      Description                      ==//
    //== ----------  -------  ---------------------------------==//
    //== 23/02/2016  R.W.                                      ==//
    //===========================================================//
    $scope.insertOnTouchFlag = function(arr){
      var myArr = [];
      for(var i=0; i< arr.length; i++){

        var myObj = {
          DOCUMENT_QTY: arr[i].DOCUMENT_QTY,
          MODULE_DESC: arr[i].MODULE_DESC,
          MODULE_NAME: arr[i].MODULE_NAME,
          PUSH_FLAG:true
        };

        myArr.push(myObj);

      }// for;
      return myArr;
    }// insertOnTouchFlag

    //===================== Refresh ===========================//
    $scope.doRefresh = function(){
      //--

      console.log("------------------------------------");
      console.log(      srvShareData.getData()          );
      console.log("------------------------------------");
      $scope.menuPageData = srvShareData.getData();
      $scope.btn_class = {};
      $scope.btn_class.on_release = true;

      PelApi.showLoading();

      var appId     = $stateParams.AppId;
      var pin       = $stateParams.Pin;
      var titleDisp = $stateParams.Title;

      $sessionStorage.DOC_ID = "";

      console.log("appId : " + appId);

      // var appId = config_app.appId;

      config_app.token        = $sessionStorage.token;
      config_app.userName     = $sessionStorage.userName;
      if(config_app.network === "" || config_app.network === undefined){
        config_app.network = $scope.menuPageData[0].PeleNetwork;
      }
      if(config_app.MSISDN_VALUE === "" || config_app.MSISDN_VALUE === undefined){
        config_app.MSISDN_VALUE = $scope.menuPageData[0].PeleMsisdnValue;
      }

      var links = PelApi.getDocApproveServiceUrl("GetUserModuleTypes");

      var retUserModuleTypes = PelApi.getUserModuleTypes(links, appId, pin);

      retUserModuleTypes.then(
        //--- SUCCESS ---//
        function () {
          retUserModuleTypes.success(function (data, status, headers, config) {

            $scope.feeds_categories = [];

            PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE, JSON.stringify(data));

            var stat = PelApi.GetPinCodeStatus2(data, "getUserModuleTypes");
            var pinCodeStatus = stat.status;

            if ("Valid" === pinCodeStatus) {
              config_app.GetUserModuleTypes = data;

              if (config_app.GetUserModuleTypes.Response.OutParams !== null) {

                var category_sources = $scope.insertOnTouchFlag(config_app.GetUserModuleTypes.Response.OutParams.MOBILE_MODULE_REC);

                $scope.category_sources_length = config_app.GetUserModuleTypes.Response.OutParams.MOBILE_MODULE_REC.length;

                $scope.category_sources = category_sources; //config_app.GetUserModuleTypes.Response.OutParams.MOBILE_MODULE_REC;
              }

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');

            } else if ("PWA" === pinCodeStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              var errordesc = appSettings.PIN_STATUS.PWA;
              //var appId = $stateParams.AppId;
              var appId = config_app.appId;
              var titleDisp = $stateParams.title;
              config_app.IS_TOKEN_VALID = "N";
              PelApi.goHome();

            } else if ("PCR" === pinCodeStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              $scope.loginData.error = appSettings.PIN_STATUS.PAD;
              var appId = config_app.appId;
              var titleDisp = $stateParams.title;
              config_app.IS_TOKEN_VALID = "N";
              PelApi.goHome();

            } else if ("PAD" === pinCodeStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              //PelApi.showPopup(config_app.pinCodeSubTitlePDA, "");
              config_app.IS_TOKEN_VALID = "N";
              PelApi.goHome();

            } else if ("PNE" === pinCodeStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(config_app.pinCodeSubTitlePNE, "");

            } else if ("NRP" === pinCodeStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(config_app.pinCodeSubTitleNRP, "");

            } else if ("InValid" === pinCodeStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              config_app.IS_TOKEN_VALID = "N";
              PelApi.goHome();

            } else if ("EAI_ERROR" === pinCodeStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(config_app.EAI_ERROR_DESC, "");

            } else if("EOL" === pinCodeStatus){
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              config_app.IS_TOKEN_VALID = "N";
              PelApi.goHome();

            } else if ("ERROR_CODE" === pinCodeStatus){
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(stat.description, "");
            } else if("OLD" === pinCodeStatus){
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopupVersionUpdate(data.StatusDesc , "");
            }

          });
        }
        //--- ERROR ---//
        , function (response) {
            PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE , "GetUserModuleTypes : " + JSON.stringify(response));
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(config_app.getUserModuleTypesErrorMag , "");
        }
      );
    }; // doRefresh
    //======= dats section ====//
    $scope.category_sources = [];
    $scope.btn_class = {};
    $scope.btn_class.on_release = true
    $scope.doRefresh();

  })
