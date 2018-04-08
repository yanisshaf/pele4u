/**
 * Created by User on 25/08/2016.
 */
angular.module('pele', ['ngFileUpload', 'ngSanitize'])
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaCamera', '$templateCache', 'Upload',
    function(StorageService, ApiGateway, $scope, $state, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaCamera, $templateCache, Upload) {

      /* var uploadPhotoOptions = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL, //FILE_URI, NATIVE_URI, or DATA_URL. DATA_URL could produce memory issues.
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        encodingType: Camera.EncodingType.JPEG,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        saveToPhotoAlbum: false,
      };


      uploadPhotoOptions.sourceType = Camera.PictureSourceType.CAMERA;
      //    uploadPhotoOptions.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
      function takePictureSuccess(success) {
        vm.userProfile.image = "data:image/jpeg;base64," + success; //this is how I store the image to firebase
      };

      function takePictureError(error) {
        $ionicPopup.alert({
          title: 'Photo Error',
          template: error,
        });
      };
      */

      $scope.takePic = function(sourceType) {
        var options = {
          quality: 50,
          encodingType: Camera.EncodingType.JPEG,
          sourceType: Camera.PictureSourceType.CAMERA,
          encodingType: 0,
          destinationType: Camera.DestinationType.NATIVE_URI,
          saveToPhotoAlbum: true

        };

        if (sourceType === 'CAMERA') {
          options.sourceType = Camera.PictureSourceType.CAMERA;
        } else {
          options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        }

        $cordovaCamera.getPicture(options).then(function(imageURI) {
          //console.log("got camera success ", imageURI);
          window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
            $scope.fileEntry = fileEntry
            $scope.imageUri = fileEntry.nativeURL;
          }, function(e) {
            $scope.fileError = e
          });

        }, function(err) {
          console.log("takePic err:", err)
        }, );

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


      console.log("$scope.from_hour_range:", $scope.from_hour_range);
      console.log("$scope.to_hour_range:", $scope.to_hour_range);


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
          $scope.lead = $state.params.lead;
          var found = $scope.lead.PREFERRED_HOURS.replace(/\s+/g, "").match(/(.+)-(.+)/);
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
        console.log("lead form errors list:", leadForm.$error)
        $scope.lead.PREFERRED_HOURS = $scope.lead.from_hour + " - " + $scope.lead.to_hour
        console.log("$scope.lead.PREFERRED_HOURS", $scope.lead.PREFERRED_HOURS)
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


      $scope.openCamera = function() {
        var srcType = navigator.camera.PictureSourceType.CAMERA;
        var options = {};
        var func = createNewFileEntry;
        navigator.camera.getPicture(function cameraSuccess(imageUri) {
          $scope.selectedFile = imageUri;
        }, function cameraError(error) {
          console.debug("Unable to obtain picture: " + error, "app");
        }, options);
      }

      $scope.openFilePicker = function() {
        var srcType = navigator.camera.PictureSourceType.SAVEDPHOTOALBUM;
        var options = {};
        var func = createNewFileEntry;
        navigator.camera.getPicture(function cameraSuccess(imageUri) {
          $scope.selectedFile = imageUri;
        }, function cameraError(error) {
          console.debug("Unable to obtain picture: " + error, "app");
        }, options);
      }


      $scope.uploadState = {};


      $scope.uploadFile = function(picFile) {
        $scope.uploadState = {
          src: picFile,
          state: "start"
        }

        picFile.upload = Upload.upload({
          url: ApiGateway.getUrl("leads/upload/" + $scope.lead.LEAD_ID),
          headers: ApiGateway.getHeaders(),
          data: {
            file: picFile
          }
        });

        picFile.upload.then(function(resp) {
          // file is uploaded successfully
          console.log('file ' + resp.config.data.file.name + 'is uploaded successfully. Response: ', resp.data);
          $scope.uploadState = {
            src: picFile,
            state: "success",
            server: resp.data
          }


        }, function(error) {
          $scope.uploadState = {
            src: picFile,
            state: "error",
            server: error
          }

        }, function(evt) {
          var percent = parseInt(100.0 * evt.loaded / evt.total);
          $scope.uploadState = {
            src: picFile,
            state: "progress",
            percent: percent
          }
        });
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