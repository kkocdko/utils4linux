package com.neuedu.myweather;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Partitioner;

public class WeatherPartitioner extends Partitioner<WeatherWritable, Text> {
    @Override
    public int getPartition(WeatherWritable key, Text value, int numPartitions) {
        return (key.getYear()-1940)%numPartitions;
    }
}
