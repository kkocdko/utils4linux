package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.io.WritableComparable;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.SequenceFileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.map.InverseMapper;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.SequenceFileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.util.GenericOptionsParser;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;

public class WordCountMain extends Configured implements Tool {
    private static class IntWritableDecreasingComparator extends IntWritable.Comparator {
        public int compare(WritableComparable a, WritableComparable b) {
            return -super.compare(a, b);
        }

        public int compare(byte[] b1, int s1, int l1, byte[] b2, int s2, int l2) {
            return -super.compare(b1, s1, l1, b2, s2, l2);
        }
    }

    public int run(String[] args) throws Exception {
        var iPath = new Path("hdfs://127.0.0.1:8020/tmp/wc/i");
        var oPath = new Path("hdfs://127.0.0.1:8020/tmp/wc/o");
        var sPath = new Path("hdfs://127.0.0.1:8020/tmp/wc/s");

        // 1：创建一个job任务对象
        Job wcJob = Job.getInstance(super.getConf(), "WordCount");
        // 如果打包运行出错，则需要加改配置
        wcJob.setJarByClass(WordCountMain.class);
        // 2：配置job任务对象（八个步骤）
        // 第一步：指定文件的读取方式和
        wcJob.setInputFormatClass(TextInputFormat.class);
        // 读取路径
        TextInputFormat.addInputPath(wcJob, iPath);
        // TextInputFormat.addInputPath(wordCount, new Path(args[0])); // 命令行传入
        // 第二步：指定Map阶段的处理方式和数据类型
        wcJob.setMapperClass(WordCountMapper.class);
        // 设置K2的类型
        wcJob.setMapOutputKeyClass(Text.class);
        // 设置V2的类型
        wcJob.setMapOutputValueClass(LongWritable.class);
        // 第三、四、五、六shuffle阶段采用默认的方式
        // 第七步：指定Reduce阶段的处理方式和数据类型
        wcJob.setReducerClass(WordCountReducer.class);
        // 设置K3的类型
        wcJob.setOutputKeyClass(Text.class);
        // 设置V3的类型
        wcJob.setOutputValueClass(LongWritable.class);
        // 第八步：指定输出类型
        wcJob.setOutputFormatClass(TextOutputFormat.class);
        // 输出路径
        TextOutputFormat.setOutputPath(wcJob, oPath);
        // TextOutputFormat.setOutputPath(wordCount, new Path(args[1])); // 命令行传入
        // 等待任务结束
        if (!wcJob.waitForCompletion(true)) {
            return 1;
        }

        // 以下到函数结束的代码应当将 oPath 结果排序后写入 sPath，但是运行结束后 sPath 为空

        Job sortJob = Job.getInstance(super.getConf(), "WordCountSort");
        sortJob.setJarByClass(WordCountMain.class);

        TextInputFormat.addInputPath(sortJob, oPath);
        sortJob.setInputFormatClass(TextInputFormat.class);

        /* InverseMapper由hadoop库提供，作用是实现map()之后的数据对的key和value交换 */
        sortJob.setMapperClass(InverseMapper.class);
        /* 将 Reducer 的个数限定为1, 最终输出的结果文件就是一个。 */
        sortJob.setNumReduceTasks(1);
        TextOutputFormat.setOutputPath(sortJob, sPath);

        sortJob.setOutputKeyClass(LongWritable.class);
        sortJob.setOutputValueClass(Text.class);
        // Hadoop 默认对 IntWritable 按升序排序, 如果降序要自己实现
        // sortJob.setSortComparatorClass(IntWritableDecreasingComparator.class);

        if (!sortJob.waitForCompletion(true)) {
            return 1;
        }

        return 0;
    }

    public static void main(String[] args) throws Exception {
        Configuration configuration = new Configuration();
        // 启动job任务
        int run = ToolRunner.run(configuration, new WordCountMain(), args);
        System.exit(run);
    }
}
