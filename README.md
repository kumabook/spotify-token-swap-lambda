# Spotify Token Swap Service by AWS Lambda & API Gateway

## About

Provide [token swap and refresh service](https://developer.spotify.com/technologies/spotify-ios-sdk/token-swap-refresh/) on AWS Lambda & API Gateway


## How to use

1. Setup envirnment variables

```.envrc
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export AWS_DEFAULT_REGION=ap-northeast-1
export SPOTIFY_CLIENT_ID=
export SPOTIFY_CLIENT_SECRET=
export SPOTIFY_CALLBACK_URL=
export SPOTIFY_ENCRYPTION_SECRET=
```

NOTE: aws credentials has role for full acesss AWS Lambda

2. Deploy lambda functions

```
node scripts/deploy_lambda.js
```

3. Setup API Gateway

TODO

NOTE: use `config/request_templates.txt` as mapping template in order to convert urlencoded data to json data for lambda input
