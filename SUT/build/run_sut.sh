#!/bin/bash
source ./setup_tc.sh $@
set -- ${NONTC[@]}
# args: Model_URl tar.gz_file
model_url=$1
shift 1;

aws s3 cp $model_url model.tar.gz
tar -xzf model.tar.gz

python3 ./python/main.py $@