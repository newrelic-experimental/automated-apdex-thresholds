[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)

### Use API automation to set your Apdex threshold


        
![GitHub last commit](https://img.shields.io/github/last-commit/newrelic-experimental/automated-apdex-thresholds) 
![GitHub issues](https://img.shields.io/github/issues/newrelic-experimental/automated-apdex-thresholds) 
![GitHub issues closed](https://img.shields.io/github/issues-closed/newrelic-experimental/automated-apdex-thresholds) 
![GitHub pull requests](https://img.shields.io/github/issues-pr/newrelic-experimental/automated-apdex-thresholds) 
![GitHub pull requests closed](https://img.shields.io/github/issues-pr-closed/newrelic-experimental/automated-apdex-thresholds)

#### Automating Apdex calculation for your APM applications within New Relic can provide several benefits, including:

* **Consistency**: By automating the Apdex calculation, you can ensure that the same calculation method is used every time, which can help you compare performance data across different time periods and applications.

* **Efficiency**: Automating the Apdex calculation can save you time and effort compared to manually calculating Apdex for each application and time period.

* **Timeliness**: By automating the Apdex calculation, you can get Apdex scores for your APM applications in real-time, which can help you quickly identify performance issues and take action to resolve them.

* **Customization**: You can customize the Apdex thresholds based on your specific requirements and application performance targets. Automating the calculation can help you easily adjust the thresholds as needed.

* **Insight**: Apdex scores can provide valuable insight into the performance of your APM applications. Automating the calculation can help you track performance trends over time and identify areas for improvement.

> 

## The required steps

First, you want to choose an appropriate Apdex threshold. Without diving into the math, you can use a specific percentile response time for your Apdex threshold to get a specific Apdex score...Check out this [blog post](https://newrelic.com/blog/best-practices/how-to-choose-apdex-t) for more information

Secondly, create an Scripted API monitor within Synthetics and configure the monitor to run one a day/week from one location.

You'll need to configure the following fields in your serverless environment
- INGEST_LICENSE: [New Relic Events Insert API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#license-key)
- USER KEY: [New Relic USER key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#user-key)
- ACCOUNT_ID: [New Relic Account Id](https://docs.newrelic.com/docs/accounts/install-new-relic/account-setup/account-id)
- NR_REGION: US or EU
- desiredPercentile: 90



See the custom event within the Data explorer 
<img width="1368" alt="Screenshot 2023-02-27 at 14 23 58" src="https://user-images.githubusercontent.com/12893310/221589003-c6bec55a-635e-4b17-8e26-53257e09f611.png">

View the Validation results within Synthetics 
<img width="1366" alt="Screenshot 2023-02-27 at 14 25 34" src="https://user-images.githubusercontent.com/12893310/221589443-859f1b33-fab3-4f92-93a7-3f04c12cc8c7.png">




## Installation

Configure the script with the required licence keys (preferably use secure credentials) and target percentile. Add the script to a New Relic Scripted API script and run as required.

## Issues / enhancement requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](https://github.com/newrelic-experimental/automated-apdex-thresholds/issues). Please search for and review the existing open issues before submitting a new issue.

## Support

New Relic has open-sourced this project. This project is provided AS-IS WITHOUT WARRANTY OR DEDICATED SUPPORT. Issues and contributions should be reported to the project here on GitHub.

>We encourage you to bring your experiences and questions to the [Explorers Hub](https://discuss.newrelic.com) where our community members collaborate on solutions and new ideas.


## Contributing

We encourage your contributions to improve Automated Apdex Threshold script! Keep in mind when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project. If you have any questions, or to execute our corporate CLA, required if your contribution is on behalf of a company, please drop us an email at opensource@newrelic.com.


## License

Automated Apdex Thresholds is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.

