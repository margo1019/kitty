import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;


/**
 * 单元测试的Spring Boot配置类
 */
@SpringBootApplication(scanBasePackages = {"springboot", "ali"})
@PropertySource(value = { "classpath:test.properties", "classpath:application.properties" })
public class TestApplication {

    //@HSFConsumer(serviceVersion = "${hsf.version.daily}")
    //private FulfilQueryService fulfilQueryService;

}
