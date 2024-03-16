package site.kkocdko;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import java.io.IOException;

/**
 * 四个泛型的解释：
 * <p>
 * KEYIN：K2类型
 * <p>
 * VALUEIN：V2类型
 * <p>
 * KEYOUT：K3类型
 * <p>
 * VALUEOUT：V3类型
 */
public class WordCountReducer extends Reducer<Text, LongWritable, Text, LongWritable> {
    /**
     * 将K2和V2转换为K3和V3，将K3和V3写入上下文中
     *
     * @param key:     新K2
     * @param values:  新V2
     * @param context: 上下文对象
     * @throws IOException:
     * @throws InterruptedException:
     */
    @Override
    protected void reduce(Text key, Iterable<LongWritable> values, Context context)
            throws IOException, InterruptedException {
        long count = 0;
        // 1：遍历集合，将集合中的数字相加，得到V3
        for (LongWritable value : values) {
            count += value.get();
        }
        // 2：将K3V3写入上下文中
        context.write(key, new LongWritable(count));
    }
}