/**
 * 小二工作台
 *
 * @author xianyu.hrh@taobao.com
 * 2012.01.12
 */

KISSY.Config.debug = true;

//kissy configuration
KISSY.config({
    packages: [
        {
            name    : 'wb',
            tag     : '20120112',
            path    : (~document.domain.indexOf('.daily') ? 'http://a.tbcdn.cn' : 'http://assets.daily.taobao.net') + '/apps/tmallservice/',
            charset : 'gbk'
        }
    ]
});

KISSY.add('bench/menutree', function(S, D, E){
    function buildTree(node){
        var childs = D.children(node);
        S.each(childs, function(child){
            var isExpand = D.hasClass(child, 'expand'),
                tree = D.get('ul', child);
            if(tree){
                D.css(tree, 'display', isExpand ? 'block' : 'none');
                buildTree(tree);
            }
        });
    }

    var currentNode;    //当前展开的元素
    function toggle(node, isRootNode){
        var isExpand = D.hasClass(node, 'expand'),
            tree = D.get('ul', node);
        if(isExpand){
            D.removeClass(node, 'expand');
            D.addClass(node, 'collapse');
            D.css(tree, 'display', 'none');
        }else{
            D.removeClass(node, 'collapse');
            D.addClass(node, 'expand');
            D.css(tree, 'display', 'block');

            if(isRootNode && currentNode){
                toggle(currentNode);
                currentNode = node;
            }
        }
    }

    return function(id){
        var el = D.get(id);
        if(!el){
            return;
        }
        //专用的menutree生成
        buildTree(el);

        //查找currentNode


        E.on(el, 'click', function(ev){
            var target = ev.target,
                nodeName = target.nodeName,
                isRootNode = 'INS' == nodeName || 'H4' == nodeName;

            if(isRootNode || D.hasClass(target, 'item')){
                toggle(D.parent(target, 'li'), isRootNode);
            }
        });
    };

}, {
    requires: ['dom', 'event']
});

KISSY.ready(function(S){
    //布局管理
    S.use('wb/manage/layout', function(S, Layout){
        Layout.init();
    });

    //左侧菜单
    S.use('bench/menutree', function(S, mt){
        mt('#menu');
    });

});
