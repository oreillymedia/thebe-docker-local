#!/bin/bash

# Strict mode
gulp watch &
nginx
cd /notebooks
ipython2 notebook --no-browser --port 8888 --ip=* $CERTFILE_OPTION --NotebookApp.password="$HASH" --NotebookApp.allow_origin=*
