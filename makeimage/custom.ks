# Build a lite version of Fedora Workstation.

# Based on offical kickstart file
%include fedora-live-workstation.ks

# Set image root size
# part / --size=8192

# Packages config
%packages
-@container-management
-@guest-desktop-agents
-@libreoffice
-@firefox
-@printing
-abrt
-abrt-*
-adobe-source-code-pro-fonts
-adwaita-qt5
-anaconda-install-env-deps
-baobab
-bluez-cups
-cheese
-cpp
-cups
-cups-filters
-desktop-backgrounds-gnome
-eog
-evince
-evince-djvu
-evince-nautilus
-fedora-bookmarks
-fedora-workstation-backgrounds
-gamemode
-ghostscript
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
-google-noto-emoji-color-fonts
-gutenprint-cups
-hplip
-ibus-libzhuyin
-ibus-typing-booster
-kernel-modules-extra
-lohit-*
-mediawriter # use ventoy or dd instead
-qgnomeplatform-qt5
-qt5-*
-rhythmbox
-sos
-speech-dispatcher
-toolbox
-orca
-rygel
-simple-scan
-sane-backends
-sane-backends-*
-libsane-*
-sushi
-totem
-unoconv
-git
gnome-tweaks
epiphany # replace firefox with gnome-web
isomd5sum # included for image checking by anaconda-install-env-deps
%end

# Add adw-gtk3 theme
%post --nochroot
curl -o adw-gtk3.tar.xz -L https://github.com/lassekongo83/adw-gtk3/releases/download/v4.2/adw-gtk3v4-2.tar.xz
tar -xf adw-gtk3.tar.xz -C /mnt/sysimage/usr/share/themes/
rm -f adw-gtk3.tar.xz
%end

# Modify settings
%post
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
systemctl disable dnf-makecache
systemctl disable dnf-makecache.timer
%end

# Mirror tips
# http://192.168.1.150:9304/mirror/fedora/releases/37/Everything/x86_64/os/
# http://192.168.1.150:9304/mirror/fedora/releases/$releasever/Everything/$basearch/os/
# https://mirror.nju.edu.cn/fedora/releases/$releasever/Everything/$basearch/os/
# https://mirrors.ustc.edu.cn/fedora/releases/$releasever/Everything/$basearch/os/
# repo --name="fedora" --baseurl="https://.../$basearch/os/"
# repo --name="updates" --baseurl="https://.../$basearch/"
# url --url "https://.../$basearch/os/"
# curl -o adw-gtk3.tar.xz -L https://ghproxy.com/https://github.com/...
