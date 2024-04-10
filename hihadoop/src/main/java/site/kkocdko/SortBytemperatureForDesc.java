package site.kkocdko;

import org.apache.hadoop.io.WritableComparable;
import org.apache.hadoop.io.WritableComparator;

// 自定义按温度降序排序的比较器  
public class SortByTemperatureForDesc extends WritableComparator {

    // 构造方法，指定WritableComparable的类型，并设置排序方式为降序
    public SortByTemperatureForDesc() {
        super(WeatherWritable.class, true);
    }

    @Override
    public int compare(WritableComparable a, WritableComparable b) {
        WeatherWritable weather1 = (WeatherWritable) a;
        WeatherWritable weather2 = (WeatherWritable) b;

        // 如果年份不同，则按年份升序排序
        if (weather1.getYear() != weather2.getYear()) {
            return weather1.getYear() - weather2.getYear();
        }

        // 如果年份相同，则按温度降序排序
        return weather2.getMaxTemperature() - weather1.getMaxTemperature();
    }

}
