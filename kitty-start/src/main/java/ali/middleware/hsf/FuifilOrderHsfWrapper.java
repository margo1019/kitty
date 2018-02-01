package ali.middleware.hsf;

import com.cainiao.fulfil.basic.enums.fulfilorder.FulfilOrderSourceEnum;
import com.cainiao.fulfil.fcs.api.FulfilQueryService;
import com.cainiao.fulfil.fcs.dto.FulfilOrderDTO;
import com.cainiao.fulfil.fcs.request.query.FulfilOrderQueryRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class FuifilOrderHsfWrapper {

    @Autowired
    private FulfilQueryService fulfilQueryService;

    public FulfilOrderDTO queryFulfilOrder(String LP) {
        FulfilOrderQueryRequest fulfilOrderQueryRequest = new FulfilOrderQueryRequest();
        fulfilOrderQueryRequest.setOutBizCode("LP00038366276656");
        fulfilOrderQueryRequest.setFulfilOrderSource(FulfilOrderSourceEnum.LP);
        com.taobao.logistics.fcs.common.domain.SingleResultDO<FulfilOrderDTO> result
            = fulfilQueryService.queryFulfilOrder(fulfilOrderQueryRequest);
        return result.getResult();
    }
}
