angular.module('BTRemoter.controllers', [])

  // 遥控主页
  .controller('RemoteCtrl', function ($scope, $state, devicesService) {
    // Get all data from the database.
    devicesService.getAllDevices()
      .then(function (devices) {
        //$scope.test = devices;
        $scope.dbDevices = devices;
      });

    // 显示遥控详细画面
    $scope.toDetail = function (device_id) {
      try {
        $state.go('tab.remote-detail', {'deviceId': device_id});
      } catch (e){
        alert(e);
      }
    };
    //$scope.deleteDevice = function (device_id) {
    //  $scope.test = devicesService.deleteDeviceById(device_id);
    //};
  })

  // 遥控详细页
  .controller('RemoteDetailCtrl', function ($scope, $stateParams, paramsService) {
    // Get device params from the database.
    paramsService.getParamById($stateParams.deviceId)
      .then(function (params) {
        //$scope.test = params;
        $scope.dbParams = params;
      });

    $scope.filterByType = function (row) {
      return (row.param_type != 9);
    };
  })

  // 监控主页
  .controller('MonitorCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  })

  // 下载主页
  .controller('DownloadCtrl', function ($scope,
                                        $http,
                                        $ionicLoading,
                                        $ionicSideMenuDelegate,
                                        $q,
                                        $ionicBackdrop,
                                        $timeout,
                                        $ionicPopup,
                                        devicesService,
                                        paramsService) {
    // Get all data from the database.
    devicesService.getAllDevices()
      .then(function (devices) {
        //$scope.test=devices;
        $scope.dbDevices = devices;
      });

    // 显示加载动画
    $ionicLoading.show({
      template: 'Loading...'
    });

    // 初始化
    $scope.activeTypeId = "T001";
    $scope.activeType = {type_id: 'T001', type_name: '电梯门驱动器'};

    // 获取设备类型列表
    var getDeviceTypes = $http.get('https://api.mongolab.com/api/1/databases/pyrrhus_db/collections/mst_device_type',
      {params: {apiKey: '5XZYggFUX-eCLYTwCs0dcuqv29ZcsOmg'}});

    // 获取首选设备（门驱动器）列表
    var getDevices = $http.get('https://api.mongolab.com/api/1/databases/pyrrhus_db/collections/mst_device',
      {params: {q: {$or: [{type_id: 'T001'}]}, apiKey: '5XZYggFUX-eCLYTwCs0dcuqv29ZcsOmg'}});

    $q.all([getDeviceTypes, getDevices])
      .then(function (respond) {
        $scope.device_types = respond[0].data;
        $scope.devices = respond[1].data;
        //$scope.test = $scope.devices;
      })
      .catch(function (err) {
        console.log(err);
      })
      .finally(function () {
        $ionicLoading.hide();
      });

    // 选择设备
    $scope.selectType = function (device_type, index) {
      // 显示加载动画
      $ionicLoading.show({
        template: 'Loading...'
      });

      $scope.activeType = device_type;
      $scope.activeTypeId = device_type.type_id;
      //$ionicSideMenuDelegate.toggleLeft();

      $http.get('https://api.mongolab.com/api/1/databases/pyrrhus_db/collections/mst_device',
        {params: {q: {$or: [{type_id: $scope.activeTypeId}]}, apiKey: '5XZYggFUX-eCLYTwCs0dcuqv29ZcsOmg'}})
        .success(function (data) {
          $scope.devices = data;
          //$scope.test = $scope.devices;
        })
        .catch(function (err) {
          console.log(err);
        })
        .finally(function () {
          $ionicLoading.hide();
        });
    };

    // 下载设备参数
    $scope.downloadDetail = function () {
      var selected = [];
      $scope.devices.forEach(function (device_row) {
        if (device_row.checked == true) {
          delete device_row.checked;
          delete device_row._id;
          selected.push(device_row);
        }
      });
      if (selected.length > 0) {
        // 显示加载动画
        $ionicLoading.show({
          template: 'Loading...'
        });

        // Save the selected devices into the database.
        // 删除内存中相同的数据
        var batchPromise = [];
        var queryList = [];
        selected.forEach(function (item, index) {
          batchPromise.push(devicesService.deleteDeviceById(item.device_id));
          batchPromise.push(paramsService.deleteParamById(item.device_id));

          var map = {};
          map['device_id'] = item.device_id;
          queryList.push(map);
        });

        // 获取设备参数列表
        var getParams = $http.get('https://api.mongolab.com/api/1/databases/pyrrhus_db/collections/device_detail',
          {params: {q: {$or: queryList}, apiKey: '5XZYggFUX-eCLYTwCs0dcuqv29ZcsOmg'}});
        batchPromise.splice(0, 0, getParams);
        $q.all(batchPromise)
          .then(function (data) {
            var params = data[0].data.map(function (row) {
              // Dates are not automatically converted from a string.
              //row.doc.Date = new Date(row.doc.Date);
              delete row._id;
              return row;
            });
            console.log(params);
            var addParams = paramsService.addParams(params);
            var addDevices = devicesService.addDevices(selected);
            $q.all([addParams, addDevices])
              .then(function (respond) {
                $ionicPopup.alert({
                  title: '下载完成',
                  template: '数据已经下载完毕，请到遥控页查看下载的数据！'
                });
              })
              .catch(function (err) {
                console.log(err);
              })
              .finally(function () {
                $ionicLoading.hide();
              });
          });
      }
    };

    // 显示左侧菜单
    $scope.toggleLeftMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };


    $scope.action = function () {
      $ionicBackdrop.retain();
      $timeout(function () {    //默认让它1秒后消失
        $ionicBackdrop.release();
      }, 1000);
    };
  })

  // 设置主页
  .controller('SettingCtrl', function ($scope, $q, $ionicPopup, devicesService, paramsService) {
    $scope.settings = {
      enableFriends: true
    };

    // 清除数据
    $scope.dropDB = function () {
      var cleanDevices = devicesService.dropDB()
        .then(function (respond) {
          return $q.when(devicesService.initDB());
        });
      var cleanParams = paramsService.dropDB()
        .then(function (respond) {
          return $q.when(paramsService.initDB());
        });

      //  alert（警告） 对话框
      $q.all([cleanDevices, cleanParams])
        .then(function () {
          $ionicPopup.alert({
            title: '数据清除',
            template: '下载的数据已经全部删除！'
          });
        });
    };
  });
