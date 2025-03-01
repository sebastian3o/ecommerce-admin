"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";
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
import { useOrigin } from "@/hooks/use-origin";
import ImageUpload from "@/components/ui/image-upload";
import { useAuth } from "@clerk/nextjs";

const formSchema = z.object({
    label:z.string().min(1),
    imageUrl:z.string().min(1)

})

interface BillboardFormProps{
    initialData:Billboard | null;
}



type BillboardFormValues =z.infer<typeof formSchema>

export const BillboardForm:React.FC<BillboardFormProps> = ({
    initialData
    })=>{
        const { getToken, isLoaded } = useAuth();
        const params = useParams()
        const router = useRouter()

        const[open,setOpen]=useState(false)
        const [loading, setLoading] = useState(false)

        const title=initialData? "Edit billboard":"Create billboard";
        const description=initialData? "Edit a billboard":"Create billboard";
        const toastMessage=initialData? "Billboard updated.":"Billboard created.";
        const action=initialData? "Save changes":"Create";
        

        const form =useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:initialData || {
            label:'',
            imageUrl:''
        }
    })

    const onSubmit = async (data:BillboardFormValues)=>{
        
    for (let attempt = 1; attempt <= 2; attempt++) {
       try{

        window.dispatchEvent(new Event('focus'));
    await new Promise(resolve => setTimeout(resolve, 100));

        setLoading(true)
        const token = await getToken();
      console.log('Token:', token);
      
        if(initialData){
        await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`,data,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })
        }else{
        await axios.post(`/api/${params.storeId}/billboards`,data,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })

        }
        router.refresh()
        router.push(`/${params.storeId}/billboards`) 
        toast.success(toastMessage)
        break;

       }catch(error)
       { 
         if (attempt === 2) {
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
            await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`,{
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              })
            router.refresh()
            router.push(`/${params.storeId}/billboards`)
            toast.success("Billboard deleted.")
            break;

        }catch(error){
            if (attempt === 2) toast.error("Make sure you remove all categories using this billboard first.")
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
                        name="imageUrl"
                        render={({field})=>(
                        <FormItem>
                            <FormLabel>Background image</FormLabel>
                            <FormControl>
                                <ImageUpload 
                                value={field.value ? [field.value]:[]}
                                disabled={loading}
                                onChange ={(url)=>field.onChange(url)}
                                onRemove={()=>field.onChange("")}
                                ></ImageUpload>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>

                        )}
                        />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                        control={form.control}
                        name="label"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                    <Input 
                                    disabled={loading}
                                    placeholder="Billboard label"
                                    {...field}
                                    />
                                </FormControl>
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