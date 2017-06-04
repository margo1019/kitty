package basic.langbasic;

enum EnumConstants {

    ONE(1),TWO(2),THREE(3);

    private int num;

    EnumConstants(int num){
        this.num = num;
    }

    public int getValue(){
        return num;
    }
}

enum EnumShort {
    One, Two;
}


public class EnumTest {
    public static void testShort() {
        EnumShort es = EnumShort.One;
        System.out.println(es.getClass());
    }

    public static void testConstants() {
        EnumConstants ec = EnumConstants.ONE;
        System.out.println(ec.getValue());
    }

    public static void main(String[] args) {
        testShort();
    }
}
