#ifndef DMLPERF_RUNNER_H
#define DMLPERF_RUNNER_H

#include <condition_variable>
#include <mutex>
#include <queue>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

#include "./dataset.h"
#include "../c_loadgen/runner.h"
#include "lib/basic_client.h"

class RunnerRemote : public mlperf::RunnerBase {
 protected:
  std::string remote_address;
  BasicServiceClient* client;

 public:
  RunnerRemote(const std::string& address,
               mlperf::Dataset* dataset);
  RunnerRemote(const RunnerRemote& src);
  ~RunnerRemote();
  virtual void init() override;
  virtual mlperf::QuerySampleResponse predict(const mlperf::Data* item) override;
  virtual mlperf::RunnerBase* clone() override;

  std::string targetString();
};

class RemoteStreamer : public mlperf::RunnerBase {
 private:
  std::string remote_address;
  std::thread* sender;
  std::thread* receiver;
  std::mutex mt;
  std::condition_variable cv;
  BasicServiceClientStreamer* clientStreamer;

 public:
  RemoteStreamer(const std::string& address,
                 mlperf::Dataset* dataset);
  RemoteStreamer(const RemoteStreamer& src);
  ~RemoteStreamer();
  // mlperf::QuerySampleResponse predict(const Data* item) override;
  virtual void runQuery(
      const std::vector<mlperf::QuerySample>& samples) override;
  virtual mlperf::QuerySampleResponse predict(const mlperf::Data* item) override;
  void receiveData();
  virtual void init() override;
  virtual mlperf::RunnerBase* clone() override;

  std::string targetString();
};

class SleepRunner : public mlperf::RunnerBase {
 private:
 public:
  SleepRunner(mlperf::Dataset* dataset);
  ~SleepRunner();
  mlperf::QuerySampleResponse predict(const mlperf::Data* item) override;
  virtual mlperf::RunnerBase* clone() override;

};

#endif