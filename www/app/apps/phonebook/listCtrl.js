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

      } else {
        ApiService.post("PhonebookGetSector", AppId)
          .success(function(data, status, headers, config) {
            var result = ApiService.checkResponse(data, status)
            $scope.sectors = result.sectors;
            $scope.operunits = result.operunits;
            StorageService.set("phonebook_sectors", result, 60 * 60 * 3)
          })
          .error(function(errorStr, httpStatus, headers, config) {
            ApiService.checkResponse({
              error: errorStr
            }, httpStatus);
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
          //  $scope.hint = "יש להזין לפחות שתי אותיות"
          $scope.searchResult = $scope.searchResult || {};
          $scope.searchResult.isFound = null
        }
      })

    });

    $scope.$watch('formData.sector', function() {
      $scope.newSearch = true
      safeApply($scope, function() {
        $scope.hint = "";
        if ($scope.formData.term.length < 2) {
          //  $scope.hint = "יש להזין לפחות שתי אותיות"
          $scope.searchResult = $scope.searchResult || {};
          $scope.searchResult.isFound = null
        }
      })
    });


    $scope.swalContact = function(c) {
      c.company = "פלאפון תקשורת"

      swal({
        target: "#swal-target",
        html: '<div>' + 'האם לשמור איש קשר זה במכשירכם ? ' + '</div>' +
          '<div class="alert">' + "שים לב, איש הקשר ישמר בנייד כאיש קשר חדש" + '</div>',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'שמירה',
        confirmButtonAriaLabel: 'Thumbs up, great!',
        cancelButtonText: 'ביטול',
        cancelButtonAriaLabel: 'Thumbs down',
      }).then(function(btn) {

        if (btn.value) {
          $scope.addContact(c)
        }
      })
    }

    $scope.addContact = function(c) {
      var deviceContact = Contact.newContact();
      deviceContact = Contact.setContactData(deviceContact, c);
      deviceContact.save(function(result) {
        swal({
          type: 'success',
          title: 'איש הקשר נשמר במכשירכם',
          showConfirmButton: false,
          timer: 1500
        })
      }, function(err) {
        swal({
          text: "שגיאה בניסיון לשמור איש קשר",
          type: "error",
          timer: 1500
        });
        PelApi.throwError("app", "saveContact on phonebookDetails", JSON.stringify(err));
      })

    }


    $scope.search = function() {

      var cursor = _.get($scope.searchResult, "cursor", {});
      var quantity = cursor.quantity || 0;
      var offset = cursor.offset || null;
      if ($scope.formData.term.length < 2) {
        $scope.hint = "יש להזין לפחות שתי אותיות"
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
        .success(function(data, status, headers, config) {
          var result = ApiService.checkResponse(data, status)
          $scope.searchResult.cursor = result;
          $scope.searchResult.list = _.concat($scope.searchResult.list, result.list);
          $scope.searchResult.isFound = !(!result.list.length);
          $scope.page = 'result';
          if (data.list && !result.list.length) {
            $scope.page = 'form';
          }
        })
        .error(function(errorStr, httpStatus, headers, config) {
          ApiService.checkResponse({
            error: errorStr
          }, httpStatus);

        })
    }

  });