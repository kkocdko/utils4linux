Use OrcaSlicer and FreeCAD.

https://www.bilibili.com/opus/918970285204439041

```sh
curl -o OrcaSlicer.AppImage -L https://github.com/SoftFever/OrcaSlicer/releases/download/v2.3.1-beta/OrcaSlicer_Linux_AppImage_Ubuntu2404_V2.3.1-beta.AppImage
chmod +x OrcaSlicer.AppImage
./OrcaSlicer.AppImage --appimage-extract
apt install --no-install-recommends libwebkit2gtk-4.1-0
```

```sh
curl -o FreeCAD.AppImage -L https://github.com/FreeCAD/FreeCAD/releases/download/weekly-2025.10.01/FreeCAD_weekly-2025.10.01-Linux-x86_64-py311.AppImage
chmod +x FreeCAD.AppImage
./FreeCAD.AppImage --appimage-extract

# remove useless things to reduce size

rm -rf squashfs-root/usr/share/doc
rm -rf squashfs-root/usr/share/mysql
rm -rf squashfs-root/usr/share/man

pushd squashfs-root/usr/lib
rm -rf libLLVM.* libopenvino.* libopenvino_* openvino-* libclang.* libclang-cpp.* librav1e.* libx265.* libx264.* libSvtAv1Enc.* libaom.* libpcl_*
popd

pushd squashfs-root/usr/lib/python3.11/site-packages
rm -rf OCC pandas scipy ifcopenshell
popd

# see mkdebian, todo: a new post for 2 block xz
tar -c FreeCAD | xz -T2 -9e --block-size $(tar -c FreeCAD | wc -c | awk '{print $1/2+64}') > FreeCAD.tar.xz
```

Content of file `（加强支撑）0.20mm Standard @Creality Ender-3 V3 KE 0.4 nozzle -.json` :

```json
{
  "base_id": "GP004",
  "bottom_shell_layers": "5",
  "enable_support": "1",
  "from": "User",
  "inherits": "0.20mm Standard @Creality Ender-3 V3 KE 0.4 nozzle",
  "is_custom_defined": "0",
  "name": "（加强支撑）0.20mm Standard @Creality Ender-3 V3 KE 0.4 nozzle -",
  "print_settings_id": "（加强支撑）0.20mm Standard @Creality Ender-3 V3 KE 0.4 nozzle -",
  "support_base_pattern": "rectilinear-grid",
  "support_interface_spacing": "0.2",
  "support_interface_top_layers": "3",
  "support_top_z_distance": "0.1",
  "support_type": "tree(auto)",
  "version": "25.8.30.15",
  "wall_loops": "3"
}
```
