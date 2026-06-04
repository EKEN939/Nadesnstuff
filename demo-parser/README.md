# nades'n'stuff — demo parser service

Turns a CS2 `.dem` into the JSON the Demo Hub player expects. This runs as its own
small service (NOT on Vercel — parsing is too heavy/long for serverless).

## Run locally
    cd demo-parser
    npm install
    npm start            # http://localhost:8080  (POST /parse, field "demo")

## Deploy (pick one)
- Railway / Render: new service from this folder, it builds the Dockerfile, exposes port 8080.
- Fly.io: `fly launch` in this folder, `fly deploy`.

After deploy you get a URL like https://your-parser.up.railway.app

## Connect it to the site
In your Vercel project, set env var:
    NEXT_PUBLIC_PARSER_URL = https://your-parser.up.railway.app
Redeploy. The Demo Hub then shows an "Upload .dem" button that posts the file here
and plays the result.

## Notes / tuning
- Field names in `demoparser2` (X, Y, yaw, team_num) and the team mapping (2=T,3=CT) can
  vary by version — adjust in index.js if output looks off.
- The world→radar calibration (CAL in index.js) is approximate for Mirage; tune origin/scale
  per map for correct dot positions.
- Lock CORS to your site's origin before going public.
