class PageStatistic {
    public pagePerformance = () => {
        if (!window.performance) return {};
        const { timing } = performance;
        return {
            // DNS解析时间
            dnst: timing.domainLookupEnd - timing.domainLookupStart || 0,
            // TCP建立时间
            tcpt: timing.connectEnd - timing.connectStart || 0,
            // 白屏时间
            wit: timing.responseStart - timing.navigationStart || 0,
            // dom渲染完成时间
            domt: timing.domContentLoadedEventEnd - timing.navigationStart || 0,
            // 页面onload时间
            lodt: timing.loadEventEnd - timing.navigationStart || 0,
            // 页面准备时间
            radt: timing.fetchStart - timing.navigationStart || 0,
            // 页面重定向时间
            rdit: timing.redirectEnd - timing.redirectStart || 0,
            // unload时间
            uodt: timing.unloadEventEnd - timing.unloadEventStart || 0,
            // request请求耗时
            reqt: timing.responseEnd - timing.requestStart || 0,
            // 页面解析dom耗时
            andt: timing.domComplete - timing.domInteractive || 0,
        };
    }

    // 统计页面资源性能
    public pageResource = (opt) => {
        if (!window.performance || !window.performance.getEntries) return [];
        const resource: any = performance.getEntriesByType('resource');

        const resourceList = [];
        if (!resource && !resource.length) return resourceList;

        resource.forEach((item) => {
            const isAjax = item.initiatorType === 'xmlhttprequest' || item.initiatorType === 'fetch';
            if (isAjax && !opt.openAjaxReport) return;
            if (!isAjax && !opt.openResourceReport) return;
            const json = {
                name: item.name,
                method: 'GET',
                type: item.initiatorType,
                duration: item.duration.toFixed(2) || 0,
                decodedBodySize: item.decodedBodySize || 0,
                nextHopProtocol: item.nextHopProtocol,
            };
            resourceList.push(json);
        });
        return resourceList;
    }

    public filterResource = (opt, conf) => {
        const { resourceList } = conf;
        const { filterUrl } = opt;
        const newList = [];
        if (resourceList && resourceList.length && filterUrl && filterUrl.length) {
            for (let i = 0; i < resourceList.length; i += 1) {
                let begin = false;
                for (let j = 0; j < filterUrl.length; j += 1) {
                    if (resourceList[i].name.indexOf(filterUrl[j]) > -1) {
                        begin = true;
                        break;
                    }
                }
                if (!begin) newList.push(resourceList[i]);
            }
            return newList;
        }
        return resourceList;
    }
}

export default PageStatistic;
