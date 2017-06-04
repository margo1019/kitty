/**
 * M ��Ϣ���������������Ϣ�����ֵ����
 *
 * ����һ���¼�ί�С��ǳ������ڿ���ð�ݵ��¼���������¼�
 * ���϶��������������ͨ�ţ�һ�Զ�ĳ���
 *
 * @author cnhruhua@gmail.com
 *
 */
(function(win){
    var M = {},
        handlers = {},
        variables = {},
        SPACE = / /g,
        toString = Object.prototype.toString,
        type = function(val){
            return toString.call(val).slice(8, -1);
        },
        partition = function(s){
            s = s || '';
            return s.split(SPACE);
        },
        each = function(arr, fn){
            for(var i = 0, len = arr.length; i < len; i++){
                arr[i] && fn(arr[i], i); //��������Ч��
            }
        },
        m = function(key){
            return 'm' + key;
        },
        v = function(key){
            return 'v' + key;
        },
        isSupportDeep = function(value){
            return false;
        },
        getHandlerObj = function(key){
            if(!(key in handlers)){
                return handlers[key] = { handlers: [] };
            }
            return handlers[key];
        },
        getVariableObj = function(key){
            if(!(key in variables)){
                return variables[key] = { };
            }
            return variables[key];
        },
        deleteKey = function(key, type){
            var obj = (type !== 'v') ? handlers : variables;
            obj[key] = null;
            delete obj[key];
        },
        arg2arr = function(arg){
            return [].slice.call(arg);
        },
        _bind = function(messageName, handler, prefix){
            prefix = prefix || m;
            each(partition(messageName), function(message){
                getHandlerObj(prefix(message)).handlers.push(handler);
            })
        },
        _unbind = function(messageName, handler, prefix){
            prefix = prefix || m;
            messageName = partition(messageName);
            handler ? each(messageName, function(message){
                var obj = getHandlerObj(prefix(message)), hs = [];
                each(obj.handlers, function(fn){
                    if(fn !== handler){
                        hs.push(fn);
                    }
                });
                obj.handlers = hs;
            }) : each(messageName, function(message){
                deleteKey(prefix(message));
            });
        },
        _post = function(args, prefix){
            var messageName = args.shift(),
                prefix = prefix || m;
            each(partition(messageName),function(message){
                message && each(getHandlerObj(prefix(message)).handlers, function(handler){
                    handler.apply({}, args);
                });
            });
        };


    /**
     * ������Ϣ
     * messageName ��Ϣ���ƣ������Ϣ������,�ָ�
     * handler ��Ϣ�ص�����
     */
    M.bind = function(messageName, handler){
        _bind(messageName, handler);
    };
    
    /**
     * ������Ϣ��������һ���Ե�
     */
    M.once = function(messageName, handler){
        var fn = function(){
            handler.apply({}, arguments);
            M.unbind(messageName,fn);
        };
        M.bind(messageName,fn);
    };

    /**
     * ��Ϣ������Ϣ
     *
     * ���û�д���handler�����Ƴ�ָ����Ϣ��ȫ������
     */
    M.unbind = function(messageName, handler){
        _unbind(messageName, handler);
    };

    /**
     * ������Ϣ
     * param1 messageName ��Ϣ���ƣ������Ϣ����,�ָ�
     * param2 ��ʼ����Ϣ�����б������ǵ�������Ҳ���Դ��������ڵ�����Ϣ�ص�����ʱ������˳������Щ������һ�㴫��һ��json���󼴿�
     *
     * <code>
     * M.bind('selectAll', function(v1, v2){  })
     * M.post('selectAll', var1, var2)
     * </code>
     */
    M.post = function(){
        _post(arg2arr(arguments));
    };

    /**
     * ��Ϣ���Ʒ�װ���������ڻص��ĳ��ϣ��磺
     * M.bind('getUserInfo', function(userInfo){ })
     * KISSY.jsonp('url', M.wrap('getUserInfo'));
     */
    M.wrap = function(messageName){
        return function(){
            M.post.apply({}, [messageName].concat(arg2arr(arguments)));
        };
    };
    /**
     * ֵ����
     * var v = M.val('valName') ��ȡֵ
     * M.val('valName', 123)  ����ֵ
     *
     * @todo useDeep �Ƿ���������ڴ���Ķ�����˵������һ����ֵ����ֵ�ͺʹ����value�޹���
     */
    M.val = function(valName, value, useDeep){
        if( 1 === arguments.length){
            return getVariableObj(valName).val;
        }else{
            if(useDeep && isSupportDeep(value)){
                //value = value;
            }
            var obj = getVariableObj(valName),
                oldValue = obj.val;
            obj.val = value;
            _post([valName, value, oldValue, valName], v);
        }
    };

    /**
     * ����ĳ��ֵ�ı仯
     *
     * ��΢���Ͽ��԰Ѻ������ŵ�ֵ�����У���ȥ����������ı仯�����仯ʱ���ı�����ʾ�������ط���ֵ
     */
    M.watch = function(valName, handler){
        _bind(valName, handler, v);
    };

    /**
     * ֹͣ�۲�ֵ�ı仯
     */
    M.unwatch = function(valName, handler){
        _unbind(valName, handler, v);
    };

    /**
     * ����ֵ����ȫ����ȥ
     */
    M.wipe = function(valName){
        deleteKey(valName, 'v');
    };

    /**
     * ��ֵ��װ��
     *
     * S.jsonp('url', function(data){  userInfo = data; })
     * S.jsonp('url', M.weep('userInfo'));
     */
    M.weep = function(valName, useDeep){
        return function(value){
            M.val(valName, value, useDeep);
        };
    };

    win.M = M;

})(this);
