package proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class JdkDynamicProxy implements InvocationHandler {
    Object target;

    public JdkDynamicProxy(Object target) {
        this.target = target;
    }

    public <T> T getProxy() {
        return (T) Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass()
                .getInterfaces(), this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        before();
        method.invoke(target, args); // target, not proxy
        after();
        return null;
    }

    public void before() {
        System.out.println("before pipe, preparing(jdk dynamic proxy)");
    }

    public void after() {
        System.out.println("after pipe, close channel(jdk dynamic proxy)");
    }

    public static void main(String[] args) {
        Piper proxy = (Piper)new JdkDynamicProxy(new PiperImplClean()).getProxy();
        proxy.pipe();
    }

}
