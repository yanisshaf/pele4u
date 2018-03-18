/**
 * Created by User on 25/08/2016.
 */
angular.module('pele', ['formFor', 'formFor.defaultTemplates'])
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

      vm.submit = function(leadForm) {
        console.log(vm.extraData)
        vm.submitted = true;
        if (leadForm.$invalid) {
          swal({
            text: "נתוני טופס לא תקינים",
            confirmButtonText: 'אישור'
          }).then(function(ret) {
            console.log(ret)
            console.log(leadForm)
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