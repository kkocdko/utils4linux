# hwmoncat - utils4fedora

Lightweight alternative to [lm-sensors](https://github.com/lm-sensors/lm-sensors).

## Why

Because the lm-sensors need too many dependencies:

```
[kkocdko@klf apps]$ sudo dnf install lm_sensors
... some logs
Installing dependencies:
 perl-AutoLoader  noarch  5.74-492.fc37
 perl-B           x86_64  1.83-492.fc37
 perl-Carp        noarch  1.52-489.fc37
... many many packages
Install  59 Packages
Installed size: 26 M
```

However, after kernel 5.6, we can read sensors easily through the [hwmon module](https://www.kernel.org/doc/html/latest/hwmon/), without any other dependencies. So I write this helper script.

This script shows:

```
[kkocdko@klf apps]$ ./hwmon
[bat1]
in0: 15.679 V

[nvme]
temp1(composite): 22.85 C

[amdgpu]
freq1(sclk): 200 MHz
in0(vddgfx): 0.656 V
in1(vddnb): 0.687 V
temp1(edge): 24.00 C

[k10temp]
temp1(tctl): 25.75 C
```

The lm-sensors:

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
vddnb:       843.00 mV
edge:         +29.0°C
PPT:           0.00 W

BAT1-acpi-0
Adapter: ACPI interface
in0:          15.68 V
```

## Thanks

- https://www.kernel.org/doc/html/latest/hwmon/

- https://unix.stackexchange.com/questions/558112/
