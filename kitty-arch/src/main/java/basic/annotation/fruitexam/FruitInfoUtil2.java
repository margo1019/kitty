package basic.annotation.fruitexam;

import java.lang.reflect.Field;

public class FruitInfoUtil2 {

    public static void getFruitInfo2(Class<?> clazz) {
        Field[] fields = clazz.getDeclaredFields();
        for (Field fd : fields) {
            if (fd.isAnnotationPresent(FruitColor.class)) {
                FruitColor fcAnno = fd.getAnnotation(FruitColor.class);
                System.out.println(fcAnno.fruitColor());
            }
        }

    }

}
