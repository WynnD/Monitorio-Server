import request from 'request';
import x2j from 'xml2json';

export default class AppMonitor {
  constuctor(urlList, interval) {
    this.urlList = urlList;
    this.vitalsList = [];
    setInterval(this.loop, interval);
  }

  loop() {
    this.vitalsList = [];
    this.urlList.forEach(this.fetchInfo);
    this.printStatusInfo();
  }

  fetchInfo(url) {
    request(url, function(error, response, body) {
      if (error) {
        console.log(error);
      }
      console.log('STATUS CODE: ', response && response.statusCode);
      let jsonText = x2j.toJson(body);
      let responseObject = tryParseJsonString(jsonText);
      buildAppVitalsList(responseObject);
      printStatusInfo();
    });
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

  buildAppVitalsList(responseObject) {
    let x = {};

    x.product_name = responseObject.MonitorResult.ProductName;
    x.product_id = responseObject.MonitorResult.ProductID;
    x.result = responseObject.MonitorResult.OverallResult;
    x.f5_result = responseObject.MonitorResult.ResultForF5Monitor;
    x.host_name = responseObject.MonitorResult.HostName;
    x.ping_ms = (responseObject.MonitorResult.TimeTakenSecs * 1000.0).toFixed(
      0
    );
    this.VitalsList.push(x);
  }

  printStatusInfo() {
    this.appVitalsList.forEach(function(appVitals) {
      console.log(
        ' Name:',
        appVitals.product_name,
        '\n',
        'Product ID:',
        appVitals.product_id,
        '\n',
        'Host Name:',
        appVitals.host_name,
        '\n',
        'Ping:',
        appVitals.ping_ms,
        'ms\n',
        'App Status:',
        appVitals.result === 'true' ? 'Running' : 'Down',
        '\n',
        'F5 Status:',
        appVitals.result === 'true' ? 'Running' : 'Down',
        '\n'
      );
    });
  }
}

function loop(url) {
  request('https://nursing.vizientinc.com/nrp-dashboard/api/monitor', function(
    error,
    response,
    body
  ) {
    if (error) {
      console.log(error);
    }
    console.log('STATUS CODE: ', response && response.statusCode);
    let jsonText = x2j.toJson(body);
    let responseObject = tryParseJsonString(jsonText);
    let vitalsList = buildAppVitalsList([responseObject]);
    printStatusInfo(vitalsList);
  });
}

function tryParseJsonString(jsonString) {
  try {
    let o = JSON.parse(jsonString);
    if (o && typeof o === 'object') {
      return o;
    }
  } catch (e) {}

  return false;
}

function buildAppVitalsList(responseObjectList) {
  let appVitalsList = [];
  responseObjectList.forEach(function(responseObject) {
    let x = {};

    x.product_name = responseObject.MonitorResult.ProductName;
    x.product_id = responseObject.MonitorResult.ProductID;
    x.result = responseObject.MonitorResult.OverallResult;
    x.f5_result = responseObject.MonitorResult.ResultForF5Monitor;
    x.host_name = responseObject.MonitorResult.HostName;
    x.ping_ms = (responseObject.MonitorResult.TimeTakenSecs * 1000.0).toFixed(
      0
    );

    appVitalsList.push(x);
  });

  return appVitalsList;
}

function printStatusInfo(appVitalsList) {
  appVitalsList.forEach(function(appVitals) {
    console.log(
      ' Name:',
      appVitals.product_name,
      '\n',
      'Product ID:',
      appVitals.product_id,
      '\n',
      'Host Name:',
      appVitals.host_name,
      '\n',
      'Ping:',
      appVitals.ping_ms,
      'ms\n',
      'App Status:',
      appVitals.result === 'true' ? 'Running' : 'Down',
      '\n',
      'F5 Status:',
      appVitals.result === 'true' ? 'Running' : 'Down',
      '\n'
    );
  });
}

setInterval(loop, 10000);
