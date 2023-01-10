# lazymirror - utils4fedora

HTTP proxy cache for rpm / deb packages.

Migrated to: [units::mirror - kkocdko/ksite](https://github.com/kkocdko/ksite/tree/main/src/units/mirror).

Look at the speed:

```txt
2023-01-10 07:33:55,507: Starting package installation process
2023-01-10 07:33:56,507: Downloading packages
2023-01-10 07:33:58,508: Downloading 1132 RPMs, 52.95 MiB / 1001.38 MiB (5%) done.
2023-01-10 07:34:00,509: Downloading 1132 RPMs, 959.15 MiB / 1001.38 MiB (95%) done.
2023-01-10 07:34:01,511: Preparing transaction from installation source
```
