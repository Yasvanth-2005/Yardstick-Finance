import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("finance");
    const budgets = await db.collection("budgets").find({}).toArray();
    return NextResponse.json(budgets);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("finance");
    const body = await request.json();

    if (!body.category || !body.amount || !body.month) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const budget = {
      category: body.category,
      amount: parseFloat(body.amount),
      month: body.month,
      createdAt: new Date(),
    };

    const result = await db.collection("budgets").insertOne(budget);
    return NextResponse.json({ ...budget, _id: result.insertedId });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}
