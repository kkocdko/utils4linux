package site.kkocdko;

import org.apache.hadoop.io.WritableComparable;
import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;

public class WordCountWritable implements WritableComparable<WordCountWritable> {
    private String word;
    private int count;

    public WordCountWritable() {
    }

    public WordCountWritable(String word, int count) {
        this.word = word;
        this.count = count;
    }

    @Override
    public String toString() {
        return word + '\t' + count;
    }

    @Override
    public int compareTo(WordCountWritable other) {
        if (other == null) {
            return 1;
        }
        // 比较单词顺序：升序
        return this.word.compareTo(other.word);
    }

    @Override
    public void write(DataOutput out) throws IOException {
        // hadoop序列化
        out.writeUTF(this.word);
        out.writeInt(this.count);
    }

    @Override
    public void readFields(DataInput in) throws IOException {
        // hadoop反序列化
        this.word = in.readUTF();
        this.count = in.readInt();
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
