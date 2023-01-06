# Build a lite version of Fedora Workstation.

# Based on offical kickstart file
%include fedora-live-workstation.ks

# Set virtual partition size
part / --size=8192

# Remove some packages
%packages
-@container-management
-@guest-desktop-agents
-@libreoffice
-@printing
-abrt-desktop
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
-gcc
-gdb
-ghostscript
-glibc-all-langpacks
-gnome-abrt
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
-mediawriter
-podman
-podman-*
-qemu-*
-qgnomeplatform-qt5
-qt5-*
-rhythmbox
-sos
-speech-dispatcher
-speech-dispatcher-*
-toolbox
-orca
-rygel
-simple-scan
-sane-backends
-sane-backends-*
-libsane-*
-sushi
-systemd-oomd-defaults
-totem
-unoconv
-urw-base35-*
# remove some git components
-git
git-core
# replace firefox with gnome-web
-@firefox
epiphany
# -yelp
# -fedora-logos*
# -fedora-release*
gnome-tweaks
%end

# Add adw-gtk3 theme
%post --nochroot
curl -o adw-gtk3.tar.xz -L https://github.com/lassekongo83/adw-gtk3/releases/download/v4.2/adw-gtk3v4-2.tar.xz
tar -xf adw-gtk3.tar.xz
rm -f adw-gtk3.tar.xz
mv ./adw-gtk3 /mnt/sysimage/usr/share/themes/
mv ./adw-gtk3-dark /mnt/sysimage/usr/share/themes/
%end

# Modify settings
%post
cat >> /usr/share/glib-2.0/schemas/org.gnome.desktop.interface.gschema.override << FOE
[org.gnome.desktop.interface]
gtk-theme="adw-gtk3"
monospace-font-name="Noto Sans Mono 10"
FOE
cat >> /usr/share/glib-2.0/schemas/org.gnome.desktop.background.gschema.override << FOE
[org.gnome.desktop.background]
primary-color="#000000"
FOE
cat >> /usr/share/glib-2.0/schemas/org.gnome.desktop.peripherals.touchpad.gschema.override << FOE
[org.gnome.desktop.peripherals.touchpad]
tap-to-click=true
FOE
cat >> /usr/share/glib-2.0/schemas/org.gnome.shell.gschema.override << FOE
[org.gnome.shell]
favorite-apps=[]
FOE
cat >> /usr/share/glib-2.0/schemas/org.gnome.TextEditor.gschema.override << FOE
[org.gnome.TextEditor]
spellcheck=false
FOE
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
