const parseString = require('xml2js').parseString;

let parser = {
  tryParseJsonString(jsonString) {
    try {
      let o = JSON.parse(jsonString);
      if (o && typeof o === 'object') {
        return o;
      }
    } catch (e) {}

    return false;
  },

  getResponseObject(response) {
    let responseObject = {};
    responseObject.MonitorResult = parser.tryParseJsonString(response);
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
  },

  formatAppInfo(responseObject, newApp) {
    newApp.product_name = responseObject.MonitorResult.ProductName;
    newApp.product_id = responseObject.MonitorResult.ProductID;

    return newApp;
  },

  getFormattedAppFromResponse(responseObject, incompleteApp) {
    let dependenciesList = parser.getDependenciesList(
      responseObject.MonitorResult.TestResults
    );

    let x = {
      app_name: incompleteApp.app_name,
      product_name: responseObject.MonitorResult.ProductName,
      product_id: responseObject.MonitorResult.ProductID,
      result: responseObject.MonitorResult.OverallResult === 'true' ? 1 : 0,
      result_f5: responseObject.MonitorResult.ResultForF5Monitor === 'true'
        ? 1
        : 0,
      api_url: incompleteApp.api_url,
      host_name: responseObject.MonitorResult.HostName,
      ping_ms: (responseObject.MonitorResult.TimeTakenSecs * 1000.0).toFixed(0),
      error_desc: responseObject.MonitorResult.ContextData === undefined
        ? ''
        : responseObject.MonitorResult.ContextData,
      dependencies: dependenciesList
    };
    return x;
  },

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
        dependencyObject.result = testResult.Result === 'true' ? 1 : 0;
        dependencyObject.ping_ms = (testResult.TimeTakenSecs * 1000.0).toFixed(
          0
        );
        dependencies.push(dependencyObject);
      });
    } else {
      dependencies = [];
      let dependencyObject = {};
      dependencyObject.name = testResults.Name;
      dependencyObject.result = testResults.Result === 'true' ? 1 : 0;
      dependencyObject.ping_ms = (testResults.TimeTakenSecs * 1000.0).toFixed(
        0
      );
      dependencies.push(dependencyObject);
    }
    return dependencies;
  }
};

exports.parser = parser;
