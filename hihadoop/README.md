# hihadoop

```sh
docker-compose up
docker-compose down --volumes
docker exec -it hihadoop_datanode_1 bash
hdfs dfs -mkdir -p /user/hadoop/in
hdfs dfs -rm -r -f /user/hadoop/out
hdfs dfs -copyFromLocal pg20417.txt /user/hadoop/in/
yarn jar share/hadoop/mapreduce/hadoop-mapreduce-examples-*.jar wordcount in out
hdfs dfs -ls /user/hadoop/out
hadoop jar /hihadoop-1.0.0.jar site.kkocdko.WordCountMain /tmp/wc/i /tmp/wc/o
mvn compile
mvn package
curl -O -L https://www.gutenberg.org/cache/epub/20417/pg20417.txt
curl -o target/pg20417.txt --compressed -L https://registry.npmmirror.com/typescript/5.4.2/files/lib/typescript.js
clear ; mvn compile exec:java
```

https://hub.docker.com/r/apache/hadoop

https://blog.csdn.net/chenweijiSun/article/details/80599029

https://www.cnblogs.com/james-wangx/p/16106454.html

http://liubaoshuai.com/2020/04/21/hadoop-basic-1/
