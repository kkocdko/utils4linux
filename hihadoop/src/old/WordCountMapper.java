package site.kkocdko;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import java.io.IOException;

/**
 * 四个泛型的解释：
 * <p>
 * KEYIN：K1的类型
 * <p>
 * VALUEIN：V1的类型
 * <p>
 * KEYOUT：K2的类型
 * <p>
 * VALUEOUT：V2的类型
 */
public class WordCountMapper extends Mapper<LongWritable, Text, Text, LongWritable> {
    /**
     * 将K1，V1转换成K2，V2
     *
     * @param key:     行偏移量
     * @param value:   一行文本内容
     * @param context: 上下文对象
     * @throws IOException:
     * @throws InterruptedException:
     */
    @Override
    protected void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
        Text text = new Text();
        LongWritable longWritable = new LongWritable();
        // 1：对一行的文本数据进行拆分
        String[] split = value.toString().toLowerCase().split("\\W+"); // split the string by non-word characters
        // 2：遍历数组，组装K2和V2
        for (String word : split) {
            // 3：将K2和V2写入上下文中
            text.set(word);
            longWritable.set(1);
            context.write(text, longWritable);
        }
    }
}
