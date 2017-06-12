package proxy.piper;

/**
 * Created by yinfei on 2017/6/13.
 */
class PiperImpl implements Piper {

    @Override
    public void pipe() {
        before();
        System.out.println("piping");
        after();
    }

    public void before() {
        System.out.println("before pipe, preparing");
    }

    public void after() {
        System.out.println("after pipe, close channel");
    }

}
