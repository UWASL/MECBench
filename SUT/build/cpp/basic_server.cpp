#include <grpcpp/ext/proto_server_reflection_plugin.h>
#include <grpcpp/grpcpp.h>
#include <grpcpp/health_check_service_interface.h>

#include <iostream>
#include <memory>
#include <mutex>
#include <string>
#include <stdlib.h>

#include "lib/basic.grpc.pb.h"
#include "models/request_model.h"
#include "models/io_model.h"
#include "models/cpu_model.h"

#include "models/model.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::ServerReaderWriter;
using grpc::Status;

class BasicServiceImpl final : public BasicService::Service {
  public:
    BasicServiceImpl(BaseModel* model) : model_(model) {}
  private:
  Status InferenceItem(ServerContext* context, const RequestItem* request,
                       ItemResult* reply) override {
    std::string s = request->items();
    reply->set_results(s.data(), s.size());
    reply->set_id(request->id());
    return Status::OK;
  }

  Status StreamInferenceItem(
      ServerContext* context,
      ServerReaderWriter<ItemResult, RequestItem>* stream) override {
    RequestItem requestItem;
    while (stream->Read(&requestItem)) {
      ItemResult itemResult;
      std::string s = requestItem.items();
      void* query = model_->parseQuery(requestItem.items(), requestItem.size());
      std::string response = model_->runQuery(query);
      itemResult.set_results(response.data(), response.size());
      itemResult.set_size(response.size());
      itemResult.set_id(requestItem.id());
      stream->Write(itemResult);
    }

    return Status::OK;
  }

  BaseModel* model_;
  std::mutex mt;
};



void RunServer(int modelType) {
  std::string server_address("0.0.0.0:8086");
  
  BaseModel* model = NULL;
  switch (modelType) {
    case 0:
      model = new RequestModel();
      break;
    case 1:
      model = new IOModel();
      break;
    case 2:
      model = new CPUModel();
      break;
    default:
      std::cout << "Invalid model type" << std::endl;
      exit(1);
  }

  BasicServiceImpl service(model);
  


  grpc::EnableDefaultHealthCheckService(true);
  grpc::reflection::InitProtoReflectionServerBuilderPlugin();
  ServerBuilder builder;
  // Listen on the given address without any authentication mechanism.
  builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
  // Register "service" as the instance through which we'll communicate with
  // clients. In this case it corresponds to an *synchronous* service.
  builder.RegisterService(&service);
  // Finally assemble the server.
  std::unique_ptr<Server> server(builder.BuildAndStart());
  std::cout << "Server listening on " << server_address << std::endl;

  // Wait for the server to shutdown. Note that some other thread must be
  // responsible for shutting down the server for this call to ever return.
  server->Wait();
}

int main(int argc, char** argv) {
  
  if (argc < 2) {
    std::cout << "Usage: " << argv[0] << " 0(Request)|1(IO)|2(CPU)" << std::endl;
    exit(1);    
  }
  int modelType = atoi(argv[1]);
  RunServer(modelType);

  return 0;
}
