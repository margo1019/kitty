/**
 * 营销活动平台 活动管理
 *
 * wb-huangshiyu@taobao.com
 */
KISSY.use('dom, event', function (S, D, E) {

    S.ready(function () {

        var oriWidth = 1110;

        if (D.css(D.query("#lft", window.top.document), "display") === "none") {
            D.css(D.query("#rgt", window.top.document), {
                width: "100%"
            });
            D.css(".expandButton", "background-position", "-13px 0");
        } else {
            if (oriWidth) {
                D.css(D.query("#rgt", window.top.document), {
                    width: oriWidth
                });
            }
            D.css(".expandButton", "background-position", "0 0");
        }

        E.on(".expandButton", "click", function (ev) {
            D.toggle(D.query("#header", window.top.document));
            D.toggle(D.query("#lft", window.top.document));
            if (D.css(D.query("#lft", window.top.document), "display") === "none") {
                oriWidth = D.css(D.query("#rgt", window.top.document), "width");
                D.css(D.query("#rgt", window.top.document), {
                    width: "100%"
                });
                D.css(".expandButton", "background-position", "-13px 0");
            } else {
                if (oriWidth) {
                    D.css(D.query("#rgt", window.top.document), {
                        width: oriWidth
                    });
                }
                D.css(".expandButton", "background-position", "0 0");
            }
        });
    });
});