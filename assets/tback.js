/**
 * @description     TBack JavaScript.
 * @author          qingyu<qingyu@taobao.com>
 * @version         0.9
 * @namespace       TBack
 * @requires        YAHOO: Util, Lang, DOM, Event.
 * changelog        Ver 0.9 @ 2010-2-5  Release version.
 */

(function(){
    //常用变量缩写
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
         * 创建Tback下的命名空间
         * @static
         * @param   {String*}   namespace*  需要创建的命名空间，支持多参数
         * @returns {Object}    最后一个创建的命名空间
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
    
    //创建常用namespace 
    Tback.namespace('module', 'util', 'sys');

    /** @class */
    Tback.sys.Decorator = {

        fns: {},
        
        /**
         * 注册需要通过Class的方式自动装饰的组件
         * @static
         * @param   {String}    type    注册组件的名称
         * @param   {Funtion}   fn  组件的装饰函数
         */
        register: function(type, fn) {
            this.fns[type] = fn;
        },

        /**
         * 装饰页面上所有符合条件的组件（此方法在DomReady时自动运行一次）
         * @static
         */
        decorateAll: function() {
            this.decoratePart();
        },

        /**
         * 装饰页面上的局部组件
         * @static
         * @param   {String}    [types]    需要自动装饰组件的名称列表(optional)
         * @param   {String|HTMLElement}    [root]  需要自动装饰组件的根节点(optional)
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
         * 增加组件到组件管理器
         * @static
         * @param   {Object}    component    增加的组件对象
         * @param   {String|HTMLElement}    element 增加的组件对应的页面HTML元素
         * @param   {String}    [type]  增加组件的类型(optional)
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
         * 获取指定的组件
         * @static
         * @param   {String}    id    组件的id
         * @param   {String}    [type]  组件的类型(optional)
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
    //常用变量缩写
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
         * 当Tab切换的时候发生
         * @name Tback.module.Tab#afterSwitch
         * @event
         * @param   {Number}    idx 切换到的tab的索引值
         */
        this.createEvent('afterSwitch');
        var self = this;
        this.handler.subscribeOnSwitch(function(idx) {
            self.fireEvent('afterSwitch', idx);
        });
        this.subscribe('afterSwitch', function(idx) {
            self.currentIdx = idx; 
        });
        
        //获得tab和content元素数组
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
         * 当前选中tab的索引值
         * @type Number 
         */
        currentIdx: null,
        
        /**
         * 获得当前选中的Tab元素
         * @returns {HTMLElement}   当前选中的Tab元素
         */
        getCurrentTab: function() {
            return this._tabs[this.currentIdx];
        },
        
        /**
         * 获得当前选中的Content元素
         * @returns {HTMLElement}   当前选中的Content元素
         */
        getCurrentContent: function() {
            return this._contents[this.currentIdx];
        },
        
        /**
         * 切换到指定的Tab
         * @param   {Number}    idx 切换到Tab的索引值
         * @returns {Tback.module.Tab}  tab对象本身
         */
        switchTo: function(idx) {
            if (Lang.isNumber(idx)) {
                this.handler.switchTab(idx);
            }
            return this;
        }

    };
    Lang.augment(Tback.module.Tab, YAHOO.util.EventProvider);
    
    //通过Class装饰为Tab
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
          
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * 创建一个弹出框
     * @class
     * @param {String | HTMLElement | HTMLElement[]} trigger 触发弹出框的id/class/el/el数组
     * @param {String | HTMLElement} popup 弹出框的id/el
     * @param {Object} [config] 弹出框配置
     * @param {String} [config.position="right"] 弹出框相对触发元素弹出的位置，可选值"left"/"right"/"top"/"bottom"
     * @param {String} [config.align="top"] 弹出框和触发元素的对齐方式，可选值"left"/"right"/"center"/"top"/"bottom"
     * @param {Boolean} [config.autoFit=true] 弹出框弹出位置超出屏幕范围时是否自适应到屏幕内
     * @param {Number} [config.width='auto'] 弹出框的宽度，如不指定，则为auto
     * @param {Number} [config.height='auto'] 弹出框的高度，如不指定，则为auto
     * @param {Array} [config.offset=[0,0]] 弹出框相对触发元素的偏移
     * @param {String} [config.eventType="click"] 触发弹出框的鼠标事件类型，可选值"mouse"/"click"
     * @param {Boolean} [config.disableClick=false] 是否屏蔽触发元素的鼠标点击事件，仅触发鼠标事件类型为"mouse"时设置有效
     * @param {Boolean} [config.hasMask=false] 是否显示遮罩，此设置仅在eventType='click'时有效，且一个页面仅使用一个遮罩
     * @param {String} [config.btnCloseClass] 点击关闭弹出层的元素的class，要求该元素必须在弹出窗内
     * @param {Number} [config.delay=0.1] 触发鼠标事件为"mouse"时的延时
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
        
        //定义默认配置
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
        //获得配置
        config = Lang.merge(defConfig, config||{});
        this.config=config;
        
        //设置遮罩
        if(config.eventType=='click' && config.hasMask){
            Event.onDOMReady(function(){
                var mask = document.createElement("div");
                    mask.className = "popup-mask";
                    document.body.appendChild(mask);
                    mask.style.display = "none";
                _this.mask=mask;
            });
        }
        
        //设置关闭按钮
        if(config.btnCloseClass){
            var btnClose=Dom.getElementsByClassName(config.btnCloseClass,'*',popup);
            Event.on(btnClose,'click',function(ev){
                Event.preventDefault(ev);
                _this.hide();
            });
        }   
        
        /**
         * 鼠标点击触发元素时执行
         * @private
         */
        function triggerClickHandler(ev) {      
            Event.preventDefault(ev);
            _this.prevTrigger = _this.curTrigger;           
            _this.curTrigger=Event.getTarget(ev);
            //如果之前触发的元素和当前触发元素为同一个元素
            if (_this.prevTrigger == _this.curTrigger) {
                popup.style.display == 'block'? _this.hide() : _this.show();
            //如果不是同一个元素
            } else {
                _this.show();               
            }       
        }
        
        /**
         * 鼠标在触发/弹出元素上时执行
         * @private
         */
        function mouseOverHandler(ev) {
            clearTimeout(_this._popupHideTimeId);
            var target=Event.getTarget(ev);
            if(popup != target  && !Dom.isAncestor(popup, target)){
                //获取到真正的trigger
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
         * 鼠标离开触发/弹出元素时执行
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
            //设置屏蔽触发元素的鼠标点击事件
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
         * 当弹出窗显示时发生
         * @name Tback.module.Popup#afterShow
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object | Array} obj.trigger 可以触发弹出框的所有元素
         * @param {Object} obj.popup 弹出框
         * @param {Object} obj.curTrigger 当前触发弹出框的元素
         */
        this.createEvent('afterShow');
        
        /**
         * 当弹出窗隐藏时发生
         * @name Tback.module.Popup#afterHide
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object | Array} obj.trigger 可以触发弹出框的所有元素
         * @param {Object} obj.popup 弹出框
         * @param {Object} obj.curTrigger 当前触发弹出框的元素
         */
        this.createEvent('afterHide');
    
    }
    
    Lang.augmentObject(Tback.module.Popup,{});
    
    Tback.module.Popup.prototype={
        //私有属性  
        _popupHideTimeId:null,
        _popupShowTimeId:null,
        
        /** 
         * 触发弹出的元素/元素数组
         * @type HTMLElement | HTMLElement[]
         */
        trigger:null,
        /** 
         * 弹出框
         * @type HTMLElement 
         */
        popup:null,
        /** 
         * 创建弹出实例的完全配置信息
         * @type Object
         */
        config:null,
        /** 
         * 遮罩
         * @type HTMLElement
         */
        mask:null,
        /** 
         * 上一次触发弹出框的触发元素
         * @type HTMLElement
         */
        prevTrigger:null,
        /** 
         * 当前触发弹出框的触发元素
         * @type HTMLElement
         */
        curTrigger:null,        
        /**
         * 显示弹出框
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
                t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;//对齐定位
            } else if (config.position == 'right') {
                l = pos[0]+tw;
                t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;//对齐定位
            } else if (config.position == 'bottom') {
                t = t+th;
                l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;//对齐定位
            } else if (config.position == 'top') {
                t = t-ph;
                l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;//对齐定位
            }
            if (t < 0) t = 0;//防止出界
            if (l < 0) l = 0;//防止出界

            if(config.autoFit) {
                if (t-st+ph > dh) {
                    t = dh-ph+st-2; /* 2px 偏差 */
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
         * 隐藏弹出框
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
    
    //通过Class装饰为Popup
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
          
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * 切换目标元素的显示和隐藏
     * @class
     * @param {String | HTMLElement} trigger 触发元素
     * @param {String | HTMLElement} target 切换显示的目标对象
     * @param {Object} [config] 配置
     * @param {String[]} [config.triggerStateClass] [目标对象显示时触发元素的附加class，目标对象隐藏时触发元素的class]，目标对象处于显示和隐藏状态时触发元素的附加class，用以切换触发元素的收起和展开样式
     * @param {String} [config.hideType='display'] 隐藏目标对象的方式，可选值'display'/'height'，如果为'display'方式，则隐藏时设置display:none，为'height'方式，则隐藏时设置height:0px,overflow:hidden
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
         * 当弹出窗显示时发生
         * @name Tback.module.ShowHideToggle#afterShow
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object} obj.trigger 触发元素
         * @param {Object} obj.target 目标元素
         */
        this.createEvent('afterShow');
        
        /**
         * 当弹出窗显示时发生
         * @name Tback.module.ShowHideToggle#afterHide
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object} obj.trigger 触发元素
         * @param {Object} obj.target 目标元素
         */
        this.createEvent('afterHide');
    
    }
    
    Lang.augmentObject(Tback.module.ShowHideToggle,{});
    
    Tback.module.ShowHideToggle.prototype={
        /** 
         * 触发元素
         * @type HTMLElement
         */
        trigger:null,
        /** 
         * 目标元素
         * @type HTMLElement 
         */
        target:null,    
        /** 
         * 配置
         * @type Object 
         */
        config:null,    
        /**
         * 显示目标元素
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
         * 隐藏目标元素
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
    
    //通过Class装饰为ShowHideToggle
    Tback.sys.Decorator.register('showHideToggle', function(root) {
        Dom.getElementsByClassName('J_AutoShowHideToggleTrigger', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.ShowHideToggle(el , el.getAttribute('data-target')), el, 'showHideToggle');
        });
    });

    //通过Class装饰为ShowHideToggle的盒子(box)
    Tback.sys.Decorator.register('showHideToggleBox', function(root) {
        Dom.getElementsByClassName('J_AutoBox', '*', root).forEach(function(el) {
            var trigger=Dom.getElementsByClassName('J_TriggerFoldBox','*',el)[0];
            var target=Dom.getElementsByClassName('J_BoxBd','*',el)[0];
            Tback.sys.ComponentManager.add(new Tback.module.ShowHideToggle(trigger,target,{triggerStateClass:['op-fold','op-unfold'],hideType:'height'}), el, 'showHideToggle');
        });
    });
    
    //通过Class装饰为ShowHideToggle的右面板(right_panel)
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
          
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * 手风琴
     * @class
     * @param {String | HTMLElement} container 组件最外层容器
     * @param {Object} [config] 配置
     * @param {String} [config.toggleClass='J_Toggle'] 触发元素的class（注意：触发元素不允许设置上下margin，因为上下margin的坍塌会带来计算误差）
     * @param {String} [config.toggleSelectedClass='selected'] 触发元素选中状态时的附加class
     * @param {String} [config.detailClass='J_Detail'] 对应的面板元素的class（注意：面板元素不允许设置上下margin，因为上下margin的坍塌会带来计算误差）
     * @param {Number} [config.containerHeight] 设置容器的css的height属性的数值部分
     * @param {Boolean} [config.fixDetailHeight=false] 是否固定面板展开时的高度，该选项只有在设置了config.containerHeight，或者通过容器style属性给容器设定了高度时才有效 
     * @param {Boolean} [config.alowMultiDetailExpand=false] 是否允许同时展开多个面板
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
        
        //初始化组件的设置信息
        this.initSetting(); 
        
        //为支持组件内容动态加载，简单起见，使用事件代理
        Event.on(container, 'click', function(e) {
            var target=Event.getTarget(e);          
            var toggle=null;
            if(Dom.hasClass(target,config.toggleClass)){
                toggle=target;
            }else if(Dom.getAncestorByClassName(target,config.toggleClass)){
                toggle=Dom.getAncestorByClassName(target,config.toggleClass);           
            }
            //如果点击的是组件的触发元素
            if(toggle){
                Event.preventDefault(e);
                _this.switchTo(toggle.getAttribute('data-idx'));
            }           
        });
        
        /**
         * 当显示某个面板时触发
         * @name Tback.module.Accordion#afterSwitch
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement} obj.container 组件容器对象
         * @param {HTMLElement[]} obj.toggleArr 触发元素对象数组
         * @param {HTMLElement[]} obj.detailArr 面板元素数组
         * @param {Number} obj.idx 被操作的面板的索引号
         */
        this.createEvent('afterSwitch');            
    
    }
    
    Lang.augmentObject(Tback.module.Accordion,{
        /**
         * 计算元素高度偏差值（border+padding）
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
         * 组件最外层容器
         * @type HTMLElement
         */
        container:null,
        /** 
         * 组件配置
         * @type Object
         */
        config:null,        
        /** 
         * 触发元素数组
         * @type HTMLElement[]
         */
        toggleArr:null,
        /** 
         * 面板元素数组
         * @type HTMLElement[]
         */
        detailArr:null,
        /** 
         * 面板展开的css高度设置
         * @type String
         */
        detailHeight:'auto',
        /** 
         * 上一次触发切换面板的触发元素索引
         * @type Number
         */
        preToggleIdx:-1,
        /** 
         * 当前触发切换面板的触发元素索引
         * @type Number
         */
        curToggleIdx:-1,
        /**
         * 初始化组件的相关信息，创建该组件时会被自动调用一次。当组件的dom结构发生变化，比如新增或者减少了触发元素/面板的时候，请手动执行一次此方法以更新组件相关信息。
         */
        initSetting:function(){
            //获取触发元素和面板元素数组
            this.toggleArr=Dom.getElementsByClassName(this.config.toggleClass,'*',this.container);
            this.detailArr=Dom.getElementsByClassName(this.config.detailClass,'*',this.container);
            
            //设置容器的高度
            if(this.config.containerHeight){                
                this.container.style.height=this.config.containerHeight+'px';
            }   
            
            //如果设置了容器高度，且设置了固定面板高度，则计算面板展开高度
            if(parseInt(this.container.style.height, 10) > 0 && this.config.fixDetailHeight){                   
                this.container.style.overflow='auto';
                var containerHeight=parseInt(this.container.style.height, 10);
                this.detailHeight=(containerHeight-this.toggleArr[0].offsetHeight*this.toggleArr.length-Acc.getHeightOffset(this.detailArr[0]))+'px';
            }
            
            this.preToggleIdx=-1;
            this.curToggleIdx=-1;
            
            //给触发元素设置索引，同时初始化面板显示
            for(var i=0;i<this.toggleArr.length;i++){
                this.toggleArr[i].setAttribute('data-idx',i);
                this.detailArr[i].style.display='none';
                if(this.detailHeight!='auto'){this.detailArr[i].style.height=this.detailHeight;}                
                if(Dom.hasClass(this.toggleArr[i],this.config.toggleSelectedClass)){
                    //必须先移除这个选中的class，因为在switchTo方法中，允许展开多个时，会根据触发元素是否具有被选中的class来决定是收起还是展开面板，如不移除则会不显示原本该显示的面板
                    Dom.removeClass(this.toggleArr[i],this.config.toggleSelectedClass);
                    this.switchTo(i);                   
                }
            }   

            //当不允许同时展开多个面板，且没有设置触发元素拥有this.config.toggleSelectedClass，则默认展开第一个面板
            if(this.curToggleIdx<0 && !this.config.alowMultiDetailExpand){
                this.switchTo(0);
            }
        },
        /**
         * 显示指定索引对应的面板
         * @param {Number} toggleIdx 要显示的面板的索引
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
    
    //通过Class装饰为ShowHideToggle
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
          
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * 切换目标元素的显示和隐藏
     * @class
     * @param {String | HTMLElement} container 底部面板的容器对象/id(注意：底部面板一个页面只允许有一个)
     * @param {Object} [config] 配置
     * @param {String} [config.triggerMinClass="J_TriggerMinimize"] 最小化面板的触发元素class
     * @param {String} [config.triggerRestoreClass="J_TriggerRestore"] 还原面板的触发元素class
     * @param {String} [config.triggerMaxClass="J_TriggerMaximize"] 最大化面板的触发元素class
     * @param {String} [config.panelClass="J_BottomPanelBd"] 要切换显示的面板class,该元素仅允许有一个
     * @param {Number} [config.panelRestoreHeight=150] 面板在还原状态时设置的css高度
     * @param {String} [config.initState="restore"] 面板初始化时的现实状态，可选值"min"/"restore"/"max"
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
        
        //记录最初始的config.initState值
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
        
        //如果在panel上设置了display='none'，也可设置默认最小化，config.initState设置优于display设置
        if(this.panel.style.display=='none' && !configInitState){
            config.initState='min'; 
        }
        this.curPanelState=config.initState;
        
        
        //初始化面板显示状态
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
        //注册快捷键
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
         * 当面板最小化时触发的事件
         * @name Tback.module.BottomPanel#afterMinimize
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object} obj.container 底部面板的容器对象
         * @param {Object} obj.panel 面板对象
         */
        this.createEvent('afterMinimize');
        /**
         * 当面板还原时触发的事件
         * @name Tback.module.BottomPanel#afterRestore
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object} obj.container 底部面板的容器对象
         * @param {Object} obj.panel 面板对象
         */
        this.createEvent('afterRestore');
        /**
         * 当面板最大化时触发的事件
         * @name Tback.module.BottomPanel#afterMaximize
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object} obj.container 底部面板的容器对象
         * @param {Object} obj.panel 面板对象
         */
         this.createEvent('afterMaximize');
    }
    
    Lang.augmentObject(Tback.module.BottomPanel,{});
    
    Tback.module.BottomPanel.prototype={
        /** 
         * body的初始padding-bottom数值
         * @private
         * @type Number
         */
        _originBoddyPaddingBottom:0,
        /**
         * 根据面板不同的现实状态调整body的padding-bottom值，以便在所有状态下，body的内容都能全部被显示
         * @private
         */
        _ajustBodyPaddingBottom:function(){                
            document.body.style.paddingBottom = this._originBodyPaddingBottom + this.container.offsetHeight + 'px';
        },
        /** 
         * 底部面板的容器元素
         * @type HTMLElement
         */
        container:null,
        /** 
         * 配置
         * @type Object
         */
        config:null,
        /** 
         * 触发面板最小化的元素
         * @type HTMLElement | HTMLElement[]
         */
        triggerMin:null,
        /** 
         * 触发面板还原的元素
         * @type HTMLElement | HTMLElement[]
         */
        triggerRestore:null,
        /** 
         * 触发面板最大化的元素
         * @type HTMLElement | HTMLElement[]
         */
        triggerMax:null,
        /** 
         * 面板
         * @type HTMLElement
         */
        panel:null,
        /** 
         * 当前面板的显示状态
         * @type String
         */
        curPanelState:null,
        /**
         * 最小化面板
         */
        minimize:function(){
            this.panel.style.display='none';
            this._ajustBodyPaddingBottom();
            this.fireEvent('afterMinimize',{container:this.container,panel:this.panel});
            this.curPanelState='min';
        },
        /**
         * 还原面板
         */
        restore:function(){
            this.panel.style.display='';
            this.panel.style.height=this.config.panelRestoreHeight+'px';
            this._ajustBodyPaddingBottom();
            this.fireEvent('afterRestore',{container:this.container,panel:this.panel});
            this.curPanelState='restore';
        },
        /**
         * 最大化面板
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
    
    //通过指定容器id装饰为bottomPanel
    
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
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    //设置domain
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
     * iframe自适应的静态函数
     * 该函数放在iframe中任意地方均可
     * @static
     * @param {String} id 父页面中，该iframe标签的id值
     * @param {Boolean} ifReapeatUpdate=false 是否每隔200毫秒重复设定iframe的高度
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
          
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /**
     * 选项卡，将源容器内选定元素放置到指定目标容器内
     * @class
     * @param {String | HTMLElement} container 组件的容器
     * @param {Object} [config] 配置
     * @param {String} [config.sourceBoxClass='source-box'] 盛放可选项的容器class（仅允许有一个）
     * @param {String} [config.targetBoxClass='target-box'] 放置选中元素的目标容器class（仅允许有一个）
     * @param {String} [config.itemClass='item'] 可选项的class
     * @param {String} [config.itemSelectedClass='selected'] 可选项被选中状态的class
     * @param {String} [config.addItemsTriggerClass='add-item'] 添加已选中可选项的触发元素class
     * @param {String} [config.removeItemsTriggerClass='remove-item'] 移除已选中可选项的触发元素class
     * @param {Boolean} [config.enableMultiSelect=false] 是否允许选择多个一起操作
     * @param {Boolean} [config.enableRepeatableAdd=true] 是否允许多次添加某个可选项
     * @param {Boolean} [config.enableMoveItemByDblclick=true] 是否允许通过双击来添加/移除可选项
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
         * 单击事件
         * @private
         */
        function clickHandler(e){
            var t = Event.getTarget(e);
            //如果是单击的可选项
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
            //如果是单击添加按钮
            }else if(SelectCard._checkItemByClass(t,config.addItemsTriggerClass)){
                var itemArr=_this._getSelectedItems(_this.sourceBox);
                if(!itemArr) return;
                _this.addItems(itemArr);
            //如果是单击移除按钮
            }else if(SelectCard._checkItemByClass(t,config.removeItemsTriggerClass)){
                var itemArr=_this._getSelectedItems(_this.targetBox);
                if(!itemArr) return;
                _this.removeItems(itemArr);
            }
        }
        Event.on(container, 'click', clickHandler);
        
        //如果允许双击操作
        if (config.enableMoveItemByDblclick) {
            /**
             * 双击事件句柄
             * @private
             */
            function dblclickHandler(e){
                var t = Event.getTarget(e);
                //如果双击的是可选项元素
                if (SelectCard._checkItemByClass(t,config.itemClass)) {
                    var el = SelectCard._getItemByClass(t,config.itemClass);
                    //添加操作
                    if(Dom.isAncestor(_this.sourceBox, el)){
                        _this.addItems(el);
                    //移除操作
                    }else if(Dom.isAncestor(_this.targetBox, el)){
                        _this.removeItems(el);
                    }
                }
            }
            Event.on(container, 'dblclick', dblclickHandler);
        }
        
        /**
         * 添加按钮激活时触发
         * @name Tback.module.SelectCard#afterEnableAddItemsTrigger
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement | HTMLElement[]} obj.addItemsTrigger 添加按钮
         * @param {HTMLElement} obj.container 总容器
         */
        this.createEvent('afterEnableAddItemsTrigger');
        /**
         * 添加按钮失活时触发
         * @name Tback.module.SelectCard#afterDisableAddItemsTrigger
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement | HTMLElement[]} obj.addItemsTrigger 添加按钮
         * @param {HTMLElement} obj.container 总容器
         */
        this.createEvent('afterDisableAddItemsTrigger');
        /**
         * 移除按钮激活时触发
         * @name Tback.module.SelectCard#afterEnableRemoveItemsTrigger
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement | HTMLElement[]} obj.removeItemsTrigger 添加按钮
         * @param {HTMLElement} obj.container 总容器
         */
        this.createEvent('afterEnableRemoveItemsTrigger');
        /**
         * 移除按钮失活时触发
         * @name Tback.module.SelectCard#afterDisableRemoveItemsTrigger
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement | HTMLElement[]} obj.removeItemsTrigger 添加按钮
         * @param {HTMLElement} obj.container 总容器
         */
        this.createEvent('afterDisableRemoveItemsTrigger');
        
        /**
         * 添加可选项前触发
         * @name Tback.module.SelectCard#beforeAddItems
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement | HTMLElement[]} obj.items 待操作的可选项
         * @param {HTMLElement} obj.container 总容器
         * @param {HTMLElement} obj.sourceBox 源容器
         * @param {HTMLElement} obj.targetBox 目标容器
         */
        this.createEvent('beforeAddItems');
        /**
         * 添加可选项后触发
         * @name Tback.module.SelectCard#afterAddItems
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement | HTMLElement[]} obj.items 待操作的可选项
         * @param {HTMLElement} obj.container 总容器
         * @param {HTMLElement} obj.sourceBox 源容器
         * @param {HTMLElement} obj.targetBox 目标容器
         */
        this.createEvent('afterAddItems');
        /**
         * 移除可选项前触发
         * @name Tback.module.SelectCard#beforeRemoveItems
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement | HTMLElement[]} obj.items 待操作的可选项
         * @param {HTMLElement} obj.container 总容器
         * @param {HTMLElement} obj.sourceBox 源容器
         * @param {HTMLElement} obj.targetBox 目标容器
         */
        this.createEvent('beforeRemoveItems');
        /**
         * 移除可选项后触发
         * @name Tback.module.SelectCard#afterRemoveItems
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {HTMLElement | HTMLElement[]} obj.items 待操作的可选项
         * @param {HTMLElement} obj.container 总容器
         * @param {HTMLElement} obj.sourceBox 源容器
         * @param {HTMLElement} obj.targetBox 目标容器
         */
        this.createEvent('afterRemoveItems');
        
        this.subscribe('afterEnableAddItemsTrigger',function(o){Dom.addClass(o.addItemsTrigger,'enable')});
        this.subscribe('afterDisableAddItemsTrigger',function(o){Dom.removeClass(o.addItemsTrigger,'enable')});
        this.subscribe('afterEnableRemoveItemsTrigger',function(o){Dom.addClass(o.removeItemsTrigger,'enable')});
        this.subscribe('afterDisableRemoveItemsTrigger',function(o){Dom.removeClass(o.removeItemsTrigger,'enable')})
    }
    
    Lang.augmentObject(Tback.module.SelectCard,{
        /**
         * 检查指定对象是否拥有指定class或者有拥有指定class的父级对象
         * @private
         * @params {HTMLElement} t 指定对象
         * @params {String} className 指定class
         * @returns {Boolean} 返回判定结果
         */
        _checkItemByClass:function(t,className){return Dom.hasClass(t, className) || Dom.getAncestorByClassName(t, className)},
        /**
         * 如果指定对象具有指定class，则返回指定对象，否则返回指定对象具有指定class的父级元素
         * @private
         * @params {HTMLElement} t 指定对象
         * @params {String} className 指定class
         * @returns {HTMLElement} 如果指定对象具有指定class，则返回指定对象，否则返回指定对象具有指定class的父级元素
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
         * 获取指定容器中被选中的可选项
         * @private
         * @params {HTMLElement} box 指明要获取哪个容器内选中的可选项
         * @returns {HTMLElement[]} 返回指定容器内被选中的可选项元素数组
         */ 
        _getSelectedItems:function(box){
            var _this=this;
            return Dom.getElementsBy(function(el){return (Dom.hasClass(el, _this.config.itemClass) && Dom.hasClass(el,_this.config.itemSelectedClass));}, '*', box);
        },
        /**
         * 清除所有可选项的选中状态
         * @private
         * @params {HTMLElement} box=this.container 指明要清除哪个容器内的可选项的选中状态
         */
        _clearItemsSelectedState:function(box){
            box=box || this.container;          
            var allItems=Dom.getElementsByClassName(this.config.itemClass,'*',box);
            Dom.removeClass(allItems,this.config.itemSelectedClass);    
            this.fireEvent('afterDisableAddItemsTrigger',{'addItemsTrigger':this.addItemsTrigger});
            this.fireEvent('afterDisableRemoveItemsTrigger',{'removeItemsTrigger':this.removeItemsTrigger});
        },
        /**
         * 容器
         * @type HTMLElement
         */
        container:null,  
        /**
         * 配置
         * @type Object
         */
        config:null,
        /**
         * 源容器
         * @type HTMLElement
         */
        sourceBox:null,
        /**
         * 目标容器
         * @type HTMLElement
         */
        targetBox:null,
        /**
         * 添加按钮
         * @type HTMLElement[]
         */
        addItemsTrigger:null,
        /**
         * 移除按钮
         * @type HTMLElement[]
         */
        removeItemsTrigger:null,
        /**
         * 将源容器的单个指定对象加入到目标容器
         * @private
         * @params {HTMLElement} el 源容器中要添加到目标容器的对象
         */
        _addItem:function(el){
            //如果允许重复添加
            if(this.config.enableRepeatableAdd){
                var newEl=el.cloneNode(true);
                this.targetBox.appendChild(newEl);
            //如果不允许重复添加
            }else{
                this.targetBox.appendChild(el);
            }   
        },
        /**
         * 将源容器的指定对象加入到目标容器
         * @params {HTMLElement | HTMLElement[]} items 要添加到目标容器的对象或对象数组
         */
        addItems:function(items){   
            this.fireEvent('beforeAddItems',{'items':items,'container':this.container,'sourceBox':this.sourceBox,'targetBox':this.targetBox});
            Dom.batch(items,this._addItem,this,true);       
            this._clearItemsSelectedState();
            this.fireEvent('afterAddItems',{'items':items,'container':this.container,'sourceBox':this.sourceBox,'targetBox':this.targetBox});
        },
        /**
         * 将目标容器的单个指定对象移除
         * @private
         * @params {HTMLElement} el 目标容器中要移除的对象
         */
        _removeItem:function(el){
            //如果允许重复添加
            if(this.config.enableRepeatableAdd){
                el.parentNode.removeChild(el);
            //如果不允许重复添加
            }else{
                this.sourceBox.appendChild(el);
            }   
        },
        /**
         * 移除目标容器的指定对象
         * @params {HTMLElement | HTMLElement[]} items 目标容器中要移除的对象或对戏那个数组
         */
        removeItems:function(items){
            this.fireEvent('beforeRemoveItems',{'items':items,'container':this.container,'sourceBox':this.sourceBox,'targetBox':this.targetBox});
            Dom.batch(items,this._removeItem,this,true);
            this._clearItemsSelectedState();
            this.fireEvent('afterRemoveItems',{'items':items,'container':this.container,'sourceBox':this.sourceBox,'targetBox':this.targetBox});
        },
        /**
         * 获得目标容器中添加的item
         * @returns {HTMLElement[]} 返回目标容器中添加的item组成的数组
         */
        getTargetItems:function(){
            return Dom.getElementsByClassName(this.config.itemClass,'*',this.targetBox);
        }
    }
    
    Lang.augmentProto(Tback.module.SelectCard,Util.EventProvider);
    
    //通过Class装饰为SelectCard
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
          
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    //标记是否加载过日历的样式
    var loadStyle=false;

    /**
     * 日历
     * @class
     * @param {String} [calId] 日历的id
     * @param {String | HTMLElement} [calBox] 放置日历的容器
     * @param {String | HTMLElement | HTMLElement[]} [inputTrigger] 触发日历弹出的input对象、对象数组或者id，如不设置此参数
     */
    Tback.module.Calendar=function(calId,calBox,inputTrigger){
        if(!YAHOO.widget.Calendar){
            alert('请加载以下脚本以支持日历组件的运行：\n<script src="http://a.tbcdn.cn/yui/2.7.0/build/calendar/calendar-min.js"></script>');
            return;
        }
        var _this=this;

        // 日历容器
        if(calBox){
            calBox=Dom.get(calBox);
        }else{
            calBox = document.createElement('div');
            calBox.style.zIndex='100';
            Event.onDOMReady(function(){document.body.appendChild(calBox);});
        }

        if(!loadStyle){
            // 动态加载日历css
            YAHOO.util.Get.css(TB.env.yuipath + 'build/calendar/assets/calendar.css');
            //扩展的CSS, Copy自tbra的SimpleCalendar
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

        //将日历设置为中文显示
        this.cfg.setProperty('MY_YEAR_POSITION', 1);
        this.cfg.setProperty('MY_MONTH_POSITION', 2);
        this.cfg.setProperty('MONTHS_LONG',    ['1\u6708', '2\u6708', '3\u6708', '4\u6708', '5\u6708', '6\u6708', '7\u6708', '8\u6708', '9\u6708', '10\u6708', '11\u6708', '12\u6708']);
        this.cfg.setProperty('WEEKDAYS_SHORT', ['\u65e5', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d']);
        this.cfg.setProperty('MY_LABEL_YEAR_POSITION',  1);
        this.cfg.setProperty('MY_LABEL_YEAR_SUFFIX',  '\u5E74');

        this.renderEvent.subscribe(function(){
            // renderEvent中绑定下拉框选择年月的事件，Copy自tbra的SimpleCalendar
            var pd = this.cfg.getProperty(YAHOO.widget.Calendar._DEFAULT_CONFIG.PAGEDATE.key);
            //超出时间范围时隐藏前后导航
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

            // 绑定“置空”和“今天”按钮事件
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
                //用户点击选择了日期才执行
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
            //创建弹出层
            var popupCal=new Tback.module.Popup(inputTrigger,calBox,{width:'auto',height:'auto',disableClick:false});
            popupCal.subscribe('afterShow',function(o){
                _this._curInput=o.curTrigger;
                var date = Tback.module.Calendar.parsePageDate(o.curTrigger.value);
                if (date instanceof Date) {
                    // 解析当期输入的值，并选中该日期。
                    _this.cfg.setProperty('pagedate', date);
                }else{
                    date='';
                    _this._curInput.value='';
                };
                _this._userSelect = false; // 防止调用select()方法时触发selectEvent而隐藏日历。
                _this.select(date);
                _this.render();
                _this._userSelect = true;

            });
            //点击触发元素和日历外的区域，关闭日历
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
         * 根据字符串解析日期对象
         * @param {String} str 要解析的字符串
         * @return {Date|String} 返回解析后的日期对象当解析出错时返回原字符串
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
         * 用来记录当前出发弹出日历的input框
         * @private
         * @type HTMLElement
         */
        _curInput:null,
        /**
         * 标记量，改值为true时，表示selectEvent是用户点击触发的
         * @private
         * @type Boolean
         */
        _userSelect:true,
        /**
         * 日历允许选中的最小年份
         * @type Number
         */
        minYear:1900,
        /**
         * 日历允许选中的最大年份
         * @type Number
         */
        maxYear:2050,
        /**
         * 重设按钮的class
         * @type String
         */
        btnResetClass:'calbtnreset',
        /**
         * 选择今天按钮的class
         * @type String
         */
        btnTodayClass:'calbtntoday',
        /**
         * 重写YUI Calendar的buildMonthLabel方法，增加直接选择年月的功能，Copy自tbra的SimpleCalendar
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
         * 重写renderFooter方法，增加“置空”和“今天”按钮
         * @returns {String} footer部分的html片段
         */
        renderFooter:function(html) {
            html.push('<tfoot><tr><td colspan="7" class="calfootcell"><button type="button" class="' + this.btnResetClass
                + '">置空</button>&nbsp;<button type="button" class="' + this.btnTodayClass + '">今天</button></td></tr></tfoot>');
            return html;
        }
    });

    //通过Class装饰为Calendar
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

    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;

    /**
     * 批量选中
     * @class
     * @param {String | HTMLElement} container 批量选择的容器
     * @param {String} batchSelectClass 触发批量选中的复选框的class
     * @param {String} singleSelectClass 选中单个复选框的class
     * @param {Object} [config] 可选配置
     * @param {String} [config.rowClass] 选中单个复选框所在行容器的class，如果选中某行需要高亮时，就会根据该设置取得行容器，设置了rowClass或rowTagName均可以找到行容器，如果两个属性都设置了，就会寻找跟着两个设置匹配的行容器
     * @param {String} [config.rowTagName] 选中单个复选框所在行的容器的标签名
     * @param {String} [config.rowSelectedClass] 选中单个时，其所在行容器高亮的class
     * @param {String} [config.enableSelectByClickRow] 是否单击行容器内任何地方都选中改行的选中单个复选框
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
            //或取当前点击的行容器
            var row=null;
            if(obj.config.rowClass){
                row=Dom.getAncestorByClassName(t,obj.config.rowClass);
            }else if(obj.config.rowTagName){
                row=Dom.getAncestorByTagName(t,obj.config.rowTagName);
            }
            //如果点击全选复选框
            if(Dom.hasClass(t,obj.batchSelectClass)){
                if(t.checked){
                    obj.selectAll();
                }else{
                    obj.deselectAll();
                }
            //如果点击选中单个复选框
            }else if(Dom.hasClass(t,obj.singleSelectClass)){
                obj._checkIfAllSelected();
                if(t.checked){
                    obj.select(t);
                }else{
                    obj.deselect(t);
                }
            //如果击对象在某行里,且设置了允许通过点击行内任意地方选中该行的选择单个复选框
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
         * 当选中某些选项时发生
         * @name Tback.module.BatchSelect#afterSelect
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object | Array} obj.container 容器
         * @param {Object} obj.el 操作的checkbox对象
         */
        this.createEvent('afterSelect');
        /**
         * 当取消选中某些选项时发生
         * @name Tback.module.BatchSelect#afterDeselect
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object | Array} obj.container 容器
         * @param {Object} obj.el 操作的checkbox对象
         */
        this.createEvent('afterDeselect');
        /**
         * 当选中所有选项时发生
         * @name Tback.module.BatchSelect#afterSelectAll
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object | Array} obj.container 容器
         * @param {Object} obj.el 操作的checkbox对象
         */
        this.createEvent('afterSelectAll');
        /**
         * 当取消选中所有选项时发生
         * @name Tback.module.BatchSelect#afterDeselectAll
         * @event
         * @param {Object} obj 储存参数的对象
         * @param {Object | Array} obj.container 容器
         * @param {Object} obj.el 操作的checkbox对象
         */
        this.createEvent('afterDeselectAll');
    }

    Tback.module.BatchSelect.prototype={
        /**
         * 用于根据checkbox的选中状态来设置该checkbox所在tr的选中样式（有判断）
         * @private
         * @param {HTMLElement} el 依据的checkbox对象
         */
        _setRowSelectedState:function(el){
            if(this.config.rowSelectedClass){
                //或取当前点击的行容器
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
         * 选中单个checkbox
         * @private
         * @param {HTMLElement} 要操作的checkbox对象
         */
        _selectSingle:function(el){
            el.checked=true;
            this._setRowSelectedState(el);
        },
        /**
         * 取消选中单个checkbox
         * @private
         * @param {HTMLElement} 要操作的checkbox对象
         */
        _deselectSingle:function(el){
            el.checked=false;
            this._setRowSelectedState(el);
        },
        /**
         * 检查全选状态
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
         * 容器
         * @type HTMLElement
         */
        container:null,
        /**
         * 批量选中的元素的class
         * @type String
         */
        batchSelectClass:null,
        /**
         * 单个选中的元素的class
         * @type String
         */
        singleSelectClass:null,
        /**
         * 可选配置
         * @type Object
         */
        config:null,
        /**
         * 获取所有的全选checkbox对象
         * @returns {HTMLElement[]} 所有的全选checkbox对象
         */
        getBatchSelectArr:function(){return Dom.getElementsByClassName(this.batchSelectClass,'*',this.container);},
        /**
         * 获取所有选择单个的checkbox对象
         * @returns {HTMLElement[]} 所有选择单个的checkbox对象
         */
        getSingleSelectArr:function(){return Dom.getElementsByClassName(this.singleSelectClass,'*',this.container);},
        /**
         * 获取所有被选中状态的checkbox对象
         * @returns {HTMLElement[] | null} 被选中状态的checkbox对象或null
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
         * 选中指定的checkbox对象
         * @param {HTMLElement | HTMLElement[]} el 要操作的checkbox对象或数组
         */
        select:function(el){
            Dom.batch(el,this._selectSingle,this,true);
            this._checkIfAllSelected();
            this.fireEvent('afterSelect',{'container':this.container,'el':el});
        },
        /**
         * 取消选中指定的checkbox对象
         * @param {HTMLElement | HTMLElement[]} el 要操作的checkbox对象或数组
         */
        deselect:function(el){
            Dom.batch(el,this._deselectSingle,this,true);
            this._checkIfAllSelected();
            this.fireEvent('afterDeselect',{'container':this.container,'el':el});
        },
        /**
         * 全选
         */
        selectAll:function(){
            var el=this.getSingleSelectArr();
            Dom.batch(el,this._selectSingle,this,true);
            this._checkIfAllSelected();
            this.fireEvent('afterSelectAll',{'container':this.container,'el':el});
        },
        /**
         * 取消全选
         */
        deselectAll:function(){
            var el=this.getSingleSelectArr();
            Dom.batch(el,this._deselectSingle,this,true);
            this._checkIfAllSelected();
            this.fireEvent('afterDeselectAll',{'container':this.container,'el':el});
        }
    };

    Lang.augmentProto(Tback.module.BatchSelect, Util.EventProvider);

    //通过Class装饰为Popup
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
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /**
     * @class
     * @params {String} url 获取数据的url
     */ 
    Tback.module.Datasource = function(uri){
       this.uri=uri;
    };
    
    Tback.module.Datasource.prototype = {
        /**
         * 要获取数据的url
         * @type String
         */
        uri:null,
        /**
         * 获取数据的方式，默认为'get',可选值为'get'、'post'
         * @type String
         */
        method:'post',
        /**
         * 获取到最新的数据（目前仅支持json格式）
         * @type Object
         */
        
        liveData:null,
        /**
         * 获取到的数据当中，为list格式的部分数据
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
                            logBox.innerHTML='<div class="box box-weak"><div class="hd"><h3 id="J_LogTitle">Log</h3></div><div class="bd"><ul class="ul-has-icon" id="J_LogUl"></ul></div><div class="ft"><ul class="act"><li><a href="#" id="J_LogClose">关闭</a></li><li><a href="#" id="J_LogClear">清空</a></li></ul></div></div>';
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
                failure:function(){alert('获取数据失败，请刷新页面重试或联系管理员。');},
                scope:this
            };
            Util.Connect.asyncRequest(this.method,this.uri,callBackObj,postData);
        },
        /**
         * 获取指定索引号的listData
         * @param {Number[]} idxArr 要获取的listData的索引号数组
         * @return {Object[]} 返回获指定索引号指向的listData数据
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
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /**
     * 表格组件
     * @class
     * {String | HTMLElement} container 放置表格的容器
     * {Object} config 配置
     * {Object []} [config.dataList] 用于渲染表格的数据
     * {Object []} config.columns 指定列
     * {String} config.columns.header th的文字
     * {String} config.columns.dataField 对应的数据指向
     * {Function} config.columns.parser 接受以传递的数据为唯一参数，将参数转化成需要的形式后返回字符串（暂未实现）
     * {String} config.selectType 设置表格的每行是可单选还是多选，可选值为'checkbox'和'radio'
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
         * 当前渲染tbody对象
         * @type HTMLElement
         */
        _curBodyObj:null,
        /**
         * 之前渲染的tbody对象
         * @type HTMLElement
         */
        _prevBodyObj:null,
        /**
         * 盛放表格的容器
         * @type HTMLElement
         */
        container:null,
        /**
         * 用于生成表格的数据源
         * @type Object[]
         */
        dataList:null,
        /**
         * 表格的列设置
         * @type Object[]
         */
        columns:null,
        /**
         * 表格的行的选择类型
         * @type String
         */
        selectType:null,
        /**
         * 创建的表格对象
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
         * 渲染thead
         * @param {String} returnType='dom' 返回的形式，可选'dom'和'str'
         * @return {HTMLElement | String} 根据参数设置返回渲染好的thead
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
         * 渲染tbody
         * @param {String} returnType='dom' 返回的形式，可选'dom'和'str'
         * @return {HTMLElement | String} 根据参数设置返回渲染好的tbody
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
         * 更新表格数据
         * @param {Object []} [dataList] 用于填充表格的数据源，如果更新了this.dataList，该参数可以不填
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
         * 获取数据表格中被选中的行在datasource中索引数组
         * @return {Number[]} 返回数据表格中被选中的行在datasource中索引数组
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
    title:'表单标题',
    boxStyle:'normal',
    formStyle:'normal',
    buttons:[
        {name:'a',value:'提交',type:'submit'},
        {name:'b',value:'保存',type:'button'},
        {name:'c',value:'重置',type:'reset'}
    ],
    blocks:[
        {
            caption:'基本信息',
            rows:2,
            columns:2,
            items:[
                {
                    boxLabel: '姓名',
                    required:true,
                    row:1,
                    column:1,
                    fields:[
                        { xtype:'input',name:'name',value:'fool2fish'}
                    ]
                },
                {
                    boxLabel:'性别',
                    row:2,
                    column:1,
                    fields:[
                        {xtype:'radio',name:'sex',value:'male',label:'男'},
                        {xtype:'radio',name:'sex',value:'female',label:'女',checked:true},
                        {xtype:'radio',name:'sex',value:'shemale',label:'人妖'}
                    ]
                },
                {
                    boxLabel:'爱好',
                    row:2,
                    column:2,
                    fields:[
                        {xtype:'checkbox',name:'fav',value:'fav1',label:'吃',labelPosition:'right',checked:true},
                        {xtype:'checkbox',name:'fav',value:'fav2',label:'喝',labelPosition:'right',checked:true},
                        {xtype:'checkbox',name:'fav',value:'fav3',label:'玩',labelPosition:'right'},
                        {xtype:'checkbox',name:'fav',value:'fav4',label:'乐',labelPosition:'right'}
                    ]
                }
            ]
        },
        {
            caption:'扩展信息',
            foldState:'fold',
            rows:3,
            columns:1,
            items:[
                {
                    boxLabel:'签名档',
                    row:1,
                    column:1,
                    fields:[
                         { xtype:'input',name:'signature',value:'这个人很懒，什么也没写…',width:2}
                    ]
                },
                {
                    boxLabel:'发消息给她',
                    row:2,
                    column:1,
                    fields:[
                        {xtype:'select',name:'template',width:2,label:'消息模板',options:[]},
                        {xtype:'br'},
                        {xtype:'textarea',name:'msg',width:4,height:2,label:'消息内容'},
                        {xtype:'br'},
                        {xtype:'checkbox',name:'sendmsgby',value:'ww',label:'旺旺',labelPosition:'right'},
                        {xtype:'checkbox',name:'sendmsgby',value:'letter',label:'站内信',labelPosition:'right'}
                    ]
                }
            ]
        }
    ]
}
*/
(function() {
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
    
    /**
     * 表单
     * @class
     * @param {HTMLElement | String} container 盛放表单的
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
         * 填充数据到表单里
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
          
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * 级联选择
     * @class
     */ 
    Tback.module.CascadeSelect=function(container,selectClassName,datasource,initPostData){
        var _this=this;
        container=Dom.get(container);
        this.container=container;
        //如果设置了selectClassName，则根据该值取得所有级联选项（目前只支持select方式，以后可以扩展到非select方式）
        if(selectClassName){
            this.selectArr=Dom.getElementsByClassName('selectClassName','*',container);
        //否则获取容器下所有的select为级联选项
        }else{
            this.selectArr=container.getElementsByTagName('select');
        }
        //给级联选项设置索引
        for(var i=0,len=this.selectArr.length;i<len;i++){
            this.selectArr[i].setAttribute('idx',i);
        }
        //设置datasource
        if(Lang.isString(datasource)){
            this.datasource=new Tback.module.Datasource(datasource);
        }else{
            this.datasource=datasource;
        }
        //初始化级联菜单的第一个select
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
                    option.innerHTML = '请选择';
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

        //给所有的级联选项注册选择事件（目前只支持select方式）
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
                            option.innerHTML = '请选择';
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
                            option.innerHTML = '请选择';
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
    
    //通过Class装饰为Popup
    /*Tback.sys.Decorator.register('popup', function(root) {
        Dom.getElementsByClassName('J_AutoPopupTrigger', '*', root).forEach(function(el) {
            Tback.sys.ComponentManager.add(new Tback.module.Popup(el , el.getAttribute('data-target')), el, 'popup');
        });
    });*/
    
})();

(function() {
          
    //常用变量缩写
    var Util = YAHOO.util,
        Dom = Util.Dom, 
        Event = Util.Event,
        CustomEvent = Util.CustomEvent,
        Lang = Util.Lang;
        
    /**
     * 切换目标元素的显示和隐藏
     * @class
     * @param {String | HTMLElement} trigger 触发元素
     * @param {String | HTMLElement} target 切换显示的目标对象
     * @param {Object} [config] 配置
     * @param {String[]} [config.triggerStateClass] [目标对象显示时触发元素的附加class，目标对象隐藏时触发元素的class]，目标对象处于显示和隐藏状态时触发元素的附加class，用以切换触发元素的收起和展开样式
     * @param {String} [config.hideType='display'] 隐藏目标对象的方式，可选值'display'/'height'，如果为'display'方式，则隐藏时设置display:none，为'height'方式，则隐藏时设置height:0px,overflow:hidden
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