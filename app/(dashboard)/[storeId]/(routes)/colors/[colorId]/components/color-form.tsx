"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {  Color } from "@prisma/client";
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

const formSchema = z.object({
    name:z.string().min(1),
    value:z.string().min(4).regex(/^#/,{
        message:"String must be a valid hex code"
    })

})

interface ColorFormProps{
    initialData:Color | null;
}



type ColorFormValues =z.infer<typeof formSchema>

export const ColorForm:React.FC<ColorFormProps> = ({
    initialData
    })=>{
        const { getToken } = useAuth();
        const params = useParams()
        const router = useRouter()

        const[open,setOpen]=useState(false)
        const [loading, setLoading] = useState(false)

        const title=initialData? "Edit color":"Create color";
        const description=initialData? "Edit a color":"Create color";
        const toastMessage=initialData? "Color updated.":"Color created.";
        const action=initialData? "Save changes":"Create";
        

        const form =useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:initialData || {
            name:'',
            value:''
        }
    })

    const onSubmit = async (data:ColorFormValues)=>{
        
    for (let attempt = 1; attempt <= 2; attempt++) {
       try{
           
           
           setLoading(true)
           window.dispatchEvent(new Event('focus'));
       await new Promise(resolve => setTimeout(resolve, 100));
        const token = await getToken();
      console.log('Token:', token);
      
        if(initialData){
        await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`,data,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })
        }else{
        await axios.post(`/api/${params.storeId}/colors`,data,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })

        }
        router.refresh()
        router.push(`/${params.storeId}/colors`) 
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
            await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`,{
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              })
            router.refresh()
            router.push(`/${params.storeId}/colors`)
            toast.success("Color deleted.")
            break;

        }catch(error){
            console.log(error)

            if (attempt === 2) toast.error("Make sure you remove all products using this color first.")
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
                                    placeholder="Color name"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>

                        )} 
                        />
                        <FormField 
                        control={form.control}
                        name="value"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Value</FormLabel>
                                <FormControl>
                                    <div className="flex items-cneter gap-x-4">
                                    <Input 
                                    disabled={loading}
                                    placeholder="Color value"
                                    {...field}
                                    />
                                    <div 
                                    className="border p-4 rounded-full"
                                    style={{backgroundColor:field.value}}
                                    >

                                    </div>
                                    </div>

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