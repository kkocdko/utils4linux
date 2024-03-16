package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.BlockLocation;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.Path;
import java.io.IOException;

public class Demo6 {
    public static void main(String[] args) throws Exception {
        // 构建配置对象
        Configuration conf = new Configuration();
        // 配置集群属性:若提供配置文件时，则自动读取，否则需要手动配置
        conf.set("fs.defaultFS", "hdfs://master:9000");
        // 构建HDFS对象
        FileSystem hdfs = FileSystem.get(conf);
        // 指定目标文件
        Path dst = new Path("/n.txt");
        // 文件尽量大于128mb
        FileStatus status = hdfs.getFileLinkStatus(dst);
        BlockLocation[] blocks = hdfs.getFileBlockLocations(status, 0, status.getLen());
        for (BlockLocation b : blocks) {
            for (int i = 0; i < b.getNames().length; i++) {
                System.out.println(b.getNames()[i]);
                System.out.println(b.getOffset());
                System.out.println(b.getLength());
                System.out.println(b.getHosts()[i]);
                System.out.println("----------------");
            }
        }
    }
}
