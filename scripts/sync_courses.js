import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to parse the markdown file
function parseCourses(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const courses = [];
  const linkRegex = /-\s*\[([^\]]+)\]\(([^)]+)\)/;

  lines.forEach((line) => {
    const match = linkRegex.exec(line);
    if (match) {
      const [_, name, url] = match;
      if (url !== "URL_DEL_GIT_REPO") {
        // Determine folder name from URL or Name
        let folderName = path.basename(url, ".git");
        if (!folderName || folderName === "") {
          folderName = name.replace(/\s+/g, "-").toLowerCase();
        }
        courses.push({ name, url, folderName });
      }
    }
  });

  return courses;
}

async function main() {
  const rootDir = path.resolve(__dirname, ".."); // Assuming scripts/sync_courses.js
  const courseListPath = path.join(rootDir, "COURSE_REPOSITORIES.md");
  const contentDir = path.join(rootDir, "content", "courses");

  console.log(`Reading courses from: ${courseListPath}`);
  if (!fs.existsSync(courseListPath)) {
    console.error("COURSE_REPOSITORIES.md not found!");
    process.exit(1);
  }

  const courses = parseCourses(courseListPath);
  console.log(`Found ${courses.length} courses.`);

  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  for (const course of courses) {
    const targetPath = path.join(contentDir, course.folderName);
    console.log(`Processing: ${course.name} -> ${targetPath}`);

    if (fs.existsSync(targetPath)) {
      const gitDir = path.join(targetPath, ".git");
      if (fs.existsSync(gitDir)) {
        try {
          console.log("  Dependencies: Pulling updates...");
          execSync("git pull", { cwd: targetPath, stdio: "inherit" });
        } catch (e) {
          console.error(`  Error pulling: ${e.message}`);
        }
      } else {
        console.log(
          "  Directory exists but no .git, skipping (manual content?)"
        );
      }
    } else {
      try {
        console.log(`  Cloning ${course.url}...`);
        execSync(`git clone "${course.url}" "${targetPath}"`, {
          stdio: "inherit",
        });
      } catch (e) {
        console.error(`  Error cloning: ${e.message}`);
      }
    }
  }

  console.log("Sync complete.");
}

main();
