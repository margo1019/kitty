import org.slf4j.Logger;

import java.io.PrintStream;

public class App {
    Logger logger;

    public static void main(String[] args) {
        System.out.println(System.currentTimeMillis());
        long laps = System.currentTimeMillis() - 1459920556643L;
        double hours = laps*1.0 / 1000/3600/24;
        System.out.println(hours);
    }

}
