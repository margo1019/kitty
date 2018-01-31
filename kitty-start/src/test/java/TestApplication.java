package com.alibaba.middleware;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;


/**
 * 单元测试的Spring Boot配置类
 * @author chengxu
 */
@SpringBootApplication
@PropertySource(value = { "classpath:test.properties" })
public class TestApplication {

}
