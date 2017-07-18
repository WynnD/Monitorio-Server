const app = require('express')();
const AppMonitor = require('./utils/app_monitor').AppMonitor;

let urlList = [
  'https://nursing.vizientinc.com/nrp-dashboard/api/monitor',
  'http://ews.uhc.edu/EWS2014/EWSMonitorService.svc/RunTests/test',
  'https://www.facultypractice.org/FPSCAppMonitor/api/AppMonitor/',
  'http://ews.uhc.edu/ews2012soap/ewsmonitor.asmx/RunTests?caller=monitoringAppName'
];

let appMonitor = new AppMonitor(urlList);

let monitor = appMonitor.monitor.bind(appMonitor);

setInterval(monitor, 5000);

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.get('/get-apps', function(req, res) {
  appMonitor.sendAppList(res);
});

app.get('/delete-app', function(req, res) {
  const app_id = parseInt(req.query.id, 10);
  console.log('Received request to delete app with id', app_id);
  appMonitor.deleteApp(app_id, res);
});

app.post('/add-app', function(req, res) {
  console.log(req.body);
  res.send(req.body);
});

app.listen(2000, function() {
  console.log('listening on port 2000');
});
