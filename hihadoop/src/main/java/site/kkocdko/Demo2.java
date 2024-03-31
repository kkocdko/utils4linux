package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;

public class Demo2 {
    public static void main(String[] args) throws Exception {
        // 构建配置对象
        Configuration conf = new Configuration();
        // 配置集群属性:若提供配置文件时，则自动读取，否则需要手动配置
        conf.set("fs.defaultFS", "hdfs://127.0.0.1:8020");
        // 构建HDFS对象
        FileSystem hdfs = FileSystem.get(conf);
        for (int i = 0; i < 9; i++) {
            // 指定目标文件
            Path dst = new Path(String.format("/tmp/%d.txt", i));
            // 准备文件内容
            String content = "Hello, this is the content of the file.";
            // 写入流
            FSDataOutputStream out = hdfs.create(dst);
            // 写入数据
            byte[] buffer = content.getBytes();
            out.write(buffer);
            // 清空缓冲，写入磁盘
            out.flush();
            // 关闭流
            out.close();
            // 判断文件是否存在
            if (hdfs.exists(dst)) {
                System.out.println(String.format("/tmp/%d.txt", i)+" 文件新建，并写入内容成功");
            } else {
                System.out.println("操作失败");
            }
        }
    }
}
