import { Schema, model } from "mongoose";

const JobSchema = new Schema(
  {
    jobId: { type: String, required: true, unique: true },
    title: String,
    company: String,
    description: String,
    location: String,
    link: String,
    category: String,
    type: String,
    datePosted: Date,
  },
  { timestamps: true }
);

const Job = model("Job", JobSchema);
export default Job;
