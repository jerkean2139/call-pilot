# Database Setup Script for CoreTrack
Write-Host "Setting up CoreTrack database with Docker..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running." -ForegroundColor Green
}
catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Build and start the containers
Write-Host "Starting PostgreSQL and pgAdmin containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
$timeout = 30
$elapsed = 0

while ($elapsed -lt $timeout) {
    try {
        $result = docker exec coretrack-db pg_isready -U coretrack
        if ($result -match "accepting connections") {
            Write-Host "Database is ready!" -ForegroundColor Green
            break
        }
    }
    catch {
        # Still waiting
    }
    
    Start-Sleep -Seconds 1
    $elapsed++
}

if ($elapsed -ge $timeout) {
    Write-Host "Timeout waiting for database to be ready." -ForegroundColor Red
    exit 1
}

# Show connection info
Write-Host "`nDatabase setup complete!" -ForegroundColor Green
Write-Host "`nConnection Details:" -ForegroundColor Cyan
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5434" -ForegroundColor White
Write-Host "  Database: coretrack" -ForegroundColor White
Write-Host "  Username: coretrack" -ForegroundColor White
Write-Host "  Password: coretrack123" -ForegroundColor White
Write-Host "`npgAdmin:" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:5050" -ForegroundColor White
Write-Host "  Email: admin@coretrack.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White

Write-Host "`nTo stop the database, run: docker-compose down" -ForegroundColor Yellow
