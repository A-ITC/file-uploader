# file-uploader
## .envの設定
```sh
DB_URL="sqlite:///data/sqlite3.db?check_same_thread=False"
FILE_DIR="data/files"

# 適当な文字列を設定（UUIDなど）
SESSION_PASSWORD = "271beed1-acd6-4ef5-a250-b8350452d5c9"
TOKEN_PASSWORD = "062e6c8d-7918-4566-9bbb-d4f9a6960e53"

# Discord Developer PortalでOAuth2認証を設定しておく
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```