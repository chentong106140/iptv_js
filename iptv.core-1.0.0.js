/**
 * Created by cherish on 2017/12/14.
 */

(function (window, undefined) {


    var
        // 将 undefined 转换为字符串 "undefined"
        core_strundefined = typeof undefined,

        location = window.location,
        document = window.document,
        docElem = document.documentElement,

        //设置别名
        _iptv = window.iptv,
        _$ = window.$,

        // 储存了常见类型的 typeof 的哈希表
        //{"[object Function]":"function","[object Boolean]":"boolean",}
        class2type = {},
        // 定义当前版本
        core_version = '1.0.0',
        // 其次，这里定义了一个空的数组对象 ，如果下文行文需要调用数组对象的 concat 、push 、slice 、indexOf 方法
        // 将会调用 core_concat 、core_push 、core_slice 、和 core_indexOf ，这四个变量事先存储好了这四个方法的入口
        // 同时使用 call 或 apply 调用这些方法也可以使类数组也能用到数组的方法
        core_deletedIds = [],
        core_concat = core_deletedIds.concat,
        core_push = core_deletedIds.push,
        core_slice = core_deletedIds.slice,
        core_indexOf = core_deletedIds.indexOf,

        core_toString = class2type.toString,
        //hasOwnProperty:返回boolean值，参数是字符串，用于检查某对象是否存在该字符串的属性，该方法不会检查对象的原型链中是否存在该属性
        //var a = {name:"n"}; a.hasOwnProperty("name");return true
        core_hasOwn = class2type.hasOwnProperty,
        core_trim = core_version.trim,
        //匹配开头#&.号的任意字符，包括下划线与-
        quickExpr = /(^[#&.])([\w-]+)$/,
        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        //定义iptv构造函数
        iptv = function (selector, context) {
            return new iptv.fn.init(selector, context);
        };
    // 给 iptv.prototype 设置别名 iptv.fn
    // iptv.prototype 即是 iptv的原型，挂载在 iptv.prototype 上的方法，即可让所有 iptv 对象使用
    iptv.fn = iptv.prototype = {
        // 当前版本
        iptv: core_version,
        constructor: iptv,
        /**
         * 初始化方法
         */
        init: function (selector, context) {
            // 如果传入的参数为空，则直接返回this
            if (!selector) {
                return this;
            }
            var match;
            if (typeof selector == "string") {
                match = quickExpr.exec(selector)
                //处理id DOM
                if (match && match[1] === "#") {
                    var ele = document.getElementById(match[2]);
                    this[0] = ele;
                    this.length = 1;
                    this.selector = match[0];
                }
                this.context = document;
                return this;
            } else if (selector.nodeType == 1) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            } else if (iptv.isFunction(selector)) {
                return iptv.ready(selector);
            }

            if (selector.selector && selector.context) {
                return iptv(selector.selector, selector.context);
            }
            if (iptv.type(selector) === "object") {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            }

            if (iptv.type(selector) === "array") {
                this.context = selector;
                this.length = 0;
                iptv.merge(this, selector);
                return this;
            }
            return this;
        },
        //当前操作的上下文对象
        context: null,
        //当前的选择器
        selector: "",

    };
    //重置原型对象为iptv
    iptv.fn.init.prototype = iptv.fn;

    //不对外方法
    function getsec(sec) {
        var str1 = sec.substring(1, sec.length) * 1;
        var str2 = sec.substring(0, 1);
        if (str2 == "S") {
            return str1 * 1000;
        }
        else if (str2 == "M") {
            return str1 * 60 * 1000;
        }
        else if (str2 == "H") {
            return str1 * 60 * 60 * 1000;
        }
        else if (str2 == "D") {
            return str1 * 24 * 60 * 60 * 1000;
        } else {
            return 1 * 24 * 60 * 60 * 1000;
        }
    }

    /**
     * 定义继承方法
     * 如果只有一个参数，target就是iptv类或iptv对象，
     * 如果有2个或多个参数，target就是第一个参数，那么就第2个参数开始之后的所有参数的属性复制到第一个参数上去
     * 如果第一个参数是true，target就是第二个参数，之后的参数的属性就复制到第二个参数去
     * @type {iptv.extend}
     */
    iptv.extend = iptv.fn.extend = function () {
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // target 是传入的第一个参数
        // 如果第一个参数是布尔类型，则表示是否要深递归，
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // 如果传了类型为 boolean 的第一个参数，i 则从 2 开始
            i = 2;
        }
        // 如果传入的第一个参数是 字符串或者其他
        if (typeof target !== "object" && !iptv.isFunction(target)) {
            target = {};
        }
        // 如果参数的长度为 1 ，表示是 iptv 静态方法
        if (length === i) {
            target = this;
            --i;
        }
        // 可以传入多个复制源
        // i 是从 1或2 开始的
        for (; i < length; i++) {
            // 将每个源的属性全部复制到 target 上
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    // src 是源（即本身）的值
                    // copy 是即将要复制过去的值
                    src = target[name];
                    copy = options[name];
                    // 防止有环，例如 extend(true, target, {'target':target});
                    if (target === copy) {
                        continue;
                    }
                    // 如果是深复制
                    if (deep && copy && (iptv.isPlainObject(copy) || (copyIsArray = iptv.isArray(copy)))) {
                        // 数组
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && iptv.isArray(src) ? src : [];
                            // 对象
                        } else {
                            clone = src && iptv.isPlainObject(src) ? src : {};
                        }
                        // 递归
                        target[name] = iptv.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // 也就是如果不传需要覆盖的源，调用 $.extend 其实是增加 iptv 的静态方法
        return target;
    };
    //添加iptv静态方法
    iptv.extend({
        /**
         * 释放iptv对象引用，防止公共出去的iptv变量造成污染冲突，也可以实现同一个页面有多个iptv库
         * @param deep 如果传true，$与iptv同时交给了该方法的返回值，如果传false或空，只有$变量将交给该方法的返回值
         * @returns {iptv}
         */
        noConflict: function (deep) {
            if (window.$ === iptv) {
                window.$ = _$;
            }

            if (deep && window.iptv === iptv) {
                window.iptv = _iptv;
            }
            return iptv;
        },
        $: function (id) {
            if (id && iptv.trim(id)) {
                return document.getElementById(iptv.trim(id));
            }
            return null;
        },
        /**
         * 随机数
         */
        expando: "iptv" + (core_version + Math.random()).replace(/\D/g, ""),
        /**
         * 判断传入对象是否为 function
         * @returns {boolean}
         */
        isFunction: function (obj) {
            return iptv.type(obj) === "function";
        },
        /**
         * 判断传入对象是否为数组
         * @returns {boolean}
         */
        isArray: Array.isArray || function (obj) {
            return iptv.type(obj) === "array";
        },
        /**
         *  判断传入对象是否为 window 对象
         * @param obj
         * @returns {boolean}
         */
        isWindow: function (obj) {
            return obj != null && obj == obj.window;
        },
        // 确定它的参数是否是一个数字
        isNumeric: function (obj) {
            //isFinite:参数是一个数字，用于判断这个数字是否是无穷大数字，如果是无穷大，返回false，如果数字正常返回true
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },

        /**
         * 确定JavaScript 对象的类型
         * @param obj
         * @returns {boolean number string function array date regexp object error}
         */
        type: function (obj) {
            // 如果传入的为 null --> "null"
            if (obj == null) {
                return String(obj);
            }
            // 利用事先存好的 hash 表 class2type 作精准判断
            return typeof obj === "object" || typeof obj === "function" ?
                class2type[core_toString.call(obj)] || "object" :
                typeof obj;
        },
        /**
         * 测试对象是否是纯粹的对象
         * 通过 "{}" 或者 "new Object" 创建的
         * @param obj
         * @returns {Boolean ,Number ,String ,Function ,Array ,Date ,RegExp ,Object ,Error}
         */
        isPlainObject: function (obj) {
            var key;
            if (!obj || iptv.type(obj) !== "object" || obj.nodeType || iptv.isWindow(obj)) {
                return false;
            }

            try {
                if (obj.constructor &&
                    !core_hasOwn.call(obj, "constructor") &&
                    !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                return false;
            }
            if (iptv.support.ownLast) {
                for (key in obj) {
                    return core_hasOwn.call(obj, key);
                }
            }
            for (key in obj) {
            }

            return key === undefined || core_hasOwn.call(obj, key);
        },
        /**
         * 返回对象是否是数组还是类数组对象
         * @param obj
         * @returns {boolean} true:是数组，false:不是纯数组
         */
        isArraylike: function (obj) {
            var length = obj.length,
                type = iptv.type(obj);

            if (iptv.isWindow(obj)) {
                return false;
            }

            if (obj.nodeType === 1 && length) {
                return true;
            }

            return type === "array" || type !== "function" && (length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj);
        },
        /**
         * 检查对象是否为空（不包含任何属性）
         * @param obj
         * @returns {boolean}
         */
        isEmptyObject: function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },
        /**
         * 为 JavaScript 的 "error" 事件绑定一个处理函数
         * @param msg 错误描述
         */
        error: function (msg) {
            throw new Error(msg);
        },
        /**
         * 去除前后空格
         * @param text
         * @returns {string}
         */
        trim: function (text) {
            return text == null ? "" : (text + "").replace(rtrim, "");
        },
        /**
         * eval的变异，使用效果一样，只不过是在全局作用域中执行 参数data
         * @param data
         */
        globalEval: function (data) {
            // 如果 data 不为空
            if (data && iptv.trim(data)) {
                (window.execScript || function (data) {
                    // 在chrome一些旧版本里eval.call( window, data )无效
                    window["eval"].call(window, data);
                })(data);
            }
        },
        /**
         * 判断某个DOM是否是指定的name名称
         * iptv.nodeName(document.getElementById("h"),"h2")--->return true/false
         * @param elem  DOM节点对象
         * @param name  需要判断的节点名称
         * @returns {boolean}
         */
        nodeName: function (elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },
        /**
         * 循环数组或对象
         * @param obj
         * @param callback
         * @param args
         * @returns {*}
         */
        each: function (obj, callback, args) {
            if (!obj)return null;
            var value,
                i = 0,
                length = obj.length,
                isArray = iptv.isArraylike(obj); // 判断是不是数组

            // 传了第三个参数
            if (args) {
                if (isArray) {
                    for (; i < length; i++) {
                        // 相当于:
                        // args = [arg1, arg2, arg3];
                        // callback(args1, args2, args3)。然后callback里边的this指向了obj[i]
                        value = callback.apply(obj[i], args);

                        if (value === false) {
                            // 注意到，当callback函数返回值会false的时候，注意是全等！循环结束
                            break;
                        }
                    }
                    // 非数组
                } else {
                    for (i in obj) {
                        value = callback.apply(obj[i], args);

                        if (value === false) {
                            break;
                        }
                    }
                }
            } else {
                // 数组
                if (isArray) {
                    for (; i < length; i++) {
                        // 相当于callback(i, obj[i])。然后callback里边的this指向了obj[i]
                        value = callback.call(obj[i], i, obj[i]);

                        if (value === false) {
                            break;
                        }
                    }
                    // 非数组
                } else {
                    for (i in obj) {
                        value = callback.call(obj[i], i, obj[i]);

                        if (value === false) {
                            break;
                        }
                    }
                }
            }

            return obj;
        },

        /**
         *  merge的两个参数必须为数组，作用就是修改第一个数组，使得它末尾加上第二个数组
         * @param first
         * @param second
         * @returns {*}
         */
        merge: function (first, second) {
            var l = second.length,
                i = first.length,
                j = 0;

            if (typeof l === "number") {
                for (; j < l; j++) {
                    first[i++] = second[j];
                }
            } else {
                while (second[j] !== undefined) {
                    first[i++] = second[j++];
                }
            }
            first.length = i;
            return first;
        },
        /**
         * 获取当前时间的时间戳
         * @returns {number}
         */
        now: function () {
            return (new Date()).getTime();
        },
        /**
         * DOM ready 是否已经完成
         */
        isReady: false,
        ready: function (callback_) {

            // 确定 body 存在
            if (!document.body) {
                // 在 setTimeout 中触发的函数, 一定会在 DOM 准备完毕后触发
                return setTimeout(iptv.ready, 0, callback_);
            }
            // 记录 DOM ready 已经完成
            iptv.isReady = true;
            console.log("DOM加载完成！");
            callback_.call(this, iptv.isReady);
        },
        /**
         * 浏览器名称
         * @returns {*|string}
         */
        browser: function () {
            var b3 = "";
            var b4 = navigator.appName;
            if (b4.indexOf("iPanel") != -1) {
                b3 = "iPanel";
            } else if (b4.indexOf("Microsoft") != -1) {
                b3 = "Miscrosoft";
            } else if (b4.indexOf("Google") != -1) {
                b3 = "Google";
            } else if (b4.indexOf("Netscape") != -1) {
                b3 = "Netscape";
            } else if (b4.indexOf("Opera") != -1) {
                b3 = "Opera";
            }
            return b3;
        },
        /**
         * 判断是否为空 兼容数字0判断为不为null
         * @param obj
         * @returns {boolean}
         */
        isNull: function (obj) {
            //0也判断为有效值
            var l_ = '' + obj;
            var ll_ = '' + 0;
            if (l_ == ll_) {
                return false;
            }
            if (typeof(obj) == 'object' && obj == '') {
                return false;
            }
            if (typeof(obj) == 'undefined' || obj == undefined || obj == null || obj == '') {
                return true;
            }
            return false;
        },
        /**
         * 判断是否不为空  兼容数字0判断为不为null
         * @param obj
         * @returns {boolean}
         */
        isNotNull: function (obj) {
            //0也判断为有效值
            var l_ = '' + obj;
            var ll_ = '' + 0;
            if (l_ == ll_) {
                return true;
            }
            if (typeof(obj) == 'object' && obj == '') {
                return true;
            }
            if (typeof(obj) == 'undefined' || obj == undefined || obj == null || obj == '') {
                return false;
            }
            return true;
        },
        /**
         * 设置或获取style样式值
         * @param elem
         * @param name
         * @param value
         * @returns {undefined}
         */
        style: function (elem, name, value) {
            if (!elem && !elem[0])return undefined;
            if (value) {
                if (iptv.isFunction(value)) {
                    elem[0].style[name] = value.call(elem);
                } else {
                    elem[0].style[name] = "" + value;
                }
                return elem;
            } else {
                return elem[0].style[name];
            }
        },
        /**
         * 获取项目名称，http://127.0.0.1:8080/baidu/index.html——>baidu/
         * @returns {string}
         */
        getContextName: function () {
            //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp  
            var curWwwPath = window.location.href;
            //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp  
            var pathName = window.location.pathname;
            var pos = curWwwPath.indexOf(pathName);
            //获取主机地址，如： http://localhost:8083  
            var localhostPaht = curWwwPath.substring(0, pos);
            //获取带"/"的项目名，如：uimcardprj/
            var projectName = pathName.substring(1, pathName.substr(1).indexOf('/') + 2);
            //var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1)---->/uimcardprj  
            return projectName;
        },
        /**
         * 获取ip与端口  http://127.0.0.1:8080
         * @returns {string}
         */
        getHostPath: function () {
            //http://localhost:8083/uimcardprj/share/meun.jsp  
            var href = window.location.href;
            //uimcardprj/share/meun.jsp  
            var pathname = window.location.pathname;
            return href.substr(0, href.lastIndexOf(pathname));
        },
        /**
         * 获取上下文路径  http://127.0.0.1:8080/baidu/index.html——>http://127.0.0.1:8080/baidu/
         * @returns {string}
         */
        getContextPath: function () {
            //http://www.qiguo.com/720p/html/main/main.html
            var pathname = window.location.pathname;
            var t1 = pathname.indexOf("/", 0);
            var sname = "";
            //判断域名后面还有没有路径了，如果有就获取域名+工程名
            if (pathname.indexOf("/", t1 + 1) > -1)//5
            {
                sname = pathname.substring(t1 + 1, pathname.indexOf("/", t1 + 1));
                sname = this.getHostPath() + "/" + sname + "/";
            }
            return sname;
        },
        /**
         * 将对象转换成url参数链接    aa=1&bb=2
         * @param data
         * @returns {*}
         */
        params: function (data) {
            if (!data) {
                return "";
            }
            var arr = [];
            for (var i in data) {
                arr.push(encodeURIComponent(i) + "=" + encodeURIComponent(data[i]));
            }
            return arr.join("&");
        },
        keyCode: function (evt) {
            evt = evt != null && evt != undefined ? evt : window.event;
            var keyCode = evt.which != null && evt.which != undefined && evt.which != 0 ? evt.which : evt.keyCode;
            return keyCode;
        },
        /**
         * 格式化字符串，动态添加值
         * iptv.formatStr("我的名字是{0},我今年{1}岁了","peter",12)——>我的名字是peter,我今年12岁了
         * @param str   "我的名字是{0},我今年{1}岁了"
         * @returns {*} 我的名字是peter,我今年12岁了
         */
        formatStr: function (str) {
            for (var i = 0; i < arguments.length - 1; i++) {
                str = str.replace("{" + i + "}", arguments[i + 1]);
            }
            return str;
        },
        /**
         * 获取机顶盒型号
         * @returns {*}
         * @constructor
         */
        STBType: function () {
            try {
                return Authentication.CTCGetConfig("STBType");
            } catch (e) {
            }
            return core_strundefined;
        },
        /**
         * 将方法上升到顶级window对象调用fn方法
         * @param fn    可以为js代码字符，可以是function
         * @param args  可以为数组参数，也可以为单个参数
         * @returns {*}
         */
        call: function (fn, args) {
            if (typeof(fn) == 'string') {
                return eval("(" + fn + ")");
            } else if (typeof(fn) == 'function') {
                //如果参数不是数组,就创建数组参数
                if (!iptv.isArray(args)) {
                    var arr = [];
                    for (var i = 1; i < arguments.length; i++) {
                        arr.push(arguments[i]);
                    }
                    args = arr;
                }
                return fn.apply(window, args);
            }
        },
        /**
         * 求最小数与最大数之间的随机数，该数永远不会等于最大数
         * @param Min
         * @param Max
         * @returns {*}
         */
        rangeNum: function (Min, Max) {
            return Min + Math.floor(Math.random() * (Max - Min));
        },
        /**
         * 求两个时间的天数差 日期格式为 YYYY-MM-dd
         * @param DateOne   2017-12-1
         * @param DateTwo   2017-1-1
         * @returns {number}
         */
        daysBetween: function (DateOne, DateTwo) {
            var OneMonth = DateOne.substring(5, DateOne.lastIndexOf('-'));
            var OneDay = DateOne.substring(DateOne.length, DateOne.lastIndexOf('-') + 1);
            var OneYear = DateOne.substring(0, DateOne.indexOf('-'));

            var TwoMonth = DateTwo.substring(5, DateTwo.lastIndexOf('-'));
            var TwoDay = DateTwo.substring(DateTwo.length, DateTwo.lastIndexOf('-') + 1);
            var TwoYear = DateTwo.substring(0, DateTwo.indexOf('-'));

            var cha = ((Date.parse(OneMonth + '/' + OneDay + '/' + OneYear) - Date.parse(TwoMonth + '/' + TwoDay + '/' + TwoYear)) / 86400000);
            return Math.abs(cha);
        },
        /**
         * 生成当前服务器时间搓
         */
        runTimeInterval: setInterval(function () {
            if (iptv.serverTimestamp != undefined && iptv.serverTimestamp != null && iptv.serverTimestamp != '') {
                iptv.serverTimestamp = parseInt(iptv.serverTimestamp) + 1000;
            } else {
                iptv.serverTimestamp = (new Date()).getTime();
            }
        }, 1000),
        /**
         * 获取当前服务器时间对象
         * @returns {Date}
         */
        getServerDate: function () {
            var date = new Date();
            if (iptv.serverTimestamp != undefined && iptv.serverTimestamp != null && iptv.serverTimestamp != '') {
                date = new Date(parseInt(iptv.serverTimestamp));
            }
            return date;
        },
        /**
         * 设置Cookie
         * @param name
         * @param value
         * @param timestr
         */
        setCookie: function (name, value, timestr) {
            var exp2 = iptv.getServerDate();
            var id = timestr ? timestr : "D1";
            var t = getsec(id);
            exp2.setTime(exp2.getTime() + t);
            document.cookie = name + ("=" + escape(value) + ";expires=" + exp2.toGMTString() + ";path=/;");
        },
        /**
         * 获取Cookie
         * @param name
         * @returns {*}
         */
        getCookie: function (name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            var s = "";
            if (arr != null) {
                s = unescape(arr[2]);
                if (s != null && s.length > 0) {
                    if (s.indexOf('"', 0) == 0 && s.substring(s.length - 1, s.length) == "\"") {
                        s = s.substring(1, s.length);
                        s = s.substring(0, s.length - 1);
                    }
                }
                return s;
            }
            return null;
        },
        /**
         * 删除Cookie
         * @param name
         */
        delCookie: function (name) {
            var exp = iptv.getServerDate();
            exp.setTime(exp.getTime() - 1);
            var cval = iptv.getCookie(name);
            if (cval != null) {
                document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/;";
            }
        },
        /**
         * 获取URL请求值
         * @param d url key值
         * @returns {*}
         */
        requestValue: function (d) {
            var b = window.location.href;
            var f = b.indexOf("?");
            var e = b.substr(f + 1);
            var c = e.split("&");
            for (var a = 0; a < c.length; a++) {
                var g = c[a].split("=");
                if (g[0].toUpperCase() == d.toUpperCase()) {
                    return g[1];
                }
            }
            return ""
        }
    });

    //添加类型
    iptv.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });
    //扩展日期
    iptv.extend(Date.prototype, {
        /**
         * 判断闰年
         * @returns {boolean}
         */
        isLeapYear: function () {
            return ( 0 == this.getYear() % 4 && ((this.getYear() % 100 != 0 ) || (this.getYear() % 400 == 0 )) );
        },
        /**
         * 日期格式化
         *格式 YYYY/yyyy/YY/yy 表示年份
         * MM/M 月份
         * W/w 星期
         * dd/DD/d/D 日期
         * hh/HH/h/H 时间
         * mm/m 分钟
         * ss/SS/s/S 秒
         * @param formatStr
         * @returns {*}
         * @constructor
         */
        Format: function (formatStr) {
            var str = formatStr;
            var Week = ['日', '一', '二', '三', '四', '五', '六'];

            str = str.replace(/yyyy|YYYY/, this.getFullYear());
            str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));
            var month = this.getMonth() + 1;
            str = str.replace(/MM/, month > 9 ? month : '0' + month);
            str = str.replace(/M/g, month);

            str = str.replace(/w|W/g, Week[this.getDay()]);

            str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
            str = str.replace(/d|D/g, this.getDate());

            str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
            str = str.replace(/h|H/g, this.getHours());
            str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
            str = str.replace(/m/g, this.getMinutes());

            str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
            str = str.replace(/s|S/g, this.getSeconds());

            return str;
        },
        /**
         * 日期计算
         * @param strInterval
         * @param Number
         * @returns {Date}
         * @constructor
         */
        DateAdd: function (strInterval, Number) {
            var dtTmp = this;
            switch (strInterval) {
                case 's' :
                    return new Date(Date.parse(dtTmp) + (1000 * Number));
                case 'n' :
                    return new Date(Date.parse(dtTmp) + (60000 * Number));
                case 'h' :
                    return new Date(Date.parse(dtTmp) + (3600000 * Number));
                case 'd' :
                    return new Date(Date.parse(dtTmp) + (86400000 * Number));
                case 'w' :
                    return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
                case 'q' :
                    return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number * 3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                case 'm' :
                    return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                case 'y' :
                    return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
            }
            ;
        },
        /**
         * 把日期分割成数组
         * @returns {*}
         */
        toArray: function () {
            var myDate = this;
            var myArray = Array();
            myArray[0] = myDate.getFullYear();
            myArray[1] = myDate.getMonth();
            myArray[2] = myDate.getDate();
            myArray[3] = myDate.getHours();
            myArray[4] = myDate.getMinutes();
            myArray[5] = myDate.getSeconds();
            return myArray;
        },
        /**
         * 取得日期数据信息
         * 参数 interval 表示数据类型
         * y 年 m月 d日 w星期 ww周 h时 n分 s秒
         * @param interval
         * @returns {string}
         * @constructor
         */
        DatePart: function (interval) {
            var myDate = this;
            var partStr = '';
            var Week = ['日', '一', '二', '三', '四', '五', '六'];
            switch (interval) {
                case 'y' :
                    partStr = myDate.getFullYear();
                    break;
                case 'm' :
                    partStr = myDate.getMonth() + 1;
                    break;
                case 'd' :
                    partStr = myDate.getDate();
                    break;
                case 'w' :
                    partStr = Week[myDate.getDay()];
                    break;
                case 'ww' :
                    partStr = myDate.WeekNumOfYear();
                    break;
                case 'h' :
                    partStr = myDate.getHours();
                    break;
                case 'n' :
                    partStr = myDate.getMinutes();
                    break;
                case 's' :
                    partStr = myDate.getSeconds();
                    break;
            }
            return partStr;
        }
    });

    //定义对象方法
    iptv.fn.extend({
        /**
         * 设置隐藏
         * @returns {hide}
         */
        hide: function () {
            if (this[0]) {
                iptv.style(this, "visibility", "hidden");
            }
            return this;
        },
        show: function () {
            if (this[0]) {
                iptv.style(this, "visibility", "visible");
            }
            return this;
        },
        /**
         * 设置或获取html
         * @param html
         * @returns {html}
         */
        html: function (html) {
            if (this[0]) {
                if (html) {
                    this[0].innerHTML = "" + html;
                    return this;
                } else {
                    return this[0].innerHTML;
                }
            } else {
                return this;
            }
        },
        /**
         * 替换或获取Src路径地址
         * @param src
         * @returns {setSrc}
         */
        src: function (src) {
            if (this[0] && iptv.trim(src)) {
                this[0].src = "" + src;
                return this;
            } else if (this[0]) {
                return this[0].src;
            }

        },
        /**
         * 获取或设置样式
         * @param name
         * @param value
         */
        attr: function (name, value) {
            return iptv.style(this, name, value);
        },
        /**
         * 判断是否存在className样式名 如果存在就返回一个数组对象 不存在就返回为Null
         * @param className
         * @returns {boolean}
         */
        hasClass: function (className) {
            if (!className || !this[0]) {
                return false;
            }
            return this[0].className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        },
        /**
         * 添加类样式
         * @param className
         * @returns {addClass}
         */
        addClass: function (className) {
            if (!className || !this[0]) {
                return this;
            }
            if (!this.hasClass(className)) {
                this[0].className += ' ' + className;
            }
            return this;
        },
        /**
         * 移除类样式
         * @param className
         * @returns {removeClass}
         */
        removeClass: function (className) {
            if (!className || !this[0]) {
                return this;
            }
            if (this.hasClass(className)) {
                this[0].className = this[0].className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
            }
            return this;
        },
        /**
         * 如果存在就删除className样式，如果不存在就添加className样式
         * @param className
         * @returns {toggleClass}
         */
        toggleClass: function (className) {
            if (!className || !this[0]) {
                return this;
            }
            if (this.hasClass(className)) {
                return this.removeClass(className);
            } else {
                return this.addClass(className);
            }
        },
        /**
         * 添加事件
         * @param type
         * @param func
         * @returns {addEvent}
         */
        addEventListener: function (type, func) {
            if (!this[0]) {
                return this;
            }
            if (this[0].addEventListener) {
                //监听IE9，谷歌和火狐 
                this[0].addEventListener(type, func, false);
            } else if (this[0].attachEvent) {
                this[0].attachEvent("on" + type, func);
            } else {
                this[0]["on" + type] = func;
            }
            return this;
        },
        /**
         * 移除事件
         * @param target
         * @param type
         * @param func
         */
        removeEventListener: function (type, func) {
            if (!this[0]) {
                return this;
            }
            if (this[0].removeEventListener) {
                //监听IE9，谷歌和火狐 
                this[0].removeEventListener(type, func, false);
            } else if (this[0].detachEvent) {
                this[0].detachEvent("on" + type, func);
            } else {
                delete target["on" + type];
            }
            return this;
        },
        /**
         * 设置css3样式
         * @param objAttr
         */
        setCss3: function (objAttr) {
            //循环属性对象
            for (var i in objAttr) {
                var newi = i;
                //判断是否存在transform-origin这样格式的属性
                if (newi.indexOf("-") > 0) {
                    //将-o字符变成大写-O
                    var num = newi.indexOf("-");
                    newi = newi.replace(newi.substr(num, 2), newi.substr(num + 1, 1).toUpperCase());
                }
                //考虑到css3的兼容性问题,所以这些属性都必须加前缀才行
                this[0].style[newi] = objAttr[i];
                //设置首字母大写   
                newi = newi.replace(newi.charAt(0), newi.charAt(0).toUpperCase());
                this[0].style["webkit" + newi] = objAttr[i];
                this[0].style["moz" + newi] = objAttr[i];
                this[0].style["o" + newi] = objAttr[i];
                this[0].style["ms" + newi] = objAttr[i];
                this[0].style["khtml" + newi] = objAttr[i];
            }
        },
        contains: function (key) {
            if (this.context && iptv.isArray(this.context)) {
                var i = this.context.length;
                while (i--) {
                    if (this.context[i] === key) {
                        return true;
                    }
                }
            }
            return false;
        }
    });

    //定义ajax模块
    function createXHR() {
        if (typeof XMLHttpRequest != "undefined") { // 非IE6浏览器
            return new XMLHttpRequest();
        } else if (typeof ActiveXObject != "undefined") {   // IE6浏览器
            var version = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp",];
            for (var i = 0; i < version.length; i++) {
                try {
                    return new ActiveXObject(version[i]);
                } catch (e) {
                }
            }
        }
    }

    iptv.extend({
        ajax: function (obj) {
            obj = obj || {};
            obj.method = obj.method.toUpperCase() || 'POST';
            obj.url = obj.url || '';
            obj.url += obj.url.indexOf("?") == -1 ? "?rand=" + Math.random() : "&rand=" + Math.random();
            obj.data = obj.data || {};
            obj.async = obj.async || true;
            obj.success = obj.success || function () {
                };
            obj.error = obj.error || function () {
                };
            var params = [];
            for (var key in obj.data) {
                params.push(key + "=" + obj.data[key]);
            }
            var postData = params.join("&");
            var xhr = createXHR();
            if (obj.method === "POST") {
                xhr.open(obj.method, obj.url, obj.async);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
                xhr.send(postData);
            } else if (obj.method === "GET") {
                xhr.open(obj.method, obj.url + '&' + postData, obj.async);
                xhr.send(null);
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (xhr.responseText) {
                        var responseObj = eval("(" + xhr.responseText + ")");
                        //登陆失效
                        if (responseObj && responseObj.code == 1001) {
                            window.location.href = iptv.ErrorLoginFailUrl;
                        } else if (responseObj == null || responseObj == "" || responseObj.code == null) {
                            window.location.href = iptv.ErrorServerFailUrl;
                        } else {
                            obj.success(xhr.responseText);
                        }

                    }

                } else if (xhr.readyState == 4 && xhr.status != 200) {
                    obj.error(xhr.status, xhr.statusText);
                }
            };
        }
    });

    window.iptv = window.$ = iptv;
})(window);