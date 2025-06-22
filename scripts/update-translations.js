const fs = require('fs');
const path = require('path');

// Paths
const translationsDir = path.join(__dirname, '../src/translations');
const baseLang = 'en.json';

// Read base translation file
const basePath = path.join(translationsDir, baseLang);
const baseTranslations = JSON.parse(fs.readFileSync(basePath, 'utf8'));

// Get all translation files except base
const files = fs.readdirSync(translationsDir)
  .filter(file => file.endsWith('.json') && file !== baseLang);

// Function to update translations
function updateTranslations(base, existing) {
  const result = {};
  
  for (const [key, value] of Object.entries(base)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle nested objects
      result[key] = updateTranslations(value, existing?.[key] || {});
    } else if (existing && key in existing) {
      // Keep existing translation
      result[key] = existing[key];
    } else {
      // Use base (English) as fallback
      result[key] = value;
      console.log(`  - Added missing key: ${key} (using English: ${value})`);
    }
  }
  
  return result;
}

// Process each file
console.log('Updating translation files...');
files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  try {
    console.log(`\nProcessing: ${file}`);
    
    // Read existing translations
    const existingTranslations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Update translations
    const updated = updateTranslations(baseTranslations, existingTranslations);
    
    // Write back to file with proper formatting
    fs.writeFileSync(
      filePath, 
      JSON.stringify(updated, null, 2) + '\n',
      'utf8'
    );
    
    console.log(`✅ Updated: ${file}`);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\nTranslation update complete!');
