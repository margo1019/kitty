import com.taobao.pandora.boot.test.junit4.DelegateTo;
import com.taobao.pandora.boot.test.junit4.PandoraBootRunner;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(PandoraBootRunner.class)
@DelegateTo(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = { TestApplication.class })
public class TestBeanFactory {

    @Test
    public void testBeanFactory() {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext("springboot");
        System.out.println(context.getBean("myConfigurationBean"));
    }

}
