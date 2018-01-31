import com.alibaba.middleware.TestApplication;

import com.taobao.pandora.boot.test.junit4.DelegateTo;
import com.taobao.pandora.boot.test.junit4.PandoraBootRunner;
import junit.framework.TestCase;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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



    @Test
    public void testInvoke() {
        System.out.println("hsf test successfully");;
    }

}