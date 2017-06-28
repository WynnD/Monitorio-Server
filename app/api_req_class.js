const request = require('request');
const parseString = require('xml2js').parseString;
const mssql = require('mssql/msnodesqlv8');
const util = require('util');

exports.AppMonitor = class {
  constructor(initialUrlList) {
    this.initialUrlList = initialUrlList;
    this.sqlConfig = {
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

    let ifTablesExistWipeDb = this.ifTablesExistWipeDb.bind(this);
    ifTablesExistWipeDb(this.ifTablesExistWipeDb);
    // this.buildDb();
  }

  ifTablesExistWipeDb() {
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

    let wipeDb = this.wipeDb.bind(this);

    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
        return;
      }

      const sqlReq = new mssql.Request(pool);

      return sqlReq
        .execute('dbo.SP_Tables_Do_Exist')
        .then(result => {
          if (result.returnValue) {
            console.log('Tables already exist. Dropping them now...');
            pool.close();
            wipeDb(true);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  buildDb() {
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

    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
        return;
      }

      const sqlReq = new mssql.Request(pool);

      return sqlReq
        .execute('dbo.SP_Create_Tables')
        .then(result => {
          console.log('Successfully created tables');
          pool.close();
          this.addInitialAppsToDb();
        })
        .catch(err => {
          console.log(err);
          console.trace();
        });
    });
  }

  wipeDb(rebuild) {
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

    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
        return;
      }

      const sqlReq = new mssql.Request(pool);

      return sqlReq
        .execute('dbo.SP_Drop_Tables')
        .then(result => {
          console.log('Successfully scrubbed db');
          pool.close();
          if (rebuild) {
            this.buildDb();
          }
        })
        .catch(err => {
          console.log(err);
          console.trace();
        });
    });
  }

  addInitialAppsToDb() {
    let index = 0;
    this.initialUrlList.forEach(url => {
      let newApp = {
        app_name: 'AppNameGoesHere' + index,
        api_url: url,
        notify_email: 'wynnd5595@gmail.com;'
      };
      this.addMonitoredApplication(newApp);
      index++;
    });
  }

  loop() {
    let monitor = this.monitor.bind(this);
    monitor();
  }

  monitor() {
    let urlList = [];
    let getAppVitals = this.getAppVitals.bind(this);

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

    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
        return;
      }
      const sqlReq = new mssql.Request(pool);

      return sqlReq.execute('dbo.SP_Select_All_URLs').then(result => {
        result.recordset.forEach(function(row) {
          urlList.push(row.api_url);
        });

        urlList.forEach(getAppVitals);
        pool.close();
      });
    });

    this.urlList = urlList;
  }

  addMonitoredApplication(newIncompleteApp) {
    let getResponseObject = this.getResponseObject.bind(this);
    let formatAppInfo = this.formatAppInfo.bind(this);
    let addAppToDb = this.addAppToDb.bind(this);
    let addDepsToDb = this.addDepsToDb.bind(this);

    request(newIncompleteApp.api_url, function(error, response, body) {
      if (error) {
        console.log(error);
        return;
      }
      let responseObject = getResponseObject(body);
      let newCompleteApp = formatAppInfo(responseObject, newIncompleteApp);
      addAppToDb(newCompleteApp);
      addDepsToDb(newCompleteApp);
    });
  }

  getAppVitals(url) {
    let getResponseObject = this.getResponseObject.bind(this);
    let formatAppVitals = this.formatAppVitals.bind(this);
    let logVitalsInDb = this.logVitalsInDb.bind(this);
    let logDependencyVitalsInDb = this.logDependencyVitalsInDb.bind(this);
    request(url, function(error, response, body) {
      if (error) {
        console.log(error);
      }

      try {
        let responseObject = getResponseObject(body);
        let appVitals = formatAppVitals(responseObject, url);
        console.log(appVitals.dependencies);
        logVitalsInDb(appVitals);
        logDependencyVitalsInDb(appVitals);
      } catch (error) {
        console.error(error);
      }
    });
  }

  addAppToDb(appInfo) {
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

    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
      }

      const sqlReq = new mssql.Request(pool);
      sqlReq.input('app_name', mssql.NVarChar(50), appInfo.app_name);
      sqlReq.input('product_id', mssql.Int, appInfo.product_id);
      sqlReq.input('product_name', mssql.NVarChar(50), appInfo.product_name);
      sqlReq.input('api_url', mssql.NVarChar(1000), appInfo.api_url);
      sqlReq.input('notify_email', mssql.NVarChar(1000), appInfo.notify_email);

      sqlReq
        .execute('dbo.SP_Add_Application')
        .then(result => {
          console.log('Adding application', appInfo.app_name, 'successful');
          pool.close();
        })
        .catch(error => {
          if (error) {
            console.log(error);
            console.trace();
          }
        });
    });
  }

  addDepToDb(appInfo, dependency) {
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

    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
      }

      const sqlReq = new mssql.Request(pool);

      sqlReq.input('api_url', mssql.NVarChar(1000), appInfo.api_url);
      sqlReq.input('dep_name', mssql.NVarChar(50), dependency.name);

      sqlReq
        .execute('dbo.SP_Add_Dependency')
        .then(result => {
          console.log(
            'Successfully added dependency',
            dependency.name,
            'for application',
            appInfo.product_name,
            'into Dependencies table',
            '\n'
          );
          pool.close();
        })
        .catch(error => {
          console.log(error);
          console.trace();
        });
    });
  }

  addDepsToDb(appInfo) {
    appInfo.dependencies.forEach(dependency => {
      this.addDepToDb(appInfo, dependency);
    });
  }

  logVitalsInDb(appVitals) {
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

    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
      }

      const sqlReq = new mssql.Request(pool);

      sqlReq.input('api_url', mssql.NVarChar(1000), appVitals.api_url);
      sqlReq.input('result', mssql.TinyInt, appVitals.result);
      sqlReq.input('result_f5', mssql.TinyInt, appVitals.result_f5);
      sqlReq.input('ping_ms', mssql.Int, appVitals.ping_ms);
      sqlReq.input('hostname', mssql.NVarChar(50), appVitals.hostname);
      sqlReq.input('error_desc', mssql.NVarChar(4000), appVitals.error_desc);

      sqlReq
        .execute('dbo.SP_Add_Application_Log')
        .then(result => {
          console.log(
            'Successfully added log for application',
            appVitals.product_name,
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

    // console.log(appVitals.dependencies);
    appVitals.dependencies.forEach(dep => {
      console.log(dep);
      this.logDependencyVitalsInDb(appVitals, dep);
    });
  }

  logDependencyVitalsInDb(appVitals, dependency) {
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

    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        console.log(err);
        console.trace();
      }

      const sqlReq = new mssql.Request(pool);
      console.log(dependency);
      sqlReq.input('api_url', mssql.NVarChar(1000), appVitals.api_url);
      sqlReq.input('dep_name', mssql.NVarChar(50), dependency.name);
      sqlReq.input('result', mssql.TinyInt, dependency.result);
      sqlReq.input('ping_ms', mssql.Int, dependency.ping_ms);
      sqlReq.input('hostname', mssql.NVarChar(50), dependency.hostname);
      sqlReq.input('error_desc', mssql.NVarChar(4000), dependency.error_desc);

      sqlReq
        .execute('dbo.SP_Add_Dependency_Log')
        .then(result => {
          console.log(
            'Successfully added log for dependency',
            dependency.name,
            'for application',
            appVitals.product_name,
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
  }

  getResponseObject(response) {
    let responseObject = {};
    responseObject.MonitorResult = this.tryParseJsonString(response);
    if (responseObject.MonitorResult) {
      console.log('response is in JSON format');
    } else {
      console.log('response is in XML format: Converting to JSON');
      parseString(
        response,
        { mergeAttrs: true, explicitArray: false },
        (err, result) => {
          if (err) {
            console.log(err);
          }
          responseObject = result;
        }
      );
    }
    return responseObject;
  }

  moveAttributes(responseObject) {
    for (let prop in responseObject.MonitorResult._attributes) {
      responseObject.MonitorResult[prop] =
        responseObject.MonitorResult._attributes[prop];
    }
  }

  tryParseJsonString(jsonString) {
    try {
      let o = JSON.parse(jsonString);
      if (o && typeof o === 'object') {
        return o;
      }
    } catch (e) {}

    return false;
  }

  formatAppInfo(responseObject, newApp) {
    newApp.product_name = responseObject.MonitorResult.ProductName;
    newApp.product_id = responseObject.MonitorResult.ProductID;
    newApp.dependencies = this.getDependenciesList(
      responseObject.MonitorResult.TestResults
    );
    return newApp;
  }

  formatAppVitals(responseObject, url) {
    let x = {};
    try {
      x.product_name = responseObject.MonitorResult.ProductName;
      x.product_id = responseObject.MonitorResult.ProductID;
      x.result = responseObject.MonitorResult.OverallResult === 'true' ? 1 : 0;
      x.result_f5 = responseObject.MonitorResult.ResultForF5Monitor === 'true'
        ? 1
        : 0;
      x.api_url = url;
      x.host_name = responseObject.MonitorResult.HostName;
      x.ping_ms = (responseObject.MonitorResult.TimeTakenSecs * 1000.0).toFixed(
        0
      );
      x.error_desc = responseObject.MonitorResult.ContextData === undefined
        ? ''
        : responseObject.MonitorResult.ContextData;
    } catch (error) {
      console.error();
    }

    x.dependencies = this.getDependenciesList(
      responseObject.MonitorResult.TestResults
    );
    // console.log(x.dependencies);
    return x;
  }

  getDependenciesList(testResults) {
    let dependencies = [];

    if (testResults === undefined) {
      return dependencies;
    }

    testResults = testResults.TestResult;

    if (Array.isArray(testResults)) {
      testResults.forEach(function(testResult) {
        let dependencyObject = {};
        dependencyObject.name = testResult.Name;
        dependencyObject.result = testResult.Result;
        dependencyObject.ping_ms = (testResult.TimeTakenSecs * 1000.0).toFixed(
          0
        );
        dependencies.push(dependencyObject);
      });
    } else {
      dependencies = [];
      let dependencyObject = {};
      dependencyObject.name = testResults.Name;
      dependencyObject.result = testResults.Result;
      dependencyObject.ping_ms = (testResults.TimeTakenSecs * 1000.0).toFixed(
        0
      );
      dependencies.push(dependencyObject);
    }
    return dependencies;
  }
};
