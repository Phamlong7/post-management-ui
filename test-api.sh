#!/bin/bash
# API Connectivity Test Script

echo "==================================="
echo "Post Management API Connection Test"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local url=$3
  local data=$4
  
  echo -e "${YELLOW}Testing $method $endpoint${NC}"
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [[ "$http_code" =~ ^(200|201|204)$ ]]; then
    echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
    [ ! -z "$body" ] && echo "Response: $body" | head -c 100
    echo ""
  else
    echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
    echo "Response: $body" | head -c 100
    echo ""
  fi
}

# Check if API URL is provided
API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:5203/api}"

echo "Testing API at: $API_URL"
echo ""

# Test 1: Get all posts
test_endpoint "GET" "GET /api/posts" "$API_URL/posts"

# Test 2: Get all posts with search
test_endpoint "GET" "GET /api/posts?search=test" "$API_URL/posts?search=test"

# Test 3: Get all posts with sort
test_endpoint "GET" "GET /api/posts?sortOrder=asc" "$API_URL/posts?sortOrder=asc"

# Test 4: Create post
test_endpoint "POST" "POST /api/posts" "$API_URL/posts" \
  '{"name":"Test Post","description":"Test Description","image":"https://via.placeholder.com/400x300"}'

# Test 5: Get post by ID (assuming ID 1 exists)
test_endpoint "GET" "GET /api/posts/1" "$API_URL/posts/1"

echo "==================================="
echo "API Connection Test Complete"
echo "==================================="
