package proxy.spring;

import org.springframework.aop.MethodBeforeAdvice;

import java.lang.reflect.Method;

public class PiperBeforeAdvice implements MethodBeforeAdvice {

    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
        System.out.println("before (Spring aop)");
    }
}
