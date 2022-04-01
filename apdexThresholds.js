var request = require("request");
var ACCOUNT_ID = "ACCOUNT ID"
var INGEST_LICENSE = "INGEST - LICENSE KEY"
var NR_USER_KEY = "USER KEY"
var desiredPercentile = 90;
var headers = {
    "Content-Type": "json/application",
    "X-Api-Key": NR_USER_KEY
};

var options = {
    url: "https://api.newrelic.com/v2/applications.json",
    method: 'GET',
    headers: headers
};

request(options,
    function (error, response, body) {
        if (error) return onErr(error);
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);
            // console.log('Number of applications found:'+result["applications"].length);
            for (var i = 0; i < result["applications"].length; ++i) {
                var application = result["applications"][i];
                // console.log("App Settings: "+JSON.stringify(application["settings"]["end_user_apdex_threshold"]));
                var appName = application["name"];
                var appId = application["id"];
                var browserApdexT = application["settings"]["end_user_apdex_threshold"];
                var RUMEnabled = application["settings"]["enable_real_user_monitoring"];
                // console.log("RUM Enabled: "+RUMEnabled);
                var QUERY = 'SELECT percentile(duration,' + desiredPercentile + ') FROM Transaction WHERE appId =' + application["id"] + ' SINCE 7 DAY AGO'
                // console.log('QUERY is: '+QUERY);
                getResponseTime(QUERY, appId, appName, RUMEnabled);
            }
        }
    });

function getResponseTime(QUERY, appId, appName, RUMEnabled) {
    const nerdOptions = {
        // Define endpoint URI, https://api.eu.newrelic.com/graphql for EU accounts
        uri: 'https://api.newrelic.com/graphql',
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
    $http.post(nerdOptions, (error, response, body) => {
        if (error) {
            isError = true
            lastError = error.toString()
            isRunning = false
            return console.log(error)
        }
        if (response.statusCode !== 200) {
            isError = true
            lastError = JSON.stringify(body)
            isRunning = false
            return console.log(body, response.statusCode)
        }
        const results = JSON.parse(body)
        const duration = results.data.actor.account.nrql.results[0]['percentile.duration'][`${desiredPercentile}`]
        setApdexT(duration, appId, appName, RUMEnabled);
        sendChangeToInsights(duration, appId, appName, RUMEnabled);
    });
}

function sendChangeToInsights(duration, appId, appName, RUMEnabled) {
    var ApdexT = duration;
    var insertData = JSON.stringify({
        eventType: "ApdexChange",
        "appName": appName,
        "apmApdexT_new": ApdexT,
        // "browserApdexT_new": EUApdexT,
        "desiredPercentile": desiredPercentile,
        "enable_real_user_monitoring": RUMEnabled
    });

    console.log("+++***INSERT Payload***+++: " + insertData);
    var options = {
        method: 'POST',
        url: 'https://insights-collector.newrelic.com/v1/accounts/' + ACCOUNT_ID + '/events',
        headers:
        {
            'X-Insert-Key': INGEST_LICENSE,
            'Content-Type': 'application/json'
        },
        body: insertData
    };

    request(options,
        function (error, response, body) {
            if (error) return onErr(error);
            if (!error) {
                var result = JSON.parse(body);
                console.log("SUCCESS: " + response.statusCode + " Message: " + response.body + " Sent Data: " + insertData);
            }
        });
}

function setApdexT(duration, appId, appName, RUMEnabled) {
    console.log("DURATION PASSED: " + duration);
    var ApdexT = duration;
    console.log("DURATION ROUNDED: " + ApdexT);
    //var EUApdexT = parseFloat(browserApdexT);

    var data = JSON.stringify({
        application:
        {
            name: appName,
            settings: {
                "app_apdex_threshold": ApdexT,
                // "end_user_apdex_threshold": EUApdexT,
                "enable_real_user_monitoring": RUMEnabled
            }
        }
    });

    console.log("+++***Settings Payload***+++: " + data);
    var options = {
        method: 'PUT',
        url: 'https://api.newrelic.com/v2/applications/' + appId + '.json',
        headers:
        {
            'X-Api-Key': adminKey,
            'Content-Type': 'application/json'
        },
        body: data
    };

    request(options,
        function (error, response, body) {
            if (error) return onErr(error);
            if (!error) {
                var result = JSON.parse(body);
                console.log("SUCCESS: " + response.statusCode + " Message: " + response.body);
            }
        });
}

function onErr(err) {
    console.log(err);
    return 1;
}