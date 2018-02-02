/**
 * Created by cherish on 2017/12/29.
 */


/**
 * 基础JS库修改版（修改后的代码100%兼容旧代码）
 * 修改记录：
 * 1、修改Epg.call()方法，增加fn为空字符串的判断，增加参数args为空的判断，args可以不是数组
 * 2、去掉Epg.isArray()中Object.prototype.toString.call的判断，因为机顶盒不支持
 * 3、修改Epg.Button.init()方法，增加简单的重载方法，linkImage如果没设置自动从src读取，增加imagePath和initKeys参数
 * 4、去掉Epg.Button.move()中关于around没用的部分，增加beforeMove拦截方法
 * 5、增加Epg.Button的简写名称：Epg.btn
 * 6、修改Epg.Button.get(id)，如果id不传表示获取当前光标按钮
 * 7、增加Epg.Mp.getRate()方法
 * 8、增加屏蔽浏览器默认的返回键功能
 * 9、增加Epg.key相关方法
 * 10、增加EVENT_MEDIA_END和EVENT_MEDIA_END2个变量
 * 11、增加Epg.tip()和Epg.ykqTip()2个方法
 * 12、增加Epg的别名：epg、Epg.Mp的别名：Epg.mp
 * 13、给Epg.Mp增加defaultTip参数，相应方法增加相应提示文字，Epg.Mp.init()增加一个可选参数
 * 14、增加Epg.debug()、Epg.page()和Epg.jump()3个方法
 * 15、修改log.jsp路径
 * 16、修改Epg.Log.gsta()方法，由于不能跨域，强制采用img方式，且图片增加隐藏样式
 * 17、增加debug_mode，增加按5刷新，增加onkeypress判断
 * 18、Epg.Mp下的播放暂停等方法try一下，避免电脑上报错
 * 19、增加Epg.cookie相关方法
 * 20、Epg.Log.access()增加一个addAccessLog参数，不影响以前的代码！
 * 21、增加保存游戏日志的方法 Epg.Log.saveGameLog
 * 22、增加Epg.trim()方法
 * 23、增加Epg.marquee相关方法
 * 24、完善S()和H()2个方法
 */
var debug_mode = false;// true 调试模式，上线后必须把此参数改为 false ！

var	KEY_BACK 		 = 0x0008; 	// 返回/删除
var KEY_ENTER 		 = 0x000D; 	// 确定
var KEY_PAGE_UP		 = 0x0021;	// 上页
var KEY_PAGE_DOWN    = 0x0022;  // 下页
var KEY_LEFT		 = 0x0025;  // 左
var	KEY_UP			 = 0x0026;  // 上
var KEY_RIGHT 		 = 0x0027;	// 右
var	KEY_DOWN 		 = 0x0028;	// 下
var KEY_0 			 = 0x0030;  // 0       
var KEY_1 			 = 0x0031;  // 1
var KEY_2 			 = 0x0032;  // 2
var KEY_3 			 = 0x0033;  // 3
var KEY_4 			 = 0x0034;  // 4
var KEY_5			 = 0x0035;  // 5
var KEY_6 			 = 0x0036;  // 6 
var KEY_7 			 = 0x0037;  // 7
var KEY_8 			 = 0x0038;  // 8
var KEY_9 			 = 0x0039;  // 9
var KEY_VOL_UP 		 = 0x0103; 	// Vol+，音量加
var KEY_VOL_DOWN 	 = 0x0104;	// Vol-，音量减
var	KEY_MUTE 		 = 0x0105;	// Mute，静音
var	KEY_TRACK 		 = 0x0106;	// Audio Track，切换音轨
var KEY_PLAY_PAUSE   = 0x0107;	// >||，播放，暂停
var KEY_FAST_FORWARD = 0x0108;	// >> ，快进
var	KEY_FAST_REWIND  = 0x0109;	// << ，快退
var KEY_IPTV_EVENT   = 0x0300;	// 虚拟事件按键
var KEY_RED 		 = 0x0113;  // 红色键
var KEY_GREEN        = 0x0114;	// 绿色键
var KEY_YELLOW		 = 0x0115;  // 黄色键
var KEY_BLUE         = 0x0116;  // 蓝色键

var EVENT_MEDIA_END  = 'EVENT_MEDIA_END';  //视频播放结束
var EVENT_MEDIA_ERROR= 'EVENT_MEDIA_ERROR';  //视频播放错误

/**
 * 根据ID获取某个元素
 * @param id
 * @returns
 */
function G(id){return document.getElementById(id);}
/**
 * 显示一个元素
 * @param id
 */
function S(id)
{
    var temp = G(id);
    if(temp)
        temp.style.visibility = 'visible';
}
/**
 * 隐藏一个元素
 * @param id
 */
function H(id)
{
    var temp = G(id);
    if(temp)
        temp.style.visibility = 'hidden';
}

/**
 * 返回IPTV门户或者来源地址
 */
function goIptvPortal()
{
    window.location.href=Authentication.CTCGetConfig('EPGDomain');
}
// 播放器实例
var mp;
// 命名空间
var Epg =
    {
        /** 调用函数 */
        call: function(fn, args)
        {
            if(typeof fn == "string" && fn !== '')//update 20140508
            {
                return eval("("+fn+")");
            }
            else if(typeof fn == "function")
            {
                if(!this.isArray(args))//update 20140526
                {
                    //首页，arguments不是标准的数组（是一个伪数组），所以直接arguments.slice(1)在电脑上都会报错
                    //其次，标清机顶盒不支持Array.prototype.slice.call(arguments,1)的写法
                    var temp=[];//注意，这里千万不要直接：args=[];然后对args操作，因为arguments存放的是args的引用，否则args会无限循环
                    for(var i=1;i<arguments.length;i++)
                        temp.push(arguments[i]);
                    args=temp;
                }
                return fn.apply(window, args);
            }
        },

        /** iPanel3.0,webkit可用 */
        ajax: function(config)
        {
            var url = config.url;
            var data = config.data;
            var type = (config.type || 'GET').toUpperCase();
            var contentType = config.contentType||'application/x-www-form-urlencoded';
            var dataType = config.dataType;
            var headers = config.headers || [];
            var fnSuccess = config.success;
            var fnError = config.error;
            var xmlhttp;
            if(window.XMLHttpRequest)
                xmlhttp = new XMLHttpRequest();
            else
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

            xmlhttp.onreadystatechange = function()
            {
                if(xmlhttp.readyState==4)
                {
                    var rsp = xmlhttp.responseText||xmlhttp.responseXML;
                    if(dataType=='json')
                        rsp = eval("("+rsp+")");
                    if(xmlhttp.status==200)
                        Epg.call(fnSuccess, [xmlhttp, rsp]);
                    else
                        Epg.call(fnError, [xmlhttp, rsp]);
                }
            };

            xmlhttp.open(type,url,true);
            for(var i=0; i<headers.length; ++i)
            {
                xmlhttp.setRequestHeader(headers[i].name, headers[i].value);
            }
            xmlhttp.setRequestHeader('Content-Type', contentType);

            if(typeof data == 'object' && contentType=='application/x-www-form-urlencoded')
            {
                var s = '';
                for(attr in data)
                {
                    s += attr+'='+data[attr]+'&';
                }
                if(s)
                {
                    s = s.substring(0,s.length-1);
                }
                xmlhttp.send(s);
            }
            else
                xmlhttp.send(data);
        },

        getContextPath: function()
        {
            var contextPath = '/' + location.href.split('/')[3] + '/';
            return contextPath;
        },
        getParent: function()
        {
            return window==window.parent?window.top:window.parent;
        },
        isArray: function(o)
        {
            return (o instanceof Array);
        }
    };

// 日志相关
Epg.Log =
    {
        ajax: function(url, async)
        {
            var xmlHttp = null;
            if(window.XMLHttpRequest)
                xmlHttp=new XMLHttpRequest();
            else if(window.ActiveXObject)
                xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
            if(xmlHttp)
            {
                xmlHttp.open("GET", url, async);
                xmlHttp.send(null);
                xmlHttp=null;
            }
            else
            {
                var img = document.createElement('img');
                img.src = url;
                document.body.appendChild(img);
            }
        },
        /**
         * 保存访问日志
         * @param source 来源页面
         * @param target 当前页面
         * @param targetType 当前页面类型
         * @param addAccessLog 是否添加访问日志
         * @param columnIdx 栏目索引，目前仅游戏页面需要添加该值，仅适用于果果乐园
         */
        access: function(source, target, targetType, addAccessLog, columnIdx ,pagePropSrc)
        {
            columnIdx = columnIdx || 0;
            pagePropSrc = pagePropSrc || '';
            //如果需要添加访问日志，最后一个判断是为了兼容旧版代码
            if(addAccessLog==='true'||addAccessLog===true||addAccessLog===undefined)
            {
                if(target!==''&&targetType!=='')//这2个参数不为空才记录日志
                {
                    var url = Epg.getContextPath()+'com/log.jsp?method=access&source='+source+'&target='+target
                        +'&targetType='+targetType+'&columnIdx='+columnIdx+'&pagePropSrc='+pagePropSrc;
                    this.ajax(url, true);
                }
            }
        },

        /** 更新上一次点播日志 */
        updateLastVodLog: function(callback)
        {
            var url = Epg.getContextPath() + 'com/log.jsp?method=updateLastVodLog';
            this.ajax(url,false);
            if(typeof callback == "function")
                setTimeout(callback, 100);
        },
        /**
         * 保存游戏访问日志
         * @param code为游戏关键字
         * @param level 当前游戏等级
         * @param isPassed 是否通过当前关
         */
        saveGameLog:function(code,level,isPassed)
        {
            var url = Epg.getContextPath() + 'com/log.jsp?method=saveGameLog&code='+code+'&level='+level+'&isPassed='+isPassed;
            this.ajax(url,false);//必须同步 否则某些页面无法保存游戏日志
        },
        /** 研究院统计代码 */
        gsta: function(gstaUserId, gstaId)
        {
            var cUrl = window.location.href;
            var refer = document.referrer;
            cUrl = cUrl.replace(/\&/g,"$");
            refer = refer.replace(/\&/g,"$");
            var gstaurl = "http://14.29.1.28:8081/writeLogs/writeLogServlet?cUrl="+cUrl+"&cRefer="+refer+"&cUserId="+gstaUserId+"&cPid="+gstaId;
            var xmlHttp = null;
            if(window.XMLHttpRequest)
                xmlHttp=new XMLHttpRequest();
            else if(window.ActiveXObject)
                xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
            if(xmlHttp&&false)//屏蔽ajax方式，因为几乎所有浏览器均不支持跨域，update by lxa 20140520
            {
                xmlHttp.open("GET",gstaurl,true);
                xmlHttp.send(null);
                xmlHttp=null;
            }
            else
            {
                var img = document.createElement('img');
                img.src = gstaurl;
                img.style.visibility = 'hidden';//图片必须隐藏，update by lxa 20140521
                document.body.appendChild(img);
            }
        }
    };

// HTML操作
Epg.Html = Epg.Text =
    {
        rollStart: function(config)
        {
            var id = config.id;
            var amount = config.amount || 1;
            var delay = config.delay || 40;
            var dir = config.dir || 'left';
            if(!this.rollId)
            {
                this.rollId = id;
                this.innerHTML = G(id).innerHTML;
                G(id).innerHTML = '<marquee direction="'+dir+'" behavior="scroll" scrolldelay="'+delay+'" scrollamount="'+amount+'">'+this.innerHTML+'</marquee>';
            }
        },
        rollStop: function()
        {
            G(this.rollId).innerHTML = this.innerHTML;
            this.rollId = null;
        }
    };


// 自定义按钮
Epg.Button = Epg.btn =
    {
        around: {},
        /** 初始化按钮 */
        init: function(defaultButtonId,buttons,imagePath,initKeys,eager)
        {
            //修改代码开始 update 20140509
            var config=defaultButtonId;
            if(arguments.length>=2)
                config={defaultButtonId:defaultButtonId,buttons:buttons,imagePath:imagePath,initKeys:initKeys,eager:eager};
            //如果需要初始化默认的6个按键值
            if(config.initKeys)
            {
                Epg.key.init();
                Epg.key.set(
                    {
                        KEY_ENTER:'Epg.Button.click()',			//确定键
                        KEY_LEFT:'Epg.Button.move("left")',		//左键
                        KEY_RIGHT:'Epg.Button.move("right")',	//右键
                        KEY_UP:'Epg.Button.move("up")',			//上键
                        KEY_DOWN:'Epg.Button.move("down")',		//下键
                        KEY_BACK:'back()'						//返回键
                    });
            }
            //修改代码开始 update 20140509



            this.previous = null,
                this.around = {},
                this._buttonStore = {};
            for(var i=0; i<config.buttons.length; i++)
            {
                var button = config.buttons[i];
                if(!button)//主要是为了适配IE7莫名其妙的问题
                    continue;

                //修改代码开始 update 20140508
                if(!button.linkImage)
                {
                    var _button=G(button.id);
                    if(_button)
                        button.linkImage=_button.src;
                }
                //如果(配置了imagePath && 当前按钮配置了焦点图片 && 当前按钮没有配置autoPrefix=false && 焦点图片不是http开头)
                if(config.imagePath && button.focusImage && button.autoPrefix!==false && button.focusImage.indexOf('http')<0)
                    button.focusImage=config.imagePath+button.focusImage;
                if(config.imagePath && button.linkImage && button.autoPrefix!==false && button.linkImage.indexOf('http')<0)
                    button.linkImage=config.imagePath+button.linkImage;
                //修改代码结束


                this._buttonStore[button.id] = button;
                if((button.eager||config.eager) && button.focusImage) // 热抓取图片如果需要
                    new Image().src = button.focusImage;
            }

            // 设置默认获得焦点的按钮
            if(typeof config.defaultButtonId=="string")
                this.current = this.get(config.defaultButtonId);
            else if(Epg.isArray(config.defaultButtonId))
            {
                for(var i=0,max=config.defaultButtonId.length; i<max; ++i)
                {
                    var button = this.get(config.defaultButtonId[i]);
                    if(button)
                    {
                        this.current = button;
                        break;
                    }
                }
            }
            this.update();
        },

        /** 获取按钮 */
        get: function(id)
        {
            if(id===undefined)//id如果不传，默认返回当前按钮
                id=this.current.id;
            if(G(id))
                return this._buttonStore[id];
        },

        /** 移动 */
        move: function(dir)
        {
            //update 20140508 如果当前按钮定义了beforeMove方法并且改方法之后行返回false，那么阻止按钮的本次移动
            if(this.current.beforeMove&&Epg.call(this.current.beforeMove,[dir,this.current])===false)
                return;

            var button;
            var nextButtonId = this.current[dir];
            if(typeof nextButtonId == "string")//update 20140508 如果是字符串，强制改为数组，简化代码
                nextButtonId = [nextButtonId];
            if(Epg.isArray(nextButtonId))
            {
                for(var i=0; i<nextButtonId.length; i++)
                {
                    button = this.get(nextButtonId[i]);
                    if(button)
                        break;
                }
                this.previous = this.current;
                if(button)
                    this.current = button;
            }
            this.update();
            Epg.call(this.current.moveHandler, [this.previous, this.current, dir]);
        },

        /** 显示设置初始获得焦点的按钮 */
        set: function(buttonId)
        {
            this.around = {};
            this.previous = this.current;
            this.current = this.get(buttonId);
            this.update();
        },

        /** 点击确定按钮 */
        click: function(interceptor)
        {
            var log = this.current.log;
            if(log)// 异步统计按钮点击
                Epg.Log.access(log.source, log.target, log.targetType);

            Epg.call(interceptor, [this.current]); // 在点击按钮前可以执行一个自定义函数，比如统计按钮点击功能
            Epg.call(this.current.action, [this.current]);
        },

        /** 更新 */
        update: function()
        {
            var prev = this.previous;
            var current = this.current;
            if(prev)
            {
                if(prev.linkImage)
                    G(prev.id).src = prev.linkImage;
                Epg.call(prev.blurHandler, [prev]);
            }
            if(current)
            {
                if(current.focusImage)
                    G(current.id).src = current.focusImage;
                Epg.call(current.focusHandler, [current]);
            }
        }
    };




// 播放器 
Epg.Mp = Epg.mp = (function()
{
    return {
        speed : 1,			// 正常播放速度
        state : 'play', 	// play-播放,pause-暂停,fastForward-快进,fastRewind-快退
        muteFlag : 0,		// 0-有声,1-静音
        live: false,		// 直播
        defaultTip: true,  // 是否开启默认的提示文字， add 20140514

        /** 初始化播放器 */
        init:function(){
            mp = new MediaPlayer();
            mp.bindNativePlayerInstance(0);
            mp.setAllowTrickmodeFlag(0);
            mp.setNativeUIFlag(1);
            mp.setAudioVolumeUIFlag(0);//是否显示音量
            mp.setProgressBarUIFlag(1);//是否显示快进，快退
        },

        /** 暂停 */
        pause: function(callback)
        {
            this.speed = 1;
            this.state = 'pause';
            if(this.defaultTip)
                Epg.ykqTip("暂停");
            try
            {
                mp.pause();//try一下的目的是为了电脑上不报错
            }
            catch(e)
            {}
            Epg.call(callback, [this]);
        },

        /** 从暂停、快进、快退中恢复 */
        resume: function(callback)
        {
            this.speed = 1;
            this.state = 'play';
            if(this.defaultTip)
                Epg.ykqTip("播放");
            try
            {
                mp.resume();//try一下的目的是为了电脑上不报错
            }
            catch(e)
            {}
            Epg.call(callback, [this]);
        },

        /** 播放或暂停 */
        playOrPause: function(callback)
        {
            if(this.state=='play')
                this.pause();
            else
                this.resume();
            Epg.call(callback, [this.state, this]);
        },

        /** 快进 */
        fastForward: function(callback)
        {
            if(this.speed >= 32 || this.state == 'fastRewind')
                this.resume();
            else
            {
                this.speed = this.speed * 2;
                this.state = 'fastForward';
                if(this.defaultTip)
                    Epg.ykqTip('快进：x'+this.speed);
                mp.fastForward(this.speed);
            }
            Epg.call(callback, [this.state, this.speed, this]);
        },

        /** 快退 */
        fastRewind: function(callback)
        {
            if(this.speed >= 32 || this.state == 'fastForward')
            {
                this.resume();
            }
            else
            {
                this.speed = this.speed * 2;
                this.state = 'fastRewind';
                if(this.defaultTip)
                    Epg.ykqTip('快退：x'+this.speed);
                mp.fastRewind(-this.speed);
            }
            Epg.call(callback, [this.state, this.speed, this]);
        },

        /** 调大声音 */
        volUp: function(callback)
        {
            var volume = (+mp.getVolume()) + 5;
            volume = volume>100?100:volume;
            mp.setVolume(volume);
            Epg.call(callback, [volume,this]);
            if(this.defaultTip)
                Epg.ykqTip('音量：'+volume);
        },

        /** 调小声音 */
        volDown: function(callback)
        {
            var volume = (+mp.getVolume()) - 5;
            volume = volume<5?0:volume;
            mp.setVolume(volume);
            Epg.call(callback, [volume,this]);
            if(this.defaultTip)
                Epg.ykqTip('音量：'+volume);
        },

        /** 切换声道 */
        switchAudioChannel: function(callback)
        {
            mp.switchAudioChannel();
            Epg.call(callback, [mp.getCurrentAudioChannel(), this]);
        },

        /** 开启或关闭声音 */
        toggleMuteFlag: function(callback)
        {
            ++this.muteFlag;
            if(this.defaultTip)
                Epg.ykqTip(this.muteFlag%2==0?'关闭':'开启'+'静音');
            mp.setMuteFlag(this.muteFlag%2);
            Epg.call(callback, [this.muteFlag%2, this]);
        },

        /** 获取播放串 */
        getMediaStr: function(url)
        {
            var json = '';
            json += '[{mediaUrl:"'+url+'",';
            json +=	'mediaCode: "jsoncode1",';
            json +=	'mediaType:2,';
            json +=	'audioType:1,';
            json +=	'videoType:1,';
            json +=	'streamType:1,';
            json +=	'drmType:1,';
            json +=	'fingerPrint:0,';
            json +=	'copyProtection:1,';
            json +=	'allowTrickmode:1,';
            json +=	'startTime:0,';
            json +=	'endTime:20000.3,';
            json +=	'entryID:"jsonentry1"}]';
            return json;
        },

        /** 全屏播放 */
        fullscreenPlay: function(url){
            mp.setSingleMedia(this.getMediaStr(url));
            mp.setVideoDisplayMode(1);
            mp.refreshVideoDisplay();
            mp.playFromStart();
        },

        /** 定点播放 */
        playByTime: function(second)
        {
            mp.playByTime(1, second);
        },

        /** 返回MM:SS/MM:SS 形式的时间 */
        getPlayTimeInfo: function()
        {
            function getInfo(second)
            {
                var m = Math.floor(second/60);
                m = m<10?('0'+m):m;
                var s = second%60;
                s = s<10?('0'+s):s;
                return m + ':' + s;
            }
            return getInfo(mp.getCurrentPlayTime())+'/' + getInfo(mp.getMediaDuration());
        },

        /** 获取当前播放进度XX% */
        getPlayTimePercent: function()
        {
            return (mp.getCurrentPlayTime()/mp.getMediaDuration()).toFixed(2)*100+'%';
        },

        /** 获取当前播放进度小数点 */
        getPlayTimeXiaoShu: function(){
            return (mp.getCurrentPlayTime()/mp.getMediaDuration()).toFixed(2);
        },

        /**
         * 获取播放总进度比例，返回介于0-1之间的小数
         * @returns {String}
         */
        getRate:function()
        {
            var current=this.mp().getCurrentPlayTime();//当前秒数
            var all=this.mp().getMediaDuration();//总的秒数
            return (current/all).toFixed(2);//保留2位小数
        },

        /** 停止播放，释放资源 */
        destroy: function()
        {
            if(this.live)
            {
                this.live = false;
                mp.leaveChannel();
            }
            if(mp)
                mp.stop();
        },

        /** 是否播放完了或播放出错 */
        isEndOrError: function(keyCode)
        {
            return keyCode=='EVENT_MEDIA_END' || keyCode=='EVENT_MEDIA_ERROR';
        }
    };
})();

/**
 * 默认提示方法
 * @param info 提示文字
 * @param second 显示的秒数，默认3秒，如果为0那么永久显示
 */
Epg.tip=function(info,second)
{
    if(info===undefined||info==='')//info为空时不产生任何效果
        return;
    second=second===undefined?3:second;
    if(info=='play_end'){
        info='视频播放结束';
    }
    G('default_tip').innerHTML=info;
    S('default_tip');
    if(second>0)
    {
        if(Epg._tip_timer)//如果上次执行过setTimeout，那么强行停止
            clearTimeout(Epg._tip_timer);
        Epg._tip_timer=setTimeout('H("default_tip")',second*1000);
    }
};
/**
 * 默认提示方法
 * @param info 提示文字
 * @param second 显示的秒数，默认3秒，如果为0那么永久显示
 */
Epg.ykqTip=function(info,second)
{
    second=second===undefined?3:second;
    G('ykq_tip').innerHTML=info;
    S('ykq_tip');
    if(second>0)
    {
        if(Epg._tip_timer)//如果上次执行过setTimeout，那么强行停止
            clearTimeout(Epg._tip_timer);
        Epg._tip_timer=setTimeout('H("ykq_tip")',second*1000);
    }
};

/**
 * 分页方法
 * @param url 要跳转的url，必须页码必须是最后一个参数，且“=”结尾
 * @param idx 要跳转的页码
 * @param pageCount 总页数，只有下一页时才用到
 */
Epg.page=function(url,idx,pageCount)
{
    idx=parseInt(idx);
    if(idx<1)
        Epg.tip('已经是第一页了！');
    else if(pageCount!==undefined&&idx>parseInt(pageCount))
        Epg.tip('已经是最后一页了！');
    else
        Epg.jump(url+idx);
};

/**
 * 跳转
 * @param href 要跳转的url
 * @param f 焦点按钮，默认当前按钮ID
 */
Epg.jump=function(href,f)
{
    if(f===undefined)
        f=Epg.btn.current.id;
    window.location.href=href+'&f='+f;
};

/**
 * 用于开发时控制台输出信息，上线后注释内部代码即可
 * @param info
 */
Epg.debug=function(info)
{
    if(debug_mode && typeof console !== 'undefined' && console.log)
        console.log(info);
};

/**
 * 与遥控器按键相关的方法，不影响旧版代码
 */
Epg.key=
    {
        /**
         * 所有与按键相关的方法都放在这里
         */
        keys:
            {
                KEY_5:function(){if(debug_mode)location.reload();}//如果是开发模式，按5刷新
            },
        ids: {},
        /**
         * 逐个添加获取批量添加按键配置
         */
        set: function(code, action)
        {
            if(typeof code==='string' && action !== undefined)//如果是单个添加
            {
                //注意不能这样写：code={code:action}
                var _code=code;
                code={};
                code[_code]=action;
            }
            if(typeof code==='object')//批量添加
            {
                var obj=code;
                for(var i in obj)
                {
                    if(i.indexOf('KEY_')===0||i.indexOf('EVENT_')===0)//如果是“KEY_”或者“EVENT_”开头，视作按键
                        this.keys[i]=obj[i];
                    else//否则，视作和按钮ID相关的方法
                        this.ids[i]=obj[i];
                }
            }
            else if(typeof code==='number')//根本不允许出现这种错误！
            {
                alert('错误：添加按键映射时code不能为number类型！');
            }
            return this;
        },
        /** 和set方法一个意思 */
        add: function(code, action)
        {
            return this.set(code, action);
        },
        /**
         * 逐个删除或者批量删除按键配置
         */
        del: function(code)
        {
            if(!(code instanceof Array))
                code=[code];
            for(var i=0; i<code.length; i++)
            {
                if(this.ids[code[i]])
                    this.ids[code[i]]='Epg.key.emptyFn()';
                if(this.keys[code[i]])
                    this.keys[code[i]]='Epg.key.emptyFn()';//标清机顶盒delete有问题
            }
            return this;
        },
        /** 空方法，用于删除时 */
        emptyFn: function(){},
        /**
         * 初始化eventHandler，随便什么时候调用、调用一次即可
         */
        init: function()
        {
            if(!Epg.eventHandler)//避免重复定义
            {
                Epg.eventHandler = function(code)
                {
                    for(var i in Epg.key.ids)//ID判断方法必须先执行，原因自己分析！
                        if(Epg.Button.current.id===i)
                            Epg.call(Epg.key.ids[i],code);
                    for(var i in Epg.key.keys)
                        if(code===window[i])
                            Epg.call(Epg.key.keys[i],code);
                };
            }
        }
    };

/**
 * 返回类似“/ggly-sd”的地址，
 * 如果不放心这个方法的兼容性，可以直接把返回的东西写死，比如：
 * return '/ggly-sd';
 * @returns
 */
/*Epg.contextPath=function()
 {
 var exec=/http(s:|:)\/\/[^\/]+(\/[^\/]+)\//g.exec(location.href);
 return exec==null?undefined:exec[2];
 };*/

/**
 * JS操作cookie工具类，add by lxa 20140529
 */
Epg.cookie=
    {
        /**
         * 从js中获取cookie
         * 由于标清机顶盒decodeURI有问题，所以获取cookie时不再自动URL解码
         * 存cookie的时候，java代码里面存中文的话就URL编码一下，js获取时不做解码
         * @param cookie_name cookie名字
         * @param default_value 默认值
         * @param parseNumber 是否强转数字
         * @param unescape 是否使用unescape来解码，注意，这个一般只用来解码“:/”等之类的简单符号，对于中文，整个机顶盒都甭想
         * @returns
         */
        get:function(cookie_name,default_value,parseNumber,unescape)
        {
            var reg='(/(^|;| )'+cookie_name+'=([^;]*)(;|$)/g)';
            var temp=eval(reg).exec(document.cookie);
            if(temp!=null)
            {
                var value=temp[2];
                if(parseNumber==true)
                    return parseFloat(value);
                if(unescape)
                    return unescape(value);//URL解码，暂时用unescape代替，具体有没有问题有待日后观察
                return value;
            }
            return default_value;
        },
        /**
         * 设置cookie
         * @param name cookie名称
         * @param value cookie内容，注意cookie内容不能有分号、逗号、等号、空格等特殊字符，中文就更不可以，所以注意使用escape
         * @param day cookie失效天数，默认30天
         * @param path cookie的作用范围，默认当前项目下
         */
        set:function(name,value,day,path)
        {
            day=day==undefined?30:day;
            path=path==undefined?Epg.getContextPath():path;
            var str=name+'='+value+'; ';
            if(day)
            {
                var date=new Date();
                date.setTime(date.getTime()+day*24*3600*1000);
                str+='expires='+date.toGMTString()+'; ';
            }
            if(path)
                str+='path='+path;
            document.cookie=str;//注意，cookie这样设置并不会覆盖之前所有的cookie！除非同名同path
        },
        /**
         * 删除cookie
         * @param name cookie的名字
         * @param path cookie所在的path，默认contextPath
         */
        del:function(name,path)
        {
            this.set(name,null,-1,path);
        }
    };

/**
 * 机顶盒不支持trim方法，故手动写一个
 * add by lxa 20140606
 */
Epg.trim = function(str)
{
    if(str)
        return str.replace(/^\s*(.*?)\s*$/g,'$1');
};

/**
 * 滚动字幕方法，与Epg.Html有些不同，故单独写一个
 * add by lxa 20140606
 */
Epg.marquee =
    {
        /**
         * 将div里面的某段静态文字变成滚动字幕，add by lxa 20140217
         * @param id div的ID
         * @param max_length 最长的文字个数，这里忽略英文、数字和中文之间的差别，统一按个数来算
         * @param amount 时间
         * @param delay 延时
         * @param dir 方向，默认left
         * @param behavior 滚动方式，alternate为左右来回滚动，scroll为循环滚动
         */
        start: function(max_length,id,amount,delay,dir,behavior)
        {
            max_length = max_length || 6;
            id = id || Epg.Button.current.id+'_txt';
            amount = amount || 1;
            delay = delay || 50;
            dir = dir || 'left';
            behavior = behavior || 'alternate';
            if(!this.rollId)
            {
                var html = Epg.trim(G(id).innerHTML);
                if(max_length!==undefined&&html.length>max_length)
                {
                    this.rollId = id;
                    this.innerHTML = html;
                    G(id).innerHTML = '<marquee id="'+id+'_marquee'+'" behavior="'+behavior+'" direction="'+dir+'" scrollamount="'+amount+'" scrolldelay="'+delay+'">'+html+'</marquee>';
                }
            }
        },
        /**
         * 停止滚动字幕
         */
        stop: function()
        {
            if(this.rollId)
            {
                G(this.rollId).innerHTML = this.innerHTML;
                this.rollId = undefined;
            }
        }
    };


/** 事件处理 */
var event_handler = function(e)
{
    e = e || window.event;
    var keyCode = e.which || e.keyCode;
    if(keyCode==KEY_IPTV_EVENT)
    {
        eval("oEvent = " + Utility.getEvent());
        Epg.eventHandler(oEvent.type,true);
    }
    else
    {
        Epg.eventHandler(keyCode);
        //update 20140509:
        //屏蔽浏览器默认的“返回键后退”功能，注意不能所有键都return false，否则连F5等常见按键也失效
        //add 20140519:
        //注意：如果返回方法内部出错，那么浏览器默认方法将不能被屏蔽（测试于360急速浏览器下）
        if(keyCode === KEY_BACK)
            return false;
    }
};

//根据UA判断onkeydown和onkeypress，上线后去掉判断，直接强制使用onkeypress
if(debug_mode&&navigator.userAgent.toLowerCase().indexOf('windows nt')>=0)
    document.onkeydown = event_handler;
else
    document.onkeypress = event_handler;

window.EPG = window.epg = Epg;//增加别名，add 20140514

