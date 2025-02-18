"use client";

import { FormDescription } from "@/components/ui/form";

import { useState, useTransition, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  Form,
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
      name: "",
      resume: "",
      informations: "",
      telephones: [],
      activeAddress: false,
      local: {
        cep: "",
        uf: "SP",
        city: "",
        neighborhood: "",
        street: "",
        number: "",
        complement: "",
      },
      movie: "",
      activePromotion: false,
      promotion: {
        title: "",
        description: "",
      },
    },
  });

  useEffect(() => {
    if (userData) {
      Object.entries(userData).forEach(([key, value]) => {
        form.setValue(key as keyof FormValues, value);
      });
      setIncludeAddress(!!userData.local);
    }
  }, [userData, form]);

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const submissionValues = {
          ...values,
          local: includeAddress ? values.local : undefined,
        };
        if (idProfile) {
          // TODO: Implement update logic
          toast.success("Profile updated successfully");
        } else {
          // TODO: Implement create logic
          toast.success("Profile created successfully");
        }
        onOpenChange(false);
        form.reset();
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

        {idProfile && isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="promotion">Promotion</TabsTrigger>
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
                  {form.watch("telephones").map((_, index) => (
                    <div key={index} className="flex space-x-2">
                      <FormField
                        control={form.control}
                        name={`telephones.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full p-2 border rounded bg-background"
                              >
                                <option value="whatsapp">WhatsApp</option>
                                <option value="phone">Phone</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`telephones.${index}.number`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Number</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      form.setValue("telephones", [
                        ...form.watch("telephones"),
                        { type: "phone", number: "" },
                      ])
                    }
                    className="w-full"
                  >
                    Add Phone
                  </Button>

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
          </Form>
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
