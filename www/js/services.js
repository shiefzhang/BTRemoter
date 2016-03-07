angular.module('BTRemoter.services', [])

  .factory('devicesService', function ($q) {
    var _db;
    var _devices;

    function findIndex(array, id) {
      var retId;
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id == id) {
          retId = i;
        }
      }
      return retId;
    }

    return {
      dropDB: function () {
        return $q.when(_db.destroy())
          .then(function (response) {
            // success
            return response;
          })
          .catch(function (err) {
            console.log(err);
          });
      },

      initDB: function () {
        // Creates the database or opens if it already exists
        _db = new PouchDB('devices', {adapter: 'websql', auto_compaction: true});
      },

      // 返回所有数据
      getAllDevices: function () {
        if (_devices) {
          // Return cached data as a promise
          return $q.when(_devices);
        }
        else {
          return $q.when(_db.allDocs({include_docs: true}))
            .then(function (docs) {
              // return docs;
              _devices = docs.rows.map(function (row) {
                // Dates are not automatically converted from a string.
                //row.doc.Date = new Date(row.doc.Date);
                return row.doc;
              });

              // Listen for changes on the database.
              _db.changes({live: true, since: 'now', include_docs: true})
                .on('change', function (change) {
                  var index = findIndex(_devices, change.id);
                  var device_row = _devices[index];
                  //console.log(change);

                  if (change.deleted) {
                    if (device_row) {
                      _devices.splice(index, 1); // delete
                    }
                  }
                  else {
                    if (device_row && device_row._id === change.id) {
                      _devices[index] = change.doc; // update
                    }
                    else {
                      _devices.splice(index, 0, change.doc); // insert
                    }
                  }
                });
              return _devices;
            });
        }
      },

      // 插入单条数据
      addDevice: function (device_row) {
        return $q.when(_db.post(device_row));
      },

      // 插入多条数据
      addDevices: function (devices) {
        return $q.when(_db.bulkDocs(devices));
      },

      // 根据ID查询数据
      getDeviceById: function (deviceId) {
        function query_map(doc, emit) {
          if (doc.device_id === deviceId) {
            // 排序
            emit([doc.type_id, doc.device_id]);
          }
        }

        return $q.when(_db.query(query_map, {include_docs: true})
          .then(function (result) {
            // handle result
            return result.rows.map(function (row) {
              return row.doc;
            });
          })
          .catch(function (err) {
            console.log(err);
          }));
      },

      // 更新数据
      updateDevice: function (device_row) {
        return $q.when(_db.put(device_row));
      },

      // 根据ID删除数据
      deleteDeviceById: function (deviceId) {
        function query_map(doc, emit) {
          if (doc.device_id === deviceId) {
            // 排序
            emit([doc.type_id, doc.device_id]);
          }
        }

        return $q.when(_db.query(query_map, {include_docs: true})
          .then(function (result) {
            // handle result
            //console.log(result.rows);
            return $q.all(result.rows.map(function (row) {
              return _db.remove(row.doc._id, row.doc._rev);
            }));
          })
          .catch(function (err) {
            console.log(err);
          }));
      },

      // 删除数据
      deleteDevice: function (device_row) {
        return $q.when(_db.remove(device_row));
      }
    }
  })

  .factory('paramsService', function ($q) {
    var _db;

    return {
      dropDB: function () {
        return $q.when(_db.destroy())
          .then(function (response) {
            // success
            return response;
          })
          .catch(function (err) {
            console.log(err);
          });
      },

      initDB: function () {
        // Creates the database or opens if it already exists
        _db = new PouchDB('params', {adapter: 'websql', auto_compaction: true});
      },

      // 插入多条数据
      addParams: function (params) {
        return $q.when(_db.bulkDocs(params));
      },

      // 根据ID查询数据
      getParamById: function (deviceId) {
        function query_map(doc, emit) {
          if (doc.device_id === deviceId) {
            // 排序
            emit([doc.device_id, doc.param_no]);
          }
        }

        return $q.when(_db.query(query_map, {include_docs: true})
          .then(function (result) {
            // handle result
            return result.rows.map(function (row) {
              return row.doc;
            });
          })
          .catch(function (err) {
            console.log(err);
          }));
      },

      // 根据ID删除数据
      deleteParamById: function (deviceId) {
        function query_map(doc, emit) {
          if (doc.device_id === deviceId) {
            // 排序
            emit([doc.device_id, doc.param_no]);
          }
        }

        return $q.when(_db.query(query_map, {include_docs: true})
          .then(function (result) {
            // handle result
            //console.log(result.rows);
            return $q.all(result.rows.map(function (row) {
              return _db.remove(row.doc._id, row.doc._rev);
            }));
          })
          .catch(function (err) {
            console.log(err);
          }));
      }
    }
  })

  .factory('Types', function () {
    // Might use a resource here that returns a JSON array

    return {
      all: function () {
        return types;
      },
      remove: function (type_id) {
        types.splice(types.indexOf(type_id), 1);
      },
      get: function (type_id) {
        for (var i = 0; i < types.length; i++) {
          if (types[i].id === parseInt(type_id)) {
            return types[i];
          }
        }
        return null;
      }
    };
  });



