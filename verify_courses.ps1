
$courseFile = "e:\MyRepos\education\teach-laoz-learning-management-system\COURSE_REPOSITORIES.md"
$baseDirs = @(
    "e:\MyRepos\education\teach-laoz",
    "e:\MyRepos\education\teach-laoz-courses-generator\cursos"
)

if (-not (Test-Path $courseFile)) {
    Write-Host "Error: Course file not found at $courseFile"
    exit 1
}

$content = Get-Content $courseFile
$repos = @()

# Parse the markdown file for URLs
foreach ($line in $content) {
    if ($line -match '\[.*?\]\((https://github\.com/.*?/([^\)]+))\)') {
        $url = $matches[1]
        $repoName = $matches[2]
        # Remove .git extension if present
        if ($repoName -like "*.git") {
            $repoName = $repoName.Substring(0, $repoName.Length - 4)
        }
        $repos += @{ Name = $repoName; Url = $url }
    }
}

Write-Host "Found $($repos.Count) repositories in the list."

$results = @()

foreach ($repo in $repos) {
    $found = $false
    $status = "Missing Locally"
    $details = ""
    $finalPath = ""

    foreach ($baseDir in $baseDirs) {
        $repoPath = Join-Path $baseDir $repo.Name
        if (Test-Path $repoPath) {
            # Check if it is a git repo
            if (Test-Path (Join-Path $repoPath ".git")) {
                Push-Location $repoPath
                try {
                    # Fetch latest info
                    git fetch -q origin 2>$null
                    
                    # Check status
                    $gitStatus = git status -sb --porcelain 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        # Parse status
                        $branchLine = $gitStatus | Select-Object -First 1
                        
                        if ($branchLine -match '\[ahead (\d+)\]') {
                            $details = "Ahead by $($matches[1]) commits"
                            $status = "Not Synced (Ahead)"
                        }
                        elseif ($branchLine -match '\[behind (\d+)\]') {
                            $details = "Behind by $($matches[1]) commits"
                            $status = "Not Synced (Behind)"
                        }
                        elseif ($gitStatus.Count -gt 1) {
                            $status = "Dirty (Uncommitted Changes)"
                            $details = "Modified/Untracked files present"
                        }
                        else {
                            $status = "Synced"
                            $details = "Up to date"
                        }
                        $found = $true
                        $finalPath = $repoPath
                        Pop-Location
                        break 
                    }
                }
                catch {
                    $status = "Error"
                    $details = $_.Exception.Message
                }
                Pop-Location
            }
            else {
                # Folder exists but not git repo
                $status = "Not a Git Repo"
                $details = "Folder exists but .git missing"
                $finalPath = $repoPath
                # Don't break, keep looking for a valid git repo in other dirs
            }
        }
    }

    $results += [PSCustomObject]@{
        RepoName = $repo.Name
        Status   = $status
        Details  = $details
        Path     = $finalPath
    }
}

$results | ConvertTo-Json -Depth 2
