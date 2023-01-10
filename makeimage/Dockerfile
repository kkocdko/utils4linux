FROM fedora:37
ENV container=docker
RUN echo -n ;\
    # sed -e 's|^metalink=|#metalink=|g' -e 's|^#baseurl=http://download.example/pub/fedora/linux|baseurl=http://mirrors.ustc.edu.cn/fedora|g' -i.bak /etc/yum.repos.d/fedora.repo /etc/yum.repos.d/fedora-modular.repo /etc/yum.repos.d/fedora-updates.repo /etc/yum.repos.d/fedora-updates-modular.repo ;\
    dnf install -y lorax-lmc-novirt pykickstart git-core --setopt=install_weak_deps=False ;\
    git clone https://pagure.io/fedora-kickstarts --depth=1 --branch=f37 ;\
    dnf remove -y git-core ;\
    dnf clean all ;\
    echo 'cd fedora-kickstarts' >> entry.sh ;\
    echo 'cp $1 custom.ks' >> entry.sh ;\
    echo 'ksflatten -c custom.ks -o makeimage.ks' >> entry.sh ;\
    echo 'livemedia-creator --no-virt --releasever 37 --ks makeimage.ks --resultdir $2 ${@:3}' >> entry.sh ;\
    chmod +x entry.sh
ENTRYPOINT ["/bin/sh", "entry.sh"]
