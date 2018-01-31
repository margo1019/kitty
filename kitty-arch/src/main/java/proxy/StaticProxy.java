package proxy;

import proxy.piper.Piper;
import proxy.piper.PiperImplClean;

/**
 * 用于代理各种piper类型。
 * <p>
 * iron pipe, plastic pipe，等，before()和after()不用在每种piper中都重写一次。
 */
public class StaticProxy implements Piper {
    Piper proxy;

    public StaticProxy(Piper piper) {
        this.proxy = piper;
    }

    @Override
    public void pipe() {
        before();
        proxy.pipe();
        after();
    }

    public void before() {
        System.out.println("before pipe, preparing(static proxy)");
    }

    public void after() {
        System.out.println("after pipe, close channel(static proxy)");
    }

    public static void main(String[] args) {
        StaticProxy sp = new StaticProxy(new PiperImplClean());
        sp.pipe();
    }
}

