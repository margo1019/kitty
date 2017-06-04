package basic.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.METHOD})
public @interface AnnoModel {

    String name() default "_name";

    int intAN() default 0;
}
