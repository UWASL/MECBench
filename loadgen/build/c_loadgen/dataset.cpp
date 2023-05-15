#include "dataset.h"

#include <vector>

namespace mlperf {

Dataset::Dataset() { dataPoints = new std::vector<Data*>(); }
Dataset::~Dataset() {
  for (auto&& point : *dataPoints) {
    delete point;
  }
  delete dataPoints;
};
}  // namespace mlperf
