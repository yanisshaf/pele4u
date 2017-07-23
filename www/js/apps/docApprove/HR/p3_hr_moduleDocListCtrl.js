/**
 * Created by User on 25/08/2016.
 */
var app = angular.module('pele.p3_hr_moduleDocListCtrl', ['ngStorage']);
//=================================================================
//==                    PAGE_3
//=================================================================
app.controller('p3_hr_moduleDocListCtrl', function($scope, $stateParams, $http, $q, $ionicLoading, $state ,PelApi , $cordovaNetwork , $sessionStorage) {

  //---------------------------------
  //--       goHome
  //---------------------------------
  $scope.goHome = function(){
    PelApi.goHome();
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

    var links = PelApi.getDocApproveServiceUrl("GtUserFormGroups");

    var retGetUserFormGroups = PelApi.GetUserFormGroups(links, appId, formType, pin);

    retGetUserFormGroups.then(
      //--- SUCCESS ---//
      function () {

        retGetUserFormGroups.success(function (data, status, headers, config) {

          PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE , JSON.stringify(data));

          var stat = PelApi.GetPinCodeStatus2(data, "GetUserFormGroups");
          var pinStatus = stat.status;

          if ("Valid" === pinStatus) {

            if(data.Response.OutParams.ROW[0].DOC_NAME === null)
            {
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
              //$state.go("app.p1_appsLists");
              //config_app.IS_TOKEN_VALID = "N";
              PelApi.goHome();
            }else{
              $scope.chats = data.Response.OutParams.ROW;
              console.log($scope.chats);
              $scope.title = "";
              var rowLength = $scope.chats.length;
              if(rowLength > 0){
                $scope.title = $scope.chats[0].DOC_TYPE;
              }
              $ionicLoading.hide();
              $scope.$broadcast('scroll.refreshComplete');
            }
          } else if ("PDA" === pinStatus) {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.login();

          } else if ("InValid" === pinStatus) {

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();

          } else if ("EAI_ERROR" === pinStatus){

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(config_app.EAI_ERROR_DESC, "");

          } else if("EOL" === pinStatus){
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();
          } else if ("ERROR_CODE" === pinStatus){

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopup(stat.description, "");

          }
        });
      }
      //--- ERROR ---//
      , function (response) {
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE , "GtUserFormGroups : " + JSON.stringify(response));
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          PelApi.showPopup(config_app.getUserModuleTypesErrorMag , "");
      }
    );

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
  $scope.searchBarCreteria = function(){
    var searchText = $scope.searchText.text;
    if($scope.searchText.text !== undefined && $scope.searchText.text !== "")
    {
      list = $scope.chats;
      for(var i=0 ; i< list.length ; i++){
        var sCount = 0;
        for(var j=0 ; j< list[i].DOCUMENTS.DOCUMENTS_ROW.length ; j++ ){
          var owner = list[i].DOCUMENTS.DOCUMENTS_ROW[j].MESSAGE;
          var n = owner.indexOf(searchText);
          if(-1 !== n){
            sCount ++;
          }
        }
        $scope.chats[i].FORM_QTY = sCount;
      }
    }
    else{
      for(var i=0 ; i< list.length ; i++){
        var sCount = list[i].DOCUMENTS.DOCUMENTS_ROW.length;
        $scope.chats[i].FORM_QTY = sCount;
      }
    }
  };//

  $scope.fix_json = function( data ){
    /*
    var newData = JSON.parse( data.Response.OutParams.Result );
    var myJSON = newData.JSON[0];
    newData = myJSON;
    */
    var newData = {};
    var myJSON = {};

    if( data.Response.OutParams.Result === undefined)
    {
      data.Response.OutParams.Result = {};
    }else{
      newData = JSON.parse( data.Response.OutParams.Result );
      myJSON = newData.JSON[0];

      if(myJSON.DOC_LINES.length === undefined){
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
  $scope.forwardToDoc = function(docId , docInitId){
    //var appId = $stateParams.AppId;
    var appId = config_app.appId;
    var statePath = 'app.doc_' + docId;

    PelApi.showLoading();

    var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");

    var retGetUserNotifications = PelApi.GetUserNotifications(links, appId, docId, docInitId);
    retGetUserNotifications.then(
      //--- SUCCESS ---//
      function () {
        retGetUserNotifications.success(function (data, status, headers, config) {
          data = $scope.fix_json(data)

          console.log("============= Get User Notification ===============");
          console.log(JSON.stringify(data));
          console.log("============= End Get User Notification ===============");

          var stat = PelApi.GetPinCodeStatus2(data, "GetUserNotifNew");
          var pinStatus = stat.status;

          if ("Valid" === pinStatus) {

            PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE , JSON.stringify(data));


            var newData = data.Response.OutParams.Result;

            config_app.docDetails = newData;

            var buttonsLength = 0;

            if (config_app.docDetails.BUTTONS.length !== undefined){
              buttonsLength = config_app.docDetails.BUTTONS.length;
            }

            if(2 === buttonsLength) {
              config_app.ApprovRejectBtnDisplay = true;
            }else{
              config_app.ApprovRejectBtnDisplay = false;
            }

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');

            $state.go(statePath, {"AppId": appId, "DocId": docId, "DocInitId": docInitId});

          } else if ("PDA" === pinStatus) {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.login();

          } else if ("InValid" === pinStatus) {

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            //$state.go("app.p1_appsLists");
            config_app.IS_TOKEN_VALID = "N";
            PelApi.goHome();

          } else if("EOL" === pinStatus){
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

          } else if("OLD" === pinStatus){

            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
            PelApi.showPopupVersionUpdate(data.StatusDesc , "");

          }
        });
      }
      //--- ERROR ---//
      , function (response) {
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE , "GetUserNotifNew : " + JSON.stringify( response ));
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          PelApi.showPopup(config_app.getUserModuleTypesErrorMag , "");
      }
    );
  } // forwardToDoc

  $scope.feed = [];
  $scope.searchText = {};
  $scope.doRefresh();

});
