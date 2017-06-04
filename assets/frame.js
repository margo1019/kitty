/*
@desc:С������̨ ĳ������̶��߶� ���ֹ�����
@author:wulong.lcx@taobao.com
@parameter:
    @config{container:����,height:Ҫ��ȥ�ĸ߶�}
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
/*չ������
  ��ʼ״̬Ĭ�ϵ�չ��
  @targe:��������
  @contentPanel:Ҫչ��������������
  @direction:�����ķ��� Ĭ��Ϊ��ֱ����
*/
function slideToggle(trigger,contentPanel,direction,callback){
    E.on(trigger,'click',function(){
        D.hide('.help');
        var el=D.get(contentPanel),
            v,styleObj;
        if(D.hasClass(this,'expand')){
             window.tempHeight=D.height(el);//ԭ���߶�
             window.tempWidth=D.width(el);//ԭ�����
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
  �л�iframe
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
