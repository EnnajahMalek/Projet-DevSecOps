Pour comparer les configurations nous avons 3 images docker, chaqu'un avec son tag unique 
docker-naive, une image sans techniques de hardening
docker-alpine, intermediaire avec quelque politiques.
docker-hardened, une image protege qui utilise une image distroless qui conteient que les packages necessaires
explaining files for naive we use a basic node latest image hat contains all we need and more and do npm install which installs all necessary packages for dev and prod 
```
notes:naive (debian 13.7)
=========================
Total: 458 (HIGH: 442, CRITICAL: 16)
```
for alpine we get 
```
notes:alpine (alpine 3.23.0)
============================
Total: 21 (HIGH: 19, CRITICAL: 2)
```
and for harden we get 
```
                                                                                      
IMAGE            ID             DISK USAGE   CONTENT SIZE   EXTRA
notes:alpine     70c6cbc1c364        236MB         57.5MB        
notes:hardened   dbbdd974b828        210MB         53.6MB        
notes:naive      a5338093c50c        1.8GB          448MB  
```
