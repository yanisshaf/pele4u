/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  .controller('p3_tsk_moduleDocListCtrl', function($scope, $stateParams, $http, $q, $ionicLoading, $state, PelApi, $cordovaNetwork, $sessionStorage, appSettings) {

    //---------------------------------
    //--       goHome
    //---------------------------------
    $scope.goHome = function() {
      PelApi.goHome();
    }

    $scope.parse = function(data) {
      var mapped = [];
      data.forEach(function(item) {
        var docsGroups = _.get(item, "DOCUMENTS.DOCUMENTS_ROW", [])
        docsGroups.forEach(function(g) {
          var task;
          try {
            task = JSON.parse(_.get(g, "MESSAGE", "{}"));
          } catch (e) {
            task = {}
            PelApi.lagger.error("Failed to parse  JSON  string on docsGroup ")
          }
          g.TASK = _.get(task,"ROW.ROW",{});
          console.log("TASK:",g.TASK)
        })
        mapped.push(item)
      });
      return mapped;
    }
    //----------------------- REFRESH ------------------------//
    $scope.doRefresh = function() {

      PelApi.showLoading();

      var sessionDocId = $sessionStorage.DOC_ID;
      $scope.toggleGroup(sessionDocId);

      //var appId = $stateParams.AppId,
      var appId = $stateParams.AppId,
          formType = $stateParams.FormType,
          pin = $stateParams.Pin;

      $scope.appId =  appId;


      var links = PelApi.getDocApproveServiceUrl("GtUserFormGroups");

      var retGetUserFormGroups = PelApi.GetUserFormGroups(links, appId, formType, pin);

      retGetUserFormGroups.success(function(data) {
        var apiStat = PelApi.checkPinCode(data);
        var pinStatus = apiStat.status;

        if (pinStatus == "Valid") {
          PelApi.lagger.info(JSON.stringify(data));
          var result = _.get(data, "Response.OutParams.ROW", []);
          if (result.length && result[0].DOC_NAME === null)
            $state.go("app.error", {
              category: "help_us",
              description: "maof retreived : DOC_NAME is NULL"
            });

          $scope.docsGroups = $scope.parse(result);

          if ($scope.docsGroups.length) {
            $scope.title = $scope.docsGroups[0].DOC_TYPE;
          }
        } else if ("PDA" === pinStatus) {
          $scope.login();
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
          PelApi.lagger.error("App error : ".apiStat.description)
        }
      }).error(function(error) {
        PelApi.lagger.error("GtUserFormGroups : " + JSON.stringify(error));
        $state.go("app.error", {
          category: "http_err",
          description: "http error"
        })
      }).finally(function() {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });

    };
    //---------------------------------------------------------
    //-- When        Who       Description
    //-- ==========	 ========  ================================
    //-- 20/10/2015  R.W.      Accordion functions
    //---------------------------------------------------------
    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    };
    //----------------------------------------------------------
    //-- Search bar JSON rebild
    //----------------------------------------------------------
    $scope.searchBarCreteria = function() {
      var searchText = $scope.searchText.text;
      if ($scope.searchText.text !== undefined && $scope.searchText.text !== "") {
        list = $scope.docsGroups;
        for (var i = 0; i < list.length; i++) {
          var sCount = 0;
          for (var j = 0; j < list[i].DOCUMENTS.DOCUMENTS_ROW.length; j++) {
            var owner = list[i].DOCUMENTS.DOCUMENTS_ROW[j].MESSAGE;
            var n = owner.indexOf(searchText);
            if (-1 !== n) {
              sCount++;
            }
          }
          $scope.docsGroups[i].FORM_QTY = sCount;
        }
      } else {
        for (var i = 0; i < list.length; i++) {
          var sCount = list[i].DOCUMENTS.DOCUMENTS_ROW.length;
          $scope.docsGroups[i].FORM_QTY = sCount;
        }
      }
    }; //

    $scope.fix_json = function(data) {
      /*
      var newData = JSON.parse( data.Response.OutParams.Result );
      var myJSON = newData.JSON[0];
      newData = myJSON;
      */
      var newData = {};
      var myJSON = {};

      if (data.Response.OutParams.Result === undefined) {
        data.Response.OutParams.Result = {};
      } else {
        newData = JSON.parse(data.Response.OutParams.Result);
        myJSON = newData.JSON[0];

        if (myJSON.DOC_LINES.length === undefined) {
          var docLinesRow = myJSON.DOC_LINES.DOC_LINES_ROW;
          myJSON.DOC_LINES = [];
          myJSON.DOC_LINES.DOC_LINES_ROW = docLinesRow;
        }
        newData = myJSON;
        data.Response.OutParams.Result = newData;
      }

      return data;

    }

    //--------------------------------------------------------------
    //-- When        Who         Description
    //-- ----------  ----------  -----------------------------------
    //-- 01/11/2015  R.W.        function forward to page by DOC_ID
    //--------------------------------------------------------------
    $scope.forwardToDoc = function(docId, docInitId) {
      //var appId = $stateParams.AppId;

      var appId = appSettings.config.appId;
      var statePath = 'app.doc_' + docId;

      PelApi.showLoading();

      var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");

      var retGetUserNotifications = PelApi.GetUserNotifications(links, appId, docId, docInitId);
      retGetUserNotifications.success(function(data) {
        data = $scope.fix_json(data)
        PelApi.lagger.info("============= Get User Notification ===============");
        PelApi.lagger.info("PelApi.GetUserNotifications : ", JSON.stringify(data));

        var stat = PelApi.checkPinCode(data, "GetUserNotifNew");
        var pinStatus = stat.status;
        PelApi.lagger.info("pinStatus after get pin code  : ", pinStatus);

        if ("Valid" === pinStatus) {

          var newData = data.Response.OutParams.Result;

          appSettings.config.docDetails = newData;

          var buttonsLength = 0;

          if (appSettings.config.docDetails.BUTTONS.length !== undefined) {
            buttonsLength = appSettings.config.docDetails.BUTTONS.length;
          }

          if (2 === buttonsLength) {
            appSettings.config.ApprovRejectBtnDisplay = true;
          } else {
            appSettings.config.ApprovRejectBtnDisplay = false;
          }

          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          console.log("state go : ", statePath, {
            "AppId": appId,
            "DocId": docId,
            "DocInitId": docInitId
          });

          $state.go(statePath, {
            "AppId": appId,
            "DocId": docId,
            "DocInitId": docInitId
          });

        } else if ("PDA" === pinStatus) {

          $scope.login();

        } else if ("InValid" === pinStatus) {

          //$state.go("app.p1_appsLists");
          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();

        } else if ("EOL" === pinStatus) {

          appSettings.config.IS_TOKEN_VALID = "N";
          PelApi.goHome();

        } else if ("EAI_ERROR" === pinStatus) {

          PelApi.showPopup(appSettings.config.EAI_ERROR_DESC, "");

        } else if ("ERROR_CODE" === pinStatus) {

          PelApi.showPopup(stat.description, "");

        } else if ("OLD" === pinStatus) {

          PelApi.showPopupVersionUpdate(data.StatusDesc, "");

        }
      }).error(function(error) {
        PelApi.lagger.error("GetUserNotifNew : " + JSON.stringify(error));
        PelApi.showPopup(appSettings.config.getUserModuleTypesErrorMag, "");
      }).finally(function() {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    } // forwardToDoc

    $scope.feed = [];
    $scope.searchText = {};
    $scope.doRefresh();

  });
