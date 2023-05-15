# MECBench Controller: Flask Backend API Reference

## **MECBench Services**
---

<details>
<summary>Storage Services</summary>

## Storage Services

MECBench uses two storage services: MECStore to store the results of the experiments and any configuration, CIFSS to store small blobs (LoadGen configuration files) to be used by the experiments.
### HTTP Request
`POST` /init_storage

Ensures that both the storage **services** and **pods** are deployed and running. If the storage service pods are not deployed, they will be deployed using the images specified in the `backend_config.json` under the names `cifss_image` and `storage_image`.

### Path Parameters
This endpoint has no path parameters.

### Body Parameters
This endpoint has no body parameters.


### Response

| Code | Description       |
| ---- | ----------------- |
| 200  | Request Succeeded |

### Response Body

| Parameter | Type                            | Description                       |
| --------- | ------------------------------- | --------------------------------- |
| cifss     | [`ServiceState`](#servicestate) | The state of the CIFSS service    |
| storage   | [`ServiceState`](#servicestate) | The state of the MECStore service |



</details>

---

<details>
<summary>System Under Test Service (SUT) </summary>

## System Under Test Service (SUT)
MECBench's SUT is deployed as a service and a pod, with plans to deploy multiple pods behind a load balancer. 
### HTTP Request
`POST` /sut

Ensures that both the SUT service and its pod are deployed. If a previous SUT pod was deployed, it will be deleted and a new one will be deployed using the image specified in the `backend_config.json` under the name `sut_image` with the configuration provided in the request's body.

### Path Parameters
This endpoint has no path parameters.


### Body Parameters
| Parameter      | Type                                                                  | Required | Description                                                                                      |
| -------------- | --------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| node_selectors | `dict`                                                                | No       | A dictionary of node selectors used for selecting which node to deploy the SUT pods on.          |
| netem          | [`NetEmConfig`](#netemconfig-refer-to-tc-for-more-information)        | No       | The network emulation parameters sent to the network emulation module (TC). for the server-side. |
| limits         | [`ResourceLimits`](#resourcelimits-refer-to-kubernetes-documentation) | No       | The resource limits applied on the SUT pods.                                                     |
| args           | `list`                                                                | No       | A list of arguments to be passed to the SUT image.                                               |

### Response

| Code | Description       |
| ---- | ----------------- |
| 200  | Request Succeeded |

### Response Body

| Parameter | Type                            | Description                                                                        |
| --------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| sut       | [`ServiceState`](#servicestate) | The state of the SUT service. The {pod} parameters is expected to be set to `true` |

</details>

---

<details>
<summary>Load Generator Service (LoadGen Server) </summary>

## Load Generator Service (LoadGen Server)
MECBench's LoadGen **Server/Service** is deployed as a service and a pod, launching a service that can be contacted to start a LoadGen instance on the same pod.

### HTTP Request
`POST` /lg_server
Ensures that both the SUT service and its pod are deployed. If a previous LoadGen Service pod was deployed, it will be deleted and a new one will be deployed using the image specified in the `backend_config.json` under the name `loadgen_server_image` with the configuration provided in the request's body.

### Path Parameters
This endpoint has no path parameters.


### Body Parameters
| Parameter | Type                                                           | Required | Description                                                                                      |
| --------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| netem     | [`NetEmConfig`](#netemconfig-refer-to-tc-for-more-information) | No       | The network emulation parameters sent to the network emulation module (TC), for the client-side. |
| args      | `list`                                                         | No       | A list of arguments to be passed to the LoadGen Server image.                                    |


### Response

| Code | Description       |
| ---- | ----------------- |
| 200  | Request Succeeded |

### Response Body

| Parameter | Type                            | Description                                                                             |
| --------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| lg_server | [`ServiceState`](#servicestate) | The state of the LoadGen service. The {pod} parameters is expected to be set to `true`. |

---
</details>

---
## Launching Experiments
MECBench provides multiple ways to launch experiments, launching an independent LoadGen instance for each experiment, or launching a single LoadGen Server instance and using it to launch multiple LoadGen experiments. 

<details>
<summary>LoadGen Job </summary>

## LoadGen Job
A LoadGen Job is a single LoadGen instance running a single experiment on an independent pod. This takes longer to finish due to the time it takes to deplay a new pod and fetch the dataset on each run.

### HTTP Request
`POST` /start/{eid}/{selector}

### Path Parameters
| Parameter | Description                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| eid       | The experiment's identifier, used to group related jobs in the storage service.                               |
| selector  | The job's identifier in the experiment, mostly used to indicate the number of clients running during the job. |


### Body Parameters
| Parameter  | Type                                                           | Required | Description                                                                                                            |
| ---------- | -------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| models     | List[[LoadGenConfig](#loadgenconfig)]                          | Yes      | The configurations for different models in the experiment.                                                             |
| dataset_id | String                                                         | Yes      | The dataset's identifier in the blob storage, currently the S3 storage link, e.g., `s3://mlperf-cocodatasets/300.tar`. |
| scenario   | String                                                         | Yes      | The scenario to run the experiment on. Refer to LoadGen's scenarios for more details.                                  |
| repeats    | Integer                                                        | No       | The number of times to repeat the experiment.                                                                          |
| netem      | [`NetEmConfig`](#netemconfig-refer-to-tc-for-more-information) | No       | The network emulation parameters sent to the network emulation module (TC), for the client-side.                       |

### Response

| Code | Description      |
| ---- | ---------------- |
| 200  | Experiment Done. |
| 500  | Error.           |

### Response Body
This endpoint returns an empty body.


</details>

---

<details>
<summary>LoadGen instance</summary>

## LoadGen instance
A LoadGen instance is a single LoadGen process ran by the LoadGen Server. This is faster than the LoadGen Job, as it doesn't require deploying a new pod for each experiment, but it requires the LoadGen Server to be running. The network emulation parameters are applied on the LoadGen Server, and the LoadGen instance will **inherit** the network emulation parameters from the LoadGen Server.

### HTTP Request
`POST` /lg_job/{eid}/{selector}


### Path Parameters
| Parameter | Description                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| eid       | The experiment's identifier, used to group related jobs in the storage service.                               |
| selector  | The job's identifier in the experiment, mostly used to indicate the number of clients running during the job. |


### Body Parameters
| Parameter  | Type                | Required | Description                                                                                                            |
| ---------- | ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| models     | List[LoadGenConfig] | Yes      | The configurations for different models in the experiment.                                                             |
| dataset_id | String              | Yes      | The dataset's identifier in the blob storage, currently the S3 storage link, e.g., `s3://mlperf-cocodatasets/300.tar`. |
| scenario   | String              | Yes      | The scenario to run the experiment on. Refer to LoadGen's scenarios for more details.                                  |
| repeats    | Integer             | No       | The number of times to repeat the experiment.                                                                          |

### Response

| Code | Description      |
| ---- | ---------------- |
| 200  | Experiment Done. |
| 500  | Error.           |

### Response Body
This endpoint returns an empty body.


</details>

---

<details>
<summary>Backend Options</summary>

## Backends

### HTTP Request
`GET` /backends
This endpoint returns a list of the available backends for the SUT, their parameters can be passed as arguments to the [SUT](#system-under-test-service-sut).

### Path Parameters
This endpoint has no path parameters.

### Body Parameters
This endpoint has no body parameters.
### Response

| Code | Description |
| ---- | ----------- |
| 200  | Success.    |
| 500  | Error.      |

### Response Body
| Parameter | Type                        | Description                                        |
| --------- | --------------------------- | -------------------------------------------------- |
| backends  | List[[`Backend`](#backend)] | A list of available backends, empty on `500 ERROR` |

## Datasets


### HTTP Request
`GET` /datasets
This endpoint returns a list of the available datasets for the LoadGen, their links and parameters can be passed as arguments to the [SUT](#system-under-test-service-sut) and the [LoadGen](#loadgen-job).

### Path Parameters
This endpoint has no path parameters.

### Body Parameters
This endpoint has no body parameters.
### Response

| Code | Description |
| ---- | ----------- |
| 200  | Success.    |
| 500  | Error.      |

### Response Body
| Parameter | Type                        | Description                                        |
| --------- | --------------------------- | -------------------------------------------------- |
| datasets  | List[[`Dataset`](#dataset)] | A list of available datasets, empty on `500 ERROR` |

## Models
`GET` /models
This endpoint returns a list of the available models for the SUT, their links and parameters can be passed as arguments to the [SUT](#system-under-test-service-sut).

### Path Parameters
This endpoint has no path parameters.

### Body Parameters
This endpoint has no body parameters.
### Response

| Code | Description |
| ---- | ----------- |
| 200  | Success.    |
| 500  | Error.      |

### Response Body
| Parameter | Type                        | Description                                        |
| --------- | --------------------------- | -------------------------------------------------- |
| models  | List[[`Model`](#model)] | A list of available models, empty on `500 ERROR` |

</details>

---

## Appendix
This section includes additional information about the objects passed to and returned by the endpoints.

<details open="open">
<summary>Objects</summary>

## **ServiceState**
| Parameter | Type      | Description                                                                                         |
| --------- | --------- | --------------------------------------------------------------------------------------------------- |
| pod       | `boolean` | Set to `false` if a service pod was already deployed and running, `true` if a new one was deployed. |
| svc       | `boolean` | Set to `false` if the service was already defined, `true` if a new one was defined.                 |

---

## **NetEmConfig** (Refer to [tc](https://wiki.linuxfoundation.org/networking/netem) for more information)
| Parameter | Type   | Description                                                                                           |
| --------- | ------ | ----------------------------------------------------------------------------------------------------- |
| bandwidth | String | The bandwidth to be emulated. Download rate when applied to SUT, upload rate when applied to LoadGen. |
| delay     | String | The single trip latency to be emulated.                                                               |
| jitter    | String | The latency jitter to be emulated.                                                                    |
| loss_rate | String | The percentage packet loss to be emulated, i.e, "50" is 50% if packets are dropped.                   |
| reorder   | String | The percentage of packets to be reordered on transmission.                                            |

---
## **ResourceLimits** (Refer to [Kubernetes' documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/))
| Parameter | Type   | Description                                                                                                                                                        |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cpu       | String | See [K8's documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/). e.g, "2" allows using up to `2` CPUs per pod.            |
| memory    | String | See [K8's documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/). e.g, "128Mi" allows using up to `128` MegaBytes per pod. |

--- 

## **Backend** 
| Parameter        | Type         | Description                                                   |
| ---------------- | ------------ | ------------------------------------------------------------- |
| id               | String       | The identifier of the backend, passed as `runtime` to the SUT |
| name             | String       | A human friendly name for the backend                         |
| supported_models | List[String] | A list of the IDs of the models that can run on this backend  |

--- 
## **Model** 
| Parameter          | Type         | Description                                                                           |
| ------------------ | ------------ | ------------------------------------------------------------------------------------- |
| id                 | String       | The identifier of the model                                                           |
| name               | String       | A human friendly name for the model                                                   |
| supported_datasets | List[String] | A list of the IDs of the datasets that this model can receive                         |
| link               | String       | The link used for downloading the model tar                                           |
| model-path         | String       | The path to the model after being extracted from the tar, passed as an arg to the SUT |

## **Dataset** 
| Parameter  | Type                 | Description                                                         |
| ---------- | -------------------- | ------------------------------------------------------------------- |
| id         | String               | The identifier of the dataset                                       |
| name       | String               | A human friendly name for the dataset                               |
| link       | String               | The link used for downloading the dataset tar                       |
| properties | dict[String, String] | A dictionary of properties describing the dataset, e.g. model-shape |

--- 




## **LoadGenConfig**
The LoadGenConfig is a JSON representation of the LoadGen's configuration, the most used parameters are listed in the following example:

```json
"models": [
        {
            "model_name": "*", // Apply to all model names
            "scenarios": [
                {
                    "scenario_name": "*", // Apply to all scenarios
                    "config": {
                        "num_threads": "1", // The number of concurrent clients
                        "max_duration": "10000", // The maximum duration of the experiment in milliseconds
                        "min_duration": "10000", // The minimum duration of the experiment in milliseconds
                        "target_qps": "800", // The targeted throughput in queries per second in the MultiStream Scenario PER CLIENT
                        "mode": "2", // The mode of the experiment, 2 is PerformanceOnly
                        "samples_per_query": "1", // The number of samples to send per query
                        "max_async_queries": "1" // The maximum number of concurrent queries per client 
                    }
                }
            ]
        }
    ],
```
</details>
