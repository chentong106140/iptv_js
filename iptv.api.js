/**
 * Created by cherish on 2017/12/14.
 */

(function (window, iptv) {
    iptv.api = {};
    //日志接口
    iptv.api.log = {};
    //页面接口
    iptv.api.page = {};
    //用户接口
    iptv.api.user = {};
    //url接口
    iptv.api.url = {};
    //日志模块
    iptv.extend(iptv.api.log, {
        postData: function (action_, data_) {
            if (!action_ || !data_)return;
            var image_ = new Image();
            var url = iptv.config.PlatFormApiPath + "log/" + action_ + ".json?" + iptv.params(data_);
            image_.src = url;
            image_.style.display = "none";
            image_ = null;
        },
        /**
         * 页面访问日志接口
         */
        pageLog: function () {
            var data = {};
            data.curActionName = iptv.config.ActionName;
            data.lastActionName = iptv.getCookie("lastPageAction");
            data.beFrom = iptv.getCookie("befrom");
            //this.postData("logPage", data);
        },
        /**
         * 按钮点击日志接口
         * @param buttonId 按钮编号
         */
        buttonLog: function (buttonId) {
            var data = {};
            data.buttonId = buttonId;
            this.postData("logButton", data);
        },
        /**
         * 视频用户播放日志接口
         * @param videoId   视频集编号
         * @param startTime 开始播放时间
         * @param endTime   结束播放时间
         */
        videoLog: function (videoId, startTime, endTime) {
            if (!videoId || !startTime || !endTime)return;
            var data = {};
            data.videoId = videoId;
            data.startTime = startTime;
            data.endTime = endTime;
            this.postData("logVideo", data);
        },
        /**
         * 删除播放记录日志接口
         * @param videosId  视频部编号
         * @param success   响应成功
         * @param errors    响应失败
         */
        delLatestPlayLog: function (videosId, success, errors) {
            var data = {};
            data.videosId = videosId;
            data.deleteFlag = 1;
            iptv.ajax({
                method: "post",
                async: "false",
                data: data,
                url: iptv.config.PlatFormApiPath + "log/logLatestPlay.json",
                success: function (d) {
                    d = eval("(" + d + ")");
                    if (d && d.code > 0) {
                        success && success();
                    }
                },
                error: function (status, statusText) {
                    errors && errors(status, statusText);
                }
            });
        },
        /**
         * 删除收藏接口
         * @param videosId  视频部编号
         * @param success   响应成功
         * @param errors    响应失败
         */
        delCollectLog: function (videosId, success, errors) {
            var data = {};
            data.videosId = videosId;
            data.deleteFlag = 1;
            iptv.ajax({
                method: "post",
                async: "false",
                data: data,
                url: iptv.config.PlatFormApiPath + "log/logCollect.json",
                success: function (d) {
                    d = eval("(" + d + ")");
                    if (d && d.code > 0) {
                        success && success();
                    }
                },
                error: function (status, statusText) {
                    errors && errors(status, statusText);
                }
            });
        },
        /**
         * 心跳接口
         */
        activeLog: function () {
            if (iptv.config.ActionName != null && iptv.config.ActionName != "") {
                var data = {};
                data.actionName = iptv.config.ActionName;
                this.postData("logActive", data);
            }
        }
    });
    //页面接口模块
    iptv.extend(iptv.api.page, {
        /**
         * 获取页面数据接口
         * @param requestData
         * @param success
         * @param errors
         */
        findPageData: function (requestData, success, errors) {
            iptv.ajax({
                method: "post",
                async: "false",
                data: requestData,
                url: iptv.config.PlatFormApiPath + "common/findPageData.json",
                success: function (d) {
                    d = eval("(" + d + ")");
                    if (d && d.code == 0) {
                        success && success(d);
                    }
                },
                error: function (status, statusText) {
                    errors && errors(status, statusText);
                }
            });
        },
        /**
         * 获取页面基础信息
         * @param requestData   请求数据
         * @param success       鉴权成功回调
         * @param authOrder     鉴权失败回调
         * @param errors        请求失败回调
         */
        findPageInfo: function (requestData, success, authOrder, errors) {
            iptv.ajax({
                method: "post",
                async: "false",
                data: requestData,
                url: iptv.config.PlatFormApiPath + "common/findPageInfo.json",
                success: function (d) {
                    d = eval("(" + d + ")");
                    if (d && d.code == 0) {
                        success && success(d["pageData"]["pageInfo"]);
                    } else if (d && d.code == 1002 && d["pageData"] && d["pageData"]["pageInfo"]) {
                        //鉴权失败
                        authOrder && authOrder(d["pageData"]["pageInfo"]);
                    }
                },
                error: function (status, statusText) {
                    errors && errors(status, statusText);
                }
            });
        },
        /**
         * 获取推荐位下级页面地址接口
         * @param requestData   请求数据
         * @param success       鉴权成功回调
         * @param authOrder     鉴权失败回调
         * @param errors        请求失败回调
         */
        recommendNext: function (requestData, success, authOrder, errors) {
            iptv.ajax({
                method: "post",
                async: "false",
                data: requestData,
                url: iptv.config.PlatFormApiPath + "recommonDetail.json",
                success: function (d) {
                    d = eval("(" + d + ")");
                    if (d && d.code == 0) {
                        success && success(d.data);
                    } else if (d && d.code == 1002) {
                        //鉴权失败
                        //url:订购页面地址
                        //nextUrl:被拦截地址
                        authOrder && authOrder(d.data);
                    }
                },
                error: function (status, statusText) {
                    errors && errors(status, statusText);
                }
            });
        }
    });
    //用户接口模块
    iptv.extend(iptv.api.user, {
        postData: function (action_, data_, success) {
            if (!action_ || !data_)return;
            data_.productId = iptv.config.PID;
            iptv.ajax({
                method: "post",
                async: "false",
                data: data_,
                url: iptv.config.PlatFormApiPath + "user/" + action_ + ".json",
                success: function (d) {
                    success && success(d);
                }
            });
        },
        /**
         * 用户注册接口
         * @param data_ 用户数据
         * @param success   响应成功
         */
        register: function (data_, success) {
            if (!data_)return;
            this.postData("register", data_, success);
        }

    });
    //url接口模块
    iptv.extend(iptv.api.url, {
        /**
         * 获取支付链接接口
         * @param requestData
         * @param success
         * @param errors
         */
        getPayUrl: function (requestData, success, errors) {
            iptv.ajax({
                method: "post",
                async: "false",
                data: requestData,
                url: iptv.config.PlatFormApiPath + "toPay.json",
                success: function (d) {
                    d = eval("(" + d + ")");
                    if (d && d.code == 0) {
                        success && success(d);
                    }
                },
                error: function (status, statusText) {
                    errors && errors(status, statusText);
                }
            });
        },
        /**
         * 获取下级页面地址，统一控制
         * @param nextUrl_          下级页面地址
         * @param focusId_          焦点编号
         * @param cid_              内部编号
         * @param playBackUrl_      播放返回地址
         * @param backUrl_          订购返回地址
         * @param params_           扩展url参数
         * @returns {string}
         */
        getNextUrl: function (nextUrl_, focusId_, cid_, playBackUrl_, backUrl_, params_) {
            if (nextUrl_) {
                if (nextUrl_.indexOf("?") > -1) {
                    nextUrl_ += "&";
                } else {
                    nextUrl_ += "?";
                }
                return nextUrl_ + "f=" + focusId_ + "&cid=" + cid_ + "&playBackUrl=" + playBackUrl_ + "&backUrl=" + backUrl_ + params_;
            }
        },
        /**
         * 获取订购页面地址
         * @param orderUrl_     订购页面url
         * @param recommendId_  推荐编号
         * @param cid_          内容编号
         * @param backUrl_      订购返回地址
         * @param nextUrl_      订购成功地址
         * @param intoType_     登陆类型
         * @returns {string}
         */
        getOrderPageUrl: function (orderUrl_, recommendId_, cid_, backUrl_, nextUrl_, intoType_) {
            if (orderUrl_) {
                if (orderUrl_.indexOf("?") > -1) {
                    orderUrl_ += "&";
                } else {
                    orderUrl_ += "?";
                }
                intoType_ = intoType_ == null || intoType_ == undefined ? 0 : intoType_;
                return orderUrl_ + "intoType=" + intoType_ + "&rid=" + recommendId_ + "&cid=" + cid_ + "&backUrl=" + backUrl_ + "&nextUrl=" + nextUrl_;
            }
        },
        /**
         * 获取播放页面地址
         * @param playPageUrl_  播放页面地址  该地址是在page_page表中配置的
         * @param videoId_      视频集编号
         * @param playBackUrl_  播放完成返回地址
         * @param backUrl_      订购返回地址
         * @returns {string}
         */
        getPlayPageUrl: function (playPageUrl_, videoId_, playBackUrl_, backUrl_) {
            if (playPageUrl_) {
                if (playPageUrl_.indexOf("?") > -1) {
                    playPageUrl_ += "&";
                } else {
                    playPageUrl_ += "?";
                }
                return playPageUrl_ + "videoId=" + videoId_ + "&playBackUrl=" + playBackUrl_ + "&backUrl=" + backUrl_;
            }
        },
        /**
         * 获取全屏播放地址
         * @param videoId_      视频编号
         * @param playBackUrl_  播放返回地址
         * @param success       请求成功回调
         * @param error         请求失败回调
         */
        getPlayUrl: function (videoId_, playBackUrl_, success, error) {
            iptv.ajax({
                method: "post",
                async: "false",
                data: {
                    videoId: videoId_,
                    playBackUrl: playBackUrl_,
                    returnUrl: encodeURIComponent(iptv.config.PlayReturnUrl)
                },
                url: iptv.config.PlatFormApiPath + "playvideo.json",
                success: function (d) {
                    d = eval("(" + d + ")");
                    if (d && d.code == 0) {
                        success && success(d);
                    }
                },
                error: function (status, statusText) {
                    errors && errors(status, statusText);
                }
            });
        }
    });


})(window, iptv);