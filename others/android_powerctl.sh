#!/bin/sh
dvfs=/proc/cpudvfs/cpufreq_debug
mode_file=/data/local/tmp/powerctl_mode
read -rd "" mode < $mode_file
mode=$(( (mode + 1) % 3 ))
echo $mode > $mode_file
echo $mode
if [ $mode = 0 ]; then
  echo 0-7 > /dev/cpuset/top-app/cpus
  echo 0-7 > /dev/cpuset/foreground/cpus
  echo 0 200000 1800000 > $dvfs
  echo 4 400000 2850000 > $dvfs
  echo 7 1300000 3050000 > $dvfs
fi
if [ $mode = 1 ]; then
  echo 0-7 > /dev/cpuset/top-app/cpus
  echo 0-7 > /dev/cpuset/foreground/cpus
  echo 0 1800000 1800000 > $dvfs
  echo 4 2850000 2850000 > $dvfs
  echo 7 3050000 3050000 > $dvfs
fi
if [ $mode = 2 ]; then
  echo 0-3 > /dev/cpuset/top-app/cpus
  echo 0-3 > /dev/cpuset/foreground/cpus
  echo 0 200000 400000 > $dvfs
  echo 4 400000 400000 > $dvfs
  echo 7 1300000 1300000 > $dvfs
  echo 0 > /sys/class/leds/lcd-backlight/brightness
fi

# not anywhere, use mixplorer execute

# anywhere shell output style = dialog
# exit 0 # do not use exit command in anywhere

# dvfs=/proc/cpudvfs/cpufreq_debug
# eem=/proc/eem/eem_offset
# echo 0 200000 200000 >$dvfs
# echo 4 800000 1200000 >$dvfs
# echo 7 1300000 1300000 >$dvfs
# echo 0 0 >$eem # -4
# echo 1 0 >$eem # -6
# echo 2 0 >$eem # -7
# # echo powersave > /sys/class/misc/mali0/device/devfreq/13000000.mali/governor
# su -lp 2000 -c "cmd notification post -S bigtext sh_$(date +%s) '$(cat /proc/eem/eem_cur_volt | grep -A 1 TABLE)'"

