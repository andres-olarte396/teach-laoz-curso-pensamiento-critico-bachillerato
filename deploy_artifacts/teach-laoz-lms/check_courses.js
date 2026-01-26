const fs = require("fs");
const path = require("path");

const repoFile =
  "e:/MyRepos/education/teach-laoz-learning-management-system/COURSE_REPOSITORIES.md";
const coursesDir =
  "e:/MyRepos/education/teach-laoz-learning-management-system/content/courses";

try {
  const existingCourses = new Set(fs.readdirSync(coursesDir));
  const content = fs.readFileSync(repoFile, "utf8");

  const missing = [];
  const unexpected = [];
  const expected = new Set();

  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/- \[(.*?)\]\((.*?)\)/);
    if (match) {
      const name = match[1];
      let url = match[2];
      let repoName = url.split("/").pop();
      if (repoName.endsWith(".git")) {
        repoName = repoName.slice(0, -4);
      }

      expected.add(repoName);

      if (!existingCourses.has(repoName)) {
        missing.push(`${name} (${repoName})`);
      }
    }
  }

  for (const folder of existingCourses) {
    if (!expected.has(folder)) {
      unexpected.push(folder);
    }
  }

  console.log("--- MISSING COURSES ---");
  if (missing.length === 0) console.log("None");
  else missing.forEach((m) => console.log(m));

  console.log("\n--- UNEXPECTED COURSES ---");
  if (unexpected.length === 0) console.log("None");
  else unexpected.forEach((u) => console.log(u));
} catch (err) {
  console.error(err);
}
