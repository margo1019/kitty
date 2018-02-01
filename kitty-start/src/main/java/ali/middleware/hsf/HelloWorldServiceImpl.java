package ali.middleware.hsf;

import com.alibaba.boot.hsf.annotation.HSFProvider;

@HSFProvider
public class HelloWorldServiceImpl implements HelloWorldService {

    @Override
    public String sayHelloWorld() {
        System.out.println("service : hello world");
        return "Hello World";
    }
}
