package com.neuedu.myweather;

import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

import java.io.IOException;

public class WeatherMapper extends Mapper<LongWritable, Text,WeatherWritable,Text> {
    @Override
    protected void map(LongWritable key, Text value, Mapper<LongWritable, Text, WeatherWritable, Text>.Context context) throws IOException, InterruptedException {
        //读取数据
        String line=value.toString();
        //数据清洗
        if(StringUtils.isEmpty(line))
            return;
        //拆分数据
        String[] fields=line.split("\t");
        if(fields.length!=2)
            return;
        int year=Integer.parseInt(fields[0].substring(0,4));
        int temperature=Integer.parseInt(fields[1].substring(0,fields[1].lastIndexOf("℃")));
        WeatherWritable w=new WeatherWritable(year,temperature);
        context.write(w,value);
    }
}