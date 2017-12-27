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

      $scope.searchContacts = function() {
        if ($scope.searchForm.term.length < 2) {
          $scope.contatcsList = [];
          return false;
        }

        Contact.find($scope.searchForm.term, ['displayName', 'name'], ['displayName', 'photos', 'lastName', 'firstName'], true).then(res => {
          $scope.contatcsList = res;
        });

      }


      $scope.swalContact = function(c) {

        swal({
          //title: '<i>HTML</i> <u>example</u>',
          //type: 'info',
          html: 'האם לשמור איש קשר זה במכשירכם ?',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: ' חדש',
          confirmButtonAriaLabel: 'Thumbs up, great!',
          cancelButtonText: 'קיים',
          cancelButtonAriaLabel: 'Thumbs down',
        }).then((btn) => {

          if (btn.value) {
            $scope.addContact(c)
          } else if (btn.dismiss === 'cancel') {
            $scope.$apply(() => {
              $scope.view = "newContact";
            })
          }
        })
        /*swal({
          text: "האם לשמור את איש הקשר במכשירכם ?",
          buttons: {
            "cancel": {
              text: "ביטול",
              value: "cancel",
              visible: true
            },
            approve: {
              text: "איש קשר חדש",
              value: "new",
            },
            exists: {
              text: "איש קשר קיים",
              value: "exists",
            }
          }
        })
        .then((value) => {
          if (value === 'ok')
            $scope.addContact(c)
        });
        */
      }


      $scope.actions = function(group, contact, orgTree) {
        console.log(contact)
        var swal_str = ""
        if (group === "members_tree") {
          swal_str = "הוסף רשימת " + contact.orgName
        }
        if (group === "manager_tree") {
          swal_str = "הוסף רשימת " + contact.orgName
        }
        swal({
            text: swal_str,
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
              $scope.addGroup(group, contact, orgTree)
          });
      }

      $scope.addGroup = function(group, contact, orgTree) {
        var options = new ContactFindOptions();
        options.filter = PelApi.appSettings.config.contactIdPrefix;
        options.multiple = true;
        options.desiredFields = [navigator.contacts.fieldType.id];
        options.hasPhoneNumber = true;
        var fields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name, navigator.contacts.fieldType.id];
        navigator.contacts.find(fields, (res) => {
          res.forEach((con) => {
            con.remove(() => {}, () => {});
          })
          console.table(res)
        }, () => {}, options);

        var relation = ""
        if (group === "members_tree") {
          relation = "managed";
          orgTree.forEach((c) => {
            if (c.relation === relation || c.personId == contact.personId)
              $scope.addContact(c);
          })
        }
        if (group === "manager_tree") {
          orgTree.forEach((c) => {
            var prms = $scope.addContact(c);
            console.log(prms)

          })
        }

        swal({
          title: "אנשי הקשר שבחרת נשמרו במכשירך",
          icon: "success",
        });
      }

      $scope.addContact = function(c, id) {
        if (id !== undefined) {
          c.id = id;
        }
        Contact.save(c).then((res) => {
          swal({
            type: 'success',
            title: 'איש הקשר נשמר במכשירכם',
            showConfirmButton: false,
            timer: 1500
          })
        }).
        catch((err) => {
          swal({
            text: "! התרחשה שגיאה" + JSON.stringify(err),
            icon: "error",
            timer: 2000
          });
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
      $scope.setTargetContact = function(cid) {
        $scope.targetContactId = cid;
      }
      $scope.getContact = function() {
        ApiService.post("PhonebookDetails", appId, {
            p1: personId
          })
          .success((data, status, headers, config) => {
            $scope.contact = data;
            $scope.title = "פרטי עובד: " + $scope.contact.firstName + " " + $scope.contact.lastName;

            $scope.page = 'result';
            $scope.contact.tree = $scope.getTreeData($scope.contact)
          })
          .error((errorStr, httpStatus, headers, config) => {
            swal({
              text: "! התרחשה שגיאה" + errorStr,
              icon: "error",
              timer: 2000
            });
          })
      }
      $scope.getContact();

    }
  ]);