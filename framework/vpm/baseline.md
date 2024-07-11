# vpm baseline

## structure of the result
- 📁\<baseline folder\>
  - 📁\<full path of each repository\>
    - 📁<\folder path to .vsql files within the repository\> 
      - \<.vsq files\>
  - 📁sys
    - \<sys .vsql files
    
### example
- 📁baseline
  - 📁github.com
    - 📁voedger
      - 📁voedger
        - 📁pkg
          - 📁apps
            - 📁sys
              - 📁clusterapp
                - schema.vsql
  - 📁sys
    - sys.vsql
    - userprofile.vsql
    - workspace.vsql
           
