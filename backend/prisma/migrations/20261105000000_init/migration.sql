-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "refreshTokenId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL DEFAULT 'profile',
    "name" TEXT NOT NULL DEFAULT 'AJENEZA M. Thierry',
    "headline" TEXT NOT NULL DEFAULT '',
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shortBio" TEXT NOT NULL DEFAULT '',
    "fullBio" TEXT NOT NULL DEFAULT '',
    "story" TEXT NOT NULL DEFAULT '',
    "education" JSONB NOT NULL DEFAULT '[]',
    "journey" TEXT NOT NULL DEFAULT '',
    "careerInterests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "philosophy" TEXT NOT NULL DEFAULT '',
    "vision" TEXT NOT NULL DEFAULT '',
    "mission" TEXT NOT NULL DEFAULT '',
    "skills" JSONB NOT NULL DEFAULT '[]',
    "languages" JSONB NOT NULL DEFAULT '[]',
    "aspirations" TEXT NOT NULL DEFAULT '',
    "leadershipBio" TEXT NOT NULL DEFAULT '',
    "speakingTopics" JSONB NOT NULL DEFAULT '[]',
    "portrait" JSONB,
    "location" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'settings',
    "siteTitle" TEXT NOT NULL DEFAULT 'AJENEZA M. Thierry',
    "titleTemplate" TEXT NOT NULL DEFAULT '%s | AJENEZA M. Thierry',
    "heroKicker" TEXT NOT NULL DEFAULT 'A personal portfolio & journal',
    "heroTitle" TEXT NOT NULL DEFAULT 'Ideas that shape us.',
    "heroHighlight" TEXT NOT NULL DEFAULT 'Work that moves us.',
    "heroLede" TEXT NOT NULL DEFAULT '',
    "heroCaption" TEXT NOT NULL DEFAULT 'Curious by nature. Building with purpose.',
    "tagline" TEXT NOT NULL DEFAULT 'Technology. Journalism. Literature. Leadership.',
    "heroQuote" TEXT NOT NULL DEFAULT 'Exploring ideas. Building solutions. Telling stories. Creating impact.',
    "description" TEXT NOT NULL DEFAULT 'Journalist, author, software developer and Co-Founder of OrLabs Tech Industries.',
    "contactEmail" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "now" JSONB NOT NULL DEFAULT '{}',
    "mediaKit" JSONB NOT NULL DEFAULT '{}',
    "defaultOgImage" TEXT,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "commentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" UUID NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "coverImage" JSONB,
    "categoryId" UUID,
    "authorId" UUID,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "readingTime" INTEGER NOT NULL DEFAULT 1,
    "views" INTEGER NOT NULL DEFAULT 0,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTag" (
    "articleId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("articleId","tagId")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'book',
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" JSONB,
    "publicationStatus" TEXT NOT NULL DEFAULT 'upcoming',
    "publisher" TEXT,
    "publicationDate" TIMESTAMP(3),
    "isbn" TEXT,
    "pages" INTEGER,
    "genre" TEXT,
    "excerpts" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "purchaseLinks" JSONB NOT NULL DEFAULT '[]',
    "downloadUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "problem" TEXT NOT NULL DEFAULT '',
    "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" JSONB NOT NULL DEFAULT '[]',
    "devStatus" TEXT NOT NULL DEFAULT 'planning',
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "docsUrl" TEXT,
    "dateCreated" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venture" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "mission" TEXT NOT NULL DEFAULT '',
    "vision" TEXT NOT NULL DEFAULT '',
    "services" JSONB NOT NULL DEFAULT '[]',
    "solutions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "products" JSONB NOT NULL DEFAULT '[]',
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "collaboration" TEXT NOT NULL DEFAULT '',
    "website" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "logo" JSONB,
    "foundedYear" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentureProject" (
    "ventureId" UUID NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "VentureProject_pkey" PRIMARY KEY ("ventureId","projectId")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "issuer" TEXT,
    "date" TIMESTAMP(3),
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'speaking',
    "date" TIMESTAMP(3),
    "location" TEXT,
    "organizer" TEXT,
    "topic" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "images" JSONB NOT NULL DEFAULT '[]',
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEntry" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'career',
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "organization" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Research" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'insight',
    "abstract" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "coverImage" JSONB,
    "categoryId" UUID,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "readingTime" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTag" (
    "researchId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "ResearchTag_pkey" PRIMARY KEY ("researchId","tagId")
);

-- CreateTable
CREATE TABLE "ReadingItem" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'book',
    "url" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "coverImage" JSONB,
    "shelf" TEXT NOT NULL DEFAULT 'recommended',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seo" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL,
    "articleId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "kind" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT NOT NULL DEFAULT '',
    "folder" TEXT NOT NULL DEFAULT 'general',
    "uploadedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "referrerHost" TEXT,
    "country" TEXT,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Category_section_order_name_idx" ON "Category"("section", "order", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_section_slug_key" ON "Category"("section", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_featured_publishedAt_idx" ON "Article"("featured", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Article_section_slug_key" ON "Article"("section", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- CreateIndex
CREATE INDEX "Book_status_publishedAt_idx" ON "Book"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_publishedAt_idx" ON "Project"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Project_featured_order_idx" ON "Project"("featured", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Venture_slug_key" ON "Venture"("slug");

-- CreateIndex
CREATE INDEX "Venture_status_publishedAt_idx" ON "Venture"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_slug_key" ON "Achievement"("slug");

-- CreateIndex
CREATE INDEX "Achievement_status_publishedAt_idx" ON "Achievement"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_publishedAt_idx" ON "Event"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineEntry_slug_key" ON "TimelineEntry"("slug");

-- CreateIndex
CREATE INDEX "TimelineEntry_status_publishedAt_idx" ON "TimelineEntry"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Research_slug_key" ON "Research"("slug");

-- CreateIndex
CREATE INDEX "Research_status_publishedAt_idx" ON "Research"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingItem_slug_key" ON "ReadingItem"("slug");

-- CreateIndex
CREATE INDEX "ReadingItem_status_publishedAt_idx" ON "ReadingItem"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_status_createdAt_idx" ON "Subscriber"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_status_createdAt_idx" ON "Comment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Media_kind_folder_createdAt_idx" ON "Media"("kind", "folder", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_day_path_idx" ON "PageView"("day", "path");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentureProject" ADD CONSTRAINT "VentureProject_ventureId_fkey" FOREIGN KEY ("ventureId") REFERENCES "Venture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentureProject" ADD CONSTRAINT "VentureProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTag" ADD CONSTRAINT "ResearchTag_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTag" ADD CONSTRAINT "ResearchTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
