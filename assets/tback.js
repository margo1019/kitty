/**
 * @description     TBack JavaScript.
 * @author          qingyu<qingyu@taobao.com>
 * @version         0.9
 * @namespace       TBack
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-2-5  Release version.
 */

(function(){
    //���ñ�����д
    var Util = YAHOO.util
        Dom = Util.Dom, 
        Event = Util.Event,
        Lang = Util.Lang;

    /** @class */
    Tback = (typeof Tback == "undefined" || !Tback) ? YAHOO.namespace('Tback') : Tback;
    
    Lang.augmentObject(Tback, 
    /** @lends Tback */ 
    {   
        /**
         * ����Tback�µ������ռ�
         * @static
         * @param   {String*}   namespace*  ��Ҫ�����������ռ䣬֧�ֶ����
         * @returns {Object}    ���һ�������������ռ�
         */
        namespace: function() {
            var args = [].slice.call(arguments, 0), 
                i,
                len = args.length;
            for (i = 0; i < len; i++) {
                if (args[i].indexOf('Tback') != 0) {
                    args[i] = 'Tback.' + args[i];
                }
            }
            return YAHOO.namespace.apply(null, args);
        }
        
    });
    
    //��������namespace 
    Tback.namespace('module', 'util', 'sys');

    /** @class */
    Tback.sys.Decorator = {

        fns: {},
        
        /**
         * ע����Ҫͨ��Class�ķ�ʽ�Զ�װ�ε����
         * @static
         * @param   {String}    type    ע�����������
         * @param   {Funtion}   fn  �����װ�κ���
         */
        register: function(type, fn) {
            this.fns[type] = fn;
        },

        /**
         * װ��ҳ�������з���������������˷�����DomReadyʱ�Զ�����һ�Σ�
         * @static
         */
        decorateAll: function() {
            this.decoratePart();
        },

        /**
         * װ��ҳ���ϵľֲ����
         * @static
         * @param   {String}    [types]    ��Ҫ�Զ�װ������������б�(optional)
         * @param   {String|HTMLElement}    [root]  ��Ҫ�Զ�װ������ĸ��ڵ�(optional)
         */
        decoratePart: function(types, root) {
            var self = this;
            if (Lang.isValue(types)) {
                if (Lang.isArray(types)) {
                    types.forEach(function(type) {
                        var fn = self.fns[type];
                        if (Lang.isFunction(fn)) {
                            fn(root);
                        }
                    });
                } else {
                    var fn = self.fns[types];
                    if (Lang.isFunction(fn)) {
                        fn(root);
                    }
                }
            } else {
                for(var type in this.fns) {
                    var fn = this.fns[type];
                    if (Lang.isFunction(fn)) {
                        try {
                            fn(root);
                        } catch(e) {
                            //todo  
                        }
                    }
                }
            }
        }

    };
    Event.onDOMReady(function() {
        Tback.sys.Decorator.decorateAll();
    });

    /** @class */
    Tback.sys.ComponentManager = {

        _genIdx: 0,
        
        _componentsIdx: {
            byId: {},
            byType: {}
        },

        /**
         * ������������������
         * @static
         * @param   {Object}    component    ���ӵ��������
         * @param   {String|HTMLElement}    element ���ӵ������Ӧ��ҳ��HTMLԪ��
         * @param   {String}    [type]  �������������(optional)
         */
        add: function(component, element, type) {
            element = Dom.get(element);
            var id = element.id;
            if (id === '') {
                id = 'tback-gen-' + this._genIdx++;
                element.id = id;
            }
            if (!this._componentsIdx.byId[id]) {
                this._componentsIdx.byId[id] = component;
            }
            if (Lang.isValue(type)) {
                if (!this._componentsIdx.byType[type]) {
                    this._componentsIdx.byType[type] = {};
                }
                if (!this._componentsIdx.byType[type][id]) {
                    this._componentsIdx.byType[type][id] = component;
                }
            }
        },

        /**
         * ��ȡָ�������
         * @static
         * @param   {String}    id    �����id
         * @param   {String}    [type]  ���������(optional)
         */
        get: function(id, type) {
            if (Lang.isValue(type)) {
                if (this._componentsIdx.byType[type]) {
                    return this._componentsIdx.byType[type][id];
                }
            } else {
                return this._componentsIdx.byType[id];
            }
        }

    };

})();/**
 * @description     TBack 
  Module JavaScript.
 * @author          qingyu<qingyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-2-5  Release version.
 */

(function() {
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /** @class */   
    Tback.module.Tab = function(el, config) {
        config = Lang.merge({
            currentClass: 'selected',
            tabClass: 'J_TabTrigger',
            tabPanelClass: 'J_TabContent'
        }, config || {});
        this.handler = TB.widget.SimpleTab.decorate(el, config);
        
        /**
         * ��Tab�л���ʱ����
         * @name Tback.module.Tab#afterSwitch
         * @event
         * @param   {Number}    idx �л�����tab������ֵ
         */
        this.createEvent('afterSwitch');
        var self = this;
        this.handler.subscribeOnSwitch(function(idx) {
            self.fireEvent('afterSwitch', idx);
        });
        this.subscribe('afterSwitch', function(idx) {
            self.currentIdx = idx; 
        });
        
        //���tab��contentԪ������
        this._tabs = Dom.getElementsByClassName(config.tabClass, '*', el);
        this._contents = Dom.getElementsByClassName(config.tabPanelClass, '*', el);
        for (var i = 0, len = this._tabs.length; i < len; i++) {
            if (Dom.hasClass(this._tabs[i], 'selected')) {
                this.currentIdx = i;
                break;
            }
        }                   
    };
    Tback.module.Tab.prototype = {
        
        /** 
         * ��ǰѡ��tab������ֵ
         * @type Number 
         */
        currentIdx: null,
        
        /**
         * ��õ�ǰѡ�е�TabԪ��
         * @returns {HTMLElement}   ��ǰѡ�е�TabԪ��
         */
        getCurrentTab: function() {
            return this._tabs[this.currentIdx];
        },
        
        /**
         * ��õ�ǰѡ�е�ContentԪ��
         * @returns {HTMLElement}   ��ǰѡ�е�ContentԪ��
         */
        getCurrentContent: function() {
            return this._contents[this.currentIdx];
        },
        
        /**
         * �л���ָ����Tab
         * @param   {Number}    idx �л���Tab������ֵ
         * @returns {Tback.module.Tab}  tab������
         */
        switchTo: function(idx) {
            if (Lang.isNumber(idx)) {
                this.handler.switchTab(idx);
            }
            return this;
        }

    };
    Lang.augment(Tback.module.Tab, YAHOO.util.EventProvider);
    
    //ͨ��Classװ��ΪTab
    Tback.sys.Decorator.register('tab', function(root) {
        Dom.getElementsByClassName('J_Tab', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.Tab(el), el, 'tab');
        });
    });
})();/**
 * @description     TBack Popup Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-2-22 Release version.
 */

(function() {
          
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * ����һ��������
     * @class
     * @param {String | HTMLElement | HTMLElement[]} trigger �����������id/class/el/el����
     * @param {String | HTMLElement} popup �������id/el
     * @param {Object} [config] ����������
     * @param {String} [config.position="right"] ��������Դ���Ԫ�ص�����λ�ã���ѡֵ"left"/"right"/"top"/"bottom"
     * @param {String} [config.align="top"] ������ʹ���Ԫ�صĶ��뷽ʽ����ѡֵ"left"/"right"/"center"/"top"/"bottom"
     * @param {Boolean} [config.autoFit=true] �����򵯳�λ�ó�����Ļ��Χʱ�Ƿ�����Ӧ����Ļ��
     * @param {Number} [config.width='auto'] ������Ŀ�ȣ��粻ָ������Ϊauto
     * @param {Number} [config.height='auto'] ������ĸ߶ȣ��粻ָ������Ϊauto
     * @param {Array} [config.offset=[0,0]] ��������Դ���Ԫ�ص�ƫ��
     * @param {String} [config.eventType="click"] ���������������¼����ͣ���ѡֵ"mouse"/"click"
     * @param {Boolean} [config.disableClick=false] �Ƿ����δ���Ԫ�ص�������¼�������������¼�����Ϊ"mouse"ʱ������Ч
     * @param {Boolean} [config.hasMask=false] �Ƿ���ʾ���֣������ý���eventType='click'ʱ��Ч����һ��ҳ���ʹ��һ������
     * @param {String} [config.btnCloseClass] ����رյ������Ԫ�ص�class��Ҫ���Ԫ�ر����ڵ�������
     * @param {Number} [config.delay=0.1] ��������¼�Ϊ"mouse"ʱ����ʱ
     */ 
    Tback.module.Popup=function(trigger,popup,config){      
        trigger = Dom.get(trigger) || Dom.getElementsByClassName(trigger);
        popup = Dom.get(popup);         
        if (!trigger || !popup) return;
        
        var _this=this;
        
        Dom.setStyle(popup, 'display', 'none'); 
        
        this.trigger=trigger;
        this.popup=popup;
        
        Event.onDOMReady(function(){
            document.body.appendChild(popup);                         
        });
        
        //����Ĭ������
        var defConfig = {
            position: 'right',
            align: 'top',
            autoFit: true,
            eventType: 'click',
            delay: 0.1,
            disableClick: true,
            width: 'auto',
            height: 'auto',
            hasPosition:true
        };
        //�������
        config = Lang.merge(defConfig, config||{});
        this.config=config;
        
        //��������
        if(config.eventType=='click' && config.hasMask){
            Event.onDOMReady(function(){
                var mask = document.createElement("div");
                    mask.className = "popup-mask";
                    document.body.appendChild(mask);
                    mask.style.display = "none";
                _this.mask=mask;
            });
        }
        
        //���ùرհ�ť
        if(config.btnCloseClass){
            var btnClose=Dom.getElementsByClassName(config.btnCloseClass,'*',popup);
            Event.on(btnClose,'click',function(ev){
                Event.preventDefault(ev);
                _this.hide();
            });
        }   
        
        /**
         * ���������Ԫ��ʱִ��
         * @private
         */
        function triggerClickHandler(ev) {      
            Event.preventDefault(ev);
            _this.prevTrigger = _this.curTrigger;           
            _this.curTrigger=Event.getTarget(ev);
            //���֮ǰ������Ԫ�غ͵�ǰ����Ԫ��Ϊͬһ��Ԫ��
            if (_this.prevTrigger == _this.curTrigger) {
                popup.style.display == 'block'? _this.hide() : _this.show();
            //�������ͬһ��Ԫ��
            } else {
                _this.show();               
            }       
        }
        
        /**
         * ����ڴ���/����Ԫ����ʱִ��
         * @private
         */
        function mouseOverHandler(ev) {
            clearTimeout(_this._popupHideTimeId);
            var target=Event.getTarget(ev);
            if(popup != target  && !Dom.isAncestor(popup, target)){
                //��ȡ��������trigger
                if(_this.trigger.length){
                    for(var i=0,len=_this.trigger.length;i<len;i++){
                        if(Dom.isAncestor(_this.trigger[i],target)){
                            target=_this.trigger[i];
                            break;
                        }
                    }
                }else{
                    target=_this.trigger;
                }
                _this.preTrigger=_this.curTrigger;
                _this.curTrigger=target;
                _this._popupShowTimeId = setTimeout(function(){_this.show();}, config.delay * 1000);                    
            }           
        }

        /**
         * ����뿪����/����Ԫ��ʱִ��
         * @private
         */
        function mouseOutHandler(ev) {          
            var target = Event.getRelatedTarget(ev);
            if( _this.curTrigger != target  && !Dom.isAncestor(_this.curTrigger, target) && popup != target  && !Dom.isAncestor(popup, target)){
                clearTimeout(_this._popupShowTimeId);
                _this._popupHideTimeId = setTimeout(function(){_this.hide();}, config.delay * 1000);
            }           
        }

        if(config.eventType == 'mouse'){
            //�������δ���Ԫ�ص�������¼�
            if (config.disableClick) {
                Event.on(trigger,'click',function(ev){Event.preventDefault(ev);});
            }
            Event.on(trigger, 'mouseover', mouseOverHandler);
            Event.on(trigger, 'mouseout', mouseOutHandler);
            Event.on(popup, 'mouseover', mouseOverHandler);
            Event.on(popup, 'mouseout', mouseOutHandler);
        }else if(config.eventType == 'click'){
            Event.on(trigger, 'click', triggerClickHandler);
        }
        
        /**
         * ����������ʾʱ����
         * @name Tback.module.Popup#afterShow
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object | Array} obj.trigger ���Դ��������������Ԫ��
         * @param {Object} obj.popup ������
         * @param {Object} obj.curTrigger ��ǰ�����������Ԫ��
         */
        this.createEvent('afterShow');
        
        /**
         * ������������ʱ����
         * @name Tback.module.Popup#afterHide
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object | Array} obj.trigger ���Դ��������������Ԫ��
         * @param {Object} obj.popup ������
         * @param {Object} obj.curTrigger ��ǰ�����������Ԫ��
         */
        this.createEvent('afterHide');
    
    }
    
    Lang.augmentObject(Tback.module.Popup,{});
    
    Tback.module.Popup.prototype={
        //˽������  
        _popupHideTimeId:null,
        _popupShowTimeId:null,
        
        /** 
         * ����������Ԫ��/Ԫ������
         * @type HTMLElement | HTMLElement[]
         */
        trigger:null,
        /** 
         * ������
         * @type HTMLElement 
         */
        popup:null,
        /** 
         * ��������ʵ������ȫ������Ϣ
         * @type Object
         */
        config:null,
        /** 
         * ����
         * @type HTMLElement
         */
        mask:null,
        /** 
         * ��һ�δ���������Ĵ���Ԫ��
         * @type HTMLElement
         */
        prevTrigger:null,
        /** 
         * ��ǰ����������Ĵ���Ԫ��
         * @type HTMLElement
         */
        curTrigger:null,        
        /**
         * ��ʾ������
         */
        show:function(){
            var config=this.config;         
            var pos = Dom.getXY(this.curTrigger);
            if (Lang.isArray(this.config.offset)) {
                pos[0] += parseInt(config.offset[0]);
                pos[1] += parseInt(config.offset[1]);
            }           
            var  tw = this.curTrigger.offsetWidth, th = this.curTrigger.offsetHeight,
                pw = config.width, ph = config.height,
                dw = Dom.getViewportWidth(), dh = Dom.getViewportHeight(),
                sl = Dom.getDocumentScrollLeft(), st = Dom.getDocumentScrollTop(),
                l = pos[0], t = pos[1];
            if (this.config.position == 'left') {
                l = pos[0]-pw;
                t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;//���붨λ
            } else if (config.position == 'right') {
                l = pos[0]+tw;
                t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;//���붨λ
            } else if (config.position == 'bottom') {
                t = t+th;
                l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;//���붨λ
            } else if (config.position == 'top') {
                t = t-ph;
                l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;//���붨λ
            }
            if (t < 0) t = 0;//��ֹ����
            if (l < 0) l = 0;//��ֹ����

            if(config.autoFit) {
                if (t-st+ph > dh) {
                    t = dh-ph+st-2; /* 2px ƫ�� */
                    if (t < 0) {
                        t = 0;
                    }
                }
            }               
            this.popup.style.position = 'absolute';
            this.popup.style.top = t + 'px';
            this.popup.style.left = l + 'px';
            this.popup.style.display = 'block';
            if(config.width!='auto') this.popup.style.width=config.width+'px';
            if(config.height!='auto') this.popup.style.height=config.height+'px';       
            
            if(this.mask){
                this.mask.style.display='block';
                this.mask.style.height=Dom.getDocumentHeight()+'px';
            }
            
            this.fireEvent('afterShow',{trigger:this.trigger,popup:this.popup,curTrigger:this.curTrigger});

        },
        /**
         * ���ص�����
         */
        hide:function(){
            Dom.setStyle(this.popup, 'display', 'none');
            if(this.mask){
                this.mask.style.display='none';
            }
            this.fireEvent('afterHide',{trigger:this.trigger,popup:this.popup,curTrigger:this.curTrigger});
        }
    };
    
    Lang.augmentProto(Tback.module.Popup, Util.EventProvider);
    
    //ͨ��Classװ��ΪPopup
    Tback.sys.Decorator.register('popup', function(root) {
        Dom.getElementsByClassName('J_AutoPopupTrigger', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.Popup(el , el.getAttribute('data-target')), el, 'popup');
        });
    });
    
})();/**
 * @description     TBack Show&Hide Toggle Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-2-25 Release version.
 */

(function() {
          
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * �л�Ŀ��Ԫ�ص���ʾ������
     * @class
     * @param {String | HTMLElement} trigger ����Ԫ��
     * @param {String | HTMLElement} target �л���ʾ��Ŀ�����
     * @param {Object} [config] ����
     * @param {String[]} [config.triggerStateClass] [Ŀ�������ʾʱ����Ԫ�صĸ���class��Ŀ���������ʱ����Ԫ�ص�class]��Ŀ���������ʾ������״̬ʱ����Ԫ�صĸ���class�������л�����Ԫ�ص������չ����ʽ
     * @param {String} [config.hideType='display'] ����Ŀ�����ķ�ʽ����ѡֵ'display'/'height'�����Ϊ'display'��ʽ��������ʱ����display:none��Ϊ'height'��ʽ��������ʱ����height:0px,overflow:hidden
     */ 
    Tback.module.ShowHideToggle=function(trigger,target,config){    
    
        trigger = Dom.get(trigger);
        target = Dom.get(target);           
        if (!trigger || !target) return;
        
        var _this=this;
        
        this.trigger=trigger;
        this.target=target;     
        config = Lang.merge({triggerStateClass:null,hideType:'display'}, config||{});
        this.config=config;
        
        if(config.hideType=='display'){
            if(config.triggerStateClass){
                if(Dom.hasClass(trigger,config.triggerStateClass[1])){
                    target.style.display='none';
                }else if(Dom.hasClass(trigger,config.triggerStateClass[0])){
                    target.style.display='';    
                }
            }
            Event.on(trigger,'click',function(e){
                Event.preventDefault(e);
                target.style.display=='none'? _this.show() : _this.hide();
            }); 
        }else if(config.hideType=='height'){            
            if(config.triggerStateClass){
                if(Dom.hasClass(trigger,config.triggerStateClass[1])){
                    target.style.height='0px';  
                    target.style.overflow='hidden';
                }else if(Dom.hasClass(trigger,config.triggerStateClass[0])){
                    target.style.height='auto'; 
                }
            }   
            Event.on(trigger,'click',function(e){
                Event.preventDefault(e);
                target.style.height=='0px' ? _this.show() : _this.hide();
            });         
        }else{
            return;
        }       
                
        /**
         * ����������ʾʱ����
         * @name Tback.module.ShowHideToggle#afterShow
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object} obj.trigger ����Ԫ��
         * @param {Object} obj.target Ŀ��Ԫ��
         */
        this.createEvent('afterShow');
        
        /**
         * ����������ʾʱ����
         * @name Tback.module.ShowHideToggle#afterHide
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object} obj.trigger ����Ԫ��
         * @param {Object} obj.target Ŀ��Ԫ��
         */
        this.createEvent('afterHide');
    
    }
    
    Lang.augmentObject(Tback.module.ShowHideToggle,{});
    
    Tback.module.ShowHideToggle.prototype={
        /** 
         * ����Ԫ��
         * @type HTMLElement
         */
        trigger:null,
        /** 
         * Ŀ��Ԫ��
         * @type HTMLElement 
         */
        target:null,    
        /** 
         * ����
         * @type Object 
         */
        config:null,    
        /**
         * ��ʾĿ��Ԫ��
         */
        show:function(){
            if(this.config.hideType=='display'){
                this.target.style.display='';
            }else if(this.config.hideType=='height'){
                this.target.style.height='auto';
            }
            if(this.config.triggerStateClass){
                Dom.replaceClass(this.trigger,this.config.triggerStateClass[1],this.config.triggerStateClass[0]);
            }
            this.fireEvent('afterShow',{trigger:this.trigger,target:this.target});
        },
        /**
         * ����Ŀ��Ԫ��
         */
        hide:function(){
            if(this.config.hideType=='display'){
                this.target.style.display='none';
            }else if(this.config.hideType=='height'){
                this.target.style.height='0px';
                this.target.style.overflow='hidden';
            }
            if(this.config.triggerStateClass){
                Dom.replaceClass(this.trigger,this.config.triggerStateClass[0],this.config.triggerStateClass[1]);
            }
            this.fireEvent('afterHide',{trigger:this.trigger,target:this.target});
        } 
    };
    
    Lang.augmentProto(Tback.module.ShowHideToggle, Util.EventProvider);
    
    //ͨ��Classװ��ΪShowHideToggle
    Tback.sys.Decorator.register('showHideToggle', function(root) {
        Dom.getElementsByClassName('J_AutoShowHideToggleTrigger', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.ShowHideToggle(el , el.getAttribute('data-target')), el, 'showHideToggle');
        });
    });

    //ͨ��Classװ��ΪShowHideToggle�ĺ���(box)
    Tback.sys.Decorator.register('showHideToggleBox', function(root) {
        Dom.getElementsByClassName('J_AutoBox', '*', root).forEach(function(el) {
            var trigger=Dom.getElementsByClassName('J_TriggerFoldBox','*',el)[0];
            var target=Dom.getElementsByClassName('J_BoxBd','*',el)[0];
            Tback.sys.ComponentManager.add(new Tback.module.ShowHideToggle(trigger,target,{triggerStateClass:['op-fold','op-unfold'],hideType:'height'}), el, 'showHideToggle');
        });
    });
    
    //ͨ��Classװ��ΪShowHideToggle�������(right_panel)
    Tback.sys.Decorator.register('rightPanel', function(root) {
        Dom.getElementsByClassName('J_AutoRightPanel', '*', root).forEach(function(el) {
            var trigger=Dom.getElementsByClassName('J_RightPanelHd','*',el)[0];
            var target=Dom.getElementsByClassName('J_RightPanelBd','*',el)[0];
            Tback.sys.ComponentManager.add(new Tback.module.ShowHideToggle(trigger,target,{triggerStateClass:['fold','unfold']}), el, 'showHideToggle');
        });
    });
})();/**
 * @description     TBack Accordion Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-2-26 Release version.
 */

(function() {
          
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * �ַ���
     * @class
     * @param {String | HTMLElement} container ������������
     * @param {Object} [config] ����
     * @param {String} [config.toggleClass='J_Toggle'] ����Ԫ�ص�class��ע�⣺����Ԫ�ز�������������margin����Ϊ����margin��̮�������������
     * @param {String} [config.toggleSelectedClass='selected'] ����Ԫ��ѡ��״̬ʱ�ĸ���class
     * @param {String} [config.detailClass='J_Detail'] ��Ӧ�����Ԫ�ص�class��ע�⣺���Ԫ�ز�������������margin����Ϊ����margin��̮�������������
     * @param {Number} [config.containerHeight] ����������css��height���Ե���ֵ����
     * @param {Boolean} [config.fixDetailHeight=false] �Ƿ�̶����չ��ʱ�ĸ߶ȣ���ѡ��ֻ����������config.containerHeight������ͨ������style���Ը������趨�˸߶�ʱ����Ч 
     * @param {Boolean} [config.alowMultiDetailExpand=false] �Ƿ�����ͬʱչ��������
     */ 
    Tback.module.Accordion=function(container,config){  
        container=Dom.get(container);
        if(!container) return;  
        
        var _this=this;
        
        var defConfig={
            toggleClass:'J_Toggle',
            toggleSelectedClass:'selected',
            detailClass:'J_Detail',
            fixDetailHeight:false,
            alowMultiExpand:false
        }
        config=Lang.merge(defConfig,config || {});
        
        this.container=container;
        this.config=config;     
        
        //��ʼ�������������Ϣ
        this.initSetting(); 
        
        //Ϊ֧��������ݶ�̬���أ��������ʹ���¼�����
        Event.on(container, 'click', function(e) {
            var target=Event.getTarget(e);          
            var toggle=null;
            if(Dom.hasClass(target,config.toggleClass)){
                toggle=target;
            }else if(Dom.getAncestorByClassName(target,config.toggleClass)){
                toggle=Dom.getAncestorByClassName(target,config.toggleClass);           
            }
            //��������������Ĵ���Ԫ��
            if(toggle){
                Event.preventDefault(e);
                _this.switchTo(toggle.getAttribute('data-idx'));
            }           
        });
        
        /**
         * ����ʾĳ�����ʱ����
         * @name Tback.module.Accordion#afterSwitch
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement} obj.container �����������
         * @param {HTMLElement[]} obj.toggleArr ����Ԫ�ض�������
         * @param {HTMLElement[]} obj.detailArr ���Ԫ������
         * @param {Number} obj.idx ������������������
         */
        this.createEvent('afterSwitch');            
    
    }
    
    Lang.augmentObject(Tback.module.Accordion,{
        /**
         * ����Ԫ�ظ߶�ƫ��ֵ��border+padding��
         * @static
         * @param {HTMLElement} el
         * @return {Number}
         */
        getHeightOffset:function(el) {
            return (parseInt(Dom.getStyle(el, 'borderTopWidth'), 10) || 0)
                 + (parseInt(Dom.getStyle(el, 'borderBottomWidth'), 10) || 0)
                 + (parseInt(Dom.getStyle(el, 'paddingTop'), 10) || 0)
                 + (parseInt(Dom.getStyle(el, 'paddingBottom'), 10) || 0);
        }
    });
    
    var Acc=Tback.module.Accordion;
    
    Tback.module.Accordion.prototype={
        /** 
         * ������������
         * @type HTMLElement
         */
        container:null,
        /** 
         * �������
         * @type Object
         */
        config:null,        
        /** 
         * ����Ԫ������
         * @type HTMLElement[]
         */
        toggleArr:null,
        /** 
         * ���Ԫ������
         * @type HTMLElement[]
         */
        detailArr:null,
        /** 
         * ���չ����css�߶�����
         * @type String
         */
        detailHeight:'auto',
        /** 
         * ��һ�δ����л����Ĵ���Ԫ������
         * @type Number
         */
        preToggleIdx:-1,
        /** 
         * ��ǰ�����л����Ĵ���Ԫ������
         * @type Number
         */
        curToggleIdx:-1,
        /**
         * ��ʼ������������Ϣ�����������ʱ�ᱻ�Զ�����һ�Ρ��������dom�ṹ�����仯�������������߼����˴���Ԫ��/����ʱ�����ֶ�ִ��һ�δ˷����Ը�����������Ϣ��
         */
        initSetting:function(){
            //��ȡ����Ԫ�غ����Ԫ������
            this.toggleArr=Dom.getElementsByClassName(this.config.toggleClass,'*',this.container);
            this.detailArr=Dom.getElementsByClassName(this.config.detailClass,'*',this.container);
            
            //���������ĸ߶�
            if(this.config.containerHeight){                
                this.container.style.height=this.config.containerHeight+'px';
            }   
            
            //��������������߶ȣ��������˹̶����߶ȣ���������չ���߶�
            if(parseInt(this.container.style.height, 10) > 0 && this.config.fixDetailHeight){                   
                this.container.style.overflow='auto';
                var containerHeight=parseInt(this.container.style.height, 10);
                this.detailHeight=(containerHeight-this.toggleArr[0].offsetHeight*this.toggleArr.length-Acc.getHeightOffset(this.detailArr[0]))+'px';
            }
            
            this.preToggleIdx=-1;
            this.curToggleIdx=-1;
            
            //������Ԫ������������ͬʱ��ʼ�������ʾ
            for(var i=0;i<this.toggleArr.length;i++){
                this.toggleArr[i].setAttribute('data-idx',i);
                this.detailArr[i].style.display='none';
                if(this.detailHeight!='auto'){this.detailArr[i].style.height=this.detailHeight;}                
                if(Dom.hasClass(this.toggleArr[i],this.config.toggleSelectedClass)){
                    //�������Ƴ����ѡ�е�class����Ϊ��switchTo�����У�����չ�����ʱ������ݴ���Ԫ���Ƿ���б�ѡ�е�class��������������չ����壬�粻�Ƴ���᲻��ʾԭ������ʾ�����
                    Dom.removeClass(this.toggleArr[i],this.config.toggleSelectedClass);
                    this.switchTo(i);                   
                }
            }   

            //��������ͬʱչ�������壬��û�����ô���Ԫ��ӵ��this.config.toggleSelectedClass����Ĭ��չ����һ�����
            if(this.curToggleIdx<0 && !this.config.alowMultiDetailExpand){
                this.switchTo(0);
            }
        },
        /**
         * ��ʾָ��������Ӧ�����
         * @param {Number} toggleIdx Ҫ��ʾ����������
         */
        switchTo:function(toggleIdx){
            
            this.preToggleIdx=this.curToggleIdx;
            this.curToggleIdx=toggleIdx;
            
            var toggle=this.toggleArr[toggleIdx];
            var detail=this.detailArr[toggleIdx];
            
            if(this.config.alowMultiDetailExpand){
                if(Dom.hasClass(toggle,this.config.toggleSelectedClass)){
                    detail.style.display='none';
                    Dom.removeClass(toggle,this.config.toggleSelectedClass);
                }else{
                    detail.style.display='block';
                    Dom.addClass(toggle,this.config.toggleSelectedClass);                   
                }
            }else{
                if(this.preToggleIdx>=0 && this.toggleArr[this.preToggleIdx]!=toggle){
                    this.detailArr[this.preToggleIdx].style.display='none';
                    Dom.removeClass(this.toggleArr[this.preToggleIdx],this.config.toggleSelectedClass); 
                    detail.style.display='block';
                    Dom.addClass(toggle,this.config.toggleSelectedClass);   
                }   
                detail.style.display='block';
                Dom.addClass(toggle,this.config.toggleSelectedClass);   
            }   
            
            this.fireEvent('afterSwitch',{container:this.container,toggleArr:this.toggleArr,detailArr:this.detailArr,idx:toggleIdx});
            
        }
    };
    
    Lang.augmentProto(Tback.module.Accordion,Util.EventProvider);
    
    //ͨ��Classװ��ΪShowHideToggle
    Tback.sys.Decorator.register('accordion', function(root) {
        Dom.getElementsByClassName('J_AutoAccordion', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.Accordion(el), el, 'accordion');
        });
    });


})();/**
 * @description     TBack Bottom Panel Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-3-1  Release version.
 */

(function() {
          
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * �л�Ŀ��Ԫ�ص���ʾ������
     * @class
     * @param {String | HTMLElement} container �ײ�������������/id(ע�⣺�ײ����һ��ҳ��ֻ������һ��)
     * @param {Object} [config] ����
     * @param {String} [config.triggerMinClass="J_TriggerMinimize"] ��С�����Ĵ���Ԫ��class
     * @param {String} [config.triggerRestoreClass="J_TriggerRestore"] ��ԭ���Ĵ���Ԫ��class
     * @param {String} [config.triggerMaxClass="J_TriggerMaximize"] ������Ĵ���Ԫ��class
     * @param {String} [config.panelClass="J_BottomPanelBd"] Ҫ�л���ʾ�����class,��Ԫ�ؽ�������һ��
     * @param {Number} [config.panelRestoreHeight=150] ����ڻ�ԭ״̬ʱ���õ�css�߶�
     * @param {String} [config.initState="restore"] ����ʼ��ʱ����ʵ״̬����ѡֵ"min"/"restore"/"max"
     */ 
    Tback.module.BottomPanel=function(container,config){        
        var _this=this;
        
        var container=Dom.get(container);
        if(!container) return;
                
        this._originBodyPaddingBottom = parseInt(Dom.getStyle(document.body, 'paddingBottom'), 10) || 0;
        this.container=container;
        container.style.width=(Dom.get("page").offsetWidth-2)+'px';
        
        var defConfig={
            triggerMinClass:'J_TriggerMinimize',
            triggerRestoreClass:'J_TriggerRestore',
            triggerMaxClass:'J_TriggerMaximize',
            panelClass:'J_BottomPanelBd',
            panelRestoreHeight:150,
            initState:'restore'
        }
        
        //��¼���ʼ��config.initStateֵ
        if(config){
            var configInitState=config.initState;
        }else{
            var configInitState=null;
        }       
        
        config = Lang.merge(defConfig, config||{});
        this.config=config;
        
        this.triggerMin=Dom.getElementsByClassName(config.triggerMinClass,null,container);
        this.triggerRestore=Dom.getElementsByClassName(config.triggerRestoreClass,null,container);
        this.triggerMax=Dom.getElementsByClassName(config.triggerMaxClass,null,container);
        this.panel=Dom.getElementsByClassName(config.panelClass,null,container)[0];
        this.panel.style.overflow='auto';
        
        //�����panel��������display='none'��Ҳ������Ĭ����С����config.initState��������display����
        if(this.panel.style.display=='none' && !configInitState){
            config.initState='min'; 
        }
        this.curPanelState=config.initState;
        
        
        //��ʼ�������ʾ״̬
        switch(_this.curPanelState) {
            case 'min':
                _this.minimize();
                break;
            case 'max':
                _this.maximize();
                break;
            default:
                _this.restore();
                break;
        }       
        
        Event.on(this.triggerMin,'click',function(e){Event.preventDefault(e);_this.minimize();});
        Event.on(this.triggerRestore,'click',function(e){Event.preventDefault(e);_this.restore();});
        Event.on(this.triggerMax,'click',function(e){Event.preventDefault(e);_this.maximize();});
        //ע���ݼ�
        Event.on(document, 'keyup', function(e) {
            if (e.shiftKey && e.keyCode == 70) {
                Event.preventDefault(e);                
                switch(_this.curPanelState) {
                    case 'max':
                        _this.minimize();
                        break;
                    case 'restore':
                        _this.maximize();
                        break;
                    default:
                        _this.restore();
                        break;
                }
            }
        });     
        
        /**
         * �������С��ʱ�������¼�
         * @name Tback.module.BottomPanel#afterMinimize
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object} obj.container �ײ�������������
         * @param {Object} obj.panel ������
         */
        this.createEvent('afterMinimize');
        /**
         * ����廹ԭʱ�������¼�
         * @name Tback.module.BottomPanel#afterRestore
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object} obj.container �ײ�������������
         * @param {Object} obj.panel ������
         */
        this.createEvent('afterRestore');
        /**
         * ��������ʱ�������¼�
         * @name Tback.module.BottomPanel#afterMaximize
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object} obj.container �ײ�������������
         * @param {Object} obj.panel ������
         */
         this.createEvent('afterMaximize');
    }
    
    Lang.augmentObject(Tback.module.BottomPanel,{});
    
    Tback.module.BottomPanel.prototype={
        /** 
         * body�ĳ�ʼpadding-bottom��ֵ
         * @private
         * @type Number
         */
        _originBoddyPaddingBottom:0,
        /**
         * ������岻ͬ����ʵ״̬����body��padding-bottomֵ���Ա�������״̬�£�body�����ݶ���ȫ������ʾ
         * @private
         */
        _ajustBodyPaddingBottom:function(){                
            document.body.style.paddingBottom = this._originBodyPaddingBottom + this.container.offsetHeight + 'px';
        },
        /** 
         * �ײ���������Ԫ��
         * @type HTMLElement
         */
        container:null,
        /** 
         * ����
         * @type Object
         */
        config:null,
        /** 
         * ���������С����Ԫ��
         * @type HTMLElement | HTMLElement[]
         */
        triggerMin:null,
        /** 
         * ������廹ԭ��Ԫ��
         * @type HTMLElement | HTMLElement[]
         */
        triggerRestore:null,
        /** 
         * ���������󻯵�Ԫ��
         * @type HTMLElement | HTMLElement[]
         */
        triggerMax:null,
        /** 
         * ���
         * @type HTMLElement
         */
        panel:null,
        /** 
         * ��ǰ������ʾ״̬
         * @type String
         */
        curPanelState:null,
        /**
         * ��С�����
         */
        minimize:function(){
            this.panel.style.display='none';
            this._ajustBodyPaddingBottom();
            this.fireEvent('afterMinimize',{container:this.container,panel:this.panel});
            this.curPanelState='min';
        },
        /**
         * ��ԭ���
         */
        restore:function(){
            this.panel.style.display='';
            this.panel.style.height=this.config.panelRestoreHeight+'px';
            this._ajustBodyPaddingBottom();
            this.fireEvent('afterRestore',{container:this.container,panel:this.panel});
            this.curPanelState='restore';
        },
        /**
         * ������
         */
        maximize:function(){
            this.panel.style.display='';
            var h = document.documentElement.clientHeight - 100;
                if (h < 0) {
                    h = 0;
                }
            this.panel.style.height=h+'px';
            this._ajustBodyPaddingBottom();
            this.fireEvent('afterMaximize',{container:this.container,panel:this.panel});
            this.curPanelState='max';
        }       
    };
    
    Lang.augmentProto(Tback.module.BottomPanel, Util.EventProvider);
    
    //ͨ��ָ������idװ��ΪbottomPanel
    
    Tback.sys.Decorator.register('bottomPanel', function(root) {
        if(Dom.get('J_AutoBottomPanel')) Tback.sys.ComponentManager.add(new Tback.module.BottomPanel('J_AutoBottomPanel'),Dom.get('J_AutoBottomPanel'),'bottomPanel');                                   
    });
    
})();/**
 * @description     TBack Adaptive Iframe Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-3-2  Release version.
 */

(function() {         
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    //����domain
    /*if(location.hostname){
        document.domain=(function(){
            var temp=location.hostname.split('.');
            var len=temp.length;
            var deep=arguments[0] || 2; 
            if(deep>len) deep=len;
            return temp.slice(len-deep).join('.');      
        })();
    }*/
    
    /**
     * iframe����Ӧ�ľ�̬����
     * �ú�������iframe������ط�����
     * @static
     * @param {String} id ��ҳ���У���iframe��ǩ��idֵ
     * @param {Boolean} ifReapeatUpdate=false �Ƿ�ÿ��200�����ظ��趨iframe�ĸ߶�
     */
    Tback.module.AdaptiveIframe=function(id,ifReapeatUpdate){
        Event.onDOMReady(function(){
            var p=window.parent;
            var targetIframe=p.document.getElementById(id);
            if(!targetIframe) return;
            if(ifReapeatUpdate){
                setInterval(function(){targetIframe.height=Dom.getDocumentHeight()},200)
            }else{
                targetIframe.height=Dom.getDocumentHeight();
            }           
        });
    };
    
})();/**
 * @description     TBack Select Card JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-2-26 Release version.
 */

(function() {
          
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /**
     * ѡ�����Դ������ѡ��Ԫ�ط��õ�ָ��Ŀ��������
     * @class
     * @param {String | HTMLElement} container ���������
     * @param {Object} [config] ����
     * @param {String} [config.sourceBoxClass='source-box'] ʢ�ſ�ѡ�������class����������һ����
     * @param {String} [config.targetBoxClass='target-box'] ����ѡ��Ԫ�ص�Ŀ������class����������һ����
     * @param {String} [config.itemClass='item'] ��ѡ���class
     * @param {String} [config.itemSelectedClass='selected'] ��ѡ�ѡ��״̬��class
     * @param {String} [config.addItemsTriggerClass='add-item'] �����ѡ�п�ѡ��Ĵ���Ԫ��class
     * @param {String} [config.removeItemsTriggerClass='remove-item'] �Ƴ���ѡ�п�ѡ��Ĵ���Ԫ��class
     * @param {Boolean} [config.enableMultiSelect=false] �Ƿ�����ѡ����һ�����
     * @param {Boolean} [config.enableRepeatableAdd=true] �Ƿ����������ĳ����ѡ��
     * @param {Boolean} [config.enableMoveItemByDblclick=true] �Ƿ�����ͨ��˫�������/�Ƴ���ѡ��
     */
    Tback.module.SelectCard=function(container,config){
        container=Dom.get(container);
        var defConfig={
            sourceBoxClass: 'source-box',
            itemClass: 'item',
            itemSelectedClass: 'selected',
            targetBoxClass: 'target-box',
            addItemsTriggerClass: 'add-item',
            removeItemsTriggerClass: 'remove-item',
            enableMultiSelect: false,
            enableRepeatableAdd: true,
            enableMoveItemByDblclick: true
        }
        config=Lang.merge(defConfig,config || {});
        
        var _this=this;
        
        this.container=container;
        this.config=config;
        this.sourceBox = Dom.getElementsByClassName(config.sourceBoxClass, '*', container)[0];
        this.targetBox = Dom.getElementsByClassName(config.targetBoxClass, '*', container)[0];
        this.addItemsTrigger = Dom.getElementsByClassName(config.addItemsTriggerClass, '*', container);
        this.removeItemsTrigger = Dom.getElementsByClassName(config.removeItemsTriggerClass, '*', container);
        
        /**
         * �����¼�
         * @private
         */
        function clickHandler(e){
            var t = Event.getTarget(e);
            //����ǵ����Ŀ�ѡ��
            if(SelectCard._checkItemByClass(t,_this.config.itemClass)){
                var el = SelectCard._getItemByClass(t,_this.config.itemClass);
                if (Dom.hasClass(el,_this.config.itemSelectedClass)) {
                    Dom.removeClass(el,_this.config.itemSelectedClass);
                } else {
                    if (_this.config.enableMultiSelect) {
                        if (Dom.isAncestor(_this.sourceBox, el)) {
                            _this._clearItemsSelectedState(_this.targetBox);
                        }else {
                            _this._clearItemsSelectedState(_this.sourceBox);
                        }
                    } else {
                        _this._clearItemsSelectedState();
                    }
                    Dom.addClass(el, _this.config.itemSelectedClass);
                }       
                var itemsSelectedInSourceBox=_this._getSelectedItems(_this.sourceBox);
                if(itemsSelectedInSourceBox && itemsSelectedInSourceBox.length>0){
                    _this.fireEvent('afterEnableAddItemsTrigger',{'addItemsTrigger':_this.addItemsTrigger});
                }else{
                    _this.fireEvent('afterDisableAddItemsTrigger',{'addItemsTrigger':_this.addItemsTrigger});
                }
                var itemsSelectedInTargetBox=_this._getSelectedItems(_this.targetBox);
                if(itemsSelectedInTargetBox && itemsSelectedInTargetBox.length>0){
                    _this.fireEvent('afterEnableRemoveItemsTrigger',{'removeItemsTrigger':_this.removeItemsTrigger});
                }else{
                    _this.fireEvent('afterDisableRemoveItemsTrigger',{'removeItemsTrigger':_this.removeItemsTrigger});
                }
            //����ǵ�����Ӱ�ť
            }else if(SelectCard._checkItemByClass(t,config.addItemsTriggerClass)){
                var itemArr=_this._getSelectedItems(_this.sourceBox);
                if(!itemArr) return;
                _this.addItems(itemArr);
            //����ǵ����Ƴ���ť
            }else if(SelectCard._checkItemByClass(t,config.removeItemsTriggerClass)){
                var itemArr=_this._getSelectedItems(_this.targetBox);
                if(!itemArr) return;
                _this.removeItems(itemArr);
            }
        }
        Event.on(container, 'click', clickHandler);
        
        //�������˫������
        if (config.enableMoveItemByDblclick) {
            /**
             * ˫���¼����
             * @private
             */
            function dblclickHandler(e){
                var t = Event.getTarget(e);
                //���˫�����ǿ�ѡ��Ԫ��
                if (SelectCard._checkItemByClass(t,config.itemClass)) {
                    var el = SelectCard._getItemByClass(t,config.itemClass);
                    //��Ӳ���
                    if(Dom.isAncestor(_this.sourceBox, el)){
                        _this.addItems(el);
                    //�Ƴ�����
                    }else if(Dom.isAncestor(_this.targetBox, el)){
                        _this.removeItems(el);
                    }
                }
            }
            Event.on(container, 'dblclick', dblclickHandler);
        }
        
        /**
         * ��Ӱ�ť����ʱ����
         * @name Tback.module.SelectCard#afterEnableAddItemsTrigger
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement | HTMLElement[]} obj.addItemsTrigger ��Ӱ�ť
         * @param {HTMLElement} obj.container ������
         */
        this.createEvent('afterEnableAddItemsTrigger');
        /**
         * ��Ӱ�ťʧ��ʱ����
         * @name Tback.module.SelectCard#afterDisableAddItemsTrigger
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement | HTMLElement[]} obj.addItemsTrigger ��Ӱ�ť
         * @param {HTMLElement} obj.container ������
         */
        this.createEvent('afterDisableAddItemsTrigger');
        /**
         * �Ƴ���ť����ʱ����
         * @name Tback.module.SelectCard#afterEnableRemoveItemsTrigger
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement | HTMLElement[]} obj.removeItemsTrigger ��Ӱ�ť
         * @param {HTMLElement} obj.container ������
         */
        this.createEvent('afterEnableRemoveItemsTrigger');
        /**
         * �Ƴ���ťʧ��ʱ����
         * @name Tback.module.SelectCard#afterDisableRemoveItemsTrigger
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement | HTMLElement[]} obj.removeItemsTrigger ��Ӱ�ť
         * @param {HTMLElement} obj.container ������
         */
        this.createEvent('afterDisableRemoveItemsTrigger');
        
        /**
         * ��ӿ�ѡ��ǰ����
         * @name Tback.module.SelectCard#beforeAddItems
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement | HTMLElement[]} obj.items �������Ŀ�ѡ��
         * @param {HTMLElement} obj.container ������
         * @param {HTMLElement} obj.sourceBox Դ����
         * @param {HTMLElement} obj.targetBox Ŀ������
         */
        this.createEvent('beforeAddItems');
        /**
         * ��ӿ�ѡ��󴥷�
         * @name Tback.module.SelectCard#afterAddItems
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement | HTMLElement[]} obj.items �������Ŀ�ѡ��
         * @param {HTMLElement} obj.container ������
         * @param {HTMLElement} obj.sourceBox Դ����
         * @param {HTMLElement} obj.targetBox Ŀ������
         */
        this.createEvent('afterAddItems');
        /**
         * �Ƴ���ѡ��ǰ����
         * @name Tback.module.SelectCard#beforeRemoveItems
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement | HTMLElement[]} obj.items �������Ŀ�ѡ��
         * @param {HTMLElement} obj.container ������
         * @param {HTMLElement} obj.sourceBox Դ����
         * @param {HTMLElement} obj.targetBox Ŀ������
         */
        this.createEvent('beforeRemoveItems');
        /**
         * �Ƴ���ѡ��󴥷�
         * @name Tback.module.SelectCard#afterRemoveItems
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {HTMLElement | HTMLElement[]} obj.items �������Ŀ�ѡ��
         * @param {HTMLElement} obj.container ������
         * @param {HTMLElement} obj.sourceBox Դ����
         * @param {HTMLElement} obj.targetBox Ŀ������
         */
        this.createEvent('afterRemoveItems');
        
        this.subscribe('afterEnableAddItemsTrigger',function(o){Dom.addClass(o.addItemsTrigger,'enable')});
        this.subscribe('afterDisableAddItemsTrigger',function(o){Dom.removeClass(o.addItemsTrigger,'enable')});
        this.subscribe('afterEnableRemoveItemsTrigger',function(o){Dom.addClass(o.removeItemsTrigger,'enable')});
        this.subscribe('afterDisableRemoveItemsTrigger',function(o){Dom.removeClass(o.removeItemsTrigger,'enable')})
    }
    
    Lang.augmentObject(Tback.module.SelectCard,{
        /**
         * ���ָ�������Ƿ�ӵ��ָ��class������ӵ��ָ��class�ĸ�������
         * @private
         * @params {HTMLElement} t ָ������
         * @params {String} className ָ��class
         * @returns {Boolean} �����ж����
         */
        _checkItemByClass:function(t,className){return Dom.hasClass(t, className) || Dom.getAncestorByClassName(t, className)},
        /**
         * ���ָ���������ָ��class���򷵻�ָ�����󣬷��򷵻�ָ���������ָ��class�ĸ���Ԫ��
         * @private
         * @params {HTMLElement} t ָ������
         * @params {String} className ָ��class
         * @returns {HTMLElement} ���ָ���������ָ��class���򷵻�ָ�����󣬷��򷵻�ָ���������ָ��class�ĸ���Ԫ��
         */
        _getItemByClass:function(t,className){return Dom.hasClass(t, className) ? t : Dom.getAncestorByClassName(t, className)}
    });
    
    var SelectCard=Tback.module.SelectCard;
    
    Tback.module.SelectCard.prototype={
        /**
         *
         */
        _curSelectedItems:[],   
        /**
         * ��ȡָ�������б�ѡ�еĿ�ѡ��
         * @private
         * @params {HTMLElement} box ָ��Ҫ��ȡ�ĸ�������ѡ�еĿ�ѡ��
         * @returns {HTMLElement[]} ����ָ�������ڱ�ѡ�еĿ�ѡ��Ԫ������
         */ 
        _getSelectedItems:function(box){
            var _this=this;
            return Dom.getElementsBy(function(el){return (Dom.hasClass(el, _this.config.itemClass) && Dom.hasClass(el,_this.config.itemSelectedClass));}, '*', box);
        },
        /**
         * ������п�ѡ���ѡ��״̬
         * @private
         * @params {HTMLElement} box=this.container ָ��Ҫ����ĸ������ڵĿ�ѡ���ѡ��״̬
         */
        _clearItemsSelectedState:function(box){
            box=box || this.container;          
            var allItems=Dom.getElementsByClassName(this.config.itemClass,'*',box);
            Dom.removeClass(allItems,this.config.itemSelectedClass);    
            this.fireEvent('afterDisableAddItemsTrigger',{'addItemsTrigger':this.addItemsTrigger});
            this.fireEvent('afterDisableRemoveItemsTrigger',{'removeItemsTrigger':this.removeItemsTrigger});
        },
        /**
         * ����
         * @type HTMLElement
         */
        container:null,  
        /**
         * ����
         * @type Object
         */
        config:null,
        /**
         * Դ����
         * @type HTMLElement
         */
        sourceBox:null,
        /**
         * Ŀ������
         * @type HTMLElement
         */
        targetBox:null,
        /**
         * ��Ӱ�ť
         * @type HTMLElement[]
         */
        addItemsTrigger:null,
        /**
         * �Ƴ���ť
         * @type HTMLElement[]
         */
        removeItemsTrigger:null,
        /**
         * ��Դ�����ĵ���ָ��������뵽Ŀ������
         * @private
         * @params {HTMLElement} el Դ������Ҫ��ӵ�Ŀ�������Ķ���
         */
        _addItem:function(el){
            //��������ظ����
            if(this.config.enableRepeatableAdd){
                var newEl=el.cloneNode(true);
                this.targetBox.appendChild(newEl);
            //����������ظ����
            }else{
                this.targetBox.appendChild(el);
            }   
        },
        /**
         * ��Դ������ָ��������뵽Ŀ������
         * @params {HTMLElement | HTMLElement[]} items Ҫ��ӵ�Ŀ�������Ķ�����������
         */
        addItems:function(items){   
            this.fireEvent('beforeAddItems',{'items':items,'container':this.container,'sourceBox':this.sourceBox,'targetBox':this.targetBox});
            Dom.batch(items,this._addItem,this,true);       
            this._clearItemsSelectedState();
            this.fireEvent('afterAddItems',{'items':items,'container':this.container,'sourceBox':this.sourceBox,'targetBox':this.targetBox});
        },
        /**
         * ��Ŀ�������ĵ���ָ�������Ƴ�
         * @private
         * @params {HTMLElement} el Ŀ��������Ҫ�Ƴ��Ķ���
         */
        _removeItem:function(el){
            //��������ظ����
            if(this.config.enableRepeatableAdd){
                el.parentNode.removeChild(el);
            //����������ظ����
            }else{
                this.sourceBox.appendChild(el);
            }   
        },
        /**
         * �Ƴ�Ŀ��������ָ������
         * @params {HTMLElement | HTMLElement[]} items Ŀ��������Ҫ�Ƴ��Ķ�����Ϸ�Ǹ�����
         */
        removeItems:function(items){
            this.fireEvent('beforeRemoveItems',{'items':items,'container':this.container,'sourceBox':this.sourceBox,'targetBox':this.targetBox});
            Dom.batch(items,this._removeItem,this,true);
            this._clearItemsSelectedState();
            this.fireEvent('afterRemoveItems',{'items':items,'container':this.container,'sourceBox':this.sourceBox,'targetBox':this.targetBox});
        },
        /**
         * ���Ŀ����������ӵ�item
         * @returns {HTMLElement[]} ����Ŀ����������ӵ�item��ɵ�����
         */
        getTargetItems:function(){
            return Dom.getElementsByClassName(this.config.itemClass,'*',this.targetBox);
        }
    }
    
    Lang.augmentProto(Tback.module.SelectCard,Util.EventProvider);
    
    //ͨ��Classװ��ΪSelectCard
    Tback.sys.Decorator.register('selectCard', function(root) {
        Dom.getElementsByClassName('J_AutoSelectCard', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.SelectCard(el), el, 'selectCard');
        });
    });
    
    
})();/**
 * @description     TBack Calendar Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event, YAHOO.widget.Calendar.
 * changelog        Ver 0.9 @ 2010-3-7  Release version.
 */

(function() {
          
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    //����Ƿ���ع���������ʽ
    var loadStyle=false;

    /**
     * ����
     * @class
     * @param {String} [calId] ������id
     * @param {String | HTMLElement} [calBox] ��������������
     * @param {String | HTMLElement | HTMLElement[]} [inputTrigger] ��������������input���󡢶����������id���粻���ô˲���
     */
    Tback.module.Calendar=function(calId,calBox,inputTrigger){
        if(!YAHOO.widget.Calendar){
            alert('��������½ű���֧��������������У�\n<script src="http://a.tbcdn.cn/yui/2.7.0/build/calendar/calendar-min.js"></script>');
            return;
        }
        var _this=this;

        // ��������
        if(calBox){
            calBox=Dom.get(calBox);
        }else{
            calBox = document.createElement('div');
            calBox.style.zIndex='100';
            Event.onDOMReady(function(){document.body.appendChild(calBox);});
        }

        if(!loadStyle){
            // ��̬��������css
            YAHOO.util.Get.css(TB.env.yuipath + 'build/calendar/assets/calendar.css');
            //��չ��CSS, Copy��tbra��SimpleCalendar
            var EXTRA_CSS = [
            '.yui-calcontainer { display: none; z-index: 9999; }',
            '.yui-calendar {font-family: verdana !important;}',
            '.yui-calendar td.calcell.previous {text-decoration: line-through;}',
            '.yui-calendar td.calcell.oom a {color: #ccc !important;}',
            '.yui-calendar select.calyearselector, .yui-calendar select.calmonthselector {height: 18px; line-height: 18px; font-size: 11px; font-family: verdana;}',
            '.yui-calcontainer .yui-cal-nav, .yui-calcontainer .yui-cal-nav-b button {font-size: 100% !important;}',
            '.yui-calendar tfoot td {padding-top: 3px;}'
            ];
            TB.dom.addCSS(EXTRA_CSS.join(''));
            loadStyle=true;
        }

        Tback.module.Calendar.superclass.constructor.call(this,calId,calBox);

        //����������Ϊ������ʾ
        this.cfg.setProperty('MY_YEAR_POSITION', 1);
        this.cfg.setProperty('MY_MONTH_POSITION', 2);
        this.cfg.setProperty('MONTHS_LONG',    ['1\u6708', '2\u6708', '3\u6708', '4\u6708', '5\u6708', '6\u6708', '7\u6708', '8\u6708', '9\u6708', '10\u6708', '11\u6708', '12\u6708']);
        this.cfg.setProperty('WEEKDAYS_SHORT', ['\u65e5', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d']);
        this.cfg.setProperty('MY_LABEL_YEAR_POSITION',  1);
        this.cfg.setProperty('MY_LABEL_YEAR_SUFFIX',  '\u5E74');

        this.renderEvent.subscribe(function(){
            // renderEvent�а�������ѡ�����µ��¼���Copy��tbra��SimpleCalendar
            var pd = this.cfg.getProperty(YAHOO.widget.Calendar._DEFAULT_CONFIG.PAGEDATE.key);
            //����ʱ�䷶Χʱ����ǰ�󵼺�
            var pdy = pd.getFullYear(), pdm = pd.getMonth();
            if (pdy == this.maxYear && pdm == 11 && this.linkRight ) {
                Dom.setStyle(this.linkRight, 'display', 'none');
            } else if (pdy == this.minYear && pdm == 0 && this.linkLeft) {
                Dom.setStyle(this.linkLeft, 'display', 'none');
            }
            var sels = this.oDomContainer.getElementsByTagName('select');
            Event.on(sels[0], 'change', function(ev, cal) {
                cal.setYear(this.value);
                cal.render();
            },this);
            Event.on(sels[1], 'change', function(ev, cal) {
                cal.setMonth(this.value);
                cal.render();
            },this);

            // �󶨡��ÿա��͡����족��ť�¼�
            Event.on(calBox,'click',function(e,cal){
                var target=Event.getTarget(e);
                if(Dom.hasClass(target,cal.btnResetClass)){
                    if (cal._curInput) {
                        cal._curInput.value = '';
                        cal.deselectAll();
                        cal.render();
                        cal.hide();
                    }
                }else if(Dom.hasClass(target,cal.btnTodayClass)){
                    if (cal._curInput) {
                        cal.select(new Date());
                        cal.render();
                    }
                }
            },this);
        }, this, true);

        this.selectEvent.subscribe(function(type, args, obj) {
            if (this._userSelect) {
                //�û����ѡ�������ڲ�ִ��
                var dates = args[0], date = dates[0],
                    year = date[0], month = date[1], day = date[2];
                if (this._curInput) {
                    Dom.setStyle(Dom.getPreviousSibling(this._curInput), 'visibility', 'hidden');
                    this._curInput.value = year+ '-' + month + '-' + day;
                    this.hide();
                }
            }
        },this,true);

        this.render();

        if(inputTrigger){
            //����������
            var popupCal=new Tback.module.Popup(inputTrigger,calBox,{width:'auto',height:'auto',disableClick:false});
            popupCal.subscribe('afterShow',function(o){
                _this._curInput=o.curTrigger;
                var date = Tback.module.Calendar.parsePageDate(o.curTrigger.value);
                if (date instanceof Date) {
                    // �������������ֵ����ѡ�и����ڡ�
                    _this.cfg.setProperty('pagedate', date);
                }else{
                    date='';
                    _this._curInput.value='';
                };
                _this._userSelect = false; // ��ֹ����select()����ʱ����selectEvent������������
                _this.select(date);
                _this.render();
                _this._userSelect = true;

            });
            //�������Ԫ�غ�����������򣬹ر�����
            Event.on(document.body,'click',function(e){
                var target=Event.getTarget(e);
                var temp=false;
                if(target==popupCal.popup || Dom.isAncestor(popupCal.popup,target)){
                    temp=true;
                }else if(popupCal.trigger.length){
                    for(var i=0,len=popupCal.trigger.length;i<len;i++){
                        if(target==popupCal.trigger[i]){
                            temp=true;
                            break;
                        }
                    }
                }else if(popupCal.trigger){
                    if(target==popupCal.trigger){
                        temp=true;
                    }
                }
                if(!temp){
                    popupCal.hide();
                }
            });
        }

    };

    Lang.augmentObject(Tback.module.Calendar,{
        /**
         * �����ַ����������ڶ���
         * @param {String} str Ҫ�������ַ���
         * @return {Date|String} ���ؽ���������ڶ��󵱽�������ʱ����ԭ�ַ���
         */
        parsePageDate:function(str){
            var p = /^(\d{4})-(?:[0]?)(\d{1,2})-(?:[0]?)(\d{1,2})$/;
            try {
                var m = str.match(p).slice(1);
                return new Date(m[0], m[1]-1, m[2]);
            } catch(e) {
                return str;
            }
        }
    });

    Lang.extend(Tback.module.Calendar, YAHOO.widget.Calendar,{
        /**
         * ������¼��ǰ��������������input��
         * @private
         * @type HTMLElement
         */
        _curInput:null,
        /**
         * ���������ֵΪtrueʱ����ʾselectEvent���û����������
         * @private
         * @type Boolean
         */
        _userSelect:true,
        /**
         * ��������ѡ�е���С���
         * @type Number
         */
        minYear:1900,
        /**
         * ��������ѡ�е�������
         * @type Number
         */
        maxYear:2050,
        /**
         * ���谴ť��class
         * @type String
         */
        btnResetClass:'calbtnreset',
        /**
         * ѡ����찴ť��class
         * @type String
         */
        btnTodayClass:'calbtntoday',
        /**
         * ��дYUI Calendar��buildMonthLabel����������ֱ��ѡ�����µĹ��ܣ�Copy��tbra��SimpleCalendar
         */
        buildMonthLabel:function() {
            var pageDate = this.cfg.getProperty(YAHOO.widget.Calendar._DEFAULT_CONFIG.PAGEDATE.key);
            var cy = pageDate.getFullYear(), cm = pageDate.getMonth();
            var ySel = ['<select class="calyearselector">'];
            for (var y=this.minYear; y <= this.maxYear; ++y) {
                ySel.push('<option value="' + y + '"' + (cy==y?' selected="selected"':'') + '>' + y + '</option>');
            }
            ySel.push('</select>')
            var mSel = ['<select class="calmonthselector">'];
            for (var m=0; m < 12; ++m) {
                mSel.push('<option value="' + m + '"' + (cm==m?' selected="selected"':'') + '>' + (m+1) + '</option>');
            }
            mSel.push('</select>')
            return ySel.join('') + this.Locale.MY_LABEL_YEAR_SUFFIX + mSel.join('') + this.Locale.MY_LABEL_MONTH_SUFFIX;
        },
        /**
         * ��дrenderFooter���������ӡ��ÿա��͡����족��ť
         * @returns {String} footer���ֵ�htmlƬ��
         */
        renderFooter:function(html) {
            html.push('<tfoot><tr><td colspan="7" class="calfootcell"><button type="button" class="' + this.btnResetClass
                + '">�ÿ�</button>&nbsp;<button type="button" class="' + this.btnTodayClass + '">����</button></td></tr></tfoot>');
            return html;
        }
    });

    //ͨ��Classװ��ΪCalendar
   Tback.sys.Decorator.register('calendar', function(root) {
        var el=Dom.getElementsByClassName('J_AutoCalendar');
        if(el && el.length>0){
            Tback.sys.ComponentManager.add(new Tback.module.Calendar(null,null,el), el, 'calendar');
        }
    });
    
})();/**
 * @description     TBack Batch Select Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-3-7  Release version.
 */

(function() {

    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;

    /**
     * ����ѡ��
     * @class
     * @param {String | HTMLElement} container ����ѡ�������
     * @param {String} batchSelectClass ��������ѡ�еĸ�ѡ���class
     * @param {String} singleSelectClass ѡ�е�����ѡ���class
     * @param {Object} [config] ��ѡ����
     * @param {String} [config.rowClass] ѡ�е�����ѡ��������������class�����ѡ��ĳ����Ҫ����ʱ���ͻ���ݸ�����ȡ����������������rowClass��rowTagName�������ҵ�������������������Զ������ˣ��ͻ�Ѱ�Ҹ�����������ƥ���������
     * @param {String} [config.rowTagName] ѡ�е�����ѡ�������е������ı�ǩ��
     * @param {String} [config.rowSelectedClass] ѡ�е���ʱ��������������������class
     * @param {String} [config.enableSelectByClickRow] �Ƿ񵥻����������κεط���ѡ�и��е�ѡ�е�����ѡ��
     */
    Tback.module.BatchSelect=function(container,batchSelectClass,singleSelectClass,config){
        container=Dom.get(container);
        if(!container) return;
        this.container=container;
        this.batchSelectClass=batchSelectClass;
        this.singleSelectClass=singleSelectClass;
        this.config=config || {};
        Event.on(container,'click',function(e,obj){
            var t=Event.getTarget(e);
            //��ȡ��ǰ�����������
            var row=null;
            if(obj.config.rowClass){
                row=Dom.getAncestorByClassName(t,obj.config.rowClass);
            }else if(obj.config.rowTagName){
                row=Dom.getAncestorByTagName(t,obj.config.rowTagName);
            }
            //������ȫѡ��ѡ��
            if(Dom.hasClass(t,obj.batchSelectClass)){
                if(t.checked){
                    obj.selectAll();
                }else{
                    obj.deselectAll();
                }
            //������ѡ�е�����ѡ��
            }else if(Dom.hasClass(t,obj.singleSelectClass)){
                obj._checkIfAllSelected();
                if(t.checked){
                    obj.select(t);
                }else{
                    obj.deselect(t);
                }
            //�����������ĳ����,������������ͨ�������������ط�ѡ�и��е�ѡ�񵥸���ѡ��
            }else if(obj.config.enableSelectByClickRow && row){
                var t=Dom.getElementsByClassName(obj.singleSelectClass,'*',row)[0];
                if(t.checked){
                    obj.deselect(t);
                }else{
                    obj.select(t);                    
                }
            }
        },this);

        var selectedItemArr=this.getSelectedItemArr();
        if(selectedItemArr){
            Dom.batch(selectedItemArr,this._setRowSelectedState,this,true);
        }

        /**
         * ��ѡ��ĳЩѡ��ʱ����
         * @name Tback.module.BatchSelect#afterSelect
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object | Array} obj.container ����
         * @param {Object} obj.el ������checkbox����
         */
        this.createEvent('afterSelect');
        /**
         * ��ȡ��ѡ��ĳЩѡ��ʱ����
         * @name Tback.module.BatchSelect#afterDeselect
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object | Array} obj.container ����
         * @param {Object} obj.el ������checkbox����
         */
        this.createEvent('afterDeselect');
        /**
         * ��ѡ������ѡ��ʱ����
         * @name Tback.module.BatchSelect#afterSelectAll
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object | Array} obj.container ����
         * @param {Object} obj.el ������checkbox����
         */
        this.createEvent('afterSelectAll');
        /**
         * ��ȡ��ѡ������ѡ��ʱ����
         * @name Tback.module.BatchSelect#afterDeselectAll
         * @event
         * @param {Object} obj ��������Ķ���
         * @param {Object | Array} obj.container ����
         * @param {Object} obj.el ������checkbox����
         */
        this.createEvent('afterDeselectAll');
    }

    Tback.module.BatchSelect.prototype={
        /**
         * ���ڸ���checkbox��ѡ��״̬�����ø�checkbox����tr��ѡ����ʽ�����жϣ�
         * @private
         * @param {HTMLElement} el ���ݵ�checkbox����
         */
        _setRowSelectedState:function(el){
            if(this.config.rowSelectedClass){
                //��ȡ��ǰ�����������
                var row=null;
                if(this.config.rowClass){
                    row=Dom.getAncestorByClassName(el,this.config.rowClass);
                }else if(this.config.rowTagName){
                    row=Dom.getAncestorByTagName(el,this.config.rowTagName);
                }else{
                    return;
                }
                if(el.checked){
                    Dom.addClass(row,this.config.rowSelectedClass);
                }else{
                    Dom.removeClass(row,this.config.rowSelectedClass);
                }
            }
        },
        /**
         * ѡ�е���checkbox
         * @private
         * @param {HTMLElement} Ҫ������checkbox����
         */
        _selectSingle:function(el){
            el.checked=true;
            this._setRowSelectedState(el);
        },
        /**
         * ȡ��ѡ�е���checkbox
         * @private
         * @param {HTMLElement} Ҫ������checkbox����
         */
        _deselectSingle:function(el){
            el.checked=false;
            this._setRowSelectedState(el);
        },
        /**
         * ���ȫѡ״̬
         * @private
         */
        _checkIfAllSelected:function(){
            var result=true;
            var singleSelectArr=this.getSingleSelectArr();
            for(var i=0,len=singleSelectArr.length;i<len;i++){
                if(!singleSelectArr[i].checked){
                    result=false;
                    break;
                }
            }
            var batchSelectArr=this.getBatchSelectArr();
            if(result){
                Dom.batch(batchSelectArr,function(el){el.checked=true;});
            }else{
                Dom.batch(batchSelectArr,function(el){el.checked=false;});
            }
            return result;
        },
        /**
         * ����
         * @type HTMLElement
         */
        container:null,
        /**
         * ����ѡ�е�Ԫ�ص�class
         * @type String
         */
        batchSelectClass:null,
        /**
         * ����ѡ�е�Ԫ�ص�class
         * @type String
         */
        singleSelectClass:null,
        /**
         * ��ѡ����
         * @type Object
         */
        config:null,
        /**
         * ��ȡ���е�ȫѡcheckbox����
         * @returns {HTMLElement[]} ���е�ȫѡcheckbox����
         */
        getBatchSelectArr:function(){return Dom.getElementsByClassName(this.batchSelectClass,'*',this.container);},
        /**
         * ��ȡ����ѡ�񵥸���checkbox����
         * @returns {HTMLElement[]} ����ѡ�񵥸���checkbox����
         */
        getSingleSelectArr:function(){return Dom.getElementsByClassName(this.singleSelectClass,'*',this.container);},
        /**
         * ��ȡ���б�ѡ��״̬��checkbox����
         * @returns {HTMLElement[] | null} ��ѡ��״̬��checkbox�����null
         */
        getSelectedItemArr:function(){
            var result=[];
            var singleSelectArr=this.getSingleSelectArr();
            for(var i=0,len=singleSelectArr.length;i<len;i++){
                if(singleSelectArr[i].checked){
                    result[result.length]=singleSelectArr[i];
                }
            }
            if(result.length==0){return null;}else{return result;}
        },
        /**
         * ѡ��ָ����checkbox����
         * @param {HTMLElement | HTMLElement[]} el Ҫ������checkbox���������
         */
        select:function(el){
            Dom.batch(el,this._selectSingle,this,true);
            this._checkIfAllSelected();
            this.fireEvent('afterSelect',{'container':this.container,'el':el});
        },
        /**
         * ȡ��ѡ��ָ����checkbox����
         * @param {HTMLElement | HTMLElement[]} el Ҫ������checkbox���������
         */
        deselect:function(el){
            Dom.batch(el,this._deselectSingle,this,true);
            this._checkIfAllSelected();
            this.fireEvent('afterDeselect',{'container':this.container,'el':el});
        },
        /**
         * ȫѡ
         */
        selectAll:function(){
            var el=this.getSingleSelectArr();
            Dom.batch(el,this._selectSingle,this,true);
            this._checkIfAllSelected();
            this.fireEvent('afterSelectAll',{'container':this.container,'el':el});
        },
        /**
         * ȡ��ȫѡ
         */
        deselectAll:function(){
            var el=this.getSingleSelectArr();
            Dom.batch(el,this._deselectSingle,this,true);
            this._checkIfAllSelected();
            this.fireEvent('afterDeselectAll',{'container':this.container,'el':el});
        }
    };

    Lang.augmentProto(Tback.module.BatchSelect, Util.EventProvider);

    //ͨ��Classװ��ΪPopup
    Tback.sys.Decorator.register('batchSelect', function(root) {
        Dom.getElementsByClassName('J_AutoDataGridTable', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.BatchSelect(el ,'J_SelectAll','J_Selector'), el, 'batchSelect');
        });
    });

})();/**
 * @description     TBack Datasource Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-3-10 Release version.
 */

(function() {
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /**
     * @class
     * @params {String} url ��ȡ���ݵ�url
     */ 
    Tback.module.Datasource = function(uri){
       this.uri=uri;
    };
    
    Tback.module.Datasource.prototype = {
        /**
         * Ҫ��ȡ���ݵ�url
         * @type String
         */
        uri:null,
        /**
         * ��ȡ���ݵķ�ʽ��Ĭ��Ϊ'get',��ѡֵΪ'get'��'post'
         * @type String
         */
        method:'post',
        /**
         * ��ȡ�����µ����ݣ�Ŀǰ��֧��json��ʽ��
         * @type Object
         */
        
        liveData:null,
        /**
         * ��ȡ�������ݵ��У�Ϊlist��ʽ�Ĳ�������
         */
        listDataField:'dataList',
        listData:null,
        connect:function(postData,callBack){
            var callBackObj={
                success:function(o){
                    this.liveData=eval('('+o.responseText+')');
                    if(this.liveData.success){
                        if(this.liveData[this.listDataField]) this.listData=this.liveData[this.listDataField];
                        if(callBack) callBack(this.liveData,this.listData);
                    }else{
                        window.status = this.liveData.info;
                        /*var logBox=Dom.get('J_LogBox');
                        if(!logBox){
                            logBox=document.createElement('div');
                            logBox.className='log-box';
                            logBox.id='J_logBox';
                            logBox.style.display='none';
                            logBox.innerHTML='<div class="box box-weak"><div class="hd"><h3 id="J_LogTitle">Log</h3></div><div class="bd"><ul class="ul-has-icon" id="J_LogUl"></ul></div><div class="ft"><ul class="act"><li><a href="#" id="J_LogClose">�ر�</a></li><li><a href="#" id="J_LogClear">���</a></li></ul></div></div>';
                            document.body.appendChild(logBox);
                            Event.on('J_LogClose','click',function(e){
                                Event.preventDefault(e);
                                logBox.style.display='none';
                            });
                            Event.on('J_LogClear','click',function(e){
                                Event.preventDefault(e);
                                document.getElementById('J_LogUl').innerHTML='';
                            });
                        }
                        logBox.style.display='';
                        var ul=Dom.get('J_LogUl');
                        var li=document.createElement('li');
                        li.innerHTML=this.liveData.info;
                        ul.appendChild(li);*/
                    }
                },
                failure:function(){alert('��ȡ����ʧ�ܣ���ˢ��ҳ�����Ի���ϵ����Ա��');},
                scope:this
            };
            Util.Connect.asyncRequest(this.method,this.uri,callBackObj,postData);
        },
        /**
         * ��ȡָ�������ŵ�listData
         * @param {Number[]} idxArr Ҫ��ȡ��listData������������
         * @return {Object[]} ���ػ�ָ��������ָ���listData����
         */
        getSelectedListData:function(idxArr){
            if(!this.listData) return;
            var returnArr=[];
            for(var i=0,len=idxArr.length;i<len;i++){
                returnArr[returnArr.length]= this.listData[idxArr[i]];
            }
            return returnArr;
        },
        addRecords:function(){

        },
        modifyRecords:function(){

        },
        deleteRecords:function(){
            
        },
        queryData:function(){}
    };
    Lang.augment(Tback.module.Datasource, YAHOO.util.EventProvider);
    
})();/**
 * @description     TBack Data Grid Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-3-10 Release version.
 */

(function() {
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /**
     * ������
     * @class
     * {String | HTMLElement} container ���ñ�������
     * {Object} config ����
     * {Object []} [config.dataList] ������Ⱦ��������
     * {Object []} config.columns ָ����
     * {String} config.columns.header th������
     * {String} config.columns.dataField ��Ӧ������ָ��
     * {Function} config.columns.parser �����Դ��ݵ�����ΪΨһ������������ת������Ҫ����ʽ�󷵻��ַ�������δʵ�֣�
     * {String} config.selectType ���ñ���ÿ���ǿɵ�ѡ���Ƕ�ѡ����ѡֵΪ'checkbox'��'radio'
     */ 
    Tback.module.DataGrid = function(container,config){
        container=Dom.get(container) || container;
        if(!container) return;
        this.container=container;
        this.dataList=config.dataList;
        this.columns=config.columns;
        this.selectType=config.selectType;
        var gridTable=document.createElement('table');
            gridTable.className='data-grid-table';
        this.gridObj=gridTable;
        this.init();
        if(this.selectType=='checkbox' && Tback.module.BatchSelect){
            new Tback.module.BatchSelect(
                this.container,
                'J_SelectAll',
                'J_Selector',
                {
                    rowClass:'data-row',
                    rowSelectedClass:'selected',
                    enableSelectByClickRow:true
                });
        }else{
            Event.on(gridTable,'click',function(e){
                var t=Event.getTarget(e);
                if(Dom.getAncestorByClassName(t,'data-row')){
                    t=Dom.getAncestorByClassName(t,'data-row');
                }
                if(Dom.hasClass(t,'data-row')){
                    if(Dom.hasClass(t,'selected')){
                        Dom.removeClass(t,'selected')
                    }else{
                        Dom.addClass(t,'selected');
                    }
                }
            });
        }
    };
    
    Tback.module.DataGrid.prototype = {
        /**
         * ��ǰ��Ⱦtbody����
         * @type HTMLElement
         */
        _curBodyObj:null,
        /**
         * ֮ǰ��Ⱦ��tbody����
         * @type HTMLElement
         */
        _prevBodyObj:null,
        /**
         * ʢ�ű�������
         * @type HTMLElement
         */
        container:null,
        /**
         * �������ɱ�������Դ
         * @type Object[]
         */
        dataList:null,
        /**
         * ����������
         * @type Object[]
         */
        columns:null,
        /**
         * �����е�ѡ������
         * @type String
         */
        selectType:null,
        /**
         * �����ı�����
         * @type HTMLElement
         */
        gridObj:null,
        _strToEl:function(str,tagName){
            var tempNode=document.createElement('div');
            tempNode.innerHTML='<table>'+str+'</table>';            
            return tempNode.getElementsByTagName(tagName)[0];
        },
        init:function(){
            this.gridObj.appendChild(this.renderHead());
            this.gridObj.appendChild(this.renderBody());
            this.container.appendChild(this.gridObj);
        },
        /**
         * ��Ⱦthead
         * @param {String} returnType='dom' ���ص���ʽ����ѡ'dom'��'str'
         * @return {HTMLElement | String} ���ݲ������÷�����Ⱦ�õ�thead
         */
        renderHead:function(returnType){
            var HTMLFrag='<thead><tr>';
            if(this.selectType=='checkbox'){
                HTMLFrag+='<th class="check"><input type="checkbox" class="J_SelectAll"></th>';
            }
            for(var i=0,len=this.columns.length;i<len;i++){
                HTMLFrag+='<th>'+this.columns[i].header+'</th>';
            }
            HTMLFrag+='</tr></thead>';
            if(returnType=='str'){
                return HTMLFrag;
            }else{
                return this._strToEl(HTMLFrag,'thead');
            }

        },
        /**
         * ��Ⱦtbody
         * @param {String} returnType='dom' ���ص���ʽ����ѡ'dom'��'str'
         * @return {HTMLElement | String} ���ݲ������÷�����Ⱦ�õ�tbody
         */
        renderBody:function(returnType){
            if(this.dataList){
                var HTMLFrag='<tbody>';
                for(var i=0,len=this.dataList.length;i<len;i++){
                    if(i%2==0){
                        HTMLFrag+='<tr class="data-row even" data-idx="'+i+'">';
                    }else{
                        HTMLFrag+='<tr class="data-row" data-idx="'+i+'">';
                    }
                    if(this.selectType=='checkbox'){
                        HTMLFrag+='<td><input type="checkbox" class="J_Selector" /></td>';
                    }
                    for(var j=0,l=this.columns.length;j<l;j++){
                        HTMLFrag+='<td>'+ (typeof this.dataList[i][this.columns[j]['dataField']]=='undefined' ? this.columns[j]['dataField'] : this.dataList[i][this.columns[j]['dataField']])+'</td>';
                    }
                    HTMLFrag+='</tr>';
                }
                HTMLFrag+='</tbody>';
            }else{
                var HTMLFrag='<tbody></tbody>';
            }
            this._prevBodyObj=this._curBodyObj;
            this._curBodyObj=this._strToEl(HTMLFrag,'tbody');
            if(returnType=='str'){
                return HTMLFrag;
            }else{
                return this._curBodyObj;
            }
        },
        /**
         * ���±������
         * @param {Object []} [dataList] ��������������Դ�����������this.dataList���ò������Բ���
         */
        update:function(dataList){
            if(dataList) this.dataList=dataList;
            if(!this.gridObj){
                this.init();
            }else{
                this.renderBody();
                this.gridObj.removeChild(this._prevBodyObj);
                this.gridObj.appendChild(this._curBodyObj);
            }
        },
        /**
         * ��ȡ���ݱ���б�ѡ�е�����datasource����������
         * @return {Number[]} �������ݱ���б�ѡ�е�����datasource����������
         */
        getSelectedRows:function(){
            if(!this._curBodyObj) return;
            var selectedRowsIdxArr=[];
            var rows=Dom.getElementsByClassName('data-row','tr',this._curBodyObj);
            for(var i=0,len=rows.length;i<len;i++){
                if(Dom.hasClass(rows[i],'selected')){
                    selectedRowsIdxArr[selectedRowsIdxArr.length]=rows[i].getAttribute('data-idx');
                }                                                                                                                                   
            }
            return selectedRowsIdxArr;
        }
    };  

    Lang.augment(Tback.module.DataGrid, YAHOO.util.EventProvider);
    
})();/**
 * @description     TBack Form Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version         0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-3-10 Release version.
 */

/*
config={
    title:'������',
    boxStyle:'normal',
    formStyle:'normal',
    buttons:[
        {name:'a',value:'�ύ',type:'submit'},
        {name:'b',value:'����',type:'button'},
        {name:'c',value:'����',type:'reset'}
    ],
    blocks:[
        {
            caption:'������Ϣ',
            rows:2,
            columns:2,
            items:[
                {
                    boxLabel: '����',
                    required:true,
                    row:1,
                    column:1,
                    fields:[
                        { xtype:'input',name:'name',value:'fool2fish'}
                    ]
                },
                {
                    boxLabel:'�Ա�',
                    row:2,
                    column:1,
                    fields:[
                        {xtype:'radio',name:'sex',value:'male',label:'��'},
                        {xtype:'radio',name:'sex',value:'female',label:'Ů',checked:true},
                        {xtype:'radio',name:'sex',value:'shemale',label:'����'}
                    ]
                },
                {
                    boxLabel:'����',
                    row:2,
                    column:2,
                    fields:[
                        {xtype:'checkbox',name:'fav',value:'fav1',label:'��',labelPosition:'right',checked:true},
                        {xtype:'checkbox',name:'fav',value:'fav2',label:'��',labelPosition:'right',checked:true},
                        {xtype:'checkbox',name:'fav',value:'fav3',label:'��',labelPosition:'right'},
                        {xtype:'checkbox',name:'fav',value:'fav4',label:'��',labelPosition:'right'}
                    ]
                }
            ]
        },
        {
            caption:'��չ��Ϣ',
            foldState:'fold',
            rows:3,
            columns:1,
            items:[
                {
                    boxLabel:'ǩ����',
                    row:1,
                    column:1,
                    fields:[
                         { xtype:'input',name:'signature',value:'����˺�����ʲôҲûд��',width:2}
                    ]
                },
                {
                    boxLabel:'����Ϣ����',
                    row:2,
                    column:1,
                    fields:[
                        {xtype:'select',name:'template',width:2,label:'��Ϣģ��',options:[]},
                        {xtype:'br'},
                        {xtype:'textarea',name:'msg',width:4,height:2,label:'��Ϣ����'},
                        {xtype:'br'},
                        {xtype:'checkbox',name:'sendmsgby',value:'ww',label:'����',labelPosition:'right'},
                        {xtype:'checkbox',name:'sendmsgby',value:'letter',label:'վ����',labelPosition:'right'}
                    ]
                }
            ]
        }
    ]
}
*/
(function() {
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /**
     * ��
     * @class
     * @param {HTMLElement | String} container ʢ�ű���
     */ 
    Tback.module.Form = function(container,config){
        this.container=container;
        this.fields=config.fields;
    };

    Lang.augmentObject(Tback.module.Form,{
    });
    
    Tback.module.Form.prototype = {     
        container:null,
        formEl:null,
        config:null,
        fields:null,
        init:function(){},
        stuffData:function(){},
        addFormEl:function(){},
        /**
         * ������ݵ�����
         * @param datasource
         */
        update:function(record){
            if(record){
                for(var i=0;i<this.fields.length;i++){
                    var field = document.getElementById(this.container+"_"+this.fields[i]);                    
                    if(field.name=="codemirror"){
                        eval(field.id+"_codemirror_editor").setCode(record[this.fields[i]]);
                    } else if(field.nodeName.toLowerCase()=='span'){
                        var inputArr=field.getElementsByTagName('input');
                        for(var j=0,len=inputArr.length;j<len;j++){
                            if(inputArr[j].value==record[this.fields[i]]){
                                inputArr[j].checked=true;   
                            }
                        }
                    }else if(field.nodeName.toLowerCase() == 'div' || field.nodeName.toLowerCase() == 'textarea'){
                        if(record[this.fields[i]]){
                            field.innerHTML=record[this.fields[i]];
                        }
                    }else{
                        if(record[this.fields[i]]){
                            field.value=record[this.fields[i]];
                        }
                    }
                }
            }
        }
    };  

    Lang.augment(Tback.module.Form, YAHOO.util.EventProvider);
    
})();/**
 * @description TBack Cascade Select Module JavaScript.
 * @author          chenyu<chenyu@taobao.com>
 * @version     0.9
 * @namespace       TBack.module
 * @requires        YAHOO: Util, Lang, DOM, Event, Tback.module.Datasource
 * changelog        Ver 0.9 @ 2010-3-28 Release version.
 */

(function() {
          
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * ����ѡ��
     * @class
     */ 
    Tback.module.CascadeSelect=function(container,selectClassName,datasource,initPostData){
        var _this=this;
        container=Dom.get(container);
        this.container=container;
        //���������selectClassName������ݸ�ֵȡ�����м���ѡ�Ŀǰֻ֧��select��ʽ���Ժ������չ����select��ʽ��
        if(selectClassName){
            this.selectArr=Dom.getElementsByClassName('selectClassName','*',container);
        //�����ȡ���������е�selectΪ����ѡ��
        }else{
            this.selectArr=container.getElementsByTagName('select');
        }
        //������ѡ����������
        for(var i=0,len=this.selectArr.length;i<len;i++){
            this.selectArr[i].setAttribute('idx',i);
        }
        //����datasource
        if(Lang.isString(datasource)){
            this.datasource=new Tback.module.Datasource(datasource);
        }else{
            this.datasource=datasource;
        }
        //��ʼ�������˵��ĵ�һ��select
        if(initPostData){
            var optionValue=this.optionSchema.optionValue;
            var optionInner=this.optionSchema.optionInner;
            if(initPostData && initPostData.length>0){
                var param='param='+initPostData;
            }else{
                var param='';
            }
            this.datasource.connect(param,function(liveData,listData){
                var optionFragment = document.createDocumentFragment();
                var option = document.createElement('option');
                    option.value = '';
                    option.innerHTML = '��ѡ��';
                    optionFragment.appendChild(option);
                for(var i=0,len=listData.length;i<len;i++){
                   option = document.createElement('option');
                   option.value = listData[i][optionValue];
                   option.innerHTML = listData[i][optionInner];
                   optionFragment.appendChild(option);
                }
                _this.selectArr[0].innerHTML = '';
                _this.selectArr[0].appendChild(optionFragment);
            });
        }

        //�����еļ���ѡ��ע��ѡ���¼���Ŀǰֻ֧��select��ʽ��
        Event.on(this.selectArr,'change',function(e,obj){
            var target=Event.getTarget(e);
            var idx=parseInt(target.getAttribute('idx'),10);
            var selectLength=obj.selectArr.length;
            if(idx < selectLength-1){
                var optionValue=obj.optionSchema.optionValue;
                var optionInner=obj.optionSchema.optionInner;
                var clearIdx = idx + 2;
                if(target.value){
                    obj.datasource.connect('param='+target.value,function(liveData,listData){                       
                        var optionFragment = document.createDocumentFragment();
                        var option = document.createElement('option');
                            option.value = '';
                            option.innerHTML = '��ѡ��';
                            optionFragment.appendChild(option);
                        for(var i=0,len=listData.length;i<len;i++){
                           option = document.createElement('option');
                           option.value = listData[i][optionValue];
                           option.innerHTML = listData[i][optionInner];
                           optionFragment.appendChild(option);
                        }
                        obj.selectArr[idx+1].innerHTML = '';
                        obj.selectArr[idx+1].appendChild(optionFragment);
                    });
                }else{
                    clearIdx--;
                }    
                
                if(clearIdx<selectLength){
                    for(var i=clearIdx;i<selectLength;i++){
                        var option = document.createElement('option');
                            option.value = '';
                            option.innerHTML = '��ѡ��';
                        obj.selectArr[i].innerHTML = '' ;
                        obj.selectArr[i].appendChild(option);
                    }
                }
            }
        },this);
    }
    
    Tback.module.CascadeSelect.prototype={
        container:null,
        selectArr:null,
        datasource:null,
        optionSchema:{optionValue:'realValue',optionInner:'displayValue'}
    };
    
    Lang.augmentProto(Tback.module.CascadeSelect, Util.EventProvider);
    
    //ͨ��Classװ��ΪPopup
    /*Tback.sys.Decorator.register('popup', function(root) {
        Dom.getElementsByClassName('J_AutoPopupTrigger', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.Popup(el , el.getAttribute('data-target')), el, 'popup');
        });
    });*/
    
})();

(function() {
          
    //���ñ�����д
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * �л�Ŀ��Ԫ�ص���ʾ������
     * @class
     * @param {String | HTMLElement} trigger ����Ԫ��
     * @param {String | HTMLElement} target �л���ʾ��Ŀ�����
     * @param {Object} [config] ����
     * @param {String[]} [config.triggerStateClass] [Ŀ�������ʾʱ����Ԫ�صĸ���class��Ŀ���������ʱ����Ԫ�ص�class]��Ŀ���������ʾ������״̬ʱ����Ԫ�صĸ���class�������л�����Ԫ�ص������չ����ʽ
     * @param {String} [config.hideType='display'] ����Ŀ�����ķ�ʽ����ѡֵ'display'/'height'�����Ϊ'display'��ʽ��������ʱ����display:none��Ϊ'height'��ʽ��������ʱ����height:0px,overflow:hidden
     */ 
    Tback.module.Text = function(trigger){    

        var trigger = Dom.getLastChild(trigger);

        if (!trigger) return;

        Event.on(trigger, "focus", function (ev) {

            if (!D.val(ev.target).trim()) {
                D.css(D.prev(ev.target), {
                    visibility: "visible",
                    color: "#ccc"
                });
            }
        });

        Event.on(trigger, "blur", function (ev) {

            var target = ev.target;

            if (!D.val(target).trim()) {
                D.css(D.prev(target), {
                    visibility: "visible",
                    color: "#666"
                });
            }

        }, trigger);

        Event.on(trigger, "input", function (ev) {

            var target = ev.target;

            D.css(D.prev(target), "visibility", "hidden");

        }, trigger);
    }
    
    Lang.augmentObject(Tback.module.Text,{});

    Tback.sys.Decorator.register('text', function(root) {
        Dom.getElementsByClassName('wbc-text', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.Text(el), el, 'text');
        });
    });
})();