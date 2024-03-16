package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import java.io.IOException;

public class Demo1 {
    public static void main(String[] args) throws Exception {
        // 构建配置对象
        Configuration conf = new Configuration();
        // 配置集群属性:若提供配置文件时，则自动读取，否则需要手动配置
        conf.set("fs.defaultFS", "hdfs://master:9000");

        // 构建HDFS对象
        FileSystem hdfs = FileSystem.get(conf);
        // 定义源路径:本地
        Path src = new Path("/home/kkocdko/carib.txt");
        // 定义目标路径: HDFS
        Path dst = new Path("/f1.txt");
        // 执行上传
        hdfs.copyFromLocalFile(src, dst);
        // 输出提示
        System.out.println("uploaded");
    }
}
