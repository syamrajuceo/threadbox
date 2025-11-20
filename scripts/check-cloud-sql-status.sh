#!/bin/bash

# Quick script to check Cloud SQL instance status

PROJECT_ID="threadbox-production"
INSTANCE_NAME="threadbox-db"

echo "Checking Cloud SQL instance status..."
echo ""

STATUS=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(state)" 2>/dev/null || echo "NOT_FOUND")

if [ "$STATUS" = "NOT_FOUND" ]; then
    echo "❌ Instance '$INSTANCE_NAME' not found"
    exit 1
fi

case "$STATUS" in
    "RUNNABLE")
        echo "✅ Instance is READY (RUNNABLE)"
        echo ""
        echo "You can now run: ./scripts/setup-cloud-sql.sh"
        ;;
    "PENDING_CREATE")
        echo "⏳ Instance is being created (PENDING_CREATE)"
        echo "   This usually takes 5-10 minutes. Please wait..."
        ;;
    "PENDING_UPDATE")
        echo "⏳ Instance is being updated (PENDING_UPDATE)"
        ;;
    "MAINTENANCE")
        echo "🔧 Instance is in maintenance (MAINTENANCE)"
        ;;
    "FAILED")
        echo "❌ Instance creation FAILED"
        echo "   Check the Cloud Console for details"
        ;;
    *)
        echo "ℹ️  Instance status: $STATUS"
        ;;
esac

echo ""
echo "Full details:"
gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="table(name,databaseVersion,region,tier,state,ipAddresses[0].ipAddress)"

