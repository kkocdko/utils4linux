package site.kkocdko;

import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

import java.io.IOException;

public class WeatherReducer extends Reducer<WeatherWritable, Text, WeatherWritable, NullWritable> {

    /**
     * Reduce函数，将相同的WeatherWritable作为key的value合并，并输出
     * @param key 输入键，表示相同的WeatherWritable
     * @param values 输入值，表示相同的WeatherWritable对应的数据
     * @param context 输出上下文，用于写出结果
     * @throws IOException
     * @throws InterruptedException
     */
    @Override
    protected void reduce(WeatherWritable key, Iterable<Text> values,
            Reducer<WeatherWritable, Text, WeatherWritable, NullWritable>.Context context)
            throws IOException, InterruptedException {
        // 遍历values，将key和NullWritable写出
        for (Text value : values) {
            context.write(key, NullWritable.get());
            break;
        }

    }
}
