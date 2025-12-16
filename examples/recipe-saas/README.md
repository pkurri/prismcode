# Recipe SaaS Example

## Feature Description

**"Build a recipe sharing platform where users can discover, save, and share recipes with AI-powered meal planning"**

## Generated Output

This example demonstrates PrismCode's complete output for a real SaaS application.

### Files Included

- `project-plan.md` - Complete feature analysis and requirements
- `github-issues.json` - Ready-to-import GitHub issues (40+ issues)
- `architecture.md` - Full system architecture
- `n8n-workflow.json` - Automation workflow for issue creation
- `cursor-prompts/` - IDE prompts for each component

### Project Statistics

- **Epics**: 8
- **Stories**: 24
- **Tasks**: 78
- **Estimated Timeline**: 12 weeks (3 sprints)
- **Team Size**: 3-4 developers

### Architecture Highlights

**Frontend**:
- React 18 with TypeScript
- TanStack Query for server state
- Zustand for client state
- shadcn/ui components
- Tailwind CSS

**Backend**:
- Node.js with Express
- PostgreSQL with Prisma ORM
- Redis for caching
- OpenAI API for meal planning

**Infrastructure**:
- Vercel (frontend)
- Railway (backend + DB)
- Cloudinary (image storage)
- GitHub Actions (CI/CD)

### Key Features

1. User authentication (email + OAuth)
2. Recipe CRUD operations
3. Recipe discovery with search/filters
4. Collections (save recipes)
5. Social features (comments, ratings)
6. AI meal planning
7. Shopping list generation
8. Nutritional information

### Epics Breakdown

#### Epic 1: User Authentication & Profiles
- OAuth 2.0 (Google, Facebook)
- JWT token management
- User profiles with preferences
- Password reset flow

#### Epic 2: Recipe Management
- Create/edit/delete recipes
- Rich text editor for instructions
- Image upload with optimization
- Recipe versioning

#### Epic 3: Discovery & Search
- Full-text search (Typesense)
- Filters (cuisine, diet, time, difficulty)
- Trending recipes algorithm
- Personalized recommendations

#### Epic 4: Collections & Favorites
- Create collections (public/private)
- Add recipes to collections
- Share collections
- Collection discovery

#### Epic 5: Social Features
- Comments on recipes
- Star ratings
- Follow users
- Activity feed

#### Epic 6: AI Meal Planning
- Weekly meal plan generation
- Dietary preference consideration
- Calorie/macro tracking
- Recipe substitution suggestions

#### Epic 7: Shopping Lists
- Auto-generate from meal plans
- Ingredient aggregation
- Share shopping lists
- Mark items as purchased

#### Epic 8: Admin & Analytics
- Admin dashboard
- User analytics
- Recipe moderation
- Performance monitoring

### How This Was Generated

```bash
npm run plan -- \
  --feature "Recipe sharing platform with AI meal planning" \
  --tech-stack "React,Node.js,PostgreSQL,Redis" \
  --scale startup \
  --integrations "OpenAI,Stripe,SendGrid" \
  --output examples/recipe-saas
```

### Using This Example

#### 1. Import Issues to GitHub

```bash
# Using GitHub CLI
gh repo create my-recipe-app --public
cd examples/recipe-saas
node ../../scripts/import-issues.js github-issues.json
```

#### 2. Import n8n Workflow

1. Open n8n
2. Import `n8n-workflow.json`
3. Configure GitHub credentials
4. Execute to create all issues automatically

#### 3. Use Cursor Prompts

```bash
# Copy prompts to your project
cp -r cursor-prompts/ ~/my-recipe-app/.prismcode/

# Open in Cursor IDE
cursor ~/my-recipe-app

# Load prompt for first task
cat .prismcode/cursor-prompts/001-setup-project.md
```

### Next Steps

1. Review `project-plan.md` for complete requirements
2. Set up GitHub repository
3. Import issues
4. Start with Epic 1 (Authentication)
5. Follow Cursor prompts for implementation

### Adaptations

This example can be adapted for:
- Different tech stacks (Vue, Python, etc.)
- Different scales (MVP, enterprise)
- Additional features (video recipes, live cooking)
- Different domains (workout plans, travel itineraries)

### Questions?

See [PrismCode Documentation](../../docs/) or [open a discussion](https://github.com/pkurri/prismcode/discussions).