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
les secrets sont dans le fichier ```CI/jenkins/.env``` il contient le user, le token du repo github et le mote de pass jenkins , le service a access au meme reseau jenkins


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

pour le pipeline, au lieu d'executer le code sur le conteneur du jenkins, on utilise un autre conteneur ou on installe les packages necessaire

on fait un teste unitaire avec gtleaks et hadolint et on trouve 
``` docker run --rm -v "$PWD":/work -w /work ci-tools:local \
  hadolint --failure-threshold warning CI/Dockerfile.harden; echo "exit code: $?"
exit code: 0
```
et gitleaks 
```
docker run --rm -v "$PWD":/work -w /work ci-tools:local gitleaks git --redact --verbose .

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

9:28PM INF 10 commits scanned.
9:28PM INF scanned ~92979 bytes (92.98 KB) in 381ms
9:28PM INF no leaks found
```
pour tivy il faut modifier le fonction helper
on continue, note bien que en 30 octobre , le pipeline a signaler une autre panne de securite du package "minimatch" avec la version 10.2.6, donc une mise a jour ver 11.0.1
dans le helper function nous avons ajouter le cache d;installation de trivy pour ameliorer la vitesse 
on a trouver la probleme avec la securite image , pour resolver la probleme, j'ai changer la version de 12 ver 13 
```

Report Summary

┌───────────────────────────────────────────────────────┬──────────┬─────────────────┬─────────┐
│                        Target                         │   Type   │ Vulnerabilities │ Secrets │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app.tar (debian 13.7)                                 │  debian  │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/accepts/package.json                 │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/array-flatten/package.json           │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/body-parser/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/bytes/package.json                   │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/call-bind-apply-helpers/package.json │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/call-bound/package.json              │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/content-disposition/package.json     │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/content-type/package.json            │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/cookie-signature/package.json        │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/cookie/package.json                  │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/debug/package.json                   │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/depd/package.json                    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/destroy/package.json                 │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/dunder-proto/package.json            │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/ee-first/package.json                │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/encodeurl/package.json               │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/es-define-property/package.json      │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/es-errors/package.json               │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/es-object-atoms/package.json         │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/escape-html/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/etag/package.json                    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/express/package.json                 │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/finalhandler/package.json            │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/forwarded/package.json               │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/fresh/package.json                   │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/function-bind/package.json           │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/get-intrinsic/package.json           │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/get-proto/package.json               │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/gopd/package.json                    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/has-symbols/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/hasown/package.json                  │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/http-errors/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/iconv-lite/package.json              │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/inherits/package.json                │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/ipaddr.js/package.json               │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/math-intrinsics/package.json         │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/media-typer/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/merge-descriptors/package.json       │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/methods/package.json                 │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/mime-db/package.json                 │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/mime-types/package.json              │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/mime/package.json                    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/ms/package.json                      │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/negotiator/package.json              │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/object-inspect/package.json          │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/on-finished/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/parseurl/package.json                │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/path-to-regexp/package.json          │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/pg-cloudflare/package.json           │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/pg-connection-string/package.json    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/pg-int8/package.json                 │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/pg-pool/package.json                 │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/pg-protocol/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/pg-types/package.json                │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/pg/package.json                      │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/pgpass/package.json                  │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/postgres-array/package.json          │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/postgres-bytea/package.json          │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/postgres-date/package.json           │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/postgres-interval/package.json       │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/proxy-addr/package.json              │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/qs/package.json                      │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/range-parser/package.json            │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/raw-body/package.json                │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/safe-buffer/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/safer-buffer/package.json            │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/send/node_modules/ms/package.json    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/send/package.json                    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/serve-static/package.json            │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/setprototypeof/package.json          │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/side-channel-list/package.json       │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/side-channel-map/package.json        │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/side-channel-weakmap/package.json    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/side-channel/package.json            │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/split2/package.json                  │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/statuses/package.json                │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/toidentifier/package.json            │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/type-is/package.json                 │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/unpipe/package.json                  │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/utils-merge/package.json             │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/vary/package.json                    │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/node_modules/xtend/package.json                   │ node-pkg │        0        │    -    │
├───────────────────────────────────────────────────────┼──────────┼─────────────────┼─────────┤
│ app/package.json                                      │ node-pkg │        0        │    -    │
└───────────────────────────────────────────────────────┴──────────┴─────────────────┴─────────┘
```
voici la resultat  
image github 
<img width="1303" height="217" alt="image" src="https://github.com/user-attachments/assets/5ce627f8-c60f-46df-8ee1-690c986343e9" />
pour la refresh pour l'ajout de crednetials du dockerhub puisque le pipeline pass
docker compose -f CI/jenkins/composition-image.yml up -d --build