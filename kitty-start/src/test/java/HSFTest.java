import com.alibaba.boot.hsf.annotation.HSFConsumer;

import com.cainiao.fulfil.basic.enums.fulfilorder.FulfilOrderSourceEnum;
import com.cainiao.fulfil.fcs.api.FulfilQueryService;
import com.cainiao.fulfil.fcs.dto.FulfilOrderDTO;
import com.cainiao.fulfil.fcs.request.query.FulfilOrderQueryRequest;
import com.taobao.pandora.boot.test.junit4.DelegateTo;
import com.taobao.pandora.boot.test.junit4.PandoraBootRunner;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * 将HSFConfig中配置的hsf服务注入并测试
 * 
 * @author chengxu
 */
@RunWith(PandoraBootRunner.class)
@DelegateTo(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = { TestApplication.class })
public class HSFTest {

    @Autowired
    private FulfilQueryService fulfilQueryService;

    @Test
    public void testEmpty() {
        System.out.println("empty finished!");
    }

    @Test
    public void testGetFulfilOrder() {
        FulfilOrderQueryRequest fulfilOrderQueryRequest = new FulfilOrderQueryRequest();
        fulfilOrderQueryRequest.setOutBizCode("LP00038366276656");
        fulfilOrderQueryRequest.setFulfilOrderSource(FulfilOrderSourceEnum.LP);
        com.taobao.logistics.fcs.common.domain.SingleResultDO<FulfilOrderDTO> result
            = fulfilQueryService.queryFulfilOrder(fulfilOrderQueryRequest);
        System.out.println(result.isSuccess());
        System.out.println("hsf test successfully");
    }

}