#include "runner.h"

#include <unistd.h>

#include <string>
#include <thread>
#include <vector>
#include <iostream>

#include "dataset.h"
#include "issue_query_controller.h"
#include "loadgen.h"
#include "query_sample.h"
#include "query_sample_library.h"

namespace mlperf {

RunnerBase::RunnerBase(Dataset* dataset) {
  puts("RunnerBase Constructor");
  this->dataset = dataset;
}
RunnerBase::~RunnerBase() { 
  puts("RunnerBase Destructor"); 
}

void RunnerBase::init() {}

void RunnerBase::runQuery(const std::vector<mlperf::QuerySample>& samples) {
  std::vector<mlperf::QuerySampleResponse> responses;
  mlperf::loadgen::SampleMetadata* sample_ptr = NULL;
  for (size_t i = 0; i < samples.size(); i++) {
    Data* item = dataset->getSample(samples[i].index);
    item->id = samples[i].id;
    mlperf::QuerySampleResponse r = predict(item);
    responses.push_back(r);
  }
  mlperf::QuerySamplesComplete(responses.data(), responses.size());
}
}  // namespace mlperf