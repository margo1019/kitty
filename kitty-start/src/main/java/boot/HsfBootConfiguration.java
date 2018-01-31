package boot;

import com.alibaba.boot.hsf.annotation.HSFConsumer;

import com.cainiao.fulfil.fcs.api.FulfilQueryService;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class HsfBootConfiguration {
    @HSFConsumer(serviceVersion = "${hsf.version.daily}")
    private FulfilQueryService fulfilQueryService;
}
