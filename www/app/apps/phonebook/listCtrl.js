/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  .controller('phonebookListCtrl', function($scope, ApiService, StorageService, $stateParams, $ionicLoading, $state, PelApi, Contact, $ionicPopup, $ionicModal) {

    var AppId = $stateParams.AppId;
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
      $scope.searchResult = []
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
      $scope.sectors = StorageService.get("phonebook_sectors");
      if (!$scope.sectors)
        ApiService.post("PhonebookGetSector", AppId)
        .success((data, status, headers, config) => {

          $scope.sectors = data;
          $scope.sectors = StorageService.set("phonebook_sectors", data, 60 * 60 * 3)
        })
        .error((errorStr, httpStatus, headers, config) => {})
    }

    $scope.getSectors();

    $scope.search = function() {
      PelApi.showLoading();
      $scope.title = "אלפון - תוצאות חיפוש"
      ApiService.post("PhonebookSearch", AppId, {
          p1: $scope.formData.term,
          p2: $scope.formData.sectorId
        })
        .success((data, status, headers, config) => {

          $scope.searchResult = data;
          $scope.page = 'result';
        })
        .error((errorStr, httpStatus, headers, config) => {})
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