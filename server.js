const app = require('express')();
const AppMonitor = require('./utils/appMonitor').AppMonitor;
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const refreshRate = 5000;

let urlList = [/*
  'https://nursing.vizientinc.com/nrp-dashboard/api/monitor',
  'http://ews.uhc.edu/EWS2014/EWSMonitorService.svc/RunTests/test', */
  'https://www.facultypractice.org/FPSCAppMonitor/api/AppMonitor/',
  'http://ews.uhc.edu/ews2012soap/ewsmonitor.asmx/RunTests?caller=monitoringAppName'
];

let appMonitor = new AppMonitor(urlList);

let monitor = appMonitor.monitor.bind(appMonitor);

setInterval(monitor, refreshRate);

app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/get-apps', (req, res) => {
  appMonitor.sendAppList(res);
});

app.get('/delete-app', (req, res) => {
  const app_id = parseInt(req.query.id, 10);
  console.log('Received request to delete app with id', app_id);
  appMonitor.deleteApp(app_id, res);
});

app.get('/refresh-rate', (req, res) => {
  res.send({ refreshRate }).status(200);
});

app.get('/current-vitals', (req, res) => {
  appMonitor.sendCurrentVitals(res);
});

app.post('/toggle', (req, res) => {
  const appId = req.body.id;
  console.log('Recieved request to toggle app with id', appId);
  appMonitor.toggleApplication(appId, res);
});

app.post('/add-app', (req, res) => {
  const appInfo = req.body;
  console.log('Recieved request to add app with info', appInfo);
  appMonitor.addMonitoredApplication(appInfo, res);
});

app.listen(2000, () => {
  console.log('listening on port 2000');
});
