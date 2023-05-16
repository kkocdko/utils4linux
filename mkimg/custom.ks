# Build a lite version of Fedora Workstation.

# Based on offical kickstart file
%include fedora-live-workstation.ks

# Set image root size
# part / --size=8192

# Packages config
%packages
-@container-management
-@firefox
-@guest-desktop-agents
-@libreoffice
-@printing
-abrt
-abrt-*
-adwaita-qt5
-anaconda-install-env-deps
-avahi
-baobab
-bluez-cups
-cheese
-cpp
-cups
-cups-filters
-desktop-backgrounds-gnome
-dnsmasq
-eog
-evince
-evince-djvu
-evince-nautilus
-fedora-bookmarks
-fedora-workstation-backgrounds
-gamemode
-geolite2-*
-ghostscript
-git
-glibc-all-langpacks
-gnome-backgrounds
-gnome-boxes
-gnome-calculator
-gnome-calendar
-gnome-characters
-gnome-classic-session
-gnome-clocks
-gnome-color-manager
-gnome-connections
-gnome-contacts
-gnome-font-viewer
-gnome-help
-gnome-logs
-gnome-maps
-gnome-photos
-gnome-remote-desktop
-gnome-shell-extension-background-logo
-gnome-software
-gnome-tour
-gnome-user-docs
-gnome-user-share
-gnome-weather
-gutenprint-cups
-hplip
-ibus-anthy # omit these if you want
-ibus-hangul
-ibus-libzhuyin
-ibus-m17n
-ibus-typing-booster
-kernel-modules-extra
-libsane-*
-lohit-*
-mediawriter # use ventoy or dd instead
-nss-mdns
-orca
-qgnomeplatform-qt5
-qt5-*
-realmd
-rhythmbox
-rygel
-sane-backends
-sane-backends-*
-simple-scan
-sos
-speech-dispatcher
-sushi
-tcpdump
-thermald
-toolbox
-totem
-traceroute
-unoconv
-uresourced
-whois
-words
epiphany # replace firefox with gnome-web
gnome-tweaks
isomd5sum # included for image checking by anaconda-install-env-deps
# todo: plymouth, plymouth-system-theme, abattis-*-fonts
# fonts
-aajohan-comfortaa-fonts
-adobe-source-code-pro-fonts
-google-noto-emoji-color-fonts
-jomolhari-fonts
-khmer-os-system-fonts
-liberation-*-fonts
-paktype-naskh-basic-fonts
-rit-meera-new-fonts
-sil-*-fonts
-stix-fonts
-thai-scalable-waree-fonts
-vazirmatn-vf-fonts
%end

# Add adw-gtk3 theme
%post --nochroot
curl -o adw-gtk3.tar.xz -L https://github.com/lassekongo83/adw-gtk3/releases/download/v4.6/adw-gtk3v4-6.tar.xz
tar -xf adw-gtk3.tar.xz -C /mnt/sysimage/usr/share/themes/
rm -f adw-gtk3.tar.xz
%end

# Modify settings
%post
rm /usr/share/anaconda/gnome/fedora-welcome.desktop # disable welcome dialog
cat >> /usr/share/glib-2.0/schemas/org.gnome.desktop.interface.gschema.override << EOF
[org.gnome.desktop.interface]
gtk-theme="adw-gtk3"
font-name="Noto Sans 11"
document-font-name="Noto Sans 11"
monospace-font-name="Noto Sans Mono 10"
EOF
cat >> /usr/share/glib-2.0/schemas/org.gnome.desktop.wm.preferences.gschema.override << EOF
[org.gnome.desktop.wm.preferences]
titlebar-font="Noto Sans Bold 11"
EOF
cat >> /usr/share/glib-2.0/schemas/org.gnome.desktop.background.gschema.override << EOF
[org.gnome.desktop.background]
primary-color="#000000"
EOF
cat >> /usr/share/glib-2.0/schemas/org.gnome.desktop.peripherals.touchpad.gschema.override << EOF
[org.gnome.desktop.peripherals.touchpad]
tap-to-click=true
EOF
cat >> /usr/share/glib-2.0/schemas/org.gnome.TextEditor.gschema.override << EOF
[org.gnome.TextEditor]
spellcheck=false
EOF
glib-compile-schemas /usr/share/glib-2.0/schemas
systemctl disable dnf-makecache.service
systemctl disable dnf-makecache.timer
%end

# Mirror tips
# http://192.168.1.150:9304/mirror/fedora/releases/38/Everything/x86_64/os/
# http://192.168.1.150:9304/mirror/fedora/releases/$releasever/Everything/$basearch/os/
# https://mirror.nju.edu.cn/fedora/releases/$releasever/Everything/$basearch/os/
# https://mirrors.ustc.edu.cn/fedora/releases/$releasever/Everything/$basearch/os/
# repo --name="fedora" --baseurl="https://.../$basearch/os/"
# repo --name="updates" --baseurl="https://.../$basearch/"
# url --url "https://.../$basearch/os/"
# curl -o adw-gtk3.tar.xz -L https://ghproxy.com/https://github.com/...
