import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("finance");
    const transactions = await db
      .collection("transactions")
      .find({})
      .sort({ date: -1 })
      .toArray();
    return NextResponse.json(transactions);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("finance");
    const body = await request.json();

    if (!body.amount || !body.date || !body.description || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transaction = {
      amount: parseFloat(body.amount),
      date: new Date(body.date),
      description: body.description,
      category: body.category,
      createdAt: new Date(),
    };

    const result = await db.collection("transactions").insertOne(transaction);
    return NextResponse.json({ ...transaction, _id: result.insertedId });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("finance");
    const body = await request.json();

    if (!body._id) {
      return NextResponse.json(
        { error: "Missing transaction ID" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(body._id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID format" },
        { status: 400 }
      );
    }

    const { _id, ...updateData } = body;
    const result = await db
      .collection("transactions")
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { ...updateData, date: new Date(updateData.date) } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transaction updated" });
  } catch (e) {
    console.error("Error updating transaction:", e);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("finance");
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing transaction ID" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transaction deleted" });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
