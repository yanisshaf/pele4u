/**
 * Created by User on 25/08/2016.
 */
angular.module('pele', ['ngFileUpload'])
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadsCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaSocialSharing', '$templateCache', 'Upload',
    function(StorageService, ApiGateway, $scope, $state, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaSocialSharing, $templateCache, Upload) {

      $scope.lead = {}
      $scope.forms = {}
      if ($state.params.lead) {
        PelApi.safeApply($scope, function() {
          $scope.lead = $state.params.lead
        })
      }

      $scope.onValueChanged = function(leadType) {

        let extraInfo = $scope.conf.extra[leadType] || [];
        console.log("$scope.conf", extraInfo)
        let idx = 1;
        extraInfo.forEach(function(e) {
          idx++;
          e.name = e.name || "ATTRIBUTE" + idx
        })
        console.log($scope.extraSchema)
        $scope.extraSchema = extraInfo;
      }

      console.log("lead in ctrl  :", $scope.lead)
      $scope.extraData = {};

      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf")

        if ($scope.conf) return;
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60)
          $scope.conf = data;
        }).error(function(err) {
          console.log(err)
        })
      }

      $scope.getConf();

      $scope.delete = function(leadId) {
        ApiGateway.delete("leads/" + leadId).success(function(data) {
          swal("ליד עצמי נמחק בהצלחה")
            .then(function(ret) {
              $state.go("app.leads.report")
            })
        }).error(function(err) {
          swal({
            text: JSON.stringify(err)
          })
          $scope.error = err;
          setTimeout(function() {
            $scope.error = ""
          }, 3000)
        })
      }

      $scope.submit = function(leadForm) {
        console.log($scope.extraData)
        $scope.submitted = true;
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
        ApiGateway.post("leads", $scope.lead).success(function(data) {
          swal("ליד נוצר בהצלחה !")
          $scope.lead = {};
          console.log(data)
        }).error(function(err) {
          swal(JSON.stringify(err))
          $scope.error = err;
          setTimeout(function() {
            $scope.error = ""
          }, 3000)
        })
      }
      $scope.title = "ליד חדש";

      $ionicModal.fromTemplateUrl('upload.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });
    }

  ]);