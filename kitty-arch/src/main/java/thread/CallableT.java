package thread;

import java.util.concurrent.*;

public class CallableT {

    public static void callT1() {
        new Thread(new FutureTask(new Callable1())).start();
    }

    public static void callT2() throws ExecutionException, InterruptedException {
        Future<String> ss = Executors.newFixedThreadPool(1).submit(new Callable1());
        System.out.println(ss.get());
    }

    public static void main(String[] args) throws Exception {
        callT2();
        Thread.sleep(3000L);
        System.exit(1);
    }
}

class Callable1 implements Callable<String> {

    public String call() throws Exception {
        return "callable11111";
    }
}