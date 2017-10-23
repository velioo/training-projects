To enable https on Ubuntu do these steps:

In the console:

1.Enable the ssl module by typing: 

sudo a2enmod ssl


2. After you have enabled SSL, you'll have to restart the web server for the change to be recognized:

sudo service apache2 restart


3. Create a subdirectory within Apache's configuration hierarchy to place the certificate files that we will be making:

sudo mkdir /etc/apache2/ssl


4. Now that we have a location to place our key and certificate create them both in one step by typing:

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/apache2/ssl/apache.key -out /etc/apache2/ssl/apache.crt


5. The questions portion looks something like this. Enter these values:

Country Name (2 letter code) [AU]:BG
State or Province Name (full name) [Some-State]:Sofia-city
Locality Name (eg, city) []:Sofia
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Velioo Ltd
Organizational Unit Name (eg, section) []:Hello THere
Common Name (e.g. server FQDN or YOUR name) []:localhost
Email Address []:velioocs@gmail.com


6. Open the file with root privileges now:

sudo nano /etc/apache2/sites-available/default-ssl.conf


7. The file should lok like this: 

<IfModule mod_ssl.c>
    <VirtualHost _default_:443>
        ServerAdmin admin@example.com
        ServerName localhost
        ServerAlias localhost
        DocumentRoot /var/www/html
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
        SSLEngine on
        SSLCertificateFile /etc/apache2/ssl/apache.crt
        SSLCertificateKeyFile /etc/apache2/ssl/apache.key
        <FilesMatch "\.(cgi|shtml|phtml|php)$">
            SSLOptions +StdEnvVars
        </FilesMatch>
        <Directory /var/www/html>
            SSLOptions +StdEnvVars
            DirectoryIndex index.php
            AllowOverride All
            Order allow,deny
            Allow from all
        </Directory>
        BrowserMatch "MSIE [2-6]" \
                        nokeepalive ssl-unclean-shutdown \
                        downgrade-1.0 force-response-1.0
        BrowserMatch "MSIE [17-9]" ssl-unclean-shutdown
    </VirtualHost>
</IfModule>

8. Save and exit the file when you are finished. Now that we have configured our SSL-enabled virtual host, we need to enable it.

sudo a2ensite default-ssl.conf

9. We then need to restart Apache to load our new virtual host file:

sudo service apache2 restart

10. Done now https is enabled. You must add an exception for "https://localhost" in the browser.
