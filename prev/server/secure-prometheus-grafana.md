# Secure prometheus and grafana

* [github: Secure prometheus and grafana](https://github.com/voedger/voedger/issues/1554)

## Principles

- grafana, prometheus: same user `voedger`
- grafana: user `voedger` is a read-only user
- grafana: user `Admin` has a random password, it is not given to users
- Password is not kept, only hash
  - To take prometheus snapshot it is necessary to temporarily replace web.yml

## Functional design

- Init
  - Admin: random password, user `voedger` (read-only for grafana)
- `ctool mon password <password>`
- Reset admin password
  - docker exec MonDockerStack_grafana1.1.3sio43ipmq1ikhhy6baodls49  grafana-cli admin reset-admin-password test