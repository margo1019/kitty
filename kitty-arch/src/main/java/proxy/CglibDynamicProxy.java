package proxy;

import org.springframework.cglib.proxy.Enhancer;
import org.springframework.cglib.proxy.MethodInterceptor;
import org.springframework.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

public class CglibDynamicProxy implements MethodInterceptor {

    private static CglibDynamicProxy instance = new CglibDynamicProxy();

    public static CglibDynamicProxy getInstance() {
        return instance;
    }

    public <T> T getProxy(Class<T> cls) {
        return (T) Enhancer.create(cls, this);
    }

    @Override
    public Object intercept(Object target, Method method, Object[] args, MethodProxy methodProxy)
            throws Throwable {
        before();
        methodProxy.invokeSuper(target, args);
        after();
        return null;
    }

    public void before() {
        System.out.println("before pipe, preparing(cglib dynamic proxy)");
    }

    public void after() {
        System.out.println("after pipe, close channel(cglib dynamic proxy)");
    }

    public static void main(String[] args) {
        Piper piper = CglibDynamicProxy.getInstance().getProxy(PiperImplClean.class);
        piper.pipe();
    }
}
