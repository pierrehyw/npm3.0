"""
NGPM Prototype 部署脚本 v2
使用服务器已有的 common/frontend:latest (nginx) 镜像
端口: 8080
"""
import warnings; warnings.filterwarnings('ignore')
import os, sys, paramiko, time, io

HOST = '192.168.40.129'
USER = 'root'
PASS = 'ncompass123'
CONTAINER_NAME = 'ngpm-demo'
REMOTE_DIR = '/opt/ngpm-demo'
NGINX_IMAGE = 'registry.i.ncmps.com/common/frontend:latest'
DEPLOY_PORT = 8080

LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FILES = [
    'index.html', 'dashboard.html', 'network.html', 'app.html',
    'security.html', 'assets.html', 'policy.html', 'traffic.html',
    'dashboard.css', 'dashboard.js', 'ai-page.css', 'style.css',
    'drawer.css', 'error-drawer.html', 'app.js', 'topo-preview.html',
    'image.png', 'hubei.json',
]

NGINX_CONF = """server {
    listen       80;
    server_name  localhost;
    charset utf-8;

    location / {
        root   /usr/share/nginx/html;
        index  dashboard.html index.html;
        try_files $uri $uri/ /dashboard.html;
        add_header Cache-Control "no-cache";
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
"""

def run(c, cmd):
    _, o, e = c.exec_command(cmd, timeout=60)
    out = o.read().decode('utf-8','replace').strip()
    err = e.read().decode('utf-8','replace').strip()
    if out: print(f"  {out}")
    if err: print(f"  [err] {err[:200]}")
    return out

print(f"[1/5] 连接到 {HOST}...")
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    c.connect(HOST, username=USER, password=PASS, timeout=15)
    print("      连接成功")
except Exception as e:
    print(f"      连接失败: {e}"); sys.exit(1)

print(f"[2/5] 清理旧容器（如有）...")
run(c, f'docker stop {CONTAINER_NAME} 2>/dev/null; docker rm {CONTAINER_NAME} 2>/dev/null; echo "done"')

print(f"[3/5] 创建远程目录并上传文件...")
run(c, f'mkdir -p {REMOTE_DIR}')

sftp = c.open_sftp()

# 上传静态文件
uploaded = 0
for fname in STATIC_FILES:
    lp = os.path.join(LOCAL_DIR, fname)
    if os.path.exists(lp):
        sftp.put(lp, f'{REMOTE_DIR}/{fname}')
        print(f"      ✓ {fname}")
        uploaded += 1
    else:
        print(f"      - 跳过: {fname}")

# 上传 nginx 配置
nginx_conf_bytes = NGINX_CONF.encode('utf-8')
sftp.putfo(io.BytesIO(nginx_conf_bytes), f'{REMOTE_DIR}/default.conf')
print(f"      ✓ default.conf (nginx 配置)")
uploaded += 1

sftp.close()
print(f"      共上传 {uploaded} 个文件")

print(f"[4/5] 启动 Docker 容器 (port {DEPLOY_PORT})...")
cmd = (
    f'docker run -d '
    f'--name {CONTAINER_NAME} '
    f'--restart unless-stopped '
    f'-p {DEPLOY_PORT}:80 '
    f'-v {REMOTE_DIR}:/usr/share/nginx/html:ro '
    f'-v {REMOTE_DIR}/default.conf:/etc/nginx/conf.d/default.conf:ro '
    f'{NGINX_IMAGE}'
)
run(c, cmd)
time.sleep(2)

print(f"[5/5] 验证部署...")
status = run(c, f'docker ps --filter name={CONTAINER_NAME} --format "{{{{.Status}}}}\t{{{{.Ports}}}}"')
if 'Up' in status:
    print(f"\n{'='*50}")
    print(f"✅ 部署成功！")
    print(f"   访问地址: http://{HOST}:{DEPLOY_PORT}/")
    print(f"   主仪表板: http://{HOST}:{DEPLOY_PORT}/dashboard.html")
    print(f"   容器名称: {CONTAINER_NAME}")
    print(f"{'='*50}")
else:
    print(f"\n⚠️  容器状态异常，查看日志:")
    run(c, f'docker logs {CONTAINER_NAME} 2>&1 | tail -20')

c.close()
