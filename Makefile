# new va, cleaner, rewritten:
i:
	npm i
d:
	npm run dev
e:
	npm run buildExt
fix:
	npm run fixme
e-zip:
	npm run buildEzip && cd you && zip -vr ../you.zip background_ok.js contentScript_ok.js manifest.json person_.png pop.html pop_ok.js

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
