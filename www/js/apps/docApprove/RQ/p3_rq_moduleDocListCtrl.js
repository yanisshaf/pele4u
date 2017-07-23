/**
 * Created by User on 25/08/2016.
 */
var app = angular.module('pele.p3_rq_moduleDocListCtrl', ['ngStorage']);
//====================================================================================
//==                                  PAGE_3
//====================================================================================
app.controller('p3_rq_moduleDocListCtrl', function($scope,
                                                   $stateParams,
                                                   $http,
                                                   $q,
                                                   $ionicLoading,
                                                   $state ,
                                                   PelApi ,
                                                   $cordovaNetwork ,
                                                   $sessionStorage) {

  //---------------------------------
  //--       goHome
  //---------------------------------
  $scope.goHome = function () {
    PelApi.goHome();
  }
  //----------------------- REFRESH ------------------------//
  $scope.doRefresh = function () {

    PelApi.showLoading();

    var sessionDocId = $sessionStorage.DOC_ID;
    $scope.toggleGroup(sessionDocId);

    $scope.shownGroup = config_app.PO_ORG_NAME;

    var appId = $stateParams.AppId,
      formType = $stateParams.FormType,
      pin = $stateParams.Pin;

    PelApi.delete_ATTACHMENT_DIRECTORY_NAME();

    var links = PelApi.getDocApproveServiceUrl("GetUserRqGroups");

    var retGetUserFormGroups = PelApi.GetUserRqGroups(links, appId, formType, pin);

    retGetUserFormGroups.then(
      //--- SUCCESS ---//
      function () {

        retGetUserFormGroups.success(function (data, status, headers, config) {

          PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE, JSON.stringify(data));

          var stat = PelApi.GetPinCodeStatus2(data, "GetUserPoOrdGroupGroup");
          var pinStatus = stat.status;

          console.log(data);

          if ("Valid" === pinStatus) {
            var P_ERROR_CODE = data.Response.OutParams.P_ERROR_CODE;
            if(P_ERROR_CODE != undefined){
              P_ERROR_CODE = P_ERROR_CODE.toString();
            }
            if(P_ERROR_CODE !== "0" ){
              var errorMsg = data.Response.OutParams.P_ERROR_DESC;
              PelApi.showPopup(errorMsg, "");
            }else{
              $scope.chats = data.Response.OutParams.ROW;
              console.log($scope.chats);
              $scope.title = "אישור דרישות רכש";
              var rowLength = $scope.chats.length;

              var emptyFlag = "N";

              if($scope.chats[0].REQ_QTY === "0"){
                emptyFlag = "Y";
              }

              if("N" === emptyFlag){
                $ionicLoading.hide();
                $scope.$broadcast('scroll.refreshComplete');
              }else{
                $ionicLoading.hide();
                $scope.$broadcast('scroll.refreshComplete');
                var appId = $stateParams.AppId,
                  formType = $stateParams.FormType,
                  pin = $stateParams.Pin;

                $state.go("app.p2_moduleList",{"AppId": appId, "Title": "", "Pin": pin});
              }

            }
          } else if ("PDA" === pinStatus) {

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            //$scope.login();
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();

          } else if("EOL" === pinStatus){
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();

          } else if ("InValid" === pinStatus) {

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            //$state.go("app.p1_appsLists");
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();

          } else if ("EAI_ERROR" === pinStatus){

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(config_app.EAI_ERROR_DESC, "");

          } else if ("ERROR_CODE" === pinStatus) {

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(stat.description, "");
          }else if("PWA" === pinStatus){
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();
          }else if("OLD" === pinStatus){
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopupVersionUpdate(data.StatusDesc , "");
          }
        });
      }
      //--- ERROR ---//
      , function (response) {
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE, "GetUserPoOrdGroupGroup : " + JSON.stringify(response));
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          PelApi.showPopup(config_app.getUserModuleTypesErrorMag, "");
      }
    );
    /*
     }
     */
  };
  //---------------------------------------------------------
  //-- When        Who       Description
  //-- ==========	 ========  ================================
  //-- 20/10/2015  R.W.      Accordion functions
  //---------------------------------------------------------
  $scope.toggleGroup = function (group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function (group) {
    return $scope.shownGroup === group;
  };
  //----------------------------------------------------------
  //-- Search bar JSON rebild
  //----------------------------------------------------------
  $scope.searchBarCreteria = function () {
    var searchText = $scope.searchText.text;
    if ($scope.searchText.text !== undefined && $scope.searchText.text !== "") {
      list = $scope.chats;
      for (var i = 0; i < list.length; i++) {
        var sCount = 0;

          var REQ_NUM = list[i].REQ_NUM;
          var vI = REQ_NUM.indexOf(searchText);

          var REQ_TOTAL_AMOUNT_DSP = list[i].REQ_TOTAL_AMOUNT_DSP;
          var oI = REQ_TOTAL_AMOUNT_DSP.indexOf(searchText);

          var amount = list[i].ORDER_DETAILS.ORDER_DETAILS_ROW[j].PO_AMOUNT;
          var aI = amount.indexOf(searchText);


          if (-1 !== vI || -1 !== oI || -1 !== aI ) {
            sCount++;
          }
        $scope.chats[i].ORDER_QTY = sCount;
      }
    }
  }

  $scope.fix_json = function( data ){

    var newData = {};
    var myJSON = {};
    if( data.Response.OutParams.Result === undefined)
    {
      data.Response.OutParams.Result = {};
    }else{
      newData = JSON.parse( data.Response.OutParams.Result );
      myJSON = newData.JSON[0];
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
  $scope.forwardToDoc = function(docId , docInitId ){
    var appId = config_app.appId;
    $scope.appId = config_app.appId;
    var statePath = 'app.doc_' + docId;
    PelApi.showLoading();

    var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");

    var retGetUserNotifications = PelApi.GetUserNotifications(links, appId, docId, docInitId);
    retGetUserNotifications.then(
      //--- SUCCESS ---//
      function () {
        retGetUserNotifications.success(function (data, status, headers, config) {

          data = $scope.fix_json(data);

          var stat = PelApi.GetPinCodeStatus2(data, "GetUserNotifNew");
          var pinStatus = stat.status;
          if("Valid" === pinStatus) {
            PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE, JSON.stringify(data));

            config_app.docDetails = data.Response.OutParams.Result;


            var buttonsLength = 0
            if(config_app.docDetails.BUTTONS.length !== undefined){
              buttonsLength = config_app.docDetails.BUTTONS.length;
            }

            // Show the action sheet
            if (2 === buttonsLength) {
              config_app.ApprovRejectBtnDisplay = true;
            } else {
              config_app.ApprovRejectBtnDisplay = false;
            }

            if(config_app.docDetails.ATTACHMENT_DOWNLOAD_TIME_OUT !== undefined){
              config_app.ATTACHMENT_TIME_OUT = config_app.docDetails.ATTACHMENT_DOWNLOAD_TIME_OUT;
            }else{
              config_app.ATTACHMENT_TIME_OUT = 10000;
            }

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');



            $state.go(statePath, {"AppId": $scope.appId, "DocId": docId, "DocInitId": docInitId});

          }else if("PWA" === pinStatus){
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();
          }else if("EOL" === pinStatus){
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();

          } else if ("EAI_ERROR" === pinStatus){

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(config_app.EAI_ERROR_DESC, "");

          } else if ("ERROR_CODE" === pinStatus){

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(stat.description, "");

          }else if ("PCR" === pinStatus) {

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();

          } else if("OLD" === pinCodeStatus){
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopupVersionUpdate(data.StatusDesc , "");
          }


        });
      }
      //--- ERROR ---//
      , function (response) {
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE , "GetUserNotificationsNew : " + JSON.stringify(response));
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          PelApi.showPopup(config_app.getUserModuleTypesErrorMag , "");
      }
    );
  } // forwardToDoc
  //----------------------------------------------//
  //--                 Main                     --//
  //----------------------------------------------//
  $scope.feed = [];
  $scope.searchText = {};
  $scope.doRefresh();

});
