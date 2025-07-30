#!/bin/bash

# Script to update all remaining localhost:5001 URLs to use API_BASE_URL

# Add API_BASE_URL import to files that need it
add_import_to_file() {
    local file="$1"
    if ! grep -q "API_BASE_URL" "$file"; then
        # Find the line with the last import statement
        local last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
        if [ -n "$last_import_line" ]; then
            # Add the import after the last import
            sed -i '' "${last_import_line}a\\
import { API_BASE_URL } from '../utils/apiUtils';
" "$file"
            echo "Added API_BASE_URL import to $file"
        fi
    fi
}

# Replace localhost URLs in a file
replace_urls_in_file() {
    local file="$1"
    
    # Add import first
    add_import_to_file "$file"
    
    # Replace all localhost:5001 URLs
    sed -i '' 's|"http://localhost:5001|`${API_BASE_URL}|g' "$file"
    sed -i '' 's|http://localhost:5001|${API_BASE_URL}|g' "$file"
    
    # Fix any double API_BASE_URL issues
    sed -i '' 's|${API_BASE_URL}${API_BASE_URL}|${API_BASE_URL}|g' "$file"
    
    echo "Updated URLs in $file"
}

# List of files that still need updating
files=(
    "src/assets/components/pages/StudentRequests.tsx"
    "src/assets/components/pages/adminMessages.tsx"
    "src/assets/components/pages/EditInternship.tsx"
    "src/assets/components/pages/EditAdminProfile.tsx"
    "src/assets/components/pages/Contact.tsx"
    "src/assets/components/pages/SaveList.tsx"
    "src/assets/components/pages/InternshipAdminPage.tsx"
    "src/assets/components/pages/SupervisorReportPage.tsx"
    "src/assets/components/pages/StudentDash/InternshipSection.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        replace_urls_in_file "$file"
    else
        echo "File not found: $file"
    fi
done

echo "URL updates completed!"
