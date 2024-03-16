package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;

public class Demo4 {
    public static void main(String[] args) throws Exception {
        // 构建配置对象
        Configuration conf = new Configuration();
        // 配置集群属性:若提供配置文件时，则自动读取，否则需要手动配置
        conf.set("fs.defaultFS", "hdfs://master:9000");
        // 构建HDFS对象
        FileSystem hdfs = FileSystem.get(conf);
        // 指定目标文件
        Path dst = new Path("/n.txt");
        // 缓冲读取器
        FSDataInputStream in = hdfs.open(dst);
        Reader reader = new InputStreamReader(in);
        BufferedReader bufferedReader = new BufferedReader(reader);
        // 读取内容
        String line = bufferedReader.readLine();
        while (line != null) {
            System.out.println(line);
            // 继续读取
            line = bufferedReader.readLine();
        }
        // 关闭流
        bufferedReader.close();
        reader.close();
        in.close();
    }
}
