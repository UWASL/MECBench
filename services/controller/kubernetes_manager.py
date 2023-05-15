from kubernetes import client
from config import Config as BackendConfig
import kubernetes
import time
import requests

class KubernetesManager:
    def __init__(self, kube_config_path, config: BackendConfig):
        self.kube_config_path = kube_config_path
        kubernetes.config.load_kube_config(kube_config_path)
        self.config: BackendConfig = config

    def is_service_deployed(self, service_name, namespace="default"):
        kubernetes.config.load_kube_config(self.kube_config_path)
        api_instance = client.CoreV1Api()
        try:
            _ = api_instance.read_namespaced_service_status(service_name, namespace)
            return True
        except client.exceptions.ApiException as e:
            if e.status == 404:
                return False
            else:
                raise e

    def is_job_running(self, jobname, namespace="default"):
        kubernetes.config.load_kube_config(self.kube_config_path)
        api_instance = client.BatchV1Api()
        try:
            res = api_instance.read_namespaced_job_status(jobname, namespace)
            status = res.status.active
            return True
        except kubernetes.client.exceptions.ApiException as e:
            if e.status == 404:
                return None
            else:
                raise e

    def wait_service_pod(self, service_labels: dict, namespace="default", wait_for_up=True):
        status = self.is_service_pod_deployed(service_labels, namespace)
        if status is not None:
            status = True
        else:
            status = False
        while wait_for_up ^ status:
            
            time.sleep(1)
            status = self.is_service_pod_deployed(service_labels, namespace)
            status = True if status else False


    def is_service_pod_deployed(self, service_labels: dict, namespace="default"):
        kubernetes.config.load_kube_config(self.kube_config_path)
        api_instance = client.CoreV1Api()
        try:
            filters = []
            for key, val in service_labels.items():
                filters.append(f"{key}={val}")
            res = api_instance.list_namespaced_pod(namespace=namespace, label_selector=",".join(filters))
            if len(res.items) > 0:
                pod_status = res.items[0].status.phase
                return pod_status
            return None
        except client.exceptions.ApiException as e:
            raise e

    def createService(self, selector, name, port, node_port=None):
        kubernetes.config.load_kube_config(self.kube_config_path)
        if self.is_service_deployed(name):
            return False
        v1 = client.CoreV1Api()
        service_spec = client.V1ServiceSpec(
                type="NodePort", 
                selector=selector,
                ports=[
                    client.V1ServicePort(
                        port=port,
                        target_port=port,
                        node_port=node_port)])

        service = client.V1Service(
            api_version="v1", 
            kind="Service",
            spec=service_spec,
            metadata=client.V1ObjectMeta(
                name=name
            ))

        _ = v1.create_namespaced_service("default", service)
        return True

    def getPodSpec(self, cname, image, args, hostname=None, ports=None, node_selector=None, image_pull_policy="Always", restart_policy="Never", limits=None):
        kubernetes.config.load_kube_config(self.kube_config_path)
        security_context = client.V1SecurityContext(
            capabilities=client.V1Capabilities(add=["NET_ADMIN"]))

        container = client.V1Container(
            security_context=security_context,
            args=args,
            image=image,
            name=cname,
            image_pull_policy=image_pull_policy,
            ports=ports,
            resources=client.V1ResourceRequirements(
                limits=limits,
            ))

        pod_spec = client.V1PodSpec(
            containers=[container],
            node_selector=node_selector,
            hostname=hostname,
            restart_policy=restart_policy,
            service_account_name=self.config.SERVICE_ACCOUNT_NAME)

        return pod_spec



    def createStorage(self):
        kubernetes.config.load_kube_config(self.kube_config_path)
        v1 = client.CoreV1Api()
        svc_response = self.createService({"name": "storage"}, "storage", 8082, 30001)
        if self.is_service_pod_deployed({"name": "storage"}):
            return False, svc_response
        pod_spec = self.getPodSpec(
            cname="storage",
            image=self.config.STORAGE_IMAGE,
            hostname="storage-pod",
            args=[],
            ports=[client.V1ContainerPort(container_port=8082)],
            node_selector={"mlperf": "storage"}
        )
        pod = client.V1Pod(
            api_version="v1",
            kind="Pod",
            spec=pod_spec,
            metadata=client.V1ObjectMeta(
                name="storage-pod",
                labels={"name": "storage"}
            )
        )
        _ = v1.create_namespaced_pod("default", pod)
        return True, svc_response


    def createSUT(self, node_selectors, args, limits):
        kubernetes.config.load_kube_config(self.kube_config_path)
        v1 = client.CoreV1Api()
        svc_response = self.createService({"run": "sut"}, "sut", 8086, 30003)
        if self.is_service_pod_deployed({"name": "sut"}):
            _ = v1.delete_namespaced_pod(name="sut-pod", namespace="default")
            self.wait_service_pod(service_labels={"name": "sut"}, wait_for_up=False)
        node_selectors.update({"mlperf": "sut"})
        pod_spec = self.getPodSpec(
            cname="sut",
            image=self.config.SUT_IMAGE,
            hostname="sut-pod",
            args=args,
            ports=[client.V1ContainerPort(container_port=8086)],
            node_selector=node_selectors,
            limits=limits
         )
        pod = client.V1Pod(
            api_version="v1",
            kind="Pod",
            spec=pod_spec,
            metadata=client.V1ObjectMeta(
                name="sut-pod",
                labels={"name": "sut", "run": "sut"}
            )
        )
        _ = v1.create_namespaced_pod("default", pod)
        return True, svc_response

    def createCIFSS(self):
        kubernetes.config.load_kube_config(self.kube_config_path)
        v1 = client.CoreV1Api()
        svc_response = self.createService({"name": "cifss"}, "cifss", 5000, 30002)
        if self.is_service_pod_deployed({"name": "cifss"}):
            return False, svc_response
        pod_spec = self.getPodSpec(
            cname="cifss",
            image=self.config.CIFSS_IMAGE,
            hostname="cifss-pod",
            args=[],
            ports=[client.V1ContainerPort(container_port=5000)],
            node_selector={"mlperf": "storage"}
        )

        pod = client.V1Pod(
            api_version="v1",
            kind="Pod",
            spec=pod_spec,
            metadata=client.V1ObjectMeta(
                name="cifss-pod",
                labels={"name": "cifss"}
            )
        )
        _ = v1.create_namespaced_pod("default", pod)
        return True, svc_response


    def createLGJob(self, eid, selector, args) -> str:
        kubernetes.config.load_kube_config(self.kube_config_path)
        args_full = [eid, selector]
        args_full.extend(args)
        assert(isinstance(selector, str))
        pod_spec = self.getPodSpec(
            cname="lg",
            image=self.config.LOADGEN_IMAGE,
            args=args_full,
            node_selector={"mlperf": "lg"},
            )

        template = client.V1JobTemplateSpec(spec=pod_spec)

        job_spec = client.V1JobSpec(
            ttl_seconds_after_finished=10,
            template=template)

        job = client.V1Job(
            spec=job_spec,
            api_version="batch/v1",
            kind="Job",
            metadata=client.V1ObjectMeta(
                labels={"name": "lg"}, name=selector))
        v1 = client.BatchV1Api()
        res = v1.create_namespaced_job("default", job)
        return res

    def createLGService(self, args):
        kubernetes.config.load_kube_config(self.kube_config_path)
        v1 = client.CoreV1Api()
        svc_response = self.createService({"name": "lgserver"}, "lgservice", 8088, 30004)
        pod_status = self.is_service_pod_deployed({"name": "lgserver"})
        if pod_status is not None:
            if pod_status == "Running":
                requests.post(url=f"http://{self.config.LOADGEN_SERVER}/stop")
            _ = v1.delete_namespaced_pod(name="lg-pod", namespace="default")
            self.wait_service_pod(service_labels={"name": "lgserver"}, wait_for_up=False)
        if self.is_service_pod_deployed({"name": "lgserver"}):
            return False, svc_response
        pod_spec = self.getPodSpec(
            cname="lgserver",
            image=self.config.LOADGEN_SERVER_IMAGE,
            hostname="lgserver",
            args=args,
            ports=[client.V1ContainerPort(container_port=8088)],
            node_selector={"mlperf": "lg"}
        )

        pod = client.V1Pod(
            api_version="v1",
            kind="Pod",
            spec=pod_spec,
            metadata=client.V1ObjectMeta(
                name="lg-pod",
                labels={"name": "lgserver"}
            )
        )
        _ = v1.create_namespaced_pod("default", pod)
        return True, svc_response

    def createLGServiceJob(self, args_dict):
        kubernetes.config.load_kube_config(self.kube_config_path)
        res = requests.post(f"http://{self.config.LOADGEN_SERVER}/run_expriement", json=args_dict)
        if res.status_code == 200:
            return True, res.json()