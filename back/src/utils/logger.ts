import winston from "winston";
import CloudWatchTransport from "winston-cloudwatch";
import dotenv from "dotenv";
import AWS from "aws-sdk";

dotenv.config();

const isProd = true; // process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

if (isProd) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  logger.add(
    new CloudWatchTransport({
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
      logStreamName: () => {
        return `${new Date().toISOString().split("T")[0]}-app-log`;
      },
      awsRegion: process.env.AWS_REGION,
      retentionInDays: 14,
      jsonMessage: true,
    })
  );
}

export default logger;
