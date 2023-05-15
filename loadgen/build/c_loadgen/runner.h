#ifndef DMLPERF_RUNNER_BASE_H
#define DMLPERF_RUNNER_BASE_H

#include <vector>

#include "dataset.h"
#include "query_sample.h"

namespace mlperf {
  class RunnerBase {
  protected:
  public:
    // Change to shared_pointer
    Dataset* dataset;
    RunnerBase(Dataset* dataset);
    ~RunnerBase();
    virtual mlperf::QuerySampleResponse predict(const Data* item) = 0;
    virtual void init();
    virtual RunnerBase* clone() = 0;
    virtual void runQuery(const std::vector<mlperf::QuerySample>& samples);
  };

}  // namespace mlperf

#endif