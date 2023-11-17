CREATE USER 'mvx_andrei'@'localhost' IDENTIFIED BY 'mvx_root';
GRANT ALL PRIVILEGES ON mvx.* TO 'mvx_andrei'@'localhost';
FLUSH PRIVILEGES;