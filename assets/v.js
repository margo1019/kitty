/**
 * С������̨ ҳ����Ⱦ����
 *
 * ����⣬�����������õĺ�̨�ؼ�����dropMenu��dropMenuPopup��Popup��Button��
 *
 * ���ɷ�ʽһ��
 * �Զ����ɣ�ͨ����ҳ���в���script�飨��typeΪwbc����ʵ�֣�ÿ��script�������һ�����ýű���wb���Զ�������Щ���ýű�����������Ӧ�������
 *
 * ���ɷ�ʽ����ͨ����ͳ��new��ʽȥ����
 *
 * ���������ʽ��
 * var someComponent = new ComponentName(container, config)
 *
 * ���Զ�������ʱ�򣬻ᴴ���µ�container�滻���ýű����ڵ�script��
 *
 * ���ò�����
 * {
 *    id: ����id�����������id��
 *    cls: ����class
 *    componentName: �������
 *    data: �ṩ�����������
 *    name: ��������
 *    form��Ҫ�����ӱ���ı�
 *    autoAttchForm: Ĭ��Ϊtrue����form��submit�¼����ύ
 *    message �Զ�����Ϣ�б�(���һ����ṩԤ�������Ƶ���Ϣ�б�������ͨ��message�������ض���Ϣ���ƣ�������մ���)
 * }
 *
 * �����һЩ����
 * set ���ã��ο�Attribute��һ�������¼���Attribute:
 *      content: �������ݣ�html��
 *      label:   ���ñ�ǩ
 *      value:   ��Ӧ��ֵͬ������Ե���ֵ������dropMenu������dropMenuPopup���֣����ؿ�ֵ
 *      name:    ����ֵ
 *      data     ������content������һ����html�ˣ������Ǹ����飬�����Ǹ�����
 *
 * ��ͬ���֧�ֵ�attribute��ͬ
 *
 * ����Ԫ��ͨ�÷�����
 * findElement ����Ԫ�أ����ص���
 * findElements ����Ԫ�أ���������
 *
 * ��&���ݴ���
 * serialize ���л�ֵ
 * attachForm ����ֵ������
 *
 * ͨ��message:
 * init ����������
 * destory �������ǰ������һЩ�����˵����Ҫ�����ʱ��removeEventListener��
 *
 * xianyu.hrh@taobao.com
 */

//KISSY.Config.debug = true;

/**
 * ����һ��M����û��������Ϣ�����ʱ�򣬱�֤��Ϣ���ֵ���������
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
 * ���������
 */
KISSY.add('wb/component', function(S, D, E){
    var win = window, doc = win.document, _instance;

    //�ڲ�ʵ�ֵ���ĵ�ʱ����popup������
    //@todo Ǩ�Ƶ������������
    E.on(doc, 'click', function(ev){
        M.post('_wb_clickDocument', ev);
    });
    
    return {
        /**
         * ��Ⱦ���������
         */
        render: function(config, ele){
            var name = 'wb/component/' + config.componentName;
            //if(S.Env.mods[name]){  //�ж�ģʽ�Ƿ�����ȣ���������ڣ��Ͳ�������
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
 * �����һ�����ࣨ���ǵ���ͬ�����ʵ�ַ�ʽ��ͬ�������Ƕ��Ӵ�extend������augment����˳�Ϊ���ಢ���ϸ���ȷ��
 */
KISSY.add('wb/component/base', function(S, D, E){
    function Base(){}

    //�̶����ã������û��Զ������ö��ı�
    Base.solidConfig = {
        prefixCls: 'goog-'
    };

    //����class
    Base.baseCls    = 'wbc-component';

    //Ĭ��ǰ׺
    Base.prefixCls  = 'wbc-';

    //serialize�ĸ�������
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
         * ���췽����init�������˸����֣�
         */
        _construct: function(){ },
        /**
         * ���������������Ƴ�����eventListener�ȣ�
         */
        _destruct: function(){ }, 
        /**
         * messageObject��װ����
         *
         * @param {object} ��Ϣ����
         */
        _wrapMessageObject: function(mo){
            mo = mo || {};
            mo.instance = this;
            return mo;
        },
        /**
         * ��ʼ��Attr
         * el��contentEl
         * content��label��value��name��data
         */
        _initAttr: function(){ },
        /**
         * ���л�����
         *
         * dataFormat ,֧�����������ݸ�ʽ���أ�string��object��array��Ĭ����string
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
                //���Դ�contentEl��ȡֵ
                var contentEl = self.get('contentEl'),
                    ah = {};
                if(contentEl){
                    S.each([].concat(D.query('input'     , contentEl),
                        D.query('button'    , contentEl),
                        D.query('textarea'  , contentEl),
                        D.query('select'    , contentEl)), function(ele){
                        //���û���û�пؼ����ģ���
                        if(ele.disabled || !ele.name){
                            return;
                        }

                        var name = ele.name,
                            val  = D.val(ele),
                            vs;

                        //kissy ajax form-serializ
                        //�����������ͬ��name�ؼ������
                        vs = ah[name] = ah[name] || [];
                        vs.push(val);
                    });
                    //����õ���ֵ
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
         * ���ӱ�ֵ��ָ���ı���
         * @todo ��չ����������֮������ݽ�����
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
         * ��������ڵ�Ԫ�ز�����
         * @return {HTMLElement|undefined}
         */
        findElement: function(selector, filter){
            var eles = this.findElements(selector, filter);
            if(eles){
                return eles.shift();
            }
        },
        /**
         * ��������ڵ�Ԫ�ز���������ʽ����
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
     * ��չ�����Ϊ�����չAttribute��EventTarget��WB-Base
     */ 
    Base.extend = function(instance){
        var c = instance.constructor;
        //��չkissy Base
        if(!instance.set){
            S.augment(c, S.Base);
            S.Base.constructor.call(instance);
        }
        //��չkissy event target
        if(!instance.on){
            S.augment(c, E.EventTarget);
        }
        //��չwb Base
        //����Ŀǰ���õķ�ʽ����ִ�д˺���ʱ��instance�Ѿ�������ϣ���˱����ô˷�ʽ������ʹBaseProto�еķ���������instance����д�ķ���
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
         * ��ʼ��ָ��content�е����
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
 * �������
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
