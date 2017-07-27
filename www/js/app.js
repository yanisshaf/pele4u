// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('pele', ['ionic', 'ngCordova', 'ngStorage', 'tabSlideBox', 'pele.messages', 'pele.controllers', 'pele.factories', 'pele.config', 'pele.services'
    //-----------------------------------------//
    //--           MENU                      --//
    //-----------------------------------------//
    , 'pele.P1_appsListCtrl'
    //-----------------------------------------//
    //--       Authentication                --//
    //-----------------------------------------//
    , 'pele.authCtrl'
    //-----------------------------------------//
    //--        docApprove                   --//
    //-----------------------------------------//
     , 'pele.P2_moduleListCtrl'
    //-----------------------------------------//
    //--        docApprove/PO                --//
    //-----------------------------------------//
    , 'pele.p3_po_moduleDocListCtrl', 'pele.p4_po_doc_10002Ctrl'
    //-----------------------------------------//
    //--        docApprove/HR                --//
    //-----------------------------------------//
    , 'pele.p3_hr_moduleDocListCtrl', 'pele.p4_hr_docCtrl'
    //-----------------------------------------//
    //--        docApprove/RQ
    //-----------------------------------------//
    , 'pele.p3_rq_moduleDocListCtrl', 'pele.p4_rq_doc_20002Ctrl'
    //-----------------------------------------//
    //--        docApprove/INI
    //-----------------------------------------//
    , 'pele.p4_ini_doc_30002Ctrl'
    //-----------------------------------------//
    //--          scsn Print
    //-----------------------------------------//
    , 'pele.p2_scan_printCtrl'
    //-----------------------------------------//
    //--           Settings                  --//
    //-----------------------------------------//
    , 'fileLogger'
    //-----------------------------------------//
    //-----------------------------------------//
    , 'pele.p2_testCtrl'
  ])

  .run(function($ionicPlatform, $state, $ionicLoading, PelApi, appSettings) {

    PelApi.init();
    $ionicPlatform.ready(function() {

      /*
      //$fileLogger.setStorageFilename(config_app.LOG_FILE_NAME);
      PelApi.init();
      window.plugins.OneSignal.setLogLevel({
        logLevel: 4,
        visualLevel: 4
      });
      var notificationOpenedCallback = function(jsonData) {
        PelApi.lagger.info('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      };
      PelApi.lagger.info(appSettings.topConfig.env + ' Send registration');
      window.plugins.OneSignal
        //.startInit(conf.appId, conf.googleProjectNumber)
        .startInit('430ad45c-c555-41f5-87c4-46f9d4be0cc1')
        .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
        .handleNotificationOpened(notificationOpenedCallback)
        .endInit();

      window.plugins.OneSignal.getIds(function(ids) {
        config_app.PLAYER_ID = ids.userId;
        PelApi.lagger.info('window.plugins.OneSignal.getIds :' + ids.userId);
      });
      */

      //PelApi.registerPushNotification();

      //----------------------------------------
      //--    Get Version from config.xml
      //----------------------------------------
      if (window.cordova) {
        PelApi.cordovaInit();
        window.cordova.getAppVersion(function(version) {
          config_app.APP_VERSION = version;
          PelApi.lagger.info("window.cordova.getAppVersion() : " + config_app.APP_VERSION);
        });
      }


      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }


      //----------------------------------
      //--    Go To Application List
      //----------------------------------
      $state.go("app.p1_appsLists");

    });
  })

  .config(function($stateProvider, $urlRouterProvider, appSettings) {
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })
      //---------------------------------------------------------------------------//
      //--                           MENU                                        --//
      //---------------------------------------------------------------------------//
      .state('app.p1_appsLists', {
        url: '/p1_appsLists',
        views: {
          'menuContent': {
            templateUrl: 'templates/p1_appsLists.html',
            controller: 'P1_appsListCtrl'
          }
        }
      })
      //----------------------------------------------------------------------------//
      //--                         docApprove
      //----------------------------------------------------------------------------//
      .state('app.p2_moduleList', {
        url: '/p2_moduleList/:AppId/:Title/:Pin',
        views: {
          'menuContent': {
            templateUrl: 'templates/apps/DocApprove/p2_moduleList.html',
            controller: 'P2_moduleListCtrl'
          }
        }
      })
      //-------------------------------------------//
      //--               RQ                      --//
      //-------------------------------------------//
      .state('app.p3_rq_moduleDocList', {
        url: "/p3_rq_moduleDocList/:AppId/:FormType/:Pin",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/RQ/p3_rq_moduleDocList.html",
            controller: 'p3_rq_moduleDocListCtrl'
          }
        }
      })
      .state('app.doc_20002', {
        url: "/doc_20002/:DocId/:DocInitId",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/RQ/p4_rq_doc_20002.html",
            controller: 'p4_rq_doc_20002Ctrl'
          }
        }
      })
      //-------------------------------------------//
      //--              INI                      --//
      //-------------------------------------------//
      /*
      .state('app.p3_ini_moduleDocList', {
        url: "/p3_rq_moduleDocList/:AppId/:FormType/:Pin",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/INI/p3_ini_moduleDocList.html",
            controller: 'p3_ini_moduleDocListCtrl'
          }
        }
      })
      */
      .state('app.doc_30002', {
        url: "/doc_30002/:IniDocId/:IniDocInitId/:DocId/:Mode",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/INI/p4_ini_doc_30002.html",
            controller: 'p4_ini_doc_30002Ctrl'
          }
        }
      })
      //-------------------------------------------//
      //--               PO                      --//
      //-------------------------------------------//
      .state('app.p3_po_moduleDocList', {
        url: "/p3_po_moduleDocList/:AppId/:FormType/:Pin",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/PO/p3_po_moduleDocList.html",
            controller: 'p3_po_moduleDocListCtrl'
          }
        }
      })
      .state('app.doc_10002', {
        url: "/doc_10002/:DocId/:DocInitId",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/PO/p4_po_doc_10002.html",
            controller: 'p4_po_doc_10002Ctrl'
          }
        }
      })
      //-------------------------------------------//
      //--               HR                      --//
      //-------------------------------------------//
      .state('app.p3_hr_moduleDocList', {
        url: "/p3_hr_moduleDocList/:AppId/:FormType/:Pin",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/HR/p3_moduleDocList.html",
            controller: 'p3_hr_moduleDocListCtrl'
          }
        }
      })
      //--------------------------------------------//
      //--             HR/242                     --//
      //--------------------------------------------//
      .state('app.doc_242', {
        url: "/doc_242/:AppId/:DocId/:DocInitId",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/HR/p4_doc_242.html",
            controller: 'p4_hr_docCtrl'
          }
        }
      })
      //--------------------------------------------//
      //--            HR/806                      --//
      //--------------------------------------------//
      .state('app.doc_806', {
        url: "/doc_806/:AppId/:DocId/:DocInitId",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/HR/p4_doc_806.html",
            controller: 'p4_hr_docCtrl'
          }
        }
      })
      //--------------------------------------------//
      //--                   HR/807               --//
      //--------------------------------------------//
      .state('app.doc_807', {
        url: "/doc_807/:AppId/:DocId/:DocInitId",
        views: {
          'menuContent': {
            templateUrl: "templates/apps/DocApprove/HR/p4_doc_807.html",
            controller: 'p4_hr_docCtrl'
          }
        }
      })
      //----------------------------------------------------------------------------//
      //--                         End docApprove
      //----------------------------------------------------------------------------//

      //---- home ----//
      .state('app.home', {
        url: '/home/:showLoading',
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'homeCtrl'
          }
        }
      })
      //---------------------------------------------------------------------------//
      //--                        Authentication                                 --//
      //---------------------------------------------------------------------------//
      .state('app.login', {
        url: '/auth',
        views: {
          'menuContent': {
            templateUrl: 'templates/auth/login.html',
            controller: 'LoginCtrl'
          }
        }
      })
      .state('app.forgot-password', {
        url: '/auth',
        views: {
          'menuContent': {
            templateUrl: 'templates/auth/forgot-password.html',
            controller: 'ForgotPasswordCtrl'
          }
        }
      })
      //---------------------------------------------------------------------------//
      //--                         Settings                                      --//
      //---------------------------------------------------------------------------//
      .state('app.settings', {
        url: '/settings',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings/settingsList.html',
            controller: 'SettingsListCtrl'
          }
        }
      })
      .state('app.settings.sendLog', {
        url: '/sendLog',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings/sendLog.html',
            controller: 'SendLogCtrl'
          }
        }
      })
      .state('app.appProfile', {
        url: '/appProfile',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings/appProfile.html',
            controller: 'AppProfileCtrl'
          }
        }
      })
      //------------------------------------------------------//
      //--            delete after test                     --//
      //------------------------------------------------------//
      .state('app.dir', {
        url: '/dir',
        views: {
          'menuContent': {
            templateUrl: 'templates/dir.html',
            controller: 'DirCtrl'
          }
        }
      })
      .state('app.file', {
        url: '/file',
        views: {
          'menuContent': {
            templateUrl: 'templates/file.html',
            controller: 'FileCtrl'
          }
        }
      })
      //----------------------------------------------------------//
      //--                      TEST
      //----------------------------------------------------------//
      .state('app.p2_test', {
        url: '/p2_test',
        views: {
          'menuContent': {
            templateUrl: 'templates/apps/DocApprove/TEST/p2_test.html',
            controller: 'p2_testCtrl'
          }
        }
      })
      //----------------------------------------------------------//
      //--              PrintScaner
      //----------------------------------------------------------//
      .state('app.p2_scan_print', {
        url: '/scan_print',
        views: {
          'menuContent': {
            templateUrl: 'templates/apps/scanPrint/p2_scan_print.html',
            controller: 'p2_scan_printCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/apps/home.html', {
      'showLoading': 'Y'
    });

  });
