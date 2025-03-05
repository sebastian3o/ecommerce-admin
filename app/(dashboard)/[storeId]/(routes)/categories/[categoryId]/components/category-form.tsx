"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {  Billboard, Category } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormLabel,FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import { useAuth } from "@clerk/nextjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    name:z.string().min(1),
    billboardId:z.string().min(1)

})

interface CategoryFormProps{
    initialData:Category | null;
    billboards:Billboard[]
}



type CategoryFormValues =z.infer<typeof formSchema>

export const CategoryForm:React.FC<CategoryFormProps> = ({
    initialData,
    billboards
    })=>{
        const { getToken } = useAuth();
        const params = useParams()
        const router = useRouter()

        const[open,setOpen]=useState(false)
        const [loading, setLoading] = useState(false)

        const title=initialData? "Edit category":"Create category";
        const description=initialData? "Edit a category":"Create category";
        const toastMessage=initialData? "Category updated.":"Category created.";
        const action=initialData? "Save changes":"Create";
        

        const form =useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:initialData || {
            name:'',
            billboardId:''
        }
    })

    const onSubmit = async (data:CategoryFormValues)=>{
        
    for (let attempt = 1; attempt <= 2; attempt++) {
       try{

        window.dispatchEvent(new Event('focus'));
    await new Promise(resolve => setTimeout(resolve, 100));

        setLoading(true)
        const token = await getToken();
      console.log('Token:', token);
      
        if(initialData){
        await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`,data,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })
        }else{
        await axios.post(`/api/${params.storeId}/categories`,data,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })

        }
        router.refresh()
        router.push(`/${params.storeId}/categories`) 
        toast.success(toastMessage)
        break;

       }catch(error)
       { 
         if (attempt === 2) {
            console.log(error)
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
            await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`,{
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              })
            router.refresh()
            router.push(`/${params.storeId}/categories`)
            toast.success("Category deleted.")
            break;

        }catch(error){
            if (attempt === 2) toast.error("Make sure you remove all products using this category first.")
                console.log(error)
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
                    
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                        control={form.control}
                        name="name"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input 
                                    disabled={loading}
                                    placeholder="Category name"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>

                        )} 
                        />
                        <FormField 
                        control={form.control}
                        name="billboardId"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Billboard</FormLabel>
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
                                            placeholder="Select a billboard"
                                        />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {billboards.map((billboard) => (
                                        <SelectItem 
                                        key={billboard.id} 
                                        value={billboard.id}>
                                            {billboard.label}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                <FormMessage/>
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