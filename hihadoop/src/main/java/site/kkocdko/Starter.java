package com.neuedu.myweather;

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

public class Starter {
    public static void main(String[] args) {
        try {
            Configuration conf=new Configuration();//配置对象
            FileSystem hdfs=FileSystem.get(conf);//HDFS对象
            //输入目录
            Path inputPath=new Path("/weather");
            //输出目录
            Path outPath=new Path("/max4year");
            if(hdfs.exists(outPath))
                hdfs.delete(outPath,true);//去重输出目录
            //创建任务
            Job job=Job.getInstance(conf,"统计每年最高温度");
            //设置输入
            job.setInputFormatClass(TextInputFormat.class);
            FileInputFormat.setInputPaths(job,inputPath);
            //设置mapper
            job.setMapperClass(WeatherMapper.class);
            job.setMapOutputKeyClass(WeatherWritable.class);
            job.setMapOutputValueClass(Text.class);
            //设置自定义分区
            job.setPartitionerClass(WeatherPartitioner.class);
            //设置自定义排序
            job.setSortComparatorClass(SortBytemperatureForDesc.class);
            //设置自定义分组
            job.setGroupingComparatorClass(GroupBYYear.class);
            //设置Reduce数量
            job.setNumReduceTasks(3);
            //设置reducer
            job.setReducerClass(WeatherRwduce.class);
            //设置输出
            job.setOutputKeyClass(WeatherWritable.class);
            job.setOutputValueClass(NullWritable.class);
            job.setOutputFormatClass(TextOutputFormat.class);
            FileOutputFormat.setOutputPath(job,outPath);

            boolean flag=job.waitForCompletion(true);
            if(flag){
                System.out.println("统计每年最高温度任务执行成功");
                System.out.println("年份\t\t最高温度");
                showResult(hdfs,outPath);
            }
            else System.out.println("统计每年最高任务执行失败");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void  showResult(FileSystem hdfs,Path outPath){
        try {
            //循环读取指定目录下文件
            for(FileStatus fs:hdfs.listStatus(outPath)){
                if(fs.isDirectory()){
                    continue;
                }
                //读取文件
                FSDataInputStream in=hdfs.open(fs.getPath());
                Reader reader=new InputStreamReader(in);
                BufferedReader bufferedReader=new BufferedReader(reader);
                String line;
                while ((line=bufferedReader.readLine())!=null)
                    System.out.println(line);
                bufferedReader.close();//关闭流
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
