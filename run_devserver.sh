python /usr/local/google_appengine/dev_appserver.py \
--use_sqlite \
--.datastore_path=datastore/sqlite.datastore \
--blobstore_path=.datastore/blobs \
--search_indexes_path=.datastore/dev_appserver.searchindexes \
--history_path=.datastore/dev_appserver.datastore.history \
.