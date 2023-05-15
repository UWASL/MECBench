FROM ubuntu:20.04

# To be built from parent directory

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
            python3-dev \
            python3-pip \
            python3-opencv \
            iproute2 \
            protobuf-compiler \
            wget \
            net-tools && \
    rm -rf /var/lib/apt/lists/*

COPY SUT/requirements.txt /requirements.txt
RUN pip3 install --no-cache-dir -r /requirements.txt

COPY SUT/build /workspace/build/
COPY common/setup_tc.sh /workspace/build/
COPY common /workspace/common/
ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
WORKDIR /workspace/common/grpc_proto
RUN protoc -I=. --python_out=python ./basic.proto
RUN cp python/*.py /workspace/build/python/

# Install aws
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends unzip curl && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace/build
ENTRYPOINT ["bash", "./run_sut.sh"]
