# new va, cleaner, rewritten:
va2-install:
	npm i
va2-d:
	npm run dev
va2-e:
	npm run buildEauto2
va2-fix:
	npm run fixme
va2-e-zip:
	npm run buildE2 && cd you && zip -vr ../you.zip background_ok.js contentScript_ok.js manifest.json person_.png pop.html pop_ok.js

backup:
	python3 mkBackup.py

# testing of the client code must be performed on the client. The /test page should be accessed,
# e.g. https://0.0.0.0:8080/test/


# auxiliary targets:   ################################################################
# create binomial/random bipartite networks in aux_server/data/
mk-random-nets:
	python3 aux_server/utils/generateNcol.py

# example usage of mlpb, implemented in the aux_server/server.py, is in:
# aux_server/utils/IOmlpb.py



