/**
 * Created by User on 25/08/2016.
 */
angular.module('pele', ['ngFileUpload', 'ngSanitize'])
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaSocialSharing', '$templateCache', 'Upload',
    function(StorageService, ApiGateway, $scope, $state, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaSocialSharing, $templateCache, Upload) {

      $scope.lead = {
        extra: {}
      }

      $scope.forms = {}
      $scope.getNext = function() {
        var refStamp = new Date().getTime();
        ApiGateway.get("leads/getnext?" + refStamp).success(function(data) {
          $scope.lead.LEAD_ID = data.VAL;
          $scope.lead.FORM_TYPE = $state.params.type; //Draft

        }).error(function() {})
      }

      if ($state.params.lead && $state.params.lead.LEAD_ID) {
        PelApi.safeApply($scope, function() {
          $scope.lead = $state.params.lead
        })
      } else {
        if ($state.params.type === 'S') {
          $scope.lead.FORM_TYPE = 'S'; //Draft
          $scope.title = "פתיחת ליד עצמי";
        } else {
          $scope.lead.FORM_TYPE = 'T'; //Draft
          $scope.title = "פתיחת ליד לשגרירים";
        }
        $scope.getNext();
      }

      $scope.onValueChanged = function(leadType) {
        console.log(leadType)
        let extraInfo = _.get($scope, 'typesByFormType[' + leadType + '].SETUP.attrs', []);
        $scope.extraSchema = extraInfo;
      }


      console.log("lead in ctrl  :", $scope.lead)
      $scope.extraData = {};

      $scope.getRelevantLeadsType = function(types) {
        $scope.typesByFormType = {};
        types.forEach(function(t) {
          if ($scope.lead.FORM_TYPE === t.FORM_TYPE)
            $scope.typesByFormType[t.TYPE] = t
        })
        console.log('  $scope.typesByFormType:', $scope.typesByFormType)
      }

      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf", {})
        console.log($scope.conf)
        if ($scope.conf.types) {
          $scope.getRelevantLeadsType($scope.conf.types)
          return;
        }
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 60)
          $scope.conf = data;
          $scope.getRelevantLeadsType($scope.conf.types)
          console.log(data)

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
        console.log($scope.lead)

        if (leadForm.$invalid) {
          swal({
            text: "נתוני טופס לא תקינים",
            confirmButtonText: 'אישור'
          }).then(function(ret) {
            console.log("leadForm:", leadForm)
          })
          return false;
        }

        ApiGateway.post("leads", $scope.lead).success(function(data) {
          swal({
            text: "ליד נוצר בהצלחה",
            confirmButtonText: 'אישור'
          }).then(function(ret) {
            $scope.lead = {};
            $ionicHistory.goBack();
          })
          $scope.lead = {};
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

      $scope.setMinDate = function(e) {
        if (e.min) return e.min;
        if (e.minus_days)
          return moment().subtract(e.minus_days, "days").format("YYYY-MM-DD");
      }
      $scope.setMaxDate = function(e) {
        if (e.max) return e.min;
        if (e.plus_days)
          return moment().add(e.plus_days, "days").format("YYYY-MM-DD");
      }
    }

  ]);