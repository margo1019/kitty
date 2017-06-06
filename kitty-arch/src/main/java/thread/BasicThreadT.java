package thread;

public class BasicThreadT {

    public static void bt() {
        Thread at = new Thread();
        at.start();
        at.run();
        System.out.println("bt 9 ok");
    }

    public static void btSub() {
        new ThreadSub().start();
    }

    public static void btSubRunnable() {
        new Thread(new RunnableSub()).start();
    }

    public static void main(String[] args) {
        btSubRunnable();
    }
}

class ThreadSub extends Thread {

    @Override
    public void run() {
        System.out.println("ThreadSub");
    }
}

class RunnableSub implements Runnable {
    public void run() {
        System.out.println("RunnableSub");
    }
}

