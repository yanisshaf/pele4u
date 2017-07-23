angular.module('pele.controllers', ['ngStorage'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaNetwork , $rootScope , appSettings , $state ) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
    document.addEventListener("deviceready", function () {

      config_app.network = $cordovaNetwork.getNetwork();
      config_app.isOnline = $cordovaNetwork.isOnline();
      $scope.$apply();

      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        config_app.isOnline = true;
        config_app.network = $cordovaNetwork.getNetwork();
        $scope.$apply();
      })

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        config_app.isOnline = false;
        config_app.network = $cordovaNetwork.getNetwork();

        $scope.$apply();
      })

    }, false);

    if(appSettings.enviroment === "PD"){
      $scope.myClass = "envPD";
    }
    if(appSettings.enviroment === "QA"){
      $scope.myClass = "envQA";
      //$scope.myClass = "envPD";
    }
    if(appSettings.enviroment === "DV"){
      $scope.myClass = "envDV";
    }
    //===============================================//
    //== Forward to selected option from menu list ==//
    //===============================================//
    $scope.forwardTo = function(statePath){
      $state.go(statePath);
    }
    //===============================================
    //==             isShowLogOut
    //===============================================
    $scope.isShowLogOut = function(){
      var deviceInformation = ionic.Platform.device();
      var isWebView = ionic.Platform.isWebView();
      var isIPad = ionic.Platform.isIPad();
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();
      var isWindowsPhone = ionic.Platform.isWindowsPhone();

      if(isAndroid){
      $scope.menu.isShowLogOut = true;
      }else{
        $scope.menu.isShowLogOut = false;
      }
    }
    //===============================================//
    //==            Log Out                        ==//
    //===============================================//
    $scope.logout  = function() {
      isAndroid = ionic.Platform.isAndroid();

      if(isAndroid){
        ionic.Platform.exitApp();
      }
    } ;
    $scope.menu ={};
    $scope.isShowLogOut();
})
//=====================================================================//
//==                        homeCtrl                                 ==//
//=====================================================================//
.controller('homeCtrl' , function($scope , $http , $state , $ionicLoading , PelApi , $cordovaNetwork , $rootScope , $ionicPopup, $stateParams){
    console.log("==================== homeCtrl =======================");

    var showLoading = $stateParams.showLoading;

    if("Y" === showLoading){

      PelApi.showLoading();

    }

}) // homeCtrl
//=====================================================================//
//==                      Setings SendLog                            ==//
//=====================================================================//
.controller('SendLogCtrl' , function($scope){
}) // SendLogCtrl

//======================================================================
//==                          Settings
//======================================================================
.controller('SettingsListCtrl', [ '$scope'
                                , '$fileLogger'
                                , '$timeout'
                                , '$state'
                                , 'PelApi'
                                , function($scope
                                         , $fileLogger
                                         , $timeout
                                         , $state
                                         , PelApi
                                         ){

    $scope.sendMail = function(){

      $fileLogger.setStorageFilename(config_app.LOG_FILE_NAME);

      $fileLogger.info("==================== END ====================");

      $timeout(function(){

        $fileLogger.checkFile().then(function(d) {

          resolveLocalFileSystemURL(d.localURL.toString(), function(entry) {

            cordova.plugins.email.open({
              to:      'Mobile_Admins_HR@pelephone.co.il',
              subject: config_app.LOG_FILE_MAIL_SUBJECT,
              body:    '',
              attachments:  entry.toURL()
            });

            PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE ,'=============== Send Email ==============');

          }); // resolveLocalFileSystemURL
        });
      }, 8000);

    }; // sendMail

    //----------------------------------------------
    //--             forwardTo
    //----------------------------------------------
    $scope.forwardTo = function(statePath){
        $state.go(statePath);
    };
    //----------------------------------------------
    //--          Update Version
    //----------------------------------------------
    $scope.updateAppVersion = function(){
      var deviceInformation = ionic.Platform.device();
      var isWebView = ionic.Platform.isWebView();
      var isIPad = ionic.Platform.isIPad();
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();
      var isWindowsPhone = ionic.Platform.isWindowsPhone();

      if(isAndroid){
        window.open(appSettings.GOOGLE_PLAY_APP_LINK, '_system', 'location=yes');
      }
      else if(isIOS){
        window.open(appSettings.APPLE_STORE_APP_LING, '_system', 'location=yes');
      }
    }// updateAppVersion

  }])
//========================================================================
//--                       AppProfileCtrl
//========================================================================
.controller('AppProfileCtrl', [ '$scope'
                                , '$fileLogger'
                                , '$timeout'
                                , 'PelApi'
                                , 'appSettings'
                                , function( $scope
                                          , $fileLogger
                                          , $timeout
                                          , PelApi
                                          , appSettings
                                ) {

      $scope.APP_VERSION = config_app.APP_VERSION;
      if("PD" !== appSettings.enviroment)
      {
        $scope.ENIRONMENT = " - " + appSettings.enviroment + " " + config_app.userName + " ";
      }else{
        $scope.ENIRONMENT = "";
      }

    }])
  .controller('FileCtrl' , function($scope , $cordovaFile , PelApi){
    console.log("======== FileCtrl =========");
    $scope.CHECK_FILE = "";
    $scope.CREATE_FILE = "";
    $scope.REMOVE_FILE = "";
    $scope.WRITE_FILE = "";
    $scope.READ_AS_TEXT = "";
    $scope.FILE_TEXT = {};
    var isIOS = ionic.Platform.isIOS();
    var isAndroid = ionic.Platform.isAndroid();
    var p_path = "";
    var p_dir = "FILE_TEST_DIR";
    var p_file = "FILE.txt";
    if(isAndroid){
      p_path = cordova.file.externalDataDirectory + p_dir + "/";
    }else if(isIOS){
      p_path = cordova.file.dataDirectory + p_dir + "/";
    }
    //----------------------------------------------------------//
    //----------------------------------------------------------//
    $scope.checkFile = function(){
      $cordovaFile.checkFile(p_path, p_file)
        .then(function (success) {
          // success
          $scope.CHECK_FILE = "SUCCESS";
        }, function (error) {
          // error
          $scope.CHECK_FILE = "ERROR";
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"checkFile(" + p_path + "," + p_file + ") ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);
        });
    }
    //----------------------------------------------------------//
    //--                  createFile
    //----------------------------------------------------------//
    $scope.createFile = function(){
      $cordovaFile.createFile(p_path, p_file, true)
        .then(function (success) {
          // success
          $scope.CREATE_FILE = "SUCCESS";
        }, function (error) {
          // error
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"createFile(" + p_path + "," + p_file + ") ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);
          $scope.CREATE_FILE = "ERROR";
        });
    }
    //-------------------------------------------------//
    //--               removeFile                     --//
    //-------------------------------------------------//
    $scope.removeFile = function(){
      $cordovaFile.removeFile(p_path, p_file)
        .then(function (success) {
          // success
          $scope.REMOVE_FILE = "SUCCESS";
        }, function (error) {
          // error
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"removeFile(" + p_path + "," + p_file + ") ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);

          $scope.REMOVE_FILE = "ERROR";
        });
    }

    //-------------------------------------------------//
    //--               writeFile                     --//
    //-------------------------------------------------//
    $scope.writeFile = function(){
      var l_value = $scope.FILE_TEXT.note
      $cordovaFile.writeFile(p_path, p_file ,l_value, true)
        .then(function (success) {
          // success
          $scope.WRITE_FILE = "SUCCESS";
        }, function (error) {
          // error
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"writeFile(" + p_path + "," + p_file + ") ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);

          $scope.WRITE_FILE = "ERROR";
        });
    }

    //----------------------------------------------------//
    //--                readAsText                      --//
    //----------------------------------------------------//
    $scope.readAsText = function(){
      $cordovaFile.readAsText(p_path, p_file)
        .then(function (success) {
          // success
          $scope.READ_AS_TEXT = "SUCCESS";
          $scope.FILE_TEXT.note = success;
        }, function (error) {
          // error
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"readAsText(" + p_path + "," + p_file + ") ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);

          $scope.READ_AS_TEXT = "ERROR";
        });
    }
  })
  .controller('DirCtrl', function($scope , $cordovaFile , PelApi) {
    console.log("======== DirCtrl =========");
    $scope.FREE_DISK_SPACE = "";
    $scope.CHECK_DIR = "";
    $scope.CREATE_DIR = "";
    $scope.REMOVE_DIR = "";
    var isIOS = ionic.Platform.isIOS();
    var isAndroid = ionic.Platform.isAndroid();
    var p_path = "";
    var p_dir = "FILE_TEST_DIR";
    if(isAndroid){
      p_path = cordova.file.externalDataDirectory;
    }else if(isIOS){
      p_path = cordova.file.dataDirectory;
    }
    //-----------------------------------------------------//
    //--               getFreeDiskSpace                  --//
    //-----------------------------------------------------//
    $scope.getFreeDiskSpace = function(){
      $cordovaFile.getFreeDiskSpace()
        .then(function (success) {
          // success in kilobytes
          console.log(success);
          $scope.FREE_DISK_SPACE = success;
        }, function (error) {
          // error
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"getFreeDiskSpace() ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);
          console.log(error);
          $scope.FREE_DISK_SPACE = "-1";
        });
    }; // getFreeDiskSpace
    //-------------------------------------------------------//
    //--                    checkDir                       --//
    //-------------------------------------------------------//
    $scope.checkDir = function(){
      $cordovaFile.checkDir(p_path, p_dir)
        .then(function (success) {
          // success
          $scope.CHECK_DIR = "SUCCESS";
        }, function (error) {
          // error
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"checkDir(" + p_path + "," + p_dir + ") ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);

          $scope.CHECK_DIR = "ERROR";
        });
    }; // checkDir
    //-------------------------------------------------------//
    //--                  createDir
    //-------------------------------------------------------//
    $scope.createDir = function(){
      $cordovaFile.createDir(p_path, p_dir , false)
        .then(function (success) {
          // success
          $scope.CREATE_DIR = "SUCCESS";
        }, function (error) {
          // error
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"createDir(" + p_path + "," + p_dir + ") ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);
          $scope.CREATE_DIR = "ERROR";
        });
    };
    //-------------------------------------------------------//
    //--               removeDir                           --//
    //-------------------------------------------------------//
    $scope.removeDir = function(){
      $cordovaFile.removeDir(p_path, p_dir)
        .then(function (success) {
          // success
          $scope.REMOVE_DIR = "SUCCESS";
        }, function (error) {
          // error
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,"removeDir(" + p_path + "," + p_dir + ") ");
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ,error);

          $scope.REMOVE_DIR = "ERROR";
        });
    } // removeDir

  })
;
