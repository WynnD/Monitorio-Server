const mssql = require('mssql/msnodesqlv8');
const config = {
  user: '',
  password: '',
  server: 'dev-mfgen',
  domain: 'UHC-NT',
  database: 'AppMonitor',
  parseJSON: 'true',
  options: {
    trustedConnection: 'true'
  }
};

let dbClient = {
  addApp(app) {
    return new Promise((resolve, reject) => {
      const pool = new mssql.ConnectionPool(config, err => {
        if (err) {
          console.log(err);
        }

        const sqlReq = new mssql.Request(pool);
        console.log(app);
        sqlReq.input('app_name', mssql.NVarChar(50), app.app_name);
        sqlReq.input('product_id', mssql.Int, app.product_id);
        sqlReq.input('product_name', mssql.NVarChar(50), app.product_name);
        sqlReq.input('api_url', mssql.NVarChar(1000), app.api_url);
        sqlReq.input('notify_email', mssql.NVarChar(1000), app.notify_email);

        sqlReq
          .execute('dbo.SP_Add_Application')
          .then(() => {
            console.log('Adding application', app.app_name, 'successful');
            pool.close();
            resolve();
          })
          .catch(error => {
            if (error) {
              console.log(error);
              console.trace();
              reject(error);
            }
          });
      });
    });
  },

  addDep(app, dependency) {
    return new Promise((resolve, reject) => {
      const pool = new mssql.ConnectionPool(config, err => {
        if (err) {
          console.log(err);
          console.trace();
        }

        const sqlReq = new mssql.Request(pool);
        sqlReq.input('api_url', mssql.NVarChar(1000), app.api_url);
        sqlReq.input('dep_name', mssql.NVarChar(50), dependency.name);

        sqlReq
          .execute('dbo.SP_Add_Dependency')
          .then(() => {
            console.log(
              'Successfully added dependency',
              dependency.name,
              'for application',
              app.product_name,
              'into Dependencies table',
              '\n'
            );
            pool.close();
            resolve();
          })
          .catch(error => {
            console.log(error);
            console.trace();
            reject(error);
          });
      });
    });
  },

  addDeps(app) {
    app.dependencies.forEach(dependency => {
      this.addDep(app, dependency);
    });
  },

  logAppAndDepVitals(app) {
    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
      }

      const sqlReq = new mssql.Request(pool);

      sqlReq.input('api_url', mssql.NVarChar(1000), app.api_url);
      sqlReq.input('result', mssql.TinyInt, app.result);
      sqlReq.input('result_f5', mssql.TinyInt, app.result_f5);
      sqlReq.input('ping_ms', mssql.Int, app.ping_ms);
      sqlReq.input('hostname', mssql.NVarChar(50), app.hostname);
      sqlReq.input('error_desc', mssql.NVarChar(4000), app.error_desc);

      sqlReq
        .execute('dbo.SP_Add_Application_Log')
        .then(() => {
          console.log(
            'Successfully added log for application',
            app.product_name,
            'to Application_Logs table',
            '\n'
          );
          pool.close();
        })
        .catch(error => {
          console.log(error);
          console.trace();
        });
    });

    app.dependencies.forEach(dep => {
      this.logDependencyVitals(app, dep);
    });
  },

  logDependencyVitals(app, dependency) {
    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
      }

      const sqlReq = new mssql.Request(pool);

      sqlReq.input('api_url', mssql.NVarChar(1000), app.api_url);
      sqlReq.input('dep_name', mssql.NVarChar(50), dependency.name);
      sqlReq.input('result', mssql.TinyInt, dependency.result);
      sqlReq.input('ping_ms', mssql.Int, dependency.ping_ms);
      sqlReq.input('hostname', mssql.NVarChar(50), dependency.hostname);
      sqlReq.input('error_desc', mssql.NVarChar(4000), dependency.error_desc);

      sqlReq
        .execute('dbo.SP_Add_Dependency_Log')
        .then(() => {
          console.log(
            'Successfully added log for dependency',
            dependency.name,
            'for application',
            app.product_name,
            'to Dependency_Logs table',
            '\n'
          );
          pool.close();
        })
        .catch(error => {
          console.log(error);
          console.trace();
        });
    });
  },

  initDb() {
    return new Promise((resolve, reject) => {
      const pool = new mssql.ConnectionPool(config, err => {
        if (err) {
          console.log(err);
          console.trace();
          reject(err);
          return;
        }

        const sqlReq = new mssql.Request(pool);

        return sqlReq
          .execute('dbo.SP_Tables_Do_Exist')
          .then(result => {
            if (result.returnValue === 1) {
              console.log('Tables already exist. Dropping them now...');
              pool.close();
              return dbClient.wipeDb(true).then(resolve).catch(reject);
            } else {
              return dbClient.buildDb().then(resolve).catch(reject);
            }
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    });
  },

  buildDb() {
    return new Promise((resolve, reject) => {
      const pool = new mssql.ConnectionPool(config, err => {
        if (err) {
          console.log(err);
          console.trace();
          reject(err);
          return;
        }

        const sqlReq = new mssql.Request(pool);

        return sqlReq
          .execute('dbo.SP_Create_Tables')
          .then(() => {
            console.log('Successfully created tables');
            pool.close();
            resolve();
          })
          .catch(err => {
            console.log(err);
            console.trace();
            reject(err);
          });
      });
    });
  },

  wipeDb(rebuild) {
    return new Promise((resolve, reject) => {
      const pool = new mssql.ConnectionPool(config, err => {
        if (err) {
          console.log(err);
          console.trace();
          reject(err);
          return;
        }

        const sqlReq = new mssql.Request(pool);

        return sqlReq
          .execute('dbo.SP_Drop_Tables')
          .then(() => {
            console.log('Successfully scrubbed db');
            pool.close();
            if (rebuild) {
              dbClient.buildDb().then(resolve).catch(reject);
            } else {
              resolve();
            }
          })
          .catch(err => {
            console.log(err);
            console.trace();
            reject(err);
          });
      });
    });
  },

  getAllAppUrls() {
    return new Promise((resolve, reject) => {
      const pool = new mssql.ConnectionPool(config, err => {
        if (err) {
          console.log(err);
          console.trace();
          reject(err);
          return;
        }
        const sqlReq = new mssql.Request(pool);

        return sqlReq
          .execute('dbo.SP_Select_All_URLs')
          .then(result => {
            resolve(result);
            pool.close();
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  },

  getAllApps() {
    return new Promise((resolve, reject) => {
      const pool = new mssql.ConnectionPool(config, err => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const sqlReq = new mssql.Request(pool);

        return sqlReq
          .execute('dbo.SP_Select_All_Applications')
          .then(result => {
            resolve(result);
            pool.close();
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  },

  deleteApp(id) {
    return new Promise((resolve, reject) => {
      const pool = new mssql.ConnectionPool(config, err => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const sqlReq = new mssql.Request(pool);
        sqlReq.input('app_id', mssql.Int, id);
        return sqlReq
          .execute('dbo.SP_Delete_Application')
          .then(result => {
            resolve(result);
            pool.close();
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }
};

exports.dbClient = dbClient;
