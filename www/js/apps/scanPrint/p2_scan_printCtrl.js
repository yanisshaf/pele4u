/**
 * Created by User on 12/12/2016.
 */
var app = angular.module('pele.p2_scan_printCtrl', ['ngStorage']);
app.controller('p2_scan_printCtrl', function($scope, $stateParams , $cordovaBarcodeScanner, $ionicLoading , PelApi){
    //-----------------------------------------//
    //--         scanBarcode
    //-----------------------------------------//
    $scope.doRefresh = function() {

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

      PelApi.writeToLog(config_app.LOG_FILE_INFO_TYPE ,"IN p2_scan_printCtrl.scanBarcode();");
      console.log("======== in scanBarcode ==========");
      if(window.cordova != undefined){
        $cordovaBarcodeScanner.scan().then(function(imageData) {
          var printUrl = imageData.text;

          var patt = new RegExp(config_app.MSSO_PRINT_URL);
          var res = patt.test(printUrl);
          if(res) {
            var sendScanPrint = PelApi.sendScanPrint(printUrl)

            sendScanPrint.then(
              //----------------//
              //--   SUCCESS  --//
              //----------------//
              function () {
                sendScanPrint.success(function (data, status, headers, config) {
                  console.log("SUCCESS : sendScanPrint.success");
                  PelApi.goHome();
                });
              }
              //----------------//
              //--   ERROR  --//
              //----------------//
              , function (response) {
                console.log("ERROR_1 p2_scan_printCtrl.scanBarcode() :" + JSON.stringify(response));
                PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE, " 1 . p2_scan_printCtrl.scanBarcode() - " + JSON.stringify(response));
                PelApi.showPopup(config_app.interfaceErrorTitle, "");
                PelApi.goHome();

              }
            );
          }else{
            PelApi.showPopup(config_app.MSSO_PRINT_WRONG_BARCODE, "");
          }
          console.log("Barcode Format -> " + imageData.format);
          console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {

          console.log("ERROR_2 An error happened -> " + error);
          PelApi.writeToLog(config_app.LOG_FILE_ERROR_TYPE ," 2 . p2_scan_printCtrl.scanBarcode() - " + JSON.stringify(error));
          PelApi.showPopup(config_app.SCAN_PRINT_SCANNING_ERROR, "");
          PelApi.goHome();
        });
      }
    };

    console.log('===== p2_scan_printCtrl ====');

    $scope.doRefresh();
  }
); // p2_scan_printCtrl
