const app = require('express');

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

app.get('/getApps', function(req, res) {
  res.send(appList);
});

app.listen(2000, function() {
  console.log('listening on port 3000');
});
