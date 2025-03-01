import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req:Request,
    {params}:{params:{storeId:string}}
) {
try{

    const { userId } = await auth();
    const body= await req.json();
    const {
      name,
      price,
      categoryId,
      sizeId,
      colorId,
      images,
      isFeatured,
      isArchived,
    } =body;

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
  

    if(!(await params).storeId)
        {
            return new NextResponse("Store id is requiered",{status:400});
        }
    const storeByUserId = await prismadb.store.findFirst({
        where: {
            id: (await params).storeId,
            userId
        }
    })
    if(!storeByUserId){
        return new NextResponse("Unauthorized",{status:403})
    }
    const product = await prismadb.product.create({
        data: {
          name,
          price,
          categoryId,
          sizeId,
          colorId,
          isFeatured,
          isArchived,
          storeId: params.storeId,
          images: {
            createMany: {
              data: [...images.map((image: { url: string }) => image)],
            },
          },
        },
      })

    return NextResponse.json(product)



}catch(error){
    console.log('[PRODUCTS_POST]',error);
    return new NextResponse("internal error",{status:500});
}
}

export async function GET(
    req:Request,
    {params}:{params:{storeId:string}}
) {
try{

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const colorId = searchParams.get('colorId') || undefined
    const sizeId = searchParams.get('sizeId') || undefined
    const isFeatured = searchParams.get('isFeatured')


    if(!params.storeId)
        {
            return new NextResponse("Store id is requiered",{status:400});
        }
        const products = await prismadb.product.findMany({
            where: {
              storeId: params.storeId,
              categoryId,
              colorId,
              sizeId,
              isFeatured: isFeatured ? true : undefined,
              isArchived: false,
            },
            include: {
              images: true,
              category: true,
              color: true,
              size: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          })

    return NextResponse.json(products)



}catch(error){
    console.log('[PRODUCTS_GET]',error);
    return new NextResponse("internal error",{status:500});
}
}



