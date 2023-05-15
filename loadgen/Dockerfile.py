FROM ubuntu:20.04

# To be built from parent directory

WORKDIR /workspace/loadgen/

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
            python3-dev \
            python3-pip \
            build-essential \
            git \
            wget \
            python3-opencv \
            cmake \
            unzip zip \
            sed \
            curl \
            iproute2 \
            net-tools
            
RUN rm -rf /var/lib/apt/lists/*

COPY loadgen/requirements.txt /requirements.txt

# install pip packages
RUN pip3 install --no-cache-dir -r /requirements.txt

# install pybind11
RUN git clone https://github.com/pybind/pybind11.git && \
    cp -r pybind11/include/pybind11 /usr/include && \
    rm -rf pybind11

# install ccli_colors
RUN git clone https://github.com/omarnaman/ccli_colors && \
    cp -r ccli_colors/cli_colors.h /usr/include && \
    rm -rf ccli_colors

# install cli_colors
RUN git clone https://github.com/omarnaman/cli_colors && \
    pip3 install ./cli_colors && \
    rm -rf cli_colors





# generate dataset
COPY loadgen/build/python/tools /workspace/loadgen/build/python/tools
RUN cd /workspace/loadgen/build/python/tools && \
    if [ -d ../coco ]; then echo "COCO FOUND"; else \
        [ -f val2017.zip ] || wget -q http://images.cocodataset.org/zips/val2017.zip && \
        [ -f annotations_trainval2017.zip ] || wget -q http://images.cocodataset.org/annotations/annotations_trainval2017.zip && \
        [ -d val2017 ] || unzip val2017.zip && \
        [ -d annotations ] || unzip annotations_trainval2017.zip && \
        [ -d ../coco_300 ] || python3 ./upscale_coco.py --inputs . --outputs ../coco_300 --size 300 300 --format png && \
    rm val2017.zip annotations_trainval2017.zip && \
    rm -rf val2017 annotations; \
    fi
    
# install loadgen
COPY loadgen/build/c_loadgen /workspace/loadgen/build/c_loadgen
RUN cd /workspace/loadgen/build/c_loadgen && \
    FLAGS="-std=c++14" python3 setup.py install
    # rm -rf c_loadgen

COPY loadgen/build/python/py_loadgen /workspace/loadgen/build/python/py_loadgen
COPY common/setup_tc.sh /workspace/loadgen/build/
COPY loadgen/build/run_loadgen_py.sh /workspace/loadgen/build/
COPY loadgen/build/mlperf.conf /workspace/loadgen/build/
COPY loadgen/build/user.conf /workspace/loadgen/build/
COPY loadgen/build/store_results.py /workspace/loadgen/build/
COPY common/grpc_proto/python/*.py /workspace/loadgen/build/python/py_loadgen/

# Start loadgen
WORKDIR /workspace/loadgen/build
ENTRYPOINT ["bash", "./run_loadgen_py.sh"]
