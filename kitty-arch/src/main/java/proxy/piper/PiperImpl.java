package proxy.piper;

public class PiperImpl implements Piper {

    @Override
    public void pipe() {
        before();
        System.out.println("piping noneproxy");
        after();
    }

    public void before() {
        System.out.println("before pipe, preparing");
    }

    public void after() {
        System.out.println("after pipe, close channel");
    }

}
