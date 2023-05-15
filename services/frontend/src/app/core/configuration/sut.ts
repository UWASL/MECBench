import { SUTConfiguration } from "./interface";

export const defaultSUTConfiguration: SUTConfiguration = {
    modelThreads: 1,
    model: "ssd-mobilenet",
    runtime: "onnxruntime",
    consumerThreads: 1,
};
