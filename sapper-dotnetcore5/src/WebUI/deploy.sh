#!/bin/sh

#Build container and push it to docker.io
VERSION=latest
docker build . -t kodaren/sveltestore:$VERSION
docker push kodaren/sveltestore:$VERSION

#Create pod, traefik ingress and cert
kubectl apply -f sveltestore.yaml

#LinkerD
kubectl -n kodaren get deploy -o yaml | linkerd inject - | kubectl apply -f -

#Redeploy with same label
kubectl rollout restart deploy -n kodaren sveltestore
