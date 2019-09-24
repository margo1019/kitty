package basic.io;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

public class FileRecovery {
    public static void main(String[] args) throws IOException {
        doRec();
    }

    public static void doRec() throws IOException {
        File dir = new File("F:\\FOUND.000-old");
        File[] files = dir.listFiles();
        byte[] bytes = new byte[100];
        FileInputStream fis;
        for (int i = 0; i < 100; i++) {
            fis = new FileInputStream(files[i]);
            fis.read(bytes);
            if (checkChineseTxt(bytes)) {
                handleFile(files[i]);
            }
        }
        System.out.println(files.length);
    }

    public static void handleFile(File file) {

    }

    public static boolean checkChineseTxt(byte[] bytes) throws UnsupportedEncodingException {
        String str = new String(bytes, "GBK");
        System.out.println(str);
        return true;
    }
}
