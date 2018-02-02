
(function(window){
	if(CT.isnull(window.PAGE))
	{
		PAGE = {};	
	}
	document.onsystemevent = g;
	document.onkeypress = g;
	document.onirkeypress = g;
	function g(evt)
	{
		e = evt ? evt : window.event;
		var keycode = e.which ? e.which : e.keyCode;
		switch(keycode)
			{
			case 5202 :
					PAGE.MP.play();
					PAGE.vp.isPlaying = true;
					PAGE.vp.playFromStart();
					break;
			default :
					break;
			}
	}
	/**
	 * ipanel 视频播放 接口封装
	 */
	PAGE.MP = PAGE.mp = (function(){
		return {
			
			/**
			 * 获取当前带宽
			 */
			getCurBandWidth:function()
			{
				try{
					return media.AV.curBandWidth;
				}catch(e){}
			},
			/**
			 * 获取播放媒体总的持续时间。
			 */
			getDuration:function()
			{
				try{
					return media.AV.duration;
				}catch(e){}
			},
			/**
			 * 返回当前实时流播放的位置（离开始点的时间距离）。
			 */
			getElapsed:function()
			{
				try{
					return media.AV.elapsed;
				}catch(e){}
			},
			
			/**
			 * 快退
			 * n 定倍数，数值型
			 * startTime： 表示指定时间，字符串型,格式： "HH:MM:SS"；
			 */
			backward:function(n,startTime)
			{
				try{
					if(startTime !=undefined && startTime !=null)
					{
						media.AV.backward(n,startTime)
					}else{
						if(n==undefined || n == null)
						{
							media.AV.backward();
						}else if(n >= -32 && n <= 32){
							media.AV.backward(n);
						}
					}
				}catch(e){}
			},
			/**
			 * 设置快进播放
			 * n 定倍数，数值型
			 * startTime 表示指定时间，字符串型,格式： "HH:MM:SS";
			 */
			forward:function(n,startTime)
			{
				try{
					if(startTime !=undefined && startTime !=null)
					{
						media.AV.forward(n,startTime);
					}else{
						if(n==undefined || n == null)
						{
							media.AV.forward();
						}else if(n >= 2 && n <= 32){
							media.AV.forward(n);
						}
					}
				}catch(e){}
			},
			/**
			 * 获取文件媒体类型
			 * @returns
			 */
			getMediaType:function()
			{
				try{
					return media.AV.mediaType;
				}catch(e){}
			},
			/**
			 * 打开指定媒体源进入待命状态
			 * @param URL  RTSP 地址
			 * @returns
			 */
			open:function(URL)
			{
				try{
					media.AV.open(URL,"VOD");
					return false;
				}catch(e){
					return true;
				}
			},
			/**
			 * 暂时停止正在播放的视频。
			 */
			pause:function()
			{
				try{
					media.AV.pause();
				}catch(e){}
			},
			/**
			 * 开始正常播放当前所打开的视频
			 */
			play:function()
			{
				try{
					media.AV.play();
				}catch(e){}
			},
			stop:function()
			{
				try{
					media.AV.close();
				}catch(e){}
				
				try{
					DVB.stopAV(0);
				}catch(e){}
				
			},
			/**
			 * 进度条上显示的节目播放时间与节目总时长的比率，便于进度条显示进度。
			 * 单位： 百分率(%)；
			 * 取值： [0,100]；
			 */
			getPropress:function()
			{
				try{
					return media.AV.progress;
				}catch(e){}
			},
			/**
			 * 定位到某个进度开始播放媒体（ 表示跳转到指定的进度开始正常播放），针对整个电影
			 * press：字符串型，形如”18%”，表示从指定进度开始播放节目，这个参数值不能大于 100%。
			 * 如果 type 是 VOD 则有返回消息：
			 * EIS_VOD_PLAY_SUCCESS： 播放媒体成功；
			 * EIS_VOD_PLAY_FAILED： 播放媒体失败；
			 * EIS_STDMESSAGE_NOT_FOUND： 播放的节目没有数据
			 */
			seek:function(press)
			{
				try{
					return media.AV.seek(press);
				}catch(e){}
			},
			/**
			 * 获取当前视频播放速度
			 * 权限：只读
			 * 类型：数值型
			 * 单位：倍
			 * 取值：当前速度，大于 1 的正整数表示快进，负整数表示几倍速度回退，分数表示慢放。
			 * 如：
			 * 2， 4， 8， 16：表示多少倍速度快进；
			 * 1：表示正常速度播放；
			 * 0：表示停止播放；
			 * -1：表示正常速度回退；
			 * -2， -4， -8， -16：表示多少倍速度快退；
			 * 1/2， 1/4， 1/8， 1/16：表示以正常速度的多少进行慢放
			 */
			getSpeed:function()
			{
				try{
					return media.AV.speed;
				}catch(e){}
			},
			/**
			 * 获取目前的播放状态。
			 * 权限：只读
			 * 类型：字符串型
			 * 单位：无
			 * 取值：
			 * “play” ： 媒体正在播放中；
			 * “pause” ： 媒体为暂停状态；
			 * “fastforward”： 媒体在快速前进；
			 * “backward”：媒体在快速后退；
			 * “repeat” ： 媒体重绕；
			 * “slow” ： 媒体慢放；
			 * “stop” ： 停止。
			 */
			getStatus:function()
			{
				try{
					return media.AV.status;
				}catch(e){}
			},
			/**
			 * 作用：获取当前媒体播放的 URL。
			 */
			getURl:function()
			{
				try{
					return media.AV.URL;
				}catch(e){}
			},
			/**
			 * 全屏播放视频媒体
			 */
			setFullScreen:function()
			{
				try{
					media.video.fullScreen();
				}catch(e){}
			},
			/**
			 * 设置视频的大小和位置
			 */
			setPosition:function(x,y,width,height)
			{
				try{
					media.video.setPosition(x,y,width,height);
				}catch(e){}
			}
		};	
	})();
	function VideoPlay()
	{
		
		
		/**
		 * size {x:0,y:0,width:0,height:0}
		 */
		this.init = function(data)
		{
			if(CT.isnull(data)){return;}
			if(CT.isNotNull(data.url))
			{
				//设置窗口大小播放
				if(CT.isNotNull(data.size))
				{
					PAGE.MP.setPosition(data.size.x,data.size.y,data.size.width,data.size.height);
				}else{
					//全屏
					PAGE.MP.setFullScreen();
				}
				var bl = PAGE.MP.open(data.url);
				if(bl)
				{
					//兼容Pc端
					PAGE.vp.playFromStart();
				}
			}
		};
		
		this.circulateInterval = null;
		this.data = null;
		//正在播放
		this.isPlaying = false;
		//首次加载完成
		this.isPlayd = false;
		//首次open完成,防止在计时器中重复open
		this.isOpend = false;
		this.numss = 0;
		this.circulatePlay = function(data)
		{
			if(CT.isnull(data)){return;}
			this.data = data;
			if(CT.isNotNull(data.url))
			{
				//设置窗口大小播放
				if(CT.isNotNull(data.size))
				{
					PAGE.MP.setPosition(data.size.x,data.size.y,data.size.width,data.size.height);
				}else{
					//全屏
					PAGE.MP.setFullScreen();
				}
				this.isPlaying = false;
				var bl = PAGE.MP.open(data.url);
				if(bl)
				{
					//兼容Pc端
					PAGE.vp.playFromStart();
				}
				//CT.html("text","开始播放"+PAGE.vp.numss);
			}
			this.circulateInterval = setInterval(function(){
				
					++  PAGE.vp.numss;
					if( PAGE.vp.isPlaying == true)
					{
						var data = PAGE.vp.data;
						var allTimes = parseInt(PAGE.vp.getDuration());
						var curTimes = parseInt(PAGE.vp.getElapsed());
						var zbfb = Math.round((curTimes * 1.0/allTimes)*100) ;
						if(zbfb>0 && zbfb < 100)
						{
							PAGE.vp.isPlayd = true;
							//CT.html("text","正在播放：-"+allTimes+"-"+curTimes+"-"+zbfb+"-"+PAGE.vp.numss);
						}
						
						if((zbfb >= 100 || curTimes ==allTimes) && PAGE.vp.isPlayd ==true)
						{
							//CT.html("text","播放结束：-"+allTimes+"-"+curTimes+"-"+zbfb+"-"+PAGE.vp.numss);
							//设置窗口大小播放
							if(CT.isNotNull(data.size))
							{
								PAGE.MP.setPosition(data.size.x,data.size.y,data.size.width,data.size.height);
							}else{
								//全屏
								PAGE.MP.setFullScreen();
							}
							var bl = PAGE.MP.open(data.url);
							PAGE.vp.isPlaying = false;
							PAGE.vp.isPlayd = false;
							if(bl)
							{
								//兼容Pc端
								PAGE.vp.playFromStart();
							}
						}
					}
				
			},1000);
		};
		
		/**
		 * 该方法提供给页面正式播放的时候，可以调用
		 */
		this.playFromStart =function()
		{
			
		};
		/**
		 * 开始播放
		 */
		this.play = function()
		{
			PAGE.MP.play();
		};
		/**
		 * 暂停
		 */
		this.pause = function()
		{
			PAGE.MP.pause();
		};
		/**
		 * 停止播放
		 */
		this.stop = function()
		{
			PAGE.MP.stop();
		};
		/**
		 * 获取时分秒
		 * @param milliscond 秒
		 * @returns
		 */
		this.getTimeStr = function(milliscond)
		{
			var hour = Math.floor(milliscond / 3600);
			var minute = Math.floor((milliscond - hour * 3600) / 60);
			var second = milliscond - hour * 3600 - minute * 60;
			hour = hour > 9 ? hour: "0" + hour;
			minute = minute > 9 ? minute: "0" + minute;
			second = second > 9 ? second: "0" + second;
			return hour + ":" + minute + ":" + second;
		};
		/**
		 * 进度条上显示的节目播放时间与节目总时长的比率，便于进度条显示进度。
		 * 单位： 百分率(%)；
		 * 取值： [0,100]；
		 */
		this.getPropress = function()
		{
			return PAGE.MP.getPropress();
		};
		
		/**
		 * 获取播放媒体总的持续时间。
		 */
		this.getDuration = function()
		{
			return PAGE.MP.getDuration();
		};
		/**
		 * 快退
		 * n 定倍数，数值型
		 * startTime 表示指定时间，字符串型,格式： "HH:MM:SS";
		 */
		this.backward = function(n,startTime)
		{
			PAGE.MP.backward(n,startTime);
		};
		/**
		 * 快进
		 * n 定倍数，数值型
		 * startTime 表示指定时间，字符串型,格式： "HH:MM:SS";
		 */
		this.forward = function(n,startTime)
		{
			PAGE.MP.forward(n,startTime);
		};
		/**
		 * 返回当前实时流播放的位置（离开始点的时间距离）。
		 */
		this.getElapsed = function()
		{
			return PAGE.MP.getElapsed();
		};
		
	}
	PAGE.vp = new VideoPlay();
})(window);
