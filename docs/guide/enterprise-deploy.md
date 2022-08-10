# 企业版部署指南(centos7)

文档以centos7.6为安装示例，如果你使用的是centos8以上版本，相关命令自行替换即可。

一、挂载数据盘

当你从阿里云购买数据盘后，需要执行以下操作将数据盘挂载后才使用：

分区命令：

```
fdisk /dev/vdb
```

依次输入n回车,p加车,1回车,w回车

格式化命令：

```
mkfs.ext3 /dev/vdb1
```

创建数据目录：

```
mkdir /data
```

挂载数据盘：

```
echo "/dev/vdb1 /data ext3 defaults 0 0" >> /etc/fstab
```

```
mount -a
```

挂载完成

```
df -m
```

[http://doc.miaomaiyun.com/server/index.php?s=/api/attachment/visitFile/sign/dd4db1d62986a1986fd975841a6041ca](http://doc.miaomaiyun.com/server/index.php?s=/api/attachment/visitFile/sign/dd4db1d62986a1986fd975841a6041ca)

出现上图所示的信息表示数据盘挂载成功

二、安装nginx1、下载yum库`rpm -Uvh https://mirror.webtatic.com/yum/el6/latest.rpm`2、安装nginx`yum install -y nginx`配置nginx文件，注意nginx.conf的位置和你的安装位置一致`vi /etc/nginx/nginx.conf`复制以下的内容，编辑并替换

```
user              nobody nobody;
worker_processes  2;
error_log  /var/log/nginx/error.log;
#error_log  /dev/null;
#error_log  /var/log/nginx/error.log  notice;
#error_log  /var/log/nginx/error.log  info;
pid        /var/run/nginx.pid;
events {
    use epoll;
    worker_connections  65535;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    charset       utf-8;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log off;
    sendfile        on;
    #tcp_nopush     on;
    #keepalive_timeout  0;
    keepalive_timeout  15;
    gzip  on;
    fastcgi_connect_timeout 300;
    fastcgi_send_timeout 300;
    fastcgi_read_timeout 300;
    client_body_buffer_size 24m;
    client_max_body_size 24m;
    # Load config files from the /etc/nginx/conf.d directory
    include /etc/nginx/conf.d/*.conf;
}

```

3、编辑ERP对应的虚拟主机配置，注意文件路径和nginx.conf配置文件中 include /etc/nginx/conf.d/*.conf一致`vi /etc/nginx/conf.d/mmy.conf`

复制以下内容的内容，注意目录路径/data/mmyVhost/adm和域名端口的配置

```
server {
        listen       80;
        server_name  adm.miaomaiyun.com;
       root   /data/mmyVhost/adm/web;
       location / {
           index  index.html index.php;
           if (-e $request_filename) {
                    break;
               }
            if (!-e $request_filename) {
                   rewrite ^/(.*)$ /index.php/$1 last;
                  break;
               }
       }
       error_page  404      /404.html;
       location = /404.html {
               root   /usr/share/nginx/html;
      }
       error_page   500 502 503 504  /50x.html;
      location = /50x.html {
               root   /usr/share/nginx/html;
       }
       location  ~ ^(.+\.php)(.*)$ {
               fastcgi_pass    unix:/var/run/php-fpm/php-fpm.sock;
               fastcgi_index   index.php;
               fastcgi_split_path_info ^(.+\.php)(.*)$;
               fastcgi_param   SCRIPT_FILENAME $document_root$fastcgi_script_name;
               fastcgi_param   PATH_INFO             $fastcgi_path_info;
               fastcgi_param   PATH_TRANSLATED $document_root$fastcgi_path_info;
               include fastcgi_params;
       }
}

```

3、测试配置文件有无问题`nginx -t`

[http://doc.miaomaiyun.com/server/index.php?s=/api/attachment/visitFile/sign/319ab00eecae0486f6a84ce5bf8e2181](http://doc.miaomaiyun.com/server/index.php?s=/api/attachment/visitFile/sign/319ab00eecae0486f6a84ce5bf8e2181)

返回上图的示例即表示正常

4、启动nginx`systemctl start nginx`

5、启动后，避免返回长内容时不完整，还应修改以下目录权限(切记、切记、切记，重要的事情说3遍)`chown -Rf nobody:nobody /var/lib/nginx`

三、安装mysql5.51、先移出系统自带的mysql-libs,这个要比php先安装，不然移出的时候，会删除 php-mysql.x86_64`yum remove -y mysql-libs.x86_64 mariadb-libs-1:5.5.68-1.el7.x86_64yum install -y mysql55w mysql55w-server`

2、编辑mysql配置文件`vi /etc/my.cnf`

复制以下内容到my.cnf

```
[mysqld]
datadir=/data/mysqlData/mysql
socket=/var/lib/mysql/mysql.sock
user=mysql
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
port=3326
character-set-server=utf8
innodb_file_per_table=1
max_connections=2000
wait_timeout=60
innodb_io_capacity=2000
innodb_buffer_pool_size = 1024M
#innodb_log_buffer_size = 8M
#innodb_log_file_size = 64M
skip-external-locking
key_buffer_size = 512M
max_allowed_packet = 32M
table_open_cache = 8192
sort_buffer_size = 32M
read_buffer_size = 32M
read_rnd_buffer_size = 128M
myisam_sort_buffer_size = 256M
thread_cache_size = 256
query_cache_size= 512M
thread_concurrency = 8
tmp_table_size=512M
max_heap_table_size=512M
[mysqld_safe]
log-error=/var/log/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid

```

3、启动数据库`systemctl start mysqld`

4、更新数据库`mysql_upgrade -u root -p`

5、设置数据库root密码`mysqladmin -u root password "你的密码"`

四、安装php5.45淼迈云收银的目前只能运行在php 5.4.45 + ZendGuardLoader环境下。1、加入新yum库：`rpm -ivh http://www6.atomicorp.com/channels/atomic/centos/6/x86_64/RPMS/atomic-release-1.0-21.el6.art.noarch.rpm`或`rpm -ivh http://b.aimiaomai.com/atomic-release-1.0-21.el6.art.noarch.rpm`

3、安装 php 等模块，可以用 `yum list | grep php | grep 5.4 | grep x86_64 | grep atomic` 先查看

`yum install -y atomic-php54-php atomic-php54-php-bcmath atomic-php54-php-cli atomic-php54-php-common atomic-php54-php-dba atomic-php54-php-devel atomic-php54-php-embedded atomic-php54-php-enchant atomic-php54-php-fpm atomic-php54-php-gd atomic-php54-php-imap atomic-php54-php-interbase atomic-php54-php-intl atomic-php54-php-ldap atomic-php54-php-mbstring atomic-php54-php-mcrypt atomic-php54-php-mysqlnd atomic-php54-php-odbc atomic-php54-php-pdo atomic-php54-php-pgsql atomic-php54-php-process atomic-php54-php-pspell atomic-php54-php-recode atomic-php54-php-runtime atomic-php54-php-snmp atomic-php54-php-soap atomic-php54-php-tidy atomic-php54-php-xml atomic-php54-php-xmlrpc`4、下载 zend loader 模块，`wget http://downloads.zend.com/guard/6.0.0/ZendGuardLoader-70429-PHP-5.4-linux-glibc23-x86_64.tar.gz`5、解压ZendGuardLoader.so文件到`tar -xzvf ZendGuardLoader-70429-PHP-5.4-linux-glibc23-x86_64.tar.gz`复制ZendGuardLoader.so到php.ini里配置的 extension_dir目录。

`cp ZendGuardLoader-70429-PHP-5.4-linux-glibc23-x86_64/php-5.4.x/ZendGuardLoader.so /opt/atomic/atomic-php54/root/usr/lib64/php/modules/vi /opt/atomic/atomic-php54/root/etc/php.ini`7、修改php.ini文件，结尾加入

```
;;;;;;;;;;;;;;; by Sung
is_production_server = on
date.timezone = Asia/Chongqing
error_reporting = 30709
upload_max_filesize = 64M
post_max_size = 512M
memory_limit = 512M
max_input_vars=20000
include_path = "."
expose_php = Off
[redis]
;extension=redis.so
[zend]
zend_extension = /opt/atomic/atomic-php54/root/usr/lib64/php/modules/ZendGuardLoader.so

```

8、设置php-fpm配置文件

`vi /opt/atomic/atomic-php54/root/etc/php-fpm.d/www.conf`复制以下内容

```

[www]
listen = /var/run/php-fpm/php-fpm.sock
listen.allowed_clients = 127.0.0.1
listen.owner = nobody
listen.group = nobody
user = nobody
group = nobody
pm = dynamic
pm.max_children = 2000
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 200
pm.max_requests = 5000
pm.status_path = /pstatus
request_slowlog_timeout = 30
slowlog = /var/log/php-fpm/www-slow.log
php_admin_value[error_log] = /var/log/php-fpm/www-error.log
php_admin_flag[log_errors] = on
php_value[session.save_handler] = files
php_value[session.save_path]    = /var/lib/php/session
php_value[soap.wsdl_cache_dir]  = /var/lib/php/wsdlcache

```

9、修改/opt/atomic/atomic-php54/root/etc/php-fpm.conf`vi /opt/atomic/atomic-php54/root/etc/php-fpm.confinclude=/etc/php-fpm.d/*.conf`变更为`include=/opt/atomic/atomic-php54/root/etc/php-fpm.d/*.conf`10、建立目录`mkdir /var/log/php-fpm`11、修改目录权限，启动php-fpm

`chown nobody:nobody /var/lib/php/sessionchown nobody:nobody /var/lib/php/wsdlcache`12、增加php-fpm.server`vi /etc/systemd/system/php-fpm.service`

```
[Unit]
Description=The PHP FastCGI Process Manager
After=syslog.target network.target

[Service]
Type=notify
#PIDFile=/run/php-fpm/php-fpm.pid
#EnvironmentFile=/etc/sysconfig/php-fpm
ExecStart=/opt/atomic/atomic-php54/root/usr/sbin/php-fpm --nodaemonize
ExecReload=/bin/kill -USR2 $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target

```

`systemctl start php-fpm`或`/opt/atomic/atomic-php54/root/sbin/php-fpm`

五、安装完毕，下载淼云安装包到相对应目录解压即可。上例中的路径为/data/mmyVhost/adm