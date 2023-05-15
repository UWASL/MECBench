import { Profile } from './interface';
import { defaultMECBenchConfiguration } from '@core/configuration/mecbenchConfiguration';
import { defaultNetEmConfig, NetEmConfig_4G, NetEmConfig_5G } from '@core/configuration/netem';
import { SCENARIOS } from '@shared/constants';

export const Profile1: Profile = {
    id: 1,
    name: 'Coco SSD MobileNet Closed-loop 4G',
    description: 'Profile 1 description',
    loadgen: defaultMECBenchConfiguration.loadgen,
    sut: {
        ...defaultMECBenchConfiguration.sut,
        model: 'ssd-mobilenet',
        runtime: 'onnxruntime',
        modelThreads: 0,
        consumerThreads: 1,
    },
    network_client: NetEmConfig_4G,
    network_server: NetEmConfig_4G,
};

export const Profile2: Profile = {
    id: 2,
    name: 'SSD MobileNet Closed-loop 5G',
    description: 'Profile 2 description',
    loadgen: defaultMECBenchConfiguration.loadgen,
    sut: {
        ...defaultMECBenchConfiguration.sut,
        model: 'ssd-mobilenet',
        runtime: 'onnxruntime',
        modelThreads: 0,
        consumerThreads: 1,
    },
    network_client: NetEmConfig_5G,
    network_server: defaultNetEmConfig,

};

export const Profile3: Profile = {
    id: 3,
    name: 'SSD MobileNet Open-loop 5G',
    description: 'Profile 3 description',
    loadgen:  {
        num_threads: "30",
        min_duration: "10000",
        max_duration: "10000",
        target_qps: '20',
        mode: '2',
        samples_per_query: "1",
        max_async_queries: "5",
        scenario: SCENARIOS.MULTI_STREAM,
        dataset_id: 's3://mlperf-cocodatasets/300.tar.gz',
        repeats: 1
    },
    sut: {
        ...defaultMECBenchConfiguration.sut,
        model: 'ssd-mobilenet',
        runtime: 'onnxruntime',
        modelThreads: 0,
        consumerThreads: 1,
    },
    network_client: NetEmConfig_5G,
    network_server: defaultNetEmConfig,
};

export const defaultProfiles: Profile[] = [
    Profile1,
    Profile2,
    Profile3,
];
