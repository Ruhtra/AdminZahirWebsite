"use client";

import type React from "react";

import { useCallback, useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

interface ImageUploadFieldWithUrlProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  isPending?: boolean; 
}

export function ImageUploadFieldWithUrl({
  form,
  name,
  isPending = false,
}: ImageUploadFieldWithUrlProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  // Obter o valor atual do form
  const formValue = form.watch(name);

  // Função para adicionar parâmetro de cache busting na URL
  const getUrlWithCacheBust = useCallback((url: string | null) => {
    if (!url) return null;
    const urlWithoutParams = url.split('?')[0];
    return `${urlWithoutParams}?v=${cacheBuster}`;
  }, [cacheBuster]);

  // Atualizar preview baseado no valor do form
  useEffect(() => {
    if (formValue instanceof File) {
      // Se é um File, criar preview da URL local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(formValue);
    } else {
      // Caso contrário, limpar preview
      console.log('>>>>Limpando preview');
      setPreviewUrl(null);
    }
  }, [formValue, getUrlWithCacheBust]);

  const handleImageChange = useCallback(
    (file: File | null) => {
      if (file) {
        form.setValue(name, file);
        // O useEffect acima vai atualizar o preview automaticamente
      } else {
        form.setValue(name, null);
        setPreviewUrl(null);
      }
    },
    [form, name]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleImageChange(acceptedFiles[0]);
        setCacheBuster(Date.now());
      }
    },
    [handleImageChange]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: isPending,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file);
      setCacheBuster(Date.now());
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-gray-300 hover:border-primary"
                    } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={isPending}
                    id={`${name}-upload`}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                  <label htmlFor={`${name}-upload`} className="cursor-pointer">
                    {previewUrl ? (
                      <div className="max-w-full max-h-[300px] mx-auto relative">
                        <Image
                          width={300}
                          height={300}
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-[300px] object-contain"
                          key={previewUrl}
                          unoptimized={true}
                        />
                      </div>
                    ) : (
                      <div className="py-10">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Click to upload or drag and drop
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}