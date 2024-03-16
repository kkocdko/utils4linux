# hihadoop

https://hub.docker.com/r/apache/hadoop

https://blog.csdn.net/chenweijiSun/article/details/80599029

https://www.gutenberg.org/cache/epub/20417/pg20417.txt

http://liubaoshuai.com/2020/04/21/hadoop-basic-1/

```sh
docker-compose up
docker-compose down --volumes
docker exec -it hihadoop_datanode_1 bash

curl -O -L https://www.gutenberg.org/cache/epub/20417/pg20417.txt
hdfs dfs -mkdir -p /user/hadoop/in
hdfs dfs -rm -r -f /user/hadoop/out
hdfs dfs -copyFromLocal pg20417.txt /user/hadoop/in/
yarn jar share/hadoop/mapreduce/hadoop-mapreduce-examples-*.jar wordcount in out
hdfs dfs -ls /user/hadoop/out

hadoop jar contrib/streaming/hadoop-*streaming*.jar \
-file /home/hduser/mapper.py    -mapper /home/hduser/mapper.py \
-file /home/hduser/reducer.py   -reducer /home/hduser/reducer.py \
-input /user/hduser/gutenberg/* -output /user/hduser/gutenberg-output

mvn compile
mvn package
```
