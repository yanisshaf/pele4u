/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('phonebookDetailsCtrl', ['Contact', 'ApiService', '$state', '$rootScope', '$scope', '$stateParams', '$ionicLoading', 'PelApi', '$ionicHistory', '$cordovaSocialSharing',
    function(Contact, ApiService, $state, $rootScope, $scope, $stateParams, $ionicLoading, PelApi, $ionicHistory, $cordovaSocialSharing) {
      var appId = $stateParams.AppId;
      var personId = $stateParams.personId;
      $scope.today = moment().format('DD/MM');;
      $scope.title = "אלפון";
      $scope.view = "normal";
      $scope.searchForm = {};
      $scope.targetContactId = "";

      function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn(): scope.$apply(fn);
      }

      $scope.setTargetContact = function(id) {
        safeApply($scope, function() {
          $scope.targetContactId = id;
        })
      }

      $scope.goSearchForm = function() {
        $state.go("app.phonebook", {
          AppId: appId
        }, {
          reload: true
        })
      }


      $scope.saveContact = function(c, info) {
        var deviceContact = c;
        deviceContact = Contact.setContactData(deviceContact, info);
        deviceContact.save(function(result) {
          swal({
            type: 'success',
            title: 'איש הקשר נשמר במכשירכם',
            showConfirmButton: false,
            timer: 1500
          })
          safeApply($scope, function() {
            $scope.view = 'Contact'
          })
        }, function(err) {
          swal({
            text: "! התרחשה שגיאה" + JSON.stringify(err),
            type: "error",
            timer: 1500
          });
        })
      }

      $scope.swalContact = function(c) {
        swal({
          html: 'האם לשמור איש קשר זה במכשירכם ?',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: ' חדש',
          confirmButtonAriaLabel: 'Thumbs up, great!',
          cancelButtonText: 'עדכון קיים',
          cancelButtonAriaLabel: 'Thumbs down',
        }).then(btn => {
          if (btn.value) {
            var targetContact = Contact.setContactData(Contact.newContact(), c);
            $scope.saveContact(targetContact, c)
          } else if (btn.dismiss === 'cancel') {

            if (ionic.Platform.isIOS()) {
              Contact.contacts.pickContact(function(contactPicked) {
                $scope.saveContact(contactPicked, c)
              })
            } else {
              safeApply($scope, function() {
                $scope.view = 'newContact'
              })
            }
          }
        })
      }

      $scope.searchOnDeviceContacts = function() {
        if (!$scope.searchForm.term) {
          $scope.contatcsList = []
          return true;
        }
        Contact.find($scope.searchForm.term).then((res) => {
          safeApply($scope, () => {
            $scope.contatcsList = res
          })
        }).catch(err => {})
      }

      $scope.shareViaEmail = function(email) {
        $cordovaSocialSharing.shareViaEmail(null, null, [email]);
      }

      $scope.shareViaSMS = function(mobilePhone) {

        $cordovaSocialSharing.shareViaSMS(null, mobilePhone);

      }

      $scope.shareViaWhatsAppToReceiver = function(mobilePhone) {
        $cordovaSocialSharing.shareViaWhatsAppToReceiver(mobilePhone)
        $cordovaSocialSharing.shareViaWhatsAppToReceiver(100)
      }

      $scope.shareViaWhatsApp = function() {
        alert('shareViaWhatsApp')
        $cordovaSocialSharing.shareViaWhatsApp()
      }

      $scope.empPic = function(base64String) {
        return "data:image/jpg;" + base64String;
      }

      $scope.managerInfo = {}

      $scope.getTreeData = function(person) {
        var tree = {};

        person.orgTree.forEach(function(c) {

          if (c.personId == person.directManagerNumber) {
            $scope.managerInfo = c;
            return false;
          }
          tree[c.directManagerNumber] = tree[c.directManagerNumber] || {};
          tree[c.directManagerNumber].members = tree[c.directManagerNumber].members || [];

          if (person.personId == c.directManagerNumber)
            tree[person.personId].members.push(c)
          else
            tree[c.personId] = c;
        })
        return tree;

      }

      $scope.getContact = function() {
        PelApi.showLoading();
        ApiService.post("PhonebookDetails", appId, {
            p1: personId
          })
          .success((data, status, headers, config) => {

            $scope.contact = data;

            if (!$scope.contact.section.match(/no\s+sector/))
              $scope.contact.has_section = true;
            if (!$scope.contact.department.match(/no\s+sector/))
              $scope.contact.has_department = true;
            if (!$scope.contact.team.match(/no\s+sector/))
              $scope.contact.has_team = true;
            if (!$scope.contact.sector.match(/no\s+sector/))
              $scope.contact.has_sector = true;

            $scope.title = "פרטי עובד: " + $scope.contact.firstName + " " + $scope.contact.lastName;

            $scope.page = 'result';
            $scope.contact.tree = $scope.getTreeData($scope.contact)
          })
          .error((errorStr, httpStatus, headers, config) => {
            swal({
              text: "! התרחשה שגיאה" + errorStr,
              type: "error",
              timer: 2000
            });
          })
      }
      $scope.getContact();

    }
  ]);