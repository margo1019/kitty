/**
 * M 消息管理组件，包括消息管理和值管理
 *
 * 场合一：事件委托。非常适用于可以冒泡的事件，如鼠标事件
 * 场合二：组件、对象间的通信，一对多的场景
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
                arr[i] && fn(arr[i], i); //仅遍历有效项
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
     * 监听消息
     * messageName 消息名称，多个消息名间以,分隔
     * handler 消息回调函数
     */
    M.bind = function(messageName, handler){
        _bind(messageName, handler);
    };
    
    /**
     * 监听消息，但是是一次性的
     */
    M.once = function(messageName, handler){
        var fn = function(){
            handler.apply({}, arguments);
            M.unbind(messageName,fn);
        };
        M.bind(messageName,fn);
    };

    /**
     * 信息监听消息
     *
     * 如果没有传入handler，则移除指定消息的全部监听
     */
    M.unbind = function(messageName, handler){
        _unbind(messageName, handler);
    };

    /**
     * 发送消息
     * param1 messageName 消息名称，多个消息间以,分隔
     * param2 开始是消息对象列表，可以是单个对象，也可以传入多个。在调用消息回调函数时，将按顺序传入这些参数。一般传入一个json对象即可
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
     * 消息名称封装器，适用于回调的场合，如：
     * M.bind('getUserInfo', function(userInfo){ })
     * KISSY.jsonp('url', M.wrap('getUserInfo'));
     */
    M.wrap = function(messageName){
        return function(){
            M.post.apply({}, [messageName].concat(arg2arr(arguments)));
        };
    };
    /**
     * 值管理
     * var v = M.val('valName') 获取值
     * M.val('valName', 123)  设置值
     *
     * @todo useDeep 是否深拷贝，对于传入的对象来说，产生一个新值，此值就和传入的value无关了
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
     * 监听某个值的变化
     *
     * 如微博上可以把好友数放到值管理中，再去这个好友数的变化。当变化时，改变有显示好友数地方的值
     */
    M.watch = function(valName, handler){
        _bind(valName, handler, v);
    };

    /**
     * 停止观察值的变化
     */
    M.unwatch = function(valName, handler){
        _unbind(valName, handler, v);
    };

    /**
     * 擦除值，完全地移去
     */
    M.wipe = function(valName){
        deleteKey(valName, 'v');
    };

    /**
     * 置值包装器
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
