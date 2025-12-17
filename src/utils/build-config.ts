/**
 * Build Configuration - Optimization settings
 * 
 * Implements #25 - Build Optimization
 */

/**
 * Build optimization configuration
 */
export interface BuildConfig {
    /** Minify output */
    minify: boolean;

    /** Generate source maps */
    sourceMaps: boolean;

    /** Tree shaking */
    treeShaking: boolean;

    /** Code splitting */
    codeSplitting: boolean;

    /** Output directory */
    outDir: string;

    /** Target environment */
    target: 'node18' | 'node20' | 'node22' | 'browser';

    /** Bundle format */
    format: 'esm' | 'cjs' | 'iife';
}

/**
 * Default build configuration
 */
export const defaultBuildConfig: BuildConfig = {
    minify: process.env.NODE_ENV === 'production',
    sourceMaps: process.env.NODE_ENV !== 'production',
    treeShaking: true,
    codeSplitting: true,
    outDir: 'dist',
    target: 'node22',
    format: 'esm',
};

/**
 * Build optimization recommendations
 */
export const buildRecommendations = {
    production: {
        minify: true,
        sourceMaps: false,
        treeShaking: true,
        codeSplitting: true,
        compression: 'gzip',
    },
    development: {
        minify: false,
        sourceMaps: true,
        treeShaking: false,
        codeSplitting: false,
        hotReload: true,
    },
    testing: {
        minify: false,
        sourceMaps: true,
        treeShaking: false,
        codeSplitting: false,
        coverage: true,
    },
};

/**
 * TypeScript compiler optimization options
 */
export const tsOptimizations = {
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    incremental: true,
    isolatedModules: true,
    verbatimModuleSyntax: true,
};

/**
 * Get optimized build config for environment
 */
export function getOptimizedBuildConfig(env: 'production' | 'development' | 'test'): BuildConfig {
    const base = { ...defaultBuildConfig };

    switch (env) {
        case 'production':
            return {
                ...base,
                minify: true,
                sourceMaps: false,
                treeShaking: true,
                codeSplitting: true,
            };
        case 'development':
            return {
                ...base,
                minify: false,
                sourceMaps: true,
                treeShaking: false,
                codeSplitting: false,
            };
        case 'test':
            return {
                ...base,
                minify: false,
                sourceMaps: true,
                treeShaking: false,
                codeSplitting: false,
            };
        default:
            return base;
    }
}
