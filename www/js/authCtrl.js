/**
 * Created by User on 06/09/2016.
 */
var app = angular.module('pele.authCtrl', ['ngStorage']);

app.controller('LoginCtrl', function( $scope
                                    , $state
                                    , $templateCache
                                    , $q
                                    , $rootScope
                                    , PelApi
                                    , $localStorage
                                    , $ionicLoading) {
  //------------------------------------------------------------//
  //--                    Get AppId                           --//
  //------------------------------------------------------------//
  $scope.getAppId = function(){

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
      }

      return appId;

  }// getAppId
  //------------------------------------------------------------//
  //--                                                        --//
  //------------------------------------------------------------//
  $scope.doLogIn = function(){

    console.log("PIN : " + $scope.user.pin);

    PelApi.showLoading();

    var links = PelApi.getDocApproveServiceUrl("IsSessionValidJson");

    var appId = PelApi.getAppId();
    var pin   = $scope.user.pin;
    $scope.user.pin = "";

    if(appId !== ""){
      var retIsSessionValidJson = PelApi.IsSessionValidJson(links , appId , pin );
      retIsSessionValidJson.then(
        //--- SUCCESS ---//
        function () {

          retIsSessionValidJson.success(function (data, status, headers, config) {

            var pinStatus = data;
            PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE , "=========== IsSessionValidJson ================");
            PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE , JSON.stringify(data));

            if ("Valid" === pinStatus) {
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              config_app.Pin = pin;
              config_app.IS_TOKEN_VALID = "Y";
              $state.go('app.p1_appsLists');
            } else if("PWA" === pinStatus){
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              $scope.user.message = config_app.pinCodeSubTitlePWA;
              $scope.user.pin = "";
            } else if ("PAD" === pinStatus) {
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');

              //$scope.user.message = config_app.pinCodeSubTitlePDA;
              //$scope.user.pin = "";
              PelApi.goHome();

            } else if ("InValid" === pinStatus) {

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              //$state.go("app.p1_appsLists");
              PelApi.goHome();

            } else if ("EAI_ERROR" === pinStatus){

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(config_app.EAI_ERROR_DESC, "");

            } else if("EOL" === pinStatus){

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.goHome();

            } else if ("ERROR_CODE" === pinStatus){

              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              PelApi.showPopup(stat.description, "");
            }
          }).error(function (data, status, headers, config) {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(config_app.getUserModuleTypesErrorMag , "");
          });
        }
        //--- ERROR ---//
        , function (response) {
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE , "========== IsSessionValidJson ERROR ==========");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE , JSON.stringify(response));
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          PelApi.showPopup(config_app.getUserModuleTypesErrorMag , "");
        }
      ); /// then
    }
  }; // doLogIn

  $scope.user = {};
  $scope.user.pin = "";
  $scope.user.message = "";
  $scope.TITLE_OTP_INPUT = config_app.TITLE_OTP_INPUT;
  $scope.TITLE_SYSTEM_MESSAGES = config_app.TITLE_SYSTEM_MESSAGES;
  $scope.TITLE_LOGIN = config_app.TITLE_LOGIN;
  $scope.TITLE_SEND_OTP = config_app.TITLE_SEND_OTP;
  $scope.TITLE_RESET_PASSWORD_LINK = config_app.TITLE_RESET_PASSWORD_LINK;


});

app.controller('ForgotPasswordCtrl', function($scope, $state) {
  $scope.recoverPassword = function(){
    $state.go('app.login');
  };
  $scope.TITLE_FORGOT_PASSWORD = config_app.TITLE_FORGOT_PASSWORD;
  $scope.TITLE_OTP_REQUEST = config_app.TITLE_OTP_REQUEST;
  $scope.TITLE_SEND_OTP_LINK = config_app.TITLE_SEND_OTP_LINK;
  $scope.user = {};
  $scope.user.pin = "";
  $scope.user.phone = config_app.MSISDN_VALUE;
});

