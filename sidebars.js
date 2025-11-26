/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 This file is auto-generated from docs/SUMMARY.md
 Run 'node generate-sidebar.js' to regenerate
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
  {
    "type": "doc",
    "id": "README",
    "label": "Introduction"
  },
  {
    "type": "category",
    "label": "💡Concepts",
    "items": [
      {
        "type": "doc",
        "id": "concepts/evsrc/README",
        "label": "Event Sourcing & CQRS"
      },
      {
        "type": "category",
        "label": "📁Editions (deprecated)",
        "items": [
          {
            "type": "doc",
            "id": "concepts/editions/ce",
            "label": "Community Edition"
          },
          {
            "type": "doc",
            "id": "concepts/editions/se",
            "label": "Standart Edition"
          },
          {
            "type": "doc",
            "id": "concepts/editions/se1",
            "label": "Standart Edition (v1)"
          }
        ],
        "collapsed": true
      }
    ],
    "collapsible": false,
    "className": "sidebar-section-header"
  },
  {
    "type": "category",
    "label": "🚀Server",
    "items": [
      {
        "type": "doc",
        "id": "server/README",
        "label": "Overview (Server)"
      },
      {
        "type": "category",
        "label": "📁Arhitecture",
        "items": [
          {
            "type": "doc",
            "id": "server/design/vvm",
            "label": "VVM"
          },
          {
            "type": "doc",
            "id": "server/design/orch",
            "label": "Orchestration"
          },
          {
            "type": "doc",
            "id": "server/design/sequences",
            "label": "Sequences"
          },
          {
            "type": "doc",
            "id": "server/design/qp",
            "label": "Query Processor"
          },
          {
            "type": "doc",
            "id": "server/design/n10n",
            "label": "Notifications Processor"
          },
          {
            "type": "doc",
            "id": "server/design/consistency-coordinator",
            "label": "Consistency Coordinator"
          },
          {
            "type": "doc",
            "id": "server/design/agw",
            "label": "API Gateway"
          },
          {
            "type": "doc",
            "id": "server/design/c2.n1",
            "label": "N1 Cluster"
          },
          {
            "type": "doc",
            "id": "server/design/c2.n3",
            "label": "N3 Cluster"
          },
          {
            "type": "doc",
            "id": "server/design/c2.n5",
            "label": "N5 Cluster"
          },
          {
            "type": "category",
            "label": "📁Packages overview",
            "items": [
              {
                "type": "doc",
                "id": "server/design/pkgsys",
                "label": "sys"
              },
              {
                "type": "doc",
                "id": "server/design/pkgregistry",
                "label": "registry"
              }
            ],
            "collapsed": true
          }
        ],
        "collapsed": true
      },
      {
        "type": "category",
        "label": "📁Features",
        "items": [
          {
            "type": "category",
            "label": "📁API Gateway",
            "items": [
              {
                "type": "doc",
                "id": "server/apiv2/README",
                "label": "API v2"
              },
              {
                "type": "category",
                "label": "📁Conventions",
                "items": [
                  {
                    "type": "doc",
                    "id": "server/apiv2/api-url",
                    "label": "API URL"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/http-methods-and-processors",
                    "label": "HTTP methods and processors"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/naming-conventions",
                    "label": "Naming conventions"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/query-constraints",
                    "label": "Query constraints"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/errors",
                    "label": "Error handling"
                  }
                ],
                "collapsed": true
              },
              {
                "type": "category",
                "label": "📁Documents and records",
                "items": [
                  {
                    "type": "doc",
                    "id": "server/apiv2/create-doc",
                    "label": "Create document or record"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/update-doc",
                    "label": "Update document or record"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/deactivate-doc",
                    "label": "Deactivate document or record"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/read-doc",
                    "label": "Read document or record"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/read-cdocs",
                    "label": "Read from CDoc collection"
                  }
                ],
                "collapsed": true
              },
              {
                "type": "category",
                "label": "📁Queries",
                "items": [
                  {
                    "type": "doc",
                    "id": "server/apiv2/read-from-query",
                    "label": "Read from query"
                  }
                ],
                "collapsed": true
              },
              {
                "type": "category",
                "label": "📁Views",
                "items": [
                  {
                    "type": "doc",
                    "id": "server/apiv2/read-from-view",
                    "label": "Read from view"
                  }
                ],
                "collapsed": true
              },
              {
                "type": "category",
                "label": "📁Commands",
                "items": [
                  {
                    "type": "doc",
                    "id": "server/apiv2/execute-command",
                    "label": "Execute command"
                  }
                ],
                "collapsed": true
              },
              {
                "type": "category",
                "label": "📁BLOBs",
                "items": [
                  {
                    "type": "doc",
                    "id": "server/apiv2/create-blob",
                    "label": "Create BLOB"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/read-blob",
                    "label": "Read BLOB"
                  }
                ],
                "collapsed": true
              },
              {
                "type": "category",
                "label": "📁Temporary BLOBs",
                "items": [
                  {
                    "type": "doc",
                    "id": "server/apiv2/create-tblob",
                    "label": "Create temporary BLOB"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/read-tblob",
                    "label": "Read temporary BLOB"
                  }
                ],
                "collapsed": true
              },
              {
                "type": "category",
                "label": "📁Schemas",
                "items": [
                  {
                    "type": "doc",
                    "id": "server/apiv2/list-app-workspaces",
                    "label": "List app workspaces"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/list-ws-roles",
                    "label": "List workspace roles"
                  },
                  {
                    "type": "doc",
                    "id": "server/apiv2/read-ws-role-schema",
                    "label": "Read workspace role schema"
                  }
                ],
                "collapsed": true
              },
              {
                "type": "doc",
                "id": "server/api-gateway",
                "label": "API v1"
              },
              {
                "type": "doc",
                "id": "server/api-conventions",
                "label": "API Conventions"
              },
              {
                "type": "doc",
                "id": "server/blobs/blobs0",
                "label": "BLOBs"
              }
            ],
            "collapsed": true
          },
          {
            "type": "doc",
            "id": "server/admin-endpoint",
            "label": "Admin Endpoint"
          },
          {
            "type": "doc",
            "id": "server/clusters/README",
            "label": "Clusters"
          },
          {
            "type": "doc",
            "id": "server/clusters/bootstrap",
            "label": "Bootstrap"
          },
          {
            "type": "doc",
            "id": "server/mon",
            "label": "Monitoring"
          },
          {
            "type": "doc",
            "id": "server/secure-prometheus-grafana",
            "label": "Secure prometheus and grafana"
          },
          {
            "type": "doc",
            "id": "server/alerting",
            "label": "Alerting"
          },
          {
            "type": "category",
            "label": "📁Maintenance",
            "items": [
              {
                "type": "doc",
                "id": "server/clusters/select-update",
                "label": "SELECT, UPDATE"
              }
            ],
            "collapsed": true
          },
          {
            "type": "category",
            "label": "📁Applications",
            "items": [
              {
                "type": "doc",
                "id": "server/apps/deploy-app",
                "label": "Deploy Application"
              },
              {
                "type": "doc",
                "id": "server/sidecarapps",
                "label": "Sidecar Applications"
              }
            ],
            "collapsed": true
          },
          {
            "type": "doc",
            "id": "server/authnz/README",
            "label": "AuthNZ"
          },
          {
            "type": "doc",
            "id": "server/authnz/login",
            "label": "Issue Principal Token"
          },
          {
            "type": "doc",
            "id": "server/authnz/refresh",
            "label": "Refresh Principal Token"
          },
          {
            "type": "doc",
            "id": "server/authnz/enrich-token",
            "label": "Enrich Principal Token"
          },
          {
            "type": "doc",
            "id": "server/authnz/aclrules",
            "label": "ACL Rules"
          },
          {
            "type": "doc",
            "id": "server/authnz/groles",
            "label": "Global Roles"
          },
          {
            "type": "category",
            "label": "📁Data types",
            "items": [
              {
                "type": "doc",
                "id": "server/vsql/types",
                "label": "Core types"
              },
              {
                "type": "doc",
                "id": "server/vsql/types-small",
                "label": "Small integers"
              },
              {
                "type": "doc",
                "id": "server/vsql/uniques-multi",
                "label": "Uniques With Multiple Fields"
              },
              {
                "type": "doc",
                "id": "server/vsql/ver-fields",
                "label": "Verifiable Fields"
              }
            ],
            "collapsed": true
          },
          {
            "type": "doc",
            "id": "server/blobs/blobs",
            "label": "BLOBs"
          },
          {
            "type": "doc",
            "id": "server/blobs/blobs0",
            "label": "BLOBs, first implementation"
          },
          {
            "type": "doc",
            "id": "server/views/README",
            "label": "Views"
          },
          {
            "type": "doc",
            "id": "server/views/declare-view",
            "label": "Declare view"
          },
          {
            "type": "doc",
            "id": "server/views/populate-view",
            "label": "Populate view"
          },
          {
            "type": "doc",
            "id": "server/apiv2/read-from-view",
            "label": "Read views using API"
          },
          {
            "type": "doc",
            "id": "server/views/read-view",
            "label": "Read views in extensions"
          },
          {
            "type": "doc",
            "id": "server/views/sync-views",
            "label": "Sync views"
          },
          {
            "type": "doc",
            "id": "server/workspaces/README",
            "label": "Workspaces"
          },
          {
            "type": "doc",
            "id": "server/workspaces/create-workspace-v2",
            "label": "Create Workspace"
          },
          {
            "type": "doc",
            "id": "server/workspaces/deactivate-workspace",
            "label": "Deactivate Workspace"
          },
          {
            "type": "doc",
            "id": "server/workspaces/workspaces-seealso",
            "label": "See also (Workspaces)"
          },
          {
            "type": "doc",
            "id": "server/invites/invites",
            "label": "Invites"
          },
          {
            "type": "doc",
            "id": "server/invites/invite-to-ws",
            "label": "Invite to Workspace"
          },
          {
            "type": "doc",
            "id": "server/invites/join-ws",
            "label": "Join Workspace"
          },
          {
            "type": "doc",
            "id": "server/invites/leave-ws",
            "label": "Leave Workspace"
          },
          {
            "type": "doc",
            "id": "server/invites/cancel-sent-invite",
            "label": "Cancel sent Invite"
          },
          {
            "type": "doc",
            "id": "server/invites/cancel-accepted-invite",
            "label": "Cancel accepted Invite"
          },
          {
            "type": "doc",
            "id": "server/invites/update-invite-roles",
            "label": "Update Invite roles"
          },
          {
            "type": "doc",
            "id": "server/users/users",
            "label": "Users"
          },
          {
            "type": "doc",
            "id": "server/users/users-create-user",
            "label": "Create new user"
          },
          {
            "type": "doc",
            "id": "server/users/users-change-password",
            "label": "Change password"
          },
          {
            "type": "doc",
            "id": "server/users/users-reset-password",
            "label": "Reset password"
          },
          {
            "type": "doc",
            "id": "server/users/users-emails",
            "label": "Email operations"
          },
          {
            "type": "doc",
            "id": "server/users/users-emails-send",
            "label": "Send Email"
          },
          {
            "type": "doc",
            "id": "server/users/users-emails-change",
            "label": "Change Email"
          },
          {
            "type": "doc",
            "id": "server/users/users-alias",
            "label": "Login alias"
          },
          {
            "type": "doc",
            "id": "server/users/users-seealso",
            "label": "See also (Users)"
          },
          {
            "type": "doc",
            "id": "server/n10n/n10n",
            "label": "Notifications"
          },
          {
            "type": "doc",
            "id": "server/n10n/create-channel",
            "label": "Create channel and subscribe"
          },
          {
            "type": "doc",
            "id": "server/n10n/add-subscription",
            "label": "Subscribe to an extra view"
          },
          {
            "type": "doc",
            "id": "server/n10n/unsubscribe",
            "label": "Unsubscribe from subscription"
          },
          {
            "type": "doc",
            "id": "server/n10n/heartbeats",
            "label": "Heartbeats"
          },
          {
            "type": "category",
            "label": "📁Devices",
            "items": [
              {
                "type": "doc",
                "id": "server/devices/create-device",
                "label": "Create new device"
              },
              {
                "type": "doc",
                "id": "server/devices/invite-device",
                "label": "Invite device to workspace"
              }
            ],
            "collapsed": true
          },
          {
            "type": "doc",
            "id": "server/jobs",
            "label": "Jobs"
          },
          {
            "type": "category",
            "label": "📁DMBS Drivers",
            "items": [
              {
                "type": "doc",
                "id": "server/amazondb-driver",
                "label": "AmazonDB Driver"
              },
              {
                "type": "doc",
                "id": "server/ephemeral-storage",
                "label": "Ephemeral Storage"
              },
              {
                "type": "doc",
                "id": "server/storage-extensions",
                "label": "Storage Extensions"
              }
            ],
            "collapsed": true
          }
        ],
        "collapsed": true
      }
    ],
    "collapsible": false,
    "className": "sidebar-section-header"
  },
  {
    "type": "category",
    "label": "🛠️Framework",
    "items": [
      {
        "type": "doc",
        "id": "framework/README",
        "label": "Overview (Framework)"
      },
      {
        "type": "category",
        "label": "📁Features",
        "items": [
          {
            "type": "doc",
            "id": "framework/vpm/README",
            "label": "vpm"
          },
          {
            "type": "doc",
            "id": "framework/vpm/init",
            "label": "vpm init"
          },
          {
            "type": "doc",
            "id": "framework/vpm/tidy",
            "label": "vpm tidy"
          },
          {
            "type": "doc",
            "id": "framework/vpm/baseline",
            "label": "vpm baseline"
          },
          {
            "type": "doc",
            "id": "framework/vpm/orm",
            "label": "vpm orm"
          },
          {
            "type": "doc",
            "id": "framework/vpm/build",
            "label": "vpm build"
          },
          {
            "type": "doc",
            "id": "framework/api-testing",
            "label": "API for testing"
          }
        ],
        "collapsed": true
      }
    ],
    "collapsible": false,
    "className": "sidebar-section-header"
  },
  {
    "type": "category",
    "label": "Development",
    "items": [
      {
        "type": "doc",
        "id": "reqman/README",
        "label": "Requirements Management"
      },
      {
        "type": "doc",
        "id": "reqman/reqs-overview",
        "label": "Requirements Management (Overview)"
      }
    ],
    "collapsible": false,
    "className": "sidebar-section-header"
  }
],
};

module.exports = sidebars;
