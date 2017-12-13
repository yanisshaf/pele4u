/**
 * Created by User on 27/01/2016.
 */
var app = angular.module('pele.services', []);

app.service('ApiService', ['$http', 'PelApi', '$sessionStorage', function($http, PelApi, $sessionStorage) {
    var env = PelApi.appSettings.env;
    var httpMethod = PelApi.cordovaNetwork.getNetwork() === "wifi" ? "https" : "http"
    var urlBase = httpMethod + '://msso.pelephone.co.il/' + env + '/CallMobileService';
    var authParams = $sessionStorage.ApiServiceAuthParams;
    authParams.APPID = "dsdsdsddsdsdsdsdddsd"
    var authParamsString = PelApi.toQueryString($sessionStorage.ApiServiceAuthParams)
    var request = {
      "Request": {
        "RequestHeader": {
          "ServiceName": "PhonebookGetSector",
          "AppID": "MobileApp",
          "EnvCode": "MobileApp_DEV",
          "Timeout": "30"
        },
        "InParams": {
          "PEL_PARAMETERS": {
            "LINE_NUMBER": "1",
            "P1": "1",
            "P2": "2",
            "P3": "3",
            "P4": "4",
            "P5": "5",
            "P6": "6",
            "P7": "7",
            "P8": "8",
            "P9": "9",
            "P10": "10",
            "P11": "11",
            "P12": "12",
            "P13": "13",
            "P14": "14",
            "P15": "15"
          }
        }
      }
    };


    this.setRequest = function(serviceName, params) {

    }

    this.get = function() {
      return $http.get(urlBase);
    };


    this.post = function(appid) {
      return $http.get(urlBase + '?' + authParamsString, request);
    };
  }])
  .service('srvShareData', function($window) {
    var KEY = 'App.SelectedValue';

    var addData = function(newObj) {
      var mydata = $window.sessionStorage.getItem(KEY);
      if (mydata) {
        mydata = JSON.parse(mydata);
      } else {
        mydata = [];
      }
      mydata.push(newObj);
      $window.sessionStorage.setItem(KEY, JSON.stringify(mydata));
    };

    var getData = function() {
      var mydata = $window.sessionStorage.getItem(KEY);
      if (mydata) {
        mydata = JSON.parse(mydata);
      }
      return mydata || [];
    };

    return {
      addData: addData,
      getData: getData
    };
  });