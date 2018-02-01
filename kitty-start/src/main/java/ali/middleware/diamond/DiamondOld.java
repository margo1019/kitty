package ali.middleware.diamond;

import java.io.IOException;
import java.util.concurrent.Executor;

import javax.annotation.PostConstruct;

import com.taobao.diamond.client.Diamond;
import com.taobao.diamond.manager.ManagerListener;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.InitBinder;

@Component
public class DiamondOld implements InitializingBean {

    private String configData;

    @Override
    public void afterPropertiesSet() throws Exception {
        this.init();
    }

    public void init() {
        Diamond.addListener("com.taobao.middleware:test.properties", "jktest", new ManagerListener() {
            @Override
            public Executor getExecutor() {
                return null;
            }

            @Override
            public void receiveConfigInfo(String configInfo) {
                DiamondOld.this.configData = configInfo;
                System.out.println("old diamond receive data: " + configInfo);
            }
        });
    }

    public String pullConfig() throws IOException {
        return Diamond.getConfig("com.taobao.middleware:test.properties", "jktest", 5000L);
    }

    public String getConfigData() {
        return configData;
    }

}
