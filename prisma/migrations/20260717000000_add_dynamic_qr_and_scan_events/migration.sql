-- AlterTable
ALTER TABLE "qr_code" ADD COLUMN     "dynamicQrId" TEXT;

-- CreateTable
CREATE TABLE "dynamic_qr" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "passwordHash" TEXT,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dynamic_qr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_event" (
    "id" TEXT NOT NULL,
    "dynamicQrId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT,
    "region" TEXT,
    "deviceType" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "referrer" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "scan_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dynamic_qr_slug_key" ON "dynamic_qr"("slug");

-- CreateIndex
CREATE INDEX "dynamic_qr_userId_createdAt_idx" ON "dynamic_qr"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "scan_event_dynamicQrId_timestamp_idx" ON "scan_event"("dynamicQrId", "timestamp");

-- CreateIndex
CREATE INDEX "scan_event_dynamicQrId_country_idx" ON "scan_event"("dynamicQrId", "country");

-- CreateIndex
CREATE INDEX "scan_event_dynamicQrId_deviceType_idx" ON "scan_event"("dynamicQrId", "deviceType");

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_dynamicQrId_key" ON "qr_code"("dynamicQrId");

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_dynamicQrId_fkey" FOREIGN KEY ("dynamicQrId") REFERENCES "dynamic_qr"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dynamic_qr" ADD CONSTRAINT "dynamic_qr_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_event" ADD CONSTRAINT "scan_event_dynamicQrId_fkey" FOREIGN KEY ("dynamicQrId") REFERENCES "dynamic_qr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

