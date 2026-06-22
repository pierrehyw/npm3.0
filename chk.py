import warnings; warnings.filterwarnings('ignore')
import paramiko
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.40.129', username='root', password='ncompass123', timeout=10)
_, o, _ = c.exec_command('docker ps --filter name=ngpm-demo --format "{{.Status}}\t{{.Ports}}"')
print(o.read().decode('utf-8','replace').strip()); c.close()
