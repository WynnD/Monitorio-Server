const AppMonitor = require('./utils/app_monitor').AppMonitor;
let urlList = [
  // 'https://nursing.vizientinc.com/nrp-dashboard/api/monitor',
  // 'http://ews.uhc.edu/EWS2014/EWSMonitorService.svc/RunTests/test',
  // 'https://www.facultypractice.org/FPSCAppMonitor/api/AppMonitor/',
  'http://ews.uhc.edu/ews2012soap/ewsmonitor.asmx/RunTests?caller=monitoringAppName'
];

let appMonitor = new AppMonitor(urlList);

let monitor = appMonitor.monitor.bind(appMonitor);

setInterval(monitor, 5000);

/*
var jsonString = apiReq.getJsonFromRequest(null);
var object = apiReq.tryParseJsonString(jsonString);
console.log(object);

app.get('/', function(req, res) {
  res.send('I want to check on your credentials...');
});

app.listen(3000, function() {
  console.log('listening on port 3000');
});
*/
