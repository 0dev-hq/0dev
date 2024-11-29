import { exec } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { DataPipeline } from "./data-pipeline";
import logger from "../../utils/logger";

export class LocalDataPipeline implements DataPipeline {
  async ingestDataObject(filePath: string): Promise<string[]> {
    const storageProvider = process.env.DEFAULT_STORAGE_PROVIDER;
    const storagePath = process.env.STORAGE_PATH;
    const s3Bucket = process.env.USER_FILES_S3_BUCKET;

    const dbConfig = {
      user: process.env.INTERNAL_DB_USER,
      password: process.env.INTERNAL_DB_PASS,
      host: process.env.INTERNAL_DB_HOST,
      port: process.env.INTERNAL_DB_PORT,
      database: process.env.INTERNAL_DB_NAME,
    };

    return new Promise((resolve, reject) => {
      const pythonScriptPath = path.resolve(process.cwd(), "src/scripts");
      const resultFilePath = path.join(pythonScriptPath, `${Date.now()}.json`);

      const args = [
        `--storage_provider=${storageProvider}`,
        `--file_path=${filePath}`,
        `--local_root=${storagePath}`,
        `--s3_bucket=${s3Bucket}`,
        `--db_user=${dbConfig.user}`,
        `--db_pass=${dbConfig.password}`,
        `--db_host=${dbConfig.host}`,
        `--db_name=${dbConfig.database}`,
        `--result_file_path=${resultFilePath}`,
      ];

      const fileType = filePath.split(".").pop();
      let script = "";
      switch (fileType) {
        case "csv":
        case "excel":
          script = "local-ingest-data.py";
          break;
        case "pdf":
          script = "local-ingest-pdf.py";
          args.push(`--openai_api_key=${process.env.OPENAI_API_KEY}`);
          break;
        case "docx":
          script = "local-ingest-word.py";
          args.push(`--openai_api_key=${process.env.OPENAI_API_KEY}`);
          break;
        default:
          reject(new Error("Unsupported file type"));
          return;
      }

      exec(
        `source ${pythonScriptPath}/venv/bin/activate && python3 ${pythonScriptPath}/${script} ${args.join(
          " "
        )}`,
        (error, stdout, stderr) => {
          if (error) {
            logger.error(`Error: ${stderr}`);
            reject(error);
          } else {
            logger.info(`Output: ${stdout}`);

            if (["pdf", "docx"].includes(fileType)) {
              return resolve([]);
            }
            // Get the results from the result file and clean up
            const result = JSON.parse(
              fs.readFileSync(resultFilePath, {
                encoding: "utf-8",
              })
            );
            const tables = result.table_names;
            fs.unlinkSync(resultFilePath);

            resolve(tables);
          }
        }
      );
    });
  }
}
