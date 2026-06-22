"""
检查 npa/frontend 镜像内部 nginx 配置，然后部署
"""
import warnings; warnings.filterwarnings('ignore')
import paramiko, io

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.40.129', username='root', password='ncompass123', timeout=15)

def r(cmd):
    _, o, e = c.exec_command(cmd)
    out = o.read().decode('utf-8','replace').strip()
    err = e.read().decode('utf-8','replace').strip()
    return out, err

# 检查 npa/frontend 镜像内的 nginx 配置
print("=== 检查 npa/frontend 镜像内部 ===")
out, _ = r('docker run --rm registry.i.ncmps.com/common/frontend:latest cat /etc/nginx/conf.d/default.conf 2>/dev/null || docker run --rm registry.i.ncmps.com/npa/frontend:latest cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "NO_DEFAULT"')
print(out[:500] if out else "empty")

print()
print("=== nginx html 根目录 ===")
out, _ = r('docker run --rm registry.i.ncmps.com/common/frontend:latest ls /usr/share/nginx/html/ 2>/dev/null | head -10')
print(out[:200] if out else "empty")

print()
print("=== mini-node 镜像内部 ===")
out, _ = r('docker run --rm registry.i.ncmps.com/images/mini-node-for-ci:rc node --version 2>/dev/null')
print(out[:100] if out else "no node")

c.close()
print("Done")
