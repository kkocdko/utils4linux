#!/bin/sh
# 20250424-1833 run this script in phone before backup to reduce backup size
ls /data/data | head # ensure real root user
get_out(){ for a in $@; do rm -rf $a ; mkdir -p $(dirname $a) ; echo blocked > $a ; chmod -w $a ; done ;} # avoid recreate
# QQ 9.1.5
rm -rf /data/data/com.tencent.mobileqq/app_libs
rm -rf /data/data/com.tencent.mobileqq/app_lib
rm -rf /data/data/com.tencent.mobileqq/app_tbs
rm -rf /data/data/com.tencent.mobileqq/txlib
rm -rf /data/data/com.tencent.mobileqq/files/qqso
get_out /data/data/com.tencent.mobileqq/files/pddata/prd
get_out /sdcard/Android/data/com.tencent.mobileqq/Tencent/MobileQQ/pddata/prd
get_out /sdcard/Android/data/com.tencent.mobileqq/files/ae/sv_config_resources
get_out /sdcard/Android/data/com.tencent.mobileqq/qzone/head_drop_operaion
get_out /sdcard/Android/data/com.tencent.mobileqq/qzone/zip_cache
# get_out /data/data/com.tencent.mobileqq/app_xwalk_5315
# get_out /data/data/com.tencent.mobileqq/files/qq_emoticon_res/sysface_res/gif
# get_out /data/data/com.tencent.mobileqq/files/qq_emoticon_res/sysface_res/apng
# WeChat 8.0.57
get_out /data/data/com.tencent.mm/app_xwalk*
get_out /data/data/com.tencent.mm/app_xweb_data
get_out /data/data/com.tencent.mm/tinker* # tinker hot-fix
get_out /data/data/com.tencent.mm/files/public/maas-sdk # ai lib
get_out /data/data/com.tencent.mm/files/public/xlab
# get_out /data/data/com.tencent.mm/files/public/websearch
get_out /data/data/com.tencent.mm/files/xlog
get_out /data/data/com.tencent.mm/MicroMsg/webview_tmpl
get_out /data/data/com.tencent.mm/MicroMsg/CheckResUpdate
rm -rf /data/data/com.tencent.mm/MicroMsg/appbrand
rm -rf /data/data/com.tencent.mm/MicroMsg/luckymoney
rm -rf /data/data/com.tencent.mm/MicroMsg/luckymoneynewyear
# AMap
rm -rf /sdcard/Android/data/com.autonavi.minimap/files/autonavi/httpcache
get_out /data/data/com.autonavi.minimap/app_h5container/uc
get_out /data/data/com.autonavi.minimap/files/lib_hotfix
get_out /data/data/com.autonavi.minimap/files/lib_hotfix\$
get_out /data/data/com.autonavi.minimap/files/extlib/amap_bundle_cloud_ar_*
get_out /data/data/com.autonavi.minimap/files/extlib/amap_bundle_cloud_denoise_so
get_out /data/data/com.autonavi.minimap/files/extlib/amap_bundle_cloud_uc_res
get_out /data/data/com.autonavi.minimap/files/4ac77f4b
get_out /data/data/com.autonavi.minimap/files/4ac77f60
get_out /data/data/com.autonavi.minimap/files/voice
get_out /data/data/com.autonavi.minimap/files/nebulaInstallApps
# Alipay
# rm -rf /data/data/com.eg.android.AlipayGphone/app_h5container/uc
# rm -rf /data/data/com.eg.android.AlipayGphone/app_plugins_lib
# rm -rf /data/data/com.eg.android.AlipayGphone/app_ucmsdk
