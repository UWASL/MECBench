
#ifndef MODEL_H_
#define MODEL_H_



#include <string>


class BaseModel {
 private:
 public:
  virtual void* parseQuery(const std::string& query, size_t size) = 0;
  virtual std::string runQuery(const void* queryParameters) = 0;
  virtual std::string serializeResponse(const void* response) = 0;
};



#endif  // MODEL_H_