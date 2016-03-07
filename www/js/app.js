// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('BTRemoter', ['ionic', 'BTRemoter.controllers', 'BTRemoter.services'])

  .run(function ($ionicPlatform, devicesService, paramsService) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      devicesService.initDB();
      paramsService.initDB();
    });
  })

  // 平台详细配置
  .config(function ($ionicConfigProvider) {
    $ionicConfigProvider.views.transition('ios');
    $ionicConfigProvider.form.checkbox('circle');
    $ionicConfigProvider.form.toggle('large');
    $ionicConfigProvider.spinner.icon('ios');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');
  })

  // 路由配置
  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.remote', {
        url: '/remote',
        cache: false,
        //resolve: {
        //  devices: function (devicesService) {
        //    return (devicesService.getAllDevices());
        //  }
        //},
        views: {
          'tab-remote': {
            templateUrl: 'templates/tab-remote.html',
            controller: 'RemoteCtrl'
          }
        }
      })
      .state('tab.remote-detail', {
        url: '/remote/:deviceId',
        views: {
          'tab-remote': {
            templateUrl: 'templates/remote-detail.html',
            controller: 'RemoteDetailCtrl'
          }
        }
      })

      .state('tab.monitor', {
        url: '/monitor',
        views: {
          'tab-monitor': {
            templateUrl: 'templates/tab-monitor.html',
            controller: 'MonitorCtrl'
          }
        }
      })

      .state('tab.download', {
        url: '/download',
        views: {
          'tab-download': {
            templateUrl: 'templates/tab-download.html',
            controller: 'DownloadCtrl'
          }
        }
      })

      .state('tab.setting', {
        url: '/setting',
        views: {
          'tab-setting': {
            templateUrl: 'templates/tab-setting.html',
            controller: 'SettingCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/setting');

  });
