type Option = {
    domain: string;
    filterUrl: string[];
    openVisitorReport: boolean;
    openErrorReport: boolean;
    openPerformanceReport: boolean;
    appId: string;
    subaoUserId: string;
    loadReportDelay: number;
};

class Util {
    randomString = (length: number = 30): string => {
        try {
            // Generate random string
            const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (let i = length; i > 0; --i) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
            return result;
        } catch (err) {
            return '';
        }
    };

    markUv = (): boolean => {
        // Calculate uv
        try {
            const now = new Date();
            const uvExpireTime = localStorage.getItem('uvExpireTime') || '';
            const todayEndTime = new Date(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} 23:59:59`).getTime();
            if (uvExpireTime && (now.getTime() < Number(uvExpireTime))) {
                return false;
            }
            localStorage.setItem('uvExpireTime', `${todayEndTime}`);
            return true;
        } catch (err) {
            return false;
        }
    };

    isArray = (arr: any[]) => {
        try {
            return Object.prototype.toString.call(arr) === '[object Array]';
        } catch (err) {
            return false;
        }
    }

    splitUrl = (url: string) => {
        try {
            let baseUrl = url;
            let query = '';
            const index = url.indexOf('?');
            if (index >= 0) {
                baseUrl = url.substring(0, index);
                query = url.substring(index);
            }
            return {
                baseUrl,
                query,
            };
        } catch (err) {
            return {
                baseUrl: url || '',
                query: '',
            };
        }
    }

    validateOption = (option: Option): boolean => {
        try {
            if (!option.domain || typeof option.domain !== 'string') {
                console.log('[WebReport] initialization failed, domain is required as the type of string. 😂');
                return false;
            }
            if (!option.appId || typeof option.appId !== 'string') {
                console.log('[WebReport] initialization failed, appId is required as the type of string. 🤣');
                return false;
            }
            if (!this.isArray(option.filterUrl)) {
                console.log('[WebReport] initialization failed, filterUrl must be the type of array. 😓');
                return false;
            }
            if (typeof option.openVisitorReport !== 'boolean') {
                console.log('[WebReport] initialization failed, openVisitorReport must be the type of boolean. 😢');
                return false;
            }
            if (typeof option.openErrorReport !== 'boolean') {
                console.log('[WebReport] initialization failed, openErrorReport must be the type of boolean. 😤');
                return false;
            }
            if (typeof option.openPerformanceReport !== 'boolean') {
                console.log('[WebReport] initialization failed, openPerformanceReport must be the type of boolean. 😰');
                return false;
            }
        } catch (err) {}
        return true;
    }
}

export default Util;
