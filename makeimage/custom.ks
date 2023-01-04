# Build a lite version of Fedora Workstation.

# based on offical kickstart file
%include fedora-live-workstation.ks

# set virtual partition size
part / --size=8192

# remove some packages
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
-libsane-*
-lohit-*
-mediawriter
-orca
-podman
-podman-*
-qemu-*
-qgnomeplatform-qt5
-qt5-*
-rhythmbox
-sane-backends-*
-simple-scan
-sos
-speech-dispatcher
-speech-dispatcher-*
-sushi
-toolbox
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

# modify settings
%post
curl -o /usr/share/themes/adw-gtk3.tar.xz -L https://github.com/lassekongo83/adw-gtk3/releases/download/v4.2/adw-gtk3v4-2.tar.xz
(cd /usr/share/themes && tar -xf adw-gtk3.tar.xz && rm -f adw-gtk3.tar.xz)
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
glib-compile-schemas /usr/share/glib-2.0/schemas
%end
