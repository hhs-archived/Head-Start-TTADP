// Creator: Grafana k6 Browser Recorder 1.0.0

import { sleep, group } from 'k6'
import http from 'k6/http'

const isNumeric = (value) => /^\d+$/.test(value);

const default_vus = 10;

const target_vus_env = `${__ENV.TARGET_VUS}`;
const target_vus = isNumeric(target_vus_env) ? Number(target_vus_env) : default_vus;

export let options = {
  stages: [
      // Ramp-up from 1 to TARGET_VUS virtual users (VUs) in 5s
      { duration: "5s", target: target_vus },

      // Stay at rest on TARGET_VUS VUs for 10s
      { duration: "10s", target: target_vus },

      // Ramp-down from TARGET_VUS to 0 VUs for 5s
      { duration: "5s", target: 0 }
  ]
};
export default function main() {
  let response

  group('page_3 - http://frontend:3000/activity-reports?region.in[]=1', function () {
    response = http.get(
      'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-fCZMdeX3rg.woff2',
      {
        headers: {
          host: 'fonts.gstatic.com',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: 'application/font-woff2;q=1.0,application/font-woff;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'identity',
          origin: 'http://frontend:3000',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          referer: 'https://fonts.googleapis.com/',
          'sec-fetch-dest': 'font',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
        },
      }
    )
    response = http.get(
      'http://frontend:3000/static/media/9caa42f21e4ae090b755.9caa42f21e4ae090b755.woff2',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: 'application/font-woff2;q=1.0,application/font-woff;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'identity',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          referer: 'http://frontend:3000/',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'font',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
    response = http.get('http://frontend:3000/api/widgets/overview?region.in[]=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })
    response = http.get(
      'http://frontend:3000/api/activity-reports?sortBy=updatedAt&sortDir=desc&offset=0&limit=10&region.in[]=1',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          referer: 'http://frontend:3000/activity-reports',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'auth-impersonation-id': 'null',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
    response = http.get(
      'http://frontend:3000/api/activity-reports/alerts?sortBy=startDate&sortDir=desc&offset=0&limit=10&region.in[]=1',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          referer: 'http://frontend:3000/activity-reports?region.in[]=1',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'auth-impersonation-id': 'null',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
  })

  group('page_4 - http://frontend:3000/activity-reports/new/activity-summary', function () {
    response = http.get('http://frontend:3000/api/activity-reports/activity-recipients?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/new/activity-summary',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/users/collaborators?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/new/activity-summary',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/approvers?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/new/activity-summary',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/groups?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/new/activity-summary',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get(
      'http://frontend:3000/static/media/arrow-both.e178dbaf5fe4fdaf154fbadb7e15488b.svg',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: 'image/avif,image/webp,*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          referer: 'http://frontend:3000/activity-reports/new/activity-summary',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'image',
          'sec-fetch-mode': 'no-cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )

    response = http.post(
      'http://frontend:3000/api/activity-reports',
      '{"ECLKCResourcesUsed":[],"activityRecipientType":"recipient","activityRecipients":[{"value":10,"label":"Agency 1.a in region 1, Inc. - 01HP044444  - AIAN HS","name":"Agency 1.a in region 1, Inc. - 01HP044444  - AIAN HS","activityRecipientId":10}],"activityType":[],"additionalNotes":null,"files":[],"collaborators":[],"activityReportCollaborators":[{"value":1,"label":"Hermione Granger","roles":["System Specialist"],"user":{"fullName":"Hermione Granger","id":1}}],"context":"","deliveryMethod":"in-person","duration":0.5,"endDate":"02/08/2024","goals":[],"recipientNextSteps":[{"id":null,"note":""}],"recipients":[],"nonECLKCResourcesUsed":[],"numberOfParticipants":1,"objectivesWithoutGoals":[],"otherResources":[],"participantCategory":"","participants":["CEO / CFO / Executive"],"reason":["Below Competitive Threshold (CLASS)"],"requester":"recipient","specialistNextSteps":[{"id":null,"note":""}],"startDate":"02/07/2024","calculatedStatus":"draft","targetPopulations":["Preschool Children (ages 3-5)"],"topics":[],"approvers":[],"recipientGroup":null,"language":["English"],"creatorRole":"System Specialist","pageState":{"1":"Complete","2":"Not started","3":"Not started","4":"Not started"},"userId":1,"regionId":1,"version":2,"savedToStorageTime":"2024-02-06T22:47:40.209Z","createdInLocalStorage":"2024-02-06T22:47:40.209Z","ttaType":["training","technical-assistance"],"approverUserIds":[]}',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          referer: 'http://frontend:3000/activity-reports/new/activity-summary',
          'content-type': 'application/json',
          'auth-impersonation-id': 'null',
          origin: 'http://frontend:3000',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
  })

  group('page_6 - http://frontend:3000/activity-reports/10002/goals-objectives', function () {
    response = http.get('http://frontend:3000/api/activity-reports/10002', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/10002', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/activity-recipients?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/users/collaborators?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/approvers?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/groups?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/activity-recipients?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/users/collaborators?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/approvers?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/groups?region=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/topic', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/activity-reports/goals?grantIds=10', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/goal-templates?grantIds=10', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/goal-templates/1/prompts?goalIds=5', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/goals?reportId=10002&goalIds=5', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get(
      'http://frontend:3000/static/media/c6c9fd228e87eefaf1d4.c6c9fd228e87eefaf1d4.woff2',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: 'application/font-woff2;q=1.0,application/font-woff;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'identity',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          referer: 'http://frontend:3000/',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'font',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )

    response = http.get('http://frontend:3000/api/feeds/item?tag=ttahub-topic', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/courses', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get('http://frontend:3000/api/feeds/item?tag=ttahub-tta-support-type', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })

    response = http.get(
      'https://acf-ohs.atlassian.net/wiki/s/633880739/6452/98fae344e2a620203f1e11afea8e7cd3fc5dab8e/_/images/icons/emoticons/72/1f4cb.png',
      {
        headers: {
          host: 'acf-ohs.atlassian.net',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: 'image/avif,image/webp,*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          referer: 'http://frontend:3000/',
          'sec-fetch-dest': 'image',
          'sec-fetch-mode': 'no-cors',
          'sec-fetch-site': 'cross-site',
        },
      }
    )

    response = http.put(
      'http://frontend:3000/api/activity-reports/10002',
      '{"fei-root-cause":["Family Circumstances"],"goalEndDate":"","goalName":"","goalPrompts":[],"goalSource":"","goals":[{"label":"(FEI) The recipient will eliminate and/or reduce underenrollment as part of the Full Enrollment Initiative (as measured by monthly reported enrollment)","objectives":[{"title":"rasdsadada","topics":[{"id":38,"name":"Child Screening and Assessment","mapsTo":null,"createdAt":"2024-02-03T08:23:52.761Z","updatedAt":"2024-02-03T08:23:52.761Z","deletedAt":null,"ObjectiveTopic":{"id":1,"objectiveId":1,"topicId":38,"onAR":true,"onApprovedAR":false,"createdAt":"2024-02-03T08:31:41.716Z","updatedAt":"2024-02-03T08:31:41.874Z"}}],"resources":[],"files":[],"useIpdCourses":false,"courses":[],"ttaProvided":"<p>dsadsadasdas</p>\\n","supportType":"Planning","status":"Not Started","closeSuspendReason":"","closeSuspendContext":""}],"isNew":true,"endDate":"02/07/2024","grantIds":[10],"goalIds":[5],"oldGrantIds":[null],"created":"2024-02-03T08:31:40.716Z","goalTemplateId":1,"name":"(FEI) The recipient will eliminate and/or reduce underenrollment as part of the Full Enrollment Initiative (as measured by monthly reported enrollment)","status":"Not Started","onApprovedAR":false,"source":"Regional office priority","createdVia":"activityReport","isCurated":true,"isActivelyBeingEditing":false,"regionId":1,"prompts":[{"promptId":1,"title":"FEI root cause","response":["Family Circumstances"]}]}],"pageState":{"1":"Complete","2":"Complete","3":"Not started","4":"Not started"},"version":2,"approverUserIds":[]}',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          referer: 'http://frontend:3000/activity-reports/10002/goals-objectives',
          'content-type': 'application/json',
          'auth-impersonation-id': 'null',
          origin: 'http://frontend:3000',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
  })

  group(
    'page_7 - http://frontend:3000/activity-reports/10002/supporting-attachments',
    function () {
      response = http.put(
        'http://frontend:3000/api/activity-reports/10002',
        '{"pageState":{"1":"Complete","2":"Complete","3":"Complete","4":"Not started"},"version":2,"approverUserIds":[]}',
        {
          headers: {
            host: 'frontend:3000',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
            accept: '*/*',
            'accept-language': 'en-US,en;q=0.5',
            'accept-encoding': 'gzip, deflate, br',
            referer: 'http://frontend:3000/activity-reports/10002/supporting-attachments',
            'content-type': 'application/json',
            'auth-impersonation-id': 'null',
            origin: 'http://frontend:3000',
            dnt: '1',
            'sec-gpc': '1',
            connection: 'keep-alive',
            cookie:
              'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
          },
        }
      )
    }
  )

  group('page_8 - http://frontend:3000/activity-reports/10002/next-steps', function () {
    response = http.put(
      'http://frontend:3000/api/activity-reports/10002',
      '{"pageState":{"1":"Complete","2":"Complete","3":"Complete","4":"Complete"},"recipientNextSteps":[{"completeDate":"02/06/2024","note":"dsadsad","id":3}],"specialistNextSteps":[{"completeDate":"02/07/2024","note":"dasdsad","id":4}],"version":2,"approverUserIds":[]}',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          referer: 'http://frontend:3000/activity-reports/10002/next-steps',
          'content-type': 'application/json',
          'auth-impersonation-id': 'null',
          origin: 'http://frontend:3000',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
  })

  group('Homepage0 - http://frontend:3000/activity-reports', function () {
    response = http.put(
      'http://frontend:3000/api/activity-reports/10002/submit',
      '{"additionalNotes":"<p></p>\\n","approverUserIds":[1],"creatorRole":"System Specialist"}',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          referer: 'http://frontend:3000/activity-reports/10002/review',
          'content-type': 'application/json',
          'auth-impersonation-id': 'null',
          origin: 'http://frontend:3000',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
  })

  group('Homepage1 - http://frontend:3000/activity-reports?region.in[]=1', function () {
    response = http.get('http://frontend:3000/api/widgets/overview?region.in[]=1', {
      headers: {
        host: 'frontend:3000',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://frontend:3000/activity-reports',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'auth-impersonation-id': 'null',
        dnt: '1',
        'sec-gpc': '1',
        connection: 'keep-alive',
        cookie:
          'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    })
    response = http.get(
      'http://frontend:3000/api/activity-reports?sortBy=updatedAt&sortDir=desc&offset=0&limit=10&region.in[]=1',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          referer: 'http://frontend:3000/activity-reports',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'auth-impersonation-id': 'null',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
    response = http.get(
      'http://frontend:3000/api/activity-reports/alerts?sortBy=startDate&sortDir=desc&offset=0&limit=10&region.in[]=1',
      {
        headers: {
          host: 'frontend:3000',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          referer: 'http://frontend:3000/activity-reports?region.in[]=1',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'auth-impersonation-id': 'null',
          dnt: '1',
          'sec-gpc': '1',
          connection: 'keep-alive',
          cookie:
            'session=eyJ1c2VySWQiOiIxIiwidXVpZCI6ImRhMmRmNzZlLTkwZGUtNDI1NC1hMDNhLWYyZDk5ZjcxYmM0OCJ9; session.sig=jhHjl7dma64tfdf2pu1HvY2NVgI',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      }
    )
  })

  // Automatically added sleep
  sleep(1)
}
