import { Request, Response } from "express";
import Report from "../models/Report";
import { extractFormattedContent, generateAIResponse } from "./ai-util";
import Query from "../models/Query";
import logger from "../utils/logger";

// Save or update a report
export const saveReport = async (req: Request, res: Response) => {
  try {
    const reportData = req.body;
    let report;

    if (reportData._id) {
      // Find the report and check if it belongs to the current user
      report = await Report.findOne({
        _id: reportData._id,
        createdBy: req.user!.id,
      });

      if (!report) {
        return res.status(404).json({
          error:
            "Report not found or you don't have permission to update this report",
        });
      }

      // Update the report
      report = await Report.findByIdAndUpdate(reportData._id, reportData, {
        new: true,
      });
    } else {
      // Create a new report and set the createdBy field to the current user
      report = new Report({
        ...reportData,
        createdBy: req.user!.id, // Set the createdBy to the current logged-in user
      });
      await report.save();
    }

    res.status(200).json(report);
  } catch (err) {
    logger.error("Error saving report:", err);
    res.status(500).json({ error: "Error saving report" });
  }
};

// Get all reports created by the logged-in user
export const getReports = async (req: Request, res: Response) => {
  try {
    // Fetch reports where the createdBy field matches the current user
    const reports = await Report.find({ createdBy: req.user!.id }, "_id name");
    res.status(200).json(reports);
  } catch (err) {
    logger.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

// Get a report by ID (ensure it belongs to the logged-in user)
export const getReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id;

    // Find the report by ID and make sure it's owned by the current user
    const report = await Report.findOne({
      _id: reportId,
      createdBy: req.user!.id,
    });

    if (!report) {
      return res.status(404).json({
        error:
          "Report not found or you don't have permission to view this report",
      });
    }

    res.status(200).json(report);
  } catch (err) {
    logger.error("Error loading report:", err);
    res.status(500).json({ error: "Error loading report" });
  }
};

// Delete a report by ID (only if the current user owns it)
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id;

    // Ensure the report exists and the current user owns it
    const report = await Report.findOneAndDelete({
      _id: reportId,
      createdBy: req.user!.id,
    });

    if (!report) {
      return res.status(404).json({
        error:
          "Report not found or you don't have permission to delete this report",
      });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    logger.error("Error deleting report:", err);
    res.status(500).json({ error: "Error deleting report" });
  }
};

// Analyze and generate chart parameters for a block group
export const analyzeBlock = async (req: Request, res: Response) => {
  // get reportId, blockGroupIndex from request params.
  const { id: reportId, index } = req.params;
  const blockGroupIndex = parseInt(index, 10);

  const { queryData, queryId } = req.body;
  try {
    // Fetch the report
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Validate the blockGroupIndex
    if (blockGroupIndex < 0 || blockGroupIndex >= report.blockGroups.length) {
      return res.status(404).json({ message: "Invalid block group index" });
    }

    // Access the block group by its index
    const blockGroup = report.blockGroups[blockGroupIndex];

    // Check if chart parameters already exist
    if (blockGroup.chartParams) {
      return res.status(200).json({
        message: "Chart parameters already exist",
        chartParams: blockGroup.chartParams,
      });
    }

    // Get the query by id
    const query = await Query.findOne({
      _id: queryId,
      createdBy: req.user!.id,
    });

    // Prepare OpenAI prompt with the passed query data
    const context = `
      
      Based on the following data, generate the appropriate parameters for a ${
        blockGroup.config.type
      } chart.
      
      Data sample:
      ${JSON.stringify(queryData)}

      The query that generated this data is:
      ${JSON.stringify(query)}

      Please provide the body (I insist only the body) of a function that accepts the raw data as input (parameter name is rawData) and returns an object with 'data' and 'options' properties.
      I'll pass the generated parameters to a chart.js component for rendering like <SomeChartType data={data} options={options} />.
      If the raw data needs to be transformed or processed before rendering, please include the necessary steps in the code.
      Do not include any explanations or comments in the function, just the code.
      For context the answer you provide will be used like this:
      new Function('rawData', yourAnswer + "")
      I want to pass your answer to Function so it should be the BODY of the function, to be very specific I want you to omit the part faunction <name>(arg){
      // only this part
      }
    `;

    const prompt = [
      {
        role: "user",
        content: `I want to render a chart.js component dynamically and I need the options and data parameters.
        I have the actual raw data to be used in the dataset.`,
      },
      {
        role: "user",
        content: context,
      },
    ];

    // Call OpenAI to generate chart parameters
    const aiResponse = await generateAIResponse("gpt-4o-mini", prompt);

    // Extract and clean the JSON object from the AI response
    const chartParams = extractFormattedContent("javascript", aiResponse);

    if (!chartParams) {
      return res
        .status(400)
        .json({ message: "Failed to generate chart parameters" });
    }

    // Update the report's block group with the generated chart parameters
    blockGroup.chartParams = chartParams;
    await report.save();

    return res
      .status(200)
      .json({ message: "Chart parameters generated", chartParams });
  } catch (error) {
    logger.error("Error analyzing block:", error);
    return res.status(500).json({ message: "Failed to analyze block", error });
  }
};
