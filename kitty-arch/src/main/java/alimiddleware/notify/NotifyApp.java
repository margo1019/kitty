package alimiddleware.notify;

import com.taobao.notify.message.StringMessage;
import com.taobao.notify.remotingclient.NotifyManager;
import com.taobao.notify.remotingclient.NotifyManagerBean;
import com.taobao.notify.remotingclient.SendResult;

public class NotifyApp {

    private NotifyManagerBean pingjiaNotifyManager;

    private void sendMessage(long userId, String lcOrderCode) {
        StringMessage msg = new StringMessage();

        //必填属性
        msg.setBody("{\"userId\":\"" + userId + "\", \"lcOrderCode\":\"" + (lcOrderCode == null ? "" : lcOrderCode) + "\"}");
        msg.setTopic("MSG_PINGJIA");
        msg.setMessageType("MSG_TYPE_PINGJIA");

        //可选属性
        msg.setStringProperty("userId", userId + "");
        SendResult result = pingjiaNotifyManager.sendMessage(msg);

        if (result.isSuccess()) {
        }
    }

    public static void main(String[] args) {
        NotifyManager nm = null;


    }

}
