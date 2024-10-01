-- Erstelle Datenbanken
CREATE DATABASE IF NOT EXISTS prod;
CREATE DATABASE IF NOT EXISTS dev;
CREATE DATABASE IF NOT EXISTS test_schuetze1000;
CREATE DATABASE IF NOT EXISTS test_xxchillkroetexx;

-- Create Users

CREATE USER IF NOT EXISTS 'prod_user'@'10.20.0.%' IDENTIFIED BY 'PROD_USER_PASSWORD' REQUIRE SSL;
GRANT ALL PRIVILEGES ON prod.* TO 'prod_user'@'10.20.0.%';

CREATE USER IF NOT EXISTS 'dev_user'@'10.10.0.%' IDENTIFIED BY 'DEV_USER_PASSWORD' REQUIRE SSL;
GRANT ALL PRIVILEGES ON dev.* TO 'dev_user'@'10.10.0.%';

CREATE USER IF NOT EXISTS 'schuetze1000'@'%' IDENTIFIED BY 'SCHUETZE1000_PASSWORD' REQUIRE SSL;
GRANT SELECT ON prod.* TO 'schuetze1000'@'%';
GRANT ALL PRIVILEGES ON test_schuetze1000.* TO 'schuetze1000'@'%';
GRANT ALL PRIVILEGES ON dev.* TO 'schuetze1000'@'%';
GRANT ALL PRIVILEGES ON test_xxchillkroetexx.* TO 'schuetze1000'@'%';

CREATE USER IF NOT EXISTS 'leonidas_maker'@'%' IDENTIFIED BY 'LEONIDAS_MAKER_PASSWORD' REQUIRE SSL;
GRANT SELECT ON prod.* TO 'leonidas_maker'@'%';
GRANT ALL PRIVILEGES ON dev.* TO 'leonidas_maker'@'%';
GRANT ALL PRIVILEGES ON test_schuetze1000.* TO 'leonidas_maker'@'%';
GRANT ALL PRIVILEGES ON test_xxchillkroetexx.* TO 'leonidas_maker'@'%';

CREATE USER IF NOT EXISTS 'xxchillkroetexx'@'%' IDENTIFIED BY 'XXCHILLKROETEXX_PASSWORD' REQUIRE SSL;
GRANT SELECT ON prod.* TO 'xxchillkroetexx'@'%';
GRANT ALL PRIVILEGES ON test_xxchillkroetexx.* TO 'xxchillkroetexx'@'%';
GRANT ALL PRIVILEGES ON dev.* TO 'xxchillkroetexx'@'%';
GRANT ALL PRIVILEGES ON test_schuetze1000.* TO 'xxchillkroetexx'@'%';

FLUSH PRIVILEGES;