"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email({
    message: "Email inválido.",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
});

// Simulated login function
const login = async (
  email: string,
  password: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email.toLowerCase() == "administrador@2025.com".toLocaleLowerCase()) {
      if (password == "192837465") return { success: true };
    }
    return { error: "Credenciais inválidas" };
  } catch (error) {
    return { error: "Erro interno, contate o suporte" };
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoadingStaus, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        setMessage({
          type: "success",
          text: "Login bem-sucedido! Você será redirecionado",
        });

        setTimeout(() => {
          router.push("/admin");
        }, 200);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro desconhecido",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ocorreu um erro inesperado." });
    } finally {
      setIsLoading(false);
    }
  }

  const isLoading = isLoadingStaus || message?.type == "success";

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 rounded-2xl shadow-xl"
        style={{
          backgroundColor: "var(--color-form-background)",
          backdropFilter: "blur(10px)",
        }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-center"
          style={{ color: "var(--color-text)" }}
        >
          Login Administrativo
        </motion.h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: "var(--color-placeholder)" }}
                        />
                        <Input
                          placeholder="Email"
                          {...field}
                          disabled={isLoading}
                          className="pl-10"
                          style={{
                            backgroundColor: "var(--color-input-background)",
                            borderColor: "transparent",
                            color: "var(--color-text)",
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: "var(--color-placeholder)" }}
                        />
                        <Input
                          type="password"
                          placeholder="Senha"
                          {...field}
                          disabled={isLoading}
                          className="pl-10"
                          style={{
                            backgroundColor: "var(--color-input-background)",
                            borderColor: "transparent",
                            color: "var(--color-text)",
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full flex gap-2"
                disabled={isLoading}
                style={{
                  background: `linear-gradient(to right, var(--color-button-start), var(--color-button-end))`,
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </motion.div>
          </form>
        </Form>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 rounded-lg flex items-center"
            style={{
              backgroundColor:
                message.type === "success"
                  ? "var(--color-success)"
                  : "var(--color-error)",
              color: "white",
            }}
          >
            {message.type === "success" ? (
              <CheckCircle className="mr-2 h-5 w-5" />
            ) : (
              <AlertCircle className="mr-2 h-5 w-5" />
            )}
            {message.text}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
