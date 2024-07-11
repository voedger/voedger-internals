# vpm baseline
usage: `vpm baseline <output baseline folder>`

## structure of the result
- 📁\<baseline folder\>
  - 📁pkg
    - 📁\<repo domain\>
      - 📁\<path elem1\>
        - 📁\<path elemN\> 
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
             
