package proxy.spring;

import org.springframework.aop.AfterReturningAdvice;
import org.springframework.aop.MethodBeforeAdvice;

import java.lang.reflect.Method;

public class PiperBeforeAndAfterAdvice implements MethodBeforeAdvice, AfterReturningAdvice {
    @Override
    public void afterReturning(Object returnValue, Method method, Object[] args, Object target)
            throws Throwable {
        System.out.println("after (Spring aop B&A)");
    }

    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
        System.out.println("before (Spring aop B&A)");
    }
}
