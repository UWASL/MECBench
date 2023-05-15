#ifndef DMLPERF_DATASET_H
#define DMLPERF_DATASET_H

#include <stdint.h>

#include <string>
#include <fstream>
#include <vector>
#include "../c_loadgen/dataset.h"

class SyntheticDataset : public mlperf::Dataset {
 private:
  size_t number_of_samples;
 public:
  SyntheticDataset(size_t number_of_samples);
  ~SyntheticDataset();

  void loadDataset() override;

  mlperf::Data* getSample(const int& index) override;
  size_t getNumberOfSamples() override;

};

class StringDataset : public mlperf::Dataset {
 private:
  size_t number_of_samples;

 public:
  StringDataset(size_t number_of_samples);
  ~StringDataset();

  void loadDataset() override;
  mlperf::Data* getSample(const int& index) override;
  size_t getNumberOfSamples() override;
};

class CocoDataset : public mlperf::Dataset {
 private:
  std::string labelsPath = "coco/lables";
  std::string imageDir = "coco/images/";
  std::vector<std::string> listDir(const std::string& dir_path);
  std::vector<std::string>* dataPointPath;
  std::vector<std::string> categories;
  std::ofstream resultsFile;
  std::string categoriesPath;

 public:
  CocoDataset(std::string& labels_path, std::string& image_dir, std::string categoriesPath={});
  ~CocoDataset();

  void loadDataset() override;
  void loadSamples(const std::vector<size_t>& samples) override;
  void loadCategories();
  mlperf::Data* getSample(const int& index) override;
  void postProcess(const char* data, size_t size, const char* label) override;
  size_t getNumberOfSamples() override;
};

class PreprocessedDataset : public mlperf::Dataset {
 private:
  std::vector<std::string> listDir(const std::string& dir_path);
  std::vector<std::string>* dataPointPath;
  std::string dataPath;

 public:
  PreprocessedDataset(std::string& data_dir);
  ~PreprocessedDataset();

  void loadDataset() override;
  void loadSamples(const std::vector<size_t>& samples) override;
  mlperf::Data* getSample(const int& index) override;
  size_t getNumberOfSamples() override;
};

class SynthRequestDataset : public mlperf::Dataset {
 private:
  uint64_t micros_duration;
  size_t upload_size;
  std::string config_path;
  char* synthData;
 public:
  SynthRequestDataset(std::string& config_path);
  ~SynthRequestDataset();

  void loadDataset() override;
  void loadSamples(const std::vector<size_t>& samples) override;
  mlperf::Data* getSample(const int& index) override;
  size_t getNumberOfSamples() override;
};
class SynthIODataset : public mlperf::Dataset {
 private:
  size_t file_size;
  size_t burst_size;
  bool fsync;
  std::string config_path;
 public:
  SynthIODataset(std::string& config_path);
  ~SynthIODataset();

  void loadDataset() override;
  void loadSamples(const std::vector<size_t>& samples) override;
  mlperf::Data* getSample(const int& index) override;
  size_t getNumberOfSamples() override;
};
class SynthCPUDataset : public mlperf::Dataset {
 private:
  uint64_t micros_duration;
  std::string config_path;
 public:
  SynthCPUDataset(std::string& config_path);
  ~SynthCPUDataset();

  void loadDataset() override;
  void loadSamples(const std::vector<size_t>& samples) override;
  mlperf::Data* getSample(const int& index) override;
  size_t getNumberOfSamples() override;
};

#endif
