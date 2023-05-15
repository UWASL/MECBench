#include "runner.h"

#include <unistd.h>

#include <string>
#include <thread>
#include <vector>

#include "../c_loadgen/loadgen.h"
#include "./dataset.h"
#include "lib/basic_client.h"

/*********************************************************************/

using namespace mlperf;

QuerySampleResponse RunnerRemote::predict(const Data* item) {
  RequestData* res = client->predict(item->data, item->size, item->id);
  assert(res);
  this->dataset->postProcess(res->items, res->size, item->label);
  delete[] item->label;
  delete[] item->data;
  return QuerySampleResponse{
      .id = res->id, .data = (uintptr_t)res->items, .size = res->size};
}

std::string RunnerRemote::targetString() {
  return remote_address;
}

RunnerRemote::RunnerRemote(const std::string& address,
                           Dataset* dataset)
    : RunnerBase(dataset), remote_address(address) {
  puts("RunnerRemote Constructor");
}

RunnerRemote::RunnerRemote(const RunnerRemote& src) : RunnerBase(src) {
  this->remote_address = src.remote_address;
}

RunnerRemote::~RunnerRemote() { puts("RunnerRemote Constructor"); }

void RunnerRemote::init() {
  client = new BasicServiceClient(
      grpc::CreateChannel(targetString(), grpc::InsecureChannelCredentials()));
}

RunnerBase* RunnerRemote::clone() {
  RunnerBase* new_runner = new RunnerRemote(*this);
  puts("Cloning RunnerRemote");
  return new_runner;
}

/*********************************************************************/
RemoteStreamer::RemoteStreamer(const std::string& address,
                               Dataset* dataset)
    : RunnerBase(dataset), remote_address(address) {
  puts("RemoteStreamer Constructor");
  // sender = new std::thread(streamData);
}

RemoteStreamer::RemoteStreamer(const RemoteStreamer& src) : RunnerBase(src) {
  this->remote_address = src.remote_address;
}

QuerySampleResponse RemoteStreamer::predict(const Data* item) {
  assert(false && "This should not be called. call runQuery instead");
  return QuerySampleResponse{
      .id = 0, .data = (uintptr_t)item->data, .size = item->size};
}

std::string RemoteStreamer::targetString() {
  return remote_address;
}

void RemoteStreamer::runQuery(const std::vector<QuerySample>& samples) {
  std::vector<QuerySampleResponse> responses;
  for (auto i = samples.begin(); i != samples.end(); i++) {
    Data* item = dataset->getSample(i->index);

    clientStreamer->sendRequest(
        new RequestData{.items = item->data, .size = item->size, .id = i->id});
  }
}

void RemoteStreamer::receiveData() {
  while (true) {
    RequestData response = clientStreamer->getResponse();
    QuerySampleResponse* querySampleResponse =
        new QuerySampleResponse{.id = response.id,
                                        .data = (uintptr_t)response.items,
                                        .size = response.size};
    QuerySamplesComplete(querySampleResponse, 1);
  }
}
void RemoteStreamer::init() {
  clientStreamer = new BasicServiceClientStreamer(
      grpc::CreateChannel(targetString(), grpc::InsecureChannelCredentials()));
  receiver = new std::thread([this] { receiveData(); });
}

RunnerBase* RemoteStreamer::clone() {
  RunnerBase* new_runner = new RemoteStreamer(*this);
  return new_runner;
}

/*********************************************************************/
SleepRunner::SleepRunner(Dataset* dataset) : RunnerBase(dataset) {
  puts("SleepRunner Constructor");
}
SleepRunner::~SleepRunner() {}
QuerySampleResponse SleepRunner::predict(const Data* item) {
  printf("Sleeping for %d us\n", *(int*)item->data);
  usleep(*(int*)item->data);
  return QuerySampleResponse{
      .id = item->id, .data = (uintptr_t)item->data, .size = item->size};
}

mlperf::RunnerBase* SleepRunner::clone(){
  return (RunnerBase*) new SleepRunner(dataset);
}
