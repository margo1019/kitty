package basic.io;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

public class RafBufferTest {

    public static void main(String[] args) throws IOException {
        RandomAccessFile raf = new RandomAccessFile("D://题目.txt", "rw");
        FileChannel fc = raf.getChannel();
        ByteBuffer bb = ByteBuffer.allocate(10000);
        fc.read(bb);
        // bb.flip();
        System.out.println(new String(bb.array(), "GBK"));
    }
}
