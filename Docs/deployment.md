pour la 2eme partie , deployement sur kubernetes local (en utilisan kubernetes in docker ``` kind ``` , ``` helm ``` et ``` kubectl ``` )

1- kind-config.yml 
```
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
```
defini le type de configuration 
```
networking:
  disableDefaultCNI: true
  ```
cela desactive l'installation d configuration default , on va le deployer apres 

```
nodes:
  - role: control-plane
    extraPortMappings:
      - { containerPort: 30080, hostPort: 8081, listenAddress: "127.0.0.1" }
      - { containerPort: 30443, hostPort: 8443, listenAddress: "127.0.0.1" }
```
le cluster contien 1 noeds, on a aussi ajouter 2 ports accessible 

on cree le cluster 
```
kind create cluster --name devsecops --config k8s/kind-config.yml

```
pour verifier 
``` 
kubectl cluster-info --context kind-devsecops
kubectl get nodes
```
fichiers de config dans le dossier base decrit ce qui est trouvable dans le dossier

dans le dossier k8s/base
``` 1- base/namespace.yml ``` creation de namespace dans la cluster
``` 2- base/postgres.yml ``` creation de configuration de postgres, on utilise le mot de passe qui es stocke dans le le ficheir ``` k8s/.env ```
on a creer un StatefulSet au lieu de deployement ``` kind: StatefulSet ``` pourquoi? car une base de donnees doit avoir stockage persistent au lieu de creer  
on utilise ces configs pour le hardening 
``` 
    securityContext:
        runAsNonRoot: true
        runAsUser: 70
        runAsGroup: 70
        fsGroup: 70
        seccompProfile:
          type: RuntimeDefault 
```
et 
```
    securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
            drop: [ALL] 
```
ces parametre mets l'utilisateur avec id 70 (default postgres id) , pas root et il peut pas augmenter ces droits d'access , il peut seulement lire les fichiers et il peut faire mais pour que postres fonctionner , il faut qu'il peut modifier ces fichiers donc on a ajouter 2 volumes tmp et run 
pour deployer dans le namespace on fait 
```
 kubectl -n notes apply -f k8s/base/postgres.yml 
```
voici le pod
```
 kubectl -n notes get pods -w
NAME         READY   STATUS    RESTARTS   AGE
postgres-0   1/1     Running   0          82s
```


la maniere d'ajouter des secrets est un peu different, c'est avec des commandes comme
```
kubectl -n notes create secret docker-registry dockerhub-pull \
  --docker-server=<server_docker_exemple> \
  --docker-username=<ton_username> \
  --docker-password=<docker_token>
```
pour le pod ``` app.yml ``` il utilise l'image deploye par le pipeline CI , mais le pipeline CI deplooie sur dockerhub donc on est besoin des credentials 

``` kustomization.yml ``` est le fichier pour modifier par exemple le nom de l'image au lieu de le remplacer directemenet dans les manifests des pods

on utilise un linter avec kube-linter 
et on trouve KubeLinter 0.8.3

<standard input>: (object: notes/app apps/v1, Kind=Deployment) container "app" does not have a read-only root file system (check: no-read-only-root-fs, remediation: Set readOnlyRootFilesystem to true in the container securityContext.)

<standard input>: (object: notes/app apps/v1, Kind=Deployment) container "app" has cpu request 0 (check: unset-cpu-requirements, remediation: Set CPU requests for your container based on its requirements. Refer to https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits for details.)

<standard input>: (object: notes/app apps/v1, Kind=Deployment) container "app" has memory limit 0 (check: unset-memory-requirements, remediation: Set memory limits for your container based on its requirements. Refer to https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits for details.)

<standard input>: (object: notes/postgres apps/v1, Kind=StatefulSet) container "postgres" has cpu request 0 (check: unset-cpu-requirements, remediation: Set CPU requests for your container based on its requirements. Refer to https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits for details.)

<standard input>: (object: notes/postgres apps/v1, Kind=StatefulSet) container "postgres" has memory limit 0 (check: unset-memory-requirements, remediation: Set memory limits for your container based on its requirements. Refer to https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits for details.)




apres la correction, on veut appliquer les rules reseaux d'entree et de sortie 
et pour gerer sa, il faut creer un service, 
Un service alloue une adresse ip virtuel et un dns au pod ou plusieurs pods qui on le meme label pour notre cas on utilise le label app

```
apiVersion: v1
kind: Service
metadata:
  name: app
  namespace: notes     
  labels:
    app: app
spec:
  selector:
    app: app
  ports:
    - name: http
      port: 80
      targetPort: 3000

```

pour attacher ce adresse ip avec un host , on peut utiliser un ingress 
```apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
  namespace: notes
  labels:
    app.kubernetes.io/name: app
spec:
  ingressClassName: traefik
  rules:
    - host: app.127.0.0.1.nip.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app
                port:
                  number: 80

```

traefik, est une outils opensource utilise pour loadbalancing, revserse proxy etc il est tres versatile, on peut ajouter des regles middleware sans changer beaucoup de cofigs, elle fait le routing rapide avec un downtime minimale
elle possede tls/ssl support par default avec ACME's Lets Encrypt

```
service:
  type: NodePort

ports:
  web:
    nodePort: 30080
  websecure:
    nodePort: 30443

nodeSelector:
  ingress-ready: "true"

tolerations:
  - key: node-role.kubernetes.io/control-plane
    operator: Equal
    effect: NoSchedule

```
maintenant pour appliquer les rules de securites, il faut cree des politiques , on peut utiliser des differentes manifests ou on peut utilise 1 seule fichier, pour mon projet, il faut segmenter les choses pour mieux comprendre
1- ``` default.yml ```: le politique par default, comme un pare feu, par defaut il faut blacklister tous, utilisation le least privilege et un peu de whitelisting pour la communictation pour reduire la surface le plus possible 

2- ``` dns-resolution.yml ``` : politique qui allow les les requetes dns de namespace note ver le namespace system kube-systeme

3 4 et 5 sont pour la communication qui vient de traefik (user -> app ), app vers postgres et postgres vers app
```
kubectl -n notes get netpolotes get netpol
NAME                                POD-SELECTOR   AGE
blocker-tous                        <none>         19m
communictation-ver-app-de-traefik   app=app        19m
connection-postgres-app             app=postgres   19m
dns-ok-notes-ver-kubesystem         <none>         19m
egress-app-ver-postgres             app=app        19m
```



next phase 
monitroing avec prometheus


























































