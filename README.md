# Telegram Bot
A tutorial on creating a Node.js Telegram bot using AWS Lambda with AWS API Gateway.

![Telegram Bot](https://c2.staticflickr.com/2/1528/25660481625_8438a20584_o.jpg)

## Build Status
[![Build Status](https://travis-ci.org/lesterchan/telegram-bot.svg?branch=master)](https://travis-ci.org/lesterchan/telegram-bot)

## Setup
I am choosing Asia Pacific (Tokyo) region for AWS Lambda and Asia Pacific (Singapore) region for AWS API Gateway. AWS Lambda is not yet available in Singapore.

### Telegram
1. Go to [Telegram Web](https://web.telegram.org/).
3. Start a chat with [@BotFather](https://telegram.me/BotFather).
4. Type "/start".
5. Type "/newbot" to create a new bot. I named my bot "lesterchan_bot".
6. Note the HTTP API access token that @BotFather will reply you after you created the bot.

### Checkout Code
```
$ git clone https://github.com/lesterchan/telegram-bot.git  
$ npm install --production  
$ cd telegram-bot  
$ cp token.sample.js token.js
```
Open up ```token.js``` and fill in your Telegram HTTP API access token obtained in the first step then run this command:
```
$ zip -r telegram-bot.zip *.js node_modules/*
```

### AWS Lambda
1. Go to [AWS Lambda](https://ap-northeast-1.console.aws.amazon.com/lambda/home?region=ap-northeast-1).
2. Click "Get Started Now".
3. Under the "Select blueprint" screen, search for "hello-word"and you will see the hello-word blueprint which says "A starter AWS Lambda function.".
4. Click on "hello-world" (NOT "hello-world-python").
5. You will be brought to the "Configure Function" page.
6. Under "Name", you can choose any name for your function. I called it "telegram-bot".
7. Under "Runtime", ensure it is "Node.js".
8. Under "Code entry type", choose "Upload a .ZIP file" and click the "Upload" button" to browse for the file "telegram-bot.zip" which you have zipped previously.
9. Under "Handler", we leave it as "index.handler".
10. Under "Role", we choose "Basic Execution Role".
11. You will be brought to a "Role Summary" page.
12. Under "IAM Role", choose "lambda_basic_execution".
13. Under "Role Name", choose "oneClick_lambda_basic_execution_.....".
14. Click "Allow".
15. You will be brought back to the "Configure Function" page.
16. Leave "Memory (MB)" as "128MB".
17. You might want to increase "Timeout" to "15" seconds.
18. Under VPC, choose "No VPC".
19. Click "Next".
20. Click "Create function".

### AWS API Gateway
1. Go to [AWS API Gateway](https://ap-southeast-1.console.aws.amazon.com/apigateway/home?region=ap-southeast-1).
2. Click "Get Started Now".
3. Under "API name", enter the name of your API. I will just name it "Telegram Bot".
4. Click "Create API".
5. You will be redirected to the "Resources" page.
6. Click "Create Method" and on the dropdown menu on the left, choose "POST" and click on the "tick" icon.
7. Now, you will see the "/ - POST - Setup" page on the right.
8. Under "Integration Type", choose "Lambda Function".
9. Under "Lambda Region", choose "ap-northeast-1".
10. Under "Lambda Function", type "telegram" and it should auto-complete it to "telegram-bot".
11. Click "Save" and "Ok" when the popup appears.
12. You will be brought to the "/ - POST - Method Execution" Page.
13. Click "Integration Request".
14. Click "Mapping Templates" and the section should expand.
15. Click "Add Mapping Template" and type in "application/json" and click on the "tick" icon.
16. Under "Input Passthrough" on the right, click on the "pencil" icon.
16. Choose "Mapping Template" on the dropdown that appears.
17. Copy and paste ```{"body": $input.json('$')}``` to the template box.
18. Click on the "tick" icon beside the dropdown once you are done.
19. Click on "Deploy API" button on the top left.
20. Under "Deployment Stage", click "New Stage".
21. Under "Stage Name", I will type in "production".
22. Click "Deploy".
23. Note the "Invoke URL" at the top and your API is now live.

### Set Telegram Webhook
1. Replace &lt;ACCESS_TOKEN&gt; with your Telegram HTTP API access token obtained in the first step. 
2. Replace &lt;INVOKE_URL&gt; with your Invoke URL obtained in the previous step.
3. Run this command:
```
$ curl --data "url=<INVOKE_URL>" "https://api.telegram.org/bot<ACCESS_TOKEN>/setWebhook"
```
You should get back a response similar to this:
```
$ {"ok":true,"result":true,"description":"Webhook was set"}
```

### Testing via Telegram
1. Message your Telegram Bot that you have created.
2. Type in "/haze" (without the quotes) in any Slack channel.
3. You should get back a nicely formatting response as shown in the first screenshot.

## Commands
### Singapore Bus Arrival Timings 
Usage: ```/bus <busStopNo> <busNo>```  
Example: ```/bus 1039 61```

### Singapore Haze Situation
Usage: ```/haze```  
Example: ```/haze```

### Singapore Weather 3 Hour Forecast
Usage: ```/weather```  
Example: ```/weather```

### IP Information
Usage: ```/ipinfo <ip>```  
Example: ```/ipinfo 8.8.8.8```

### Social Stats Count For Links
Usage: ```/socialstats <url>```  
Example: ```/socialstats https://lesterchan.net```

## See Also
[Slack Bot using AWS API Gateway and AWS Lamda](https://github.com/lesterchan/slack-bot)