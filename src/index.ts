import AjaxHook from 'ajax-hook';
import PageStatistic from './page-statistic';
import Util from './utils';
import DefaultData from './data';

const { defaultConfig, defaultOption, defaultError } = DefaultData;
const filterUrl = ['/api/v1/report/web', 'livereload.js?snipver=1', '/sockjs-node/info'];

type Config = {
    resourceList: any[];
    performance: {};
    errorList: any[];
    preUrl: string;
};
type Option = {
    domain: string;
    filterUrl: any[];
    openVisitorReport: boolean;
    openResourceReport: boolean;
    openAjaxReport: boolean;
    openErrorReport: boolean;
    openPerformanceReport: boolean;
    extraData: {};
    loadReportDelay: number;
};
type Error = {
    t: number;
    n: string;
    msg: string;
    data: {};
    method: string;
};

class WebReport {
    public conf: Config = defaultConfig;

    public opt: Option = defaultOption;

    public errorDefault: Error = defaultError;

    public constructor(option) {
        this.opt = (Object as any).assign(this.opt, option);
        this.opt.filterUrl = this.opt.filterUrl.concat(filterUrl);
    }

    public init = () => {
        console.log('初始化webReport');
        const {
            openErrorReport, openVisitorReport, openAjaxReport,
        } = this.opt;
        openVisitorReport && this.reportVisitor(); // js执行时立即上报pv uv信息
        this.initReportData(); // resource ajax performance
        if (openErrorReport && openAjaxReport) {
            this.initReportAjax(); // 代理ajax请求
            this.initReportFetch(); // 代理fetch请求
        }
        openErrorReport && this.initReportError(); // 代理error
    }

    private initReportData = () => {
        const { loadReportDelay } = this.opt;
        if (typeof navigator.sendBeacon === 'function') {
            window.addEventListener('unload', this.reportData, false);
            // window.addEventListener('beforeunload', this.reportData, false);
        } else {
            const data = this.generateReportData();
            let delayTime = 5000;
            if (typeof loadReportDelay === 'number' && loadReportDelay >= 0) {
                delayTime = loadReportDelay;
            }
            const delayReport = () => {
                setTimeout(() => { this.report(data); }, delayTime);
            };
            window.addEventListener('load', delayReport, false);
        }
    }

    private initReportError = () => {
        window.addEventListener('error', (e: any) => {
            const defaults = (Object as any).assign({}, this.errorDefault);
            defaults.n = 'resource';
            defaults.t = new Date().getTime();
            defaults.msg = `${e.target.localName} is load error`;
            defaults.method = 'GET';
            defaults.data = {
                target: e.target.localName,
                type: e.type,
                resourceUrl: e.target.href || e.target.currentSrc,
            };
            if (e.target !== window) this.conf.errorList.push(defaults);
        }, false);
        window.onerror = (msg, _url, line, col, error) => {
            const defaults = (Object as any).assign({}, this.errorDefault);
            defaults.t = new Date().getTime();
            defaults.msg = (error && error.stack ? error.stack.toString() : msg) as string;
            defaults.method = 'GET';
            defaults.data = {
                resourceUrl: _url,
                line,
                col,
            };
            this.conf.errorList.push(defaults);
        };
        window.addEventListener('unhandledrejection', (e) => {
            const error = e && e.reason;
            const message = error.message || '';
            const stack = error.stack || '';
            // Processing error
            let resourceUrl;
            let line;
            let errs = stack.match(/\(.+?\)/);
            if (errs && errs.length) [errs] = errs;
            errs = errs.replace(/\w.+[js|html]/g, ($1) => { resourceUrl = $1; return ''; });
            errs = errs.split(':');
            if (errs && errs.length > 1) line = parseInt(errs[1] || 0, 10);
            const col = parseInt(errs[2] || 0, 10);
            const defaults = (Object as any).assign({}, this.errorDefault);
            defaults.msg = message;
            defaults.method = 'GET';
            defaults.t = new Date().getTime();
            defaults.data = {
                resourceUrl,
                line: col,
                col: line,
            };
            this.conf.errorList.push(defaults);
        }, false);
    }

    private initReportAjax = () => {
        // 拦截原生ajax请求
        AjaxHook.hookAjax({
            onreadystatechange: (xhr) => {
                if (xhr.readyState === 4 && (xhr.status < 200 || xhr.status >= 400)) {
                    this.addAjaxErrorToErrorList(xhr);
                }
            },
            onerror: (xhr) => {
                this.addAjaxErrorToErrorList(xhr);
            },
            onload: (xhr) => {
                if (xhr.readyState === 4 && (xhr.status < 200 || xhr.status >= 400)) {
                    this.addAjaxErrorToErrorList(xhr);
                }
            },
            open: (arg, xhr) => {
                // open方法第二个参数xhr，为原生xhr
                const result = { url: arg[1], method: arg[0] || 'GET', type: 'xmlhttprequest' };
                xhr.args = result;
            },
        });
    }

    private initReportFetch = () => {
        // 拦截fetch请求
        if (window.fetch) {
            const nativeFetch = fetch;
            (window as any).nativeFetch = nativeFetch;
            window.fetch = (...arg) => {
                const result = new Util().fetArg(arg);
                return nativeFetch(...arg)
                    .catch((err) => {
                        // fetch错误上报
                        this.addFetchErrorToErrorList(result, err);
                        return err;
                    });
            };
        }
    }

    private addAjaxErrorToErrorList = (xhr) => {
        // ajax请求的error信息传入errorList
        const defaults = (Object as any).assign({}, this.errorDefault);
        if (xhr.xhr && xhr.xhr.args && xhr.xhr.args.method) {
            // xhr为我们自定义的xhr对象，xhr.xhr为原生xhr对象
            xhr.method = xhr.xhr.args.method;
        }
        defaults.t = new Date().getTime();
        defaults.n = 'ajax';
        defaults.msg = xhr.statusText || 'ajax request error';
        defaults.method = xhr.method;
        defaults.data = {
            resourceUrl: xhr.responseURL,
            text: xhr.statusText,
            status: xhr.status,
        };
        this.conf.errorList.push(defaults);
    }

    private addFetchErrorToErrorList = (result, err) => {
        const defaults = (Object as any).assign({}, this.errorDefault);
        defaults.t = new Date().getTime();
        defaults.n = 'fetch';
        defaults.msg = 'fetch request error';
        defaults.method = result.method;
        defaults.data = {
            resourceUrl: result.url,
            text: err.stack || err,
            status: 0,
        };
        this.conf.errorList.push(defaults);
    }

    private reportVisitor = () => {
        // 上报页面访问数据, 不需要上报errorList
        const type = 10; // 标记页面pv uv上报，新建一张表存此数据
        const uvString = new Util().markUv();
        const data = {
            time: new Date().getTime(),
            markUv: uvString,
            type,
            url: window.location.href,
        };
        (Object as any).assign(data, this.opt.extraData);
        this.report(data);
    }

    private generateReportData = () => {
        this.opt.openPerformanceReport && (this.conf.performance = new PageStatistic().pagePerformance());
        this.opt.openResourceReport && (this.conf.resourceList = new PageStatistic().pageResource(this.opt));
        const type = 1;
        const uvString = new Util().markUv();
        const markPageData = new Util().markPageUv();
        const data = {
            time: new Date().getTime(),
            markUv: uvString,
            markUser: markPageData.pageUvString,
            isFirstIn: markPageData.isFirstVisit,
            resourceList: this.conf.resourceList,
            performance: this.conf.performance,
            type,
            url: window.location.href,
            errorList: this.conf.errorList,
        };
        (Object as any).assign(data, this.opt.extraData);
        return data;
    }

    private reportData = () => {
        const data = this.generateReportData();
        if (typeof navigator.sendBeacon === 'function') {
            navigator.sendBeacon(this.opt.domain, JSON.stringify(data));
        }
    }

    private report = (data) => {
        let xhr;
        const _window = window as any;
        if ((_window).RealXMLHttpRequest) {
            xhr = new (_window).RealXMLHttpRequest();
        } else {
            xhr = new XMLHttpRequest();
        }
        xhr.open('POST', this.opt.domain, true); // true表示异步，false表示同步
        xhr.send(JSON.stringify(data));
    }
}
(window as any).WebReport = WebReport;
export { WebReport };
