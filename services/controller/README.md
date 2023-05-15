# MECBench Controller: Flask Backend
The controller is responsible MECBench's services and experiments.



## Backend Config
The backend is configured using a `backend_config.json` file. The following needs to be defined:

- `loadgen_image`: The image to use when deploying LoadGen pods.
- `loadgen_server_image`: The image to use when deploying LoadGen server pods.
- `sut_image`: The image to use when deploying the SUT pod.
- `cifss_image`: The image to use when deploying the CIFSS pod.
- `storage_image`: The image to use when deploying the storage (MECStore) pod.
- `mlperf_storage_server`: MECStore's address that is reachable from the controller.
- `mlperf_storage_server_k8s`: MECStore's address that is reachable from K8s pods.
- `file_storage_server`: CIFSS's address that is reachable from the controller.
- `file_storage_server_k8s`: CIFSS's address that is reachable from K8s pods.
- `loadgen_server`: LoadGen server's address that is reachable from the controller.
- `sut_address_k8s`: SUT's address that is reachable from K8s pods.
- `service_account_name`: The service account name defined in the K8s cluster. Used to provide access to other cloud services, e.g., S3.

