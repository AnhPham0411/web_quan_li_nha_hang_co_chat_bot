import { prisma } from "@/lib/prisma";
import VouchersClient from "./VouchersClient";
import { serializePrisma } from "@/lib/utils";

export default async function VouchersPage() {
  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Convert Decimals to Numbers for the Client Component
  const serializedVouchers = serializePrisma(vouchers);

  return <VouchersClient initialVouchers={serializedVouchers as any} />;
}
