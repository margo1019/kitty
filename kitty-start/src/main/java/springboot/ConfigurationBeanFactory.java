package springboot;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @Configuration的方法都返回bean。
 *
 */
@Configuration
public class ConfigurationBeanFactory {

    @Bean
    public MyConfigurationBean myConfigurationBean() {
        return new MyConfigurationBean();
    }

    class MyConfigurationBean {
    }
}
