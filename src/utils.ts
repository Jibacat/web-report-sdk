class Util {
    randomString = (len) => {
        // 生成一段随机字符串
        len = len || 10;
        const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789';
        const maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i += 1) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd + new Date().getTime();
    };

    markPageUv = () => {
        // 标记某一页面的第一次访问
        let pageUvString = sessionStorage.getItem('pageUvString') || '';
        const result = {
            pageUvString,
            isFirstVisit: false,
        };
        if (!pageUvString) {
            pageUvString = this.randomString(10);
            sessionStorage.setItem('pageUvString', pageUvString);
            result.pageUvString = pageUvString;
            result.isFirstVisit = true;
        }
        return result;
    };

    markUv = () => {
        // 标记uv
        const now = new Date();
        let uvString = localStorage.getItem('uvString') || '';
        const uvExpireTime = localStorage.getItem('uvExpireTime') || '';
        const todayEndTime = new Date(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} 23:59:59`).getTime();
        if (!uvString || !uvExpireTime || (now.getTime() > Number(uvExpireTime))) {
            // 没标记过uv || uv过期时间丢失  || 当前时间大于uv过期时间 => 需要记一次新的uv
            uvString = this.randomString(10);
            localStorage.setItem('uvString', uvString);
            localStorage.setItem('uvExpireTime', `${todayEndTime}`);
        }
        return uvString;
    };

    fetArg = (arg) => {
        // fetch arguments
        const result = { method: 'GET', type: 'fetchrequest', url: '' };
        const args = Array.prototype.slice.apply(arg);

        if (!args || !args.length) return result;
        try {
            if (args.length === 1) {
                if (typeof (args[0]) === 'string') {
                    [result.url] = args;
                } else if (typeof (args[0]) === 'object') {
                    result.url = args[0].url;
                    result.method = args[0].method;
                }
            } else {
                [result.url] = args;
                result.method = args[1].method || 'GET';
                result.type = args[1].type || 'fetchrequest';
            }
        } catch (err) {}
        return result;
    };
}

export default Util;
