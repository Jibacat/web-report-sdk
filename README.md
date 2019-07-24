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

#### PV/UV

We use a random string to mark `UV` and get the `UV expired time`(today's 23:59:59). And then we store them to localstorage. When  the current time exceeds `UV expired time`, we will refresh them in localstorage to make sure to generate the different UV string in different day. `UV` string will be added to `reportData` as `markUv`.

We will report once when we `init rrd-web-report-sdk` with a `type` property equal `10`. We call this first report `PV/UV report`. Because the server can analyse the length of report which has the `type` equal `10` to get the `PV` today.

#### performance

We use `window.performance.timing` to get the performance information. And we don't have to calculate all timing data. We only need calculate the necessary time that can reflect the performance of the page accurately. The performance information will be added to `performance` in `reportData`.

```
// Time to analyse DNS 
dnst: timing.domainLookupEnd - timing.domainLookupStart || 0,
// Time to setup TCP
tcpt: timing.connectEnd - timing.connectStart || 0,
// Time to read the first byte of the page
wit: timing.responseStart - timing.navigationStart || 0,
// Time to render DOM completely
domt: timing.domContentLoadedEventEnd - timing.navigationStart || 0,
// Time to onload
lodt: timing.loadEventEnd - timing.navigationStart || 0,
// Time to send the first request
radt: timing.fetchStart - timing.navigationStart || 0,
// Time to redirect
rdit: timing.redirectEnd - timing.redirectStart || 0,
// Time to unload
uodt: timing.unloadEventEnd - timing.unloadEventStart || 0,
// Time to load content
reqt: timing.responseEnd - timing.requestStart || 0,
// Time to analyse DOM
andt: timing.domComplete - timing.domInteractive || 0,
```

#### resource

We use `window.performance.getEntriesByType('resource')` method to get the whole resource information. Besides we don't need every property from each data, just reserve `decodedBodySize` `duration` `method` `name` `nextHopProtocol` `type`. The resource information will be added to `resourceList` in `reportData`.

#### error

We want to collect the whole error in the target page such as `resource error`, `dom error` and `ajax error`. So we use `addEventListener` to watch the `error` and `unrejectederror`. We also use a hook to catch the `ajax` and `fetch` error.All of the error will be added to `errorList` in `reportData`


## 4. Do report

We need to quickly report the PV/UV information when `init rrd-web-report-sdk` rather than waiting for the page `onload`. It can make the PV/UV information more accurate.
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

## 5. Reference document

https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon

http://www.aliued.com/?p=4172

http://www.alloyteam.com/2015/09/explore-performance/

https://blog.seosiwei.com/detail/30
