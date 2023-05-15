import { SCENARIOS } from '@shared/constants';
import { LoadGenConfiguration } from './interface';

export const defaultLoadGenConfiguration: LoadGenConfiguration = {
    num_threads: '1',
    min_duration: '10000',
    max_duration: '10000',
    target_qps: '20',
    mode: '2',
    samples_per_query: '1',
    max_async_queries: '1',
    dataset_id: 's3://mlperf-cocodatasets/300.tar.gz',
    scenario: SCENARIOS.SINGLE_STREAM,
    repeats: 1,
};
