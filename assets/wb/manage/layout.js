/**
 * 简易的布局管理
 * 
 *
 * @todo 造成滚动条，需要再仔细调整，现在是给body加上overflow:hidden来缓解
 * @todo 改成类
 */
KISSY.add('wb/manage/layout', function(S, D, E){
    var reAvailNodeName = /^(iframe|div|p|section)$/i,
        ATTR_LAYOUT = 'wb-layout',
        ATTR_LAYOUT_ID = 'wb-layout-id',
        /**
         * node
         * config
         * childLayoutIds
         * parent
         */
        atoms = {0:{id:0}};  //布局节点

    /**
     * 解析元素上的布局信息
     *
     * @param ele {HTMLElement} 要分析的布局元素
     * @return idx {Number} 布局ID
     */
    function analyLayoutElement(ele){
        var idx = analyLayoutElement.idx++,
            config;

        ele.setAttribute(ATTR_LAYOUT_ID, idx);
            
        var atom = atoms[idx] = atoms[idx] || {};
        atom.id = idx;
        atom.node = ele;

        try{
            config = eval('(' + D.attr(ele, ATTR_LAYOUT) + ')');
        }catch(e){}
        config = S.merge({
            type    : 'row',
            control : false
        }, config || {});

        config.width && (config.width = parseDimensionRule(config.width));
        config.height && (config.height = parseDimensionRule(config.height));

        atom.config = config;
        atom.parent = ele.parentNode.getAttribute(ATTR_LAYOUT_ID) || 0;

        //根据布局设定为元素添加样式
        if('column' == config.type){    //占据一列，则需要设定其float:left
            D.css(ele, 'float', 'left');
        }else if('row' == config.type){ //占据一行
            D.css(ele, {
                'float'   : 'static',
                'display' : 'block'
            })
        }

        /**
        if(config.control){
            var div = document.createElement('div'), controlType = config.control;

            if('drag' === controlType){
                div.innerHTML = '<div class="wbc-dragbar"><div class="wbc-slug"></div></div>';
            }else if('scroll' === controlType){
                div.innerHTML = '<div class="wbc-scrollbar"><div class="wbc-slug"></div></div>';
            }else{
                div.innerHTML = '<div class="wbc-scrollbar"><div class="wbc-dragbar"><div class="wbc-slug"></div></div></div>';
            }

            div.className = 'wbc-controlbar';
            document.body.appendChild(div);
            atom.controlbar = div;
        }
        **/

        return idx;
    }
    analyLayoutElement.idx = 1;
    
    /**
     *     'auto'
     *     ',200' 最大200
     *     '200,' 最小200
     *     '100,200' 在100-200之间
     *     '100,0' 在100到占满间
     *     '200'  固定在200px
     *     数字、//百分数(要么全数字，要么全百分数)
     */
    function parseDimensionRule(str){
        var setting = {
            unit: 'px'
        };

        //if(~str.indexOf('%')){
            //setting.unit = '%';
            //str = str.replace(/%/g, '');
        //}else{
            //setting.unit = 'px';
        //}

        //纯粹的数字
        if(/^\d*$/.test(str)){
            setting.max = setting.min = str - 0;
        }else if(~str.indexOf(',')){
            var x = str.split(',');
            if(2 == x.length){
                setting.min = x[0] - 0;
                setting.max = x[1] - 0;
            }
        }
    
        return setting;
    }

    /**
     * 遍历元素(递归)
     */
    function walkElement(context){
        context = D.get(context || document.body);

        if(!context){
            return;
        }

        var ele = context.firstChild,
            hasFound = false,   //是否找到了布局节点
            childLayoutIds = [],         //保存的子布局节点ID
            stack = [];         //保存遍历过的元素
        while(ele){
            if(1 == ele.nodeType && reAvailNodeName.test(ele.nodeName)){
                if(hasFound || ele.getAttribute(ATTR_LAYOUT)){
                    if(!hasFound){  //此时需要遍历之前保存的元素，将其设置为layout节点
                        for(var i = 0, len = stack.length; i < len; i++){
                            childLayoutIds.push(analyLayoutElement(stack[i]));
                        }
                        hasFound = true;
                    }
                    childLayoutIds.push(analyLayoutElement(ele));
                }

                //放入栈中
                stack.push(ele);
            }
            ele = ele.nextSibling;
        }

        var layoutId = context.getAttribute(ATTR_LAYOUT_ID) || 0;
        if(layoutId in atoms && childLayoutIds.length){
            atoms[layoutId].child = childLayoutIds;
        }

        for(var i = 0, len = stack.length; i < len; i++){
            walkElement(stack[i]);
        }
    }
    
    return {
        /**
         * 初始化布局
         *
         * 从body子节点开始遍历，凡是有wb-layout属性的，将其以及它的兄弟节点纳入管理，并遍历其子孙节点
         */
        init: function(context){
            walkElement(context);
            //console.log(atoms);

            var self = this;
            self.reflow();

            E.on(window, 'resize', function(){
                self.reflow();
            });
        },
        reflow: function(layoutid){
            var root, rw, rh;
            if(layoutid in atoms){
                root = atoms[layoutid].node;
                rw = D.width(root);
                rh = D.height(root);
            }else{
                root = document.body;
                rw = D.viewportWidth();
                rh = D.viewportHeight();
            }

            //console.log(rw, rh);

            var atom = atoms[root.getAttribute(ATTR_LAYOUT_ID) || 0];
            if(atom && atom.child){
                var child = atom.child,
                    boxAtom,
                    filltype,
                    used = 0,
                    config, childAtom, node;

                //计算时需要根据第一个atom来判断这一组atom是row布局，还是column布局
                //如果是row布局，那么每个atom的宽度是相同的，而height则根据定义计算
                //如果是column布局，那么每个atom的高度是相同，而width则根据定义计算
                

                for(var i = 0, len = child.length; i < len; i++){
                    childAtom = atoms[child[i]];
                    if(childAtom){
                        //在同级里，只允许一个元素是box定位，以找到的第一个box为准
                        //@todo 迁移到上方进行判断
                        config = childAtom.config;
                        if(!boxAtom && 'box' == config.type){
                            boxAtom = childAtom;
                            continue;
                        }
                        //@todo 迁移到上方进行判断
                        if(!filltype){
                            //如果当前的类型是row，那么当前所有子节点都认为是一行行的，则此时可以有一个box，允许它占据更多的高度
                            filltype = 'row' == config.type ? 'height' : 'width';
                        }

                        node = childAtom.node;
                        if('width' == filltype){    //column布局
                            D.css(node, 'height', rh);

                            var width = D.width(node), widthConfig = config.width;

                            //column布局是，如果当前atom有配置width，则需要根据width来判断
                            if(widthConfig){
                                width = Math.min(width, widthConfig.max);
                                width = Math.max(width, widthConfig.min);
                                node.style.width = width + 'px';
                            }

                            used += width;
                        }else{
                            //D.css(node, 'width', rw);
                            used += D.height(node);
                        }

                    }
                }

                if(boxAtom){
                    node = boxAtom.node;
                    if('width' == filltype){
                        D.css(node, 'width', rw - used);
                        D.css(node, 'height', rh);
                        D.css(node, 'float', 'left');
                    }else{
                        D.css(node, 'height', rh - used);
                        //D.css(node, 'width', rw);
                    }

                    if('IFRAME' === node.nodeName){
                        node.frameBorder = '0';
                    }
                }

                for(var i = 0, len = child.length; i < len; i++){
                    this.reflow(child[i]);
                }
            }
        },
        /**
         * 增加一个行。允许行动态改变大小
         *
         * 行的行为有：
         * 1、为行增加一个控制条，拖动时，改变其大小，此时其他行将动态的改变高度（改变值由每行去平摊），但设置成固定高度的行例外
         * 2、点击控制条时可以实现切换行的最大化和最小化
         *
         * 配置方法：
         * {
         *     type: 'row|column|box|auto',  box是一个尽量撑满的盒子，auto是一个保持原样的盒子
         *     width|height: 'auto'
         *                   ',200' 最大200
         *                   '200,' 最小200
         *                   '100,200' 在100-200之间
         *                   '100,0' 在100到占满间
         *                   '200'  固定在200px
         *                   数字、百分数
         *      width height 与具体的type有关，如果是row，那么是height，如果是column，那么是width
         *      control: 'drag'   拖动条，双点时可以直接切换
         *               'scroll' 滚动条
         *               true     显示控制条，支持拖动，也支持切换
         * }
         */
        addRow: function(el){
            
        },
        /**
         * 增加一行，效果如同行
         */
        addColumn: function(el){
        
        }
    };

}, {
    requires: ['dom', 'event']
});
