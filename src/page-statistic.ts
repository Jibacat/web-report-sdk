import Util from './utils';

type ResourceData = {
    name: string;
    initiatorType: string;
    duration: number;
    decodedBodySize: number;
    nextHopProtocol: string;
    query: string;
    originUrl: string;
};

type Error = {
    url: string,
    time: number,
    message: string,
    type: string,
    query: string;
    originUrl: string;
};

type ResourceItem = Partial<PerformanceResourceTiming> & PerformanceEntry;

class PageStatistic {
    public getResource = (opt) => {
        // Get the resource of page
        try {
            if (!window.performance || !window.performance.getEntries) return [];
            const resource: ResourceItem[] = performance.getEntriesByType('resource');
            const resourceList: ResourceData[] = [];
            if (resource && resource.length > 0) {
                resource.forEach((item) => {
                    // Trim resource data
                    if (!item.name) return;
                    const splitUrl = new Util().splitUrl(item.name);
                    let { baseUrl } = splitUrl;
                    const { query } = splitUrl;
                    baseUrl = baseUrl.replace(opt.urlHelper.rule, opt.urlHelper.target);
                    const data: ResourceData = {
                        name: baseUrl,
                        query,
                        originUrl: item.name,
                        initiatorType: item.initiatorType || '',
                        duration: item.duration || 0,
                        decodedBodySize: item.decodedBodySize || 0,
                        nextHopProtocol: item.nextHopProtocol || '',
                    };
                    resourceList.push(data);
                });
            }
            return resourceList;
        } catch (err) {
            return [];
        }
    }

    public filterResourceList = (resourceList: ResourceData[], filterList: string[]) => {
        // Filter resourceList by filterList
        try {
            if (resourceList && resourceList.length > 0 && filterList && filterList.length > 0) {
                const filterResourceList = resourceList.filter((item) => {
                    for (let i = 0; i < filterList.length; i++) {
                        if (item.name.indexOf(filterList[i]) >= 0) {
                            return false;
                        }
                    }
                    return true;
                });
                return filterResourceList;
            }
            return resourceList;
        } catch (err) {
            return [];
        }
    }

    public filterErrorList = (errorList: Error[], filterList: string[]) => {
        // Filter errorList by filterList
        try {
            if (errorList && errorList.length > 0 && filterList && filterList.length > 0) {
                const filterErrorList = errorList.filter((item) => {
                    for (let i = 0; i < filterList.length; i++) {
                        if (item.url.indexOf(filterList[i]) >= 0) {
                            return false;
                        }
                    }
                    return true;
                });
                return filterErrorList;
            }
            return errorList;
        } catch (err) {
            return [];
        }
    }
}

export default PageStatistic;
