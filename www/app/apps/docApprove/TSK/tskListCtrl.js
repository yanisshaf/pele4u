/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  .controller('tskListCtrl', function($scope, $stateParams, $http, $q, $ionicLoading, $state, PelApi, appSettings) {
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
          g.TASK = _.get(task, "ROW.ROW", {});
        })
        mapped.push(item)
      });
      return mapped;
    }

    //----------------------- REFRESH ------------------------//
    $scope.doRefresh = function() {


      PelApi.showLoading();
      $scope.appId = $stateParams.AppId;
      $scope.formType = $stateParams.FormType;
      $state.pin = $stateParams.Pin;

      var links = PelApi.getDocApproveServiceUrl("GtUserFormGroups");

      var retGetUserFormGroups = PelApi.GetUserFormGroups(links, $scope.appId, $scope.formType, $state.pin);

      retGetUserFormGroups.success(function(data) {
          var apiData = PelApi.checkApiResponse(data);
          PelApi.lagger.info(JSON.stringify(apiData));
          var result = apiData.ROW || [];

          if (result.length && result[0].DOC_NAME === null)
            $state.go("app.error", {
              category: "help_us",
              description: "maof retreived : DOC_NAME is NULL"
            });
          $scope.docsGroups = $scope.parse(result);
          if ($scope.docsGroups.length) {
            $scope.title = $scope.docsGroups[0].DOC_TYPE;
          }
        })
        .error(function(error) {
          PelApi.lagger.error("GetUserNotifNew : " + JSON.stringify(error));
          PelApi.showPopup(appSettings.config.getUserModuleTypesErrorMag, "");
        })
        .finally(function() {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });

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
    };

    //--------------------------------------------------------------
    //-- When        Who         Description
    //-- ----------  ----------  -----------------------------------
    //-- 01/11/2015  R.W.        function forward to page by DOC_ID
    //--------------------------------------------------------------
    $scope.forwardToDoc = function(docId, docInitId) {

      var statePath = 'app.tsk_details';

      $state.go(statePath, {
        formType: $scope.formType,
        appId: $scope.appId,
        docId: docId,
        docInitId: docInitId
      });
    } // forwardToDoc

    $scope.feed = [];
    $scope.searchText = {};
    $scope.doRefresh();

  });
