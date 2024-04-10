package site.kkocdko;

import org.apache.hadoop.io.WritableComparable;
import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;

public class WeatherWritable implements WritableComparable<WeatherWritable> {
    private int year;  // 年份
    private int maxTemperature;  // 最高温度

    public WeatherWritable() {

    }

    public WeatherWritable(int year, int maxTemperature) {
        this.year = year;
        this.maxTemperature = maxTemperature;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getMaxTemperature() {
        return maxTemperature;
    }

    public void setMaxTemperature(int maxTemperature) {
        this.maxTemperature = maxTemperature;
    }

    @Override
    public String toString() {
        return year + "\t" + maxTemperature;
    }

    @Override
    public int compareTo(WeatherWritable other) {
        if (other == null)
            return 1;
        return this.year - other.year;
    }

    @Override
    public void write(DataOutput dataOutput) throws IOException {
        // 将对象序列化为字节流
        dataOutput.writeInt(this.year);
        dataOutput.writeInt(this.maxTemperature);
    }

    @Override
    public void readFields(DataInput dataInput) throws IOException {
        // 将字节流反序列化为对象
        this.year = dataInput.readInt();
        this.maxTemperature = dataInput.readInt();
    }
}
