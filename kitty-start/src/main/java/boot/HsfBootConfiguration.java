package boot;

import com.alibaba.boot.hsf.annotation.HSFConsumer;

import com.cainiao.fulfil.fcs.api.FulfilQueryService;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Component
public class HsfBootConfiguration {

    @HSFConsumer
    private FulfilQueryService fulfilQueryService;
}
