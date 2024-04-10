package site.kkocdko;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
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
    /**
     * 生成指定年份范围内的随机天气数据
     * @param fromYear 起始年份
     * @param toYear 结束年份
     * @param seed 随机数种子
     * @return 随机天气数据
     */
    public static String generateWeatherData(int fromYear, int toYear, long seed) {
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

public class Starter {
    public static void main(String[] args) throws Exception {
        var conf = new Configuration();
        conf.set("fs.defaultFS", "hdfs://127.0.0.1:8020");
        var hdfs = FileSystem.get(conf);

        var inputPath = new Path("/tmp/weather/i"); // new Path(args[0]) // 命令行传入
        var outputPath = new Path("/tmp/weather/o"); // new Path(args[1])
        hdfs.delete(inputPath, true);
        hdfs.delete(outputPath, true);

        var iFile = hdfs.create(new Path("/tmp/weather/i/data.txt"));
        iFile.write(RandWeather.generateWeatherData(1993, 2003, 654321L).getBytes());
        iFile.flush();
        iFile.close();
        
        // 创建任务
        Job job = Job.getInstance(conf, "统计每年最高温度");
        // 设置输入
        job.setInputFormatClass(TextInputFormat.class);
        FileInputFormat.setInputPaths(job, inputPath);
        // 设置mapper
        job.setMapperClass(WeatherMapper.class);
        job.setMapOutputKeyClass(WeatherWritable.class);
        job.setMapOutputValueClass(Text.class);
        // 设置自定义分区
        job.setPartitionerClass(WeatherPartitioner.class);
        // 设置自定义排序
        job.setSortComparatorClass(SortBytemperatureForDesc.class);
        // 设置自定义分组
        job.setGroupingComparatorClass(GroupBYYear.class);
        // 设置Reduce数量
        job.setNumReduceTasks(1);
        // 设置reducer
        job.setReducerClass(WeatherRwduce.class);
        // 设置输出
        job.setOutputKeyClass(WeatherWritable.class);
        job.setOutputValueClass(NullWritable.class);
        job.setOutputFormatClass(TextOutputFormat.class);
        FileOutputFormat.setOutputPath(job, outputPath);

        boolean flag = job.waitForCompletion(true);
        if (flag) {
            System.out.println("统计每年最高温度任务执行成功");
            System.out.println("年份\t\t最高温度");
            showResult(hdfs, outputPath);
        } else {
            System.out.println("统计每年最高任务执行失败");
        }
    }

    /**
     * 打印任务结果
     * @param hdfs HDFS文件系统对象
     * @param outputPath 输出路径
     * @throws Exception
     */
    public static void showResult(FileSystem hdfs, Path outputPath) throws Exception {
        // 循环读取指定目录下文件
        for (FileStatus fs : hdfs.listStatus(outputPath)) {
            if (fs.isDirectory()) {
                continue;
            }
            // 读取文件
            FSDataInputStream in = hdfs.open(fs.getPath());
            Reader reader = new InputStreamReader(in);
            BufferedReader bufferedReader = new BufferedReader(reader);
            String line;
            while ((line = bufferedReader.readLine()) != null)
                System.out.println(line);
            bufferedReader.close();// 关闭流
        }
    }
}
