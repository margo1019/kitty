import java.io.PrintStream;

public class App {

    public static void main(String[] args) {
        System.out.println(System.currentTimeMillis());
        long laps = System.currentTimeMillis() - 1459920556643L;
        double hours = laps*1.0 / 1000/3600/24;
        System.out.println(hours);
    }

}
