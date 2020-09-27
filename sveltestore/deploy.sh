#!/bin/sh

VERSION=latest
docker build . -t kodaren/sveltestore:$VERSION
docker push kodaren/sveltestore:$VERSION
kubectl apply -f sveltestore.yaml
kubectl rollout restart deploy -n kodaren sveltestore
