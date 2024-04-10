package site.kkocdko;

import org.apache.hadoop.io.WritableComparable;
import org.apache.hadoop.io.WritableComparator;

// 自定义分组
public class GroupByYear extends WritableComparator {

    public GroupByYear() {
        super(WeatherWritable.class, true);
    }

    // 重写compare方法，根据年份分组
    @Override
    public int compare(WritableComparable a, WritableComparable b) {
        WeatherWritable weather1 = (WeatherWritable) a;
        WeatherWritable weather2 = (WeatherWritable) b;
        // 根据年份分组，此时只关注是否等于0
        return weather1.getYear() - weather2.getYear();
    }

}
