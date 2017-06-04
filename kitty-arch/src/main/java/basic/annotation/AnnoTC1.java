package basic.annotation;

public class AnnoTC1 {

    public enum NestedEnum {ONE, TWO, THREE}

    @AnnoModel(name = "AnField", intAN = 0)
    private int an1 = 0;

    public void testAn1() {
        for (int i = 0; i < 8; i++) {

        }
    }

    public static void main(String[] args) {
        System.out.println("an finished");
        System.out.println();

    }
}
