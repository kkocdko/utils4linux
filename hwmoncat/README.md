# hwmoncat - utils4linux

Used for sensors reading. A lightweight alternative to [lm-sensors](https://github.com/lm-sensors/lm-sensors).

## Why

Because the lm-sensors required too many dependencies:

```
[kkocdko@klf apps]$ sudo dnf install lm_sensors
... some boring logs
Installing dependencies:
 perl-AutoLoader  noarch  5.74-492.fc37
 perl-B           x86_64  1.83-492.fc37
 perl-Carp        noarch  1.52-489.fc37
... many many packages!
Install  59 Packages
Installed size: 26 M
```

However, after kernel `5.6`, we can read sensors easily through the [hwmon module](https://www.kernel.org/doc/html/latest/hwmon/), without any other dependencies. So I write this helper script.

This script shows:

```
[kkocdko@klf apps]$ ./hwmoncat
- bat1
in0: 15.76 V
- nvme
temp1_composite: 30.85 C
- k10temp
temp1_tctl: 44.38 C
- iwlwifi_1
temp1: 34.00 C
- amdgpu
freq1_sclk: 1800 MHz
in0_vddgfx: 0.96 V
in1_vddnb: 0.69 V
power1_ppt: 18.00 W
temp1_edge: 35.00 C
```

Compare to the lm-sensors:

```
[kkocdko@klf apps]$ sensors
iwlwifi_1-virtual-0
Adapter: Virtual device
temp1:        +34.0°C

nvme-pci-0200
Adapter: PCI adapter
Composite:    +33.9°C  (low  =  -5.2°C, high = +79.8°C)
                       (crit = +84.8°C)

amdgpu-pci-0500
Adapter: PCI adapter
vddgfx:      662.00 mV
vddnb:       687.00 mV
edge:         +34.0°C
PPT:           2.00 W

k10temp-pci-00c3
Adapter: PCI adapter
Tctl:         +37.1°C

BAT1-acpi-0
Adapter: ACPI interface
in0:          15.75 V
```

## Thanks

- <https://www.kernel.org/doc/html/latest/hwmon/>

- <https://unix.stackexchange.com/questions/558112/>

- <https://www.gnu.org/software/gawk/manual/gawk.html>

<!--
./hyperfine -w 5 -r 32 -p 'sleep 0.1' ./hwmoncat

mkdir dist
cd dist
mockdata(){ mkdir -p $(dirname "$1") ; echo "$2" > "$1" ;}
mockdata hwmon1/in0_input 15760
mockdata hwmon1/name BAT1
mockdata hwmon2/name nvme
mockdata hwmon2/temp1_input 30850
mockdata hwmon2/temp1_label Composite
mockdata hwmon3/name k10temp
mockdata hwmon3/temp1_input 34125
mockdata hwmon3/temp1_label Tctl
mockdata hwmon4/name iwlwifi_1
mockdata hwmon4/temp1_input 34000
mockdata hwmon5/freq1_input 200000000
mockdata hwmon5/freq1_label sclk
mockdata hwmon5/in0_input 662
mockdata hwmon5/in0_label vddgfx
mockdata hwmon5/in1_input 687
mockdata hwmon5/in1_label vddnb
mockdata hwmon5/name amdgpu
mockdata hwmon5/power1_input 3000000
mockdata hwmon5/power1_label PPT
mockdata hwmon5/temp1_input 33000
mockdata hwmon5/temp1_label edge
-->
