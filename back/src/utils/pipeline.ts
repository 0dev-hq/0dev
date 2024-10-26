import { Logger } from "winston";

type Stage<T, U> = (input: T, dataBag: U, logger: Logger) => T | Promise<T>;

export interface Pipeline {
  <T, U>(
    stages: Stage<T, U>[],
    input: T,
    dataBag: U,
    logger: Logger
  ): Promise<T>;
}

export const failFastPipeline: Pipeline = async (
  stages,
  input,
  dataBag,
  logger
) => {
  let result = input;

  for (const stage of stages) {
    try {
      result = await stage(input, dataBag, logger);
    } catch (error) {
      logger.error("Pipeline stage failed:", error);
      throw error;
    }
  }

  return result;
};
