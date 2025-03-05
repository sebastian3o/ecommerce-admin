"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Category, Color, Image, Product, Size } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormLabel,FormItem, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import { useOrigin } from "@/hooks/use-origin";
import ImageUpload from "@/components/ui/image-upload";
import { useAuth } from "@clerk/nextjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    name: z.string().nonempty(),
    images: z.object({url: z.string(),}).array(),
    price: z.coerce.number().min(1),
    categoryId: z.string().min(1),
    colorId: z.string().min(1),
    sizeId: z.string().min(1),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
  })

  interface ProductFormProps {
    initialData:
      | (Product & {
          images: Image[]
        })
      | null
  
    categories: Category[]
    sizes: Size[]
    colors: Color[]
  }



type ProductFormValues =z.infer<typeof formSchema>

export const ProductForm:React.FC<ProductFormProps> = ({
    initialData,
    categories,
    sizes,
    colors
    })=>{
        const { getToken, isLoaded } = useAuth();
        const params = useParams()
        const router = useRouter()

        const[open,setOpen]=useState(false)
        const [loading, setLoading] = useState(false)

        const title=initialData? "Edit product":"Create product";
        const description=initialData? "Edit a product":"Create product";
        const toastMessage=initialData? "Product updated.":"Product created.";
        const action=initialData? "Save changes":"Create";
        

        const form =useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:initialData 
        ? {
            ...initialData,
            price: parseFloat(String(initialData?.price)),
          }
        : {
            name: '',
            images: [],
            price: 0,
            categoryId: '',
            colorId: '',
            sizeId: '',
            isFeatured: false,
            isArchived: false,
          },
    })

    const onSubmit = async (data:ProductFormValues)=>{
        
    for (let attempt = 1; attempt <= 2; attempt++) {
       try{

        window.dispatchEvent(new Event('focus'));
    await new Promise(resolve => setTimeout(resolve, 100));

        setLoading(true)
        const token = await getToken();
      console.log('Token:', token);
      
        if(initialData){
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`,data,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })
        }else{
        await axios.post(`/api/${params.storeId}/products`,data,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })

        }
        router.refresh()
        router.push(`/${params.storeId}/products`) 
        toast.success(toastMessage)
        break;

       }catch(error)
       { 
         if (attempt == 2) {
            toast.error("Something went wrong");
        }
       }finally{
        setLoading(false)
       }
    }
    }

    const onDelete = async ()=>{ 
       
        for (let attempt = 1; attempt <= 2; attempt++) {
        try{
            setLoading(true)

            window.dispatchEvent(new Event('focus'));
        await new Promise(resolve => setTimeout(resolve, 100));

            const token = await getToken();
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`,{
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              })
            router.refresh()
            router.push(`/${params.storeId}/products`)
            toast.success("Product deleted.")
            break;

        }catch(error){
            if (attempt === 2) toast.error("Something went wrong")
        }finally{
            setLoading(false)
            setOpen(false)
        }
    }
    }

    return (
        <>
            <AlertModal 
            isOpen={open}
            onClose={()=>setOpen(false)}
            onConfirm={onDelete}
            loading={loading}>

            </AlertModal>
            <div className="flex items-center justify-between">
                <Heading
                title={title}
                description={description}
                />
                {initialData && (
                <Button 
                disabled={loading}
                variant="destructive"
                size="icon"
                onClick={()=>setOpen(true)}>
                <Trash className="h-4 w-4"></Trash>
                </Button>
                )}
            </div>

            <Separator></Separator>
            <Form {...form}>
                <form 
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
                >
                    <FormField 
                        control={form.control}
                        name="images"
                        render={({field})=>(
                        <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                                <ImageUpload 
                                value={field.value.map((image) => image.url)}
                                disabled={loading}
                                onChange ={(url)=>{
                                    const newValue = [...field.value, { url }];
                                    field.onChange((field.value = newValue));
                                }}
                                onRemove={(url)=>{
                                    const newValue = field.value.filter((current) => current.url !== url);
                                    field.onChange(newValue);
                                }}
                                ></ImageUpload>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                        )}
                        />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                        control={form.control}
                        name="name"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                    <Input 
                                    disabled={loading}
                                    placeholder="Product name"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>

                        )} 
                        />
                        <FormField 
                        control={form.control}
                        name="price"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input 
                                    type="number"
                                    disabled={loading}
                                    placeholder="9.99"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>

                        )} 
                        />
                         <FormField 
                        control={form.control}
                        name="categoryId"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                    <Select
                                    disabled={loading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue
                                            defaultValue={field.value}
                                            placeholder="Select a category"
                                        />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                        <SelectItem 
                                        key={category.id} 
                                        value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                <FormMessage/>
                            </FormItem>

                        )} 
                        />
                        <FormField 
                        control={form.control}
                        name="sizeId"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                    <Select
                                    disabled={loading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue
                                            defaultValue={field.value}
                                            placeholder="Select a size"
                                        />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sizes.map((size) => (
                                        <SelectItem 
                                        key={size.id} 
                                        value={size.id}>
                                            {size.name}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                <FormMessage/>
                            </FormItem>

                        )} 
                        />
                        <FormField 
                        control={form.control}
                        name="colorId"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                    <Select
                                    disabled={loading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue
                                            defaultValue={field.value}
                                            placeholder="Select a color"
                                        />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {colors.map((color) => (
                                        <SelectItem 
                                        key={color.id} 
                                        value={color.id}>
                                            {color.name}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                <FormMessage/>
                            </FormItem>

                        )} 
                        />
                        <FormField 
                        control={form.control}
                        name="isFeatured"
                        render={({field})=>(
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ">
                                <FormControl>
                                    <Checkbox
                                    checked={field.value}
                                    //@ts-ignore
                                    onCheckedChange={field.onChange}
                                    ></Checkbox>
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Featured
                                    </FormLabel>
                                    <FormDescription>
                                        This product will apear on the home page
                                    </FormDescription>
                                </div>
                            </FormItem>

                        )} 
                        />
                        <FormField 
                        control={form.control}
                        name="isArchived"
                        render={({field})=>(
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ">
                                <FormControl>
                                    <Checkbox
                                    checked={field.value}
                                    //@ts-ignore
                                    onCheckedChange={field.onChange}
                                    ></Checkbox>
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Archived
                                    </FormLabel>
                                    <FormDescription>
                                        This product will not appear anywhere in the store.
                                    </FormDescription>
                                </div>
                            </FormItem>

                        )} 
                        />
                    </div>

                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>

                </form>
            </Form>
            
        </>

    )
}