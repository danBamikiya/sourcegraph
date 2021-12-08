FROM timescale/timescaledb:2.0.0-pg12-oss@sha256:08ea7cda3b6891c1815af449493c322969d8d9cf283a7af501ce22c6672b51a1

# hadolint ignore=DL3017
RUN apk -U upgrade && apk add --no-cache \  
    # Requires the use of the edge repo for CVE-2021-28831 until a patched version is brought into the 3.12 mirror. 
    'busybox=1.34.1-r3' --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main \
    # Required due to ssl_clent upgrade with busybox
    'wget=1.21.1-r1' --repository=http://dl-cdn.alpinelinux.org/alpine/v3.14/main

