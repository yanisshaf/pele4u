/**
 * Created by User on 25/08/2016.
 */
angular.module('pele', ['ngSanitize'])
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicModal', 'PelApi', '$ionicScrollDelegate', '$sce', '$compile',
    function(StorageService, ApiGateway, $scope, $state, $ionicModal, PelApi, $ionicScrollDelegate, $sce, $compile) {

      $scope.forms = {}

      $scope.uploadState = {
        progress: 0
      };

      $scope.takePic = function(sourceType) {
        PelApi.safeApply($scope, function() {
          $scope.imageUri = "";
        });

        var options = {
          quality: 100,
          encodingType: Camera.EncodingType.JPEG,
          sourceType: Camera.PictureSourceType.CAMERA,
          encodingType: Camera.EncodingType.JPEG,
          destinationType: Camera.DestinationType.FILE_URI,
          targetWidth: 794,
          targetHeight: 1122,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };

        if (sourceType === 'CAMERA') {
          options.sourceType = Camera.PictureSourceType.CAMERA;
        } else {
          options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        }

        navigator.camera.getPicture(function(imageUri) {

          if (PelApi.isAndroid) {
            window.FilePath.resolveNativePath(imageUri, function(path) {
              PelApi.safeApply($scope, function() {
                $scope.imageUri = path;
              });
            }, function(err) {

            });
          } else {
            PelApi.safeApply($scope, function() {
              $scope.imageUri = imageUri;
            });
          }

        }, function(err) {
          console.log("takePic err:", err)
        }, options);

        return true;
      }

      $scope.lead = {
        extra: {}
      }


      function getHHRange(start, end, interval) {
        return _.range(start, end, interval).map(function(e) {
          var hh = "0" + e.toString().replace(/\./, ":").replace(/:\d+/, ":30");
          return (hh.match(":") ? hh : hh + ":00").replace(/0(\d\d)/, '$1');
        })
      }

      function toNumber(hhstr) {
        return _.toNumber(hhstr.replace(":30", ".5").replace(":00", ""));
      }

      $scope.from_hour_range = getHHRange(9, 17, 0.5);
      $scope.to_hour_range = getHHRange(9.5, 17.5, 0.5);

      $scope.recreateEndHour = function() {
        $scope.to_hour_range = getHHRange(toNumber($scope.lead.from_hour) + 0.5, 17.5, 0.5);
      }

      $scope.onValueChanged = function(leadType) {
        var extraInfo = _.get($scope, 'typesByFormType[' + leadType + '].SETUP.attrs', []);
        $scope.extraSchema = extraInfo;
        setDynamicValidation($scope.extraSchema)
      }



      $scope.getNext = function() {
        var refStamp = new Date().getTime();
        ApiGateway.get("leads/getnext?" + refStamp).success(function(data) {
          $scope.lead.LEAD_ID = data.VAL;
          $scope.lead.FORM_TYPE = $state.params.type; //Draft
        }).error(function(error, httpStatus, headers, config) {
          PelApi.throwError("api", "get new Lead seq", "httpStatus : " + httpStatus + " " + JSON.stringify(error))
        })
      }

      if ($state.params.lead && $state.params.lead.LEAD_ID) {
        PelApi.safeApply($scope, function() {
          $scope.lead = $state.params.lead;
          var found = $scope.lead.PREFERRED_HOURS.replace(/\s+/g, "").match(/(.+)-(.+)/);
          $scope.files = $scope.lead.files;
          $scope.lead.from_hour = found[1];
          $scope.lead.to_hour = found[2];
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

      $scope.trust = function(html) {
        return $sce.trustAsHtml(html);
      }

      $scope.openLink = function(e) {
        window.open(e.link, "_system")
      }

      function setDynamicValidation(varr) {
        $scope.uploadRequired = false
        $scope.uploadIsExists = false;
        $scope.files = [];
        varr.forEach(function(v) {
          if (v.type === "date") {

          }
          if (v.type === "upload") {
            $scope.uploadIsExists = true;
            $scope.uploadRequired = v.required
          }
          if (v.type === "checkbox") {
            v.trueValue = v.trueValue || 1;
            v.falseValue = v.falseValue || 0;
          }
          if (v.type === "date") {
            v = $scope.setValidationDate(v)
          }
        })
      }

      $scope.display = function(e) {
        e.show = "true"
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

        }).error(function(error, httpStatus, headers, config) {
          PelApi.throwError("api", "get Leads conf table", "httpStatus : " + httpStatus + " " + JSON.stringify(error))
        })
      }

      $scope.getConf();




      $scope.delete = function(leadId) {
        ApiGateway.delete("leads/" + leadId).success(function(data) {
          swal("ליד עצמי נמחק בהצלחה")
            .then(function(ret) {
              $state.go("app.leads.report")
            })
        }).error(function(error, httpStatus, headers, config) {
          PelApi.throwError("api", "delete lead by id ", "httpStatus : " + httpStatus + " " + JSON.stringify(error), false)
        })
      }

      $scope.submit = function() {

        $scope.submitted = true;
        $scope.lead.TASK_LEVEL = _.get($scope.typesByFormType, $scope.lead.LEAD_TYPE + ".TASK_LEVEL");
        $scope.lead.TASK_FOLLOWUP_TYPE = _.get($scope.typesByFormType, $scope.lead.LEAD_TYPE + ".TASK_FOLLOWUP_TYPE");
        $scope.lead.RESOURCE_TYPE = _.get($scope.typesByFormType, $scope.lead.LEAD_TYPE + ".RESOURCE_TYPE");
        $scope.lead.RESOURCE_VALUE = _.get($scope.typesByFormType, $scope.lead.LEAD_TYPE + ".RESOURCE_VALUE");
        $scope.lead.PREFERRED_HOURS = $scope.lead.from_hour + " - " + $scope.lead.to_hour

        if ($scope.forms.leadForm.$invalid || !$scope.lead.LEAD_TYPE) {
          return false;
        }
        PelApi.showLoading();
        ApiGateway.post("leads", $scope.lead).success(function(data) {
          $scope.leadSuccess = true;
          $scope.lead = {};
        }).error(function(error, httpStatus, headers, config) {
          PelApi.throwError("api", "Post new lead", "httpStatus : " + httpStatus + " " + JSON.stringify(error))
        }).finally(function() {
          PelApi.hideLoading();
        })
      }




      $scope.uploadFile = function() {
        var picFile = $scope.imageUri;

        $scope.uploadState = {
          progress: 0
        }

        function fileUploadSuccess(r) {
          PelApi.safeApply($scope, function() {
            $scope.uploadState.progress = 100;
            $scope.uploadState.success = true;
            $scope.uploadState.error = false;
            PelApi.hideLoading();
            $scope.imageUri = "";
            $scope.imageTitle = "";
            $scope.files.push({
              uri: $scope.imageUri,
              title: $scope.imageTitle
            })
          });
        }

        function fileUploadFailure(error) {
          PelApi.throwError("api", "upload doc", JSON.stringify(error), false);
          $scope.uploadState.progress = 100;
          $scope.uploadState.error = true;
          PelApi.hideLoading();
        }

        var uri = encodeURI(ApiGateway.getUrl("leads/upload/" + $scope.lead.LEAD_ID));
        var options = new FileUploadOptions();
        var params = {};
        params.file = picFile;
        params.title = $scope.imageTitle;

        options.params = params;
        options.chunkedMode = false;
        var headers = ApiGateway.getHeaders();
        options.headers = headers;

        var ft = new FileTransfer();

        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
            $scope.uploadState.progress = progressEvent.loaded / (progressEvent.total + 1);
          } else {
            $scope.increment++;
          }
        };

        PelApi.showLoading();
        ft.upload(picFile, uri, fileUploadSuccess, fileUploadFailure, options, true);
      }


      $ionicModal.fromTemplateUrl('upload.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      }).catch(function(err) {
        console.log(err)
      });
      $scope.openModal = function() {
        $ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);
        PelApi.safeApply($scope, function() {
          $scope.imageUri = "";
          $scope.uploadState = {
            progress: 0
          };
        });
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


      $scope.setValidationDate = function(e) {
        if (e.min) e.computedMin = e.min;
        if (e.minus_days || e.minus_days === 0) {
          e.computedMin = moment().subtract(e.minus_days, "days").format("YYYY-MM-DD");
        }
        if (e.max) e.computedMax = e.max;
        if (e.plus_days) {
          e.computedMax = moment().add(e.plus_days, "days").format("YYYY-MM-DD");
        }
        return e;
      }

    }
  ]);