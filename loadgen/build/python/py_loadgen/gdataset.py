"""
dataset related classes and methods
"""

# pylint: disable=unused-argument,missing-docstring

import logging
import sys
import time
from typing import Dict

import cv2
import numpy as np
import dataset

import os
import json
import cli_colors

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("gds")


class GenericDataset(dataset.Dataset):

    def __init__(self, data_path, image_list, name, use_cache=0, image_size=None,
                 image_format="NHWC", pre_process=None, count=None, cache_dir=None,use_label_map=False):
        self.arrival = None
        self.image_list = []
        self.label_list = []
        self.image_list_inmemory = {}
        self.cache_dir = os.path.join(os.getcwd(), "gds_preprocess")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.last_loaded = -1

        self.annotation_file = os.path.join(data_path, "annotations.json")
        with open(self.annotation_file, "r") as f:
            annotation_json = json.load(f)
        for image in annotation_json:
            image_path = os.path.join(data_path, "data", image["file"])
            image_name = image["file"]
            categories = image["categories"]
            self.image_list.append({
                "path": image_path,
                "image": image_name,
                "categories": categories
                })
            self.label_list.append(categories)
            img = cv2.imread(image_path)
            np.save(os.path.join(self.cache_dir, f"{image}.npy"), img)
        cli_colors.color_print(f"Loaded {len(self.image_list)} Images", cli_colors.CYAN)
        # for i, image in enumerate(self.image_list):
            # print(i, image["image"])
        self.label_list = np.array(self.label_list)

    def get_item_count(self):
        return len(self.image_list)

    def get_list(self):
        raise NotImplementedError("Dataset:get_list")

    def get_item(self, item):
        # cli_colors.color_print(f"Getting item: {item}", cli_colors.BLUE)
        """Get image by number in the list."""
        dst = os.path.join(self.cache_dir, f"{self.image_list[item]['image']}.npy")
        img = np.load(dst)
        # cli_colors.color_print(f"Getting item: {item} OK", cli_colors.GREEN)
        return img, None #self.label_list[item]

    def get_item_loc(self, id):
        # cli_colors.color_print(f"Getting location of: {id}", cli_colors.MAGENTA)

        return self.image_list[id]["path"]


#
# Post processing
#
class PostProcessGeneric:
    def __init__(self, offset=0):
        self.offset = offset
        self.good = 0
        self.total = 0
        self.bad_query = 0

    def __call__(self, results, ids, expected=None, result_dict=None):
        processed_results = []
        cli_colors.color_print(f"{ids}:", cli_colors.GREEN)
        n = len(results[0])
        if results[0] is None:
            self.bad_query += 1
            # TODO: replace -1 with a meaningful enum
            return [[-1]]*len(ids)

        for idx in range(0, n):
            result = results[0][idx] + self.offset
            result_real = results[3][idx]
            processed_results.append([result])
            cli_colors.color_print(f"Result: {result_real[result_real>1]} Expected: {expected[idx]}", cli_colors.GREEN)
            for r in result_real:
                if r in expected[idx]:
                    self.good += 1
        self.total += n
        return processed_results

    def add_results(self, results):
        pass

    def start(self):
        self.good = 0
        self.total = 0

    def record_totals(self, result_dict):
        result_dict["good"] += self.good
        result_dict["total"] += self.total
        result_dict["bad"] += self.bad_query

    def finalize(self, results, ds=False,  output_dir=None):
        results["good"] = self.good
        results["total"] = self.total



