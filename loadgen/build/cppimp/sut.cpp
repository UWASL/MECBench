#include "sut.h"

#include <unistd.h>

#include <iostream>

#include "../c_loadgen/loadgen.h"
#include "../c_loadgen/query_sample_library.h"
#include "../c_loadgen/system_under_test.h"
#include "../c_loadgen/test_settings.h"
#include "runner.h"
using namespace mlperf;

// SUT implementation
const std::string& SUT::Name() const { return name; }
void SUT::IssueQuery(const std::vector<QuerySample>& samples) {
  runner->runQuery(samples);
}

void SUT::FlushQueries() { std::cout << "Flushed queries\n"; }
void SUT::ReportLatencyResults(
    const std::vector<QuerySampleLatency>& latencies_ns) {
  std::cout << "Reporting results\n";
}

 SUT::SUT(RunnerBase* runner, size_t n_threads, TestScenario scenario) {
  name = "sut_cpp";
  this->runner = runner;
  switch (scenario)
  {
  case TestScenario::MultiStream:
    for (size_t i = 0; i < n_threads; i++) {
      threads.push_back(std::thread(RegisterIssueQueryThread<TestScenario::MultiStream>));
    }
    break;
  case TestScenario::MultiStreamFree:
    for (size_t i = 0; i < n_threads; i++) {
      threads.push_back(std::thread(RegisterIssueQueryThread<TestScenario::MultiStreamFree>));
    }
    break;
  case TestScenario::Offline:
    for (size_t i = 0; i < n_threads; i++) {
      threads.push_back(std::thread(RegisterIssueQueryThread<TestScenario::Offline>));
    }
    break;
  case TestScenario::Server:
    for (size_t i = 0; i < n_threads; i++) {
      threads.push_back(std::thread(RegisterIssueQueryThread<TestScenario::Server>));
    }
    break;
  default:
  case TestScenario::SingleStream:
    for (size_t i = 0; i < n_threads; i++) {
      threads.push_back(std::thread(RegisterIssueQueryThread<TestScenario::SingleStream>));
    }
    break;
  }
}
SUT::~SUT() {
  for (auto&& thread : threads) {
    thread.join();
  }
}

// QSL implementation

const std::string& QSL::Name() const { return name; }
size_t QSL::TotalSampleCount() { return total_sample_count; }
size_t QSL::PerformanceSampleCount() { return performance_sample_count; }

void QSL::LoadSamplesToRam(const std::vector<QuerySampleIndex>& samples) {
  printf("Loading into ram %zu samples\n", samples.size());
  this->dataset->loadSamples(samples);
}
void QSL::UnloadSamplesFromRam(const std::vector<QuerySampleIndex>& samples) {}

QSL::QSL(size_t performance_sample_count,
         Dataset* dataset) {
  this->total_sample_count = dataset->getNumberOfSamples();
  this->performance_sample_count = performance_sample_count;
  this->dataset = dataset;
  name = "qsl_cpp";
};

QSL::~QSL() {}
