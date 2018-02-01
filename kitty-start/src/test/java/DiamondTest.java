import ali.middleware.diamond.DiamondDataCallbackDemo;
import ali.middleware.diamond.DiamondOld;
import com.taobao.pandora.boot.test.junit4.DelegateTo;
import com.taobao.pandora.boot.test.junit4.PandoraBootRunner;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(PandoraBootRunner.class)
@DelegateTo(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = { TestApplication.class })
public class DiamondTest {

    @Autowired
    DiamondDataCallbackDemo diamondDataCallbackDemo;

    @Autowired
    DiamondOld diamondOld;

    @Test
    public void testDiamond() throws InterruptedException {
        System.out.println("diamond init");
        Thread.sleep(80000L);
        System.out.println(diamondDataCallbackDemo.getData());
    }

    @Test
    public void testOldDiamond() throws Exception {
        System.out.println("old diamond init");
        Thread.sleep(80000L);

    }
}
