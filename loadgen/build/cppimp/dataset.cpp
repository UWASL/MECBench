#include "dataset.h"

#include <dirent.h>
#include <memory.h>
#include <unistd.h>

#include <cassert>
#include <fstream>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace mlperf;

/* Synthetic Dataset Implementation*/
#pragma region SyntheticDataset
SyntheticDataset::SyntheticDataset(size_t number_of_samples) {
  this->number_of_samples = number_of_samples;
};
SyntheticDataset::~SyntheticDataset(){};
void SyntheticDataset::loadDataset() { return; }

Data* SyntheticDataset::getSample(const int& index) {
  Data* res = new Data();
  res->data = (char*)new int(10);
  res->size = sizeof(int);
  res->label = 0;
  return res;
}

size_t SyntheticDataset::getNumberOfSamples() {
  return number_of_samples;
};

#pragma endregion SyntheticDataset

/* String Dataset Implementation*/
#pragma region StringDataset

StringDataset::StringDataset(size_t number_of_samples) {
  this->number_of_samples = number_of_samples;
};
StringDataset::~StringDataset(){};
void StringDataset::loadDataset() { return; }

Data* StringDataset::getSample(const int& index) {
  Data* res = new Data();
  res->data = new char[10];
  res->size = 10 * sizeof(char);
  memcpy(res->data, "123456789\0", 10);
  res->label = 0;
  return res;
}

size_t StringDataset::getNumberOfSamples() {
  return number_of_samples;
};
#pragma endregion StringDataset


// TODO: let Coco dataset and all the other file-oriented 
//  datasets inheret from the same base class

/* Coco Dataset Implementation*/
#pragma region CocoDataset
CocoDataset::CocoDataset(std::string& labelsPath, std::string& imageDir, std::string categoriesPath) {
  this->imageDir = imageDir;  // imageDir;
  this->labelsPath = labelsPath;
  this->dataPointPath = new std::vector<std::string>();
  this->resultsFile.open("results.txt", std::ios::out);
  this->categoriesPath = categoriesPath;
  loadDataset();
};
CocoDataset::~CocoDataset(){};
std::vector<std::string> CocoDataset::listDir(const std::string& dirPath) {
  DIR* dir_fd = opendir(dirPath.c_str());
  std::vector<std::string> filelist;
  if (!dir_fd) {
    std::cerr << "Directory \""<< dirPath <<"\" could not be opened\n";
    exit(1);
    return filelist;
  }
  dirent* file;
  while (file = readdir(dir_fd)) {
    if (file->d_type == DT_REG) {
      filelist.push_back(std::string(file->d_name));
    }
  }

  return filelist;
}

size_t CocoDataset::getNumberOfSamples() {
  return dataPoints->size();
};

void CocoDataset::loadCategories() {
  std::ifstream file(categoriesPath);
  std::string line;
  if(!file.is_open()) {
    std::cerr << "Categories file could not be opened\n";
    return;
  }
  while (std::getline(file, line)) {
    categories.push_back(line);
  }
}

void CocoDataset::loadDataset() {
  char tmp[1000];
  getcwd(tmp, 999);
  loadCategories();
  std::ifstream labels_file, image_file;
  std::map<std::string, std::string> labels_map;
  labels_file.open(labelsPath, std::ios::in);
  assert(labels_file.is_open());
  std::string image_name;
  int label;
  while (labels_file >> image_name >> label) {
    labels_map[image_name] = label;
  }
  std::vector<std::string> image_list = listDir(imageDir);
  Data* item;
  for (auto&& image : image_list) {
    std::map<std::string, std::string>::iterator iter = labels_map.find(image);
    if (iter == labels_map.end()) {
      std::cerr << "No label found for: " << image << std::endl;
      continue;
    }
    this->dataPointPath->push_back(imageDir + "/" + image);
    item = new Data();
    memset(item, 0, sizeof(item));
    image_file.open(this->dataPointPath->back(),
                    std::ios::binary | std::ios::ate);
    assert(image_file.is_open());
    item->size = image_file.tellg();
    item->data = NULL;
    item->label = new char[image.size()+1];
    strcpy(item->label, image.c_str());
    dataPoints->push_back(item);
    image_file.close();
  }
  return;
}

Data* CocoDataset::getSample(const int& index) {
  if (index > dataPoints->size()) {
    std::cout << index << " is outside the bounds on dataPoints\n";
  }
  assert(index < dataPoints->size());
  return dataPoints->at(index);
}
void CocoDataset::loadSamples(const std::vector<size_t>& samples) {
  Data* item;
  std::ifstream image_file;

  for (auto&& index : samples) {
    assert(index < this->dataPointPath->size());
    item = this->dataPoints->at(index);
    assert(item);
    image_file.open(this->dataPointPath->at(index),
                    std::ios::binary | std::ios::in);
    assert(image_file.is_open());
    item->data = new char[item->size];
    image_file.read((char*)item->data, item->size);
    image_file.close();
  }
}

void CocoDataset::postProcess(const char* data, size_t size, const char* label) {
  int8_t* data_ptr = (int8_t*)data;
  size_t number_of_detected_objects = size;
  this->resultsFile << label << std::endl;
  if(!this->categories.size() == 0) {
    for (size_t i = 0; i < number_of_detected_objects; i++) {
      assert(data_ptr[i] <= categories.size() && data_ptr[i] > 0);
      this->resultsFile << (int)data_ptr[i] << " ";
    }
  }
  delete[] data;
  this->resultsFile << std::endl;

}
#pragma endregion CocoDataset

/* Preprocessed Dataset Implementation*/
#pragma region Preprocessed

PreprocessedDataset::PreprocessedDataset(std::string& data_dir) {
  this->dataPath = data_dir;
  this->dataPointPath = new std::vector<std::string>();
  loadDataset();
};

PreprocessedDataset::~PreprocessedDataset(){};
std::vector<std::string> PreprocessedDataset::listDir(
    const std::string& dir_path = "uspp_processed") {
  DIR* dir_fd = opendir(dir_path.c_str());
  std::vector<std::string> filelist;
  if (!dir_fd) {
    std::cerr << "Directory \""<< dir_path <<"\" could not be opened\n";
    exit(1);
    return filelist;
  }
  dirent* file;
  while (file = readdir(dir_fd)) {
    if (file->d_type == DT_REG) {
      filelist.push_back(std::string(file->d_name));
    }
  }

  return filelist;
}

size_t PreprocessedDataset::getNumberOfSamples() {
  return dataPoints->size();
};

void PreprocessedDataset::loadDataset() {
  char tmp[1000];
  getcwd(tmp, 999);
  std::ifstream data_file;
  std::map<std::string, int> labels_map;
  std::string datapoint_name;
  int label;
  std::vector<std::string> datapoint_list = listDir(dataPath);
  Data* item;
  for (auto&& datapointPath : datapoint_list) {
    this->dataPointPath->push_back(dataPath + "/" + datapointPath);
    item = new Data();
    memset(item, 0, sizeof(item));
    data_file.open(this->dataPointPath->back(),
                   std::ios::binary | std::ios::ate);
    assert(data_file.is_open());
    item->size = data_file.tellg();
    item->data = NULL;
    item->label = 0;
    dataPoints->push_back(item);
    data_file.close();
  }
  return;
}

Data* PreprocessedDataset::getSample(const int& index) {
  if (index > dataPoints->size()) {
    std::cout << index << " is outside the bounds on dataPoints\n";
  }
  assert(index < dataPoints->size());
  return dataPoints->at(index);
}
void PreprocessedDataset::loadSamples(const std::vector<size_t>& samples) {
  Data* item;
  std::ifstream image_file;

  for (auto&& index : samples) {
    assert(index < this->dataPointPath->size());
    item = this->dataPoints->at(index);
    assert(item);
    image_file.open(this->dataPointPath->at(index),
                    std::ios::binary | std::ios::in);
    assert(image_file.is_open());
    item->data = new char[item->size];
    image_file.read((char*)item->data, item->size);
    image_file.close();
  }
}

#pragma endregion Preprocessed

#pragma region SynthRequestDataset
  SynthRequestDataset::SynthRequestDataset(std::string& config_path): config_path{config_path} {
    loadDataset();
  }
  SynthRequestDataset::~SynthRequestDataset() {
    delete this->synthData;
  }

  void SynthRequestDataset::SynthRequestDataset::loadDataset() {
    std::ifstream config_file(config_path);
    config_file >> this->micros_duration >> this->upload_size;
    config_file.close();
    synthData = new char[upload_size];
    memset(synthData, -1, upload_size);
    return;
  };
  void SynthRequestDataset::loadSamples(const std::vector<size_t>& samples) {};
  mlperf::Data* SynthRequestDataset::getSample(const int& index) {
    Data* item = new Data();
    memset(item, 0, sizeof(item));
    item->data = new char[sizeof(u_int64_t) + upload_size];
    memcpy(item->data, &(this->micros_duration), sizeof(u_int64_t));
    memcpy(item->data + sizeof(u_int64_t), synthData, upload_size);
    item->size = sizeof(u_int64_t) + upload_size;
    return item;
  };
  size_t SynthRequestDataset::getNumberOfSamples() {
    return INT16_MAX;
  }
#pragma endregion SynthRequestDataset

#pragma region SynthIODataset
  SynthIODataset::SynthIODataset(std::string& config_path): config_path{config_path} {
    loadDataset();
  }
  SynthIODataset::~SynthIODataset() {}

  void SynthIODataset::loadDataset() {
    int fsync = 0;
    std::ifstream config_file(config_path);
    config_file >> this->file_size >> this->burst_size >> fsync;
    config_file.close();
    this->fsync = fsync&1;
    return;
  };
  
  void SynthIODataset::loadSamples(const std::vector<size_t>& samples){}
  mlperf::Data* SynthIODataset::getSample(const int& index){
    size_t data_size = sizeof(this->file_size) + sizeof(this->burst_size) + sizeof(this->fsync); 
    Data* item = new Data();
    memset(item, 0, sizeof(item));
    item->data = new char[data_size];
    char* pointer = item->data;
    memcpy(pointer, &(this->file_size), sizeof(this->file_size));
    pointer += sizeof(this->file_size);
    memcpy(pointer, &(this->burst_size), sizeof(this->burst_size));
    pointer += sizeof(this->burst_size);
    memcpy(pointer, &(this->fsync), sizeof(this->fsync));
    pointer += sizeof(this->fsync);
    item->size = data_size;
    return item;
  };
  size_t SynthIODataset::getNumberOfSamples() {
    return INT16_MAX;
  };

#pragma endregion SynthIODataset
#pragma region SynthCPUDataset
  SynthCPUDataset::SynthCPUDataset(std::string& config_path) : config_path{config_path} {
    loadDataset();
  }
  SynthCPUDataset::~SynthCPUDataset() {}

  void SynthCPUDataset::loadDataset()  {
    std::ifstream config_file(config_path);
    config_file >> this->micros_duration;
    config_file.close();
    return;
  }
  void SynthCPUDataset::loadSamples(const std::vector<size_t>& samples) {};
  mlperf::Data* SynthCPUDataset::getSample(const int& index) {
    Data* item = new Data();
    memset(item, 0, sizeof(item));
    item->data = new char[sizeof(this->micros_duration)];
    memcpy(item->data, &(this->micros_duration), sizeof(this->micros_duration));
    item->size = sizeof(this->micros_duration);
    return item;
  };
  
  size_t SynthCPUDataset::getNumberOfSamples(){
    return INT16_MAX;
  };
#pragma endregion SynthCPUDataset

