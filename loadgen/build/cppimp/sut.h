#ifndef DMLPERF_SUT_H
#define DMLPERF_SUT_H

#include <vector>
#include <thread>


#include "../c_loadgen/query_sample_library.h"
#include "../c_loadgen/system_under_test.h"
#include "../c_loadgen/test_settings.h"
#include "runner.h"
#include "dataset.h"

class SUT : public mlperf::SystemUnderTest {
 public:
  const std::string& Name() const override;
  void IssueQuery(const std::vector<mlperf::QuerySample>& samples) override;
  void FlushQueries() override;
  void ReportLatencyResults(
      const std::vector<mlperf::QuerySampleLatency>& latencies_ns) override;
  SUT(mlperf::RunnerBase* runner, size_t n_threads, mlperf::TestScenario scenario);
  ~SUT();

 private:
  std::string name;
  std::vector<std::thread> threads;
};

class QSL : public mlperf::QuerySampleLibrary {
 public:
  const std::string& Name() const override;
  size_t TotalSampleCount();
  size_t PerformanceSampleCount();

  void LoadSamplesToRam(const std::vector<mlperf::QuerySampleIndex>& samples) override;
  void UnloadSamplesFromRam(
      const std::vector<mlperf::QuerySampleIndex>& samples) override;

  QSL(size_t performance_sample_count, mlperf::Dataset* dataset);

  ~QSL();

 private:
  std::string name;
  mlperf::Dataset* dataset;
  size_t total_sample_count;
  size_t performance_sample_count;
};

#endif