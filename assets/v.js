/**
 * 小二工作台 页面渲染控制
 *
 * 组件库，包括各个常用的后台控件，如dropMenu、dropMenuPopup、Popup、Button等
 *
 * 生成方式一：
 * 自动生成，通过在页面中插入script块（其type为wbc）来实现，每个script块代表了一段配置脚本。wb会自动处理这些配置脚本，并生成相应地组件。
 *
 * 生成方式二：通过传统的new方式去创建
 *
 * 组件创建方式：
 * var someComponent = new ComponentName(container, config)
 *
 * 在自动创建的时候，会创建新的container替换配置脚本所在的script。
 *
 * 配置参数：
 * {
 *    id: 容器id（创建的组件id）
 *    cls: 容器class
 *    componentName: 组件名称
 *    data: 提供给组件的数据
 *    name: 表单域名称
 *    form：要被附加表单域的表单
 *    autoAttchForm: 默认为true，在form的submit事件中提交
 *    message 自定义消息列表(组件一般会提供预定义名称的消息列表，但可以通过message参数来重订消息名称，方便接收处理)
 * }
 *
 * 组件的一些方法
 * set 设置，参考Attribute。一般有以下几种Attribute:
 *      content: 设置内容（html）
 *      label:   设置标签
 *      value:   对应的值同，仅针对单个值，比如dropMenu。对于dropMenuPopup这种，返回空值
 *      name:    表单域值
 *      data     类似于content，但不一定是html了，可能是个数组，或者是个对象
 *
 * 不同组件支持的attribute不同
 *
 * 查找元素通用方法：
 * findElement 查找元素，返回单个
 * findElements 查找元素，返回数组
 *
 * 表单&数据传递
 * serialize 序列化值
 * attachForm 附加值到表单中
 *
 * 通用message:
 * init 组件创建完毕
 * destory 组件销毁前（对于一些组件来说，需要在这个时候removeEventListener）
 *
 * xianyu.hrh@taobao.com
 */

//KISSY.Config.debug = true;

/**
 * 创建一个M，在没有引入消息组件的时候，保证消息部分的正常工作
 */
if(!KISSY.isObject(M)){
    M = (function(){
        var f = function(){};
        return {
            post : f,
            val  : f,
            bind : f,
            once : f
        };
    })();
}

/**
 * 组件管理类
 */
KISSY.add('wb/component', function(S, D, E){
    var win = window, doc = win.document, _instance;

    //内部实现点击文档时隐藏popup等作用
    //@todo 迁移到管理类中完成
    E.on(doc, 'click', function(ev){
        M.post('_wb_clickDocument', ev);
    });
    
    return {
        /**
         * 渲染并生成组件
         */
        render: function(config, ele){
            var name = 'wb/component/' + config.componentName;
            //if(S.Env.mods[name]){  //判断模式是否存在先，如果不存在，就不创建了
                S.use(name, function(S, C){
                    var container = doc.createElement('div');
                    if(config.id){
                        container.id = config.id;
                    }
                    container.className = 'wbc wbc-' + config.componentName + (config.cls ?  (' ' + config.cls) : '');
                    ele.parentNode.replaceChild(container, ele);
                    new C(container, config); 
                });
            //}
        }
    };
}, {
    requires: ['dom', 'event']
});

/**
 * 组件的一个基类（考虑到不同组件的实现方式不同，并不是都从此extend，而是augment，因此称为基类并不严格正确）
 */
KISSY.add('wb/component/base', function(S, D, E){
    function Base(){}

    //固定配置，不随用户自定义配置而改变
    Base.solidConfig = {
        prefixCls: 'goog-'
    };

    //基本class
    Base.baseCls    = 'wbc-component';

    //默认前缀
    Base.prefixCls  = 'wbc-';

    //serialize的辅助方法
    //arr: [obj1, obj2,...]
    //obj: {k:k,v:v} k-key-name,v-value
    Base.serialize = function(arr, format){
        if('object' === format){
            var obj = {}, tmp;
            for(var i = 0, len = arr.length; i < len; i++){
                tmp = arr[i];
                obj[tmp.k] = tmp.v;
            }
            return obj;
        }else if('array' === format){
            return arr;
        }else{
            var buf = [], tmp, encode = encodeURIComponent;
            for(var i = 0, len = arr.length; i < len; i++){
                tmp = arr[i];
                buf.push(encode(tmp.k) + '=' + encode(tmp.v));
            }
            return buf.join('&');
        }
    }

    var BaseProto = {
        /**
         * 构造方法（init方法换了个名字）
         */
        _construct: function(){ },
        /**
         * 析构方法（用于移除各种eventListener等）
         */
        _destruct: function(){ }, 
        /**
         * messageObject封装方法
         *
         * @param {object} 消息对象
         */
        _wrapMessageObject: function(mo){
            mo = mo || {};
            mo.instance = this;
            return mo;
        },
        /**
         * 初始化Attr
         * el、contentEl
         * content、label、value、name、data
         */
        _initAttr: function(){ },
        /**
         * 序列化表单域
         *
         * dataFormat ,支持以三种数据格式返回：string、object、array。默认是string
         */
        serialize: function(format){ 
            var self = this,
                name = self.config.name,
                data = [];

            if(name){
                data.push({
                    k: name,
                    v: self.get('value')
                });
            }else{
                //尝试从contentEl中取值
                var contentEl = self.get('contentEl'),
                    ah = {};
                if(contentEl){
                    S.each([].concat(D.query('input'     , contentEl),
                        D.query('button'    , contentEl),
                        D.query('textarea'  , contentEl),
                        D.query('select'    , contentEl)), function(ele){
                        //禁用或者没有控件名的，过
                        if(ele.disabled || !ele.name){
                            return;
                        }

                        var name = ele.name,
                            val  = D.val(ele),
                            vs;

                        //kissy ajax form-serializ
                        //处理出现两个同名name控件的情况
                        vs = ah[name] = ah[name] || [];
                        vs.push(val);
                    });
                    //处理得到的值
                    for(var k in ah){
                        var val = ah[k],
                            len = val.length,
                            v;
                        if(2 > len){
                            v = val.shift() || '';
                            v && data.push({
                                k: k,
                                v: v
                            });
                        }else{
                            for(var i = 0; i < len; i++){
                                v = val[i];
                                v && data.push({
                                    k: k + '[' + i + ']',
                                    v: v
                                });
                            }
                        }
                    }
                }
            }

            if(data){
                return Base.serialize(data, format);
            }
        },
        /**
         * 附加表单值到指定的表单中
         * @todo 扩展到组件与组件之间的数据交换中
         */
        attachForm: function(){
            var self = this,
                fm   = D.get(self.config.form)

            if(!fm){
                return;
            }

            var data = self.serialize('array');
            if(!data){
                return;
            }

            var eles = fm.elements,
                create = function(key, val, context){
                    var ele   = document.createElement('input');
                    ele.type  = 'hidden';
                    ele.name  = key;
                    ele.value = val;
                    context.appendChild(ele);
                };
            for(var i = 0, len = data.length; i < len; i++){
                var obj = data[i], key = obj.k, val = obj.v; 
                eles[key] ? (eles[key] = val) : create(key, val, fm);
            }
        },
        /**
         * 查找组件内的元素并返回
         * @return {HTMLElement|undefined}
         */
        findElement: function(selector, filter){
            var eles = this.findElements(selector, filter);
            if(eles){
                return eles.shift();
            }
        },
        /**
         * 查找组件内的元素并以数组形式返回
         * @return {Array|undefined}
         */
        findElements: function(selector, filter){
            var contentEl = this.get('contentEl');
            if(contentEl){
                var eles = D.filter(selector, S.isFunction(filter) ? filter : function(){ return true; }, contentEl);
                if(eles.length){
                    return eles;
                }
            }
        }
    };

    /**
     * 拓展组件，为组件扩展Attribute、EventTarget、WB-Base
     */ 
    Base.extend = function(instance){
        var c = instance.constructor;
        //扩展kissy Base
        if(!instance.set){
            S.augment(c, S.Base);
            S.Base.constructor.call(instance);
        }
        //扩展kissy event target
        if(!instance.on){
            S.augment(c, E.EventTarget);
        }
        //扩展wb Base
        //由于目前采用的方式，在执行此函数时，instance已经生成完毕，因此必须用此方式，才能使BaseProto中的方法不覆盖instance中所写的方法
        for(var p in BaseProto){
            if(!instance[p]){
                instance[p] = BaseProto[p];
            }
        }
    };
    
    return Base;
}, {
    requires: ['dom', 'event']
});

KISSY.add('wb/v', function(S, D, E, Component){
    var win = window, doc = win.document;
    S.namespace('workbench',true);
    workbench.components=[];
    return {
        /**
         * 初始化指定content中的组件
         */
        init: function(context){
            context = context || document;
            S.each(D.query('script', context), function(script){
                if('component' !== script.type){
                    return;
                }
                try{
                    var config = eval('(' + script.innerHTML + ')');
                }catch(e){
                    S.log('parse component config error: ' + e);
                }
                if(config && config.componentName){
                  Component.render(config, script);
                }
                
            });
        }
    };
}, {
    requires: ['dom', 'event', './component']
});

KISSY.add('wb', function(S, View, Component){
    return {
        View: View,
        Component: Component
    };
}, {
    requires: ['wb/v', 'wb/component']
});

/**
 * 组件配置
 */
KISSY.config({
    packages:[
        {
            name:"wb", 
            tag:"20120105",
            path: (document.getElementsByTagName("script")[0].src.indexOf(".daily") === -1 ? 'http://a.tbcdn.cn/' : 'http://assets.daily.taobao.net/') + "apps/campaignadmin/",
            charset:"gbk"
        }
    ]
});


KISSY.ready(function(){
    KISSY.use('wb', function(S, WB){
        WB.View.init();
    });
});
