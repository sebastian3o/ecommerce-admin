import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { errorMonitor } from "events";
import { NextRequest, NextResponse } from "next/server";
export async function PATCH(
    req:NextRequest,
    {params}:{params:{storeId:string}}
){
try{
 const body = await req.json();
 const {name} = body;
 const {userId}  = await auth();
 
 if(!userId){
     
     return new NextResponse("Unauthenticated",{status:401})  
    }
 if(!name){
    return new NextResponse("Name is required",{status:400})
 }
 if(!(await params).storeId){
    return new NextResponse("Store id is required",{status:400})
 }

 const store = await prismadb.store.updateMany({
    where:{
        id:(await params).storeId,
        userId
    },
    data:{
        name
    }
 })

 
 return NextResponse.json(store)
}catch(error){
    console.log('[STORE_PATCH]',error);
    return new NextResponse("internal error",{status:500});

}

}

export async function DELETE(
    req:Request,
    {params}:{params:{storeId:string}}
){
try{
 const {userId}=await auth();
 
 if(!userId){
  return new NextResponse("Unauthenticated",{status:401})  
 }

 if(!(await params).storeId){
    return new NextResponse("Store id is required",{status:400})
 }

 const store = await prismadb.store.deleteMany({
    where:{
        id:(await params).storeId,
        userId
    }
 })

 return NextResponse.json(store)

}catch(error){
    console.log('[STORE_DELETE]',error);
    return new NextResponse("internal error",{status:500});

}
}
