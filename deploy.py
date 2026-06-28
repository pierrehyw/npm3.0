#!/usr/bin/env python3
"""
NGPM Prototype 部署脚本
将 ngpm-prototype 静态文件部署到远程服务器的 Docker nginx 容器
"""
import os
import sys
import warnings
import paramiko
import time

warnings.filterwarnings('ignore')

HOST = '192.168.40.129'
PORT = 22
USER = 'root'
PASS = 'ncompass123'
CONTAINER_NAME = 'ngpm-demo'
REMOTE_DIR = '/opt/ngpm-demo'

LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FILES = [
    'index.html', 'dashboard.html', 'network.html', 'app.html',
    'security.html', 'assets.html', 'policy.html',
    'dashboard.css', 'dashboard.js', 'ai-page.css', 'style.css',
    'drawer.css', 'error-drawer.html', 'app.js', 'topo-preview.html'
]

def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)
    return client

def run(client, cmd, check=True):
    _, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        print(f'  > {out}')
    if err and check:
        print(f'  [stderr] {err}')
    return out

def find_free_port(client):
    """找一个空闲端口（从 8080 开始找）"""
    used = run(client, "ss -tlnp | awk '{print $4}' | grep -oE '[0-9]+$' | sort -nu", check=False)
    used_ports = set(int(p) for p in used.split() if p.isdigit())
    for p in range(8080, 9000):
        if p not in used_ports:
            return p
    return 8090

def main():
    print(f"[1/5] 连接到 {HOST}...")
    try:
        client = connect()
        print("      连接成功")
    except Exception as e:
        print(f"      连接失败: {e}")
        sys.exit(1)

    print("[2/5] 检查服务器环境...")
    docker_ver = run(client, 'docker --version 2>/dev/null || echo "NOT_FOUND"')
    if 'NOT_FOUND' in docker_ver:
        print("      Docker 未安装，尝试安装...")
        run(client, 'curl -fsSL https://get.docker.com | sh')
        run(client, 'systemctl start docker')
    else:
        print(f"      Docker: {docker_ver}")

    # 检查是否有同名容器，有则停止删除
    existing = run(client, f'docker ps -a --filter name={CONTAINER_NAME} --format "{{{{.Names}}}}"', check=False)
    if CONTAINER_NAME in existing:
        print(f"      停止并删除已有容器 {CONTAINER_NAME}...")
        run(client, f'docker stop {CONTAINER_NAME} 2>/dev/null; docker rm {CONTAINER_NAME} 2>/dev/null')

    # 选择空闲端口
    deploy_port = find_free_port(client)
    print(f"      选用端口: {deploy_port}")

    print(f"[3/5] 创建远程目录 {REMOTE_DIR}...")
    run(client, f'mkdir -p {REMOTE_DIR}')

    print("[4/5] 上传静态文件...")
    sftp = client.open_sftp()
    uploaded = 0
    skipped = 0
    for fname in STATIC_FILES:
        local_path = os.path.join(LOCAL_DIR, fname)
        if os.path.exists(local_path):
            remote_path = f'{REMOTE_DIR}/{fname}'
            sftp.put(local_path, remote_path)
            print(f"      ✓ {fname}")
            uploaded += 1
        else:
            print(f"      - 跳过（不存在）: {fname}")
            skipped += 1

    # 上传图片文件
    for fname in os.listdir(LOCAL_DIR):
        if fname.lower().endswith(('.png', '.jpg', '.svg', '.ico', '.gif', '.webp')):
            local_path = os.path.join(LOCAL_DIR, fname)
            sftp.put(local_path, f'{REMOTE_DIR}/{fname}')
            print(f"      ✓ {fname} (图片)")
            uploaded += 1
    sftp.close()
    print(f"      上传完成: {uploaded} 个文件，跳过 {skipped} 个")

    print("[5/5] 启动 Docker 容器...")
    # 创建自定义 nginx 配置，支持 UTF-8 编码
    nginx_conf = r"""
server {
    listen 80 default_server;
    server_name _;
    root /usr/share/nginx/html;
    index login.html dashboard.html index.html;
    charset utf-8;
    location = / {
        return 302 http://$http_host/login.html;
    }
    location / {
        try_files $uri $uri/ /login.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }
    error_page 404 /login.html;
}
"""
    # 写 nginx 配置文件
    run(client, f"cat > {REMOTE_DIR}/default.conf << 'NGINXEOF'\n{nginx_conf}\nNGINXEOF")

    # 启动容器
    cmd = (
        f'docker run -d '
        f'--name {CONTAINER_NAME} '
        f'--restart unless-stopped '
        f'-p {deploy_port}:80 '
        f'-v {REMOTE_DIR}:/usr/share/nginx/html:ro '
        f'-v {REMOTE_DIR}/default.conf:/etc/nginx/conf.d/default.conf:ro '
        f'nginx:alpine'
    )
    container_id = run(client, cmd)
    time.sleep(2)

    # 验证容器是否正常运行
    status = run(client, f'docker ps --filter name={CONTAINER_NAME} --format "{{{{.Status}}}}"')
    if 'Up' in status:
        print(f"\n✅ 部署成功！")
        print(f"   访问地址: http://{HOST}:{deploy_port}/")
        print(f"   主页面:   http://{HOST}:{deploy_port}/dashboard.html")
        print(f"   容器名:   {CONTAINER_NAME}")
        print(f"   容器状态: {status}")
    else:
        print(f"\n⚠️ 容器启动异常，查看日志:")
        logs = run(client, f'docker logs {CONTAINER_NAME} 2>&1 | tail -20')
        print(logs)

    client.close()

if __name__ == '__main__':
    main()
