#!/bin/bash
# EC2 User Data Bootstrap Script for Amazon Linux 2 / Amazon Linux 2023
# Practical 4 & Practical 7 Integration Test
# Automatically installs Nginx, queries IMDSv2 metadata, and serves a live test page.

set -e

# Update packages
yum update -y

# Install and start Nginx
yum install -y nginx
systemctl enable nginx
systemctl start nginx

# Fetch IMDSv2 Token for secure metadata retrieval
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Fetch instance metadata
INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
AZ=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone)
PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4 || echo "N/A")

# Create custom landing page
cat <<EOF > /usr/share/nginx/html/index.html
<!DOCTYPE html>
<html>
<head>
    <title>CSE423 - EC2 Instance Verification</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
        .card { background: #1e293b; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
        h1 { color: #10b981; margin-bottom: 8px; }
        .meta { text-align: left; margin-top: 20px; background: #0f172a; padding: 15px; border-radius: 8px; font-family: monospace; }
        .meta p { margin: 6px 0; color: #38bdf8; }
        .meta strong { color: #94a3b8; }
    </style>
</head>
<body>
    <div class="card">
        <h1>EC2 Instance Deployed Successfully</h1>
        <p>CSE423: Virtualization and Cloud Computing Lab</p>
        <div class="meta">
            <p><strong>Instance ID:</strong> $INSTANCE_ID</p>
            <p><strong>Availability Zone:</strong> $AZ</p>
            <p><strong>Public IPv4:</strong> $PUBLIC_IP</p>
            <p><strong>Web Server:</strong> Nginx on Amazon Linux</p>
        </div>
    </div>
</body>
</html>
EOF

echo "Nginx setup complete."
