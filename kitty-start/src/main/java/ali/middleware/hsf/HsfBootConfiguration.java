package ali.middleware.hsf;

import com.alibaba.boot.hsf.annotation.HSFConsumer;

import com.cainiao.fulfil.fcs.api.FulfilQueryService;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class HsfBootConfiguration {

    /**
     * @HSFConsumer(serviceVersion = "1.0.0.daily")
     * 可以如此指定，或者使用properties文件的配置
     */
    @HSFConsumer
    private FulfilQueryService fulfilQueryService;

    @HSFConsumer
    private HelloWorldService helloWorldService;

}
