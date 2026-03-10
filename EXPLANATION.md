
# Bug Explanation

## What was the bug?
The HttpClient class couldn't handle OAuth2 tokens stored as plain objects. The code only checked for OAuth2Token instances using `instanceof`, so when a plain object token was provided with `accessToken: "stale"` and `expiresAt: 0`, it wouldn't recognize it as a valid token. This meant:
- The token wasn't checked for expiration
- No refresh occurred when it was expired
- The Authorization header wasn't set

## Why did it happen?
The type definition `TokenState` explicitly allows plain objects (`Record<string, unknown>`), but the runtime code only handled `OAuth2Token` instances. This inconsistency meant valid token data stored as plain objects (common when loading from localStorage or API responses) was completely ignored by the authentication logic.

## Why does your fix solve it?
The fix adds type guard functions that check for the required properties (`accessToken` and `expiresAt`) on plain objects. Now the code:
1. Properly detects when a plain object is a valid token
2. Checks expiration using the `expiresAt` value
3. Refreshes the token if expired
4. Generates the correct Authorization header using the `accessToken`

This makes the runtime behavior match the type definitions, ensuring tokens work regardless of whether they're class instances or plain objects.

## What's one realistic case / edge case your tests still don't cover?
The fix doesn't validate that the plain object's `accessToken` is a string and `expiresAt` is a number. If someone sets a malformed token (e.g., `expiresAt: "invalid"` or `accessToken: null`), it would be treated as expired and refreshed. While this is safe behavior (it will still work by getting a fresh token), a more robust solution might validate the token shape and throw an error for completely invalid token objects. The tests don't cover this malformed input scenario.

## The During the running build docker with docker build -t http-client-tests . I got an error related with certeficate 

:\Assignment\ai-software-engineer-assignment-ts>docker build -t http-client-tests .
[+] Building 13.8s (6/12)                                                                                       docker:desktop-linux
 => [internal] load build definition from Dockerfile                                                                            0.0s
 => => transferring dockerfile: 351B                                                                                            0.0s
 => [internal] load metadata for docker.io/library/node:18-alpine                                                               2.3s
 => [internal] load .dockerignore                                                                                               0.0s
 => => transferring context: 2B                                                                                                 0.0s
 => CACHED [1/8] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e  0.0s
 => [internal] load build context                                                                                               0.4s
 => => transferring context: 400.61kB                                                                                           0.4s
 => ERROR [2/8] RUN apk add --no-cache ca-certificates                                                                         11.3s
------
 > [2/8] RUN apk add --no-cache ca-certificates:
0.454 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/main/x86_64/APKINDEX.tar.gz
1.003 280BA3A4D5740000:error:0A000086:SSL routines:tls_post_process_server_certificate:certificate verify failed:ssl/statem/statem_clnt.c:2103:
1.007 fetch https://dl-cdn.alpinelinux.org/alpine/v3.21/community/x86_64/APKINDEX.tar.gz
1.007 WARNING: fetching https://dl-cdn.alpinelinux.org/alpine/v3.21/main: Permission denied
11.19 ERROR: unable to select packages:
11.19   ca-certificates (no such package):
11.19     required by: world[ca-certificates]
------
Dockerfile:4
--------------------
   2 |
   3 |     # Fix SSL certificate issues
   4 | >>> RUN apk add --no-cache ca-certificates
   5 |     RUN update-ca-certificates
   6 |
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c apk add --no-cache ca-certificates" did not complete successfully: exit code: 1

View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/znlrwm7fv9des1bskbioh4ce2

## Then I run the command with HTTP only with: docker build --network=host -t http-client-tests . then successfully build

D:\Assignment\ai-software-engineer-assignment-ts>docker build --network=host -t http-client-tests .
[+] Building 383.3s (15/15) FINISHED                                                                            docker:desktop-linux
 => [internal] load build definition from Dockerfile                                                                            0.0s
 => => transferring dockerfile: 542B                                                                                            0.0s
 => [internal] load metadata for docker.io/library/node:18-alpine                                                               1.0s
 => [internal] load .dockerignore                                                                                               0.0s
 => => transferring context: 2B                                                                                                 0.0s
 => CACHED [ 1/10] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d  0.0s
 => [internal] load build context                                                                                               0.4s
 => => transferring context: 400.80kB                                                                                           0.4s
 => [ 2/10] RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.21/main"                                                          0.2s
 => [ 3/10] RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.21/community"                                                     0.2s
 => [ 4/10] RUN apk update --no-cache --allow-untrusted                                                                        12.0s
 => [ 5/10] RUN npm config set strict-ssl false                                                                                 1.0s
 => [ 6/10] RUN npm config set registry http://registry.npmjs.org/                                                              0.4s
 => [ 7/10] WORKDIR /app                                                                                                        0.1s
 => [ 8/10] COPY package.json ./                                                                                                0.1s
 => [ 9/10] RUN npm install --no-audit --no-fund --maxsockets 1                                                               358.8s
 => [10/10] COPY . .                                                                                                            4.4s
 => exporting to image                                                                                                          4.9s
 => => exporting layers                                                                                                         4.8s
 => => writing image sha256:e212782df4a9f852733619ad575f8dc152ea7761a3bd5db4304255b70e26dd49                                    0.0s
 => => naming to docker.io/library/http-client-tests                                                                            0.0s

View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/r4qgvhn77qvo1gputgpodo71x

## Then run it: docker run --rm http-client-tests

D:\Assignment\ai-software-engineer-assignment-ts>docker run --rm http-client-tests

> http-client-assignment@1.0.0 test
> jest

PASS tests/httpClient.test.ts
  HttpClient OAuth2 behavior
    ✓ api=true sets Authorization header when token is valid (6 ms)
    ✓ api=true refreshes when token is missing (1 ms)
    ✓ api=true refreshes when token is a plain object (2 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.705 s
Ran all test suites.
