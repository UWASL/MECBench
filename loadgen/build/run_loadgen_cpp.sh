source ./setup_tc.sh $@

set -- ${NONTC[@]}
# Experiment_name Selector SUT_address Storage_address File_storage_address Config_ID Dataset_URL Scenario
eid=$1;
selector=$2;
sut_address=$3;
storage_address=$4;
file_storage_address=$5;
config_id=$6;
dataset_URL=$7;
scenario=$8;
shift 8;
output=`pwd`/cppimp/build

wget "http://$file_storage_address/$config_id" --output-document=cppimp/build/mlperf.conf

aws s3 cp "$dataset_URL" cppimp/build/dataset.tar.gz && \
tar -xzf cppimp/build/dataset.tar.gz -C cppimp/build/

cd cppimp/build && ./loadgen $scenario $sut_address && \
\
cd ../../ && python3 store_results.py "$eid" "$selector" "$output" "http://$storage_address"
