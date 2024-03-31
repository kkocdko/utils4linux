package com.neuedu.myweather;

import org.apache.hadoop.io.WritableComparable;
import org.apache.hadoop.io.WritableComparator;

//降序自定义排序
public class SortBytemperatureForDesc extends WritableComparator {


    public SortBytemperatureForDesc() {
        super(WeatherWritable.class,true);
    }
    @Override
    public int compare(WritableComparable a, WritableComparable b) {
        WeatherWritable w1=(WeatherWritable) a;
        WeatherWritable w2=(WeatherWritable) b;
        //年份不同比年份，年份升序，年份相同比较温度，温度降序
        if(w1.getYear()!=w2.getYear())
            return w1.getYear()-w2.getYear();
        return w2.getMaxTemperrature()-w1.getMaxTemperrature();
    }

}
