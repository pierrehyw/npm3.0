import warnings; warnings.filterwarnings('ignore')
import paramiko

HOST = '192.168.40.129'; USER = 'root'; PASS = 'ncompass123'
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

_, stdout, _ = ssh.exec_command('docker ps --filter name=ngpm-demo --format "{{.Status}}"')
print('Container status:', stdout.read().decode().strip())

_, stdout, _ = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/hubei.json')
print('hubei.json HTTP:', stdout.read().decode().strip())

_, stdout, _ = ssh.exec_command('ls -lh /opt/ngpm-demo/hubei.json 2>&1')
print('File on server:', stdout.read().decode().strip())

ssh.close()
print('OK')
