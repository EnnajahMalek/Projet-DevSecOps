Pour comparer les configurations nous avons 3 images docker, chaqu'un avec son tag unique 
docker-naive, une image sans techniques de hardening
docker-alpine, intermediaire avec quelque politiques.
docker-hardened, une image protege qui utilise une image distroless qui conteient que les packages necessaires
explaining files for naive we use a basic node latest image hat contains all we need and more and do npm install which installs all necessary packages for dev and prod 
for alpine we 