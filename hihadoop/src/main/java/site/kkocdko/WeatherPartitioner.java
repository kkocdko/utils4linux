package site.kkocdko;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Partitioner;

public class WeatherPartitioner extends Partitioner<WeatherWritable, Text> {
    /**
     * 自定义分区函数
     * @param key WeatherWritable对象
     * @param value Text对象
     * @param numPartitions 分区数
     * @return 分区编号
     */
    @Override
    public int getPartition(WeatherWritable key, Text value, int numPartitions) {
        // 根据年份计算分区编号
        return (key.getYear() - 1940) % numPartitions;
    }
}
