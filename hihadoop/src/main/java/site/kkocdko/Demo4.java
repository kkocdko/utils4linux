package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;

public class Demo4 {
    public static void main(String[] args) throws Exception {
        Configuration conf = new Configuration();
        conf.set("fs.defaultFS", "hdfs://127.0.0.1:8020");
        FileSystem hdfs = FileSystem.get(conf);
        // 指定目标文件
        Path dst = new Path("/tmp/pg20417.txt");
        // 缓冲读取器
        FSDataInputStream in = hdfs.open(dst);
        Reader reader = new InputStreamReader(in);
        BufferedReader bufferedReader = new BufferedReader(reader);
        // 读取内容
        int cnt = 0;
        String line = bufferedReader.readLine();
        while (line != null) {
            cnt++;
            System.out.println(line);
            // 继续读取
            line = bufferedReader.readLine();
        }
        // 关闭流
        bufferedReader.close();
        reader.close();
        in.close();
        System.out.printf("读取完成, 行数 %d\n", cnt);
    }
}
