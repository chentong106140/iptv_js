/**
 * Created by cherish on 2017/12/14.
 */

(function (window, iptv) {

    /**
     * 用于保存所有区域的键值
     */
    var keyList = iptv.keyList = [],
        /**
         * 焦点方向池
         * @type {Array}
         */
        focusDires = iptv.focusDires = [],
        /**
         * 焦点池
         * @type {Array}
         */
        focusCollection = iptv.focusCollection = [],
        /**
         * 遥控器所有按键
         */
        keys = iptv.keys = function () {
            var this_ = this;
            this_.UP = "UP";
            this_.DOWN = "DOWN";
            this_.LEFT = "LEFT";
            this_.RIGHT = "RIGHT";
            this_.OK = "OK";
            this_.BACK = "BACK";
            this_.ZERO = "ZERO";
            this_.ONE = "ONE";
            this_.TWO = "TWO";
            this_.THREE = "THREE";
            this_.FOUR = "FOUR";
            this_.FIVE = "FIVE";
            this_.SIX = "SIX";
            this_.SEVEN = "SEVEN";
            this_.EIGHT = "EIGHT";
            this_.NINE = "NINE";
            this_.OUT_PAGE = "OUT_PAGE";
            this_.HOME_PAGE = "HOME_PAGE";
            this_.STOP = "STOP";
            this_.MENU = "MENU";
            this_.DEL = "DEL";
            this_.PAGEDOWN = "PAGEDOWN";
            this_.PAGEUP = "PAGEUP";
        },

        key = iptv.key = {
            /**
             * 是否禁用方向按键，默认不禁用
             */
            displayDire: false,
            /**
             * 上一个焦点按键方向
             */
            lastDire: '',
            /**
             * 添加区域键值对象
             * @param areaName  区域名称
             * @param keyObj    键值对象
             */
            addKey: function (areaName, keyObj) {
                var ii = 0;
                for (var i in keyObj) {
                    ++ii;
                }
                keyObj.length = ii + 10000;
                iptv.keyList[areaName + ""] = keyObj;
            },
            /**
             * 根据key值，获取key值对于的名称
             * @param keyCode   key值
             * @returns {*}
             */
            getKeyCodeName: function (keyCode) {
                //循环区域
                for (var i in iptv.keyList) {
                    var sii = 0;
                    //循环区域对应的键值对象
                    for (var kn in iptv.keyList[i]) {
                        ++sii;
                        if (iptv.keyList[i][kn] == keyCode) {
                            return kn;
                        }
                        //下面的做法是兼容创维的盒子，因为他们不支持双重循环，需要手动break;
                        if (sii >= (iptv.keyList[i].length - 10000)) {
                            var version = iptv.STBType();
                            //为了兼容创维盒子，创维盒子有的需要手动break才能跳出内部循环，有的创维盒子反而手动break了，就不能跳出循环了，妈的坑货
                            if (version != "E1100" && version != "ITV218.1") {
                                break;
                            }
                        }
                    }
                }
                return '';
            },

            /**
             * 根据字符匹配对应数据
             * @param num_
             */
            numChange: function (num_) {
                var num = "";
                switch (num_) {
                    case "ONE" :
                        num = 1;
                        break;
                    case "TWO" :
                        num = 2;
                        break;
                    case "THREE" :
                        num = 3;
                        break;
                    case "FOUR" :
                        num = 4;
                        break;
                    case "FIVE" :
                        num = 5;
                        break;
                    case "SIX" :
                        num = 6;
                        break;
                    case "SEVEN" :
                        num = 7;
                        break;
                    case "EIGHT" :
                        num = 8;
                        break;
                    case "NINE" :
                        num = 9;
                        break;
                    case "ZERO" :
                        num = 0;
                        break;
                    case "DEL" :
                        num = "DEL";
                        break;
                    default :
                        num = "";
                        break;
                }
                if (iptv.isFunction(iptv.key.numEvent)) {
                    iptv.key.numEvent(num);
                }
            },
            /**
             * 方向具体处理细节
             * @param dire
             */
            direHandle:function (dire) {
                key.lastDire = dire;
                var fDires = focusDires[key.curFocus.id];
                if(fDires)
                {
                    // 由于当前方法是用来往右移动的，只需判断是否有右方的focusID
                    // 当前焦点，往某方向按键时具有优先执行，如果指定了方向事件，就不会切换当前焦点，而去执行事件
                    if(fDires[dire+"Event"])
                    {
                        key.exeCode(fDires[dire+"Event"]);
                        return;
                    }else if(fDires[dire])
                    {
                        // 如果往下移动被赋值了disable说明啥都不操作
                        if(fDires[dire] == "disable")
                        {
                            key.lastDire = "";
                            return;
                        }
                        // 通过focusID找到焦点对象
                        var nextNode = iptv("#"+fDires[dire]).getFocusObj();
                        if(nextNode && nextNode.enFocus == true)
                        {
                            key.changeFocus(fDires[dire]);
                            return;
                            //如果原本设置的按钮被禁用了，倘若设置了downOther值，就让此按钮获得焦点
                        }else if(nextNode && nextNode.enFocus==false && fDires[dire+"OtherEvent"])
                        {

                            key.exeCode(fDires[dire+"OtherEvent"]);
                            return;
                        }else if(nextNode && nextNode.enFocus==false && fDires[dire+"Other"])
                        {
                            // 通过focusID找到焦点对象
                            var otherNode =iptv("#"+fDires[dire+"Other"]).getFocusObj();
                            if(otherNode && otherNode.enFocus==true)
                            {
                                key.changeFocus(fDires[dire+"Other"]);
                                return;
                            }
                        }else if(!nextNode && fDires[dire+"NoEvent"])
                        {
                            //如果右边制定了left焦点，但是这个left焦点不在焦点池中，可以自定义事件
                            key.exeCode(fDires[dire+"NoEvent"]);
                            return;
                        }else if(!nextNode && fDires[dire+"No"])
                        {
                            // 通过focusID找到焦点对象
                            var otherNode = iptv("#"+fDires[dire+"No"]).getFocusObj();
                            if(otherNode && otherNode.enFocus==true)
                            {
                                key.changeFocus(fDires[dire+"No"]);
                                return;
                            }
                        }
                    }else if(fDires.otherEvent)
                    {
                        key.exeCode(fDires.otherEvent);
                        return;
                    }else if(fDires.other)
                    {
                        if(fDires.other =="disable")
                        {
                            key.lastDire = "";
                            return;
                        }
                        // 通过focusID找到焦点对象
                        var nextNode = iptv("#"+fDires.other).getFocusObj();
                        if(nextNode && nextNode.enFocus==true)
                        {
                            key.changeFocus(fDires.other);
                            return;
                        }
                    }
                }
                key.lastDire = "";
            },
            /**
             * 上下左右控制具体方向处理函数
             * @param direType
             */
            focusHand: function (direType) {
                if (key.displayDire == false) {
                    switch (direType) {
                        case "UP" :
                        case "DOWN" :
                        case "LEFT" :
                        case "RIGHT" :
                            key.direHandle(direType.toLowerCase());
                        default :
                            break;
                    }
                }
            },

            /**
             * 切换焦点方法
             * @param focusId_
             * @returns {*}
             */
            changeFocus: function (focusId_) {
                // 通过focusID找到焦点对象
                var nextNode = iptv("#" + focusId_).getFocusObj();
                if (nextNode) {
                    var oldFocus = key.curFocus;
                    //在让老焦点失去焦点之前，告诉老焦点下一个当前焦点的id
                    oldFocus.nextFocusId = focusId_;
                    // 切换新焦点之前，需要执行失去焦点事件
                    oldFocus.onBlur();
                    var fid = oldFocus.id;
                    // 给当前焦点重新赋值
                    key.curFocus = nextNode;
                    //在让新焦点获取焦点之前，告诉新焦点上一个焦点的id
                    key.curFocus.lastFocusId = fid;
                    key.curFocus.onFocus();
                    return nextNode;
                }

            },

            /**
             * 跳转链接
             * @param url
             */
            redirect: function (url) {
                if (url && iptv.trim(url)) {
                    // 如果禁用了按键，就不执行
                    if (key.curFocus.enable == true) {
                        // 如果执行了页面跳转，就禁止再次点击跳转
                        key.curFocus.enable = false;
                        window.location.href = url;
                    }
                }
            },
            /**
             * 执行JavaScript代码
             * @param _code
             */
            exeCode: function (_code) {
                if (_code ) {
                    var code = _code;
                    try {
                        if(iptv.type(_code) === "string" && iptv.trim(_code))
                        {
                            if (code.indexOf("javascript:") == 0) {
                                code = code.replace("javascript:", "");
                                eval(code);
                            } else if (code.indexOf("http://") == 0) {
                                key.redirect(code);
                            }
                        }else if(iptv.type(_code) === "function")
                        {
                            _code.call(key.curFocus);
                        }
                        
                    } catch (e) {
                        iptv.error(e);
                    }
                }
            }

        }
    ;

    //添加常用键值对象
    key.addKey("HH", {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        OK: 13,
        BACK: 8,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        DEL: 46,
        PAGEDOWN: 34,
        PAGEUP: 33
    });
    //添加华为机顶盒
    key.addKey("HW", {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        OK: 13,
        BACK: 8,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        DEL: 1131,
        PAGEDOWN: 34,
        PAGEUP: 33
    });
    //添加南京广电机顶盒
    key.addKey("NJGD", {BACK: 640, HOME_PAGE: 113, OUT_PAGE: 114, DEL: 127});
    //添加北京歌华机顶盒
    key.addKey("BJGH", {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4,
        OK: 13,
        BACK: 340,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        OUT_PAGE: 339,
        HOME_PAGE: 512,
        STOP: 1025,
        MENU: 513
    });


    /**
     * 焦点构造函数
     * @constructor
     */
    iptv.FocusModel = function () {
        var this_ = this;
        // 焦点描述名称
        this_.name = '';
        // 是否开启按ok键
        this_.enable = true;
        // 是否允许此焦点对象获得焦点
        this_.enFocus = true;
        //该按钮是否被当前页面生成，默认未生成，作用防止开发者直接new FocusModel()
        this_.isCreated = false;
        // 焦点编号，判断是否同一个焦点,非空
        this_.id = "";
        // 将自己的对象赋给此属性
        this_.own = this_;
        //坐标
        this_.X_Posi = 0;
        this_.Y_Posi = 0;
        this_.focusType = 7;
        //指向的图片的id
        this_.imgID = "";
        // 图片切换使用，新图片地址
        this_.newSwap = "";
        // 原始图片
        this_.oldSwap = "";
        // 当前焦点上下左右，四个方向应该走的focusID数组
        this_.dieArr = null;
        // 对应的DOM对象
        this_.nodeObj = null;
        // 临时数据储存
        this_.tempData = null;
        // 在默认获得焦点事件上添加其他执行事件
        this_.onFocusEvent = "";
        // 在默认失去焦点事件上添加额外的执行事件
        this_.onBlurEvent = "";
        // 按确定的跳转地址
        this_.clickEvent = "";
        this_.interval = null;
        //焦点获取焦点时，图标变大的大小，默认20
        this_.changeSize = 10;
        //移动选中框，此选中框是用户自己在html中写出，并指定id,对应效果知识移动选中框位置，不存在动画，对应focusType为10
        this_.selectBorderId = '';
        //移动选中框id,此选中框是代码自动生成的元素，对应效果选中框放大与平移动画，对应focusType为15或16
        this_.selectionID = "selectionID";
        //移动选中框id，此选中框是用户自己要在html中指定元素的id，对应效果是平移选中框，不存在放大动画，与selectBorderId的区别就是它是控制位置没有动画，selectionObjId是控制位置有动画，对应focusTypeId为17
        this_.selectionObjID = "selectionObjID";
        //对应展示图片的层次大小
        this_.focusImgZIndex = 998;
        //对应展示图片的父级元素的层次大小
        this_.focusImgParentZIndex = 998;
        //对应焦点内部图片的层次大小
        this_.imgZIndex = 999;
        //对应焦点内部图片的父级元素的层次大小
        this_.imgParentZIndex = 999;
        //焦点的父节点的ID值
        this_.upParentId = '';
        //用于控制可观看区域的节点ID值
        this_.upAreaId = '';
        this_.rightAreaId = '';
        this_.rightParentId = '';
        //是否开启父容器滚动，默认为false，不滚动
        this_.enUpParentRoll = false;
        this_.enRightParentRoll = false;

        //开启整页滚动
        this_.enRightPageRoll = false;
        //当前焦点索引
        this_.focusIndex = 0;
        //当前焦点对应的当前页
        this_.focusCurPageNum = 0;
        //当前焦点对应的总页数
        this_.focusAllPageNum = 0;
        //当前焦点需要整页滚动的left值
        this_.focusLeftRoll = 0;
        //当前焦点列表中第一个焦点的left值
        this_.focusFirstLeft = 0;
        //当前焦点对应页码的所有焦点id,该值为数组对象
        this_.focusPageAllModel = null;
        //当前焦点对应页码的所有焦点图片是否已经加载过
        this_.focusPageAllLoad = false;
        this_.lastFocusId = '';


        this_.init = function () {
            key.curFocus = this_.own;
            //处理父容器滚动
            if (this_.enUpParentRoll || this_.enRightParentRoll) {
                //获取父容器ID
                var upParentId = this_.upParentId;
                //控制可观看区域容器的ID
                var upAreaId = this_.upAreaId;

                var rightParentId = this_.rightParentId;
                var rightAreaId = this_.rightAreaId;

                var upParentObj = iptv.$(upParentId);
                var upAreaObj = iptv.$(upAreaId);
                var rightParentObj = iptv.$(rightParentId);
                var rightAreaObj = iptv.$(rightAreaId);
                //如果是按上或按下，只会用到rightParentId和rightAreaId
                if (key.lastDire == 'down' && this_.enUpParentRoll == true) {
                    //页面被滚去的高度
                    // var parRollHeight = areaObj.scrollTop || parseInt(parentObj.style.top) || 0;
                    var parRollHeight = Math.abs(parseInt(upParentObj.style.top)) || 0;
                    //可观看区域容器实际可存放内容的高度
                    var parHeight = upAreaObj.clientHeight || parseInt(upAreaObj.style.height) || 0;
                    //焦点的top值
                    var focusTop = parseInt(this_.Y_Posi);
                    //如果没有手动赋值，那么就获取top值
                    if (iptv.isNull(focusTop) || focusTop == 0) {
                        focusTop = this_.nodeObj ? Math.abs(parseInt(this_.nodeObj.style.top)) : 0;
                    }
                    //焦点实际占位高度
                    //var focusHeight = this_.nodeObj ? this_.nodeObj.offsetHeight : parseInt(this_.nodeObj.style.height);
                    var focusHeight = this_.nodeObj ? parseInt(this_.nodeObj.style.height) : 0;
                    //被滚去的高度+父容器实际可存放内容的高度
                    var parA = parRollHeight + parHeight;
                    //焦点的TOP值+焦点实际占位的高度
                    var focB = focusTop + focusHeight;
                    //如果后者大于前者，那么说明当前焦点在可观察区域的下面，所以这时需要考虑父容器需要往下滚多少距离，才能让当前焦点被显示出来
                    if (parA < focB) {
                        //获取当前焦点被遮挡的高度+当前父容器已经滚去的高度，就能得到现在父容器需要总的滚动高度
                        var rollHeight = focB - parA + parRollHeight;
                        upParentObj.style.top = "-" + rollHeight + "px";
                        //*****************************左右上下滚动需要统一监控，用于动态加载图片，目前时间问题，没有继续开发，此处留做后期升级****************************/
                    }
                }

                if (key.lastDire == 'up' && this_.enUpParentRoll == true || key.lastDire == 'right' && this_.enUpParentRoll == true || key.lastDire == 'down' && this_.enUpParentRoll == true) {
                    //页面被滚去的高度
                    // var parRollHeight = areaObj.scrollTop || parseInt(parentObj.style.top) || 0;
                    var parRollHeight = Math.abs(parseInt(upParentObj.style.top)) || 0;
                    //焦点的top值
                    var focusTop = parseInt(this_.Y_Posi);
                    //如果没有手动赋值，那么就获取top值
                    if (iptv.isNull(focusTop) || focusTop == 0) {
                        focusTop = this_.nodeObj ? Math.abs(parseInt(this_.nodeObj.style.top)) : 0;
                    }
                    //页面被滚去的高度
                    var parA = parRollHeight;
                    //焦点的TOP值
                    var focB = focusTop;
                    //如果焦点的TOP值小于当前被滚去的高度，那么说明此时需要往下滚
                    if (parA > focB) {
                        //如果需要父容器往下滚，那么滚去的高度就是焦点的TOP值
                        var rollHeight = focB;
                        upParentObj.style.top = "-" + rollHeight + "px";
                        //*****************************左右上下滚动需要统一监控，用于动态加载图片，目前时间问题，没有继续开发，此处留做后期升级****************************/
                    }
                }

                if (iptv.lastDire == 'right' && this_.enRightParentRoll == true) {
                    //页面被滚去的宽度
                    var parRollWidth = Math.abs(parseInt(rightParentObj.style.left)) || 0;
                    //可观看区域容器实际可存放内容的高度
                    var parWidth = rightAreaObj.clientWidth || parseInt(rightAreaObj.style.width) || 0;
                    //焦点的left值
                    var focusLeft = parseInt(this_.X_Posi);
                    //如果没有手动赋值，那么就获取left值
                    if (iptv.isNull(focusLeft) || focusLeft == 0) {
                        focusLeft = this_.nodeObj ? Math.abs(parseInt(this_.nodeObj.style.left)) : 0;
                    }
                    //焦点实际占位宽度
                    // var focusWidth = this_.nodeObj ? this_.nodeObj.offsetWidth : parseInt(this_.nodeObj.style.width);
                    var focusWidth = this_.nodeObj ? parseInt(this_.nodeObj.style.width) : 0;
                    //被滚去的宽度+父容器实际可存放内容的宽度
                    var parA = parRollWidth + parWidth;
                    ///页面被滚去的宽度
                    var parB = parRollWidth;
                    //焦点的LEFT值+焦点实际占位的宽度
                    var focB = focusLeft + focusWidth;
                    //如果后者大于前者，那么说明当前焦点在可观察区域的右边，所以这时需要考虑父容器需要往左滚多少距离，才能让当前焦点被显示出来
                    if (parA < focB) {
                        //获取当前焦点被遮挡的宽度+当前父容器已经滚去的宽度，就能得到现在父容器需要总的滚动宽度
                        var rollWidth = focB - parA + parRollWidth;
                        rightParentObj.style.left = "-" + rollWidth + "px";
                        //*****************************左右上下滚动需要统一监控，用于动态加载图片，目前时间问题，没有继续开发，此处留做后期升级****************************/
                    } else if (parB > focB) {
                        //被滚去的宽度大于焦点left值+占位宽度,说明焦点完全被遮盖,那么父容器所需要向左滚动的宽度就等于当前焦点的left值
                        var rollWidth = focusLeft;
                        rightParentObj.style.left = "-" + rollWidth + "px";
                        //*****************************左右上下滚动需要统一监控，用于动态加载图片，目前时间问题，没有继续开发，此处留做后期升级****************************/
                    }
                }

                if (iptv.lastDire == 'left' && this_.enRightParentRoll == true || iptv.lastDire == 'down' && this_.enRightParentRoll == true) {
                    //页面被滚去的宽度
                    var parRollWidth = Math.abs(parseInt(rightParentObj.style.left)) || 0;
                    //焦点的left值
                    var focusLeft = parseInt(this_.X_Posi);
                    //如果没有手动赋值，那么就获取left值
                    if (iptv.isNull(focusLeft) || focusLeft == 0) {
                        focusLeft = this_.nodeObj ? Math.abs(parseInt(this_.nodeObj.style.left)) : 0;
                    }
                    //页面被滚去的宽度
                    var parA = parRollWidth;
                    //焦点的LEFT值
                    var focB = focusLeft;
                    //如果焦点的TOP值小于当前被滚去的高度，那么说明此时需要往下滚
                    if (parA > focB) {
                        //如果需要父容器往下滚，那么滚去的高度就是焦点的TOP值
                        var rollWidth = focB;
                        rightParentObj.style.left = "-" + rollWidth + "px";
                        //*****************************左右上下滚动需要统一监控，用于动态加载图片，目前时间问题，没有继续开发，此处留做后期升级****************************/
                    }
                }
            } else if (this_.enRightPageRoll == true) {
                //开启整页滚动
                var rightParentId = this_.rightParentId;
                var rightAreaId = this_.rightAreaId;
                var rightParentObj = iptv.$(rightParentId);
                var rightAreaObj = iptv.$(rightAreaId);
                //获取当前页需要滚动的距离
                var rollLeft = this_.focusLeftRoll || 0;
                rightParentObj.style.left = '-' + rollLeft + "px";
            }
            //动态加载图片
            if (this_.focusPageAllModel && this_.focusPageAllModel.length > 0 && this_.focusPageAllLoad == false) {
                var allModel = this_.focusPageAllModel;
                for (var i in allModel) {

                    var focusModel = iptv("#"+allModel[i]).getFocusObj();
                    if (focusModel && focusModel.newSwap) {
                        iptv("#"+focusModel.imgID + "_img").src(focusModel.newSwap);
                    }
                }
                this_.focusPageAllLoad = true;
            }

        };
        //如果默认的onFocus方法不满足需求，就可以指定onFocus_属性
        this_.onFocus_ = "";
        // 默认获得焦点事件
        this_.onFocus = function () {
            if (this_.enFocus && this_.isCreated == true) {
                this_.init();
                if (iptv.isNotNull(this_.onFocus_)) {
                    key.exeCode(this_.onFocus_);
                } else {
                    if (this_.focusType == 2) {
                        iptv("#"+this_.imgID).src(this_.newSwap);
                    } else if (this_.focusType == 7) {
                        if (key.curFocus.imgID) {
                            iptv("#"+key.curFocus.imgID).show();
                        }
                    } else if (this_.focusType == 10) {
                        //焦点框是用户手动写到html中，负责移动此焦点框
                        if (iptv.isNotNull(this_.selectBorderId)) {
                            var lastFocusObj = iptv("#"+this.lastFocusId).getFocusObj();
                            //如果上一个焦点不是15或16，那么焦点框肯定是隐藏的，所以这边负责显示焦点框
                            if (lastFocusObj && lastFocusObj.focusType != 10 || !lastFocusObj) {
                                //显示光标
                                iptv("#"+this.selectBorderId).show();
                            } else {
                                iptv("#"+this.selectBorderId).addClass("transition")
                            }
                            //移动光标
                            iptv("#"+this_.selectBorderId).attr("top", this_.Y_Posi + "px").attr("left", this_.X_Posi + "px");
                        } else {
                            iptv.error("当前焦点未指定selectBorderId属性！")
                        }
                    } else if (this_.focusType == 12) {
                        //负责将对应的展示图片添加放大动画，焦点框是通过焦点对应图片添加放大动画
                        //前提，需要有焦点对应的展示图片，同时需要有边框效果的焦点图片，其实就是将焦点对应的展示图片放大的同时，焦点图片也放大，焦点图片是有边框的图片
                        var img = iptv("#"+this_.imgID + "_img").addClass("transition")[0];
                        img.parentNode.style.zIndex = this_.focusImgParentZIndex;
                        iptv("#"+this_.imgID + "_img").attr("top", (parseInt(img.style.top) - this_.changeSize) + "px").attr("left", (parseInt(img.style.left) - this_.changeSize) + "px").attr("width", (parseInt(img.style.width) + 2 * this_.changeSize) + "px").attr("height", (parseInt(img.style.height) + 2 * this_.changeSize) + "px");
                        //添加过渡  显示焦点
                        var selects = iptv("#"+this_.imgID).addClass("transition").show()[0];
                        selects.parentNode.style.zIndex = this_.imgParentZIndex;
                        iptv("#"+this_.imgID).attr("top", (parseInt(selects.style.top) - this_.changeSize) + "px").attr("left", (parseInt(selects.style.left) - this_.changeSize) + "px").attr("width", (parseInt(selects.style.width) + 2 * this_.changeSize) + "px").attr("height", (parseInt(selects.style.height) + 2 * this_.changeSize) + "px");
                    } else if (this_.focusType == 13) {
                        //负责将对应的展示图片赋予边框与动画，效果为选中后，对于的展示图片添加了边框与放大效果，焦点对应的焦点图片不存在任何效果可以直接放空白图片，切记是对应的展示图片添加动画
                        //条件：焦点需要具有对应的展示图片，只负责控制焦点图片起到动画效果
                        var img = iptv("#"+this_.imgID + "_img").toggleClass("border").addClass("transition")[0];
                        img.parentNode.style.zIndex = this_.focusImgParentZIndex;
                        img.style.top = (parseInt(img.style.top) - this_.changeSize) + "px";
                        img.style.left = (parseInt(img.style.left) - this_.changeSize) + "px";
                        img.style.width = (parseInt(img.style.width) + 2 * this_.changeSize) + "px";
                        img.style.height = (parseInt(img.style.height) + 2 * this_.changeSize) + "px";
                    } else if (this_.focusType == 14) {
                        //负责将焦点div添加边框
                        //条件，焦点切换的形式就是讲焦点添加边框效果，同时显示与隐藏，都是针对于焦点div的操作
                        iptv("#"+this_.id).toggleClass("border").attr("zIndex", this_.imgParentZIndex).show();
                    } else if (this_.focusType == 15) {
                        //15与16都是代码自动生成div为选中框，该选中框只负责显示边框，对应的展示图片不具有放大效果，切换效果为显示与隐藏此自动生成的div边框，如果两个焦点都是15，同时两个焦点框大小也不一样，那么就会出现焦点边框自动放大与缩小效果
                        //焦点框：是自动生成的焦点div,位置大小是根据焦点的style里面控制的
                        //条件：需要用户对焦点的style赋予width,height,top,left属性，这些属性决定焦点框的大小与位置
                        //切换效果：选中：焦点框div显示，位置大小是焦点的style控制的，移开：焦点框div隐藏
                        var div = iptv.$(this_.selectionID);
                        if (!div) {
                            div = document.createElement('div');
                            div.setAttribute("id", this_.selectionID);
                            div.id = this_.selectionID;
                            div.style.width = "0px";
                            div.style.height = "0px";
                            div.style.top = "0px";
                            div.style.left = "0px";
                            div.style.zIndex = this_.imgParentZIndex;
                            div.className = "border position";
                            this_.nodeObj.parentNode.appendChild(div);
                        }
                        var lastFocusObj = iptv("#"+this_.lastFocusId).getFocusObj();
                        //如果上一个焦点不是15或16，那么焦点框肯定是隐藏的，所以这边负责显示焦点框
                        if (lastFocusObj && lastFocusObj.focusType != 15 && lastFocusObj.focusType != 16) {
                            iptv("#"+this_.selectionID).show();
                        } else {
                            iptv("#"+this_.selectionID).addClass("transition");
                        }
                        div.style.width = this_.nodeObj.style.width;
                        div.style.height = this_.nodeObj.style.height;
                        div.style.top = this_.nodeObj.style.top;
                        div.style.left = this_.nodeObj.style.left;
                    } else if (this_.focusType == 16) {
                        //焦点框：是自动生成的焦点div,位置大小是焦点对应的展示图片的父级目录div的大小位置控制的
                        //放大大小：根据焦点changeSize属性控制放大的大小
                        //条件：是具有对应的展示图片，需要自动生成焦点框div
                        //切换效果：选中：展示图片放大，自动生成的焦点边框放大，移开：展示图片缩小，自动生成的焦点边框隐藏
                        var div = iptv.$(this_.selectionID);
                        if (!div) {
                            div = document.createElement('div');
                            div.setAttribute("id", this_.selectionID);
                            div.id = this_.selectionID;
                            div.style.width = "0px";
                            div.style.height = "0px";
                            div.style.top = "0px";
                            div.style.left = "0px";
                            div.style.zIndex = this_.imgParentZIndex;
                            div.className = "border position";
                            this_.nodeObj.parentNode.appendChild(div);
                        }
                        var lastFocusObj = iptv("#"+this_.lastFocusId).getFocusObj();
                        var img = iptv.$(this_.imgID + "_img");
                        //如果上一个焦点不是15或16，那么就不需要焦点具有动画效果，这边控制取消动画，直接让战士图片放大与焦点div直接显示
                        if (lastFocusObj && lastFocusObj.focusType != 15 && lastFocusObj.focusType != 16) {
                            iptv("#"+this_.selectionID).removeClass("transition");
                        } else {
                            iptv("#"+this_.selectionID).addClass("transition");
                        }
                        iptv("#"+this_.selectionID).show();
                        //让对应的展示图片放大，并且拥有放大动画
                        iptv("#"+this_.imgID + "_img").addClass("transition");
                        //焦点框放大,由于焦点框的位置是基于展示图片的父级元素的左上角为起点进行放大的，有了边框的原因导致位置与放大后的展示图片的位置不对应，所以需要进一步减去或加上边框的大小
                        div.style.top = (parseInt(img.parentNode.style.top) - this_.changeSize - 2) + "px";
                        div.style.left = (parseInt(img.parentNode.style.left) - this_.changeSize - 2) + "px";
                        div.style.width = (parseInt(img.parentNode.style.width) + 2 * this_.changeSize + 1) + "px";
                        div.style.height = (parseInt(img.parentNode.style.height) + 2 * this_.changeSize + 1) + "px";
                        //对应的展示图片放大
                        img.parentNode.style.zIndex = this_.focusImgParentZIndex;
                        img.style.top = (parseInt(img.style.top) - this_.changeSize) + "px";
                        img.style.left = (parseInt(img.style.left) - this_.changeSize) + "px";
                        img.style.width = (parseInt(img.style.width) + 2 * this_.changeSize) + "px";
                        img.style.height = (parseInt(img.style.height) + 2 * this_.changeSize) + "px";

                    } else if (this_.focusType == 17) {
                        //焦点框是用户自己写到html中，可以自己定制化焦点框的样式，比如边框，背景图，里面包含图片等等，对应动画效果为平移，没有放大效果
                        //条件：需要用户自己定义一个焦点选中框div，并且指定该div有id值赋予给焦点selectionObjID属性
                        var div = iptv.$(this_.selectionObjID);
                        //如果上一个焦点不是17，或者是初始化第一个焦点，那么先显示移动框，不赋予动画
                        //如果上一个焦点是17，但是焦点框不是同一个，需要隐藏上一个焦点框，显示下一个焦点框
                        var lastFocusObj = iptv("#"+this_.lastFocusId).getFocusObj();
                        if (lastFocusObj && lastFocusObj.focusType != 17 || !lastFocusObj || lastFocusObj && lastFocusObj.focusType == 17 && lastFocusObj.selectionObjID != this_.selectionObjID) {
                            if (div) {
                                iptv("#"+this_.selectionObjID).removeClass("transition").show();
                            }
                        } else {
                            //如果上一个焦点是17,并且上一个焦点存在，那么就赋予动画
                            if (lastFocusObj && lastFocusObj.focusType == 17 && div) {
                                iptv("#"+this_.selectionObjID).addClass("transition");
                            }
                        }
                        if (div) {
                            var img = iptv.$(this_.imgID);
                            div.style.top = parseInt(img.parentNode.style.top) + "px";
                            div.style.left = parseInt(img.parentNode.style.left) + "px";
                        }
                    } else if (this_.focusType == 18) {
                        //选中后，焦点框图片显示，同时该图片要同时与对应的焦点图片放大
                        if (key.curFocus.imgID) {
                            iptv("#"+key.curFocus.imgID).removeClass("transitionsHide0_5");
                            iptv("#"+key.curFocus.imgID + "_img").removeClass("transitionsHide0_5");
                            iptv("#"+key.curFocus.imgID).addClass("transitionsShow0_5");
                            iptv("#"+key.curFocus.imgID + "_img").addClass("transitionsShow0_5");
                            iptv("#"+key.curFocus.imgID).show();

                        }
                    }
                }
                if (this_.onFocusEvent) {
                    key.exeCode(this_.onFocusEvent);
                }
            }
        };
        this_.onBlur_ = "";
        this_.onBlur = function () {
            if (this_.enFocus && this_.isCreated == true) {
                if (iptv.isNotNull(this_.onBlur_)) {
                    key.exeCode(this_.onBlur_);
                } else {
                    if (this_.focusType == 2) {
                        iptv("#"+this_.imgID).src(this_.oldSwap);
                    }
                    // 隐藏发光圈圈
                    if (this_.focusType == 7) {
                        iptv("#"+key.curFocus.imgID).hide();
                    }
                    
                    if (this_.focusType == 10) {
                        //隐藏光标
                        iptv("#"+this_.selectBorderId).hide();
                    }
                    if (this_.focusType == 12) {
                        iptv("#"+this_.imgID + "_img").toggleClass("transition");
                        var img = iptv.$(this_.imgID + "_img");
                        img.parentNode.style.zIndex = 2;
                        img.style.top = (parseInt(img.style.top) + this_.changeSize) + "px";
                        img.style.left = (parseInt(img.style.left) + this_.changeSize) + "px";
                        img.style.width = (parseInt(img.style.width) - 2 * this_.changeSize) + "px";
                        img.style.height = (parseInt(img.style.height) - 2 * this_.changeSize) + "px";
                        iptv("#"+this_.imgID).hide();
                        var selects = iptv.$(this_.imgID);
                        selects.parentNode.style.zIndex = 2;
                        selects.style.top = (parseInt(selects.style.top) + this_.changeSize) + "px";
                        selects.style.left = (parseInt(selects.style.left) + this_.changeSize) + "px";
                        selects.style.width = (parseInt(selects.style.width) - 2 * this_.changeSize) + "px";
                        selects.style.height = (parseInt(selects.style.height) - 2 * this_.changeSize) + "px";
                    }
                    if (this_.focusType == 13) {
                        iptv("#"+this_.imgID + "_img").toggleClass("border");
                        var img = iptv.$(this_.imgID + "_img");
                        img.parentNode.style.zIndex = 2;
                        img.style.top = (parseInt(img.style.top) + this_.changeSize) + "px";
                        img.style.left = (parseInt(img.style.left) + this_.changeSize) + "px";
                        img.style.width = (parseInt(img.style.width) - 2 * this_.changeSize) + "px";
                        img.style.height = (parseInt(img.style.height) - 2 * this_.changeSize) + "px";
                    }
                    if (this_.focusType == 14) {
                        iptv("#"+this_.id).hide().toggleClass("border").attr("zIndex",2);
                    }
                    if (this_.focusType == 15) {
                        var nextFocusObj = iptv("#"+this_.nextFocusId).getFocusObj();
                        if (nextFocusObj && nextFocusObj.focusType != 15) {
                            iptv("#"+this_.selectionID).hide();
                        }
                    }
                    if (this_.focusType == 16) {
                        //如果下一个即将获取焦点的焦点不是15或16，就隐藏选中框
                        var nextFocusObj = iptv("#"+this_.nextFocusId).getFocusObj();
                        if (nextFocusObj && nextFocusObj.focusType != 15 && nextFocusObj && nextFocusObj.focusType != 16) {
                            iptv("#"+this_.selectionID).hide();
                        }
                        //还原图片大小
                        var img = iptv.$(this_.imgID + "_img");
                        img.parentNode.style.zIndex = 2;
                        img.style.top = (parseInt(img.style.top) + this_.changeSize) + "px";
                        img.style.left = (parseInt(img.style.left) + this_.changeSize) + "px";
                        img.style.width = (parseInt(img.style.width) - 2 * this_.changeSize) + "px";
                        img.style.height = (parseInt(img.style.height) - 2 * this_.changeSize) + "px";
                    }
                    if (this_.focusType == 17) {
                        var div = iptv.$(this_.selectionObjID);
                        //如果上一个焦点不是17，那么久先显示移动框，赋予动画
                        var nextFocusObj = iptv("#"+this_.nextFocusId).getFocusObj();
                        if (nextFocusObj && nextFocusObj.focusType != 17 || nextFocusObj && nextFocusObj.selectionObjID != this_.selectionObjID) {
                            if (div) {
                                iptv("#"+this_.selectionObjID).hide();
                            }
                        }
                    }

                    if (this_.focusType == 18) {
                        iptv("#"+key.curFocus.imgID).removeClass("transitionsShow0_5").addClass("transitionsHide0_5").hide();
                        iptv("#"+key.curFocus.imgID + "_img").removeClass("transitionsShow0_5").addClass("transitionsHide0_5")
                    }
                }

                if (this_.onBlurEvent) {
                    key.exeCode(this_.onBlurEvent);
                }
            }
        };
        this_.onClick = function () {
            if (this_.enable == true &&  this_.enFocus == true  && this_.isCreated == true) {
                if(this_.buttonData && iptv.api && iptv.api.log)
                {
                    iptv.api.log.buttonLog(this_.buttonData.buttonId);
                }
                key.exeCode(this_.clickEvent);
            }
        };
    };

    /**
     * 所有方向属性与焦点行为事件
     * @constructor
     */
    iptv.Dire = function () {
    };

    iptv.extend(iptv.Dire.prototype, {
        up: '',
        upOther: '',
        right: '',
        rightOther: '',
        down: '',
        downOther: '',
        left: '',
        leftOther: '',
        otherEvent: '',
        other: '',
        // 某方向执行事件，字符串
        upEvent: '',
        rightEvent: '',
        downEvent: '',
        leftEvent: '',
        //某方向原本指定的焦点被禁用了，就执行响应事件
        upOtherEvent: '',
        rightOtherEvent: '',
        downOtherEvent: '',
        leftOtherEvent: '',
        //如果对于方向设置的焦点不在焦点池中，那么执行对于方向的事件或焦点
        rightNoEvent: '',
        rightNo: '',
        leftNoEvent: '',
        leftNo: '',
        downNoEvent: '',
        downNo: '',
        upNoEvent: '',
        upNo: ''
    });

    /**
     * ID命名参数集合
     * @param _x
     * @param _y
     * @param _imgID
     * @param _upParentId
     */
    var IdList = function (_x, _y, _imgID, _upParentId) {
        var this_ = this;
        this_.x = _x;
        this_.y = _y;
        this_.imgID = _imgID;
        this_.upParentId = _upParentId;
    };

    /**
     * 根据id获取参数
     * @param _id
     * @returns {*}
     */
    var getIdList = function (_id) {
        if (!_id) return null;
        var d1 = _id;
        var x1 = d1.indexOf("_", 0);
        var x2 = d1.indexOf("_", x1 + 1);
        var x3 = d1.indexOf("_", x2 + 1);
        var x4 = d1.indexOf("_", x3 + 1);
        var x5 = d1.indexOf("_", x4 + 1);

        var x = d1.substring(x1 + 2, x2);
        var y = d1.substring(x2 + 2, x3);
        var imgsrc = "";
        if (x4 != -1) {
            imgsrc = d1.substring(x3 + 1, x4);
        }
        var par = "";
        if (x5 != -1) {
            par = d1.substring(x4 + 1, x5);
        }
        return new IdList(x, y, imgsrc, par);
    };

    key.curFocus = new iptv.FocusModel();

    //扩展iptv对象方法
    iptv.fn.extend({
        /**
         *获取焦点对象
         * @returns {iptv.FocusModel}
         */
        getFocusObj: function () {
            var this_ = this;
            if (this_[0] && this_[0].focusObj) {
                return this_[0].focusObj;
            }
            return null;
        },
        /**
         * 开启焦点权限，支持单个开启，多个同时开启
         * @returns {enableFocus}
         */
        enableFocus: function () {
            var this_ = this,
                context = this_.context;
            if (this_[0] && this_[0].focusObj) {
                this_[0].focusObj.enFocus = true;
            } else if (context && iptv.isArray(context)) {
                for (var i in context) {
                    var obj = iptv.focusCollection[context[i]];
                    if (obj && obj.focusObj) {
                        obj.focusObj.enFocus = true;
                    }
                }
            }
            return this_;
        },
        /**
         * 禁用焦点权限，支持单个禁用，多个同时禁用
         * @returns {enableFocus}
         */
        disableFocus: function () {
            var this_ = this,
                context = this_.context;
            if (this_[0] && this_[0].focusObj) {
                this_[0].focusObj.enFocus = false;
            } else if (context && iptv.isArray(context)) {
                for (var i in context) {
                    var obj = iptv.focusCollection[context[i]];
                    if (obj && obj.focusObj) {
                        obj.focusObj.enFocus = false;
                    }
                }
            }
            return this_;
        },
        addFocusObj: function () {
            var context = this.context,
                doms = [];
            //如果是批量添加
            if (context && iptv.isArray(context)) {
                doms = context;
            } else if (context && iptv.type(context) === "object") {
                //如果是单个添加
                doms.push(context);
            }
            for (var i = 0; i < doms.length; i++) {
                var domObj = null,
                    id = "",
                    obj = doms[i];
                if (obj && (id = obj.id) && (iptv.trim(id)) && id.indexOf("hands") == 0 && (domObj = document.getElementById(id))) {
                    var model = new iptv.FocusModel();
                    model.id = id;
                    var idParams = getIdList(id);
                    model.X_Posi = idParams.x;
                    model.Y_Posi = idParams.y;
                    if (idParams.upParentId && iptv("#" + idParams.upParentId)[0]) {
                        model.ParentNode = iptv("#" + idParams.upParentId)[0];
                    }
                    //获取焦点内部的图片id
                    model.imgID = iptv.trim(idParams.imgID);
                    //保存切换之前的图片地址
                    model.oldSwap = iptv("#" + model.imgID).src();

                    model.enFocus = obj.enFocus || true;
                    //确定键，确定事件
                    model.clickEvent = obj.clickEvent || '';
                    //新图地址
                    model.newSwap = obj.newSwap || '';
                    //焦点捆绑数据
                    model.tempData = obj.tempData || null;
                    //切换类型
                    model.focusType = obj.focusType || 7;
                    //切换到焦点上时，图标变大的大小   设计类型16,13,12
                    model.changeSize = obj.changeSize || 0;
                    //移动选中框id,此选中框是代码自动生成的元素，对应效果选中框放大与平移动画，对应focusType为15或16
                    model.selectionID = obj.selectionID || 'selectionID';
                    //移动选中框id，此选中框是用户自己要在html中指定元素的id，对应效果是平移选中框，不存在放大动画，与selectBorderId的区别就是它是控制位置没有动画，selectionObjId是控制位置有动画，对应focusTypeId为17
                    model.selectionObjID = obj.selectionObjID || "selectionObjID";
                    // 对应展示图片的层次大小
                    model.focusImgZIndex = obj.focusImgZIndex || 998;
                    // 对应焦点内部图片的层次大小
                    model.focusImgParentZIndex = obj.focusImgParentZIndex || 998;
                    // 对应焦点内部图片的层次大小
                    model.imgZIndex = obj.imgZIndex || 999;
                    // 对应焦点内部图片的父元素的层次大小
                    model.imgParentZIndex = obj.imgParentZIndex || 999;
                    //焦点的父节点的ID值  
                    model.upParentId = obj.upParentId;
                    //用户控制可观看区域的容器ID值
                    model.upAreaId = obj.upAreaId;
                    //按右焦点的父节点的ID值
                    model.rightParentId = obj.rightParentId;
                    //按右用于控制可观看区域容器的ID值
                    model.rightAreaId = obj.rightAreaId;
                    //开启父容器滚动,上下滚动
                    model.enUpParentRoll = obj.enUpParentRoll || false;
                    //开启父容器滚动,左右滚动
                    model.enRightParentRoll = obj.enRightParentRoll || false;
                    //开启整页滚动
                    model.enRightPageRoll = obj.enRightPageRoll || false;
                    //当前焦点索引
                    model.focusIndex = obj.focusIndex || 0;
                    //当前焦点对应的当前页
                    model.focusCurPageNum = obj.focusCurPageNum || 0;
                    //当前焦点对应的总页数
                    model.focusAllPageNum = obj.focusAllPageNum || 0;
                    ////当前焦点需要整页滚动的left值
                    model.focusLeftRoll = obj.focusLeftRoll || 0;
                    //当前焦点列表中第一个焦点的left值
                    model.focusFirstLeft = obj.focusFirstLeft || 0;
                    //当前焦点对应页码的所有焦点id,该值为数组对象
                    model.focusPageAllModel = obj.focusPageAllModel || null;
                    // 名称
                    model.name = obj.name || '';
                    // 指定移动到焦点上时，执行的事件
                    model.onFocusEvent = obj.onFocusEvent || '';
                    // 指定失去焦点时，执行的事件
                    model.onBlurEvent = obj.onBlurEvent || '';
                    // 指定移动边框的速度
                    model.tweenSpeed = obj.tweenSpeed || '';
                    // focusType为10的时候需要的选中框id
                    model.selectBorderId = obj.selectBorderId || '';
                    //代替默认获取焦点时的行为
                    model.onFocus_ = obj.onFocus_ || '';
                    //代替默认失去焦点时的行为
                    model.onBlur_ = obj.onBlur_ || '';

                    // ****************************方向初始化**********************/

                    var diredemp = new iptv.Dire();
                    diredemp.other = obj.other || '';
                    diredemp.otherEvent = obj.otherEvent || '';
                    diredemp.left = obj.left || '';
                    diredemp.right = obj.right || '';
                    diredemp.up = obj.up || '';
                    diredemp.down = obj.down || '';
                    diredemp.upEvent = obj.upEvent || '';
                    diredemp.downEvent = obj.downEvent || '';
                    diredemp.leftEvent = obj.leftEvent || '';
                    diredemp.rightEvent = obj.rightEvent || '';
                    diredemp.upOther = obj.upOther || '';
                    diredemp.downOther = obj.downOther || '';
                    diredemp.leftOther = obj.leftOther || '';
                    diredemp.rightOther = obj.rightOther || '';
                    diredemp.upOtherEvent = obj.upOtherEvent || '';
                    diredemp.rightOtherEvent = obj.rightOtherEvent || '';
                    diredemp.downOtherEvent = obj.downOtherEvent || '';
                    diredemp.leftOtherEvent = obj.leftOtherEvent || '';
                    diredemp.rightNoEvent = obj.rightNoEvent || '';
                    diredemp.rightNo = obj.rightNo || '';
                    diredemp.leftNoEvent = obj.leftNoEvent || '';
                    diredemp.leftNo = obj.leftNo || '';
                    diredemp.downNoEvent = obj.downNoEvent || '';
                    diredemp.downNo = obj.downNo || '';
                    diredemp.upNoEvent = obj.upNoEvent || '';
                    diredemp.upNo = obj.upNo || '';
                    focusDires[id] = diredemp;
                    model.dieArr = diredemp;


                    //该按钮已经通过初始化工作
                    model.isCreated = true;
                    model.nodeObj = domObj;
                    domObj.focusObj = model;
                    focusCollection[id] = domObj;
                }
            }
        },
        /**
         * 调用焦点获取焦点方法
         * @returns {onFocus}
         */
        onFocus:function () {
            var focusObj = this.getFocusObj();
            if(focusObj)
            {
                focusObj.onFocus();
            }
            return this;
        }
    });

    //声明按键匿名函数
    var keyDownEventfunction = function (evt) {
        var keyCode = iptv.keyCode(evt);
        var keyName = iptv.key.getKeyCodeName(keyCode);
        if (keyCode == 0x0300) {
            try {
                var msgEvent = Utility.getEvent();
                if (CT.isNotNull(msgEvent)) {
                    var msg = eval("(" + msgEvent + ")");
                    if (msg != null && msg.type == "EVENT_MEDIA_END") {
                        if (iptv("#ivideos")[0]) {
                            iptv("#ivideos").src(iptv.videoUrl);
                        }
                    }
                }
            } catch (e) {
            }
        }
        switch (keyName) {
            case "OK" :
                iptv.key.curFocus.onClick();
                break;
            case "ONE" :
            case "TWO" :
            case "THREE" :
            case "FOUR" :
            case "FIVE" :
            case "SIX" :
            case "SEVEN" :
            case "EIGHT" :
            case "NINE" :
            case "ZERO" :
            case "DEL" :
                iptv.key.numChange(keyName);
                break;
            case "LEFT" :
            case "RIGHT" :
            case "UP" :
            case "DOWN" :
                iptv.key.focusHand(keyName);
                if (evt) {
                    evt.preventDefault();
                    return false;
                } else {
                    if (event) {
                        event.returnValue = false;
                        return false;
                    }
                }
                break;
            case "HOME_PAGE":
            case "OUT_PAGE":
            case "BACK" :
                try {
                    if (evt) {
                        evt.preventDefault();
                    } else {
                        if (event) {
                            event.returnValue = false;
                        }
                    }
                } catch (e) {
                }
                if (iptv.isFunction(iptv.key.backfunc)) {
                    iptv.key.backfunc();
                }
                return false;
                break;
            default :
                break;
        }
    };

    //添加按键事件
    iptv(document).addEventListener("keydown", keyDownEventfunction);

})(window, iptv);