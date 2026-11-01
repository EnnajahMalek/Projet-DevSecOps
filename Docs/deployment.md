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