
/*
 * 
 * 
fullscreenPlay	----	全屏播放	----callback
smallvodPlay	----	小视频播放	----callback
smallTofullscreen---	小视频转全屏	----callback
playVoice	----	播放音频	----url_,callback
playByTime	----	定点播放	----second , callback
getPlayTimeInfo	----	返回MM:SS形式的时间callback
getPlayTimePercent--	获取当前播放进度XX%-callback
getRate		----	获取播放总进度比例0-1之间-callback
stop		----	暂停		----callback
playOrPause	----	播放或暂停	----callback
quietVolume	----	静音		----callback
upVolume	----	音量调高	----callback
downVolume	----	音量调低	----callback
fastForward	----	快进		----callback
fastRewind	----	 快退		----callback
resume		----从暂停、快进、快退中恢复-callback
toggleMuteFlag	----	开启或关闭声音	----callback
playFinishEvent	----	播放完成事件	----a,b
autoReplay	----	自动重播	----callback

 */
(function(){
				if(CT.isnull(window.PAGE))
				{
					PAGE = {};	
				}
				PAGE.MP = PAGE.mp  =(function(){
					return {
							speed : 1,			// 正常播放速度
							state : 'stop', 	// play-播放,pause-暂停,fastForward-快进,fastRewind-快退,full-全屏,stop-停止播放,
							muteFlag : 0,		// 0-有声,1-静音 
							showState : 'small', //small-自定义小屏幕播放状态（默认），full=全屏状态 voice-音频播放
							mp : null,
							instanceId : '',
							playMustArgu : {playUrl:'',left:0,top:0,width:640,height:526,contentId:''}, //默认视频尺寸与位置
							/** 用于播放完成计时器 **/
							playFinishEventInterval : null,
							/** 是否播放完成  **/
							playFinish : false,
							/** 人为指定时长 **/
							autoAllTime : 0,
							/** 播放总秒数 **/
							playAllTime : 0,
							/**当前播放秒数 **/
							playCurrentTime : 0,
							/** 是否启用快进，快退功能 默认启用 **/
							enableFast : true,
							/** 初始化参数	**/
							init : function(){
								try{
									if(!CT.isnull(this.mp))
									{
										this.stop();	
									}
										// 建立背景音乐播放器实例
									this.mp = new MediaPlayer(); 
									var instanceId 			= this.mp.getNativePlayerInstanceID();
									this.instanceId = instanceId;
									var playListFlag 		= 0;		//Media Player 的播放模式。 0：单媒体的播放模式 (默认值)，1: 播放列表的播放模式
									var videoDisplayMode 	= 1; 		// 0-自定义尺寸,1-全屏(默认),2: 按宽度显示，3: 按高度显示,255-不显示在背后播放
									var height = this.playMustArgu.height;
									var width = this.playMustArgu.width;
									var left = this.playMustArgu.left;
									var top = this.playMustArgu.top;
									var muteFlag 			= 0; 		// 0-有声(默认),1-静音
									var useNativeUIFlag 	= 1; 		// 0-不使用player的本地UI显示功能,1-使用player的本地UI显示功能(默认)
									var subtitleFlag 		= 0; 		// 0-不显示字幕(默认),1-显示字幕
									var videoAlpha 			= 0; 		// 0-不透明(默认),100-完全透明
									var cycleFlag 			= 0;		// 0-设置为循环播放（默认值）, 1-设置为单次播放 
									var randomFlag 			= 0;
									var autoDelFlag 		= 0;
									
									this.mp.initMediaPlayer(instanceId,playListFlag,videoDisplayMode,height,width,left,top,muteFlag,useNativeUIFlag,subtitleFlag,videoAlpha,cycleFlag,randomFlag,autoDelFlag);
									this.mp.setAllowTrickmodeFlag(0);		//0-允许 TrickMode 操做 ,1-不允许 TrickMode 操作 (默认值) 
									this.mp.setVolume(100);
								}catch(e){}
							},
								/** 获取播放串 */
							getMediaStr :	function(contentId)
							{
								var mediaStr ='';
								if(window.frames["ivideos"])
								{
									mediaStr = window.frames["ivideos"].getMediastr(contentId);
								}
								return mediaStr;
							},
								/*** 全屏播放 ***/
							fullscreenPlay : function(callback)
							{
								var url_  = this.playMustArgu.playUrl;
								if(!CT.isnull(url_))
								{
									try{
										if(CT.isnull(this.mp))
										{
											this.init();
										}
										/**	设置媒体播放器播放媒体内容 **/
										this.mp.setSingleMedia(this.getMediaStr(url_));
										/** MediaPlayer对象对应的视频窗口的显示模式. **/
										/** 0-自定义尺寸,1-全屏(默认),2: 按宽度显示，3: 按高度显示,255-不显示在背后播放  **/
										this.mp.setVideoDisplayMode(1);
										this.mp.refreshVideoDisplay();
										this.mp.playFromStart();
										//当前播放状态为“播放"
										this.state = "play";
										//当前屏幕显示模式为全屏
										this.showState = "full";
										//当前播放时间清0
										this.playCurrentTime = 0;
										//播放完成状态为，未播放完成
										this.playFinish = false;
										if(!CT.isnull(callback))
										{
											CT.call(callback,["success"]);
										}
										
									}catch(e){}
								}
							},
									/** 小视频播放 */
							smallvodPlay	: function(callback)
							{
								try{
									var url_  = this.playMustArgu.playUrl;
									if(!CT.isnull(url_))
									{
										if(CT.isnull(this.mp))
											{
												this.init();
											}
											
											var height = this.playMustArgu.height;;
											var width = this.playMustArgu.width;
											var left = this.playMustArgu.left;
											var top = this.playMustArgu.top;
											this.mp.setSingleMedia(this.getMediaStr(url_));
											this.mp.setVideoDisplayMode(0);
											this.mp.setVideoDisplayArea(left, top, width, height);
											this.mp.refreshVideoDisplay();
											this.mp.playFromStart();
											//当前播放状态为“播放"
											this.state = "play";
											//当前屏幕显示模式为自定义窗口
											this.showState = "small";
											//当前播放时间清0
											this.playCurrentTime = 0;
											//播放完成状态为，未播放完成
											this.playFinish = false;
											if(!CT.isnull(callback))
											{
												CT.call(callback,["success"]);
											}
									}
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
									}
							},
								/**  小视频转全屏 **/
							smallTofullscreen : function(callback)
							{
								try{
									if(!CT.isnull(this.mp))
									{//转全屏
										if(this.showState == "small" )
										{
											this.showState = "full";
											this.mp.setVideoDisplayMode(1);
											//this.mp.setVideoDisplayArea(left, top, width, height);
											this.mp.refreshVideoDisplay();
										}else if(this.showState == "full" ){
											this.showState = "small";
											var height = this.playMustArgu.height;;
											var width = this.playMustArgu.width;
											var left = this.playMustArgu.left;
											var top = this.playMustArgu.top;
											this.mp.setVideoDisplayMode(0);
											this.mp.setVideoDisplayArea(left, top, width, height);
											this.mp.refreshVideoDisplay();
										}
									}
								if(!CT.isnull(callback))
										{
											CT.call(callback,["success"]);
										}
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
									}
							},
								/** 播放音频 **/
							playVoice : function(url_,callback)
							{
								try{
									if(!CT.isnull(url_))
									{
										this.playMustArgu.playUrl  = url_;
										if(CT.isnull(this.mp))
										{
											this.init();
										}
										/**	设置媒体播放器播放媒体内容 **/
										this.mp.setSingleMedia(this.getMediaStr(url_));
										/** MediaPlayer对象对应的视频窗口的显示模式. **/
										/** 0-自定义尺寸,1-全屏(默认),2: 按宽度显示，3: 按高度显示,255-不显示在背后播放  **/
										this.mp.setVideoDisplayMode(255);
										this.mp.refreshVideoDisplay();
										this.mp.playFromStart();
										//当前播放状态为“播放"
										this.state = "play";
										//当前屏幕显示模式为全屏
										this.showState = "voice";
										//当前播放时间清0
										this.playCurrentTime = 0;
										//播放完成状态为，未播放完成
										this.playFinish = false;
									}
									if(!CT.isnull(callback))
									{
										CT.call(callback,["success"]);
									}
								}catch(e){
									if(!CT.isnull(callback))
									{
										CT.call(callback,["error"]);
									}
								}
							},
								/** 定点播放 */
							playByTime: function(second , callback)
							{
								try{
										this.mp.playByTime(1, second);
									if(!CT.isnull(callback))
										{
											CT.call(callback,["success"]);
										}
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
									}
							},
								/** 返回MM:SS/MM:SS 形式的时间 */
							getPlayTimeInfo : function(callback)
							{
								try{
									function getInfo(second)
									{
										var m = Math.floor(second/60);
										m = m<10 ? ('0'+m) : m;
										var s = second % 60;
										s = s<10 ? ('0'+s) : s;
										return m + ':' + s;
									}
									
										if(!CT.isnull(callback))
										{
											CT.call(callback,["success"]);
										}
										return getInfo(this.mp.getCurrentPlayTime())+'/' + getInfo(this.mp.getMediaDuration());
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
									}
							},
								/** 获取当前播放进度XX% */
							getPlayTimePercent: function(callback)
							{
								try{
									
										if(!CT.isnull(callback))
										{
											CT.call(callback,["success"]);
										}
										return (this.mp.getCurrentPlayTime()/this.mp.getMediaDuration()).toFixed(2)*100+'%';
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
									}
							},
								/**
								 * 获取播放总进度比例，返回介于0-1之间的小数
								 * @returns {String}
								 */
							getRate : function(callback)
							{
								try{
									var current=this.mp.getCurrentPlayTime();	//当前秒数
									var alls=this.mp.getMediaDuration();	//总的秒数
									
										if(!CT.isnull(callback))
										{
											CT.call(callback,["success"]);
										}
										return (current / alls ).toFixed(2);	//保留2位小数
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
									}
							},
								/** 暂停 **/
							stop : function(callback)
							{
								try{
									 if (!CT.isnull(this.mp))
										 {
												this.mp.stop();
												this.mp.releaseMediaPlayer(this.instanceId);
												this.mp = null;
												this.state = "stop";
										 }
								if(!CT.isnull(callback))
										{
											CT.call(callback,["success"]);
										}
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
									}
							},
								/** 播放或暂停 */
							playOrPause: function(callback)
							{
								try{
									if (!CT.isnull(this.mp))
									 {
										if(this.state == 'play' )
										{
											this.mp.pause();
											this.state = "pause";
										}else{
											this.mp.resume();
											this.state = "play";
										}
									 }
									if(!CT.isnull(callback))
											{
												CT.call(callback,[this.state]);
											}
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
									}
							},
								/**  静音 **/
							quietVolume : function(callback)
							{
										 try {
												 if (!CT.isnull(this.mp))
												 {
													var val =  this.mp.getVolume();
													 this.mp.setVolume(val == 0 ? 75 :0);
												 }
											if(!CT.isnull(callback))
											{
												CT.call(callback,["success"]);
											}
										}catch(e){
											if(!CT.isnull(callback))
												{
													CT.call(callback,["error"]);
												}
										}
							},
								/**  音量调高 **/
							upVolume : function(callback)
							{
										try {
												  if (!CT.isnull(this.mp))
												 {
													var volume = this.mp.getVolume();
													volume = volume + 5;
													volume = volume > 100 ? 100 :volume;
													volume = volume < 0 ? 0 :volume;
													this.mp.setVolume(volume);
													
												 }
											if(!CT.isnull(callback))
											{
												CT.call(callback,["success",this.mp.getVolume()]);
											}
										}catch(e){
											if(!CT.isnull(callback))
												{
													CT.call(callback,["error"]);
												}
										}
							},
								/**  音量调低 **/
							downVolume : function(callback)
							{
												try {
														  if (!CT.isnull(this.mp))
														 {
															var volume = this.mp.getVolume();
															volume = volume - 5;
															volume = volume > 100 ? 100 :volume;
															volume = volume < 0 ? 0 :volume;
															this.mp.setVolume(volume);
														 }
													if(!CT.isnull(callback))
													{
														CT.call(callback,["success",this.mp.getVolume()]);
													}
												}catch(e){
													if(!CT.isnull(callback))
														{
															CT.call(callback,["error"]);
														}
												}
							},
								/** 快进  **/
							fastForward: function(callback)
							{
								try {
									if(this.enableFast ==true)
									{
									if (!CT.isnull(this.mp))
									 {
										if(this.speed >= 32 || this.state == 'fastRewind')
										{
											this.resume();
										}else
									    {
											this.speed = this.speed * 2;
											this.state = 'fastForward';
											this.mp.fastForward(this.speed);
									    }
										if(!CT.isnull(callback))
										{
											CT.call(callback,["success",this.speed,this.state,this]);
										}
									 }
									}
									}catch(e){
										if(!CT.isnull(callback))
											{
												CT.call(callback,["error"]);
											}
									}
							},
								/** 快退 */
							fastRewind: function(callback)
							{
								try{
									if(this.enableFast ==true)
									{
										if (!CT.isnull(this.mp))
										 {
											if(this.speed >= 32 || this.state == 'fastForward')
											{
												this.resume();
										    }else
											{
												this.speed = this.speed * 2;
												this.state = 'fastRewind';
												this.mp.fastRewind(-this.speed);
										    }
										 }
											if(!CT.isnull(callback))
											{
												CT.call(callback,["success",this.speed,this.state,this]);
											}
									}
								}catch(e){
										if(!CT.isnull(callback))
											{
												CT.call(callback,["error"]);
											}
								}
							},
								/** 从暂停、快进、快退中恢复 */
							resume : function(callback)
							{
								try
								{
									if (!CT.isnull(this.mp))
									 {
											this.speed = 1;
											this.state = 'play';
											this.mp.resume();//try一下的目的是为了电脑上不报错
										
										if(!CT.isnull(callback))
										{
											CT.call(callback,["success",this]);
										}
									 }
								}catch(e){
									if(!CT.isnull(callback))
										{
											CT.call(callback,["error"]);
										}
								}
							},
								/** 开启或关闭声音 */
							toggleMuteFlag: function(callback)
							{
								try{
									if (!CT.isnull(this.mp))
									 {
										++this.muteFlag;
										this.mp.setMuteFlag(this.muteFlag%2);
									 }
									var st = this.muteFlag%2;
									var ss = "";
									if(st > 0)
									{
										ss = "开启静音";
									}else{
										ss = "关闭静音";
									}
									if(!CT.isnull(callback))
									{
										CT.call(callback,["success",ss]);
									}
								 }catch(e){
									if(!CT.isnull(callback))
									{
										CT.call(callback,["error"]);
									}
								 }
							},
							/** 播放完成事件,具体调用时，覆盖此方法 **/
						playFinishEvent : function(a,b)
						{
						},
							/** 用于自动重播计时器 **/
						autoReplayInterval : null,
							/** 针对自定义窗口的自动重播,【注：如果是自动重播，将会禁用快进快退功能】 **/
							/** 如果调用此方法，必须首先指定playMustArgu中的参数，音频播放只需要指定播放路径 **/
						autoReplay : function(callback)
						{
							try{
								this.enableFast = false;
								if(!CT.isnull(this.autoReplayInterval))
								{
									clearInterval(this.autoReplayInterval);
									this.autoReplayInterval  = null;
								}
								
								var url_  = this.playMustArgu.playUrl;
								if(!CT.isnull(url_))
								{
									this.smallvodPlay(callback);
									
									this.autoReplayInterval = setInterval(function(){
										if(PAGE.MP.playFinish == true)
										{
											//获得播放显示模式
											var screentype=PAGE.MP.showState;
											//全屏
											if(PAGE.MP.showState == "full" )
											{
												PAGE.MP.smallvodPlay();
												PAGE.MP.showState = screentype;
												PAGE.MP.mp.setVideoDisplayMode(1);
												PAGE.MP.mp.refreshVideoDisplay();
											}else if(PAGE.MP.showState == "small" ){
												//自定义屏
												PAGE.MP.smallvodPlay();
												PAGE.MP.showState = screentype;
												var height = PAGE.MP.playMustArgu.height;;
												var width = PAGE.MP.playMustArgu.width;
												var left = PAGE.MP.playMustArgu.left;
												var top = PAGE.MP.playMustArgu.top;
												PAGE.MP.mp.setVideoDisplayMode(0);
												PAGE.MP.mp.setVideoDisplayArea(left, top, width, height);
												PAGE.MP.mp.refreshVideoDisplay();
											}else if(PAGE.MP.showState == "voice")
											{
												//音频
												var url_ = PAGE.MP.playMustArgu.playUrl;
												PAGE.MP.playVoice(url_);
											}
											PAGE.MP.playFinish = false;
										}
									},1000);
								}
								
							}catch(e){
								if(!CT.isnull(callback))
								{
									CT.call(callback,["error"]);
								}
							 }
						}
					};
				})();
		})();