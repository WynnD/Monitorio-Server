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
      .getAllEnabledAppUrls()
      .then(result => {
        result.recordset.forEach(function(row) {
          urlList.push(row.api_url);
        });
        urlList.forEach(this.logAppVitals);
      })
      .catch(err => {
        console.log(err);
      });

    this.urlList = urlList;
  }

  addMonitoredApplication(newIncompleteApp, response) {
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
            if (response) {
              response.sendStatus(200);
            }
          })
          .catch(err => {
            console.error(err);
            if (response) {
              response.status(400).send(err);
            }
          });
      })
      .catch(err => {
        console.error(err);
        if (response) {
          response.status(400).send(err);
        }
      });
  }

  logAppVitals(url) {
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

  sendAppList(response) {
    db
      .getAllAppsWithCurrentStatus()
      .then(result => {
        let apps = parser.parseAppListResponse(result);
        response.json(apps);
      })
      .catch(err => {
        console.log(err);
      });
  }

  deleteApp(id, response) {
    db
      .deleteApp(id)
      .then(() => {
        response.sendStatus(200);
      })
      .catch(err => {
        console.log(err);
        response.status(400).send(err);
      });
  }

  sendCurrentVitals(response) {
    db
      .getAllNewestAppVitals()
      .then(result => {
        console.log(result);
        response.status(200).send(result);
      })
      .catch(err => {
        console.log(err);
        response.status(400).send(err);
      });
  }

  toggleApplication(id, response) {
    db
      .toggleApplication(id)
      .then(result => {
        console.log(result);
        response.status(200).send(result);
      })
      .catch(err => {
        console.log(err);
        response.status(400).send(err);
      });
  }
}

exports.AppMonitor = AppMonitor;
