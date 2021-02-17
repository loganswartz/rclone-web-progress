# Rclone-Web-Progress
A simple dashboard to show the progress of current Rclone transfers.

## Usage
Pull and install dependencies:
```bash
~ $ git clone http://github.com/loganswartz/rclone-web-progress && cd rclone-web-progress
~/rclone-web-progress $ npm install
~/rclone-web-progress $ npm start
```
Then copy the `.env.example` into the same folder as `.env` and set your
rclone-ws-connector URL. After that, you can make a production version with
run `npm run build` and serve it normally via Apache or Nginx.
