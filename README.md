## 1. Quickly start

### installation

- Use npm

`npm i rrd-web-report-sdk`

- Use yarn

`yarn add rrd-web-report-sdk`

### Usage

- Import as a es6 module
```
import { WebReport } from 'rrd-web-report-sdk';
const report = new WebReport({
    domain: domain, // the target api to report
    extraData: {
        appId: appId // the unique key to identify where the report from  
    }
});
report.init();
```
- Import as a script tag

```
<html>
<head>
  <script src="../dist/rrd-web-report-sdk.js"></script>
  <script>
    const report = window.WebReport({
        domain: domain, // the target api to report
        extraData: {
            appId: appId // the unique key to identify where the report from  
        }
    });
    report.init();
  </script>
</head>
```

## 2. Configuration

##### domain
The target api. `default value: 'http://localhost/api'`
##### filterUrl 
Filter url that we don't want to report. `default value: []`
##### openVisitorReport 
Open PV/UV report or not. `default value: true`
##### openResourceReport 
Open resource report or not. `default value: true`
##### openAjaxReport 
Open ajax/fetch report or not. `default value: true`
##### openErrorReport
Open error message report or not. `default value: true`
##### openPerformanceReport
Open performance report or not. `default value: true`
##### extraData
Extra data including appId. `default value: {}`
##### loadReportDelay 
Report delay when we have to report when page onload. `default value: 5000`

## 3. Data Collection

TODO

## 4. Do report

We need to quickly report the PV/UV information when `loading rrd-web-report-sdk` rather than waiting for the page `onload`. It can make the PV/UV information more accurate.
```
{
	"time": 1563864488148,
	"markUv": "C43ipaDf1C1563864488148",
	"type": 10,
	"url": "http://127.0.0.1:9003/mo/about/media/articles/id/5923e08a59e5ea3d2f63a4fb",
	"appId": "wi3kSrS1555926862778"
}
```

We report the resource, performance and error information when the page `unload`. Because we can collect the whole information of the target page at that moment. And then we use `Navigator.sendBeacon()` method to report. Considering compatibility issues, we report those data when the page `onload` if the browser don't support `Navigator.sendBeacon()`.
By the way, those data sent by `Navigator.sendBeacon()` will have the default configuration `Content-type: text/plain` in `Request Header`.

```
{
	"time": 1563864563430,
	"markUv": "C43ipaDf1C1563864488148",
	"markUser": "tGJWiKipR91563864563430",
	"isFirstIn": true,
	"resourceList": [{
		"name": "http://127.0.0.1:9003/ms/static/common/static/css/base.css",
		"method": "GET",
		"type": "link",
		"duration": "12.96",
		"decodedBodySize": 14248,
		"nextHopProtocol": "http/1.1"
	},{
		"name": "http://127.0.0.1:9003/ms/static/nm/fbjs/lib/shallowEqual.js",
		"method": "GET",
		"type": "script",
		"duration": "180.45",
		"decodedBodySize": 1472,
		"nextHopProtocol": "http/1.1"
	}],
	"performance": {
		"dnst": 0,
		"tcpt": 0,
		"wit": 105,
		"domt": 1078,
		"lodt": 1122,
		"radt": 9,
		"rdit": 0,
		"uodt": 0,
		"reqt": 94,
		"andt": 44
	},
	"type": 1,
	"url": "http://127.0.0.1:9003/mo/about/media/articles/id/5923e08a59e5ea3d2f63a4fb",
	"errorList": [],
	"appId": "fsdfwr2f34f34f34f3"
}
```