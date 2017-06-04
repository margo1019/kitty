/*
@desc:小二工作台 某块区域固定高度 出现滚动条
@author:wulong.lcx@taobao.com
@parameter:
    @config{container:容器,height:要减去的高度}
*/
var S=KISSY,
    D=S.DOM,
    E=S.Event;
function PanelScoll(config){  
    self=this;
    self.config={
        container:null,
        height:0
    };
    self.init=function (){
        self.config=S.merge(self.config,config);
        setScroll();
    };
    function setScroll(){
        var h=D.viewportHeight()-self.config.height+'px',
            el=D.get(self.config.container);
        D.css(el,{height:h,overflow:'auto'});
    }
}
function createDatePicker(hook){
       if(!hook){return;}
        S.use('calendar,calendar/assets/base.css',function(S){
        var S_Date = S.Date;
            new S.Calendar(hook,{
                popup:true,
                triggerType:['click'],
                minDate:new Date('2011-09-15'),
                closable:true
            }).on('select', function(e) {
                D.get(hook).value=S_Date.format(e.date,'isoDate');
            });
    });
}
/*展开收缩
  初始状态默认的展开
  @targe:触发开关
  @contentPanel:要展开或收缩的区域
  @direction:收缩的方向 默认为垂直方向
*/
function slideToggle(trigger,contentPanel,direction,callback){
    E.on(trigger,'click',function(){
        D.hide('.help');
        var el=D.get(contentPanel),
            v,styleObj;
        if(D.hasClass(this,'expand')){
             window.tempHeight=D.height(el);//原来高度
             window.tempWidth=D.width(el);//原来宽度
             v=0;
             D.removeClass(this,'expand');
        }else{
           D.addClass(this,'expand');
            if(direction==='horizion'){
                    v=tempWidth;
                }else{
                   v=tempHeight; 
                }
            }
        if(direction==='horizion'){
            styleObj={
                width:v+'px'
            };
        }else{
            styleObj={
                height:v+'px'
            };
        }
        S.use('anim', function (S, Anim) {
				var anim = S.Anim(el,styleObj, 0.3, 'easeOut',function(){
                    if(S.isFunction(callback)){
                        callback();
                    }
                });
                    anim.run();
			}); 
    });
}
function resize(config){  
    E.on(window,'resize',function(){
        //console.log('resize');
        //console.log('h',D.viewportHeight());
        //console.log('w',D.viewportWidth());
        //var vh=D.viewportHeight(),
           var  vw=D.viewportWidth(),
            navEl=D.get('#navSideContent'),
            mainContentEl=D.get('#mainContent');
        D.css(navEl,{width:vw*0.15+'px'});
        D.css(mainContentEl,{width:vw*0.8+'px'});
    });
}
//resize();
function PanelScoll(config){
    var S=KISSY,
    D=S.DOM,
    E=S.Event,
    self=this;
    self.config={
        container:null,
        height:0,
        width:0
    };
    self.init=function (){
        self.config=S.merge(self.config,config);
        _setScroll();
    };
    function _setScroll(){
        var h=self.config.height,
            w=self.config.width;
        h=D.viewportHeight()-h+'px';
        w=D.viewportWidth()-w+'px';
        D.css(D.get(self.config.container),{height:h});
    }
}
function setScroll(container,fixedValue,type){
        var styleObj,w,h;
        if(type==='width'){
            w=D.viewportWidth()-fixedValue+'px';
            styleObj={width:w};
        }else if(type==='height'){
            h=D.viewportHeight()-fixedValue+'px';
            styleObj={height:h};
        }
        D.css(D.get(container),styleObj);
}
/**
  切换iframe
* @setIframe
*/
function setIframe(){
    var iframe=D.get('#J_Iframe');
    E.on(D.query('a',D.get('#navMenu')),'click',function(e){
        e.preventDefault();
        if(iframe){
            iframe.src=this.href;
        }
    });
}
