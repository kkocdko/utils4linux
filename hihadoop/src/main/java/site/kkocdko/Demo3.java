package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import java.io.IOException;

public class Demo3 {
    public static void main(String[] args) throws Exception {
        Configuration conf = new Configuration();
        conf.set("fs.defaultFS", "hdfs://127.0.0.1:8020");
        // 构建HDFS对象
        FileSystem hdfs = FileSystem.get(conf);
        // 指定目标文件
        Path dst = new Path("/tmp/pg20417.txt");
        // 读取流
        FSDataInputStream in = hdfs.open(dst);
        // 文件大小
        int size = in.available();
        // 定义块的大小
        int blockSize = 1024;
        // 计算整块的个数
        int blockNum = size / blockSize;
        // 剩余的字节数
        int remain = size % blockSize;
        // 读取文件内容
        for (int i = 0; i < blockNum; i++) {
            byte[] bytes = new byte[blockSize];
            in.read(bytes);
            // 输出整块
            System.out.println(new String(bytes));
        }
        if (remain > 0) {
            // 读取剩余的字节
            byte[] bytes = new byte[remain];
            in.read(bytes);
            // 输出剩余的字节
            System.out.println(new String(bytes));
        }
        // 关闭流
        in.close();
        System.out.printf("读取完成, 体积 %d\n",size);
    }
}
