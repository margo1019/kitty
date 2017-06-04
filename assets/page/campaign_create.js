/**
 * 营销活动平台 活动管理
 *
 * wb-huangshiyu@taobao.com
 */
KISSY.use('dom, event', function (S, D, E) {

    S.ready(function (S) {
        E.on(".addAddressBtn", "click", function () {
            var addressTpl = "<div class='campaignAddress'> <label class='formLbl'></label> <input type='text' class='longText' /></div>",
                address = D.query(".campaignAddress"),
                amount = address.length,
                lastAddress = D.query(".longText", address)[amount - 1],
                ADDRESS_LIMIT = 5;

            if (D.val(lastAddress) && amount <= ADDRESS_LIMIT) {
                D.insertAfter(D.create(addressTpl), D.parent(lastAddress, ".campaignAddress"));
            } else {
                E.fire(lastAddress, "focus");
            }
        });
    });
});