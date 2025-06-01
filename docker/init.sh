#!/bin/bash

set -e

export PROD_USER_PASSWORD=$(cat /run/secrets/tsm_prod_user_password)
export ACCESS_USER_PASSWORD=$(cat /run/secrets/tsm_dev_user_password)

PROD_USER_PASSWORD_ESCAPED=$(printf '%s\n' "$PROD_USER_PASSWORD" | sed -e 's/[\/&]/\\&/g')
ACCESS_USER_PASSWORD_ESCAPED=$(printf '%s\n' "$ACCESS_USER_PASSWORD" | sed -e 's/[\/&]/\\&/g')

sed -e "s/PROD_USER_PASSWORD/${PROD_USER_PASSWORD_ESCAPED}/g" \
    -e "s/ACCESS_USER_PASSWORD/${ACCESS_USER_PASSWORD_ESCAPED}/g" \
    /docker-entrypoint-initdb.d/02-init-users.sql | mariadb --user=root --password="$(cat /run/secrets/tsm_db_root_password)"