package basic.io;

import java.nio.ByteBuffer;

public class BufferTest {

    public static void testFlip() {
        ByteBuffer bb = ByteBuffer.allocate(20);
        bb.put("test".getBytes());
        System.out.println(bb);
        System.out.println((char) bb.get(0) + "" + (char) bb.get(1));
        bb.flip();
        System.out.println(bb);
        System.out.println((char) bb.get(0) + "" + (char) bb.get(1));
    }

    public static void main(String[] args) {
        testFlip();
    }
}
