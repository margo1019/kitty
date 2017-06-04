/**
 * ���׵Ĳ��ֹ���
 * 
 *
 * @todo ��ɹ���������Ҫ����ϸ�����������Ǹ�body����overflow:hidden������
 * @todo �ĳ���
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
        atoms = {0:{id:0}};  //���ֽڵ�

    /**
     * ����Ԫ���ϵĲ�����Ϣ
     *
     * @param ele {HTMLElement} Ҫ�����Ĳ���Ԫ��
     * @return idx {Number} ����ID
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

        //���ݲ����趨ΪԪ�������ʽ
        if('column' == config.type){    //ռ��һ�У�����Ҫ�趨��float:left
            D.css(ele, 'float', 'left');
        }else if('row' == config.type){ //ռ��һ��
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
     *     ',200' ���200
     *     '200,' ��С200
     *     '100,200' ��100-200֮��
     *     '100,0' ��100��ռ����
     *     '200'  �̶���200px
     *     ���֡�//�ٷ���(Ҫôȫ���֣�Ҫôȫ�ٷ���)
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

        //���������
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
     * ����Ԫ��(�ݹ�)
     */
    function walkElement(context){
        context = D.get(context || document.body);

        if(!context){
            return;
        }

        var ele = context.firstChild,
            hasFound = false,   //�Ƿ��ҵ��˲��ֽڵ�
            childLayoutIds = [],         //������Ӳ��ֽڵ�ID
            stack = [];         //�����������Ԫ��
        while(ele){
            if(1 == ele.nodeType && reAvailNodeName.test(ele.nodeName)){
                if(hasFound || ele.getAttribute(ATTR_LAYOUT)){
                    if(!hasFound){  //��ʱ��Ҫ����֮ǰ�����Ԫ�أ���������Ϊlayout�ڵ�
                        for(var i = 0, len = stack.length; i < len; i++){
                            childLayoutIds.push(analyLayoutElement(stack[i]));
                        }
                        hasFound = true;
                    }
                    childLayoutIds.push(analyLayoutElement(ele));
                }

                //����ջ��
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
         * ��ʼ������
         *
         * ��body�ӽڵ㿪ʼ������������wb-layout���Եģ������Լ������ֵܽڵ��������������������ڵ�
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

                //����ʱ��Ҫ���ݵ�һ��atom���ж���һ��atom��row���֣�����column����
                //�����row���֣���ôÿ��atom�Ŀ������ͬ�ģ���height����ݶ������
                //�����column���֣���ôÿ��atom�ĸ߶�����ͬ����width����ݶ������
                

                for(var i = 0, len = child.length; i < len; i++){
                    childAtom = atoms[child[i]];
                    if(childAtom){
                        //��ͬ���ֻ����һ��Ԫ����box��λ�����ҵ��ĵ�һ��boxΪ׼
                        //@todo Ǩ�Ƶ��Ϸ������ж�
                        config = childAtom.config;
                        if(!boxAtom && 'box' == config.type){
                            boxAtom = childAtom;
                            continue;
                        }
                        //@todo Ǩ�Ƶ��Ϸ������ж�
                        if(!filltype){
                            //�����ǰ��������row����ô��ǰ�����ӽڵ㶼��Ϊ��һ���еģ����ʱ������һ��box��������ռ�ݸ���ĸ߶�
                            filltype = 'row' == config.type ? 'height' : 'width';
                        }

                        node = childAtom.node;
                        if('width' == filltype){    //column����
                            D.css(node, 'height', rh);

                            var width = D.width(node), widthConfig = config.width;

                            //column�����ǣ������ǰatom������width������Ҫ����width���ж�
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
         * ����һ���С������ж�̬�ı��С
         *
         * �е���Ϊ�У�
         * 1��Ϊ������һ�����������϶�ʱ���ı����С����ʱ�����н���̬�ĸı�߶ȣ��ı�ֵ��ÿ��ȥƽ̯���������óɹ̶��߶ȵ�������
         * 2�����������ʱ����ʵ���л��е���󻯺���С��
         *
         * ���÷�����
         * {
         *     type: 'row|column|box|auto',  box��һ�����������ĺ��ӣ�auto��һ������ԭ���ĺ���
         *     width|height: 'auto'
         *                   ',200' ���200
         *                   '200,' ��С200
         *                   '100,200' ��100-200֮��
         *                   '100,0' ��100��ռ����
         *                   '200'  �̶���200px
         *                   ���֡��ٷ���
         *      width height ������type�йأ������row����ô��height�������column����ô��width
         *      control: 'drag'   �϶�����˫��ʱ����ֱ���л�
         *               'scroll' ������
         *               true     ��ʾ��������֧���϶���Ҳ֧���л�
         * }
         */
        addRow: function(el){
            
        },
        /**
         * ����һ�У�Ч����ͬ��
         */
        addColumn: function(el){
        
        }
    };

}, {
    requires: ['dom', 'event']
});
