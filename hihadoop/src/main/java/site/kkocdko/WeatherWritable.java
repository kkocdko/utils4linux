package com.neuedu.myweather;

import org.apache.hadoop.io.WritableComparable;
import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;

public class WeatherWritable implements WritableComparable<WeatherWritable> {
    private int year;
    private int maxTemperrature;

    public WeatherWritable() {

    }

    public WeatherWritable(int year, int maxTemperrature) {
        this.year = year;
        this.maxTemperrature = maxTemperrature;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }


    public int getMaxTemperrature() {
        return maxTemperrature;
    }


    public void setMaxTemperrature(int maxTemperrature) {
        this.maxTemperrature = maxTemperrature;
    }

    @Override
    public String toString() {
        return year+"\t"+maxTemperrature;
    }

    @Override
    public int compareTo(WeatherWritable other) {
        if(other==null)
            return 1;
        return this.year-other.year;
    }

    @Override
    public void write(DataOutput dataOutput) throws IOException {
        //序列化
        dataOutput.writeInt(this.year);
        dataOutput.writeInt(this.maxTemperrature);
    }

    @Override
    public void readFields(DataInput dataInput) throws IOException {
        this.year=dataInput.readInt();
        this.maxTemperrature=dataInput.readInt();    }
}
