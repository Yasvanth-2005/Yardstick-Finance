import { NextResponse } from "next/server";

export async function GET() {
  const categories = [
    "Food",
    "Transportation",
    "Housing",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Other",
  ];
  return NextResponse.json(categories);
}
