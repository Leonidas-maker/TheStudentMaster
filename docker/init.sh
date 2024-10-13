#!/bin/bash

set -e

export PROD_USER_PASSWORD=$(cat /run/secrets/tsm_prod_user_password)
export DEV_USER_PASSWORD=$(cat /run/secrets/tsm_dev_user_password)
export SCHUETZE1000_PASSWORD=$(cat /run/secrets/tsm_schuetze1000_password)
export LEONIDAS_MAKER_PASSWORD=$(cat /run/secrets/tsm_leonidas_maker_password)
export XXCHILLKROETEXX_PASSWORD=$(cat /run/secrets/tsm_xxchillkroetexx_password)

PROD_USER_PASSWORD_ESCAPED=$(printf '%s\n' "$PROD_USER_PASSWORD" | sed -e 's/[\/&]/\\&/g')
DEV_USER_PASSWORD_ESCAPED=$(printf '%s\n' "$DEV_USER_PASSWORD" | sed -e 's/[\/&]/\\&/g')
SCHUETZE1000_PASSWORD_ESCAPED=$(printf '%s\n' "$SCHUETZE1000_PASSWORD" | sed -e 's/[\/&]/\\&/g')
LEONIDAS_MAKER_PASSWORD_ESCAPED=$(printf '%s\n' "$LEONIDAS_MAKER_PASSWORD" | sed -e 's/[\/&]/\\&/g')
XXCHILLKROETEXX_PASSWORD_ESCAPED=$(printf '%s\n' "$XXCHILLKROETEXX_PASSWORD" | sed -e 's/[\/&]/\\&/g')

sed -e "s/PROD_USER_PASSWORD/${PROD_USER_PASSWORD_ESCAPED}/g" \
    -e "s/DEV_USER_PASSWORD/${DEV_USER_PASSWORD_ESCAPED}/g" \
    -e "s/SCHUETZE1000_PASSWORD/${SCHUETZE1000_PASSWORD_ESCAPED}/g" \
    -e "s/LEONIDAS_MAKER_PASSWORD/${LEONIDAS_MAKER_PASSWORD_ESCAPED}/g" \
    -e "s/XXCHILLKROETEXX_PASSWORD/${XXCHILLKROETEXX_PASSWORD_ESCAPED}/g" \
    /docker-entrypoint-initdb.d/02-init-users.sql | mariadb --user=root --password="$(cat /run/secrets/tsm_db_root_password)"