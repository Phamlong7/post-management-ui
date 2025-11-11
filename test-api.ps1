# API Connectivity Test Script for PowerShell
# Run: .\test-api.ps1

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Post Management API Connection Test" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Url,
        [hashtable]$Body
    )
    
    Write-Host "Testing $Method $Endpoint" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri        = $Url
            Method     = $Method
            Headers    = @{ "Content-Type" = "application/json" }
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-WebRequest @params
        $httpCode = $response.StatusCode
        
        Write-Host "Success (HTTP $httpCode)" -ForegroundColor Green
        if ($response.Content) {
            $json = $response.Content | ConvertFrom-Json
            Write-Host "Response: $($json | ConvertTo-Json -Depth 2)" -ForegroundColor Green
        }
        Write-Host ""
    }
    catch {
        $httpCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "Failed (HTTP $httpCode)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Get API URL from environment or use default
$apiUrl = if ($env:NEXT_PUBLIC_API_URL) { $env:NEXT_PUBLIC_API_URL } else { "http://localhost:5203/api" }

Write-Host "Testing API at: $apiUrl" -ForegroundColor White
Write-Host ""

# Test 1: Get all posts
Test-Endpoint "GET" "GET /api/posts" "$apiUrl/posts"

# Test 2: Get all posts with search
Test-Endpoint "GET" "GET /api/posts?search=test" "$apiUrl/posts?search=test"

# Test 3: Get all posts with sort
Test-Endpoint "GET" "GET /api/posts?sortOrder=asc" "$apiUrl/posts?sortOrder=asc"

# Test 4: Create post
$testPost = @{
    name        = "Test Post $(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Test Description from PowerShell"
    image       = "https://via.placeholder.com/400x300"
}
Test-Endpoint "POST" "POST /api/posts" "$apiUrl/posts" $testPost

# Test 5: Get post by ID (assuming ID 1 exists)
Test-Endpoint "GET" "GET /api/posts/1" "$apiUrl/posts/1"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "API Connection Test Complete" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
