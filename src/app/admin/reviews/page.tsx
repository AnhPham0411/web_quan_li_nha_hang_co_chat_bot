import { prisma } from "@/lib/prisma";
import ReviewsClient from "./ReviewsClient";
import { serializePrisma } from "@/lib/utils";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          table: true,
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      },
    },
  });

  // Simple serialization
  const serializedReviews = serializePrisma(reviews);

  return <ReviewsClient initialReviews={serializedReviews as any} />;
}
