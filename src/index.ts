import AjaxHook from 'ajax-hook';
import PageStatistic from './page-statistic';
import Util from './utils';

const uuidv1 = require('uuid/v1');

type Option = {
    domain: string;
    filterUrl: string[];
    openVisitorReport: boolean;
    openErrorReport: boolean;
    openPerformanceReport: boolean;
    appId: string;
    subaoUserId: string;
    loadReportDelay: number;
    urlHelper: { rule: RegExp, target: string };
    ajaxHelper: { rule: RegExp, target: string };
};

type Error = {
    url: string,
    time: number,
    message: string,
    type: string,
    query: string;
    originUrl: string;
};

type ReportData = ErrorData | PerformanceData | VisitorData;

type VisitorData = {
    subaoUserId: string;
    accessTime: number;
    markUv: boolean;
    type: string;
    pageUrl: string;
    accessId: string;
    referrer: string;
    appId: string;
};

type ResourceData = {
    name: string;
    initiatorType: string;
    duration: number;
    decodedBodySize: number;
    nextHopProtocol: string;
    query: string;
    originUrl: string;
}

type PerformanceData = {
    accessId: string;
    tp: number;
    resource: ResourceData[];
    timing: PerformanceTiming;
    type: string;
    appId: string;
    subaoUserId: string;
};

type ErrorData = {
    accessId: string;
    type: string;
    appId: string;
    subaoUserId: string;
    errorList: Error[];
};

const defaultOption = {
    domain: '', // Report domain
    filterUrl: [], // Filter some url before report
    openVisitorReport: true, // Report pv&vu or not
    openErrorReport: true, // Report error message
    openPerformanceReport: true, // Report the performance of page
    appId: '', // Unique application id
    subaoUserId: '', // Unique user id
    loadReportDelay: 5000, // If the page does not support navigator.sendBeacon, we delay to report performance after the page is onload.
    urlHelper: { rule: /\/([a-z\-_]+)?\d{2,20}/g, target: '/$1**' },
    ajaxHelper: { rule: /(\w+)\/\d{2,}/g, target: '$1' },
};

class WebReport {
    public opt: Option = defaultOption;

    private accessId: string = uuidv1();

    private initReportTime: number = new Date().valueOf(); // 初始化webReport的时间

    private errorList: Error[] = [];

    private debounceTimer!: number; // error上报debounce定时器

    public constructor(option: Option) {
        try {
            this.opt = (Object as any).assign(this.opt, option);
        } catch (err) {
            console.log(`[WebReport] instantiation failed! ${err}`);
        }
    }

    public init = () => {
        try {
            const {
                openErrorReport, openVisitorReport, openPerformanceReport,
            } = this.opt;
            if (!new Util().validateOption(this.opt)) return; // Validation fails
            if (openErrorReport) {
                this.initReportError(); // Init error report
                this.initAjaxHook(); // Proxy ajax request and report ajax error
                this.initFetchHook(); // Proxy fetch request and report fetch error
            }
            openVisitorReport && this.reportVisitor(); // Immediately report pv uv information when sdk executed
            openPerformanceReport && this.initReportPerformance(); // Open performance report
            const initDuration = new Date().valueOf() - this.initReportTime;
            console.log(`[WebReport] initialization successful! 🎉 ${initDuration}ms`);
        } catch (err) {
            console.log(`[WebReport] initialization failed! ${err}`);
        }
    }

    public manualReportError(error: Partial<Error>) {
        try {
            if (!error.url) return;
            const splitUrl = new Util().splitUrl(error.url);
            let { baseUrl } = splitUrl;
            const { query } = splitUrl;
            baseUrl = baseUrl.replace(this.opt.urlHelper.rule, this.opt.urlHelper.target);
            const data = {
                url: baseUrl,
                query,
                originUrl: error.url,
                time: new Date().valueOf(),
                message: error.message || '',
                type: 'js',
            };
            this.errorList.push(data);
            this.reportError();
        } catch (err) {}
    }

    private initReportPerformance = () => {
        try {
            const { loadReportDelay } = this.opt;
            if (typeof navigator.sendBeacon === 'function') {
                window.addEventListener('unload', this.reportByBeacon, false);
            } else {
                let delayTime = 5000;
                if (typeof loadReportDelay === 'number' && loadReportDelay >= 0) {
                    delayTime = loadReportDelay;
                }
                const delayReport = () => {
                    try {
                        setTimeout(() => {
                            const data = this.generatePerformanceData();
                            this.reportByAjax(data);
                        }, delayTime);
                    } catch (err) {}
                };
                window.addEventListener('load', delayReport, false);
            }
        } catch (err) {}
    }

    private initReportError = () => {
        window.addEventListener('error', (e: any) => {
            try {
                const target = e.target || e.srcElement;
                const isElementTarget = target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement;
                if (!isElementTarget) return;
                const url = target instanceof HTMLLinkElement ? e.target.href : e.target.src;
                if (!url) return;
                const splitUrl = new Util().splitUrl(url);
                let { baseUrl } = splitUrl;
                const { query } = splitUrl;
                baseUrl = baseUrl.replace(this.opt.urlHelper.rule, this.opt.urlHelper.target);
                const data = {
                    url: baseUrl,
                    originUrl: url,
                    query,
                    time: new Date().valueOf(),
                    message: `${e.target.localName} is loading failed`,
                    type: 'resource',
                };
                this.errorList.push(data);
                this.reportError();
            } catch (err) {}
        }, true);
        window.onerror = (msg, _url, line, col) => {
            try {
                if (!_url) return;
                const splitUrl = new Util().splitUrl(_url);
                let { baseUrl } = splitUrl;
                const { query } = splitUrl;
                baseUrl = baseUrl.replace(this.opt.urlHelper.rule, this.opt.urlHelper.target);
                const data = {
                    url: baseUrl,
                    query,
                    originUrl: _url,
                    time: new Date().valueOf(),
                    message: `${msg}, line: ${line}, col: ${col}`,
                    type: 'js',
                };
                this.errorList.push(data);
                this.reportError();
            } catch (err) {}
        };
        window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
            try {
                const url = window.location.href;
                if (!url) return;
                const splitUrl = new Util().splitUrl(url);
                let { baseUrl } = splitUrl;
                const { query } = splitUrl;
                baseUrl = baseUrl.replace(this.opt.urlHelper.rule, this.opt.urlHelper.target);
                const data = {
                    url: baseUrl,
                    query,
                    originUrl: url,
                    time: new Date().valueOf(),
                    message: `Unhandled promise rejection: ${e.reason}`,
                    type: 'js',
                };
                this.errorList.push(data);
                this.reportError();
            } catch (err) {}
        }, true);
    }

    private initAjaxHook = () => {
        // Proxy native ajax request
        try {
            AjaxHook.hookAjax({
                onreadystatechange: (xhr: XMLHttpRequest) => {
                    try {
                        if (xhr.readyState === 4 && (xhr.status < 200 || xhr.status >= 400)) {
                            this.addAjaxErrorToErrorList(xhr);
                        }
                    } catch (err) {}
                },
                onerror: (xhr: XMLHttpRequest) => {
                    try {
                        this.addAjaxErrorToErrorList(xhr);
                    } catch (err) {}
                },
                onload: (xhr: XMLHttpRequest) => {
                    try {
                        if (xhr.readyState === 4 && (xhr.status < 200 || xhr.status >= 400)) {
                            this.addAjaxErrorToErrorList(xhr);
                        }
                    } catch (err) {}
                },
                open: (arg, xhr) => {
                    // xhr is native xhr Object
                    try {
                        const result = { url: arg[1], method: arg[0] || 'get' };
                        xhr.args = result;
                    } catch (err) {}
                },
            });
        } catch (err) {
            console.log(`[WebReport] ajax hook failed! ${err}`);
        }
    }

    private initFetchHook = () => {
        // Proxy native fetch request
        try {
            if (window.fetch) {
                const nativeFetch = fetch;
                (window as any).nativeFetch = nativeFetch;
                window.fetch = (...arg) => {
                    return nativeFetch(...arg)
                        .then((res) => {
                            try {
                                if (res.status < 200 || res.status >= 400) {
                                    const url = arg ? arg[0] : '';
                                    let fetchMethod = 'get';
                                    if (arg && arg[1]) {
                                        if (arg[1].method) {
                                            fetchMethod = arg[1].method;
                                        }
                                    }
                                    const message = `statusText: ${res.statusText}, status: ${res.status}`;
                                    this.addFetchErrorToErrorList(url as string, message, fetchMethod);
                                }
                            } catch (err) {}
                            return res;
                        });
                };
            }
        } catch (err) {}
    }

    private addAjaxErrorToErrorList = (xhr: any) => {
        try {
            const xhrObject = xhr.xhr || xhr;
            const method = xhrObject.args ? xhrObject.args.method : 'get';
            const { url } = xhrObject.args;
            if (!url) return;
            const splitUrl = new Util().splitUrl(url);
            let { baseUrl } = splitUrl;
            const { query } = splitUrl;
            baseUrl = baseUrl.replace(this.opt.ajaxHelper.rule, this.opt.ajaxHelper.target);
            const data = {
                url: baseUrl,
                query,
                method,
                originUrl: url,
                time: new Date().valueOf(),
                message: `ajax request error, statusText: ${xhr.statusText}, status: ${xhr.status}`,
                type: 'ajax',
            };
            this.errorList.push(data);
            this.reportError();
        } catch (err) {}
    }

    private addFetchErrorToErrorList = (url: string, msg: string, method: string) => {
        try {
            if (!url) return;
            const splitUrl = new Util().splitUrl(url);
            let { baseUrl } = splitUrl;
            const { query } = splitUrl;
            baseUrl = baseUrl.replace(this.opt.ajaxHelper.rule, this.opt.ajaxHelper.target);
            const data = {
                url: baseUrl,
                method,
                query,
                originUrl: url,
                time: new Date().valueOf(),
                message: `fetch request error, ${msg}`,
                type: 'ajax',
            };
            this.errorList.push(data);
            this.reportError();
        } catch (err) {}
    }

    private generatePerformanceData = (): PerformanceData => {
        const pageDuration = new Date().valueOf() - this.initReportTime;
        const resourceList = new PageStatistic().getResource(this.opt);
        const filterResourceList = new PageStatistic().filterResourceList(resourceList, this.opt.filterUrl);
        const data = {
            accessId: this.accessId,
            tp: pageDuration,
            resource: filterResourceList,
            timing: window.performance.timing,
            type: 'performance',
            appId: this.opt.appId,
            subaoUserId: this.opt.subaoUserId,
        };
        return data;
    }

    private generateErrorData = (): ErrorData => {
        const filterErrorList = new PageStatistic().filterErrorList(this.errorList, this.opt.filterUrl);
        const data = {
            accessId: this.accessId,
            type: 'error',
            appId: this.opt.appId,
            subaoUserId: this.opt.subaoUserId,
            errorList: filterErrorList,
        };
        return data;
    }

    private reportVisitor = () => {
        try {
            const markUv: boolean = new Util().markUv();
            const data: VisitorData = {
                subaoUserId: this.opt.subaoUserId,
                accessTime: new Date().getTime(),
                markUv,
                type: 'pv',
                pageUrl: window.location.href,
                accessId: this.accessId,
                referrer: document.referrer,
                appId: this.opt.appId,
            };
            this.reportByAjax(data);
        } catch (err) {}
    }

    private reportError = () => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = window.setTimeout(() => {
            try {
                const data = this.generateErrorData();
                if (data.errorList.length > 0) {
                    this.reportByAjax(data);
                    this.errorList = [];
                }
            } catch (err) {}
        }, 2000);
    }

    private reportByBeacon = () => {
        try {
            const data = this.generatePerformanceData();
            if (typeof navigator.sendBeacon === 'function') {
                navigator.sendBeacon(this.opt.domain, JSON.stringify(data));
                if (this.errorList.length > 0) {
                    // Because of the report error debounce, there may be unreported error data when the page is closed.
                    const errorData = this.generateErrorData();
                    if (errorData.errorList.length > 0) {
                        navigator.sendBeacon(this.opt.domain, JSON.stringify(errorData));
                    }
                }
            }
        } catch (err) {}
    }

    private reportByAjax = (data: ReportData) => {
        try {
            let xhr;
            const _window = window as any;
            if ((_window).RealXMLHttpRequest) {
                xhr = new (_window).RealXMLHttpRequest();
            } else {
                xhr = new XMLHttpRequest();
            }
            xhr.open('POST', this.opt.domain, true);
            xhr.send(JSON.stringify(data));
        } catch (err) {}
    }
}
(window as any).WebReport = WebReport;
export { WebReport };
