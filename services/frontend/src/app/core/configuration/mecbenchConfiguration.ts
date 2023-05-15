import { MECBenchConfiguration } from "./interface";
import { defaultLoadGenConfiguration } from "./loadgen";
import { defaultSUTConfiguration } from "./sut";
import { defaultNetEmConfig } from "./netem";

export const defaultMECBenchConfiguration: MECBenchConfiguration = {
    loadgen: defaultLoadGenConfiguration,
    sut: defaultSUTConfiguration,
    networkClient: defaultNetEmConfig,
    networkServer: defaultNetEmConfig,
};