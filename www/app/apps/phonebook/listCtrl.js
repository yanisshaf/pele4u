/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  .controller('phonebookListCtrl', function($scope, ApiService, StorageService, $stateParams, $ionicLoading, $state, PelApi, Contact, $ionicPopup, $ionicModal) {

    var AppId = $stateParams.AppId;

    function safeApply(scope, fn) {
      (scope.$$phase || scope.$root.$$phase) ? fn(): scope.$apply(fn);
    }
    $scope.formData = {
      term: "",
      sectorId: ""
    };
    $scope.modals = {
      operunits: {},

    }

    $scope.title = "אלפון"
    $scope.goHome = function() {
      PelApi.goHome();
    }
    $scope.page = 'form'

    $scope.setForm = function() {
      $scope.page = "form"
      $scope.searchResult = {
        cursor: {},
        list: []
      }
      $scope.modals.operunits.hide();

    }
    $scope.goBack = function() {

      $state.go("app.phonebook", {}, {
        reload: true
      })
    }


    $ionicModal.fromTemplateUrl('operunits.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modals.operunits = modal;
    });

    $scope.options = {
      loop: false,
      effect: 'fade',
      speed: 500,
      pagination: false,
      direction: 'vertical'
    }



    $scope.useful = [{
        displayName: "מוקד התפעול",
        phoneNumber: "050-707-8990"
      },
      {
        displayName: "חדר דואר",
        phoneNumber: "050-707-8863"
      },
      {
        displayName: "מרכזיה",
        phoneNumber: "050-707-8888"
      },
      {
        displayName: "לובי",
        phoneNumber: "050-707-8181"
      },
      {
        displayName: "מוקד ביטחון",
        phoneNumber: "050-707-8501"
      },
    ]

    $scope.sectors = [];
    $scope.getSectors = function() {
      var cacheData = _.get(StorageService.get("phonebook_sectors"), "data", null);
      if (cacheData) {
        $scope.sectors = cacheData.sectors;
        $scope.operunits = cacheData.operunits;
        console.log(cacheData)
      } else {
        ApiService.post("PhonebookGetSector", AppId)
          .success((data, status, headers, config) => {
            $scope.sectors = data.sectors;
            $scope.operunits = data.operunits;
            $scope.sectors = StorageService.set("phonebook_sectors", data, 60 * 60 * 3)
          })
          .error((errorStr, httpStatus, headers, config) => {
            swal(errorStr + ":" + httpStatus)
          })
      }
    }

    $scope.getSectors();
    $scope.newSearch = false;
    $scope.$watch('formData.term', function() {
      $scope.newSearch = true
      safeApply($scope, function() {
        $scope.hint = "";
        if ($scope.formData.term.length < 2) {
          $scope.hint = "יש להזין לפחות שתי אותיות"
          $scope.searchResult.isFound = null
        }
      })

    });

    $scope.$watch('formData.sector', function() {
      $scope.newSearch = true
      safeApply($scope, function() {
        $scope.hint = "";
        if ($scope.formData.term.length < 2) {
          $scope.hint = "יש להזין לפחות שתי אותיות"
          $scope.searchResult.isFound = null
        }
      })
    });

    $scope.search = function() {

      var cursor = _.get($scope.searchResult, "cursor", {});
      var quantity = cursor.quantity || 0;
      var offset = cursor.offset || null;
      if ($scope.formData.term.length < 2) {
        return false;
      }

      if ($scope.newSearch) {
        $scope.newSearch = false;
        $scope.searchResult = {
          cursor: {},
          list: []
        };
      }
      $scope.searchResult.isFound = null;
      PelApi.showLoading();
      $scope.title = "אלפון - תוצאות חיפוש"
      ApiService.post("PhonebookSearch", AppId, {
          p1: $scope.formData.term,
          p2: $scope.formData.sectorId,
          p3: offset
        })
        .success((data, status, headers, config) => {
          $scope.searchResult.cursor = data.cursor;
          console.log(data.list);
          $scope.searchResult.list = _.concat($scope.searchResult.list, data.list);

          $scope.searchResult.isFound = !(!data.list.length);

          console.log($scope.searchResult);
          $scope.page = 'result';
          if (data.list && !data.list.length) {
            $scope.page = 'form';
          }
        })
        .error((errorStr, httpStatus, headers, config) => {
          swal(errorStr + ":" + httpStatus)
        })
    }



    $scope.addContact = function(c) {
      Contact.save(c, PelApi.appSettings.config.contactIdPrefix).then((res) => {
        swal({
          text: "! איש הקשר   עודכן במכשירך",
          icon: "success",
          button: "סגור!",
        });
      }).
      catch((err) => {
        swal({
          text: "! התרחשה שגיאה" + JSON.stringify(err),
          icon: "error",
          timer: 2000
        });
      })
    }

    $scope.swalContact = function(c) {
      swal({
          text: "האם לשמור את איש הקשר במכשירכם ?",
          buttons: {
            "cancel": {
              text: "ביטול",
              value: "cancel",
              visible: true
            },
            approve: {
              text: "אישור",
              value: "ok",
            }
          }
        })
        .then((value) => {
          if (value === 'ok')
            $scope.addContact(c)
        });
    }



  });