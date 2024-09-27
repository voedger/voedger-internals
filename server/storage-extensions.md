# State Storage Extensions

- [GitHub Issue #2366](https://github.com/voedger/voedger/issues/2366)

We have a number of built-in state storages, but there should be a way to extend the state storage capabilities:
- [Ephemeral Storage](https://github.com/voedger/voedger-internals/blob/main/server/ephemeral-storage.md)

## Analysis

Currently, we can load storage as a Go plugin. There are two approaches:

1. Load plugins when Voedger starts (Sidecar Storage Extensions)
2. Load plugins as a part of the application (Per-app Storage Extensions)

|                             | Sidecar Storage Extensions | Per-app Storage Extensions |
|-----------------------------|----------------------------|----------------------------|
| More stable                 | Yes 👍                     | No                         |
| More memory problems        | No 👍                      | Yes                        |
| Upgradable                  | No                         | Yes 👍                     |
| Easy to operate             | No                         | Yes 👍                     |
| Easy to develop             | No                         | Yes 👍                     |

We will start with the Per-app Storage Extensions approach since it is easier to implement. Sidecar Storage Extensions' advantages matter when we host a lot of applications and do not want them to provide their own storage extensions (storage extensions are unsafe).

## Principles

- State Storage Extension is deployed as a part of an Application Image
- State Storage Extension is a Go plugin
  - Plugins are currently supported only on Linux, FreeBSD, and macOS
  - If a Storage Extension is updated, some resources related to the previous instance are wasted
  - Multiple versions of a Storage Extension can be instantiated
  - Storage must have a `Free()` method that is called when a storage instance is not needed anymore
  - Storage must have an `ILogger` interface as an input parameter
- Package, development structure:
  - 📂package folder
    - 📂wasm
      - .go files
    - 📂storages
      - .go files
    - .vsql files
- App Image structure:
  - 📂package folder
    - .vsql files
    - pkg.wasm
    - `storages-$version.so` // multiple storages
- App Partition deployment
  - `storages-$version.so` is copied (if needed) to some internal `storages` folder and loaded from there
- IAppPartition.Storage(FullQName) state.IStateStorage
  - // Created during app deployment from iextrowstorage.IRowStorage by appparts.NewIStateStorage(appdef IAppDef, iextrowstorage.IRowStorage)
  - // appdef is needed for typechecking
- pkg/iextsse // State Storage Extensions
  - 📂goplugin
  - IStateStorage

## Principles: Configuration

📂pkg/air:
```sql

PARAMETER Ephemeral_PartitionMaxSize int DEFAULT 50_000_000

STATESTORAGE ENGINE BUILTIN (

  Ephemeral (
    GET         SCOPE(COMMAND, QUERY, PROJECTOR, JOB),
    INSERT      SCOPE(COMMAND, QUERY, PROJECTOR, JOB),
    UPDATE      SCOPE(COMMAND, QUERY, PROJECTOR, JOB),
  ) WITH JSONCONFIG=` 
      {
        "LRUCaches": {
          "Cache1": {
            "PartitionMaxSize": $Ephemeral_PartitionMaxSize
          },
          "Cache2": {
            "PartitionMaxSize": 50000000
          }
        }
      }
`;
);
```

📂pkg/scada:
```sql

PARAMETER SCADA_URL text DEFAULT "127.0.0.1:8765"
SECRET SCADA_Password DEFAULT "0123"

STATESTORAGE ENGINE GOPLUGIN (
  SCADA (
    GET         SCOPE(COMMAND, QUERY, PROJECTOR, JOB),
    INSERT      SCOPE(COMMAND, QUERY, PROJECTOR, JOB),
    UPDATE      SCOPE(COMMAND, QUERY, PROJECTOR, JOB),
  ) WITH JSONCONFIG=` 
      {
        "URL": "$SCADA_URL"
        "Password": "$SCADA_Password"
      }
`;
);
```

Application Deployment Descriptor:
```json
{
  "NumPartitions":100,
  "NumAppWorkspaces":10,
  "PackageConfigs": {
    "air":{
      "Ephemeral_PartitionMaxSize":1000000
    },
    "scada":{
      "SCADA_URL":"https://myscadaurl.io",
      // "SCADA_PASSWORD" is not specified here, will be taken from a result of `ctool secret put`

    }
  }
}
```

ctool: create or update the secret:
```bash
ctool secret put company.scadaapp.scada.SCADA_Password <password-value>
```
The secret value will be visible by an application partition the next time the application partition is deployed.



## Functional design

### Ephemeral storage

vsql:
```
STATESTORAGE ENGINE BUILTIN (
  EphemeralBills
  
)
STATESTORAGE ENGINE GOPLUGIN (
    STORAGE Http (
        READ SCOPE(QUERIES, PROJECTORS, JOBS)
    );
)
```

Purpose. Store

- Developer prepares an app image with the storages-2.so
- DevOps deploys the image
- Server


## Technical design

- https://github.com/voedger/voedger/blob/main/pkg/iextsse/README.md

## Context

- [sys/sys.vsql](https://github.com/voedger/voedger/blob/d0431125a0aa7b42060fe85bf6aa21872cba4d26/pkg/sys/sys.vsql)


## Research: swarm secrets

Summary:
- Create the secret using docker secret create.
- Reference the secret in your docker-compose.yml.
- Access the secret within the container at /run/secrets/<secret_name>.
- Deploy or update your stack with docker stack deploy.


Update secret
```bash
 docker service update \
     --secret-add source=mysql_password,target=old_mysql_password \
     --secret-add source=mysql_password_v2,target=mysql_password \
     mysql
```     

External secrets:
```yml
version: "3.8"

services:
  my_service:
    image: my_image:latest
    secrets:
      - my_secret_1
      - my_secret_2
      - my_secret_3

secrets:
  my_secret_1:
    external: true
  my_secret_2:
    external: true
  my_secret_3:
    external: true
```

File secrets:
```yml
version: "3.8"

services:
  my_service:
    image: my_image:latest
    secrets:
      - my_secret_1
      - my_secret_2

secrets:
  my_secret_1:
    file: ./secrets/my_secret_1.txt  # Define the source of the secret
  my_secret_2:
    file: ./secrets/my_secret_2.txt  # Another secret from a file
```


Embedded secrets:
```yml
version: "3.8"

services:
  my_service:
    image: my_image:latest
    secrets:
      - my_secret_1

secrets:
  my_secret_1:
    data: |
      my_super_secret_data
```

## Research: Storing secrets securely in a key-value (KV) database

Storing secrets securely in a key-value (KV) database requires careful planning to ensure confidentiality, integrity, and availability. Below are key principles to follow for securely managing secrets in a KV database:

### 1. **Encryption at Rest and in Transit**
   - **Encryption at Rest**: Store all secrets in the KV database using strong encryption algorithms, such as **AES-256**. This ensures that even if the database is compromised, the raw secrets cannot be read without the encryption key.
   - **Encryption in Transit**: Always use secure communication protocols (e.g., **TLS/SSL**) when transmitting secrets to and from the database to prevent eavesdropping or man-in-the-middle attacks.

   - **Key Management**: Use a dedicated key management system (KMS), such as **AWS KMS**, **HashiCorp Vault**, or **Azure Key Vault**, to manage the encryption keys. Regularly rotate keys to reduce the risk of key exposure.

### 2. **Access Control and Authentication**
   - **Role-Based Access Control (RBAC)**: Implement fine-grained access control to ensure that only authorized services and users can read, write, or manage secrets. Assign minimal privileges using the principle of **least privilege**.
   - **Multi-factor Authentication (MFA)**: Require multi-factor authentication for access to critical systems that manage or access the secrets.
   - **Service Authentication**: Use **mutual TLS** or strong authentication mechanisms like **OAuth2** or **API tokens** for services accessing the secrets.

### 3. **Auditing and Monitoring**
   - **Audit Logs**: Enable comprehensive logging to track access to the secrets. This includes both read and write operations. Logs should be stored securely and monitored for suspicious activities.
   - **Real-time Monitoring**: Use intrusion detection systems (IDS) and set up alerts for abnormal patterns, such as unauthorized access attempts or access from unexpected locations.

### 4. **Versioning and Rotation**
   - **Versioning**: Keep multiple versions of secrets to support rollback in case a newly rotated secret causes an issue. The KV database should support versioning of secrets.
   - **Automatic Secret Rotation**: Implement regular secret rotation to minimize exposure risk. This can be automated using tools like **AWS Secrets Manager** or **HashiCorp Vault**, which can automatically rotate and update secrets in dependent systems.

### 5. **Limit Secret Exposure**
   - **Short-Lived Secrets**: Whenever possible, use short-lived tokens or temporary credentials (e.g., **AWS IAM roles** or **OAuth2 tokens**) to minimize the risk of long-term compromise.
   - **Secret Caching**: Only cache secrets for short periods in memory, and avoid storing them on disk. Clear them from memory as soon as they are no longer needed.

### 6. **Data Masking and Tokenization**
   - For certain sensitive fields, consider using **data masking** or **tokenization** as additional protection. This can ensure that only authorized users or services can see the actual secrets.

### 7. **Environment Segregation**
   - Store and manage secrets separately for different environments (e.g., production, staging, development). Use environment-specific KV stores and access controls to reduce the risk of accidental leakage across environments.

### 8. **Regular Penetration Testing**
   - Perform regular penetration tests and security audits on the systems managing secrets. This helps identify potential vulnerabilities that could expose sensitive data.

### 9. **Backup Encryption**
   - If you back up the KV database, ensure that backups are also encrypted and securely stored. Access to backups should be restricted in the same way as the primary data store.

### 10. **Use Specialized Secret Management Solutions**
   - Whenever possible, use specialized secret management solutions like **HashiCorp Vault**, **AWS Secrets Manager**, or **Azure Key Vault**, which are designed to handle secrets securely, rather than general-purpose KV databases. These tools provide built-in encryption, access control, auditing, and secret rotation features.

### Example Tools:
- **HashiCorp Vault**: A widely-used tool that can act as a secure KV store for secrets. It provides encryption, fine-grained access control, dynamic secrets, and audit logging.
- **AWS Secrets Manager**: A cloud-based service that securely stores and manages access to secrets such as database credentials and API keys, with built-in rotation.
- **Azure Key Vault**: A service that provides centralized secret management for cloud applications, offering encryption, access control, and logging.

By following these principles, you can ensure that secrets stored in a KV database are secure, even in the face of potential threats.


### See also

- https://chatgpt.com/share/e/66f68145-a168-800d-9b3a-3e6e3258de54

## Research: Working with secrets in K8s

- https://chatgpt.com/share/e/66f686ac-7b10-800d-9ec7-bba5f8281c22

Kubernetes handles secrets with a focus on secure storage and controlled access to sensitive information. The design principles that govern how Kubernetes manages secrets are centered around confidentiality, integrity, availability, and ease of use. Here’s a breakdown of how Kubernetes keeps and reads secrets, along with the core design principles behind this system.

### **Design Principles for Secrets in Kubernetes**

1. **Separation of Concerns**  
   Kubernetes separates sensitive information (like passwords, API keys, or certificates) from application logic and deployment configurations. This prevents sensitive information from being embedded directly in application code or Pod specs, allowing more secure management and access control.

2. **Confidentiality and Encryption**  
   Secrets are designed to be confidential, and Kubernetes offers several mechanisms to keep them safe:

   - **Encryption at Rest**: Starting with Kubernetes 1.13 (December 3, 2018), it became possible to encrypt Secret data at rest within the etcd datastore. By default, Kubernetes stores secrets unencrypted in etcd, but administrators can configure encryption at rest for added security.
   - **Encryption at Transport**: Kubernetes uses TLS for communication between the API server and etcd, ensuring that secrets are encrypted in transit.

3. **Controlled Access Through Role-Based Access Control (RBAC)**  
   Kubernetes provides fine-grained control over which users or services can access secrets using **RBAC**. This ensures that only authorized users and services can view, create, or modify secrets.
   
   - **Namespace Scope**: Secrets are namespace-scoped, meaning they are accessible only within the same namespace unless explicitly shared across namespaces.

4. **Least Privilege Principle**  
   Access to secrets is controlled at the Pod level, and secrets are only exposed to applications that need them. Kubernetes follows the least privilege principle, meaning an application or service only gets access to the specific secret keys it needs (not the entire secret).

5. **Decoupling and Modularity**  
   Kubernetes decouples secrets from the applications using them. This design makes it easier to rotate or update secrets without needing to modify application code or redeploy the application itself.

### **How Kubernetes Stores and Reads Secrets**

1. **Storing Secrets**

   Secrets are stored as **base64-encoded** values in Kubernetes, which can be defined either via the `kubectl` CLI or in a YAML manifest. For example:

   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: my-secret
   type: Opaque
   data:
     username: dXNlcg==   # base64-encoded value
     password: cGFzc3dvcmQ= # base64-encoded value
   ```

   Secrets are stored in the etcd database, which is a distributed key-value store used by Kubernetes to hold the state of the cluster, including all configurations, resources, and secrets. **By default, secrets in etcd are not encrypted**, but encryption can be configured as mentioned earlier.

2. **Accessing Secrets by Pods**

   Secrets are consumed by Pods in one of two ways:
   
   - **As environment variables**: A secret can be injected into a Pod's environment variables. The values of the secret are exposed to the containerized application at runtime.
   
     Example:
     ```yaml
     env:
     - name: USERNAME
       valueFrom:
         secretKeyRef:
           name: my-secret
           key: username
     ```
   
   - **As mounted volumes**: Secrets can also be mounted as files in the Pod’s file system. This method is often preferred for sensitive data that doesn’t need to be passed as environment variables.

     Example:
     ```yaml
     volumeMounts:
     - name: secret-volume
       mountPath: "/etc/secret"
     
     volumes:
     - name: secret-volume
       secret:
         secretName: my-secret
     ```

   **Pod Lifecycle Integration**: When a Pod is scheduled on a node, the node's kubelet service retrieves the necessary secrets from the API server. These secrets are then either mounted or injected into the container's environment. The secret is never written to disk, and the node keeps it in memory while the Pod is running.

3. **Secret Changes and Propagation**

   Kubernetes does not automatically restart Pods when secrets are updated. However, if a secret is updated, a Pod that consumes it as a mounted volume will reflect the new secret data shortly after the update (typically within a few minutes). If the secret is injected as an environment variable, you will need to restart the Pod to apply the updated secret.

4. **Secret Lifecycle**

   Secrets in Kubernetes are treated as first-class resources, like Pods or ConfigMaps. They follow the same lifecycle and can be created, updated, or deleted independently of the applications that use them.

5. **Auditing and Logging**

   Kubernetes includes auditing capabilities that log access to secrets. This provides an audit trail of who accessed secrets and when, which is important for security compliance and monitoring. Logs can be integrated with external monitoring and logging systems.

### **Additional Security Considerations**

1. **Short-Lived Secrets**  
   Kubernetes supports the idea of rotating secrets by decoupling the secret management from the applications. For instance, administrators can create external processes or use tools like Vault to periodically update secrets without redeploying applications.

2. **Minimize Secret Exposure**  
   It is good practice to avoid exposing secrets unnecessarily by:
   - **Limiting environment variable use**: Prefer mounting secrets as files to reduce accidental exposure through logs or shell access.
   - **Using sidecar containers**: Use sidecars (e.g., a Vault sidecar) to dynamically retrieve and manage secrets without exposing them directly to the application Pod.

3. **Third-Party Secret Management Tools**  
   Kubernetes integrates well with external secret management tools like **HashiCorp Vault**, **AWS Secrets Manager**, or **Azure Key Vault**. These tools allow secrets to be managed externally and injected into Kubernetes as needed.

---

### **Summary of Design Principles**

- **Security-first**: Secrets are stored in base64 format, encrypted at rest (if configured), and transported over TLS.
- **Controlled Access**: Access to secrets is tightly controlled through RBAC and namespace boundaries.
- **Decoupling**: Secrets are decoupled from applications, ensuring easier updates and greater flexibility.
- **Confidentiality**: Secrets are never stored on disk and are made available in the Pod's memory space.
- **Least Privilege**: Only the secrets that a Pod or container needs are provided.

These principles help Kubernetes securely handle secrets while keeping the system flexible for administrators and developers.
