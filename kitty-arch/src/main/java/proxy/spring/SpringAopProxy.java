package proxy.spring;

import org.springframework.aop.framework.ProxyFactory;
import proxy.Piper;
import proxy.PiperImplClean;

public class SpringAopProxy {

    public static void testBeforeAfter () {
        ProxyFactory pf = new ProxyFactory();
        pf.setTarget(new PiperImplClean());
        pf.addAdvice(new PiperBeforeAdvice());
        pf.addAdvice(new PiperAfterAdvice());
        Piper piper = (Piper)pf.getProxy();
        piper.pipe();
    }

    public static void main(String[] args) {
        testBeforeAfter();
    }
}
