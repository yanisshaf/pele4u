/**
 * Created by User on 12/12/2016.
 */
var app = angular.module('pele.p2_scan_printCtrl', ['ngStorage']);
app.controller('p2_scan_printCtrl', function($scope, $stateParams, $cordovaBarcodeScanner, $ionicLoading, PelApi, appSettings) {
  //-----------------------------------------//
  //--         scanBarcode
  //-----------------------------------------//

  $scope.doRefresh = function() {
    $ionicLoading.hide();
    $scope.$broadcast('scroll.refreshComplete');

    PelApi.lagger.info("IN p2_scan_printCtrl.scanBarcode();");

    if (window.cordova != undefined) {
      $cordovaBarcodeScanner.scan().then(function(imageData) {
          var printUrl = imageData.text;

          var patt = new RegExp(appSettings.config.MSSO_PRINT_URL);
          var res = patt.test(printUrl);
          if (res) {
            var sendScanPrint = PelApi.sendScanPrint(printUrl)
            sendScanPrint.success(function(data, status) {
              console.log("SUCCESS : sendScanPrint.success");
              PelApi.goHome();
            }).error(
              function(response) {
                PelApi.lagger.error(" 1 . p2_scan_printCtrl.scanBarcode() - " + JSON.stringify(response));
                PelApi.showPopup(appSettings.config.interfaceErrorTitle, "");
                PelApi.goHome();
              }
            );
          } else {
            PelApi.showPopup(appSettings.config.MSSO_PRINT_WRONG_BARCODE, "");
          }
          console.log("Barcode Format -> " + imageData.format);
          console.log("Cancelled -> " + imageData.cancelled);
        },
        function(error) {
          PelApi.lagger.error(" 2 . p2_scan_printCtrl.scanBarcode() - " + JSON.stringify(error));
          PelApi.showPopup(appSettings.config.SCAN_PRINT_SCANNING_ERROR, "");
          PelApi.goHome();
        });
    }
  };

  console.log('===== p2_scan_printCtrl ====');

  $scope.doRefresh();
}); // p2_scan_printCtrl
