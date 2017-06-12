package proxy.spring;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.aop.framework.ProxyFactory;
import proxy.piper.Piper;
import proxy.piper.PiperImplClean;

public class SpringAopProxy {
    protected static final Log logger = LogFactory.getLog(SpringAopProxy.class);

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
