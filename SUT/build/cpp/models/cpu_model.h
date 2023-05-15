#ifndef CPU_MODEL_H_
#define CPU_MODEL_H_

#include <cassert>
#include <chrono>
#include <cmath>
#include <random>
#include <string>
#include <iostream>
#include "model.h"

struct CPUQueryParam {
  u_int64_t runtime;
};

struct CPUQueryResponse {
  uint64_t time_taken;
  int error_code;
};

class CPUModel : public BaseModel {
 public:
  void* parseQuery(const std::string& query, size_t size) override {
    const char* p = query.data();
    CPUQueryParam* params = new CPUQueryParam;
    params->runtime = *((u_int64_t*)p);
    return params;
  }
  std::string runQuery(const void* queryParameters) override {
    const CPUQueryParam* params = (CPUQueryParam*)queryParameters;
    uint64_t runtime = 0;
    std::chrono::time_point<std::chrono::system_clock> start, end;
    double numerator = rand();
    double denominator = 2 * asin(1);
    while (runtime < params->runtime) {
      start = std::chrono::system_clock::now();
      for (int i = 0; i < 10000; i++) {
        numerator /= denominator;
      }
      end = std::chrono::system_clock::now();
      runtime += std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
    }
    std::cout << runtime << "\n";
    CPUQueryResponse* response = new CPUQueryResponse;
    response->error_code = 0;
    response->time_taken = runtime;
    delete params;
    return serializeResponse(response);
  }
  std::string serializeResponse(const void* response) override {
    std::string ser_res;
    ser_res.assign((char*)&response, sizeof(CPUQueryResponse));
    delete response;
    return ser_res;
  }
};
#endif  // CPU_MODEL_H_