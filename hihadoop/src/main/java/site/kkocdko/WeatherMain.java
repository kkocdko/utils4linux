package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.io.WritableComparable;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.Partitioner;
import org.apache.hadoop.io.WritableComparator;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import java.io.DataInput;
import java.io.DataOutput;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import java.io.IOException;

class RandWeather {
    public static String gen(int fromYear, int toYear, long seed) {
        String ret = "";
        var fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        var rand = new Random(seed); // 使用固定的seed生成随机数
        for (int year = fromYear; year <= toYear; year++) {
            for (int month = 1; month <= 12; month++) {
                int day = rand.nextInt(28) + 1; // 随机生成1-28之间的日期
                int hour = rand.nextInt(3) + 13; // 随机生成13-15之间的小时
                int minute = rand.nextInt(60); // 随机生成0-59之间的分钟
                int second = rand.nextInt(60); // 随机生成0-59之间的秒
                int temperature = rand.nextInt(15) + 10; // 随机生成10-24之间的温度
                if (6 <= month && month <= 9)
                    temperature = rand.nextInt(22) + 20; // 随机生成20-41之间的温度
                var datetime = LocalDateTime.of(year, month, day, hour, minute, second);
                String line = fmt.format(datetime) + " " + temperature + "°C";
                ret += line + "\n";
            }
        }
        return ret;
    }
}

class WeatherWritable implements WritableComparable<WeatherWritable> {
    public int year;
    public int maxTemperature;

    @Override
    public int compareTo(WeatherWritable rhs) {
        if (rhs == null)
            return 1;
        return this.year - rhs.year;
    }

    @Override
    public void write(DataOutput out) throws IOException {
        out.writeInt(this.year);
        out.writeInt(this.maxTemperature);
    }

    @Override
    public void readFields(DataInput in) throws IOException {
        this.year = in.readInt();
        this.maxTemperature = in.readInt();
    }
}

class WeatherMapper extends Mapper<LongWritable, Text, WeatherWritable, Text> {
    @Override
    protected void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
        String line = value.toString();
        if (line.isEmpty())
            return;
        String[] fields = line.split("\t");
        if (fields.length != 2)
            return;
        int year = Integer.parseInt(fields[0].substring(0, 4));
        int temperature = Integer.parseInt(fields[1].substring(0, fields[1].lastIndexOf("°C")));
        var w = new WeatherWritable();
        w.year = year;
        w.maxTemperature = temperature;
        context.write(w, value);
    }
}

class WeatherPartitioner extends Partitioner<WeatherWritable, Text> {
    @Override
    public int getPartition(WeatherWritable key, Text value, int numPartitions) {
        return (key.year - 1940) % numPartitions;
    }
}

class SortByTemperatureForDesc extends WritableComparator {
    public SortByTemperatureForDesc() {
        super(WeatherWritable.class, true);
    }

    @Override
    public int compare(WritableComparable a, WritableComparable b) {
        var w1 = (WeatherWritable) a;
        var w2 = (WeatherWritable) b;

        if (w1.year != w2.year) {
            return w1.year - w2.year;
        }

        return -(w1.maxTemperature - w2.maxTemperature);
    }
}

class GroupingByYear extends WritableComparator {
    public GroupingByYear() {
        super(WeatherWritable.class, true);
    }

    @Override
    public int compare(WritableComparable a, WritableComparable b) {
        var w1 = (WeatherWritable) a;
        var w2 = (WeatherWritable) b;

        return w1.year - w2.year;
    }
}

class WeatherReducer extends Reducer<WeatherWritable, Text, WeatherWritable, Text> {
    @Override
    protected void reduce(WeatherWritable key, Iterable<Text> values, Context context)
            throws IOException, InterruptedException {
        for (Text v : values) {
            context.write(key, v);
        }
    }
}

public class WeatherMain {
    public static void main(String[] args) throws Exception {
        var conf = new Configuration();
        conf.set("fs.defaultFS", "hdfs://127.0.0.1:8020");
        var hdfs = FileSystem.get(conf);

        var iPath = new Path("/tmp/weather/i"); // new Path(args[0]) // 命令行传入
        var oPath = new Path("/tmp/weather/o"); // new Path(args[1])
        hdfs.delete(iPath, true);
        hdfs.delete(oPath, true);

        var iFile = hdfs.create(new Path("/tmp/weather/i/data.txt"));
        iFile.write(RandWeather.gen(1993, 2003, 654321L).getBytes());
        iFile.flush();
        iFile.close();

        Job job = Job.getInstance(conf, "Weather");

        job.setInputFormatClass(TextInputFormat.class);
        FileInputFormat.setInputPaths(job, iPath);

        job.setMapperClass(WeatherMapper.class);
        job.setMapOutputKeyClass(WeatherWritable.class);
        job.setMapOutputValueClass(Text.class);

        job.setPartitionerClass(WeatherPartitioner.class);

        job.setSortComparatorClass(SortByTemperatureForDesc.class);

        job.setGroupingComparatorClass(GroupingByYear.class);

        job.setNumReduceTasks(3);

        job.setReducerClass(WeatherReducer.class);

        job.setOutputKeyClass(WeatherWritable.class);
        job.setOutputValueClass(Text.class);
        job.setOutputFormatClass(TextOutputFormat.class);
        FileOutputFormat.setOutputPath(job, oPath);

        if (!job.waitForCompletion(true))
            throw new AssertionError();
        System.exit(0);
    }
}
