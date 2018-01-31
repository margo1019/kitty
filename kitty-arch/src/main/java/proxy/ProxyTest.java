package proxy;

import proxy.piper.Piper;
import proxy.piper.PiperImpl;
import proxy.piper.PiperImplClean;

public class ProxyTest {

    /**
     * 无代理
     */
    public static void testNoneProxy() {
        Piper piper = new PiperImpl();
        piper.pipe();
    }

    /**
     * 静态代理
     */
    public static void testStaticProxy() {
        StaticProxy sp = new StaticProxy(new PiperImplClean());
        sp.pipe();
    }

    /**
     * jdk动态代理
     */
    public static void testJdkProxy() {
        Piper proxy = (Piper)new JdkDynamicProxy(new PiperImplClean()).getProxy();
        proxy.pipe();
    }

    public static void main(String[] args) {
        System.out.println("-----------------none--------------------");
        testNoneProxy();
        System.out.println("-----------------static--------------------");
        testStaticProxy();
        System.out.println("-----------------jdk dynamic--------------------");
        testJdkProxy();
    }
}
