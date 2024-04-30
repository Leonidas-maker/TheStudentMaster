# Dualis

## Login - Post call

### URL

`https://dualis.dhbw.de/scripts/mgrqispi.dll`

### Header

- **Content-Type:** `application/x-www-form-urlencoded`

### Parameter

- **usrname:** `{Email}`
- **pass:** `{Password}`
- **APPNAME:** `CampusNet`
- **PRGNAME:** `LOGINCHECK`
- **ARGUMENTS:** `clino,usrname,pass,menuno,menu_type,browser,platform`
- **clino:** `000000000000001`
- **menuno:** `000324`
- **menu_type:** `classic`
- **browser:** (nicht spezifiziert)
- **platform:** (nicht spezifiziert)

### Response Header:

- **Set-Cookie:** `cnsc`
- **REFRESH:** `ARGUMENTS: Get SessionID -N910493016265489`

## Grades- Get call

### URL

`https://dualis.dhbw.de/scripts/mgrqispi.dll`

### Header

- **Cookie**: `Previous received cookie`

### Parameter

- **APPNAME:** `CampusNet`
- **PRGNAME:** `COURSERESULTS`
- **ARGUMENTS:** `{session},-N000307,{semester_id}`

### Response
