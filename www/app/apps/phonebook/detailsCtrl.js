/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('phonebookDetailsCtrl', ['Contact', 'ApiService', '$state', '$scope', '$stateParams', '$ionicLoading', 'PelApi', '$ionicHistory', '$cordovaSocialSharing',
    function(Contact, ApiService, $state, $scope, $stateParams, $ionicLoading, PelApi, $ionicHistory, $cordovaSocialSharing) {
      var appId = $stateParams.AppId;
      var personId = $stateParams.personId;
      $scope.today = moment().format('DD/MM');;
      $scope.title = "אלפון";
      $scope.view = "normal";
      $scope.searchForm = {};
      console.log($stateParams)

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
          swal("success:" + JSON.stringify(result))
          swal({
            type: 'success',
            title: 'איש הקשר נשמר במכשירכם',
            showConfirmButton: false,
            timer: 1500
          })
        }, function(err) {
          swal("error:" + JSON.stringify(err))
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
            Contact.contacts.pickContact(function(contactPicked) {
              var deviceContact = Contact.newContact();
              deviceContact.id = contactPicked.id;
              $scope.saveContact(deviceContact, c)
            }, function(err) {
              // do nothing on cancelation
              if (err !== "6")
                swal({
                  text: "! התרחשה שגיאה" + JSON.stringify(err),
                  type: "error",
                  timer: 1500
                });
            })
          }
        })
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
        ApiService.post("PhonebookDetails", appId, {
            p1: personId
          })
          .success((data, status, headers, config) => {
            console.log(JSON.stringify(data))
            $scope.contact = data;
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