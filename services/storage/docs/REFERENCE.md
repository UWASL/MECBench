# Endpoints
The service has mainly **two** endpoints: /qps and /latencies, serving the QPS and latency results accordingly.

## /qps

### `POST` /qps/
| Parameter Name | Description                                                                                     | Type   |
| -------------- | ----------------------------------------------------------------------------------------------- | ------ |
| experiment\_id | The ID of the experiment that the QPS is associated with. Used to select multiple related jobs. | String |
| selector       | The ID of a specific job that the QPS is associated with.                                       | String |
| qps            | The QPS result of the job.                                                                      | Float  |
---
### `GET` /qps/{experiment\_id}
This operation has no extra parameters. 
### **Returns** the list of QPS results associated with the Experiment ID, one for each job.
```json
[
    {
        "experiment\_id": "{experiment\_id: String}",
        "selector": "{job_selector: String}",
        "qps": "{QPS_Result: float}"
    }
]
```

---

## /latencies

### `POST` /latencies/
| Parameter Name | Description                                                                                                   | Type        |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| experiment\_id | The ID of the experiment that the list of latencies is associated with. Used to select multiple related jobs. | String      |
| selector       | The ID of a specific job that the list of latencies is associated with.                                       | String      |
| latencies      | The list of latency results of the job, one for each sample in the job.                                       | List[Float] |
---
### `GET` /latencies/{experiment\_id}
This operation has no extra parameters. 
### **Returns** the list of latency results associated with the Experiment ID, one for each job.
```json
[
    {
        "experiment\_id": "{experiment\_id: String}",
        "selector": "{job_selector: String}",
        "latencies": "{Latency_Results: comma-separated floats}"
    }
]
```
## /experiments

### `GET` /experiments/ 
This operation has no extra parameters. 
### **Returns** the list of experiment IDs for all previously ran experiments.
```json
{
    "experiments" : [
        "eid1",
        "eid2"
    ]
}
```
### `GET` /experiments/{experiment\_id}
This operation has no extra parameters. 
### **Returns** information about the specified experiment.
```json
{   
    "id": "{primary key of experiment in DB: Number}",
    "experiment\_id": "{experiment\_id: String}",
    "config_id" : "{config_id: Number}"
}
```

## /config

### `POST` /config/{experiment\_id}
Upload a new configuration json and relate it to specified experiment

### **Returns** information about the specified experiment.
```json
{
    "experiment\_id": "{experiment\_id: String}",
    "config_id" : "{config_id: Number}"
}
```


## /profiles
A profile is a description of previously ran experiments.


### `POST` /profiles/
| Parameter Name  | Required | Description                                                                                               | Type         |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------- | ------------ |
| name            | `True`   | The name of the profile                                                                                   | String       |
| description     | `False`  | The text description of the profile, default to an empty string.                                          | String       |
| loadgen         | `True`   | The loadgen configuration associated with the profile. The storage stores the dictionary as-is.           | `Dictionary` |
| sut             | `True`   | The sut configuration associated with the profile. The storage stores the dictionary as-is.               | `Dictionary` |
| network\_client | `True`   | The client-side netem configuration associated with the profile. The storage stores the dictionary as-is. | `Dictionary` |
| network\_server | `True`   | The server-side netem configuration associated with the profile. The storage stores the dictionary as-is. | `Dictionary` |


### ***Returns*** 201 on success, 500 on failure.

---
### `GET` /profiles
This operation has no extra parameters. 
### **Returns** a list of all the stored profiles.
```json
[
    {
        "name": "{name: String}",
        "description": "{description: String}",
        "loadgen": "{LoadGen_Config: Dictionary}",
        "sut": "{SUT_Config: Dictionary}",
        "network_client": "{Network_Client_Config: Dictionary}",
        "network_server": "{Network_Server_Config: Dictionary}"
    }
]
```

### `GET` /profiles/{profile_name}
This operation has no extra parameters. 
### **Returns** the profile with the specified name.
```json
{
    "name": "{name: String}",
    "description": "{description: String}",
    "loadgen": "{LoadGen_Config: Dictionary}",
    "sut": "{SUT_Config: Dictionary}",
    "network_client": "{Network_Client_Config: Dictionary}",
    "network_server": "{Network_Server_Config: Dictionary}"
}
```

### `DELETE` /profiles/{profile_name}
This operation has no extra parameters.

### `PUT` /profiles/{profile_id}
| Parameter Name | Required | Description                                                                                               | Type         |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------- | ------------ |
| name           | `True`   | The name of the profile                                                                                   | String       |
| description    | `True`   | The text description of the profile, default to an empty string.                                          | String       |
| loadgen        | `True`   | The loadgen configuration associated with the profile. The storage stores the dictionary as-is.           | `Dictionary` |
| sut            | `True`   | The sut configuration associated with the profile. The storage stores the dictionary as-is.               | `Dictionary` |
| network_client | `True`   | The client-side netem configuration associated with the profile. The storage stores the dictionary as-is. | `Dictionary` |
| network_server | `True`   | The server-side netem configuration associated with the profile. The storage stores the dictionary as-is. | `Dictionary` |

### ***Returns*** 200 on success, 500 on failure.
