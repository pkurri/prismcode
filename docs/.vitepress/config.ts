import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'PrismCode',
    description: 'AI-powered multi-agent project orchestration platform',

    themeConfig: {
        logo: '/logo.svg',

        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'Agents', link: '/agents/overview' },
            { text: 'API', link: '/api/overview' },
            { text: 'GitHub', link: 'https://github.com/pkurri/prismcode' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    items: [
                        { text: 'What is PrismCode?', link: '/guide/what-is-prismcode' },
                        { text: 'Getting Started', link: '/guide/getting-started' },
                        { text: 'Quick Start', link: '/guide/quick-start' }
                    ]
                },
                {
                    text: 'Core Concepts',
                    items: [
                        { text: 'Architecture', link: '/guide/architecture' },
                        { text: 'Workflows', link: '/guide/workflows' },
                        { text: 'Configuration', link: '/guide/configuration' }
                    ]
                },
                {
                    text: 'Development',
                    items: [
                        { text: 'Development Setup', link: '/guide/development-setup' },
                        { text: 'Contributing', link: '/guide/contributing' },
                        { text: 'Roadmap', link: '/guide/roadmap' }
                    ]
                }
            ],
            '/agents/': [
                {
                    text: 'Agent System',
                    items: [
                        { text: 'Overview', link: '/agents/overview' },
                        { text: 'Base Agent', link: '/agents/base-agent' },
                        { text: 'PM Agent', link: '/agents/pm-agent' },
                        { text: 'Architect Agent', link: '/agents/architect-agent' },
                        { text: 'Coder Agent', link: '/agents/coder-agent' },
                        { text: 'QA Agent', link: '/agents/qa-agent' },
                        { text: 'DevOps Agent', link: '/agents/devops-agent' }
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'API Reference',
                    items: [
                        { text: 'Overview', link: '/api/overview' },
                        { text: 'Core', link: '/api/core' },
                        { text: 'Agents', link: '/api/agents' },
                        { text: 'Types', link: '/api/types' },
                        { text: 'Utils', link: '/api/utils' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/pkurri/prismcode' }
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2025 Prasad Kurri'
        },

        search: {
            provider: 'local'
        }
    },

    markdown: {
        lineNumbers: true
    }
});
