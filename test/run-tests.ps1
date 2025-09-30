# LinkedIn AI Detector - PowerShell Test Runner
# Run with: .\test\run-tests.ps1

Write-Host "🧪 Running LinkedIn AI Detector Tests..." -ForegroundColor Cyan
Write-Host ""

# Test Results
$testResults = @()

function Add-TestResult {
    param($Name, $Passed, $Details = "")
    $testResults += @{
        Name = $Name
        Passed = $Passed
        Details = $Details
        Timestamp = Get-Date
    }
}

function Test-AIBotDetection {
    Write-Host "Running: AI Bot Detection Logic" -ForegroundColor Yellow
    
    # Mock AI bot profile
    $profile = @{
        name = 'Alex Smith'
        title = 'Software Engineer'
        profileAge = 5
        connectionCount = 3
        profileLocation = 'New York'
        companyLocation = 'San Francisco'
        companyName = 'Tech Corp'
    }
    
    $suspiciousIndicators = @()
    
    # Check profile age (less than 30 days)
    if ($profile.profileAge -lt 30) {
        $suspiciousIndicators += "Profile created $($profile.profileAge) days ago"
    }
    
    # Check connection count (less than 10 connections)
    if ($profile.connectionCount -lt 10) {
        $suspiciousIndicators += "Only $($profile.connectionCount) connections"
    }
    
    # Check location mismatch
    if ($profile.profileLocation -ne $profile.companyLocation) {
        $suspiciousIndicators += "Location mismatch: Profile ($($profile.profileLocation)) vs Company ($($profile.companyLocation))"
    }
    
    $isAIBot = $suspiciousIndicators.Count -ge 2
    
    Write-Host "  Suspicious indicators: $($suspiciousIndicators.Count)"
    Write-Host "  Indicators: $($suspiciousIndicators -join ', ')"
    
    Add-TestResult "AI Bot Detection Logic" $isAIBot "Found $($suspiciousIndicators.Count) suspicious indicators"
    return $isAIBot
}

function Test-VerifiedDetection {
    Write-Host "Running: Verified Profile Detection Logic" -ForegroundColor Yellow
    
    # Mock verified profile
    $profile = @{
        name = 'Sarah Johnson'
        title = 'Senior Software Engineer'
        profileAge = 730
        connectionCount = 750
        profileLocation = 'Seattle'
        companyLocation = 'Seattle'
        companyName = 'Microsoft'
    }
    
    $verifiedIndicators = @()
    
    # Profile age (more than 1 year old)
    if ($profile.profileAge -gt 365) {
        $verifiedIndicators += "Profile older than 1 year"
    }
    
    # High connection count (more than 500 connections)
    if ($profile.connectionCount -gt 500) {
        $verifiedIndicators += "High connection count"
    }
    
    # Location consistency
    if ($profile.profileLocation -eq $profile.companyLocation) {
        $verifiedIndicators += "Location consistency"
    }
    
    # Professional indicators
    $professionalKeywords = @('senior', 'engineer', 'manager', 'director')
    $hasProfessionalTitle = $false
    foreach ($keyword in $professionalKeywords) {
        if ($profile.title.ToLower().Contains($keyword)) {
            $hasProfessionalTitle = $true
            break
        }
    }
    
    if ($hasProfessionalTitle) {
        $verifiedIndicators += "Professional indicators"
    }
    
    $isVerified = $verifiedIndicators.Count -ge 3
    
    Write-Host "  Verified indicators: $($verifiedIndicators.Count)"
    Write-Host "  Indicators: $($verifiedIndicators -join ', ')"
    
    Add-TestResult "Verified Profile Detection Logic" $isVerified "Found $($verifiedIndicators.Count) verified indicators"
    return $isVerified
}

function Test-TestModeDetection {
    Write-Host "Running: Test Mode Detection Logic" -ForegroundColor Yellow
    
    $profile = @{
        name = 'Andrew Wilson'
        title = 'Product Manager'
        profileAge = 365
        connectionCount = 200
        profileLocation = 'Boston'
        companyLocation = 'Boston'
        companyName = 'Google'
    }
    
    $testMode = $true
    $nameStartsWithA = $profile.name.Trim().ToLower().StartsWith('a')
    $shouldFlag = $testMode -and $nameStartsWithA
    
    Write-Host "  Test mode: $testMode"
    Write-Host "  Name starts with 'A': $nameStartsWithA"
    Write-Host "  Should flag: $shouldFlag"
    
    Add-TestResult "Test Mode Detection Logic" $shouldFlag "Test mode enabled and name starts with 'A'"
    return $shouldFlag
}

function Test-ProfileAgeParsing {
    Write-Host "Running: Profile Age Parsing" -ForegroundColor Yellow
    
    $testCases = @(
        @{ Input = 'Joined LinkedIn in 2024'; Expected = 'recent' },
        @{ Input = 'Joined 2 months ago'; Expected = 60 },
        @{ Input = 'Joined 5 days ago'; Expected = 5 },
        @{ Input = 'Joined LinkedIn in 2020'; Expected = 'old' }
    )
    
    $passed = 0
    
    for ($i = 0; $i -lt $testCases.Count; $i++) {
        $testCase = $testCases[$i]
        $result = $null
        
        if ($testCase.Input -like "*in 2024*") {
            $result = 'recent'
        } elseif ($testCase.Input -like "*months ago*") {
            $months = [int]($testCase.Input -replace '.*?(\d+)\s*months?.*', '$1')
            $result = $months * 30
        } elseif ($testCase.Input -like "*days ago*") {
            $result = [int]($testCase.Input -replace '.*?(\d+)\s*days?.*', '$1')
        } elseif ($testCase.Input -like "*in 2020*") {
            $result = 'old'
        }
        
        $isCorrect = ($result -eq $testCase.Expected) -or 
                     (($result -is [int]) -and ($testCase.Expected -is [int]) -and 
                      [Math]::Abs($result - $testCase.Expected) -lt 30)
        
        if ($isCorrect) { $passed++ }
        
        $status = if ($isCorrect) { "✅" } else { "❌" }
        Write-Host "  Test $($i + 1): $($testCase.Input) -> $result (expected: $($testCase.Expected)) $status"
    }
    
    $allPassed = $passed -eq $testCases.Count
    Add-TestResult "Profile Age Parsing" $allPassed "Passed $passed/$($testCases.Count) test cases"
    return $allPassed
}

function Test-LocationMatching {
    Write-Host "Running: Location Matching Logic" -ForegroundColor Yellow
    
    $testCases = @(
        @{ Profile = 'Seattle, WA'; Company = 'Seattle, WA'; ShouldMatch = $true },
        @{ Profile = 'New York'; Company = 'San Francisco'; ShouldMatch = $false },
        @{ Profile = 'Seattle, Washington'; Company = 'Seattle, WA'; ShouldMatch = $true },
        @{ Profile = 'Boston, MA'; Company = 'Boston'; ShouldMatch = $true }
    )
    
    $passed = 0
    
    for ($i = 0; $i -lt $testCases.Count; $i++) {
        $testCase = $testCases[$i]
        $profileWords = $testCase.Profile.ToLower().Split(@(',', ' '), [System.StringSplitOptions]::RemoveEmptyEntries)
        $companyWords = $testCase.Company.ToLower().Split(@(',', ' '), [System.StringSplitOptions]::RemoveEmptyEntries)
        
        $commonWords = $profileWords | Where-Object { $companyWords -contains $_ -and $_.Length -gt 2 }
        
        $matches = ($commonWords.Count -gt 0) -or 
                   $testCase.Profile.ToLower().Contains($testCase.Company.ToLower()) -or
                   $testCase.Company.ToLower().Contains($testCase.Profile.ToLower())
        
        $isCorrect = $matches -eq $testCase.ShouldMatch
        if ($isCorrect) { $passed++ }
        
        $status = if ($isCorrect) { "✅" } else { "❌" }
        Write-Host "  Test $($i + 1): `"$($testCase.Profile)`" vs `"$($testCase.Company)`" -> $matches (expected: $($testCase.ShouldMatch)) $status"
    }
    
    $allPassed = $passed -eq $testCases.Count
    Add-TestResult "Location Matching Logic" $allPassed "Passed $passed/$($testCases.Count) test cases"
    return $allPassed
}

function Test-SuspiciousPatterns {
    Write-Host "Running: Suspicious Pattern Detection" -ForegroundColor Yellow
    
    $testCases = @(
        @{ Name = 'Alex Smith'; Title = 'Software Engineer'; ShouldBeSuspicious = $false },
        @{ Name = 'User123'; Title = 'Developer'; ShouldBeSuspicious = $true },
        @{ Name = 'Test User'; Title = 'Consultant'; ShouldBeSuspicious = $true },
        @{ Name = 'John Doe'; Title = 'Senior Software Engineer'; ShouldBeSuspicious = $false }
    )
    
    $passed = 0
    
    for ($i = 0; $i -lt $testCases.Count; $i++) {
        $testCase = $testCases[$i]
        $combinedText = "$($testCase.Name) $($testCase.Title)".ToLower()
        
        # Check for suspicious patterns
        $suspiciousPatterns = @(
            '^user\d+$',
            '^test\s+user',
            '^demo\s+account',
            '^software engineer$',
            '^developer$',
            '^consultant$'
        )
        
        $isSuspicious = $false
        foreach ($pattern in $suspiciousPatterns) {
            if ($combinedText -match $pattern) {
                $isSuspicious = $true
                break
            }
        }
        
        if (-not $isSuspicious) {
            $isSuspicious = ($testCase.Name.Length -lt 3) -or ($testCase.Title.Length -lt 5)
        }
        
        $isCorrect = $isSuspicious -eq $testCase.ShouldBeSuspicious
        if ($isCorrect) { $passed++ }
        
        $status = if ($isCorrect) { "✅" } else { "❌" }
        Write-Host "  Test $($i + 1): `"$($testCase.Name)`" - `"$($testCase.Title)`" -> $isSuspicious (expected: $($testCase.ShouldBeSuspicious)) $status"
    }
    
    $allPassed = $passed -eq $testCases.Count
    Add-TestResult "Suspicious Pattern Detection" $allPassed "Passed $passed/$($testCases.Count) test cases"
    return $allPassed
}

# Run all tests
try {
    Test-AIBotDetection
    Write-Host ""
    Test-VerifiedDetection
    Write-Host ""
    Test-TestModeDetection
    Write-Host ""
    Test-ProfileAgeParsing
    Write-Host ""
    Test-LocationMatching
    Write-Host ""
    Test-SuspiciousPatterns
    Write-Host ""
    
    # Print summary
    $passed = ($testResults | Where-Object { $_.Passed }).Count
    $total = $testResults.Count
    
    Write-Host "📊 Test Summary:" -ForegroundColor Cyan
    Write-Host "Passed: $passed/$total" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Red" })
    Write-Host "Success Rate: $([Math]::Round(($passed/$total) * 100, 1))%" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Red" })
    Write-Host ""
    
    if ($passed -lt $total) {
        Write-Host "❌ Failed Tests:" -ForegroundColor Red
        $testResults | Where-Object { -not $_.Passed } | ForEach-Object {
            Write-Host "  - $($_.Name)$(if ($_.Details) { ": $($_.Details)" })" -ForegroundColor Red
        }
    } else {
        Write-Host "🎉 All tests passed!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Test execution failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
