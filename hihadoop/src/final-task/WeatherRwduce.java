package com.neuedu.myweather;

import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

import java.io.IOException;
public class WeatherRwduce extends Reducer<WeatherWritable, Text,WeatherWritable, NullWritable> {
    @Override
    protected void reduce(WeatherWritable key, Iterable<Text> values, Reducer<WeatherWritable, Text, WeatherWritable, NullWritable>.Context context) throws IOException, InterruptedException {
        for(Text v: values){
            context.write(key,NullWritable.get());
            break;
        }

    }
}
