"""
Gunicorn configuration file for KASLIVE v2.0
"""

import multiprocessing
import os

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'gevent'
worker_connections = 1000
max_requests = 10000
max_requests_jitter = 1000
timeout = 60
keepalive = 5

# Logging
accesslog = 'logs/access.log'
errorlog = 'logs/error.log'
loglevel = os.getenv('LOG_LEVEL', 'info').lower()
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = 'kaslive'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed)
# keyfile = 'ssl/key.pem'
# certfile = 'ssl/cert.pem'

# Preload app
preload_app = True

# Server hooks
def on_starting(server):
    """Called just before the master process is initialized."""
    print("Gunicorn master starting...")

def on_reload(server):
    """Called when the application is reloaded."""
    print("Gunicorn reloading...")

def when_ready(server):
    """Called just after the server is started."""
    print(f"Gunicorn ready. Workers: {workers}")

def on_exit(server):
    """Called just before exiting Gunicorn."""
    print("Gunicorn shutting down...")

def worker_int(worker):
    """Called when a worker receives the SIGINT or SIGQUIT signal."""
    print(f"Worker {worker.pid} interrupted")

def pre_fork(server, worker):
    """Called just before a worker is forked."""
    pass

def post_fork(server, worker):
    """Called just after a worker has been forked."""
    print(f"Worker spawned (pid: {worker.pid})")

def pre_exec(server):
    """Called just before a new master process is forked."""
    print("Forking new master process")

def worker_abort(worker):
    """Called when a worker times out."""
    print(f"Worker {worker.pid} aborted")
