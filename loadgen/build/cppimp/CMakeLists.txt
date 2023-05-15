cmake_minimum_required(VERSION 3.5.1)

project(MLPerfGRPC C CXX)

include(./common.cmake)
# Proto file get_filename_component(basic_proto "../basic.proto" ABSOLUTE)
# get_filename_component(basic_proto_path "${basic_proto}" PATH)

set(loadgen_component ../c_loadgen)
set(CMAKE_BUILD_TYPE Debug)

# MLPerf sources
set(mlperf_dataset_src dataset.cpp)
set(mlperf_dataset_hdr dataset.h)
set(mlperf_runner_src runner.cpp)
set(mlperf_runner_hdr runner.h)
set(mlperf_sut_src sut.cpp)
set(mlperf_sut_hdr sut.h)

set(HEADER_FILES
    ${mlperf_dataset_src} ${mlperf_dataset_hdr} ${mlperf_runner_src}
    ${mlperf_runner_hdr} ${mlperf_sut_src} ${mlperf_sut_hdr})

# Generated sources
set(basic_proto_srcs "${CMAKE_CURRENT_SOURCE_DIR}/lib/basic.pb.cc")
set(basic_proto_hdrs "${CMAKE_CURRENT_SOURCE_DIR}/lib/basic.pb.h")
set(basic_grpc_srcs "${CMAKE_CURRENT_SOURCE_DIR}/lib/basic.grpc.pb.cc")
set(basic_grpc_hdrs "${CMAKE_CURRENT_SOURCE_DIR}/lib/basic.grpc.pb.h")


# Include generated *.pb.h files
include_directories("${CMAKE_CURRENT_BINARY_DIR}")

if($ENV{DOCKER_CMAKE})
  message(STATUS "INCLUDING INSIDE DOCKER")
  include_directories("$ENV{LIB_INSTALL_DIR}/include")
else()
  message(STATUS "INCLUDING OUTSIDE DOCKER")
  include_directories("$ENV{HOME}/.local/include/")
endif()


# Find original mlperf library
find_library(MLPERF_LIBRARY mlperf_loadgen HINTS "${loadgen_component}/build")

# basic_grpc_proto
add_library(basic_grpc_proto ${basic_grpc_srcs} ${basic_grpc_hdrs}
                             ${basic_proto_srcs} ${basic_proto_hdrs})
target_link_libraries(basic_grpc_proto ${_REFLECTION} ${_GRPC_GRPCPP}
                      ${_PROTOBUF_LIBPROTOBUF})

# mlperf_library
add_library(mlperf_lib_dataset ${mlperf_dataset_src} ${mlperf_dataset_hdr})
add_library(mlperf_lib_runner ${mlperf_runner_src} ${mlperf_runner_hdr})
add_library(mlperf_lib_sut ${mlperf_sut_src} ${mlperf_sut_hdr})
add_library(grpc_basic_client lib/basic_client.h lib/basic_client.cpp)
target_link_libraries(
  grpc_basic_client basic_grpc_proto
  # ${MLPERF_LIBRARY}
  ${_REFLECTION} ${_GRPC_GRPCPP} ${_PROTOBUF_LIBPROTOBUF})

add_dependencies(mlperf_lib_runner grpc_basic_client)
add_dependencies(mlperf_lib_sut mlperf_lib_dataset)
add_executable(loadgen cppimp.cpp)
target_link_libraries(
  loadgen
  basic_grpc_proto
  mlperf_lib_dataset
  mlperf_lib_sut
  mlperf_lib_runner
  grpc_basic_client
  ${MLPERF_LIBRARY}
  ${_REFLECTION}
  ${_GRPC_GRPCPP}
  ${_PROTOBUF_LIBPROTOBUF})

