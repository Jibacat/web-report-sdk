
[English](http://gitlab.we.com/we-tech-fex/subao-sdk/blob/master/README.md) | 简体中文


<h1 align="center">速报SDK</h1>

**速报SDK**是一个功能强大的页面数据上报软件包，可以上报**访问数据**（例如PV和UV)、**性能数据**（包括页面加载性能和资源数据等）和**错误数据**（包括资源加载错误、js运行错误、ajax请求错误等）。用户可以使用上报的数据生成统计信息，以帮助您**监控站点性能**、**统计用户行为**以及**发现项目中的未知错误**等。 

## 环境

| <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" /></br>IE / Edge | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/firefox_48x48.png" alt="Firefox" width="24px" height="24px" /></br>Firefox | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/chrome_48x48.png" alt="Chrome" width="24px" height="24px" /></br>Chrome | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/safari_48x48.png" alt="Safari" width="24px" height="24px" /></br>Safari | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/opera_48x48.png" alt="Opera" width="24px" height="24px" /></br>Opera | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/robot-tiny.png" alt="Android webview"/><br>Android webview | <img src="https://s0.renrendai.com/cms/5864b0d6a24d131067ef7956/jimu/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" /></br>Safari on iOS |
| --- | --- | --- | --- | --- | --- | --- |
| <div align="center">IE 9, Edge 12</div> | <div align="center">7</div> | <div align="center">6</div> | <div align="center">11</div> | <div align="center">15</div>| <div align="center">Yes</div> | <div align="center">11</div> |

## 快速开始

### 安装

*使用 npm*

`npm i subao-sdk`

*使用 yarn*

`yarn add subao-sdk`

### 使用

*以es6模块的方式引入*
```
import { WebReport } from 'subao-sdk';
const report = new WebReport({
  	appId: 'application-name',
  	domain: 'localhost:8000/report',
});
report.init();
```
*以script标签的方式引入*

```
<html>
<head>
<script src="/dist/subao-sdk.min.js"></script>
<script>
	var report = new WebReport({
		appId: 'application-name',
		domain: 'localhost:8000/report',
	});
	report.init();
</script>
</head>
```

### 本地调试

在**subao-sdk**项目根目录下执行`npm run dev`启动本地服务，然后通过浏览器访问`localhost:9888`进入测试页面，页面已引入上报SDK。访问页面后可以在控制台中看到打印出来的浏览器真实上报数据。

## 详细配置

**domain** *`string`*

页面数据上报的地址。 `默认值: ''`

**filterUrl** *`string[]`*

那些我们不想上报的url。 `默认值: []`

**openVisitorReport** *`boolean`*

是否上报页面的访问信息。 `默认值: true`

**openErrorReport** *`boolean`*

是否上报页面的错误信息。 `默认值: true`

**openPerformanceReport** *`boolean`*

是否上报页面的性能信息。 `默认值: true`

**appId** *`string`*

用于区分不同项目的id。 `默认值: ''`

**subaoUserId** *`string`*

用户id。 `默认值: ''`

**loadReportDelay** *`number`*

如果浏览器不支持`navigator.sendBeacon`方法, 我们会将页面的performance信息在页面`load`后延迟`loadReportDelay`毫秒上报。 `默认值: 5000`

**urlHelper** *`{ rule: RegExp, target: string }`*

替换type为`resource`及`error`上报中url的值。`默认值: { rule: /\/([a-z\-_]+)?\d{2,20}/g, target: '/$1**' }`

**ajaxHelper** *`{ rule: RegExp, target: string }`*

替换type为`ajax`上报中url的值。 `默认值: { rule: /(\w+)\/\d{2,}/g, target: '$1' }`

## 生成上报数据

我们对于**访问数据**、**性能数据**、**错误数据**是分别进行收集和上报的，通过上报数据中的**type字段**以区分该次上报的类型。

### 访问数据

访问数据用于记录页面的访问信息，服务端拿到该数据后可以用于统计页面的**PV、UV**等。

对于UV数据的生成，我们会在**localstorage**中添加**uvExpireTime**字段，该字段记录当天23:59:59的时间戳。每次访问会将当前的时间戳与**uvExpireTime**中保存的时间戳进行比较，来计算是否增加UV。

#### 字段说明

**type**

上报数据的类型。 `value: 'pv'`

**appId**

项目id。`value: 从配置中获取`

**subaoUserId**

用户id。`value: 从配置中获取`

**accessId**

该次访问的id。在同一次访问的多次上报中，该字段的值相同。 `value: 随机字符串`

**accessTime**

当前的时间戳。`value: 当前时间的时间戳`

**pageUrl**

当前页面链接。`value: window.location.href`

**referrer**

该页面是从哪个页面进入的。`value: document.referrer`

**markUv**

是否增加UV。`value: true/false`。

#### 示例

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

### 性能数据

性能数据用于记录页面的性能信息，包括浏览器处理网页各个阶段的耗时、请求成功的资源等。服务端拿到该数据后可以用于**分析页面性能**。

我们使用`performance.timing`方法来获取网页各个阶段的耗时。对于页面请求成功的资源，我们使用`performance.getEntriesByType('resource')`方法进行获取。由于获取到的resource数据中含有大量对于性能分析没有帮助的资源，我们只截取其部分有用字段进行上报。

![timing](https://www.w3.org/TR/navigation-timing/timing-overview.png)

#### 字段说明

**type**

该条上报数据的类型。 `value: 'performance'`

**appId**

项目id。`value: 从配置中获取`

**subaoUserId**

用户id。`value: 从配置中获取`

**accessId**

该次访问的id。在同一次访问的多次上报中，该字段的值相同。 `value: 随机字符串`

**timing**

浏览器处理网页各个阶段的耗时。`value: performance.timing`

**resource**

页面成功加载的资源。 `value: performance.getEntriesByType('resource')的部分字段`

**tp**

用户在该页面停留时间(time on page)。`value: 用户离开页面的时间 - 进入页面的时间`


#### 示例
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

### 错误数据

我们会通过`window.addEventListener('error')`、`window.onerror`、`window.addEventListener('unhandledrejection')`三个方法来监听并上报页面**error**。

对于错误的捕获，我们优先使用`window.onerror`，因为它兼容性更好，并且能获取详细的**error**信息（包括产生错误的行、列等）。但当某一资源（例如：img、script）加载失败时，加载资源的元素会触发一个**Event**接口的**error**事件，并执行该**元素**上的`onerror()`处理函数。元素的**error**事件不会向上冒泡到**window**，也就是说不会被`window.onerror`捕获。

因此我们需要额外引入`window.addEventListener('error')`来捕获资源的加载错误。此后为了避免`window.onerror`与`window.addEventListener('error')`同时捕获某一错误而产生重复上报，我们对`window.addEventListener('error')`的**event**进行过滤，只有`event.srcElement inatanceof `**HTMLScriptElement**、**HTMLLinkElement**、**HTMLImageElement**时才会上报。

#### 字段说明
**type**

该条上报数据的类型。 `value: 'error'`

**appId**

项目id。`value: 从配置中获取`

**subaoUserId**

用户id。`value: 从配置中获取`

**accessId**

该次访问的id。在同一次访问的多次上报中，该字段的值相同。 `value: 随机字符串`

**errorList**

错误数据列表。`value: []`


#### 示例
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

## 数据上报

### 访问上报

对于用户的**访问数据**，我们的目标是**数据量**尽可能准确，毕竟这项上报要作为**PV、UV**统计的数据来源，而**PV、UV**的统计重点在于**量**而无关**质**。因此我们会**尽可能提前**对于**访问数据**的上报，避免漏掉用户**短时访问**页面这种情景。所以当SDK**初始化**(init)时我们就将**访问数据**收集并上报到服务器。此外为了尽可能避免兼容性问题产生的影响，**访问数据**的上报采用了**原生ajax**的方式。

### 性能上报

对于**性能数据**，我们会在页面`unload`时进行上报，因为只有在`unload`时用户的行为才会结束，收集到的数据才是最**全**的。而在页面`load`时进行**性能上报**可能会漏掉很多数据，因为即使页面`load`后，用户接下来的行为（例如：点击、滚动等）都可能触发新的资源加载和ajax请求。

为了让我们在`unload`时能顺利上报数据，**性能上报**使用了[Navigator.sendBeacon](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon)方法，该方法会在页面`unload`异步地向服务器发送数据，同时不会延迟页面的`unload`。

`Navigator.sendBeacon`不支持设置请求头的`Content-Type`，尽管可以用[Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)封装来实现，但是考虑到Blob兼容性问题，所以放弃了添加`Content-Type`，统一采用默认值即`text/plain`进行上报。

考虑到`Navigator.sendBeacon`兼容性问题，有人会在不支持`Navigator.sendBeacon`方法时选择页面`unload`用**同步ajax**进行上报，但这会导致了页面卸载被延迟，**严重影响用户体验**。我们的方案是选择在页面`load`后延迟一段实际进行**性能上报**。正如前文所说的，这个上报时机可能会漏掉一些资源数据。但是比起**同步ajax**对于用户访问可能造成的灾难性影响，我们宁愿做出上报方面的牺牲。况且统计数据告诉我们当前的已经有[90%](https://caniuse.com/#search=sendBeacon)的用户设备都支持`Navigator.sendBeacon`方法。所以我们暂且忽略可能带来的细微的数据差。

### 错误上报

一般情况下每次`error`被捕获后都会触发一次**错误上报**，但为了避免短时错误过多（例如：`scroll`事件产生的错误）而引起上报的次数过量，我们对于错误的上报进行了防抖处理，错误数据会被先添加到`errorList`中，当2000ms内没有新的的错误触发才会进行上报。错误的上报也会采用**原生ajax**的方式。

#### 手动上报错误
由于错误事件无法监听到已经被catch的Error，当我们需要对这部分错误信息进行上报时，可以调用**webReport实例**中的**manualReportError**方法进行手动上报，前提是你已经实例化了webReport。**manualReportError**方法同样会在2000ms内进行防抖处理。
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

## 参考文档

https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon

https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers/onerror

http://www.aliued.com/?p=4172

http://www.alloyteam.com/2015/09/explore-performance/

https://blog.seosiwei.com/detail/30
