import { getPrimaryIndexerUrl } from '@/types/angor';

// Test the indexer configuration
// Mainnet Primary URL:', getPrimaryIndexerUrl('mainnet')
// Testnet Primary URL:', getPrimaryIndexerUrl('testnet')

// Test API endpoints
async function testEndpoints() {
  const mainnetUrl = getPrimaryIndexerUrl('mainnet');
  const testnetUrl = getPrimaryIndexerUrl('testnet');
  
  try {
    const mainnetResponse = await fetch(`${mainnetUrl}api/query/Angor/projects?offset=0&limit=5`);
    
    if (mainnetResponse.ok) {
      const mainnetData = await mainnetResponse.json();
      if (Array.isArray(mainnetData) && mainnetData.length > 0) {
        
        // Test stats endpoint for the first project
        const projectId = mainnetData[0].projectIdentifier;
        try {
          const statsResponse = await fetch(`${mainnetUrl}api/query/Angor/projects/${projectId}/stats`);
          if (statsResponse.ok) {
            await statsResponse.json();
          }
        } catch {
          // Silent fail
        }
        
        // Test individual project endpoint
        try {
          const projectResponse = await fetch(`${mainnetUrl}api/query/Angor/projects/${projectId}`);
          if (projectResponse.ok) {
            await projectResponse.json();
          }
        } catch {
          // Silent fail
        }
      }
    }
  } catch {
    // Silent fail
  }
  
  try {
    const testnetResponse = await fetch(`${testnetUrl}api/query/Angor/projects?offset=0&limit=5`);
    
    if (testnetResponse.ok) {
      await testnetResponse.json();
    }
  } catch {
    // Silent fail
  }
}

// Run the test
testEndpoints();

export {};
