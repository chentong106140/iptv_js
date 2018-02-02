var isMobile;
isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};
if(isMobile.any()){
    //alert("Is mobile- isAndroid:"+ isMobile.Android() + " isIOS:"+ isMobile.iOS());
    //$('.main_header').hide();
}

(function(){//控制字体
    var win = window, doc = document;
    function setFontSize() {
        var winWidth = document.body.clientWidth;
        var size = (winWidth / 960) * 50;
        doc.documentElement.style.fontSize = size+ "px";
    };
    setFontSize();
    window.onresize=setFontSize;
})();

//切换tab ::eg: initTab(".js-tab1>li",".js-tabCont1","on");
function initTab(tab,cont,onClass,eventType){
    eventType=eventType||"click";
    $(tab)[eventType](function(e) {
        //console.log("on initTab:", eventType,e.target,e.currentTarget,e.which,$(document).find(":focus"));
        var ind=$(this).index();
        $(cont).children().eq(ind).show().siblings().hide();
        $(this).addClass(onClass).siblings().removeClass(onClass);
    });
}

//机顶盒上元素取消焦点
$(document).on("focus", "*", function(e){
    var ths= $(this);
    ths.get(0).blur();
    //console.log(ths, ths.context.tagName);
});
//setInterval(function(){console.log($(document).find(":focus").length)},2000); //查看页面上有多少焦点

function openmenu(sn_p,subnum_p,ttnum_p){
    var t1=document.getElementById("c"+sn_p+"_"+subnum_p);

    if(t1.style.display=="none"){
        for(i=1;i<=ttnum_p;i++){
            document.getElementById("c"+sn_p+"_"+i).style.display="none";
            $("#m"+sn_p+"_"+i).removeClass("on");
        }
        t1.style.display="block";
        $("#m"+sn_p+"_"+subnum_p).addClass("on");
    }
}

/*input、textarea设置默认文本 —— 例如：<input type="text" defaultTxt="不超30个字" defaultCol="#ff3333"/> isPwd="1" 时是密码登录输入框*/
function setDefaultTxt(){
    $("input[defaultTxt]").add($("textarea[defaultTxt]")).each(function(index, element) {
        var tag=$(this);
        var defTxt=tag.attr("defaultTxt"); //默认提示文字
        var defCol=tag.attr("defaultCol")? tag.attr("defaultCol") : "#ccc"; //默认提示文字时的颜色
        tag.css("color", defCol).val(defTxt);
        tag.focus(function(e) {
            if(tag.val()==defTxt){
                tag.val("").css("color","");
                if(tag.attr("isPwd")=="1"){
                    tag.get(0).type="password";
                }
            }
        }).blur(function(e) {
            if(tag.val()==""){
                tag.val(defTxt).css("color",defCol);
                if(tag.attr("isPwd")=="1"){
                    tag.get(0).type="text";
                }
            }
        });
    });
}


//简单弹出层
function show2(cover,id){
    document.getElementById(cover).style.display="block";
    document.getElementById(id).style.display="block";
    $("html").add($("body")).css("overflow","hidden").css("height","100%");
}
function hide2(cover,id){
    document.getElementById(cover).style.display="";
    document.getElementById(id).style.display="none";
    $("html").add($("body")).css("overflow","").css("height","");
}

//向下滑动加载更多(fix &#160)
var flag = false;
var s=0;
function load_more(_html,sclBox,instBfLoading){ //_html:动态加的内容；sclBox:滚动的容器;instBfLoading:是否在sclBox最后一个子节点前（即loading图片前）插入新内容;
    var timer;
    var box=sclBox || window; //默认window滚动
    var ibfLoading=instBfLoading || false;
    $(box).scrollTop(0);
    $(box).scroll(function(){
        flag = true;
        if (timer) clearTimeout(timer)
        timer = setTimeout(function () {
            var docHeight = box==window? $(document).height() : $(box)[0].scrollHeight;
            var rollHeight = box==window? document.documentElement.clientHeight : $(box)[0].clientHeight;
            var scrHeight = $(box).scrollTop();
            setTimeout(function () {
                if(docHeight > rollHeight){
                    if (scrHeight >= (docHeight-rollHeight)) {
                        var setT = setTimeout(function(){
                            if(flag)
                            {
                                //loading();
                                ibfLoading ? $(".js-swiper-wrapper0>:last-child").before(_html) : $(".js-swiper-wrapper0").append(_html);
                                flag = false;
                            }
                        },"0");
                    }
                }
            }, 1000);
        }, 10);
    });
}

//显示fixed弹窗
function showW2(cover,popId){
    $(cover).show();
    $(popId).css("display","-webkit-box");
}
//隐藏fixed弹窗
function hideW2(cover,popId){
    $(cover).hide();
    $(popId).hide();
}

//显示fixed弹窗 提示语
function showW1(cover,popId){
    $(cover).show();
    $(popId).css("display","block");
}
//隐藏fixed弹窗 提示语
function hideW1(cover,popId){
    $(cover).hide();
    $(popId).hide();
}

//倒计时
function countDown(endTime, startTime, tag){
    // 服务器当前时间
    var srtime = new Date(startTime).getTime();
    // 服务器秒杀时间
    var end_time = new Date(endTime).getTime(), //月份是实际月份-1 
        //sys_second = (end_time-new Date().getTime())/1000; 
        sys_second = (end_time - srtime) / 1000;
    //alert(sys_second);
    var timer = setInterval(function() {
        if(sys_second > 1) {
            sys_second -= 1;
            var day = Math.floor((sys_second / 3600) / 24);
            var hour = Math.floor((sys_second / 3600) % 24);
            var minute = Math.floor((sys_second / 60) % 60);
            var second = Math.floor(sys_second % 60);
            var tmpday = day < 10 ? "0" + day : day;
            var tmphour = hour < 10 ? "0" + hour : hour;
            var tmpminute = minute < 10 ? "0" + minute : minute;
            var tmpsecond = second < 10 ? "0" + second : second;
            $(tag).html("倒计时：" + tmphour + ":" + tmpminute + ":" + tmpsecond);
        } else {
            clearInterval(timer);
        }
    }, 1000);
}

//键盘控制
function initKeyBoardCtl(){
    var ths=this;
    var allParts=$(".js-part"); //所有部位
    var curActPart=$(".actPart"); //当前焦点部位
    var curActPartInd=0;//function(){return allParts.index(curActPart)}; //当前焦点部位索引
    var curActEle=null; //当前焦点元素
    ths.focusPart=focusPart;
    var useDebug=false; //开启调试

    if(useDebug){
        var cons={log:function(){
            var tag=$("body>.debug");
            if(tag.length<=0){
                tag=$("<div class='debug'></div>");
                $("body").append(tag);
            }
            var str="";
            for(var t in arguments){
                str+=" &nbsp;"+arguments[t];
            }
            tag.html(tag.html()+ str +"<br>");
            tag.scrollTop(tag.get(0).scrollHeight-tag.get(0).clientHeight);
        }}
        console=cons;
    }

    $(document).keydown(function(e){
        console.log(e.which);
        curActPart=$(".actPart");//allParts.eq(curActPartInd);
        curActEle=curActPart.find(".act");
        var chdInd=Number(curActEle.attr("ind"));
        var partChilds=curActPart.find(".js-partChd");
        var childLen=partChilds.length;

        //所有类似操作
        if(1==1){
            switch (e.which){
                case 13://Enter
                    var enterFun=curActEle.attr("enterFun");
                    if(enterFun && enterFun.length>0){
                        //console.log(enterFun);
                        eval(enterFun);
                    }
                    break;
                case 37://L
                    if(chdInd>0){
                        curActEle.removeClass("act");
                        partChilds.eq(chdInd-1).addClass("act");
                    }
                    break;
                case 39://R
                    if(chdInd<childLen-1){
                        curActEle.removeClass("act");
                        partChilds.eq(chdInd+1).addClass("act");
                    }
                    break;
                case 38://U
                    break;
                case 40://D
                    break;
                default:
                    break;
            }
        }

        if(curActPart.attr("part")==1){ //第一部分:tab切换区
            switch (e.which){
                case 13://Enter
                    break;
                case 37://L
                    if(chdInd>0){
                        partChilds.eq(chdInd-1).trigger("click");
                        showOrderOvertime();
                    }
                    break;
                case 39://R
                    if(chdInd<childLen-1){
                        partChilds.eq(chdInd+1).trigger("click");
                        changeToThirdparty();
                    }
                    break;
                case 38://U
                    break;
                case 40://D
                    if(chdInd==0){
                        focusPart(2);
                    }
                    break;
                default:
                    break;
            }
        }else if(curActPart.attr("part")==2){ //第二部分:号码输入框区
            switch (e.which){
                case 13://Enter
                    if(chdInd==1){ //获取验证码按钮
                        if(!curActEle.is(":disabled")){
                            curActEle.trigger("click");
                        }
                    }
                    break;
                case 37://L
                    break;
                case 39://R
                    break;
                case 38://U
                    focusPart(1);
                    break;
                case 40://D
                    focusPart(4);
                    break;
                default:
                    break;
            }
        }else if(curActPart.attr("part")==3){ //第三部分:数字键盘区
            switch (e.which){
                case 13://Enter
                    var curInp=allParts.eq(1).find(".act");
                    var eleHtml=curActEle.html();
                    var v=curInp.val();
                    if(eleHtml=="删除"){
                        curInp.val(v.substr(0,v.length-1));
                    }else if(eleHtml=="确认"){
                        //focusPart(2,0);
                        //allParts.eq(1).find(".js-partChd:eq(0)").removeClass("act");
                    }else{
                        if(v.length < curInp.attr("maxlength")){
                            curInp.val(v+eleHtml);
                        }
                    }
                    break;
                case 37://L
                    break;
                case 39://R
                    break;
                case 38://U
                    var ind=curActEle.attr("ind");
                    var downInd=ind>=3? Number(ind)-3:ind;
                    curActEle.removeClass("act");
                    partChilds.eq(downInd).addClass("act");
                    break;
                case 40://D
                    var ind=curActEle.attr("ind");
                    var downInd=ind<=8? Number(ind)+3:ind;
                    curActEle.removeClass("act");
                    partChilds.eq(downInd).addClass("act");
                    break;
                default:
                    break;
            }
        }else if(curActPart.attr("part")==4){ //第四部分:底部按钮区
            switch (e.which){
                case 13://Enter
                    break;
                case 37://L
                    break;
                case 39://R
                    break;
                case 38://U
                    focusPart(2);
                    break;
                case 40://D
                    break;
                default:
                    break;
            }
        }else if(curActPart.hasClass("js-part-popUp")){ //弹窗部分：统一处理
            switch (e.which){
                case 13://Enter
                    break;
                case 37://L
                    break;
                case 39://R
                    break;
                case 38://U
                    break;
                case 40://D
                    break;
                default:
                    break;
            }
        }

        if(e.which==27){ //Back
            history.back();
        }
    });

    //切换到某部位:: part:切换到的新部位； defAct:修改新部位默认焦点元素
    function focusPart(part,defAct){
        curActPart=$(".actPart");
        curActEle=curActPart.find(".act");
        var ind=part-1;
        var newPart=allParts.eq(ind);
        if(ind!=2){ //切换到第三部位时，第二部位的元素(号码输入框)焦点不取消
            curActEle.removeClass("act");
        }
        //part焦点切换
        allParts.removeClass("actPart act");
        allParts.each(function(ind,ele){
            var extraFocus=$(this).attr("extraFocus");
            if(extraFocus){
                $(extraFocus).removeClass("act");
            }
        });
        newPart.addClass("actPart act");
        //新部位默认焦点元素选中
        if(defAct!=undefined){
            newPart.find(".js-partChd").eq(defAct).addClass("act");
        }else{
            newPart.find(".js-partChd[defAct]").addClass("act");
        }
        //额外轮廓选中效果
        var extraFocus=newPart.attr("extraFocus");
        if(extraFocus){
            var temp=$(extraFocus);
            if(temp.length>=1){
                temp.addClass("act");
            }
        }
    }

}