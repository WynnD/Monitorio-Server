const parser = require('./parser').parser;
const db = require('./db').dbClient;
const network = require('./network').network_layer;

class AppMonitor {
  constructor(initialUrlList) {
    db
      .initDb()
      .then(() => {
        console.log('Finished initializing db');
        this.addAppsForTest(initialUrlList);
      })
      .catch(err => {
        console.log(err);
      });
  }

  addAppsForTest(urlList) {
    let index = 0;
    urlList.forEach(url => {
      let newApp = {
        app_name: 'AppNameGoesHere' + index,
        api_url: url,
        notify_email: 'wynnd5595@gmail.com;'
      };
      this.addMonitoredApplication(newApp);
      index++;
    });
  }

  monitor() {
    let urlList = [];
    db
      .getAllAppUrls()
      .then(result => {
        result.recordset.forEach(function(row) {
          urlList.push(row.api_url);
        });
        urlList.forEach(this.getAppVitals);
      })
      .catch(err => {
        console.log(err);
      });

    this.urlList = urlList;
  }

  addMonitoredApplication(newIncompleteApp) {
    network
      .getApiResponse(newIncompleteApp.api_url)
      .then(result => {
        let responseObject = parser.getResponseObject(result);
        let newCompleteApp = parser.getFormattedAppFromResponse(
          responseObject,
          newIncompleteApp
        );
        db
          .addApp(newCompleteApp)
          .then(() => {
            db.addDeps(newCompleteApp);
          })
          .catch(err => {
            console.error(err);
          });
      })
      .catch(err => {
        console.error(err);
      });
  }

  getAppVitals(url) {
    network
      .getApiResponse(url)
      .then(result => {
        let responseObject = parser.getResponseObject(result);
        let newApp = {
          api_url: url
        };
        let appVitals = parser.getFormattedAppFromResponse(
          responseObject,
          newApp
        );
        db.logAppAndDepVitals(appVitals);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

exports.AppMonitor = AppMonitor;
