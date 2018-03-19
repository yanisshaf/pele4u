/**
 * Created by User on 25/08/2016.
 */
angular.module('pele', ['formFor', 'formFor.defaultTemplates', 'ionic-timepicker'])
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadsCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaSocialSharing', '$templateCache',
    function(StorageService, ApiGateway, $scope, $state, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaSocialSharing, $templateCache) {
      let vm = this;
      vm.lead = {}
      vm.forms = {}
      if ($state.params.lead) {
        PelApi.safeApply($scope, function() {
          vm.lead = $state.params.lead
        })
      }


      function timePickerCallback(val) {
        if (typeof(val) === 'undefined') {
          console.log('Time not selected');
        } else {
          var selectedTime = new Date(val * 1000);
          console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
        }
      }


      vm.timePickerObject = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60), //Optional
        step: 15, //Optional
        format: 12, //Optional
        titleLabel: '12-hour Format', //Optional
        setLabel: 'Set', //Optional
        closeLabel: 'Close', //Optional
        setButtonType: 'button-positive', //Optional
        closeButtonType: 'button-stable', //Optional
        callback: function(val) { //Mandatory
          timePickerCallback(val);
        }
      };

      vm.onValueChanged = function(leadType) {
        console.log("vm.conf", vm.conf)
        vm.extraSchema = vm.conf.extra[leadType]
      }

      console.log("lead in ctrl  :", vm.lead)
      vm.extraData = {};

      vm.getConf = function() {
        vm.conf = StorageService.getData("leads_conf")

        if (vm.conf) return;
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60)
          vm.conf = data;
        }).error(function(err) {
          console.log(err)
        })
      }

      vm.getConf();

      vm.delete = function(leadId) {
        ApiGateway.delete("leads/" + leadId).success(function(data) {
          swal("ליד עצמי נמחק בהצלחה")
            .then(function(ret) {
              $state.go("app.leads.report")
            })
        }).error(function(err) {
          swal({
            text: JSON.stringify(err)
          })
          vm.error = err;
          setTimeout(function() {
            vm.error = ""
          }, 3000)
        })
      }

      vm.submit = function(leadForm) {
        console.log(vm.extraData)
        vm.submitted = true;
        if (leadForm.$invalid) {
          swal({
            text: "נתוני טופס לא תקינים",
            confirmButtonText: 'אישור'
          }).then(function(ret) {
            console.log(ret)
            console.log("leadForm:", leadForm)
          })
          return false;
        }
        ApiGateway.post("leads", vm.lead).success(function(data) {
          swal("ליד נוצר בהצלחה !")
          vm.lead = {};
          console.log(data)
        }).error(function(err) {
          swal(JSON.stringify(err))
          vm.error = err;
          setTimeout(function() {
            vm.error = ""
          }, 3000)
        })
      }
      vm.title = "ליד חדש";
    }
  ]);