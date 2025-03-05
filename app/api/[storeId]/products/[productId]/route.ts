import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function GET(
    req:Request,
    {params}:{params:Promise<{productId:string}>}
){
try{
 
 if(! (await params).productId){
    return new NextResponse("Product id is required",{status:400})
 }
 
 const product = await prismadb.product.findUnique({
    where:{
        id:(await params).productId,
    },
    include: {
        images: true,
        category: true,
        size: true,
        color: true,
      },
 })

 return NextResponse.json(product)

}catch(error){
    console.log('[PRODUCT_GET]',error);
    return new NextResponse("internal error",{status:500});

}
}


export async function PATCH(
    req:Request,
    {params}:{params:Promise<{storeId:string,productId:string}>}
){
try{
 const {userId }=await auth();
 const body = await req.json();
 const {
    name,
    price,
    categoryId,
    sizeId,
    colorId,
    images,
    isFeatured,
    isArchived,
  } = body

  
 if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name) {
      return new NextResponse('Missing name', { status: 400 })
    }

    if (!price) {
      return new NextResponse('Missing price', { status: 400 })
    }

    if (!categoryId) {
      return new NextResponse('Missing categoryId', { status: 400 })
    }

    if (!sizeId) {
      return new NextResponse('Missing sizeId', { status: 400 })
    }

    if (!colorId) {
      return new NextResponse('Missing colorId', { status: 400 })
    }

    if (!images || !images.length) {
      return new NextResponse('Missing images', { status: 400 })
    }

    if (!(await params).productId) {
      return new NextResponse('Missing product id', { status: 400 })
    }
 const storeByUserId = await prismadb.store.findFirst({
    where: {
        id:(await params).storeId,
        userId
    }
})
if(!storeByUserId){
    return new NextResponse("Unauthorized",{status:403})
}
await prismadb.product.update({
    where: {
      id: (await params).productId,
    },
    data: {
      name,
      price,
      categoryId,
      sizeId,
      colorId,
      isFeatured,
      isArchived,
      images: {
        deleteMany: {},
      },
    },
  })

  const product = await prismadb.product.update({
    where: {
      id: (await params).productId,
    },
    data: {
      images: {
        createMany: {
          data: [...images.map((image: { url: string }) => image)],
        },
      },
    },
  })

 return NextResponse.json(product)

}catch(error){
    console.log('[PRODUCT_PATCH]',error);
    return new NextResponse("internal error",{status:500});

}
}

export async function DELETE(
    req:Request,
    {params}:{params:Promise<{storeId:string,productId:string}>}
){
try{
 const {userId}=await auth();
 
 if(!userId){
  return new NextResponse("Unauthenticated",{status:401})  
 }

 if(!(await params).productId){
    return new NextResponse("Product id is required to delete",{status:400})
 }
 const storeByUserId = await prismadb.store.findFirst({
    where: {
        id:(await params).storeId,
        userId
    }
})
if(!storeByUserId){
    return new NextResponse("Unauthorized",{status:403})
}
 const product = await prismadb.product.deleteMany({
    where:{
        id:(await params).productId,
    }
 })

 return NextResponse.json(product)

}catch(error){
    console.log('[PRODUCT_DELETE]',error);
    return new NextResponse("internal error",{status:500});

}
}
