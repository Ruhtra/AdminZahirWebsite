"use client";

import { FormDescription } from "@/components/ui/form";
import { useState, useTransition, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import type * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { createProfileSchema } from "../_actions/profile.schema";
import { Skeleton } from "@/components/ui/skeleton";
import type { GetAllProfilesDTO } from "@/app/api/profiles/route";
import { ImageUploadFieldWithUrl } from "./Image-upload-field-url";
import { Checkbox } from "@/components/ui/checkbox";
import { TelephoneFields } from "./TelephoneFields";
import { queryClient } from "@/lib/queryCLient";
import { UpdateProfile, CreateProfile } from "../_actions/Profiles";
import { CategoryManager } from "./categoy-management";
import { useProfileOptions } from "./ProfilesQueries";
import { TypeManager } from "./TypeManager";

export type FormValues = z.infer<typeof createProfileSchema>;

interface CreateProfileDialogProps {
  idProfile?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const estadosBrasileiros = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
];

export function CreateProfileDialog({
  idProfile,
  open,
  onOpenChange,
}: CreateProfileDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { data: userData, isPending: isLoading } = useQuery({
    queryKey: ["profile", idProfile],
    queryFn: () => fetchUser(idProfile),
    enabled: !!idProfile,
    refetchOnMount: true,
  });
  const [includeAddress, setIncludeAddress] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      name: userData?.name || "",
      resume: userData?.resume || "",
      informations: userData?.informations || "",
      telephones: userData
        ? [
            ...userData.telephones.whatsapp.map((number) => ({
              type: "whatsapp" as const,
              number,
            })),
            ...userData.telephones.telephone.map((number) => ({
              type: "phone" as const,
              number,
            })),
          ]
        : [],
      activeAddress: !!userData?.local,
      local: {
        cep: userData?.local?.cep || "",
        uf: (userData?.local?.uf as string) || "SP",
        city: userData?.local?.city || "",
        neighborhood: userData?.local?.neighborhood || "",
        street: userData?.local?.street || "",
        number: userData?.local?.number || "",
        complement: userData?.local?.complement || "",
      },
      movie: userData?.movie || "",
      activePromotion: userData?.promotion?.active ?? false,
      promotion: {
        title: userData?.promotion?.title || "",
        description: userData?.promotion?.description || "",
      },
      categories: userData?.category?.categories || [],
      type: userData?.category.type || [],
    },
  });

  console.log(form.formState.errors);

  useEffect(() => {
    if (userData) {
      form.setValue("name", userData.name);
      form.setValue("resume", userData.resume);
      form.setValue("informations", userData.informations);
      form.setValue("telephones", [
        ...userData.telephones.whatsapp.map((number) => ({
          type: "whatsapp" as const,
          number,
        })),
        ...userData.telephones.telephone.map((number) => ({
          type: "phone" as const,
          number,
        })),
      ]);

      form.setValue("activeAddress", !!userData.local);
      form.setValue("local.cep", userData.local?.cep || "");
      form.setValue("local.uf", userData.local?.uf as string);
      form.setValue("local.city", userData.local?.city || "");
      form.setValue("local.neighborhood", userData.local?.neighborhood || "");
      form.setValue("local.street", userData.local?.street || "");
      form.setValue("local.number", userData.local?.number || "");
      form.setValue("local.complement", userData.local?.complement || "");
      form.setValue("movie", userData.movie);
      form.setValue("activePromotion", userData.promotion?.active ?? false);
      form.setValue("promotion.title", userData?.promotion?.title || "");
      form.setValue(
        "promotion.description",
        userData?.promotion?.description || ""
      );
      form.setValue("categories", userData.category?.categories || []);
      form.setValue("type", userData?.category.type || []);
      setIncludeAddress(!!userData.local);
    }
  }, [userData, form]);

  const {
    categories,
    types,
    isLoading: isLoadingOptions,
    isError,
  } = useProfileOptions();

  if (isError) {
    return <div>Error loading options. Please try again later.</div>;
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        if (idProfile) {
          const data = await UpdateProfile({
            idProfile: idProfile,
            data: values,
          });

          if (data.error) toast(data.error);
          if (data.success) {
            await queryClient.refetchQueries({
              queryKey: ["profiles"],
            });
            queryClient.removeQueries({
              queryKey: ["profile", idProfile],
            });

            onOpenChange(false);
            form.reset();
            toast("Profile atualizado com sucesso");
          }
        } else {
          const data = await CreateProfile({
            data: values,
          });
          if (data.error) toast(data.error);
          if (data.success) {
            onOpenChange(false);
            form.reset();
            toast("Profile criado com sucesso");
            // setPreviewUrl(null);
            await queryClient.refetchQueries({
              queryKey: ["profiles"],
            });
          }
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {idProfile ? "Edit Profile" : "Add New Profile"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the profile information below.
          </DialogDescription>
        </DialogHeader>

        {isLoadingOptions || (idProfile && isLoading) ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="promotion">Promotion</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="image" className="space-y-4">
                  <ImageUploadFieldWithUrl
                    form={form}
                    name="profileImage"
                    initialImageUrl={userData?.picture}
                    isPending={isPending}
                  />
                </TabsContent>
                <TabsContent value="basic" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="resume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="informations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="movie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Movie URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="contact" className="space-y-4">
                  {/* Telephones */}
                  <TelephoneFields />

                  {/* Address Toggle Button */}
                  <FormField
                    control={form.control}
                    name="activeAddress"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={includeAddress}
                            onCheckedChange={(checked) => {
                              setIncludeAddress(!!checked);
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel>Include Address</FormLabel>
                      </FormItem>
                    )}
                  />

                  {/* Address Fields */}
                  {includeAddress && (
                    <>
                      <FormField
                        control={form.control}
                        name="local.cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="local.uf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UF</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full p-2 border rounded bg-background"
                              >
                                {estadosBrasileiros.map((uf) => (
                                  <option key={uf} value={uf}>
                                    {uf}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="local.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="local.neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Neighborhood</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="local.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="local.number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="local.complement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complement</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </TabsContent>
                <TabsContent value="promotion" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="activePromotion"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Promotion
                          </FormLabel>
                          <FormDescription>
                            Enable or disable the promotion for this profile.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promotion.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promotion.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="categories" className="space-y-4">
                  <CategoryManager availableCategories={categories} />
                  <TypeManager availableTypes={types} />
                </TabsContent>
              </Tabs>

              <Button
                disabled={isPending}
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending
                  ? idProfile
                    ? "Updating Profile"
                    : "Creating Profile"
                  : idProfile
                  ? "Update Profile"
                  : "Add Profile"}
              </Button>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

async function fetchUser(
  id: string | undefined
): Promise<GetAllProfilesDTO | null> {
  if (id) {
    const response = await fetch(`/api/profiles/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }
    return response.json();
  }
  return null;
}
