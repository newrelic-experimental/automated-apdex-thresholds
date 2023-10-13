const ACCOUNT_ID = "0"                    // Your New Relic account Id
const INGEST_LICENSE = "XXXX...NRAL"      // A New Relic ingest licence key
const NR_USER_KEY = "NRAK..."             // A New Relic User API key

var desiredPercentile = 90;                // Target percentile
const NR_REGION = 'US';                      // New Relic data centre region


// No need to change anything after here


// US vs EU
const GRAPHQL_DOMAIN = NR_REGION == 'US' ? 'https://api.newrelic.com/graphql' : 'https://api.eu.newrelic.com/graphql';
const REST_DOMAIN = NR_REGION == 'US' ? 'https://api.newrelic.com/v2/' : 'https://api.newrelic.com/v2/';
const EVENTS_API = NR_REGION == 'US' ? 'https://insights-collector.newrelic.com/v1/accounts/' : 'https://insights-collector.eu01.nr-data.net/v1/accounts/';

var headers = {
    "Content-Type": "json/application",
    "X-Api-Key": NR_USER_KEY
};

var options = {
    url: REST_DOMAIN + "applications.json",
    method: 'GET',
    headers: headers
};

$http.get(options,
    function (error, response) {
        if (error) return onErr(error);
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(response.body);
            for (var i = 0; i < result["applications"].length; ++i) {
                var application = result["applications"][i];
                var appName = application["name"];
                var appId = application["id"];
                var QUERY = 'SELECT percentile(duration,' + desiredPercentile + ') FROM Transaction WHERE appId =' + application["id"] + ' SINCE 7 DAY AGO';
                getResponseTime(QUERY, appId, appName);
            }
        }
    });

function getResponseTime(QUERY, appId, appName) {
    const nerdOptions = {
        uri: GRAPHQL_DOMAIN,
        headers: {
            'API-key': NR_USER_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
        query getNrqlResults($accountId: Int!, $nrql: Nrql!) {
          actor {
            account(id: $accountId) {
              nrql(query: $nrql) {
                results
              }
            }
          }
        }
      `,
            variables: {
                accountId: Number(ACCOUNT_ID),
                nrql: QUERY,
            },
        }),
    };
    $http.post(nerdOptions, (error, response) => {
        if (error) {
            isError = true;
            lastError = error.toString();
            isRunning = false;
            return console.log(error);
        }
        if (response.statusCode !== 200) {
            isError = true;
            lastError = JSON.stringify(response.body);
            isRunning = false;
            return console.log(response.body, response.statusCode);
        }
        const results = JSON.parse(response.body);
        const duration = results.data.actor.account.nrql.results[0]['percentile.duration'][`${desiredPercentile}`];
        setApdexT(duration, appId, appName);
        sendChangeToInsights(duration, appId, appName);
    });
}

function sendChangeToInsights(duration, appId, appName) {
    var ApdexT = duration;
    var insertData = JSON.stringify({
        eventType: "ApdexChange",
        "appName": appName,
        "apmApdexT_new": ApdexT,
        "desiredPercentile": desiredPercentile,
    });

    console.log("+++***INSERT Payload***+++: " + insertData);
    var options = {
        method: 'POST',
        url: EVENTS_API + ACCOUNT_ID + '/events',
        headers:
        {
            'X-Insert-Key': INGEST_LICENSE,
            'Content-Type': 'application/json'
        },
        body: insertData
    };

    $http.post(options,
        function (error, response) {
            if (error) return onErr(error);
            if (!error) {
                console.log("SUCCESS: " + response.statusCode + " Message: " + response.body + " Sent Data: " + insertData);
            }
        });
}

function setApdexT(duration, appId, appName) {
    console.log("DURATION PASSED: " + duration);
    var ApdexT = duration;
    console.log("DURATION ROUNDED: " + ApdexT);

    var data = JSON.stringify({
        application:
        {
            name: appName,
            settings: {
                "app_apdex_threshold": ApdexT,
            }
        }
    });

    console.log("+++***Settings Payload***+++: " + data);
    var options = {
        method: 'PUT',
        url: REST_DOMAIN + 'applications/' + appId + '.json',
        headers:
        {
            'X-Api-Key': NR_USER_KEY,
            'Content-Type': 'application/json'
        },
        body: data
    };

    $http.put(options,
        function (error, response) {
            if (error) return onErr(error);
            if (!error) {
                var result = JSON.parse(response.body);
                console.log("SUCCESS: " + response.statusCode + " Message: " + response.body);
            }
        });
}

function onErr(err) {
    console.log(err);
    return 1;
}
