const defaultConfig = {
    // 资源列表
    resourceList: [],
    // 页面性能列表
    performance: {},
    // 错误列表
    errorList: [],
    // 来自域名
    preUrl: document.referrer && document.referrer !== window.location.href ? document.referrer : '',
    // 当前页面
};

const defaultOption = {
    // 上报地址
    domain: 'http://localhost/api',
    // 上报ajax和fetch请求时需要过滤的url信息
    filterUrl: [],
    // 是否上报pv
    openVisitorReport: true,
    // 是否上报resource数据
    openResourceReport: true,
    // 是否上报ajax数据
    openAjaxReport: true,
    // 是否上报错误信息
    openErrorReport: true,
    // 是否上报页面的performance
    openPerformanceReport: true,
    // 额外参数
    extraData: {},
    // 页面load上报时，上报的延迟
    loadReportDelay: 5000,
};

const defaultError = {
    t: 0,
    n: 'js',
    msg: '',
    data: {},
    method: '',
};

export default { defaultConfig, defaultOption, defaultError };
