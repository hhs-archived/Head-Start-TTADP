System Boundary Diagram
=======================

![rendered boundary diagram](http://www.plantuml.com/plantuml/png/dLPVRnit37_Ff-3oKAH04sDfNpOCGvtOJJCagvjpsvS2WIpHjXQTf8gI7MFeTvyedo--NBCM1HAVJaV--AF4FtnDKOIOQdFmYxRI98MmZD7JxuD14EkJXOxBD4k4GJeRqSOJwUg1K44BkpB9fy7vg-E94JP-kBuQ616HOjwwFS_IGbiC9vwneuu6OJeTGbLdS_0spM3cabKYR62bSNqmmK3E7ldoi6XUmE63w0V2S9XtXXRGgcEc0suESVa8y_3v3aVX2etBQ1sSqMxtiBEzog0kGAj38Ao2Y-brnZjhM1w9DJ63JnLSkDMvSKaTFeT_3m1Q2ScR2xVAOcLvajUD342reOZrxVW-CjAjCBDzCJ1EgEEPCCBApAunDBmwomowsgsLM-5r1s8ukVmVwU1IBAVnnpCZDXZeJtXGtNuajbiyWpViKzX0368-rn88mqfBRF0VpYIw6NELCg3IKKJjRFkrTHsWZOQZzNgTYViEZsvOVC8P3BqtMXOuvlItK_XNzGB6zpuWvMkuGI4ZVnbfyXbcUs7I6OCoKW5K8eeJk4ucQcyGjAN8PqiGahNQBh8hFMukt65ew3qYLJuznUii6SFl4mnp5sgO2Nct27mCm9XChl017vn4ec-RbqRKWeFdZJO894NXMQwrt8keXnzvTMaZ1YiCY0SsaEq-g9JyI9vZYlg6HhDo2sh6Z1t5HS3g_HMCCi6P8Dm5tyseucMZHj3aVtFITguNARIsUsdOjub6KDIIK0IvpC3Z_VUTqTvcQrvaetu3RjuIIOIgsDvAi-FVPy6Uqyl6MlKIPadUOJniDtXLHHUGW3YU9SpvDWGHngVFagEVgyCDFtidsJWbvB9ilK-Oa1tP2vD_t8mWkcsuEDiO-dh0_ryFjlbyzBOQLrcV7uLczjWWL7fXuPtzRA_V366b1KnrZSTdWb1nl88BCBdy2584zJbBLIu5MSnV164ZOg6xN-WM96v92E98H7Kpl9uS2--3MsN0IeYgv7Mdo5XS1pHQSahW6cvulRiyRPDB1DVEwkX2YVpiKHRPBz5x0DV2YWM2twOIfomy0-CMYwpAcAKvmSLuEfYyg_BFX-bWDBuQJyTmzEhLo-SPdR7RChE77D2x40aY6gmnXWt3HUaxYdlzvw5CruLJMrP-Z8Pr4I7enJA2is2qlJiO6WEIqINd3O52hsL41I8We9LXu_bjhUCIfbSL_7fo2iaQ908NbnZMcX0OLvqSe5LboQpRgDxldigjBLU09e1Z579PeutKeTznllMutpLySFUQgoT-IKYHVlmgUbZjtVmyQATKjtMJwnyLT_UG60MEVdj2jqcfW35eN66R4xrhxaVNdhf8SOcMKpmYGMg6bNV3l7tQZwj6QOL1ppUW5Ml6JT_trkIPxXXjYtT0eMYm3fgjCcF2206b2ueOpjCNqwgtNlyCGfy0HrjVVLURMNVb9Q1LtcaRUon-6gP7P5TwqUOOIaXSIi6B86hSZJH5v165Fe32RmB0CqW-aseQGleEukCkHsbMwzXspzAlj5LutvIpZdp_g9-2orI3HcAu9bRxK6r1Rmej9_-ki9zV3iv7CD4UZRROh-ZRiJyBNkZ8hPJRpjlgcBq8F6Nn2A0GkAIIZew7lIw0r44Qb9fjbUNvvQEEm6FCefaWgdQyxBM6biaapOocPJ7CKFa3K7u_EZrjyh9blM_SrRMEi7JkZikbdlEfxHX1T12IXUrf-FOq2jW3oAE9UuJUk4rd-if_bAH4edao3Lm6paXNOdCxUjHLjhitfPyt6w_HgbIR_m00)

UML Source
----------

```
@startuml
!include https://raw.githubusercontent.com/adrianvlupu/C4-PlantUML/latest/C4_Container.puml
title TTA Smart Hub boundary view
Person(personnel, "Smart Hub User", "An end-user of the TTA Smart Hub")
Person(developer, "Smart Hub Developer", "Smart Hub vendor developers and GTM")
Boundary(aws, "AWS GovCloud") {
  Boundary(cloudgov, "cloud.gov") {
    System_Ext(aws_alb, "cloud.gov load-balancer", "AWS ALB")
    System_Ext(cloudgov_api, "cloud.gov API")
    System_Ext(cloudgov_router, "<&layers> cloud.gov routers", "Cloud Foundry traffic service")
    Boundary(atob, "Accreditation Boundary") {
      Container(www_app, "<&layers> TTA Smart Hub Web Application", "NodeJS, Express, React", "Displays and collects TTA data. Multiple instances running")
      Container(worker_app, "TTA Smart Hub Worker Application", "NodeJS, Bull", "Perform background work and data processing")
      Container(clamav, "File scanning API", "ClamAV", "Internal application for scanning user uploads")
      ContainerDb(www_db, "PostgreSQL Database", "AWS RDS", "Contains content and configuration for TTA Smart Hub")
      ContainerDb(elasticsearch, "Elasticsearch", "AWS Elasticsearch", "Contains a copy of content used for searching TTA Smart Hub")
      ContainerDb(www_s3, "AWS S3 bucket", "AWS S3", "Stores static file assets")
      ContainerDb(www_redis, "Redis Database", "AWS Elasticache", "Queue of background jobs to work on")
    }
  }
}
System(HSES, "HSES", "Single Sign On\nMFA via Time-Based App or PIV card\n\nSource of Grantee Data")
Boundary(gsa_saas, "FedRAMP-approved SaaS") {
  System_Ext(newrelic, "New Relic", "Continuous Monitoring")
}
Rel(developer, newrelic, "Manage performance & logging", "https GET/POST/PUT/DELETE (443)")
Rel(www_app, newrelic, "reports telemetry", "tcp (443)")
Rel(personnel, aws_alb, "manage TTA data", "https GET/POST/PUT/DELETE (443)")
note right on link
All connections depicted are encrypted with TLS 1.2 unless otherwise noted.
end note
Rel(www_s3, personnel, "download file attachments", "https GET (443)")
Rel(aws_alb, cloudgov_router, "proxies requests", "https GET/POST/PUT/DELETE (443)")
Rel(cloudgov_router, www_app, "proxies requests", "https GET/POST/PUT/DELETE (443)")
Rel(worker_app, clamav, "scans files", "https POST (9443)")
Rel(worker_app, HSES, "retrieve Grantee data", "https GET (443)")
Rel(www_app, HSES, "authenticates user", "OAuth2")
Rel(personnel, HSES, "verify identity", "https GET/POST (443)")
BiRel(www_app, www_db, "reads/writes dataset records", "psql")
BiRel(worker_app, www_db, "reads/writes dataset records", "psql")
BiRel(www_app, www_s3, "reads/writes data content", "vpc endpoint")
BiRel(worker_app, www_s3, "reads/writes data content", "vpc endpoint")
Rel(www_app, www_redis, "enqueues job parameters", "redis")
BiRel(worker_app, www_redis, "dequeues job parameters & updates status", "redis")
BiRel(worker_app, elasticsearch, "submits content for indexing", "elasticsearch")
BiRel(www_app, elasticsearch, "submits queries for data", "elasticsearch")
Boundary(development_saas, "CI/CD Pipeline") {
  System_Ext(github, "GitHub", "HHS-controlled code repository")
  System_Ext(circleci, "CircleCI", "Continuous Integration Service")
}
Rel(developer, github, "Publish code", "git ssh (22)")
Rel(github, circleci, "Commit hook notifies CircleCI to run CI/CD pipeline")
Rel(circleci, cloudgov_api, "Deploy application on successful CI/CD run")
Lay_D(personnel, aws)
Lay_R(HSES, aws)
@enduml
```

Instructions
------------

1. [Edit this diagram with plantuml.com](http://www.plantuml.com/plantuml/uml/dLPVRnit37_Ff-3oKAH04sDfNpOCGvtOJJCagvjpsvS2WIpHjXQTf8gI7MFeTvyedo--NBCM1HAVJaV--AF4FtnDKOIOQdFmYxRI98MmZD7JxuD14EkJXOxBD4k4GJeRqSOJwUg1K44BkpB9fy7vg-E94JP-kBuQ616HOjwwFS_IGbiC9vwneuu6OJeTGbLdS_0spM3cabKYR62bSNqmmK3E7ldoi6XUmE63w0V2S9XtXXRGgcEc0suESVa8y_3v3aVX2etBQ1sSqMxtiBEzog0kGAj38Ao2Y-brnZjhM1w9DJ63JnLSkDMvSKaTFeT_3m1Q2ScR2xVAOcLvajUD342reOZrxVW-CjAjCBDzCJ1EgEEPCCBApAunDBmwomowsgsLM-5r1s8ukVmVwU1IBAVnnpCZDXZeJtXGtNuajbiyWpViKzX0368-rn88mqfBRF0VpYIw6NELCg3IKKJjRFkrTHsWZOQZzNgTYViEZsvOVC8P3BqtMXOuvlItK_XNzGB6zpuWvMkuGI4ZVnbfyXbcUs7I6OCoKW5K8eeJk4ucQcyGjAN8PqiGahNQBh8hFMukt65ew3qYLJuznUii6SFl4mnp5sgO2Nct27mCm9XChl017vn4ec-RbqRKWeFdZJO894NXMQwrt8keXnzvTMaZ1YiCY0SsaEq-g9JyI9vZYlg6HhDo2sh6Z1t5HS3g_HMCCi6P8Dm5tyseucMZHj3aVtFITguNARIsUsdOjub6KDIIK0IvpC3Z_VUTqTvcQrvaetu3RjuIIOIgsDvAi-FVPy6Uqyl6MlKIPadUOJniDtXLHHUGW3YU9SpvDWGHngVFagEVgyCDFtidsJWbvB9ilK-Oa1tP2vD_t8mWkcsuEDiO-dh0_ryFjlbyzBOQLrcV7uLczjWWL7fXuPtzRA_V366b1KnrZSTdWb1nl88BCBdy2584zJbBLIu5MSnV164ZOg6xN-WM96v92E98H7Kpl9uS2--3MsN0IeYgv7Mdo5XS1pHQSahW6cvulRiyRPDB1DVEwkX2YVpiKHRPBz5x0DV2YWM2twOIfomy0-CMYwpAcAKvmSLuEfYyg_BFX-bWDBuQJyTmzEhLo-SPdR7RChE77D2x40aY6gmnXWt3HUaxYdlzvw5CruLJMrP-Z8Pr4I7enJA2is2qlJiO6WEIqINd3O52hsL41I8We9LXu_bjhUCIfbSL_7fo2iaQ908NbnZMcX0OLvqSe5LboQpRgDxldigjBLU09e1Z579PeutKeTznllMutpLySFUQgoT-IKYHVlmgUbZjtVmyQATKjtMJwnyLT_UG60MEVdj2jqcfW35eN66R4xrhxaVNdhf8SOcMKpmYGMg6bNV3l7tQZwj6QOL1ppUW5Ml6JT_trkIPxXXjYtT0eMYm3fgjCcF2206b2ueOpjCNqwgtNlyCGfy0HrjVVLURMNVb9Q1LtcaRUon-6gP7P5TwqUOOIaXSIi6B86hSZJH5v165Fe32RmB0CqW-aseQGleEukCkHsbMwzXspzAlj5LutvIpZdp_g9-2orI3HcAu9bRxK6r1Rmej9_-ki9zV3iv7CD4UZRROh-ZRiJyBNkZ8hPJRpjlgcBq8F6Nn2A0GkAIIZew7lIw0r44Qb9fjbUNvvQEEm6FCefaWgdQyxBM6biaapOocPJ7CKFa3K7u_EZrjyh9blM_SrRMEi7JkZikbdlEfxHX1T12IXUrf-FOq2jW3oAE9UuJUk4rd-if_bAH4edao3Lm6paXNOdCxUjHLjhitfPyt6w_HgbIR_m00)
1. Copy and paste the final UML into the UML Source section
1. Update the img src and edit link target to the current values

### Notes

* See the help docs for [C4 variant of PlantUML](https://github.com/RicardoNiepel/C4-PlantUML) for syntax help.
