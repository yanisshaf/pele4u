/*********************/
const env = "DV";
/********************/

const EnvCodes = {
  PD: "PROD",
  DV: "DEV",
  QA: "QA",
  LP: "LP"
};

const topConfig = {

  uri: "http://******************",
  wifi_uri: "https://******************",
  api: "http://******************/PCBarCode/PrintCenterBar.asmx/WhoMI",
  sapi: "https://******************/PCBarCode/PrintCenterBar.asmx/WhoMI",
  google_play_app_link: "https://play.google.com/store/apps/details?id=com.int_pele.pele4u",
  apple_store_app_link: "https://appsto.re/il/yYQKab.i",
  timeout: 15000,
  menuTimeout: 15000,
  translateFlag: "N",
  flashTime: 2500,
  OneSignal: {
    QA: {
      appId: "********-****-****-****-***********",
      googleProjectNumber: "************"
    },
    PROD: {
      appId: "********-****-****-****-***********",
      googleProjectNumber: "***********"
    },
  },
  services: {
    GetUserMenu: {
      "endpoint": "/" + env + "/MobileServices/SSOService.svc/json/GetUserMenu",
      "RequestHeader": ""
    },
    GetUserNotifNew: {

      "endpoint": "/" + env + "/REST/GetUserNotifNew",
      "RequestHeader": {
        "ServiceName": "GetUserNotificationsNew",
        "AppID": "MobileApp",
        "EnvCode": "MobileApp_" + EnvCodes[env],
        "Timeout": "10000"
      }
    },
    GetUserModuleTypes: {
      "endpoint": "/" + env + "/REST/GetUserModuleTypes",
      "RequestHeader": {
        "ServiceName": "GetUserModuleTypes",
        "AppID": "MobileApp",
        "EnvCode": "MobileApp_" + EnvCodes[env],
        "Timeout": "10000"
      }
    },
    GtUserFormGroups: {
      "endpoint": "/" + env + "/REST/GtUserFormGroups",
      "RequestHeader": {
        "ServiceName": "GetUserFormGroups",
        "AppID": "MobileApp",
        "EnvCode": "MobileApp_" + EnvCodes[env],
        "Timeout": "10000"
      }
    },
    GetUserNotif: {
      "endpoint": "/" + env + "/REST/GetUserNotif",
      "RequestHeader": {
        "ServiceName": "GetUserNotifications",
        "AppID": "MobileApp",
        "EnvCode": "MobileApp_" + EnvCodes[env],
        "Timeout": "10000"
      }
    },
    SubmitNotif: {
      "endpoint": "/" + env + "/REST/SubmitNotif",
      "RequestHeader": {
        "ServiceName": "SubmitNotifications",
        "AppID": "MobileApp",
        "EnvCode": "MobileApp_" + EnvCodes[env],
        "Timeout": "10000"
      }
    },
    GetUserPoOrdGroup: {
      "endpoint": "/" + env + "/REST/GetUserPoOrdGroup",
      "RequestHeader": {
        "ServiceName": "GetUserPoOrdGroup",
        "AppID": "MobileApp",
        "EnvCode": "MobileApp_" + EnvCodes[env],
        "Timeout": "10000"
      }
    },
    GetUserRqGroups: {
      "endpoint": "/" + env + "/REST/GetUserRqGroups",
      "RequestHeader": {
        "ServiceName": "GetUserRqGroups",
        "AppID": "MobileApp",
        "EnvCode": "MobileApp_" + EnvCodes[env],
        "Timeout": "10000"
      }
    },
    GetFileURI: {
      "endpoint": "/" + env + "/REST/GetFileURI",
      "RequestHeader": {
        "ServiceName": "ShareFile-GetFileURI",
        "AppID": "MobileApp",
        "EnvCode": "MobileApp_" + EnvCodes[env],
        "Timeout": "120"
      }
    },
    IsSessionValidJson: {
      "endpoint": "/" + env + "/MobileServices/SSOService.svc/json/IsSessionValidJson",
      "RequestHeader": ""
    }
  }
};

/*********************/

angular.module('pele.config', [])
  .constant('WORDPRESS_API_URL', 'http://wordpress.startapplabs.com/blog/api/')
  .constant('GCM_SENDER_ID', '***********')
  .constant('appSettings', {
    topConfig: topConfig,
    api: "http://******************/PCBarCode/PrintCenterBar.asmx/WhoMI",
    timeout: 15000,
    menuTimeout: 15000,
    translateFlag: "N",
    flashTime: 2500,
    GOOGLE_PLAY_APP_LINK: "https://play.google.com/store/apps/details?id=com.int_pele.pele4u",
    APPLE_STORE_APP_LING: "https://appsto.re/il/yYQKab.i",
    PIN_STATUS: {
      "EOL": "", //- End of life
      "PAD": "גישה נחסמה, נה לפנות ל 55 ...", // - Pin access denied after 3 time
      "PWA": "גישה הלא נכונה ...", // - Pin wrong access
      "NRP": "קוד מחמיר נעול. צריך לאפס ...", // - Need to reset Pin
      "PNE": "קוד מחמיר לא קיים ...", //  Pin not Exist
      "PCR": "הזינו קוד מחמיר, אפליקצייה דורשת הזדהות",
      "InValid": "", // - general error
      "Valid": "",
      "SYS_ERROR": "שגיאה מערכתי ...",
      "OLD": "הגרסה אינה עדכנית, נדרש לבצע התקנה לגרסה אחרונה. "
    },
    tabs: [{
      "text": "סבב מאשרים"
    }, {
      "text": "תוכן טופס"
    }],
    ATTACHMENT_BLUE_STYLE: {
      "color": "blue"
    },
    ATTACHMENT_GRAY_STYLE: {
      "color": "gray"
    },
    MODULE_TYPES_FORWARD_PATH: {
      "HR": "app.p3_hr_moduleDocList",
      "POAPPRV": "app.p3_po_moduleDocList",
      "PELRQAPR": "app.p3_rq_moduleDocList"
    },
    ACTION_HISTORY: {
      "FORWARD": "אישור",
      "NO_ACTION": "לא נדרש אישור",
      "REJECT": "דחייה",
      "WAITING": "ממתין"
    },
    APPROVE: {
      text: '<i id="APPROVE" class="icon ion-checkmark-circled text-center"></i> אישור'
    },
    APPROVE_AND_NOTE: {
      text: '<i id="APPROVE_AND_NOTE" class="icon ion-checkmark-circled text-center"></i> אישור עם הערה'
    },
    OK: {
      text: '<i id="OK"      class="icon ion-checkmark-circled text-center"></i> אישור'
    },
    REJECT: {
      text: '<i id="REJECT"  class="icon ion-close-circled     text-center" style="color:#F71914"></i> דחיה'
    },
    enviroment: "DV",
    enviromentLinks: [{
        Environment: "PD",
        ServiceList: [{
            "Service": "GetUserMenu",
            "URL": "http://******************/PD/MobileServices/SSOService.svc/json/GetUserMenu",
            "URL_WIFI": "https://******************/PD/MobileServices/SSOService.svc/json/GetUserMenu",
            "RequestHeader": ""
          },
          {
            "Service": "GetUserModuleTypes",
            "URL": "http://******************/PD/REST/GetUserModuleTypes",
            "URL_WIFI": "https://******************/PD/REST/GetUserModuleTypes",
            "RequestHeader": {
              "ServiceName": "GetUserModuleTypes",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_PROD",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GtUserFormGroups",
            "URL": "http://******************/PD/REST/GtUserFormGroups",
            "URL_WIFI": "https://******************/PD/REST/GtUserFormGroups",
            "RequestHeader": {
              "ServiceName": "GetUserFormGroups",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_PROD",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserNotif",
            "URL": "http://******************/PD/REST/GetUserNotif",
            "URL_WIFI": "https://******************/PD/REST/GetUserNotif",
            "RequestHeader": {
              "ServiceName": "GetUserNotifications",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_PROD",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserNotifNew",
            "URL": "http://******************/PD/REST/GetUserNotifNew",
            "URL_WIFI": "https://******************/PD/REST/GetUserNotifNew",
            "RequestHeader": {
              "ServiceName": "GetUserNotificationsNew",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_PROD",
              "Timeout": "10000"
            }
          },
          {
            "Service": "SubmitNotif",
            "URL": "http://******************/PD/REST/SubmitNotif",
            "URL_WIFI": "https://******************/PD/REST/SubmitNotif",
            "RequestHeader": {
              "ServiceName": "SubmitNotifications",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_PROD",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserPoOrdGroup",
            "URL": "http://******************/PD/REST/GetUserPoOrdGroup",
            "URL_WIFI": "https://******************/PD/REST/GetUserPoOrdGroup",
            "RequestHeader": {
              "ServiceName": "GetUserPoOrdGroup",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_PROD",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserRqGroups",
            "URL": "http://******************/PD/REST/GetUserRqGroups",
            "URL_WIFI": "https://******************/PD/REST/GetUserRqGroups",
            "RequestHeader": {
              "ServiceName": "GetUserRqGroups",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_PROD",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetFileURI",
            "URL": "http://******************/PD/REST/GetFileURI",
            "URL_WIFI": "https://******************/PD/REST/GetFileURI",
            "RequestHeader": {
              "ServiceName": "ShareFile-GetFileURI",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_PROD",
              "Timeout": "120"
            }
          },
          {
            "Service": "IsSessionValidJson",
            "URL": "http://******************/PD/MobileServices/SSOService.svc/json/IsSessionValidJson",
            "URL_WIFI": "https://******************/PD/MobileServices/SSOService.svc/json/IsSessionValidJson",
            "RequestHeader": ""
          }
        ]
      },
      {
        Environment: "QA",
        ServiceList: [{
            "Service": "GetUserMenu",
            "URL": "http://******************/QA/MobileServices/SSOService.svc/json/GetUserMenu",
            "URL_WIFI": "https://******************/QA/MobileServices/SSOService.svc/json/GetUserMenu",
            "RequestHeader": ""
          },
          {
            "Service": "GetUserModuleTypes",
            "URL": "http://******************/QA/REST/GetUserModuleTypes",
            "URL_WIFI": "https://******************/QA/REST/GetUserModuleTypes",
            "RequestHeader": {
              "ServiceName": "GetUserModuleTypes",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_QA",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GtUserFormGroups",
            "URL": "http://******************/QA/REST/GtUserFormGroups",
            "URL_WIFI": "https://******************/QA/REST/GtUserFormGroups",
            "RequestHeader": {
              "ServiceName": "GetUserFormGroups",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_QA",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserNotif",
            "URL": "http://******************/QA/REST/GetUserNotif",
            "URL_WIFI": "https://******************/QA/REST/GetUserNotif",
            "RequestHeader": {
              "ServiceName": "GetUserNotifications",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_QA",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserNotifNew",
            "URL": "http://******************/QA/REST/GetUserNotifNew",
            "URL_WIFI": "https://******************/QA/REST/GetUserNotifNew",
            "RequestHeader": {
              "ServiceName": "GetUserNotificationsNew",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_QA",
              "Timeout": "10000"
            }
          },
          {
            "Service": "SubmitNotif",
            "URL": "http://******************/QA/REST/SubmitNotif",
            "URL_WIFI": "https://******************/QA/REST/SubmitNotif",
            "RequestHeader": {
              "ServiceName": "SubmitNotifications",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_QA",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserPoOrdGroup",
            "URL": "http://******************/QA/REST/GetUserPoOrdGroup",
            "URL_WIFI": "https://******************/QA/REST/GetUserPoOrdGroup",
            "RequestHeader": {
              "ServiceName": "GetUserPoOrdGroup",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_QA",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserRqGroups",
            "URL": "http://******************/QA/REST/GetUserRqGroups",
            "URL_WIFI": "https://******************/QA/REST/GetUserRqGroups",
            "RequestHeader": {
              "ServiceName": "GetUserRqGroups",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_QA",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetFileURI",
            "URL": "http://******************/QA/REST/GetFileURI",
            "URL_WIFI": "https://******************/QA/REST/GetFileURI",
            "RequestHeader": {
              "ServiceName": "ShareFile-GetFileURI",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_QA",
              "Timeout": "120"
            }
          },
          {
            "Service": "IsSessionValidJson",
            "URL": "http://******************/QA/MobileServices/SSOService.svc/json/IsSessionValidJson",
            "URL_WIFI": "https://******************/QA/MobileServices/SSOService.svc/json/IsSessionValidJson",
            "RequestHeader": ""
          }
        ]
      },
      {
        Environment: "DV",
        ServiceList: [{
            "Service": "GetUserMenu",
            "URL": "http://******************/DV/MobileServices/SSOService.svc/json/GetUserMenu",
            "URL_WIFI": "https://******************/DV/MobileServices/SSOService.svc/json/GetUserMenu",
            "RequestHeader": ""
          },
          {
            "Service": "GetUserModuleTypes",
            "URL": "http://******************/DV/REST/GetUserModuleTypes",
            "URL_WIFI": "https://******************/DV/REST/GetUserModuleTypes",
            "RequestHeader": {
              "ServiceName": "GetUserModuleTypes",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_DEV",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GtUserFormGroups",
            "URL": "http://******************/DV/REST/GtUserFormGroups",
            "URL_WIFI": "https://******************/DV/REST/GtUserFormGroups",
            "RequestHeader": {
              "ServiceName": "GetUserFormGroups",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_DEV",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserNotif",
            "URL": "http://******************/DV/REST/GetUserNotif",
            "URL_WIFI": "https://******************/DV/REST/GetUserNotif",
            "RequestHeader": {
              "ServiceName": "GetUserNotifications",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_DEV",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserNotifNew",
            "URL": "http://******************/DV/REST/GetUserNotifNew",
            "URL_WIFI": "https://******************/DV/REST/GetUserNotifNew",
            "RequestHeader": {
              "ServiceName": "GetUserNotificationsNew",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_DEV",
              "Timeout": "10000"
            }
          },
          {
            "Service": "SubmitNotif",
            "URL": "http://******************/DV/REST/SubmitNotif",
            "URL_WIFI": "https://******************/DV/REST/SubmitNotif",
            "RequestHeader": {
              "ServiceName": "SubmitNotifications",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_DEV",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserPoOrdGroup",
            "URL": "http://******************/DV/REST/GetUserPoOrdGroup",
            "URL_WIFI": "https://******************/DV/REST/GetUserPoOrdGroup",
            "RequestHeader": {
              "ServiceName": "GetUserPoOrdGroup",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_DEV",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserRqGroups",
            "URL": "http://******************/DV/REST/GetUserRqGroups",
            "URL_WIFI": "https://******************/DV/REST/GetUserRqGroups",
            "RequestHeader": {
              "ServiceName": "GetUserRqGroups",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_DEV",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetFileURI",
            "URL": "http://******************/DV/REST/GetFileURI",
            "URL_WIFI": "https://******************/DV/REST/GetFileURI",
            "RequestHeader": {
              "ServiceName": "ShareFile-GetFileURI",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_DEV",
              "Timeout": "120"
            }
          },
          {
            "Service": "IsSessionValidJson",
            "URL": "http://******************/DV/MobileServices/SSOService.svc/json/IsSessionValidJson",
            "URL_WIFI": "https://******************/DV/MobileServices/SSOService.svc/json/IsSessionValidJson",
            "RequestHeader": ""
          }
        ]
      },
      {
        Environment: "LP",
        ServiceList: [{
            "Service": "GetUserMenu",
            "URL": "http://******************/QA/MobileServices/SSOService.svc/json/GetUserMenu",
            "URL_WIFI": "https://******************/QA/MobileServices/SSOService.svc/json/GetUserMenu",
            "RequestHeader": ""
          },
          {
            "Service": "GetUserModuleTypes",
            "URL": "http://******************/QA/REST/GetUserModuleTypes",
            "URL_WIFI": "https://******************/QA/REST/GetUserModuleTypes",
            "RequestHeader": {
              "ServiceName": "GetUserModuleTypes",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_LP",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GtUserFormGroups",
            "URL": "http://******************/QA/REST/GtUserFormGroups",
            "URL_WIFI": "https://******************/QA/REST/GtUserFormGroups",
            "RequestHeader": {
              "ServiceName": "GetUserFormGroups",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_LP",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserNotif",
            "URL": "http://******************/QA/REST/GetUserNotif",
            "URL_WIFI": "https://******************/QA/REST/GetUserNotif",
            "RequestHeader": {
              "ServiceName": "GetUserNotifications",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_LP",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserNotifNew",
            "URL": "http://******************/QA/REST/GetUserNotifNew",
            "URL_WIFI": "https://******************/QA/REST/GetUserNotifNew",
            "RequestHeader": {
              "ServiceName": "GetUserNotificationsNew",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_LP",
              "Timeout": "10000"
            }
          },
          {
            "Service": "SubmitNotif",
            "URL": "http://******************/QA/REST/SubmitNotif",
            "URL_WIFI": "https://******************/QA/REST/SubmitNotif",
            "RequestHeader": {
              "ServiceName": "SubmitNotifications",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_LP",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserPoOrdGroup",
            "URL": "http://******************/QA/REST/GetUserPoOrdGroup",
            "URL_WIFI": "https://******************/QA/REST/GetUserPoOrdGroup",
            "RequestHeader": {
              "ServiceName": "GetUserPoOrdGroup",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_LP",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetUserRqGroups",
            "URL": "http://******************/QA/REST/GetUserRqGroups",
            "URL_WIFI": "https://******************/QA/REST/GetUserRqGroups",
            "RequestHeader": {
              "ServiceName": "GetUserRqGroups",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_LP",
              "Timeout": "10000"
            }
          },
          {
            "Service": "GetFileURI",
            "URL": "http://******************/QA/REST/GetFileURI",
            "URL_WIFI": "https://******************/QA/REST/GetFileURI",
            "RequestHeader": {
              "ServiceName": "ShareFile-GetFileURI",
              "AppID": "MobileApp",
              "EnvCode": "MobileApp_LP",
              "Timeout": "120"
            }
          },
          {
            "Service": "IsSessionValidJson",
            "URL": "http://******************/QA/MobileServices/SSOService.svc/json/IsSessionValidJson",
            "URL_WIFI": "https://******************/QA/MobileServices/SSOService.svc/json/IsSessionValidJson",
            "RequestHeader": ""
          }
        ]
      }
    ]
  });

var appSettings.config_test;
appSettings.config = {};

var appSettings.config;
appSettings.config = {
  APP_VERSION: "116.8",
  SCAN_PRINT_SCANNING_ERROR: "שגיאה בסריקה",
  PIN_CODE_AUTHENTICATION_REQUIRED_CODE: "10000",
  IS_TOKEN_VALID: "N",
  TITLE_WIFI_FIRST_CONNECTION_1: "בעת כניסה ראשונה",
  TITLE_WIFI_FIRST_CONNECTION_2: "יש לעבור לגלישה ברשת סלולרית",
  TITLE_SYSTEM_MESSAGES: "באפשרותך לבצע כניסה ללא קוד הזדהות על ידי מעבר לגלישה ברשת סלולרית",
  TITLE_OTP_REQUEST: "שלח",
  TITLE_OTP_INPUT: "קוד הזדהות",
  TITLE_SEND_OTP: "כניסה",
  TITLE_RESET_PASSWORD_LINK: "קבלת קוד הזדהות חדש",
  TITLE_SEND_OTP_LINK: "שליחת קוד הזדהות",
  TITLE_FORGOT_PASSWORD: "בקשה לקוד הזדהות",
  TITLE_LOGIN: "הזנת קוד הזדהות",
  PLAYER_ID: "",
  fileLogger: "",
  FileTransferSuccess: "הקובץ הורד בהצלחה",
  EAI_Status: "קובץ אינו זמין",
  TIMEOUT_STATUS: "קובץ אינו זמין",
  Application_Status: "קובץ אינו זמין",
  StatusCode: "קובץ אינו זמין",
  LOG_FILE_NAME: "Pele4U.txt",
  LOG_FILE_MAIL_RECIPIENT: "ghadad@gmail.com",
  __LOG_FILE_MAIL_RECIPIENT: "Mobile_Admins_HR@pelephone.co.il",
  LOG_FILE_MAIL_SUBJECT: "Pele4U Log File",
  LOG_FILE_INFO_TYPE: "I",
  LOG_FILE_DEBUG_TYPE: "D",
  LOG_FILE_ERROR_TYPE: "E",
  LOG_FILE_WARN_TYPE: "W",
  WIFI_CHECK: true,
  network: "",
  isOnline: "",
  pinCodeLock: false,
  interfaceErrorTitle: "שגיאת ממשק",
  wifiTitle: "WiFi- יש להתנתק מ",
  wifiSubTitle: "לצורך הזדהות ראשונית",
  declineTitle: "לפני דחייה",
  declineSubTitle: "חובה להזין הערה",
  Pin: "",
  pinCodeErrorVal: "קוד הזדהות שגוי",
  pinCodeErrorInit: "לא הוגדר קוד מחמיר. יש להגדיר בפורטל או ב-55",
  pinCodeErrorLock: "קוד הזדהות ננעל, נא לפנות ל-55",
  pinCodeSubTitlePCR: "חובה להזין קוד מחמיר",
  pinCodeSubTitlePWA: "קוד הזדהות שגוי",
  pinCodeSubTitlePDA: "קוד מחמיר נחסם, נא לפנות ל-55",
  pinCodeSubTitlePNE: "קוד מחמיר לא קיים ...",
  pinCodeSubTitleNRP: "קוד מחמיר נעול. צריך לאפס ...",
  PO_ORG_NAME: "",
  SETTINGS_DIRECTORY_NAME: "PELE4U_SETTINGS",
  ATTACHMENT_DIRECTORY_NAME: "PELE4U_ATTACHMENTS",
  MSISDN_WRITE_FILE_ERROR_CODE: "WFE",
  MSISDN_WRITE_FILE_ERROR_DESC: "שגיאה בכתיבה אל תוך קובץ MISDN",
  MSISDN_READ_FILE_ERROR_CODE: "RWE",
  MSISDN_READ_FILE_ERROR_DESC: "שגיאת קריאה מקובץ MSISDN",
  MSISDN_STATUS_VALID: "Valid",
  MSISDN_ERROR_DEFAULT: "סטאטוס של MSISDN לא מוקר",
  MSISDN_STATUS: "",
  MSISDN_FILE_NAME: "MSISDN.txt",
  MSISDN_VALUE: "",
  ATTACHMENT_TIME_OUT: 10000,
  ATTACHMENT_SHORT_TEXT: "טקסט קצר",
  ATTACHMENT_LONG_TEXT: "טקסט ארוך",
  ATTACHMENT_TYPE_NOT_SUPORTED_FOR_OPEN: "סוג הקובץ אינו נתמך",
  getUserMenuErrorMsg: "שגיאה בטעינת רשימת אפליקציות",
  getUserModuleTypesErrorMag: "בקשה הסתיימה עם שגיאה , נא לרענן מסך",
  EAI_ERROR_DESC: "שגיאה בממשק.",
  loadingMsg: "ממתין לטעינת נתונים ...",
  isAddNoteTitle: "האם ברצונך להוסיף הערה?",
  errorMsg: "",
  pinCodeErrorInd: "N",
  pinCodeReq: "Y",
  token: "",
  appId: "*******************************",
  user: "",
  userName: "",
  PIN: "0",
  GetUserMenu: "",
  GetUserModuleTypes: "",
  docDetails: {},
  ApprovRejectBtnDisplay: true,
  UP_TO_DATE: "N",
  MSSO_PRINT_URL: "https:/*/******************",
  MSSO_PRINT_WRONG_BARCODE: "ברקוד לא משויך למדפסת ...",
  INI_DOC_INIT_ID_UNDEFINED: "לא מקושר מסמך יזום"
};
