#!/usr/bin/env node

/**
 * Simple test script to validate the Substack node structure and basic functionality
 * This test runs without requiring additional testing frameworks
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running basic tests for n8n-nodes-substack...\n');

// Test 1: Verify built files exist
function testBuiltFiles() {
    console.log('✅ Test 1: Checking built files...');
    
    const distPath = path.join(__dirname, 'dist');
    const credentialsPath = path.join(distPath, 'credentials', 'SubstackApi.credentials.js');
    const nodePath = path.join(distPath, 'nodes', 'Substack', 'Substack.node.js');
    
    if (!fs.existsSync(distPath)) {
        throw new Error('❌ dist directory not found. Run "npm run build" first.');
    }
    
    if (!fs.existsSync(credentialsPath)) {
        throw new Error('❌ SubstackApi.credentials.js not found in dist');
    }
    
    if (!fs.existsSync(nodePath)) {
        throw new Error('❌ Substack.node.js not found in dist');
    }
    
    console.log('   ✓ All built files exist\n');
}

// Test 2: Verify node structure
function testNodeStructure() {
    console.log('✅ Test 2: Validating node structure...');
    
    try {
        const SubstackNode = require('./dist/nodes/Substack/Substack.node.js');
        const { Substack } = SubstackNode;
        
        if (!Substack) {
            throw new Error('❌ Substack class not exported properly');
        }
        
        const node = new Substack();
        
        // Check required properties
        if (!node.description) {
            throw new Error('❌ Node description missing');
        }
        
        if (!node.description.displayName || node.description.displayName !== 'Substack') {
            throw new Error('❌ Invalid displayName');
        }
        
        if (!node.description.name || node.description.name !== 'substack') {
            throw new Error('❌ Invalid node name');
        }
        
        if (!node.execute || typeof node.execute !== 'function') {
            throw new Error('❌ Execute function missing or invalid');
        }
        
        // Check resources
        const resourceProperty = node.description.properties.find(p => p.name === 'resource');
        if (!resourceProperty || !resourceProperty.options) {
            throw new Error('❌ Resource property missing or invalid');
        }
        
        const expectedResources = ['note', 'post'];
        const actualResources = resourceProperty.options.map(opt => opt.value);
        
        for (const resource of expectedResources) {
            if (!actualResources.includes(resource)) {
                throw new Error(`❌ Missing resource: ${resource}`);
            }
        }
        
        console.log('   ✓ Node structure is valid');
        console.log('   ✓ Resources available: note, post');
        console.log('   ✓ Execute function present\n');
        
    } catch (error) {
        if (error.message.startsWith('❌')) {
            throw error;
        }
        throw new Error(`❌ Error loading node: ${error.message}`);
    }
}

// Test 3: Verify credentials structure  
function testCredentialsStructure() {
    console.log('✅ Test 3: Validating credentials structure...');
    
    try {
        const CredentialsModule = require('./dist/credentials/SubstackApi.credentials.js');
        const { SubstackApi } = CredentialsModule;
        
        if (!SubstackApi) {
            throw new Error('❌ SubstackApi class not exported properly');
        }
        
        const credentials = new SubstackApi();
        
        if (!credentials.name || credentials.name !== 'substackApi') {
            throw new Error('❌ Invalid credentials name');
        }
        
        if (!credentials.displayName || credentials.displayName !== 'Substack API') {
            throw new Error('❌ Invalid credentials displayName');
        }
        
        if (!credentials.properties || !Array.isArray(credentials.properties)) {
            throw new Error('❌ Properties missing or invalid');
        }
        
        // Check required properties
        const requiredProps = ['publicationAddress', 'apiKey'];
        for (const prop of requiredProps) {
            const found = credentials.properties.find(p => p.name === prop);
            if (!found) {
                throw new Error(`❌ Missing property: ${prop}`);
            }
        }
        
        console.log('   ✓ Credentials structure is valid');
        console.log('   ✓ Required properties present: publicationAddress, apiKey\n');
        
    } catch (error) {
        if (error.message.startsWith('❌')) {
            throw error;
        }
        throw new Error(`❌ Error loading credentials: ${error.message}`);
    }
}

// Test 4: Verify package.json structure
function testPackageStructure() {
    console.log('✅ Test 4: Validating package.json structure...');
    
    const packageJson = require('./package.json');
    
    if (!packageJson.n8n) {
        throw new Error('❌ n8n configuration missing in package.json');
    }
    
    if (!packageJson.n8n.credentials || !Array.isArray(packageJson.n8n.credentials)) {
        throw new Error('❌ n8n credentials configuration missing');
    }
    
    if (!packageJson.n8n.nodes || !Array.isArray(packageJson.n8n.nodes)) {
        throw new Error('❌ n8n nodes configuration missing');
    }
    
    if (!packageJson.keywords.includes('n8n-community-node-package')) {
        throw new Error('❌ Missing required keyword: n8n-community-node-package');
    }
    
    console.log('   ✓ Package.json structure is valid');
    console.log('   ✓ n8n configuration present');
    console.log('   ✓ Community node keyword present\n');
}

// Run all tests
async function runTests() {
    try {
        testBuiltFiles();
        testNodeStructure();
        testCredentialsStructure();
        testPackageStructure();
        
        console.log('🎉 All tests passed successfully!');
        console.log('\nThe n8n-nodes-substack package is properly structured and ready for use.');
        
        process.exit(0);
    } catch (error) {
        console.error(error.message);
        console.log('\n💡 If you see build-related errors, try running: npm run build');
        process.exit(1);
    }
}

runTests();