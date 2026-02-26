import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){

    const user=await currentUser();
    
    if(!user?.primaryEmailAddress?.emailAddress){
        return NextResponse.json({error: "User email not found"}, {status: 400});
    }

    //if user in db
    const users=await db.select().from(usersTable)
    .where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress))
    //.where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress))

    //if user is not in db then create new user
    if(users?.length===0){
        const newUser=await db.insert(usersTable).values({
            email:user?.primaryEmailAddress?.emailAddress as string,
            name:user?.fullName as string,
    }).returning();

    return NextResponse.json(newUser[0]);
  }
  return NextResponse.json(users[0]);
}