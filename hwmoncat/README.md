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
in0_vddgfx: 1.30 V
in1_vddnb: 0.84 V
power1_ppt: 18.00 W
temp1_edge: 35.00 C
```

Compare to the lm-sensors:

```
[kkocdko@klf apps]$ sensors
k10temp-pci-00c3
Adapter: PCI adapter
Tctl:         +31.0°C

nvme-pci-0200
Adapter: PCI adapter
Composite:    +25.9°C

amdgpu-pci-0500
Adapter: PCI adapter
vddgfx:      656.00 mV
edge:         +29.0°C

BAT1-acpi-0
Adapter: ACPI interface
in0:          15.67 V
```

## Thanks

- <https://www.kernel.org/doc/html/latest/hwmon/>

- <https://unix.stackexchange.com/questions/558112/>

- <https://www.gnu.org/software/gawk/manual/gawk.html>

<!--
./hyperfine -w 5 -r 32 -p 'sleep 0.1' ./hwmoncat
-->
