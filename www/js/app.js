angular.module('hommy', ['ionic', 'hommy.controllers','hommy.directives','hommy.services','angular-jwt','ngCordova'])//, 'ionic-material', 'ionMdInput'
   .run(function ($ionicPlatform, $rootScope,$state, $localstorage,$ionicLoading,userService,$cordovaNetwork,$ionicPopup,$ionicHistory) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        
        // to check if its browser or mobile
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        if ( app ) {
            $rootScope.device="mobile"
        } else {
            // Web page
            $rootScope.device="browser";
        }
        
        $rootScope.$on("$cordovaNetwork:offline", function (event, result) {
            $ionicPopup.confirm({
              title: 'No Internet Connection',
              content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
            })
            .then(function(result) {
              if(!result) {
                ionic.Platform.exitApp();
              }
            });
        });
        
                // Enable to debug issues.
        //window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

        var notificationOpenedCallback = function(jsonData) {
          alert("Notification received:\n" + JSON.stringify(jsonData));
          console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
        };

        // Update with your OneSignal AppId and googleProjectNumber before running.
//        window.plugins.OneSignal.init("b2f7f966-d8cc-11e4-bed1-df8f05be55ba",
//                                                                   {googleProjectNumber: "703322744261"},
//                                                                   notificationOpenedCallback);
    
        //check if user is logged in or not
        $rootScope.baseApiUrl="http://128.199.170.13/api";
        if (userService.isUserLoggedIn()) {
        userService.setUserAuth(function(){
            $ionicHistory.nextViewOptions({disableBack: true});
            console.log($rootScope.kitchen);
            if($rootScope.kitchen!=null && $rootScope.kitchen!=undefined)
                 $state.go("app.orders");
               else
                 $state.go("app.mykitchen");  
            
            event.preventDefault();
            });
        }
        else{
            $state.go("app.login",{},{reload:true});
            event.preventDefault();
        }
});
    
//    if (userService.isUserLoggedIn()) {
//        userService.setUserAuth(function(){
//            $state.go("app.orders",{},{reload:true});
//            event.preventDefault();
//        });
//    }
//    else{
//        $state.go("app.login",{},{reload:true});
//        event.preventDefault();
//    }

 })
    .config(function ($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })
            .state('app.kitchen', {
                url: '/kitchen',
                cache:false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/kitchen.html',
                        controller: 'KitchenController'
                    }
                }
            })
            .state('app.orders', {
                url: '/orders',
                cache:false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/orders.html',
                        controller: 'KitchenController'
                    }
                }
            })
            .state('app.addItem', {
                url: '/addItem',
                cache:false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/addItem.html',
                        controller: 'KitchenController'
                    }
                }
            })
            .state('app.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html',
                        controller: 'UserController'
                    }
                }
            })
            .state('app.signup', {
                url: '/signup',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/signup.html',
                        controller: 'UserController'
                    }
                }
            })
            .state('app.registerSuccess', {
                url: '/registerSuccess',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/registerSuccess.html',
                        controller: 'UserController'
                    }
                }
            })
            
            .state('app.location', {
                url: '/location',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/location.html',
                        controller: 'LocationController'
                    }
                }
            })
            .state('app.mykitchen', {
                url: '/mykitchen',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/mykitchen.html',
                        controller: 'KitchenController'
                    }
                }
            })
            .state('app.addons', {
                url: '/addons',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/addons.html',
                        controller: 'KitchenController'
                    }
                }
            })
            .state('app.bankDetails', {
                url: '/bankDetails',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/bankDetails.html',
                        controller: 'KitchenController'
                    }
                }
            })
            .state('app.addAddress', {
                url: '/addAddress',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/addAddress.html',
                        controller: 'LocationController'
                    }
                }
            })
            .state('app.picaddress', {
                url: '/picaddress',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/picaddress.html',
                        controller: 'LocationController'
                    }
                }
            })
            ;

            
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/login');
       
        //remove back button text
        //$ionicConfigProvider.backButton.previousTitleText(false).text('');//.icon('ion-chevron-left');
    });