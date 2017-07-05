package proxy;

import proxy.piper.Piper;
import proxy.piper.PiperImplClean;

public class StaticProxy implements Piper {
    Piper proxy;

    public StaticProxy(Piper piper) {
        this.proxy = piper;
    }

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

