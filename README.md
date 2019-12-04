English | [简体中文](https://github.com/Jibacat/web-report-sdk/blob/master/RM-CN.md)

<h1 align="center">subao-sdk</h1>

**subao-sdk** is a powerful web reporting SDK that can report **visitor data** (such as PV and UV), **performance data** (including page load performance and resource data, etc.) and **Error data** (including resource loading errors, js runtime errors, ajax request errors, etc.). Users can use the reported data to generate statistics to help you **monitor site performance**, **count user behaviorr**, and **discover unknown errors in the project**.


## Environment

| <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" /></br>IE / Edge | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/firefox_48x48.png" alt="Firefox" width="24px" height="24px" /></br>Firefox | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/chrome_48x48.png" alt="Chrome" width="24px" height="24px" /></br>Chrome | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/safari_48x48.png" alt="Safari" width="24px" height="24px" /></br>Safari | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/opera_48x48.png" alt="Opera" width="24px" height="24px" /></br>Opera | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/robot-tiny.png" alt="Android webview"/><br>Android webview | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" /></br>Safari on iOS |
| --- | --- | --- | --- | --- | --- | --- |
| <div align="center">IE 9, Edge 12</div> | <div align="center">7</div> | <div align="center">6</div> | <div align="center">11</div> | <div align="center">15</div>| <div align="center">Yes</div> | <div align="center">11</div> |


## Quickly start

### Installation

*Use npm*

`npm i subao-sdk`

*Use yarn*

`yarn add subao-sdk`

### Usage

*Import as a es6 module*
```
import { WebReport } from 'subao-sdk';
const report = new WebReport({
  appId: 'application-name', // a unique key to identify the different application
  domain: 'localhost:8000/report', // the target to report
});
report.init();
```

*Import as a script tag*

```
<html>
<head>
  <script src="/dist/subao-sdk.min.js"></script>
  <script>
    var report = new WebReport({
	  appId: 'application-name', // a unique key to identify the different application
	  domain: 'localhost:8000/report', // the target to report
    });
    report.init();
  </script>
</head>
```

### Local debugging

Execute `npm run dev` in the project root directory to start the local service, and then access the test page by accessing `localhost:9888` through the browser. The page has been reported to the SDK. After accessing the page, you can see the real report data of the printed browser in the console.


## Configuration

**domain** *`string`*

The target to report. `default value: ''`

**filterUrl** *`string[]`*

Filter url that we don't want to report. `default value: []`

**openVisitorReport** *`boolean`*

Open PV/UV report or not. `default value: true`

**openErrorReport** *`boolean`*

Open error message report or not. `default value: true`

**openPerformanceReport** *`boolean`*

Open performance report or not. `default value: true`

**appId** *`string`*

Extra data including appId. `default value: ''`

**subaoUserId** *`string`*

Extra data including appId. `default value: ''`

**loadReportDelay** *`number`*

If the browser does not support the `navigator.sendBeacon` method, we will report the performance information of the page after the page `load` is delayed by `loadReportDelay`. `default value: 5000`.

**urlHelper** *`{ rule: RegExp, target: string }`*

Replace type with the value of url in the `resource` and` error` reports. `default value: { rule: /\/([a-z\-_]+)?\d{2,20}/g, target: '/$1**' }`

**ajaxHelper** *`{ rule: RegExp, target: string }`*

Replace type with the value of url in the `ajax` report.  `default value: { rule: /(\w+)\/\d{2,}/g, target: '$1' }`

## Generate reported data

### Visitor Data

It is used to record the access information of the page. After the server obtains the data, it can be used to count the **PV, UV**, etc. of the page.

For UV data generation, we will add the **uvExpireTime** field to the **localstorage**, which records the timestamp of the day 23:59:59. Each visit compares the current timestamp with the timestamp saved in **uvExpireTime** to calculate whether to add UV.

#### Data Description

**type**

The type of data reported. `value: 'pv'`

**appId**

unique application id。`value: from the Configuration`

**subaoUserId**

unique user id。`value: from the Configuration`

**accessId**

The id of the visit. The value of this field is the same in multiple reports of the same visit. `value: random string`

**accessTime**

Current timestamp. `value: timestamp`

**pageUrl**

Full url of the page `value: window.location.href`

**referrer**

Where the page was accessed from. `value: document.referrer`

**markUv**

Whether to increase UV。`value: true/false`。

#### Example

```
{
	accessId: "dzasARcLlHxKrmezx86DpJOzjycOgd"
	accessTime: 1566462963295
	appId: "111"
	markUv: false
	pageUrl: "http://localhost:9888/"
	referrer: ""
	subaoUserId: "12345"
	type: "pv"
}
```

### Performance data

Performance data is used to record performance information of the page, including the time spent by the browser in processing each stage of the web page, the resources for requesting success, and the like. After the server receives the data, it can be used to analyze the **page performance**.

We use the `performance.timing` method to get the time spent on each stage of the page. For resources that are successfully requested by the page, we use the `performance.getEntriesByType('resource')` method to get it. Since the obtained resource data contains a lot of resources that are not helpful for performance analysis, we only intercept some of its useful fields for reporting.

![timing](https://www.w3.org/TR/navigation-timing/timing-overview.png)

#### Data Description

**type**

The type of data reported. `value: 'performance'`

**appId**

unique application id。`value: from the Configuration`

**subaoUserId**

unique user id。`value: from the Configuration`

**accessId**

The id of the visit. The value of this field is the same in multiple reports of the same visit. `value: random string`

**timing**

The time it takes for the browser to process each stage of the page. `value: performance.timing`

**resource**

The resource successfully loaded by the page. `value: performance.getEntriesByType('resource')`

**tp**

time on page。`value: exit timestamp - entrance timestamp`


#### Example
```
{ 
  accessId: '16e3c8c0-ea79-11e9-b13e-ebcdab337463',
  tp: 1155650,
  resource:
   [ { name: 'https://cdn.bootcss.com/jquery/3.4.1/core.js',
       query: '?a=1&b=2',
       originUrl: 'https://cdn.bootcss.com/jquery/3.4.1/core.js?a=1&b=2',
       initiatorType: 'script',
       duration: 0,
       decodedBodySize: 9165,
       nextHopProtocol: 'h2' },
     { name: 'https://cdn.bootcss.com/jquery/3.4.0/core.js',
       query: '',
       originUrl: 'https://cdn.bootcss.com/jquery/3.4.0/core.js',
       initiatorType: 'script',
       duration: 0,
       decodedBodySize: 9165,
       nextHopProtocol: 'h2' } ],
  timing:
   { navigationStart: 1570614140718,
     unloadEventStart: 1570614140729,
     unloadEventEnd: 1570614140730,
     redirectStart: 0,
     redirectEnd: 0,
     fetchStart: 1570614140719,
     domainLookupStart: 1570614140719,
     domainLookupEnd: 1570614140719,
     connectStart: 1570614140719,
     connectEnd: 1570614140719,
     secureConnectionStart: 0,
     requestStart: 1570614140724,
     responseStart: 1570614140724,
     responseEnd: 1570614140725,
     domLoading: 1570614140732,
     domInteractive: 1570614140758,
     domContentLoadedEventStart: 1570614140758,
     domContentLoadedEventEnd: 1570614140758,
     domComplete: 1570614140773,
     loadEventStart: 1570614140773,
     loadEventEnd: 1570614140773 },
  type: 'performance',
  appId: '111',
  subaoUserId: '12345' 
}
```

### Error Data

We will listen and report the page **error** via the three methods `window.addEventListener('error')`, `window.onerror`, `window.addEventListener('unhandledrejection')`.

For error catching, we prefer to use `window.onerror` because it is more compatible and can get detailed **error** information (including the rows, columns, etc. that generated the error). But when a resource (eg img, script) fails to load, the element that loads the resource triggers a **error** event of the **Event** interface and executes the `onerror()` on the **element Processing function**. The element's **error** event does not bubble up to **window**, which means it won't be caught by `window.onerror`.

So we need to introduce `window.addEventListener('error')` to catch the loading error of the resource. After that, in order to avoid repeated reporting by `window.onerror` and `window.addEventListener('error')` catching an error at the same time, we filter the **event** of `window.addEventListener('error')`. Only `event.srcElement instanceof `**HTMLScriptElement**, **HTMLLinkElement**, **HTMLImageElement** will be reported.


#### Data Description

**type**

The type of data reported. `value: 'performance'`

**appId**

unique application id。`value: from the Configuration`

**subaoUserId**

unique user id。`value: from the Configuration`

**accessId**

The id of the visit. The value of this field is the same in multiple reports of the same visit. `value: random string`

**errorList**

Error list. `value: []`


#### Example
```
{ accessId: '25913900-eb0c-11e9-9a93-7f3742272096',
  type: 'error',
  appId: '111',
  subaoUserId: '12345',
  errorList:
   [ { url: 'http://localhost:9888/static/a.css',
       originUrl: 'http://localhost:9888/static/a.css',
       query: '',
       time: 1570677301430,
       message: 'link is loading failed',
       type: 'resource' },
     { url: 'http://localhost:9888/static/a/**.js',
       originUrl: 'http://localhost:9888/static/a/321321.js',
       query: '',
       time: 1570677301431,
       message: 'script is loading failed',
       type: 'resource' },
     { url: 'http://localhost:9888/static/image.png',
       originUrl: 'http://localhost:9888/static/image.png?a=123',
       query: '?a=123',
       time: 1570677301500,
       message: 'img is loading failed',
       type: 'resource' },
     { url: '/static/aaa',
       method: 'post',
       query: '?data=123&dd=333',
       originUrl: '/static/aaa/312321?data=123&dd=333',
       time: 1570677301506,
       message: 'fetch request error, statusText: Not Found, status: 404',
       type: 'ajax' },
     { url: '/static/aaa',
       method: 'get',
       query: '?data=123&dd=333',
       originUrl: '/static/aaa/312321?data=123&dd=333',
       time: 1570677301528,
       message: 'fetch request error, statusText: Not Found, status: 404',
       type: 'ajax' },
     { url: '/static/bbb',
       query: '?a=1&b=2',
       method: 'post',
       originUrl: '/static/bbb/43?a=1&b=2',
       time: 1570677301534,
       message: 'ajax request error, statusText: Not Found, status: 404',
       type: 'ajax' }]
}
```


## Report data

### Visitor report

For the user's **visitor data**, our goal is **data volume** as accurate as possible, after all, this report is used as a data source for **PV, UV** statistics, and The **PV, UV** statistical is focused on the amount and not on the quality. Therefore, we will **as far as possible** for the **visitor data** report, to avoid missing the user **short-term access** page. So when the SDK is **initialized** (init), we collect and report the **visitor data** to the server. In addition, in order to avoid the impact of compatibility issues as much as possible, the **visitor data** report uses the **native ajax** method.

### Performance report

For **performance data**, we will report it on page `unload`, because the user's behavior will only end when `unload`, and the collected data is the most comprehensive. And the performance report **on the page** `load` may miss a lot of data, because even after the page `load`, the user's next behavior (such as: click, scroll, etc.) may trigger new resource loading and Ajax request.

In order to allow us to report data smoothly in `unload`, **Performance reporting** uses the [Navigator.sendBeacon](https://developer.mozilla.org/en-us/docs/Web/API/Navigator/sendBeacon) method, which will send data asynchronously to the server on page `unload` without delaying the `unload` of the page.

`Navigator.sendBeacon` does not support setting the `Content-Type` of the request header, although it can be implemented with [Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob) encapsulation. However, considering the Blob compatibility issue, I gave up adding `Content-Type` and unified the default value of `text/plain` for reporting.

Considering the `Navigator.sendBeacon` compatibility issue, someone will select the page `unload` to report with **sync ajax** when the `Navigator.sendBeacon` method is not supported, but this will cause the page uninstallation to be delayed, **Seriously affect the user experience**. Our solution is to choose to delay the actual performance of the performance after the page `load`. As mentioned earlier, this reporting opportunity may miss some resource data. But compared to the catastrophic impact of **sync ajax** on user access, we prefer to make sacrifices in reporting. Moreover, the statistics tell us that the current user equipment that already has [90%](https://caniuse.com/#search=sendBeacon) supports the `Navigator.sendBeacon` method. So let's ignore the subtle data differences that may be brought about for the time being.

### Error report

In general, every time `error` is captured, it will trigger a **error report**, but in order to avoid excessive short-term errors (for example: errors caused by `scroll` events), the number of reports is excessive, we are wrong The report is anti-shake, and the error data will be added to `errorList` first. If there is no new error trigger within 2000ms, it will be reported. Wrong reporting will also take the form of **native ajax**.

#### Manually report errors
By reason of the error event cannot monitor the **Error** that has been caught, we can call the **manualReportError** method in the **webReport instance** to manually report it when we need, provided that you have instantiated WebReport. The **manualReportError** method will also perform debounce processing within 2000ms.
```
var report = new window.WebReport({
    domain: '/report',
    appId: '111',
    subaoUserId: '12345',
    filterUrl: ['/report', 'subao-sdk']
});

function myFunction() {
    try {
        throw new Error('caught error')
    } catch(err) {
        report.manualReportError({
            url: 'www.renrendai.com/sw.js',
            message: 'Unexpected error'
      });
    }
}

```

## Reference document

https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon

https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers/onerror

http://www.aliued.com/?p=4172

http://www.alloyteam.com/2015/09/explore-performance/

https://blog.seosiwei.com/detail/30
