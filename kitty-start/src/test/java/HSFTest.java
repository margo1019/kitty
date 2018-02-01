import ali.middleware.hsf.FuifilOrderHsfWrapper;
import ali.middleware.hsf.HelloWorldService;
import com.cainiao.fulfil.fcs.dto.FulfilOrderDTO;
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
    private FuifilOrderHsfWrapper fuifilOrderHsfWrapper;

    @Autowired
    private HelloWorldService helloWorldService;

    @Test
    public void testGetFulfilOrder() {
        FulfilOrderDTO fulfilOrderDTO = this.fuifilOrderHsfWrapper.queryFulfilOrder("LP00038366276656");
        System.out.println(fulfilOrderDTO);
        System.out.println("hsf test successfully");
    }

    @Test
    public void testHelloWorldService() {
        String result = helloWorldService.sayHelloWorld();
        System.out.println("hello result is " + result);
    }

}