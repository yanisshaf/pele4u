angular.module('pele.controllers', ['ngStorage'])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, appSettings, $state) {
    if (appSettings.env === "PD") {
      $scope.myClass = "envPD";
    }
    if (appSettings.env === "QA") {
      $scope.myClass = "envQA";
      //$scope.myClass = "envPD";
    }
    if (appSettings.env === "DV") {
      $scope.myClass = "envDV";
    }
    //===============================================//
    //== Forward to selected option from menu list ==//
    //===============================================//
    $scope.forwardTo = function(statePath) {
      $state.go(statePath);
    }
    //===============================================
    //==             isShowLogOut
    //===============================================
    $scope.isShowLogOut = function() {
      if (ionic.Platform.isAndroid()) {
        $scope.menu.isShowLogOut = true;
      } else {
        $scope.menu.isShowLogOut = false;
      }
    }
    //===============================================//
    //==            Log Out                        ==//
    //===============================================//
    $scope.logout = function() {
      if (ionic.Platform.isAndroid()) {
        ionic.Platform.exitApp();
      }
    };
    $scope.menu = {};
    $scope.isShowLogOut();
  })
  //=====================================================================//
  //==                        homeCtrl                                 ==//
  //=====================================================================//
  .controller('homeCtrl', function($scope, $http, $state, $ionicLoading, PelApi, $cordovaNetwork, $rootScope, $ionicPopup, $stateParams) {
    var showLoading = $stateParams.showLoading;

    if ("Y" === showLoading) {

      PelApi.showLoading();

    }

  }) // homeCtrl
  .controller('SettingsListCtrl', ['$scope', '$fileLogger', '$cordovaFile', '$timeout', '$state', 'PelApi', '$ionicPopup', '$cordovaSocialSharing', 'appSettings',
    function($scope, $fileLogger, $cordovaFile, $timeout, $state, PelApi, $ionicPopup, $cordovaSocialSharing, appSettings) {
      $scope.sendMail = function() {
        if (!window.cordova) {
          $ionicPopup.alert({
            title: PelApi.messages.no_cordova
          });
          return false;
        }

        $cordovaFile.readAsDataURL(cordova.file.dataDirectory, appSettings.config.LOG_FILE_NAME)
          .then(function(data) {
            data = data.replace(";base64", ".txt;base64");
            $cordovaSocialSharing
              .shareViaEmail("pele4u log",
                appSettings.config.LOG_FILE_NAME, appSettings.config.LOG_FILE_MAIL_RECIPIENT, null, null, data)
              //.share('Share my file', 'some topic', data, null)
              .then(function(result) {
                console.log("Shared successfully")
              }, function(err) {
                console.log("Share:Error - " + err);
              });
          }, function(error) {
            console.log(error);
          });
      }

      $scope.sendMail__old_roman = function() {

        if (!window.cordova) {
          $ionicPopup.alert({
            title: PelApi.messages.no_cordova
          });
          return false;
        }
        window.cordova.plugins.email.isAvailable(function(isAvailable) {
          if (isAvailable) {
            //$fileLogger.setStorageFilename(appSettings.config.LOG_FILE_NAME);

            $fileLogger.info("==================== END ====================");

            $timeout(function() {

              $fileLogger.checkFile().then(function(d) {
                resolveLocalFileSystemURL(d.localURL.toString(), function(entry) {

                  window.cordova.plugins.email.open({
                    to: appSettings.config.LOG_FILE_MAIL_RECIPIENT, //'Mobile_Admins_HR@pelephone.co.il',
                    subject: appSettings.config.LOG_FILE_MAIL_SUBJECT,
                    body: '',
                    attachments: entry.toURL()
                  });

                  PelApi.lagger.info('=============== Send Email ==============');

                }); // resolveLocalFileSystemURL
              });
            }, 8000);
          } else {
            var confirmPopup = $ionicPopup.confirm({
              title: PelApi.messages.mail.no_mail_account
            });
          }
        });

      }; // sendMail

      //----------------------------------------------
      //--             forwardTo
      //----------------------------------------------
      $scope.forwardTo = function(statePath) {
        $state.go(statePath);
      };
      //----------------------------------------------
      //--          Update Version
      //----------------------------------------------
      $scope.updateAppVersion = function() {
        if (ionic.Platform.isAndroid()) {
          window.open(appSettings.GOOGLE_PLAY_APP_LINK, '_system', 'location=yes');
        } else if (isIOS) {
          window.open(appSettings.APPLE_STORE_APP_LING, '_system', 'location=yes');
        }
      } // updateAppVersion

    }
  ])
  //========================================================================
  //--                       AppProfileCtrl
  //========================================================================
  .controller('AppProfileCtrl', ['$scope', '$fileLogger', '$timeout', 'PelApi', 'appSettings', function($scope, $fileLogger, $timeout, PelApi, appSettings) {

    $scope.APP_VERSION = appSettings.config.APP_VERSION;
    if ("PD" !== appSettings.env) {
      $scope.ENIRONMENT = " - " + appSettings.env + " " + appSettings.config.userName + " ";
    } else {
      $scope.ENIRONMENT = "";
    }

  }])
  .controller('FileCtrl', function($scope, $cordovaFile, PelApi) {
    console.log("======== FileCtrl =========");
    $scope.CHECK_FILE = "";
    $scope.CREATE_FILE = "";
    $scope.REMOVE_FILE = "";
    $scope.WRITE_FILE = "";
    $scope.READ_AS_TEXT = "";
    $scope.FILE_TEXT = {};

    var p_path = "";
    var p_dir = "FILE_TEST_DIR";
    var p_file = "FILE.txt";
    if (ionic.Platform.isAndroid()) {
      p_path = cordova.file.externalDataDirectory + p_dir + "/";
    } else if (isIOS) {
      p_path = cordova.file.dataDirectory + p_dir + "/";
    }
    //----------------------------------------------------------//
    //----------------------------------------------------------//
    $scope.checkFile = function() {
      $cordovaFile.checkFile(p_path, p_file)
        .then(function(success) {
          // success
          $scope.CHECK_FILE = "SUCCESS";
        }, function(error) {
          // error
          $scope.CHECK_FILE = "ERROR";
          PelApi.lagger.error("checkFile(" + p_path + "," + p_file + ") ");
          PePelApi.lagger.error(error);
        });
    }
    //----------------------------------------------------------//
    //--                  createFile
    //----------------------------------------------------------//
    $scope.createFile = function() {
      $cordovaFile.createFile(p_path, p_file, true)
        .then(function(success) {
          // success
          $scope.CREATE_FILE = "SUCCESS";
        }, function(error) {
          // error
          PelApi.lagger.error("createFile(" + p_path + "," + p_file + ") ");
          PelApi.lagger.error(error);
          $scope.CREATE_FILE = "ERROR";
        });
    }
    //-------------------------------------------------//
    //--               removeFile                     --//
    //-------------------------------------------------//
    $scope.removeFile = function() {
      $cordovaFile.removeFile(p_path, p_file)
        .then(function(success) {
          // success
          $scope.REMOVE_FILE = "SUCCESS";
        }, function(error) {
          // error
          PelApi.lagger.error("removeFile(" + p_path + "," + p_file + ") ");
          PelApi.lagger.error(error);

          $scope.REMOVE_FILE = "ERROR";
        });
    }

    //-------------------------------------------------//
    //--               writeFile                     --//
    //-------------------------------------------------//
    $scope.writeFile = function() {
      var l_value = $scope.FILE_TEXT.note
      $cordovaFile.writeFile(p_path, p_file, l_value, true)
        .then(function(success) {
          // success
          $scope.WRITE_FILE = "SUCCESS";
        }, function(error) {
          // error
          PelApi.lagger.error("writeFile(" + p_path + "," + p_file + ") ");
          PelApi.lagger.error(error);

          $scope.WRITE_FILE = "ERROR";
        });
    }

    //----------------------------------------------------//
    //--                readAsText                      --//
    //----------------------------------------------------//
    $scope.readAsText = function() {
      $cordovaFile.readAsText(p_path, p_file)
        .then(function(success) {
          // success
          $scope.READ_AS_TEXT = "SUCCESS";
          $scope.FILE_TEXT.note = success;
        }, function(error) {
          // error
          PelApi.lagger.error("readAsText(" + p_path + "," + p_file + ") ");
          PelApi.lagger.error(error);

          $scope.READ_AS_TEXT = "ERROR";
        });
    }
  })
  .controller('DirCtrl', function($scope, $cordovaFile, PelApi) {
    console.log("======== DirCtrl =========");
    $scope.FREE_DISK_SPACE = "";
    $scope.CHECK_DIR = "";
    $scope.CREATE_DIR = "";
    $scope.REMOVE_DIR = "";

    var p_path = "";
    var p_dir = "FILE_TEST_DIR";
    if (ionic.Platform.isAndroid()) {
      p_path = cordova.file.externalDataDirectory;
    } else if (isIOS) {
      p_path = cordova.file.dataDirectory;
    }
    //-----------------------------------------------------//
    //--               getFreeDiskSpace                  --//
    //-----------------------------------------------------//
    $scope.getFreeDiskSpace = function() {
      $cordovaFile.getFreeDiskSpace()
        .then(function(success) {
          // success in kilobytes
          console.log(success);
          $scope.FREE_DISK_SPACE = success;
        }, function(error) {
          // error
          PelPelApi.lagger.error("getFreeDiskSpace() ");
          PelApi.lagger.error(error);
          console.log(error);
          $scope.FREE_DISK_SPACE = "-1";
        });
    }; // getFreeDiskSpace
    //-------------------------------------------------------//
    //--                    checkDir                       --//
    //-------------------------------------------------------//
    $scope.checkDir = function() {
      $cordovaFile.checkDir(p_path, p_dir)
        .then(function(success) {
          // success
          $scope.CHECK_DIR = "SUCCESS";
        }, function(error) {
          // error
          PelApi.lagger.error("checkDir(" + p_path + "," + p_dir + ") ");
          PelApi.lagger.error(error);

          $scope.CHECK_DIR = "ERROR";
        });
    }; // checkDir
    //-------------------------------------------------------//
    //--                  createDir
    //-------------------------------------------------------//
    $scope.createDir = function() {
      $cordovaFile.createDir(p_path, p_dir, false)
        .then(function(success) {
          // success
          $scope.CREATE_DIR = "SUCCESS";
        }, function(error) {
          // error
          PelApi.lagger.error("createDir(" + p_path + "," + p_dir + ") ");
          PelApi.lagger.error(error);
          $scope.CREATE_DIR = "ERROR";
        });
    };
    //-------------------------------------------------------//
    //--               removeDir                           --//
    //-------------------------------------------------------//
    $scope.removeDir = function() {
      $cordovaFile.removeDir(p_path, p_dir)
        .then(function(success) {
          // success
          $scope.REMOVE_DIR = "SUCCESS";
        }, function(error) {
          // error
          PelApi.lagger.error("removeDir(" + p_path + "," + p_dir + ") ");
          PelApi.lagger.error(error);

          $scope.REMOVE_DIR = "ERROR";
        });
    } // removeDir

  });
