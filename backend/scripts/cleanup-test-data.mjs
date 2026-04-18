import connectDB from "../src/config/db.js";
import Donor from "../src/models/donor.model.js";
import Facility from "../src/models/facility.model.js";
import BloodCamp from "../src/models/blood-camp.model.js";
import "dotenv/config";

const shouldConnect = await connectDB();

if (!shouldConnect) {
  console.log("Database connection unavailable; cleanup skipped.");
  process.exit(0);
}

const donorEmailPatterns = [
  /^smoke\./i,
  /^test\.donor\./i,
];

const facilityEmailPatterns = [
  /^smoke\./i,
  /^test\.(hospital|lab)\./i,
];

const campTitlePatterns = [
  /^Smoke Camp$/i,
  /^Amaravathi Blood Donation Drive$/i,
];

const donorEmailFilter = donorEmailPatterns.length
  ? { $or: donorEmailPatterns.map((pattern) => ({ email: pattern })) }
  : {};

const facilityEmailFilter = facilityEmailPatterns.length
  ? { $or: facilityEmailPatterns.map((pattern) => ({ email: pattern })) }
  : {};

const campTitleFilter = campTitlePatterns.length
  ? { $or: campTitlePatterns.map((pattern) => ({ title: pattern })) }
  : {};

const [donorsDeleted, facilitiesDeleted, campsDeleted] = await Promise.all([
  Donor.deleteMany(donorEmailFilter),
  Facility.deleteMany(facilityEmailFilter),
  BloodCamp.deleteMany(campTitleFilter),
]);

console.log(
  JSON.stringify(
    {
      donorsDeleted: donorsDeleted.deletedCount,
      facilitiesDeleted: facilitiesDeleted.deletedCount,
      campsDeleted: campsDeleted.deletedCount,
    },
    null,
    2,
  ),
);

process.exit(0);
