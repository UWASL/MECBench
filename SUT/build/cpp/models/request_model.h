#ifndef REQUEST_MODEL_H_
#define REQUEST_MODEL_H_

#include <cassert>
#include <chrono>
#include <iostream>
#include <string>
#include <thread>

#include "model.h"

struct ReqQueryParam {
  u_int64_t sleep_time;  // in Microseconds
};

struct ReqQueryResponse {
  uint64_t time_taken;
  int error_code;
};

class RequestModel : public BaseModel {
 public:
  void* parseQuery(const std::string& query, size_t size) override {
    const char* p = query.data();
    ReqQueryParam* params = new ReqQueryParam;
    params->sleep_time = *((u_int64_t*)p);
    return params;
  }

  std::string runQuery(const void* queryParameters) override {
    std::chrono::time_point<std::chrono::system_clock> start, end;
    start = std::chrono::system_clock::now();

    const ReqQueryParam* params = (ReqQueryParam*)queryParameters;
  
    std::this_thread::sleep_for(std::chrono::duration<double, std::micro>(params->sleep_time));

    end = std::chrono::system_clock::now();

    ReqQueryResponse* response = new ReqQueryResponse;
    response->error_code = 0;
    response->time_taken = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();

    delete params;
    return serializeResponse(response);
  }
  std::string serializeResponse(const void* response) override {
    std::string ser_res;
    ser_res.assign((char*)response, sizeof(ReqQueryResponse));
    delete (ReqQueryResponse*)response;
    return ser_res;
  }
};
#endif  // REQUEST_MODEL_H_