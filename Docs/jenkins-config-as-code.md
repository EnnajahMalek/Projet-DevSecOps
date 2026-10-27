pour la segment de configuration nous avons 3 parties principale, 
1-dockerfile: la construction d'image :
``` FROM jenkins/jenkins:lts-jdk21@sha256:a660310e39ade10631f774bacd5219de767dfd08947ea5c32a739b5e5bb382c1
```
on fait un pull d'image jenkins lts qui utilise jdk 21 mais pour confirmer que a chaque fois l'image est construit avec la mme version, on cree la meme image  avec la meme diges hash sha 256 , pour obtenir le hash initiale il faut utiliser :
``` docker buildx imagetools inspect jenkins/jenkins:lts-jdk21 ```
apres, on fait un run pour l'installation de openpgp et docker cli, les agents jenkins utilise docker cli 
la commande ``` COPY plugins.txt /usr/share/jenkins/ref/plugins.txt```  on copie le fichier text locale plugins.txt ver le dossier ref 

apres avec la commande ``` RUN jenkins-plugin-cli -f /usr/share/jenkins/ref/plugins.txt``` on installe tous les plugins necessaires pour notre projets, pour mon projet , je suis besoins des chose qui sonts essentiels seuelement  comme ```github-branch-source``` pour puller le code et ``` junit``` pour faire les testes
et finalement  ```COPY jenkins.yaml /usr/share/jenkins/casc/jenkins.yaml``` est utilise pour 
2 pour le fichier compose.yml il est seulement une fichier de configuration 2 images ou 2 services au meme temps une dind ( Docker in Docker ) et une service de construction d'image jeninks avec ouverture d'une seule port 8080 
segment par segmenet : 
service 1 : 
docker dind image avec une configuration des certificats TLS pour la communication avec github, l'image a access a 2 volues les certifs 
il a access  seulement une reseaux prive ```jenkins```
pour le 2eme service 
nous avons pour la construction, il utilise le Dockerfile dans le dossier 
un seul port est accessible 8080
les secrets sont dans le fichier ```CI-CD/jenkins/.env``` il contient le user, le token du repo github et le mote de pass jenkins , le service a access au meme reseau jenkins


pour le 3eme fichier jenkins.yml version 1 : 
```
jenkins:
  systemMessage: 'Version 1 je veux comprendre comment il marche'
  numExecutors: 2
  securityRealm:
    local:
      allowsSignup: false
      users:
        - id: admin
          password: ${JENKINS_ADMIN_PASSWORD}
  authorizationStrategy:
    loggedInUsersCanDoAnything:
      allowAnonymousRead: false
```

ce semgment est pour la configuration du login

pour le pipeline, au lieu d'executer le code sur le conteneur docker, on utilise un autre conteneur ou on installe les packages necessaire