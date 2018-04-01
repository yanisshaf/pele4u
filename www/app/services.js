/**
 * Created by User on 27/01/2016.
 */
var app = angular.module('pele.services', []);
app.service('StorageService', ['$http', 'PelApi', '$localStorage', function($http, PelApi, $localStorage) {
  // ttl - time ( seconds to live)

  var yearTtl = 60 * 60 * 24 * 365;

  function currentStamp() {
    return new Date().getTime();
  }

  function checkExpired(obj) {
    if (!obj) obj = {};
    if (!obj.ttl) obj.ttl = yearTtl;
    var current = new Date().getTime();
    if (currentStamp() - obj.timestamp > obj.ttl)
      return true;
    return false;
  }
  this.set = function(varname, data, ttl) {
    // default ttl is one year
    if (typeof ttl === 'undefined')
      ttl = yearTtl;
    if (typeof $localStorage[varname] === 'undefined' || $localStorage[varname] === null || checkExpired($localStorage[varname])) {
      $localStorage[varname] = {};
      $localStorage[varname].data = data;
      $localStorage[varname].ttl = ttl;
      $localStorage[varname].timestamp = currentStamp();
    }
    return $localStorage[varname];
  }
  this.get = function(varname) {
    return $localStorage[varname];
  };

  this.getData = function(varname, defaultValue) {
    defaultValue = defaultValue || null;
    var val = _.get($localStorage[varname], "data", defaultValue);
    if (checkExpired($localStorage[varname]))
      return defaultValue;
    return val;
  }
}]).service('ApiService', ['$http', '$ionicHistory', 'PelApi', '$sessionStorage', function($http, $ionicHistory, PelApi, $sessionStorage) {
  var Errors = {
    2: {
      description: "token invalid",
      redirectToMenu: true
    },
    3: {
      description: "error in sso / pin code",
      redirectToMenu: true
    }
  }
  var env = PelApi.appSettings.env;
  var isValidJson = function(str) {
    try {
      JSON.stringify(str)
    } catch (err) {
      return false
    }
    return true
  }

  function buildServiceCaller(ServiceName, config) {
    var internal = {};
    var internalConfig = config;
    internal.timeout = internalConfig.timeout = internalConfig.timeout || PelApi.appSettings.api_timeout;
    internalConfig.params = internalConfig.params || {};

    var urlBase = PelApi.cordovaNetwork.getNetwork() === "wifi" ? PelApi.appSettings.apiConfig.wifi_uri : PelApi.appSettings.apiConfig.uri;

    var ServiceUrl = urlBase + '/' + PelApi.appSettings.SSOEnv[env] + '/CallMobileService';

    var authParams = $sessionStorage.ApiServiceAuthParams;
    authParams.APPID = internalConfig.AppId;
    var authParamsString = PelApi.toQueryString($sessionStorage.ApiServiceAuthParams)

    internal.url = ServiceUrl + '?' + authParamsString;
    var EnvCode = "MobileApp_" + PelApi.appSettings.EnvCodes[env];

    var request = {
      "Request": {
        "RequestHeader": {
          "ServiceName": ServiceName,
          "AppID": "MobileApp",
          "EnvCode": EnvCode,
          "Timeout": internalConfig.timeout
        },
        "InParams": {
          "PEL_PARAMETERS": {
            "LINE_NUMBER": "1",
            "P1": internalConfig.params.p1 || null,
            "P2": internalConfig.params.p2 || null,
            "P3": internalConfig.params.p3 || null,
            "P4": internalConfig.params.p4 || null,
            "P5": internalConfig.params.p5 || null,
            "P6": internalConfig.params.p6 || null,
            "P7": internalConfig.params.p7 || null,
            "P8": internalConfig.params.p8 || null,
            "P9": internalConfig.params.p9 || null,
            "P10": internalConfig.params.p10 || null,
            "P11": internalConfig.params.p11 || null,
            "P12": internalConfig.params.p12 || null,
            "P13": internalConfig.params.p13 || null,
            "P14": internalConfig.params.p14 || null,
            "P15": internalConfig.params.p15 || null
          }
        }

      }
    };

    internal.bodyRequest = request;
    return internal;
  }


  this.checkResponse = function(data, httpStatus) {
    var errorMsg = "InvalidJsonResponse";
    var sys = ""
    if (isValidJson(data) == false || !data) {
      errorMsg = "InvalidJsonResponse";
      if (typeof data === "string") {
        errorMsg = data;
      }
      return PelApi.throwError("api", "ApiService.checkResponse-InvalidJsonResponse", "(httpStatus : " + httpStatus + ") " + errorMsg)
    }
    if (data.Error && data.Error.errorCode) {
      errorMsg = "Application Error";
      sys = "api";
      var err = Errors[data.Error.errorCode] || {};
      if (err.redirectToMenu) {
        $ionicHistory.clearHistory();
        return PelApi.goHome();
      }
      return PelApi.throwError("api", "ApiService.checkResponse-" + errorMsg, "(httpStatus : " + httpStatus + ") " + JSON.stringify(data), false)
    }
    if (httpStatus != 200) {
      errorMsg = "http resource error";
      return PelApi.throwError("api", "ApiService.checkResponse-" + errorMsg, "(httpStatus : " + httpStatus + ")")
    }
    return data;
  }

  this.get = function() {
    return $http.get(urlBase);
  };

  this.post = function(ServiceName, AppId, requestParams) {

    var apiConfig = buildServiceCaller(ServiceName, {
      AppId: AppId,
      params: requestParams || {}
    })

    return $http.post(apiConfig.url, apiConfig.bodyRequest, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json ; charset=utf-8'
      }
    });

  };
}]).service('ApiGateway', ['$http', '$ionicHistory', 'PelApi', '$sessionStorage', '$localStorage', function($http, $ionicHistory, PelApi, $sessionStorage, $localStorage) {

  var env = PelApi.appSettings.env
  var urlBase = PelApi.cordovaNetwork.getNetwork() === "wifi" ? PelApi.appSettings.apiConfig.wifi_uri : PelApi.appSettings.apiConfig.uri;
  var urlBase = urlBase + '/mobileAppGw/' + env.toLowerCase() + '/';



  function buildHeader(params) {
    var headers = params || {};
    let ApiServiceAuthParams = _.get($sessionStorage, "ApiServiceAuthParams", {});
    headers['x-appid'] = $sessionStorage.PeleAppId;
    headers['x-token'] = ApiServiceAuthParams.TOKEN;
    headers['x-pincode'] = ApiServiceAuthParams.PIN;
    headers['x-username'] = $sessionStorage.userName;
    headers['x-msisdn'] = ($sessionStorage.PELE4U_MSISDN || PelApi.appSettings.config.MSISDN_VALUE) || $localStorage.PELE4U_MSISDN;
    return headers;
  }




  //return PelApi.throwError("api", "ApiService.checkResponse-InvalidJsonResponse", "(httpStatus : " + httpStatus + ") " + errorMsg)
  //return PelApi.throwError("api", "ApiService.checkResponse-" + errorMsg, "(httpStatus : " + httpStatus + ") " + JSON.stringify(data), false)
  this.get = function(service, params, headers) {
    var headerParams = {
      headers: buildHeader(headers)
    }
    var url = urlBase + service;
    params = params || {};

    return $http.get(url, {
      params: params
    }, headerParams);
  };
  this.post = function(service, params, headers) {
    var headerParams = {
      headers: buildHeader(headers)
    }
    return $http.post(urlBase + service, params || {}, headerParams);
  };
  this.head = function(service, headers) {
    var headerParams = {
      headers: buildHeader(headers)
    }
    return $http.head(urlBase + service, {}, headerParams);
  };
  this.delete = function(service, params, headers) {
    var headerParams = {
      headers: buildHeader(headers)
    }
    return $http.delete(urlBase + service, params || {}, headerParams);
  };
  this.put = function(service, params, headers) {
    var headerParams = {
      headers: buildHeader(headers)
    }
    return $http.put(urlBase + service, params || {}, headerParams);
  };
}]).service('srvShareData', function($window) {
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