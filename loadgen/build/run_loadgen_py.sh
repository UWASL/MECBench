source ./setup_tc.sh $@

set -- ${NONTC[@]}
# SUT_address SUT_port Storage_address Storage_port File_storage_address File_storage_port Experiment_name Selector Config_ID Dataset_ID
sut_address=$1;
sut_port=$2;
storage_address=$3;
storage_port=$4;
file_storage_address=$5;
file_storage_port=$6;
eid=$7;
selector=$8;
config_id=$9;\
dataset_id=${10};
shift 10;
output=`pwd`/output/onnxruntime-cpu/ssd-mobilenet

wget "http://$file_storage_address:$file_storage_port/$config_id" --output-document=cppimp/build/mlperf.conf
wget "http://$file_storage_address:$file_storage_port/$dataset_id$" --output-document=cppimp/build/dataset.tar.gz && \
cd python/py_loadgen/ && \
tar -xzf dataset.tar.gz 

python3 python/py_loadgen/main.py \
 --backend onnxruntime \
 --model-name ssd-mobilenet \
 --profile ssd-mobilenet-onnxruntime \
 --output $output \
 --dataset-path `pwd`/python/coco_300 \
 --mlperf_conf mlperf.conf \
 --max-batchsize 8 \
 --address "$sut_address:$sut_port" \
 --threads 8 \
 $@ && \
\
python3 store_results.py "$eid" "$selector" "$output" "http://$storage_address:$storage_port"
