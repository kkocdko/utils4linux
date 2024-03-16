package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.Path;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;

public class Demo5 {
    public static void main(String[] args) throws Exception {
        Configuration conf = new Configuration();
        conf.set("fs.defaultFS", "hdfs://127.0.0.1:8020");
        FileSystem hdfs = FileSystem.get(conf);
        // 指定目标文件
        Path dst = new Path("/tmp/wc/s");
        // 循环读取指定目录下的文件
        int cnt=0;
        for (FileStatus fs : hdfs.listStatus(dst)) {
            if (fs.isDirectory()) {
                continue;
            }
            cnt++;
            // 读取文件内容
            FSDataInputStream in = hdfs.open(fs.getPath());
            Reader reader = new InputStreamReader(in);
            BufferedReader bufferedReader = new BufferedReader(reader);
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                System.out.println(line);
            }
            bufferedReader.close();
            System.out.printf("读取完成,  %d 个文件\n", cnt);
        }
    }
}
