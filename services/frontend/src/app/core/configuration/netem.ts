import { NetworkEmulationConfiguration } from "./interface";

export const defaultNetEmConfig: NetworkEmulationConfiguration = {
    enabled: false,
    delay: "0ms",
    bandwidth: "0mbit",
    jitter: "0ms",
    loss_rate: "0%",
};

export const NetEmConfig_4G: NetworkEmulationConfiguration = {
    enabled: true,
    delay: "10ms",
    bandwidth: "12.5Mbit",
    jitter: "0ms",
    loss_rate: "0%",
};

export const NetEmConfig_5G: NetworkEmulationConfiguration = {
    enabled: true,
    delay: "1ms",
    bandwidth: "10Gbit",
    jitter: "0ms",
    loss_rate: "0%",
};
