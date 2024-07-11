# vpm baseline
usage: `vpm baseline <output baseline folder>`

## structure of the result
- 📁\<baseline folder\>
  - 📁pkg
    - 📁\<full path of each repository\>
      - 📁<\folder path to .vsql files within the repository\> 
        - \<.vsq files\>
    - 📁sys
      - \<sys .vsql files\>
  - baseline.json 

    - 
    
### example
- 📁baseline
  - 📁pkg 
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
  - baseline.json
             
