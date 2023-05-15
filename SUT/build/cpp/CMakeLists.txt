cmake_minimum_required(VERSION 3.5.1)

project(MLPerfGRPC_Server C CXX)

include(./common.cmake)

set(CMAKE_CXX_STANDARD 14)
add_compile_options(-O3)

# Generated sources
set(basic_proto_srcs "${CMAKE_CURRENT_SOURCE_DIR}/lib/basic.pb.cc")
set(basic_proto_hdrs "${CMAKE_CURRENT_SOURCE_DIR}/lib/basic.pb.h")
set(basic_grpc_srcs "${CMAKE_CURRENT_SOURCE_DIR}/lib/basic.grpc.pb.cc")
set(basic_grpc_hdrs "${CMAKE_CURRENT_SOURCE_DIR}/lib/basic.grpc.pb.h")


if($ENV{DOCKER_CMAKE})
  message(STATUS "INCLUDING INSIDE DOCKER")
  include_directories("$ENV{LIB_INSTALL_DIR}/include")
else()
  message(STATUS "INCLUDING OUTSIDE DOCKER")
  include_directories("$ENV{HOME}/.local/include/")
endif()

# basic_grpc_proto
add_library(basic_grpc_proto ${basic_grpc_srcs} ${basic_grpc_hdrs}
                             ${basic_proto_srcs} ${basic_proto_hdrs})
target_link_libraries(basic_grpc_proto ${_REFLECTION} ${_GRPC_GRPCPP}
                      ${_PROTOBUF_LIBPROTOBUF})


add_executable(grpc_server basic_server.cpp)
target_link_libraries(
  grpc_server basic_grpc_proto
  # ${MLPERF_LIBRARY}
  ${_REFLECTION} ${_GRPC_GRPCPP} ${_PROTOBUF_LIBPROTOBUF})