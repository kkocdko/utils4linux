package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.BlockLocation;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.Path;

public class Demo6 {
    public static void main(String[] args) throws Exception {
        Configuration conf = new Configuration();
        conf.set("fs.defaultFS", "hdfs://127.0.0.1:8020");
        FileSystem hdfs = FileSystem.get(conf);
        Path dst = new Path("/tmp/1.txt");
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
