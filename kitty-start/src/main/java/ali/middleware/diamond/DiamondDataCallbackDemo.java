package ali.middleware.diamond;

import java.io.ByteArrayInputStream;
import java.util.Properties;

import com.alibaba.boot.diamond.annotation.DiamondListener;
import com.alibaba.boot.diamond.listener.DiamondDataCallback;
import com.alibaba.boot.diamond.utils.Native2ascii;

import org.springframework.beans.MutablePropertyValues;
import org.springframework.boot.bind.RelaxedDataBinder;

@DiamondListener(dataId = "com.taobao.middleware:test.properties")
public class DiamondDataCallbackDemo implements DiamondDataCallback {

    private String data;

    @Override
    public void received(String s) {
        this.data = s;
        System.out.println("Data received from diamond -->" + s);
        try {
            data = Native2ascii.encode(data);
            Properties properties = new Properties();
            properties.load(new ByteArrayInputStream(data.getBytes()));
            System.out.println(properties.getProperty("chineseValueKey"));
        } catch (Exception e) {
            System.out.println("DiamondDataCallbackDemo Exception");
        }
    }

    public String getData() {
        return data;
    }
}
