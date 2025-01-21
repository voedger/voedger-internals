#!/usr/bin/env bash
#
# Copyright (c) 2023 Sigma-Soft, Ltd.
# @author Aleksei Ponomarev
# 
# Prepare Mon stacks nodes: create folders, prometheus and grafana configs etc...

set -euo pipefail

set -x

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <node-1> <node-2> <node-3>" 
  exit 1
fi

source ./utils.sh

SSH_USER=$LOGNAME

for host in "$@"; do
    echo "Processing: $host"
    utils_ssh "$SSH_USER@$host" "bash -s" << EOF
    sudo mkdir -p /prometheus && mkdir -p ~/prometheus;
    sudo mkdir -p /alertmanager && mkdir -p ~/alertmanager;
    mkdir -p ~/grafana/provisioning/dashboards;
    mkdir -p ~/grafana/provisioning/datasources;
    sudo mkdir -p /var/lib/grafana;
EOF

cat ./grafana/provisioning/dashboards/docker-swarm-nodes.json | \
   utils_ssh "$SSH_USER@$host" 'cat > ~/grafana/provisioning/dashboards/docker-swarm-nodes.json'
cat ./grafana/provisioning/dashboards/prometheus.json | \
   utils_ssh "$SSH_USER@$host" 'cat > ~/grafana/provisioning/dashboards/prometheus.json'
cat ./grafana/provisioning/dashboards/docker-swarm-services.json | \
   utils_ssh "$SSH_USER@$host" 'cat > ~/grafana/provisioning/dashboards/docker-swarm-services.json'
cat ./grafana/provisioning/dashboards/app-processors.json | \
   utils_ssh "$SSH_USER@$host" 'cat > ~/grafana/provisioning/dashboards/app-processors.json'
cat ./grafana/provisioning/dashboards/dashboards.yml | \
   utils_ssh "$SSH_USER@$host" 'cat > ~/grafana/provisioning/dashboards/dashboards.yml'

cat ./grafana/provisioning/datasources/datasource.yml | utils_ssh "$SSH_USER@$host" 'cat > ~/grafana/provisioning/datasources/datasource.yml'

cat ./grafana/grafana.ini | utils_ssh "$SSH_USER@$host" 'cat > ~/grafana/grafana.ini'

cat ./prometheus/prometheus.yml | sed "s/{{.Label}}/$host/g" | utils_ssh "$SSH_USER@$host" 'cat > ~/prometheus/prometheus.yml'

cat ./prometheus/web.yml | utils_ssh "$SSH_USER@$host" 'cat > ~/prometheus/web.yml'

if utils_ssh "$SSH_USER@$host" "if [ ! -f $HOME/prometheus/alert.rules ]; then exit 0; else exit 1; fi"; then
    echo "$HOME/prometheus/alert.rules does not exist on the remote host. Creating it now.";
    cat ./prometheus/alert.rules | utils_ssh "$SSH_USER@$host" 'cat > ~/prometheus/alert.rules';
else
    echo "$HOME/prometheus/alert.rules already exists on the remote host.";
fi

if utils_ssh "$SSH_USER@$host" "if [ ! -f $HOME/alertmanager/config.yml ]; then exit 0; else exit 1; fi"; then
    echo "$HOME/alertmanager/config.yml does not exist on the remote host. Creating it now.";
    cat ./alertmanager/config.yml | utils_ssh "$SSH_USER@$host" 'cat > ~/alertmanager/config.yml';
else
    echo "$HOME/alertmanager/config.yml already exists on the remote host.";
fi

utils_ssh "$SSH_USER@$host" "sudo mkdir -p /etc/node-exporter && sudo chown -R 65534:65534 /etc/node-exporter"

NODE_ID=$(utils_ssh "$SSH_USER@$host" "docker info --format '{{.Swarm.NodeID}}'")
NODE_NAME=$(utils_ssh "$SSH_USER@$host" "docker node inspect --format '{{.Description.Hostname}}' $NODE_ID")

echo "node_meta{node_id=\"$NODE_ID\", container_label_com_docker_swarm_node_id=\"$NODE_ID\", node_name=\"$NODE_NAME\"} 1" | \
utils_ssh "$SSH_USER@$host" "sudo sh -c 'cat > /etc/node-exporter/node-meta.prom'"

utils_ssh "$SSH_USER@$host"  "bash -s" << EOF
    sudo chown -R 65534:65534 /etc/node-exporter/node-meta.prom;
    sudo chown -R 65534:65534 /prometheus;
    sudo chown -R 65534:65534 /alertmanager;
    sudo chown -R 472:472 /var/lib/grafana;
EOF

done

set +x
