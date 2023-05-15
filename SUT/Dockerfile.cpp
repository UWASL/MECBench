FROM ubuntu:20.04

# To be built from parent directory

WORKDIR /var/local

ENV LIB_INSTALL_DIR=/var/local/
ENV PATH="${LIB_INSTALL_DIR}/bin:${PATH}"

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
            build-essential \
            autoconf \
            libtool \
            git \
            wget \
            unzip zip \
            sed \
            curl \
            iproute2 \
            net-tools \
            ca-certificates
            
RUN rm -rf /var/lib/apt/lists/*


RUN cd /var/local && \
    wget -q -O cmake-linux.sh https://github.com/Kitware/CMake/releases/download/v3.19.6/cmake-3.19.6-Linux-x86_64.sh && \
    mkdir -p $LIB_INSTALL_DIR/cmake && \
    sh cmake-linux.sh -- --skip-license --prefix=$LIB_INSTALL_DIR/cmake

ENV PATH="${LIB_INSTALL_DIR}/cmake/bin:${PATH}"


RUN cd /var/local && \
    git clone --recurse-submodules -b v1.43.0 https://github.com/grpc/grpc

RUN cd /var/local && \
    cd grpc && mkdir -p cmake/build && \
    cd cmake/build && \
    cmake -DgRPC_INSTALL=ON                     \
      -DgRPC_BUILD_TESTS=OFF                    \
      -DCMAKE_INSTALL_PREFIX=${LIB_INSTALL_DIR} \
      ../..                  && \
    make -j5                     
RUN cd /var/local/grpc/cmake/build && \ 
    make install 



COPY SUT/build/cpp /workspace/SUT/build/cpp

RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
            python3-dev \
            python3-pip \
            protobuf-compiler

COPY loadgen/requirements_cpp.txt requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt


COPY loadgen/build/cppimp /workspace/loadgen/build/cppimp
COPY common/grpc_proto/cpp/build/*.cc /workspace/SUT/build/cpp/lib
COPY common/grpc_proto/cpp/build/*.h /workspace/SUT/build/cpp/lib

# build clients
RUN cd /workspace/SUT/build/cpp && \
    cmake -S . -B build && \
    make -C build -j5

COPY common/setup_tc.sh /workspace/SUT/build/
COPY SUT/build/run_sut_cpp.sh /workspace/SUT/build/

# Start loadgen
WORKDIR /workspace/SUT/build
ENTRYPOINT ["bash", "./run_sut_cpp.sh"]
