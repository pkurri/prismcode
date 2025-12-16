#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that the development environment is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REQUIRED_NODE_VERSION = 18;
const REQUIRED_ENV_VARS = ['GITHUB_TOKEN'];
const OPTIONAL_ENV_VARS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'N8N_WEBHOOK_URL'];

let errors = [];
let warnings = [];

console.log('\n🔍 PrismCode Environment Validation\n');
console.log('='.repeat(60));

// Check Node.js version
try {
    const nodeVersion = process.version.match(/^v(\d+)\./)[1];
    if (parseInt(nodeVersion) >= REQUIRED_NODE_VERSION) {
        console.log(`✅ Node.js version: ${process.version}`);
    } else {
        errors.push(`Node.js version ${process.version} is too old. Required: v${REQUIRED_NODE_VERSION}+`);
    }
} catch (error) {
    errors.push('Failed to check Node.js version');
}

// Check npm
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    console.log(`✅ npm version: ${npmVersion}`);
} catch (error) {
    errors.push('npm is not installed or not in PATH');
}

// Check Git
try {
    const gitVersion = execSync('git --version', { encoding: 'utf-8' }).trim();
    console.log(`✅ ${gitVersion}`);
} catch (error) {
    errors.push('git is not installed or not in PATH');
}

// Check .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');

    // Load and check environment variables
    require('dotenv').config({ path: envPath });

    for (const varName of REQUIRED_ENV_VARS) {
        if (process.env[varName]) {
            console.log(`✅ ${varName} is set`);
        } else {
            errors.push(`Required environment variable ${varName} is not set in .env`);
        }
    }

    for (const varName of OPTIONAL_ENV_VARS) {
        if (process.env[varName]) {
            console.log(`✅ ${varName} is set (optional)`);
        } else {
            warnings.push(`Optional environment variable ${varName} is not set`);
        }
    }
} else {
    errors.push('.env file not found. Copy .env.example to .env and configure it.');
}

// Check package.json dependencies
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
    console.log('✅ package.json exists');

    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    const requiredDeps = ['@octokit/rest', 'typescript'];
    for (const dep of requiredDeps) {
        if (deps[dep]) {
            console.log(`✅ ${dep} is listed in dependencies`);
        } else {
            warnings.push(`${dep} is not in package.json dependencies`);
        }
    }
} else {
    errors.push('package.json not found');
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ node_modules directory exists');
} else {
    warnings.push('node_modules not found. Run: npm install');
}

// Check TypeScript
try {
    const tscPath = path.join(__dirname, '..', 'node_modules', '.bin', 'tsc');
    if (fs.existsSync(tscPath) || fs.existsSync(tscPath + '.cmd')) {
        console.log('✅ TypeScript compiler available');
    } else {
        warnings.push('TypeScript compiler not found in node_modules');
    }
} catch (error) {
    warnings.push('Failed to check TypeScript compiler');
}

// Summary
console.log('\n' + '='.repeat(60));

if (errors.length > 0) {
    console.log('\n❌ ERRORS:\n');
    errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    warnings.forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All checks passed! Your environment is ready.');
    console.log('\n📌 Next steps:');
    console.log('   1. Run: npm run build');
    console.log('   2. Run: npm test');
    console.log('   3. Start developing!');
} else if (errors.length === 0) {
    console.log('\n✅ Environment is functional (with warnings)');
    console.log('   You can proceed, but consider addressing the warnings.');
} else {
    console.log('\n❌ Environment setup incomplete');
    console.log('   Please fix the errors above before proceeding.');
    process.exit(1);
}

console.log('\n' + '='.repeat(60) + '\n');
